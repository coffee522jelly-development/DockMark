import React, { useEffect, useState, useMemo } from 'react';
import { Cosmograph } from '@cosmograph/react';
import * as duckdb from '@duckdb/duckdb-wasm';
import { Share2, Maximize2, ZoomIn, ZoomOut } from 'lucide-react';
import GlassCard from '../common/GlassCard';
import PageHeader from '../common/PageHeader';
import { useTranslation } from '../../contexts/LanguageContext';
import { useStorage } from '../../hooks/useStorage';

interface GraphNode extends Record<string, unknown> {
  id: string;
  name: string;
  isFolder: boolean;
  url?: string;
  color: string;
}

interface GraphLink extends Record<string, unknown> {
  source: string;
  target: string;
}

const BookmarkGraph: React.FC = () => {
  const { t } = useTranslation();
  const [theme] = useStorage('app-theme', 'light', 'localStorage');
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [links, setLinks] = useState<GraphLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [duckdbConn, setDuckdbConn] = useState<any>(null);
  const cosmographRef = React.useRef<any>(null);

  // Initialize DuckDB with local assets
  useEffect(() => {
    let isMounted = true;
    const initDuckDB = async () => {
      try {
        const getAssetUrl = (path: string) => {
          if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL) {
            return chrome.runtime.getURL(path);
          }
          return `${window.location.origin}/${path}`;
        };

        const MANUAL_BUNDLES: duckdb.DuckDBBundles = {
          mvp: {
            mainModule: getAssetUrl('lib/duckdb/duckdb-mvp.wasm'),
            mainWorker: getAssetUrl('lib/duckdb/duckdb-browser-mvp.worker.js'),
          },
          eh: {
            mainModule: getAssetUrl('lib/duckdb/duckdb-eh.wasm'),
            mainWorker: getAssetUrl('lib/duckdb/duckdb-browser-eh.worker.js'),
          },
        };

        const bundle = await duckdb.selectBundle(MANUAL_BUNDLES);
        const worker = new Worker(bundle.mainWorker!);
        const logger = new duckdb.VoidLogger();
        const db = new duckdb.AsyncDuckDB(logger, worker);
        await db.instantiate(bundle.mainModule, bundle.pthreadWorker);
        const conn = await db.connect();

        if (isMounted) {
          setDuckdbConn({ duckdb: db, connection: conn });
        }
      } catch (err) {
        console.error('Failed to initialize local DuckDB:', err);
      }
    };

    initDuckDB();
    return () => { isMounted = false; };
  }, []);

  // Helper to get resolved theme colors
  const getThemeColor = (variable: string, fallback: string) => {
    const temp = document.createElement('div');
    const classMap: Record<string, string> = {
      '--p': 'text-primary',
      '--s': 'text-secondary',
      '--bc': 'text-base-content'
    };

    if (classMap[variable]) {
      temp.className = classMap[variable];
    } else {
      temp.style.color = `var(${variable})`;
    }

    document.body.appendChild(temp);
    const style = getComputedStyle(temp);
    const color = style.color;
    document.body.removeChild(temp);

    const isBlack = color === 'rgb(0, 0, 0)' || color === '#000000';
    const isInvalid = !color || color === 'rgba(0, 0, 0, 0)' || color === 'transparent';

    if (isInvalid || (isBlack && variable !== '--bc')) {
      return fallback;
    }

    return color;
  };

  useEffect(() => {
    const loadBookmarks = async () => {
      const nodeList: GraphNode[] = [];
      const linkList: GraphLink[] = [];

      const themeColors = {
        primary: getThemeColor('--p', '#570df8'),
        secondary: getThemeColor('--s', '#f000b8'),
      };

      const processNode = async (node: chrome.bookmarks.BookmarkTreeNode, parentId?: string) => {
        const isFolder = !node.url;
        const nodeId = node.id;

        nodeList.push({
          id: nodeId,
          name: node.title || (isFolder ? 'Folder' : 'Bookmark'),
          isFolder,
          url: node.url,
          color: isFolder ? themeColors.primary : themeColors.secondary,
        });

        if (parentId) {
          linkList.push({ source: parentId, target: nodeId });
        }

        if (node.children) {
          for (const child of node.children) {
            await processNode(child, nodeId);
          }
        }
      };

      if (typeof chrome !== 'undefined' && chrome.bookmarks) {
        const tree = await chrome.bookmarks.getTree();
        await processNode(tree[0]);
      } else {
        // Mock data
        const mockData = {
          id: '0',
          title: 'Root',
          children: [
            {
              id: '1',
              title: 'Bookmarks Bar',
              children: [
                { id: '2', title: 'Google', url: 'https://google.com' },
                { id: '3', title: 'GitHub', url: 'https://github.com' },
                {
                  id: '4',
                  title: 'Development',
                  children: [
                    { id: '5', title: 'React', url: 'https://reactjs.org' },
                    { id: '6', title: 'Tailwind', url: 'https://tailwindcss.com' },
                  ]
                }
              ]
            }
          ]
        };
        await processNode(mockData as any);
      }

      setNodes(nodeList);
      setLinks(linkList);
      setLoading(false);
    };

    loadBookmarks();
  }, [theme]);

  const cosmographConfig = useMemo(() => ({
    points: nodes,
    links: links,
    pointIdBy: 'id',
    linkSourceBy: 'source',
    linkTargetBy: 'target',
    pointColorByFn: (n: GraphNode) => n.color,
    pointSizeByFn: (n: GraphNode) => n.isFolder ? 2 : 1,
    pointLabelBy: 'name',
    linkWidth: 0.5,
    linkColor: '#94a3b833',
    focusedPointColor: '#ffffff',
    simulationFriction: 0.5,
    simulationRepulsion: 0.3,
    simulationLinkSpring: 0.1,
    simulationLinkDistance: 10,
    backgroundColor: 'transparent',
  }), [nodes, links]);

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)]">
      <PageHeader
        title={t.sidebar.graph}
        description="High-performance graph visualization powered by Cosmograph."
        icon={Share2}
      />

      <GlassCard className="flex-1 relative overflow-hidden p-0">
        {!loading && nodes.length > 0 && duckdbConn && (
          <Cosmograph
            ref={cosmographRef}
            {...(cosmographConfig as any)}
            duckDBConnection={duckdbConn}
            onClick={(node: any) => {
              if (node?.url) window.open(node.url, '_blank');
            }}
          />
        )}

        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-base-100/20 backdrop-blur-sm">
            <span className="loading loading-spinner loading-lg text-primary"></span>
          </div>
        )}

        <div className="absolute bottom-4 right-4 flex flex-col gap-2">
          <button onClick={() => cosmographRef.current?.zoomIn()} className="btn btn-circle btn-sm bg-base-100/50 backdrop-blur-md border-white/10">
            <ZoomIn size={16} />
          </button>
          <button onClick={() => cosmographRef.current?.zoomOut()} className="btn btn-circle btn-sm bg-base-100/50 backdrop-blur-md border-white/10">
            <ZoomOut size={16} />
          </button>
          <button onClick={() => cosmographRef.current?.fitView()} className="btn btn-circle btn-sm bg-base-100/50 backdrop-blur-md border-white/10">
            <Maximize2 size={16} />
          </button>
        </div>

        <div className="absolute top-4 left-4 p-3 bg-base-100/50 backdrop-blur-md rounded-xl border border-white/10 text-xs flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary shadow-[0_0_8px_oklch(var(--p)/0.5)]" />
            <span>Folder</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-secondary shadow-[0_0_8px_oklch(var(--s)/0.5)]" />
            <span>Bookmark (Click to open)</span>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};

export default BookmarkGraph;

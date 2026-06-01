import React, { useEffect, useRef, useState } from 'react';
import ForceGraph2D from 'force-graph';
import { Share2, Maximize2, ZoomIn, ZoomOut } from 'lucide-react';
import GlassCard from '../common/GlassCard';
import PageHeader from '../common/PageHeader';
import { useTranslation } from '../../contexts/LanguageContext';

interface CosmoNode {
  id: string;
  name: string;
  isFolder: boolean;
  url?: string;
  color: string;
  val: number;
}

interface CosmoLink {
  source: string;
  target: string;
}

const BookmarkGraph: React.FC = () => {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const fgRef = useRef<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!containerRef.current) return;

    const loadBookmarks = async () => {
      const nodes: CosmoNode[] = [];
      const links: CosmoLink[] = [];

      const processNode = (node: chrome.bookmarks.BookmarkTreeNode, parentId?: string) => {
        const isFolder = !node.url;
        const nodeId = node.id;

        nodes.push({
          id: nodeId,
          name: node.title || (isFolder ? 'Folder' : 'Bookmark'),
          isFolder,
          url: node.url,
          color: isFolder ? '#3b82f6' : '#10b981',
          val: isFolder ? 4 : 2,
        });

        if (parentId) {
          links.push({ source: parentId, target: nodeId });
        }

        if (node.children) {
          node.children.forEach(child => processNode(child, nodeId));
        }
      };

      if (typeof chrome !== 'undefined' && chrome.bookmarks) {
        const tree = await chrome.bookmarks.getTree();
        processNode(tree[0]);
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
        processNode(mockData as any);
      }

      if (containerRef.current) {
        const ForceGraph = (ForceGraph2D as any)();
        const instance = ForceGraph(containerRef.current)
          .graphData({ nodes, links })
          .nodeLabel('name')
          .nodeColor((node: any) => node.color)
          .nodeRelSize(4)
          .linkWidth(1)
          .linkColor(() => '#94a3b833')
          .onNodeClick((node: any) => {
            if (node.url) window.open(node.url, '_blank');
          })
          .cooldownTicks(100)
          .onEngineStop(() => {
            setLoading(false);
          });

        fgRef.current = instance;
      }
    };

    loadBookmarks();

    return () => {
      if (fgRef.current) {
        fgRef.current._destructor?.();
        if (containerRef.current) containerRef.current.innerHTML = '';
      }
    };
  }, []);

  const zoomIn = () => {
    const current = fgRef.current.zoom();
    fgRef.current.zoom(current * 1.5, 400);
  };

  const zoomOut = () => {
    const current = fgRef.current.zoom();
    fgRef.current.zoom(current * 0.7, 400);
  };

  const resetCamera = () => {
    fgRef.current.zoomToFit(400);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)]">
      <PageHeader
        title={t.sidebar.graph}
        description="Visualize your bookmarks as an interactive 2D network."
        icon={Share2}
      />

      <GlassCard className="flex-1 relative overflow-hidden p-0">
        <div ref={containerRef} className="w-full h-full" />

        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-base-100/20 backdrop-blur-sm">
            <span className="loading loading-spinner loading-lg text-primary"></span>
          </div>
        )}

        <div className="absolute bottom-4 right-4 flex flex-col gap-2">
          <button onClick={zoomIn} className="btn btn-circle btn-sm bg-base-100/50 backdrop-blur-md border-white/10">
            <ZoomIn size={16} />
          </button>
          <button onClick={zoomOut} className="btn btn-circle btn-sm bg-base-100/50 backdrop-blur-md border-white/10">
            <ZoomOut size={16} />
          </button>
          <button onClick={resetCamera} className="btn btn-circle btn-sm bg-base-100/50 backdrop-blur-md border-white/10">
            <Maximize2 size={16} />
          </button>
        </div>

        <div className="absolute top-4 left-4 p-3 bg-base-100/50 backdrop-blur-md rounded-xl border border-white/10 text-xs flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
            <span>Folder</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            <span>Bookmark (Click to open)</span>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};

export default BookmarkGraph;

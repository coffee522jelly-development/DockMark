import React, { useEffect, useRef, useState } from 'react';
import Graph from 'graphology';
import Sigma from 'sigma';
import forceAtlas2 from 'graphology-layout-forceatlas2';
import { Share2, Maximize2, ZoomIn, ZoomOut } from 'lucide-react';
import GlassCard from '../common/GlassCard';
import PageHeader from '../common/PageHeader';
import { useTranslation } from '../../contexts/LanguageContext';
import { useStorage } from '../../hooks/useStorage';

const BookmarkGraph: React.FC = () => {
  const { t } = useTranslation();
  const [theme] = useStorage('app-theme', 'light', 'localStorage');
  const containerRef = useRef<HTMLDivElement>(null);
  const sigmaRef = useRef<Sigma | null>(null);
  const [loading, setLoading] = useState(true);

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
    if (!containerRef.current) return;

    const graph = new Graph();
    const primaryColor = getThemeColor('--p', '#570df8');
    const secondaryColor = getThemeColor('--s', '#f000b8');
    const textColor = getThemeColor('--bc', '#ffffff');

    const processNode = (node: chrome.bookmarks.BookmarkTreeNode, parentId?: string) => {
      const isFolder = !node.url;
      const nodeId = node.id;

      if (!graph.hasNode(nodeId)) {
        graph.addNode(nodeId, {
          label: node.title || (isFolder ? 'Folder' : 'Bookmark'),
          size: isFolder ? 10 : 5,
          color: isFolder ? primaryColor : secondaryColor,
          x: Math.random(),
          y: Math.random(),
          url: node.url,
          isFolder
        });
      }

      if (parentId && graph.hasNode(parentId) && graph.hasNode(nodeId)) {
        graph.addEdge(parentId, nodeId, { size: 1, color: '#94a3b833' });
      }

      if (node.children) {
        for (const child of node.children) {
          processNode(child, nodeId);
        }
      }
    };

    const initGraph = async () => {
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

      // Run ForceAtlas2 layout
      forceAtlas2.assign(graph, { iterations: 50, settings: { gravity: 1 } });

      const sigma = new Sigma(graph, containerRef.current!, {
        labelColor: { color: textColor },
        labelSize: 12,
        labelWeight: 'bold',
        renderEdgeLabels: false,
        enableEdgeEvents: false,
      });

      sigmaRef.current = sigma;

      sigma.on('clickNode', ({ node }) => {
        const url = graph.getNodeAttribute(node, 'url');
        if (url) window.open(url, '_blank');
      });

      setLoading(false);
    };

    initGraph();

    return () => {
      if (sigmaRef.current) {
        sigmaRef.current.kill();
        sigmaRef.current = null;
      }
    };
  }, [theme]);

  const handleZoomIn = () => {
    if (sigmaRef.current) {
      const camera = sigmaRef.current.getCamera();
      camera.animatedZoom({ duration: 300 });
    }
  };

  const handleZoomOut = () => {
    if (sigmaRef.current) {
      const camera = sigmaRef.current.getCamera();
      camera.animatedUnzoom({ duration: 300 });
    }
  };

  const handleResetView = () => {
    if (sigmaRef.current) {
      const camera = sigmaRef.current.getCamera();
      camera.animatedReset({ duration: 300 });
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)]">
      <PageHeader
        title={t.sidebar.graph}
        description="Interactive bookmark visualization powered by Sigma.js."
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
          <button onClick={handleZoomIn} className="btn btn-circle btn-sm bg-base-100/50 backdrop-blur-md border-white/10">
            <ZoomIn size={16} />
          </button>
          <button onClick={handleZoomOut} className="btn btn-circle btn-sm bg-base-100/50 backdrop-blur-md border-white/10">
            <ZoomOut size={16} />
          </button>
          <button onClick={handleResetView} className="btn btn-circle btn-sm bg-base-100/50 backdrop-blur-md border-white/10">
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

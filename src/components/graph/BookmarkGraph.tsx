import React, { useEffect, useRef } from 'react';
import Graph from 'graphology';
import Sigma from 'sigma';
import forceAtlas2 from 'graphology-layout-forceatlas2';
import { Share2, Maximize2, ZoomIn, ZoomOut } from 'lucide-react';
import GlassCard from '../common/GlassCard';
import PageHeader from '../common/PageHeader';
import { useTranslation } from '../../contexts/LanguageContext';

const BookmarkGraph: React.FC = () => {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const sigmaRef = useRef<Sigma | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const graph = new Graph();

    const loadBookmarks = async () => {
      if (typeof chrome !== 'undefined' && chrome.bookmarks) {
        const tree = await chrome.bookmarks.getTree();
        processNode(tree[0], graph);
      } else {
        // Mock data for development
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
        processNode(mockData as any, graph);
      }

      // Layout
      forceAtlas2.assign(graph, { iterations: 100, settings: { gravity: 1 } });

      // Create Sigma instance
      if (containerRef.current) {
        sigmaRef.current = new Sigma(graph, containerRef.current, {
          renderEdgeLabels: true,
          labelFont: 'inherit',
          defaultNodeType: 'circle',
        });

        // Click events
        sigmaRef.current.on('clickNode', ({ node }) => {
          const url = graph.getNodeAttribute(node, 'url');
          if (url) {
            window.open(url, '_blank');
          }
        });
      }
    };

    const processNode = (node: chrome.bookmarks.BookmarkTreeNode, g: Graph, parentId?: string) => {
      const isFolder = !node.url;
      const nodeId = node.id;

      if (!g.hasNode(nodeId)) {
        g.addNode(nodeId, {
          label: node.title || (isFolder ? 'Folder' : 'Bookmark'),
          size: isFolder ? 15 : 8,
          color: isFolder ? '#3b82f6' : '#10b981',
          x: Math.random(),
          y: Math.random(),
          url: node.url,
        });
      }

      if (parentId) {
        g.addEdge(parentId, nodeId, { size: 1, color: '#94a3b8' });
      }

      if (node.children) {
        node.children.forEach(child => processNode(child, g, nodeId));
      }
    };

    loadBookmarks();

    return () => {
      if (sigmaRef.current) {
        sigmaRef.current.kill();
        sigmaRef.current = null;
      }
    };
  }, []);

  const zoomIn = () => sigmaRef.current?.getCamera().animatedZoom({ duration: 300 });
  const zoomOut = () => sigmaRef.current?.getCamera().animatedUnzoom({ duration: 300 });
  const resetCamera = () => sigmaRef.current?.getCamera().animatedReset({ duration: 300 });

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)]">
      <PageHeader
        title={t.sidebar.graph}
        description="Visualize your bookmarks as a network of folders and pages."
        icon={Share2}
      />

      <GlassCard className="flex-1 relative overflow-hidden p-0">
        <div ref={containerRef} className="w-full h-full bg-base-100/10" />

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
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span>Folder</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <span>Bookmark (Click to open)</span>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};

export default BookmarkGraph;

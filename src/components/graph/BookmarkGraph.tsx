import React, { useEffect, useRef, useState } from 'react';
import { Cosmograph } from '@cosmograph/cosmograph';
import { Share2, Maximize2, ZoomIn, ZoomOut } from 'lucide-react';
import GlassCard from '../common/GlassCard';
import PageHeader from '../common/PageHeader';
import { useTranslation } from '../../contexts/LanguageContext';

const BookmarkGraph: React.FC = () => {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const cosmoRef = useRef<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!containerRef.current) return;

    const loadBookmarks = async () => {
      const points: any[] = [];
      const links: any[] = [];

      const processNode = (node: chrome.bookmarks.BookmarkTreeNode, parentId?: string) => {
        const isFolder = !node.url;
        const nodeId = node.id;

        points.push({
          id: nodeId,
          label: node.title || (isFolder ? 'Folder' : 'Bookmark'),
          isFolder,
          url: node.url,
          color: isFolder ? '#3b82f6' : '#10b981',
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
        cosmoRef.current = new Cosmograph(containerRef.current, {
          points,
          pointIdBy: 'id',
          links,
          linkSourceBy: 'source',
          linkTargetBy: 'target',
          pointColorByFn: (n: any) => n.color,
          pointLabelBy: 'label',
          pointSizeByFn: (n: any) => (n.isFolder ? 4 : 2),
          linkWidth: 1,
          linkColor: '#94a3b833',
          backgroundColor: 'transparent',
          simulationGravity: 0.1,
          simulationRepulsion: 1,
          simulationLinkDistance: 10,
          onClick: (n: any) => {
            if (n?.url) window.open(n.url, '_blank');
          },
        } as any);
      }
      setLoading(false);
    };

    loadBookmarks();

    return () => {
      if (cosmoRef.current) {
        cosmoRef.current.destroy();
        cosmoRef.current = null;
      }
    };
  }, []);

  const zoomIn = () => cosmoRef.current?.zoomIn();
  const zoomOut = () => cosmoRef.current?.zoomOut();
  const resetCamera = () => cosmoRef.current?.fitView();

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)]">
      <PageHeader
        title={t.sidebar.graph}
        description="Visualize your bookmarks with a high-performance interactive graph."
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

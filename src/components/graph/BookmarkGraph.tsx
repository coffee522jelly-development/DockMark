import React, { useEffect, useRef, useState } from 'react';
import ForceGraph2D from 'force-graph';
import { Share2, Maximize2, ZoomIn, ZoomOut } from 'lucide-react';
import GlassCard from '../common/GlassCard';
import PageHeader from '../common/PageHeader';
import { useTranslation } from '../../contexts/LanguageContext';
import { useStorage } from '../../hooks/useStorage';

interface CosmoNode {
  id: string;
  name: string;
  isFolder: boolean;
  url?: string;
  color: string;
  val: number;
  icon?: HTMLImageElement;
}

interface CosmoLink {
  source: string;
  target: string;
}

const BookmarkGraph: React.FC = () => {
  const { t } = useTranslation();
  const [theme] = useStorage('app-theme', 'light', 'localStorage');
  const containerRef = useRef<HTMLDivElement>(null);
  const fgRef = useRef<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!containerRef.current) return;

    const loadBookmarks = async () => {
      const nodes: CosmoNode[] = [];
      const links: CosmoLink[] = [];

      // Helper to get resolved theme colors (works with oklch, hsl, etc.)
      const getThemeColor = (variable: string) => {
        const temp = document.createElement('div');
        temp.style.color = `var(${variable})`;
        document.body.appendChild(temp);
        const resolvedColor = getComputedStyle(temp).color;
        document.body.removeChild(temp);
        return resolvedColor;
      };

      const themeColors = {
        primary: getThemeColor('--p'),
        secondary: getThemeColor('--s'),
        text: getThemeColor('--bc'),
      };

      const getFavicon = (url: string): Promise<HTMLImageElement | undefined> => {
        return new Promise((resolve) => {
          try {
            const domain = new URL(url).hostname;
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.src = `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
            const timeout = setTimeout(() => resolve(undefined), 2000);
            img.onload = () => {
              clearTimeout(timeout);
              resolve(img);
            };
            img.onerror = () => {
              clearTimeout(timeout);
              resolve(undefined);
            };
          } catch {
            resolve(undefined);
          }
        });
      };

      const processNode = async (node: chrome.bookmarks.BookmarkTreeNode, parentId?: string) => {
        const isFolder = !node.url;
        const nodeId = node.id;

        let icon: HTMLImageElement | undefined;
        if (!isFolder && node.url) {
          icon = await getFavicon(node.url);
        }

        nodes.push({
          id: nodeId,
          name: node.title || (isFolder ? 'Folder' : 'Bookmark'),
          isFolder,
          url: node.url,
          color: isFolder ? themeColors.primary : themeColors.secondary,
          val: isFolder ? 6 : 4,
          icon
        });

        if (parentId) {
          links.push({ source: parentId, target: nodeId });
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

      if (containerRef.current) {
        const ForceGraph = (ForceGraph2D as any)();
        const instance = ForceGraph(containerRef.current)
          .graphData({ nodes, links })
          .nodeLabel('name')
          .nodeColor((node: any) => node.color)
          .nodeRelSize(4)
          .linkWidth(1)
          .linkColor(() => '#94a3b833')
          .nodeCanvasObject((node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
            const label = node.name;
            const fontSize = 12 / globalScale;
            ctx.font = `${fontSize}px Inter, system-ui, Sans-Serif`;

            // Draw Node Circle with shadow
            ctx.save();
            ctx.shadowColor = 'rgba(0,0,0,0.3)';
            ctx.shadowBlur = 4 / globalScale;
            ctx.beginPath();
            ctx.arc(node.x, node.y, node.val, 0, 2 * Math.PI, false);
            ctx.fillStyle = node.color;
            ctx.fill();
            ctx.restore();

            // Draw Icon if available (clipped to circle)
            if (node.icon) {
              const size = node.val * 1.4;
              ctx.save();
              ctx.beginPath();
              ctx.arc(node.x, node.y, size / 2, 0, Math.PI * 2, true);
              ctx.clip();
              ctx.drawImage(node.icon, node.x - size / 2, node.y - size / 2, size, size);
              ctx.restore();
            }

            // Draw Label
            const textWidth = ctx.measureText(label).width;
            const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.2);

            // Background for label readability
            ctx.fillStyle = 'rgba(0,0,0,0.4)';
            ctx.fillRect(node.x - textWidth / 2 - 2 / globalScale, node.y + node.val + 2 / globalScale, textWidth + 4 / globalScale, fontSize + 2 / globalScale);

            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';
            ctx.fillStyle = '#ffffff'; // White text for better contrast on dark bg
            ctx.fillText(label, node.x, node.y + node.val + 3 / globalScale);

            node.__bckgDimensions = bckgDimensions;
          })
          .nodePointerAreaPaint((node: any, color: string, ctx: CanvasRenderingContext2D) => {
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(node.x, node.y, node.val + 2, 0, 2 * Math.PI, false);
            ctx.fill();
          })
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
  }, [theme]);

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

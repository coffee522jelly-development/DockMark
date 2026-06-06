import React, { useEffect, useRef, useState } from 'react';
import Graph from 'graphology';
import Sigma from 'sigma';
import { NodeImageProgram } from '@sigma/node-image';
import forceAtlas2 from 'graphology-layout-forceatlas2';
import { Share2, Maximize2, ZoomIn, ZoomOut, MousePointer2, Move } from 'lucide-react';
import GlassCard from '../common/GlassCard';
import PageHeader from '../common/PageHeader';
import { useTranslation } from '../../contexts/LanguageContext';
import { useStorage } from '../../hooks/useStorage';

const BookmarkGraph: React.FC = () => {
  const { t } = useTranslation();
  const [theme] = useStorage('app-theme', 'light', 'localStorage');
  const containerRef = useRef<HTMLDivElement>(null);
  const sigmaRef = useRef<Sigma | null>(null);
  const graphRef = useRef<Graph>(new Graph());
  const [loading, setLoading] = useState(true);
  const [isDragMode, setIsDragMode] = useState(false);
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const [resolvedColors, setResolvedColors] = useState({
    primary: '#8b5cf6',
    secondary: '#ec4899',
    text: '#ffffff'
  });

  // Helper to get resolved theme colors and convert to RGB
  const getThemeColor = (className: string, fallback: string) => {
    const temp = document.createElement('div');
    temp.className = className;
    temp.style.position = 'absolute';
    temp.style.visibility = 'hidden';
    document.body.appendChild(temp);
    const style = getComputedStyle(temp);
    const color = style.color;
    document.body.removeChild(temp);

    // Convert oklch or any other format to RGB using canvas
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, 1, 1);
      const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
      return `rgb(${r}, ${g}, ${b})`;
    }
    return fallback;
  };

  useEffect(() => {
    // Resolve colors whenever theme changes
    const p = getThemeColor('text-primary', '#8b5cf6');
    const s = getThemeColor('text-secondary', '#ec4899');
    const tColor = getThemeColor('text-base-content', '#ffffff');
    setResolvedColors({ primary: p, secondary: s, text: tColor });
  }, [theme]);

  // Update node colors and label colors when theme/colors change
  useEffect(() => {
    if (!sigmaRef.current) return;

    const graph = graphRef.current;
    graph.forEachNode((node, attr) => {
      graph.setNodeAttribute(node, 'color', attr.isFolder ? resolvedColors.primary : resolvedColors.secondary);
    });

    sigmaRef.current.setSetting('labelColor', { color: resolvedColors.text });
    sigmaRef.current.refresh();
  }, [resolvedColors]);

  // Handle Drag Mode interactions
  useEffect(() => {
    if (!sigmaRef.current) return;
    const sigma = sigmaRef.current;
    const graph = graphRef.current;

    const onDownNode = (e: any) => {
      if (!isDragMode) return;
      setDraggedNode(e.node);
      graph.setNodeAttribute(e.node, 'highlighted', true);
      // Disable camera panning while dragging
      sigma.getMouseCaptor().enabled = false;
    };

    const onClickNode = ({ node }: { node: string }) => {
      if (isDragMode) return;
      const url = graph.getNodeAttribute(node, 'url');
      if (url) window.open(url, '_blank');
    };

    sigma.on('downNode', onDownNode);
    sigma.on('clickNode', onClickNode);

    return () => {
      sigma.off('downNode', onDownNode);
      sigma.off('clickNode', onClickNode);
    };
  }, [isDragMode]);

  // Handle dragging movement
  useEffect(() => {
    if (!draggedNode || !sigmaRef.current || !containerRef.current) return;

    const sigma = sigmaRef.current;
    const graph = graphRef.current;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = containerRef.current!.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Convert pixel coordinates to graph coordinates
      const pos = sigma.viewportToGraph({ x, y });

      graph.setNodeAttribute(draggedNode, 'x', pos.x);
      graph.setNodeAttribute(draggedNode, 'y', pos.y);

      e.preventDefault();
    };

    const handleMouseUp = () => {
      graph.setNodeAttribute(draggedNode, 'highlighted', false);
      setDraggedNode(null);
      // Re-enable camera panning
      sigma.getMouseCaptor().enabled = true;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggedNode]);

  // Initialize Graph and Sigma
  useEffect(() => {
    if (!containerRef.current) return;

    let isCancelled = false;
    const graph = graphRef.current;
    graph.clear();

    const getFaviconUrl = (url: string) => {
      try {
        if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL) {
          const urlObj = new URL(chrome.runtime.getURL('/_favicon/'));
          urlObj.searchParams.set('pageUrl', url);
          urlObj.searchParams.set('size', '64');
          return urlObj.toString();
        }
        throw new Error('Not in extension');
      } catch (e) {
        // Use a data URL SVG to avoid network/CORS issues in tests and dev
        const domain = new URL(url).hostname;
        const char = domain.charAt(0).toUpperCase();
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
          <rect width="64" height="64" fill="#ec4899" rx="32"/>
          <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="32" fill="white">${char}</text>
        </svg>`;
        return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
      }
    };

    const processNode = (node: chrome.bookmarks.BookmarkTreeNode, parentId?: string) => {
      const isFolder = !node.url;
      const nodeId = node.id;

      if (!graph.hasNode(nodeId)) {
        const nodeData: any = {
          label: node.title || (isFolder ? 'Folder' : 'Bookmark'),
          size: isFolder ? 15 : 25,
          color: isFolder ? resolvedColors.primary : resolvedColors.secondary,
          x: Math.random(),
          y: Math.random(),
          url: node.url,
          isFolder,
        };

        if (!isFolder && node.url) {
          nodeData.type = 'image';
          nodeData.image = getFaviconUrl(node.url);
        } else {
          nodeData.type = 'circle';
        }

        graph.addNode(nodeId, nodeData);
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
        if (isCancelled) return;
        processNode(tree[0]);
      } else {
        if (isCancelled) return;
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
      forceAtlas2.assign(graph, { iterations: 100, settings: { gravity: 1 } });

      if (isCancelled) return;

      const sigma = new Sigma(graph, containerRef.current!, {
        nodeProgramClasses: {
          image: NodeImageProgram,
        },
        labelColor: { color: resolvedColors.text },
        labelSize: 14,
        labelWeight: 'bold',
        renderEdgeLabels: false,
        enableEdgeEvents: false,
      });

      sigmaRef.current = sigma;
      setLoading(false);
    };

    initGraph();

    return () => {
      isCancelled = true;
      if (sigmaRef.current) {
        sigmaRef.current.kill();
        sigmaRef.current = null;
      }
    };
  }, []);

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
        <div ref={containerRef} className="w-full h-full sigma-container" />

        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-base-100/20 backdrop-blur-sm">
            <span className="loading loading-spinner loading-lg text-primary"></span>
          </div>
        )}

        <div className="absolute bottom-4 right-4 flex flex-col gap-2">
          <button
            onClick={() => setIsDragMode(!isDragMode)}
            className={`btn btn-circle btn-sm backdrop-blur-md border-white/10 ${isDragMode ? 'btn-primary' : 'bg-base-100/50'}`}
            title={isDragMode ? "Switch to Navigation Mode" : "Switch to Drag Mode"}
          >
            {isDragMode ? <Move size={16} /> : <MousePointer2 size={16} />}
          </button>
          <div className="w-full h-px bg-white/10 my-1" />
          <button onClick={handleZoomIn} className="btn btn-circle btn-sm bg-base-100/50 backdrop-blur-md border-white/10" title="Zoom In">
            <ZoomIn size={16} />
          </button>
          <button onClick={handleZoomOut} className="btn btn-circle btn-sm bg-base-100/50 backdrop-blur-md border-white/10" title="Zoom Out">
            <ZoomOut size={16} />
          </button>
          <button onClick={handleResetView} className="btn btn-circle btn-sm bg-base-100/50 backdrop-blur-md border-white/10" title="Reset View">
            <Maximize2 size={16} />
          </button>
        </div>

        <div className="absolute top-4 left-4 p-3 bg-base-100/50 backdrop-blur-md rounded-xl border border-white/10 text-xs flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full shadow-lg"
              style={{ backgroundColor: resolvedColors.primary }}
            />
            <span>Folder</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full shadow-lg"
              style={{ backgroundColor: resolvedColors.secondary }}
            />
            <span>Bookmark (Click to open)</span>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};

export default BookmarkGraph;

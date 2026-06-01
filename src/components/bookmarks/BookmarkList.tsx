import React, { useEffect, useState } from 'react';
import { Folder, Globe, ChevronRight, ChevronDown, Edit2, Trash2, ExternalLink } from 'lucide-react';

interface BookmarkNode {
  id: string;
  title: string;
  url?: string;
  children?: BookmarkNode[];
}

const BookmarkItem: React.FC<{
  node: BookmarkNode,
  depth: number,
  onDelete: (id: string) => void,
  onEdit: (node: BookmarkNode) => void,
  onMove: (id: string, parentId: string) => void
}> = ({ node, depth, onDelete, onEdit, onMove }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const isFolder = !!node.children;

  const handleClick = () => {
    if (isFolder) {
      setIsOpen(!isOpen);
    } else if (node.url) {
      window.open(node.url, '_blank');
    }
  };

  const handleDragStart = (e: React.DragEvent) => {
    if (isFolder) return; // Only allow dragging bookmark items as requested
    e.dataTransfer.setData('bookmarkId', node.id);
    e.dataTransfer.effectAllowed = 'move';

    // Add a ghost image or just styling
    const target = e.currentTarget as HTMLElement;
    target.style.opacity = '0.5';
  };

  const handleDragEnd = (e: React.DragEvent) => {
    const target = e.currentTarget as HTMLElement;
    target.style.opacity = '1';
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (isFolder) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      setIsDragOver(true);
    }
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    if (isFolder) {
      e.preventDefault();
      setIsDragOver(false);
      const draggedId = e.dataTransfer.getData('bookmarkId');
      if (draggedId && draggedId !== node.id) {
        onMove(draggedId, node.id);
      }
    }
  };

  return (
    <div className="select-none">
      <div
        draggable={!isFolder}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`flex items-center gap-2 p-2 hover:bg-base-200 rounded-lg cursor-pointer group transition-all ${
          isDragOver ? 'bg-primary/20 ring-2 ring-primary ring-inset' : ''
        }`}
        style={{ paddingLeft: `${depth * 1.5 + 0.5}rem` }}
        onClick={handleClick}
      >
        {isFolder ? (
          <>
            {isOpen ? <ChevronDown size={16} className="text-base-content/40" /> : <ChevronRight size={16} className="text-base-content/40" />}
            <Folder size={18} className={`text-primary ${isDragOver ? 'fill-primary/40 scale-110' : 'fill-primary/20'} transition-transform`} />
          </>
        ) : (
          <>
            <div className="w-4" /> {/* Spacer for alignment with folder chevron */}
            <Globe size={18} className="text-info" />
          </>
        )}

        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-base-content truncate">{node.title || (node.url ? node.url : 'Untitled')}</div>
          {!isFolder && node.url && <div className="text-[10px] text-base-content/40 truncate">{node.url}</div>}
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {!isFolder && node.url && (
             <a
              href={node.url}
              target="_blank"
              rel="noreferrer"
              className="btn btn-ghost btn-xs btn-square"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink size={14} />
            </a>
          )}
          <button
            className="btn btn-ghost btn-xs btn-square"
            onClick={(e) => { e.stopPropagation(); onEdit(node); }}
          >
            <Edit2 size={14} />
          </button>
          <button
            className="btn btn-ghost btn-xs btn-square text-error"
            onClick={(e) => { e.stopPropagation(); onDelete(node.id); }}
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {isFolder && isOpen && node.children && (
        <div className="mt-1">
          {node.children.map(child => (
            <BookmarkItem key={child.id} node={child} depth={depth + 1} onDelete={onDelete} onEdit={onEdit} onMove={onMove} />
          ))}
        </div>
      )}
    </div>
  );
};

const BookmarkList: React.FC = () => {
  const [bookmarks, setBookmarks] = useState<BookmarkNode[]>([]);
  const [allFolders, setAllFolders] = useState<{id: string, title: string}[]>([]);
  const [editingNode, setEditingNode] = useState<BookmarkNode | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editUrl, setEditUrl] = useState('');
  const [editParentId, setEditParentId] = useState('');
  const [originalParentId, setOriginalParentId] = useState('');

  const fetchBookmarks = () => {
    if (typeof chrome !== 'undefined' && chrome.bookmarks) {
      chrome.bookmarks.getTree((tree) => {
        // tree[0] is usually the root node (id: "0")
        // tree[0].children contains "Bookmark Bar", "Other Bookmarks", etc.
        setBookmarks(tree[0].children || []);
      });
    } else {
      // Fallback/Mock data for development
      setBookmarks([
        {
          id: '1',
          title: 'Favorites',
          children: [
            { id: '2', title: 'Google', url: 'https://google.com' },
            { id: '3', title: 'GitHub', url: 'https://github.com' },
          ]
        },
        { id: '4', title: 'Docs', url: 'https://react.dev' }
      ]);
    }
  };

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this bookmark?')) {
      if (typeof chrome !== 'undefined' && chrome.bookmarks) {
        chrome.bookmarks.removeTree(id, () => {
          fetchBookmarks();
        });
      } else {
        setBookmarks(prev => {
          const removeNode = (nodes: BookmarkNode[]): BookmarkNode[] => {
            return nodes.filter(node => {
              if (node.id === id) return false;
              if (node.children) node.children = removeNode(node.children);
              return true;
            });
          };
          return removeNode([...prev]);
        });
      }
    }
  };

  const handleEdit = (node: BookmarkNode) => {
    setEditingNode(node);
    setEditTitle(node.title);
    setEditUrl(node.url || '');

    // Find current parent ID
    if (typeof chrome !== 'undefined' && chrome.bookmarks) {
      chrome.bookmarks.get(node.id, (results) => {
        if (results && results[0] && results[0].parentId) {
          setEditParentId(results[0].parentId);
          setOriginalParentId(results[0].parentId);
        }
      });

      // Get all folders for selection
      chrome.bookmarks.getTree((tree) => {
        const folders: {id: string, title: string}[] = [];
        const findFolders = (nodes: BookmarkNode[]) => {
          nodes.forEach(n => {
            if (n.children) {
              folders.push({ id: n.id, title: n.title || (n.id === '0' ? 'Root' : 'Untitled') });
              findFolders(n.children);
            }
          });
        };
        findFolders(tree);
        setAllFolders(folders);
      });
    }

    (document.getElementById('edit_modal') as HTMLDialogElement).showModal();
  };

  const handleMove = (id: string, parentId: string) => {
    if (typeof chrome !== 'undefined' && chrome.bookmarks) {
      chrome.bookmarks.move(id, { parentId }, () => {
        fetchBookmarks();
      });
    } else {
      // Mock move for dev
      console.log(`Moving ${id} to ${parentId}`);
      setBookmarks(prev => {
        let movedNode: BookmarkNode | null = null;

        const findAndRemove = (nodes: BookmarkNode[]): BookmarkNode[] => {
          return nodes.filter(n => {
            if (n.id === id) {
              movedNode = n;
              return false;
            }
            if (n.children) n.children = findAndRemove(n.children);
            return true;
          });
        };

        const addNode = (nodes: BookmarkNode[]): BookmarkNode[] => {
          return nodes.map(n => {
            if (n.id === parentId && n.children) {
              return { ...n, children: [...n.children, movedNode!] };
            }
            if (n.children) return { ...n, children: addNode(n.children) };
            return n;
          });
        };

        const cleaned = findAndRemove([...prev]);
        if (movedNode) {
          return addNode(cleaned);
        }
        return cleaned;
      });
    }
  };

  const saveEdit = () => {
    if (editingNode) {
      if (typeof chrome !== 'undefined' && chrome.bookmarks) {
        chrome.bookmarks.update(editingNode.id, { title: editTitle, url: editUrl || undefined }, () => {
          if (editParentId !== originalParentId) {
            chrome.bookmarks.move(editingNode.id, { parentId: editParentId }, () => {
              fetchBookmarks();
              setEditingNode(null);
              (document.getElementById('edit_modal') as HTMLDialogElement).close();
            });
          } else {
            fetchBookmarks();
            setEditingNode(null);
            (document.getElementById('edit_modal') as HTMLDialogElement).close();
          }
        });
      } else {
        // Mock update
        fetchBookmarks();
        setEditingNode(null);
        (document.getElementById('edit_modal') as HTMLDialogElement).close();
      }
    }
  };

  return (
    <div className="space-y-2">
      {bookmarks.length > 0 ? (
        bookmarks.map(node => (
          <BookmarkItem key={node.id} node={node} depth={0} onDelete={handleDelete} onEdit={handleEdit} onMove={handleMove} />
        ))
      ) : (
        <div className="text-center py-10 text-base-content/40">No bookmarks found.</div>
      )}

      {/* Edit Modal */}
      <dialog id="edit_modal" className="modal">
        <div className="modal-box bg-base-100">
          <h3 className="font-bold text-lg mb-4">Edit Bookmark</h3>
          <div className="space-y-4">
            <div className="form-control">
              <label className="label"><span className="label-text">Title</span></label>
              <input
                type="text"
                className="input input-bordered w-full"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
              />
            </div>
            {editingNode && !editingNode.children && (
              <div className="form-control">
                <label className="label"><span className="label-text">URL</span></label>
                <input
                  type="url"
                  className="input input-bordered w-full"
                  value={editUrl}
                  onChange={(e) => setEditUrl(e.target.value)}
                />
              </div>
            )}
            <div className="form-control">
              <label className="label"><span className="label-text">Parent Folder</span></label>
              <select
                className="select select-bordered w-full bg-base-100"
                value={editParentId}
                onChange={(e) => setEditParentId(e.target.value)}
              >
                {allFolders.map(f => (
                  <option key={f.id} value={f.id}>{f.title || 'Root'}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="modal-action">
            <button className="btn" onClick={() => (document.getElementById('edit_modal') as HTMLDialogElement).close()}>Cancel</button>
            <button className="btn btn-primary" onClick={saveEdit}>Save Changes</button>
          </div>
        </div>
      </dialog>
    </div>
  );
};

export default BookmarkList;

import React, { useEffect, useState } from 'react';
import {
  Trash2, Download, FileText, Search, ExternalLink,
  Copy, Check, Edit2, Save, X, Plus,
  LayoutList, Columns, LayoutGrid
} from 'lucide-react';
import GlassCard from '../common/GlassCard';
import PageHeader from '../common/PageHeader';
import { useTranslation } from '../../contexts/LanguageContext';

interface Snippet {
  id: string;
  text: string;
  url: string;
  title: string;
  timestamp: string;
}

const Snippets: React.FC = () => {
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [columns, setColumns] = useState<1 | 2 | 4>(2);

  // New snippet modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newSnippetTitle, setNewSnippetTitle] = useState('');
  const [newSnippetText, setNewSnippetText] = useState('');

  useEffect(() => {
    const loadSnippets = () => {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.get(['snippets'], (result) => {
          setSnippets(result.snippets || []);
          setIsLoading(false);
        });
      } else {
        const stored = localStorage.getItem('dockmark_snippets');
        if (stored) {
          setSnippets(JSON.parse(stored));
        }
        setIsLoading(false);
      }
    };

    loadSnippets();
  }, []);

  const saveToStorage = (newSnippets: Snippet[]) => {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ snippets: newSnippets });
    } else {
      localStorage.setItem('dockmark_snippets', JSON.stringify(newSnippets));
    }
  };

  const addSnippet = () => {
    if (!newSnippetText.trim()) return;

    const newSnippet: Snippet = {
      id: Date.now().toString(),
      text: newSnippetText,
      url: '',
      title: newSnippetTitle.trim() || 'Manual Snippet',
      timestamp: new Date().toISOString()
    };

    const updated = [newSnippet, ...snippets];
    setSnippets(updated);
    saveToStorage(updated);

    // Clear and close
    setNewSnippetTitle('');
    setNewSnippetText('');
    setIsModalOpen(false);
  };

  const deleteSnippet = (id: string) => {
    const newSnippets = snippets.filter(s => s.id !== id);
    setSnippets(newSnippets);
    saveToStorage(newSnippets);
  };

  const copyToClipboard = (snippet: Snippet) => {
    navigator.clipboard.writeText(snippet.text).then(() => {
      setCopiedId(snippet.id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const startEditing = (snippet: Snippet) => {
    setEditingId(snippet.id);
    setEditTitle(snippet.title);
  };

  const saveTitle = (id: string) => {
    const newSnippets = snippets.map(s =>
      s.id === id ? { ...s, title: editTitle } : s
    );
    setSnippets(newSnippets);
    saveToStorage(newSnippets);
    setEditingId(null);
  };

  const exportAsMarkdown = (snippet: Snippet) => {
    const content = `---
title: ${snippet.title}
url: ${snippet.url}
date: ${snippet.timestamp}
---

${snippet.text}
`;
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `snippet-${snippet.id}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportAllAsMarkdown = () => {
    if (snippets.length === 0) return;

    let content = "# All Snippets\n\n";
    snippets.forEach(snippet => {
      content += `## ${snippet.title}\n\n`;
      content += `- URL: ${snippet.url || 'Manual Input'}\n`;
      content += `- Date: ${snippet.timestamp}\n\n`;
      content += "```\n";
      content += snippet.text + "\n";
      content += "```\n\n---\n\n";
    });

    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `all-snippets-${new Date().toISOString().split('T')[0]}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredSnippets = snippets.filter(s =>
    s.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  const { t } = useTranslation();

  return (
    <div className="space-y-6 flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500 bg-transparent">
      <PageHeader
        title={t.snippets.title}
        description={t.snippets.description}
        icon={FileText}
        action={
          <div className="flex flex-wrap items-center gap-4">
            <div className="join bg-base-100/30 p-0.5 border border-white/10 rounded-xl">
              <button
                onClick={() => setColumns(1)}
                className={`join-item btn btn-xs ${columns === 1 ? 'btn-primary' : 'btn-ghost'}`}
              >
                <LayoutList size={14} />
              </button>
              <button
                onClick={() => setColumns(2)}
                className={`join-item btn btn-xs ${columns === 2 ? 'btn-primary' : 'btn-ghost'}`}
              >
                <Columns size={14} />
              </button>
              <button
                onClick={() => setColumns(4)}
                className={`join-item btn btn-xs ${columns === 4 ? 'btn-primary' : 'btn-ghost'}`}
              >
                <LayoutGrid size={14} />
              </button>
            </div>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/40" />
              <input
                type="text"
                placeholder={t.snippets.search}
                className="input input-bordered input-sm pl-9 bg-base-100/50 border-white/10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <button onClick={() => setIsModalOpen(true)} className="btn btn-primary btn-sm">
                <Plus size={16} /> {t.snippets.new}
              </button>
              <button onClick={exportAllAsMarkdown} className="btn btn-outline btn-sm" disabled={snippets.length === 0}>
                <Download size={16} /> {t.snippets.export}
              </button>
            </div>
          </div>
        }
      />

      {filteredSnippets.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center opacity-30">
          <FileText size={64} className="mb-4" />
          <p className="text-xl font-medium">{t.snippets.empty}</p>
          <p className="text-sm">{t.snippets.emptySub}</p>
        </div>
      ) : (
        <div className={`grid gap-4 overflow-y-auto pr-2 pb-6 ${
          columns === 1 ? 'grid-cols-1' :
          columns === 2 ? 'grid-cols-1 md:grid-cols-2' :
          'grid-cols-1 md:grid-cols-2 xl:grid-cols-4'
        }`}>
          {filteredSnippets.map((snippet) => (
            <GlassCard key={snippet.id} className="group hover:border-primary/30" noPadding>
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1 min-w-0 pr-2">
                    {editingId === snippet.id ? (
                      <div className="flex gap-1 items-center">
                        <input
                          type="text"
                          className="input input-bordered input-xs flex-1"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveTitle(snippet.id);
                            if (e.key === 'Escape') setEditingId(null);
                          }}
                        />
                        <button onClick={() => saveTitle(snippet.id)} className="btn btn-ghost btn-xs btn-square text-success">
                          <Save className="w-3 h-3" />
                        </button>
                        <button onClick={() => setEditingId(null)} className="btn btn-ghost btn-xs btn-square text-error">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 group/title">
                        <h3 className="font-bold text-sm truncate text-base-content" title={snippet.title}>
                          {snippet.title}
                        </h3>
                        <button
                          onClick={() => startEditing(snippet)}
                          className="opacity-0 group-hover/title:opacity-100 transition-opacity btn btn-ghost btn-xs btn-square p-0"
                          title="Edit title"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                    <p className="text-[10px] opacity-50">
                      {new Date(snippet.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <button
                      onClick={() => copyToClipboard(snippet)}
                      className={`btn btn-ghost btn-xs btn-square ${copiedId === snippet.id ? 'text-success' : 'text-base-content/50'}`}
                      title="Copy to clipboard"
                    >
                      {copiedId === snippet.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => exportAsMarkdown(snippet)}
                      className="btn btn-ghost btn-xs btn-square text-info"
                      title="Export as Markdown"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteSnippet(snippet.id)}
                      className="btn btn-ghost btn-xs btn-square text-error"
                      title="Delete snippet"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="relative">
                  <pre className="bg-base-100/80 backdrop-blur-sm p-3 rounded-xl text-xs font-mono max-h-48 overflow-y-auto whitespace-pre-wrap text-base-content border border-white/10 shadow-inner">
                    {snippet.text}
                  </pre>
                </div>

                <div className="mt-4 flex items-center justify-between min-h-[1rem]">
                  {snippet.url ? (
                    <a
                      href={snippet.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-[10px] text-primary hover:underline truncate"
                    >
                      <ExternalLink className="w-3 h-3" />
                      {new URL(snippet.url).hostname}
                    </a>
                  ) : (
                    <span className="text-[10px] opacity-30 italic">{t.snippets.manualEntry}</span>
                  )}
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {/* New Snippet Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-base-100 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-base-300">
            <div className="p-6 border-b border-base-300 flex justify-between items-center bg-base-200/50">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Plus size={20} className="text-primary" /> {t.snippets.modalTitle}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="btn btn-ghost btn-sm btn-circle">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold opacity-70 px-1">{t.snippets.labelTitle}</label>
                <input
                  type="text"
                  className="input input-bordered w-full bg-base-100/50"
                  placeholder={t.snippets.placeholderTitle}
                  value={newSnippetTitle}
                  onChange={(e) => setNewSnippetTitle(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold opacity-70 px-1">{t.snippets.labelContent}</label>
                <textarea
                  className={`textarea textarea-bordered font-mono text-sm transition-all duration-200 bg-base-100/50 ${
                    newSnippetText ? 'h-80' : 'h-40'
                  }`}
                  placeholder={t.snippets.placeholderContent}
                  value={newSnippetText}
                  onChange={(e) => setNewSnippetText(e.target.value)}
                ></textarea>
              </div>
            </div>

            <div className="p-6 bg-base-200/50 border-t border-base-300 flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="btn btn-ghost">{t.settings.cancel}</button>
              <button
                onClick={addSnippet}
                className="btn btn-primary"
                disabled={!newSnippetText.trim()}
              >
                {t.snippets.new}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Snippets;

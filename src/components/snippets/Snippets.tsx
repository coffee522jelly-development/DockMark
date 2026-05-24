import React, { useEffect, useState } from 'react';
import { Trash2, Download, FileText, Search, ExternalLink } from 'lucide-react';

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

  const deleteSnippet = (id: string) => {
    const newSnippets = snippets.filter(s => s.id !== id);
    setSnippets(newSnippets);
    saveToStorage(newSnippets);
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
      content += `- URL: ${snippet.url}\n`;
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

  return (
    <div className="p-6 max-w-6xl mx-auto h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2 text-base-content">
          <FileText className="w-6 h-6 text-primary" />
          Code Snippets
        </h1>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/50" />
            <input
              type="text"
              placeholder="Search snippets..."
              className="input input-bordered input-sm pl-9 w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button
            onClick={exportAllAsMarkdown}
            className="btn btn-primary btn-sm gap-2"
            disabled={snippets.length === 0}
          >
            <Download className="w-4 h-4" />
            Export All (MD)
          </button>
        </div>
      </div>

      {filteredSnippets.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center opacity-50">
          <FileText className="w-16 h-16 mb-4" />
          <p className="text-xl font-medium">No snippets found</p>
          <p className="text-sm">Select text on any webpage and use the right-click menu to save snippets.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto pr-2 pb-6">
          {filteredSnippets.map((snippet) => (
            <div key={snippet.id} className="card bg-base-100 border border-base-200 shadow-sm hover:shadow-md transition-shadow group">
              <div className="card-body p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm truncate text-base-content" title={snippet.title}>
                      {snippet.title}
                    </h3>
                    <p className="text-[10px] opacity-50">
                      {new Date(snippet.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
                  <pre className="bg-base-200 p-3 rounded-lg text-xs font-mono max-h-48 overflow-y-auto whitespace-pre-wrap text-base-content/80">
                    {snippet.text}
                  </pre>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <a
                    href={snippet.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-[10px] text-primary hover:underline truncate"
                  >
                    <ExternalLink className="w-3 h-3" />
                    {new URL(snippet.url).hostname}
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Snippets;

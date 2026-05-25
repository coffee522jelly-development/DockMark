import React, { useState, useEffect } from 'react';
import { StickyNote } from 'lucide-react';

const NotesWidget: React.FC = () => {
  const [note, setNote] = useState('');

  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(['quick_note'], (result) => {
        if (result && typeof result.quick_note === 'string') {
          setNote(result.quick_note);
        }
      });
    } else {
      const savedNote = localStorage.getItem('quick_note');
      if (savedNote) {
        setNote(savedNote);
      }
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setNote(value);
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ quick_note: value });
    } else {
      localStorage.setItem('quick_note', value);
    }
  };

  return (
    <div className="card bg-yellow-100 shadow-xl border border-yellow-200 h-80">
      <div className="card-body p-4 flex flex-col h-full text-yellow-900">
        <h3 className="card-title text-yellow-900 flex items-center gap-2 mb-2">
          <StickyNote className="w-5 h-5" />
          Sticky Note
        </h3>
        <textarea
          className="textarea flex-1 bg-transparent border-none focus:outline-none resize-none p-0 text-sm leading-relaxed"
          placeholder="Type your notes here..."
          value={note}
          onChange={handleChange}
        />
      </div>
    </div>
  );
};

export default NotesWidget;

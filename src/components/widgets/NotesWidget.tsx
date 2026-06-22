import React, { useState, useEffect } from 'react';
import { StickyNote } from 'lucide-react';
import GlassCard from '../common/GlassCard';
import { useTranslation } from '../../contexts/LanguageContext';

const NotesWidget: React.FC = () => {
  const { t } = useTranslation();
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
    <GlassCard className="aspect-square bg-yellow-100/80 text-yellow-950" noPadding>
      <div className="p-4 flex flex-col h-full">
        <h3 className="card-title flex items-center gap-2 mb-3">
          <StickyNote className="w-5 h-5" />
          {t.widgets.notes.title}
        </h3>
        <textarea
          className="flex-1 bg-white/30 rounded-xl p-3 border-none focus:outline-none focus:bg-white/50 transition-all resize-none text-sm placeholder-yellow-800/40 leading-relaxed"
          placeholder={t.widgets.notes.placeholder}
          value={note}
          onChange={handleChange}
        />
      </div>
    </GlassCard>
  );
};

export default NotesWidget;

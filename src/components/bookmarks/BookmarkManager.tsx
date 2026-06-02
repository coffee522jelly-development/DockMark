import React, { useState } from 'react';
import BookmarkList from './BookmarkList';
import { FolderPlus, Bookmark } from 'lucide-react';
import GlassCard from '../common/GlassCard';
import { useTranslation } from '../../contexts/LanguageContext';
import PageHeader from '../common/PageHeader';

const BookmarkManager: React.FC = () => {
  const { t } = useTranslation();
  const [newFolderName, setNewFolderName] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return;

    if (typeof chrome !== 'undefined' && chrome.bookmarks) {
      // Create folder in "Other Bookmarks" (id: "2") by default or root
      chrome.bookmarks.create({ title: newFolderName }, () => {
        setNewFolderName('');
        setRefreshTrigger(prev => prev + 1);
        (document.getElementById('new_folder_modal') as HTMLDialogElement).close();
      });
    } else {
      // Mock
      console.log('Creating folder:', newFolderName);
      setNewFolderName('');
      setRefreshTrigger(prev => prev + 1);
      (document.getElementById('new_folder_modal') as HTMLDialogElement).close();
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <PageHeader
        title={t.sidebar.bookmarks}
        description={t.bookmarks.managerDesc}
        icon={Bookmark}
        action={
          <button
            className="btn btn-primary btn-sm gap-2"
            onClick={() => (document.getElementById('new_folder_modal') as HTMLDialogElement).showModal()}
          >
            <FolderPlus size={18} />
            {t.bookmarks.addFolder}
          </button>
        }
      />

      <GlassCard className="p-4" noPadding>
        <BookmarkList key={refreshTrigger} />
      </GlassCard>

      {/* New Folder Modal */}
      <dialog id="new_folder_modal" className="modal">
        <div className="modal-box bg-base-100 border border-white/10 shadow-2xl">
          <h3 className="font-bold text-lg mb-4">{t.bookmarks.addFolder}</h3>
          <div className="form-control">
            <label className="label"><span className="label-text">{t.bookmarks.folderName}</span></label>
            <input
              type="text"
              className="input input-bordered w-full bg-base-100/50"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="..."
            />
          </div>
          <div className="modal-action">
            <button className="btn btn-ghost" onClick={() => (document.getElementById('new_folder_modal') as HTMLDialogElement).close()}>{t.settings.cancel}</button>
            <button className="btn btn-primary" onClick={handleCreateFolder}>{t.bookmarks.addFolder}</button>
          </div>
        </div>
      </dialog>
    </div>
  );
};

export default BookmarkManager;

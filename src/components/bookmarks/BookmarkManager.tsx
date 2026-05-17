import React from 'react';
import BookmarkList from './BookmarkList';

const BookmarkManager: React.FC = () => {
  return (
    <div className="bg-base-100 rounded-2xl shadow-xl border border-base-300 overflow-hidden">
      <div className="p-6 border-b border-base-300">
        <h2 className="text-2xl font-bold text-base-content">Browser Bookmarks</h2>
        <p className="text-base-content/60">Organize and manage your browser bookmarks.</p>
      </div>
      <div className="p-6">
        <BookmarkList />
      </div>
    </div>
  );
};

export default BookmarkManager;

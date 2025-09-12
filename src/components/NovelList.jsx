import React from 'react';
import { BookmarkIcon } from './';

export const NovelList = ({ novels, onSelectNovel, bookmarks, onToggleBookmark }) => (
    <div className="grid grid-cols-3 gap-x-3 gap-y-5 sm:grid-cols-4 p-4 text-text-main">
      {novels.length > 0 ? novels.map((novel, index) => (
        <div key={novel.id} onClick={() => onSelectNovel(novel)} className="cursor-pointer group animate-fade-in-down" style={{ animationDelay: `${index * 50}ms` }}>
          <div className="relative transition-all duration-300">
            <button onClick={(e) => { e.stopPropagation(); onToggleBookmark(novel.id); }} className={`absolute top-2 right-2 z-10 p-1 rounded-full bg-black/30 backdrop-blur-sm text-white transition-colors ${bookmarks.includes(novel.id) ? 'text-accent' : ''}`}>
              <BookmarkIcon filled={bookmarks.includes(novel.id)} width="20" height="20" />
            </button>
            <img src={`/${novel.coverUrl}`} alt={novel.title} className="w-full aspect-[2/3] object-cover rounded-lg shadow-md transition-transform duration-300 group-hover:scale-105 border border-border-color" />
            <h2 className="mt-2 font-semibold text-xs truncate">{novel.title}</h2>
          </div>
        </div>
      )) : (
        <p className="col-span-3 text-center opacity-70">Ничего не найдено.</p>
      )}
    </div>
);
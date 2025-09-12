import React, { useState, useMemo } from 'react';
import { Header } from "../Header.jsx";
import { NovelList } from "../NovelList.jsx";
import { SearchIcon } from '../icons.jsx';

export const SearchPage = ({ novels, onSelectNovel, bookmarks, onToggleBookmark }) => {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredNovels = useMemo(() => {
        return novels.filter(novel => novel.title.toLowerCase().includes(searchQuery.toLowerCase()))
    }, [novels, searchQuery]);

    return (
        <div>
            <Header title="Поиск" />
            <div className="p-4">
                <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        <SearchIcon className="text-text-main opacity-50" />
                    </div>
                    <input
                        type="text"
                        placeholder="Поиск по названию..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-component-bg border-border-color border rounded-lg py-2 pl-10 pr-4 text-text-main placeholder-text-main/50 focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                </div>
            </div>
            {searchQuery && filteredNovels.length === 0 ? (
                <p className="text-center text-text-main opacity-70 mt-8">Ничего не найдено</p>
            ) : (
                <NovelList
                    novels={filteredNovels}
                    onSelectNovel={onSelectNovel}
                    bookmarks={bookmarks}
                    onToggleBookmark={onToggleBookmark}
                />
            )}
        </div>
    );
}
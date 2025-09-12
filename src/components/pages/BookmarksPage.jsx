import React from 'react';
import { Header } from "../Header.jsx";
import { NovelList } from "../NovelList.jsx";

export const BookmarksPage = ({ novels, onSelectNovel, bookmarks, onToggleBookmark }) => (
    <div>
        <Header title="Закладки" />
        <NovelList novels={novels} onSelectNovel={onSelectNovel} bookmarks={bookmarks} onToggleBookmark={onToggleBookmark} />
    </div>
);
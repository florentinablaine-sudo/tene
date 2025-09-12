import React from 'react';
import { Header } from '../components/Header';
import { NovelList } from '../components/NovelList';

export const BookmarksPage = ({ novels, onSelectNovel, bookmarks, onToggleBookmark }) => (
    <div>
        <Header title="Закладки" />
        <NovelList novels={novels} onSelectNovel={onSelectNovel} bookmarks={bookmarks} onToggleBookmark={onToggleBookmark} />
    </div>
);
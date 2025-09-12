import React from 'react';
import { LibraryIcon, SearchIcon, BookmarkIcon, UserIcon } from './components';

export const BottomNav = ({ activeTab, setActiveTab }) => {
    const navItems = [
        { id: 'library', label: 'Библиотека', icon: LibraryIcon },
        { id: 'search', label: 'Поиск', icon: SearchIcon },
        { id: 'bookmarks', label: 'Закладки', icon: BookmarkIcon },
        { id: 'profile', label: 'Профиль', icon: UserIcon },
    ];
    return (
        <div className="fixed bottom-0 left-0 right-0 border-t border-border-color bg-component-bg z-30 shadow-[0_-2px_5px_rgba(0,0,0,0.05)]">
            <div className="flex justify-around items-center h-16">
                {navItems.map(item => (
                    <button key={item.id} onClick={() => setActiveTab(item.id)} className={`flex flex-col items-center justify-center w-full h-full transition-colors duration-200 ${activeTab === item.id ? "text-accent" : "text-text-main opacity-60"}`}>
                        <item.icon filled={activeTab === item.id} />
                        <span className="text-xs mt-1">{item.label}</span>
                    </button>
                ))}
            </div>
        </div>
    )
}
import React from 'react';
import { signOut } from "firebase/auth";
import { Header } from "../Header.jsx"; // или "../Header.jsx"
import { LogOutIcon } from "../icons.jsx"; // Указываем путь к конкретному файлу иконки

export const ProfilePage = ({ user, subscription, onGetSubscriptionClick, userId, auth, onThemeToggle, currentTheme }) => {
    const handleLogout = () => {
        signOut(auth).catch((error) => {
            console.error("Ошибка выхода:", error);
        });
    };

    const handleCopyId = () => {
        if (userId) {
            navigator.clipboard.writeText(userId)
                .then(() => console.log("Firebase UID скопирован в буфер обмена"))
                .catch(err => console.error('Не удалось скопировать UID: ', err));
        }
    };

    const getSubscriptionEndDate = () => {
        if (subscription && subscription.expires_at && typeof subscription.expires_at.toDate === 'function') {
            return subscription.expires_at.toDate();
        }
        return null;
    };

    const subscriptionEndDate = getSubscriptionEndDate();
    const hasActiveSubscription = subscriptionEndDate && subscriptionEndDate > new Date();

    return (
        <div>
            <Header title="Профиль" />
            <div className="p-4 rounded-lg bg-component-bg border border-border-color mx-4 mb-4">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <p className="font-bold text-lg">{user?.displayName || 'Аноним'}</p>
                        <p className="text-sm text-text-main/70">{user?.email}</p>
                    </div>
                    <button onClick={handleLogout} className="p-2 rounded-full hover:bg-background transition-colors">
                        <LogOutIcon />
                    </button>
                </div>
            </div>
          <div className="p-4 rounded-lg bg-component-bg border border-border-color mx-4 mb-4">
                <h3 className="font-bold mb-2">Настройки</h3>
                <div className="flex items-center justify-between">
                    <span>Тёмная тема</span>
                    <button 
                        onClick={onThemeToggle}
                        className="w-14 h-7 rounded-full bg-background flex items-center transition-colors p-1"
                    >
                        <div className={`w-5 h-5 rounded-full bg-accent shadow-md transform transition-transform ${currentTheme === 'dark' ? 'translate-x-7' : ''}`} />
                    </button>
                </div>
            </div>
            <div className="p-4 rounded-lg bg-component-bg border border-border-color mx-4 mb-4">
                 <h3 className="font-bold mb-2">Подписка</h3>
                 {hasActiveSubscription ? (
                    <div>
                        <p className="text-green-500">Активна</p>
                        <p className="text-sm opacity-70">
                            Заканчивается: {subscriptionEndDate.toLocaleDateString()}
                        </p>
                    </div>
                ) : (
                    <div>
                        <p className="text-red-500">Неактивна</p>
                         <p className="text-sm opacity-70 mb-3">
                            Оформите подписку, чтобы получить доступ ко всем платным главам.
                        </p>
                        <button onClick={onGetSubscriptionClick} className="w-full py-2 rounded-lg bg-accent text-white font-bold shadow-lg shadow-accent/30 transition-all hover:scale-105">
                            Оформить подписку
                        </button>
                    </div>
                )}
            </div>
            <div className="p-4 rounded-lg bg-component-bg border border-border-color mx-4">
                 <h3 className="font-bold mb-2">Ваш ID для привязки</h3>
                <p className="text-sm opacity-70 mb-3">
                    Этот ID нужен для связи вашего аккаунта с Telegram-ботом. 
                    Например, после подписки на Boosty.
                </p>
                <div className="bg-background p-2 rounded-md text-xs break-all mb-3">
                    <code>{userId || "Загрузка..."}</code>
                </div>
                <button
                    onClick={handleCopyId}
                    disabled={!userId}
                    className="w-full py-2 rounded-lg bg-gray-200 text-gray-800 font-bold transition-all hover:scale-105 disabled:opacity-50"
                >
                    Копировать ID
                </button>
            </div>
        </div>
    );
};
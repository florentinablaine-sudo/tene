import React from 'react';
import { CrownIcon } from './';

export const SubscriptionModal = ({ onClose, onSelectPlan }) => {
    const subscriptionPlans = [
        { duration: 1, name: '1 месяц', price: 199 },
        { duration: 3, name: '3 месяца', price: 539, popular: true },
        { duration: 12, name: '1 год', price: 1899 }
    ];
    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-sm rounded-2xl p-6 shadow-lg bg-component-bg text-text-main">
                <CrownIcon className="mx-auto mb-4 text-accent" />
                <h3 className="text-xl text-center font-bold">Получите доступ ко всем главам</h3>
                <p className="mt-2 mb-6 text-sm text-center opacity-70">Выберите подходящий тариф подписки:</p>
                <div className="space-y-3">
                    {subscriptionPlans.map(plan => (
                        <button key={plan.duration} onClick={() => onSelectPlan(plan)} className="relative w-full text-left p-4 rounded-xl border-2 transition-colors duration-200 border-border-color bg-background hover:border-accent-hover">
                            <p className="font-bold">{plan.name}</p>
                            <p className="text-sm">{plan.price} ₽</p>
                        </button>
                    ))}
                </div>
                <button onClick={onClose} className="w-full py-3 mt-4 rounded-lg border border-border-color">Не сейчас</button>
            </div>
        </div>
    );
};
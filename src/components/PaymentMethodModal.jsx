import React from 'react';

export const PaymentMethodModal = ({ onClose, onSelectMethod, plan }) => {
    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-sm rounded-2xl p-6 shadow-lg bg-component-bg text-text-main">
                <h3 className="text-xl text-center font-bold">Выберите способ оплаты</h3>
                <p className="mt-2 mb-6 text-sm text-center opacity-70">Тариф: {plan.name} ({plan.price} ₽)</p>
                <div className="space-y-3">
                    <button onClick={() => onSelectMethod('card')} className="w-full text-left p-4 rounded-xl border-2 transition-colors duration-200 border-border-color bg-background hover:border-accent-hover">
                        <p className="font-bold">💳 Банковской картой</p>
                        <p className="text-sm opacity-70">Ручная проверка (до 24 часов)</p>
                    </button>
                    <button onClick={() => onSelectMethod('tribut')} className="w-full text-left p-4 rounded-xl border-2 transition-colors duration-200 border-border-color bg-background hover:border-accent-hover">
                        <p className="font-bold">❤️ Донат через tribut</p>
                        <p className="text-sm opacity-70">Более быстрый способ</p>
                    </button>
                    <button onClick={() => onSelectMethod('boosty')} className="w-full text-left p-4 rounded-xl border-2 transition-colors duration-200 border-border-color bg-background hover:border-accent-hover">
                        <p className="font-bold">🧡 Оплатить через Boosty</p>
                        <p className="text-sm opacity-70">Автоматическая активация через Telegram</p>
                    </button>
                    <div className="text-center pt-2">
                        <button onClick={() => onSelectMethod('boosty')} className="text-sm text-accent hover:underline">
                            Уже есть подписка? Синхронизировать аккаунт
                        </button>
                    </div>
                </div>
                <button onClick={onClose} className="w-full py-3 mt-6 rounded-lg border border-border-color hover:bg-white/5 transition-colors">
                    Назад
                </button>
            </div>
        </div>
    );
};
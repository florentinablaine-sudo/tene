import React, { useState, useMemo, useEffect, useRef } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from "../../firebase-config";
// ИСПРАВЛЕННЫЕ ИМПОРТЫ: теперь все идет из '../components'
import { LockIcon } from '../icons.jsx';
import { Header } from '../Header.jsx';
import { SubscriptionModal } from '../SubscriptionModal.jsx';
import { PaymentMethodModal } from '../PaymentMethodModal.jsx';
import { ArrowRightIcon } from '../icons.jsx';


export const NovelDetails = ({ novel, onSelectChapter, onGenreSelect, subscription, botUsername, userId, chapters, isLoadingChapters, lastReadData, onBack }) => {
    if (!novel) {
        return (
            <div>
                <Header title="Загрузка..." onBack={onBack} />
                <div className="p-4 text-center">Загрузка данных о новелле...</div>
            </div>
        );
    }

    const [isSubModalOpen, setIsSubModalOpen] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [sortOrder, setSortOrder] = useState('newest');
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
    const descriptionRef = useRef(null);
    const [isLongDescription, setIsLongDescription] = useState(false);

    const novelGenres = Array.isArray(novel.genres) ? novel.genres : [];

    const hasActiveSubscription = subscription && subscription.expires_at && typeof subscription.expires_at.toDate === 'function' && subscription.expires_at.toDate() > new Date();

    const lastReadChapterId = useMemo(() => {
        if (lastReadData && novel && lastReadData[novel.id]) {
            return lastReadData[novel.id].chapterId;
        }
        return null;
    }, [lastReadData, novel]);

    useEffect(() => {
        if (descriptionRef.current) {
            setTimeout(() => {
                 if (descriptionRef.current) {
                    setIsLongDescription(descriptionRef.current.scrollHeight > descriptionRef.current.clientHeight);
                }
            }, 100);
        }
    }, [novel.description]);


    const sortedChapters = useMemo(() => {
        if (!Array.isArray(chapters)) return [];
        const chaptersCopy = [...chapters];
        if (sortOrder === 'newest') return chaptersCopy.reverse();
        return chapters;
    }, [chapters, sortOrder]);

    const handleChapterClick = (chapter) => { if (!hasActiveSubscription && chapter.isPaid) setIsSubModalOpen(true); else onSelectChapter(chapter); };
    const handleContinueReading = () => { if (lastReadChapterId) { const chapterToContinue = chapters.find(c => c.id === lastReadChapterId); if (chapterToContinue) onSelectChapter(chapterToContinue); } };
    const handlePlanSelect = (plan) => setSelectedPlan(plan);
    const handlePaymentMethodSelect = async (method) => {
        const tg = window.Telegram?.WebApp;
        if (!tg || !userId || !selectedPlan) {
            console.error("Telegram Web App, userId, or selectedPlan is not available.");
            if (tg) tg.showAlert("Произошла ошибка. Пожалуйста, попробуйте еще раз.");
            return;
        }

        tg.showConfirm(
            "Вы будете перенаправлены в бот для завершения оплаты. Если бот не реагирует после того, как вы выбрали тариф, не волнуйтесь! Попробуйте отправить команду /start еще раз.",
            async (confirmed) => {
                if (!confirmed) return;

                const userDocRef = doc(db, "users", userId);
                try {
                    await setDoc(userDocRef, {
                        pendingSubscription: { ...selectedPlan, method: method, date: new Date().toISOString() }
                    }, { merge: true });
                    tg.openTelegramLink(`https://t.me/${botUsername}?start=${userId}`);
                    tg.close();
                } catch (error) {
                    console.error("Ошибка записи в Firebase:", error);
                    tg.showAlert("Не удалось сохранить ваш выбор. Попробуйте снова.");
                }
            }
        );
    };

    return (<div className="text-text-main"><Header title={novel.title} onBack={onBack} /><div className="relative h-64"><img src={`/${novel.coverUrl}`} alt={novel.title} className="w-full h-full object-cover object-top absolute"/><div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent"></div><div className="absolute bottom-4 left-4 right-4"><h1 className="text-3xl font-bold font-sans text-text-main drop-shadow-[0_2px_2px_rgba(255,255,255,0.7)]">{novel.title}</h1><p className="text-sm font-sans text-text-main opacity-90 drop-shadow-[0_1px_1px_rgba(255,255,255,0.7)]">{novel.author}</p></div></div><div className="p-4"><div className="flex flex-wrap gap-2 mb-4">
    {novelGenres.map(genre => {
        const isHighlighted = genre === '16+' || genre === '18+';
        const genreClassName = `
            text-xs font-semibold px-3 py-1 rounded-full transition-colors 
            duration-200 bg-component-bg border hover:bg-border-color
            ${isHighlighted 
                ? 'border-genre-highlight-border text-genre-highlight-text' 
                : 'border-border-color text-text-main'
            }
        `;
        return (
            <button 
                key={genre} 
                onClick={() => onGenreSelect(genre)} 
                className={genreClassName}
            >
                {genre}
            </button>
        );
    })}
</div><div ref={descriptionRef} className={`relative overflow-hidden transition-all duration-500 ${isDescriptionExpanded ? 'max-h-full' : 'max-h-24'}`}><div className="text-sm mb-2 opacity-80 font-body prose" dangerouslySetInnerHTML={{ __html: novel.description }} /></div>{isLongDescription && <div className="text-right"><button onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)} className="text-sm font-semibold text-accent mb-4">{isDescriptionExpanded ? 'Скрыть' : 'Читать полностью...'}</button></div>}{lastReadChapterId && <button onClick={handleContinueReading} className="w-full py-3 mb-4 rounded-lg bg-accent text-white font-bold shadow-lg shadow-accent/30 transition-all hover:scale-105 hover:shadow-xl">Продолжить чтение (Глава {lastReadChapterId})</button>}<div className="flex justify-between items-center mb-4"><h2 className="text-xl font-bold">Главы</h2><button onClick={() => setSortOrder(prev => prev === 'newest' ? 'oldest' : 'newest')} className="text-sm font-semibold text-accent">{sortOrder === 'newest' ? 'Сначала новые' : 'Сначала старые'}</button></div>
    {hasActiveSubscription && (<p className="text-sm text-green-500 mb-4">Подписка до {subscription.expires_at.toDate().toLocaleDateString()}</p>)}
    {isLoadingChapters ? <p>Загрузка глав...</p> : (<div className="flex flex-col gap-3">{sortedChapters.map(chapter => {
        const showLock = !hasActiveSubscription && chapter.isPaid;
        const isLastRead = lastReadChapterId === chapter.id;
        return (<div key={chapter.id} onClick={() => handleChapterClick(chapter)} className={`p-4 bg-component-bg rounded-xl cursor-pointer transition-all duration-200 hover:border-accent-hover hover:bg-accent/10 border border-border-color flex items-center justify-between shadow-sm hover:shadow-md ${showLock ? 'opacity-70' : ''}`}>
            <div className="flex items-center gap-3">
                {isLastRead && <span className="w-2 h-2 rounded-full bg-accent"></span>}
                <p className="font-semibold">{chapter.title}</p>
            </div>
            {showLock ? <LockIcon /> : <ArrowRightIcon/>}
        </div>);
    })}</div>)}
    {isSubModalOpen && <SubscriptionModal onClose={() => setIsSubModalOpen(false)} onSelectPlan={handlePlanSelect} />}
    {selectedPlan && <PaymentMethodModal onClose={() => setSelectedPlan(null)} onSelectMethod={handlePaymentMethodSelect} plan={selectedPlan} />}
    </div></div>)
};
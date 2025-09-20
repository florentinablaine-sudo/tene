// src/App.jsx

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { doc, getDoc, collection, setDoc, onSnapshot, getDocs } from "firebase/firestore";
import { db, auth } from './firebase-config.js';
import { useAuth } from './Auth';

// Импорты всех ваших компонентов и экранов
import { AuthScreen } from './AuthScreen.jsx';
import { HelpScreen } from './components/pages/HelpScreen.jsx';
import { LoadingSpinner } from './components/LoadingSpinner.jsx';
import { SubscriptionModal } from './components/SubscriptionModal.jsx';
import { PaymentMethodModal } from './components/PaymentMethodModal.jsx';
import { Header } from './components/Header.jsx';
import { NovelList } from './components/NovelList.jsx';
import { BottomNav } from './components/BottomNav.jsx';
import { NewsSlider } from './components/NewsSlider.jsx';
import { NewsModal } from './components/NewsModal.jsx';
import { NovelDetails } from './components/pages/NovelDetails.jsx';
import { ChapterReader } from './components/pages/ChapterReader.jsx';
import { BookmarksPage } from './components/pages/BookmarksPage.jsx';
import { ProfilePage } from './components/pages/ProfilePage.jsx';
import { SearchPage } from './components/pages/SearchPage.jsx';


export default function App() {
  // --- Состояние аутентификации из useAuth ---
  const { user, loading: authLoading } = useAuth();

  // --- ВСЕ ВАШИ СОСТОЯНИЯ ОСТАЛИСЬ ЗДЕСЬ ---
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [fontSize, setFontSize] = useState(16);
  const [fontClass, setFontClass] = useState('font-sans');
  const [page, setPage] = useState('list');
  const [activeTab, setActiveTab] = useState('library');
  const [novels, setNovels] = useState([]);
  const [selectedNovel, setSelectedNovel] = useState(null);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [genreFilter, setGenreFilter] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [isUserAdmin, setIsUserAdmin] = useState(false);
  const [chapters, setChapters] = useState([]);
  const [isLoadingChapters, setIsLoadingChapters] = useState(true);
  const [lastReadData, setLastReadData] = useState({});
  const [bookmarks, setBookmarks] = useState([]);
  const [isLoadingContent, setIsLoadingContent] = useState(true);
  
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedNews, setSelectedNews] = useState(null);
  const [showHelp, setShowHelp] = useState(false);
  const [needsPolicyAcceptance, setNeedsPolicyAcceptance] = useState(false);

  const BOT_USERNAME = "tenebrisverbot";
  const userId = user?.uid;

  // --- ВСЕ ВАШИ useEffect ОСТАЛИСЬ ЗДЕСЬ ---

  // Применение темы
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  // ГЛАВНЫЙ useEffect ДЛЯ ЗАГРУЗКИ ДАННЫХ
  useEffect(() => {
    if (authLoading) return; // Ждем окончания проверки авторизации
    if (!user) { // Если пользователя нет, сбрасываем все и выходим
      setIsLoadingContent(false);
      setNovels([]);
      setSubscription(null);
      setBookmarks([]);
      setLastReadData({});
      return;
    }

    // Пользователь есть, начинаем загрузку всего
    setIsLoadingContent(true);

    // --- НАЧАЛО ИСПРАВЛЕННОГО БЛОКА ---
    // Функция для загрузки новелл и статистики просмотров из Firestore
    const fetchNovelsAndStats = async () => {
        try {
            // Шаг 1: Загружаем новеллы из коллекции 'novels'
            const novelsSnapshot = await getDocs(collection(db, "novels"));
            const novelsData = novelsSnapshot.docs.map(doc => {
                const data = doc.data();
                return { ...data, id: doc.id }; // Используем ID документа как главный 'id'
            });

            // Шаг 2: Загружаем статистику из 'novel_stats'
            const statsSnapshot = await getDocs(collection(db, "novel_stats"));
            const statsMap = new Map();
            statsSnapshot.forEach(doc => statsMap.set(doc.id, doc.data().views));

            // Шаг 3: Объединяем новеллы со статистикой
            const mergedNovels = novelsData.map(novel => ({
                ...novel,
                views: statsMap.get(novel.id) || 0
            }));

            setNovels(mergedNovels); // Обновляем состояние

        } catch (err) {
            console.error("Ошибка загрузки новелл или статистики из Firestore:", err);
            setNovels([]); // В случае ошибки ставим пустой массив
        }
    };
    
    const checkAdminStatus = async () => {
        try {
            const idTokenResult = await user.getIdTokenResult();
            setIsUserAdmin(!!idTokenResult.claims.admin);
        } catch (err) {
            console.error("Ошибка проверки статуса администратора:", err);
            setIsUserAdmin(false);
        }
    };

    // Запускаем все асинхронные загрузки параллельно
    // Убедимся, что вызываем функцию с правильным именем: fetchNovelsAndStats
    Promise.all([fetchNovelsAndStats(), checkAdminStatus()]).finally(() => {
        setIsLoadingContent(false); // Завершаем общую загрузку в любом случае
    });
    // --- КОНЕЦ ИСПРАВЛЕННОГО БЛОКА ---


    // Подписка на изменения данных пользователя (осталась без изменений)
    const userDocRef = doc(db, "users", user.uid);
    const unsubscribeUser = onSnapshot(userDocRef, (docSnap) => {
        if (docSnap.exists()) {
            const data = docSnap.data();
            setSubscription(data.subscription || null);
            setLastReadData(data.lastRead || {});
            setBookmarks(data.bookmarks || []);
            if (data.settings) {
              setFontSize(data.settings.fontSize || 16);
              setFontClass(data.settings.fontClass || 'font-sans');
            }
        }
    }, (error) => {
        console.error("Ошибка подписки на данные пользователя:", error);
    });

    // Отписываемся от слушателя при выходе или смене пользователя
    return () => unsubscribeUser();
  }, [user, authLoading]); // Зависимость от user и authLoading

  // Загрузка глав для выбранной новеллы
  useEffect(() => {
      if (!selectedNovel) { setChapters([]); return; }
      setIsLoadingChapters(true);
      const fetchChapters = async () => {
          try {
              const docRef = doc(db, 'chapter_info', selectedNovel.id); // .toString() не нужен, так как id уже строка
              const docSnap = await getDoc(docRef);
              if (docSnap.exists() && docSnap.data()) {
                  const data = docSnap.data();
                  const chaptersData = data.chapters || {};
                  const chaptersArray = Object.keys(chaptersData).map(key => ({
                      id: parseInt(key),
                      title: `Глава ${key}`,
                      isPaid: chaptersData[key].isPaid || false
                  })).sort((a, b) => a.id - b.id);
                  setChapters(chaptersArray);
              } else { setChapters([]); }
          } catch (error) {
              console.error("Ошибка загрузки глав:", error);
              setChapters([]);
          } finally { setIsLoadingChapters(false); }
      };
      fetchChapters();
  }, [selectedNovel]);

  const handleBack = useCallback(() => {
      if (page === 'reader') { setSelectedChapter(null); setPage('details'); }
      else if (page === 'details') { setSelectedNovel(null); setGenreFilter(null); setPage('list'); }
  }, [page]);

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (!tg) return;
    tg.ready();
    tg.expand();
    tg.onEvent('backButtonClicked', handleBack);
    if (page === 'list') { tg.BackButton.hide(); } else { tg.BackButton.show(); }
    return () => tg.offEvent('backButtonClicked', handleBack);
  }, [page, handleBack]);

  // --- ВСЕ ВАШИ ФУНКЦИИ-ОБРАБОТЧИКИ ОСТАЛИСЬ ЗДЕСЬ ---
  const updateUserDoc = useCallback(async (dataToUpdate) => {
    if (userId) {
        await setDoc(doc(db, "users", userId), dataToUpdate, { merge: true });
    }
  }, [userId]);

  const handleThemeToggle = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  const handleTextSizeChange = useCallback((amount) => {
    setFontSize(prevSize => {
        const newSize = Math.max(12, Math.min(32, prevSize + amount));
        updateUserDoc({ settings: { fontSize: newSize, fontClass } });
        return newSize;
    });
  }, [fontClass, updateUserDoc]);

  const handleSelectChapter = useCallback(async (chapter) => {
    setSelectedChapter(chapter);
    setPage('reader');
    if (userId && selectedNovel) {
        const newLastReadData = { ...lastReadData, [selectedNovel.id]: { novelId: selectedNovel.id, chapterId: chapter.id, timestamp: new Date().toISOString() } };
        setLastReadData(newLastReadData);
        await updateUserDoc({ lastRead: newLastReadData });
    }
  }, [userId, selectedNovel, lastReadData, updateUserDoc]);

  const handleSelectNovel = (novel) => { setSelectedNovel(novel); setPage('details'); };
  const handleGenreSelect = (genre) => { setGenreFilter(genre); setPage('list'); setActiveTab('library'); };
  const handleClearGenreFilter = () => setGenreFilter(null);

  const handleToggleBookmark = useCallback(async (novelId) => {
    const newBookmarks = bookmarks.includes(novelId) ? bookmarks.filter(id => id !== novelId) : [...bookmarks, novelId];
    setBookmarks(newBookmarks);
    await updateUserDoc({ bookmarks: newBookmarks });
  }, [bookmarks, updateUserDoc]);

  const handlePlanSelect = (plan) => {
      setSelectedPlan(plan);
      setIsSubModalOpen(false);
  };

  const handlePaymentMethodSelect = async (method) => {
      const tg = window.Telegram?.WebApp;
      if (!tg || !userId || !selectedPlan) {
          if (tg) tg.showAlert("Произошла ошибка.");
          return;
      }
      tg.showConfirm("Вы будете перенаправлены в бот для завершения оплаты...", async (confirmed) => {
          if (!confirmed) return;
          try {
              await updateUserDoc({ pendingSubscription: { ...selectedPlan, method, date: new Date().toISOString() } });
              tg.openTelegramLink(`https://t.me/${BOT_USERNAME}?start=${userId}`);
              tg.close();
          } catch (error) {
              console.error("Ошибка записи в Firebase:", error);
              tg.showAlert("Не удалось сохранить ваш выбор.");
          }
      });
  };

  // --- ЛОГИКА РЕНДЕРИНГА ---
  if (authLoading || isLoadingContent) {
    return <LoadingSpinner />;
  }

  if (showHelp) {
    return <HelpScreen onBack={() => setShowHelp(false)} />;
  }
  
  if (!user) {
    return <AuthScreen onRegisterClick={() => setNeedsPolicyAcceptance(true)} />;
  }

  const renderContent = () => {
    if (page === 'details') {
      return <NovelDetails novel={selectedNovel} onSelectChapter={handleSelectChapter} onGenreSelect={handleGenreSelect} subscription={subscription} botUsername={BOT_USERNAME} userId={userId} chapters={chapters} isLoadingChapters={isLoadingChapters} lastReadData={lastReadData} onBack={handleBack} />;
    }
    if (page === 'reader') {
      return <ChapterReader chapter={selectedChapter} novel={selectedNovel} fontSize={fontSize} onFontSizeChange={handleTextSizeChange} userId={userId} userName={user?.displayName || 'Аноним'} currentFontClass={fontClass} onSelectChapter={handleSelectChapter} allChapters={chapters} subscription={subscription} botUsername={BOT_USERNAME} onBack={handleBack} isUserAdmin={isUserAdmin} />;
    }

    switch (activeTab) {
      case 'library':
        return (<>
            <Header title="Библиотека" />
            <NewsSlider onReadMore={setSelectedNews} />
            {genreFilter && (<div className="flex items-center justify-between p-3 mx-4 mb-0 rounded-lg border border-border-color bg-component-bg text-text-main">
                <p className="text-sm"><span className="opacity-70">Жанр:</span><strong className="ml-2">{genreFilter}</strong></p>
                <button onClick={handleClearGenreFilter} className="text-xs font-bold text-accent hover:underline">Сбросить</button>
            </div>)}
            <NovelList novels={novels.filter(n => !genreFilter || (n.genres && n.genres.includes(genreFilter)))} onSelectNovel={handleSelectNovel} bookmarks={bookmarks} onToggleBookmark={handleToggleBookmark} />
        </>);
      case 'search': return <SearchPage novels={novels} onSelectNovel={handleSelectNovel} bookmarks={bookmarks} onToggleBookmark={handleToggleBookmark} />;
      case 'bookmarks': return <BookmarksPage novels={novels.filter(n => bookmarks.includes(n.id))} onSelectNovel={handleSelectNovel} bookmarks={bookmarks} onToggleBookmark={handleToggleBookmark} />;
      case 'profile': return <ProfilePage user={user} subscription={subscription} onGetSubscriptionClick={() => setIsSubModalOpen(true)} userId={userId} auth={auth} onThemeToggle={handleThemeToggle} currentTheme={theme} onShowHelp={() => setShowHelp(true)} />;
      default: return <Header title="Библиотека" />;
    }
  };

  return (
    <main className={`bg-background min-h-screen font-sans text-text-main ${!isUserAdmin ? 'no-select' : ''}`}>
        <div className="pb-20">{renderContent()}</div>
        {page === 'list' && <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />}
        {isSubModalOpen && <SubscriptionModal onClose={() => setIsSubModalOpen(false)} onSelectPlan={handlePlanSelect} />}
        {selectedPlan && <PaymentMethodModal onClose={() => setSelectedPlan(null)} onSelectMethod={handlePaymentMethodSelect} plan={selectedPlan} />}
        {selectedNews && <NewsModal newsItem={selectedNews} onClose={() => setSelectedNews(null)} />}
    </main>
  );
}
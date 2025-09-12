// Импорты React и Firebase
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged, getRedirectResult } from "firebase/auth";
import { db, auth } from './firebase-config.js';
import { AuthScreen } from './AuthScreen.jsx';

// КОМПОНЕНТЫ (Импортированы напрямую)
import { LoadingSpinner } from './components/LoadingSpinner.jsx';
import { SubscriptionModal } from './components/SubscriptionModal.jsx';
import { PaymentMethodModal } from './components/PaymentMethodModal.jsx';
import { Header } from './components/Header.jsx';
import { NovelList } from './components/NovelList.jsx';
import { BottomNav } from './components/BottomNav.jsx';
import { NewsSlider } from './components/NewsSlider.jsx';
import { NewsModal } from './components/News.jsx'

// СТРАНИЦЫ
import { NovelDetails } from './components/pages/NovelDetails.jsx';
import { ChapterReader } from './components/pages/ChapterReader.jsx';
import { BookmarksPage } from './components/pages/BookmarksPage.jsx';
import { ProfilePage } from './components/pages/ProfilePage.jsx';
import { SearchPage } from './components/pages/SearchPage.jsx';


export default function App() {
  // --- Вся логика и состояния остаются здесь ---
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
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUserAdmin, setIsUserAdmin] = useState(false);
  const [chapters, setChapters] = useState([]);
  const [isLoadingChapters, setIsLoadingChapters] = useState(true);
  const [lastReadData, setLastReadData] = useState(null);
  const [bookmarks, setBookmarks] = useState([]);
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedNews, setSelectedNews] = useState(null);
  const BOT_USERNAME = "tenebrisverbot";
  const userId = user?.uid;

  // --- Все хуки и функции-обработчики также остаются здесь ---
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);
  
  const handleThemeToggle = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  const updateUserDoc = useCallback(async (dataToUpdate) => {
    if (userId) {
        const userDocRef = doc(db, "users", userId);
        try {
            await setDoc(userDocRef, dataToUpdate, { merge: true });
        } catch(e) {
            console.error("Не удалось обновить данные пользователя:", e);
        }
    }
  }, [userId]);

  const handleTextSizeChange = useCallback((amount) => {
    setFontSize(prevSize => {
        const newSize = Math.max(12, Math.min(32, prevSize + amount));
        updateUserDoc({ settings: { fontSize: newSize, fontClass } });
        return newSize;
    });
  }, [fontClass, updateUserDoc]);

  useEffect(() => {
    let unsubUserFromFirestore = () => {};
    let isMounted = true;
    
    const unsubAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      unsubUserFromFirestore();
      
      if (firebaseUser) {
        if (!isMounted) return;
        setUser(firebaseUser);
        const idTokenResult = await firebaseUser.getIdTokenResult();
        setIsUserAdmin(!!idTokenResult.claims.admin);
        
        const userDocRef = doc(db, "users", firebaseUser.uid);
        unsubUserFromFirestore = onSnapshot(userDocRef, (docSnap) => {
          if (!isMounted) return;
          if (docSnap.exists()) {
            const data = docSnap.data();
            setSubscription(data.subscription || null);
            setLastReadData(data.lastRead || null);
            setBookmarks(data.bookmarks || []);
          } else {
            setDoc(userDocRef, { bookmarks: [], lastRead: {} });
            setSubscription(null);
            setLastReadData(null);
            setBookmarks([]);
          }
          setIsLoading(false); 
        });
      } else {
        if (!isMounted) return;
        setUser(null);
        setIsUserAdmin(false);
        setSubscription(null);
        setLastReadData(null);
        setBookmarks([]);
        setIsLoading(false);
      }
    });

    getRedirectResult(auth).catch((error) => {
      console.error("Ошибка при обработке входа через Telegram:", error);
    });

    fetch(`/data/novels.json`)
      .then(res => res.json())
      .then(data => {
          if (isMounted) {
            setNovels(data.novels)
          }
      })
      .catch(err => console.error("Ошибка загрузки новелл:", err));

    return () => {
      isMounted = false;
      unsubAuth();
      unsubUserFromFirestore();
    };
  }, []);

  useEffect(() => {
      if (!selectedNovel) {
          setChapters([]);
          return;
      }
      const fetchChaptersFromFirestore = async () => {
          setIsLoadingChapters(true);
          try {
              const docRef = doc(db, 'chapter_info', selectedNovel.id.toString());
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
              } else {
                  console.log("Документ с главами не найден в chapter_info!");
                  setChapters([]);
              }
          } catch (error) {
              console.error("Ошибка загрузки глав из Firebase:", error);
              setChapters([]);
          } finally {
              setIsLoadingChapters(false);
          }
      };

      fetchChaptersFromFirestore();
  }, [selectedNovel]);


  const handleBack = useCallback(() => {
      if (page === 'reader') {
        setPage('details');
        setSelectedChapter(null);
      } else if (page === 'details') {
        setPage('list');
        setGenreFilter(null);
        setSelectedNovel(null);
      }
  }, [page]);

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (!tg) return;
    tg.ready();
    tg.expand();
    tg.onEvent('backButtonClicked', handleBack);
    if (page === 'list') {
        tg.BackButton.hide();
    } else {
        tg.BackButton.show();
    }
    return () => tg.offEvent('backButtonClicked', handleBack);
  }, [page, handleBack]);

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (tg) {
        tg.setHeaderColor('#FFFFFF');
        tg.setBackgroundColor('#F5F1ED');
    }
  }, []);

  const handleSelectChapter = useCallback(async (chapter) => {
    setSelectedChapter(chapter);
    setPage('reader');
    if (userId && selectedNovel) {
        const newLastReadData = {
            ...(lastReadData || {}),
            [selectedNovel.id]: {
                novelId: selectedNovel.id,
                chapterId: chapter.id,
                timestamp: new Date().toISOString()
            }
        };
        setLastReadData(newLastReadData);
        await updateUserDoc({ lastRead: newLastReadData });
    }
  }, [userId, selectedNovel, lastReadData, updateUserDoc]);

  const handleSelectNovel = (novel) => { setSelectedNovel(novel); setPage('details'); };
  const handleGenreSelect = (genre) => { setGenreFilter(genre); setPage('list'); setActiveTab('library'); };
  const handleClearGenreFilter = () => { setGenreFilter(null); };

  const handleToggleBookmark = useCallback(async (novelId) => {
    const newBookmarks = bookmarks.includes(novelId)
      ? bookmarks.filter(id => id !== novelId)
      : [...bookmarks, novelId];
    setBookmarks(newBookmarks);
    await updateUserDoc({ bookmarks: newBookmarks });
  }, [bookmarks, updateUserDoc]);

  const bookmarkedNovels = useMemo(() => {
    if (!novels || novels.length === 0 || !bookmarks) return [];
    return novels.filter(novel => bookmarks.includes(novel.id));
  }, [novels, bookmarks]);

  const handleGetSubscription = () => {
    setIsSubModalOpen(true);
  }

  const handlePlanSelect = (plan) => {
      setSelectedPlan(plan);
      setIsSubModalOpen(false);
  };

  const handlePaymentMethodSelect = async (method) => {
      const tg = window.Telegram?.WebApp;
      if (method === 'boosty') {
          if (!auth.currentUser) return;
          const firebase_uid = auth.currentUser.uid;
          const botUsername = "tenebrisverbot";

          try {
              const userDocRef = doc(db, "users", firebase_uid);
              await setDoc(userDocRef, {
                  pendingSubscription: {
                      name: selectedPlan.name,
                      price: selectedPlan.price,
                      method: 'boosty',
                      duration: selectedPlan.duration,
                  }
              }, { merge: true });

              const link = `https://t.me/${botUsername}?start=${firebase_uid}`;
              if (tg) {
                  tg.openTelegramLink(link);
              } else {
                  window.open(link, '_blank');
              }
              setSelectedPlan(null);
              setIsSubModalOpen(false);

          } catch (error) {
              console.error("Ошибка при создании заявки на оплату Boosty:", error);
          }
          return;
      }

      if (!tg || !userId || !selectedPlan) {
          if (tg) tg.showAlert("Произошла ошибка. Пожалуйста, попробуйте еще раз.");
          return;
      }

      tg.showConfirm(
          "Вы будете перенаправлены в бот для завершения оплаты...",
          async (confirmed) => {
              if (!confirmed) return;
              const userDocRef = doc(db, "users", userId);
              try {
                  await setDoc(userDocRef, {
                      pendingSubscription: { ...selectedPlan, method: method, date: new Date().toISOString() }
                  }, { merge: true });
                  tg.openTelegramLink(`https://t.me/${BOT_USERNAME}?start=${userId}`);
                  tg.close();
              } catch (error) {
                  console.error("Ошибка записи в Firebase:", error);
                  tg.showAlert("Не удалось сохранить ваш выбор. Попробуйте снова.");
              }
          }
      );
  };

  // --- Условия рендеринга ---
  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <AuthScreen auth={auth} />;
  }

  // --- Функция для выбора, что отображать ---
  const renderContent = () => {
    if (page === 'details') {
      return <NovelDetails
                novel={selectedNovel}
                onSelectChapter={handleSelectChapter}
                onGenreSelect={handleGenreSelect}
                subscription={subscription}
                botUsername={BOT_USERNAME}
                userId={userId}
                chapters={chapters}
                isLoadingChapters={isLoadingChapters}
                lastReadData={lastReadData}
                onBack={handleBack}
              />;
    }
    if (page === 'reader') {
      return <ChapterReader
                chapter={selectedChapter}
                novel={selectedNovel}
                fontSize={fontSize}
                onFontSizeChange={handleTextSizeChange}
                userId={userId}
                userName={user?.displayName || 'Аноним'}
                currentFontClass={fontClass}
                onSelectChapter={handleSelectChapter}
                allChapters={chapters}
                subscription={subscription}
                botUsername={BOT_USERNAME}
                onBack={handleBack}
                isUserAdmin={isUserAdmin}
              />;
    }

    switch (activeTab) {
      case 'library':
        return (
          <>
            <Header title="Библиотека" />
            <NewsSlider onReadMore={setSelectedNews} />
            {genreFilter && (
                <div className="flex items-center justify-between p-3 mx-4 mb-0 rounded-lg border border-border-color bg-component-bg text-text-main">
                    <p className="text-sm"><span className="opacity-70">Жанр:</span><strong className="ml-2">{genreFilter}</strong></p>
                    <button onClick={handleClearGenreFilter} className="text-xs font-bold text-accent hover:underline">Сбросить</button>
                </div>
            )}
            <NovelList novels={novels.filter(n => !genreFilter || (n.genres && n.genres.includes(genreFilter)))} onSelectNovel={handleSelectNovel} bookmarks={bookmarks} onToggleBookmark={handleToggleBookmark} />
          </>
        )
      case 'search':
        return <SearchPage novels={novels} onSelectNovel={handleSelectNovel} bookmarks={bookmarks} onToggleBookmark={handleToggleBookmark} />
      case 'bookmarks':
        return <BookmarksPage novels={bookmarkedNovels} onSelectNovel={handleSelectNovel} bookmarks={bookmarks} onToggleBookmark={handleToggleBookmark} />
      case 'profile':
        return <ProfilePage user={user} subscription={subscription} onGetSubscriptionClick={handleGetSubscription} userId={userId} auth={auth} onThemeToggle={handleThemeToggle} currentTheme={theme}/>
      default:
        return <Header title="Библиотека" />
    }
  };

  // --- Финальный рендеринг всего приложения ---
  return (
    <main className={`bg-background min-h-screen font-sans text-text-main ${!isUserAdmin ? 'no-select' : ''}`}>
        <div className="pb-20">
            {renderContent()}
        </div>
        {page === 'list' && (
            <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
        )}
        {isSubModalOpen && <SubscriptionModal onClose={() => setIsSubModalOpen(false)} onSelectPlan={handlePlanSelect} />}
        {selectedPlan && <PaymentMethodModal onClose={() => setSelectedPlan(null)} onSelectMethod={handlePaymentMethodSelect} plan={selectedPlan} />}
        {selectedNews && <NewsModal newsItem={selectedNews} onClose={() => setSelectedNews(null)} />}
    </main>
  );
}
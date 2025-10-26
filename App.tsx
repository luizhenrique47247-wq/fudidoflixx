
import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header.tsx';
import SplashScreen from './components/SplashScreen.tsx';
import Discover from './pages/Discover.tsx';
import GridPage from './pages/GridPage.tsx';
import MyList from './pages/MyList.tsx';
import Lucky from './pages/Lucky.tsx';
import DetailsModal from './components/DetailsModal.tsx';
import { Page } from './types.ts';
import SearchResults from './pages/SearchResults.tsx';
import MobileNav from './components/MobileNav.tsx';
import SurpriseMeModal from './components/SurpriseMeModal.tsx';
import RoletaGame from './pages/RoletaGame.tsx';
import MatchGame from './pages/MatchGame.tsx';

const App: React.FC = () => {
    const [showSplash, setShowSplash] = useState<boolean>(true);
    const [appReady, setAppReady] = useState<boolean>(false);
    const [currentPage, setCurrentPage] = useState<Page>('discover');
    const [searchQuery, setSearchQuery] = useState<string>('');

    const [selectedMedia, setSelectedMedia] = useState<{ id: number; type: 'movie' | 'tv' } | null>(null);
    const [isMobileNavOpen, setIsMobileNavOpen] = useState<boolean>(false);
    const [isSurpriseModalOpen, setIsSurpriseModalOpen] = useState<boolean>(false);

    useEffect(() => {
        const timer = setTimeout(() => handleStartApp(), 5000); // Failsafe if video stalls
        return () => clearTimeout(timer);
    }, []);

    const handleStartApp = () => {
        if (appReady) return;
        setShowSplash(false);
        setTimeout(() => setAppReady(true), 700); // Match splash screen fade-out
    };

    const handleNavigate = useCallback((page: Page) => {
        setCurrentPage(page);
        setIsMobileNavOpen(false);
        window.scrollTo(0, 0);
        if (page !== 'search') {
            setSearchQuery('');
        }
    }, []);

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        setCurrentPage('search');
    };

    const openDetailsModal = (media: { id: number; type: 'movie' | 'tv' }) => {
        setSelectedMedia(media);
    };

    const closeDetailsModal = () => {
        setSelectedMedia(null);
    };
    
    const renderPage = () => {
        switch (currentPage) {
            case 'discover':
                return <Discover onSelectMedia={openDetailsModal} />;
            case 'movie':
                return <GridPage type="movie" onSelectMedia={openDetailsModal} />;
            case 'tv':
                return <GridPage type="tv" onSelectMedia={openDetailsModal} />;
            case 'animes':
                 return <GridPage type="animes" onSelectMedia={openDetailsModal} />;
            case 'my-list':
                return <MyList onSelectMedia={openDetailsModal} />;
            case 'lucky':
                return <Lucky onNavigate={handleNavigate} onOpenSurprise={() => setIsSurpriseModalOpen(true)} />;
            case 'roleta':
                return <RoletaGame onNavigate={handleNavigate} onSelectMedia={openDetailsModal} />;
            case 'match':
                return <MatchGame onNavigate={handleNavigate} onSelectMedia={openDetailsModal} />;
            case 'search':
                return <SearchResults query={searchQuery} onSelectMedia={openDetailsModal} />;
            default:
                return <Discover onSelectMedia={openDetailsModal} />;
        }
    };

    return (
        <>
            <SplashScreen isVisible={showSplash} onVideoEnd={handleStartApp} onSkip={handleStartApp} />
            
            <div className={`transition-opacity duration-1000 ${appReady ? 'opacity-100' : 'opacity-0'}`}>
                <Header 
                    currentPage={currentPage} 
                    onNavigate={handleNavigate} 
                    onSearch={handleSearch}
                    onToggleMobileNav={() => setIsMobileNavOpen(!isMobileNavOpen)}
                    isMobileNavOpen={isMobileNavOpen}
                />
                <MobileNav 
                    isOpen={isMobileNavOpen}
                    onClose={() => setIsMobileNavOpen(false)}
                    onNavigate={handleNavigate}
                    currentPage={currentPage}
                />
                <main className="pt-24 px-4 md:px-10 pb-10 min-h-screen">
                    {appReady && renderPage()}
                </main>
            </div>
            
            {selectedMedia && (
                <DetailsModal
                    mediaId={selectedMedia.id}
                    mediaType={selectedMedia.type}
                    isOpen={!!selectedMedia}
                    onClose={closeDetailsModal}
                    onSelectMedia={openDetailsModal}
                />
            )}

            <SurpriseMeModal
                isOpen={isSurpriseModalOpen}
                onClose={() => setIsSurpriseModalOpen(false)}
                onSurpriseFound={(media) => {
                    setIsSurpriseModalOpen(false);
                    openDetailsModal(media);
                }}
            />
        </>
    );
};

export default App;
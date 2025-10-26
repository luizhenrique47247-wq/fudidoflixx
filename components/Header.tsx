import React, { useState, useEffect, useRef } from 'react';
import { Page } from '../types';

interface HeaderProps {
    currentPage: Page;
    onNavigate: (page: Page) => void;
    onSearch: (query: string) => void;
    onToggleMobileNav: () => void;
    isMobileNavOpen: boolean;
}

const NavLink: React.FC<{ page: Page; currentPage: Page; onNavigate: (page: Page) => void; children: React.ReactNode }> = ({ page, currentPage, onNavigate, children }) => (
    <a
        href="#"
        onClick={(e) => { e.preventDefault(); onNavigate(page); }}
        className={`nav-link text-base sm:text-lg hover:text-gray-300 transition-colors ${currentPage === page ? 'font-bold text-white' : 'font-normal text-gray-400'}`}
    >
        {children}
    </a>
);

const Header: React.FC<HeaderProps> = ({ currentPage, onNavigate, onSearch, onToggleMobileNav, isMobileNavOpen }) => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isSearchActive, setIsSearchActive] = useState(false);
    const searchContainerRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const searchTimeout = useRef<number>();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);
    
    useEffect(() => {
      if (currentPage !== 'search' && searchInputRef.current) {
        searchInputRef.current.value = '';
        setIsSearchActive(false);
      }
    }, [currentPage]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
                if (searchInputRef.current?.value.trim() === '') {
                    setIsSearchActive(false);
                }
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearchIconClick = () => {
        setIsSearchActive(true);
        setTimeout(() => searchInputRef.current?.focus(), 300);
    };

    const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (searchTimeout.current) {
            clearTimeout(searchTimeout.current);
        }
        const query = e.target.value;
        searchTimeout.current = window.setTimeout(() => {
            if (query.trim() !== '') {
                onSearch(query);
            } else if (currentPage === 'search') {
                onNavigate('discover');
            }
        }, 500);
    };

    return (
        <header className={`fixed top-0 left-0 right-0 p-4 md:p-6 flex justify-between items-center z-40 transition-all duration-300 ${isScrolled || isMobileNavOpen || isSearchActive ? 'bg-black bg-opacity-90' : 'bg-transparent'}`}>
            <div className="flex items-center space-x-4 md:space-x-8">
                <h1 onClick={() => onNavigate('discover')} className="text-2xl sm:text-3xl font-bold text-netflix-red uppercase tracking-wider cursor-pointer">
                    FudidoFlix
                </h1>
                <nav className="hidden md:flex items-center space-x-4 sm:space-x-6">
                    <NavLink page="discover" currentPage={currentPage} onNavigate={onNavigate}>Início</NavLink>
                    <NavLink page="tv" currentPage={currentPage} onNavigate={onNavigate}>Séries</NavLink>
                    <NavLink page="movie" currentPage={currentPage} onNavigate={onNavigate}>Filmes</NavLink>
                    <NavLink page="animes" currentPage={currentPage} onNavigate={onNavigate}>Animes</NavLink>
                    <NavLink page="my-list" currentPage={currentPage} onNavigate={onNavigate}>Minha Lista</NavLink>
                    <NavLink page="lucky" currentPage={currentPage} onNavigate={onNavigate}>
                        <div className="flex items-center gap-2"><i className="fas fa-dice"></i> Sorte</div>
                    </NavLink>
                </nav>
            </div>
            <div className="flex items-center space-x-4">
                <div ref={searchContainerRef} className="relative flex items-center justify-end">
                    <input
                        ref={searchInputRef}
                        type="text"
                        placeholder="Procurar..."
                        onChange={handleSearchInput}
                        className={`bg-black bg-opacity-70 text-white rounded-md focus:outline-none focus:ring-1 focus:ring-white transition-all duration-300 ease-in-out ${isSearchActive ? 'w-40 sm:w-64 opacity-100 py-1 px-3 border border-gray-600' : 'w-0 opacity-0 p-0 border-transparent'}`}
                    />
                    <button onClick={handleSearchIconClick} className="p-2 text-lg text-white">
                        <i className="fas fa-search"></i>
                    </button>
                </div>
                <div className="md:hidden">
                    <button onClick={onToggleMobileNav} className="text-white text-2xl focus:outline-none">
                        <i className="fas fa-bars"></i>
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;

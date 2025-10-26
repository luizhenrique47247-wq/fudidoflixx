
import React from 'react';
import { Page } from '../types';

interface MobileNavProps {
    isOpen: boolean;
    onClose: () => void;
    onNavigate: (page: Page) => void;
    currentPage: Page;
}

const NavLink: React.FC<{ page: Page; onNavigate: (page: Page) => void; children: React.ReactNode }> = ({ page, onNavigate, children }) => (
    <a
        href="#"
        onClick={(e) => {
            e.preventDefault();
            onNavigate(page);
        }}
        className="nav-link text-lg p-4 rounded-md hover:bg-gray-800 transition-colors"
    >
        {children}
    </a>
);


const MobileNav: React.FC<MobileNavProps> = ({ isOpen, onClose, onNavigate, currentPage }) => {
    return (
        <>
            <div
                className={`fixed inset-0 bg-black bg-opacity-70 z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
            ></div>
            <div
                className={`fixed top-0 left-0 h-full w-64 bg-[#101010] z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
            >
                <div className="p-4 flex justify-between items-center border-b border-gray-700">
                    <h2 className="text-xl font-bold text-netflix-red uppercase">Navegar</h2>
                    <button onClick={onClose} className="text-2xl text-gray-400 hover:text-white">&times;</button>
                </div>
                <nav className="flex flex-col p-4 space-y-2">
                    <NavLink page="discover" onNavigate={onNavigate}>Início</NavLink>
                    <NavLink page="tv" onNavigate={onNavigate}>Séries</NavLink>
                    <NavLink page="movie" onNavigate={onNavigate}>Filmes</NavLink>
                    <NavLink page="animes" onNavigate={onNavigate}>Animes</NavLink>
                    <NavLink page="my-list" onNavigate={onNavigate}>Minha Lista</NavLink>
                    <NavLink page="lucky" onNavigate={onNavigate}>
                        <div className="flex items-center gap-3"><i className="fas fa-dice w-6 text-center"></i> Sorte</div>
                    </NavLink>
                </nav>
            </div>
        </>
    );
};

export default MobileNav;

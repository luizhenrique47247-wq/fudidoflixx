import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Page, RoletaItem } from '../types';
import { searchMedia } from '../services/tmdbService';
import { IMG_W500_URL } from '../constants';
import Confetti from '../components/Confetti';
import Loader from '../components/Loader';

interface RoletaGameProps {
    onNavigate: (page: Page) => void;
    onSelectMedia: (media: { id: number, type: 'movie' | 'tv' }) => void;
}

const RoletaGame: React.FC<RoletaGameProps> = ({ onNavigate, onSelectMedia }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [items, setItems] = useState<RoletaItem[]>([]);
    const [isSpinning, setIsSpinning] = useState(false);
    const [winner, setWinner] = useState<RoletaItem | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<RoletaItem[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    const colors = ["#b91c1c", "#991b1b", "#7f1d1d", "#dc2626", "#f87171", "#ef4444"];
    
    const drawWheel = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const numSegments = items.length;
        const radius = canvas.width / 2;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (numSegments === 0) return;

        const angleStep = (2 * Math.PI) / numSegments;
        ctx.strokeStyle = '#141414';
        ctx.lineWidth = 4;

        items.forEach((item, i) => {
            const angle = i * angleStep;
            ctx.fillStyle = colors[i % colors.length];
            ctx.beginPath();
            ctx.moveTo(radius, radius);
            ctx.arc(radius, radius, radius - 2, angle, angle + angleStep);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            ctx.save();
            ctx.translate(radius, radius);
            ctx.rotate(angle + angleStep / 2);
            ctx.fillStyle = 'white';
            ctx.font = 'bold 12px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(item.title.length > 20 ? item.title.substring(0, 18) + '...' : item.title, radius * 0.65, 0);
            ctx.restore();
        });
    }, [items, colors]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const container = canvas.parentElement;
        if (!container) return;
        const size = Math.min(container.clientWidth, 480);
        canvas.width = size;
        canvas.height = size;
        drawWheel();
    }, [drawWheel]);

    useEffect(() => {
        const handler = setTimeout(async () => {
            if (searchQuery.trim() !== '') {
                setIsSearching(true);
                const data = await searchMedia(searchQuery);
                const validResults = (data?.results || [])
                    .filter(r => (r.media_type === 'movie' || r.media_type === 'tv') && r.poster_path)
                    .map(r => ({ id: r.id, title: r.title || r.name || 'Unknown', poster_path: r.poster_path || '', media_type: r.media_type }));
                setSearchResults(validResults.slice(0, 5));
                setIsSearching(false);
            } else {
                setSearchResults([]);
            }
        }, 300);
        return () => clearTimeout(handler);
    }, [searchQuery]);
    
    const addItem = (item: RoletaItem) => {
        if (!items.some(i => i.id === item.id)) {
            setItems(prev => [...prev, item]);
        }
        setSearchQuery('');
        setSearchResults([]);
    };
    
    const removeItem = (id: number) => {
        setItems(prev => prev.filter(i => i.id !== id));
    };

    const handleSpin = () => {
        if (isSpinning || items.length < 2) return;
        setIsSpinning(true);
        const canvas = canvasRef.current;
        if (!canvas) return;

        const randomSpins = Math.floor(Math.random() * 5) + 5; // 5 to 10 full spins
        const randomExtraAngle = Math.random() * 360;
        const totalRotation = (360 * randomSpins) + randomExtraAngle;
        
        const currentRotation = parseFloat(canvas.style.transform.replace(/[^0-9-.]/g, '')) || 0;
        const newRotation = currentRotation + totalRotation;

        canvas.style.transition = `transform 10s cubic-bezier(0.22, 1, 0.36, 1)`;
        canvas.style.transform = `rotate(${newRotation}deg)`;

        setTimeout(() => {
            const finalAngle = newRotation % 360;
            const anglePerSegment = 360 / items.length;
            const correctedAngle = ((270 - finalAngle) % 360 + 360) % 360;
            const winningIndex = Math.floor(correctedAngle / anglePerSegment);
            
            setWinner(items[winningIndex]);
            setIsModalOpen(true);
        }, 10000);
    };
    
    const closeModal = () => {
        setIsModalOpen(false);
        setIsSpinning(false);
        setWinner(null);
    }

    return (
        <div className="animate-fadeIn roleta-body">
            <header className="text-center mb-8 relative">
                <button onClick={() => onNavigate('lucky')} className="absolute top-0 left-0 text-gray-400 hover:text-white transition-colors text-lg">
                    <i className="fas fa-arrow-left mr-2"></i> Voltar
                </button>
                <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-700 mb-2">Roleta Cinéfila</h1>
                <p className="text-lg text-gray-400">Adicione itens e deixe a sorte escolher.</p>
            </header>
            <main className="flex flex-col lg:flex-row gap-10 items-center justify-center">
                <div className="flex flex-col items-center">
                    <div className="wheel-container">
                        <div className="pointer"></div>
                        <canvas ref={canvasRef} className="roleta-canvas"></canvas>
                        <button onClick={handleSpin} disabled={isSpinning || items.length < 2} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-netflix-secondary border-4 border-netflix-red text-white font-bold rounded-full text-lg shadow-lg transition-all duration-300 transform hover:scale-105 disabled:bg-gray-800 disabled:border-gray-600 disabled:text-gray-500 disabled:cursor-not-allowed z-20">
                            GIRAR
                        </button>
                    </div>
                </div>
                <div className="w-full lg:max-w-md bg-netflix-secondary p-6 rounded-2xl shadow-2xl border border-gray-700">
                    <h2 className="text-2xl font-semibold mb-4 border-b-2 border-gray-700 pb-2">Itens na Roleta ({items.length})</h2>
                    <div className="relative">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Pesquisar filme/série..."
                            className="w-full bg-gray-800 text-white placeholder-gray-500 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-netflix-red border border-gray-700"
                        />
                        {searchResults.length > 0 && (
                            <div className="absolute top-full left-0 right-0 bg-gray-800 border border-gray-600 rounded-b-lg z-30 max-h-60 overflow-y-auto">
                                {isSearching ? <Loader size="w-6 h-6"/> : searchResults.map(item => (
                                    <div key={item.id} onClick={() => addItem(item)} className="p-2 hover:bg-gray-700 cursor-pointer flex items-center gap-3">
                                        <img src={`${IMG_W500_URL}${item.poster_path}`} className="w-10 rounded" alt={item.title}/>
                                        <p className="font-semibold">{item.title}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col gap-2 h-64 overflow-y-auto pr-2 mt-4">
                        {items.map(item => (
                            <div key={item.id} className="bg-gray-800 text-white py-2 px-3 rounded-lg flex items-center justify-between gap-2">
                                <span className="truncate">{item.title}</span>
                                <button onClick={() => removeItem(item.id)} disabled={isSpinning} className="text-red-400 hover:text-red-500 font-bold text-xl leading-none disabled:opacity-50">&times;</button>
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            {/* Winner Modal */}
            {isModalOpen && winner && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                    {winner && <Confetti />}
                    <div className="modal-pop bg-netflix-secondary p-8 rounded-2xl shadow-2xl text-center max-w-md w-full mx-4 border-2 border-netflix-red">
                        <h2 className="text-xl text-gray-300 mb-2">O item sorteado é...</h2>
                        <div className="my-4">
                            <img src={`${IMG_W500_URL}${winner.poster_path}`} alt={winner.title} className="w-48 mx-auto rounded-lg shadow-lg mb-4" />
                            <p className="text-4xl font-bold text-netflix-red">{winner.title}</p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button onClick={() => onSelectMedia({ id: winner.id, type: winner.media_type })} className="btn-netflix-red font-bold py-2 px-6 rounded-lg">Ver Detalhes</button>
                            <button onClick={closeModal} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-lg">Fechar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RoletaGame;

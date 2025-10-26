import React, { useState, useEffect, useMemo } from 'react';
import { Page, MatchState, Genre, MediaItem } from '../types';
import { getMovieGenres, getTvGenres, getDiscoverMedia } from '../services/tmdbService';
import Loader from '../components/Loader';
import { IMG_W500_URL, NO_POSTER_URL } from '../constants';
import Confetti from '../components/Confetti';
import MediaCard from '../components/MediaCard';

interface MatchGameProps {
    onNavigate: (page: Page) => void;
    onSelectMedia: (media: { id: number, type: 'movie' | 'tv' }) => void;
}

const initialState: MatchState = {
    phase: 'selection',
    options: [],
    player1Likes: new Set(),
    player2Likes: new Set(),
    currentCardIndex: 0,
    currentPlayer: 1,
    mediaType: 'movie',
    genre: 'all',
};

const MatchGame: React.FC<MatchGameProps> = ({ onNavigate, onSelectMedia }) => {
    const [gameState, setGameState] = useState<MatchState>(initialState);
    const [genres, setGenres] = useState<Genre[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isResultModalOpen, setIsResultModalOpen] = useState(false);
    const matchedItems = useMemo(() => {
        if (gameState.phase !== 'results') return [];
        const finalMatches = [...gameState.player1Likes].filter(id => gameState.player2Likes.has(id));
        return gameState.options.filter(item => finalMatches.includes(item.id));
    }, [gameState]);


    useEffect(() => {
        const fetchAllGenres = async () => {
            const [movieData, tvData] = await Promise.all([getMovieGenres(), getTvGenres()]);
            const allGenres = [...(movieData?.genres || []), ...(tvData?.genres || [])];
            const uniqueGenres = Array.from(new Map(allGenres.map(item => [item.id, item])).values())
                .sort((a, b) => a.name.localeCompare(b.name));
            setGenres(uniqueGenres);
        };
        fetchAllGenres();
    }, []);

    const handleStartGame = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const pagesToFetch = [Math.floor(Math.random() * 5) + 1, Math.floor(Math.random() * 5) + 6];
        const [data1, data2] = await Promise.all([
            getDiscoverMedia(gameState.mediaType, pagesToFetch[0], gameState.genre, 'popularity.desc'),
            getDiscoverMedia(gameState.mediaType, pagesToFetch[1], gameState.genre, 'popularity.desc'),
        ]);

        let allResults = [...(data1?.results || []), ...(data2?.results || [])];
        const validResults = allResults.filter(item => item.poster_path);
        
        for (let i = validResults.length - 1; i > 0; i--) { // Shuffle
            const j = Math.floor(Math.random() * (i + 1));
            [validResults[i], validResults[j]] = [validResults[j], validResults[i]];
        }
        
        setGameState(prev => ({
            ...prev,
            options: validResults.slice(0, 20),
            phase: 'player1'
        }));
        setIsLoading(false);
    };

    const handleDecision = (decision: 'like' | 'pass') => {
        const likedItemId = gameState.options[gameState.currentCardIndex].id;
        const currentLikes = gameState.currentPlayer === 1 ? gameState.player1Likes : gameState.player2Likes;
        if (decision === 'like') {
            currentLikes.add(likedItemId);
        }

        const nextCardIndex = gameState.currentCardIndex + 1;
        if (nextCardIndex >= gameState.options.length) {
            if (gameState.currentPlayer === 1) {
                setGameState(prev => ({ ...prev, phase: 'transition' }));
            } else {
                setGameState(prev => ({ ...prev, phase: 'results' }));
                setIsResultModalOpen(true);
            }
        } else {
            setGameState(prev => ({ ...prev, currentCardIndex: nextCardIndex }));
        }
    };
    
    const startPlayer2 = () => {
      setGameState(prev => ({
        ...prev,
        phase: 'player2',
        currentPlayer: 2,
        currentCardIndex: 0,
      }));
    };

    const playAgain = () => {
        setIsResultModalOpen(false);
        setGameState(initialState);
    };

    const renderContent = () => {
        switch (gameState.phase) {
            case 'selection': return <SelectionScreen onSubmit={handleStartGame} genres={genres} setGameState={setGameState} isLoading={isLoading} onNavigate={onNavigate} />;
            case 'player1':
            case 'player2': return <GameScreen state={gameState} onDecision={handleDecision} />;
            case 'transition': return <TransitionScreen onNext={startPlayer2} />;
            case 'results': return <GameScreen state={gameState} onDecision={() => {}} />; // Show last card faded out
        }
    };

    return (
        <div className="animate-fadeIn match-game-body flex flex-col items-center justify-center">
            {renderContent()}
            {isResultModalOpen && (
                 <div className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    {matchedItems.length > 0 && <Confetti />}
                    <div className="modal-pop bg-netflix-secondary p-8 rounded-2xl shadow-2xl text-center max-w-4xl w-full mx-4 border-2 border-netflix-red relative">
                        <button onClick={playAgain} className="absolute top-4 right-4 text-white bg-black bg-opacity-60 rounded-full w-8 h-8 flex items-center justify-center text-xl z-20">&times;</button>
                        <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-600 mb-2">
                           {matchedItems.length > 0 ? "Deu Match!" : "Sem Matches!"}
                        </h2>
                        <p className="text-lg text-gray-400 mb-8">{matchedItems.length > 0 ? "Vocês dois gostaram destes títulos:" : "Que pena! Vocês não combinaram em nada."}</p>
                        <div className="max-h-[50vh] overflow-y-auto px-4">
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {matchedItems.map(item => <MediaCard key={item.id} media={item} onSelect={onSelectMedia} isGridItem />)}
                            </div>
                        </div>
                        <button onClick={playAgain} className="mt-8 bg-gray-700 hover:bg-gray-600 font-bold py-3 px-8 rounded-lg text-lg">
                            Jogar Novamente
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

const SelectionScreen: React.FC<{ onSubmit: (e: React.FormEvent) => void, genres: Genre[], setGameState: React.Dispatch<React.SetStateAction<MatchState>>, isLoading: boolean, onNavigate: (page: Page) => void }> = ({ onSubmit, genres, setGameState, isLoading, onNavigate }) => (
    <div className="w-full max-w-lg">
        <button onClick={() => onNavigate('lucky')} className="text-gray-400 hover:text-white mb-4"><i className="fas fa-arrow-left mr-2"></i> Voltar</button>
        <div className="bg-netflix-secondary p-8 rounded-lg shadow-2xl">
            <div className="text-center mb-6">
                <h2 className="text-3xl font-bold">Match de Filmes</h2>
                <p className="text-gray-400 mt-2">Escolham suas preferências para começar.</p>
            </div>
            <form onSubmit={onSubmit}>
                <div className="mb-6">
                    <h3 className="font-semibold mb-3 text-lg">Tipo de Mídia</h3>
                    <div className="flex gap-4">
                       {['movie', 'tv'].map(type => (
                           <label key={type} className="flex-1 p-4 bg-gray-800 rounded-lg cursor-pointer border-2 border-gray-700 has-[:checked]:border-netflix-red transition-all">
                               <input type="radio" name="match_media_type" value={type} className="sr-only" defaultChecked={type === 'movie'} onChange={(e) => setGameState(p => ({...p, mediaType: e.target.value as 'movie' | 'tv'}))} />
                               <span className="font-bold text-center block capitalize">{type === 'movie' ? 'Filmes' : 'Séries'}</span>
                           </label>
                       ))}
                    </div>
                </div>
                <div className="mb-8">
                    <label htmlFor="match-genre-select" className="font-semibold mb-3 text-lg block">Gênero</label>
                    <select id="match-genre-select" onChange={e => setGameState(p => ({...p, genre: e.target.value}))} className="bg-[#141414] border border-gray-500 text-white p-2 rounded-md font-medium cursor-pointer hover:border-white focus:outline-none focus:ring-2 focus:ring-netflix-red w-full">
                        <option value="all">Todos os Gêneros</option>
                        {genres.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                    </select>
                </div>
                <button type="submit" disabled={isLoading} className="w-full btn-netflix-red font-bold py-3 rounded-lg text-lg disabled:opacity-50">
                    {isLoading ? <Loader size="w-6 h-6" border="border-2"/> : "Começar Jogo"}
                </button>
            </form>
        </div>
    </div>
);

const GameScreen: React.FC<{ state: MatchState, onDecision: (d: 'like' | 'pass') => void }> = ({ state, onDecision }) => {
    const [cardStates, setCardStates] = useState<{ [key: number]: { x: number; rot: number; decision?: 'like' | 'pass' } }>({});

    const handleDragStart = (e: React.PointerEvent, index: number) => {
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
    };
    
    const handleDragMove = (e: React.PointerEvent, index: number) => {
        if (!(e.target as HTMLElement).hasPointerCapture(e.pointerId)) return;
        setCardStates(prev => ({ ...prev, [index]: { x: e.clientX - window.innerWidth / 2, rot: (e.clientX - window.innerWidth / 2) * 0.1 } }));
    };
    
    const handleDragEnd = (e: React.PointerEvent, index: number) => {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
        const endX = e.clientX - window.innerWidth / 2;
        if (Math.abs(endX) > 100) {
            const decision = endX > 0 ? 'like' : 'pass';
            setCardStates(prev => ({ ...prev, [index]: { x: endX * 2, rot: prev[index]?.rot || 0, decision } }));
            setTimeout(() => onDecision(decision), 300);
        } else {
            setCardStates(prev => ({ ...prev, [index]: { x: 0, rot: 0 } }));
        }
    };
    
    const handleButtonClick = (decision: 'like' | 'pass') => {
        const index = state.currentCardIndex;
        setCardStates(prev => ({ ...prev, [index]: { x: decision === 'like' ? 500 : -500, rot: decision === 'like' ? 30 : -30, decision } }));
        setTimeout(() => onDecision(decision), 300);
    };

    if (state.options.length === 0) return <Loader />;

    return (
        <>
            <div className="text-center mb-6">
                <h2 className="text-3xl font-bold">Vez do Jogador {state.currentPlayer}</h2>
                <p className="text-gray-400 mt-2 text-lg">{state.currentCardIndex + 1} / {state.options.length}</p>
            </div>
            <div className="match-card-stack mb-8">
                {state.options.map((item, index) => {
                    const isActive = index === state.currentCardIndex;
                    const isPast = index < state.currentCardIndex;
                    // FIX: Renamed local 'state' variable to 'cardState' to avoid shadowing the prop.
                    const cardState = cardStates[index] || { x: 0, rot: 0 };
                    
                    return (
                        <div
                            key={item.id}
                            className={`match-card ${isActive ? 'dragging' : ''}`}
                            style={{
                                zIndex: state.options.length - index,
                                transform: `translateX(${cardState.x}px) rotate(${cardState.rot}deg) scale(${1 - (index - state.currentCardIndex) * 0.05})`,
                                opacity: isPast ? 0 : 1,
                                top: `${(index - state.currentCardIndex) * 10}px`,
                                pointerEvents: isActive ? 'auto' : 'none',
                            }}
                            onPointerDown={e => handleDragStart(e, index)}
                            onPointerMove={e => handleDragMove(e, index)}
                            onPointerUp={e => handleDragEnd(e, index)}
                            onPointerCancel={e => handleDragEnd(e, index)}
                        >
                            <img src={item.poster_path ? `${IMG_W500_URL}${item.poster_path}` : NO_POSTER_URL} className="w-full h-full object-cover absolute inset-0" alt={item.title || item.name} />
                            <div className="match-card-overlay"></div>
                            <div className="absolute bottom-0 left-0 p-6">
                                <h3 className="text-3xl font-bold match-card-title">{item.title || item.name}</h3>
                            </div>
                            <div className="match-card-choice like" style={{ opacity: cardState.x > 20 ? (cardState.x / 100) : 0 }}>Like</div>
                            <div className="match-card-choice pass" style={{ opacity: cardState.x < -20 ? (-cardState.x / 100) : 0 }}>Passa</div>
                        </div>
                    );
                })}
            </div>
            <div className="flex items-center gap-8">
                <button onClick={() => handleButtonClick('pass')} className="match-action-button pass"><i className="fas fa-times"></i></button>
                <button onClick={() => handleButtonClick('like')} className="match-action-button like"><i className="fas fa-heart"></i></button>
            </div>
        </>
    );
};

const TransitionScreen: React.FC<{ onNext: () => void }> = ({ onNext }) => (
    <div className="text-center">
        <h2 className="text-4xl font-bold mb-4">Fim do turno do Jogador 1!</h2>
        <p className="text-xl text-gray-400 mb-8">Passe o dispositivo para o Jogador 2.</p>
        <button onClick={onNext} className="btn-netflix-red font-bold py-3 px-8 rounded-lg text-lg">
            Começar Turno do Jogador 2
        </button>
    </div>
);

export default MatchGame;
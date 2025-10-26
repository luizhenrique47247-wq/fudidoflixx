
import React, { useState, useEffect } from 'react';
import { Genre, MediaItem } from '../types.ts';
import { getMovieGenres, getTvGenres, getRandomMedia } from '../services/tmdbService.ts';
import Loader from './Loader.tsx';

interface SurpriseMeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSurpriseFound: (media: { id: number, type: 'movie' | 'tv' }) => void;
}

const SurpriseMeModal: React.FC<SurpriseMeModalProps> = ({ isOpen, onClose, onSurpriseFound }) => {
    const [genres, setGenres] = useState<Genre[]>([]);
    const [choice, setChoice] = useState<'random' | 'genre'>('random');
    const [selectedGenre, setSelectedGenre] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        const fetchAllGenres = async () => {
            const [movieData, tvData] = await Promise.all([getMovieGenres(), getTvGenres()]);
            const allGenres = [...(movieData?.genres || []), ...(tvData?.genres || [])];
            const uniqueGenres = Array.from(new Map(allGenres.map(item => [item.id, item])).values())
                .sort((a, b) => a.name.localeCompare(b.name));
            setGenres(uniqueGenres);
            if (uniqueGenres.length > 0) {
                setSelectedGenre(uniqueGenres[0].id.toString());
            }
        };
        if (isOpen) {
            fetchAllGenres();
        }
    }, [isOpen]);

    const handleFindSurprise = async () => {
        setIsLoading(true);
        setError('');
        let foundMedia: MediaItem | null = null;
        for (let i = 0; i < 5; i++) { // Try up to 5 times
            const mediaType = Math.random() < 0.6 ? 'movie' : 'tv';
            const genreToUse = choice === 'genre' ? selectedGenre : undefined;
            const media = await getRandomMedia(mediaType, genreToUse);
            if (media) {
                foundMedia = media;
                break;
            }
        }
        setIsLoading(false);
        if (foundMedia) {
            onSurpriseFound({ id: foundMedia.id, type: foundMedia.media_type });
        } else {
            setError('Não foi possível encontrar uma surpresa. Tente novamente!');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-netflix-secondary rounded-lg p-6 sm:p-8 w-11/12 max-w-lg relative shadow-2xl modal-pop" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold flex items-center gap-3"><i className="fas fa-dice text-netflix-red"></i> Surpreenda-me</h3>
                    <button onClick={onClose} className="text-2xl text-gray-400 hover:text-white">&times;</button>
                </div>
                <p className="text-gray-400 mb-6">Não sabe o que assistir? Deixe-nos escolher para você.</p>
                <div className="space-y-4">
                    <RadioOption id="random" value="random" label="Totalmente Aleatório" description="Um filme ou série popular de qualquer gênero." choice={choice} setChoice={setChoice} icon="fa-random" />
                    <RadioOption id="genre" value="genre" label="Escolher por Gênero" description="Selecione um gênero para a surpresa." choice={choice} setChoice={setChoice} icon="fa-masks-theater" />
                </div>
                <div className={`overflow-hidden transition-all duration-500 ease-in-out ${choice === 'genre' ? 'max-h-40 mt-4' : 'max-h-0'}`}>
                    <select
                        value={selectedGenre}
                        onChange={e => setSelectedGenre(e.target.value)}
                        className="bg-[#141414] border border-gray-500 text-white p-2 rounded-md font-medium cursor-pointer hover:border-white focus:outline-none focus:ring-2 focus:ring-netflix-red w-full"
                    >
                        {genres.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                    </select>
                </div>
                 <p className="text-netflix-red text-center mt-4 h-4">{error}</p>
                <div className="mt-4">
                    <button onClick={handleFindSurprise} disabled={isLoading} className="w-full flex justify-center items-center gap-2 px-6 py-3 rounded-lg font-semibold text-lg btn-netflix-red disabled:opacity-50">
                        {isLoading ? <Loader size="w-6 h-6" border="border-2" /> : 'Encontrar Surpresa'}
                    </button>
                </div>
            </div>
        </div>
    );
};

interface RadioOptionProps {
    id: string; value: 'random' | 'genre'; label: string; description: string;
    choice: 'random' | 'genre'; setChoice: (c: 'random' | 'genre') => void; icon: string;
}

const RadioOption: React.FC<RadioOptionProps> = ({ id, value, label, description, choice, setChoice, icon }) => (
    <div>
        <input type="radio" id={id} name="surprise_type" value={value} checked={choice === value} onChange={() => setChoice(value)} className="hidden peer" />
        <label htmlFor={id} className="relative flex items-center gap-4 cursor-pointer p-4 rounded-lg border-2 border-gray-700 bg-gray-800 peer-checked:border-netflix-red peer-checked:bg-gray-700 transition-all duration-300">
            <i className={`fas ${icon} text-2xl w-8 text-center text-gray-400 peer-checked:text-netflix-red`}></i>
            <div>
                <span className="font-bold text-lg">{label}</span>
                <p className="text-sm text-gray-400">{description}</p>
            </div>
        </label>
    </div>
);

export default SurpriseMeModal;
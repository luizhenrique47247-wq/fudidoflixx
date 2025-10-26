import React, { useState, useEffect } from 'react';
import { Season, SeasonDetails } from '../types';
import { getSeasonDetails } from '../services/tmdbService';
import { IMG_W500_URL, NO_POSTER_URL } from '../constants';
import Loader from './Loader';

interface PlayerEpisodePanelProps {
    isOpen: boolean;
    onClose: () => void;
    mediaId: number;
    seasons: Season[];
    currentSeason: number;
    currentEpisode: number;
    onSelectEpisode: (season: number, episode: number) => void;
}

const PlayerEpisodePanel: React.FC<PlayerEpisodePanelProps> = ({ isOpen, onClose, mediaId, seasons, currentSeason, currentEpisode, onSelectEpisode }) => {
    const [selectedSeason, setSelectedSeason] = useState(currentSeason);
    const [seasonDetails, setSeasonDetails] = useState<SeasonDetails | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchSeason(selectedSeason);
        }
    }, [isOpen, selectedSeason]);

    const fetchSeason = async (seasonNumber: number) => {
        setIsLoading(true);
        const data = await getSeasonDetails(mediaId, seasonNumber);
        setSeasonDetails(data);
        setIsLoading(false);
    };

    const handleSeasonChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedSeason(Number(e.target.value));
    };

    return (
        <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-black/80 backdrop-blur-md z-30 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'} pointer-events-auto`}>
            <div className="p-4 h-full flex flex-col">
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                    <h3 className="text-xl font-bold">Episódios</h3>
                    <select value={selectedSeason} onChange={handleSeasonChange} className="bg-gray-800 border border-gray-600 rounded p-1 text-sm">
                        {seasons.filter(s => s.season_number > 0).map(s => (
                            <option key={s.id} value={s.season_number}>{s.name}</option>
                        ))}
                    </select>
                    <button onClick={onClose} className="text-3xl text-gray-400 hover:text-white">&times;</button>
                </div>
                <div className="flex-grow overflow-y-auto">
                    {isLoading ? <Loader /> : (
                        <div className="space-y-2 pr-2">
                            {seasonDetails?.episodes.map(ep => (
                                <div
                                    key={ep.id}
                                    onClick={() => onSelectEpisode(ep.season_number, ep.episode_number)}
                                    className={`flex items-start gap-3 p-2 rounded-lg cursor-pointer ${ep.season_number === currentSeason && ep.episode_number === currentEpisode ? 'bg-netflix-red' : 'hover:bg-gray-800'}`}
                                >
                                    <img src={ep.still_path ? `${IMG_W500_URL}${ep.still_path}` : NO_POSTER_URL} alt={ep.name} className="w-28 object-cover rounded aspect-video flex-shrink-0" />
                                    <div>
                                        <h4 className="font-bold text-sm">{ep.episode_number}. {ep.name}</h4>
                                        <p className="text-xs text-gray-400 mt-1 line-clamp-2">{ep.overview}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PlayerEpisodePanel;

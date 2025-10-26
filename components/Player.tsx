import React, { useState } from 'react';
import { Season, SeasonDetails } from '../types';
import PlayerEpisodePanel from './PlayerEpisodePanel';

interface PlayerProps {
    mediaId: number;
    mediaType: 'movie' | 'tv';
    title: string;
    season?: number;
    episode?: number;
    trailerKey?: string;
    onBack: () => void;
    onPlayNext: (info: { season: number, episode: number }) => void;
    seasons: Season[];
    seasonDetails: SeasonDetails | null;
}

const Player: React.FC<PlayerProps> = ({ mediaId, mediaType, title, season, episode, trailerKey, onBack, onPlayNext, seasons, seasonDetails }) => {
    const [isPanelOpen, setIsPanelOpen] = useState(false);

    let playerUrl = '';
    let playerTitle = title;
    
    if (trailerKey) {
        playerUrl = `https://www.youtube.com/embed/${trailerKey}?autoplay=1`;
        playerTitle = `${title} (Trailer)`;
    } else if (mediaType === 'movie') {
        playerUrl = `https://vidsrc.xyz/embed/movie/${mediaId}?ds_lang=pt`;
    } else if (mediaType === 'tv' && season && episode) {
        playerUrl = `https://vidsrc.xyz/embed/tv/${mediaId}/${season}/${episode}?ds_lang=pt`;
        playerTitle = `${title} - T${season}:E${episode}`;
    }

    const currentSeasonInfo = seasons.find(s => s.season_number === season);
    const hasNextEpisode = !!(currentSeasonInfo && episode && episode < currentSeasonInfo.episode_count);

    const handleNextEpisode = () => {
        if (season && episode && hasNextEpisode) {
            onPlayNext({ season, episode: episode + 1 });
        }
    };
    
    return (
        <div className="w-full h-full relative bg-black group">
            <iframe
                key={`${mediaId}-${season}-${episode}-${trailerKey}`}
                src={playerUrl}
                className="w-full h-full border-0"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
            ></iframe>
            
            {/* Controls Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                <div className="flex justify-between items-start w-full p-4">
                    <div className="flex items-center gap-4">
                        <button onClick={onBack} className="player-control-btn pointer-events-auto">
                            <i className="fas fa-arrow-left"></i>
                        </button>
                        <h3 className="text-xl font-bold truncate">{playerTitle}</h3>
                    </div>
                    {!trailerKey && mediaType === 'tv' && (
                        <div className="flex items-center gap-4">
                            {hasNextEpisode && (
                                <button onClick={handleNextEpisode} className="player-control-btn pointer-events-auto" title="Próximo Episódio">
                                    <i className="fas fa-step-forward"></i>
                                </button>
                            )}
                            <button onClick={() => setIsPanelOpen(true)} className="player-control-btn pointer-events-auto" title="Lista de Episódios">
                                <i className="fas fa-list-ul"></i>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {mediaType === 'tv' && season && episode && (
                <PlayerEpisodePanel
                    isOpen={isPanelOpen}
                    onClose={() => setIsPanelOpen(false)}
                    mediaId={mediaId}
                    seasons={seasons}
                    currentSeason={season}
                    currentEpisode={episode}
                    onSelectEpisode={(s, e) => {
                        onPlayNext({ season: s, episode: e });
                        setIsPanelOpen(false);
                    }}
                />
            )}
        </div>
    );
};

export default Player;

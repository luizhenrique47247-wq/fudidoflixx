import React, { useState, useEffect } from 'react';
import { MediaItem, Credits, Videos, SeasonDetails } from '../types.ts';
import { getMediaDetails, getMediaCredits, getMediaVideos, getSimilarMedia, getSeasonDetails } from '../services/tmdbService.ts';
import { IMG_BASE_URL, NO_POSTER_URL, IMG_W500_URL } from '../constants.ts';
import Loader from './Loader.tsx';
import Carousel from './Carousel.tsx';
import Player from './Player.tsx';
import { useMyList } from '../hooks/useMyList.ts';

interface DetailsModalProps {
    mediaId: number;
    mediaType: 'movie' | 'tv';
    isOpen: boolean;
    onClose: () => void;
    onSelectMedia: (media: { id: number, type: 'movie' | 'tv' }) => void;
}

const DetailsModal: React.FC<DetailsModalProps> = ({ mediaId, mediaType, isOpen, onClose, onSelectMedia }) => {
    const [details, setDetails] = useState<MediaItem | null>(null);
    const [credits, setCredits] = useState<Credits | null>(null);
    const [videos, setVideos] = useState<Videos | null>(null);
    const [similar, setSimilar] = useState<MediaItem[]>([]);
    const [seasonDetails, setSeasonDetails] = useState<SeasonDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isPlayerVisible, setIsPlayerVisible] = useState(false);
    const [playerInfo, setPlayerInfo] = useState<{ season?: number; episode?: number; trailerKey?: string }>({});
    const [isExtraContentOpen, setIsExtraContentOpen] = useState(false);
    
    const { isInList, toggleMyList } = useMyList(mediaId);

    useEffect(() => {
        if (!isOpen) {
            setIsPlayerVisible(false);
            setDetails(null);
            setIsExtraContentOpen(false);
            return;
        };

        const fetchDetails = async () => {
            setIsLoading(true);
            const [detailsData, creditsData, videosData, similarData] = await Promise.all([
                getMediaDetails(mediaId, mediaType),
                getMediaCredits(mediaId, mediaType),
                getMediaVideos(mediaId, mediaType),
                getSimilarMedia(mediaId, mediaType),
            ]);
            setDetails(detailsData);
            setCredits(creditsData);
            setVideos(videosData);
            setSimilar(similarData?.results?.filter(item => item.poster_path) || []);
            if (mediaType === 'tv' && detailsData?.seasons && detailsData.seasons.length > 0) {
                const firstSeason = detailsData.seasons.find(s => s.season_number > 0);
                if (firstSeason) {
                    fetchSeason(firstSeason.season_number);
                }
            }
            setIsLoading(false);
        };

        fetchDetails();
    }, [mediaId, mediaType, isOpen]);
    
    const fetchSeason = async (seasonNumber: number) => {
        setSeasonDetails(null); // Show loader for episodes
        const data = await getSeasonDetails(mediaId, seasonNumber);
        setSeasonDetails(data);
    };

    const play = (info: { season?: number, episode?: number, trailerKey?: string }) => {
        setPlayerInfo(info);
        setIsPlayerVisible(true);
    };

    const handleBackToDetails = () => setIsPlayerVisible(false);

    const renderDetails = () => {
        if (!details) return null;

        const title = details.title || details.name;
        const year = (details.release_date || details.first_air_date || '').substring(0, 4);
        const runtime = mediaType === 'movie' ? details.runtime : (details.episode_run_time?.[0]);
        const trailer = videos?.results.find(v => v.site === 'YouTube' && v.type === 'Trailer');
        const director = credits?.crew.find(c => c.job === 'Director');
        const writers = credits?.crew.filter(c => c.department === 'Writing').slice(0, 2).map(w => w.name).join(', ');
        const additionalVideos = videos?.results.filter(v => v.site === 'YouTube' && ['Featurette', 'Behind the Scenes', 'Teaser', 'Clip'].includes(v.type));

        return (
            <>
                {/* Header Section */}
                <div className="relative h-[60vh] bg-cover bg-center" style={{ backgroundImage: `url(${IMG_BASE_URL}${details.backdrop_path})` }}>
                    <div className="absolute inset-0 bg-gradient-to-t from-[#181818] via-[#181818]/50 to-transparent"></div>
                    <button onClick={onClose} className="absolute top-4 right-4 text-white bg-black bg-opacity-60 rounded-full w-10 h-10 flex items-center justify-center text-xl z-20">&times;</button>
                    <div className="absolute bottom-0 left-0 p-4 sm:p-8 z-10 w-full">
                         <h2 className="text-3xl sm:text-5xl font-bold">{title}</h2>
                        <div className="flex items-center flex-wrap gap-3 mt-4">
                            <button onClick={() => play({ season: mediaType === 'tv' ? 1 : undefined, episode: mediaType === 'tv' ? 1 : undefined })} className="flex items-center justify-center gap-2 px-6 py-2 rounded font-semibold bg-white text-black text-lg hover:bg-gray-200 transition-colors">
                                <i className="fas fa-play"></i> Assistir
                            </button>
                            {trailer && (
                                <button onClick={() => play({ trailerKey: trailer.key })} className="flex items-center justify-center gap-2 px-6 py-2 rounded font-semibold bg-gray-500 bg-opacity-70 text-white text-lg hover:bg-gray-600 transition-colors">
                                    <i className="fas fa-film"></i> Trailer
                                </button>
                            )}
                            <button title={isInList ? 'Remover da Minha Lista' : 'Adicionar à Minha Lista'} onClick={() => toggleMyList(details)} className="flex items-center justify-center w-12 h-12 rounded-full border-2 border-gray-400 bg-black bg-opacity-50 text-gray-300 hover:border-white hover:text-white transition">
                                {isInList ? <i className="fas fa-check"></i> : <i className="fas fa-plus"></i>}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Main Content Section */}
                <div className="p-4 sm:p-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="md:col-span-2">
                            <div className="flex items-center space-x-4 text-gray-300 mb-4">
                                <span className="text-green-400 font-bold">{details.vote_average.toFixed(1)} Pontos</span>
                                <span>{year}</span>
                                {runtime && <span>{runtime} min</span>}
                                {mediaType === 'tv' && <span>{details.number_of_seasons} Temporada(s)</span>}
                            </div>
                            <p className="text-base text-gray-300">{details.overview}</p>
                        </div>
                        <div className="text-sm">
                            <p className="mb-2"><span className="text-gray-500">Elenco: </span>{credits?.cast.slice(0, 3).map(c => c.name).join(', ')}...</p>
                            <p><span className="text-gray-500">Gêneros: </span>{details.genres?.map(g => g.name).join(', ')}</p>
                            {(director || writers) && (
                                <button onClick={() => setIsExtraContentOpen(!isExtraContentOpen)} className="text-netflix-red mt-4 hover:underline">
                                    Mais detalhes <i className={`fas fa-chevron-down transition-transform duration-300 ${isExtraContentOpen ? 'rotate-180' : ''}`}></i>
                                </button>
                            )}
                        </div>
                    </div>
                    
                    {/* Extra Content */}
                    <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isExtraContentOpen ? 'max-h-screen mt-8' : 'max-h-0'}`}>
                        <div className="border-t border-gray-700 pt-6">
                             <h3 className="text-2xl font-bold border-l-4 border-netflix-red pl-3 mb-6">Conteúdo Extra</h3>
                             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div>
                                    <h4 className="text-xl font-semibold mb-3">Equipe Técnica</h4>
                                    <div className="space-y-2 text-base">
                                        {director && <p><span className="text-gray-400 font-semibold">Direção: </span>{director.name}</p>}
                                        {writers && <p><span className="text-gray-400 font-semibold">Roteiro: </span>{writers}</p>}
                                    </div>
                                </div>
                                {additionalVideos && additionalVideos.length > 0 && (
                                    <div>
                                        <h4 className="text-xl font-semibold mb-3">Vídeos Adicionais</h4>
                                        <div className="flex items-start space-x-4 overflow-x-auto pb-2">
                                            {additionalVideos.map(video => (
                                                <div key={video.key} onClick={() => play({ trailerKey: video.key })} className="flex-shrink-0 w-48 cursor-pointer group">
                                                    <div className="relative aspect-video rounded-lg overflow-hidden">
                                                        <img src={`https://img.youtube.com/vi/${video.key}/mqdefault.jpg`} className="w-full h-full object-cover" alt={video.name}/>
                                                        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <i className="fas fa-play-circle text-white text-4xl"></i>
                                                        </div>
                                                    </div>
                                                    <p className="text-sm text-gray-300 mt-2 truncate">{video.name}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                             </div>
                        </div>
                    </div>


                    {/* Episodes Section */}
                    {mediaType === 'tv' && details.seasons && (
                        <div className="mt-8">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-2xl font-bold">Episódios</h3>
                                <select onChange={(e) => fetchSeason(Number(e.target.value))} className="bg-gray-800 border border-gray-600 text-white rounded p-2">
                                    {details.seasons.filter(s => s.season_number > 0).map(s => <option key={s.id} value={s.season_number}>{s.name}</option>)}
                                </select>
                            </div>
                            <div className="max-h-96 overflow-y-auto space-y-2 pr-2">
                                {!seasonDetails ? <Loader /> : seasonDetails.episodes.map(ep => (
                                    <div key={ep.id} onClick={() => play({ season: ep.season_number, episode: ep.episode_number })} className="flex items-start gap-4 p-2 rounded-lg hover:bg-gray-800 cursor-pointer transition-colors">
                                        <img src={ep.still_path ? `${IMG_W500_URL}${ep.still_path}` : NO_POSTER_URL} alt={ep.name} className="w-32 h-20 object-cover rounded-md flex-shrink-0" />
                                        <div className="flex-1">
                                            <div className="flex justify-between items-center">
                                                <h4 className="font-bold text-base">{ep.episode_number}. {ep.name}</h4>
                                                <span className="text-sm text-gray-400">{ep.runtime || 0}min</span>
                                            </div>
                                            <p className="text-sm text-gray-400 mt-1 line-clamp-2">{ep.overview}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Similar Media Section */}
                    {similar.length > 0 && (
                        <div className="mt-8">
                            <Carousel title="Títulos Semelhantes" items={similar} onSelectMedia={onSelectMedia} />
                        </div>
                    )}
                </div>
            </>
        )
    }

    return (
        <div className={`fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'} ${!isOpen && 'pointer-events-none'}`}>
            <div className={`bg-[#181818] rounded-lg shadow-2xl transition-all duration-500 ease-in-out ${isPlayerVisible ? 'w-full h-full max-w-full max-h-full rounded-none' : 'w-11/12 max-w-4xl max-h-[90vh] overflow-y-auto'}`} >
                {isLoading ? <div className="h-[90vh]"><Loader /></div> : (
                    isPlayerVisible && details ? (
                        <Player
                            mediaId={details.id}
                            mediaType={mediaType}
                            title={details.title || details.name || ''}
                            season={playerInfo.season}
                            episode={playerInfo.episode}
                            trailerKey={playerInfo.trailerKey}
                            onBack={handleBackToDetails}
                            onPlayNext={play}
                            seasons={details.seasons || []}
                            seasonDetails={seasonDetails}
                        />
                    ) : renderDetails()
                )}
            </div>
        </div>
    );
};

export default DetailsModal;
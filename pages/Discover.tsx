import React, { useState, useEffect } from 'react';
import { MediaItem } from '../types';
import { fetchCarouselData, getDiscoverCarousel } from '../services/tmdbService';
import Loader from '../components/Loader';
import Carousel from '../components/Carousel';
import { IMG_BASE_URL } from '../constants';
import useIntersectionObserver from '../hooks/useIntersectionObserver';

interface DiscoverProps {
    onSelectMedia: (media: { id: number, type: 'movie' | 'tv' }) => void;
}

const carouselConfigs = [
    { id: 'trending', title: 'Em Alta', fetches: [fetchCarouselData('/trending/all/week?page=1'), fetchCarouselData('/trending/all/week?page=2')] },
    { id: 'popular_movies', title: 'Filmes Populares', fetches: [fetchCarouselData('/movie/popular?page=1'), fetchCarouselData('/movie/popular?page=2')] },
    { id: 'popular_tv', title: 'Séries Populares', fetches: [fetchCarouselData('/tv/popular?page=1'), fetchCarouselData('/tv/popular?page=2')] },
    { id: 'acclaimed_tv', title: 'Séries Aclamadas pela Crítica', fetches: [fetchCarouselData('/tv/top_rated')] },
    { id: 'horror_thriller', title: 'Terror e Suspense', fetches: [
        fetchCarouselData('/discover/movie?with_genres=27,53&sort_by=popularity.desc'),
        fetchCarouselData('/discover/tv?with_genres=9648&with_keywords=9717&sort_by=popularity.desc')
    ]},
    { id: 'anime', title: 'Animes', fetches: [
        fetchCarouselData('/discover/tv?with_genres=16&with_original_language=ja&sort_by=popularity.desc&without_keywords=291485')
    ]},
    { id: 'netflix', title: 'Originais Netflix', fetches: [
        fetchCarouselData('/discover/movie?watch_region=BR&with_watch_providers=8&with_networks=213&sort_by=popularity.desc'),
        fetchCarouselData('/discover/tv?watch_region=BR&with_watch_providers=8&with_networks=213&sort_by=popularity.desc')
    ]},
    { id: 'prime_video', title: 'Originais Prime Video', fetches: [
        fetchCarouselData('/discover/movie?watch_region=BR&with_watch_providers=119&with_networks=1024&sort_by=popularity.desc'),
        fetchCarouselData('/discover/tv?watch_region=BR&with_watch_providers=119&with_networks=1024&sort_by=popularity.desc')
    ]},
    { id: 'max', title: 'Originais Max', fetches: [
        fetchCarouselData('/discover/movie?watch_region=BR&with_watch_providers=1899&sort_by=popularity.desc'),
        fetchCarouselData('/discover/tv?watch_region=BR&with_watch_providers=1899&sort_by=popularity.desc')
    ]},
    { id: 'disney_plus', title: 'Originais Disney+', fetches: [
        fetchCarouselData('/discover/movie?watch_region=BR&with_watch_providers=337&with_networks=2739&sort_by=popularity.desc'),
        fetchCarouselData('/discover/tv?watch_region=BR&with_watch_providers=337&with_networks=2739&sort_by=popularity.desc')
    ]},
    { id: 'apple_tv_plus', title: 'Originais Apple TV+', fetches: [
        fetchCarouselData('/discover/movie?watch_region=BR&with_watch_providers=350&with_networks=2552&sort_by=popularity.desc'),
        fetchCarouselData('/discover/tv?watch_region=BR&with_watch_providers=350&with_networks=2552&sort_by=popularity.desc')
    ]},
    { id: 'brazilian', title: 'Produções Brasileiras', fetches: [
        fetchCarouselData('/discover/movie?with_origin_country=BR&sort_by=popularity.desc&vote_count.gte=25'),
        fetchCarouselData('/discover/tv?with_origin_country=BR&sort_by=popularity.desc&vote_count.gte=10')
    ]},
];

const LazyCarousel: React.FC<{ config: any, onSelectMedia: (media: { id: number, type: 'movie' | 'tv' }) => void }> = ({ config, onSelectMedia }) => {
    const [containerRef, isVisible] = useIntersectionObserver({ rootMargin: '200px' });
    const [data, setData] = useState<{ title: string; items: MediaItem[] } | null>(null);

    useEffect(() => {
        if (isVisible && !data) {
            getDiscoverCarousel(config.title, config.fetches).then(setData);
        }
    }, [isVisible, data, config]);

    return (
        <div ref={containerRef} className="min-h-[250px]">
            {data ? (
                <Carousel title={data.title} items={data.items} onSelectMedia={onSelectMedia} />
            ) : (
                <>
                    <h2 className="text-xl sm:text-2xl font-bold mb-4">{config.title}</h2>
                    <div className="flex items-center h-48"><Loader size="w-8 h-8"/></div>
                </>
            )}
        </div>
    );
}


const Discover: React.FC<DiscoverProps> = ({ onSelectMedia }) => {
    const [heroMedia, setHeroMedia] = useState<MediaItem | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchHero = async () => {
            setIsLoading(true);
            const data = await getDiscoverCarousel('Em Alta', carouselConfigs[0].fetches);
            if (data.items && data.items.length > 0) {
                const validHeroOptions = data.items.filter(m => m.backdrop_path);
                setHeroMedia(validHeroOptions[Math.floor(Math.random() * validHeroOptions.length)]);
            }
            setIsLoading(false);
        };
        fetchHero();
    }, []);

    if (isLoading) {
        return <Loader />;
    }

    return (
        <div className="animate-fadeIn">
            {heroMedia && (
                <div 
                    className="h-[80vh] -mx-4 md:-mx-10 -mt-24 mb-10 bg-cover bg-center bg-no-repeat relative flex items-center" 
                    style={{ backgroundImage: `url(${IMG_BASE_URL}${heroMedia.backdrop_path})` }}
                >
                    <div className="w-full h-full absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent"></div>
                    <div className="relative z-10 p-4 md:p-10 text-white w-full md:w-1/2 lg:w-2/5">
                        <h2 className="text-4xl md:text-6xl font-bold my-4 line-clamp-3">{heroMedia.title || heroMedia.name}</h2>
                        <p className="max-w-xl mt-4 text-base md:text-lg hidden md:block line-clamp-3">{heroMedia.overview}</p>
                        <div className="flex items-center space-x-3 mt-6">
                            <button onClick={() => onSelectMedia({ id: heroMedia.id, type: heroMedia.media_type })} className="flex items-center justify-center gap-2 px-6 py-2 rounded font-semibold bg-white text-black text-lg hover:bg-gray-200 transition-colors">
                                <i className="fas fa-play"></i> Assistir
                            </button>
                             <button onClick={() => onSelectMedia({ id: heroMedia.id, type: heroMedia.media_type })} className="flex items-center justify-center gap-2 px-6 py-2 rounded font-semibold bg-gray-500 bg-opacity-70 text-white text-lg hover:bg-gray-600 transition-colors">
                                <i className="fas fa-info-circle"></i> Mais Info
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            {carouselConfigs.map((config) => (
                <LazyCarousel key={config.id} config={config} onSelectMedia={onSelectMedia} />
            ))}
        </div>
    );
};

export default Discover;
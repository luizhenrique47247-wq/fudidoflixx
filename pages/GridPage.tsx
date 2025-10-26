import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MediaItem } from '../types';
import { getDiscoverMedia, getAnimes, searchMediaByTitles } from '../services/tmdbService';
import { OSCAR_WINNERS_LIST, EMMY_WINNERS_LIST } from '../constants';
import Loader from '../components/Loader';
import MediaCard from '../components/MediaCard';

interface GridPageProps {
    type: 'movie' | 'tv' | 'animes';
    onSelectMedia: (media: { id: number, type: 'movie' | 'tv' }) => void;
}

const movieFilters = [
    { name: 'Gêneros', value: 'all' }, { name: 'Ação', value: 'g-28' }, { name: 'Comédia', value: 'g-35' },
    { name: 'Documentário', value: 'g-99' }, { name: 'Drama', value: 'g-18' }, { name: 'Fantasia', value: 'g-14' },
    // FIX: Corrected a syntax error in the object property 'name'.
    { name: 'Ficção Científica', value: 'g-878' }, { name: 'Suspense', value: 'g-53' }, { name: 'Terror', value: 'g-27' },
    { name: '──────────', value: 'sep1', disabled: true },
    { name: 'Brasileiros', value: 'c-BR' }, { name: 'Clássicos (até 1980)', value: 'rd-1980-12-31' },
    { name: 'Premiados (Oscar)', value: 'k-oscar-list' },
    { name: '──────────', value: 'sep2', disabled: true },
    { name: 'Netflix', value: 's-8,213' }, { name: 'Prime Video', value: 's-119,1024' }, { name: 'Max', value: 's-1899' },
    { name: 'Disney+', value: 's-337,2739' }, { name: 'Apple TV+', value: 's-350,2552' },
];

const tvFilters = [
    { name: 'Gêneros', value: 'all' }, { name: 'Ação e Aventura', value: 'g-10759' }, { name: 'Animação', value: 'g-16' },
    { name: 'Comédia', value: 'g-35' }, { name: 'Crime', value: 'g-80' }, { name: 'Documentário', value: 'g-99' },
    { name: 'Drama', value: 'g-18' }, { name: 'Mistério', value: 'g-9648' },
    { name: '──────────', value: 'sep1', disabled: true },
    { name: 'Brasileiras', value: 'c-BR' }, { name: 'Clássicos (até 1990)', value: 'fd-1990-12-31' },
    { name: 'Premiados (Emmy)', value: 'k-emmy-list' },
    { name: '──────────', value: 'sep2', disabled: true },
    { name: 'Netflix', value: 's-8,213' }, { name: 'Prime Video', value: 's-119,1024' }, { name: 'Max', value: 's-1899' },
    { name: 'Disney+', value: 's-337,2739' }, { name: 'Apple TV+', value: 's-350,2552' },
];

const GridPage: React.FC<GridPageProps> = ({ type, onSelectMedia }) => {
    const [items, setItems] = useState<MediaItem[]>([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedGenre, setSelectedGenre] = useState('all');
    const [sortBy, setSortBy] = useState('popularity.desc');

    // FIX: Correctly type the IntersectionObserver ref to allow for a null initial value.
    const observer = useRef<IntersectionObserver | null>(null);
    const lastElementRef = useCallback((node: HTMLDivElement) => {
        if (isLoading) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                setPage(prevPage => prevPage + 1);
            }
        });
        if (node) observer.current.observe(node);
    }, [isLoading, hasMore]);
    
    const resetAndFetch = useCallback(() => {
        setItems([]);
        setPage(1);
        setHasMore(true);
        setIsLoading(true);
    }, []);

    useEffect(() => {
        resetAndFetch();
    }, [type, selectedGenre, sortBy, resetAndFetch]);

    useEffect(() => {
        const isAwardFilter = selectedGenre === 'k-oscar-list' || selectedGenre === 'k-emmy-list';
        if (isAwardFilter && !hasMore && page > 1) return;

        const fetchData = async () => {
            setIsLoading(true);
            let data;
            const batchSize = 20;

            if (selectedGenre === 'k-oscar-list' && type === 'movie') {
                const startIndex = (page - 1) * batchSize;
                const titlesToFetch = OSCAR_WINNERS_LIST.slice(startIndex, startIndex + batchSize);
                if (titlesToFetch.length > 0) {
                    const results = await searchMediaByTitles(titlesToFetch, 'movie');
                    setItems(prev => page === 1 ? results : [...prev, ...results]);
                    setHasMore(startIndex + batchSize < OSCAR_WINNERS_LIST.length);
                } else { setHasMore(false); }
            } else if (selectedGenre === 'k-emmy-list' && type === 'tv') {
                const startIndex = (page - 1) * batchSize;
                const titlesToFetch = EMMY_WINNERS_LIST.slice(startIndex, startIndex + batchSize);
                 if (titlesToFetch.length > 0) {
                    const results = await searchMediaByTitles(titlesToFetch, 'tv');
                    setItems(prev => page === 1 ? results : [...prev, ...results]);
                    setHasMore(startIndex + batchSize < EMMY_WINNERS_LIST.length);
                } else { setHasMore(false); }
            } else if (type === 'animes') {
                data = await getAnimes(page, sortBy);
            } else {
                data = await getDiscoverMedia(type, page, selectedGenre, sortBy);
            }

            if (data?.results) {
                setItems(prev => page === 1 ? data.results : [...prev, ...data.results]);
                setHasMore(data.page < data.total_pages);
            } else if (!isAwardFilter) {
                setHasMore(false);
            }
            setIsLoading(false);
        };
        
        fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, type, selectedGenre, sortBy]);

    const title = type === 'movie' ? 'Filmes' : type === 'tv' ? 'Séries' : 'Animes';
    const filters = type === 'movie' ? movieFilters : tvFilters;
    
    return (
        <div className="animate-fadeIn">
            <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
                <h2 className="text-2xl sm:text-3xl font-bold">{title}</h2>
                <div className="flex flex-wrap items-center gap-4">
                    {type !== 'animes' && (
                        <select
                            value={selectedGenre}
                            onChange={e => setSelectedGenre(e.target.value)}
                            className="bg-[#141414] border border-gray-500 text-white p-2 rounded-md font-medium cursor-pointer hover:border-white focus:outline-none focus:ring-2 focus:ring-netflix-red"
                        >
                            {filters.map(f => <option key={f.value} value={f.value} disabled={f.disabled}>{f.name}</option>)}
                        </select>
                    )}
                    <select
                         value={sortBy}
                         onChange={e => setSortBy(e.target.value)}
                         className="bg-[#141414] border border-gray-500 text-white p-2 rounded-md font-medium cursor-pointer hover:border-white focus:outline-none focus:ring-2 focus:ring-netflix-red"
                    >
                        <option value="popularity.desc">Popularidade</option>
                        <option value={type === 'movie' ? 'release_date.desc' : 'first_air_date.desc'}>Lançamento</option>
                        <option value="vote_average.desc">Avaliações</option>
                    </select>
                </div>
            </div>

            {isLoading && page === 1 ? (
                <Loader />
            ) : (
                <>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4">
                        {items.map((item, index) => (
                             <div key={`${item.id}-${index}`} ref={items.length === index + 1 ? lastElementRef : null}>
                                <MediaCard media={item} onSelect={onSelectMedia} isGridItem />
                            </div>
                        ))}
                    </div>
                    {isLoading && page > 1 && <Loader />}
                    {!hasMore && items.length > 0 && <p className="text-center text-gray-500 py-8">Você chegou ao fim!</p>}
                    {!isLoading && items.length === 0 && <p className="text-center text-gray-400 py-10 text-xl">Nenhum resultado encontrado.</p>}
                </>
            )}
        </div>
    );
};

export default GridPage;
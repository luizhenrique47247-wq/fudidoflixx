
import React, { useState, useEffect } from 'react';
import { MediaItem } from '../types';
import { searchMedia } from '../services/tmdbService';
import Loader from '../components/Loader';
import MediaCard from '../components/MediaCard';

interface SearchResultsProps {
    query: string;
    onSelectMedia: (media: { id: number, type: 'movie' | 'tv' }) => void;
}

const SearchResults: React.FC<SearchResultsProps> = ({ query, onSelectMedia }) => {
    const [results, setResults] = useState<MediaItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!query) {
            setResults([]);
            return;
        }

        const fetchResults = async () => {
            setIsLoading(true);
            const data = await searchMedia(query);
            if (data?.results) {
                const validResults = data.results.filter(
                    r => (r.media_type === 'movie' || r.media_type === 'tv') && r.poster_path
                );
                setResults(validResults);
            }
            setIsLoading(false);
        };

        fetchResults();
    }, [query]);

    if (isLoading) {
        return <Loader />;
    }

    return (
        <div className="animate-fadeIn">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6">Resultados para "{query}"</h2>
            {results.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4">
                    {results.map(item => (
                        <MediaCard key={item.id} media={item} onSelect={onSelectMedia} isGridItem />
                    ))}
                </div>
            ) : (
                <p className="text-center text-gray-400 py-10 text-xl">Nenhum resultado encontrado.</p>
            )}
        </div>
    );
};

export default SearchResults;

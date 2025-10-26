import { API_KEY, API_BASE_URL } from '../constants';
import { MediaItem, Credits, Videos, SeasonDetails, Genre } from '../types';

interface ApiResponse<T> {
    results: T[];
    page: number;
    total_pages: number;
    total_results: number;
}

const fetchTMDB = async <T,>(endpoint: string): Promise<T | null> => {
    const separator = endpoint.includes('?') ? '&' : '?';
    const url = `${API_BASE_URL}${endpoint}${separator}api_key=${API_KEY}&language=pt-BR`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.error(`HTTP Error: ${response.status} for URL: ${url}`);
            return null;
        }
        return await response.json();
    } catch (error) {
        console.error(`Failed to fetch from TMDB: ${url}`, error);
        return null;
    }
};

export const getMediaDetails = (id: number, type: 'movie' | 'tv') => fetchTMDB<MediaItem>(`/${type}/${id}`);
export const getMediaCredits = (id: number, type: 'movie' | 'tv') => fetchTMDB<Credits>(`/${type}/${id}/credits`);
export const getMediaVideos = (id: number, type: 'movie' | 'tv') => fetchTMDB<Videos>(`/${type}/${id}/videos`);
export const getSimilarMedia = (id: number, type: 'movie' | 'tv') => fetchTMDB<ApiResponse<MediaItem>>(`/${type}/${id}/similar`);
export const getSeasonDetails = (tvId: number, seasonNumber: number) => fetchTMDB<SeasonDetails>(`/tv/${tvId}/season/${seasonNumber}`);
export const getMovieGenres = () => fetchTMDB<{ genres: Genre[] }>('/genre/movie/list');
export const getTvGenres = () => fetchTMDB<{ genres: Genre[] }>('/genre/tv/list');
export const searchMedia = (query: string, page: number = 1) => fetchTMDB<ApiResponse<MediaItem>>(`/search/multi?query=${encodeURIComponent(query)}&page=${page}&include_adult=false`);

export const getDiscoverCarousel = async (title: string, fetches: Promise<ApiResponse<MediaItem> | null>[]) => {
    const responses = await Promise.all(fetches);
    const items = responses
        .flatMap(res => res?.results || [])
        .map(item => ({ ...item, media_type: item.media_type || (item.title ? 'movie' : 'tv') }))
        .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
        .filter((v, i, a) => a.findIndex(t => (t.id === v.id)) === i); // Remove duplicates
    
    return { title, items };
};

// FIX: Removed unused 'type' parameter.
export const fetchCarouselData = (endpoint: string) => fetchTMDB<ApiResponse<MediaItem>>(endpoint);

export const getDiscoverMedia = (type: 'movie' | 'tv', page: number, genre: string, sortBy: string) => {
    let endpoint = `/discover/${type}?page=${page}&sort_by=${sortBy}`;
    const today = new Date().toISOString().split('T')[0];
    if (type === 'tv') endpoint += `&first_air_date.lte=${today}`;
    else if (type === 'movie') endpoint += `&primary_release_date.lte=${today}`;

    let voteCountParam = '&vote_count.gte=100';
    if (genre !== 'all') {
        const [prefix, value] = genre.split('-');
        switch (prefix) {
            case 'g': endpoint += `&with_genres=${value}`; break;
            case 'c': endpoint += `&with_origin_country=${value}`; break;
            case 'k': endpoint += `&with_keywords=${value}`; voteCountParam = '&vote_count.gte=10'; break;
            case 'p': endpoint += `&with_companies=${value}`; break;
            case 'rd': endpoint += `&primary_release_date.lte=${value}`; break;
            case 'fd': endpoint += `&first_air_date.lte=${value}`; break;
            case 's':
                const [provider, network] = value.split(',');
                endpoint += `&watch_region=BR&with_watch_providers=${provider}`;
                if (network) endpoint += `&with_networks=${network}`;
                break;
        }
    }
    endpoint += voteCountParam;
    return fetchTMDB<ApiResponse<MediaItem>>(endpoint);
};

export const getAnimes = (page: number, sortBy: string) => {
    const endpoint = `/discover/tv?page=${page}&sort_by=${sortBy}&with_genres=16&with_original_language=ja&without_keywords=291485&vote_count.gte=25`;
    return fetchTMDB<ApiResponse<MediaItem>>(endpoint);
};

export const searchMediaByTitles = async (titles: string[], type: 'movie' | 'tv'): Promise<MediaItem[]> => {
    const searchPromises = titles.map(title =>
        fetchTMDB<ApiResponse<MediaItem>>(`/search/${type}?query=${encodeURIComponent(title)}&include_adult=false`)
    );
    const searchResults = await Promise.all(searchPromises);

    const foundMedia: MediaItem[] = [];
    searchResults.forEach(result => {
        if (result && result.results && result.results.length > 0) {
            const media = result.results[0];
            if (!foundMedia.some(m => m.id === media.id)) {
                foundMedia.push({ ...media, media_type: type });
            }
        }
    });
    return foundMedia;
};

export const getRandomMedia = async (mediaType: 'movie' | 'tv', genre?: string) => {
    let discoverUrl = `/discover/${mediaType}?sort_by=popularity.desc&vote_count.gte=100&page=1`;
    if (genre) discoverUrl += `&with_genres=${genre}`;
    
    const initialData = await fetchTMDB<ApiResponse<MediaItem>>(discoverUrl);
    if (!initialData || initialData.total_results === 0) return null;

    const totalPages = Math.min(initialData.total_pages, 500);
    const randomPage = Math.floor(Math.random() * totalPages) + 1;
    
    const pageData = await fetchTMDB<ApiResponse<MediaItem>>(discoverUrl.replace('page=1', `page=${randomPage}`));
    const potentialMedia = (pageData?.results || []).filter(m => m.poster_path && m.backdrop_path && m.overview);
    
    if (potentialMedia.length > 0) {
        return potentialMedia[Math.floor(Math.random() * potentialMedia.length)];
    }
    return null;
}
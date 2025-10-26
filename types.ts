export interface MediaItem {
    id: number;
    title?: string;
    name?: string;
    poster_path: string | null;
    backdrop_path: string | null;
    overview: string;
    media_type: 'movie' | 'tv';
    vote_average: number;
    // FIX: Add popularity property to MediaItem type.
    popularity: number;
    release_date?: string;
    first_air_date?: string;
    genres?: { id: number, name: string }[];
    runtime?: number;
    episode_run_time?: number[];
    number_of_seasons?: number;
    seasons?: Season[];
}

export interface Credits {
    cast: { name:string }[];
    crew: { name: string; job: string, department: string }[];
}

export interface Videos {
    results: {
        key: string;
        site: string;
        type: string;
        name: string;
    }[];
}

export interface Season {
    id: number;
    name: string;
    season_number: number;
    episode_count: number;
}

export interface SeasonDetails extends Season {
    episodes: Episode[];
}

export interface Episode {
    id: number;
    name: string;
    overview: string;
    episode_number: number;
    season_number: number;
    still_path: string;
    runtime: number;
}

export type Page = 'discover' | 'tv' | 'movie' | 'animes' | 'my-list' | 'lucky' | 'search' | 'roleta' | 'match';

export interface Genre {
    id: number;
    name: string;
}

export interface RoletaItem {
    id: number;
    title: string;
    poster_path: string;
    media_type: 'movie' | 'tv';
}

export interface MatchState {
    phase: 'selection' | 'player1' | 'transition' | 'player2' | 'results';
    options: MediaItem[];
    player1Likes: Set<number>;
    player2Likes: Set<number>;
    currentCardIndex: number;
    currentPlayer: 1 | 2;
    mediaType: 'movie' | 'tv';
    genre: string;
}
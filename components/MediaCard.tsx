import React, { useState } from 'react';
import { MediaItem } from '../types.ts';
import { IMG_W500_URL, NO_POSTER_URL } from '../constants.ts';

interface MediaCardProps {
    media: MediaItem | any; // Use any for MyList items which are a subset
    onSelect: (media: { id: number, type: 'movie' | 'tv' }) => void;
    isGridItem?: boolean;
}

const MediaCard: React.FC<MediaCardProps> = ({ media, onSelect, isGridItem = false }) => {
    const [imgLoaded, setImgLoaded] = useState(false);
    const title = media.title || media.name;
    const posterPath = media.poster_path ? `${IMG_W500_URL}${media.poster_path}` : NO_POSTER_URL;
    
    const sizeClasses = isGridItem
        ? 'w-full'
        : 'flex-shrink-0 w-36 sm:w-40 md:w-48';

    const handleSelect = () => {
        onSelect({ id: media.id, type: media.media_type });
    };

    return (
        <div
            className={`media-card aspect-[2/3] ${sizeClasses} cursor-pointer group rounded-md overflow-hidden bg-gray-900 transition-transform duration-300 ease-in-out hover:scale-110 hover:z-10 shadow-lg hover:shadow-black/70`}
            onClick={handleSelect}
        >
            <img
                src={posterPath}
                alt={title}
                className={`w-full h-full object-cover transition-opacity duration-500 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
                loading="lazy"
                onLoad={() => setImgLoaded(true)}
                onError={(e) => {
                    (e.target as HTMLImageElement).onerror = null;
                    (e.target as HTMLImageElement).src = NO_POSTER_URL;
                }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-2 sm:p-3">
                <p className="text-white text-sm sm:text-base font-semibold truncate">{title}</p>
            </div>
        </div>
    );
};

export default React.memo(MediaCard);
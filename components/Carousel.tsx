
import React, { useRef } from 'react';
import { MediaItem } from '../types';
import MediaCard from './MediaCard';

interface CarouselProps {
    title: string;
    items: MediaItem[];
    onSelectMedia: (media: { id: number, type: 'movie' | 'tv' }) => void;
}

const Carousel: React.FC<CarouselProps> = ({ title, items, onSelectMedia }) => {
    const carouselRef = useRef<HTMLDivElement>(null);

    if (!items || items.length === 0) return null;

    const handleScroll = (direction: 'left' | 'right') => {
        if (carouselRef.current) {
            const scrollAmount = carouselRef.current.clientWidth * 0.8;
            carouselRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth',
            });
        }
    };
    
    return (
        <section className="mb-10 group relative">
            <h2 className="text-xl sm:text-2xl font-bold mb-4">{title}</h2>
            <div className="relative">
                <button
                    onClick={() => handleScroll('left')}
                    className="carousel-arrow left-0 hidden md:flex absolute top-0 bottom-0 w-[4%] bg-black bg-opacity-70 z-20 cursor-pointer items-center justify-center text-white text-2xl rounded-r-lg opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    <i className="fas fa-chevron-left"></i>
                </button>
                <div
                    ref={carouselRef}
                    className="carousel flex items-start space-x-3 md:space-x-4 overflow-x-auto py-2 -my-2"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {items.map((item, index) => (
                        <MediaCard key={`${item.id}-${index}`} media={item} onSelect={onSelectMedia} />
                    ))}
                </div>
                <button
                    onClick={() => handleScroll('right')}
                    className="carousel-arrow right-0 hidden md:flex absolute top-0 bottom-0 w-[4%] bg-black bg-opacity-70 z-20 cursor-pointer items-center justify-center text-white text-2xl rounded-l-lg opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    <i className="fas fa-chevron-right"></i>
                </button>
            </div>
        </section>
    );
};

export default Carousel;


import React, { useEffect } from 'react';
import MediaCard from '../components/MediaCard.tsx';
import { useMyList } from '../hooks/useMyList.ts';

interface MyListProps {
    onSelectMedia: (media: { id: number, type: 'movie' | 'tv' }) => void;
}

const MyList: React.FC<MyListProps> = ({ onSelectMedia }) => {
    const { myList, refreshList } = useMyList();
    
    useEffect(() => {
        refreshList();
    }, [refreshList]);

    return (
        <div className="animate-fadeIn">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6">Minha Lista</h2>
            {myList.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4">
                    {myList.map(item => (
                        <MediaCard key={item.id} media={item} onSelect={onSelectMedia} isGridItem />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20">
                    <p className="text-xl text-gray-400">A sua lista está vazia.</p>
                    <p className="mt-2 text-gray-500">Adicione filmes e séries para vê-los aqui.</p>
                </div>
            )}
        </div>
    );
};

export default MyList;
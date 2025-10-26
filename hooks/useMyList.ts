
import { useState, useCallback, useEffect } from 'react';
import { MediaItem } from '../types.ts';

type MyListItem = Pick<MediaItem, 'id' | 'title' | 'name' | 'poster_path' | 'media_type'>;

const getMyListFromStorage = (): MyListItem[] => {
    try {
        const list = localStorage.getItem('fudidoFlixMyList');
        return list ? JSON.parse(list) : [];
    } catch (e) {
        console.error("Failed to parse My List from localStorage", e);
        return [];
    }
};

const saveMyListToStorage = (list: MyListItem[]) => {
    try {
        localStorage.setItem('fudidoFlixMyList', JSON.stringify(list));
    } catch (e) {
        console.error("Failed to save My List to localStorage", e);
    }
};

export const useMyList = (mediaId?: number) => {
    const [myList, setMyList] = useState<MyListItem[]>(getMyListFromStorage);
    const [isInList, setIsInList] = useState<boolean>(false);

    useEffect(() => {
        if (mediaId !== undefined) {
            setIsInList(myList.some(item => item.id === mediaId));
        }
    }, [mediaId, myList]);
    
    const toggleMyList = useCallback((mediaItem: MediaItem) => {
        setMyList(prevList => {
            const itemIndex = prevList.findIndex(item => item.id === mediaItem.id);
            let newList: MyListItem[];

            if (itemIndex > -1) {
                newList = prevList.filter(item => item.id !== mediaItem.id);
            } else {
                const itemToAdd: MyListItem = {
                    id: mediaItem.id,
                    poster_path: mediaItem.poster_path,
                    title: mediaItem.title,
                    name: mediaItem.name,
                    media_type: mediaItem.media_type,
                };
                newList = [itemToAdd, ...prevList];
            }
            saveMyListToStorage(newList);
            return newList;
        });
    }, []);
    
    const refreshList = useCallback(() => {
        setMyList(getMyListFromStorage());
    }, []);

    return { myList, isInList, toggleMyList, refreshList };
};
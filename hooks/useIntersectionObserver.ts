import { useRef, useEffect, useState } from 'react';

const useIntersectionObserver = (options: IntersectionObserverInit) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setIsVisible(true);
                if (containerRef.current) {
                    observer.unobserve(containerRef.current);
                }
            }
        }, options);

        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        return () => {
            if (containerRef.current) {
                // eslint-disable-next-line react-hooks/exhaustive-deps
                observer.unobserve(containerRef.current);
            }
        };
    }, [containerRef, options]);

    return [containerRef, isVisible] as const;
};

export default useIntersectionObserver;

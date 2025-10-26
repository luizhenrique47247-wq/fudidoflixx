
import React from 'react';

interface SplashScreenProps {
    isVisible: boolean;
    onVideoEnd: () => void;
    onSkip: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ isVisible, onVideoEnd, onSkip }) => {
    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center transition-opacity duration-700 ease-out" style={{ opacity: isVisible ? 1 : 0 }}>
            <video
                className="absolute top-0 left-0 w-full h-full object-cover"
                src="https://i.imgur.com/mQfvVxg.mp4"
                autoPlay
                muted
                playsInline
                onEnded={onVideoEnd}
            ></video>
            <button
                onClick={onSkip}
                className="absolute bottom-10 right-10 z-20 bg-black bg-opacity-50 text-white px-4 py-2 rounded text-sm hover:bg-opacity-75 transition-colors"
            >
                Pular Abertura
            </button>
        </div>
    );
};

export default SplashScreen;

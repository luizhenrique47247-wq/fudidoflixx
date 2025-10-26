
import React from 'react';

const Loader: React.FC<{ size?: string; border?: string }> = ({ size = 'w-12 h-12', border = 'border-4' }) => {
    return (
        <div className="flex justify-center items-center py-10">
            <div
                className={`loader ${size} ${border} border-solid border-gray-600 border-b-netflix-red rounded-full inline-block animate-spin`}
                role="status"
            >
                <span className="sr-only">Loading...</span>
            </div>
        </div>
    );
};

export default Loader;

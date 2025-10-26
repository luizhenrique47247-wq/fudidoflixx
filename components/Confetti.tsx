import React, { useEffect, useState } from 'react';

const Confetti: React.FC = () => {
    const [pieces, setPieces] = useState<any[]>([]);

    useEffect(() => {
        const confettiColors = ["#E50914", "#FFFFFF", "#b91c1c", "#7f1d1d"];
        const newPieces = Array.from({ length: 150 }).map((_, i) => ({
            id: i,
            style: {
                left: `${Math.random() * 100}vw`,
                backgroundColor: confettiColors[Math.floor(Math.random() * confettiColors.length)],
                animation: `fall ${Math.random() * 2 + 3}s ease-out forwards`,
                animationDelay: `${Math.random() * 0.5}s`,
                transform: `scale(${Math.random() * 0.5 + 0.5})`,
                borderRadius: `${Math.random() > 0.5 ? '50%' : '0'}`,
            }
        }));
        setPieces(newPieces);
    }, []);

    return (
        <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-50 overflow-hidden">
            <style>
                {`
                @keyframes fall {
                    0% { transform: translateY(-10vh) rotateZ(0deg); opacity: 1; }
                    100% { transform: translateY(110vh) rotateZ(720deg); opacity: 0; }
                }
                `}
            </style>
            {pieces.map(p => (
                <div
                    key={p.id}
                    className="absolute w-2 h-4"
                    style={p.style}
                ></div>
            ))}
        </div>
    );
};

export default Confetti;

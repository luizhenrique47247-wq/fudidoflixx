
import React from 'react';
import { Page } from '../types.ts';

interface LuckyProps {
    onNavigate: (page: Page) => void;
    onOpenSurprise: () => void;
}

const Lucky: React.FC<LuckyProps> = ({ onNavigate, onOpenSurprise }) => {
    return (
        <div className="animate-fadeIn">
            <div className="text-center mb-12">
                <h2 className="text-3xl sm:text-4xl font-bold">Jogos da Sorte</h2>
                <p className="text-lg text-gray-400 mt-2">Escolha uma forma divertida de descobrir o que assistir.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                <LuckyCard
                    icon="fa-dice-d20"
                    title="Roleta Cinéfila"
                    description="Adicione seus filmes e séries e deixe a sorte escolher."
                    onClick={() => onNavigate('roleta')}
                />
                <LuckyCard
                    icon="fa-heart"
                    title="Match de Filmes"
                    description="Dê 'match' com um amigo para descobrirem o que assistir juntos."
                    onClick={() => onNavigate('match')}
                />
                <LuckyCard
                    icon="fa-random"
                    title="Surpreenda-me"
                    description="Deixe que o nosso algoritmo escolha algo aleatório para você."
                    onClick={onOpenSurprise}
                />
            </div>
        </div>
    );
};

interface LuckyCardProps {
    icon: string;
    title: string;
    description: string;
    onClick: () => void;
}
const LuckyCard: React.FC<LuckyCardProps> = ({ icon, title, description, onClick }) => (
    <div
        onClick={onClick}
        className="lucky-card cursor-pointer bg-gray-800 rounded-lg p-8 text-center flex flex-col items-center"
    >
        <i className={`fas ${icon} text-5xl text-netflix-red mb-4`}></i>
        <h3 className="text-2xl font-bold mb-2">{title}</h3>
        <p className="text-gray-400">{description}</p>
    </div>
);


export default Lucky;
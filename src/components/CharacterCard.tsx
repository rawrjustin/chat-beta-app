import { Link } from 'react-router-dom';
import type { Character } from '../types/api';

interface CharacterCardProps {
  character: Character;
}

export function CharacterCard({ character }: CharacterCardProps) {
  return (
    <Link to={`/chat/${character.id}`} className="block">
      <div className="card h-full flex flex-col">
        <div className="aspect-square bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
          {character.avatar ? (
            <img
              src={character.avatar}
              alt={character.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-6xl text-primary-600">
              {character.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div className="p-5 flex-1 flex flex-col">
          <h3 className="text-xl font-semibold text-airbnb-dark mb-2">
            {character.name}
          </h3>
          <p className="text-gray-600 text-sm flex-1 mb-4 line-clamp-3">
            {character.description}
          </p>
          <button className="btn-primary w-full mt-auto">
            Start Chatting
          </button>
        </div>
      </div>
    </Link>
  );
}


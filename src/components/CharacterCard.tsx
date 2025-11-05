import { Link } from 'react-router-dom';
import type { Character } from '../types/api';

interface CharacterCardProps {
  character: Character;
}

export function CharacterCard({ character }: CharacterCardProps) {
  return (
    <Link to={`/chat/${character.id}`} className="block group">
      <div className="card h-full flex flex-col group-hover:scale-[1.02] transition-transform duration-200">
        <div className="aspect-square bg-gradient-to-br from-purple-100 via-blue-100 to-purple-200 flex items-center justify-center overflow-hidden">
          {character.avatar ? (
            <img
              src={character.avatar}
              alt={character.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
          ) : (
            <div className="text-6xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              {character.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div className="p-6 flex-1 flex flex-col">
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {character.name}
          </h3>
          <p className="text-gray-600 text-sm flex-1 mb-4 line-clamp-3 leading-relaxed">
            {character.description}
          </p>
          <button className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:shadow-lg transition-all w-full mt-auto">
            Start Chatting
          </button>
        </div>
      </div>
    </Link>
  );
}


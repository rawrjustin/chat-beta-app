import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Character } from '../types/api';
import { normalizeAvatarUrl } from '../utils/avatar';

interface CharacterCardProps {
  character: Character;
}

export function CharacterCard({ character }: CharacterCardProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const avatarUrlRaw = (character.avatar_url ?? character.avatar ?? '').trim();
  const hasAvatar = avatarUrlRaw !== '';
  const imageUrl = hasAvatar ? normalizeAvatarUrl(avatarUrlRaw) : '';
  const isPasswordProtected = Boolean(character.password_required);

  const handleImageError = () => {
    setImageError(true);
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  return (
    <Link to={`/chat/${character.id}`} className="block group h-full">
      <div className="card h-full flex flex-row md:flex-col group-hover:scale-[1.02] transition-transform duration-200 gap-4 md:gap-0 overflow-hidden border-transparent hover:border-primary-100">
        <div className="relative bg-gradient-to-br from-primary-50 via-secondary-50 to-primary-100 flex items-center justify-center overflow-hidden flex-shrink-0 w-24 h-24 sm:w-28 sm:h-28 md:w-full md:h-[240px]">
          {hasAvatar && !imageError ? (
            <>
              {isPasswordProtected && (
                <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm text-gray-700 text-[10px] font-medium px-2 py-1 rounded-full shadow-sm flex items-center gap-1 z-10">
                  <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 2a4 4 0 00-4 4v2H5a1 1 0 00-1 1v7a2 2 0 002 2h8a2 2 0 002-2v-7a1 1 0 00-1-1h-1V6a4 4 0 00-4-4zm2 6V6a2 2 0 10-4 0v2h4z" />
                  </svg>
                  Locked
                </div>
              )}
              {!imageLoaded && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                </div>
              )}
              <img
                src={imageUrl}
                alt={character.name}
                className={`w-full h-full object-contain p-2 group-hover:scale-110 transition-transform duration-500 ease-out ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                onError={handleImageError}
                onLoad={handleImageLoad}
              />
            </>
          ) : (
            <div className="text-6xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
              {character.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div className="flex-1 flex flex-col p-4 md:p-5">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 group-hover:text-primary-600 transition-colors">
            {character.name}
          </h3>
          {isPasswordProtected && (
            <div className="mb-2">
              <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-sm border border-amber-100">
                Password Required
              </span>
            </div>
          )}
          <p className="text-gray-500 text-sm flex-1 mb-4 line-clamp-3 leading-relaxed">
            {character.description}
          </p>
          <button className="bg-white border border-gray-200 text-gray-900 hover:border-primary-200 hover:text-primary-700 hover:shadow-sm px-4 py-2 rounded-xl text-sm font-medium transition-all w-full mt-auto">
            Start Chatting
          </button>
        </div>
      </div>
    </Link>
  );
}


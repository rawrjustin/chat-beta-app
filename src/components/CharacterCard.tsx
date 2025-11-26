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
    <Link to={`/chat/${character.id}`} className="block group h-full relative">
      <div className="card h-full flex flex-col bg-white border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 rounded-2xl overflow-hidden relative z-0">
        
        {/* Avatar Section */}
        <div className="relative aspect-square sm:aspect-[4/3] bg-gradient-to-br from-primary-50 via-white to-secondary-50 overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-[0.03]" />
          
          {hasAvatar && !imageError ? (
            <>
              {!imageLoaded && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                </div>
              )}
              <img
                src={imageUrl}
                alt={character.name}
                className={`w-full h-full object-contain p-4 transition-transform duration-500 ease-out group-hover:scale-110 ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                onError={handleImageError}
                onLoad={handleImageLoad}
              />
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-6xl font-bold bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">
                {character.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}

          {/* Overlay Gradient on Hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        {/* Content Section */}
        <div className="flex-1 p-5 flex flex-col relative">
           {/* Badges */}
           <div className="absolute -top-3 right-4 flex gap-2">
            {isPasswordProtected && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-100 px-2.5 py-1 rounded-full shadow-sm">
                <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 2a4 4 0 00-4 4v2H5a1 1 0 00-1 1v7a2 2 0 002 2h8a2 2 0 002-2v-7a1 1 0 00-1-1h-1V6a4 4 0 00-4-4zm2 6V6a2 2 0 10-4 0v2h4z" />
                </svg>
                Locked
              </span>
            )}
          </div>

          <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors line-clamp-1">
            {character.name}
          </h3>
          
          <p className="text-sm text-gray-500 line-clamp-3 leading-relaxed mb-4">
            {character.description}
          </p>

          <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-50">
            <span className="text-xs font-medium text-gray-400 group-hover:text-primary-500 transition-colors uppercase tracking-wider">
              Chat now
            </span>
            <div className="w-8 h-8 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center transform translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}


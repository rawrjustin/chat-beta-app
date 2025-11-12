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
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);

  const avatarUrlRaw = (character.avatar_url ?? character.avatar ?? '').trim();
  const hasAvatar = avatarUrlRaw !== '';
  const imageUrl = hasAvatar ? normalizeAvatarUrl(avatarUrlRaw) : '';

  const handleImageError = () => {
    console.error('Failed to load avatar image:', {
      url: avatarUrlRaw,
      normalizedUrl: imageUrl,
      character: character.name,
    });
    setImageError(true);
  };

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    const dimensions = {
      width: img.naturalWidth,
      height: img.naturalHeight,
    };
    console.log('Character image dimensions:', {
      character: character.name,
      dimensions,
      aspectRatio: `${dimensions.width} / ${dimensions.height}`,
      url: imageUrl,
    });
    setImageDimensions(dimensions);
    setImageLoaded(true);
  };

  return (
    <Link to={`/chat/${character.id}`} className="block group">
      <div className="card h-full flex flex-col group-hover:scale-[1.02] transition-transform duration-200">
        <div 
          className="bg-gradient-to-br from-purple-100 via-blue-100 to-purple-200 flex items-center justify-center overflow-hidden relative"
          style={{
            aspectRatio: imageDimensions 
              ? `${imageDimensions.width} / ${imageDimensions.height}` 
              : '5 / 6',
            minHeight: '200px',
          }}
        >
          {hasAvatar && !imageError ? (
            <>
              {!imageLoaded && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                </div>
              )}
              <img
                src={imageUrl}
                alt={character.name}
                className={`w-full h-full object-contain group-hover:scale-110 transition-transform duration-300 ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                onError={handleImageError}
                onLoad={handleImageLoad}
              />
            </>
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


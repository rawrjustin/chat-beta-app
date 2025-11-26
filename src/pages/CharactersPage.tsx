import { useState, useEffect } from 'react';
import { CharacterCard } from '../components/CharacterCard';
import { getCharacters } from '../utils/api';
import { extractAvatarUrl, normalizeAvatarUrl } from '../utils/avatar';
import type { CharacterResponse } from '../types/api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { setCharacterNames } from '../utils/storage';

export function CharactersPage() {
  const [characters, setCharacters] = useState<CharacterResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCharacters = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await getCharacters();
        const sortedCharacters = [...data.characters].sort((a, b) => {
          const orderA = a.display_order ?? Infinity;
          const orderB = b.display_order ?? Infinity;
          return orderA - orderB;
        });
        const enhancedCharacters = sortedCharacters.map((character) => {
          const extracted = extractAvatarUrl(character) ?? character.avatar_url;
          return {
            ...character,
            avatar_url: normalizeAvatarUrl(extracted),
          };
        });
        setCharacters(enhancedCharacters);
        
        // Populate character name cache for Mixpanel tracking
        const nameMappings = enhancedCharacters
          .filter((char) => char.config_id && char.name)
          .map((char) => ({
            configId: char.config_id,
            name: char.name!,
          }));
        if (nameMappings.length > 0) {
          setCharacterNames(nameMappings);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load characters';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCharacters();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 relative">
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20 relative">
        <div className="text-center mb-10 sm:mb-14 md:mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 mb-4 px-4">
            Explore Our Characters
          </h1>
          <p className="text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto px-4 leading-relaxed mb-8">
            Discover a diverse collection of AI characters, each with their own unique story
            waiting to be told.
          </p>

          {/* Search Visual */}
          <div className="max-w-xl mx-auto px-4 relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-primary-200 to-secondary-200 rounded-2xl blur-lg opacity-20 group-hover:opacity-30 transition-opacity" />
            <div className="relative bg-white border border-gray-200 rounded-2xl shadow-sm flex items-center p-2 focus-within:ring-2 focus-within:ring-primary-500/20 focus-within:border-primary-500 transition-all">
              <svg className="w-5 h-5 text-gray-400 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input 
                type="text" 
                placeholder="Find a character..." 
                className="w-full px-4 py-2 outline-none text-gray-700 placeholder-gray-400 bg-transparent"
                onChange={(e) => {
                  // Basic client-side search could be implemented here if desired
                  const term = e.target.value.toLowerCase();
                  // For now, this is just a visual enhancement request
                }}
              />
            </div>
          </div>
        </div>

        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner />
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800 text-sm">
              <span className="font-semibold">Error loading characters:</span> {error}
            </p>
          </div>
        )}

        {!isLoading && !error && characters.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">No characters available at this time.</p>
          </div>
        )}

        {!isLoading && !error && characters.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {characters.map((character) => (
              <CharacterCard
                key={character.config_id}
                character={{
                  id: character.config_id,
                  name: character.name || character.config_id,
                  description: character.description || 'No description available',
                  avatar_url: character.avatar_url,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


import { useState, useEffect } from 'react';
import { CharacterCard } from '../components/CharacterCard';
import { getCharacters } from '../utils/api';
import type { CharacterResponse } from '../types/api';
import { LoadingSpinner } from '../components/LoadingSpinner';

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
        setCharacters(sortedCharacters);
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20">
        <div className="text-center mb-8 sm:mb-12 md:mb-16">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-3 sm:mb-4 px-4">Explore Our Characters</h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto px-4">
            Discover a diverse collection of AI characters, each with their own unique story
            waiting to be told
          </p>
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
                  avatar: character.avatar_url,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


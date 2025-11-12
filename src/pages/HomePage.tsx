import { useState, useEffect, useMemo, useRef } from 'react';
import { CharacterCard } from '../components/CharacterCard';
import { getCharacters } from '../utils/api';
import { extractAvatarUrl, normalizeAvatarUrl } from '../utils/avatar';
import type { CharacterResponse } from '../types/api';
import { LoadingSpinner } from '../components/LoadingSpinner';

export function HomePage() {
  const [characters, setCharacters] = useState<CharacterResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCharacters = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await getCharacters();
        // Sort by display_order if provided, otherwise keep original order
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
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load characters';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCharacters();
  }, []);

  const heroCharacters = useMemo<
    {
      id: string;
      name: string;
      avatarUrl: string;
      messagePairs: Array<{ user: string; ai: string }>;
    }[]
  >(
    () => [
      {
        id: 'river',
        name: 'River',
        avatarUrl:
          normalizeAvatarUrl(
            characters.find((character) => character.name?.toLowerCase() === 'river')
              ?.avatar_url
          ) ||
          'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80',
        messagePairs: [
          {
            user: 'Hey River, where are we dropping tonight?',
            ai: 'River: Neon District—rumor says the glitch storms are spawning rare loot.',
          },
          {
            user: 'What should I watch out for?',
            ai: 'River: Watch the rooftops. Syndicate snipers love camping the uplink towers.',
          },
        ],
      },
    ],
    [characters]
  );

  const heroIndexRef = useRef(0);
  const [heroIndex, setHeroIndex] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      heroIndexRef.current = (heroIndexRef.current + 1) % heroCharacters.length;
      setHeroIndex(heroIndexRef.current);
    }, 8000);

    return () => window.clearInterval(interval);
  }, [heroCharacters.length]);

  const activeHero = heroCharacters[heroIndex];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-900 via-purple-900 to-black text-white relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.25),_rgba(15,23,42,0.2))]" />
          <div className="absolute inset-0 backdrop-blur-md" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <span className="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-4 py-1.5 rounded-full text-xs uppercase tracking-[0.2em] font-semibold mb-6">
                Featured Character
                <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              </span>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
                Dive back into Story World with
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-sky-300 via-purple-200 to-rose-300">
                  {activeHero.name}
                </span>
              </h1>
              <p className="text-base sm:text-lg text-slate-200 mb-6 max-w-xl">
                Preview the energy before you jump in. Each hero showcases a glimpse of the chaos,
                charm, and lore waiting inside their chat.
              </p>
            </div>

            <div className="relative">
              <div className="absolute -top-8 -right-6 sm:-right-12 h-24 w-24 sm:h-32 sm:w-32 bg-sky-400/10 rounded-full blur-3xl" />
              <div className="absolute -bottom-8 -left-10 sm:-left-16 h-32 w-32 sm:h-40 sm:w-40 bg-purple-500/10 rounded-full blur-3xl" />

              <div className="relative bg-white/8 border border-white/10 rounded-3xl p-5 sm:p-6 shadow-2xl backdrop-blur-lg">
                <div className="flex items-start gap-4 mb-5">
                  <div className="h-20 w-20 rounded-2xl overflow-hidden border border-white/20 shadow-lg">
                    <img
                      src={activeHero.avatarUrl}
                      alt={activeHero.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-semibold text-white mb-1">
                      {activeHero.name}
                    </h2>
                    <p className="text-sm text-slate-300">Glitch Runner • Midnight Syndicate Exile</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {activeHero.messagePairs.map((pair, index) => (
                    <div key={`${activeHero.id}-message-${index}`} className="space-y-3">
                      <div className="flex gap-3 items-start">
                        <div className="flex-shrink-0 h-9 w-9 rounded-full bg-white/20 flex items-center justify-center text-xs font-semibold text-white/80">
                          You
                        </div>
                        <div className="flex-1 bg-white/15 border border-white/10 rounded-2xl px-4 py-3 text-sm text-slate-100 shadow-lg shadow-black/20">
                          {pair.user}
                        </div>
                      </div>
                      <div className="flex gap-3 items-start">
                        <div className="flex-shrink-0 h-9 w-9 rounded-full overflow-hidden border border-white/20">
                          <img
                            src={activeHero.avatarUrl}
                            alt={`${activeHero.name} avatar`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 bg-white border border-white/70 rounded-2xl px-4 py-3 text-sm text-slate-900 shadow-lg shadow-black/25">
                          {pair.ai}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-slate-300">
                  <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                  Live Story World Demo
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 flex items-center gap-3">
            {heroCharacters.map((hero, index) => (
              <button
                key={hero.id}
                type="button"
                onClick={() => {
                  heroIndexRef.current = index;
                  setHeroIndex(index);
                }}
                className={`h-2 w-10 rounded-full transition-all ${
                  heroIndex === index ? 'bg-white' : 'bg-white/30'
                }`}
                aria-label={`Show ${hero.name}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
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
      </main>
    </div>
  );
}


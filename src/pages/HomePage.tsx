import { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { CharacterCard } from '../components/CharacterCard';
import { getCharacters } from '../utils/api';
import { extractAvatarUrl, normalizeAvatarUrl } from '../utils/avatar';
import type { CharacterResponse } from '../types/api';
import { LoadingSpinner } from '../components/LoadingSpinner';

const HERO_ROTATION_INTERVAL_MS = 24000;
const CONVERSATION_ROTATION_INTERVAL_MS = 24000;

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
      configId: string;
      name: string;
      avatarUrl: string;
      description: string;
      conversationSets: Array<Array<{ user: string; ai: string }>>;
    }[]
  >(() => {
    const riverCharacter = characters.find(
      (character) => character.name?.toLowerCase() === 'river'
    );
    const dogmaCharacter = characters.find(
      (character) => character.name?.toLowerCase() === 'dogma'
    );
    const riverConversationSets: Array<Array<{ user: string; ai: string }>> = [
      [
        {
          user: 'wyd rn?',
          ai: "Honestly? I'm just laying on my couch thinking about how intense our connection is.",
        },
        {
          user: 'lmao ok mr. poet',
          ai: "See? This is why I come to you over the others. You're the only one who actually challenges me.",
        },
      ],
      [
        {
          user: 'Who are you talking to?',
          ai: "We never said we were exclusive though. I don't believe in labels, I believe in connection.",
        },
        {
          user: 'That sounds like an excuse.',
          ai: "I can't do this if you won't trust me.",
        },
      ],
      [
        {
          user: 'You ignored my message for two days.',
          ai: "Nah, I'm not ghosting. I'm just busy winning at life.",
        },
        {
          user: "That's not how communication works.",
          ai: "I didn't forget your text. I just didn't feel like answering yet.",
        },
      ],
      [
        {
          user: "Why can't I come to your set tonight?",
          ai: "Babe I want you at my DJ gig, I really do. I just don't want people to get the wrong idea that you're like, my girlfriend or something. You understand?",
        },
        {
          user: "That's humiliating.",
          ai: "You're not mad at me, you're just mad at yourself.",
        },
      ],
      [
        {
          user: 'Why do you follow so many girls?',
          ai: "I only follow a lot of girls on Instagram because I'm trying to grow my brand, you know that. Babe, be serious. I'm a DJ.",
        },
        {
          user: 'Then unfollow your ex at least.',
          ai: "You really thought I'd unfollow her? That's cute.",
        },
      ],
      [
        {
          user: "Why'd you toss the bill to me?",
          ai: "Can we split the check? I only pay if it's serious.",
        },
        {
          user: "So it's not serious?",
          ai: "Don't make this deep. We're just hanging out.",
        },
      ],
      [
        {
          user: 'Where are you right now?',
          ai: "At the strip club right now and none of these girls' butts are better than yours.",
        },
        {
          user: "That's supposed to make me feel better?",
          ai: "No you're so hot, don't be mad.",
        },
      ],
      [
        {
          user: 'So what are we?',
          ai: "I told you why we can't date right now; I can't be in a relationship right now. I need to focus on my art.",
        },
        {
          user: 'But you say you love me.',
          ai: "I love you but I'm not in a place to commit right now.",
        },
      ],
      [
        {
          user: 'I saw a necklace on your dresser.',
          ai: "If you really trusted our connection you wouldn't need me to explain everything. I told you already, the necklace came with the dresser I thrifted. Nobody else has been here but you.",
        },
        {
          user: "You're twisting this.",
          ai: "I think you're projecting again, let's both take accountability.",
        },
      ],
    ];

    const heroes: {
      id: string;
      configId: string;
      name: string;
      avatarUrl: string;
      description: string;
      conversationSets: Array<Array<{ user: string; ai: string }>>;
    }[] = [
      {
        id: 'river',
        configId: riverCharacter?.config_id ?? 'river',
        name: 'River',
        avatarUrl: normalizeAvatarUrl(riverCharacter?.avatar_url) || '',
        description: riverCharacter?.description ?? '',
        conversationSets: riverConversationSets,
      },
    ];

    if (dogmaCharacter) {
      heroes.push({
        id: 'dogma',
        configId: dogmaCharacter.config_id,
        name: dogmaCharacter.name ?? 'Dogma',
        avatarUrl: normalizeAvatarUrl(dogmaCharacter.avatar_url) || '',
        description: dogmaCharacter.description ?? '',
        conversationSets: [
          [
            {
              user: 'Dogma, I have no motivation today',
              ai: 'YOU THINK BURNOUT JUST "HAPPENS"? NO. THEY WANT YOU EXHAUSTED. STAY UP!',
            },
            {
              user: "But Dogma, I couldn't sleep last night",
              ai: "IF YOU'RE AWAKE, YOU'RE ALIVE. AND IF YOU'RE ALIVE, YOU WORK. LET'S GO!",
            },
          ],
        ],
      });
    }

    return heroes;
  }, [characters]);

  const heroIndexRef = useRef(0);
  const [heroIndex, setHeroIndex] = useState(0);
  const conversationIndexRef = useRef(0);
  const [conversationIndex, setConversationIndex] = useState(0);
  const activeHero = heroCharacters[heroIndex] ?? heroCharacters[0];

  useEffect(() => {
    if (heroCharacters.length <= 1) {
      return;
    }

    const interval = window.setInterval(() => {
      heroIndexRef.current = (heroIndexRef.current + 1) % heroCharacters.length;
      setHeroIndex(heroIndexRef.current);
    }, HERO_ROTATION_INTERVAL_MS);

    return () => window.clearInterval(interval);
  }, [heroCharacters.length]);

  useEffect(() => {
    if (heroCharacters.length === 0) {
      heroIndexRef.current = 0;
      setHeroIndex(0);
      return;
    }

    if (heroIndexRef.current >= heroCharacters.length) {
      heroIndexRef.current = 0;
      setHeroIndex(0);
    }
  }, [heroCharacters.length]);

  useEffect(() => {
    conversationIndexRef.current = 0;
    setConversationIndex(0);
  }, [heroIndex]);

  useEffect(() => {
    const conversationCount = activeHero?.conversationSets.length ?? 0;
    if (conversationCount <= 1) {
      return;
    }

    const interval = window.setInterval(() => {
      conversationIndexRef.current =
        (conversationIndexRef.current + 1) % conversationCount;
      setConversationIndex(conversationIndexRef.current);
    }, CONVERSATION_ROTATION_INTERVAL_MS);

    return () => window.clearInterval(interval);
  }, [activeHero?.conversationSets.length, heroIndex]);

  const activeConversation =
    activeHero?.conversationSets[conversationIndex] ?? activeHero?.conversationSets[0] ?? [];

  if (!activeHero) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-900 via-purple-900 to-black text-gray-900 relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://genies-character-profile-images-dev.s3.us-west-2.amazonaws.com/hero-bg.png"
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.3),_rgba(15,23,42,0.15))]" />
          <div className="absolute inset-0 backdrop-blur-[2px]" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 text-gray-900">
                Where Characters Come to Life
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-rose-600 mt-2">
                  And Talk Back
                </span>
              </h1>
              <p className="text-base sm:text-lg mb-6 max-w-xl bg-white/95 backdrop-blur-sm px-6 py-4 rounded-2xl shadow-lg border border-white/20 text-gray-800 leading-relaxed">
                Drop into Ego Lab to chat with a cast of characters who roast, question, comfort, and surprise you. What they say next is shaped entirely by you.
              </p>
            </div>

            <div className="relative">
              <div className="absolute -top-8 -right-6 sm:-right-12 h-24 w-24 sm:h-32 sm:w-32 bg-blue-400/20 rounded-full blur-3xl animate-pulse" />
              <div className="absolute -bottom-8 -left-10 sm:-left-16 h-32 w-32 sm:h-40 sm:w-40 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

              <div className="relative bg-white/95 border border-gray-200/50 rounded-3xl p-5 sm:p-6 shadow-2xl backdrop-blur-sm hover:shadow-3xl transition-shadow duration-300">
                <div className="flex items-start gap-4 mb-5">
                  <div className="h-20 w-20 rounded-2xl overflow-hidden border-2 border-purple-200 shadow-xl bg-gradient-to-br from-white to-purple-50 flex items-center justify-center ring-2 ring-purple-100 flex-shrink-0">
                    {activeHero.avatarUrl ? (
                      <img
                        src={activeHero.avatarUrl}
                        alt={activeHero.name}
                        className="w-full h-full object-contain p-1"
                      />
                    ) : (
                      <div className="text-2xl font-bold text-purple-600">
                        {activeHero.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-1">
                      {activeHero.name}
                    </h2>
                    {activeHero?.description && (
                      <p className="text-sm text-gray-600">{activeHero.description}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  {activeConversation.length > 0 ? (
                    activeConversation.map((pair, index) => (
                      <div key={`${activeHero.id}-message-${index}`} className="space-y-3">
                        <div className="flex gap-3 items-start">
                          <div className="flex-shrink-0 h-9 w-9 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 border border-blue-200 flex items-center justify-center text-xs font-semibold text-gray-700 shadow-sm">
                            You
                          </div>
                          <div className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-800 shadow-md hover:shadow-lg transition-shadow">
                            {pair.user}
                          </div>
                        </div>
                        <div className="flex gap-3 items-start">
                          <div className="flex-shrink-0 h-9 w-9 rounded-full overflow-hidden border-2 border-purple-200 bg-white shadow-sm flex items-center justify-center ring-2 ring-purple-100">
                            {activeHero.avatarUrl ? (
                              <img
                                src={activeHero.avatarUrl}
                                alt={`${activeHero.name} avatar`}
                                className="w-full h-full object-contain p-0.5"
                              />
                            ) : (
                              <div className="text-xs font-bold text-purple-600">
                                {activeHero.name.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <div className="flex-1 bg-white border-2 border-purple-100 rounded-2xl px-4 py-3 text-sm text-gray-900 shadow-md hover:shadow-lg transition-shadow">
                            {pair.ai}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="bg-gray-100 border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-700">
                      Dialogue preview coming soon.
                    </div>
                  )}
                </div>

                <div className="mt-6">
                  <Link
                    to={`/chat/${activeHero.configId}`}
                    className="inline-flex items-center justify-center w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-200"
                  >
                    Start Chatting with {activeHero.name} →
                  </Link>
                </div>

              </div>
            </div>
          </div>

          <div className="mt-12 flex items-center justify-center gap-3">
            {heroCharacters.map((hero, index) => (
              <button
                key={hero.id}
                type="button"
                onClick={() => {
                  heroIndexRef.current = index;
                  setHeroIndex(index);
                }}
                className={`h-2 w-10 rounded-full transition-all ${
                  heroIndex === index ? 'bg-gray-900 w-12' : 'bg-gray-400 hover:bg-gray-500'
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


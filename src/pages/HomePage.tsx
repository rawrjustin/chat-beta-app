import { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { CharacterCard } from '../components/CharacterCard';
import { getCharacters } from '../utils/api';
import { extractAvatarUrl, normalizeAvatarUrl } from '../utils/avatar';
import type { CharacterResponse } from '../types/api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { setCharacterNames } from '../utils/storage';

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
      <section className="bg-gray-900 relative overflow-hidden">
        {/* Abstract Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-[30%] -left-[10%] w-[70%] h-[70%] bg-primary-600/20 rounded-full blur-[120px] animate-pulse-slow" />
          <div className="absolute top-[20%] -right-[10%] w-[60%] h-[60%] bg-secondary-600/20 rounded-full blur-[100px] animate-pulse-slow" style={{ animationDelay: '1.5s' }} />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[80%] h-[40%] bg-purple-900/30 rounded-full blur-[120px]" />
          <div className="absolute inset-0 bg-grid-pattern opacity-[0.03]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-primary-200 text-sm font-medium mb-6 backdrop-blur-sm">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                Now in Public Beta
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold mb-6 text-white tracking-tight leading-[1.1]">
                Chat with the most <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-secondary-400">unhinged egos</span> on earth
              </h1>
              <p className="text-lg sm:text-xl mb-8 max-w-xl text-gray-300 leading-relaxed font-light">
                Drop into Ego Lab to chat with a cast of characters who roast, question, comfort, and surprise you. What they say next is shaped entirely by you.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <Link
                  to={`/chat/${activeHero.configId}`}
                  className="btn-primary text-lg px-8 py-4 shadow-glow"
                >
                  Start Chatting
                </Link>
                <Link
                  to="/characters"
                  className="px-8 py-4 rounded-xl bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 transition-all backdrop-blur-sm"
                >
                  View All Characters
                </Link>
              </div>
            </div>

            <div className="relative perspective-1000">
              {/* Decorative elements behind card */}
              <div className="absolute -top-12 -right-12 w-48 h-48 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full blur-3xl opacity-20 animate-pulse" />
              <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }} />

              <div className="relative bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl transition-transform duration-500 hover:scale-[1.01] hover:shadow-glow">
                {/* Card Header */}
                <div className="flex items-start gap-5 mb-8">
                  <div className="h-20 w-20 rounded-2xl overflow-hidden border-2 border-white/10 shadow-lg bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center flex-shrink-0 relative group">
                    <div className="absolute inset-0 bg-primary-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {activeHero.avatarUrl ? (
                      <img
                        src={activeHero.avatarUrl}
                        alt={activeHero.name}
                        className="w-full h-full object-contain p-1"
                      />
                    ) : (
                      <div className="text-3xl font-bold text-primary-400">
                        {activeHero.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                      {activeHero.name}
                    </h2>
                    {activeHero?.description && (
                      <p className="text-sm text-gray-400 leading-relaxed">{activeHero.description}</p>
                    )}
                  </div>
                </div>

                {/* Chat Preview */}
                <div className="space-y-6">
                  {activeConversation.length > 0 ? (
                    activeConversation.map((pair, index) => (
                      <div key={`${activeHero.id}-message-${index}`} className="space-y-4">
                        {/* User Message */}
                        <div className="flex justify-end">
                          <div className="bg-primary-600 text-white rounded-2xl rounded-tr-sm px-5 py-3.5 text-sm sm:text-base shadow-lg max-w-[85%]">
                            {pair.user}
                          </div>
                        </div>
                        
                        {/* AI Message */}
                        <div className="flex gap-4 items-end">
                          <div className="flex-shrink-0 h-8 w-8 rounded-full overflow-hidden border border-white/10 bg-white/5 flex items-center justify-center">
                            {activeHero.avatarUrl ? (
                              <img
                                src={activeHero.avatarUrl}
                                alt={`${activeHero.name} avatar`}
                                className="w-full h-full object-contain p-0.5"
                              />
                            ) : (
                              <div className="text-xs font-bold text-primary-400">
                                {activeHero.name.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <div className="bg-white/10 border border-white/5 text-gray-100 rounded-2xl rounded-tl-sm px-5 py-3.5 text-sm sm:text-base backdrop-blur-sm shadow-sm max-w-[85%]">
                            {pair.ai}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      Preview loading...
                    </div>
                  )}
                </div>

                <div className="mt-8 pt-6 border-t border-white/10 flex justify-between items-center">
                   <div className="flex gap-2">
                    {heroCharacters.map((hero, index) => (
                      <button
                        key={hero.id}
                        type="button"
                        onClick={() => {
                          heroIndexRef.current = index;
                          setHeroIndex(index);
                        }}
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          heroIndex === index ? 'bg-primary-500 w-8' : 'bg-white/20 w-2 hover:bg-white/40'
                        }`}
                        aria-label={`Show ${hero.name}`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-gray-500 font-mono">LIVE PREVIEW</span>
                </div>

              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner />
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
            <p className="text-red-800 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span className="font-semibold">Unable to load characters:</span> {error}
            </p>
          </div>
        )}

        {!isLoading && !error && characters.length === 0 && (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
            </div>
            <p className="text-gray-500 text-lg">No characters available at this time.</p>
          </div>
        )}

        {!isLoading && !error && characters.length > 0 && (
          <>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Featured Characters</h2>
              {/* Optional filter/sort controls could go here */}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
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
          </>
        )}
      </main>
    </div>
  );
}


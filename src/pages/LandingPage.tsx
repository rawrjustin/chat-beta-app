import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CharacterCard } from '../components/CharacterCard';
import { getCharacters } from '../utils/api';
import type { CharacterResponse } from '../types/api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { PaywallModal } from '../components/PaywallModal';

export function LandingPage() {
  const [characters, setCharacters] = useState<CharacterResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [characterInput, setCharacterInput] = useState('');
  const [showPaywall, setShowPaywall] = useState(false);

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
        // Debug: Log character data to see avatar_url structure
        console.log('Characters data:', sortedCharacters.map(c => ({
          name: c.name,
          config_id: c.config_id,
          avatar_url: c.avatar_url,
        })));
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
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(/bg.png)',
          }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50/80 via-white/80 to-blue-50/80"></div>
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 md:py-32">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-4 sm:mb-6 px-4">
              Every character has a{' '}
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                story
              </span>
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-8 sm:mb-12 px-4">
              Discover and chat with AI-powered characters. Each conversation is a new adventure,
              every character has a unique personality waiting to be explored.
            </p>
            
            {/* Character Creation Input */}
            <div className="max-w-2xl mx-auto mb-6 sm:mb-8 px-4">
              <div className="relative">
                <textarea
                  value={characterInput}
                  onChange={(e) => setCharacterInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey && characterInput.trim()) {
                      e.preventDefault();
                      setShowPaywall(true);
                    }
                  }}
                  placeholder="Create any character you imagine with a few lines"
                  className="w-full px-4 sm:px-6 py-4 sm:py-5 pr-20 sm:pr-32 text-base sm:text-lg rounded-xl sm:rounded-2xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none focus:ring-4 focus:ring-purple-100 transition-all resize-none bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl"
                  rows={4}
                />
                <div className="absolute bottom-3 sm:bottom-4 right-3 sm:right-4 flex items-center gap-2">
                  <span className="text-xs sm:text-sm text-gray-400 hidden sm:inline">Press Enter to create</span>
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>

            {/* Explore Existing Characters Button */}
            <div className="flex justify-center px-4">
              <Link
                to="/characters"
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 sm:px-12 py-4 sm:py-5 rounded-xl text-lg sm:text-xl font-semibold hover:shadow-2xl hover:scale-105 transition-all inline-block w-full sm:w-auto text-center"
              >
                Explore Existing Characters
              </Link>
            </div>

            <PaywallModal isOpen={showPaywall} onClose={() => setShowPaywall(false)} />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-12 sm:py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">How It Works</h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto px-4">
              Start chatting with AI characters in three simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-600">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Choose a Character</h3>
              <p className="text-gray-600">
                Browse our collection of unique AI characters, each with their own personality and
                story.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-600">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Start Chatting</h3>
              <p className="text-gray-600">
                Begin a conversation and watch as the character responds with personality,
                context, and creativity.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-600">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Explore Stories</h3>
              <p className="text-gray-600">
                Every conversation is unique. Discover new perspectives, stories, and adventures
                with each chat.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">Why Story World?</h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto px-4">
              Powered by advanced AI to deliver authentic, engaging conversations
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-blue-100 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">AI-Powered</h3>
              <p className="text-gray-600">
                Advanced language models create authentic, context-aware conversations that feel
                natural and engaging.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-blue-100 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Unique Personalities</h3>
              <p className="text-gray-600">
                Each character has distinct traits, backgrounds, and conversational styles that
                make every interaction memorable.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-blue-100 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Instant Access</h3>
              <p className="text-gray-600">
                No sign-up required to start chatting. Jump right into conversations and explore
                characters at your own pace.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Characters Section */}
      <section id="characters" className="py-12 sm:py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">Meet Our Characters</h2>
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
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-r from-purple-600 to-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3 sm:mb-4 px-4">
            Ready to start your story?
          </h2>
          <p className="text-lg sm:text-xl text-purple-100 mb-6 sm:mb-8 px-4">
            Join thousands of users exploring conversations with AI characters
          </p>
          <Link
            to="/#characters"
            className="bg-white text-purple-600 px-6 sm:px-8 py-3 sm:py-4 rounded-xl text-base sm:text-lg font-semibold hover:shadow-xl hover:scale-105 transition-all inline-block"
          >
            Get Started Free
          </Link>
        </div>
      </section>
    </div>
  );
}


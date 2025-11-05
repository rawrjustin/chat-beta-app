import { CharacterCard } from '../components/CharacterCard';
import type { Character } from '../types/api';

// Hardcoded character list
const CHARACTERS: Character[] = [
  {
    id: 'CHAR_6c606003-8b02-4943-8690-73b9b8fe3ae4',
    name: 'Default Character',
    description: 'A friendly AI companion ready to chat about anything. Engaging and helpful conversations await!',
  },
  {
    id: 'CHAR_example_2',
    name: 'Adventure Guide',
    description: 'Your personal adventure guide, always ready to explore new ideas and share exciting stories.',
  },
  {
    id: 'CHAR_example_3',
    name: 'Tech Mentor',
    description: 'Learn about technology, programming, and innovation with an expert who loves to teach.',
  },
  {
    id: 'CHAR_example_4',
    name: 'Creative Writer',
    description: 'Spark your creativity with a literary companion who helps craft stories and explores imagination.',
  },
];

export function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-3xl font-bold text-airbnb-dark">AI Characters</h1>
          <p className="text-gray-600 mt-1">Choose a character to start chatting</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {CHARACTERS.map((character) => (
            <CharacterCard key={character.id} character={character} />
          ))}
        </div>
      </main>
    </div>
  );
}


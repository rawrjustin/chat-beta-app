export function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20">
        <div className="text-center mb-8 sm:mb-12 md:mb-16">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-3 sm:mb-4 px-4">About Story World</h1>
          <p className="text-lg sm:text-xl text-gray-600 px-4">
            Every character has a story. We're building the future of interactive storytelling.
          </p>
        </div>

        <div className="prose prose-lg max-w-none">
          <section className="mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">Our Mission</h2>
            <p className="text-gray-700 text-lg leading-relaxed mb-4">
              At Story World, we believe that every character has a unique story waiting to be
              discovered. Our mission is to create immersive, engaging conversations with
              AI-powered characters that feel authentic, memorable, and meaningful.
            </p>
            <p className="text-gray-700 text-lg leading-relaxed">
              We're not just building a chat platform—we're creating a new way to explore
              narratives, personalities, and experiences through the power of artificial
              intelligence.
            </p>
          </section>

          <section className="mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">What We Do</h2>
            <p className="text-gray-700 text-lg leading-relaxed mb-4">
              Story World connects users with a diverse collection of AI characters, each carefully
              crafted with unique personalities, backgrounds, and conversational styles. Whether
              you're looking for creative inspiration, engaging conversations, or simply exploring
              new perspectives, our characters are ready to share their stories with you.
            </p>
            <p className="text-gray-700 text-lg leading-relaxed">
              Powered by cutting-edge language models, every conversation is unique, context-aware,
              and designed to create memorable interactions that go beyond simple Q&A.
            </p>
          </section>

          <section className="mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">Our Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Innovation</h3>
                <p className="text-gray-600">
                  We're constantly pushing the boundaries of what's possible with AI and
                  conversational technology.
                </p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Authenticity</h3>
                <p className="text-gray-600">
                  Every character is designed to feel real, with consistent personalities and
                  believable interactions.
                </p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Accessibility</h3>
                <p className="text-gray-600">
                  We believe great storytelling should be accessible to everyone, regardless of
                  technical expertise.
                </p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Privacy</h3>
                <p className="text-gray-600">
                  Your conversations are private. We're committed to protecting your data and
                  respecting your privacy.
                </p>
              </div>
            </div>
          </section>

          <section className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-6 sm:p-8 text-white text-center">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">Join Our Journey</h2>
            <p className="text-purple-100 mb-4 sm:mb-6 text-base sm:text-lg">
              We're just getting started. Join us as we explore the endless possibilities of
              AI-powered storytelling.
            </p>
            <a
              href="/#characters"
              className="bg-white text-purple-600 px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all inline-block"
            >
              Explore Characters
            </a>
          </section>
        </div>
      </div>
    </div>
  );
}


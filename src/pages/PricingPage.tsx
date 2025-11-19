export function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-purple-600 to-blue-600">
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 md:py-32 text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4 sm:mb-6 px-4">
            Ego Lab Pro is Coming Soon
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-purple-100 max-w-3xl mx-auto mb-8 sm:mb-12 px-4">
            We're polishing the next evolution of Ego Lab. Join the waitlist to be the first to know when Pro launches.
          </p>
          <button
            type="button"
            disabled
            className="bg-white/80 text-purple-600 px-8 sm:px-12 py-4 sm:py-5 rounded-xl text-lg sm:text-xl font-semibold cursor-not-allowed"
            aria-disabled="true"
          >
            Pro Waitlist Opening Soon
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20">
        {/* Free Tier Info */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">You're currently on the free tier</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Access to all characters • 50 messages per day • Basic conversation features
          </p>
        </div>

        {/* Pro Preview Card */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-3xl shadow-2xl p-8 sm:p-12 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
            
            <div className="relative z-10">
              <div className="text-center mb-8">
                <div className="inline-block bg-white/80 text-purple-700 text-xs font-bold px-4 py-2 rounded-full mb-4 uppercase tracking-wide">
                  Coming Soon
                </div>
                <h3 className="text-3xl sm:text-4xl font-bold mb-2">Pro</h3>
                <div className="flex items-baseline justify-center mb-4">
                  <span className="text-4xl sm:text-5xl font-bold">Pricing TBA</span>
                </div>
                <p className="text-purple-100 text-lg">A sneak peek at what we're building to supercharge your Ego Lab experience.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <h4 className="font-semibold mb-2 text-lg">Unlimited Messages</h4>
                  <p className="text-purple-100 text-sm">Chat as much as you want with any character, no daily limits.</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <h4 className="font-semibold mb-2 text-lg">Create Custom Characters</h4>
                  <p className="text-purple-100 text-sm">Build your own AI characters with unique personalities and stories.</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <h4 className="font-semibold mb-2 text-lg">Advanced Features</h4>
                  <p className="text-purple-100 text-sm">Access to enhanced conversation features and character interactions.</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <h4 className="font-semibold mb-2 text-lg">Priority Support</h4>
                  <p className="text-purple-100 text-sm">Get help faster with priority customer support.</p>
                </div>
              </div>

              <button
                type="button"
                disabled
                className="w-full bg-white/80 text-purple-600 py-4 rounded-xl text-lg font-semibold cursor-not-allowed"
                aria-disabled="true"
              >
                Pro Launch Coming Soon
              </button>
            </div>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="mt-16 sm:mt-20">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 text-center mb-12">Preview What's Coming with Pro</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Unlimited Conversations</h3>
              <p className="text-gray-600">Chat without limits. Explore every character's story at your own pace.</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Create Your Characters</h3>
              <p className="text-gray-600">Bring your imagination to life. Design characters with unique personalities.</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Live Without Limits</h3>
              <p className="text-gray-600">From deep conversations to creative storytelling, experience it all.</p>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 sm:mt-20 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">What are you waiting for?</h2>
          <button
            type="button"
            disabled
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white/80 px-8 sm:px-12 py-4 sm:py-5 rounded-xl text-lg sm:text-xl font-semibold cursor-not-allowed"
            aria-disabled="true"
          >
            Pro Waitlist Coming Soon
          </button>
        </div>
      </div>
    </div>
  );
}


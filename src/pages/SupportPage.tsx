export function SupportPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Support Center</h1>
          <p className="text-xl text-gray-600">
            We're here to help. Find answers to common questions or contact our support team.
          </p>
        </div>

        {/* FAQ Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Frequently Asked Questions</h2>
          
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                How do I start chatting with a character?
              </h3>
              <p className="text-gray-600">
                Simply browse our character collection on the home page, click on any character
                that interests you, and start a conversation. No sign-up required!
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Is Story AI free to use?
              </h3>
              <p className="text-gray-600">
                Yes! We offer a free tier that includes access to all characters with 50 messages
                per day. Upgrade to Pro for unlimited messages and advanced features.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                How are the characters created?
              </h3>
              <p className="text-gray-600">
                Our characters are powered by advanced AI language models, each carefully
                configured with unique personalities, backgrounds, and conversational styles to
                create authentic and engaging interactions.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Can I create my own character?
              </h3>
              <p className="text-gray-600">
                Currently, character creation is available for Enterprise customers. If you're
                interested in custom characters, please contact our sales team.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Is my conversation data private?
              </h3>
              <p className="text-gray-600">
                Yes, we take privacy seriously. Conversations are not stored permanently and are
                only used within your active session. See our Privacy Policy for more details.
              </p>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 text-white">
          <h2 className="text-3xl font-bold mb-4">Still need help?</h2>
          <p className="text-purple-100 mb-6">
            Can't find what you're looking for? Our support team is ready to assist you.
          </p>
          <div className="space-y-4">
            <a
              href="mailto:support@storyai.com"
              className="block bg-white text-purple-600 px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all text-center"
            >
              Email Support
            </a>
            <div className="text-center text-purple-100">
              <p>Or reach us at:</p>
              <p className="font-semibold mt-2">support@storyai.com</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


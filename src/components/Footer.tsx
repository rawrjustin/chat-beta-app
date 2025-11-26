import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-lg flex items-center justify-center shadow-lg shadow-primary-900/50">
                <span className="text-white font-bold text-lg">E</span>
              </div>
              <span className="text-xl font-bold text-white">Ego Lab</span>
            </div>
            <p className="text-sm text-gray-400">
              Every character has a story. Discover and chat with AI-powered characters.
            </p>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Product</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="hover:text-white transition-colors">
                  Characters
                </Link>
              </li>
              <li>
                <Link to="/beta-signup" className="hover:text-white transition-colors">
                  3D Avatar Beta
                </Link>
              </li>
            </ul>
          </div>



          <div>
            <h3 className="text-white font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="https://vault.pactsafe.io/s/c6039daa-76fb-4b71-bb07-77676913b3fc/legal.html#contract-jktkfxmfc"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="https://vault.pactsafe.io/s/c6039daa-76fb-4b71-bb07-77676913b3fc/legal.html#contract-rm6xfx7wfj"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  Terms of Service
                </a>
              </li>

            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} Ego Lab. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}


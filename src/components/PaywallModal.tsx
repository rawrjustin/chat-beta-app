import { Link } from 'react-router-dom';

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PaywallModal({ isOpen, onClose }: PaywallModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-3 sm:top-4 right-3 sm:right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
        >
          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="text-center mb-4 sm:mb-6">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <svg className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Unlock Character Creation</h2>
          <p className="text-sm sm:text-base text-gray-600">
            Create custom AI characters with Pro or Enterprise plans
          </p>
        </div>

        <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
          <div className="bg-gray-50 rounded-xl p-3 sm:p-4">
            <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Pro Plan - $9/month</h3>
            <ul className="text-xs sm:text-sm text-gray-600 space-y-1">
              <li>✓ Unlimited character creation</li>
              <li>✓ Custom personalities and traits</li>
              <li>✓ Advanced conversation features</li>
            </ul>
          </div>
          <div className="bg-gray-50 rounded-xl p-3 sm:p-4">
            <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Enterprise - Custom</h3>
            <ul className="text-xs sm:text-sm text-gray-600 space-y-1">
              <li>✓ Everything in Pro</li>
              <li>✓ Team collaboration</li>
              <li>✓ Custom integrations</li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:gap-3">
          <Link
            to="/pricing"
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl text-sm sm:text-base font-semibold hover:shadow-lg transition-all text-center"
            onClick={onClose}
          >
            View Pricing Plans
          </Link>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-900 font-medium transition-colors text-sm sm:text-base"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}


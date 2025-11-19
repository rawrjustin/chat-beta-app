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
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Unlock 3D Avatar Creation</h2>
          <p className="text-sm sm:text-base text-gray-600">
            Instant access is limited. Join the private beta to create custom 3D avatars with our team.
          </p>
        </div>

        <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
          {[
            'Work alongside our avatar engineers for four weeks.',
            'Export-ready GLB/USDZ files plus streaming presets.',
            'Priority feature requests while the beta is active.',
          ].map((benefit) => (
            <div key={benefit} className="bg-gray-50 rounded-xl p-3 sm:p-4">
              <p className="text-sm sm:text-base text-gray-700 flex items-start gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-purple-500" />
                {benefit}
              </p>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-2 sm:gap-3">
          <Link
            to="/beta-signup"
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl text-sm sm:text-base font-semibold hover:shadow-lg transition-all text-center"
            onClick={onClose}
          >
            Apply for Beta Access
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


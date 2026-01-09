import { Link } from 'react-router-dom';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-surface-950">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-surface-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <Link to="/" className="flex items-center gap-2 sm:gap-3">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-surface-950" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1z" />
                </svg>
              </div>
              <span className="font-serif text-base sm:text-lg font-semibold text-white">Heritage</span>
            </Link>
            <Link to="/builder" className="btn-primary text-xs sm:text-sm py-1.5 sm:py-2 px-3 sm:px-6">
              Create
            </Link>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="pt-20 sm:pt-24 pb-12 sm:pb-16 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl sm:text-4xl font-bold text-white mb-4 sm:mb-8">Privacy Policy</h1>
          <p className="text-gray-400 mb-6 sm:mb-8 text-sm sm:text-base">Last updated: January 8, 2026</p>

          <div className="prose prose-invert max-w-none space-y-6 sm:space-y-8">
            <section>
              <h2 className="text-xl sm:text-2xl font-semibold text-white mb-3 sm:mb-4">1. Information We Collect</h2>
              <p className="text-gray-400 leading-relaxed mb-4">
                When you use Heritage AI, we collect the following types of information:
              </p>
              <ul className="list-disc list-inside text-gray-400 space-y-2">
                <li><strong className="text-white">Account Information:</strong> Email address, name, and password when you create an account</li>
                <li><strong className="text-white">Family Data:</strong> Names, birth dates, and relationships you enter to create your family tree</li>
                <li><strong className="text-white">Photos:</strong> Images you upload of family members for AI generation</li>
                <li><strong className="text-white">Payment Information:</strong> Processed securely through Stripe; we do not store card details</li>
                <li><strong className="text-white">Usage Data:</strong> How you interact with our service to improve functionality</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">2. How We Use Your Information</h2>
              <ul className="list-disc list-inside text-gray-400 space-y-2">
                <li>Generate AI-powered family tree artwork based on your input</li>
                <li>Process payments for premium downloads</li>
                <li>Send important service updates and communications</li>
                <li>Improve our AI models and service quality</li>
                <li>Prevent fraud and ensure platform security</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">3. Photo Storage & Processing</h2>
              <p className="text-gray-400 leading-relaxed mb-4">
                Photos you upload are:
              </p>
              <ul className="list-disc list-inside text-gray-400 space-y-2">
                <li>Temporarily stored on Cloudinary for AI processing</li>
                <li>Used only to generate your family tree artwork</li>
                <li>Not shared with third parties for any purpose</li>
                <li>Automatically deleted after 24 hours of generation</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">4. Data Security</h2>
              <p className="text-gray-400 leading-relaxed">
                We implement industry-standard security measures including encrypted connections (HTTPS),
                secure password hashing, and protected database access. Payment processing is handled
                entirely by Stripe, a PCI-DSS compliant payment processor.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">5. Third-Party Services</h2>
              <p className="text-gray-400 leading-relaxed mb-4">We use the following third-party services:</p>
              <ul className="list-disc list-inside text-gray-400 space-y-2">
                <li><strong className="text-white">Kie AI:</strong> For generating family tree artwork</li>
                <li><strong className="text-white">Cloudinary:</strong> For image storage and processing</li>
                <li><strong className="text-white">Stripe:</strong> For secure payment processing</li>
                <li><strong className="text-white">MongoDB Atlas:</strong> For secure data storage</li>
                <li><strong className="text-white">Google:</strong> For optional Google Sign-In authentication</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">6. Your Rights</h2>
              <p className="text-gray-400 leading-relaxed mb-4">You have the right to:</p>
              <ul className="list-disc list-inside text-gray-400 space-y-2">
                <li>Access your personal data</li>
                <li>Request correction of inaccurate data</li>
                <li>Request deletion of your account and data</li>
                <li>Export your data in a portable format</li>
                <li>Opt out of marketing communications</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">7. Cookies</h2>
              <p className="text-gray-400 leading-relaxed">
                We use essential cookies to maintain your login session and preferences.
                We do not use tracking cookies or share data with advertisers.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">8. Children's Privacy</h2>
              <p className="text-gray-400 leading-relaxed">
                Heritage AI is not intended for children under 13. We do not knowingly collect
                personal information from children under 13. If you believe a child has provided
                us with personal information, please contact us immediately.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">9. Changes to This Policy</h2>
              <p className="text-gray-400 leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of any
                significant changes by email or through the service. Your continued use of Heritage AI
                after changes constitutes acceptance of the updated policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">10. Contact Us</h2>
              <p className="text-gray-400 leading-relaxed">
                If you have questions about this Privacy Policy or your data, please contact us at:{' '}
                <a href="mailto:privacy@heritageai.today" className="text-primary-400 hover:text-primary-300">
                  privacy@heritageai.today
                </a>
              </p>
            </section>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-6 sm:py-8 px-4 sm:px-6 border-t border-surface-800">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
              <svg className="w-4 h-4 text-surface-950" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1z" />
              </svg>
            </div>
            <span className="text-gray-500 text-sm">Heritage</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <Link to="/privacy" className="hover:text-gray-300 transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-gray-300 transition-colors">Terms</Link>
            <Link to="/contact" className="hover:text-gray-300 transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

import React from 'react';
import { Shield, ArrowLeft } from 'lucide-react';

interface PrivacyPolicyProps {
  onBack: () => void;
}

export const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft size={16} /> Back to Home
          </button>
          
          <div className="flex items-center gap-3">
            <Shield size={20} className="text-gray-600" />
            <h1 className="font-semibold text-gray-800">Privacy Policy</h1>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 md:p-12">
          
          {/* Header */}
          <div className="mb-8 pb-8 border-b border-gray-200">
            <h1 className="text-3xl font-bold text-gray-900 mb-3">Privacy Policy</h1>
            <p className="text-sm text-gray-500">
              Last updated: <span className="font-medium">January 18, 2025</span>
            </p>
          </div>

          {/* Introduction */}
          <section className="mb-8">
            <p className="text-gray-700 leading-relaxed mb-4">
              Mac CSV Editor ("we", "our", "us") operates <a href="https://mac-csv-editor.netlify.app/" className="text-blue-600 hover:underline">https://mac-csv-editor.netlify.app/</a> (the "Service").
            </p>
            <p className="text-gray-700 leading-relaxed">
              This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our Service and the choices you have associated with that data.
            </p>
          </section>

          {/* Section 1 */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-blue-600">1.</span> Information We Collect
            </h2>
            <div className="space-y-3 text-gray-700 leading-relaxed">
              <p>
                <strong className="text-gray-900">File Processing:</strong> All CSV files you upload are processed entirely in your browser. We do not store, transmit, or have access to your CSV data.
              </p>
              <p>
                <strong className="text-gray-900">Usage Data:</strong> We may collect information that your browser sends whenever you visit our Service, including your IP address, browser type, browser version, pages visited, time and date of visit, and other diagnostic data.
              </p>
            </div>
          </section>

          {/* Section 2 */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-blue-600">2.</span> How We Use Your Information
            </h2>
            <div className="space-y-3 text-gray-700 leading-relaxed">
              <p>We use the collected data for various purposes:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>To provide and maintain our Service</li>
                <li>To notify you about changes to our Service</li>
                <li>To provide customer support</li>
                <li>To gather analysis or valuable information to improve our Service</li>
                <li>To monitor the usage of our Service</li>
                <li>To detect, prevent and address technical issues</li>
              </ul>
            </div>
          </section>

          {/* Section 3 */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-blue-600">3.</span> Cookies and Tracking Technologies
            </h2>
            <div className="space-y-3 text-gray-700 leading-relaxed">
              <p>
                We use cookies and similar tracking technologies to track activity on our Service. Cookies are files with a small amount of data which may include an anonymous unique identifier.
              </p>
              <p>
                <strong className="text-gray-900">Google Analytics:</strong> We use Google Analytics to analyze the use of our Service. Google Analytics gathers information about Service use by means of cookies.
              </p>
              <p>
                <strong className="text-gray-900">Google AdSense:</strong> We use Google AdSense to display advertisements. Google uses cookies to serve ads based on your prior visits to our website or other websites.
              </p>
              <p className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg border border-gray-200">
                You can opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google Ads Settings</a>.
              </p>
            </div>
          </section>

          {/* Section 4 */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-blue-600">4.</span> Data Security
            </h2>
            <div className="space-y-3 text-gray-700 leading-relaxed">
              <p>
                The security of your data is important to us. All CSV processing happens locally in your browser, and we do not transmit your files to any server.
              </p>
              <p>
                However, remember that no method of transmission over the Internet or method of electronic storage is 100% secure.
              </p>
            </div>
          </section>

          {/* Section 5 */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-blue-600">5.</span> Third-Party Services
            </h2>
            <div className="space-y-3 text-gray-700 leading-relaxed">
              <p>We use the following third-party services:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  <strong className="text-gray-900">Google Analytics:</strong> For usage analytics
                  <br />
                  <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">View Google's Privacy Policy</a>
                </li>
                <li>
                  <strong className="text-gray-900">Google AdSense:</strong> For displaying advertisements
                  <br />
                  <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">View Google's Advertising Policies</a>
                </li>
                <li>
                  <strong className="text-gray-900">Netlify:</strong> For hosting our Service
                  <br />
                  <a href="https://www.netlify.com/privacy/" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">View Netlify's Privacy Policy</a>
                </li>
              </ul>
            </div>
          </section>

          {/* Section 6 */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-blue-600">6.</span> Your Rights
            </h2>
            <div className="space-y-3 text-gray-700 leading-relaxed">
              <p>You have the right to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Access the personal information we hold about you</li>
                <li>Request correction of your personal information</li>
                <li>Request deletion of your personal information</li>
                <li>Object to processing of your personal information</li>
                <li>Request restriction of processing your personal information</li>
              </ul>
            </div>
          </section>

          {/* Section 7 */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-blue-600">7.</span> Children's Privacy
            </h2>
            <div className="space-y-3 text-gray-700 leading-relaxed">
              <p>
                Our Service does not address anyone under the age of 13. We do not knowingly collect personally identifiable information from children under 13.
              </p>
            </div>
          </section>

          {/* Section 8 */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-blue-600">8.</span> Changes to This Privacy Policy
            </h2>
            <div className="space-y-3 text-gray-700 leading-relaxed">
              <p>
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
              </p>
              <p>
                You are advised to review this Privacy Policy periodically for any changes.
              </p>
            </div>
          </section>

          {/* Section 9 */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-blue-600">9.</span> Contact Us
            </h2>
            <div className="space-y-3 text-gray-700 leading-relaxed">
              <p>
                If you have any questions about this Privacy Policy, please contact us:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <p className="text-sm">
                  <strong className="text-gray-900">Email:</strong>{' '}
                  <a href="mailto:jaehyeok.yu@voithru.com" className="text-blue-600 hover:underline">
                    jaehyeok.yu@voithru.com
                  </a>
                </p>
                <p className="text-sm mt-2">
                  <strong className="text-gray-900">Website:</strong>{' '}
                  <a href="https://mac-csv-editor.netlify.app/" className="text-blue-600 hover:underline">
                    https://mac-csv-editor.netlify.app/
                  </a>
                </p>
              </div>
            </div>
          </section>

        </div>

        {/* Back Button */}
        <div className="mt-8 text-center">
          <button 
            onClick={onBack}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors shadow-sm"
          >
            <ArrowLeft size={16} />
            Back to CSV Editor
          </button>
        </div>
      </main>
    </div>
  );
};

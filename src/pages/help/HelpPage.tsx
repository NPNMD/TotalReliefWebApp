import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Smartphone, Monitor, Globe, AlertCircle, CheckCircle2 } from 'lucide-react';

export const HelpPage = () => {
  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Help & FAQ</h1>
          <p className="text-gray-500">Guide to ensuring Total Relief works perfectly on your device.</p>
        </div>

        {/* iOS Section */}
        <section className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Smartphone className="w-6 h-6 text-gray-900" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">iOS (iPhone & iPad)</h2>
          </div>
          
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
              <h3 className="font-semibold text-blue-900 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Critical: Add to Home Screen
              </h3>
              <p className="text-blue-800 text-sm mt-1">
                For notifications to work when the app is closed, you <strong>must</strong> install the app.
              </p>
              <ol className="list-decimal list-inside text-blue-800 text-sm mt-2 space-y-1 ml-2">
                <li>Open this page in <strong>Safari</strong>.</li>
                <li>Tap the <strong>Share</strong> button (box with arrow up).</li>
                <li>Scroll down and tap <strong>"Add to Home Screen"</strong>.</li>
                <li>Open the app from your Home Screen to log in.</li>
              </ol>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="border p-4 rounded-lg">
                <h4 className="font-medium mb-2">Permissions</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
                    <span>Allow <strong>Camera & Microphone</strong> when asked. Check iOS Settings &gt; Safari &gt; Camera if blocked.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
                    <span>Allow <strong>Notifications</strong> to receive calls when phone is locked.</span>
                  </li>
                </ul>
              </div>
              <div className="border p-4 rounded-lg">
                <h4 className="font-medium mb-2">Troubleshooting</h4>
                <p className="text-sm text-gray-600">
                  If video is black: Ensure no other app (like Zoom/FaceTime) is using the camera. Refresh the page.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Android Section */}
        <section className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <Smartphone className="w-6 h-6 text-green-700" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Android</h2>
          </div>
          
          <div className="space-y-4">
             <div className="p-4 bg-green-50 rounded-lg border border-green-100">
              <h3 className="font-semibold text-green-900">Recommended: Use Google Chrome</h3>
              <p className="text-green-800 text-sm mt-1">
                Chrome provides the best experience for video calls and background notifications.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="border p-4 rounded-lg">
                <h4 className="font-medium mb-2">Installation</h4>
                <p className="text-sm text-gray-600 mb-2">
                  Tap the menu (3 dots) in Chrome and select <strong>"Install App"</strong> or <strong>"Add to Home Screen"</strong>.
                </p>
                <p className="text-sm text-gray-600">
                  This makes it behave like a native app.
                </p>
              </div>
              <div className="border p-4 rounded-lg">
                <h4 className="font-medium mb-2">Permissions</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
                    <span>Allow Camera/Mic permissions in Chrome Settings &gt; Site Settings.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Laptop/Desktop Section */}
        <section className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Monitor className="w-6 h-6 text-gray-900" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Laptop & Desktop</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
             <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                   <Globe className="w-4 h-4 text-gray-500" /> Supported Browsers
                </h4>
                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                   <li>Google Chrome (Recommended)</li>
                   <li>Microsoft Edge</li>
                   <li>Safari (macOS)</li>
                   <li>Firefox</li>
                </ul>
             </div>
             <div>
                <h4 className="font-medium mb-2">Connection Issues?</h4>
                 <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                   <li>Check if your browser is blocking the popup or camera.</li>
                   <li>Look for a lock/camera icon in the address bar to reset permissions.</li>
                   <li>Ensure you are not on a restricted corporate VPN that blocks WebRTC.</li>
                </ul>
             </div>
          </div>
        </section>

      </div>
    </DashboardLayout>
  );
};


import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="px-8 py-4 flex justify-between items-center max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900">☕ ChaiForms</h1>
        <div className="flex gap-4">
          <Link href="/login" className="px-4 py-2 text-gray-700 hover:text-gray-900 font-semibold">
            Sign In
          </Link>
          <Link href="/signup" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-5xl font-bold text-gray-900 mb-4">
            Build Beautiful Forms<br />
            <span className="text-blue-600">in Minutes</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Create stunning forms with real-time analytics, beautiful themes, and powerful features. No coding required.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/signup" className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition">
              Start Building
            </Link>
            <Link href="/explore" className="px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg border-2 border-blue-600 hover:bg-blue-50 transition">
              Explore Forms
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <div className="bg-white rounded-lg p-8 shadow-sm hover:shadow-lg transition">
            <div className="text-4xl mb-4">🎨</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Beautiful Themes</h3>
            <p className="text-gray-600">14+ hand-crafted themes to match your brand. Customize every detail.</p>
          </div>

          <div className="bg-white rounded-lg p-8 shadow-sm hover:shadow-lg transition">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Real Analytics</h3>
            <p className="text-gray-600">See where respondents drop off. Track field engagement in real-time.</p>
          </div>

          <div className="bg-white rounded-lg p-8 shadow-sm hover:shadow-lg transition">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Lightning Fast</h3>
            <p className="text-gray-600">Built on modern tech. Optimized for performance and reliability.</p>
          </div>

          <div className="bg-white rounded-lg p-8 shadow-sm hover:shadow-lg transition">
            <div className="text-4xl mb-4">🔒</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Secure & Private</h3>
            <p className="text-gray-600">Enterprise-grade security. Your data is always encrypted and protected.</p>
          </div>

          <div className="bg-white rounded-lg p-8 shadow-sm hover:shadow-lg transition">
            <div className="text-4xl mb-4">🌍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Global Scale</h3>
            <p className="text-gray-600">Handles millions of responses. Built for enterprise scale.</p>
          </div>

          <div className="bg-white rounded-lg p-8 shadow-sm hover:shadow-lg transition">
            <div className="text-4xl mb-4">🔗</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Easy Integration</h3>
            <p className="text-gray-600">Integrate with your favorite tools and platforms instantly.</p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 py-16 mt-20">
        <div className="max-w-4xl mx-auto px-4 text-center text-white">
          <h2 className="text-4xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-xl opacity-90 mb-8">Join thousands of creators building amazing forms.</p>
          <Link href="/signup" className="inline-block px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition">
            Create Your First Form
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 mt-20">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p>&copy; 2026 ChaiForms. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}

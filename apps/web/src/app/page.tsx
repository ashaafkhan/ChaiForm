export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-20">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-white mb-4">
            ☕ ChaiForms
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Build beautiful, dynamic forms with real-time analytics
          </p>
          <div className="flex gap-4 justify-center">
            <a
              href="/login"
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Get Started
            </a>
            <a
              href="/explore"
              className="px-8 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition"
            >
              Explore Forms
            </a>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
          <div className="bg-gray-800/50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-white mb-2">🎨 Beautiful Themes</h3>
            <p className="text-gray-400">14+ hand-crafted themes to choose from</p>
          </div>
          <div className="bg-gray-800/50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-white mb-2">📊 Real Analytics</h3>
            <p className="text-gray-400">See where your respondents drop off</p>
          </div>
          <div className="bg-gray-800/50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-white mb-2">⚡ Lightning Fast</h3>
            <p className="text-gray-400">Built on modern tech stack</p>
          </div>
        </div>
      </div>
    </main>
  );
}

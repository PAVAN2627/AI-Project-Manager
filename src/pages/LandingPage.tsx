import { useNavigate } from 'react-router-dom'
import { useAuthUser } from '../app/useAuthUser'

export function LandingPage() {
  const navigate = useNavigate()
  const { user } = useAuthUser()

  const handleGetStarted = () => {
    if (user) {
      navigate('/dashboard')
    } else {
      navigate('/login')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-hero text-white overflow-hidden">
      {/* Ambient background effects */}
      <div className="fixed inset-0 bg-gradient-radial pointer-events-none" />
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />

      {/* Hero Section */}
      <header className="relative min-h-screen flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-20">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left content */}
            <div className="space-y-8 animate-fade-in">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-gray-300">
                <span className="text-2xl">✨</span>
                <span>Powered by Tambo AI</span>
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-pulse">AI Project</span>
                <br />
                <span className="text-white">Manager</span>
                <span className="block text-xl lg:text-2xl font-normal text-gray-300 mt-4">
                  Where Intent Meets Interface
                </span>
              </h1>
              
              <p className="text-lg text-gray-300 max-w-lg leading-relaxed">
                Stop learning complex UIs. Just tell us what you want, and watch as AI 
                dynamically creates the perfect interface for your needs.
              </p>
              
              {/* Demo prompt */}
              <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-6 space-y-2 max-w-md">
                <span className="text-xs uppercase tracking-wider text-blue-400 font-medium">Try saying:</span>
                <p className="text-white font-mono text-sm">
                  "Show me completed tasks and assign priorities"
                </p>
              </div>
              
              <button
                onClick={handleGetStarted}
                className="inline-flex items-center justify-center gap-3 px-8 py-4 font-semibold text-white rounded-xl transition-all duration-300 bg-gradient-to-r from-blue-500 to-purple-600 hover:scale-105 hover:shadow-2xl shadow-blue-500/30 text-lg group"
              >
                {user ? 'Go to Dashboard' : 'Start Building'}
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </button>
            </div>
            
            {/* Right visual - Mock interface */}
            <div className="relative animate-float" style={{ animationDelay: '0.2s' }}>
              <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-6 space-y-6 shadow-2xl shadow-blue-500/20">
                {/* Mock prompt bar */}
                <div className="flex gap-3">
                  <div className="flex-1 flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/10">
                    <span className="text-2xl">⌘</span>
                    <span className="text-gray-400 text-sm">Show me blocked tasks and assign priorities</span>
                  </div>
                  <button className="px-4 py-3 text-sm bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium">
                    Generate
                  </button>
                </div>
                
                {/* AI Decision indicator */}
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                  <span className="text-2xl animate-pulse">🧠</span>
                  <div>
                    <span className="text-xs text-blue-400 font-medium">AI Decision:</span>
                    <span className="text-sm text-white ml-2">Rendering Kanban + Priority Selector</span>
                  </div>
                </div>
                
                {/* Mock Kanban preview */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm font-medium text-red-400">
                      <div className="w-2 h-2 rounded-full bg-red-400" />
                      Blocked
                    </div>
                    <div className="p-4 rounded-xl bg-white/[0.05] border border-white/10 hover:bg-white/[0.08] transition-colors cursor-pointer">
                      <span className="text-sm">Database Migration</span>
                    </div>
                    <div className="p-4 rounded-xl bg-white/[0.05] border border-white/10 hover:bg-white/[0.08] transition-colors cursor-pointer">
                      <span className="text-sm">API Integration</span>
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                    <span className="text-sm text-purple-400 font-medium">Priority Selector</span>
                  </div>
                </div>
              </div>
              
              {/* Floating decorations */}
              <div className="absolute -top-4 -right-4 w-16 h-16 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 opacity-50 blur-xl animate-float" />
              <div className="absolute -bottom-4 -left-4 w-12 h-12 rounded-full bg-pink-500/50 blur-xl animate-float" style={{ animationDelay: '1s' }} />
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="relative py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">How It Works</h2>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              Three simple steps to transform your project management experience
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: '💬', title: 'Speak Naturally', desc: 'Use everyday language. No need to learn complex menus or workflows.' },
              { icon: '🧠', title: 'AI Understands', desc: 'Tambo AI interprets your intent, handles typos, and maps synonyms.' },
              { icon: '✨', title: 'Interface Adapts', desc: 'Components appear dynamically based on what you\'re trying to accomplish.' },
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-center group hover:scale-105 hover:bg-white/[0.08] transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/20"
              >
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center group-hover:animate-pulse text-3xl">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3 text-white">{feature.title}</h3>
                <p className="text-gray-300">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="relative py-24 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-white">Powered by Cutting-Edge Tech</h2>
            <p className="text-gray-300">Built with the best tools for maximum performance</p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-6">
            {[
              { icon: '⚛️', name: 'React + TypeScript' },
              { icon: '🧠', name: 'Tambo AI' },
              { icon: '🔥', name: 'Firebase' },
              { icon: '🎨', name: 'Tambo Generative UI' },
            ].map((tech, index) => (
              <div
                key={index}
                className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300"
              >
                <span className="text-xl">{tech.icon}</span>
                <span className="font-medium text-white">{tech.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-2xl mx-auto space-y-8">
            <h2 className="text-4xl lg:text-5xl font-bold text-white">
              Ready to Experience
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"> the Future?</span>
            </h2>
            <p className="text-xl text-gray-300">
              Join the revolution against static interfaces
            </p>
            <button
              onClick={handleGetStarted}
              className="inline-flex items-center justify-center gap-3 px-8 py-4 font-medium rounded-xl transition-all duration-300 bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-white/20 text-lg group"
            >
              {user ? 'Go to Dashboard' : 'Get Started Free'}
              <span className="text-xl transition-transform group-hover:scale-110">⚡</span>
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-8 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm text-gray-400">
            Built for "The UI Strikes Back" Hackathon • Powered by Tambo
          </p>
        </div>
      </footer>
    </div>
  )
}
export default LandingPage
const BETA_SIGNUP_FORM_URL = import.meta.env.VITE_BETA_SIGNUP_FORM_URL ?? 'https://geniesinc.notion.site/2aa8f0c92dfc807eb056df0d7b23c47f?pvs=105';

const features = [
  {
    icon: '🎨',
    title: '3D Identity Engine',
    description: 'Generate high-fidelity, game-ready avatars in seconds. From stylized to realistic, create the face of your new digital entity.',
  },
  {
    icon: '🧠',
    title: 'Cognitive Core',
    description: 'Upload lore, scripts, and memories. Your Ego doesn’t just chat; it remembers, learns, and evolves with every interaction.',
  },
  {
    icon: '🎭',
    title: 'Personality Matrix',
    description: 'Fine-tune behavioral traits. Make them chaotic, stoic, wholesome, or unhinged. You define the soul of the machine.',
  },
  {
    icon: '🗣️',
    title: 'Multi-Modal Voice',
    description: 'Give your Ego a voice. Seamless text-to-speech and speech-to-text integration for natural, fluid conversations.',
  }
];

const benefits = [
  {
    title: 'Unlimited Access',
    description: 'No caps. No paywalls. Experiment freely with our entire suite of creation tools during the beta period.',
  },
  {
    title: 'Direct Influence',
    description: 'Your feedback shapes the platform. Work directly with our engineering team to build the features you need.',
  },
  {
    title: 'Early Monetization',
    description: 'Be the first to unlock revenue streams. Monetize your characters through exclusive interactions and experiences.',
  },
  {
    title: 'Priority Status',
    description: 'Get verified early. Secure your username and gain priority support when we launch publicly in 2026.',
  },
];

const creatorTraits = [
  'Worldbuilders & Storytellers',
  'Game Developers & Modders',
  'Roleplay Enthusiasts',
  'AI Artists & Technologists',
  'Streamers & Content Creators',
];

const roadmap = [
  { phase: '01', title: 'Apply', desc: 'Submit your creator profile.' },
  { phase: '02', title: 'Onboard', desc: 'Get invited to the closed beta in Jan 2026.' },
  { phase: '03', title: 'Create', desc: 'Access tools, build Egos, and share.' },
  { phase: '04', title: 'Monetize', desc: 'Unlock early revenue features.' },
];

export function BetaSignupPage() {
  const hasBetaLink = Boolean(BETA_SIGNUP_FORM_URL);

  const renderCta = (label: string, secondary = false) =>
    hasBetaLink ? (
      <a
        href={BETA_SIGNUP_FORM_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-center justify-center px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 ${
          secondary 
            ? 'bg-white/10 text-white hover:bg-white/20 border border-white/20 backdrop-blur-sm'
            : 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 hover:-translate-y-0.5'
        }`}
      >
        {label}
      </a>
    ) : (
      <button
        type="button"
        disabled
        className="inline-flex items-center justify-center bg-white/5 text-white/40 px-8 py-4 rounded-xl font-semibold border border-white/10 cursor-not-allowed"
      >
        Beta Full
      </button>
    );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans selection:bg-primary-500/30">
      
      {/* Hero Section */}
      <section className="relative w-full h-[90vh] min-h-[600px] flex items-center justify-center overflow-hidden">
        {/* Background Video */}
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="h-full w-full object-cover opacity-60"
          >
            <source
              src="https://genies-character-profile-images-dev.s3.us-west-2.amazonaws.com/animated-tiger"
              type="video/mp4"
            />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-transparent to-slate-950" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-transparent to-slate-950/80" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-primary-300 text-sm font-medium backdrop-blur-md mb-4">
            <span className="w-2 h-2 rounded-full bg-primary-400 animate-pulse" />
            Accepting Early Access Applications
          </div>
          
          <h1 className="text-5xl sm:text-7xl md:text-8xl font-bold tracking-tighter text-white drop-shadow-2xl">
            Forge Your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 via-fuchsia-400 to-secondary-400">
              Digital Ego
            </span>
          </h1>
          
          <p className="text-xl sm:text-2xl text-slate-300 max-w-2xl mx-auto leading-relaxed font-light">
            The operating system for avatar identity. Design living, breathing AI characters that connect, remember, and evolve.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            {renderCta('Apply for Beta')}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-24 space-y-32">
        
        {/* Value Prop / Features Grid */}
        <section>
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">The Creation Suite</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Professional-grade tools distilled into an intuitive interface. Build complex personas without writing a single line of code.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((item, idx) => (
              <div key={idx} className="group p-8 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors duration-300">
                <div className="text-4xl mb-6 bg-white/5 w-16 h-16 rounded-2xl flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform">
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                <p className="text-slate-400 leading-relaxed text-sm">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Split Section: Vision */}
        <section className="grid lg:grid-cols-2 gap-12 items-center bg-gradient-to-br from-primary-900/20 to-secondary-900/20 rounded-[2.5rem] p-8 sm:p-12 border border-white/10">
          <div className="space-y-8">
            <h2 className="text-3xl sm:text-5xl font-bold text-white leading-tight">
              Not Just a Chatbot. <br />
              <span className="text-primary-400">A Digital Soul.</span>
            </h2>
            <div className="space-y-6 text-lg text-slate-300">
              <p>
                Ego Lab gives you the power to create entities that feel truly alive. They have histories, opinions, and distinct voices.
              </p>
              <p>
                Whether you're building a companion for your community, an NPC for your game, or a star for your next story, Ego Lab provides the infrastructure for digital life.
              </p>
            </div>
            <div className="pt-4">
              <ul className="flex flex-wrap gap-3">
                {creatorTraits.map(trait => (
                  <li key={trait} className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-slate-200">
                    {trait}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="relative aspect-square lg:aspect-auto h-full min-h-[400px] rounded-2xl overflow-hidden bg-black/50 border border-white/10 flex items-center justify-center">
            {/* Abstract visual placeholder */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20 animate-pulse" />
            <div className="text-center p-8">
              <p className="text-6xl mb-4">🧬</p>
              <p className="text-white font-mono text-sm opacity-50">SYSTEM_READY</p>
            </div>
          </div>
        </section>

        {/* Benefits & Roadmap */}
        <section className="grid md:grid-cols-2 gap-12 lg:gap-24">
          <div>
            <h3 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
              <span className="w-8 h-1 bg-primary-500 rounded-full" />
              Creator Benefits
            </h3>
            <div className="space-y-8">
              {benefits.map((benefit, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center text-xs mt-1">
                    ✓
                  </div>
                  <div>
                    <h4 className="text-white font-bold mb-1">{benefit.title}</h4>
                    <p className="text-slate-400 text-sm">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
              <span className="w-8 h-1 bg-secondary-500 rounded-full" />
              Launch Roadmap
            </h3>
            <div className="relative border-l border-white/10 ml-3 space-y-8 pb-2">
              {roadmap.map((step, idx) => (
                <div key={idx} className="relative pl-8">
                  <span className="absolute -left-[5px] top-2 w-2.5 h-2.5 rounded-full bg-slate-800 border border-slate-600" />
                  <span className="text-xs font-mono text-primary-400 mb-1 block">PHASE {step.phase}</span>
                  <h4 className="text-white font-bold">{step.title}</h4>
                  <p className="text-slate-500 text-sm">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="text-center py-20 bg-gradient-to-t from-primary-900/10 to-transparent rounded-[3rem]">
          <h2 className="text-4xl sm:text-6xl font-bold text-white mb-8 tracking-tight">
            Ready to Build?
          </h2>
          <p className="text-xl text-slate-400 mb-10 max-w-xl mx-auto">
            Join the waitlist today and secure your spot in the next generation of digital identity.
          </p>
          <div className="flex justify-center">
            {renderCta('Start Application')}
          </div>
        </section>

      </main>

      {/* Simple Footer */}
      <footer className="border-t border-white/5 py-12 text-center text-slate-500 text-sm">
        <p>© {new Date().getFullYear()} Ego Lab. All rights reserved.</p>
      </footer>
    </div>
  );
}

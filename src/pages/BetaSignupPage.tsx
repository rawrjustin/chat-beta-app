const BETA_SIGNUP_FORM_URL = import.meta.env.VITE_BETA_SIGNUP_FORM_URL ?? 'https://geniesinc.notion.site/2aa8f0c92dfc807eb056df0d7b23c47f?pvs=105';

const creationHighlights = [
  {
    title: '3D Game-Ready Avatars',
    description:
      'Generate high-quality models in seconds — stylized, realistic, fantasy, animals, whatever your world needs.',
  },
  {
    title: 'AI Brains With Memory',
    description:
      'Upload docs, pages, scripts, or lore so your Ego understands your world and responds with consistency and depth.',
  },
  {
    title: 'Custom Behavior & Personality Modes',
    description:
      'Choose exactly how your character talks, reacts, moves, and expresses itself — from wholesome to chaotic to stoic.',
  },
  {
    title: 'Voice & Chat Interactions',
    description: 'Fans can chat with your Ego through text or natural voice conversations.',
  },
  {
    title: 'Wearables & Look Customization',
    description:
      'Swap outfits, props, hairstyles, and accessories to match storylines, seasons, or special events.',
  },
];

const betaBenefits = [
  {
    title: '✔ Unlimited free access to all Ego creation tools',
    description: 'No caps. No paywalls. Experiment with as many characters as you want.',
  },
  {
    title: '✔ Shape the future of avatar-driven storytelling',
    description: 'Your feedback directly informs the next generation of Ego creation tools.',
  },
  {
    title: '✔ Early revenue opportunities',
    description:
      'Monetize your characters before the public launch — from custom interactions to character-driven experiences.',
  },
  {
    title: '✔ Priority onboarding in January 2026',
    description: 'Early adopters get dedicated support and faster feature access.',
  },
];

const creatorTraits = [
  'Have built characters before (webtoons, fiction, games, roleplay, OC worlds, AI personas, etc.)',
  'Want their creations to feel alive, expressive, and interactive',
  'Are excited to help shape new AI technology',
  'Enjoy experimenting, storytelling, worldbuilding, or designing avatars',
  'No minimum audience size required',
];

const applicationSteps = [
  'Fill out the short application.',
  'If accepted, you’ll get invited to Beta onboarding in January 2026.',
  'You’ll gain access to Ego creation tools, tutorials, and community spaces.',
  'Start generating characters + send feedback as you build.',
  'Participate in early monetization experiments with your Egos.',
];

export function BetaSignupPage() {
  const hasBetaLink = Boolean(BETA_SIGNUP_FORM_URL);

  const renderCta = (label: string) =>
    hasBetaLink ? (
      <a
        href={BETA_SIGNUP_FORM_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center bg-gradient-to-r from-primary-600 to-secondary-600 text-white px-8 py-4 rounded-xl font-semibold shadow-lg shadow-primary-500/30 hover:opacity-95 transition"
      >
        {label}
      </a>
    ) : (
      <button
        type="button"
        disabled
        className="inline-flex items-center justify-center bg-white/10 text-white/70 px-8 py-4 rounded-xl font-semibold border border-white/20 cursor-not-allowed"
        aria-disabled="true"
      >
        Beta Form Coming Soon
      </button>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50">
      {/* Hero Video Section */}
      <section className="relative w-full h-screen overflow-hidden bg-black flex items-center justify-center">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="h-full w-auto object-contain"
        >
          <source
            src="https://genies-character-profile-images-dev.s3.us-west-2.amazonaws.com/animated-tiger"
            type="video/mp4"
          />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/50 pointer-events-none" />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center px-4">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg">
              Build Your AI Character
            </h2>
            <p className="text-lg sm:text-xl text-white/90 max-w-2xl drop-shadow-md">
              Create engaging, interactive AI characters that connect with your audience
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 space-y-16">
        {/* Hero */}
        <section className="text-center space-y-6">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Creator Beta</p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white">
            Bring Your Characters to Life as AI Egos
          </h1>
          <p className="text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto">
            Create stunning 3D, game-ready avatars with personalities, memories, and voices your fans can truly talk to.
          </p>
          <p className="text-base sm:text-lg text-slate-200">Apply for the Creator Beta — launching January 2026.</p>
          {renderCta('Join the Beta')}
        </section>

        {/* Sub-hero */}
        <section className="bg-white/5 border border-white/10 rounded-3xl p-8 sm:p-10 space-y-4 text-center">
          <p className="text-sm uppercase tracking-[0.2em] text-amber-300">Unlimited AI-Powered Creation</p>
          <h2 className="text-3xl font-bold text-white">
            Ego Lab gives creators the tools to generate living, expressive digital characters.
          </h2>
          <p className="text-lg text-slate-200">
            3D looks, intelligent brains, natural behavior, and fully customizable personalities.
          </p>
          <p className="text-base text-slate-300">
            Your characters become Egos — AI companions your fans can chat with, voice-talk to, and interact with across worlds.
          </p>
        </section>

        {/* What you can create */}
        <section>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">What You Can Create in the Beta</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {creationHighlights.map((item) => (
              <div key={item.title} className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h3 className="text-xl font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-slate-300 text-sm sm:text-base">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Why join */}
        <section className="bg-gradient-to-br from-primary-500/10 to-secondary-500/10 border border-white/10 rounded-3xl p-8 sm:p-10 space-y-6">
          <h2 className="text-3xl sm:text-4xl font-bold text-white">Why Join the Creator Beta?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {betaBenefits.map((benefit) => (
              <div key={benefit.title} className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-2">{benefit.title}</h3>
                <p className="text-sm text-slate-300">{benefit.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Who we're looking for */}
        <section>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Who We’re Looking For</h2>
          <p className="text-slate-300 mb-6">Creators who:</p>
          <ul className="space-y-3 text-slate-200">
            {creatorTraits.map((trait) => (
              <li key={trait} className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-emerald-400" />
                <span>{trait}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* What to expect */}
        <section className="bg-white/5 border border-white/10 rounded-3xl p-8 sm:p-10 space-y-8 text-center">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">What to Expect After You Apply</h2>
            <p className="text-slate-300">Here’s how the Creator Beta journey unfolds:</p>
          </div>
          <ol className="space-y-4 text-left max-w-3xl mx-auto text-slate-200">
            {applicationSteps.map((step, idx) => (
              <li key={step} className="flex gap-4">
                <span className="text-lg font-semibold text-emerald-300">{idx + 1}.</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
          {renderCta('Apply Now')}
        </section>
      </div>
    </div>
  );
}

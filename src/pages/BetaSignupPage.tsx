const BETA_SIGNUP_FORM_URL = import.meta.env.VITE_BETA_SIGNUP_FORM_URL ?? '';

const featureHighlights = [
  {
    title: 'Photoreal Base Mesh',
    description: 'Start with high-fidelity base bodies designed for animation-ready workflows.',
  },
  {
    title: 'Neural Style Transfer',
    description: 'Blend references, concept art, or mood boards directly into your avatar look.',
  },
  {
    title: 'Expressive Performance',
    description: 'Preview live facial capture and body animation inside Ego Lab before export.',
  },
];

const betaTimeline = [
  {
    phase: 'Week 0-1',
    title: 'Creator Onboarding',
    details: 'We’ll schedule a 30-minute kickoff to align on your goals and pipeline.',
  },
  {
    phase: 'Week 2-3',
    title: 'Avatar Lab Access',
    details: 'Hands-on time with the 3D avatar builder + async office hours with our team.',
  },
  {
    phase: 'Week 4',
    title: 'Showcase & Feedback',
    details: 'Share what you built, unlock export options, and influence the public launch.',
  },
];

const requirements = [
  'A creator portfolio or sample characters you’ve built before',
  'A desktop or laptop with a GPU capable of running WebGL 2.0+',
  'Willingness to record feedback or hop on two short research calls',
];

const faqs = [
  {
    question: 'Who is this beta for?',
    answer:
      'We’re prioritizing designers, VTubers, film/game studios, and storytellers who want to ship a 3D avatar in the next 60 days.',
  },
  {
    question: 'Is there a cost?',
    answer:
      'No. Beta access is free in exchange for product feedback and permission to showcase your build (with your approval).',
  },
  {
    question: 'What do I need to install?',
    answer:
      'Nothing. The avatar builder runs inside Ego Lab on desktop browsers that support WebGL 2.0. Optional capture plugins are provided during onboarding.',
  },
];

export function BetaSignupPage() {
  const hasBetaLink = Boolean(BETA_SIGNUP_FORM_URL);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.25),_transparent)]" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 text-center">
          <p className="inline-flex items-center gap-2 text-xs sm:text-sm uppercase tracking-[0.2em] text-slate-400 mb-6">
            <span className="h-1 w-1 rounded-full bg-emerald-400" />
            Private Beta Invite
          </p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white mb-6">
            Create lifelike 3D avatars with Ego Lab’s new creator tools
          </h1>
          <p className="text-base sm:text-lg text-slate-300 max-w-3xl mx-auto mb-10">
            We’re opening a limited beta for the 3D avatar creation workflow—capture references,
            sculpt in-browser, blend voices, and preview full performance without leaving Ego Lab.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
            {hasBetaLink ? (
              <a
                href={BETA_SIGNUP_FORM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-cyan-500 text-white px-8 py-4 rounded-xl text-base font-semibold shadow-lg shadow-purple-500/30 hover:opacity-95 transition"
              >
                Apply for Beta Access
              </a>
            ) : (
              <button
                type="button"
                disabled
                className="w-full sm:w-auto bg-white/10 text-white/70 px-8 py-4 rounded-xl text-base font-semibold border border-white/20 cursor-not-allowed"
                aria-disabled="true"
              >
                Beta Form Coming Soon
              </button>
            )}
            <a
              href="#details"
              className="w-full sm:w-auto border border-white/20 text-white px-8 py-4 rounded-xl text-base font-semibold hover:border-white/60 transition"
            >
              See what’s inside
            </a>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-6">
            <strong className="text-white">12 creator</strong> slots available in this wave.
          </p>
        </div>
      </div>

      {/* Metrics */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          {[
            { label: 'Avg. build time', value: '42 min' },
            { label: 'Animation-ready exports', value: 'GLB + USDZ' },
            { label: 'Supported capture rigs', value: '15+' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
              <p className="text-3xl font-semibold text-white mb-2">{stat.value}</p>
              <p className="text-sm uppercase tracking-wide text-slate-400">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Details */}
      <div id="details" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 space-y-16">
        {/* Features */}
        <section>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">What you’ll get in the beta</h2>
          <p className="text-slate-300 max-w-3xl mb-10">
            Designed for real-time creators, the 3D avatar lab keeps every step—from mood board to
            motion capture—inside one workspace.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featureHighlights.map((feature) => (
              <div key={feature.title} className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <div className="h-12 w-12 rounded-full bg-gradient-to-r from-purple-500/40 to-cyan-500/40 flex items-center justify-center mb-4">
                  <span className="text-lg">✦</span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-300">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Timeline */}
        <section>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-slate-400 mb-2">Beta cadence</p>
              <h2 className="text-3xl font-bold text-white">How the 4-week program works</h2>
            </div>
            <p className="text-slate-300 max-w-md">
              Expect hands-on support. We’ll ship weekly updates and tailor tools to your pipeline.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {betaTimeline.map((entry) => (
              <div key={entry.phase} className="bg-gradient-to-br from-white/8 to-white/5 border border-white/10 rounded-2xl p-6">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400 mb-2">{entry.phase}</p>
                <h3 className="text-xl font-semibold text-white mb-2">{entry.title}</h3>
                <p className="text-sm text-slate-300">{entry.details}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Requirements */}
        <section className="bg-white/5 border border-white/10 rounded-3xl p-8 sm:p-10">
          <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-10">
            <div>
              <h2 className="text-3xl font-bold text-white mb-4">What we ask from you</h2>
              <p className="text-slate-300 mb-6">
                This beta is collaborative—we’re partnering closely with a handful of creators who
                are ready to push what’s possible with AI-driven avatars.
              </p>
              <ul className="space-y-4">
                {requirements.map((requirement) => (
                  <li key={requirement} className="flex items-start gap-3 text-slate-200">
                    <span className="mt-1 h-2 w-2 rounded-full bg-emerald-400" />
                    <span className="text-sm sm:text-base">{requirement}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-black/20 border border-white/10 rounded-2xl p-6 flex flex-col gap-4">
              <h3 className="text-xl font-semibold text-white">What you’ll walk away with</h3>
              <ul className="space-y-3 text-sm text-slate-300">
                <li>• A hero-quality avatar ready for streaming, film, or game engines</li>
                <li>• Early access to export templates for Unreal, Unity, and VTubing tools</li>
                <li>• Direct line to our avatar engineering and art direction teams</li>
              </ul>
              <div className="mt-auto">
                {hasBetaLink ? (
                  <a
                    href={BETA_SIGNUP_FORM_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center w-full bg-gradient-to-r from-purple-600 to-cyan-500 text-white px-6 py-3 rounded-xl font-semibold hover:opacity-95 transition"
                  >
                    Submit my studio
                  </a>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="inline-flex items-center justify-center w-full bg-white/10 text-white/70 px-6 py-3 rounded-xl font-semibold border border-white/20 cursor-not-allowed"
                    aria-disabled="true"
                  >
                    Beta Form Coming Soon
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-slate-400 mb-2">FAQs</p>
              <h2 className="text-3xl font-bold text-white">Everything else you’re curious about</h2>
            </div>
          </div>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <div key={faq.question} className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-2">{faq.question}</h3>
                <p className="text-sm text-slate-300">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-r from-purple-600/10 via-cyan-500/10 to-blue-500/10 border-t border-white/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            Help us shape the 3D avatar future of Ego Lab
          </h2>
          <p className="text-slate-300 max-w-3xl mx-auto">
            We review applications weekly and onboard creators in small cohorts so you get direct access
            to our art + engineering team.
          </p>
          {hasBetaLink ? (
            <a
              href={BETA_SIGNUP_FORM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center bg-gradient-to-r from-purple-600 to-cyan-500 text-white px-10 py-4 rounded-2xl text-lg font-semibold shadow-lg shadow-purple-500/30 hover:opacity-95 transition"
            >
              Apply for the Avatar Beta
            </a>
          ) : (
            <button
              type="button"
              disabled
              className="inline-flex items-center justify-center bg-white/10 text-white/70 px-10 py-4 rounded-2xl text-lg font-semibold border border-white/20 cursor-not-allowed"
              aria-disabled="true"
            >
              Beta Form Coming Soon
            </button>
          )}
        </div>
      </div>
    </div>
  );
}


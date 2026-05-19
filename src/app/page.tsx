'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

const features = [
  {
    icon: '⚡',
    title: 'AI Code Generation',
    description: 'Describe what you want to build and watch AI write the code instantly.',
  },
  {
    icon: '🖥️',
    title: 'Live Preview',
    description: 'See your changes in real-time with an integrated sandbox environment.',
  },
  {
    icon: '📝',
    title: 'Monaco Editor',
    description: 'Professional-grade code editor with syntax highlighting and IntelliSense.',
  },
  {
    icon: '🚀',
    title: 'One-Click Publish',
    description: 'Deploy your projects instantly to share with the world.',
  },
];

export default function HomePage() {
  const [prompt, setPrompt] = useState('');
  const [year, setYear] = useState(2025);

  useEffect(() => {
    setYear(new Date()?.getFullYear());
  }, []);

  return (
    <main className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-sm">
            B
          </div>
          <span className="font-semibold text-foreground text-lg">BuildAI</span>
        </div>
        <nav className="flex items-center gap-4">
          <Link
            href="/editor"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Editor
          </Link>
          <Link
            href="/editor"
            className="text-sm bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
          >
            Get Started
          </Link>
        </nav>
      </header>
      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-24 text-center">
        <div className="inline-flex items-center gap-2 bg-muted border border-border rounded-full px-4 py-1.5 text-sm text-muted-foreground mb-8">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
          AI-powered development platform
        </div>

        <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6 leading-tight max-w-4xl">
          Build with{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
            AI
          </span>
          , ship faster
        </h1>

        <p className="text-xl text-muted-foreground mb-12 max-w-2xl leading-relaxed">
          Describe your idea, watch AI generate the code, preview it live, and publish in seconds.
          The future of development is here.
        </p>

        {/* Prompt Input */}
        <div className="w-full max-w-2xl flex gap-3 mb-16">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e?.target?.value)}
            placeholder="Describe what you want to build..."
            className="flex-1 bg-card border border-border rounded-xl px-5 py-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-base"
          />
          <Link
            href={`/editor${prompt ? `?prompt=${encodeURIComponent(prompt)}` : ''}`}
            className="bg-primary text-primary-foreground px-6 py-4 rounded-xl font-medium hover:opacity-90 transition-opacity whitespace-nowrap"
          >
            Build it →
          </Link>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-5xl">
          {features?.map((feature) => (
            <div
              key={feature?.title}
              className="bg-card border border-border rounded-xl p-6 text-left hover:border-primary/50 transition-colors"
            >
              <div className="text-3xl mb-3">{feature?.icon}</div>
              <h3 className="font-semibold text-foreground mb-2">{feature?.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature?.description}</p>
            </div>
          ))}
        </div>
      </section>
      {/* Footer */}
      <footer className="border-t border-border px-6 py-6 text-center text-sm text-muted-foreground">
        © {year} BuildAI. Built with Next.js & AI.
      </footer>
    </main>
  );
}

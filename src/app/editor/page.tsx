'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useChat } from '@/lib/hooks/useChat';
import toast, { Toaster } from 'react-hot-toast';

const SYSTEM_PROMPT = `You are an expert web developer. When given a description, generate a complete, self-contained HTML file with embedded CSS and JavaScript that implements the described UI/feature.

Rules:
- Return ONLY the raw HTML code, no markdown, no code fences, no explanation
- The HTML must be complete and self-contained (no external dependencies except CDN links if needed)
- Use modern, clean design with good styling
- Make it functional and interactive where appropriate
- Include all CSS in a <style> tag and all JS in a <script> tag`;

function EditorContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialPrompt = searchParams?.get('prompt') || '';

  const [prompt, setPrompt] = useState(initialPrompt);
  const [code, setCode] = useState('');
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');

  const { response, isLoading, error, sendMessage } = useChat('GEMINI', 'gemini/gemini-2.5-flash', true);

  useEffect(() => {
    if (error) toast.error(error.message);
  }, [error]);

  useEffect(() => {
    if (response) {
      // Strip markdown code fences if present
      const cleaned = response
        .replace(/^```html\n?/i, '')
        .replace(/^```\n?/, '')
        .replace(/\n?```$/, '')
        .trim();
      setCode(cleaned);
    }
  }, [response]);

  const handleBuild = useCallback(() => {
    if (!prompt.trim() || isLoading) return;
    setCode('');
    sendMessage(
      [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
      { temperature: 0.7, max_tokens: 8192 }
    );
  }, [prompt, isLoading, sendMessage]);

  // Auto-build if prompt came from URL
  useEffect(() => {
    if (initialPrompt) {
      handleBuild();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleBuild();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Toaster position="top-right" />

      {/* Header */}
      <header className="border-b border-border px-6 py-3 flex items-center justify-between shrink-0">
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-xs">
            B
          </div>
          <span className="font-semibold text-foreground">BuildAI</span>
        </button>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {isLoading && (
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              Generating...
            </span>
          )}
        </div>
      </header>

      {/* Prompt Bar */}
      <div className="border-b border-border px-6 py-4 bg-card shrink-0">
        <div className="max-w-5xl mx-auto flex gap-3">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe what you want to build... (Ctrl+Enter to generate)"
            rows={2}
            className="flex-1 bg-background border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm resize-none"
          />
          <button
            onClick={handleBuild}
            disabled={isLoading || !prompt.trim()}
            className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap self-end"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Building...
              </span>
            ) : (
              'Build it →'
            )}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Tabs */}
        {code && (
          <div className="border-b border-border px-6 flex gap-1 bg-card shrink-0">
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'preview' ?'border-primary text-foreground' :'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Preview
            </button>
            <button
              onClick={() => setActiveTab('code')}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'code' ?'border-primary text-foreground' :'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Code
            </button>
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-hidden">
          {!code && !isLoading && (
            <div className="h-full flex flex-col items-center justify-center text-center px-6">
              <div className="text-6xl mb-6">✨</div>
              <h2 className="text-2xl font-semibold text-foreground mb-3">Ready to build</h2>
              <p className="text-muted-foreground max-w-md">
                Enter a description above and click <strong>Build it →</strong> to generate your app with AI.
              </p>
              <p className="text-sm text-muted-foreground mt-2">Tip: Press Ctrl+Enter to generate quickly</p>
            </div>
          )}

          {isLoading && !code && (
            <div className="h-full flex flex-col items-center justify-center text-center px-6">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                <svg className="animate-spin w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">Building your app...</h2>
              <p className="text-muted-foreground">AI is generating your code</p>
            </div>
          )}

          {code && activeTab === 'preview' && (
            <iframe
              srcDoc={code}
              className="w-full h-full border-0"
              sandbox="allow-scripts allow-same-origin allow-forms"
              title="Preview"
            />
          )}

          {code && activeTab === 'code' && (
            <div className="h-full overflow-auto bg-[#1e1e1e] p-6">
              <pre className="text-sm text-gray-300 font-mono whitespace-pre-wrap break-words leading-relaxed">
                {code}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function EditorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading editor...</div>
      </div>
    }>
      <EditorContent />
    </Suspense>
  );
}

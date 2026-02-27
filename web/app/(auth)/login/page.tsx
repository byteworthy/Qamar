'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      // TODO: Implement magic link endpoint
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSent(true);
    } catch (error) {
      console.error('Failed to send magic link:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/">
            <h1 className="font-serif text-4xl font-bold text-gold">Qamar</h1>
          </Link>
          <p className="text-moonlight-dim mt-2">Welcome back</p>
        </div>

        {/* Card */}
        <div className="bg-background-card p-8 rounded-2xl border border-background-card-light">
          {!sent ? (
            <>
              <h2 className="font-serif text-2xl font-semibold mb-2">Sign In</h2>
              <p className="text-moonlight-dim mb-6">
                Enter your email to receive a magic link
              </p>

              <form onSubmit={handleMagicLink}>
                <div className="mb-4">
                  <label htmlFor="email" className="block text-sm font-medium mb-2">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    className="w-full px-4 py-3 bg-background-card-light border border-background-card-light rounded-xl focus:outline-none focus:ring-2 focus:ring-gold text-moonlight"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !email}
                  className="w-full py-3 bg-gold text-background font-semibold rounded-xl hover:bg-gold-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Sending...' : 'Send Magic Link'}
                </button>
              </form>

              <p className="text-center text-moonlight-muted text-sm mt-6">
                Don't have an account?{' '}
                <Link href="/signup" className="text-gold hover:text-gold-light">
                  Sign up
                </Link>
              </p>
            </>
          ) : (
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-moonlight" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="font-serif text-2xl font-semibold mb-2">Check Your Email</h2>
              <p className="text-moonlight-dim mb-6">
                We've sent a magic link to <strong>{email}</strong>
              </p>
              <p className="text-moonlight-muted text-sm">
                Click the link in the email to sign in. The link expires in 1 hour.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

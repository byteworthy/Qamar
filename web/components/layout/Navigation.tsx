"use client";

import Link from "next/link";
import { useState } from "react";

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-background-card border-b border-background-card-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-serif text-2xl font-semibold text-gold">
              Qamar
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/reflect"
              className="text-moonlight-dim hover:text-moonlight transition-colors"
            >
              Reflect
            </Link>
            <Link
              href="/history"
              className="text-moonlight-dim hover:text-moonlight transition-colors"
            >
              History
            </Link>
            <Link
              href="/insights"
              className="text-moonlight-dim hover:text-moonlight transition-colors"
            >
              Insights
            </Link>
            <Link
              href="/account"
              className="text-moonlight-dim hover:text-moonlight transition-colors"
            >
              Account
            </Link>
            <Link
              href="/login"
              className="px-4 py-2 rounded-lg bg-gold text-background font-medium hover:bg-gold-light transition-colors"
            >
              Login
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-background-card-light"
          >
            <svg
              className="w-6 h-6 text-moonlight"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-background-card-light">
            <div className="flex flex-col space-y-4">
              <Link
                href="/reflect"
                className="text-moonlight-dim hover:text-moonlight transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Reflect
              </Link>
              <Link
                href="/history"
                className="text-moonlight-dim hover:text-moonlight transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                History
              </Link>
              <Link
                href="/insights"
                className="text-moonlight-dim hover:text-moonlight transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Insights
              </Link>
              <Link
                href="/account"
                className="text-moonlight-dim hover:text-moonlight transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Account
              </Link>
              <Link
                href="/login"
                className="px-4 py-2 rounded-lg bg-gold text-background font-medium hover:bg-gold-light transition-colors text-center"
                onClick={() => setIsMenuOpen(false)}
              >
                Login
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

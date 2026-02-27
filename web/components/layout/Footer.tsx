import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-background-card border-t border-background-card-light mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <h3 className="font-serif text-xl font-semibold text-gold mb-2">
              Qamar
            </h3>
            <p className="text-moonlight-muted text-sm">
              Your complete Islamic companion for spiritual growth and reflection
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-medium text-moonlight mb-3">Support</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/privacy"
                  className="text-moonlight-dim hover:text-moonlight text-sm transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-moonlight-dim hover:text-moonlight text-sm transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="/support"
                  className="text-moonlight-dim hover:text-moonlight text-sm transition-colors"
                >
                  Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Copyright */}
          <div className="text-moonlight-muted text-sm">
            <p>&copy; {currentYear} Qamar. All rights reserved.</p>
            <p className="mt-2">
              Made with care for the Muslim community
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

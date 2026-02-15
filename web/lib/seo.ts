import type { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://noor.app';

export const defaultMetadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Noor - Islamic Companion',
    template: '%s | Noor',
  },
  description:
    'Islamic reflection and spiritual growth companion for Muslims. Transform distressing thoughts through faith-based cognitive reframing.',
  keywords: [
    'Islamic companion',
    'Muslim reflection',
    'spiritual growth',
    'Islamic psychology',
    'Noor',
    'guided reflection',
    'Islamic spiritual growth',
    'faith-based reflection',
    'Quran guidance',
    'Islamic counseling',
  ],
  authors: [{ name: 'Noor Team' }],
  creator: 'Noor',
  publisher: 'Noor',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName: 'Noor',
    title: 'Noor - Islamic Companion',
    description:
      'Islamic reflection and spiritual growth companion for Muslims. Transform distressing thoughts through faith-based cognitive reframing.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Noor - Islamic Companion',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Noor - Islamic Companion',
    description:
      'Islamic reflection and spiritual growth companion for Muslims. Transform distressing thoughts through faith-based cognitive reframing.',
    images: ['/og-image.png'],
    creator: '@noorapp',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
};

export function generatePageMetadata(
  title: string,
  description?: string
): Metadata {
  return {
    title,
    description: description || defaultMetadata.description,
    openGraph: {
      ...defaultMetadata.openGraph,
      title,
      description: description || (defaultMetadata.description as string),
    },
    twitter: {
      ...defaultMetadata.twitter,
      title,
      description: description || (defaultMetadata.description as string),
    },
  };
}

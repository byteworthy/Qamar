import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://qamar.app";

export const defaultMetadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Qamar - Your Islamic Companion',
    template: '%s | Qamar',
  },
  description:
    "Your all-in-one Islamic companion. Read the Quran with translations and audio, get accurate prayer times with Qibla compass, learn Arabic vocabulary with spaced repetition, explore authentic hadith collections, and grow spiritually through guided reflection.",
  keywords: [
    'Quran',
    'Quran reader',
    'Quran audio',
    'prayer times',
    'salah times',
    'Qibla compass',
    'Qibla direction',
    'Islamic app',
    'Muslim app',
    'Arabic learning',
    'Arabic vocabulary',
    'hadith',
    'hadith collection',
    'adhkar',
    'morning adhkar',
    'evening adhkar',
    'Islamic companion',
    'spiritual growth',
    'Islamic reflection',
    'dua',
    'dhikr',
    'Hijri calendar',
    'Islamic calendar',
    'Qamar',
    'Muslim daily',
    'Ramadan',
    'Islamic education',
  ],
  authors: [{ name: 'ByteWorthy' }],
  creator: 'Qamar',
  publisher: 'ByteWorthy',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: 'Qamar',
    title: 'Qamar - Your Islamic Companion',
    description:
      "Quran, Prayer Times, Arabic Learning, Hadith & Personal Reflection — all in one beautiful app for Muslims.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: 'Qamar - Your Islamic Companion',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Qamar - Your Islamic Companion',
    description:
      "Quran, Prayer Times, Arabic Learning, Hadith & Personal Reflection — all in one beautiful app for Muslims.",
    images: ["/og-image.png"],
    creator: "@qamarapp",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
};

export function generatePageMetadata(
  title: string,
  description?: string,
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

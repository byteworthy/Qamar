'use client';

import { useEffect } from 'react';

interface OrganizationSchema {
  '@context': string;
  '@type': string;
  name: string;
  url: string;
  logo: string;
  description: string;
  sameAs: string[];
}

interface WebApplicationSchema {
  '@context': string;
  '@type': string;
  name: string;
  url: string;
  description: string;
  applicationCategory: string;
  offers: {
    '@type': string;
    price: string;
    priceCurrency: string;
  };
}

interface MedicalWebPageSchema {
  '@context': string;
  '@type': string;
  name: string;
  description: string;
  about: {
    '@type': string;
    name: string;
  };
  audience: {
    '@type': string;
    audienceType: string;
  };
}

const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return process.env.NEXT_PUBLIC_SITE_URL || 'https://noor.app';
};

const createOrganizationSchema = (): OrganizationSchema => {
  const baseUrl = getBaseUrl();

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Noor',
    url: baseUrl,
    logo: `${baseUrl}/logo.png`,
    description:
      'Islamic reflection and spiritual growth companion for Muslims',
    sameAs: [
      'https://twitter.com/noorapp',
      'https://facebook.com/noorapp',
    ],
  };
};

const createWebAppSchema = (): WebApplicationSchema => {
  const baseUrl = getBaseUrl();

  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Noor - Islamic Companion',
    url: baseUrl,
    description:
      'Islamic reflection and spiritual growth companion for Muslims',
    applicationCategory: 'HealthApplication',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  };
};

const createMedicalSchema = (): MedicalWebPageSchema => {
  return {
    '@context': 'https://schema.org',
    '@type': 'MedicalWebPage',
    name: 'Islamic Reflection Companion',
    description:
      'Guided reflection integrated with Islamic principles',
    about: {
      '@type': 'MedicalTherapy',
      name: 'Guided Reflection',
    },
    audience: {
      '@type': 'PeopleAudience',
      audienceType: 'Muslims seeking spiritual growth and reflection',
    },
  };
};

export function StructuredData() {
  useEffect(() => {
    const schemas = [
      createOrganizationSchema(),
      createWebAppSchema(),
      createMedicalSchema(),
    ];

    schemas.forEach((schema, index) => {
      const scriptId = `structured-data-${index}`;
      let scriptElement = document.getElementById(
        scriptId
      ) as HTMLScriptElement | null;

      if (!scriptElement) {
        scriptElement = document.createElement('script');
        scriptElement.id = scriptId;
        scriptElement.type = 'application/ld+json';
        document.head.appendChild(scriptElement);
      }

      scriptElement.textContent = JSON.stringify(schema);
    });
  }, []);

  return null;
}

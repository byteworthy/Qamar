"use client";

import { useEffect } from "react";

interface OrganizationSchema {
  "@context": string;
  "@type": string;
  name: string;
  url: string;
  logo: string;
  description: string;
  sameAs: string[];
}

interface WebApplicationSchema {
  "@context": string;
  "@type": string;
  name: string;
  url: string;
  description: string;
  applicationCategory: string;
  offers: {
    "@type": string;
    price: string;
    priceCurrency: string;
  };
}

interface EducationalContentSchema {
  '@context': string;
  '@type': string;
  name: string;
  description: string;
  about: {
    "@type": string;
    name: string;
  };
  audience: {
    "@type": string;
    audienceType: string;
  };
}

const getBaseUrl = () => {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return process.env.NEXT_PUBLIC_SITE_URL || "https://noor.app";
};

const createOrganizationSchema = (): OrganizationSchema => {
  const baseUrl = getBaseUrl();

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Qamar",
    url: baseUrl,
    logo: `${baseUrl}/logo.png`,
    description:
      "Islamic reflection and spiritual growth companion for Muslims",
    sameAs: ["https://twitter.com/noorapp", "https://facebook.com/noorapp"],
  };
};

const createWebAppSchema = (): WebApplicationSchema => {
  const baseUrl = getBaseUrl();

  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Qamar - Islamic Companion",
    url: baseUrl,
    description:
      'Islamic reflection and spiritual growth companion for Muslims',
    applicationCategory: 'LifestyleApplication',
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };
};

const createEducationalSchema = (): EducationalContentSchema => {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Qamar - Islamic Companion',
    description:
      'Quran reading, Arabic learning, and spiritual reflection rooted in Islamic tradition',
    about: {
      '@type': 'Thing',
      name: 'Islamic Education and Spiritual Growth',
    },
    audience: {
      "@type": "PeopleAudience",
      audienceType: "Muslims seeking spiritual growth and reflection",
    },
  };
};

export function StructuredData() {
  useEffect(() => {
    const schemas = [
      createOrganizationSchema(),
      createWebAppSchema(),
      createEducationalSchema(),
    ];

    schemas.forEach((schema, index) => {
      const scriptId = `structured-data-${index}`;
      let scriptElement = document.getElementById(
        scriptId,
      ) as HTMLScriptElement | null;

      if (!scriptElement) {
        scriptElement = document.createElement("script");
        scriptElement.id = scriptId;
        scriptElement.type = "application/ld+json";
        document.head.appendChild(scriptElement);
      }

      scriptElement.textContent = JSON.stringify(schema);
    });
  }, []);

  return null;
}

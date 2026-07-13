// lib/schema.ts
import { SITE_URL } from './seo';

export function getAutoRentalSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'AutoRental',
    'name': 'RentalMobil',
    'image': `${SITE_URL}/images/logo.png`,
    '@id': `${SITE_URL}/#rental-agency`,
    'url': SITE_URL,
    'telephone': '+6281234567890',
    'priceRange': '$$',
    'address': {
      '@type': 'PostalAddress',
      'streetAddress': 'Jl. Kaliurang No. 45',
      'addressLocality': 'Yogyakarta',
      'postalCode': '55281',
      'addressCountry': 'ID',
    },
    'geo': {
      '@type': 'GeoCoordinates',
      'latitude': -7.7702,
      'longitude': 110.3778,
    },
    'openingHoursSpecification': {
      '@type': 'OpeningHoursSpecification',
      'dayOfWeek': [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
        'Sunday',
      ],
      'opens': '00:00',
      'closes': '23:59',
    },
  };
}

export interface SchemaCar {
  id: string;
  name: string;
  brand: string;
  model: string;
  category: string;
  pricePerMonth: number;
  image: string;
  description: string;
}

export function getCarProductSchema(car: SchemaCar) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    'name': car.name,
    'image': car.image,
    'description': car.description,
    'brand': {
      '@type': 'Brand',
      'name': car.brand,
    },
    'offers': {
      '@type': 'Offer',
      'url': `${SITE_URL}/armada`,
      'priceCurrency': 'IDR',
      'price': car.pricePerMonth,
      'priceValidUntil': '2027-12-31',
      'itemCondition': 'https://schema.org/UsedCondition',
      'availability': 'https://schema.org/InStock',
    },
  };
}

export interface SchemaReview {
  author: string;
  role: string;
  reviewBody: string;
  ratingValue: number;
}

export function getReviewSchema(reviews: SchemaReview[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    'itemListElement': reviews.map((review, index) => ({
      '@type': 'ListItem',
      'position': index + 1,
      'item': {
        '@type': 'Review',
        'author': {
          '@type': 'Person',
          'name': review.author,
        },
        'reviewRating': {
          '@type': 'Rating',
          'ratingValue': review.ratingValue,
          'bestRating': 5,
        },
        'reviewBody': review.reviewBody,
      },
    })),
  };
}

export function getBreadcrumbSchema(items: { name: string; item: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': items.map((item, index) => ({
      '@type': 'ListItem',
      'position': index + 1,
      'name': item.name,
      'item': `${SITE_URL}${item.item.startsWith('/') ? item.item : '/' + item.item}`,
    })),
  };
}

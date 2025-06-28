// src/utils/seoUtils.js
// SEO enhancement utilities for dynamic meta tags and structured data

/**
 * Generate dynamic meta tags for trainer profiles
 */
export function generateTrainerMetaTags(trainer) {
    const baseUrl = 'https://dogtrainersdirectory.com.au';
    const trainerUrl = `${baseUrl}/trainers/${trainer.slug || trainer.id}`;
    
    return {
        title: `${trainer.name} - Professional Dog Trainer in ${trainer.suburb}, ${trainer.state}`,
        description: `Expert dog training services by ${trainer.name} in ${trainer.suburb}. Specializing in ${trainer.specialties?.slice(0, 3).join(', ')}. Book your consultation today!`,
        canonical: trainerUrl,
        openGraph: {
            title: `${trainer.name} - Dog Trainer in ${trainer.suburb}`,
            description: `Professional dog training services in ${trainer.suburb}. ${trainer.experience || 'Experienced'} trainer specializing in behavioral training and obedience.`,
            url: trainerUrl,
            type: 'profile',
            image: trainer.image || `${baseUrl}/images/default-trainer.jpg`,
            site_name: 'Dog Trainers Directory Australia'
        },
        twitter: {
            card: 'summary_large_image',
            title: `${trainer.name} - Dog Trainer in ${trainer.suburb}`,
            description: `Professional dog training services in ${trainer.suburb}. Book your consultation today!`,
            image: trainer.image || `${baseUrl}/images/default-trainer.jpg`
        },
        schema: generateTrainerSchema(trainer)
    };
}

/**
 * Generate structured data schema for trainers
 */
export function generateTrainerSchema(trainer) {
    const baseUrl = 'https://dogtrainersdirectory.com.au';
    
    return {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        "@id": `${baseUrl}/trainers/${trainer.slug || trainer.id}`,
        "name": trainer.name,
        "description": trainer.bio || `Professional dog training services in ${trainer.suburb}`,
        "url": `${baseUrl}/trainers/${trainer.slug || trainer.id}`,
        "telephone": trainer.phone,
        "email": trainer.email,
        "image": trainer.image || `${baseUrl}/images/default-trainer.jpg`,
        "address": {
            "@type": "PostalAddress",
            "addressLocality": trainer.suburb,
            "addressRegion": trainer.state,
            "addressCountry": "AU"
        },
        "geo": trainer.coordinates ? {
            "@type": "GeoCoordinates",
            "latitude": trainer.coordinates.lat,
            "longitude": trainer.coordinates.lng
        } : null,
        "openingHours": trainer.hours || "Mo-Fr 09:00-17:00",
        "priceRange": trainer.priceRange || "$$",
        "serviceArea": {
            "@type": "GeoCircle",
            "geoMidpoint": {
                "@type": "GeoCoordinates",
                "latitude": trainer.coordinates?.lat || -37.8136,
                "longitude": trainer.coordinates?.lng || 144.9631
            },
            "geoRadius": trainer.serviceRadius || "25000"
        },
        "hasOfferCatalog": {
            "@type": "OfferCatalog",
            "name": "Dog Training Services",
            "itemListElement": (trainer.services || []).map(service => ({
                "@type": "Offer",
                "itemOffered": {
                    "@type": "Service",
                    "name": service.name,
                    "description": service.description
                },
                "price": service.price,
                "priceCurrency": "AUD"
            }))
        },
        "aggregateRating": trainer.rating ? {
            "@type": "AggregateRating",
            "ratingValue": trainer.rating,
            "reviewCount": trainer.reviewCount || 1,
            "bestRating": "5",
            "worstRating": "1"
        } : null,
        "review": (trainer.reviews || []).slice(0, 5).map(review => ({
            "@type": "Review",
            "author": {
                "@type": "Person",
                "name": review.author
            },
            "reviewRating": {
                "@type": "Rating",
                "ratingValue": review.rating,
                "bestRating": "5",
                "worstRating": "1"
            },
            "reviewBody": review.text,
            "datePublished": review.date
        }))
    };
}

/**
 * Generate meta tags for search results pages
 */
export function generateSearchMetaTags(searchParams) {
    const { location, service, category } = searchParams;
    const baseUrl = 'https://dogtrainersdirectory.com.au';
    
    let title = 'Dog Trainers Directory Australia';
    let description = 'Find professional dog trainers across Australia. Expert training services for puppies and adult dogs.';
    
    if (location && service) {
        title = `${service} in ${location} - Dog Trainers Directory`;
        description = `Find professional ${service.toLowerCase()} services in ${location}. Compare qualified dog trainers, read reviews, and book consultations.`;
    } else if (location) {
        title = `Dog Trainers in ${location} - Professional Training Services`;
        description = `Find qualified dog trainers in ${location}. Compare services, prices, and reviews to find the perfect trainer for your dog.`;
    } else if (service) {
        title = `${service} Services - Professional Dog Trainers Australia`;
        description = `Find professional ${service.toLowerCase()} services across Australia. Expert trainers specializing in behavioral training and obedience.`;
    }
    
    return {
        title,
        description,
        canonical: `${baseUrl}/search${buildSearchQuery(searchParams)}`,
        openGraph: {
            title,
            description,
            url: `${baseUrl}/search${buildSearchQuery(searchParams)}`,
            type: 'website',
            image: `${baseUrl}/images/og-search.jpg`,
            site_name: 'Dog Trainers Directory Australia'
        },
        schema: generateSearchSchema(searchParams)
    };
}

/**
 * Generate schema for search results
 */
export function generateSearchSchema(searchParams) {
    const baseUrl = 'https://dogtrainersdirectory.com.au';
    
    return {
        "@context": "https://schema.org",
        "@type": "SearchResultsPage",
        "url": `${baseUrl}/search${buildSearchQuery(searchParams)}`,
        "name": "Dog Trainer Search Results",
        "description": "Search results for professional dog trainers",
        "potentialAction": {
            "@type": "SearchAction",
            "target": {
                "@type": "EntryPoint",
                "urlTemplate": `${baseUrl}/search?q={search_term_string}`
            },
            "query-input": "required name=search_term_string"
        }
    };
}

/**
 * Generate sitemap data
 */
export function generateSitemapData(trainers, pages = []) {
    const baseUrl = 'https://dogtrainersdirectory.com.au';
    const now = new Date().toISOString();
    
    const staticPages = [
        { url: baseUrl, lastmod: now, changefreq: 'daily', priority: '1.0' },
        { url: `${baseUrl}/trainers`, lastmod: now, changefreq: 'daily', priority: '0.9' },
        { url: `${baseUrl}/premium`, lastmod: now, changefreq: 'weekly', priority: '0.8' },
        { url: `${baseUrl}/about`, lastmod: now, changefreq: 'monthly', priority: '0.7' },
        { url: `${baseUrl}/contact`, lastmod: now, changefreq: 'monthly', priority: '0.7' },
        ...pages.map(page => ({
            url: `${baseUrl}${page.path}`,
            lastmod: page.lastmod || now,
            changefreq: page.changefreq || 'monthly',
            priority: page.priority || '0.6'
        }))
    ];
    
    const trainerPages = trainers.map(trainer => ({
        url: `${baseUrl}/trainers/${trainer.slug || trainer.id}`,
        lastmod: trainer.updated_at || now,
        changefreq: 'weekly',
        priority: trainer.subscription_type === 'premium' ? '0.9' : '0.8'
    }));
    
    return [...staticPages, ...trainerPages];
}

/**
 * Generate robots.txt content
 */
export function generateRobotsTxt() {
    const baseUrl = 'https://dogtrainersdirectory.com.au';
    
    return `User-agent: *
Allow: /
Disallow: /admin*
Disallow: /api/
Disallow: /_astro/
Disallow: /temp/

# Sitemap
Sitemap: ${baseUrl}/sitemap.xml

# Crawl-delay for respectful crawling
Crawl-delay: 1`;
}

/**
 * Build search query string from parameters
 */
function buildSearchQuery(params) {
    const query = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
        if (value && value.trim()) {
            query.append(key, value.trim());
        }
    });
    
    const queryString = query.toString();
    return queryString ? `?${queryString}` : '';
}

/**
 * Generate breadcrumb schema
 */
export function generateBreadcrumbSchema(breadcrumbs) {
    const baseUrl = 'https://dogtrainersdirectory.com.au';
    
    return {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": breadcrumbs.map((crumb, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "name": crumb.name,
            "item": crumb.url.startsWith('http') ? crumb.url : `${baseUrl}${crumb.url}`
        }))
    };
}

/**
 * Generate FAQ schema for trainer pages
 */
export function generateFAQSchema(faqs) {
    return {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faqs.map(faq => ({
            "@type": "Question",
            "name": faq.question,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": faq.answer
            }
        }))
    };
}

/**
 * Generate organization schema
 */
export function generateOrganizationSchema() {
    const baseUrl = 'https://dogtrainersdirectory.com.au';
    
    return {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "Dog Trainers Directory Australia",
        "url": baseUrl,
        "logo": `${baseUrl}/images/logo.png`,
        "description": "Australia's premier directory for professional dog trainers and training services",
        "contactPoint": {
            "@type": "ContactPoint",
            "telephone": "+61-1300-DOG-TRAIN",
            "contactType": "customer service",
            "availableLanguage": "English"
        },
        "sameAs": [
            "https://facebook.com/dogtrainersdirectoryau",
            "https://instagram.com/dogtrainersdirectoryau",
            "https://twitter.com/dogtrainersau"
        ],
        "address": {
            "@type": "PostalAddress",
            "addressLocality": "Melbourne",
            "addressRegion": "VIC",
            "addressCountry": "AU"
        }
    };
}

/**
 * Optimize meta description length
 */
export function optimizeMetaDescription(description, maxLength = 160) {
    if (description.length <= maxLength) {
        return description;
    }
    
    // Find the last complete sentence within the limit
    const truncated = description.substring(0, maxLength);
    const lastSentence = truncated.lastIndexOf('.');
    const lastSpace = truncated.lastIndexOf(' ');
    
    if (lastSentence > maxLength * 0.7) {
        return description.substring(0, lastSentence + 1);
    } else if (lastSpace > maxLength * 0.8) {
        return description.substring(0, lastSpace) + '...';
    } else {
        return description.substring(0, maxLength - 3) + '...';
    }
}

/**
 * Generate canonical URL with proper formatting
 */
export function generateCanonicalUrl(path, baseUrl = 'https://dogtrainersdirectory.com.au') {
    // Remove trailing slashes and ensure proper formatting
    const cleanPath = path.replace(/\/+$/, '');
    const cleanBase = baseUrl.replace(/\/+$/, '');
    
    if (cleanPath === '' || cleanPath === '/') {
        return cleanBase;
    }
    
    return `${cleanBase}${cleanPath.startsWith('/') ? cleanPath : '/' + cleanPath}`;
}

/**
 * Extract keywords from trainer data for SEO
 */
export function extractTrainerKeywords(trainer) {
    const keywords = new Set();
    
    // Add basic keywords
    keywords.add('dog trainer');
    keywords.add('dog training');
    keywords.add('pet training');
    
    // Add location-based keywords
    if (trainer.suburb) {
        keywords.add(`dog trainer ${trainer.suburb.toLowerCase()}`);
        keywords.add(`dog training ${trainer.suburb.toLowerCase()}`);
    }
    
    if (trainer.state) {
        keywords.add(`dog trainer ${trainer.state.toLowerCase()}`);
    }
    
    // Add service-based keywords
    if (trainer.specialties) {
        trainer.specialties.forEach(specialty => {
            keywords.add(specialty.toLowerCase());
            keywords.add(`${specialty.toLowerCase()} training`);
        });
    }
    
    // Add experience-based keywords
    if (trainer.experience) {
        keywords.add('experienced dog trainer');
        keywords.add('professional dog trainer');
    }
    
    return Array.from(keywords).slice(0, 20); // Limit to 20 keywords
}
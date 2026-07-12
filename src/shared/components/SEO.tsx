import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  canonical?: string;
  type?: 'website' | 'article' | 'video.movie' | 'video.tv_show' | 'profile';
  keywords?: string[];
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  structuredData?: Record<string, any>;
}

export const SEO = ({
  title = 'Cinephile - Your Ultimate Movie & TV Show Companion',
  description = 'Discover trending movies and TV shows, build your watchlist, and explore detailed information about your favorite content. Powered by TMDB.',
  image = '/logo.png', // Better default than og-image.jpg which doesn't exist
  url = 'https://cinephile.app',
  canonical,
  type = 'website',
  keywords = ['movies', 'tv shows', 'watchlist', 'tmdb', 'cinema', 'streaming'],
  author = 'Cinephile',
  publishedTime,
  modifiedTime,
  structuredData,
}: SEOProps) => {
  const siteTitle = 'Cinephile';
  const fullTitle = title.includes(siteTitle) ? title : `${title} | ${siteTitle}`;
  const canonicalUrl = canonical || url;

  // Default Structured Data for Website and Organization
  const defaultStructuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': 'https://cinephile.app/#website',
        url: 'https://cinephile.app/',
        name: siteTitle,
        description: 'Discover trending movies and TV shows, build your watchlist, and explore detailed information about your favorite content.',
        potentialAction: [
          {
            '@type': 'SearchAction',
            target: 'https://cinephile.app/search?q={search_term_string}',
            'query-input': 'required name=search_term_string'
          }
        ],
        inLanguage: 'en-US'
      },
      {
        '@type': 'Organization',
        '@id': 'https://cinephile.app/#organization',
        name: siteTitle,
        url: 'https://cinephile.app/',
        logo: {
          '@type': 'ImageObject',
          inLanguage: 'en-US',
          '@id': 'https://cinephile.app/#logo',
          url: 'https://cinephile.app/logo.png',
          contentUrl: 'https://cinephile.app/logo.png',
          width: 512,
          height: 512,
          caption: siteTitle
        },
        image: {
          '@id': 'https://cinephile.app/#logo'
        }
      }
    ]
  };

  const finalStructuredData = structuredData || defaultStructuredData;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords.join(', ')} />
      <meta name="author" content={author} />
      
      {/* Canonical URL - Prevent duplicate content issues */}
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Viewport & Mobile */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="theme-color" content="#8b5cf6" />
      
      {/* Open Graph (Facebook, LinkedIn) */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:site_name" content={siteTitle} />
      <meta property="og:locale" content="en_US" />
      
      {/* Open Graph - Image Details */}
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={fullTitle} />
      
      {/* Article Meta (for blog posts/reviews) */}
      {publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
      {author && <meta property="article:author" content={author} />}
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:site" content="@cinephile" />
      <meta name="twitter:creator" content="@cinephile" />
      
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(finalStructuredData)}
      </script>
    </Helmet>
  );
};

import { Helmet } from 'react-helmet-async';

interface MovieSEOProps {
  title: string;
  description: string;
  posterUrl: string;
  releaseDate: string;
  rating: number;
  genres: string[];
  director?: string;
  cast?: string[];
  duration?: number;
  tmdbId: number;
  type?: 'movie' | 'tv';
  slug?: string;
}

export const MovieSEO = ({
  title,
  description,
  posterUrl,
  releaseDate,
  rating,
  genres,
  director,
  cast = [],
  duration,
  tmdbId,
  type = 'movie',
  slug,
}: MovieSEOProps) => {
  const year = releaseDate ? new Date(releaseDate).getFullYear() : '';
  const fullTitle = `${title}${year ? ` (${year})` : ''} - ${type === 'movie' ? 'Movie' : 'TV Show'} | Cinephile`;
  
  // Generate SEO-friendly slug if not provided
  const generatedSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  const typePath = type === 'movie' ? 'movie' : 'tv';
  const pageUrl = `https://cinephile.app/${typePath}/${tmdbId}-${generatedSlug}`;
  
  // Structured Data (JSON-LD) for Google
  const structuredData: any = {
    '@context': 'https://schema.org',
    '@type': type === 'movie' ? 'Movie' : 'TVSeries',
    name: title,
    description,
    image: posterUrl,
    datePublished: releaseDate,
    genre: genres,
    url: pageUrl,
  };

  // Only include AggregateRating if rating > 0
  if (rating > 0) {
    structuredData.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: rating,
      bestRating: 10,
      worstRating: 0,
      ratingCount: 1, // TMDB doesn't give us exact count easily in this component, minimum 1 to be valid
    };
  }

  if (director) {
    structuredData.director = { '@type': 'Person', name: director };
  }

  if (cast.length > 0) {
    structuredData.actor = cast.map(name => ({ '@type': 'Person', name }));
  }

  if (duration) {
    structuredData.duration = `PT${duration}M`;
  }

  // Breadcrumb Schema
  const breadcrumbData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://cinephile.app/'
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: type === 'movie' ? 'Movies' : 'TV Shows',
        item: `https://cinephile.app/${typePath}s`
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: title,
        item: pageUrl
      }
    ]
  };

  const jsonLdData = [structuredData, breadcrumbData];

  return (
    <Helmet>
      {/* Basic Meta */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={`${title}, ${genres.join(', ')}, ${type}, ${type === 'movie' ? 'film' : 'tv series'}, watch ${title}`} />
      
      {/* Open Graph */}
      <meta property="og:type" content={type === 'movie' ? 'video.movie' : 'video.tv_show'} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={posterUrl} />
      <meta property="og:url" content={pageUrl} />
      <meta property="og:site_name" content="Cinephile" />
      
      {/* Movie/TV-specific OG tags */}
      <meta property="video:release_date" content={releaseDate} />
      {director && <meta property="video:director" content={director} />}
      {cast.map((actor, i) => (
        <meta key={i} property="video:actor" content={actor} />
      ))}
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={posterUrl} />
      <meta name="twitter:site" content="@cinephile" />
      
      {/* Canonical */}
      <link rel="canonical" href={pageUrl} />
      
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(jsonLdData)}
      </script>
    </Helmet>
  );
};

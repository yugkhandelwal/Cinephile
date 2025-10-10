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
}: MovieSEOProps) => {
  const year = releaseDate ? new Date(releaseDate).getFullYear() : '';
  const fullTitle = `${title}${year ? ` (${year})` : ''} - ${type === 'movie' ? 'Movie' : 'TV Show'} Info | Cinephile`;
  const pageUrl = `https://cinephile.app/title/${type}/${tmdbId}`;
  
  // Structured Data (JSON-LD) for Google
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': type === 'movie' ? 'Movie' : 'TVSeries',
    name: title,
    description,
    image: posterUrl,
    datePublished: releaseDate,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: rating,
      bestRating: 10,
      worstRating: 0,
    },
    genre: genres,
    ...(director && { director: { '@type': 'Person', name: director } }),
    ...(cast.length > 0 && {
      actor: cast.map(name => ({ '@type': 'Person', name })),
    }),
    ...(duration && { duration: `PT${duration}M` }),
    url: pageUrl,
  };

  return (
    <Helmet>
      {/* Basic Meta */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={`${title}, ${genres.join(', ')}, ${type}, ${type === 'movie' ? 'film' : 'tv series'}`} />
      
      {/* Open Graph */}
      <meta property="og:type" content={type === 'movie' ? 'video.movie' : 'video.tv_show'} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={posterUrl} />
      <meta property="og:url" content={pageUrl} />
      
      {/* Movie/TV-specific OG tags */}
      <meta property="video:release_date" content={releaseDate} />
      {director && <meta property="video:director" content={director} />}
      {cast.map((actor, i) => (
        <meta key={i} property="video:actor" content={actor} />
      ))}
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={posterUrl} />
      
      {/* Canonical */}
      <link rel="canonical" href={pageUrl} />
      
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    </Helmet>
  );
};

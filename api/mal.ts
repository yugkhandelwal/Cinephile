export const config = {
  runtime: 'edge', // Using Edge runtime for fast cold starts
};

export default async function handler(req: Request) {
  const { method, url } = req;
  const { searchParams } = new URL(url);
  
  // Extract the endpoint from the query, e.g. /api/mal?endpoint=/anime/ranking
  const endpoint = searchParams.get('endpoint');
  if (!endpoint) {
    return new Response(JSON.stringify({ error: 'Missing endpoint parameter' }), { status: 400 });
  }

  // Remove the endpoint param so we can pass the rest to MAL
  searchParams.delete('endpoint');
  
  const MAL_API_URL = 'https://api.myanimelist.net/v2';
  const targetUrl = `${MAL_API_URL}${endpoint}?${searchParams.toString()}`;

  const clientId = process.env.VITE_MAL_CLIENT_ID || process.env.MAL_CLIENT_ID;
  
  if (!clientId) {
    return new Response(JSON.stringify({ error: 'MAL API credentials not configured' }), { status: 500 });
  }

  try {
    const response = await fetch(targetUrl, {
      method,
      headers: {
        'X-MAL-CLIENT-ID': clientId,
      },
    });

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
        // Cache public API responses heavily
        'Cache-Control': 's-maxage=3600, stale-while-revalidate',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch from MAL API' }), { status: 500 });
  }
}

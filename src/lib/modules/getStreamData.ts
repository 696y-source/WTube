import { playerStore, setPlayerStore } from '@stores';

const instances = [
  "https://invidious.fdn.fr",
  "https://vid.puffyan.us",
  "https://invidious.nerdvpn.de",
  "https://yewtu.be"
];

export default async function(
  id: string,
  prefetch: boolean = false,
  signal?: AbortSignal
): Promise<Invidious | Record<'error' | 'message', string>> {

  const fetchData = async (
    proxy: string
  ): Promise<Invidious> => {

    const res = await fetch(
      `${proxy}/api/v1/videos/${id}`,
      {
        signal,
        headers: {
          'User-Agent': 'Mozilla/5.0'
        }
      }
    );

    if (!res.ok) {
      throw new Error(
        `HTTP error! status: ${res.status}`
      );
    }

    const data = await res.json();

    if (
      !data ||
      !('adaptiveFormats' in data) ||
      !Array.isArray(data.adaptiveFormats)
    ) {
      throw new Error(
        data?.error ||
        'Invalid response'
      );
    }

    if (
      !data.adaptiveFormats.some(
        (f: { type: string }) =>
          f.type?.startsWith('audio')
      )
    ) {
      throw new Error(
        'No audio streams found'
      );
    }

    return data;
  };

  // Try current proxy first
  if (playerStore.proxy || prefetch) {

    const p =
      playerStore.proxy ||
      instances[0];

    try {

      return await fetchData(p);

    } catch (e) {

      if (prefetch) {
        return {
          error: 'Prefetch failed',
          message: (e as Error).message
        };
      }

      console.warn(
        `Current proxy failed: ${p}`
      );
    }
  }

  // Rotate through instances
  for (const proxy of instances) {

    if (proxy === playerStore.proxy)
      continue;

    try {

      const data =
        await fetchData(proxy);

      setPlayerStore(
        'proxy',
        proxy
      );

      return data;

    } catch (e) {

      console.warn(
        `Proxy failed: ${proxy}`
      );
    }
  }

  return {
    error: 'All proxies failed',
    message:
      'Failed to fetch stream data from all available instances'
  };
}
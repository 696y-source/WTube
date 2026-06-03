import { playerStore, setPlayerStore } from '@stores';

const instances = [
  'https://invidious.fdn.fr',
  'https://invidious.nerdvpn.de',
  'https://vid.puffyan.us',
  'https://yt.artemislena.eu',
  'https://invidious.projectsegfau.lt'
];

export default async function(
  id: string,
  prefetch: boolean = false,
  signal?: AbortSignal
): Promise<Invidious | Record<'error' | 'message', string>> {

  const fetchData = async (
    proxy: string
  ): Promise<Invidious> => {

    const target =
      `${proxy}/api/v1/videos/${id}`;

    const res = await fetch(target, {
      signal,
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    });

    if (!res.ok) {
      throw new Error(
        `HTTP ${res.status}`
      );
    }

    const data = await res.json();

    if (
      !data ||
      !Array.isArray(data.adaptiveFormats)
    ) {
      throw new Error(
        'Invalid adaptiveFormats'
      );
    }

    const audioFormats =
      data.adaptiveFormats.filter(
        (f: any) =>
          typeof f.type === 'string' &&
          f.type.startsWith('audio')
      );

    if (!audioFormats.length) {
      throw new Error(
        'No audio streams'
      );
    }

    return data;
  };

  // Current proxy first
  if (playerStore.proxy || prefetch) {

    const p =
      playerStore.proxy || instances[0];

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
        `Proxy failed: ${p}`
      );
    }
  }

  // Rotate instances
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
        `Failed proxy: ${proxy}`
      );
    }
  }

  return {
    error: 'All proxies failed',
    message:
      'Failed to fetch stream data from all available instances'
  };
}
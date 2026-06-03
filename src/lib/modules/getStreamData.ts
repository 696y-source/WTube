import { setPlayerStore } from '@stores';

const instances = [
  "https://wtube-api.tahsin-hassan-2627.workers.dev"
];

export default async function(
  id: string,
  _prefetch: boolean = false,
  signal?: AbortSignal
): Promise<Invidious | Record<'error' | 'message', string>> {

  try {

    const res = await fetch(
      `${instances[0]}/streams/${id}`,
      {
        signal,
        headers: {
          'User-Agent': 'Mozilla/5.0'
        }
      }
    );

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
        'Invalid response'
      );
    }

    setPlayerStore(
      'proxy',
      instances[0]
    );

    return data;

  } catch (e) {

    console.error(e);

    return {
      error: 'Stream fetch failed',
      message:
        'Failed to fetch stream data from all available instances'
    };
  }
}
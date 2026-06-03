import { playerStore, setPlayerStore } from '@stores';

const instances = [
  "https://wtube-api.tahsin-hassan-2627.workers.dev"
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
      `${proxy}/streams/${id}`,
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
      !('adaptiveFormats' in data)
    ) {
      throw new Error(
        'Invalid response'
      );
    }

    return data;
  };

  try {

    const data =
      await fetchData(instances[0]);

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
        'Failed to fetch stream data'
    };
  }
}
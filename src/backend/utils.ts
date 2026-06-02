import { Innertube, UniversalCache, YTNodes, type Helpers } from 'youtubei.js';
let youtube: Innertube | null = null;
export async function getClient(): Promise<Innertube> {
  try {
    if (!youtube) {
      youtube = await Innertube.create({
        cache: new UniversalCache(false),
        generate_session_locally: true,
        retrieve_player: false,
        fetch: (...args) => fetch(...args)
      });
    }
    return youtube;
  } catch (error) {
    console.error('Failed to initialize YouTube client:', error);
    youtube = await Innertube.create({
      generate_session_locally: true,
      retrieve_player: false
    });
    return youtube;
  }
}
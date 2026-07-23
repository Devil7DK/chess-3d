// Web Audio playback for game cues. Files live in src/assets/sounds and are
// collected at build time — a missing file just means that cue stays silent,
// so the app never breaks on an absent asset and the set can grow by drop-in.
const files = import.meta.glob('../assets/sounds/*.{mp3,ogg,wav}', {
    eager: true,
    query: '?url',
    import: 'default',
}) as Record<string, string>;

const urls = new Map<string, string>();
for (const [path, url] of Object.entries(files)) {
    const name = path
        .split('/')
        .pop()!
        .replace(/\.\w+$/, '');
    urls.set(name, url);
}

export type SoundName =
    | 'move'
    | 'capture'
    | 'castle'
    | 'check'
    | 'promote'
    | 'game-start'
    | 'game-end';

const STORAGE_KEY = 'soundMuted';

let muted = localStorage.getItem(STORAGE_KEY) === 'true';

export const isSoundMuted = () => muted;

export const setSoundMuted = (value: boolean) => {
    muted = value;
    localStorage.setItem(STORAGE_KEY, String(value));
};

// One shared context, created lazily. The autoplay policy starts it
// suspended until a user gesture — every play() here is reached from a click
// or the resulting state change, so the resume lands inside that gesture.
let context: AudioContext | undefined;

const getContext = () => {
    context ??= new AudioContext();
    if (context.state === 'suspended') void context.resume();
    return context;
};

const buffers = new Map<string, AudioBuffer>();
const decoding = new Map<string, Promise<AudioBuffer | undefined>>();

const loadBuffer = (name: string): Promise<AudioBuffer | undefined> => {
    const cached = buffers.get(name);
    if (cached) return Promise.resolve(cached);

    const url = urls.get(name);
    if (!url) return Promise.resolve(undefined);

    let pending = decoding.get(name);
    if (!pending) {
        pending = (async () => {
            try {
                const response = await fetch(url);
                const data = await response.arrayBuffer();
                const buffer = await getContext().decodeAudioData(data);
                buffers.set(name, buffer);
                return buffer;
            } catch {
                return undefined; // A bad/absent file is silent, never fatal
            }
        })();
        decoding.set(name, pending);
    }
    return pending;
};

export const playSound = async (name: SoundName) => {
    if (muted) return;

    const ctx = getContext();
    const buffer = await loadBuffer(name);
    if (!buffer || muted) return;

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.start();
};

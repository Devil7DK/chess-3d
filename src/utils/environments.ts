import { EnvironmentPreset } from '../types';

// HDRIs bundled with the app rather than fetched from drei's CDN. Collected at
// build time; each stays a separate file, so only the chosen one is ever
// downloaded.
const files = import.meta.glob('../assets/hdri/*.exr', {
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

/** Presets with an HDRI to show for them, in the order they are offered. */
export const environmentPresets = [...urls.keys()].sort() as EnvironmentPreset[];

export const DEFAULT_ENVIRONMENT: EnvironmentPreset = 'studio';

export const getEnvironmentUrl = (preset: EnvironmentPreset) =>
    urls.get(preset);

export const isEnvironmentPreset = (
    value: string | null,
): value is EnvironmentPreset => !!value && urls.has(value);

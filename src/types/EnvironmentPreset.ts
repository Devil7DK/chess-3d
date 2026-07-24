/**
 * Image-based lighting for the 3D scene. Each preset is an HDRI bundled under
 * `src/assets/hdri`, so the list here and the files there move together.
 */
export type EnvironmentPreset =
    | 'apartment'
    | 'city'
    | 'dawn'
    | 'forest'
    | 'lobby'
    | 'night'
    | 'park'
    | 'studio'
    | 'sunset'
    | 'warehouse';

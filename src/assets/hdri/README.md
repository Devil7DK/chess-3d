# HDRI assets

Image-based lighting for the 3D scene, one file per environment preset,
collected by `src/utils/environments.ts` and passed to drei's `Environment`.

Only the selected preset is ever downloaded — the rest stay as separate files
the browser never asks for. Adding or removing one here changes what the
Settings panel offers, so keep `EnvironmentPreset` in `src/types` in step.

## Source & license

[Poly Haven](https://polyhaven.com/hdris) HDRIs, resized to 512×512 and
converted to DWAB-compressed EXR by
[@pmndrs/assets](https://github.com/pmndrs/assets), all CC0-1.0.

They were decoded out of that package's base64 modules rather than taking the
dependency, since only the raw files are needed:

```js
// node, after `npm pack @pmndrs/assets`
const data = text.match(/data:application\/exr;base64,([A-Za-z0-9+/=]+)/)[1];
fs.writeFileSync(`${name}.exr`, Buffer.from(data, 'base64'));
```

Previously these came from drei's `preset` prop, which fetches them from a
third-party CDN at runtime.

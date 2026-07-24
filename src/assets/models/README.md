# Model assets

Piece & highlight meshes, loaded by `useGLTF` in `src/components/Piece` and
`src/components/Frame`.

## Compression

The exported meshes were ~18 MB of base64-embedded `.gltf`. They are stored
here already welded, simplified and Meshopt-compressed, 400 kB in total, with
the decoder bundled by three-stdlib rather than fetched from a CDN.

To redo it for a new export, per model, with
[glTF-Transform](https://gltf-transform.dev):

```sh
npx @gltf-transform/cli weld <input> welded.glb
npx @gltf-transform/cli simplify welded.glb simplified.glb --ratio 0.1 --error 0.0005
npx @gltf-transform/cli meshopt simplified.glb <output>.glb
```

`--error` caps how far a simplified surface may drift from the original, so it,
not `--ratio`, is what protects the shape. The flatter models stop well short
of the requested ratio.

Meshopt quantizes positions, which leaves the dequantization transform on the
glTF node; `getBakedGeometry` in `src/utils/ModelUtils.ts` folds it back into
the geometry, since both components mount the geometry under a group of their
own.

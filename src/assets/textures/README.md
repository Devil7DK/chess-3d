# Texture assets

Wood maps for the board squares, border and pieces, loaded by `useTexture` in
`src/components/Board` and `src/components/Piece`.

## Compression

The originals were ~1 MB JPEGs at 1000–1024 px. A square is drawn around 50 px
and a piece around 90 px tall at the default camera, so 512 px is still well
oversampled — even zoomed all the way in the grain holds up.

To redo it for a new source image:

```sh
magick <input>.jpg -resize 512x512 -quality 90 -define webp:method=6 <output>.webp
```

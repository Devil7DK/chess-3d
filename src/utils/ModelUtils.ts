import { BufferAttribute, BufferGeometry, Mesh } from 'three';

// Geometry already carrying its node transform — useGLTF caches one glTF per
// file, so every component instance sees the same objects and must bake once.
const baked = new WeakSet<BufferGeometry>();

/**
 * Widens a quantized attribute back to floats. Quantized data is stored as
 * normalized integers, which silently truncate anything written back to them.
 */
function dequantize(geometry: BufferGeometry, name: string) {
    const attribute = geometry.getAttribute(name);
    if (!attribute?.normalized) return;

    const values = new Float32Array(attribute.count * attribute.itemSize);
    for (let i = 0; i < attribute.count; i++) {
        for (let item = 0; item < attribute.itemSize; item++) {
            values[i * attribute.itemSize + item] = attribute.getComponent(
                i,
                item,
            );
        }
    }

    geometry.setAttribute(name, new BufferAttribute(values, attribute.itemSize));
}

/**
 * Returns a node's geometry with the node's own transform folded in.
 *
 * The models are compressed with quantization, which parks the dequantization
 * scale & offset on the glTF node. Components mount the geometry under their
 * own group and so would otherwise drop it, leaving nothing visible.
 */
export function getBakedGeometry(node: Mesh): BufferGeometry {
    if (!baked.has(node.geometry)) {
        dequantize(node.geometry, 'position');
        dequantize(node.geometry, 'normal');

        node.updateWorldMatrix(true, false);
        node.geometry.applyMatrix4(node.matrixWorld);
        baked.add(node.geometry);
    }

    return node.geometry;
}

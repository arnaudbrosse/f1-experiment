import * as THREE from 'three';

import fragmentShader from '../../shaders/infinite-grid/fragment.glsl';
import vertexShader from '../../shaders/infinite-grid/vertex.glsl';

export class InfiniteGridMaterial extends THREE.ShaderMaterial {
    constructor () {
        super({
            vertexShader,
            fragmentShader,
            uniforms: {
                uSize1: { value: 10 },
                uSize2: { value: 10 },
                uColor: { value: new THREE.Color(0xfff) },
                uDistance: { value: 4000 }
            },
            side: THREE.DoubleSide,
            transparent: true
        });
    }
}

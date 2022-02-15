import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';

import { Pass } from './Pass';

import fragmentShader from '../../shaders/post-processing/vignette/fragment.glsl';
import vertexShader from '../../shaders/post-processing/vignette/vertex.glsl';

export class Vignette extends Pass {
    private vignettePass: ShaderPass;

    constructor (composer: EffectComposer) {
        super();

        const vignettePass = {
            uniforms: {
                tDiffuse: { type: 't', value: null },
                offset: { type: 'f', value: 1.0 },
                darkness: { type: 'f', value: 1.0 }
            },
            fragmentShader: fragmentShader,
            vertexShader: vertexShader
        };

        this.vignettePass = new ShaderPass(vignettePass);
        this.vignettePass.enabled = false;
        composer.addPass(this.vignettePass);
    }

    public tick (_dt: number): void {}

    public resize (): void {}
}

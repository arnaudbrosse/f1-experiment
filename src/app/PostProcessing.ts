import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';

import { Pass } from './Pass/Pass';
import { Vignette } from './Pass/Vignette';

export class PostProcessing {
    private composer: EffectComposer;
    private passes: Array<Pass>;

    constructor (renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.Camera) {
        this.composer = new EffectComposer(renderer);
        this.composer.addPass(new RenderPass(scene, camera));
        this.passes = new Array<Pass>();

        this.passes.push(new Vignette(this.composer));
    }

    public tick (dt: number): void {
        this.composer.render();
        this.passes.forEach(pass => pass.tick(dt));
    }

    public resize (): void {
        this.composer.setSize(window.innerWidth, window.innerHeight);
        this.passes.forEach(pass => pass.resize());
    }
}

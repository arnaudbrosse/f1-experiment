import * as THREE from 'three';

import { EventEmitter } from 'events';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader';
import { IResource } from './Resources';

interface ILoader {
    extensions: Array<string>;
    action: (resource: IResource) => void;
}

export class Loader extends EventEmitter {
    public toLoad: number;
    public loaded: number;
    private items: Map<string, any>;
    private loaders: Array<ILoader>;

    constructor (renderer: THREE.WebGLRenderer) {
        super();

        this.toLoad = 0;
        this.loaded = 0;
        this.items = new Map<string, any>();
        this.loaders = new Array<ILoader>();

        // Images
        this.loaders.push({
            extensions: ['jpg', 'png'],
            action: (resource) => {
                const image = new Image();

                image.addEventListener('load', () => {
                    this.fileLoadEnd(resource, image);
                });

                image.addEventListener('error', () => {
                    this.fileLoadEnd(resource, image);
                });

                image.src = resource.source;
            }
        });

        // GLTF
        const gltfLoader = new GLTFLoader()
            .setDRACOLoader(new DRACOLoader().setDecoderPath('/libs/draco/'))
            .setKTX2Loader(new KTX2Loader().setTranscoderPath('/libs/basis/').detectSupport(renderer));
        this.loaders.push({
            extensions: ['glb', 'gltf'],
            action: (resource: IResource) => {
                gltfLoader.load(resource.source, (data) => {
                    this.fileLoadEnd(resource, data);
                });
            }
        });
    }

    public load (resources: Array<IResource>) : void {
        for (const resource of resources) {
            this.toLoad++;
            const extensionMatch = resource.source.match(/\.([a-z0-9]+)$/);

            if (extensionMatch !== null && typeof extensionMatch[1] !== 'undefined') {
                const loader = this.loaders.find((loader) => loader.extensions.find((extension) => extension === extensionMatch[1]));

                if (loader) {
                    loader.action(resource);
                } else {
                    console.warn('Cannot found loader for ' + resource);
                }
            } else {
                console.warn('Cannot found extension of ' + resource);
            }
        }
    }

    private fileLoadEnd (resource: IResource, data: any) : void {
        this.loaded++;
        this.items.set(resource.name, data);

        this.emit('fileEnd', resource, data);

        if (this.loaded === this.toLoad) {
            this.emit('end');
        }
    }
}

import * as THREE from 'three';
import { EventEmitter } from 'events';

import { Loader } from './Loader';

enum ResourceType {
    Texture,
    Model
}

export interface IResource {
    name: string;
    source: string;
    type: ResourceType;
}

export class Resources extends EventEmitter {
    private items: Map<string, any>;
    private loader: Loader;

    constructor (renderer: THREE.WebGLRenderer) {
        super();

        this.items = new Map<string, any>();

        this.loader = new Loader(renderer);
        this.loader.load([
            { name: 'chassis', source: '/assets/models/chassis-compressed-draco.glb', type: ResourceType.Model },
            { name: 'wheel', source: '/assets/models/wheel.glb', type: ResourceType.Model },

            { name: 'shadow', source: '/assets/textures/shadow.png', type: ResourceType.Texture }
        ]);

        this.loader.on('fileEnd', (resource, data) => {
            switch (resource.type) {
            case ResourceType.Texture:
                const texture = new THREE.Texture(data);
                texture.needsUpdate = true;
                this.items.set(resource.name, texture);
                break;

            default:
                this.items.set(resource.name, data);
                break;
            }

            this.emit('progress', this.loader.loaded / this.loader.toLoad);
        });

        this.loader.on('end', () => {
            this.emit('ready');
        });
    }

    public get (name: string): any {
        if (this.items.has(name)) {
            return this.items.get(name);
        }
        console.warn('Can\'t find item ' + name);
        return null;
    }
}

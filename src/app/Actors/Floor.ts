import * as THREE from 'three';
import * as CANNON from 'cannon-es';

import { Actor } from './Actor';
import { InfiniteGridMaterial } from '../Materials/InfiniteGridMaterial';

class InfiniteGrid extends THREE.Mesh {
    constructor (size1: number, size2: number, color: THREE.Color, distance: number) {
        const geometry = new THREE.PlaneBufferGeometry(2, 2, 1, 1);
        const material = new InfiniteGridMaterial();

        super(geometry, material);
        this.frustumCulled = false;

        material.uniforms.uSize1.value = size1;
        material.uniforms.uSize2.value = size2;
        material.uniforms.uColor.value = color;
        material.uniforms.uDistance.value = distance;
    }
}

export class Floor extends Actor {
    private world: CANNON.World;
    private body: CANNON.Body;

    constructor (world: CANNON.World) {
        super();

        this.world = world;

        const geometry = new THREE.PlaneGeometry(4000, 4000);
        const material = new THREE.MeshBasicMaterial({ color: 0x001f62 });
        const plane = new THREE.Mesh(geometry, material);
        plane.rotateX(-Math.PI / 2);
        plane.translateZ(-0.05);
        plane.receiveShadow = false;
        this.add(plane);

        this.add(new InfiniteGrid(2, 20, new THREE.Color(0x5c8fc3), 4000));

        this.body = new CANNON.Body({
            mass: 0,
            shape: new CANNON.Box(new CANNON.Vec3(4000, 0.1, 4000))
        });
        this.body.position.x = 0;
        this.body.position.y = 0;
        this.body.position.z = 0;
        this.world.addBody(this.body);
    }

    public tick (_dt: number): void {}
}

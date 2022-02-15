import * as THREE from 'three';

export abstract class Actor extends THREE.Object3D {
    abstract tick (_dt: number): void;
}

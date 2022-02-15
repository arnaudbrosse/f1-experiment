import * as CANNON from 'cannon-es';

export class Physic {
    private world: CANNON.World;

    constructor () {
        this.world = new CANNON.World();
        this.world.gravity.set(0, -9.81, 0);
        this.world.broadphase = new CANNON.SAPBroadphase(this.world);
        this.world.allowSleep = true;
        this.world.defaultContactMaterial.friction = 0.5;
        this.world.defaultContactMaterial.restitution = 0.0;
    }

    public get (): CANNON.World {
        return this.world;
    }

    public tick (dt: number): void {
        this.world.step(1 / 60, dt, 3);
    }
}

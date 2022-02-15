import * as THREE from 'three';

import { Resources } from './Resources';
import { Renderer } from './Renderer';
import { Camera } from './Camera';
import { PostProcessing } from './PostProcessing';
import { Physic } from './Physic';
import { LoadingScreen } from './LoadingScreen';
import { Actor } from './Actors/Actor';
import { Floor } from './Actors/Floor';
import { Vehicle } from './Actors/Vehicle';

export default class App {
    private resources: Resources;
    private scene: THREE.Scene;
    private renderer: Renderer;
    private camera: Camera;
    private postProcessing: PostProcessing;
    private physic: Physic;
    private actors: Array<Actor>;
    private clock: THREE.Clock;
    private loadingScreen: LoadingScreen;

    constructor () {
        this.scene = new THREE.Scene();
        this.renderer = new Renderer();
        this.resources = new Resources(this.renderer.get());
        this.camera = new Camera(this.renderer.get());
        this.postProcessing = new PostProcessing(this.renderer.get(), this.scene, this.camera.get());
        this.physic = new Physic();
        this.actors = new Array<Actor>();
        this.clock = new THREE.Clock();

        this.loadingScreen = new LoadingScreen();

        this.tick();

        this.resize = this.resize.bind(this);
        window.addEventListener('resize', this.resize);

        this.resources.on('ready', () => {
            this.setActors();
            this.loadingScreen.onLoaded();
        });
    }

    private setActors (): void {
        this.actors.push(new Floor(this.physic.get()));
        const vehicle = new Vehicle(this.resources, this.physic.get());
        this.actors.push(vehicle);

        this.camera.setTarget(vehicle.getVehicle());

        this.actors.forEach(actor => this.scene.add(actor));
    }

    private tick (): void {
        let dt = this.clock.getDelta();
        dt = Math.min(dt, 1 / 20);

        this.camera.tick(dt);
        this.postProcessing.tick(dt);
        this.physic.tick(dt);

        this.actors.forEach(actor => actor.tick(dt));

        requestAnimationFrame(() => {
            this.tick();
        });
    }

    private resize (): void {
        this.renderer.resize();
        this.camera.resize();
        this.postProcessing.resize();
    }
}

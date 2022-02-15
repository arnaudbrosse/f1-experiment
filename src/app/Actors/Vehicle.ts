import * as THREE from 'three';
import * as CANNON from 'cannon-es';

import { Resources } from '../Resources';
import { Actor } from './Actor';
import { KeyboardController } from './VehicleController/KeyboardController';
import { TouchController } from './VehicleController/TouchController';

export class Vehicle extends Actor {
    private resources: Resources;
    private world: CANNON.World;
    private groundMaterial: CANNON.Material;
    private wheelMaterial: CANNON.Material;
    private vehicleModel: THREE.Mesh;
    private wheelModel: THREE.Mesh[] = [];
    private vehicle: CANNON.RaycastVehicle;
    private chassisBody: CANNON.Body;
    private wheelBodies: CANNON.Body[] = [];
    private shadow: THREE.Mesh;

    constructor (resources: Resources, world: CANNON.World) {
        super();

        this.resources = resources;
        this.world = world;

        this.setMaterial();
        this.setVehicle();
        this.setWheels();
        this.setShadow();

        new KeyboardController(this.vehicle);
        new TouchController(this.vehicle);
    }

    private setMaterial (): void {
        this.groundMaterial = new CANNON.Material('groundMaterial');
        this.wheelMaterial = new CANNON.Material('wheelMaterial');
        const wheelGroundContactMaterial = new CANNON.ContactMaterial(this.wheelMaterial, this.groundMaterial, {
            friction: 0.3,
            restitution: 0,
            contactEquationStiffness: 1000
        });

        this.world.addContactMaterial(wheelGroundContactMaterial);
    }

    private setVehicle (): void {
        // Body
        const chassisShape = new CANNON.Box(new CANNON.Vec3(1, 0.3, 2.7));
        this.chassisBody = new CANNON.Body({
            mass: 200,
            allowSleep: false
        });
        this.chassisBody.addShape(chassisShape);
        this.chassisBody.position.set(0, 0.5, 0);
        this.chassisBody.angularVelocity.set(0, 0, 0);

        // Model
        const model = this.resources.get('chassis');
        model.scene.traverse((child: { castShadow: boolean; receiveShadow: boolean; }) => {
            if (child instanceof THREE.Mesh) {
                child.castShadow = true;
                child.receiveShadow = true;

                child.translateZ(0.7);

                const mat = new THREE.MeshBasicMaterial();
                mat.name = child.material.name;
                mat.map = child.material.map;

                child.material = mat;
            }
        });

        this.vehicleModel = model.scene;
        this.add(this.vehicleModel);

        this.vehicle = new CANNON.RaycastVehicle({
            chassisBody: this.chassisBody,
            indexRightAxis: 0,
            indexUpAxis: 1,
            indexForwardAxis: 2
        });
    }

    private setWheels (): void {
        const options = {
            radius: 0.25,
            directionLocal: new CANNON.Vec3(0, -1, 0),
            suspensionStiffness: 45,
            suspensionRestLength: 0.4,
            frictionSlip: 5,
            dampingRelaxation: 2.3,
            dampingCompression: 4.5,
            maxSuspensionForce: 200000,
            rollInfluence: 0.01,
            axleLocal: new CANNON.Vec3(-1, 0, 0),
            chassisConnectionPointLocal: new CANNON.Vec3(1, 1, 0),
            maxSuspensionTravel: 0.25,
            customSlidingRotationalSpeed: -30,
            useCustomSlidingRotationalSpeed: true
        };

        const axelWidth = 0.8;

        options.chassisConnectionPointLocal.set(axelWidth, 0, -2.15);
        this.vehicle.addWheel(options);

        options.chassisConnectionPointLocal.set(-axelWidth, 0, -2.15);
        this.vehicle.addWheel(options);

        options.chassisConnectionPointLocal.set(axelWidth, 0, 1.65);
        this.vehicle.addWheel(options);

        options.chassisConnectionPointLocal.set(-axelWidth, 0, 1.65);
        this.vehicle.addWheel(options);

        this.vehicle.addToWorld(this.world);

        const model = this.resources.get('wheel').scene;
        model.traverse((child: { castShadow: boolean; receiveShadow: boolean; }) => {
            if (child instanceof THREE.Mesh) {
                child.castShadow = true;
                child.receiveShadow = true;

                const mat = new THREE.MeshBasicMaterial();
                mat.name = child.material.name;
                mat.map = child.material.map;

                child.material = mat;
            }
        });

        const model2 = model.clone();
        model2.traverse((child: { castShadow: boolean; receiveShadow: boolean; }) => {
            if (child instanceof THREE.Mesh) {
                child.rotateZ(Math.PI);
            }
        });

        this.vehicle.wheelInfos.forEach(wheel => {
            // Body
            const cylinderShape = new CANNON.Cylinder(wheel.radius, wheel.radius, wheel.radius / 2, 20);
            const wheelBody = new CANNON.Body({
                mass: 1,
                allowSleep: false,
                material: this.wheelMaterial
            });
            const q = new CANNON.Quaternion();
            q.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), Math.PI / 2);
            wheelBody.addShape(cylinderShape, new CANNON.Vec3(), q);
            this.wheelBodies.push(wheelBody);

            // Model
            const wheelModel = wheel.chassisConnectionPointLocal.x === -axelWidth ? model2.clone() : model.clone();
            this.wheelModel.push(wheelModel);
            this.add(wheelModel);
        });
    }

    private setShadow () {
        const texture = this.resources.get('shadow');
        const geometry = new THREE.PlaneGeometry(11.57 * 2, 11.57 * 2);
        geometry.rotateX(-Math.PI / 2);
        const material = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            depthWrite: false
        });
        this.shadow = new THREE.Mesh(geometry, material);
        this.shadow.position.y = 0.05;
        this.add(this.shadow);
    }

    public getVehicle (): THREE.Object3D {
        return this.vehicleModel;
    }

    public tick (_dt: number): void {
        this.vehicleModel.position.set(this.chassisBody.position.x, this.chassisBody.position.y, this.chassisBody.position.z);
        this.vehicleModel.quaternion.set(this.chassisBody.quaternion.x, this.chassisBody.quaternion.y, this.chassisBody.quaternion.z, this.chassisBody.quaternion.w);

        this.shadow.position.set(this.vehicleModel.position.x, this.shadow.position.y, this.vehicleModel.position.z);
        this.shadow.rotation.set(this.vehicleModel.rotation.x, this.vehicleModel.rotation.y, this.vehicleModel.rotation.z);

        for (let i = 0; i < this.vehicle.wheelInfos.length; i++) {
            this.vehicle.updateWheelTransform(i);
            const t = this.vehicle.wheelInfos[i].worldTransform;
            this.wheelBodies[i].position.copy(t.position);
            this.wheelBodies[i].quaternion.copy(t.quaternion);
            this.wheelModel[i].position.copy(new THREE.Vector3(t.position.x, t.position.y, t.position.z));
            this.wheelModel[i].quaternion.copy(new THREE.Quaternion(t.quaternion.x, t.quaternion.y, t.quaternion.z, t.quaternion.w));
        }
    }
}

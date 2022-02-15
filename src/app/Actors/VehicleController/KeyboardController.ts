import * as CANNON from 'cannon-es';

export class KeyboardController {
    constructor (vehicle: CANNON.RaycastVehicle) {
        document.addEventListener('keydown', function (e) {
            vehicle.setBrake(0, 0);
            vehicle.setBrake(0, 1);
            vehicle.setBrake(0, 2);
            vehicle.setBrake(0, 3);

            const engineForce = 800;
            const maxSteerVal = 0.3;

            switch (e.key) {
            case 'z':
            case 'ArrowUp':
                vehicle.applyEngineForce(-engineForce, 2);
                vehicle.applyEngineForce(-engineForce, 3);
                break;

            case 's':
            case 'ArrowDown':
                vehicle.applyEngineForce(engineForce, 2);
                vehicle.applyEngineForce(engineForce, 3);
                break;

            case 'd':
            case 'ArrowRight':
                vehicle.setSteeringValue(-maxSteerVal, 2);
                vehicle.setSteeringValue(-maxSteerVal, 3);
                break;

            case 'q':
            case 'ArrowLeft':
                vehicle.setSteeringValue(maxSteerVal, 2);
                vehicle.setSteeringValue(maxSteerVal, 3);
                break;
            }
        });
        document.addEventListener('keyup', function (e) {
            vehicle.setBrake(0, 0);
            vehicle.setBrake(0, 1);
            vehicle.setBrake(0, 2);
            vehicle.setBrake(0, 3);

            switch (e.key) {
            case 'z':
            case 'ArrowUp':
            case 's':
            case 'ArrowDown':
                vehicle.applyEngineForce(0, 2);
                vehicle.applyEngineForce(0, 3);
                break;

            case 'd':
            case 'ArrowRight':
            case 'q':
            case 'ArrowLeft':
                vehicle.setSteeringValue(0, 2);
                vehicle.setSteeringValue(0, 3);
                break;
            }
        });
    }
}

import * as CANNON from 'cannon-es';

class Joystick {
    private canvas: HTMLCanvasElement;
    private context: CanvasRenderingContext2D | null;
    private x: number;
    private y: number;
    private centerX: number;
    private centerY: number;

    constructor () {
        this.canvas = document.createElement('canvas');
        this.context = this.canvas.getContext('2d');
        this.canvas.style.position = 'fixed';
        this.canvas.style.bottom = '0';
        this.canvas.style.left = '0';
        this.canvas.width = innerWidth;
        this.canvas.height = innerHeight;
        document.body.appendChild(this.canvas);

        this.x = 0;
        this.y = 0;
        this.centerX = this.canvas.width / 2;
        this.centerY = this.canvas.height / 2;
    }

    private draw (): void {
        if (this.context) {
            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
            // Draw internal
            this.context.beginPath();
            this.context.arc(this.x, this.y, 30, 0, 2 * Math.PI, false);
            this.context.fillStyle = 'rgba(255, 255, 255, 0.5)';
            this.context.fill();
            // Draw external
            this.context.beginPath();
            this.context.arc(this.centerX, this.centerY, 75, 0, 2 * Math.PI, false);
            this.context.lineWidth = 2;
            this.context.fillStyle = 'rgba(255, 255, 255, 0.25)';
            this.context.fill();
            this.context.strokeStyle = 'rgba(255, 255, 255, 0.5)';
            this.context.stroke();
        }
    }

    public clear (): void {
        if (this.context) {
            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }

    public setPosition (x: number, y: number): void {
        this.x = x;
        this.y = y;
        this.draw();
    }

    public setCenter (x: number, y: number): void {
        this.centerX = x;
        this.centerY = y;
        this.draw();
    }

    public getX (): number {
        return this.centerX - this.x;
    }

    public getY (): number {
        return this.centerY - this.y;
    }
}

export class TouchController {
    private joystick: Joystick;
    private vehicle: CANNON.RaycastVehicle;

    constructor (vehicle: CANNON.RaycastVehicle) {
        this.vehicle = vehicle;
        this.joystick = new Joystick();

        this.touchDown = this.touchDown.bind(this);
        document.addEventListener('touchstart', this.touchDown);

        this.touchMove = this.touchMove.bind(this);
        document.addEventListener('touchmove', this.touchMove);

        this.touchEnd = this.touchEnd.bind(this);
        document.addEventListener('touchend', this.touchEnd);
    }

    private touchDown (event: TouchEvent): void {
        const downX = event.targetTouches[0].pageX;
        const downY = event.targetTouches[0].pageY;
        this.joystick.setCenter(downX, downY);
    }

    private touchMove (event: TouchEvent): void {
        const movedX = event.targetTouches[0].pageX;
        const movedY = event.targetTouches[0].pageY;
        this.joystick.setPosition(movedX, movedY);

        this.vehicle.setBrake(0, 0);
        this.vehicle.setBrake(0, 1);
        this.vehicle.setBrake(0, 2);
        this.vehicle.setBrake(0, 3);

        const engineForce = 800;
        const maxSteerVal = 0.3;

        const x = this.joystick.getX();
        const y = this.joystick.getY();
        if (x > 0) {
            this.vehicle.setSteeringValue(maxSteerVal, 2);
            this.vehicle.setSteeringValue(maxSteerVal, 3);
        } else if (x < 0) {
            this.vehicle.setSteeringValue(-maxSteerVal, 2);
            this.vehicle.setSteeringValue(-maxSteerVal, 3);
        }
        if (y > 0) {
            this.vehicle.applyEngineForce(-engineForce, 2);
            this.vehicle.applyEngineForce(-engineForce, 3);
        } else if (y < 0) {
            this.vehicle.applyEngineForce(engineForce, 2);
            this.vehicle.applyEngineForce(engineForce, 3);
        }
    }

    private touchEnd (): void {
        this.vehicle.setSteeringValue(0, 2);
        this.vehicle.setSteeringValue(0, 3);
        this.vehicle.applyEngineForce(0, 2);
        this.vehicle.applyEngineForce(0, 3);
        this.joystick.clear();
    }
}

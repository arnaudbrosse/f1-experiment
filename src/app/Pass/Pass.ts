export abstract class Pass {
    abstract tick (dt: number): void;
    abstract resize (): void;
}

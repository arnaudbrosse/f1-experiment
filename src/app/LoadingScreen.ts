export class LoadingScreen {
    private loadingScreenElement: HTMLElement;

    constructor () {
        this.loadingScreenElement = document.querySelector('.loading-screen') as HTMLElement;
    }

    public onLoaded (): void {
        window.setTimeout(() => {
            this.loadingScreenElement.classList.add('ended');
        }, 700);
    }
}

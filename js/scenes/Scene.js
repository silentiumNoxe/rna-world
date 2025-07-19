export class Scene {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.isPlaying = false;
        this.speed = 5;
        this.entities = [];
    }

    play() {
        this.isPlaying = true;
    }

    pause() {
        this.isPlaying = false;
    }

    step() {
        this.update(true);
    }

    setSpeed(speed) {
        this.speed = speed;
    }

    resize() {
        // Override in subclasses
    }

    update(forceUpdate = false) {
        // Skip update if not playing and not forced
        if (!this.isPlaying && !forceUpdate) return;

        // Override in subclasses
    }

    render() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Override in subclasses
    }

    // Helper function to draw a cell
    drawCell(x, y, radius, color, outlineColor = '#ffffff', outlineWidth = 2) {
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.fillStyle = color;
        this.ctx.fill();

        if (outlineWidth > 0) {
            this.ctx.lineWidth = outlineWidth;
            this.ctx.strokeStyle = outlineColor;
            this.ctx.stroke();
        }
    }
}

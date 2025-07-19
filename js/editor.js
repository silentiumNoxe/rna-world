/**
 * Editor class for customizing cells
 */
class Editor {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width;
        this.height = canvas.height;
        this.cell = null;
        this.availableColors = [
            'hsl(0, 100%, 60%)',    // Red
            'hsl(30, 100%, 60%)',   // Orange
            'hsl(60, 100%, 60%)',   // Yellow
            'hsl(120, 100%, 60%)',  // Green
            'hsl(210, 100%, 60%)',  // Blue
            'hsl(270, 100%, 60%)',  // Purple
            'hsl(330, 100%, 60%)'   // Pink
        ];
        this.currentColorIndex = 3; // Start with blue

        // Initialize the editor
        this.init();
    }

    init() {
        // Create a default cell in the center of the editor
        const x = this.width / 2;
        const y = this.height / 2;
        this.cell = new Cell(x, y, 30, this.availableColors[this.currentColorIndex]);

        // Make the cell static (no movement)
        this.cell.velocityX = 0;
        this.cell.velocityY = 0;
        this.cell.acceleration = 0;
        this.cell.energyDecay = 0;
    }

    update() {
        // In the editor, the cell doesn't move or change on its own
        if (this.cell) {
            // Keep the cell centered
            this.cell.x = this.width / 2;
            this.cell.y = this.height / 2;
        }
    }

    draw() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.width, this.height);

        // Draw background
        this.ctx.fillStyle = '#1A1A2E';
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Draw grid lines
        this.ctx.strokeStyle = 'rgba(70, 70, 120, 0.2)';
        this.ctx.lineWidth = 1;

        const gridSize = 50;

        // Vertical lines
        for (let x = 0; x <= this.width; x += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.height);
            this.ctx.stroke();
        }

        // Horizontal lines
        for (let y = 0; y <= this.height; y += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.width, y);
            this.ctx.stroke();
        }

        // Draw cell if it exists
        if (this.cell) {
            this.cell.draw(this.ctx);

            // Draw radius measurement lines
            this.ctx.beginPath();
            this.ctx.moveTo(this.cell.x, this.cell.y);
            this.ctx.lineTo(this.cell.x + this.cell.radius, this.cell.y);
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
            this.ctx.lineWidth = 1;
            this.ctx.stroke();

            // Draw radius value
            this.ctx.font = '14px Arial';
            this.ctx.fillStyle = 'white';
            this.ctx.fillText(
                `Радіус: ${Math.round(this.cell.radius)}`, 
                this.cell.x + this.cell.radius + 10, 
                this.cell.y + 5
            );

            // Draw cell info
            this.ctx.font = '16px Arial';
            this.ctx.fillStyle = 'white';
            this.ctx.fillText(
                `Коацерватна крапля`, 
                20, 
                this.height - 60
            );
            this.ctx.font = '14px Arial';
            this.ctx.fillText(
                `Колір: ${this.getCurrentColorName()}`, 
                20, 
                this.height - 40
            );
            this.ctx.fillText(
                `Розмір: ${Math.round(this.cell.radius * 2)} одиниць`, 
                20, 
                this.height - 20
            );
        }
    }

    resize() {
        resizeCanvas(this.canvas);
        this.width = this.canvas.width;
        this.height = this.canvas.height;

        // Re-center the cell
        if (this.cell) {
            this.cell.x = this.width / 2;
            this.cell.y = this.height / 2;
        }
    }

    increaseSize() {
        if (this.cell) {
            this.cell.changeSize(2);
        }
    }

    decreaseSize() {
        if (this.cell) {
            this.cell.changeSize(-2);
        }
    }

    changeColor() {
        if (this.cell) {
            this.currentColorIndex = (this.currentColorIndex + 1) % this.availableColors.length;
            this.cell.changeColor(this.availableColors[this.currentColorIndex]);
        }
    }

    getCurrentColorName() {
        const colorNames = [
            'Червоний',
            'Оранжевий',
            'Жовтий',
            'Зелений',
            'Синій',
            'Фіолетовий',
            'Рожевий'
        ];
        return colorNames[this.currentColorIndex];
    }

    getCustomizedCell() {
        // Return a copy of the current cell for use in the world
        if (this.cell) {
            return new Cell(
                0, 0,
                this.cell.radius,
                this.cell.color
            );
        }
        return null;
    }
}

/**
 * World class representing the environment where cells exist
 */
class World {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width;
        this.height = canvas.height;
        this.cells = [];
        this.foods = [];
        this.playerCell = null;
        this.running = false;
        this.speed = 5;
        this.foodGenerationRate = 0.05;
        this.maxFoods = 50;

        this.mousePosition = { x: 0, y: 0 };

        // Add event listener for mouse movement
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mousePosition.x = e.clientX - rect.left;
            this.mousePosition.y = e.clientY - rect.top;
        });

        // Initialize the world
        this.init();
    }

    init() {
        // Create player cell in the center of the world
        const playerX = this.width / 2;
        const playerY = this.height / 2;
        this.playerCell = new Cell(playerX, playerY, 25, 'hsl(210, 100%, 60%)');
        this.cells.push(this.playerCell);

        // Add some initial cells
        for (let i = 0; i < 10; i++) {
            const x = random(50, this.width - 50);
            const y = random(50, this.height - 50);
            const radius = random(10, 20);
            const cell = new Cell(x, y, radius);
            this.cells.push(cell);
        }

        // Add some initial food
        for (let i = 0; i < 20; i++) {
            this.addFood();
        }
    }

    addFood() {
        const x = random(10, this.width - 10);
        const y = random(10, this.height - 10);
        const size = random(3, 7);
        const food = {
            x,
            y,
            size,
            color: `hsl(${randomInt(80, 150)}, 100%, 50%)`
        };
        this.foods.push(food);
    }

    update() {
        if (!this.running) return;

        // Update player cell based on mouse position
        if (this.playerCell && this.playerCell.alive) {
            const dx = this.mousePosition.x - this.playerCell.x;
            const dy = this.mousePosition.y - this.playerCell.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance > 5) {
                const directionX = dx / distance;
                const directionY = dy / distance;
                this.playerCell.move(directionX, directionY);
            }
        }

        // Update all cells
        for (let i = this.cells.length - 1; i >= 0; i--) {
            const cell = this.cells[i];

            // Skip dead cells
            if (!cell.alive) {
                this.cells.splice(i, 1);
                continue;
            }

            // Update cell position and state
            cell.update(this.width, this.height);

            // Check for food consumption
            for (let j = this.foods.length - 1; j >= 0; j--) {
                const food = this.foods[j];
                const dist = distance(cell.x, cell.y, food.x, food.y);

                if (dist < cell.radius + food.size) {
                    cell.consumeFood(food.size);
                    this.foods.splice(j, 1);
                }
            }

            // AI behavior for non-player cells
            if (cell !== this.playerCell) {
                // Find the nearest food
                let nearestFood = null;
                let minDist = Infinity;

                for (const food of this.foods) {
                    const dist = distance(cell.x, cell.y, food.x, food.y);
                    if (dist < minDist) {
                        minDist = dist;
                        nearestFood = food;
                    }
                }

                // Move towards the nearest food
                if (nearestFood && minDist < 200) {
                    const dx = nearestFood.x - cell.x;
                    const dy = nearestFood.y - cell.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist > 5) {
                        const directionX = dx / dist * 0.5;
                        const directionY = dy / dist * 0.5;
                        cell.move(directionX, directionY);
                    }
                } else {
                    // Random movement
                    if (Math.random() < 0.05) {
                        const directionX = random(-1, 1);
                        const directionY = random(-1, 1);
                        cell.move(directionX, directionY);
                    }
                }
            }
        }

        // Generate new food
        if (Math.random() < this.foodGenerationRate * (this.speed / 5) && this.foods.length < this.maxFoods) {
            this.addFood();
        }
    }

    draw() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.width, this.height);

        // Draw background
        this.ctx.fillStyle = '#0A0E1E';
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Draw grid lines
        this.ctx.strokeStyle = 'rgba(50, 50, 100, 0.2)';
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

        // Draw food
        for (const food of this.foods) {
            this.ctx.beginPath();
            this.ctx.arc(food.x, food.y, food.size, 0, Math.PI * 2);
            this.ctx.fillStyle = food.color;
            this.ctx.fill();
        }

        // Draw cells
        for (const cell of this.cells) {
            cell.draw(this.ctx);
        }

        // Draw player cell highlight if it exists
        if (this.playerCell && this.playerCell.alive) {
            this.ctx.beginPath();
            this.ctx.arc(this.playerCell.x, this.playerCell.y, this.playerCell.radius + 5, 0, Math.PI * 2);
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
        }
    }

    resize() {
        resizeCanvas(this.canvas);
        this.width = this.canvas.width;
        this.height = this.canvas.height;
    }

    play() {
        this.running = true;
    }

    pause() {
        this.running = false;
    }

    setSpeed(speed) {
        this.speed = speed;
        this.foodGenerationRate = 0.01 * speed;
    }
}

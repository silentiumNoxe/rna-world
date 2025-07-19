import { Scene } from './Scene.js';
import { Cell } from '../entities/Cell.js';
import { Nucleotide } from '../entities/Nucleotide.js';
import { ResourceSpot } from '../entities/ResourceSpot.js';

export class WorldScene extends Scene {
    constructor(canvas) {
        super(canvas);
        this.nucleotides = [];
        this.rnaStrands = [];
        this.camera = { x: 0, y: 0 };

        // Array to store resource spots
        this.resourceSpots = [];

        // Create multiple cells with different sizes and colors
        this.createCells(30);

        // The first cell can still be the player's main reference
        this.playerCell = this.entities[0];

        // Initialize the world
        this.init();

        // Generate random food particles
        this.generateFood(20);

        // Generate resource spots
        this.generateResourceSpots();

        // Setup mouse/touch controls
        this.setupControls();
    }

            init() {
        // Setup initial RNA strands and environment
        console.log('World scene initialized');
            }

    setupControls() {
        // Initialize camera position
        this.camera = { x: 0, y: 0 };
        this.isDragging = false;
        this.dragStart = { x: 0, y: 0 };

        // Mouse down handler for camera drag
        this.canvas.addEventListener('mousedown', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.isDragging = true;
            this.dragStart = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };
        });

        // Mouse move handler for camera drag
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            if (this.isDragging) {
                const currentPos = {
                    x: e.clientX - rect.left,
                    y: e.clientY - rect.top
                };

                // Update camera position based on drag difference
                this.camera.x += (this.dragStart.x - currentPos.x) * 0.5;
                this.camera.y += (this.dragStart.y - currentPos.y) * 0.5;

                // Update drag start position
                this.dragStart = currentPos;
            }
        });

        // Mouse up handler to end dragging
        this.canvas.addEventListener('mouseup', () => {
            this.isDragging = false;
        });

        // Mouse leave handler to end dragging
        this.canvas.addEventListener('mouseleave', () => {
            this.isDragging = false;
        });

        // Touch controls
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (e.touches.length > 0) {
                const rect = this.canvas.getBoundingClientRect();
                this.mousePosition = {
                    x: e.touches[0].clientX - rect.left,
                    y: e.touches[0].clientY - rect.top
                };
            }
        });
    }

            createCells(count) {
        const cellColors = [
            '#3b82f6', // Blue
            '#ef4444', // Red
            '#10b981', // Green
            '#f59e0b', // Orange
            '#6366f1', // Purple
            '#ec4899'  // Pink
        ];

        for (let i = 0; i < count; i++) {
            const x = Math.random() * this.canvas.width;
            const y = Math.random() * this.canvas.height;
            const radius = 10 + Math.random() * 20; // Varied sizes
            const color = cellColors[Math.floor(Math.random() * cellColors.length)];

            // Create a new cell - first one is the player's reference cell (isPlayer=true)
            const isPlayer = i === 0;
            this.entities.push(new Cell(x, y, radius, color, isPlayer));
        }
            }

            generateFood(count) {
        for (let i = 0; i < count; i++) {
            const x = Math.random() * this.canvas.width;
            const y = Math.random() * this.canvas.height;
            const radius = 5 + Math.random() * 5;

            // Generate a random nucleotide color
            const nucleotides = ['#ef4444', '#10b981', '#f59e0b', '#6366f1']; // A, U, G, C
            const color = nucleotides[Math.floor(Math.random() * nucleotides.length)];

            // Create a small food cell (isPlayer = false)
            this.entities.push(new Cell(x, y, radius, color, false));
        }
    }

    generateResourceSpots() {
        // Create a variety of resource spots across the map
        const resourceTypes = ['carbon', 'nitrogen', 'phosphorus', 'sulfur'];
        const sizeCategoriesCount = {
            small: 15,  // Більше маленьких туманних зон
            medium: 8,  // Більше середніх туманних зон
            large: 4    // Більше великих туманних зон
        };

        // Generate spots of different sizes
        for (const [size, count] of Object.entries(sizeCategoriesCount)) {
            for (let i = 0; i < count; i++) {
                // Random position within the canvas, avoid edges
                const margin = 100;
                const x = margin + Math.random() * (this.canvas.width - 2 * margin);
                const y = margin + Math.random() * (this.canvas.height - 2 * margin);

                // Random resource type
                const resourceType = resourceTypes[Math.floor(Math.random() * resourceTypes.length)];

                // Create and add the resource spot
                this.resourceSpots.push(new ResourceSpot(x, y, resourceType, size));
            }
        }
    }

    update(forceUpdate = false) {
        // Call the parent class update method
        super.update(forceUpdate);

        if (!this.isPlaying && !forceUpdate) return;

        // Update RNA molecules, handle interactions, etc.

        // Update all entities with autonomous movement
        for (const entity of this.entities) {
            entity.update(this.canvas.width, this.canvas.height);
        }

        // Update resource spots and remove depleted ones
        for (let i = this.resourceSpots.length - 1; i >= 0; i--) {
            const spot = this.resourceSpots[i];
            const stillActive = spot.update();

            if (!stillActive) {
                this.resourceSpots.splice(i, 1);
            }
        }

        // Check for cells interacting with resource spots
        this.handleResourceInteractions();

        // Check for collisions and food consumption
        this.checkCollisions();

        // Replace consumed food
        if (this.entities.length < 20) {
            this.generateFood(1);
        }

        // Occasionally generate new resource spots
        if (Math.random() < 0.002 || this.resourceSpots.length < 5) {
            const resourceTypes = ['carbon', 'nitrogen', 'phosphorus', 'sulfur'];
            const resourceType = resourceTypes[Math.floor(Math.random() * resourceTypes.length)];
            const size = Math.random() < 0.7 ? 'small' : (Math.random() < 0.9 ? 'medium' : 'large');

            const x = Math.random() * this.canvas.width;
            const y = Math.random() * this.canvas.height;

            this.resourceSpots.push(new ResourceSpot(x, y, resourceType, size));
        }
    }

    checkCollisions() {
        if (!this.playerCell) return;

        for (let i = this.entities.length - 1; i >= 0; i--) {
            const entity = this.entities[i];

            // Skip the player cell
            if (entity === this.playerCell) continue;

            const dx = this.playerCell.x - entity.x;
            const dy = this.playerCell.y - entity.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // If the player cell is touching a smaller cell
            if (distance < this.playerCell.radius + entity.radius && this.playerCell.radius > entity.radius) {
                // Consume the smaller cell
                this.playerCell.radius += entity.radius / 5;
                this.entities.splice(i, 1);
            }
        }
    }

    handleResourceInteractions() {
        // Check for all cells interacting with resource spots
        for (const entity of this.entities) {
            if (!(entity instanceof Cell)) continue;

            for (const spot of this.resourceSpots) {
                if (spot.isColliding(entity)) {
                    // Cell is in contact with resource spot, absorb some resources
                    const absorbAmount = entity.absorbResource(spot.resourceType, 0.1);

                    if (absorbAmount > 0) {
                        // Resource was absorbed, deplete from the spot
                        spot.consumeResource(absorbAmount);
                    }
                }
            }
        }
    }

    render() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Save the current transformation matrix
        this.ctx.save();

        // Apply camera transformation
        this.ctx.translate(-this.camera.x, -this.camera.y);

        // Draw background
        this.ctx.fillStyle = '#f0f9ff'; // Light blue background
        this.ctx.fillRect(this.camera.x, this.camera.y, this.canvas.width, this.canvas.height);

        // Draw background grid
        this.drawGrid();

        // Draw resource spots under everything else
        for (const spot of this.resourceSpots) {
            spot.draw(this.ctx);
        }

        // Draw RNA strands and other elements

        // Draw all entities
        for (const entity of this.entities) {
            if (entity === this.playerCell) continue; // Draw player last
            entity.draw(this.ctx);
        }

        // Draw player on top
        if (this.playerCell) {
            this.playerCell.draw(this.ctx);
        }

        // Draw resource information for player
        if (this.playerCell) {
            this.drawResourceInfo();
        }

        // Restore the transformation matrix
        this.ctx.restore();
    }

    drawResourceInfo() {
        // Draw a small panel with resource information
        this.ctx.save();

        // Reset transform to draw in screen space
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);

        const padding = 10;
        const panelWidth = 160;
        const panelHeight = 90;
        const x = this.canvas.width - panelWidth - padding;
        const y = padding;

        // Draw panel background
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        this.ctx.fillRect(x, y, panelWidth, panelHeight);
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        this.ctx.strokeRect(x, y, panelWidth, panelHeight);

        // Draw title
        this.ctx.fillStyle = 'white';
        this.ctx.font = '12px Arial';
        this.ctx.fillText('Ресурси клітини:', x + 10, y + 20);

        // Draw resource bars
        const resourceLabels = {
            carbon: 'Вуглець',
            nitrogen: 'Азот',
            phosphorus: 'Фосфор',
            sulfur: 'Сірка'
        };

        const resourceColors = {
            carbon: 'rgba(80, 200, 120, 0.8)',
            nitrogen: 'rgba(100, 150, 255, 0.8)',
            phosphorus: 'rgba(255, 190, 100, 0.8)',
            sulfur: 'rgba(255, 255, 100, 0.8)'
        };

        let lineY = y + 35;
        for (const [resource, label] of Object.entries(resourceLabels)) {
            const amount = this.playerCell.resources[resource] || 0;
            const percentage = amount / this.playerCell.resourceCapacity;

            // Draw label
            this.ctx.fillStyle = 'white';
            this.ctx.fillText(label + ':', x + 10, lineY);

            // Draw bar background
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
            this.ctx.fillRect(x + 70, lineY - 10, 80, 12);

            // Draw bar fill
            this.ctx.fillStyle = resourceColors[resource];
            this.ctx.fillRect(x + 70, lineY - 10, 80 * percentage, 12);

            lineY += 15;
        }

        this.ctx.restore();
    }

    drawGrid() {
        const gridSize = 30;
        const gridColor = 'rgba(255, 255, 255, 0.1)';

        this.ctx.strokeStyle = gridColor;
        this.ctx.lineWidth = 1;

        // Calculate grid boundaries based on camera position
        const startX = Math.floor(this.camera.x / gridSize) * gridSize;
        const startY = Math.floor(this.camera.y / gridSize) * gridSize;
        const endX = startX + this.canvas.width + gridSize;
        const endY = startY + this.canvas.height + gridSize;

        // Vertical lines
        for (let x = startX; x <= endX; x += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, startY);
            this.ctx.lineTo(x, endY);
            this.ctx.stroke();
        }

        // Horizontal lines
        for (let y = startY; y <= endY; y += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(startX, y);
            this.ctx.lineTo(endX, y);
            this.ctx.stroke();
        }
    }

    resize() {
        // Handle canvas resize
        if (!this.canvas) return;

        // Update any size-dependent variables for RNA simulation
        console.log('World scene resized');

        if (this.playerCell) {
            // Adjust player position when canvas is resized
            this.playerCell.x = Math.min(this.playerCell.x, this.canvas.width);
            this.playerCell.y = Math.min(this.playerCell.y, this.canvas.height);
        }
    }
}

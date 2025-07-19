import { Scene } from './Scene.js';
import { Cell } from '../entities/Cell.js';
import { Nucleotide } from '../entities/Nucleotide.js';
import { ResourceSpot } from '../entities/ResourceSpot.js';
import { Overseer } from '../entities/Overseer.js';

export class WorldScene extends Scene {
    constructor(canvas) {
        super(canvas);
        this.nucleotides = [];
        this.rnaStrands = [];
        this.camera = { x: 0, y: 0 };

        // Світ розміром 1000x1000
        this.worldWidth = 1000;
        this.worldHeight = 1000;

        // Array to store resource spots
        this.resourceSpots = [];

        // Create multiple cells with different sizes and colors
        this.createCells(30);

        // Create the overseer to manage multiple cells
        this.overseer = new Overseer();

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
        this.isSelecting = false;

        // Mouse down handler for camera drag or cell selection
        this.canvas.addEventListener('mousedown', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            // Convert screen coordinates to world coordinates
            const worldX = mouseX + this.camera.x;
            const worldY = mouseY + this.camera.y;

            // Check if we're selecting/deselecting a cell
            if (e.shiftKey) {
                // Try to select a cell with Shift key pressed
                this.isSelecting = this.overseer.selectCell(this.entities, worldX, worldY);
            } else if (e.ctrlKey || e.metaKey) {
                // Try to deselect a cell with Ctrl/Cmd key pressed
                this.isSelecting = this.overseer.deselectCell(worldX, worldY);
            } 

            // If we're not selecting/deselecting, start camera drag
            if (!this.isSelecting) {
                this.isDragging = true;
                this.dragStart = { x: mouseX, y: mouseY };
            }
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

            // Update current mouse position for the overseer's reference
            this.mousePosition = {
                x: e.clientX - rect.left + this.camera.x,
                y: e.clientY - rect.top + this.camera.y
            };
        });

        // Mouse up handler to end dragging and selection
        this.canvas.addEventListener('mouseup', () => {
            this.isDragging = false;
            this.isSelecting = false;
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

        // Keyboard controls for the overseer
        document.addEventListener('keydown', (e) => {
            // Space bar to boost selected cells
            if (e.code === 'Space') {
                this.overseer.boostSelectedCells();
            }

            // Escape key to deselect all cells
            if (e.code === 'Escape') {
                this.overseer.deselectAll();
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
            const x = Math.random() * this.worldWidth;
            const y = Math.random() * this.worldHeight;
            const radius = 10 + Math.random() * 20; // Varied sizes
            const color = cellColors[Math.floor(Math.random() * cellColors.length)];

            // Create a new cell - no player cell anymore, all cells are autonomous
            this.entities.push(new Cell(x, y, radius, color, false));
        }
            }

            generateFood(count) {
        for (let i = 0; i < count; i++) {
            const x = Math.random() * this.worldWidth;
            const y = Math.random() * this.worldHeight;
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

        // Розмір світу 1000x1000
        const worldWidth = 1000;
        const worldHeight = 1000;

        // Generate spots of different sizes
        for (const [size, count] of Object.entries(sizeCategoriesCount)) {
            for (let i = 0; i < count; i++) {
                // Розкидаємо по всій карті, уникаючи самих країв
                const margin = 50;
                const x = margin + Math.random() * (worldWidth - 2 * margin);
                const y = margin + Math.random() * (worldHeight - 2 * margin);

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
            entity.update(this.worldWidth, this.worldHeight);
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

            // Розмір світу 1000x1000
            const worldWidth = 1000;
            const worldHeight = 1000;

            // Розкидаємо по всій карті, уникаючи самих країв
            const margin = 50;
            const x = margin + Math.random() * (worldWidth - 2 * margin);
            const y = margin + Math.random() * (worldHeight - 2 * margin);

            this.resourceSpots.push(new ResourceSpot(x, y, resourceType, size));
        }
    }

    checkCollisions() {
        // Check collisions between all cells
        for (let i = 0; i < this.entities.length; i++) {
            const entityA = this.entities[i];
            if (!(entityA instanceof Cell)) continue;

            for (let j = i + 1; j < this.entities.length; j++) {
                const entityB = this.entities[j];
                if (!(entityB instanceof Cell)) continue;

                const dx = entityA.x - entityB.x;
                const dy = entityA.y - entityB.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                // If cells are touching and one is larger
                if (distance < entityA.radius + entityB.radius) {
                    // The larger cell consumes the smaller one
                    if (entityA.radius > entityB.radius * 1.2) {
                        // A eats B
                        entityA.radius += entityB.radius / 5;
                        this.entities.splice(j, 1);
                        j--; // Adjust index after removal

                        // If the eaten cell was selected, update the overseer
                        if (entityB.isSelected) {
                            const index = this.overseer.selectedCells.indexOf(entityB);
                            if (index !== -1) {
                                this.overseer.selectedCells.splice(index, 1);
                            }
                        }
                    } else if (entityB.radius > entityA.radius * 1.2) {
                        // B eats A
                        entityB.radius += entityA.radius / 5;
                        this.entities.splice(i, 1);
                        i--; // Adjust index after removal
                        break; // Move to next i since this one is removed

                        // If the eaten cell was selected, update the overseer
                        if (entityA.isSelected) {
                            const index = this.overseer.selectedCells.indexOf(entityA);
                            if (index !== -1) {
                                this.overseer.selectedCells.splice(index, 1);
                            }
                        }
                    }
                }
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

        // Draw background - темний фон як у мікроскопі
        this.ctx.fillStyle = '#000814'; // Майже чорний з синім відтінком
        this.ctx.fillRect(this.camera.x, this.camera.y, this.canvas.width, this.canvas.height);

        // Додаємо ефект круглого поля зору мікроскопа
        this.drawMicroscopeView();

        // Додаємо легкі плаваючі частинки для ефекту глибини
        this.drawFloatingParticles();

        // Draw background grid з тонкими лініями
        this.drawGrid();

        // Draw resource spots under everything else
        for (const spot of this.resourceSpots) {
            spot.draw(this.ctx);
        }

        // Draw RNA strands and other elements

        // Draw all entities
        for (const entity of this.entities) {
            entity.draw(this.ctx);
        }

        // Draw selection indicators for selected cells
        this.overseer.drawSelections(this.ctx);

        // Draw resource information for selected cells
        if (this.overseer.selectedCells.length > 0) {
            this.drawResourceInfo();
        }

        // Restore the transformation matrix
        this.ctx.restore();
    }

            // Метод для створення ефекту круглого поля зору мікроскопа
            drawMicroscopeView() {
        const centerX = this.camera.x + this.canvas.width / 2;
        const centerY = this.camera.y + this.canvas.height / 2;
        const radius = Math.max(this.canvas.width, this.canvas.height) * 0.8; // Трохи менше повного екрану

        // Створюємо градієнт від центру до країв
        const gradient = this.ctx.createRadialGradient(
            centerX, centerY, radius * 0.7,
            centerX, centerY, radius
        );
        gradient.addColorStop(0, 'rgba(0, 128, 128, 0.03)'); // Ледь помітний бірюзовий відтінок
        gradient.addColorStop(1, 'rgba(0, 64, 64, 0.3)'); // Затемнення по краях

        // Малюємо круглу зону перегляду з градієнтом
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        this.ctx.fillStyle = gradient;
        this.ctx.fill();

        // Додаємо круглу рамку як у мікроскопі
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        this.ctx.strokeStyle = 'rgba(0, 120, 120, 0.3)';
        this.ctx.lineWidth = 20;
        this.ctx.stroke();

        // Додаємо легкий шум та аберацію
        this.drawMicroscopeAberration(centerX, centerY, radius);
            }

            // Метод для створення плаваючих частинок у рідині
            drawFloatingParticles() {
        if (!this.floatingParticles) {
            // Ініціалізуємо плаваючі частинки при першому виклику
            this.floatingParticles = [];
            const particleCount = 80;

            for (let i = 0; i < particleCount; i++) {
                this.floatingParticles.push({
                    x: Math.random() * this.worldWidth,
                    y: Math.random() * this.worldHeight,
                    size: 0.5 + Math.random() * 1.5,
                    speedX: (Math.random() - 0.5) * 0.2,
                    speedY: (Math.random() - 0.5) * 0.2,
                    opacity: 0.1 + Math.random() * 0.3
                });
            }
        }

        // Оновлюємо та малюємо частинки
        for (const particle of this.floatingParticles) {
            // Рух частинок
            particle.x += particle.speedX;
            particle.y += particle.speedY;

            // Зациклюємо в межах світу
            if (particle.x < 0) particle.x = this.worldWidth;
            if (particle.x > this.worldWidth) particle.x = 0;
            if (particle.y < 0) particle.y = this.worldHeight;
            if (particle.y > this.worldHeight) particle.y = 0;

            // Малюємо частинку
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(170, 240, 230, ${particle.opacity})`;
            this.ctx.fill();
        }
            }

            // Метод для створення ефектів аберації мікроскопа
            drawMicroscopeAberration(centerX, centerY, radius) {
        // Додаємо ледь помітні хроматичні аберації по краях
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius * 0.97, 0, Math.PI * 2);
        this.ctx.strokeStyle = 'rgba(0, 180, 180, 0.04)';
        this.ctx.lineWidth = 6;
        this.ctx.stroke();

        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius * 0.95, 0, Math.PI * 2);
        this.ctx.strokeStyle = 'rgba(100, 220, 220, 0.03)';
        this.ctx.lineWidth = 4;
        this.ctx.stroke();
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

        // Панель інформації в стилі мікроскопа - з рамкою як у лабораторному приладі
        this.ctx.fillStyle = 'rgba(10, 30, 35, 0.8)';
        this.ctx.fillRect(x, y, panelWidth, panelHeight);

        // Додаємо рамку в стилі лабораторного приладу
        this.ctx.strokeStyle = 'rgba(60, 180, 180, 0.4)';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(x, y, panelWidth, panelHeight);

        // Додаємо другу рамку всередині для ефекту панелі приладу
        this.ctx.strokeStyle = 'rgba(40, 150, 150, 0.3)';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(x + 3, y + 3, panelWidth - 6, panelHeight - 6);

        // Draw title
        this.ctx.fillStyle = 'rgba(140, 230, 230, 0.8)';
        this.ctx.font = '12px Courier New, monospace'; // Шрифт як у лабораторних приладах
        this.ctx.fillText('РЕСУРСИ КЛІТИНИ:', x + 10, y + 20);

        // Draw resource bars
        const resourceLabels = {
            carbon: 'Вуглець',
            nitrogen: 'Азот',
            phosphorus: 'Фосфор',
            sulfur: 'Сірка'
        };

        // Кольори в монохромному стилі з різними відтінками синьо-зеленого
        const resourceColors = {
            carbon: 'rgba(120, 220, 200, 0.7)',
            nitrogen: 'rgba(100, 200, 220, 0.7)',
            phosphorus: 'rgba(140, 210, 190, 0.7)',
            sulfur: 'rgba(160, 220, 180, 0.7)'
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

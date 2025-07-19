export class Cell {
    constructor(x, y, radius, color, isSelected = false) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.isSelected = isSelected;

        // Movement properties
        this.speed = 0.5 + Math.random() * 1.5;
        this.direction = Math.random() * Math.PI * 2;
        this.directionChangeTime = 0;
        this.directionChangeCooldown = 30 + Math.random() * 100;

        // For particle effect
        this.particles = [];
        if (isSelected) {
            this.createParticles(15);
        }

        // Resource properties
        this.resources = {
            carbon: 0,
            nitrogen: 0,
            phosphorus: 0,
            sulfur: 0
        };
        this.resourceCapacity = radius * 5; // Max resources based on size
        this.resourceAbsorptionRate = 0.1 + (isSelected ? 0.1 : 0); // Selected cells absorb slightly faster
    }

    createParticles(count) {
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: 0,
                y: 0,
                angle: Math.random() * Math.PI * 2,
                distance: this.radius * 0.5 + Math.random() * this.radius * 0.3,
                speed: 0.01 + Math.random() * 0.02,
                size: 1 + Math.random() * 3
            });
        }
    }

    draw(ctx) {
        // Draw main cell body
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();

        // Draw outline
        ctx.lineWidth = 2;
        ctx.strokeStyle = this.isSelected ? '#ffffff' : 'rgba(255, 255, 255, 0.5)';
        ctx.stroke();

        if (this.isSelected) {
            // Draw inner membrane
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius * 0.8, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(220, 220, 230, 0.15)';
            ctx.fill();

            // Update and draw particles
            this.updateParticles();
            this.drawParticles(ctx);

            // Draw cell nucleus
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius * 0.4, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(40, 45, 60, 0.25)';
            ctx.fill();

            // Draw resource indicators for player cell
            this.drawResourceIndicators(ctx);
        } else {
            // Simple food cell - draw inner gradient
            const gradient = ctx.createRadialGradient(
                this.x, this.y, 0,
                this.x, this.y, this.radius
            );
            gradient.addColorStop(0, 'rgba(200, 200, 210, 0.5)');
            gradient.addColorStop(1, 'rgba(200, 200, 210, 0)');

            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius * 0.5, 0, Math.PI * 2);
            ctx.fillStyle = gradient;
            ctx.fill();
        }
    }

    drawResourceIndicators(ctx) {
        // Only draw resource indicators if the cell has resources
        const totalResources = Object.values(this.resources).reduce((sum, val) => sum + val, 0);
        if (totalResources <= 0) return;

        const resourceColors = {
            carbon: 'rgba(80, 120, 100, 0.7)',
            nitrogen: 'rgba(80, 100, 130, 0.7)',
            phosphorus: 'rgba(130, 110, 90, 0.7)',
            sulfur: 'rgba(120, 120, 80, 0.7)'
        };

        // Draw resource level as small orbs around the cell
        let startAngle = 0;
        for (const [resource, amount] of Object.entries(this.resources)) {
            if (amount <= 0) continue;

            // Calculate the percentage of this resource
            const percentage = amount / this.resourceCapacity;
            const angleSize = Math.PI * 2 * percentage;

            // Draw resource arc
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius * 0.6, startAngle, startAngle + angleSize);
            ctx.lineTo(this.x, this.y);
            ctx.fillStyle = resourceColors[resource];
            ctx.fill();

            startAngle += angleSize;
        }
    }

    updateParticles() {
        for (const particle of this.particles) {
            particle.angle += particle.speed;
            particle.x = this.x + Math.cos(particle.angle) * particle.distance;
            particle.y = this.y + Math.sin(particle.angle) * particle.distance;
        }
    }

    drawParticles(ctx) {
        ctx.fillStyle = 'rgba(220, 220, 230, 0.5)';
        for (const particle of this.particles) {
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    update(worldWidth, worldHeight) {
        // Autonomous movement
        this.directionChangeTime++;

        // Randomly change direction occasionally
        if (this.directionChangeTime > this.directionChangeCooldown) {
            this.direction = Math.random() * Math.PI * 2;
            this.directionChangeTime = 0;
            this.directionChangeCooldown = 30 + Math.random() * 100;
        }

        // Move in current direction
        this.x += Math.cos(this.direction) * this.speed;
        this.y += Math.sin(this.direction) * this.speed;

        // Boundary collision detection - change direction when hitting walls
        if (this.x - this.radius < 0) {
            this.x = this.radius;
            this.direction = Math.PI - this.direction;
        } else if (this.x + this.radius > worldWidth) {
            this.x = worldWidth - this.radius;
            this.direction = Math.PI - this.direction;
        }

        if (this.y - this.radius < 0) {
            this.y = this.radius;
            this.direction = -this.direction;
        } else if (this.y + this.radius > worldHeight) {
            this.y = worldHeight - this.radius;
            this.direction = -this.direction;
        }

        // Update particles if selected cell
        if (this.isSelected) {
            this.updateParticles();
        }
    }

    absorbResource(resourceType, amount) {
        // Calculate how much resource the cell can absorb
        const totalCurrentResources = Object.values(this.resources).reduce((sum, val) => sum + val, 0);
        const availableCapacity = this.resourceCapacity - totalCurrentResources;

        if (availableCapacity <= 0) return 0; // Cell is full

        // Limit absorption to available capacity
        const absorbAmount = Math.min(amount, availableCapacity, this.resourceAbsorptionRate);

        // Add resources to cell
        if (this.resources.hasOwnProperty(resourceType)) {
            this.resources[resourceType] += absorbAmount;

            // If this is a selected cell, increase size slightly based on resources
            if (this.isSelected && absorbAmount > 0) {
                // Gradual growth based on resources
                this.radius += absorbAmount * 0.01;
            }

            return absorbAmount; // Return amount actually absorbed
        }

        return 0; // Unknown resource type
    }
}

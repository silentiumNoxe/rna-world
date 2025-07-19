/**
 * Cell class representing a coacervate droplet
 */
class Cell {
    constructor(x, y, radius = 20, color = randomColor()) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocityX = random(-0.5, 0.5);
        this.velocityY = random(-0.5, 0.5);
        this.maxVelocity = 3;
        this.acceleration = 0.1;
        this.friction = 0.98;
        this.alive = true;
        this.energy = 100;
        this.energyDecay = 0.02;
        this.energyGain = 5;
        this.maxEnergy = 200;
    }

    update(worldWidth, worldHeight) {
        // Update position based on velocity
        this.x += this.velocityX;
        this.y += this.velocityY;

        // Apply friction
        this.velocityX *= this.friction;
        this.velocityY *= this.friction;

        // Boundary collision detection
        if (this.x - this.radius < 0) {
            this.x = this.radius;
            this.velocityX = Math.abs(this.velocityX);
        } else if (this.x + this.radius > worldWidth) {
            this.x = worldWidth - this.radius;
            this.velocityX = -Math.abs(this.velocityX);
        }

        if (this.y - this.radius < 0) {
            this.y = this.radius;
            this.velocityY = Math.abs(this.velocityY);
        } else if (this.y + this.radius > worldHeight) {
            this.y = worldHeight - this.radius;
            this.velocityY = -Math.abs(this.velocityY);
        }

        // Energy decay over time
        this.energy -= this.energyDecay;

        // Check if cell is still alive
        if (this.energy <= 0) {
            this.alive = false;
        }
    }

    draw(ctx) {
        // Draw cell body
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.globalAlpha = 0.8;
        ctx.fill();

        // Draw cell membrane
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Reset global alpha
        ctx.globalAlpha = 1;

        // Draw energy indicator
        const energyPercentage = this.energy / this.maxEnergy;
        const indicatorRadius = this.radius * 0.7;

        ctx.beginPath();
        ctx.arc(
            this.x,
            this.y,
            indicatorRadius,
            0,
            Math.PI * 2 * energyPercentage
        );
        ctx.strokeStyle = `hsl(${energyPercentage * 120}, 100%, 50%)`;
        ctx.lineWidth = 3;
        ctx.stroke();
    }

    move(directionX, directionY) {
        // Apply acceleration in the specified direction
        this.velocityX += directionX * this.acceleration;
        this.velocityY += directionY * this.acceleration;

        // Limit maximum velocity
        const speed = Math.sqrt(this.velocityX ** 2 + this.velocityY ** 2);
        if (speed > this.maxVelocity) {
            const ratio = this.maxVelocity / speed;
            this.velocityX *= ratio;
            this.velocityY *= ratio;
        }

        // Moving consumes energy
        this.energy -= 0.05;
    }

    consumeFood(foodAmount) {
        this.energy += foodAmount * this.energyGain;
        if (this.energy > this.maxEnergy) {
            this.energy = this.maxEnergy;
        }

        // Cell grows slightly when consuming food
        this.radius += 0.1;
    }

    changeColor(color) {
        this.color = color;
    }

    changeSize(sizeChange) {
        this.radius += sizeChange;

        // Ensure minimum and maximum size
        if (this.radius < 5) {
            this.radius = 5;
        } else if (this.radius > 50) {
            this.radius = 50;
        }
    }
}

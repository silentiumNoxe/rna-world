export class Nucleotide {
    constructor(x, y, radius, type) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.type = type; // A, U, G, C
        this.vx = 0;
        this.vy = 0;

        // Movement properties
        this.speed = 0.2 + Math.random() * 0.8; // Nucleotides move slower than cells
        this.direction = Math.random() * Math.PI * 2;
        this.directionChangeTime = 0;
        this.directionChangeCooldown = 20 + Math.random() * 80;

        // Set color based on nucleotide type
        switch (type) {
            case 'A': this.color = '#ef4444'; break; // Red
            case 'U': this.color = '#10b981'; break; // Green
            case 'G': this.color = '#f59e0b'; break; // Orange
            case 'C': this.color = '#6366f1'; break; // Purple
            default: this.color = '#888888';
        }

        // Text color
        this.textColor = '#ffffff';
    }

    draw(ctx) {
        // Draw nucleotide circle
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();

        // Draw outline
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.stroke();

        // Draw nucleotide letter
        ctx.fillStyle = this.textColor;
        ctx.font = `${this.radius}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.type, this.x, this.y);

        // Add a highlight effect
        ctx.beginPath();
        ctx.arc(this.x - this.radius * 0.3, this.y - this.radius * 0.3, this.radius * 0.2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fill();
    }

    update(worldWidth, worldHeight) {
        // Autonomous movement
        this.directionChangeTime++;

        // Randomly change direction occasionally
        if (this.directionChangeTime > this.directionChangeCooldown) {
            this.direction = Math.random() * Math.PI * 2;
            this.directionChangeTime = 0;
            this.directionChangeCooldown = 20 + Math.random() * 80;
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
    }
}

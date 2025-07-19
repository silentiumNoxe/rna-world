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
        // Визначаємо колір нуклеотиду для мікроскопічного вигляду
        let microscopeColor;
        switch (this.type) {
            case 'A': microscopeColor = 'rgba(170, 210, 200, 0.7)'; break; // A - світло-бірюзовий
            case 'U': microscopeColor = 'rgba(160, 200, 210, 0.7)'; break; // U - голубий
            case 'G': microscopeColor = 'rgba(180, 200, 190, 0.7)'; break; // G - сіро-зелений
            case 'C': microscopeColor = 'rgba(190, 210, 200, 0.7)'; break; // C - м'ятний
            default: microscopeColor = 'rgba(180, 200, 200, 0.7)';
        }

        // Основна форма нуклеотиду - трохи неправильна (для більшої реалістичності)
        ctx.beginPath();

        // Додаємо невеликі нерівності контуру
        const segments = 8;
        const angleStep = Math.PI * 2 / segments;

        for (let i = 0; i <= segments; i++) {
            const angle = i * angleStep;
            const radiusVariation = 0.85 + Math.random() * 0.3; // 0.85-1.15
            const x = this.x + Math.cos(angle) * this.radius * radiusVariation;
            const y = this.y + Math.sin(angle) * this.radius * radiusVariation;

            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }

        ctx.closePath();

        // Градієнт для ефекту об'єму
        const gradient = ctx.createRadialGradient(
            this.x - this.radius * 0.3, this.y - this.radius * 0.3, 0,
            this.x, this.y, this.radius
        );
        gradient.addColorStop(0, microscopeColor);
        gradient.addColorStop(1, microscopeColor.replace('0.7', '0.5'));

        ctx.fillStyle = gradient;
        ctx.fill();

        // Тонкий контур
        ctx.lineWidth = 0.8;
        ctx.strokeStyle = 'rgba(220, 240, 240, 0.4)';
        ctx.stroke();

        // Позначаємо тип нуклеотиду більш тонко, як різниця в структурі
        ctx.fillStyle = 'rgba(230, 250, 250, 0.2)';
        ctx.font = `${this.radius * 0.8}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.type, this.x, this.y);

        // Додаємо внутрішню структуру замість простого відблиску
        ctx.beginPath();
        ctx.arc(
            this.x - this.radius * 0.2, 
            this.y - this.radius * 0.2, 
            this.radius * 0.4, 
            0, 
            Math.PI * 2
        );
        ctx.fillStyle = 'rgba(230, 250, 250, 0.15)';
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

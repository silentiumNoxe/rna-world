/**
 * ResourceSpot class representing areas of concentrated resources in the world
 */
export class ResourceSpot {
    constructor(x, y, resourceType, size = 'medium') {
        this.x = x;
        this.y = y;
        this.resourceType = resourceType;

        // Set initial radius based on size category (increased sizes)
        if (size === 'small') {
            this.maxRadius = 40 + Math.random() * 20;
        } else if (size === 'medium') {
            this.maxRadius = 70 + Math.random() * 30;
        } else { // large
            this.maxRadius = 100 + Math.random() * 50;
        }

        this.radius = this.maxRadius;
        this.resourceAmount = this.radius * 10; // Resource amount proportional to size
        this.depleted = false;

        // Visual properties
        this.color = this.getResourceColor();
        this.fadeOpacity = 1;
    }

    getResourceColor() {
        // Кольори більш нейтральні, як у мікроскопічному зображенні
        // з різними відтінками для різних ресурсів
        switch (this.resourceType) {
            case 'carbon':
                return 'rgba(120, 180, 170, 0.15)'; // Блакитно-зелений для вуглецю
            case 'nitrogen':
                return 'rgba(140, 170, 190, 0.15)'; // Блакитний для азоту
            case 'phosphorus':
                return 'rgba(170, 180, 160, 0.15)'; // Світло-сірий з зеленуватим для фосфору
            case 'sulfur':
                return 'rgba(180, 180, 150, 0.15)'; // Світло-жовтий для сірки
            default:
                return 'rgba(160, 160, 160, 0.15)'; // Сірий для невідомого
        }
    }

    update() {
        // No pulsing animation, just check if depleted
        if (this.depleted) {
            this.fadeOpacity -= 0.01; // Slower fade out
            if (this.fadeOpacity <= 0) {
                this.fadeOpacity = 0;
                return false; // Signal for removal
            }
        }

        return true; // Keep in the scene
    }

    draw(ctx) {
        // Don't draw if completely faded
        if (this.fadeOpacity <= 0) return;

        // Save context for clipping
        ctx.save();

        // Малюємо неоднорідну структуру, як у препараті під мікроскопом
        this.drawMicroscopicTexture(ctx);

        // Центральна частина показує кількість ресурсу
        const resourcePercentage = this.resourceAmount / (this.maxRadius * 10);

        if (resourcePercentage > 0.05) {
            // Градієнт для центральної частини, імітуємо зміну щільності речовини
            const innerGradient = ctx.createRadialGradient(
                this.x, this.y, 0,
                this.x, this.y, this.radius * 0.4 * resourcePercentage
            );

            // Більш інтенсивний колір в центрі
            const centerColor = this.color.replace(/[^,]+(?=\))/, this.fadeOpacity * 0.3);
            innerGradient.addColorStop(0, centerColor);
            innerGradient.addColorStop(0.7, centerColor.replace(/[^,]+(?=\))/, this.fadeOpacity * 0.15));
            innerGradient.addColorStop(1, centerColor.replace(/[^,]+(?=\))/, this.fadeOpacity * 0.05));

            // Малюємо центральну частину
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius * 0.4 * resourcePercentage, 0, Math.PI * 2);
            ctx.fillStyle = innerGradient;
            ctx.fill();
        }

        // Restore context
        ctx.restore();
    }

    // Метод для створення ефекту мікроскопічної текстури
    drawMicroscopicTexture(ctx) {
        // Ініціалізуємо точки текстури при першому виклику
        if (!this.texturePoints) {
            this.texturePoints = [];
            const pointsCount = Math.floor(this.radius * 0.8);

            for (let i = 0; i < pointsCount; i++) {
                const angle = Math.random() * Math.PI * 2;
                const distance = Math.random() * this.radius;

                // Розмір точки зменшується до країв
                const distanceRatio = distance / this.radius;
                const size = 0.5 + Math.random() * (1 - distanceRatio) * 1.5;

                this.texturePoints.push({
                    x: Math.cos(angle) * distance,
                    y: Math.sin(angle) * distance,
                    size: size,
                    opacity: (1 - distanceRatio * 0.8) * 0.2
                });
            }
        }

        // Малюємо фонову область
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        const baseColor = this.color.replace(/[^,]+(?=\))/, this.fadeOpacity * 0.07);
        ctx.fillStyle = baseColor;
        ctx.fill();

        // Малюємо кожну точку текстури
        for (const point of this.texturePoints) {
            ctx.beginPath();
            ctx.arc(
                this.x + point.x,
                this.y + point.y,
                point.size,
                0,
                Math.PI * 2
            );

            // Отримуємо базовий колір з тонкою зміною відтінку для різноманіття
            const colorParts = this.color.match(/\d+/g);
            if (colorParts && colorParts.length >= 3) {
                const r = parseInt(colorParts[0]) + Math.random() * 20 - 10;
                const g = parseInt(colorParts[1]) + Math.random() * 20 - 10;
                const b = parseInt(colorParts[2]) + Math.random() * 20 - 10;
                ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${point.opacity * this.fadeOpacity})`;
            } else {
                ctx.fillStyle = this.color.replace(/[^,]+(?=\))/, point.opacity * this.fadeOpacity);
            }

            ctx.fill();
        }
    }

    consumeResource(amount) {
        // Return the actual amount consumed
        if (this.resourceAmount <= 0) {
            return 0;
        }

        const actualAmount = Math.min(amount, this.resourceAmount);
        this.resourceAmount -= actualAmount;

        // Update radius based on remaining resources
        this.radius = this.maxRadius * (this.resourceAmount / (this.maxRadius * 10));

        // Mark as depleted if empty
        if (this.resourceAmount <= 0) {
            this.depleted = true;
        }

        return actualAmount;
    }

    isColliding(cell) {
        // Check if a cell is within this resource spot
        // Using a smaller effective radius (80% of visual radius) for better gameplay
        const effectiveRadius = this.radius * 0.8;
        const distance = Math.sqrt(
            Math.pow(this.x - cell.x, 2) + 
            Math.pow(this.y - cell.y, 2)
        );

        return distance < effectiveRadius + cell.radius;
    }
}

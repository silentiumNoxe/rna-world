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
        // Different colors for different resource types (more fog-like with lower opacity)
        switch (this.resourceType) {
            case 'carbon':
                return 'rgba(80, 200, 120, 0.3)'; // Green fog for carbon
            case 'nitrogen':
                return 'rgba(100, 150, 255, 0.3)'; // Blue fog for nitrogen
            case 'phosphorus':
                return 'rgba(255, 190, 100, 0.3)'; // Orange fog for phosphorus
            case 'sulfur':
                return 'rgba(255, 255, 100, 0.3)'; // Yellow fog for sulfur
            default:
                return 'rgba(200, 200, 200, 0.3)'; // Grey fog for unknown
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

        // Create a simple circle for the fog effect
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);

        // Create a gradient for a fog-like effect
        const gradient = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, this.radius
        );

        const baseColor = this.color.replace(/[^,]+(?=\))/, this.fadeOpacity * 0.7);
        gradient.addColorStop(0, baseColor);
        gradient.addColorStop(0.6, baseColor.replace(/[^,]+(?=\))/, this.fadeOpacity * 0.4));
        gradient.addColorStop(1, baseColor.replace(/[^,]+(?=\))/, 0));

        ctx.fillStyle = gradient;
        ctx.fill();

        // Simple center circle showing resource amount
        const resourcePercentage = this.resourceAmount / (this.maxRadius * 10);
        const innerRadius = this.radius * 0.3 * resourcePercentage;

        if (innerRadius > 1) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, innerRadius, 0, Math.PI * 2);
            ctx.fillStyle = this.color.replace(/[^,]+(?=\))/, this.fadeOpacity * 0.8);
            ctx.fill();
        }

        // Restore context
        ctx.restore();
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

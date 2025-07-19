import { Scene } from './Scene.js';
import { Nucleotide } from '../entities/Nucleotide.js';
export class EditorScene extends Scene {
    constructor(canvas) {
        super(canvas);
        this.nucleotides = [];
        this.bonds = [];
        this.sequence = '';

        // Physics simulation parameters
        this.gravity = 0.05;
        this.friction = 0.98;
        this.repulsion = 200;
        this.attraction = 0.05;
        this.bondStrength = 0.1;

        // Initial simulation setup
        this.generateRandomSequence();
    }

    generateRandomSequence() {
        const length = 10 + Math.floor(Math.random() * 20); // 10-30 nucleotides
        const nucleotides = ['A', 'U', 'G', 'C'];
        let sequence = '';

        for (let i = 0; i < length; i++) {
            sequence += nucleotides[Math.floor(Math.random() * nucleotides.length)];
        }

        document.getElementById('rna-sequence').value = sequence;
        this.simulateSequence(sequence);
    }

    simulateSequence(sequence) {
        this.sequence = sequence.toUpperCase();
        this.nucleotides = [];
        this.bonds = [];

        // Create nucleotides
        const radius = 15;
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const circleRadius = Math.min(this.canvas.width, this.canvas.height) * 0.3;

        for (let i = 0; i < this.sequence.length; i++) {
            const angle = (i / this.sequence.length) * Math.PI * 2;
            const x = centerX + Math.cos(angle) * circleRadius;
            const y = centerY + Math.sin(angle) * circleRadius;

            const nucleotide = new Nucleotide(
                x, y,
                radius,
                this.sequence[i]
            );

            // Add random initial velocity
            nucleotide.vx = (Math.random() - 0.5) * 2;
            nucleotide.vy = (Math.random() - 0.5) * 2;

            this.nucleotides.push(nucleotide);
        }

        // Create bonds between consecutive nucleotides (RNA backbone)
        for (let i = 0; i < this.nucleotides.length - 1; i++) {
            this.bonds.push({
                nucleotide1: i,
                nucleotide2: i + 1,
                type: 'backbone'
            });
        }

        // Find complementary pairs
        this.findComplementaryPairs();

        // Start the simulation
        this.play();
    }

    findComplementaryPairs() {
        // Check all possible pairs for complementary nucleotides
        for (let i = 0; i < this.nucleotides.length; i++) {
            for (let j = i + 3; j < this.nucleotides.length; j++) { // Minimum 3 nucleotides apart
                const nuc1 = this.nucleotides[i].type;
                const nuc2 = this.nucleotides[j].type;

                // Check for complementary pairs (A-U or G-C)
                if ((nuc1 === 'A' && nuc2 === 'U') ||
                    (nuc1 === 'U' && nuc2 === 'A') ||
                    (nuc1 === 'G' && nuc2 === 'C') ||
                    (nuc1 === 'C' && nuc2 === 'G')) {

                    // Check if there's no crossing bonds
                    let canForm = true;
                    for (const bond of this.bonds) {
                        if (bond.type === 'complementary') {
                            if ((bond.nucleotide1 < i && bond.nucleotide2 > i && bond.nucleotide2 < j) ||
                                (bond.nucleotide1 > i && bond.nucleotide1 < j && bond.nucleotide2 > j)) {
                                canForm = false;
                                break;
                            }
                        }
                    }

                    if (canForm) {
                        // Only form bond with a certain probability based on distance
                        if (Math.random() < 0.5) {
                            this.bonds.push({
                                nucleotide1: i,
                                nucleotide2: j,
                                type: 'complementary'
                            });
                        }
                    }
                }
            }
        }
    }

    update(forceUpdate = false) {
        super.update(forceUpdate);

        if (!this.isPlaying && !forceUpdate) return;

        // Apply physics to each nucleotide
        for (let i = 0; i < this.nucleotides.length; i++) {
            const nucleotide = this.nucleotides[i];

            // Apply slight gravity towards center
            const centerX = this.canvas.width / 2;
            const centerY = this.canvas.height / 2;
            const dx = centerX - nucleotide.x;
            const dy = centerY - nucleotide.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            nucleotide.vx += dx / dist * this.gravity;
            nucleotide.vy += dy / dist * this.gravity;

            // Apply repulsion between nucleotides
            for (let j = 0; j < this.nucleotides.length; j++) {
                if (i === j) continue;

                const other = this.nucleotides[j];
                const dx = other.x - nucleotide.x;
                const dy = other.y - nucleotide.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < nucleotide.radius * 4) {
                    const force = this.repulsion / (dist * dist);
                    nucleotide.vx -= dx / dist * force;
                    nucleotide.vy -= dy / dist * force;
                }
            }

            // Apply friction
            nucleotide.vx *= this.friction;
            nucleotide.vy *= this.friction;

            // Update position
            nucleotide.x += nucleotide.vx;
            nucleotide.y += nucleotide.vy;

            // Bounce off edges
            if (nucleotide.x < nucleotide.radius) {
                nucleotide.x = nucleotide.radius;
                nucleotide.vx *= -0.8;
            } else if (nucleotide.x > this.canvas.width - nucleotide.radius) {
                nucleotide.x = this.canvas.width - nucleotide.radius;
                nucleotide.vx *= -0.8;
            }

            if (nucleotide.y < nucleotide.radius) {
                nucleotide.y = nucleotide.radius;
                nucleotide.vy *= -0.8;
            } else if (nucleotide.y > this.canvas.height - nucleotide.radius) {
                nucleotide.y = this.canvas.height - nucleotide.radius;
                nucleotide.vy *= -0.8;
            }
        }

        // Apply bond constraints
        for (let i = 0; i < 3; i++) { // Multiple iterations for stability
            this.applyBondConstraints();
        }
    }

    applyBondConstraints() {
        for (const bond of this.bonds) {
            const nuc1 = this.nucleotides[bond.nucleotide1];
            const nuc2 = this.nucleotides[bond.nucleotide2];

            // Calculate distance
            const dx = nuc2.x - nuc1.x;
            const dy = nuc2.y - nuc1.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // Determine target distance based on bond type
            let targetDistance;
            let strength;

            if (bond.type === 'backbone') {
                targetDistance = nuc1.radius * 2.5;
                strength = 0.3;
            } else { // complementary
                targetDistance = nuc1.radius * 4;
                strength = this.bondStrength;
            }

            // Calculate correction
            const diff = (targetDistance - distance) * strength;
            const offsetX = (dx / distance) * diff;
            const offsetY = (dy / distance) * diff;

            // Apply correction
            nuc1.x -= offsetX;
            nuc1.y -= offsetY;
            nuc2.x += offsetX;
            nuc2.y += offsetY;
        }
    }

    render() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw bonds first (under nucleotides)
        for (const bond of this.bonds) {
            const nuc1 = this.nucleotides[bond.nucleotide1];
            const nuc2 = this.nucleotides[bond.nucleotide2];

            this.ctx.beginPath();
            this.ctx.moveTo(nuc1.x, nuc1.y);
            this.ctx.lineTo(nuc2.x, nuc2.y);

            if (bond.type === 'backbone') {
                this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
                this.ctx.lineWidth = 2;
            } else { // complementary
                // Use a dashed line for complementary pairs
                this.ctx.strokeStyle = 'rgba(255, 255, 0, 0.6)';
                this.ctx.setLineDash([5, 3]);
                this.ctx.lineWidth = 2;
            }

            this.ctx.stroke();
            this.ctx.setLineDash([]);
        }

        // Draw nucleotides
        for (const nucleotide of this.nucleotides) {
            nucleotide.draw(this.ctx);
        }

        // Display RNA sequence
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        this.ctx.font = '14px Arial';
        this.ctx.fillText(`РНК: ${this.sequence}`, 10, 20);
    }

    resize() {
        // Adjust positions when canvas is resized
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;

        for (const nucleotide of this.nucleotides) {
            // Keep nucleotides within bounds
            nucleotide.x = Math.min(Math.max(nucleotide.radius, nucleotide.x), this.canvas.width - nucleotide.radius);
            nucleotide.y = Math.min(Math.max(nucleotide.radius, nucleotide.y), this.canvas.height - nucleotide.radius);
        }
    }
}

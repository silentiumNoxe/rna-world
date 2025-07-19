/**
 * Overseer class for managing multiple cells
 * Instead of controlling a single cell, the player now has the role of an overseer
 * who can select and influence multiple cells.
 */
export class Overseer {
    constructor() {
        this.selectedCells = [];
        this.maxSelectedCells = 5; // Maximum cells the player can select at once
        this.selectionRadius = 50; // Radius for cell selection
    }

    /**
     * Select a cell at the given coordinates
     * @param {Array} cells - Array of all cells
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @returns {boolean} - Whether a cell was selected
     */
    selectCell(cells, x, y) {
        // If already at max selection, don't select more
        if (this.selectedCells.length >= this.maxSelectedCells) {
            return false;
        }

        // Check if there's a cell near the click/tap point
        for (const cell of cells) {
            const dx = cell.x - x;
            const dy = cell.y - y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // If close enough to select and not already selected
            if (distance < this.selectionRadius + cell.radius && !this.selectedCells.includes(cell)) {
                cell.isSelected = true;
                this.selectedCells.push(cell);
                return true;
            }
        }

        return false;
    }

    /**
     * Deselect a cell at the given coordinates
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @returns {boolean} - Whether a cell was deselected
     */
    deselectCell(x, y) {
        for (let i = 0; i < this.selectedCells.length; i++) {
            const cell = this.selectedCells[i];
            const dx = cell.x - x;
            const dy = cell.y - y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // If clicked on a selected cell, deselect it
            if (distance < cell.radius) {
                cell.isSelected = false;
                this.selectedCells.splice(i, 1);
                return true;
            }
        }

        return false;
    }

    /**
     * Deselect all cells
     */
    deselectAll() {
        for (const cell of this.selectedCells) {
            cell.isSelected = false;
        }
        this.selectedCells = [];
    }

    /**
     * Give energy boost to selected cells
     */
    boostSelectedCells() {
        for (const cell of this.selectedCells) {
            // Temporary speed boost
            cell.speed *= 1.5;

            // Visual effect could be added here
        }
    }

    /**
     * Draw selection indicators around selected cells
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    drawSelections(ctx) {
        for (const cell of this.selectedCells) {
            // Draw selection circle
            ctx.beginPath();
            ctx.arc(cell.x, cell.y, cell.radius + 5, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(255, 255, 0, 0.7)';
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 3]);
            ctx.stroke();
            ctx.setLineDash([]);
        }
    }
}

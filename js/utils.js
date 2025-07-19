/**
 * Utility functions for the RNA Evolution Game
 */

// Generate a random number between min and max
function random(min, max) {
    return Math.random() * (max - min) + min;
}

// Generate a random integer between min and max (inclusive)
function randomInt(min, max) {
    return Math.floor(random(min, max + 1));
}

// Generate a random color
function randomColor() {
    return `hsl(${randomInt(0, 360)}, ${randomInt(70, 100)}%, ${randomInt(40, 60)}%)`;
}

// Calculate distance between two points
function distance(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

// Resize a canvas to match its display size
function resizeCanvas(canvas) {
    const displayWidth = canvas.clientWidth;
    const displayHeight = canvas.clientHeight;

    if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
        canvas.width = displayWidth;
        canvas.height = displayHeight;
    }
}

// Check if a point is inside a circle
function isPointInCircle(x, y, circleX, circleY, circleRadius) {
    return distance(x, y, circleX, circleY) <= circleRadius;
}

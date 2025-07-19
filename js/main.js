/**
 * Main JavaScript file for initializing and running the game
 */

import { WorldScene } from './scenes/WorldScene.js';
import { EditorScene } from './scenes/EditorScene.js';

class Game {
    constructor() {
        // Get DOM elements
        this.worldCanvas = document.getElementById('world-canvas');
        this.editorCanvas = document.getElementById('editor-canvas');
        this.worldSceneElement = document.getElementById('world-scene');
        this.editorSceneElement = document.getElementById('editor-scene');

        // Initialize scenes
        this.worldScene = new WorldScene(this.worldCanvas);
        this.editorScene = new EditorScene(this.editorCanvas);
        this.currentScene = this.worldScene;

        this.setupEventListeners();
        this.handleResize();
        this.startGameLoop();
    }

    setupEventListeners() {
        // Scene switching
        document.getElementById('switch-to-world').addEventListener('click', () => this.switchScene('world'));
        document.getElementById('switch-to-editor').addEventListener('click', () => this.switchScene('editor'));

        // World controls
        document.getElementById('world-play').addEventListener('click', () => this.worldScene.play());
        document.getElementById('world-pause').addEventListener('click', () => this.worldScene.pause());
        document.getElementById('world-step').addEventListener('click', () => this.worldScene.step());
        document.getElementById('simulation-speed').addEventListener('input', (e) => {
            this.worldScene.setSpeed(parseInt(e.target.value));
        });

        // Editor controls
        const nucleotideButtons = document.querySelectorAll('.nucleotide-btn');
        nucleotideButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const nucleotide = btn.dataset.nucleotide;
                document.getElementById('rna-sequence').value += nucleotide;
            });
        });

        document.getElementById('random-sequence').addEventListener('click', () => {
            this.editorScene.generateRandomSequence();
        });

        document.getElementById('simulate-sequence').addEventListener('click', () => {
            const sequence = document.getElementById('rna-sequence').value;
            this.editorScene.simulateSequence(sequence);
        });

        // Handle resize
        window.addEventListener('resize', () => this.handleResize());
    }

    switchScene(sceneName) {
        this.worldSceneElement.classList.remove('active');
        this.editorSceneElement.classList.remove('active');
        document.getElementById('switch-to-world').classList.remove('active');
        document.getElementById('switch-to-editor').classList.remove('active');

        if (sceneName === 'world') {
            this.worldSceneElement.classList.add('active');
            document.getElementById('switch-to-world').classList.add('active');
            this.currentScene = this.worldScene;
        } else {
            this.editorSceneElement.classList.add('active');
            document.getElementById('switch-to-editor').classList.add('active');
            this.currentScene = this.editorScene;
        }

        // Resize canvases when switching scenes
        this.handleResize();
    }

    handleResize() {
        const resizeCanvas = (canvas, container) => {
            if (container.classList.contains('active')) {
                // Set both width and height to full window dimensions
                canvas.width = window.innerWidth;

                // Subtract control panel height to avoid overlapping
                const controlsHeight = container.querySelector('.controls').offsetHeight;
                canvas.height = window.innerHeight - controlsHeight - 5; // 5px buffer

                // Ensure container also fills the width
                container.style.width = window.innerWidth + 'px';
            }
        };

        // Ensure game container fills the viewport
        document.querySelector('.game-container').style.width = window.innerWidth + 'px';
        document.querySelector('.game-container').style.maxWidth = '100vw';

        resizeCanvas(this.worldCanvas, this.worldSceneElement);
        resizeCanvas(this.editorCanvas, this.editorSceneElement);

        // Update current scene after resize
        if (this.currentScene && this.currentScene.resize) {
            this.currentScene.resize();
        }
    }

    startGameLoop() {
        const gameLoop = (timestamp) => {
            if (this.currentScene) {
                this.currentScene.update();
                this.currentScene.render();
            }
            requestAnimationFrame(gameLoop);
        };

        requestAnimationFrame(gameLoop);
    }
}

// Wait for DOM to load before starting the game
document.addEventListener('DOMContentLoaded', () => {
    new Game();
});

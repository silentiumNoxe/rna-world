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

        // Add instructions for the overseer controls
        this.addOverseerInstructions();
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

    addOverseerInstructions() {
        // Create instructions element
        const instructions = document.createElement('div');
        instructions.className = 'instructions';
        instructions.innerHTML = `
            <h3>Керування наглядачем:</h3>
            <ul>
                <li><strong>Shift + Клік</strong> - Вибрати клітину</li>
                <li><strong>Ctrl/Cmd + Клік</strong> - Скасувати вибір клітини</li>
                <li><strong>Пробіл</strong> - Прискорити вибрані клітини</li>
                <li><strong>Esc</strong> - Скасувати вибір усіх клітин</li>
                <li><strong>Перетягування</strong> - Пересування камери</li>
            </ul>
        `;

        // Style the instructions
        instructions.style.position = 'absolute';
        instructions.style.bottom = '10px';
        instructions.style.right = '10px';
        instructions.style.background = 'rgba(0, 20, 40, 0.7)';
        instructions.style.padding = '10px';
        instructions.style.borderRadius = '5px';
        instructions.style.color = 'white';
        instructions.style.fontFamily = 'Arial, sans-serif';
        instructions.style.fontSize = '14px';
        instructions.style.zIndex = '1000';

        // Add styles for the list
        const style = document.createElement('style');
        style.textContent = `
            .instructions ul {
                padding-left: 20px;
                margin: 5px 0;
            }
            .instructions h3 {
                margin: 0 0 10px 0;
            }
        `;
        document.head.appendChild(style);

        // Add to world scene
        this.worldSceneElement.appendChild(instructions);
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

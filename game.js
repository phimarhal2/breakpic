class PixelParticle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.size = 4;
        this.velocity = {
            x: (Math.random() - 0.5) * 2,
            y: (Math.random() + 1) * 2
        };
        this.friction = 0.98;
        this.gravity = 0.2;
        this.bounce = 0.7;
    }

    update(canvasWidth, canvasHeight) {
        // Apply gravity
        this.velocity.y += this.gravity;
        
        // Apply friction
        this.velocity.x *= this.friction;
        this.velocity.y *= this.friction;
        
        // Update position
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        
        // Check for wall collisions
        if (this.x < 0) {
            this.x = 0;
            this.velocity.x *= -this.bounce;
        } else if (this.x + this.size > canvasWidth) {
            this.x = canvasWidth - this.size;
            this.velocity.x *= -this.bounce;
        }
        
        if (this.y < 0) {
            this.y = 0;
            this.velocity.y *= -this.bounce;
        } else if (this.y + this.size > canvasHeight) {
            this.y = canvasHeight - this.size;
            this.velocity.y *= -this.bounce;
        }
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.size, this.size);
    }
}

class PixelPhysicsGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.image = null;
        this.isSplit = false;
        this.animationFrame = null;
        this.setupCanvas();
        this.setupEventListeners();
    }

    setupCanvas() {
        this.canvas.width = 800;
        this.canvas.height = 800;
    }

    setupEventListeners() {
        const uploadButton = document.getElementById('uploadButton');
        const reloadButton = document.getElementById('reloadButton');
        
        uploadButton.addEventListener('change', (e) => this.handleImageUpload(e));
        reloadButton.addEventListener('click', () => this.reloadImage());
        
        this.canvas.addEventListener('click', () => {
            if (this.image && !this.isSplit) {
                this.splitImage();
            }
        });
    }

    reloadImage() {
        if (this.image) {
            // Stop the animation loop
            if (this.animationFrame) {
                cancelAnimationFrame(this.animationFrame);
            }
            
            this.particles = [];
            this.isSplit = false;
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.drawImage();
        }
    }

    handleImageUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        // Stop any existing animation
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            this.image = new Image();
            this.image.onload = () => {
                this.particles = [];
                this.isSplit = false;
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                this.drawImage();
                document.getElementById('reloadButton').style.display = 'block';
            };
            this.image.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    drawImage() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.drawImage(this.image, 0, 0, this.canvas.width, this.canvas.height);
    }

    splitImage() {
        // Stop any existing animation
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        
        this.ctx.drawImage(this.image, 0, 0, this.canvas.width, this.canvas.height);
        
        const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        const pixels = imageData.data;
        
        this.particles = []; // Clear existing particles
        
        // Increase the step size to reduce the number of particles
        for (let y = 0; y < this.canvas.height; y += 8) {
            for (let x = 0; x < this.canvas.width; x += 8) {
                const index = (y * this.canvas.width + x) * 4;
                const color = `rgba(${pixels[index]}, ${pixels[index + 1]}, ${pixels[index + 2]}, ${pixels[index + 3] / 255})`;
                this.particles.push(new PixelParticle(x, y, color));
            }
        }
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.isSplit = true;
        this.animate();
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Update all particles with wall collision detection only
        this.particles.forEach(particle => {
            particle.update(this.canvas.width, this.canvas.height);
            particle.draw(this.ctx);
        });
        
        // Store the animation frame request
        this.animationFrame = requestAnimationFrame(() => this.animate());
    }
}

// Initialize the game
const game = new PixelPhysicsGame();

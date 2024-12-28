/** @type {HTMLCanvasElement} */

const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
let score = 0;
let gameOver = false;
const font = '50px impact';
const grayColor = 'rgb(128, 128, 128)';

const collisionCanvas = document.getElementById('collisionCanvas');
const collisionCtx   = collisionCanvas.getContext('2d');
collisionCanvas.width = window.innerWidth;
collisionCanvas.height = window.innerHeight;

let timeToNextRaven = 0;
let ravenInterval = 900;
let lastTime = 0;

let ravens = [];

class Raven {
    constructor() {
        this.spriteWidth = 271;
        this.spriteHeight = 194;
        this.sizeModifier = Math.random() * 0.6 + 0.4;
        this.width = this.spriteWidth * this.sizeModifier;
        this.height = this.spriteHeight * this.sizeModifier;
        this.x = canvas.width;
        this.y = Math.random() * (canvas.height - this.height);
        this.directionX = Math.random() * 5 + 3;
        this.directoinY = Math.random() * 5 - 2.5;
        this.marketForDeletion = false;
        this.image = new Image();
        this.image.src = '/point and shoot game/raven.png';
        this.frame = 0;
        this.maxFrame = 4;
        this.timeSinceFlap = 0;
        this.flapInterval = Math.random() * 50 + 50;
        this.randomColors = [Math.floor(Math.random() * 255), Math.floor(Math.random() * 255), 
                             Math.floor(Math.random() * 255)];
        this.color = 'rgb(' + this.randomColors[0] + ',' + this.randomColors[1] + ',' + this.randomColors[2] + ')';
        this.hasTrail = Math.random() > 0.5;
    }   

    update(deltatime) {
        if (this.y < 0 || this.y  > canvas.height - this.height) {
            this.directoinY = this.directoinY * - 1 ;
        }

        this.x -=  this.directionX;
        this.y +=  this.directoinY; 
        if (this.x < 0 - this.width) {
            this.marketForDeletion = true;
        }

        this.timeSinceFlap += deltatime;

        if (this.timeSinceFlap > this.flapInterval) {
            if (this.frame > this.maxFrame) {
                this.frame = 0;
            } else {
                this.frame++;
            }
            this.timeSinceFlap = 0;
            if (this.hasTrail) {
                for (let i = 0; i < 5; i++) {
                    particles.push(new Particle(this.x, this.y, this.width, grayColor));
                    
                } 
            }
        }

        if (this.x < 0 - this.width) {
            gameOver = true;
        }
    }

    draw() {
        collisionCtx.fillStyle = this.color;
        collisionCtx.fillRect(this.x, this.y, this.width, this.height);
        ctx.drawImage(this.image,this.frame * this.spriteWidth,0,this.spriteWidth,this.spriteHeight, this.x, this.y, this.width, this.height);
    }
}

let explosions = [];

class Explosions {
    constructor(x, y, size) {
        this.image = new Image();
        this.image.src = '/point and shoot game/boom.png';
        this.spriteWidth = 200;
        this.spriteHeight = 179;
        this.x = x;
        this.y = y;
        this.size = size;
        this.frame = 0;
        this.audio = new Audio();
        this.audio.src = '/point and shoot game/laser_shooting_sfx.wav';
        this.timeSinceLastFrame = 0;
        this.frameInterval = 190;
        this.marketForDeletion = false;
    }

    update(deltatime) {
        if (this.frame === 0 ) {
            this.audio.play();
        }

        this.timeSinceLastFrame += deltatime;

        if (this.timeSinceLastFrame > this.frameInterval) {
            this.frame++;
            this.timeSinceLastFrame = 0;
            if (this.frame > 5) {
                this.marketForDeletion = true;
            }
        }
    }

    draw() {
        ctx.drawImage(this.image, this.frame * this.spriteWidth, 0, this.spriteWidth, this.spriteHeight
            , this.x, this.y - this.size/4, this.size, this.size);
    }

}

let particles = [];

class Particle {
    constructor(x,y, size, color) {
        this.size = size;
        this.x = x + this.size/2 + Math.random() * 50 - 25;
        this.y = y + this.size/3 + Math.random() * 50 - 25;
        this.radius = Math.random() * this.size/10;
        this.maxRadius = Math.random() * 20 + 35;
        this.marketForDeletion = false;
        this.speedX = Math.random() * 1 + 0.5;
        this.color = color;
    }

    update() {
        this.x += this.speedX;
        this.radius += 0.3;

        if (this.radius > this.maxRadius - 5) {
            this.marketForDeletion = true;
        }
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = 1 - this.radius/this.maxRadius;
        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

function drawScore() {
    ctx.font = font;
    ctx.fillStyle = 'black';
    ctx.fillText('Pontuação: ' + score, 50, 75);
    ctx.fillStyle = 'gray';
    ctx.fillText('Pontuação: ' + score, 55, 80);
}


function drawGameOver() {
    ctx.textAlign = 'center';
    ctx.font = font;
    ctx.fillStyle = 'black';
    ctx.fillText('Fim, pontuação: ' + score, canvas.width/2, canvas.height/2);
    ctx.fillStyle = 'gray';
    ctx.fillText('Fim, pontuação: ' + score, canvas.width/2 + 5, canvas.height/2 + 5);

}

window.addEventListener('click', function(e) {
    const detectPixelColor = collisionCtx.getImageData(e.x, e.y, 1,1);
    const pixelColor = detectPixelColor.data;

    ravens.forEach(raven => {
        if(raven.randomColors[0] === pixelColor[0] && raven.randomColors[1] === pixelColor[1]
                                                   && raven.randomColors[2] === pixelColor[2]) {

            raven.marketForDeletion = true;
            score++;
            explosions.push(new Explosions(raven.x, raven.y, raven.width));
        }
    });
});
function animate(timestamp) {
    ctx.clearRect(0,0, canvas.width, canvas.height);
    collisionCtx.clearRect(0,0, canvas.width, canvas.height);

    let deltatime = timestamp - lastTime;
    lastTime = timestamp;

    timeToNextRaven += deltatime;
    if(timeToNextRaven > ravenInterval) {
        ravens.push(new Raven());
        timeToNextRaven = 0;
        ravens.sort(function(a, b) {
            return a.width - b.width;
        });
    }
    drawScore();

    [...particles,...ravens, ...explosions].forEach((raven) => {
        raven.update(deltatime);
        raven.draw();
    });

    ravens = ravens.filter(raven => !raven.marketForDeletion);
    explosions = explosions.filter(explosion => !explosion.marketForDeletion);
    particles = particles.filter(explosion => !explosion.marketForDeletion);

    if(!gameOver) {
        requestAnimationFrame(animate);
    } else {
        drawGameOver();
    }
}

animate(0);
const rulesButton = document.getElementById("rules-btn");
const rules = document.getElementById("rules");
const closeButton = document.getElementById("close-btn");
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const color = getComputedStyle(document.documentElement)
    .getPropertyValue("--text-color")
    .trim();

const secondarycolor = getComputedStyle(document.documentElement)
    .getPropertyValue("--canvas-color")
    .trim();
const brickRow = 5;
const brickColumn = 9;
let score = 0;
let gameOver = false;

const heightRatio = 0.75;
ctx.canvas.width = 800;
ctx.canvas.height = ctx.canvas.width * heightRatio;

const ball = {
    x: ctx.canvas.width / 2,
    y: ctx.canvas.height / 2,
    size: 10,
    speed: 4,
    dx: 4,
    dy: -4
}

const paddle = {
    x: ctx.canvas.width / 2 - 40,
    y: ctx.canvas.height - 20,
    w: 80,
    h: 10,
    speed: 8,
    dx: 0
}

const brickInfo = {
    w: 72,
    h: 20,
    padding: 10,
    offsetY: 60,
    offsetX: 30,
    visible: true
}

const bricks = [];
for (let i = 0; i < brickRow; i++) {
    bricks[i] = [];
    for (let j = 0; j < brickColumn; j++) {
        const x = j * (brickInfo.w + brickInfo.padding) + brickInfo.offsetX;
        const y = i * (brickInfo.h + brickInfo.padding) + brickInfo.offsetY;
        bricks[i][j] = { x, y, ...brickInfo }
    }
}

function drawBall() {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.size, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.closePath();
}

function drawPaddle() {
    ctx.beginPath();
    ctx.fillStyle = secondarycolor;
    ctx.rect(paddle.x, paddle.y, paddle.w, paddle.h);
    ctx.fill();
    ctx.closePath();
}

function drawBricks() {
    bricks.forEach(column => {
        column.forEach(brick => {
            ctx.beginPath();
            ctx.rect(brick.x, brick.y, brick.w, brick.h);
            ctx.fillStyle = brick.visible ? secondarycolor : "transparent";
            ctx.fill();
            ctx.closePath();
        })
    })
}

function draw() {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    drawBall();
    drawPaddle();
    drawBricks();
}

function movePaddle() {
    paddle.x += paddle.dx;
    if (paddle.x + paddle.w > ctx.canvas.width) {
        paddle.x = ctx.canvas.width - paddle.w;
    }
    if (paddle.x < 0) {
        paddle.x = 0;
    }
}

function moveBall() {
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Left & Right walls
    if (ball.x + ball.size > ctx.canvas.width || ball.x - ball.size < 0) {
        ball.dx *= -1;
    }

    // Top wall only
    if (ball.y - ball.size < 0) {
        ball.dy *= -1;
    }

    // Paddle collision
    if (
        ball.x > paddle.x &&
        ball.x < paddle.x + paddle.w &&
        ball.y + ball.size > paddle.y
    ) {
        ball.dy *= -1;
    }

    // Brick collision
    bricks.forEach(column => {
        column.forEach(brick => {
            if (brick.visible) {
                if (
                    ball.x + ball.size > brick.x &&
                    ball.x - ball.size < brick.x + brick.w &&
                    ball.y + ball.size > brick.y &&
                    ball.y - ball.size < brick.y + brick.h
                ) {
                    brick.visible = false;
                    ball.dy *= -1;
                    score++;
                }
            }
        });
    });

    // Bottom = Game Over
    if (ball.y + ball.size > ctx.canvas.height) {
        gameOver = true;
    }
}

function showAllBricks() {
    bricks.forEach(column => {
        column.forEach(brick => {
            brick.visible = true;
        })
    })
}

function update() {
    movePaddle();
    moveBall();
    draw();

    if (!gameOver) {
        requestAnimationFrame(update);
    } else {
        drawGameOver();
    }
}

function restartGame() {
    score = 0;
    gameOver = false;

    ball.x = ctx.canvas.width / 2;
    ball.y = ctx.canvas.height / 2;
    ball.dx = 4;
    ball.dy = -4;

    showAllBricks();
    update();
}

function keyDown(e) {
    if (e.key === "Right" || e.key === "ArrowRight") paddle.dx = paddle.speed;
    else if (e.key === "Left" || e.key === "ArrowLeft") paddle.dx = -paddle.speed;

    if (e.code === "Space" && gameOver) {
        restartGame();
    }
}

function keyUp(e) {
    if (
        e.key === "Right" ||
        e.key === "ArrowRight" ||
        e.key === "Left" ||
        e.key === "ArrowLeft"
    ) {
        paddle.dx = 0;
    }
}

function drawGameOver() {
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    ctx.fillStyle = "#fff";
    ctx.font = "40px Arial";
    ctx.textAlign = "center";
    ctx.fillText("GAME OVER", ctx.canvas.width / 2, ctx.canvas.height / 2);

    ctx.font = "20px Arial";
    ctx.fillText("Press SPACE to Restart", ctx.canvas.width / 2, ctx.canvas.height / 2 + 40);
}

rulesButton.addEventListener("click", () => {
    rules.classList.add("show");
})

closeButton.addEventListener("click", () => {
    rules.classList.remove("show");
})

document.addEventListener("keydown", keyDown);
document.addEventListener("keyup", keyUp);

update();


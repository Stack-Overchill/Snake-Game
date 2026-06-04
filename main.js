// Select game elements from the DOM
// These elements are used to display the board, modals, buttons, score, and timer.
const board = document.querySelector(".board");
const gameModal = document.querySelector(".modal");
const startGameModal = document.querySelector(".game-start");
const restartGameModal = document.querySelector(".game-restart");

const startBtn = document.querySelector(".start-btn");
const restartBtn = document.querySelector(".restart-btn");

const scoreElement = document.querySelector(".score");
const highScoreElement = document.querySelector(".highScore");
const timeElement = document.querySelector(".time");

// Define the size of each grid block
const blockHeight = 40;
const blockWidth = 40;

// Calculate the number of rows and columns based on board size
const rows = Math.floor(board.clientHeight / blockHeight);
const cols = Math.floor(board.clientWidth / blockWidth);

// Store references to all grid cells
const blocks = {};

// Initial snake position (head + body)
let snake = [
    {x:2,y:6},
    {x:2,y:5}
];

// Generate initial food position randomly
let food = {x:Math.floor(Math.random() * rows), y:Math.floor(Math.random() * cols)};

// Initial movement direction
let direction = "right";

// Game statistics
let score = 0;
let highScore = Number(localStorage.getItem("highScore") || 0);
let time = `00:00`;

// Create the board grid dynamically and store each block reference
for(let row = 0; row < rows; row++){
    for(let col = 0; col < cols; col++){
        let block = document.createElement("div");
        block.classList.add("block");
        board.appendChild(block);
        blocks[`${row}-${col}`] = block;
    }
}

// Listen for arrow key presses and update snake direction
// Prevents reversing directly into itself
addEventListener("keydown", (event) => {
    if(event.key === "ArrowUp" && direction !== "down"){
        direction = "up";
    }
    else if(event.key === "ArrowDown" && direction !== "up"){
        direction = "down";
    }
    else if(event.key === "ArrowLeft" && direction !== "right"){
        direction = "left";
    }
    else if(event.key === "ArrowRight" && direction !== "left"){
        direction = "right";
    }
});

// Main game rendering and update function
// Handles movement, collision detection, food consumption,
// score updates, and board rendering
function render(){
    let head;

    // Remove snake and head classes from previous frame
    snake.forEach(segment => {
        blocks[`${segment.x}-${segment.y}`].classList.remove("snake");
    });
    blocks[`${snake[0].x}-${snake[0].y}`].classList.remove("head");

    // Calculate the next head position based on current direction
    if(direction === "up" && direction !== "down"){
        head = { x:snake[0].x-1, y:snake[0].y};
    }
    else if(direction === "down" && direction !== "up"){
        head = {x:snake[0].x+1, y:snake[0].y};
    }
    else if(direction === "left" && direction !== "right"){
        head = {x:snake[0].x, y:snake[0].y-1};
    }
    else if(direction === "right" && direction !== "left"){
        head = {x:snake[0].x, y:snake[0].y+1};
    }

    // End the game if the snake hits a wall
    if(!head || head.x < 0 || head.x >= rows || head.y < 0 || head.y >= cols){
        clearInterval(intervalId);
        clearInterval(timeIntervalId);

        gameModal.style.display = "flex";
        startGameModal.style.display = "none";
        restartGameModal.style.display = "flex";

        return;
    }

    // Check if the snake collides with its own body
    // Excludes the tail because it moves away in the same frame
    let isCollided = snake.slice(0, snake.length - 1).some(segment => 
        segment.x === head.x && segment.y === head.y
    );

    if(isCollided){
        clearInterval(intervalId);
        clearInterval(timeIntervalId);

        gameModal.style.display = "flex";
        startGameModal.style.display = "none";
        restartGameModal.style.display = "flex";

        return;
    }

    // If snake eats food:
    // 1. Generate new food
    // 2. Grow the snake
    // 3. Increase score
    // 4. Update high score if needed
    if(food.x === head.x && food.y === head.y){
        blocks[`${food.x}-${food.y}`].classList.remove("food");
        generateFood();
        blocks[`${food.x}-${food.y}`].classList.add("food");
        snake.unshift(head);

        score += 10;
        scoreElement.innerText = score;

        if(highScore < score){
            highScore = score;
            localStorage.setItem("highScore",highScore.toString());
        }
        highScoreElement.innerText = localStorage.getItem("highScore") || 0;

    // Move snake forward by adding new head
    // and removing the last tail segment    
    }else{
        snake.unshift(head);
        snake.pop();
    }

    // Render food, snake body, and snake head on the board
    blocks[`${food.x}-${food.y}`].classList.add("food");

    snake.forEach(segment => {
        blocks[`${segment.x}-${segment.y}`].classList.add("snake");
    });
    blocks[`${snake[0].x}-${snake[0].y}`].classList.add("head");

}

// Generate food at a random position
// Ensures food does not spawn on the snake body
function generateFood() {
    do {
        food = {
            x: Math.floor(Math.random() * rows),
            y: Math.floor(Math.random() * cols)
        };
    } while (
        snake.some(segment =>
            segment.x === food.x &&
            segment.y === food.y
        )
    );
}

// Store interval IDs so they can be stopped when game ends
let intervalId = null;
let timeIntervalId = null;

// Start the game when the Start button is clicked
// Starts both the game loop and timer
startBtn.addEventListener ("click",() => {
    intervalId = setInterval( () => {render() },300);

    gameModal.style.display = "none";

    // Update game timer every second
    // Format: minutes : seconds
    timeIntervalId = setInterval( () => {
        let [mins,secs] = time.split(":").map(Number);

        if(secs == 59){
            mins++;
            secs = 0;
        }else{
            secs++;
        }

        time = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
        timeElement.innerText = time;

    },1000)


});

// Restart the game by resetting:
// - snake position
// - direction
// - food position
// - score
// - timer
// Then start the game loop again

restartBtn.addEventListener("click",restartGame); 

function restartGame() {

    clearInterval(intervalId);
    clearInterval(timeIntervalId);

    gameModal.style.display = "none";

    // Clear previous food and snake from the board
    blocks[`${food.x}-${food.y}`].classList.remove("food");

    snake.forEach(segment => {
        blocks[`${segment.x}-${segment.y}`].classList.remove("snake");
    })

    intervalId = setInterval( () => {render()},300);

    // Restore all game variables to their initial values
    direction = "right";

    snake = [{x:2,y:6},{x:2,y:5}];

    food = {x:Math.floor(Math.random() * rows), y:Math.floor(Math.random() * cols)};

    score = 0;
    scoreElement.innerText = score;

    highScoreElement.innerText = localStorage.getItem("highScore") || 0;

    time = `00:00`;
    timeElement.innerText = time;

    // Start a fresh timer after restarting the game
    timeIntervalId = setInterval( () => {
        let [mins,secs] = time.split(":").map(Number);

        if(secs == 59){
            mins++;
            secs = 0;
        }else{
            secs++;
        }

        time = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
        timeElement.innerText = time;

    },1000);
}

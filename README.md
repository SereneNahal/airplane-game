# 3D Airplane Game

A simple 3D airplane game built with Three.js where you control an airplane, avoid obstacles, and collect stars.

## How to Play

1. Use the W, A, S, D keys to control the airplane:
   - W: Move up
   - S: Move down
   - A: Move left
   - D: Move right

2. Avoid the red cube obstacles
3. Collect the yellow star items to increase your score

## Running the Game

### Option 1: Using Node.js
If you have Node.js installed:

1. Install dependencies:
```
npm install
```

2. Start the server:
```
npm start
```

3. Open your browser and navigate to: http://localhost:3000

### Option 2: Using any HTTP server
You can use any HTTP server to serve the files. For example, with Python:

```
# Python 3
python -m http.server

# Python 2
python -m SimpleHTTPServer
```

Then open your browser and navigate to: http://localhost:8000

### Option 3: Directly open in browser
Simply open the `index.html` file in your browser. However, some browsers may block loading the files due to CORS policies when opening directly from the file system.

## Game Features

- 3D airplane that you can control
- Randomly generated obstacles to avoid
- Collectible stars that increase your score
- Basic collision detection
- Simple game over and restart mechanics

## Technologies Used

- Three.js for 3D rendering
- JavaScript for game logic
- HTML/CSS for UI elements

# p5.js Monopoly Game

This project is a simple implementation of a Monopoly board game using p5.js. The game allows players to roll dice and move around the board, landing on properties and following the classic rules of Monopoly.

## Project Structure

- **src/**
  - **sketch.js**: Main entry point for the p5.js application. Initializes the canvas and handles the game loop.
  - **board.js**: Defines the `Board` class, responsible for rendering the Monopoly board and managing property details.
  - **player.js**: Defines the `Player` class, representing the player avatar and handling movement based on dice rolls.
  - **dice.js**: Defines the `Dice` class, simulating the rolling of two six-sided dice.

- **index.html**: The main HTML file that includes the p5.js library and links to the `sketch.js` file.

- **package.json**: Configuration file for npm, listing dependencies and scripts for running the project.

## How to Run the Game

1. Clone the repository or download the project files.
2. Navigate to the project directory in your terminal.
3. Run `npm install` to install the necessary dependencies.
4. Open `index.html` in your web browser to start the game.

## Game Rules Overview

- Players take turns rolling two six-sided dice.
- The sum of the dice determines how many spaces the player moves on the board.
- Players can land on properties, which they can buy or trade.
- The game continues until a player goes bankrupt or a predetermined condition is met.

Enjoy playing Monopoly!
# Final Project

-   [ ] Read the [project requirements](https://vikramsinghmtl.github.io/420-5P6-Game-Programming/project/requirements).
-   [ ] Replace the sample proposal below with the one for your game idea.
-   [ ] Get the proposal greenlit by Vik.
-   [ ] Place any assets in `assets/` and remember to update `src/config.json`.
-   [ ] Decide on a height and width inside `src/globals.js`. The height and width will most likely be determined based on the size of the assets you find.
-   [ ] Start building the individual components of your game, constantly referring to the proposal you wrote to keep yourself on track.
-   [ ] Good luck, you got this!

---

# Sample Proposal - Sonic Game

## ✒️ Description

We will be implementing a Sonic The Hedgehog game! We're going to base ourselves off of Sonic 1 and have 1 complete working level. The player will take control of Sonic and attempt to navigate through the obstacles in the level such as enemies, item boxes, obstacles, gain enough speed to do a loop, etc. The win condition is basically trying to cross the level without dying as players can lose health from enemies. It will be a sidescrolling game, where the camera will follow the player.  
## 🕹️ Gameplay

The player begins at the title screen, and instructions containing how to play once they press Start. The gameplay is simple. The player enters the level and plays as Sonic. The player can move left and right with the left and right arrow keys, and jump with the Z key. The player can look up with the up arrow, which, after 3 seconds, will drag the camera up (This may be optional if we don't have time). The player can also crouch with the down arrow. If the player moves and presses the down arrow, Sonic will roll forward. Depending on the speed and momentum, he can roll very slowly, or very fast. If the player wants to stop moving, Sonic can stop abruptly by pressing the other direction key. For example, if Sonic is running right and the player presses left, he will skid and come to a stop. The player can also slow down by releasing the key.

The goal is to get to the sign post at the end of the level. Along the way, Sonic can collect rings, which are like coins from Mario. However, if he is damaged by a badnik (an enemy), he will take damage and lose his rings. He can collect them after he loses them, as they will be falling around him (May be an optional feature if we don't have time). To defeat a badnik, he needs to jump on it, similarly to Mario. There are also spikes to avoid, as if he hits them, he will take damage and lose rings. There can be platforms to jump on (Optional feature if we don't have time). There are three item boxes he can jump on: Speed shoes, to make him go faster for ~10 seconds, invincibility makes him invulnerable for ~10 seconds, and a ring box which grants 10 rings. The player is given 3 lives. If Sonic loses all lives, he will enter gameover, which returns the player to the title screen.

There is a HUD that displays the scores, time and rings on the top left, and his lives on the bottom left.

## 📃 Requirements

1. The user shall start the game from the title screen.
2. The user shall view instructions on how to play after pressing Start.
3. The user shall control Sonic using the arrow keys and the Z key.
4. The user shall move Sonic left by pressing the left arrow key.
5. The user shall move Sonic right by pressing the right arrow key.
6. The user shall make Sonic jump by pressing the Z key.
7. The user shall make Sonic look up by pressing the up arrow key.
8. The system shall drag the camera up after 3 seconds if Sonic is looking up (optional).
9. The user shall make Sonic crouch by pressing the down arrow key.
10. The user shall make Sonic roll forward by moving and pressing the down arrow key.
11. The system shall adjust Sonic’s roll speed based on his momentum.
12. The user shall reach the sign post at the end of the level to complete it.
13. The user shall collect rings throughout the level.
14. The system shall reduce Sonic's rings when he is damaged by a badnik or spikes.
15. The user shall be able to collect rings dropped after taking damage (optional).
16. The user shall defeat badniks by jumping on them.
17. The system shall cause Sonic to take damage if he touches spikes.
18. The system may include platforms for Sonic to jump on (optional).
19. The user shall jump on item boxes to gain power-ups.
20. The system shall grant Speed Shoes for ~10 seconds when Sonic jumps on the Speed Shoes box.
21. The system shall grant Invincibility for ~10 seconds when Sonic jumps on the Invincibility box.
22. The system shall grant 10 rings when Sonic jumps on the Ring box.
23. The system shall give the player 3 lives at the start of the game.
24. The system shall enter Game Over and return to the title screen if Sonic loses all lives.

### 🤖 State Diagram

> [!note]
> Remember that you'll need diagrams for not only game states but entity states as well.

![State Diagram](./assets/images/StateDiagram.png)

### 🗺️ Class Diagram

![Class Diagram](./assets/images/ClassDiagram.png)

### 🧵 Wireframes

> [!note]
> Your wireframes don't have to be super polished. They can even be black/white and hand drawn. I'm just looking for a rough idea about what you're visualizing.

![Main Menu](./assets/images/Main-Menu.png)

-   _Let's Play_ will navigate to the main game.
-   _Upload Cards_ will navigation to the forms for uploading and parsing the data files for the game.
-   _Change Log_ will navigate the user to a page with a list of features/changes that have been implemented throughout the development of the game.

![Game Board](./assets/images/Game-Board.png)

We want to keep the GUI as simple and clear as possible by having cards with relevant images to act as a way for the user to intuitively navigate the game. We want to implement a layout that would look like as if one were playing a match of the Pokémon Trading Card Game with physical cards in real life. Clicking on any of the cards will reveal that card's details to the player.

### 🎨 Assets

We are going to be using assets from Sonic The Hedgehog 1 to create the game.

#### 🖼️ Images

-   Most images will be used from the well known community driven wikipedia site, [Bulbapedia](https://bulbapedia.bulbagarden.net/wiki/Main_Page).
-   Especially their [Trading Card Game section](<https://bulbapedia.bulbagarden.net/wiki/Full_Art_card_(TCG)>).

#### ✏️ Fonts

For fonts, a simple sans-serif like Roboto will look quite nice. It's a font that is legible, light on storage size, and fun to keep with the theme we're going for. We also used a more cartoonish Pokemon font for the title screen.

-   [Pokemon](https://www.dafont.com/pokemon.font)
-   [Roboto](https://fonts.google.com/specimen/Roboto)

#### 🔊 Sounds

All sounds were taken from [freesound.org](https://freesound.org) for the actions pertaining to cards.

-   [Shuffle cards](https://freesound.org/people/VKProduktion/sounds/217502/)
-   [Flip card](https://freesound.org/people/Splashdust/sounds/84322/)

### 📚 References

-   [Pokemon Rulebook](http://assets.pokemon.com/assets/cms2/pdf/trading-card-game/rulebook/xy8-rulebook-en.pdf)

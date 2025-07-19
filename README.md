# RNA Evolution Game

An interactive web-based simulation that demonstrates RNA evolution in a primordial soup environment. This educational game shows how RNA molecules might have evolved in Earth's early history before the first protocells formed.

## Features

- Two interactive scenes: World and Editor
- Real-time simulation of RNA folding and evolution
- Physics-based interactions between nucleotides
- RNA Editor for designing and testing custom RNA sequences
- Visual representation of complementary base pairing
- Population dynamics with mutation and selection

## How to Play

1. Open `index.html` in a modern web browser
2. The game starts in the World scene, showing a simulation of multiple RNA sequences evolving
3. Use the controls to play, pause, or step through the simulation
4. Switch to the Editor scene to design your own RNA sequences
5. Observe how different RNA sequences fold and interact

## World Scene

The World scene simulates multiple RNA sequences evolving in a primordial soup environment. RNA sequences that form stable structures through complementary base pairing gain energy and can replicate. Mutations occur during replication, leading to evolution through natural selection.

### Controls

- **Step**: Advance the simulation by one step
- **Play**: Run the simulation continuously
- **Pause**: Pause the simulation
- **Speed**: Adjust the simulation speed

## Editor Scene

The Editor scene allows you to design and test individual RNA sequences. You can observe how a specific sequence folds and forms bonds between complementary nucleotides.

### Controls

- **RNA Sequence**: Enter a custom sequence using A, U, G, C
- **Random**: Generate a random RNA sequence
- **Simulate**: Run a simulation of the entered sequence
- **Nucleotide Buttons**: Add specific nucleotides to your sequence

## The Science Behind the Game

RNA (ribonucleic acid) is composed of four nucleotides: Adenine (A), Uracil (U), Guanine (G), and Cytosine (C). These nucleotides form complementary pairs: A pairs with U, and G pairs with C.

In this simulation:

- RNA sequences fold based on complementary base pairing
- Stable structures (with more bonds) are more likely to persist
- Mutations introduce variation in the population
- Natural selection favors sequences that can form stable structures

This process models how early RNA molecules might have evolved in Earth's primordial soup, eventually leading to the first self-replicating systems and the emergence of life.

## Technical Details

This simulation is built using:

- HTML5 Canvas for rendering
- JavaScript for the simulation logic
- CSS for styling

The physics simulation includes:

- Forces between nucleotides based on complementarity
- Chain constraints to maintain RNA backbone structure
- Brownian motion to simulate molecular movement
- Folding dynamics based on nucleotide interactions

## About the RNA World Hypothesis

The RNA World hypothesis suggests that before DNA and proteins, RNA served both as genetic material and as enzymes (ribozymes). This game illustrates how simple RNA molecules might have evolved through natural processes of mutation and selection, eventually leading to more complex systems.

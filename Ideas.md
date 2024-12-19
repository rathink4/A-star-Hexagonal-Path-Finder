# Drawing the Hexagonal Grid a.k.a (HoneyComb)
## Hexagon Components

There are 3 main problems that I am facing right now.
1. I need to represent the Hexagons and the walls for each hexagons.
2. I need to draw a single hexagon once I implement what it means.
3. I need to draw the hexagonal grid (multiple hexagons in a honeycomb manner)


## 1. How to represent the Hexagons and the walls for each hexagons?

So this [link](https://github.com/basile-henry/hexamaze/blob/master/src/Main.hs) basically does what I am trying to implement.

The way this link has done it is basically creating 3 data structures.
1. Position (x, y) - represents the center pixel position of the Hex
2. Wall (Wall | Open) - represents whether there is a wall or not for the Hex
3. Cell (visited, Array<Wall>) - represents a Hex, whether it is visited, and the state of ith-Wall of the Hex

I think this can be the base approach that I should use as well. Right now, my mind is trying to find the solution for the edge cases of not opening the walls when they are outer most hex walls, but it's best to leave it right now and focus it later during the Maze creation algorithm.

## 2. How to draw a single Hexagon using the implementation.

Now, the problem is to draw the walls of the Hex. Each Wall of a hex needs to be drawn. So to do that we need to draw/undraw a line stroke every single time. The way to do that is to take a Position(x,y) and calculate the vertices. Then draw a line from one vertex to another.

## 3. How to draw the Hexagonal Grid (HoneyComb)

I drew a single hexagon. But the the problem now is to draw multiple hexagons in the canvas and then add the hexagon in the grid based on whether it is in the canvas.
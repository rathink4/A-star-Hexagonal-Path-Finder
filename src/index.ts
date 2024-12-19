import { Position, Hex, Cell, Model, PriorityQueue, QueueElement } from "./data_structures"
import { getHexVertex, hexToPixel, mapPixelToHex, isHexInGrid, findNeighborHexes} from "./hex_utils"

const HEXSIZE = 30
const HEXORIGIN = {x:725,y:350}
const GRID_RADIUS = 6
const generateMazeBtn = <HTMLButtonElement>document.getElementById("maze_generator")
const findPathBtn = <HTMLButtonElement>document.getElementById("path_finder")
let pathPosition : Hex[]
let mazeModel : Model


function drawSingleHex(hexCell:Cell) {
    const canvas = <HTMLCanvasElement> document.getElementById("honeyCombMazeCanvas")
    const ctx = <CanvasRenderingContext2D> canvas.getContext("2d")
    const center = hexCell.pos

    ctx.beginPath()

    const startVtx = getHexVertex(center, HEXSIZE, 0)
    ctx.moveTo(startVtx.x, startVtx.y)

    for (let i = 1; i <= 6; i++){
        const vertex = getHexVertex(center, HEXSIZE, i%6)
        ctx.lineTo(vertex.x, vertex.y)
    }

    ctx.fillStyle = '#ADD8E6'
    ctx.fill()

    for (let i = 0; i < 6; i++) {
        if (hexCell.walls[i] === "Open") continue
        let start = getHexVertex(center, HEXSIZE,  i)
        let end = getHexVertex(center, HEXSIZE, i+1)
        drawWall(start, end)
    }
}

function drawWall(startVert:Position, endVert:Position) {
    const canvas = <HTMLCanvasElement> document.getElementById("honeyCombMazeCanvas")
    const ctx = <CanvasRenderingContext2D> canvas.getContext("2d")
    ctx.beginPath()
    ctx.moveTo(startVert.x, startVert.y)
    ctx.lineTo(endVert.x, endVert.y)
    ctx.stroke()
    ctx.closePath()
}


function createModel(): Model {
    return {
        grid: [],
        currentHex: {r:0,q:0},
        stack: []
    }
}

function createCell(_hex: Hex, _position: Position): Cell {
    return {
        walls: ["Wall", "Wall", "Wall", "Wall", "Wall", "Wall"],
        hex: _hex,
        pos: _position,
        g: -1,
        h: -1,
        f: -1,
        parent: null
    }
}

function drawHoneyCombGrid(radius: number, mazeModel: Model) : Model {
    const size = 2 * radius + 1
    mazeModel.grid = Array(size).fill(null).map(()=>Array(size).fill(null))

    for (let q = -radius; q <= radius; q++) {
        const r1 = Math.max(-radius, -q-radius)
        const r2 = Math.min(radius, -q+radius)

        for (let r = r1; r <= r2; r++) {
            const hex = {r,q}
            const center = hexToPixel(hex, HEXSIZE, HEXORIGIN)
            const cell = createCell(hex, center)
            const arrayQ = q + radius
            const arrayR = r + radius

            mazeModel.grid[arrayR][arrayQ] = cell

            drawSingleHex(cell)

        }
    }

    return mazeModel
}

function getCursorPoition(canvas: HTMLCanvasElement, event: MouseEvent) : Position {
    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    return {x: x, y:y}
}


function getCommonWall(hex1: Hex, hex2: Hex) : {hex1Wall: number, hex2Wall: number} {
    const directions = [
        { dr: 0, dq: 1, wall1: 1, wall2: 4 },  
        { dr: 0, dq: -1, wall1: 4, wall2: 1 },
        { dr: -1, dq: 1, wall1: 0, wall2: 3 },
        { dr: -1, dq: 0, wall1: 5, wall2: 2 },
        { dr: 1, dq: 0, wall1: 2, wall2: 5 },
        { dr: 1, dq: -1, wall1: 3, wall2: 0 }
    ];

    const dq = hex2.q - hex1.q;
    const dr = hex2.r - hex1.r;

    const direction = directions.find(dir => dir.dq === dq && dir.dr === dr);
    if (!direction) throw new Error("Hexes are not neighbors");
    
    return {hex1Wall: direction.wall1, hex2Wall: direction.wall2};
}

function removeWall(currHex:Hex, neighHex:Hex) : void {
    const { hex1Wall, hex2Wall } = getCommonWall(currHex, neighHex);

    // Convert to array indices
    const i1 = currHex.r + GRID_RADIUS;
    const j1 = currHex.q + GRID_RADIUS;
    const i2 = neighHex.r + GRID_RADIUS;
    const j2 = neighHex.q + GRID_RADIUS;

    // Remove walls in data structure
    if (mazeModel.grid[i1] && mazeModel.grid[i1][j1]) {
        const currHexCell = mazeModel.grid[i1][j1]
        currHexCell.walls[hex1Wall] = "Open"
        mazeModel.grid[i1][j1] = currHexCell;
    }
    if (mazeModel.grid[i2] && mazeModel.grid[i2][j2]) {
        const neighHexCell = mazeModel.grid[i2][j2]
        neighHexCell.walls[hex2Wall] = "Open"
        mazeModel.grid[i2][j2] = neighHexCell
    }

    const h1Center = hexToPixel(currHex, HEXSIZE, HEXORIGIN)
    const i = hex1Wall-1
    const h1Start = getHexVertex(h1Center, HEXSIZE, i)
    const h1End = getHexVertex(h1Center, HEXSIZE, (i+1)%6)

    const canvas = <HTMLCanvasElement>document.getElementById("honeyCombMazeCanvas");
    const ctx = <CanvasRenderingContext2D>canvas.getContext("2d");
    
    ctx.beginPath();
    ctx.strokeStyle = '#ADD8E6';  // or whatever your background color is
    ctx.lineWidth = 2;
    ctx.moveTo(h1Start.x, h1Start.y);
    ctx.lineTo(h1End.x, h1End.y);
    ctx.stroke();
    ctx.closePath();

}

function hexToKey(hex: Hex): string {
    return `${hex.r},${hex.q}`;
}


function paintSelectedCell(hex: Hex, color: string, counter:number=-1) {
    const canvas = <HTMLCanvasElement> document.getElementById("honeyCombMazeCanvas")
    const ctx = <CanvasRenderingContext2D> canvas.getContext("2d")
    const center = hexToPixel(hex, HEXSIZE, HEXORIGIN)

    ctx.beginPath()

    const startVtx = getHexVertex(center, HEXSIZE-5, 0)
    ctx.moveTo(startVtx.x, startVtx.y)

    for (let i = 1; i <= 6; i++){
        const vertex = getHexVertex(center, HEXSIZE-5, i%6)
        ctx.lineTo(vertex.x, vertex.y)
    }

    // ctx.fillStyle = "#04AA6D"
    ctx.fillStyle = color
    ctx.fill()

    // Add counter number
    if (counter !== -1) {
        ctx.fillStyle = "white";  // text color
        ctx.font = "12px Arial";  // font size and family
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        // Calculate position for the counter (top-right of hex)
        const topRightVertex = getHexVertex(center, HEXSIZE-15, 1);  // Using vertex 1 (top-right)
        
        // Draw counter
        ctx.fillText(
            counter.toString(),
            topRightVertex.x,
            topRightVertex.y
        );
    }
    


}

function hexToCell(hex: Hex) : Cell {
    if (!isHexInGrid(hex, GRID_RADIUS)) {
        throw new Error(`Hex coordinates (${hex.q},${hex.r}) are out of grid bounds`);
    }

    const i = hex.r + GRID_RADIUS
    const j = hex.q + GRID_RADIUS
    if (!mazeModel.grid[i] || !mazeModel.grid[i][j]) {
        throw new Error(`No cell found at grid coordinates (${i},${j})`);
    }
    return mazeModel.grid[i][j];
}

function heuristic(start: Cell, goal: Cell) : number {
    const x1 = start.pos.x
    const y1 = start.pos.y
    const x2 = goal.pos.x
    const y2 = goal.pos.y
    const distance = Math.sqrt((x1-x2)*(x1-x2) + (y1-y2)*(y1-y2))
    return distance
}

function isValidNeighbour(current: Hex, neighbor: Hex) {
    const { hex1Wall, hex2Wall } = getCommonWall(current, neighbor);

    // Convert to array indices
    let currentCell = hexToCell(current)
    let neighCell = hexToCell(neighbor)

    return (currentCell.walls[hex1Wall] === "Open" && neighCell.walls[hex2Wall] == "Open")
}

const reconstructPath = async (current: Cell): Promise<void> => {
    const path: Cell[] = [];
    
    while (current !== null) {
        //await new Promise(resolve => setTimeout(resolve, 50));
        path.push(current);
        
        if (current.parent === null) break;
        current = current.parent;
    }
    let count = 0
    let pathLength = path.length

    while (path.length > 0) {
        const cell = path.pop()
        count += 1
        if (count == 1) continue
        
        if (cell) {
            await new Promise(resolve => setTimeout(resolve, 200))
            count == pathLength ? paintSelectedCell(cell.hex, "#04AA6D", count) : paintSelectedCell(cell.hex, "#9ACD32", count)
        }
    }
    
}

generateMazeBtn.onclick = async () => {
    generateMazeBtn.disabled = true
    generateMazeBtn.classList.add('disabled')
    
    let maze_stack = mazeModel.stack
    let visited = new Set()
    let currHex = mazeModel.currentHex
    visited.add(`${currHex.r},${currHex.q}`)
    maze_stack.push(mazeModel.currentHex)
    

    while (maze_stack.length !== 0) {
        await new Promise(resolve => setTimeout(resolve, 30))
        
        let neighbourHexes = findNeighborHexes(currHex)

        let unvisitedNeighbors = neighbourHexes.filter(
            hex => isHexInGrid(hex, GRID_RADIUS) && !visited.has(hexToKey(hex))
        );

        if (unvisitedNeighbors.length > 0) {
            maze_stack.push(currHex)
            let randomIdx = Math.floor(Math.random() * unvisitedNeighbors.length)
            let neighHex = unvisitedNeighbors[randomIdx]
            //paintCurrCell(currHex)
            //paintSelectedCell(neighHex)
            removeWall(currHex, neighHex)
            visited.add(`${neighHex.r},${neighHex.q}`)
            maze_stack.push(neighHex)
            currHex = neighHex
            continue
        } else {
            currHex = maze_stack.pop() as Hex
            continue
        }
       
        
    }
    alert("Maze Generation: Complete!")
}

findPathBtn.onclick = () => {
    if (hexToKey(pathPosition[0]) === hexToKey(pathPosition[1])) {
        alert("Path Found: We are already at the destination!")
        location.reload()
    }
    else if (pathPosition.length <= 1) {
        alert("Unable to create path without starting and ending positions!")
    }
    else {
        const size = 2 * GRID_RADIUS + 1
        let openList = new PriorityQueue()
        let closedList = new Set()
        let startHex = pathPosition[0]
        let goalHex = pathPosition[1]

        let start = hexToCell(startHex)
        let goal = hexToCell(goalHex)

        start.g = 0
        start.h = heuristic(start, goal)
        start.f = start.g + start.h

        openList.enqueue(start, start.f)

        while (!openList.isEmpty) {
            let current = openList.dequeue()
            if (hexToKey(current.hex) == hexToKey(goal.hex)) {
                // recontruct the path from current
                alert("Path Found: Recontructing Path")
                reconstructPath(current)
            }

            closedList.add(hexToKey(current.hex))
            let neighbourHexes = findNeighborHexes(current.hex)
            let unvisitedNeighbors = neighbourHexes.filter(
                hex => isHexInGrid(hex, GRID_RADIUS) && !closedList.has(hexToKey(hex)) && isValidNeighbour(current.hex, hex)
            );

            for (let i = 0; i < unvisitedNeighbors.length; i++) {
                let neighbor = hexToCell(unvisitedNeighbors[i])
                let tempG = current.g + heuristic(current, neighbor)
                if (!openList.hasItem(neighbor)) {
                    neighbor.g = tempG
                    neighbor.h = heuristic(neighbor, goal)
                    neighbor.f = neighbor.g + neighbor.h
                    neighbor.parent = current
                    openList.enqueue(neighbor, neighbor.f)
                }
                else if(tempG < openList.getCell(neighbor)?.g){
                    let _neighbor = openList.getCell(neighbor)
                    _neighbor.g = tempG
                    _neighbor.f = tempG + _neighbor.h
                    _neighbor.parent = current
                    openList.remove(neighbor)
                    openList.enqueue(_neighbor, _neighbor.f)
                }
            }

            
        }
        
    }
}

// function printGrid(model: Model) {
//     console.log("Grid Structure:");
//     model.grid.forEach((row, rowIndex) => {
//         let rowStr = `Row ${rowIndex}: `;
//         row.forEach((cell, colIndex) => {
//             if (cell === null) {
//                 rowStr += "null ";
//             } else {
//                 rowStr += `(${cell.walls}) `;
//             }
//         });
//         console.log(rowStr);
//     });
// }

function main() {
    const canvas = <HTMLCanvasElement> document.getElementById("honeyCombMazeCanvas")
    const ctx = <CanvasRenderingContext2D> canvas.getContext("2d")

    mazeModel = createModel()
    drawHoneyCombGrid(GRID_RADIUS, mazeModel)
    pathPosition = []

    canvas.addEventListener('mousedown', function(e) {
        if (pathPosition.length < 2) {
            let cursor_pixel = getCursorPoition(canvas, e)
            let cursor_hex = mapPixelToHex(cursor_pixel, HEXSIZE, HEXORIGIN)
            console.log(cursor_hex)
            pathPosition.push(cursor_hex)
            pathPosition.length == 1 ? paintSelectedCell(cursor_hex, "#008CBA", 1) : paintSelectedCell(cursor_hex, "#04AA6D")
        }
        else {
            alert("Two positions seleteced: Try finding the path!")
        }
        
        

    })
}

main()
    
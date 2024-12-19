import { Position, Hex, Cell, Model } from "./data_structures"
export function getHexVertex(center:Position, size: number, i:number) : Position {
    let angle_deg = 60 * i - 30
    let angle_rad = Math.PI / 180 * angle_deg
    let pos_x = center.x + size * Math.cos(angle_rad)
    let pos_y = center.y + size * Math.sin(angle_rad)
    return {x: pos_x, y:pos_y}
}

export function hexToPixel(h: Hex, size: number, origin: Position) : Position {
    let px = size * Math.sqrt(3) * (h.q + h.r/2) + origin.x
    let py = size * 3/2 * h.r + origin.y
    return {x:px, y:py}
}

function roundToAxialCoordinates(h_r: number, h_q: number, h_s: number) {
    let q = Math.round(h_q)
    let r = Math.round(h_r)
    let s = Math.round(h_s)

    let q_diff = Math.abs(q - h_q)
    let r_diff = Math.abs(r - h_r)
    let s_diff = Math.abs(s - h_s)

    if (q_diff > r_diff && q_diff > s_diff){
        q = -r-s
    } else if (r_diff > s_diff) {
        r = -q-s
    }
    else {
        s = -q-r
    }

    return {r: r, q: q}
}

export function mapPixelToHex(point: Position, size: number, origin: Position) : Hex {
    let px = point.x - origin.x
    let py = point.y - origin.y 
    let q = (Math.sqrt(3)/3 * px - 1/3 * py) / size
    let r = (2/3 * py) / size
    let hex_coord = roundToAxialCoordinates(r, q, -q-r)
    return hex_coord
}

export function isHexInGrid(hex: Hex, gridRadius: number): boolean {
    return Math.abs(hex.q) <= gridRadius && 
           Math.abs(hex.r) <= gridRadius && 
           Math.abs(hex.q + hex.r) <= gridRadius;
}

export function findNeighborHexes(hex: Hex) : Array<Hex> {
    const directions = [
        {r:0, q:1}, {r:-1, q:1}, {r:-1, q:0}, 
        {r:0, q:-1}, {r:1, q:-1}, {r:1, q:0}
    ]

    let neighbors : Hex[] = []
    directions.forEach(hexDir => {
        let nr = hex.r + hexDir.r
        let nq = hex.q+hexDir.q
        let n = {r:nr, q:nq}
        neighbors.push(n)
    });

    return neighbors
}
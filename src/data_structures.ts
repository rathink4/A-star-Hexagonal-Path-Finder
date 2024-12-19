export interface Position {
    x: number;
    y: number;
}

export interface Hex {
    r: number;
    q: number;
}

export type Wall = "Wall" | "Open"

export interface Cell {
    walls: [Wall, Wall, Wall, Wall, Wall, Wall];
    hex: Hex;
    pos: Position;
    g: number;
    h: number;
    f: number;
    parent: Cell | null;
}

export interface Model {
    grid: Cell[][];
    currentHex: Hex;
    stack: Hex[];
}

export interface QueueElement {
    item: Cell;
    priority: number;
}

export class PriorityQueue {
    #list: QueueElement[] = []

    get size() {
        return this.#list.length
    }

    // get isFull() {
    //     return this.#capacity !== null && this.size === this.#capacity
    // }

    get isEmpty() {
        return this.size === 0
    }

    enqueue(item: Cell, priority:number=0) {
        priority = Math.max(priority, 0)
        const element = {item, priority}

        if (this.isEmpty || element.priority <= this.#list[this.size - 1].priority) {
            this.#list.push(element)
        } else {
            for (let i = 0; i < this.size; i++) {
                if (element.priority > this.#list[i].priority) {
                    this.#list.splice(i, 0, element)
                    break
                }
            }
        }

        return this.size
    }

    dequeue() {
        return (this.#list.shift() as QueueElement).item
    }

    hasItem(searchCell: Cell): boolean {
        return this.#list.some(element => 
            element.item.hex.q === searchCell.hex.q && 
            element.item.hex.r === searchCell.hex.r
        )
    }

    getCell(searchCell: Cell): Cell {
        const found = this.#list.find(element => 
            element.item.hex.q === searchCell.hex.q && 
            element.item.hex.r === searchCell.hex.r)?.item
        
        if (!found) {
            throw new Error("Cell not found")
        }

        return found
    }

    remove(cell: Cell): void {
        const index = this.#list.findIndex(element => 
            element.item.hex.q === cell.hex.q && 
            element.item.hex.r === cell.hex.r
        );
        if (index !== -1) {
            this.#list.splice(index, 1);
        }
    }
}

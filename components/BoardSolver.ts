type Grid = number[][];
type Coord = [number, number];
type Allocation = { [key: string]: number };

// Priority Queue implementation (min-heap)
class PriorityQueue<T> {
    private heap: [number, T][] = [];

    push(priority: number, item: T): void {
        this.heap.push([priority, item]);
        this.bubbleUp(this.heap.length - 1);
    }

    pop(): [number, T] | undefined {
        if (this.heap.length === 0) return undefined;
        const top = this.heap[0];
        const bottom = this.heap.pop()!;
        if (this.heap.length > 0) {
            this.heap[0] = bottom;
            this.sinkDown(0);
        }
        return top;
    }

    isEmpty(): boolean {
        return this.heap.length === 0;
    }

    private bubbleUp(n: number): void {
        const element = this.heap[n];
        while (n > 0) {
            const parentN = Math.floor((n + 1) / 2) - 1;
            const parent = this.heap[parentN];
            if (element[0] >= parent[0]) break;
            this.heap[parentN] = element;
            this.heap[n] = parent;
            n = parentN;
        }
    }

    private sinkDown(n: number): void {
        const length = this.heap.length;
        const element = this.heap[n];
        while (true) {
            const child2N = (n + 1) * 2;
            const child1N = child2N - 1;
            let swap: number | null = null;

            if (child1N < length) {
                const child1 = this.heap[child1N];
                if (child1[0] < element[0]) swap = child1N;
            }

            if (child2N < length) {
                const child2 = this.heap[child2N];
                if ((swap === null ? element[0] : this.heap[child1N][0]) > child2[0]) swap = child2N;
            }

            if (swap === null) break;
            this.heap[n] = this.heap[swap];
            this.heap[swap] = element;
            n = swap;
        }
    }
}

function Solve(grid: Grid, CAPACITY: number): number {
    const ROWS = grid.length;
    const COLS = grid[0].length;
    const directions: Coord[] = [[0, 1], [0, -1], [-1, 0], [1, 0]];

    function isInvalid(x: number, y: number): boolean {
        return x < 0 || y < 0 || x >= ROWS || y >= COLS;
    }

    function isPickable(x: number, y: number, curr_grid: Grid): boolean {
        if (x === 0) return true;
        if (curr_grid[x][y] === 0) return false;
        return curr_grid[x - 1][y] === 0;
    }

    function getTopBoxInCol(col: number, curr_grid: Grid): number {
        for (let x = 0; x < ROWS; x++) {
            if (curr_grid[x][col] !== 0) return x;
        }
        return -1;
    }

    function getHeuristicCost(updated_grid: Grid, remaining_capacity: number): number {
        let total = 0;
        for (let row of updated_grid) {
            for (let v of row) {
                total += v;
            }
        }
        return Math.ceil((total - remaining_capacity) / CAPACITY);
    }

    function deepCopyGrid(grid: Grid): Grid {
        return grid.map(row => row.slice());
    }

    function encodeState(node: Coord, weight: number, grid: Grid): string {
        return JSON.stringify({ node, weight, grid });
    }

    const heap = new PriorityQueue<[
        Coord,
        number,
        Allocation,
        Grid
    ]>();

    const visited = new Set<string>();

    for (let y = 0; y < COLS; y++) {
        const x = getTopBoxInCol(y, grid);
        if (x === -1) continue;
        const curr_grid = deepCopyGrid(grid);
        const weight = curr_grid[x][y];
        const remaining_capacity = CAPACITY - weight;
        curr_grid[x][y] = 0;
        const cost = getHeuristicCost(curr_grid, remaining_capacity);
        const alloc: Allocation = { [`${x},${y}`]: 1 };
        heap.push(cost, [[x, y], weight, alloc, curr_grid]);
    }

    let final_cost = Infinity;
    let answer: Allocation = {};
    while (!heap.isEmpty()) {
      const popped = heap.pop();
      if (!popped) break;
      const [curr_cost, [[x, y], curr_weight, curr_allocation, curr_grid]] = popped;
      // return 99;

        const state_key = encodeState([x, y], curr_weight, curr_grid);
        if (visited.has(state_key)) continue;
        visited.add(state_key);

        if (curr_cost >= final_cost) continue;

        const nodes_to_add: [Coord, boolean][] = [];

        for (let [dx, dy] of directions) {
            const nx = x + dx;
            const ny = y + dy;
            if (isInvalid(nx, ny)) continue;
            if (!isPickable(nx, ny, curr_grid)) continue;
            if (grid[nx][ny] + curr_weight > CAPACITY) continue;
            nodes_to_add.push([[nx, ny], false]);
        }

        for (let ny = 0; ny < COLS; ny++) {
            const nx = getTopBoxInCol(ny, curr_grid);
            if (nx === -1) continue;
            nodes_to_add.push([[nx, ny], true]);
        }

        for (let [[nx, ny], reset] of nodes_to_add) {
            const cluster = curr_allocation[`${x},${y}`];
            const next_grid = deepCopyGrid(curr_grid);
            const next_allocation: Allocation = { ...curr_allocation };

            const next_weight = reset ? next_grid[nx][ny] : next_grid[nx][ny] + curr_weight;
            next_grid[nx][ny] = 0;
            let next_cost = Math.max(...Object.values(next_allocation)) + getHeuristicCost(next_grid, CAPACITY - next_weight);
            if (reset) next_cost += 1;
            next_allocation[`${nx},${ny}`] = reset ? cluster + 1 : cluster;

            if (next_cost >= final_cost) continue;

            const isFinished = next_grid.flat().every(val => val === 0);
            if (isFinished) {
                if (next_cost < final_cost) {
                    final_cost = next_cost;
                    answer = next_allocation;
                }
                continue;
            }

            heap.push(next_cost, [[nx, ny], next_weight, next_allocation, next_grid]);
        }
    }

    if (Object.values(answer).length === 0) return 0;
    return Math.max(...Object.values(answer));
}

export default Solve;

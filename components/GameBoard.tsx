"use client";

import { useState } from "react";

const ROWS = 4;
const COLS = 4;
const CAPACITY = 6;

function generateGrid() {
  return Array.from({ length: ROWS }, () =>
    Array.from({ length: COLS }, () => Math.floor(Math.random() * 4) + 1)
  );
}

type Coord = `${number},${number}`;

function coordKey(row: number, col: number): Coord {
  return `${row},${col}`;
}

function parseCoord(key: Coord): [number, number] {
  const [r, c] = key.split(",").map(Number);
  return [r, c];
}

export default function GameBoard() {
  const [grid, setGrid] = useState<number[][]>(generateGrid);
  const [backlog, setBacklog] = useState<number[]>([]);
  const [backlogCoords, setBacklogCoords] = useState<Set<Coord>>(new Set());
  const [turns, setTurns] = useState(0);
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
  const [pressStartTime, setPressStartTime] = useState<number | null>(null);
  const [backlogActive, setBacklogActive] = useState(false); // Whether backlog sequence is active

  // Check if block is topmost in its column
  const isTopBlock = (row: number, col: number) => {
    // TODO: box can be in backlog
    for (let r = 0; r < row; r++) {
      if (grid[r][col] !== 0) return false;
    }
    return grid[row][col] !== 0;
  };

  // Return 4-neighbors of a cell
  const getNeighbors = (r: number, c: number): Coord[] => {
    const neighbors: Coord[] = [];
    const dirs = [
      [0, 1],
      [1, 0],
      [-1, 0],
      [0, -1],
    ];
    for (const [dr, dc] of dirs) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) {
        neighbors.push(coordKey(nr, nc));
      }
    }
    return neighbors;
  };

  // Only allow adding to backlog if:
  // - block is a top block
  // - Otherwise, block above it must be in backlog
  // - block is a neighbor of existing backlog block
  // - or it is the first block in the backlog
  const canAddToBacklog = (row: number, col: number): boolean => {
    const key = coordKey(row, col);
    if (!isTopBlock(row, col)) {
      const top_key = coordKey(row-1, col);
      if(!backlogCoords.has(top_key)) return false;
    }

    if (backlogCoords.has(key)) return false;

    if (backlogCoords.size === 0) return true;

    for (const b of backlogCoords) {
      const [br, bc] = parseCoord(b);
      const neighbors = getNeighbors(br, bc);
      if (neighbors.includes(key)) return true;
    }

    return false;
  };

  // On long press → attempt to add to backlog
  const handlePressStart = (row: number, col: number) => {
    setPressStartTime(Date.now());

    const timer = setTimeout(() => {
      if (!canAddToBacklog(row, col)) return;

      const key = coordKey(row, col);
      const value = grid[row][col];
      const totalWeight = backlog.reduce((a, b) => a + b, 0);

      // Check if adding this value exceeds capacity
      if (value + totalWeight > CAPACITY) return;

      const newBacklog = [...backlog, value];
      const newCoords = new Set(backlogCoords);
      newCoords.add(key);

      setBacklog(newBacklog);
      setBacklogCoords(newCoords);
      setBacklogActive(true);
    }, 500); // long press delay

    setLongPressTimer(timer);
  };

  // Cancel long press timer
  const handlePressEnd = (row: number, col: number) => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }

    const key = coordKey(row, col);

    // If short click
    if (pressStartTime && Date.now() - pressStartTime < 500) {
      // If backlog is active → allow only clicking backlog blocks to remove
      if (backlogActive) {
        if (!backlogCoords.has(key)) return;
        const newGrid = grid.map(row => [...row]);
        for (const b of backlogCoords) {
          const [br, bc] = parseCoord(b);
          newGrid[br][bc] = 0;
        }
        
        setGrid(newGrid);
        setBacklog([]);
        setBacklogCoords(new Set());
        setBacklogActive(false);
        setTurns(turns + 1);
      } else {
        // Normal click → attempt to vanish a top block
        if (!isTopBlock(row, col)) return;

        const value = grid[row][col];
        const totalWeight = value;

        if (totalWeight > CAPACITY) return;

        // Remove this single block
        const newGrid = grid.map((r, i) =>
          r.map((cell, j) => (i === row && j === col ? 0 : cell))
        );

        setGrid(newGrid);
        setTurns(turns + 1);
      }
    }

    setPressStartTime(null);
  };

  // Reset board state
  const handleReset = () => {
    setGrid(generateGrid());
    setBacklog([]);
    setBacklogCoords(new Set());
    setTurns(0);
    setBacklogActive(false);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Unstackle</h1>
        <button
          onClick={handleReset}
          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
        >
          Reset
        </button>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {grid.map((row, i) =>
          row.map((cell, j) => {
            const key = coordKey(i, j);
            const inBacklog = backlogCoords.has(key);

            return (
              <div
                key={key}
                onMouseDown={() => handlePressStart(i, j)}
                onMouseUp={() => handlePressEnd(i, j)}
                className={`w-16 h-16 text-lg font-semibold flex items-center justify-center border rounded select-none transition
                  ${
                    cell === 0
                      ? "bg-gray-200 text-gray-500"
                      : inBacklog
                      ? "bg-yellow-400 text-black"
                      // : isTopBlock(i, j)
                      : "bg-blue-600 text-white cursor-pointer hover:bg-blue-700"
                      // : "bg-gray-400 text-white"
                  }`}
              >
                {cell !== 0 ? cell : ""}
              </div>
            );
          })
        )}
      </div>

      <div className="mt-4 space-y-1">
        <p>
          Backlog:{" "}
          {backlog.length > 0
            ? backlog.join(", ") + ` (Total: ${backlog.reduce((a, b) => a + b, 0)} / ${CAPACITY})`
            : "Empty"}
        </p>
        <p>Turns Taken: {turns}</p>
      </div>
    </div>
  );
}

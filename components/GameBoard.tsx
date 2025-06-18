"use client";

import { useState, useEffect } from "react";
import "../src/app/globals.css"; // make sure this imports a file with the .shake animation class

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
  const [initialGrid, setInitialGrid] = useState<number[][] | null>(null);
  const [grid, setGrid] = useState<number[][] | null>(null);
  const [backlog, setBacklog] = useState<number[]>([]);
  const [backlogCoords, setBacklogCoords] = useState<Set<Coord>>(new Set());
  const [turns, setTurns] = useState(0);
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
  const [pressStartTime, setPressStartTime] = useState<number | null>(null);
  const [backlogActive, setBacklogActive] = useState(false); // Whether backlog sequence is active
  const [shakeSet, setShakeSet] = useState<Set<Coord>>(new Set());

  useEffect(() => {
    const g = generateGrid();
    setInitialGrid(g);
    setGrid(g);
  }, []);

  // Check if block is topmost in its column
  const isTopBlock = (row: number, col: number) => {
  if (!grid) return false; // Defensive: grid not ready yet
    for (let r = 0; r < row; r++) {
      if (grid[r][col] !== 0) return false;
    }
    return grid[row][col] !== 0;
  };

  // Return 4-neighbors of a cell
  const getNeighbors = (r: number, c: number): Coord[] => {
    const dirs = [
      [0, 1], [1, 0], [-1, 0], [0, -1],
    ];
    return dirs
      .map(([dr, dc]) => [r + dr, c + dc])
      .filter(([nr, nc]) => nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS)
      .map(([nr, nc]) => coordKey(nr, nc));
  };

  // Only allow adding to backlog if:
  // - block is a top block
  // - Otherwise, block above it must be in backlog
  // - block is a neighbor of existing backlog block
  // - or it is the first block in the backlog
  const canAddToBacklog = (row: number, col: number): boolean => {
    const key = coordKey(row, col);
    if (!isTopBlock(row, col)) {
      const aboveKey = coordKey(row - 1, col);
      if (!backlogCoords.has(aboveKey)) return false;
    }

    if (backlogCoords.has(key)) return false;

    if (backlogCoords.size === 0) return true;

    for (const b of backlogCoords) {
      const [br, bc] = parseCoord(b);
      if (getNeighbors(br, bc).includes(key)) return true;
    }

    return false;
  };

  const triggerShake = (key: Coord) => {
    // Add key to shake set
    setShakeSet(prev => {
      const updated = new Set(prev);
      updated.add(key);
      return updated;
    });

    // Remove it after 500ms to end animation
    setTimeout(() => {
      setShakeSet(prev => {
        const newSet = new Set(prev);
        newSet.delete(key);
        return newSet;
      });
    }, 500);
  };


  // On long press → attempt to add to backlog
  const handlePressStart = (row: number, col: number) => {
    if (!grid) return false; // Defensive: grid not ready yet
    setPressStartTime(Date.now());

    const timer = setTimeout(() => {
      const key = coordKey(row, col);
      if (!canAddToBacklog(row, col)) {
        triggerShake(key);
        return;
      }

      const value = grid[row][col];
      const totalWeight = backlog.reduce((a, b) => a + b, 0);
      if (value + totalWeight > CAPACITY) {
        triggerShake(key);
        return;
      }

      const newBacklog = [...backlog, value];
      const newCoords = new Set(backlogCoords);
      newCoords.add(key);

      setBacklog(newBacklog);
      setBacklogCoords(newCoords);
      setBacklogActive(true);
    }, 500);

    setLongPressTimer(timer);
  };

  const handlePressEnd = (row: number, col: number) => {
    if (!grid) return false; // Defensive: grid not ready yet
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }

    const key = coordKey(row, col);

    if (pressStartTime && Date.now() - pressStartTime < 500) {
      if (backlogActive) {
        if (!backlogCoords.has(key)) {
          triggerShake(key);
          return;
        }

        const newGrid = grid.map(r => [...r]);
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
        if (!isTopBlock(row, col)) {
          triggerShake(key);
          return;
        }

        const value = grid[row][col];
        if (value > CAPACITY) {
          triggerShake(key);
          return;
        }

        const newGrid = grid.map((r, i) =>
          r.map((cell, j) => (i === row && j === col ? 0 : cell))
        );

        setGrid(newGrid);
        setTurns(turns + 1);
      }
    }

    setPressStartTime(null);
  };

  const handleReset = () => {
    setGrid(initialGrid);
    setBacklog([]);
    setBacklogCoords(new Set());
    setTurns(0);
    setBacklogActive(false);
  };

  const handleResetBacklog = () => {
    setBacklog([]);
    setBacklogCoords(new Set());
    setBacklogActive(false);
  };

  const handleNewGame = () => {
    const newGrid = generateGrid();
    setInitialGrid(newGrid);
    setGrid(newGrid);
    setBacklog([]);
    setBacklogCoords(new Set());
    setTurns(0);
    setBacklogActive(false);
  };

  if (!grid) return null; // or a loading indicator

  return (
    <div className="p-6 flex flex-col items-center">
      <h1 className="text-4xl font-black mb-4 tracking-wide font-mono">UNSTACKLE</h1>

      <div className="flex space-x-3 mb-6">
        <button onClick={handleReset} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">
          Reset
        </button>
        <button onClick={handleResetBacklog} className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded">
          Reset Backlog
        </button>
        <button onClick={handleNewGame} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded">
          New Game
        </button>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {grid.map((row, i) =>
          row.map((cell, j) => {
            const key = coordKey(i, j);
            const inBacklog = backlogCoords.has(key);
            const isShaking = shakeSet.has(key);

            return (
              <div
                key={key}
                onMouseDown={() => handlePressStart(i, j)}
                onMouseUp={() => handlePressEnd(i, j)}
                className={`w-16 h-16 text-lg font-bold flex items-center justify-center border rounded select-none transition
                  ${cell === 0 ? "bg-gray-200 text-gray-500"
                    : inBacklog ? "bg-yellow-400 text-black"
                    : "bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"}
                  ${isShaking ? "shake" : ""}
                `}
              >
                {cell !== 0 ? cell : ""}
              </div>
            );
          })
        )}
      </div>

      <div className="mt-4 space-y-1 text-center">
        <p>
          Backlog: {backlog.length > 0
            ? backlog.join(", ") + ` (Total: ${backlog.reduce((a, b) => a + b, 0)} / ${CAPACITY})`
            : "Empty"}
        </p>
        <p>Turns Taken: {turns}</p>
      </div>
    </div>
  );
}

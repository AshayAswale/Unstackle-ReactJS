// components/GameBoard.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import "../src/app/globals.css"; // make sure this imports a file with the .shake animation class


export default function GameBoard({ ROWS, COLS }: { ROWS: number, COLS: number }) {
  console.log("Grid ", ROWS, "x", COLS)
  const CAPACITY = 6;
  const [initialGrid, setInitialGrid] = useState<number[][] | null>(null);
  const [grid, setGrid] = useState<number[][] | null>(null);
  const [backlog, setBacklog] = useState<number[]>([]);
  const [backlogCoords, setBacklogCoords] = useState<Set<Coord>>(new Set());
  const [turns, setTurns] = useState(0);
  const [backlogActive, setBacklogActive] = useState(false); // Whether backlog sequence is active
  const [shakeSet, setShakeSet] = useState<Set<Coord>>(new Set());
  const [optimal, setOptimal] = useState<number | null>(null);
  const [quicksol, setQuickSol] = useState<boolean | null>(null);
  const startWorker = useSolverWorker(setOptimal, setQuickSol);

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

function useSolverWorker(setOptimal: (n: number) => void, setQuickSol: (b: boolean) => void) {
  const workerRef = useRef<Worker | null>(null);

  const startWorker = (grid: number[][]) => {
    workerRef.current?.terminate();
    workerRef.current = new Worker(new URL('./BoardSolver.ts', import.meta.url));
    workerRef.current.onmessage = (event: MessageEvent<[number, boolean]>) => {
      const [result, quick_sol] = event.data;
      setOptimal(result);
      setQuickSol(quick_sol);
    };
    workerRef.current.postMessage({ grid, capacity: CAPACITY });
  };

  useEffect(() => {
    return () => {
      workerRef.current?.terminate();  // Clean up on component unmount
    };
  }, []);

  return startWorker;
}


  useEffect(() => {
    const g = generateGrid();
    setInitialGrid(g);
    setGrid(g);
    startWorker(g);
  }, []);

  const isGridEmpty = () => {
    return grid?.every(row => row.every(cell => cell === 0));
  };

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
  const handleClick = (row: number, col: number) => {
    if (!grid) return false; // Defensive: grid not ready yet
    const key = coordKey(row, col);
    // if in backlog, execute this:
    if (backlogCoords.has(key)) {
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
    // if not in backlog, execute this
    else {
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
    }
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
    setOptimal(null); // Reset optimal until worker provides a new one
    setQuickSol(false);
    
    startWorker(newGrid);
  };

  if (!grid) return null; // or a loading indicator

  return (
    <div className="p-6 flex flex-col items-center">
      <h1 className="text-6xl font-black mb-4 tracking-wide font-mono hover:text-blue-600 transition-colors cursor-pointer"
        onClick={() => window.location.reload()}>
        UNSTACKLE
      </h1>
      {isGridEmpty() ? (
    <>
      <p className={`text-3xl font-bold mb-4 ${turns <= (optimal ?? 0) ? 'text-green-600' : 'text-red-600'}`}>
        {turns <= (optimal ?? 0) ? 'YOU WIN!' : 'TRY AGAIN'}
      </p>

      <div className="flex space-x-3">
        {turns > (optimal ?? 0) && (
          <button onClick={handleReset} className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded">
            Try Again
          </button>
        )}
        <button onClick={handleNewGame} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded">
          New Game
        </button>
      </div>
    </>
  ) : (
    <>
    <div className="mb-4">
      <a href="/tutorial" className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
        How to Play
      </a>
    </div>

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

      <div className="grid gap-2"
      style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}
      >
        {grid.map((row, i) =>
          row.map((cell, j) => {
            const key = coordKey(i, j);
            const inBacklog = backlogCoords.has(key);
            const isShaking = shakeSet.has(key);

            return (
              <div
                key={key}
                onClick={() => handleClick(i, j)}
                className={`w-16 h-16 relative border rounded select-none transition ${isShaking ? "shake" : ""}`}
              >
                {cell !== 0 && (
                  <>
                    <div
                      className="absolute top-0 left-0 w-full h-full rounded"
                      style={{
                        backgroundColor: cell === 1 ? "#fccca2" :
                                        cell === 2 ? "#e8a264" :
                                        cell === 3 ? "#bf8552" :
                                        "#966035"
                      }}
                    />
                    {inBacklog && (
                      <img
                        src={`/assets/tape.png`}
                        alt="Backlog Tape"
                        className="absolute top-0 left-0 w-full h-full object-cover rounded"
                      />
                    )}
                    <div className="absolute inset-0 flex items-center justify-center text-black font-bold text-xl">
                      {cell}
                    </div>
                  </>
                )}
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
        {optimal !== null ? (
          <p>Challenge: {optimal} moves {quicksol ? '' : '(Optimal)'}</p>
        ) : (
          <p>Calculating optimal moves...</p> // Indicate that it's being calculated
        )}
      </div>
      </>
      )}
    </div>
  );
}
import React, { useState, useEffect } from 'react';

const GRID_SIZE = 4;
const MAX_CAPACITY = 5;

const generateInitialNumbers = () => Array.from({ length: GRID_SIZE * GRID_SIZE }, () => Math.floor(Math.random() * 4) + 1);
const generateInitialVisibility = () => Array(GRID_SIZE * GRID_SIZE).fill(true);

export default function GridGame() {
  const [numbers, setNumbers] = useState(generateInitialNumbers());
  const [visible, setVisible] = useState(generateInitialVisibility());
  const [backlog, setBacklog] = useState(new Set());
  const [capacity, setCapacity] = useState(0);
  const [moveCount, setMoveCount] = useState(0);

  const resetGame = () => {
    setNumbers(generateInitialNumbers());
    setVisible(generateInitialVisibility());
    setBacklog(new Set());
    setCapacity(0);
    setMoveCount(0);
  };

  const handleBoxClick = (index) => {
    if (!visible[index]) return;

    const newVisible = [...visible];
    newVisible[index] = false;

    const newCapacity = capacity + numbers[index];
    let newBacklog = new Set(backlog);

    if (newCapacity > MAX_CAPACITY) {
      newBacklog.add(index);
    } else {
      setCapacity(newCapacity);
    }

    setVisible(newVisible);
    setBacklog(newBacklog);
    setMoveCount(moveCount + 1);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <h1 className="text-2xl font-bold mb-4">4x4 Grid Game</h1>
      <div className="grid grid-cols-4 gap-2 mb-4">
        {numbers.map((num, idx) => (
          <div
            key={idx}
            className={`w-16 h-16 flex items-center justify-center rounded text-white text-lg font-semibold transition-all duration-200 ${
              visible[idx] ? 'bg-blue-500 cursor-pointer' : 'bg-gray-300 cursor-default'
            }`}
            onClick={() => handleBoxClick(idx)}
          >
            {visible[idx] ? num : ''}
          </div>
        ))}
      </div>
      <div className="mb-2">Capacity: {capacity} / {MAX_CAPACITY}</div>
      <div className="mb-2">Backlog: {[...backlog].join(', ') || 'None'}</div>
      <div className="mb-4">Moves: {moveCount}</div>
      <button
        onClick={resetGame}
        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
      >
        Reset Game
      </button>
    </div>
  );
}

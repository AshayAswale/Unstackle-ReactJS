"use client";

import { useState } from "react";
import GameBoard from "./GameBoard";
import Link from 'next/link';

export default function DifficultyPage() {
  const [selected, setSelected] = useState<{ rows: number, cols: number } | null>(null);

  if (selected) {
    return <GameBoard ROWS={selected.rows} COLS={selected.cols} />;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-10 bg-white">
      <h1 className="text-4xl font-black mb-8">Choose Difficulty</h1>
      
      <div className="flex flex-col items-center gap-4">
        <button
          className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded text-xl w-64"
          onClick={() => setSelected({ rows: 4, cols: 4 })}
        >
          Easy (4x4 grid)
        </button>

        <button
          className="bg-yellow-500 hover:bg-yellow-600 text-white px-8 py-4 rounded text-xl w-64"
          onClick={() => setSelected({ rows: 6, cols: 6 })}
        >
          Medium (6x6 grid)
        </button>

        <button
          className="bg-red-500 hover:bg-red-600 text-white px-8 py-4 rounded text-xl w-64"
          onClick={() => setSelected({ rows: 8, cols: 8 })}
        >
          Hard (8x8 grid)
        </button>
      </div>
      
      <hr className="border-t-4 border-black w-full max-w-md mb-8" />

      <Link href="./tutorial">
        <button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded text-lg">
          How to Play
        </button>
      </Link>
    </div>
  );
}

// src/app/page.tsx
"use client";

import GameBoard from "../../components/GameBoard";

export default function Home() {
  return (
    <main className="min-h-screen bg-white flex items-center justify-center">
      <GameBoard />
    </main>
  );
}

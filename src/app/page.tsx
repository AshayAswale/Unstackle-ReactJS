// src/app/page.tsx
"use client";

import DifficultyPage from "../../components/DifficultyPage";

export default function Home() {
  return (
    <main className="min-h-screen bg-white flex items-center justify-center">
      <DifficultyPage />
    </main>
  );
}

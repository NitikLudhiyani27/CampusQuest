import { CityBackdrop } from "../auth/Hud.jsx";

export default function DesktopGate() {
  return (
    <main className="relative grid min-h-dvh place-items-center overflow-hidden bg-ink px-6 text-center text-white">
      <CityBackdrop />
      <div className="relative">
        <svg viewBox="0 0 64 56" width="64" height="56" className="mx-auto" aria-hidden="true">
          <path d="M22 4 2 52h14l6-14h12L22 4Z" fill="#c9cdf5" />
          <path d="M36 22 62 52H42L30 34l6-12Z" fill="#ff3b3b" />
        </svg>
        <h1 className="mt-6 font-display text-2xl font-black tracking-[0.16em]">
          CAMPUS<span className="text-red">QUEST</span>
        </h1>
        <p className="mt-6 font-display text-sm uppercase tracking-[0.28em]">Open on mobile</p>
      </div>
    </main>
  );
}
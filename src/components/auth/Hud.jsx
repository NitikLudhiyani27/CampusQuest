// Shared HUD pieces used by both screens.

/** Chamfered box with a 1px border. `border` is any CSS background (color or gradient). */
export function HudBox({ border = "#1c2a44", cut = 14, className = "", innerClass = "bg-panel", children }) {
  return (
    <div className="chamfer p-px" style={{ "--c": `${cut}px`, background: border }}>
      <div className={`chamfer ${innerClass} ${className}`} style={{ "--c": `${cut - 1}px` }}>
        {children}
      </div>
    </div>
  );
}

export function CityBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(#1c2a44_1px,transparent_1px),linear-gradient(90deg,#1c2a44_1px,transparent_1px)] [background-size:36px_36px] [mask-image:linear-gradient(to_bottom,black,transparent_70%)]" />
      <div className="absolute left-[38%] top-[8%] h-[38%] w-px bg-gradient-to-t from-red to-transparent shadow-[0_0_24px_6px_rgba(255,59,59,0.55)]" />
      <div className="absolute left-[72%] top-[24%] h-[24%] w-px bg-gradient-to-t from-blue to-transparent shadow-[0_0_20px_5px_rgba(47,123,255,0.55)]" />
      <div className="absolute left-[12%] top-[34%] h-[10%] w-px bg-gradient-to-t from-red/70 to-transparent shadow-[0_0_14px_3px_rgba(255,59,59,0.4)]" />
      <div className="absolute -left-10 top-[30%] h-64 w-64 rounded-full bg-red/20 blur-3xl" />
      <div className="absolute -right-10 top-[36%] h-64 w-64 rounded-full bg-blue/20 blur-3xl" />
      <div className="absolute inset-x-0 bottom-0 h-[60%] bg-gradient-to-t from-ink via-ink/90 to-transparent" />
    </div>
  );
}

export const Label = ({ className = "", ...p }) => (
  <p className={`font-display uppercase tracking-[0.28em] ${className}`} {...p} />
);
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";
import AmityMap from "../map/AmityMap.jsx";

/* ---------- theme + mock data (replace with Firestore data) ---------- */
const RED = "#ff3b3b";
const BLUE = "#2f7bff";
const PURPLE = "#a45bff";

const EVENT_END = Date.now() + (6 * 3600 + 24 * 60 + 17) * 1000;
const SCORE = { red: 2340, blue: 1870 };

const PORTALS = [
    { name: "Central Sculpture", lvl: 3, owner: "red", dist: "120 m", img: "" },
    { name: "Library Entrance", lvl: 4, owner: "blue", dist: "250 m", img: "" },
    { name: "Cafeteria", lvl: 2, owner: "neutral", dist: "320 m", img: "" },
    { name: "Science Block", lvl: 3, owner: "red", dist: "410 m", img: "" },
];
const MISSIONS = [
    { title: "Capture a Portal", sub: "Capture any portal on campus.", done: 0, total: 1, xp: 100 },
    { title: "Deploy 3 Resonators", sub: "Deploy on any owned portal.", done: 1, total: 3, xp: 150 },
];
const STATS = [["Portals Captured", "32"], ["Links Created", "14"], ["Missions Done", "8"], ["Global Rank", "#18"]];
const PHASES = [
    ["Phase 1", "MVP", "done"], ["Phase 2", "Portals", "done"], ["Phase 3", "Territory", "current"],
    ["Phase 4", "Expansion", "locked"], ["Phase 5", "Finale", "locked"],
];
const BOARD = {
    red: [["R1v3n", 24, 430], ["arkn0va", 21, 380], ["z3phir", 18, 310]],
    blue: [["NOVA_482", 25, 420], ["snowlite", 20, 360], ["cyanide", 18, 320]],
};
const YOU = { red: [12, 12, 120], blue: [18, 12, 90] };

const ownerMeta = {
    red: { label: "Red Control", color: RED },
    blue: { label: "Blue Control", color: BLUE },
    neutral: { label: "Neutral", color: "#8a8fa0" },
};

/* ---------- icons ---------- */
const stroke = { fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round" };
const ICONS = {
    map: <path d="m3 11 9-8 9 8v10h-6v-6H9v6H3Z" />,
    intel: <path d="M6 20V10M12 20V4M18 20v-7" />,
    scan: <path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3M9 12h6" />,
    social: <path d="M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm-6 9c0-3.5 2.5-5 6-5s6 1.5 6 5M17 11a3 3 0 1 0-1-5.8M21 20c0-2.5-1.5-4-4-4.5" />,
    user: <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 9c0-4 3-6 7-6s7 2 7 6" />,
    mail: <path d="M3 6h18v12H3zM3 7l9 6 9-6" />,
    chevron: <path d="m9 5 7 7-7 7" />,
    check: <path d="m5 12 5 5 9-10" />,
    lock: <path d="M6 11h12v9H6zM8 11V8a4 4 0 0 1 8 0v3" />,
    flag: <path d="M5 21V4m0 0h11l-2 4 2 4H5" />,
    link: <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" />,
    nodes: <><circle cx="12" cy="5" r="2" /><circle cx="5" cy="18" r="2" /><circle cx="19" cy="18" r="2" /><path d="m11 7-5 9m7-9 5 9M7 18h10" /></>,
    bag: <path d="M6 8h12l1 12H5L6 8Zm3 0V6a3 3 0 0 1 6 0v2" />,
    clip: <path d="M9 4h6v3H9zM7 5H5v16h14V5h-2M9 12h6M9 16h6" />,
    tower: <path d="m12 3 5 18H7l5-18Zm-3 12h6" />,
    shield: <path d="M12 3 4 7v6c0 4 3.5 6.5 8 8 4.5-1.5 8-4 8-8V7l-8-4Z" />,
    target: <><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="3" /></>,
    bars: <path d="M5 20V9h4v11M10 20V4h4v16M15 20v-8h4v8" />,
    pin: <path d="M12 21s-6-5.6-6-10a6 6 0 1 1 12 0c0 4.4-6 10-6 10Zm0-8a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />,
};
const Icon = ({ name, size = 20, className = "", style }) => (
    <svg viewBox="0 0 24 24" width={size} height={size} {...stroke} className={className} style={style} aria-hidden="true">{ICONS[name]}</svg>
);

/* ---------- helpers ---------- */
function useCountdown(endMs) {
    const calc = () => Math.max(0, Math.floor((endMs - Date.now()) / 1000));
    const [s, setS] = useState(calc);
    useEffect(() => {
        const id = setInterval(() => setS(calc()), 1000);
        return () => clearInterval(id);
    }, [endMs]); // eslint-disable-line react-hooks/exhaustive-deps
    const p = (n) => String(n).padStart(2, "0");
    return [p(Math.floor(s / 3600)), p(Math.floor((s % 3600) / 60)), p(s % 60)];
}

const Panel = ({ children, className = "" }) => (
    <section className={`rounded-xl border border-white/10 bg-white/[0.03] p-3 ${className}`}>{children}</section>
);

function SectionTitle({ icon, children, action, accent = RED }) {
    return (
        <div className="mb-3 flex items-center justify-between">
            <h3 className="flex items-center gap-2 font-display text-[13px] font-bold uppercase tracking-wide">
                <Icon name={icon} size={18} style={{ color: accent }} />
                {children}
            </h3>
            {action && (
                <button className="flex items-center gap-1 text-xs" style={{ color: BLUE }}>
                    {action} <Icon name="chevron" size={12} />
                </button>
            )}
        </div>
    );
}

/* ---------- faction score bar ---------- */
function ScoreBar() {
    const [h, m, s] = useCountdown(EVENT_END);
    const total = SCORE.red + SCORE.blue;
    const rp = Math.round((SCORE.red / total) * 100);
    const Unit = ({ v, l }) => (
        <div className="text-center">
            <div className="font-display text-xl font-bold leading-none">{v}</div>
            <div className="mt-1 text-[9px] uppercase text-mute">{l}</div>
        </div>
    );
    return (
        <div className="absolute w-[calc(100%-1rem)] z-2 mx-2 mt-3 rounded-xl border border-white/10 bg-gradient-to-r from-[#2a0a10] via-[#0b0d16] to-[#0a1a3a] p-3">
            <div className="flex items-center justify-between">
                <div>
                    <p className="font-display text-[11px] font-bold tracking-wider" style={{ color: RED }}>RED</p>
                    <p className="font-display text-2xl font-black">{SCORE.red.toLocaleString()}</p>
                </div>
                <div className="text-center">
                    <p className="text-[10px] uppercase text-mute">Event ends in</p>
                    <div className="mt-1 flex items-start gap-1.5">
                        <Unit v={h} l="Hrs" /><span className="font-display text-xl">:</span><Unit v={m} l="Mins" /><span className="font-display text-xl">:</span><Unit v={s} l="Secs" />
                    </div>
                </div>
                <div className="text-right">
                    <p className="font-display text-[11px] font-bold tracking-wider" style={{ color: BLUE }}>BLUE</p>
                    <p className="font-display text-2xl font-black">{SCORE.blue.toLocaleString()}</p>
                </div>
            </div>
            <div className="mt-2 flex items-center gap-2 text-xs">
                <span style={{ color: RED }}>{rp}%</span>
                <div className="flex h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
                    <div style={{ width: `${rp}%`, background: RED }} /><div className="flex-1" style={{ background: BLUE }} />
                </div>
                <span style={{ color: BLUE }}>{100 - rp}%</span>
            </div>
        </div>
    );
}

/* ---------- MAP view ---------- */
function CurrentPortal() {
    return (
        <button className="absolute inset-x-2 bottom-2 flex items-center gap-3 rounded-xl border border-white/10 bg-[#0b0d16]/90 p-2 text-left backdrop-blur">
            <span className="h-12 w-14 rounded-md bg-gradient-to-br from-[#3a3f55] to-[#14161f]" />
            <span className="flex-1">
                <span className="block text-sm font-semibold">Central Plaza</span>
                <span className="flex items-center gap-1.5 text-xs" style={{ color: RED }}>
                    <span className="h-2 w-2 rounded-full" style={{ background: RED }} /> Red Control <span className="text-mute">+20/min</span>
                </span>
            </span>
            <Icon name="chevron" size={16} className="text-mute" />
        </button>
    );
}

function ActionRow() {
    const acts = [
        ["CAPTURE", "flag", RED], ["LINK", "nodes", BLUE], ["INVENTORY", "bag", PURPLE], ["MISSIONS", "clip", "#9aa0b4"],
    ];
    return (
        <div className="mx-4 mt-3 grid grid-cols-4 gap-2">
            {acts.map(([l, i, c]) => (
                <button key={l} className="flex h-[76px] flex-col items-center justify-center gap-2 rounded-xl border bg-white/[0.03] text-[11px] font-semibold active:brightness-125" style={{ borderColor: c, color: "#fff", boxShadow: `inset 0 0 14px ${c}22` }}>
                    <Icon name={i} size={26} className="" style={{ color: c }} />{l}
                </button>
            ))}
        </div>
    );
}

function NearbyPortals() {
    return (
        <Panel className="mx-4 mt-4">
            <SectionTitle icon="bars" action="View All">Nearby Portals</SectionTitle>
            <div className="-mx-1 flex snap-x gap-2.5 overflow-x-auto px-1 pb-1">
                {PORTALS.map((p, i) => {
                    const o = ownerMeta[p.owner];
                    return (
                        <article key={p.name} className="w-[128px] shrink-0 snap-start overflow-hidden rounded-xl border bg-[#0b0d16]" style={{ borderColor: i === 0 ? o.color : "rgba(255,255,255,.1)" }}>
                            <div className="h-[72px] bg-gradient-to-br from-[#3a3f55] to-[#14161f]">
                                {p.img && <img src={p.img} alt="" className="h-full w-full object-cover" />}
                            </div>
                            <div className="p-2">
                                <p className="truncate text-[13px] font-semibold">{p.name}</p>
                                <p className="text-[11px] text-mute">Lvl {p.lvl}</p>
                                <p className="mt-1 flex items-center gap-1 text-[11px]" style={{ color: o.color }}>
                                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: o.color }} />{o.label}
                                </p>
                                <p className="mt-1.5 flex items-center justify-between text-[11px] text-mute">{p.dist}<Icon name="chevron" size={12} /></p>
                            </div>
                        </article>
                    );
                })}
            </div>
        </Panel>
    );
}

function Missions() {
    return (
        <Panel className="mx-4 mt-3">
            <SectionTitle icon="bars" action="View All">Active Missions</SectionTitle>
            <div className="space-y-2">
                {MISSIONS.map((m) => (
                    <div key={m.title} className="flex items-center gap-3 rounded-lg border border-white/10 bg-[#0b0d16] p-2.5">
                        <span className="grid h-10 w-10 place-items-center rounded-lg" style={{ background: "#3a0f16", color: RED }}><Icon name="shield" /></span>
                        <span className="flex-1">
                            <span className="block text-sm font-semibold">{m.title}</span>
                            <span className="block text-xs text-mute">{m.sub}</span>
                        </span>
                        <span className="text-right text-xs">
                            <span className="block text-mute">{m.done}/{m.total}</span>
                            <span className="font-semibold" style={{ color: "#ffb020" }}>+{m.xp} XP</span>
                        </span>
                    </div>
                ))}
            </div>
        </Panel>
    );
}

/* ---------- PROFILE view ---------- */
function PlayerCard({ username, accent }) {
    const xp = 2840, next = 3000;
    return (
        <>
            <div className="flex items-center gap-4 p-4">
                <Avatar name={username} size={72} ring={accent} />
                <div className="flex-1">
                    <p className="flex items-center justify-between font-display text-xl font-bold">{username}<Icon name="chevron" size={18} className="text-mute" /></p>
                    <p className="text-sm text-mute">Lvl 12</p>
                    <div className="mt-2 flex items-center gap-3">
                        <div className="h-1.5 flex-1 rounded-full bg-white/10"><div className="h-full rounded-full" style={{ width: `${(xp / next) * 100}%`, background: BLUE }} /></div>
                        <span className="text-xs text-mute">{xp.toLocaleString()} / {next.toLocaleString()} XP</span>
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-4 gap-2 px-3 pb-3">
                {STATS.map(([l, v]) => (
                    <div key={l} className="rounded-lg border border-white/10 bg-[#0b0d16] px-1 py-2 text-center">
                        <p className="text-[10px] leading-3 text-mute">{l}</p>
                        <p className="mt-1 font-display text-xl font-bold">{v}</p>
                    </div>
                ))}
            </div>
        </>
    );
}

function QuickActions({ accent }) {
    const a = [["Capture", "flag"], ["Deploy", "tower"], ["Create Link", "link"], ["Inventory", "bag"]];
    return (
        <Panel className="mx-3 mt-3">
            <SectionTitle icon="target" accent={accent}>Quick Actions</SectionTitle>
            <div className="grid grid-cols-4 gap-2">
                {a.map(([l, i], idx) => (
                    <button key={l} className="flex h-16 flex-col items-center justify-center gap-1.5 rounded-lg border bg-[#0b0d16] text-[11px]" style={{ borderColor: idx === 0 ? accent : "rgba(255,255,255,.1)", color: idx === 1 || idx === 2 ? BLUE : "#fff" }}>
                        <Icon name={i} size={22} className={idx === 0 ? "" : ""} />{l}
                    </button>
                ))}
            </div>
        </Panel>
    );
}

function EventProgress({ accent }) {
    const [h, m, s] = useCountdown(EVENT_END);
    return (
        <Panel className="mx-3 mt-3">
            <SectionTitle icon="target" action="View Details" accent={accent}>Event Progress</SectionTitle>
            <div className="relative">
                <div className="absolute left-[10%] right-[10%] top-[13px] h-0.5 bg-white/15" />
                <div className="absolute left-[10%] top-[13px] h-0.5" style={{ width: "40%", background: BLUE }} />
                <ol className="relative grid grid-cols-5">
                    {PHASES.map(([n, sub, st]) => (
                        <li key={n} className="flex flex-col items-center text-center">
                            <span className="grid h-7 w-7 place-items-center rounded-full border-2 bg-[#0b0d16]"
                                style={{ borderColor: st === "done" ? BLUE : st === "current" ? RED : "#3a3e4d", color: st === "done" ? BLUE : st === "current" ? RED : "#6b7080", boxShadow: st === "current" ? `0 0 10px ${RED}` : "none" }}>
                                <Icon name={st === "locked" ? "lock" : st === "done" ? "check" : "target"} size={13} />
                            </span>
                            <span className="mt-1.5 text-[10px]" style={{ color: st === "current" ? RED : "#fff" }}>{n}</span>
                            <span className="text-[9px]" style={{ color: st === "current" ? RED : "#8a8fa0" }}>{sub}</span>
                        </li>
                    ))}
                </ol>
            </div>
            <div className="mt-3 flex items-center justify-between rounded-lg border p-3" style={{ borderColor: RED, background: "#2a0a10" }}>
                <div>
                    <p className="text-sm font-semibold">Phase 3 – Strategic Layer</p>
                    <p className="text-[11px] text-mute">Control key locations and build your network.</p>
                </div>
                <div className="text-right">
                    <p className="font-display text-lg font-bold" style={{ color: RED }}>{h}:{m}:{s}</p>
                    <p className="text-[10px] text-mute">Time Remaining</p>
                </div>
            </div>
        </Panel>
    );
}

function Leaderboard() {
    const col = (key, color, title) => (
        <div className="flex-1 overflow-hidden rounded-lg border" style={{ borderColor: `${color}66`, background: `${color}10` }}>
            <p className="px-3 py-2 font-display text-[13px] font-bold tracking-wide" style={{ color }}>{title}</p>
            {BOARD[key].map(([n, lv, pts], i) => (
                <div key={n} className="flex items-center gap-2 px-3 py-1.5 text-xs">
                    <span className="w-3">{i + 1}</span><Avatar name={n} size={24} />
                    <span className="flex-1 truncate">{n}</span><span className="text-mute">Lvl {lv}</span><span className="w-7 text-right font-semibold">{pts}</span>
                </div>
            ))}
            <div className="flex items-center gap-2 border-t px-3 py-2 text-xs" style={{ borderColor: color, background: `${color}25` }}>
                <span className="w-3">{YOU[key][0]}</span><Avatar name="you" size={24} />
                <span className="flex-1 font-semibold" style={{ color }}>you</span><span className="text-mute">Lvl {YOU[key][1]}</span><span className="w-7 text-right font-semibold">{YOU[key][2]}</span>
            </div>
        </div>
    );
    return (
        <Panel className="mx-3 mt-3">
            <SectionTitle icon="bars" action="View Full">Faction Leaderboard</SectionTitle>
            <div className="flex gap-2">{col("red", RED, "RED TEAM")}{col("blue", BLUE, "BLUE TEAM")}</div>
        </Panel>
    );
}

function ProfileView({ username, accent }) {
    const [tab, setTab] = useState("player");
    const tabs = [["player", "Player", "user"], ["faction", "Faction", "shield"], ["event", "Event", "clip"]];
    return (
        <div className="mx-4 mt-3 overflow-hidden rounded-xl border border-white/10 bg-[#090b12]">
            <div role="tablist" className="grid grid-cols-3 border-b border-white/10">
                {tabs.map(([id, l, i]) => (
                    <button key={id} role="tab" aria-selected={tab === id} onClick={() => setTab(id)}
                        className="flex items-center justify-center gap-2 border-b-2 py-3 text-sm"
                        style={{ borderColor: tab === id ? accent : "transparent", color: tab === id ? "#fff" : "#8a8fa0", background: tab === id ? `${accent}14` : "transparent" }}>
                        <Icon name={i} size={18} />{l}
                    </button>
                ))}
            </div>
            <div className="pb-3">
                {tab === "player" && (<><PlayerCard username={username} accent={accent} /><QuickActions accent={accent} /><EventProgress accent={accent} /><Leaderboard /></>)}
                {tab === "faction" && <div className="pt-3"><Leaderboard /></div>}
                {tab === "event" && <div className="pt-3"><EventProgress accent={accent} /></div>}
            </div>
        </div>
    );
}

/* ---------- bottom nav ---------- */
function BottomNav({ view, setView, accent }) {
    const item = (id, label, icon) => {
        const on = view === id;
        return (
            <button key={id} onClick={() => ["map", "profile"].includes(id) && setView(id)} aria-current={on ? "page" : undefined}
                className="flex flex-1 flex-col items-center gap-1 py-2 text-[11px]" style={{ color: on ? accent : "#8a8fa0" }}>
                <Icon name={icon} size={24} />{label}
            </button>
        );
    };
    return (
        <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-white/10 bg-[#07080d]/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
            <div className="flex items-end">
                {item("map", "Map", "map")}
                {item("intel", "Intel", "intel")}
                <div className="flex flex-1 justify-center">
                    <button aria-label="Scan" className="-mt-6 grid h-16 w-16 place-items-center rounded-full border-2 bg-[#0b0d16]" style={{ borderColor: accent, color: accent, boxShadow: `0 0 18px ${accent}88` }}>
                        <Icon name="scan" size={30} />
                    </button>
                </div>
                {item("social", "Social", "social")}
                {item("profile", "Profile", "user")}
            </div>
        </nav>
    );
}

/* ---------- screen ---------- */
export default function DashboardScreen() {
    const { user } = useAuth();
    const location = useLocation();
    const [view, setView] = useState("map");

    const team = location.state?.team ?? "red";
    const accent = team === "blue" ? BLUE : RED;
    const username = user?.displayName?.split(" ")[0] ?? "nova_482"; // TODO: load saved username from Firestore

    return (
        <main className="relative min-h-dvh bg-ink pb-28 text-white" style={{ background: "linear-gradient(180deg,#0a0c16,#05060b)" }}>
            <div className="w-screen flex justify-center">
                <ScoreBar />
            </div>

            <div className="h-screen">
                <div className={`relative overflow-hidden border border-white/10 h-[80%] w-screen transition-[height] duration-300 `}>
                    <div className="absolute inset-0"><AmityMap /></div>
                    {view === "map" && <CurrentPortal />}
                </div>
                {view === "map" ? (
                    <>
                        <ActionRow />
                        <NearbyPortals />
                        <Missions />
                    </>
                ) : (
                    <ProfileView username={username} accent={accent} />
                )}
            </div>


            <BottomNav view={view} setView={setView} accent={accent} />
        </main>
    );
}
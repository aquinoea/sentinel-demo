import React, { useEffect, useMemo, useState } from "react";

/**
 * Sentinel Camp Mystic Demo V6
 * ------------------------------------------------------------
 * Direction:
 * - Uses the clean V4 intro layout you liked.
 * - Adds V5-style numbered step circles for clarity.
 * - Keeps colored supporting detail under each step card.
 * - Restores the better right-side event bars.
 * - Includes the full clickable dashboard after the intro.
 *
 * Requirements:
 * 1. Put your map image at: public/camp-mystic-map.png
 * 2. src/index.css should contain only: @import "tailwindcss";
 */

const MAP_IMAGE_SRC = "/camp-mystic-map.png";
const STARTING_MINUTES = 23;
const COUNTDOWN_INTERVAL_MS = 60000;

const INTRO_STEPS = [
  {
    id: "monitor",
    label: "0 / MONITORING",
    title: "Monitoring Active",
    body: "All systems normal. Sentinel is watching the river corridor, cabins, and personnel.",
    metric: "ALL CLEAR",
    metricCaption: "No active risk detected",
    metricTone: "green",
    detailTone: "green",
    detailItems: ["System Armed", "Sensors Online", "No Active Incident", "Monitoring River Corridor"],
  },
  {
    id: "alert",
    label: "1 / ALERT",
    title: "Alert Triggered",
    body: "At 2:41 AM, Sentinel detects multiple signals at once: flash flood warning, rising water, and rainfall intensity.",
    metric: "RED",
    metricCaption: "Flash flood risk detected",
    metricTone: "red",
    detailTone: "red",
    detailItems: ["River rising rapidly", "Rainfall intensity high", "Flood warning active", "Escalation triggered"],
  },
  {
    id: "notify",
    label: "2 / NOTIFY",
    title: "Director Notified",
    body: "The director and critical roles receive the incident alert immediately. The system tracks acknowledgment.",
    metric: "25 MIN",
    metricCaption: "Estimated action window",
    metricTone: "cyan",
    detailTone: "cyan",
    detailItems: ["SMS delivered", "Director acknowledged", "Counselors pending", "Transport not responding"],
  },
  {
    id: "decide",
    label: "3 / DECIDE",
    title: "Evacuation Decision",
    body: "Evacuate low-lying cabins first. Move children toward higher ground.",
    metric: "COUNTDOWN",
    metricCaption: "Delay increases risk",
    metricTone: "cyan",
    detailTone: "yellow",
    detailItems: ["Low cabins prioritized", "Move toward rally point", "Bridge risk under watch", "Delay increases risk"],
  },
  {
    id: "command",
    label: "4 / COMMAND",
    title: "Command Center Ready",
    body: "Full operational visibility: children accounted for, alerts, decisions, and escalation tracking.",
    metric: "57 UNACCOUNTED",
    metricCaption: "127 / 184 children accounted",
    metricTone: "red",
    detailTone: "red",
    detailItems: ["Focus: Cabins 2, 3, 4", "Blocker: Transport", "Safe: Cabin 5", "Next: Assign owners"],
  },
];

const SIGNALS = [
  { label: "River level", normal: "Normal", active: "Rising", activeTone: "red" },
  { label: "Rainfall", normal: "Stable", active: "High", activeTone: "yellow" },
  { label: "Flood warning", normal: "None", active: "Active", activeTone: "red" },
];

const CHILDREN_GROUPS = [
  { id: "cabin-3", group: "Cabin 3 (Creek Edge)", accounted: "20 / 24", status: "Evacuate first", tone: "red" },
  { id: "cabin-4", group: "Cabin 4 (Near Creek)", accounted: "18 / 22", status: "Evacuate first", tone: "red" },
  { id: "cabin-2", group: "Cabin 2 (Low Area)", accounted: "16 / 20", status: "Evacuate first", tone: "red" },
  { id: "cabin-5", group: "Cabin 5 (Elevated)", accounted: "24 / 24", status: "Safe / hold", tone: "green" },
];

const ACKNOWLEDGMENTS = [
  { id: "director", role: "Director", detail: "Incident opened", status: "Acknowledged", time: "2:43 AM", tone: "green" },
  { id: "counselors", role: "Counselors", detail: "11 / 12 responded", status: "Partial", time: "2:45 AM", tone: "yellow" },
  { id: "transport", role: "Transport", detail: "No response after escalation window", status: "No Response", time: "8+ min", tone: "red" },
];

const WORKFLOW_TASKS = [
  { id: "evacuate-low-lying", task: "Evacuate low-lying cabins first", owner: "Cabin Counselors", status: "In Progress", tone: "blue" },
  { id: "parent-sms", task: "Send SMS to parents", owner: "Parent Comms", status: "Ready to Send", tone: "cyan" },
  { id: "authorities", task: "Alert local authorities", owner: "Director", status: "Escalation Recommended", tone: "yellow" },
  { id: "buses", task: "Dispatch buses", owner: "Transport", status: "Blocked: No Response", tone: "red" },
  { id: "rally-point", task: "Confirm rally point safety", owner: "Medical Lead", status: "Pending Confirmation", tone: "yellow" },
];

const TIMELINE_EVENTS = [
  { time: "2:41 AM", event: "Risk elevated to RED", type: "System Alert", tone: "red" },
  { time: "2:42 AM", event: "Director notified", type: "Notification Sent", tone: "cyan" },
  { time: "2:43 AM", event: "Director acknowledged", type: "Acknowledged", tone: "green" },
  { time: "2:45 AM", event: "Counselors partially acknowledged", type: "Partial Response", tone: "yellow" },
  { time: "2:49 AM", event: "Transport no response", type: "Escalation", tone: "red" },
  { time: "2:52 AM", event: "Low-lying cabins prioritized", type: "Workflow Action", tone: "blue" },
  { time: "3:05 AM", event: "Headcount: 127 / 184", type: "Headcount", tone: "purple" },
];

function textTone(tone) {
  const tones = {
    cyan: "text-cyan-300",
    red: "text-red-400",
    green: "text-green-400",
    yellow: "text-yellow-300",
    blue: "text-blue-300",
    purple: "text-purple-300",
    gray: "text-gray-300",
  };
  return tones[tone] ?? tones.gray;
}

function toneClasses(tone) {
  const tones = {
    green: "border-green-400/30 bg-green-500/10 text-green-400",
    yellow: "border-yellow-400/30 bg-yellow-500/10 text-yellow-400",
    red: "border-red-400/30 bg-red-500/10 text-red-400",
    cyan: "border-cyan-400/30 bg-cyan-500/10 text-cyan-400",
    blue: "border-blue-400/30 bg-blue-500/10 text-blue-300",
    purple: "border-purple-400/30 bg-purple-500/10 text-purple-300",
    gray: "border-white/10 bg-white/10 text-gray-300",
  };
  return tones[tone] ?? tones.gray;
}

function detailBoxClasses(tone) {
  const tones = {
    green: "border-green-400/20 bg-green-500/10 text-green-300",
    red: "border-red-400/20 bg-red-500/10 text-red-300",
    cyan: "border-cyan-400/20 bg-cyan-500/10 text-cyan-300",
    yellow: "border-yellow-400/20 bg-yellow-500/10 text-yellow-300",
  };
  return tones[tone] ?? tones.cyan;
}

function Card({ children, className = "" }) {
  return (
    <section className={`rounded-3xl border border-white/10 bg-slate-950/95 p-6 text-white shadow-2xl ${className}`}>
      {children}
    </section>
  );
}

function Button({ children, onClick, active = false, disabled = false, className = "", type = "button" }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`rounded-2xl px-4 py-3 font-semibold transition hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-cyan-300 disabled:cursor-not-allowed disabled:opacity-30 ${
        active ? "bg-cyan-400 text-black" : "bg-white/10 text-white hover:bg-white/15"
      } ${className}`}
    >
      {children}
    </button>
  );
}

function StatusPill({ children, tone = "gray", className = "" }) {
  return (
    <span className={`inline-flex min-h-8 items-center justify-center rounded-full border px-3 py-1 text-center text-sm font-semibold leading-tight ${toneClasses(tone)} ${className}`}>
      {children}
    </span>
  );
}

function StepCircles({ step }) {
  return (
    <div className="mt-7 flex items-center gap-3">
      {INTRO_STEPS.map((item, index) => (
        <div key={item.id} className="flex items-center gap-3">
          <div
            className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition ${
              index <= step ? "bg-cyan-400 text-black" : "bg-white/10 text-gray-400"
            }`}
          >
            {index}
          </div>
          {index < INTRO_STEPS.length - 1 && (
            <div className={`h-px w-9 ${index < step ? "bg-cyan-300" : "bg-white/10"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

function DetailGrid({ items, tone }) {
  return (
    <div className={`mt-5 grid grid-cols-2 gap-3 rounded-2xl border p-4 text-sm ${detailBoxClasses(tone)}`}>
      {items.map((item) => (
        <div key={item}>• {item}</div>
      ))}
    </div>
  );
}

function Radar({ active }) {
  return (
    <div className="flex justify-center mt-8">
      <div className={`relative h-64 w-64 rounded-full border ${active ? "border-red-400/30" : "border-cyan-400/20"}`}>
        <div className="absolute inset-6 border border-white/10 rounded-full" />
        <div className="absolute inset-14 border border-white/10 rounded-full" />
        <div className="absolute inset-24 border border-white/10 rounded-full" />
        <div className={`absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full ${active ? "bg-red-400" : "bg-cyan-300"} animate-pulse`} />
      </div>
    </div>
  );
}

function SignalRows({ step }) {
  const active = step > 0;

  return (
    <div className="mt-8 space-y-2 text-sm">
      {SIGNALS.map((signal) => (
        <div key={signal.label} className="flex justify-between bg-white/5 p-3 rounded-xl">
          <span>{signal.label}</span>
          <span className={active ? textTone(signal.activeTone) : "text-green-400"}>
            {active ? signal.active : signal.normal}
          </span>
        </div>
      ))}
    </div>
  );
}

function EventStack({ step }) {
  return (
    <div className="mt-6 space-y-2 text-sm">
      {step > 0 && (
        <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl text-red-300">
          Alert: River rising + heavy rainfall = high flood risk
        </div>
      )}
      {step > 1 && (
        <div className="bg-cyan-500/10 border border-cyan-500/20 p-3 rounded-xl text-cyan-300">
          SMS: Director acknowledged
        </div>
      )}
      {step > 2 && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 p-3 rounded-xl text-yellow-300">
          Decision: Evacuate low cabins first
        </div>
      )}
      {step > 3 && (
        <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl text-red-300">
          Escalation: Transport not responding
        </div>
      )}
    </div>
  );
}

function CommandFocusPanel({ step }) {
  if (step < 4) return null;

  return (
    <div className="mt-5 rounded-2xl border border-red-400/20 bg-red-500/10 p-4 text-sm">
      <div className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-red-300">Operator Focus</div>
      <div className="space-y-2">
        <div className="flex justify-between gap-4">
          <span className="text-gray-300">Unaccounted</span>
          <span className="font-bold text-red-300">57 children</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-gray-300">Priority</span>
          <span className="font-bold text-yellow-300">Cabins 2, 3, 4</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-gray-300">Blocker</span>
          <span className="font-bold text-red-300">Transport no response</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-gray-300">Known safe</span>
          <span className="font-bold text-green-300">Cabin 5: 24 / 24</span>
        </div>
      </div>
    </div>
  );
}

function ChildrenStatusCard() {
  return (
    <Card>
      <div className="mb-3 flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-cyan-300">Children Status</h2>
        <StatusPill tone="cyan">Priority</StatusPill>
      </div>
      <p className="mb-4 text-sm text-gray-400">Visible by cabin so staff know who is safe, who is moving, and who needs help.</p>
      <div className="space-y-2">
        {CHILDREN_GROUPS.map((childGroup) => (
          <div key={childGroup.id} className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/5 p-3">
            <div>
              <div className="font-semibold">{childGroup.group}</div>
              <div className="text-xs text-gray-400">{childGroup.status}</div>
            </div>
            <StatusPill tone={childGroup.tone}>{childGroup.accounted}</StatusPill>
          </div>
        ))}
      </div>
    </Card>
  );
}

function MapImage({ compact = false }) {
  return (
    <div className={`flex overflow-hidden rounded-3xl border border-white/10 bg-slate-950 ${compact ? "min-h-[520px] items-center justify-center p-3" : "items-center justify-center p-2"}`}>
      <img
        src={MAP_IMAGE_SRC}
        alt="Simulated Camp Mystic flood risk map showing river corridor, low-lying cabins, evacuation route, bridge risk, and higher-ground rally point."
        className={compact ? "max-h-[520px] w-full rounded-2xl object-contain" : "w-full rounded-3xl object-contain"}
      />
    </div>
  );
}

function OverviewScreen({ timeLeft }) {
  return (
    <div className="grid gap-6 lg:grid-cols-[0.75fr_1.75fr]">
      <div className="space-y-6">
        <Card>
          <div className="text-5xl font-bold text-cyan-400 animate-pulse">{timeLeft} min</div>
          <div className="text-gray-400">Time Remaining</div>
          <div className="mt-4 text-xl font-bold">127 / 184</div>
          <div className="text-gray-400">Children Accounted</div>
          <div className="mt-3 text-yellow-400">Decision: Evacuate low-lying cabins first</div>
          <div className="mt-5 space-y-2">
            <div className="rounded-xl bg-white/5 p-3 text-cyan-300">SMS: Director acknowledged</div>
            <div className="rounded-xl bg-white/5 p-3 text-red-300">SMS: Transport not responding</div>
          </div>
        </Card>
        <ChildrenStatusCard />
      </div>
      <Card className="p-0">
        <MapImage compact />
      </Card>
    </div>
  );
}

function MapScreen() {
  return (
    <Card className="p-0">
      <MapImage />
    </Card>
  );
}

function AuditScreen() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <h2 className="text-xl font-bold">Acknowledgments</h2>
        <p className="mb-4 text-gray-400">Who received the signal, when, and who has not responded.</p>
        <div className="space-y-2">
          {ACKNOWLEDGMENTS.map((ack) => (
            <div key={ack.id} className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/5 p-3">
              <div>
                <div className="font-semibold">{ack.role}</div>
                <div className="text-xs text-gray-400">{ack.detail} · {ack.time}</div>
              </div>
              <StatusPill tone={ack.tone}>{ack.status}</StatusPill>
            </div>
          ))}
        </div>
      </Card>
      <ChildrenStatusCard />
    </div>
  );
}

function WorkflowScreen() {
  return (
    <Card>
      <h2 className="text-xl font-bold">Active Workflow</h2>
      <p className="mb-4 text-gray-400">Pending actions and escalation logic.</p>
      <div className="space-y-2">
        {WORKFLOW_TASKS.map((task) => (
          <div key={task.id} className="grid gap-3 rounded-xl border border-white/10 bg-white/5 p-3 md:grid-cols-[1.2fr_0.9fr_0.9fr] md:items-center">
            <div className="font-semibold">{task.task}</div>
            <div className="text-sm text-gray-400">Owner: {task.owner}</div>
            <StatusPill tone={task.tone}>{task.status}</StatusPill>
          </div>
        ))}
      </div>
    </Card>
  );
}

function TimelineScreen() {
  return (
    <Card>
      <h2 className="text-xl font-bold">Audit Timeline</h2>
      <p className="mb-4 text-gray-400">Every alert, acknowledgment, escalation, and headcount update becomes a record.</p>
      <div className="space-y-2">
        {TIMELINE_EVENTS.map(({ time, event, type, tone }) => (
          <div key={`${time}-${event}`} className="grid gap-3 rounded-xl border border-white/10 bg-white/5 p-3 md:grid-cols-[100px_1fr_170px] md:items-center">
            <div className="text-cyan-300">{time}</div>
            <div>{event}</div>
            <StatusPill tone={tone}>{type}</StatusPill>
          </div>
        ))}
      </div>
    </Card>
  );
}

function Intro({ onEnterDashboard, timeLeft, startIncident }) {
  const [step, setStep] = useState(0);
  const current = INTRO_STEPS[step];
  const active = step > 0;
  const rightMetric = current.metric === "COUNTDOWN" ? `${timeLeft} MIN` : current.metric;
  const rightCaption = current.metricCaption;

  const handleNext = () => {
    if (step === 0) startIncident();
    if (step === INTRO_STEPS.length - 1) {
      onEnterDashboard();
      return;
    }
    setStep((prev) => Math.min(prev + 1, INTRO_STEPS.length - 1));
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.12),_transparent_25%),radial-gradient(circle_at_bottom_right,_rgba(239,68,68,0.12),_transparent_25%),linear-gradient(180deg,_#020617,_#000)] p-6 text-white">
      <div className="grid lg:grid-cols-2 gap-6 max-w-7xl mx-auto">
        <div className="border border-white/10 rounded-3xl p-8 flex flex-col justify-between bg-slate-950/80">
          <div>
            <div className="text-xs text-cyan-300 tracking-widest">SENTINEL · CAMP MYSTIC SCENARIO</div>
            <h1 className="text-5xl font-black mt-4 leading-tight">
              If Camp Mystic had Sentinel, this is how the first minutes would look.
            </h1>
            <p className="mt-4 text-gray-400">The warning is not the product. The action is the product.</p>

            <StepCircles step={step} />

            <div className="mt-8 border border-white/10 rounded-2xl p-6 bg-white/5">
              <div className="flex items-center justify-between gap-4">
                <div className="text-cyan-300 text-sm font-semibold">{current.label}</div>
                <StatusPill tone={current.metricTone === "red" ? "red" : current.metricTone === "cyan" ? "cyan" : "green"}>
                  {rightMetric}
                </StatusPill>
              </div>
              <div className="text-3xl font-black mt-4">{current.title}</div>
              <p className="mt-3 text-gray-300 leading-relaxed">{current.body}</p>
              <DetailGrid items={current.detailItems} tone={current.detailTone} />
            </div>

            <div className="mt-6 text-xs text-gray-500">184 children. One river. Minutes matter.</div>
          </div>

          <Button active onClick={handleNext} className="mt-6 w-full">
            {step === 0 ? "Start Incident" : step === INTRO_STEPS.length - 1 ? "View Command Center" : "Next"}
          </Button>
        </div>

        <div className="border border-white/10 rounded-3xl p-8 flex flex-col justify-center bg-slate-950/80">
          <div className="text-right text-sm text-gray-400">Camp Mystic Scenario</div>
          <div className={`text-6xl font-black mt-6 ${textTone(current.metricTone)} ${current.metricTone === "red" ? "animate-pulse" : ""}`}>
            {rightMetric}
          </div>
          <div className="mt-2 text-sm text-gray-400">{rightCaption}</div>

          <Radar active={active} />
          <SignalRows step={step} />
          <EventStack step={step} />
          <CommandFocusPanel step={step} />
        </div>
      </div>
    </main>
  );
}

function Dashboard({ timeLeft, onReplayIntro }) {
  const [tab, setTab] = useState("overview");
  const tabs = ["overview", "map", "audit", "workflow", "timeline"];

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.1),_transparent_25%),radial-gradient(circle_at_bottom_right,_rgba(239,68,68,0.1),_transparent_25%),linear-gradient(180deg,_#020617,_#000)] p-6 text-white">
      <div className="mx-auto max-w-[1500px] space-y-6">
        <Card>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-xs uppercase tracking-[0.35em] text-cyan-300">Sentinel</div>
              <h1 className="mt-2 text-3xl font-bold">Camp Mystic Command Center</h1>
              <p className="mt-2 text-gray-400">Children visible. Actions accountable. Escalations obvious.</p>
            </div>
            <div className="flex gap-3">
              <Button onClick={onReplayIntro}>Replay Intro</Button>
              <StatusPill tone="red" className="min-w-[156px]">RED · Active Incident</StatusPill>
            </div>
          </div>
        </Card>

        <nav className="flex flex-wrap gap-3" aria-label="Command center tabs">
          {tabs.map((item) => (
            <Button key={item} active={tab === item} onClick={() => setTab(item)}>{item[0].toUpperCase() + item.slice(1)}</Button>
          ))}
        </nav>

        {tab === "overview" && <OverviewScreen timeLeft={timeLeft} />}
        {tab === "map" && <MapScreen />}
        {tab === "audit" && <AuditScreen />}
        {tab === "workflow" && <WorkflowScreen />}
        {tab === "timeline" && <TimelineScreen />}
      </div>
    </main>
  );
}

export default function App() {
  const [screen, setScreen] = useState("intro");
  const [incidentStarted, setIncidentStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(STARTING_MINUTES);

  useEffect(() => {
    if (!incidentStarted) return undefined;
    const timer = setInterval(() => setTimeLeft((minutes) => (minutes > 0 ? minutes - 1 : 0)), COUNTDOWN_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [incidentStarted]);

  if (screen === "intro") {
    return (
      <Intro
        timeLeft={timeLeft}
        startIncident={() => setIncidentStarted(true)}
        onEnterDashboard={() => setScreen("dashboard")}
      />
    );
  }

  return <Dashboard timeLeft={timeLeft} onReplayIntro={() => setScreen("intro")} />;
}

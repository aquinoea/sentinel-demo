import React, { useEffect, useState } from "react";

/**
 * Sentinel Camp Mystic Demo V10
 * ------------------------------------------------------------
 * V10 upgrades:
 * - Step 0 radar repositioned with cleaner spacing.
 * - Step 1 strongest signal highlighted.
 * - Step 2 timer/radar gets urgency glow.
 * - Step 3 decision card has stronger authority styling.
 * - Step 4 spacing refined after removing system status.
 * - Overview map made more dominant with better labels and clickable affordance.
 * - Map tab simplified and immersive.
 * - Audit critical gap gets stronger emphasis + expandable names remain.
 * - Workflow blocker strengthened and rows made easier to scan.
 * - Timeline gets a causal-chain feel with dots/line.
 */

const MAP_IMAGE_SRC = "/camp-mystic-map.png";
const STARTING_MINUTES = 25;
const COUNTDOWN_INTERVAL_MS = 60000;

const INTRO_STEPS = [
  {
    id: "monitor",
    label: "0 / MONITORING",
    title: "Monitoring Active",
    body: "All systems normal. Sentinel is watching the river corridor, cabins, and personnel.",
    metric: "ALL CLEAR",
    metricCaption: "No active risk detected",
    metricSubcaption: "System armed • Continuous monitoring active",
    metricTone: "green",
    detailTone: "green",
    detailItems: ["System Armed", "Sensors Online", "No Active Incident", "Monitoring River Corridor"],
  },
  {
    id: "alert",
    label: "1 / ALERT",
    title: "Alert Triggered",
    body: "At 2:41 AM, Sentinel detects multiple signals at once: flash flood warning, rising water, and rainfall intensity.",
    metric: "IMMEDIATE ACTION",
    metricCaption: "Flash flood risk detected",
    metricSubcaption: "Risk elevated automatically from converging signals",
    metricTone: "red",
    detailTone: "red",
    detailItems: ["River rising rapidly", "Rainfall intensity high", "Flood warning active", "Escalation triggered"],
    emphasisItem: "Flood warning active",
  },
  {
    id: "notify",
    label: "2 / NOTIFY",
    title: "Director Notified",
    body: "The director and critical roles receive the incident alert immediately. The system tracks acknowledgment.",
    metric: "COUNTDOWN",
    metricCaption: "Time to act before conditions worsen",
    metricSubcaption: "Latest update appears first in the live feed",
    metricTone: "cyan",
    detailTone: "cyan",
    detailItems: ["SMS delivered", "Director acknowledged", "Counselors pending", "Transport not responding"],
  },
  {
    id: "decide",
    label: "3 / DECIDE",
    title: "Evacuation Decision",
    body: "Sentinel turns the alert into a clear action priority.",
    metric: "COUNTDOWN",
    metricCaption: "Delay increases risk",
    metricSubcaption: "Decision issued while the action window is still open",
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
    metricSubcaption: "Focus the team on the missing, blocked, and highest-risk groups",
    metricTone: "red",
    detailTone: "red",
    detailItems: ["Focus: Cabins 2, 3, 4", "Blocker: Transport", "Safe: Cabin 5", "Next: Assign owners"],
  },
];

const SIGNALS = [
  { icon: "≋", label: "River level", normal: "Normal", active: "Rising", activeTone: "red" },
  { icon: "☔", label: "Rainfall", normal: "Stable", active: "High", activeTone: "yellow" },
  { icon: "⚠", label: "Flood warning", normal: "None", active: "Active", activeTone: "red" },
];

const CHILDREN_GROUPS = [
  {
    id: "cabin-3",
    group: "Cabin 3 (Creek Edge)",
    accounted: "20 / 24",
    missing: 4,
    status: "Evacuate first",
    tone: "red",
    names: ["Ethan Ramirez", "Sofia Martinez", "Lucas Nguyen", "Ava Johnson"],
  },
  {
    id: "cabin-4",
    group: "Cabin 4 (Near Creek)",
    accounted: "18 / 22",
    missing: 4,
    status: "Evacuate first",
    tone: "red",
    names: ["Mia Thompson", "Noah Garcia", "Isabella Chen", "Daniel Brooks"],
  },
  {
    id: "cabin-2",
    group: "Cabin 2 (Low Area)",
    accounted: "16 / 20",
    missing: 4,
    status: "Evacuate first",
    tone: "red",
    names: ["Emma Rodriguez", "Liam Carter", "Olivia Patel", "Mateo Flores"],
  },
  {
    id: "cabin-5",
    group: "Cabin 5 (Elevated)",
    accounted: "24 / 24",
    missing: 0,
    status: "Safe / hold",
    tone: "green",
    names: [],
  },
];

const ACKNOWLEDGMENTS = [
  { id: "transport", role: "Transport", detail: "No response after escalation window", status: "No Response", time: "8+ min", tone: "red" },
  { id: "counselors", role: "Counselors", detail: "11 / 12 responded", status: "Partial", time: "2:45 AM", tone: "yellow" },
  { id: "director", role: "Director", detail: "Incident opened", status: "Acknowledged", time: "2:43 AM", tone: "green" },
];

const WORKFLOW_TASKS = [
  { id: "evacuate-low-lying", icon: "↗", task: "Evacuate low-lying cabins first", owner: "Cabin Counselors", status: "In Progress", tone: "blue", age: "Active now" },
  { id: "parent-sms", icon: "✉", task: "Send SMS to parents", owner: "Parent Comms", status: "Ready to Send", tone: "cyan", age: "Queued" },
  { id: "authorities", icon: "⚠", task: "Alert local authorities", owner: "Director", status: "Escalation Recommended", tone: "yellow", age: "Recommended" },
  { id: "buses", icon: "■", task: "Dispatch buses", owner: "Transport", status: "Blocked: No Response", tone: "red", age: "8+ min stuck" },
  { id: "rally-point", icon: "✓", task: "Confirm rally point safety", owner: "Medical Lead", status: "Pending Confirmation", tone: "yellow", age: "Pending" },
];

const TIMELINE_EVENTS = [
  { time: "3:05 AM", event: "Headcount: 127 / 184", type: "Headcount", tone: "purple", group: "ACTIONS" },
  { time: "2:52 AM", event: "Low-lying cabins prioritized", type: "Workflow Action", tone: "blue", group: "ACTIONS" },
  { time: "2:49 AM", event: "Transport no response", type: "Escalation", tone: "red", group: "CRITICAL" },
  { time: "2:45 AM", event: "Counselors partially acknowledged", type: "Partial Response", tone: "yellow", group: "ACTIONS" },
  { time: "2:43 AM", event: "Director acknowledged", type: "Acknowledged", tone: "green", group: "ACTIONS" },
  { time: "2:42 AM", event: "Director notified", type: "Notification Sent", tone: "cyan", group: "ACTIONS" },
  { time: "2:41 AM", event: "Risk elevated to RED", type: "System Alert", tone: "red", group: "CRITICAL" },
];

const LIVE_EVENTS = [
  { step: 4, time: "2:49 AM", text: "Transport no response", status: "Escalation", tone: "red", icon: "■" },
  { step: 3, time: "2:45 AM", text: "Counselors partially acknowledged", status: "Partial Response", tone: "yellow", icon: "●" },
  { step: 2, time: "2:43 AM", text: "Director acknowledged", status: "Acknowledged", tone: "green", icon: "✓" },
  { step: 2, time: "2:42 AM", text: "Director notified", status: "Notification Sent", tone: "cyan", icon: "▣" },
  { step: 1, time: "2:41 AM", text: "Risk elevated to RED", status: "System Alert", tone: "red", icon: "⚡" },
];

function textTone(tone) {
  return {
    cyan: "text-cyan-300",
    red: "text-red-400",
    green: "text-green-400",
    yellow: "text-yellow-300",
    blue: "text-blue-300",
    purple: "text-purple-300",
    gray: "text-gray-300",
  }[tone] ?? "text-gray-300";
}

function toneClasses(tone) {
  return {
    green: "border-green-400/30 bg-green-500/10 text-green-400",
    yellow: "border-yellow-400/30 bg-yellow-500/10 text-yellow-400",
    red: "border-red-400/30 bg-red-500/10 text-red-400",
    cyan: "border-cyan-400/30 bg-cyan-500/10 text-cyan-400",
    blue: "border-blue-400/30 bg-blue-500/10 text-blue-300",
    purple: "border-purple-400/30 bg-purple-500/10 text-purple-300",
    gray: "border-white/10 bg-white/10 text-gray-300",
  }[tone] ?? "border-white/10 bg-white/10 text-gray-300";
}

function detailBoxClasses(tone) {
  return {
    green: "border-green-400/20 bg-green-500/10 text-green-300",
    red: "border-red-400/20 bg-red-500/10 text-red-300",
    cyan: "border-cyan-400/20 bg-cyan-500/10 text-cyan-300",
    yellow: "border-yellow-400/20 bg-yellow-500/10 text-yellow-300",
  }[tone] ?? "border-cyan-400/20 bg-cyan-500/10 text-cyan-300";
}

function urgencyTone(timeLeft) {
  if (timeLeft <= 10) return "text-orange-300";
  if (timeLeft <= 15) return "text-yellow-300";
  return "text-cyan-300";
}

function urgencyGlow(timeLeft) {
  if (timeLeft <= 10) return "shadow-orange-400/20 border-orange-400/30";
  if (timeLeft <= 15) return "shadow-yellow-400/20 border-yellow-400/30";
  return "shadow-cyan-400/10 border-cyan-400/20";
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
    <div className="flex items-center justify-center gap-3">
      {INTRO_STEPS.map((item, index) => (
        <div key={item.id} className="flex items-center gap-3">
          <div className={`flex h-12 w-12 items-center justify-center rounded-full text-base font-bold transition ${
            index <= step ? "bg-cyan-400 text-black shadow-lg shadow-cyan-400/20" : "bg-white/10 text-gray-400"
          }`}>
            {index}
          </div>
          {index < INTRO_STEPS.length - 1 && (
            <div className={`h-px w-16 ${index < step ? "bg-cyan-300" : "bg-white/15"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

function DetailGrid({ items, tone, emphasisItem }) {
  return (
    <div className={`mt-5 grid grid-cols-2 gap-3 rounded-2xl border p-4 text-sm ${detailBoxClasses(tone)}`}>
      {items.map((item) => {
        const emphasized = item === emphasisItem;
        return (
          <div key={item} className={emphasized ? "rounded-full border border-red-300/30 bg-red-400/10 px-3 py-1 font-bold text-red-200" : "px-1 py-1"}>
            • {item}
          </div>
        );
      })}
    </div>
  );
}

function DecisionCallout() {
  return (
    <div className="mt-6 rounded-2xl border border-yellow-400/50 bg-yellow-500/10 p-6 shadow-2xl shadow-yellow-500/10 ring-1 ring-yellow-300/10">
      <div className="mb-3 text-sm font-black uppercase tracking-[0.25em] text-yellow-300">
        ⚠ Decision Issued — 2:44 AM
      </div>
      <div className="text-4xl font-black leading-tight text-yellow-300 drop-shadow-[0_0_12px_rgba(250,204,21,0.18)]">
        Evacuate Cabins 2, 3, 4 immediately
      </div>
      <p className="mt-4 text-lg text-gray-100">
        Move children to higher ground using the marked route.
      </p>
    </div>
  );
}

function Radar({ active, large = false, urgent = false }) {
  return (
    <div className="flex items-center justify-center">
      <div className={`relative ${large ? "h-72 w-72" : "h-56 w-56"} rounded-full border ${active ? "border-red-400/30" : "border-cyan-400/20"} ${urgent ? "shadow-2xl shadow-red-500/10" : ""}`}>
        <div className="absolute inset-8 rounded-full border border-white/10" />
        <div className="absolute inset-20 rounded-full border border-white/10" />
        <div className="absolute inset-32 rounded-full border border-white/10" />
        <div className={`absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full ${active ? "bg-red-400" : "bg-cyan-300"} animate-pulse`} />
      </div>
    </div>
  );
}

function SignalRows({ step }) {
  const active = step > 0;

  return (
    <div className="space-y-3 text-sm">
      {SIGNALS.map((signal) => (
        <div key={signal.label} className="grid grid-cols-[44px_1fr_auto] items-center gap-3 rounded-2xl bg-white/5 p-4">
          <div className={`text-2xl ${active ? textTone(signal.activeTone) : "text-cyan-300"}`}>{signal.icon}</div>
          <span>{signal.label}</span>
          <span className={`font-semibold ${active ? textTone(signal.activeTone) : "text-green-400"}`}>
            {active ? signal.active : signal.normal}
          </span>
        </div>
      ))}
    </div>
  );
}

function LiveIncidentFeed({ step }) {
  const events = LIVE_EVENTS.filter((event) => step >= event.step);
  if (!events.length) return null;

  return (
    <div className="mt-6">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-300">Live Incident Feed</div>
        <StatusPill tone="green" className="min-h-6 px-2 py-0 text-xs">● Live</StatusPill>
      </div>
      <div className="space-y-3 text-sm">
        {events.map((event, index) => (
          <div key={`${event.time}-${event.text}`} className={`grid grid-cols-[30px_80px_1fr_auto] items-center gap-3 rounded-xl border p-3 ${toneClasses(event.tone)} ${index > 1 ? "opacity-75" : ""}`}>
            <div className="font-bold">{event.icon}</div>
            <div>{event.time}</div>
            <div>{event.text}</div>
            <div className="hidden font-semibold md:block">{event.status}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function OperatorFocusPanel() {
  return (
    <div className="rounded-2xl border border-red-400/25 bg-red-500/10 p-6">
      <div className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-red-300">
        Operator Focus
      </div>
      <div className="text-4xl font-black leading-tight text-red-300">
        57 children unaccounted
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-4">
        <div>
          <div className="text-xs uppercase tracking-widest text-gray-400">Priority</div>
          <div className="mt-1 font-bold text-yellow-300">Cabins 2, 3, 4</div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-widest text-gray-400">Blocker</div>
          <div className="mt-1 font-bold text-red-300">Transport</div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-widest text-gray-400">Known Safe</div>
          <div className="mt-1 font-bold text-green-300">Cabin 5</div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-widest text-gray-400">Next Action</div>
          <div className="mt-1 font-bold text-cyan-300">Assign owners</div>
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
      <p className="mb-4 text-sm text-gray-400">
        Visible by cabin so staff know who is safe, who is moving, and who needs help.
      </p>
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
    <div className={`group relative flex overflow-hidden rounded-3xl bg-slate-950 ${compact ? "min-h-[590px] items-center justify-center p-1" : "items-center justify-center p-0"}`}>
      {compact && <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-tr from-black/10 via-transparent to-cyan-400/5" />}
      <img
        src={MAP_IMAGE_SRC}
        alt="Simulated Camp Mystic flood risk map showing river corridor, low-lying cabins, evacuation route, bridge risk, and higher-ground rally point."
        className={compact ? "max-h-[590px] w-full rounded-2xl object-contain transition duration-300 group-hover:scale-[1.01]" : "w-full rounded-3xl object-contain"}
      />
    </div>
  );
}

function OverviewScreen({ timeLeft, onOpenMap }) {
  return (
    <div className="grid gap-6 lg:grid-cols-[0.72fr_1.9fr]">
      <div className="space-y-6">
        <Card>
          <div className="grid gap-4">
            <div className={`rounded-2xl border bg-cyan-500/10 p-4 shadow-lg ${urgencyGlow(timeLeft)}`}>
              <div className={`text-5xl font-bold animate-pulse ${urgencyTone(timeLeft)}`}>
                {timeLeft} min
              </div>
              <div className="text-gray-300">Time remaining</div>
            </div>

            <div className="rounded-2xl border border-red-400/20 bg-red-500/10 p-4">
              <div className="text-3xl font-black text-red-300">57 unaccounted</div>
              <div className="text-gray-300">127 / 184 children accounted</div>
            </div>

            <div className="rounded-2xl border border-yellow-400/20 bg-yellow-500/10 p-4">
              <div className="text-sm font-bold uppercase tracking-[0.2em] text-yellow-300">Decision</div>
              <div className="mt-2 text-xl font-black text-yellow-300">Evacuate Cabins 2, 3, 4</div>
              <div className="mt-1 text-gray-300">Move to higher ground via marked route.</div>
            </div>

            <div className="rounded-xl bg-white/5 p-3 text-cyan-300">SMS: Director acknowledged</div>
            <div className="rounded-xl bg-white/5 p-3 text-red-300">SMS: Transport not responding</div>
          </div>
        </Card>

        <ChildrenStatusCard />
      </div>

      <Card className="p-4">
        <button type="button" onClick={onOpenMap} className="block w-full text-left">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-300">
                Primary Action Surface
              </div>
              <div className="mt-1 text-sm text-gray-400">Recommended route, risk zones, and decision context</div>
            </div>
            <div className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-sm text-cyan-300">Click map to expand</div>
          </div>
          <MapImage compact />
        </button>
      </Card>
    </div>
  );
}

function MapScreen() {
  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-950/95 p-1 shadow-2xl">
      <MapImage />
    </div>
  );
}

function MissingCabinRow({ group }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
      <div className="grid grid-cols-[1fr_auto_auto] items-center gap-3">
        <div>
          <div className="font-semibold">{group.group}</div>
          <div className="text-xs text-gray-400">{group.status}</div>
        </div>
        <StatusPill tone={group.tone}>{group.accounted}</StatusPill>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className={group.missing > 0 ? "font-bold text-red-300 hover:text-red-200" : "font-bold text-green-300"}
          disabled={group.missing === 0}
        >
          {group.missing} missing
        </button>
      </div>

      {open && group.names.length > 0 && (
        <div className="mt-3 rounded-xl border border-red-400/20 bg-red-500/10 p-3 text-sm text-red-100">
          <div className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-red-300">
            Missing roster
          </div>
          <div className="grid gap-1 md:grid-cols-2">
            {group.names.map((name) => <div key={name}>• {name}</div>)}
          </div>
        </div>
      )}
    </div>
  );
}

function AuditScreen() {
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
      <Card>
        <h2 className="text-xl font-bold">Acknowledgments</h2>
        <p className="mb-4 text-gray-400">Who received the signal, when, and who has not responded.</p>

        <div className="mb-4 rounded-2xl border border-red-400/30 bg-red-500/10 p-5 shadow-2xl shadow-red-500/10 ring-1 ring-red-300/10">
          <div className="text-xs font-bold uppercase tracking-[0.25em] text-red-300">Critical Gap</div>
          <div className="mt-2 text-3xl font-black text-red-300">Transport has not responded</div>
          <div className="mt-1 text-sm text-gray-300">No response after escalation window · 8+ min</div>
        </div>

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

      <Card>
        <div className="mb-3 flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-cyan-300">Unaccounted by Cabin</h2>
          <StatusPill tone="red">57 total</StatusPill>
        </div>
        <p className="mb-4 text-sm text-gray-400">
          Cabin-level detail keeps the UI actionable. Click missing counts to view roster detail.
        </p>
        <div className="space-y-2">
          {CHILDREN_GROUPS.map((group) => <MissingCabinRow key={group.id} group={group} />)}
        </div>
      </Card>
    </div>
  );
}

function WorkflowScreen() {
  return (
    <Card>
      <h2 className="text-xl font-bold">Active Workflow</h2>
      <p className="mb-4 text-gray-400">Pending actions and escalation logic.</p>

      <div className="mb-5 rounded-2xl border border-red-400/30 bg-red-500/10 p-5 shadow-2xl shadow-red-500/10 ring-1 ring-red-300/10">
        <div className="text-xs font-bold uppercase tracking-[0.25em] text-red-300">Blocker</div>
        <div className="mt-2 text-3xl font-black text-red-300">Transport — no response</div>
        <div className="mt-1 text-sm text-gray-300">
          Dispatch buses is stuck for 8+ minutes. Escalate or assign backup transport.
        </div>
      </div>

      <div className="space-y-2">
        {WORKFLOW_TASKS.map((task, index) => (
          <div key={task.id} className={`grid gap-3 rounded-xl border border-white/10 p-3 md:grid-cols-[48px_1.2fr_0.8fr_0.7fr_0.9fr] md:items-center ${index % 2 === 0 ? "bg-white/[0.065]" : "bg-white/[0.035]"}`}>
            <div className={textTone(task.tone)}>{task.icon}</div>
            <div className="font-semibold">{task.task}</div>
            <div className="text-sm text-gray-400">Owner: {task.owner}</div>
            <div className="text-sm text-gray-400">{task.age}</div>
            <StatusPill tone={task.tone}>{task.status}</StatusPill>
          </div>
        ))}
      </div>
    </Card>
  );
}

function TimelineList({ events }) {
  return (
    <div className="relative space-y-3 pl-6 before:absolute before:left-2 before:top-2 before:h-[calc(100%-16px)] before:w-px before:bg-white/10">
      {events.map(({ time, event, type, tone }) => (
        <div key={`${time}-${event}`} className="relative grid gap-3 rounded-xl border border-white/10 bg-white/5 p-3 md:grid-cols-[100px_1fr_170px] md:items-center">
          <div className={`absolute -left-[21px] top-1/2 h-3 w-3 -translate-y-1/2 rounded-full ${tone === "red" ? "bg-red-400" : tone === "green" ? "bg-green-400" : tone === "yellow" ? "bg-yellow-300" : "bg-cyan-300"}`} />
          <div className="text-cyan-300">{time}</div>
          <div>{event}</div>
          <StatusPill tone={tone}>{type}</StatusPill>
        </div>
      ))}
    </div>
  );
}

function TimelineScreen() {
  const criticalEvents = TIMELINE_EVENTS.filter((event) => event.group === "CRITICAL");
  const actionEvents = TIMELINE_EVENTS.filter((event) => event.group !== "CRITICAL");

  return (
    <Card>
      <h2 className="text-xl font-bold">Audit Timeline</h2>
      <p className="mb-4 text-gray-400">Newest updates appear first so operators see the latest status immediately.</p>

      <div className="mb-7">
        <div className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-red-300">Critical Events</div>
        <TimelineList events={criticalEvents} />
      </div>

      <div>
        <div className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-cyan-300">Actions & Status</div>
        <TimelineList events={actionEvents} />
      </div>
    </Card>
  );
}

function RightPanel({ step, current, rightMetric, active, timeLeft }) {
  if (current.id === "command") {
    return (
      <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-8">
        <div className="text-right text-lg text-gray-400">Camp Mystic Scenario</div>

        <div className="mt-8 text-6xl font-black text-red-400 animate-pulse">
          57 UNACCOUNTED
        </div>
        <div className="mt-2 text-xl text-gray-300">127 / 184 children accounted</div>
        <p className="mt-2 text-sm text-gray-400">
          Focus the team on the missing, blocked, and highest-risk groups.
        </p>

        <div className="mt-10">
          <OperatorFocusPanel />
        </div>

        <div className="mt-10">
          <LiveIncidentFeed step={step} />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-8">
      <div className="flex min-h-[600px] flex-col justify-between">
        <div>
          <div className="text-right text-lg text-gray-400">Camp Mystic Scenario</div>
          <div className={`mt-8 text-6xl font-black ${current.metric === "COUNTDOWN" ? urgencyTone(timeLeft) : textTone(current.metricTone)} ${current.metricTone === "red" ? "animate-pulse" : ""}`}>
            {rightMetric}
          </div>
          <div className="mt-2 text-xl text-gray-300">{current.metricCaption}</div>
          <div className="mt-1 text-sm text-gray-500">{current.metricSubcaption}</div>
        </div>

        <div className={`mt-5 grid gap-8 ${current.id === "monitor" ? "lg:grid-cols-1" : "lg:grid-cols-[0.9fr_1.1fr] lg:items-center"}`}>
          <div className={current.id === "monitor" ? "-mt-2 mb-4" : ""}>
            <Radar active={active} large={current.id === "monitor"} urgent={current.id === "notify" || current.id === "decide"} />
          </div>
          {current.id !== "monitor" && <SignalRows step={step} />}
        </div>

        {current.id === "monitor" ? <SignalRows step={step} /> : <LiveIncidentFeed step={step} />}
      </div>
    </div>
  );
}

function Intro({ onEnterDashboard, timeLeft, startIncident }) {
  const [step, setStep] = useState(0);
  const current = INTRO_STEPS[step];
  const active = step > 0;
  const isCountdownStep = current.metric === "COUNTDOWN";
  const rightMetric = isCountdownStep ? `${timeLeft} MIN` : current.metric;

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
      <div className="mx-auto max-w-[1600px] rounded-3xl border border-white/10 bg-slate-950/50 p-8 shadow-2xl">
        <header className="text-center">
          <div className="text-sm font-bold uppercase tracking-[0.25em] text-cyan-300">Sentinel · Camp Mystic Scenario</div>
          <h1 className="mx-auto mt-5 max-w-6xl text-5xl font-black leading-tight md:text-6xl">
            Real-time decisions when minutes matter.
          </h1>
          <p className="mt-4 text-2xl text-gray-200">
            If Camp Mystic had Sentinel, this is how the first minutes would look.
          </p>
          <p className="mt-3 text-xl text-gray-400">
            The warning is not the product. The action is the product.
          </p>
        </header>

        <div className="mt-8">
          <StepCircles step={step} />
        </div>

        <div className="mt-8 grid gap-7 lg:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-8">
            <div className="flex min-h-[600px] flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-4">
                  <div className="text-lg font-bold text-cyan-300">{current.label}</div>
                  <StatusPill tone={current.metricTone}>{rightMetric}</StatusPill>
                </div>

                <div className="mt-8 text-4xl font-black">{current.title}</div>
                <p className="mt-5 max-w-2xl text-xl leading-relaxed text-gray-300">{current.body}</p>

                {current.id === "decide" ? (
                  <DecisionCallout />
                ) : (
                  <DetailGrid items={current.detailItems} tone={current.detailTone} emphasisItem={current.emphasisItem} />
                )}
              </div>

              <div>
                <div className="mb-6 text-xl text-gray-400">184 children. One river. Minutes matter.</div>
                <Button active onClick={handleNext} className="w-full py-5 text-2xl">
                  {step === 0 ? "Start Incident" : step === INTRO_STEPS.length - 1 ? "View Command Center" : "Next"}
                </Button>
              </div>
            </div>
          </div>

          <RightPanel step={step} current={current} rightMetric={rightMetric} active={active} timeLeft={timeLeft} />
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
            <Button key={item} active={tab === item} onClick={() => setTab(item)}>
              {item[0].toUpperCase() + item.slice(1)}
            </Button>
          ))}
        </nav>

        {tab === "overview" && <OverviewScreen timeLeft={timeLeft} onOpenMap={() => setTab("map")} />}
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
    const timer = setInterval(() => {
      setTimeLeft((minutes) => (minutes > 0 ? minutes - 1 : 0));
    }, COUNTDOWN_INTERVAL_MS);
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

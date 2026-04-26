import React, { useEffect, useMemo, useState } from "react";

/**
 * Sentinel Camp Mystic Demo V4.1
 * ------------------------------------------------------------
 * Final pitch-demo version.
 * Requirements:
 * 1. Put your map image at: public/camp-mystic-map.png
 * 2. src/index.css should contain: @import "tailwindcss";
 * 3. vite.config.js should include the Tailwind Vite plugin.
 */

const MAP_IMAGE_SRC = "/camp-mystic-map.png";
const STARTING_MINUTES = 34;
const COUNTDOWN_INTERVAL_MS = 5000;
const DRAMATIC_REVEAL_MS = 10000;

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

const STORY_STEPS = [
  {
    label: "1 / Alert",
    title: "Alert Triggered",
    body: "At 2:41 AM, Sentinel detects multiple signals at once: flash flood warning, rising water, and rainfall intensity.",
    metric: "RED",
    caption: "Risk elevated automatically",
    metricTone: "red",
  },
  {
    label: "2 / Notify",
    title: "Director Notified",
    body: "The director and critical roles receive the incident alert immediately. The system tracks whether they acknowledge it.",
    metric: "2:43 AM",
    caption: "Director acknowledged",
    metricTone: "cyan",
  },
  {
    label: "3 / Decide",
    title: "Evacuation Decision",
    body: "Sentinel turns the alert into a decision: evacuate low-lying cabins first and move children toward higher ground.",
    metric: "COUNTDOWN",
    caption: "Time to act",
    metricTone: "cyan",
  },
  {
    label: "4 / Command",
    title: "Open Command Center",
    body: "Now the director can see the full operating picture: children, map, acknowledgments, workflow, and audit trail.",
    metric: "127 / 184",
    caption: "Children accounted",
    metricTone: "red",
  },
];

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

function Card({ children, className = "" }) {
  return (
    <section className={`rounded-3xl border border-white/10 bg-slate-950/95 p-6 text-white shadow-2xl ${className}`}>
      {children}
    </section>
  );
}

function Button({ children, onClick, active = false, type = "button" }) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`rounded-2xl px-4 py-2 font-semibold transition hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-cyan-300 ${
        active ? "bg-cyan-400 text-black" : "bg-white/10 text-white hover:bg-white/15"
      }`}
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
      <p className="mb-4 text-gray-400">
        Every alert, acknowledgment, escalation, and headcount update becomes a record.
      </p>

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

function StoryIntro({ onEnterDashboard, timeLeft, startIncident }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [visibleCards, setVisibleCards] = useState({ sms: false, decision: false, escalation: false });

  const currentStep = useMemo(() => {
    const step = STORY_STEPS[stepIndex];
    if (step.metric === "COUNTDOWN") return { ...step, metric: `${timeLeft} min`, metricTone: "cyan" };
    return step;
  }, [stepIndex, timeLeft]);

  useEffect(() => {
    let timer;

    if (stepIndex === 1 && !visibleCards.sms) {
      timer = setTimeout(() => setVisibleCards((cards) => ({ ...cards, sms: true })), DRAMATIC_REVEAL_MS);
    }

    if (stepIndex === 2 && !visibleCards.decision) {
      timer = setTimeout(() => setVisibleCards((cards) => ({ ...cards, decision: true })), DRAMATIC_REVEAL_MS);
    }

    if (stepIndex === 3 && !visibleCards.escalation) {
      timer = setTimeout(() => setVisibleCards((cards) => ({ ...cards, escalation: true })), DRAMATIC_REVEAL_MS);
    }

    return () => clearTimeout(timer);
  }, [stepIndex, visibleCards]);

  const handleNext = () => {
    if (stepIndex === 0) startIncident();
    setStepIndex((index) => Math.min(index + 1, STORY_STEPS.length - 1));
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.12),_transparent_25%),radial-gradient(circle_at_bottom_right,_rgba(239,68,68,0.16),_transparent_25%),linear-gradient(180deg,_#020617,_#000)] p-6 text-white">
      <div className="mx-auto flex min-h-[calc(100vh-48px)] max-w-6xl items-center">
        <div className="grid w-full gap-6 lg:grid-cols-[1fr_0.85fr]">
          <Card>
            <div className="text-xs uppercase tracking-[0.35em] text-cyan-300">Sentinel · Camp Mystic Scenario</div>

            <h1 className="mt-4 text-4xl font-bold leading-tight">
              If Camp Mystic had Sentinel, this is how the first minutes would look.
            </h1>

            <p className="mt-4 text-lg text-gray-400">The warning is not the product. The action is the product.</p>

            <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-5">
              <div className="text-sm font-semibold text-cyan-300">{currentStep.label}</div>
              <h2 className="mt-2 text-3xl font-bold">{currentStep.title}</h2>
              <p className="mt-3 text-gray-300">{currentStep.body}</p>
            </div>

            <div className="mt-8 flex gap-3">
              {stepIndex < STORY_STEPS.length - 1 ? (
                <Button active onClick={handleNext}>{stepIndex === 0 ? "Start Incident" : "Next"}</Button>
              ) : (
                <Button active onClick={onEnterDashboard}>View Command Center</Button>
              )}
            </div>
          </Card>

          <Card>
            <div className="flex h-full min-h-[420px] flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-4">
                  <StatusPill tone={currentStep.metricTone}>{currentStep.metric}</StatusPill>
                  <div className="text-sm text-gray-400">Camp Mystic Scenario</div>
                </div>

                <div className={`mt-8 text-6xl font-black animate-pulse ${currentStep.metricTone === "red" ? "text-red-400" : "text-cyan-300"}`}>
                  {currentStep.metric}
                </div>

                <div className="mt-2 text-gray-400">{currentStep.caption}</div>
              </div>

              <div className="mt-8 space-y-3">
                {visibleCards.sms && <div className="rounded-2xl border border-cyan-400/20 bg-cyan-500/10 p-4 text-cyan-200">SMS: Director acknowledged</div>}
                {visibleCards.decision && <div className="rounded-2xl border border-yellow-400/20 bg-yellow-500/10 p-4 text-yellow-200">Decision: Evacuate low-lying cabins first</div>}
                {visibleCards.escalation && <div className="rounded-2xl border border-red-400/20 bg-red-500/10 p-4 text-red-200">Escalation: Transport not responding</div>}
              </div>
            </div>
          </Card>
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
  const [timeLeft, setTimeLeft] = useState(STARTING_MINUTES);
  const [incidentStarted, setIncidentStarted] = useState(false);

  useEffect(() => {
    if (!incidentStarted) return undefined;

    const timer = setInterval(() => {
      setTimeLeft((minutes) => (minutes > 0 ? minutes - 1 : 0));
    }, COUNTDOWN_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [incidentStarted]);

  const replayIntro = () => setScreen("intro");

  if (screen === "intro") {
    return (
      <StoryIntro
        timeLeft={timeLeft}
        startIncident={() => setIncidentStarted(true)}
        onEnterDashboard={() => setScreen("dashboard")}
      />
    );
  }

  return <Dashboard timeLeft={timeLeft} onReplayIntro={replayIntro} />;
}

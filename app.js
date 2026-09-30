const tabs = [...document.querySelectorAll(".nav-tab")];
const panels = [...document.querySelectorAll(".tab-panel")];
const pipelineSteps = [...document.querySelectorAll(".pipeline-step")];
const progressBar = document.querySelector("#progress-bar");
const progressLabel = document.querySelector("#progress-label");
const progressTrack = document.querySelector(".progress-track");
const runButton = document.querySelector("#run-optimization");
const runStatus = document.querySelector("#run-status");
const headerMode = document.querySelector("#header-mode");
const activityFeed = document.querySelector("#activity-feed");
const toast = document.querySelector("#toast");
const walkthroughBar = document.querySelector("#walkthrough-bar");
const walkthroughSteps = [
  { tab: "overview", title: "Revenue, at a glance", body: "A single live view of sponsorship revenue, available inventory, active campaigns and fan engagement." },
  { tab: "inventory", title: "Turn open inventory into opportunity", body: "Surface premium placements, audience reach and live value across the venue." },
  { tab: "agents", title: "An autonomous sponsorship workforce", body: "Six specialized agents coordinate inventory, audience, offers, pricing, activation and measurement." },
  { tab: "fan", title: "Make the fan moment count", body: "Deliver a relevant partner offer in the moment, then connect redemption back to real value." },
  { tab: "value", title: "Prove partner impact", body: "Bring impressions, engagement and attributed campaign value together in a single view." },
  { tab: "cloud", title: "Built on Microsoft Cloud", body: "A connected, governed architecture powers real-time insight and event-ready activation." }
];

let currentTab = "overview";
let simulationTimer = null;
let simulationProgress = 0;
let toastTimer = null;
let walkthroughIndex = 0;

function selectTab(tabId) {
  currentTab = tabId;
  tabs.forEach((tab) => {
    const isActive = tab.dataset.tab === tabId;
    tab.classList.toggle("is-active", isActive);
    if (isActive) tab.setAttribute("aria-current", "page");
    else tab.removeAttribute("aria-current");
  });
  panels.forEach((panel) => {
    const isActive = panel.dataset.panel === tabId;
    panel.hidden = !isActive;
    panel.classList.toggle("is-visible", isActive);
  });
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 2700);
}

const runStages = [
  { label: "Inventory Agent", detail: "Scanning 1,284 sellable assets and checking availability." },
  { label: "Audience Agent", detail: "Resolving live attendance signals and audience segments." },
  { label: "Offer Agent", detail: "Designing sponsor concepts for high-intent fan moments." },
  { label: "Pricing Agent", detail: "Running dynamic valuation against live event demand." },
  { label: "Activation Agent", detail: "Deploying approved campaigns to app, screens and POS." },
  { label: "Measurement Agent", detail: "Reconciling impressions, redemptions and sponsor value." }
];

function addActivity(message, index) {
  const entry = document.createElement("div");
  entry.className = "activity-entry";
  const dot = document.createElement("span");
  dot.className = "pulse-dot";
  const copy = document.createElement("span");
  copy.textContent = message;
  const time = document.createElement("span");
  time.className = "activity-time";
  time.textContent = `${String(index + 1).padStart(2, "0")} · LIVE`;
  entry.append(dot, copy, time);
  if (activityFeed.querySelector(".empty-activity")) activityFeed.replaceChildren(entry);
  else activityFeed.prepend(entry);
}

function setAgentActivity(activeIndex) {
  const cards = [...document.querySelectorAll(".agent-card")];
  cards.forEach((card, index) => {
    const active = index === activeIndex;
    card.classList.toggle("is-active", active);
    card.querySelector(".agent-state").textContent = active ? "Working" : index < activeIndex ? "Complete" : "Standby";
  });
  const count = activeIndex < 0 ? 0 : Math.min(activeIndex + 1, cards.length);
  document.querySelector("#active-agents").textContent = `${count}/${cards.length}`;
  document.querySelector(".mode-value").textContent = activeIndex < 0 ? "Standby" : activeIndex >= cards.length ? "Reporting" : "Autonomous";
}

function updateProgress(progress) {
  simulationProgress = Math.min(progress, 100);
  progressLabel.textContent = `${simulationProgress}%`;
  progressBar.style.width = `${simulationProgress}%`;
  progressTrack.setAttribute("aria-valuenow", String(simulationProgress));
}

function finishOptimization() {
  window.clearInterval(simulationTimer);
  simulationTimer = null;
  updateProgress(100);
  runStatus.textContent = "Optimization complete — 12 activations deployed.";
  runButton.disabled = false;
  runButton.querySelector("span").textContent = "Reset Simulation";
  headerMode.textContent = "autonomous";
  pipelineSteps.forEach((step) => {
    step.classList.remove("is-active");
    step.classList.add("is-complete");
  });
  setAgentActivity(6);
  document.querySelector("#metric-revenue").innerHTML = "$3.29<span>M</span>";
  document.querySelector("#metric-inventory").textContent = "$46K";
  document.querySelector("#metric-campaigns").textContent = "44";
  document.querySelector("#metric-upside").textContent = "$190K";
  document.querySelector("#metric-engagement").innerHTML = '84<span class="metric-suffix">/100</span>';
  document.querySelector("#metric-performance").innerHTML = '4.7<span class="metric-suffix">%</span>';
  document.querySelector("#activity-live-label").textContent = "12 activations deployed";
  addActivity("Optimization complete — 12 sponsor activations deployed across 3 channels.", 6);
  showToast("Optimization complete. 12 sponsor activations are live.");
}

function startOptimization() {
  if (simulationTimer) return;
  if (simulationProgress >= 100) {
    simulationProgress = 0;
    updateProgress(0);
    runButton.querySelector("span").textContent = "Run Sponsorship Optimization";
    runStatus.textContent = "Workforce idle — awaiting authorization.";
    headerMode.textContent = "standby";
    pipelineSteps.forEach((step) => step.classList.remove("is-active", "is-complete"));
    setAgentActivity(-1);
    activityFeed.innerHTML = '<div class="empty-activity"><span class="pulse-dot"></span>Agents are standing by for an optimization run.</div>';
    document.querySelector("#activity-live-label").textContent = "Awaiting authorization";
    document.querySelector("#metric-revenue").innerHTML = "$3.10<span>M</span>";
    document.querySelector("#metric-inventory").textContent = "$214K";
    document.querySelector("#metric-campaigns").textContent = "32";
    document.querySelector("#metric-upside").textContent = "$187K";
    document.querySelector("#metric-engagement").innerHTML = '61<span class="metric-suffix">/100</span>';
    document.querySelector("#metric-performance").innerHTML = '1.8<span class="metric-suffix">%</span>';
    showToast("Simulation reset. Agents are standing by.");
    return;
  }

  runButton.disabled = true;
  runButton.querySelector("span").textContent = "Optimizing…";
  headerMode.textContent = "autonomous";
  const started = Date.now();
  runStatus.textContent = `${runStages[0].label} — ${runStages[0].detail}`;
  document.querySelector("#activity-live-label").textContent = "Optimization running";
  setAgentActivity(0);
  addActivity(`${runStages[0].label} started — ${runStages[0].detail}`, 0);
  pipelineSteps[0].classList.add("is-active");

  simulationTimer = window.setInterval(() => {
    const elapsed = Date.now() - started;
    const nextProgress = Math.min(100, Math.floor((elapsed / 6900) * 100));
    const stageIndex = Math.min(runStages.length - 1, Math.floor(nextProgress / (100 / runStages.length)));
    updateProgress(nextProgress);
    pipelineSteps.forEach((step, index) => {
      step.classList.toggle("is-active", index === stageIndex);
      if (index < stageIndex) step.classList.add("is-complete");
    });
    if (stageIndex !== Number(runButton.dataset.stage || 0)) {
      runButton.dataset.stage = String(stageIndex);
      const stage = runStages[stageIndex];
      runStatus.textContent = `${stage.label} — ${stage.detail}`;
      setAgentActivity(stageIndex);
      addActivity(`${stage.label} — ${stage.detail}`, stageIndex);
    }
    if (nextProgress >= 100) {
      delete runButton.dataset.stage;
      finishOptimization();
    }
  }, 130);
}

function setWalkthroughStep(index) {
  walkthroughIndex = Math.max(0, Math.min(index, walkthroughSteps.length - 1));
  const step = walkthroughSteps[walkthroughIndex];
  selectTab(step.tab);
  document.querySelector("#walkthrough-count").textContent = String(walkthroughIndex + 1);
  document.querySelector("#walkthrough-title").textContent = step.title;
  document.querySelector("#walkthrough-body").textContent = step.body;
  document.querySelector("#walkthrough-prev").disabled = walkthroughIndex === 0;
  document.querySelector("#walkthrough-next").innerHTML = walkthroughIndex === walkthroughSteps.length - 1 ? "Finish" : 'Next <span aria-hidden="true">›</span>';
  [...document.querySelectorAll("#walkthrough-progress span")].forEach((bar, indexInSteps) => {
    bar.classList.toggle("is-complete", indexInSteps <= walkthroughIndex);
  });
}

function startWalkthrough() {
  walkthroughBar.hidden = false;
  document.querySelector("#app").classList.add("has-walkthrough");
  setWalkthroughStep(0);
}

function closeWalkthrough() {
  walkthroughBar.hidden = true;
  document.querySelector("#app").classList.remove("has-walkthrough");
}

tabs.forEach((tab) => tab.addEventListener("click", () => selectTab(tab.dataset.tab)));
runButton.addEventListener("click", startOptimization);
document.querySelector("#walkthrough-start").addEventListener("click", startWalkthrough);
document.querySelector("#walkthrough-close").addEventListener("click", closeWalkthrough);
document.querySelector("#walkthrough-prev").addEventListener("click", () => setWalkthroughStep(walkthroughIndex - 1));
document.querySelector("#walkthrough-next").addEventListener("click", () => {
  if (walkthroughIndex === walkthroughSteps.length - 1) closeWalkthrough();
  else setWalkthroughStep(walkthroughIndex + 1);
});
document.querySelector("#inventory-filter").addEventListener("change", (event) => {
  const selectedCategory = event.target.value;
  document.querySelectorAll(".inventory-card").forEach((card) => {
    card.hidden = selectedCategory !== "all" && card.dataset.category !== selectedCategory;
  });
});
document.querySelectorAll(".asset-activate").forEach((button) => button.addEventListener("click", () => {
  button.classList.add("is-activated");
  button.textContent = "✓  Added to activation plan";
  showToast("Placement added to the activation plan.");
}));
document.querySelector("#claim-offer").addEventListener("click", (event) => {
  const button = event.currentTarget;
  button.textContent = "Offer added to your wallet";
  button.disabled = true;
  showToast("Tim Hortons offer claimed and added to your fan wallet.");
});

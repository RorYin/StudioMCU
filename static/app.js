const lessonList = document.getElementById("lesson-list");
const firmwareList = document.getElementById("firmware-list");
const lessonTitle = document.getElementById("lesson-title");
const lessonSummary = document.getElementById("lesson-summary");
const lessonNumber = document.getElementById("lesson-number");
const lessonSteps = document.getElementById("lesson-steps");
const loadLessonButton = document.getElementById("load-lesson");
const hintButton = document.getElementById("hint-btn");
const solutionButton = document.getElementById("solution-btn");
const solutionFlashButton = document.getElementById("solution-flash-btn");
const hintPanel = document.getElementById("hint-panel");
const buildBtn = document.getElementById("build-btn");
const flashBtn = document.getElementById("flash-btn");
const fallbackEditor = document.getElementById("code-editor");
const buildLog = document.getElementById("build-log");
const serialPortSelect = document.getElementById("serial-port");
const connectSerial = document.getElementById("connect-serial");
const disconnectSerial = document.getElementById("disconnect-serial");
const refreshPortsButton = document.getElementById("refresh-ports");
const serialOutput = document.getElementById("serial-output");
const boardStatus = document.getElementById("board-status");
const boardStatusDot = document.getElementById("board-status-dot");
const boardPanelStatus = document.getElementById("board-panel-status");
const refreshBoardStatusButton = document.getElementById("refresh-board-status");
const statusMessage = document.getElementById("status-message");
const fileName = document.getElementById("file-name");
const sidebarTitle = document.getElementById("sidebar-title");
const sidebarSubtitle = document.getElementById("sidebar-subtitle");
const workspace = document.querySelector(".workspace");
const studio = document.querySelector(".studio");
const lessonContent = document.querySelector(".lesson-content");
const lessonsPanel = document.getElementById("lessons-panel");
const firmwarePanel = document.getElementById("firmware-panel");
const boardPanel = document.getElementById("board-panel");
const activityButtons = document.querySelectorAll(".activity-bar .activity-button");
const panelTabs = document.querySelectorAll(".panel-tab");
const outputPanel = document.getElementById("output-panel");
const problemsPanel = document.getElementById("problems-panel");
const serialPanel = document.getElementById("serial-panel");
const problemsLog = problemsPanel.querySelector("pre");

let selectedLesson = null;
let lastBuildResult = null;
let serialPolling = null;
let editor = null;
let viewingReference = false;
let firmwareFiles = [];
let activeSidebar = "lessons";
let lastOpenedFirmware = null;

const SIDEBAR_META = {
  lessons: { title: "EXPLORER", subtitle: "LEARNING PATH" },
  firmware: { title: "EXPLORER", subtitle: "FIRMWARE" },
  board: { title: "EXPLORER", subtitle: "BOARD" },
};

function getCode() {
  return editor ? editor.getValue() : fallbackEditor.value;
}

function setCode(code) {
  if (editor) editor.setValue(code);
  else fallbackEditor.value = code;
}

function setLog(message) {
  buildLog.textContent = message;
}

function setProblems(message) {
  problemsLog.textContent = message;
}

function setEditorReadonly(readonly) {
  fallbackEditor.readOnly = readonly;
  if (editor) editor.updateOptions({ readOnly: readonly });
}

function showSidebarPanel(panel) {
  activeSidebar = panel;
  lessonsPanel.classList.toggle("hidden", panel !== "lessons");
  firmwarePanel.classList.toggle("hidden", panel !== "firmware");
  boardPanel.classList.toggle("hidden", panel !== "board");
  activityButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.panel === panel);
  });
  const meta = SIDEBAR_META[panel] || SIDEBAR_META.lessons;
  sidebarTitle.textContent = meta.title;
  sidebarSubtitle.textContent = meta.subtitle;
  workspace.classList.add("sidebar-open");
}

function showBottomPanel(panel) {
  outputPanel.classList.toggle("active", panel === "output");
  problemsPanel.classList.toggle("active", panel === "problems");
  serialPanel.classList.toggle("active", panel === "serial");
  panelTabs.forEach((button) => {
    button.classList.toggle("active", button.dataset.panel === panel);
  });
}

function makeResizable(handleId, axis, onMove) {
  const handle = document.getElementById(handleId);
  if (!handle) return;

  handle.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    handle.setPointerCapture(event.pointerId);
    document.body.classList.add("is-resizing");
    document.body.classList.add(axis === "x" ? "is-resizing-col" : "is-resizing-row");

    const startX = event.clientX;
    const startY = event.clientY;
    const startSidebar = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--sidebar-width"), 10) || 280;
    const startInstruction = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--instruction-width"), 10) || 260;
    const startBottom = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--bottom-height"), 10) || 200;

    const move = (pointerEvent) => {
      onMove({
        clientX: pointerEvent.clientX,
        clientY: pointerEvent.clientY,
        startX,
        startY,
        startSidebar,
        startInstruction,
        startBottom,
      });
      if (editor) editor.layout();
    };

    const stop = () => {
      handle.removeEventListener("pointermove", move);
      document.body.classList.remove("is-resizing", "is-resizing-col", "is-resizing-row");
    };

    handle.addEventListener("pointermove", move);
    handle.addEventListener("pointerup", stop, { once: true });
    handle.addEventListener("pointercancel", stop, { once: true });
  });
}

function setupResizers() {
  makeResizable("sidebar-resizer", "x", ({ clientX }) => {
    const width = Math.max(180, Math.min(480, clientX - 48));
    document.documentElement.style.setProperty("--sidebar-width", `${width}px`);
  });

  makeResizable("instruction-resizer", "x", ({ clientX }) => {
    const left = lessonContent.getBoundingClientRect().left;
    const width = Math.max(160, Math.min(420, clientX - left));
    document.documentElement.style.setProperty("--instruction-width", `${width}px`);
  });

  makeResizable("bottom-resizer", "y", ({ clientY }) => {
    const bounds = studio.getBoundingClientRect();
    const height = Math.max(120, Math.min(bounds.height - 180, bounds.bottom - clientY));
    document.documentElement.style.setProperty("--bottom-height", `${height}px`);
  });

  window.addEventListener("resize", () => {
    if (editor) editor.layout();
  });
}

function setupMonaco() {
  if (!window.require) return;
  window.MonacoEnvironment = {
    getWorkerUrl: () =>
      `data:text/javascript;charset=utf-8,${encodeURIComponent(
        "self.MonacoEnvironment={baseUrl:'https://cdn.jsdelivr.net/npm/monaco-editor@0.55.1/min/'};importScripts('https://cdn.jsdelivr.net/npm/monaco-editor@0.55.1/min/vs/base/worker/workerMain.js');"
      )}`,
  };
  window.require.config({ paths: { vs: "https://cdn.jsdelivr.net/npm/monaco-editor@0.55.1/min/vs" } });
  window.require(["vs/editor/editor.main"], () => {
    editor = monaco.editor.create(document.getElementById("monaco-editor"), {
      value: fallbackEditor.value,
      language: "c",
      theme: "vs-dark",
      automaticLayout: true,
      minimap: { enabled: false },
      fontSize: 14,
      lineNumbersMinChars: 3,
      padding: { top: 14 },
      scrollBeyondLastLine: false,
      tabSize: 4,
      wordWrap: "off",
      scrollbar: {
        verticalScrollbarSize: 10,
        horizontalScrollbarSize: 10,
      },
    });
    fallbackEditor.hidden = true;
  });
}

async function fetchJson(url, options) {
  const response = await fetch(url, options);
  if (!response.ok) throw new Error(`Request failed (${response.status})`);
  return response.json();
}

async function loadLesson(id) {
  try {
    const lesson = await fetchJson(`/api/lesson/${id}`);
    selectedLesson = lesson;
    viewingReference = false;
    lastBuildResult = null;
    lessonTitle.textContent = lesson.title;
    lessonSummary.textContent = lesson.summary;
    lessonNumber.textContent = `LESSON ${lesson.title.split("·")[0].trim()}`;
    lessonSteps.innerHTML = lesson.steps.map((step) => `<li>${step}</li>`).join("");
    hintPanel.hidden = true;
    setCode(lesson.starter_code);
    setEditorReadonly(false);
    fileName.textContent = `${lesson.id}.c`;
    flashBtn.disabled = true;
    buildBtn.disabled = false;
    solutionFlashButton.disabled = false;
    setLog("Starter code loaded. Complete the mission, then build.");
    lessonList.querySelectorAll("button").forEach((button) => {
      button.classList.toggle("selected", button.dataset.id === id);
    });
    firmwareList.querySelectorAll("button").forEach((button) => button.classList.remove("selected"));
    showSidebarPanel("lessons");
  } catch (error) {
    setLog(`Could not load this lesson. Try again in a moment. (${error.message})`);
  }
}

async function loadFirmwareReference(filePath) {
  try {
    const file = await fetchJson(`/api/firmware/${filePath}`);
    viewingReference = true;
    lastOpenedFirmware = filePath;
    lastBuildResult = null;
    setCode(file.content);
    setEditorReadonly(true);
    fileName.textContent = `firmware/${file.path}`;
    lessonNumber.textContent = "FIRMWARE REFERENCE · READ-ONLY";
    lessonTitle.textContent = file.path;
    lessonSummary.textContent = "Vendor-style CMSIS device files for learning. Switch back to a lesson to edit practice code.";
    lessonSteps.innerHTML = "<li>Browse firmware files in the left explorer.</li><li>Select a lesson to return to editable starter code.</li>";
    hintPanel.hidden = true;
    buildBtn.disabled = true;
    flashBtn.disabled = true;
    solutionFlashButton.disabled = true;
    setLog(`Opened firmware/${file.path} (read-only).`);
    firmwareList.querySelectorAll("button").forEach((button) => {
      button.classList.toggle("selected", button.dataset.path === filePath);
    });
    lessonList.querySelectorAll("button").forEach((button) => button.classList.remove("selected"));
    showSidebarPanel("firmware");
  } catch (error) {
    setLog(`Could not open firmware reference: ${error.message}`);
  }
}

async function openFirmwarePanel() {
  showSidebarPanel("firmware");
  if (lastOpenedFirmware) {
    await loadFirmwareReference(lastOpenedFirmware);
    return;
  }
  if (firmwareFiles.length) {
    await loadFirmwareReference(firmwareFiles[0]);
  }
}

async function openBoardPanel() {
  showSidebarPanel("board");
  await refreshBoardStatus();
}

async function refreshPorts() {
  const ports = await (await fetch("/api/serial/ports")).json();
  serialPortSelect.innerHTML = ports.length
    ? ports.map((port) => `<option value="${port}">${port}</option>`).join("")
    : "<option>No COM ports found</option>";
}

async function refreshBoardStatus() {
  try {
    const status = await (await fetch("/api/board/status")).json();
    boardStatus.textContent = status.message;
    statusMessage.textContent = status.message;
    boardStatusDot.className = `status-dot ${status.connected ? "connected" : "disconnected"}`;
    flashBtn.title = status.connected ? "Flash the latest successful build" : status.message;
    if (boardPanelStatus) {
      boardPanelStatus.innerHTML = `<strong>Link:</strong> ${status.message}`;
    }
  } catch {
    boardStatus.textContent = "Board status unavailable";
    boardStatusDot.className = "status-dot disconnected";
    if (boardPanelStatus) {
      boardPanelStatus.innerHTML = "<strong>Link:</strong> Board status unavailable";
    }
  }
}

async function buildCode(code = getCode(), flashAfter = false) {
  if (viewingReference) {
    setLog("Firmware reference is read-only. Open a lesson before building.");
    return;
  }
  if (!code.trim()) return;
  buildBtn.disabled = true;
  setLog("Building firmware…");
  showBottomPanel("output");
  try {
    const result = await (
      await fetch("/api/build", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      })
    ).json();
    const logMessage = result.log || (result.success ? "Build completed successfully." : JSON.stringify(result, null, 2));
    setLog(logMessage);
    setProblems(result.success ? "No compilation problems detected." : logMessage);
    lastBuildResult = result.success ? result : null;
    flashBtn.disabled = !result.success;
    if (!result.success) showBottomPanel("problems");
    if (result.success && flashAfter) await flashCode(result);
  } catch (error) {
    setLog(`Build request failed: ${error.message}`);
    setProblems(`Build request failed: ${error.message}`);
    showBottomPanel("problems");
  } finally {
    buildBtn.disabled = viewingReference;
  }
}

async function flashCode(result = lastBuildResult) {
  if (!result?.firmware_path) return;
  const status = await (await fetch("/api/board/status")).json();
  if (!status.connected) {
    setLog(status.message);
    await refreshBoardStatus();
    return;
  }
  flashBtn.disabled = true;
  setLog("Flashing firmware to NUCLEO-F446RE…");
  showBottomPanel("output");
  try {
    const response = await (
      await fetch("/api/flash", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firmware_path: result.firmware_path }),
      })
    ).json();
    setLog(response.log || (response.success ? "Flash completed successfully." : "Flash failed."));
  } catch (error) {
    setLog(`Flash request failed: ${error.message}`);
  } finally {
    flashBtn.disabled = !lastBuildResult;
  }
}

async function connectSerialPort() {
  if (!serialPortSelect.value || serialPortSelect.value.startsWith("No COM")) return;
  const result = await (
    await fetch("/api/serial/connect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ port: serialPortSelect.value, baud: 115200 }),
    })
  ).json();
  setLog(result.message);
  showBottomPanel("serial");
  if (!serialPolling) serialPolling = setInterval(readSerialOutput, 800);
}

async function disconnectSerialPort() {
  await fetch("/api/serial/disconnect", { method: "POST" });
  clearInterval(serialPolling);
  serialPolling = null;
  setLog("Serial disconnected.");
}

async function readSerialOutput() {
  const result = await (await fetch("/api/serial/read")).json();
  if (result.output) {
    serialOutput.textContent += result.output;
    serialOutput.scrollTop = serialOutput.scrollHeight;
  }
}

loadLessonButton.addEventListener("click", () => selectedLesson && loadLesson(selectedLesson.id));
hintButton.addEventListener("click", () => {
  if (!selectedLesson || viewingReference) return;
  hintPanel.textContent = selectedLesson.hint;
  hintPanel.hidden = !hintPanel.hidden;
});
solutionButton.addEventListener("click", () => {
  if (!selectedLesson || viewingReference) return;
  setCode(selectedLesson.solution_code);
  setLog("Solution loaded. Build it to inspect the result, or use Build & flash solution.");
});
buildBtn.addEventListener("click", () => buildCode());
flashBtn.addEventListener("click", () => flashCode());
solutionFlashButton.addEventListener("click", () => {
  if (!selectedLesson || viewingReference) return;
  setCode(selectedLesson.solution_code);
  buildCode(selectedLesson.solution_code, true);
});
refreshBoardStatusButton.addEventListener("click", refreshBoardStatus);
refreshPortsButton.addEventListener("click", refreshPorts);
connectSerial.addEventListener("click", connectSerialPort);
disconnectSerial.addEventListener("click", disconnectSerialPort);

activityButtons.forEach((button) => {
  button.addEventListener("click", async () => {
    const panel = button.dataset.panel;
    if (panel === "lessons") {
      showSidebarPanel("lessons");
      if (selectedLesson && viewingReference) {
        await loadLesson(selectedLesson.id);
      }
      return;
    }
    if (panel === "firmware") {
      await openFirmwarePanel();
      return;
    }
    if (panel === "board") {
      await openBoardPanel();
    }
  });
});

panelTabs.forEach((button) => {
  button.addEventListener("click", () => showBottomPanel(button.dataset.panel));
});

(async () => {
  setupMonaco();
  setupResizers();
  showSidebarPanel("lessons");
  showBottomPanel("output");
  try {
    const [lessons, firmware] = await Promise.all([fetchJson("/api/lessons"), fetchJson("/api/firmware")]);
    firmwareFiles = firmware.files || [];
    lessonList.innerHTML = lessons
      .map(
        (lesson) =>
          `<li><button type="button" data-id="${lesson.id}"><span class="lesson-dot">○</span>${lesson.title}</button></li>`
      )
      .join("");
    lessonList.querySelectorAll("button").forEach((button) => {
      button.addEventListener("click", () => loadLesson(button.dataset.id));
    });
    firmwareList.innerHTML = firmwareFiles
      .map(
        (file) =>
          `<li><button type="button" data-path="${file}"><span class="file-icon">C</span>${file}</button></li>`
      )
      .join("");
    firmwareList.querySelectorAll("button").forEach((button) => {
      button.addEventListener("click", () => loadFirmwareReference(button.dataset.path));
    });
    await Promise.all([refreshPorts(), refreshBoardStatus()]);
    if (lessons.length) {
      await loadLesson(lessons[0].id);
    }
  } catch (error) {
    lessonList.innerHTML = '<li class="load-error">Could not reach the app server. Refresh after it starts.</li>';
    setLog(`App startup failed: ${error.message}`);
  }
})();

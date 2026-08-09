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
const modeSimulationBtn = document.getElementById("mode-simulation");
const modeHardwareBtn = document.getElementById("mode-hardware");
const simBadge = document.getElementById("sim-badge");
const simNote = document.getElementById("sim-note");
const boardLd2 = document.getElementById("board-ld2");
const boardButton = document.getElementById("board-button");
const simButtonTap = document.getElementById("sim-button-tap");
const simStopBtn = document.getElementById("sim-stop");
const serialInput = document.getElementById("serial-input");
const serialSendBtn = document.getElementById("serial-send");
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
const clearBuildsButton = document.getElementById("clear-builds");
const clearBuildsStatus = document.getElementById("clear-builds-status");
const statusMessage = document.getElementById("status-message");
const fileName = document.getElementById("file-name");
const navBackButton = document.getElementById("nav-back");
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
let simPolling = null;
let runMode = "simulation";
let editor = null;
let viewingReference = false;
let firmwareFiles = [];
let activeSidebar = "lessons";
let lastOpenedFirmware = null;
let mainModel = null;
let firmwareModelsReady = null;
const symbolIndexCache = new WeakMap();
const WORKSPACE_MAIN_PATH = "main.c";
const navHistory = [];
let suppressNavHistory = false;
let rightAltHeld = false;

const SIDEBAR_META = {
  lessons: { title: "EXPLORER", subtitle: "LEARNING PATH" },
  firmware: { title: "EXPLORER", subtitle: "FIRMWARE" },
  board: { title: "EXPLORER", subtitle: "BOARD" },
};

function getCode() {
  if (mainModel) return mainModel.getValue();
  return editor ? editor.getValue() : fallbackEditor.value;
}

function setCode(code) {
  if (mainModel) {
    mainModel.setValue(code);
    if (editor && editor.getModel() !== mainModel) {
      editor.setModel(mainModel);
      syncEditorChrome(mainModel);
    }
  } else if (editor) {
    editor.setValue(code);
  } else {
    fallbackEditor.value = code;
  }
}

function modelDisplayName(model) {
  if (!model) return WORKSPACE_MAIN_PATH;
  const path = model.uri.path.replace(/^\/+/, "");
  if (model.uri.authority === "firmware" || path.startsWith("firmware/")) {
    return path.startsWith("firmware/") ? path : `firmware/${path}`;
  }
  if (selectedLesson) return `${selectedLesson.id}.c`;
  return WORKSPACE_MAIN_PATH;
}

function isFirmwareModel(model) {
  if (!model) return false;
  return model.uri.authority === "firmware" || model.uri.path.includes("/firmware/");
}

function syncEditorChrome(model = editor?.getModel()) {
  if (!model) return;
  const firmware = isFirmwareModel(model);
  viewingReference = firmware;
  fileName.textContent = modelDisplayName(model);
  setEditorReadonly(firmware);
  buildBtn.disabled = firmware;
  if (firmware) {
    flashBtn.disabled = true;
    solutionFlashButton.disabled = true;
    const relative = model.uri.path.replace(/^\/+/, "");
    lastOpenedFirmware = relative;
    firmwareList.querySelectorAll("button").forEach((button) => {
      button.classList.toggle("selected", button.dataset.path === relative);
    });
  } else {
    solutionFlashButton.disabled = !selectedLesson;
    flashBtn.disabled = !lastBuildResult;
    firmwareList.querySelectorAll("button").forEach((button) => button.classList.remove("selected"));
    if (selectedLesson && /FIRMWARE/i.test(lessonNumber.textContent || "")) {
      lessonNumber.textContent = `LESSON ${selectedLesson.title.split("·")[0].trim()}`;
      lessonTitle.textContent = selectedLesson.title;
      lessonSummary.textContent = selectedLesson.summary;
      lessonSteps.innerHTML = selectedLesson.steps.map((step) => `<li>${step}</li>`).join("");
      hintPanel.hidden = true;
      lessonList.querySelectorAll("button").forEach((button) => {
        button.classList.toggle("selected", button.dataset.id === selectedLesson.id);
      });
      showSidebarPanel("lessons");
    }
  }
  updateNavButtons();
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

function firmwareUri(filePath) {
  return monaco.Uri.parse(`inmemory://firmware/${filePath}`);
}

function workspaceUri() {
  return monaco.Uri.parse(`inmemory://workspace/${WORKSPACE_MAIN_PATH}`);
}

function positionToRange(lineNumber, column, length) {
  return new monaco.Range(lineNumber, column, lineNumber, column + length);
}

function indexModelSymbols(model) {
  const versionId = model.getVersionId();
  const cached = symbolIndexCache.get(model);
  if (cached && cached.versionId === versionId) return cached;

  const text = model.getValue();
  const lines = text.split(/\r?\n/);
  const definitions = [];
  const seen = new Set();

  const pushDefinition = (name, lineNumber, column, kind) => {
    if (!name || !/^[A-Za-z_]/.test(name)) return;
    const key = `${name}@${lineNumber}@${column}`;
    if (seen.has(key)) return;
    seen.add(key);
    definitions.push({
      name,
      kind,
      range: positionToRange(lineNumber, column, name.length),
    });
  };

  const definitionPatterns = [
    { kind: "macro", regex: /^\s*#\s*define\s+([A-Za-z_]\w*)/ },
    { kind: "include", regex: /^\s*#\s*include\s+"([^"]+)"/ },
    {
      kind: "typedef",
      regex: /^\s*typedef\s+(?:struct|enum|union)\s+[A-Za-z_]?\w*\s*\{/,
    },
    {
      kind: "typedef",
      regex: /^\s*typedef\s+[\w\s\*]+\s+([A-Za-z_]\w*)\s*;/,
    },
    {
      kind: "struct",
      regex: /^\s*(?:typedef\s+)?(?:struct|enum|union)\s+([A-Za-z_]\w*)\b/,
    },
    {
      kind: "function",
      regex:
        /^\s*(?:__STATIC_INLINE|static|inline|extern|const|volatile|unsigned|signed|struct|enum|union|HAL_StatusTypeDef|GPIO_PinState|uint\d+_t|int\d+_t|void|int|char|short|long|float|double|bool|_Bool)\b[\w\s\*]*?\b([A-Za-z_]\w*)\s*\(/,
    },
    {
      kind: "variable",
      regex:
        /^\s*(?:static|extern|const|volatile|unsigned|signed)?\s*(?:uint\d+_t|int\d+_t|GPIO_InitTypeDef|char|int|short|long|float|double|bool|_Bool|size_t)\s+\*?([A-Za-z_]\w*)\b/,
    },
  ];

  lines.forEach((line, index) => {
    const lineNumber = index + 1;

    for (const pattern of definitionPatterns) {
      const match = line.match(pattern.regex);
      if (!match) continue;

      if (pattern.kind === "include") {
        pushDefinition(match[1], lineNumber, line.indexOf(match[1]) + 1, "include");
        continue;
      }

      if (pattern.kind === "typedef" && !match[1]) {
        // typedef struct { ... } Name; may close later — scan ahead for "} Name;"
        for (let look = index; look < Math.min(lines.length, index + 80); look++) {
          const endMatch = lines[look].match(/^\s*\}\s*([A-Za-z_]\w*)\s*;/);
          if (endMatch) {
            pushDefinition(endMatch[1], look + 1, lines[look].indexOf(endMatch[1]) + 1, "typedef");
            break;
          }
        }
        continue;
      }

      const name = match[1];
      if (!name) continue;
      // Skip control keywords accidentally captured
      if (/^(if|for|while|switch|return|sizeof|typeof)$/.test(name)) continue;
      pushDefinition(name, lineNumber, line.indexOf(name) + 1, pattern.kind);
    }

    // Enum / #define-style assignments inside macros already handled.
    // Capture enumerator-like FOO = value inside enum blocks.
    const enumMember = line.match(/^\s*([A-Za-z_]\w*)\s*=/);
    if (enumMember && !line.includes("(") && !line.trim().startsWith("#")) {
      pushDefinition(enumMember[1], lineNumber, line.indexOf(enumMember[1]) + 1, "enum");
    }
  });

  const indexed = { versionId, definitions };
  symbolIndexCache.set(model, indexed);
  return indexed;
}

function findDefinitionsForSymbol(symbol) {
  const results = [];
  for (const model of monaco.editor.getModels()) {
    const { definitions } = indexModelSymbols(model);
    for (const def of definitions) {
      if (def.name === symbol && def.kind !== "include") {
        results.push({
          uri: model.uri,
          range: def.range,
          kind: def.kind,
        });
      }
    }
  }
  return results;
}

function findIncludeTarget(fileName) {
  const normalized = fileName.replace(/^(\.\/)+/, "");
  for (const model of monaco.editor.getModels()) {
    const path = model.uri.path.replace(/^\/+/, "");
    if (path === normalized || path.endsWith(`/${normalized}`) || path.endsWith(normalized)) {
      return {
        uri: model.uri,
        range: new monaco.Range(1, 1, 1, 1),
        kind: "file",
      };
    }
  }
  return null;
}

function findReferencesForSymbol(symbol) {
  const results = [];
  const wordRegex = new RegExp(`\\b${symbol.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "g");

  for (const model of monaco.editor.getModels()) {
    const lines = model.getValue().split(/\r?\n/);
    lines.forEach((line, index) => {
      wordRegex.lastIndex = 0;
      let match;
      while ((match = wordRegex.exec(line)) !== null) {
        results.push({
          uri: model.uri,
          range: positionToRange(index + 1, match.index + 1, symbol.length),
        });
      }
    });
  }
  return results;
}

function getDefinitionsAt(model, position) {
  const line = model.getLineContent(position.lineNumber);
  const includeMatch = line.match(/^\s*#\s*include\s+"([^"]+)"/);
  if (includeMatch) {
    const pathStart = line.indexOf('"') + 1;
    const pathEnd = line.lastIndexOf('"');
    if (position.column >= pathStart && position.column <= pathEnd + 1) {
      const target = findIncludeTarget(includeMatch[1]);
      return target ? [target] : [];
    }
  }

  const word = model.getWordAtPosition(position);
  if (!word) return [];
  return findDefinitionsForSymbol(word.word);
}

function getSymbolAt(model, position) {
  const line = model.getLineContent(position.lineNumber);
  const includeMatch = line.match(/^\s*#\s*include\s+"([^"]+)"/);
  if (includeMatch) {
    const pathStart = line.indexOf('"') + 1;
    const pathEnd = line.lastIndexOf('"');
    if (position.column >= pathStart && position.column <= pathEnd + 1) {
      return includeMatch[1];
    }
  }
  return model.getWordAtPosition(position)?.word || null;
}

function captureEditorLocation() {
  if (!editor || !window.monaco) return null;
  const model = editor.getModel();
  const position = editor.getPosition();
  if (!model || !position) return null;
  return {
    uri: model.uri,
    range: new monaco.Range(
      position.lineNumber,
      position.column,
      position.lineNumber,
      position.column
    ),
  };
}

function sameEditorLocation(a, b) {
  if (!a || !b) return false;
  return (
    a.uri.toString() === b.uri.toString() &&
    a.range.startLineNumber === b.range.startLineNumber &&
    a.range.startColumn === b.range.startColumn
  );
}

function updateNavButtons() {
  if (!navBackButton) return;
  navBackButton.disabled = navHistory.length === 0;
  navBackButton.title =
    navHistory.length === 0
      ? "Go Back (Right Alt+←)"
      : `Go Back (Right Alt+←) · ${navHistory.length} location${navHistory.length === 1 ? "" : "s"}`;
}

function pushNavHistory(location = captureEditorLocation()) {
  if (suppressNavHistory || !location) return;
  const last = navHistory[navHistory.length - 1];
  if (sameEditorLocation(last, location)) return;
  navHistory.push(location);
  if (navHistory.length > 100) navHistory.shift();
  updateNavButtons();
}

function clearNavHistory() {
  navHistory.length = 0;
  updateNavButtons();
}

function isRightAltGoBackShortcut(event) {
  if (event.key !== "ArrowLeft" && event.code !== "ArrowLeft") return false;
  if (event.shiftKey || event.metaKey) return false;
  // Right-side Alt only (AltGr on many keyboards, AltRight on others).
  if (event.getModifierState && event.getModifierState("AltGraph")) return true;
  if (rightAltHeld) return true;
  return false;
}

function noteRightAltKey(event, isDown) {
  // Cover US Right Alt (AltRight) and international AltGr (AltGraph).
  if (
    event.code === "AltRight" ||
    event.key === "AltGraph" ||
    (event.key === "Alt" && event.location === 2)
  ) {
    rightAltHeld = isDown;
  }
}

let goBackShortcutLock = false;

function handleGoBackShortcut(event) {
  noteRightAltKey(event, true);
  if (!isRightAltGoBackShortcut(event)) return false;
  event.preventDefault();
  event.stopPropagation();
  if (goBackShortcutLock) return true;
  goBackShortcutLock = true;
  queueMicrotask(() => {
    goBackShortcutLock = false;
  });
  goBack();
  return true;
}

function goBack() {
  if (!navHistory.length) return false;
  const location = navHistory.pop();
  updateNavButtons();
  suppressNavHistory = true;
  try {
    return openEditorLocation(location, { recordHistory: false });
  } finally {
    suppressNavHistory = false;
  }
}

function openEditorLocation(location, options = {}) {
  const recordHistory = options.recordHistory !== false;
  if (!editor || !location) return false;
  const model = monaco.editor.getModel(location.uri);
  if (!model) return false;

  if (recordHistory) {
    pushNavHistory();
  }

  if (editor.getModel() !== model) {
    editor.setModel(model);
  }
  const range = location.range;
  editor.setSelection(range);
  editor.revealRangeInCenter(range);
  editor.focus();
  syncEditorChrome(model);
  return true;
}

function showReferenceResults(symbol, references, title = "References") {
  if (!references.length) {
    setLog(`No ${title.toLowerCase()} found for '${symbol}'.`);
    showBottomPanel("output");
    return;
  }

  window.__studioReferences = references;

  const lines = references.map((ref, index) => {
    const model = monaco.editor.getModel(ref.uri);
    const path = ref.uri.path.replace(/^\/+/, "");
    const code = model ? model.getLineContent(ref.range.startLineNumber).trim() : "";
    return `<button type="button" class="reference-hit" data-ref-index="${index}">` +
      `<span class="reference-index">${index + 1}</span>` +
      `<span class="reference-loc">${path}:${ref.range.startLineNumber}</span>` +
      `<span class="reference-code">${escapeHtml(code)}</span>` +
      `</button>`;
  });

  buildLog.innerHTML =
    `<div class="reference-results">` +
    `<div class="reference-title">${title} to <code>${escapeHtml(symbol)}</code> (${references.length})</div>` +
    lines.join("") +
    `</div>`;
  showBottomPanel("output");
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function registerCLanguageFeatures() {
  const definitionProvider = {
    provideDefinition(model, position) {
      const defs = getDefinitionsAt(model, position);
      return defs.length ? defs : null;
    },
  };

  monaco.languages.registerDefinitionProvider("c", definitionProvider);
  monaco.languages.registerDeclarationProvider("c", definitionProvider);

  monaco.languages.registerReferenceProvider("c", {
    provideReferences(model, position) {
      const word = model.getWordAtPosition(position);
      if (!word) return [];
      return findReferencesForSymbol(word.word);
    },
  });

  monaco.languages.registerHoverProvider("c", {
    provideHover(model, position) {
      const word = model.getWordAtPosition(position);
      if (!word) return null;
      const defs = findDefinitionsForSymbol(word.word);
      if (!defs.length) return null;
      const primary = defs[0];
      const path = primary.uri.path.replace(/^\/+/, "");
      const defModel = monaco.editor.getModel(primary.uri);
      const snippet = defModel
        ? defModel.getLineContent(primary.range.startLineNumber).trim()
        : word.word;
      return {
        range: new monaco.Range(
          position.lineNumber,
          word.startColumn,
          position.lineNumber,
          word.endColumn
        ),
        contents: [
          { value: `**${word.word}** · ${primary.kind || "symbol"}` },
          { value: `\`${path}:${primary.range.startLineNumber}\`` },
          { value: "```c\n" + snippet + "\n```" },
        ],
      };
    },
  });

  monaco.editor.registerEditorOpener({
    openCodeEditor(_source, resource, selection) {
      const model = monaco.editor.getModel(resource);
      if (!model || !editor) return false;
      const range = selection
        ? new monaco.Range(
            selection.startLineNumber || selection.selectionStartLineNumber || 1,
            selection.startColumn || selection.selectionStartColumn || 1,
            selection.endLineNumber || selection.positionLineNumber || selection.startLineNumber || 1,
            selection.endColumn || selection.positionColumn || selection.startColumn || 1
          )
        : new monaco.Range(1, 1, 1, 1);
      return openEditorLocation({ uri: resource, range });
    },
  });
}

function addNavigationContextActions() {
  const goToDefinition = () => {
    const model = editor.getModel();
    const position = editor.getPosition();
    if (!model || !position) return;
    const defs = getDefinitionsAt(model, position);
    const symbol = getSymbolAt(model, position) || "symbol";
    if (!defs.length) {
      setLog(`No definition found for '${symbol}'.`);
      showBottomPanel("output");
      return;
    }
    if (defs.length === 1) {
      openEditorLocation(defs[0]);
      return;
    }
    showReferenceResults(symbol, defs, "Definitions");
    openEditorLocation(defs[0]);
  };

  const findReferences = () => {
    const model = editor.getModel();
    const position = editor.getPosition();
    if (!model || !position) return;
    const word = model.getWordAtPosition(position)?.word;
    const symbol = word || getSymbolAt(model, position);
    if (!symbol) {
      setLog("No symbol under the cursor.");
      showBottomPanel("output");
      return;
    }
    showReferenceResults(symbol, findReferencesForSymbol(symbol), "References");
  };

  const actions = [
    {
      id: "studio.goToDefinition",
      label: "Go to Definition",
      keybindings: [monaco.KeyCode.F12],
      contextMenuGroupId: "navigation",
      contextMenuOrder: 1.1,
      run: () => goToDefinition(),
    },
    {
      id: "studio.goToDeclaration",
      label: "Go to Declaration",
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.F12],
      contextMenuGroupId: "navigation",
      contextMenuOrder: 1.2,
      run: () => goToDefinition(),
    },
    {
      id: "studio.peekDefinition",
      label: "Peek Definition",
      keybindings: [monaco.KeyMod.Alt | monaco.KeyCode.F12],
      contextMenuGroupId: "navigation",
      contextMenuOrder: 1.3,
      run: () => {
        const model = editor.getModel();
        const position = editor.getPosition();
        if (!model || !position) return;
        const defs = getDefinitionsAt(model, position);
        const symbol = getSymbolAt(model, position) || "symbol";
        if (!defs.length) {
          setLog(`No definition found for '${symbol}'.`);
          showBottomPanel("output");
          return;
        }
        showReferenceResults(symbol, defs, "Definitions");
      },
    },
    {
      id: "studio.findReferences",
      label: "Find All References",
      keybindings: [monaco.KeyMod.Shift | monaco.KeyCode.F12],
      contextMenuGroupId: "navigation",
      contextMenuOrder: 1.4,
      run: () => findReferences(),
    },
    {
      id: "studio.goBack",
      label: "Go Back",
      // Handled globally below so Right Alt+← works even when Monaco isn't focused,
      // and we avoid double-pop from both Monaco and window listeners.
      contextMenuGroupId: "navigation",
      contextMenuOrder: 1.5,
      run: () => {
        if (!goBack()) {
          setLog("No previous editor location to go back to.");
          showBottomPanel("output");
        }
      },
    },
  ];

  for (const action of actions) {
    editor.addAction(action);
  }

  updateNavButtons();
}

async function ensureFirmwareModels() {
  if (!window.monaco) return;
  if (firmwareModelsReady) return firmwareModelsReady;

  firmwareModelsReady = (async () => {
    const targets = firmwareFiles.filter((path) => /\.(h|c)$/i.test(path));
    await Promise.all(
      targets.map(async (path) => {
        const uri = firmwareUri(path);
        if (monaco.editor.getModel(uri)) return;
        try {
          const file = await fetchJson(`/api/firmware/${path}`);
          monaco.editor.createModel(file.content, "c", uri);
        } catch (error) {
          console.warn(`Could not index firmware/${path}:`, error);
        }
      })
    );
  })();

  return firmwareModelsReady;
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
  window.require(["vs/editor/editor.main"], async () => {
    monaco.languages.setLanguageConfiguration("c", {
      wordPattern: /(-?\d*\.\d\w*)|([^\`\~\!\@\#\%\^\&\*\(\)\-\=\+\[\{\]\}\\\|\;\:\'\"\,\.\<\>\/\?\s]+)/g,
    });

    mainModel = monaco.editor.createModel(fallbackEditor.value, "c", workspaceUri());
    editor = monaco.editor.create(document.getElementById("monaco-editor"), {
      model: mainModel,
      theme: "vs-dark",
      automaticLayout: true,
      minimap: { enabled: false },
      fontSize: 14,
      lineNumbersMinChars: 3,
      padding: { top: 14 },
      scrollBeyondLastLine: false,
      tabSize: 4,
      wordWrap: "off",
      contextmenu: true,
      definitionLinkOpensInPeek: false,
      gotoLocation: {
        multiple: "goto",
        multipleDefinitions: "peek",
        multipleDeclarations: "peek",
        multipleReferences: "peek",
      },
      scrollbar: {
        verticalScrollbarSize: 10,
        horizontalScrollbarSize: 10,
      },
    });
    fallbackEditor.hidden = true;

    registerCLanguageFeatures();
    addNavigationContextActions();

    editor.onDidChangeModel(() => {
      syncEditorChrome(editor.getModel());
    });

    // Ctrl/Cmd + click → Go to Definition (CDN Monaco build has no built-in handler)
    editor.onMouseDown((mouseEvent) => {
      if (!(mouseEvent.event.ctrlKey || mouseEvent.event.metaKey)) return;
      if (mouseEvent.target?.type !== monaco.editor.MouseTargetType.CONTENT_TEXT) return;
      if (mouseEvent.target.position) {
        editor.setPosition(mouseEvent.target.position);
      }
      editor.getAction("studio.goToDefinition")?.run();
    });

    // Right Alt / AltGr + ← go back.
    // Use capture + Monaco onKeyDown so the editor cannot swallow the shortcut.
    window.addEventListener(
      "keydown",
      (event) => {
        handleGoBackShortcut(event);
      },
      true
    );

    window.addEventListener(
      "keyup",
      (event) => {
        noteRightAltKey(event, false);
      },
      true
    );

    window.addEventListener("blur", () => {
      rightAltHeld = false;
    });

    editor.onKeyDown((keyEvent) => {
      if (handleGoBackShortcut(keyEvent.browserEvent)) {
        keyEvent.preventDefault();
        keyEvent.stopPropagation();
      }
    });

    updateNavButtons();

    if (firmwareFiles.length) {
      await ensureFirmwareModels();
    }
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
    if (editor && mainModel) {
      editor.setModel(mainModel);
    }
    setCode(lesson.starter_code);
    clearNavHistory();
    syncEditorChrome(mainModel || editor?.getModel());
    setEditorReadonly(false);
    flashBtn.disabled = true;
    buildBtn.disabled = false;
    solutionFlashButton.disabled = false;
    setLog("Starter code loaded. Complete the mission, then build.");
    lessonList.querySelectorAll("button").forEach((button) => {
      button.classList.toggle("selected", button.dataset.id === id);
    });
    firmwareList.querySelectorAll("button").forEach((button) => button.classList.remove("selected"));
    showSidebarPanel("lessons");
    ensureFirmwareModels();
  } catch (error) {
    setLog(`Could not load this lesson. Try again in a moment. (${error.message})`);
  }
}

async function loadFirmwareReference(filePath) {
  try {
    await ensureFirmwareModels();
    const uri = firmwareUri(filePath);
    let model = monaco?.editor?.getModel(uri);
    if (!model) {
      const file = await fetchJson(`/api/firmware/${filePath}`);
      model = monaco.editor.createModel(file.content, "c", uri);
    }

    viewingReference = true;
    lastOpenedFirmware = filePath;
    lastBuildResult = null;

    if (editor) {
      pushNavHistory();
      editor.setModel(model);
      editor.revealLineInCenter(1);
      editor.setPosition({ lineNumber: 1, column: 1 });
    } else {
      const file = await fetchJson(`/api/firmware/${filePath}`);
      setCode(file.content);
    }

    syncEditorChrome(model);
    lessonNumber.textContent = "FIRMWARE REFERENCE · READ-ONLY";
    lessonTitle.textContent = filePath;
    lessonSummary.textContent =
      "Vendor-style CMSIS / HAL / LL files. Right-click a symbol for Go to Definition or Find All References. Switch back to a lesson to edit practice code.";
    lessonSteps.innerHTML =
      "<li>Browse firmware files in the left explorer.</li><li>Right-click symbols to jump to declarations and references.</li><li>Select a lesson to return to editable starter code.</li>";
    hintPanel.hidden = true;
    setLog(`Opened firmware/${filePath} (read-only).`);
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

function updateModeUi() {
  const isSim = runMode === "simulation";
  modeSimulationBtn?.classList.toggle("active", isSim);
  modeHardwareBtn?.classList.toggle("active", !isSim);
  if (simBadge) {
    simBadge.textContent = isSim ? "SIM" : "HW";
    simBadge.classList.toggle("hardware", !isSim);
  }
  flashBtn.textContent = isSim ? "▶ Run simulation" : "⚡ Flash";
  solutionFlashButton.textContent = isSim ? "Build & run solution" : "Build & flash solution";
  if (simButtonTap) simButtonTap.disabled = !isSim;
  if (simStopBtn) simStopBtn.disabled = !isSim;
  if (serialInput) serialInput.disabled = !isSim;
  if (serialSendBtn) serialSendBtn.disabled = !isSim;
}

function setBoardLed(on) {
  boardLd2?.classList.toggle("on", Boolean(on));
}

async function setRunMode(mode) {
  const result = await (
    await fetch("/api/mode", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode }),
    })
  ).json();
  runMode = result.mode || mode;
  updateModeUi();
  setLog(result.message || `Switched to ${runMode} mode.`);
  await Promise.all([refreshPorts(), refreshBoardStatus()]);
  if (runMode === "simulation") {
    startSimPolling();
  } else {
    stopSimPolling();
    setBoardLed(false);
  }
}

function startSimPolling() {
  stopSimPolling();
  simPolling = setInterval(refreshSimulationStatus, 250);
}

function stopSimPolling() {
  if (simPolling) {
    clearInterval(simPolling);
    simPolling = null;
  }
}

async function refreshSimulationStatus() {
  if (runMode !== "simulation") return;
  try {
    const status = await (await fetch("/api/simulate/status")).json();
    setBoardLed(status.led_on);
    if (simNote && status.capabilities?.note) {
      simNote.textContent = status.running
        ? status.capabilities.note
        : "Build, then run simulation to see LD2 / USART2 activity.";
    }
  } catch {
    // ignore transient poll errors
  }
}

async function runSimulation(result = lastBuildResult) {
  if (!result?.elf_path) {
    setLog("Build an ELF first, then run simulation.");
    return;
  }
  flashBtn.disabled = true;
  setLog("Starting Renode simulation on virtual NUCLEO-F446RE…");
  showBottomPanel("output");
  try {
    const response = await (
      await fetch("/api/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          elf_path: result.elf_path,
          lesson_id: selectedLesson?.id,
        }),
      })
    ).json();
    setLog(response.log || (response.success ? "Simulation started." : "Simulation failed."));
    if (response.success) {
      startSimPolling();
      showBottomPanel("serial");
      serialOutput.textContent = "Renode USART2 connected.\n";
      await refreshBoardStatus();
      await refreshSimulationStatus();
    }
  } catch (error) {
    setLog(`Simulation request failed: ${error.message}`);
  } finally {
    flashBtn.disabled = !lastBuildResult;
  }
}

async function stopSimulation() {
  const result = await (await fetch("/api/simulate/stop", { method: "POST" })).json();
  setBoardLed(false);
  setLog(result.message || "Simulation stopped.");
  await refreshBoardStatus();
}

async function tapSimButton() {
  boardButton?.classList.add("pressed");
  const result = await (
    await fetch("/api/simulate/button", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "tap" }),
    })
  ).json();
  setTimeout(() => boardButton?.classList.remove("pressed"), 120);
  if (result.led_on !== undefined) setBoardLed(result.led_on);
  if (!result.success) setLog(result.message || "Button tap failed.");
}

async function sendSerialInput() {
  if (runMode !== "simulation") return;
  const text = serialInput?.value || "";
  if (!text) return;
  await fetch("/api/simulate/uart/write", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: text.endsWith("\n") ? text : `${text}\n` }),
  });
  serialInput.value = "";
  showBottomPanel("serial");
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
    if (status.mode) runMode = status.mode;
    updateModeUi();
    boardStatus.textContent = status.message;
    statusMessage.textContent = status.message;
    boardStatusDot.className = `status-dot ${status.connected ? "connected" : "disconnected"}`;
    if (status.led_on !== undefined) setBoardLed(status.led_on);
    flashBtn.title =
      runMode === "simulation"
        ? "Run the latest build in Renode"
        : status.connected
          ? "Flash the latest successful build"
          : status.message;
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
  if (runMode === "simulation") {
    await runSimulation(result);
    return;
  }
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

async function clearBuilds() {
  if (!window.confirm("Clear all temporary build folders? The builds/lessons folder will be kept.")) {
    return;
  }
  clearBuildsButton.disabled = true;
  if (clearBuildsStatus) {
    clearBuildsStatus.hidden = false;
    clearBuildsStatus.textContent = "Clearing builds…";
  }
  try {
    const result = await (
      await fetch("/api/builds/clear", { method: "POST" })
    ).json();
    lastBuildResult = null;
    flashBtn.disabled = true;
    setLog(result.message || "Build folders cleared.");
    statusMessage.textContent = result.message || "Build folders cleared.";
    if (clearBuildsStatus) {
      clearBuildsStatus.textContent = result.message || "Build folders cleared.";
    }
  } catch (error) {
    const message = `Could not clear builds: ${error.message}`;
    setLog(message);
    if (clearBuildsStatus) {
      clearBuildsStatus.textContent = message;
    }
  } finally {
    clearBuildsButton.disabled = false;
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
if (navBackButton) {
  navBackButton.addEventListener("click", () => {
    if (!goBack()) {
      setLog("No previous editor location to go back to.");
      showBottomPanel("output");
    }
  });
}
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
modeSimulationBtn?.addEventListener("click", () => setRunMode("simulation"));
modeHardwareBtn?.addEventListener("click", () => setRunMode("hardware"));
simButtonTap?.addEventListener("click", tapSimButton);
boardButton?.addEventListener("click", tapSimButton);
simStopBtn?.addEventListener("click", stopSimulation);
serialSendBtn?.addEventListener("click", sendSerialInput);
serialInput?.addEventListener("keydown", (event) => {
  if (event.key === "Enter") sendSerialInput();
});
if (clearBuildsButton) {
  clearBuildsButton.addEventListener("click", clearBuilds);
}
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

buildLog.addEventListener("click", (event) => {
  const hit = event.target.closest(".reference-hit");
  if (!hit) return;
  const index = Number(hit.dataset.refIndex);
  const target = (window.__studioReferences || [])[index];
  if (target) openEditorLocation(target);
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
    try {
      const modeInfo = await fetchJson("/api/mode");
      if (modeInfo.mode) runMode = modeInfo.mode;
    } catch {
      // keep default simulation mode
    }
    updateModeUi();
    if (runMode === "simulation") startSimPolling();
    if (window.monaco) {
      await ensureFirmwareModels();
    } else {
      // Monaco loads async; index headers once the editor is ready.
      const waitForMonaco = setInterval(async () => {
        if (!window.monaco || !editor) return;
        clearInterval(waitForMonaco);
        await ensureFirmwareModels();
      }, 100);
      setTimeout(() => clearInterval(waitForMonaco), 15000);
    }
    if (lessons.length) {
      await loadLesson(lessons[0].id);
    }
  } catch (error) {
    lessonList.innerHTML = '<li class="load-error">Could not reach the app server. Refresh after it starts.</li>';
    setLog(`App startup failed: ${error.message}`);
  }
})();

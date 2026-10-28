const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);

let mode = "eng-to-code";
let currentOutput = "";

const inputArea = $("#inputArea");
const outputCode = $("#outputCode");
const translateBtn = $("#translateBtn");
const status = $("#status");
const langSelect = $("#langSelect");
const terminal = $("#terminal");
const inputLabel = $("#inputLabel");
const outputLabel = $("#outputLabel");

function updateLabels() {
  if (mode === "eng-to-code") {
    inputLabel.textContent = "input — english";
    outputLabel.textContent = "output — code";
    inputArea.placeholder = "describe what you want to build...";
    translateBtn.textContent = "translate";
  } else if (mode === "code-to-eng") {
    inputLabel.textContent = "input — code";
    outputLabel.textContent = "output — english";
    inputArea.placeholder = "paste your code here...";
    translateBtn.textContent = "translate";
  } else if (mode === "ask") {
    inputLabel.textContent = "input — question";
    outputLabel.textContent = "output — answer";
    inputArea.placeholder = "ask about a function, method, or concept...";
    translateBtn.textContent = "ask";
  }
}

$$(".mode-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    $$(".mode-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    mode = btn.dataset.mode;
    updateLabels();
  });
});

$("#pasteBtn").addEventListener("click", async () => {
  try {
    const text = await navigator.clipboard.readText();
    inputArea.value = text;
  } catch {
    inputArea.focus();
    document.execCommand("paste");
  }
});

$("#clearInputBtn").addEventListener("click", () => {
  inputArea.value = "";
  inputArea.focus();
});

$("#copyBtn").addEventListener("click", async () => {
  if (!currentOutput) return;
  try {
    await navigator.clipboard.writeText(currentOutput);
    setStatus("copied");
  } catch {
    setStatus("copy failed", true);
  }
});

$("#exportBtn").addEventListener("click", () => {
  if (!currentOutput) return;
  const lang = langSelect.value;
  const extMap = {
    JavaScript: "js",
    TypeScript: "ts",
    Python: "py",
    Rust: "rs",
    Go: "go",
    C: "c",
    "C++": "cpp",
    "C#": "cs",
    Java: "java",
    Kotlin: "kt",
    Swift: "swift",
    Ruby: "rb",
    PHP: "php",
    Dart: "dart",
    Lua: "lua",
    R: "r",
    SQL: "sql",
    Bash: "sh",
    "HTML/CSS": "html",
    Solidity: "sol",
    Assembly: "asm",
  };
  const ext = extMap[lang] || "txt";
  let exportContent = currentOutput;
  const langHeader = exportContent.match(/^LANG:\s*.+\n---\n/);
  if (langHeader) {
    exportContent = exportContent.replace(langHeader[0], "");
  }
  const blob = new Blob([exportContent], { type: "text/plain" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `output.${ext}`;
  a.click();
  URL.revokeObjectURL(a.href);
  setStatus("exported");
});

translateBtn.addEventListener("click", translate);

inputArea.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
    e.preventDefault();
    translate();
  }
});

async function translate() {
  const input = inputArea.value.trim();
  if (!input) return;

  translateBtn.disabled = true;
  outputCode.textContent = "";
  currentOutput = "";
  setStatus("translating...");

  try {
    const res = await fetch("/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        input,
        mode,
        language: langSelect.value,
      }),
    });

    if (!res.ok) {
      throw new Error("Request failed");
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        try {
          const data = JSON.parse(line.slice(6));
          if (data.content) {
            currentOutput += data.content;
            outputCode.textContent = currentOutput;
          }
          if (data.done) {
            setStatus("done");
          }
          if (data.error) {
            setStatus(data.error, true);
          }
        } catch {}
      }
    }
  } catch (err) {
    setStatus("translation failed", true);
  }

  translateBtn.disabled = false;
}

function setStatus(msg, isError = false) {
  status.textContent = msg;
  status.className = "status" + (isError ? " error" : "");
  if (!isError && msg !== "translating...") {
    setTimeout(() => {
      if (status.textContent === msg) status.textContent = "";
    }, 3000);
  }
}

$("#runBtn").addEventListener("click", () => {
  if (!currentOutput) return;
  termClear();
  termPrint("running...", "info");

  const lang = langSelect.value;
  const jsLangs = ["JavaScript", "TypeScript", "not-sure"];

  if (mode === "code-to-eng" || mode === "ask") {
    termPrint("nothing to run — output is text, not code.", "err");
    return;
  }

  if (!jsLangs.includes(lang) && lang !== "HTML/CSS") {
    termPrint(`mini terminal supports JS/TS runtime only.`, "err");
    termPrint(`for ${lang}, use your local environment or IDE.`, "info");
    return;
  }

  if (lang === "HTML/CSS") {
    try {
      const w = window.open("", "_blank", "width=600,height=400");
      w.document.write(currentOutput);
      w.document.close();
      termPrint("opened HTML preview in new tab.", "info");
    } catch {
      termPrint("popup blocked — allow popups to preview HTML.", "err");
    }
    return;
  }

  let code = currentOutput;
  const langLine = code.match(/^LANG:\s*.+\n---\n/);
  if (langLine) {
    code = code.replace(langLine[0], "");
  }

  const origLog = console.log;
  const origErr = console.error;
  const origWarn = console.warn;

  const capture = (type) => (...args) => {
    const msg = args.map((a) => {
      if (typeof a === "object") {
        try { return JSON.stringify(a, null, 2); } catch { return String(a); }
      }
      return String(a);
    }).join(" ");
    termPrint(msg, type === "error" ? "err" : type === "warn" ? "info" : "");
  };

  console.log = capture("log");
  console.error = capture("error");
  console.warn = capture("warn");

  try {
    const fn = new Function(code);
    const result = fn();
    if (result !== undefined) {
      termPrint(typeof result === "object" ? JSON.stringify(result, null, 2) : String(result));
    }
    termPrint("✓ executed", "info");
  } catch (err) {
    termPrint(err.message, "err");
  }

  console.log = origLog;
  console.error = origErr;
  console.warn = origWarn;
});

$("#clearTermBtn").addEventListener("click", termClear);

function termClear() {
  terminal.innerHTML = "";
}

function termPrint(msg, type = "") {
  const placeholder = terminal.querySelector(".term-placeholder");
  if (placeholder) placeholder.remove();

  const span = document.createElement("span");
  span.className = "term-line" + (type ? ` term-${type}` : "");
  span.textContent = msg;
  terminal.appendChild(span);
  terminal.appendChild(document.createTextNode("\n"));
  terminal.scrollTop = terminal.scrollHeight;
}

updateLabels();

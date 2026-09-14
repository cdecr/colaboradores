const CONFIG = {
  APPS_SCRIPT_URL: "https://script.google.com/macros/s/AKfycbzxWpjgBizTYh7YDlA7hu6rga3sdEzuqhj32tRTqMvXpiVIvntVz4j9S0wlBGb1eYgO-w/exec",
  MAX_FILE_SIZE: 10 * 1024 * 1024,
};

const form = document.querySelector("#collaborator-form");
const sections = [...document.querySelectorAll(".form-section")];
const stepButtons = [...document.querySelectorAll(".steps button")];
const previous = document.querySelector("#previous");
const next = document.querySelector("#next");
const submitButton = document.querySelector("#submit");
const message = document.querySelector("#form-message");
let current = 0;

function showSection(index) {
  current = Math.max(0, Math.min(index, sections.length - 1));
  sections.forEach((section, i) => section.classList.toggle("active", i === current));
  stepButtons.forEach((button, i) => button.classList.toggle("active", i === current));
  document.querySelector("#progress-bar").style.width = `${((current + 1) / sections.length) * 100}%`;
  previous.style.visibility = current === 0 ? "hidden" : "visible";
  next.style.display = current === sections.length - 1 ? "none" : "block";
  submitButton.style.display = current === sections.length - 1 ? "block" : "none";
  message.className = ""; message.textContent = "";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function validateSection() {
  const fields = [...sections[current].querySelectorAll("input,select,textarea")];
  const invalid = fields.find(field => !field.checkValidity());
  if (invalid) { invalid.reportValidity(); invalid.focus(); return false; }
  return true;
}

next.addEventListener("click", () => { if (validateSection()) showSection(current + 1); });
previous.addEventListener("click", () => showSection(current - 1));
stepButtons.forEach(button => button.addEventListener("click", () => { const target = Number(button.dataset.go); if (target < current) showSection(target); }));

form.addEventListener("submit", async event => {
  event.preventDefault();
  if (!validateSection()) return;
  if (!CONFIG.APPS_SCRIPT_URL.startsWith("https://script.google.com/")) return showMessage("El formulario todavía no tiene configurada la conexión con Google Drive.", "error");
  submitButton.disabled = true; submitButton.textContent = "Enviando…";
  try {
    const data = Object.fromEntries([...new FormData(form).entries()].filter(([, value]) => typeof value === "string"));
    const files = [];
    for (const input of form.querySelectorAll('input[type="file"]')) {
      for (const file of input.files) {
        if (file.size > CONFIG.MAX_FILE_SIZE) throw new Error(`El archivo ${file.name} supera 10 MB.`);
        files.push({ type: input.name, category: input.name, name: file.name, mimeType: file.type, data: await toBase64(file) });
      }
    }
    const response = await fetch(CONFIG.APPS_SCRIPT_URL, { method: "POST", body: JSON.stringify({ action: "collaboratorSubmission", submissionId: `CDE-COL-${Date.now()}`, data, files }) });
    const result = await response.json();
    if (!result.ok) throw new Error(result.error || "No fue posible guardar el expediente.");
    form.reset(); sections.forEach(section => section.hidden = true); document.querySelector(".steps").hidden = true; document.querySelector(".actions").hidden = true;
    showMessage("¡Información recibida correctamente! El expediente fue guardado en Google Drive.", "success");
  } catch (error) { showMessage(error.message || "No fue posible enviar el formulario.", "error"); }
  finally { submitButton.disabled = false; submitButton.textContent = "Enviar información"; }
});

function toBase64(file) { return new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result).split(",")[1]); reader.onerror = reject; reader.readAsDataURL(file); }); }
function showMessage(text, type) { message.textContent = text; message.className = type; }
showSection(0);

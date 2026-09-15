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
const successScreen = document.querySelector("#success-screen");
const identificationType = document.querySelector("#identification-type");
const identificationNumber = document.querySelector("#identification-number");
const identificationHelp = document.querySelector("#identification-help");
let current = 0;

const IDENTIFICATION_FORMATS = {
  "Cédula costarricense": { pattern: "[1-9]-[0-9]{4}-[0-9]{4}", placeholder: "1-1234-5678", help: "Formato: 1-1234-5678." },
  "DIMEX": { pattern: "[0-9]{11,12}", placeholder: "Número de 11 o 12 dígitos", help: "Ingrese 11 o 12 dígitos, sin espacios ni guiones." },
  "Pasaporte": { pattern: "[A-Za-z0-9-]{6,15}", placeholder: "Ejemplo: A1234567", help: "Entre 6 y 15 letras, números o guiones." },
  "Otro documento": { pattern: ".{4,30}", placeholder: "Número del documento", help: "Ingrese el número tal como aparece en el documento." }
};

identificationType.addEventListener("change", () => {
  const format = IDENTIFICATION_FORMATS[identificationType.value];
  identificationNumber.value = "";
  identificationNumber.disabled = !format;
  identificationNumber.pattern = format ? format.pattern : "";
  identificationNumber.placeholder = format ? format.placeholder : "Seleccione primero el tipo";
  identificationNumber.title = format ? format.help : "Seleccione el tipo de identificación.";
  identificationHelp.textContent = format ? format.help : "El formato se habilitará según el documento seleccionado.";
  if (format) identificationNumber.focus();
});

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

document.querySelectorAll('.health-question input[type="radio"]').forEach(radio => radio.addEventListener("change", () => {
  const field = document.querySelector(`.conditional-field[data-for="${radio.name}"]`);
  const textarea = field.querySelector("textarea");
  const show = radio.value === "Sí";
  field.classList.toggle("visible", show);
  textarea.required = show;
  if (!show) textarea.value = "";
}));

form.querySelectorAll('input[type="file"]').forEach(input => input.addEventListener("change", () => {
  const status = input.closest("label").querySelector(".file-status");
  const names = [...input.files].map(file => file.name);
  status.textContent = names.length ? (names.length === 1 ? names[0] : `${names.length} archivos: ${names.join(", ")}`) : "Ningún archivo seleccionado";
  input.closest("label").classList.toggle("has-files", names.length > 0);
}));

form.addEventListener("submit", async event => {
  event.preventDefault();
  if (!validateSection()) return;
  if (!CONFIG.APPS_SCRIPT_URL.startsWith("https://script.google.com/")) return showMessage("El formulario todavía no tiene configurada la conexión con Google Drive.", "error");
  submitButton.disabled = true; submitButton.textContent = "Enviando…";
  try {
    const data = Object.fromEntries([...new FormData(form).entries()].filter(([, value]) => typeof value === "string"));
    data.identification = `${data.identificationType}: ${data.identification}`;
    data.allergies = data.hasAllergies === "Sí" ? data.allergiesDetails : "No";
    data.medicalConditions = data.hasMedicalConditions === "Sí" ? data.medicalConditionsDetails : "No";
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
    form.reset();
    form.hidden = true;
    document.querySelector(".steps").hidden = true;
    document.querySelector(".progress").hidden = true;
    document.querySelector("#success-reference").textContent = result.reference || "Confirmado";
    document.querySelector("#success-detail").textContent = `Su expediente y ${result.filesSaved || files.length} documento(s) fueron guardados correctamente.`;
    successScreen.hidden = false;
    successScreen.scrollIntoView({ behavior: "smooth", block: "center" });
  } catch (error) { showMessage(error.message || "No fue posible enviar el formulario.", "error"); }
  finally { submitButton.disabled = false; submitButton.textContent = "Enviar información"; }
});

function toBase64(file) { return new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result).split(",")[1]); reader.onerror = reject; reader.readAsDataURL(file); }); }
function showMessage(text, type) { message.textContent = text; message.className = type; }
showSection(0);

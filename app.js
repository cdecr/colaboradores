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
let currentLanguage = "es";

const ENGLISH_TEXT = {
  "Casa de las Estrellas": "House of the Stars",
  "Actualización de expediente laboral": "Employee record update",
  "Complete su información y adjunte los documentos solicitados.": "Complete your information and attach the requested documents.",
  "🔒 Información confidencial": "🔒 Confidential information",
  "Información personal": "Personal information",
  "Contacto": "Contact",
  "Salud": "Health",
  "Documentos": "Documents",
  "Ingrese los datos tal como aparecen en su documento de identidad.": "Enter the information exactly as it appears on your identification document.",
  "Nombre completo": "Full name",
  "Tipo de identificación": "Identification type",
  "Número de identificación": "Identification number",
  "Fecha de nacimiento": "Date of birth",
  "Nacionalidad": "Nationality",
  "Estado civil": "Marital status",
  "Correo electrónico": "Email address",
  "Teléfono celular": "Mobile phone",
  "Puesto o función": "Position or role",
  "Fecha de ingreso": "Start date",
  "Dirección de residencia": "Home address",
  "Contacto de emergencia": "Emergency contact",
  "Persona a quien contactar en caso de una emergencia.": "Person to contact in case of an emergency.",
  "Parentesco o relación": "Relationship",
  "Teléfono": "Phone number",
  "Teléfono alternativo": "Alternate phone number",
  "Información de salud": "Health information",
  "Indique únicamente la información relevante para su seguridad.": "Provide only information relevant to your safety.",
  "Información sensible": "Sensitive information",
  "Estos datos serán visibles únicamente para personal administrativo autorizado.": "This information will only be visible to authorized administrative staff.",
  "Tipo de sangre": "Blood type",
  "Número de asegurado": "Insurance number",
  "¿Presenta alergias?": "Do you have any allergies?",
  "Sí": "Yes", "No": "No",
  "Especifique las alergias": "Please specify the allergies",
  "¿Presenta alguna enfermedad o condición médica relevante?": "Do you have any relevant illness or medical condition?",
  "Especifique la condición médica": "Please specify the medical condition",
  "Medicamentos de uso habitual": "Regular medications",
  "PDF, JPG o PNG. Máximo 10 MB por archivo.": "PDF, JPG or PNG. Maximum 10 MB per file.",
  "Documento de identidad": "Identification document",
  "Cédula, DIMEX o pasaporte; ambos lados cuando corresponda": "ID card, DIMEX or passport; both sides when applicable",
  "Hoja de delincuencia": "Criminal record certificate",
  "Documento vigente": "Current document",
  "Títulos universitarios": "University degrees",
  "Otros títulos o certificaciones": "Other degrees or certifications",
  "Puede seleccionar varios": "You may select multiple files",
  "Ningún archivo seleccionado": "No file selected",
  "Declaro que la información es correcta y autorizo su tratamiento exclusivamente para la gestión de mi expediente laboral, atención de emergencias y cumplimiento de obligaciones legales.": "I declare that the information is correct and authorize its processing exclusively for managing my employment record, emergency response and compliance with legal obligations.",
  "Anterior": "Back", "Continuar": "Continue", "Enviar información": "Submit information",
  "Formulario enviado": "Form submitted",
  "¡Información recibida correctamente!": "Information received successfully!",
  "Su expediente fue guardado de manera segura.": "Your record was saved securely.",
  "Número de confirmación": "Confirmation number",
  "Puede cerrar esta ventana. Casa de las Estrellas se comunicará con usted si necesita información adicional.": "You may close this window. Casa de las Estrellas will contact you if additional information is needed.",
  "Casa de las Estrellas · Formulario confidencial de uso administrativo": "Casa de las Estrellas · Confidential form for administrative use",
  "Seleccione": "Select",
  "Cédula costarricense": "Costa Rican ID card", "Pasaporte": "Passport", "Otro documento": "Other document",
  "Costarricense": "Costa Rican", "Nicaragüense": "Nicaraguan", "Panameña": "Panamanian", "Salvadoreña": "Salvadoran", "Hondureña": "Honduran", "Guatemalteca": "Guatemalan", "Mexicana": "Mexican", "Colombiana": "Colombian", "Venezolana": "Venezuelan", "Estadounidense": "American", "Otra": "Other",
  "Soltero(a)": "Single", "Casado(a)": "Married", "Unión libre": "Domestic partnership", "Divorciado(a)": "Divorced", "Viudo(a)": "Widowed", "Prefiero no indicar": "Prefer not to say",
  "Profesor/a principal": "Lead teacher", "Asistente preescolar": "Preschool assistant", "Asistente primaria": "Primary school assistant", "Cocinero/a": "Cook", "Asistente administrativo": "Administrative assistant", "Auxiliar finanzas": "Finance assistant", "Coordinador finanzas": "Finance coordinator", "Admisiones": "Admissions", "Recepción": "Reception", "Directora regional": "Regional director", "Coordinadora": "Coordinator", "Limpieza": "Cleaning", "Seguridad": "Security", "Profesor/a de especiales": "Special subjects teacher", "Mantenimiento": "Maintenance",
  "No lo sé / no deseo indicar": "I don't know / prefer not to say"
};

const PLACEHOLDER_EN = {
  "Seleccione primero el tipo": "Select the document type first",
  "112345678": "112345678",
  "Número de 11 o 12 dígitos": "11 or 12 digit number",
  "Ejemplo: A1234567": "Example: A1234567",
  "Número del documento": "Document number",
  "Indique el tipo de alergia y cualquier precaución importante": "Describe the allergy and any important precautions",
  "Indique la condición y cualquier información necesaria para una emergencia": "Describe the condition and any information needed in an emergency",
  "Escriba Ninguno si no aplica": "Enter None if not applicable"
};

function preserveOriginalText() {
  document.querySelectorAll("option").forEach(option => { if (!option.hasAttribute("value")) option.value = option.textContent.trim(); });
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const node = walker.currentNode;
    if (node.parentElement.closest("script,style") || !node.textContent.trim()) continue;
    node.parentElement.dataset.i18nReady = "true";
    node.__spanishText = node.textContent;
  }
  document.querySelectorAll("[placeholder]").forEach(element => element.dataset.placeholderEs = element.placeholder);
}

function setLanguage(language) {
  currentLanguage = language;
  document.documentElement.lang = language;
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const node = walker.currentNode;
    if (!node.__spanishText) continue;
    const original = node.__spanishText;
    const trimmed = original.trim();
    const translated = language === "en" ? ENGLISH_TEXT[trimmed] : null;
    node.textContent = translated ? original.replace(trimmed, translated) : original;
  }
  document.querySelectorAll("[data-placeholder-es]").forEach(element => {
    element.placeholder = language === "en" ? (PLACEHOLDER_EN[element.dataset.placeholderEs] || element.dataset.placeholderEs) : element.dataset.placeholderEs;
  });
  document.querySelectorAll("[data-language]").forEach(button => button.classList.toggle("active", button.dataset.language === language));
  form.querySelectorAll('input[type="file"]').forEach(updateFileStatus);
  localStorage.setItem("cde-form-language", language);
  updateIdentificationFormat(false);
}

const IDENTIFICATION_FORMATS = {
  "Cédula costarricense": { pattern: "[1-9][0-9]{8}", placeholder: "112345678", help: "Ingrese los 9 dígitos seguidos, sin espacios ni guiones.", helpEn: "Enter all 9 digits without spaces or hyphens." },
  "DIMEX": { pattern: "[0-9]{11,12}", placeholder: "Número de 11 o 12 dígitos", help: "Ingrese 11 o 12 dígitos, sin espacios ni guiones.", helpEn: "Enter 11 or 12 digits without spaces or hyphens." },
  "Pasaporte": { pattern: "[A-Za-z0-9-]{6,15}", placeholder: "Ejemplo: A1234567", help: "Entre 6 y 15 letras, números o guiones.", helpEn: "Use 6 to 15 letters, numbers or hyphens." },
  "Otro documento": { pattern: ".{4,30}", placeholder: "Número del documento", help: "Ingrese el número tal como aparece en el documento.", helpEn: "Enter the number exactly as it appears on the document." }
};

function updateIdentificationFormat(reset = true) {
  const format = IDENTIFICATION_FORMATS[identificationType.value];
  if (reset) identificationNumber.value = "";
  identificationNumber.disabled = !format;
  identificationNumber.pattern = format ? format.pattern : "";
  const basePlaceholder = format ? format.placeholder : "Seleccione primero el tipo";
  identificationNumber.placeholder = currentLanguage === "en" ? (PLACEHOLDER_EN[basePlaceholder] || basePlaceholder) : basePlaceholder;
  const help = format ? (currentLanguage === "en" ? format.helpEn : format.help) : (currentLanguage === "en" ? "The format will be enabled after selecting a document type." : "El formato se habilitará según el documento seleccionado.");
  identificationNumber.title = help;
  identificationHelp.textContent = help;
  if (format && reset) identificationNumber.focus();
}

identificationType.addEventListener("change", () => updateIdentificationFormat(true));

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

function updateFileStatus(input) {
  const status = input.closest("label").querySelector(".file-status");
  const names = [...input.files].map(file => file.name);
  status.textContent = names.length ? (names.length === 1 ? names[0] : `${names.length} ${currentLanguage === "en" ? "files" : "archivos"}: ${names.join(", ")}`) : (currentLanguage === "en" ? "No file selected" : "Ningún archivo seleccionado");
  input.closest("label").classList.toggle("has-files", names.length > 0);
}

form.querySelectorAll('input[type="file"]').forEach(input => input.addEventListener("change", () => updateFileStatus(input)));

form.addEventListener("submit", async event => {
  event.preventDefault();
  if (!validateSection()) return;
  if (!CONFIG.APPS_SCRIPT_URL.startsWith("https://script.google.com/")) return showMessage(currentLanguage === "en" ? "The Google Drive connection has not been configured yet." : "El formulario todavía no tiene configurada la conexión con Google Drive.", "error");
  submitButton.disabled = true; submitButton.textContent = currentLanguage === "en" ? "Submitting…" : "Enviando…";
  try {
    const data = Object.fromEntries([...new FormData(form).entries()].filter(([, value]) => typeof value === "string"));
    data.identification = `${data.identificationType}: ${data.identification}`;
    data.allergies = data.hasAllergies === "Sí" ? data.allergiesDetails : "No";
    data.medicalConditions = data.hasMedicalConditions === "Sí" ? data.medicalConditionsDetails : "No";
    const files = [];
    for (const input of form.querySelectorAll('input[type="file"]')) {
      for (const file of input.files) {
        if (file.size > CONFIG.MAX_FILE_SIZE) throw new Error(currentLanguage === "en" ? `The file ${file.name} exceeds 10 MB.` : `El archivo ${file.name} supera 10 MB.`);
        files.push({ type: input.name, category: input.name, name: file.name, mimeType: file.type, data: await toBase64(file) });
      }
    }
    const response = await fetch(CONFIG.APPS_SCRIPT_URL, { method: "POST", body: JSON.stringify({ action: "collaboratorSubmission", submissionId: `CDE-COL-${Date.now()}`, data, files }) });
    const result = await response.json();
    if (!result.ok) throw new Error(result.error || (currentLanguage === "en" ? "The record could not be saved." : "No fue posible guardar el expediente."));
    form.reset();
    form.hidden = true;
    document.querySelector(".steps").hidden = true;
    document.querySelector(".progress").hidden = true;
    document.querySelector("#success-reference").textContent = result.reference || (currentLanguage === "en" ? "Confirmed" : "Confirmado");
    const savedCount = result.filesSaved || files.length;
    document.querySelector("#success-detail").textContent = currentLanguage === "en" ? `Your record and ${savedCount} document(s) were saved successfully.` : `Su expediente y ${savedCount} documento(s) fueron guardados correctamente.`;
    successScreen.hidden = false;
    successScreen.scrollIntoView({ behavior: "smooth", block: "center" });
  } catch (error) { showMessage(error.message || (currentLanguage === "en" ? "The form could not be submitted." : "No fue posible enviar el formulario."), "error"); }
  finally { submitButton.disabled = false; submitButton.textContent = currentLanguage === "en" ? "Submit information" : "Enviar información"; }
});

function toBase64(file) { return new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result).split(",")[1]); reader.onerror = reject; reader.readAsDataURL(file); }); }
function showMessage(text, type) { message.textContent = text; message.className = type; }
preserveOriginalText();
document.querySelectorAll("[data-language]").forEach(button => button.addEventListener("click", () => setLanguage(button.dataset.language)));
setLanguage(localStorage.getItem("cde-form-language") === "en" ? "en" : "es");
showSection(0);

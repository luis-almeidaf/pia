import carimbo from "./carimbos.js";

const MAX_LOG = 4000; alterar esse nome

function buscaTextAreaLogs() {
  return Array.from(document.querySelectorAll(".carimbo-log-item"));
}

function buscaLogsPreenchidos() {
  return buscaTextAreaLogs
    .map((textArea) => textArea.value.trim())
    .filter(Boolean);
}

function criarLogLabel(index) {
  const label = document.createElement("p");
  label.className = "carimbo-log-label";
  label.textContent = `Log ${index} - Caracteres: 0/${MAX_LOG}`;
  return label;
}

function criarTextArea(index) {
  const textarea = document.createElement("textarea");
  textarea.className = "carimbo-box carimbo-log-item";
  textarea.placeholder = `Mensagem de log ${index}`;
  textarea.maxLength = MAX_LOG;
  return textarea;
}

function textAreaAtingiuOLimite(textarea, index) {
  const textAreas = buscaTextAreaLogs();
  const indexAtual = textAreas.indexOf(textarea);
  const existeProximo = textAreas[indexAtual + 1];
  if (!existeProximo) {
    criarLogTextArea(index + 1);
  }
}

function registrarInputLog(textarea, label, index) {
  textarea.addEventListener("input", () => {
    const lenght = textarea.value.length;
    label.textContent = `Log ${index} - Caracteres: ${lenght}/${MAX_LOG}`;

    if (lenght >= MAX_LOG) {
      textAreaAtingiuOLimite(textarea, index);
    }
  });
}

function criarNovoTextArea(index) {
  const container = document.getElementById("carimbo-logs-container");
  const wrapper = document.createElement("div");
  wrapper.className = "carimbo-log-wrapper";

  const label = criarLogLabel(index);
  const textArea = criarTextArea(index);
  registrarInputLog(textArea, label, index);

  wrapper.appendChild(label);
  wrapper.appendChild(textarea);
  container.appendChild(wrapper);

  return textarea;
}

const logs = { criarNovoTextArea, buscaLogsPreenchidos };

export default logs;

------------


  function atualizarBotaoCarimbo() {
  const btnCarimbo = document.getElementById("btnCarimbo");
  const algumExcedeu = buscaTextAreaLogs().some(
    (ta) => ta.value.length > MAX_LOG
  );
  btnCarimbo.disabled = algumExcedeu;
}


function registrarInputLog(textarea, label, index) {
  textarea.addEventListener("input", () => {
    const length = textarea.value.length;
    const excedeu = length > MAX_LOG;
    label.textContent = `Log ${index} - Caracteres: ${length}/${MAX_LOG}`;
    label.style.color = excedeu ? "red" : "";
    if (excedeu) textAreaAtingiuOLimite(textarea, index);
    atualizarBotaoCarimbo();
  });
}

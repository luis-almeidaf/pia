import stateModule from "../core/state.js";

function showContainers() {
  [
    "bdsInfoContainer",
    "clienteInfoContainer",
    "falhaInfoContainer",
    "flowContainer",
    "painel-carimbo",
  ].forEach((id) => document.getElementById(id)?.removeAttribute("hidden"));
}

function hideBdInfo() {
  document.getElementById("bdsInfoBody").innerHTML = "";
  document.getElementById("clienteInfoBody").innerHTML = "";
  document.getElementById("falhaInfoBody").innerHTML = "";
  document.getElementById("flowBox").innerHTML = "";
  document.getElementById("carimbo").innerHTML = "";
  document.getElementById("caracteresCarimbo").innerHTML = "";

  [
    "bdsInfoContainer",
    "clienteInfoContainer",
    "falhaInfoContainer",
    "flowContainer",
    "painel-carimbo",
  ].forEach((id) =>
    document.getElementById(id)?.setAttribute("hidden", "true"),
  );
}

function convertHeaderToKey(header) {
  return header
    .toLowerCase()
    .replaceAll(" ", "_")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function renderTableRow(apiData, headerSelector, bodyId) {
  const tbody = document.getElementById(bodyId);
  tbody.innerHTML = "";

  const headers = Array.from(document.querySelectorAll(headerSelector)).map(
    (th) => th.textContent.trim(),
  );

  const tr = document.createElement("tr");
  headers.forEach((header) => {
    const key = convertHeaderToKey(header);
    const td = document.createElement("td");
    td.textContent = apiData[key] ?? "";
    tr.appendChild(td);
  });

  tbody.appendChild(tr);
}

function renderBdInfo(apiData) {
  showContainers();
  renderTableRow(apiData, "#bdsInfo thead th", "bdsInfoBody");
  renderTableRow(apiData, "#clienteInfo thead th", "clienteInfoBody");
  renderTableRow(apiData, "#falhaInfo thead th", "falhaInfoBody");
}

function renderVars() {
  const box = document.getElementById("vars");
  const entries = Object.entries(stateModule.state.vars || {});

  if (entries.length === 0) {
    box.innerHTML = '<p class="muted">Sem variáveis.</p>';
    return;
  }

  let html =
    "<table><thead><tr><th>Pergunta</th><th>Resposta</th></tr></thead><tbody>";
  entries.forEach(([key, v]) => {
    const label = key;
    if (!label) return;
    html += `<tr><td>${label}</td><td>${String(v)}</td></tr>`;
  });
  html += "</tbody></table>";
  box.innerHTML = html;
}

function renderMessageNode(node, controls, advance) {
  const b = document.createElement("button");
  b.className = "btn";
  b.textContent = "Continuar";
  b.onclick = () => advance(node.next, {});
  controls.appendChild(b);
}

function renderYesNoNode(node, controls, advance) {
  const by = document.createElement("button");
  by.className = "btn";
  by.textContent = "SIM";
  by.onclick = () => advance(node.yes, { [node.text]: "Sim" });

  const bn = document.createElement("button");
  bn.className = "btn";
  bn.style.background = "var(--danger)";
  bn.textContent = "NÃO";
  bn.onclick = () => advance(node.no, { [node.text]: "Não" });

  controls.append(by, bn);
}

function renderInputNode(node, controls, advance) {
  const inp = document.createElement("input");
  inp.id = "inp";
  inp.placeholder = node.placeholder || "";

  if (stateModule.state.vars[node.text] !== undefined) {
    inp.value = stateModule.state.vars[node.text];
  }

  const b = document.createElement("button");
  b.className = "btn";
  b.textContent = "Salvar";
  b.onclick = () => {
    const val = document.getElementById("inp").value;
    advance(node.next, { [node.text]: val });
  };

  controls.append(inp, b);
}

function createSelect(node) {
  const sel = document.createElement("select");
  sel.id = "sel";

  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = "Selecione uma opção";
  placeholder.disabled = true;
  placeholder.selected = true;
  sel.appendChild(placeholder);

  (node.options || []).forEach((o, idx) => {
    const op = document.createElement("option");
    op.value = String(idx);
    op.textContent = o.label;
    op.dataset.next = o.next || "";
    sel.appendChild(op);
  });

  return sel;
}

function createSelectButton(node, advance) {
  const b = document.createElement("button");
  b.className = "btn";
  b.textContent = "Selecionar";

  b.onclick = () => handleChoiceSelection(node, advance);

  return b;
}

function handleChoiceSelection(node, advance) {
  const el = document.getElementById("sel");
  const selectedIndex = el.value;

  if (!selectedIndex) {
    el.focus();
    return;
  }

  const selectedOption = node.options[Number(selectedIndex)];
  advance(selectedOption.next, {
    [node.text]: selectedOption.value ?? selectedOption.label,
  });
}

function renderChoiceNode(node, controls, advance) {
  const sel = createSelect(node);
  const btn = createSelectButton(node, advance);
  controls.append(sel, btn);
}

function getCurrentNode() {
  const flow = stateModule.state.flows[stateModule.state.selectedFlow];
  return flow.steps.find((s) => s.id === stateModule.state.currentNodeId);
}

function renderCard(node) {
  const card = document.createElement("div");
  card.className = "card";

  const title = document.createElement("h3");
  title.textContent = node.text;

  card.appendChild(title);

  return card;
}

function renderNodeControls(node, advance, voltar) {
  const controls = document.createElement("div");
  controls.className = "controls";

  const typeHandlers = {
    message: renderMessageNode,
    yesno: renderYesNoNode,
    input: renderInputNode,
    choice: renderChoiceNode,
  };
  const handler = typeHandlers[node.type];
  if (handler) handler(node, controls, advance);

  if (stateModule.state.path.length > 0) {
    const backBtn = document.createElement("button");
    backBtn.className = "btn";
    backBtn.style.background = "gray";
    backBtn.textContent = "Voltar";
    backBtn.onclick = voltar;

    controls.appendChild(backBtn);
  }
  return controls;
}

function renderNode(advance, voltar) {
  const node = getCurrentNode();
  const box = document.getElementById("flowBox");

  if (!node) {
    box.innerHTML = '<div class="card">Nó não encontrado.</div>';
    return;
  }

  box.innerHTML = "";

  const card = renderCard(node);
  const controls = renderNodeControls(node, advance, voltar);

  card.appendChild(controls);
  box.appendChild(card);
}

function renderModal(mensagens) {
  const modal = document.getElementById("modal");
  const conteudoLista = document.getElementById("modalLista");

  conteudoLista.innerHTML = "";

  mensagens.forEach((msg) => {
    const p = document.createElement("p");
    p.textContent = "• " + msg;
    conteudoLista.appendChild(p);
  });

  modal.style.display = "block";
}

function closeModal() {
  const modal = document.getElementById("modal");
  modal.style.display = "none";
}

const ui = {
  renderBdInfo,
  hideBdInfo,
  renderVars,
  renderNode,
  renderModal,
  closeModal,
};

export default ui;

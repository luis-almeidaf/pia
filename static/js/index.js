import api from "./api/api.js";
import auth from "./auth/auth.js";
import carimbo from "./fluxo/carimbo.js";
import fluxo from "./fluxo/fluxos.js";
import ui from "./ui/ui.js";
import stateModule from "./core/state.js";

async function init() {
  const user = await auth.getLoggedUser();
  if (!user) {
    window.location.href = "/login";
    return;
  }
}

async function processaBd() {
  ui.hideBdInfo();

  ui.renderModal(["Processando BD.."]);
  await new Promise((r) => setTimeout(r, 10));

  const resultado = await api.consultaBd();

  if (!resultado) return ui.closeModal();
  if (trataErros(resultado)) return;

  await fluxo.carregaFluxo("fluxo_inicial");

  fluxo.iniciaFluxo();

  ui.closeModal();
  ui.renderBdInfo(resultado.info_bd);
}

async function carimbaBdApi() {
  const infoBdState = stateModule.state.infoBd.info_bd;
  const bd = infoBdState.bd;
  const produto = infoBdState.produto;
  const grupoAtual = infoBdState.grupo;
  const destino = stateModule.state.carimboDestino;
  const carimbo = document.getElementById("carimbo").textContent;

  ui.renderModal(["Carimbando BD..."]);
  await new Promise((r) => setTimeout(r, 10));

  const carimbo_res = await api.carimbaBd(
    bd,
    produto,
    grupoAtual,
    destino,
    carimbo,
    (registrarLog = true),
  );
  if (!carimbo_res.ok) {
    ui.renderModal(["Não foi possível carimbar o BD."]);
  } else {
    ui.renderModal(["BD carimbado com sucesso."]);
  }

  const logTextarea = document.getElementById("carimbo-log");
  const logMensagem = logTextarea.value.trim();
  if (logMensagem) {
    const carimbo_log_res = await api.carimbaBd(
      bd,
      produto,
      grupoAtual,
      destino,
      logMensagem,
      (registrarLog = false),
    );
    if (!carimbo_log_res.ok) {
      ui.renderModal(["Não foi possível carimbar o Log no BD."]);
    } else {
      ui.renderModal(["Log carimbado com sucesso."]);
    }
  }
}

function copiarCarimbo() {
  const carimboText = document.getElementById("carimbo").textContent;
  carimbo.copiarCarimbo(carimboText);
  ui.renderModal(["Carimbo copiado com sucesso"]);
}

function trataErros(apiData) {
  if (apiData.produtos_invalidos) {
    const mensagens = apiData.produtos_invalidos.map(
      (item) => `${item.servico}: ${item.mensagem}`,
    );

    ui.renderModal(mensagens);
    return true;
  }

  if (apiData.pendencias) {
    const mensagens = apiData.pendencias.map((item) => item.mensagem);

    ui.renderModal(mensagens);
    return true;
  }

  if (apiData.error) {
    ui.renderModal([apiData.error]);
    return true;
  }
  return false;
}

document.addEventListener("flow:advanced", () => {
  ui.renderNode(fluxo.avancar, fluxo.voltar);
  ui.renderVars();
});

document.addEventListener("carimbo:finalizado", (evt) => {
  const { mensagem } = evt.detail;
  ui.renderModal([mensagem]);
});

document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("modal");
  const carimbaApiBtn = document.getElementById("btnCarimbo");
  const copiaCarimboBtn = document.getElementById("btnCopy");
  const logoutBtn = document.getElementById("logoutBtn");
  const bdInputBtn = document.getElementById("bdInputBtn");
  const bdInput = document.getElementById("bdInput");
  const closeModelBtn = document.getElementById("closeModal");

  carimbaApiBtn.addEventListener("click", carimbaBdApi);
  copiaCarimboBtn.addEventListener("click", copiarCarimbo);
  logoutBtn.addEventListener("click", auth.logout);
  bdInputBtn.addEventListener("click", processaBd);
  bdInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") processaBd();
  });
  closeModelBtn.onclick = () => ui.closeModal();

  window.onclick = (event) => {
    if (event.target === modal) {
      ui.closeModal();
    }
  };
});

init();

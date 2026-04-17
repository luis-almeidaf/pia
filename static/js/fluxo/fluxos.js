import stateModule from "../core/state.js";
import carimbo from "./carimbo.js";
import api from "../api/api.js";

function iniciaFluxo() {
  stateModule.state.path = [];

  const flow = stateModule.state.flows[stateModule.state.selectedFlow];

  if (!flow) return;

  stateModule.state.currentNodeId = flow.start;
  stateModule.state.vars = Object.assign({}, flow.defaults || {});

  stateModule.state.vars["Consta Bloqueio?"] = "Não";
  stateModule.state.vars["Pendências no Star?"] = "Não";
  stateModule.state.vars["Pendências no Vantive?"] = "Não";

  document.dispatchEvent(new CustomEvent("flow:advanced"));
}

async function carregaFluxo(fluxoNome) {
  const flows = await api.buscaFluxo(fluxoNome);

  Object.assign(stateModule.state.flows, flows);

  stateModule.state.selectedFlow = fluxoNome;
  stateModule.indexFlows();
}

function saveCurrentState() {
  if (!stateModule.state.currentNodeId) return;

  stateModule.state.path.push({
    nodeId: stateModule.state.currentNodeId,
    vars: { ...stateModule.state.vars },
  });
}

function applySetVars(setVars) {
  Object.assign(stateModule.state.vars, setVars || {});
}

async function handleEnd(nextId) {
  if (!nextId?.startsWith("END:")) return false;

  const endType = nextId.split(":")[1];
  stateModule.state.carimboDestino = endType;
  console.log(endType);

  document.dispatchEvent(new CustomEvent("flow:advanced"));
  await carimbo.finish(endType);
  return true;
}

async function handleFlowJump(nextId) {
  if (!nextId.startsWith("FLUXO:")) return null;

  const flowName = nextId.split(":")[1];

  stateModule.state.path.push({
    type: "FLOW_JUMP",
    nodeId: stateModule.state.currentNodeId,
    flow: stateModule.state.selectedFlow,
    vars: { ...stateModule.state.vars },
  });

  await carregaFluxo(flowName);

  return stateModule.state.flows[flowName].start;
}

function updateCurrentNode(nextId) {
  const flowName = stateModule.state.nodeIndex[nextId];
  if (flowName) stateModule.state.selectedFlow = flowName;

  stateModule.state.currentNodeId = nextId;
  document.dispatchEvent(new CustomEvent("flow:advanced"));
}

async function avancar(nextId, setVars) {
  saveCurrentState();
  applySetVars(setVars);

  if (await handleEnd(nextId)) return;

  const jump = await handleFlowJump(nextId);
  if (jump) nextId = jump;

  updateCurrentNode(nextId);
}

function voltar() {
  if (stateModule.state.path.length === 0) return;

  const nodeAnterior = stateModule.state.path.pop();

  if (nodeAnterior.type === "FLOW_JUMP") {
    stateModule.state.selectedFlow = nodeAnterior.flow;
    stateModule.state.currentNodeId = nodeAnterior.nodeId;
  } else {
    stateModule.state.currentNodeId = nodeAnterior.nodeId;
  }

  stateModule.state.vars = Object.assign({}, nodeAnterior.vars);
  document.dispatchEvent(new CustomEvent("flow:advanced"));
}

const fluxo = { iniciaFluxo, avancar, voltar, carregaFluxo };

export default fluxo;

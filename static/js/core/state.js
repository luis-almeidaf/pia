const state = {
  flows: {},
  infoBd: {},
  nodeIndex: {},
  selectedFlow: null,
  currentNodeId: null,
  carimboDestino: null,
  vars: {},
  path: [],
};

function indexFlows() {
  state.nodeIndex = {};
  Object.entries(state.flows).forEach(([flowName, flow]) => {
    flow.steps.forEach((step) => {
      state.nodeIndex[step.id] = flowName;
    });
  });
}

const stateModule = {
  state,
  indexFlows,
};

export default stateModule;

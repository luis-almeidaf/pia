import stateModule from "../core/state.js";

async function consultaBd() {
  const bdInputValue = document.getElementById("bdInput").value;
  const url = `/api/consulta_bd/${bdInputValue}`;

  try {
    const response = await fetch(url);
    if (response.status === 401) {
      window.location.href = "/login";
      return;
    }
    const data = await response.json();

    if (!response.ok) return data;

    stateModule.state.infoBd = data;
    return data;
  } catch (error) {
    console.error(error.message);
  }
}

async function buscaFluxo(nomeFluxo) {
  return await fetch(`/api/${nomeFluxo}`).then((r) => r.json());
}

async function carimbaBd(
  bd,
  produto,
  grupoAtual,
  destino,
  carimbo,
  registrarLog,
) {
  const carimbaBdUrl = `/api/carimba_bd/${bd}`;
  try {
    const response = await fetch(carimbaBdUrl, {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        produto: produto,
        grupo_atual: grupoAtual,
        destino: destino,
        carimbo: carimbo,
        registrar_log: registrarLog,
      }),
    });
    return {
      ok: response.ok,
      data: await response.json(),
    };
  } catch (error) {
    console.error(error.message);
    return { ok: false };
  }
}

const api = {
  carimbaBd,
  consultaBd,
  buscaFluxo,
};

export default api;

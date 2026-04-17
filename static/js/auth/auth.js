async function login() {
  const usernameInput = document.getElementById("usernameInput").value.toUpperCase();
  const passwordInput = document.getElementById("passwordInput").value;
  const loginError = document.getElementById("loginError");

  loginError.style.display = "none";
  loginError.textContent = "";

  const loginUrl = "http://10.124.100.206:8001/api/login";

  try {
    const response = await fetch(loginUrl, {
      method: "POST",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: usernameInput,
        password: passwordInput,
      }),
    });

    if (response.status === 401) {
      loginError.textContent = "Usuário ou senha inválidos";
      loginError.style.display = "block";
      return;
    }

    const data = await response.json();

    if (data.token) {
      document.cookie = `token=${data.token}; path=/; SameSite=Lax; max-age=85000`;
      window.location.href = "/";
    } else {
      console.error("Erro ao salvar o token");
    }
  } catch (error) {
    console.error(error.message);
  }
}

function logout() {
  document.cookie = "token=; path=/; max-age=0";
  window.location.href = "/login";
}

async function getLoggedUser() {
  const token = document.cookie
    .split("; ")
    .find((row) => row.startsWith("token="))
    ?.split("=")[1];

  if (!token) return null;

  const usuarioLogadoUrl = "http://10.124.100.206:8001/api/me";

  try {
    const response = await fetch(usuarioLogadoUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) return null;

    const data = await response.json();
    return data;
  } catch {
    return null;
  }
}

const auth = {
  login,
  logout,
  getLoggedUser,
};

export default auth;
from config import Config
from jose import JWTError, jwt


class AuthService:
    @staticmethod
    def busca_usuario_logado(request) -> dict:
        token = request.cookies.get("token")
        if not token:
            return None

        try:
            usuario_logado = jwt.decode(
                token, Config.JWT_SECRET_KEY, algorithms=[Config.ALGORITHM]
            )

            return usuario_logado
        except JWTError as e:
            print("JWT ERROR:", e)

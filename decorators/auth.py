from functools import wraps

from flask import g, jsonify, request
from services.auth_service import AuthService


def login_required(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        usuario_logado = AuthService.busca_usuario_logado(request)

        if not usuario_logado:
            return jsonify({"error": "não autorizado"}), 401

        g.usuario_logado = usuario_logado

        return func(*args, **kwargs)

    return wrapper

from decorators.auth import login_required
from flask import Blueprint, g, jsonify, request
from repositories.bd_repository import BdRepository
from services.bd_service import BdService

bd_repository = BdRepository()
bd_service = BdService(bd_repository)

bd_blueprint = Blueprint("bd", __name__)


@bd_blueprint.route("/api/consulta_bd/<int:bd>", methods=["GET"])
@login_required
def consulta_bd_api(bd: int):
    usuario_nome = g.usuario_logado["nome"]
    resultado, problema, status = bd_service.valida_bd(bd, usuario_nome)

    if problema:
        return jsonify(problema), status

    return jsonify(resultado), status


@bd_blueprint.route("/api/carimba_bd/<int:bd>", methods=["POST"])
@login_required
def carimba_bd(bd: int):
    request_body = request.get_json()
    produto = request_body.get("produto")
    grupo_atual = request_body.get("grupo_atual")
    destino = request_body.get("destino")
    matricula_usuario = g.usuario_logado.get("matricula")
    carimbo = request_body.get("carimbo")
    registrar_log = request_body.get("registrar_log")

    resultado, problema, status = bd_service.carimba_bd(
        bd, produto, matricula_usuario, grupo_atual, destino, carimbo, registrar_log
    )

    if problema:
        return jsonify(problema), status

    return jsonify(resultado), status

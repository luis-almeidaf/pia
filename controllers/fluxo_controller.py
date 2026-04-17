import json
import os

from decorators.auth import login_required
from flask import Blueprint, jsonify

fluxo_blueprint = Blueprint("fluxo", __name__)


@fluxo_blueprint.route("/api/<nome_fluxo>", methods=["GET"])
@login_required
def api_flows(nome_fluxo: str):
    path = os.path.join("fluxos", f"{nome_fluxo}.json")

    if not os.path.exists(path):
        return jsonify({"error": "fluxo não encontrado"}), 404

    with open(path, "r", encoding="utf-8") as f:
        return jsonify(json.load(f)), 200

import os

from config import config
from controllers.bd_controller import bd_blueprint
from controllers.fluxo_controller import fluxo_blueprint
from flask import Flask, request
from views.pages import pages_blueprint


def create_app():
    """Factory to create the Flask application"""
    app = Flask(__name__)

    env = os.getenv("FLASK_ENV", "development")
    app.config.from_object(config[env])

    _register_blueprints(app)
    app.after_request(add_header)

    return app


def add_header(response):
    if request.path.startswith("/static/") or request.path.startswith("/api"):
        response.headers["Cache-Control"] = "no-store"
    return response


def _register_blueprints(app):
    app.register_blueprint(bd_blueprint)
    app.register_blueprint(fluxo_blueprint)
    app.register_blueprint(pages_blueprint)


if __name__ == "__main__":
    app = create_app()
    app.run(host="0.0.0.0", port=5010, debug=True)

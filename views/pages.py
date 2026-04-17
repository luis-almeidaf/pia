from flask import Blueprint, render_template, redirect, request

pages_blueprint = Blueprint("pages", __name__)


@pages_blueprint.route("/login")
def login():
    return render_template("login.html")


@pages_blueprint.route("/")
def index():
    token = request.cookies.get("token")
    if not token:
        return redirect("/login")
    return render_template("index.html")
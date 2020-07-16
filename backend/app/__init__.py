from flask import Flask, send_from_directory
import os


def create_app():
    from . import contrib, services, views

    app = Flask(__name__)
    app.config.update(SQLITE3_DATABASE_FILE="db.sqlite3")
    # print(app.config)

    # contrib
    contrib.db.setup_app(app)

    # service
    services.auth.setup_app(app)

    # views
    app.register_blueprint(views.accounts.blueprint, url_prefix='/accounts')
    app.register_blueprint(views.species.blueprint, url_prefix='/species')

    @app.route('/static/media/<path:path>')
    def send_media(path):
        print(path)
        mdir = os.path.join(os.getcwd(), 'static'+os.sep+'media')
        return send_from_directory(mdir, path)

    app.secret_key = os.urandom(24)

    return app

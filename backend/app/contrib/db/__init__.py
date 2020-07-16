from flask import g, Flask, current_app
import sqlite3
from . import field as Field
from .base import Model


def setup_app(app):
    app.before_request(init_db)
    app.after_request(commit_db)
    app.teardown_request(close_db)


def get_db():
    if 'db' not in g:
        init_db()
    return g.db


def init_db():
    if 'db' not in g:
        db_file = current_app.config['SQLITE3_DATABASE_FILE']
        g.db = sqlite3.connect(db_file)
        def dict_factory(cursor, row):
            d = {}
            for idx, col in enumerate(cursor.description):
                d[col[0]] = row[idx]
            return d

        g.db.row_factory = dict_factory

def commit_db(response):
    if 'db' in g:
        g.db.commit()
    return response

def close_db(exception=None):
    if 'db' in g:
        g.db.close()
        g.db = None

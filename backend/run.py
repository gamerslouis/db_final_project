from app import create_app
from flask import current_app
import click

app = create_app()


@app.cli.command("gensqlplan")
def gen_sql_plan():
    import os
    import importlib
    from app.contrib.db import Model

    sql = ''
    tables = []
    for file in os.listdir('app/models'):
        if not file.endswith('.py'):
            continue
        m = importlib.import_module('app.models.{}'.format(file[:-3]))
        for key in dir(m):
            obj = getattr(m, key)
            if isinstance(obj, type) and issubclass(obj, Model) and not issubclass(Model, obj):
                if obj._table_name in tables:
                    continue
                else:
                    tables.append(obj._table_name)
                sql += obj.gen_sql_plan() + "\n\n"
    sql = '-- This is an auto grenerate file\n' + sql
    with open('migrate.sql', 'w') as f:
        f.write(sql)


@app.cli.command("makedb")
@click.argument('file', required=False)
@click.option('overwrite', '--force-overwrite-db-file', is_flag=True)
def create_database(file, overwrite):
    import os
    import sqlite3
    import sys

    if file is None:
        file = current_app.config['SQLITE3_DATABASE_FILE']
    if os.path.exists(file):
        if overwrite:
            os.remove(file)
        else:
            sys.stderr.write('{} already exists.\nadd --force-overwrite-db-file to overwrite existed file.'.format(file))
            return
    db = sqlite3.connect(file)
    with open('migrate.sql', 'r') as f:
        ff = f.read()
        print(ff)
        db.executescript(ff)
    db.close()


@app.cli.command("shell")
def shell():
    import code
    code.interact(local=locals())

if __name__ == "__main__":
    app.run(debug=True)

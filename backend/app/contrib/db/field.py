import datetime
import json


class Field(object):
    _SQLITE3_PRIMARY_KEY_SQL_ = "PRIMARY KEY"
    parser_type = str
    sql_type = "BLOB"

    def __init__(self, default=None, name=None, pk=False, Null=False, Unique=False, format=None, sqlizer=None):
        self.default = default
        self.name = name
        self.pk = pk
        self.Unique = Unique
        self.Null = Null

        if format is not None:
            self.parse_format = format
        if sqlizer is not None:
            self.to_sql = sqlizer

    def parse_format(self, value):
        return self.parser_type(value)

    def to_sql(self, value):
        return str(value)

    def gen_sql_plan(self):
        sql = "{} {}".format(self.name, self.sql_type)
        if self.pk:
            sql += " {}".format(self._SQLITE3_PRIMARY_KEY_SQL_)
        if not self.Null:
            sql += " NOT NULL"
        if self.Unique:
            sql += " UNIQUE"
        if self.default is not None:
            sql += " DEFAULT {}".format(self.default if type(self.default) is not str else "'"+self.default+"'")
        return sql


class IntergerField(Field):
    parser_type = int
    sql_type = "INTEGER"


class AutoField(IntergerField):
    _SQLITE3_PRIMARY_KEY_SQL_ = "PRIMARY KEY AUTOINCREMENT"

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.Null = True


class BooleanField(IntergerField):
    parser_type = bool

    def to_sql(self, value):
        return str(int(value))


class TextField(Field):
    parser_type = str
    sql_type = "TEXT"

    def to_sql(self, value):
        return '\'' + str(value) + '\''


class DictField(TextField):
    def parser_type(self, s):
        print(type(s))
        if s is None or s is '':
            return {}
        else:
            return json.loads(s)

    def to_sql(self, value):
        return '\'' + json.dumps(value) + '\''


class RealField(Field):
    parser_type = float
    sql_type = "REAL"


class DatetimeField(TextField):
    sql_type = "TEXT"

    def __init__(self, *args, datetime_format_str="%Y-%m-%d %H:%M:%S", **kwargs):
        super().__init__(*args, **kwargs)
        self.datetime_format_str = datetime_format_str

    def parser_type(self, value):
        return datetime.datetime.strptime(value, self.datetime_format_str)

    def to_sql(self, value):
        return "'" + value.strftime(self.datetime_format_str) + "'"


class ForeignField(IntergerField):
    def __init__(self, foreign, * args, **kwargs):
        super(ForeignField, self).__init__(*args, **kwargs)
        self.foreign = foreign


class PlaceholderField(Field):
    pass

from flask import g
from flask_restful import reqparse
from .field import Field, AutoField, PlaceholderField


def make_sentence(iterable, sep=', ', pref='', suff=''):
    s = ''
    for w in iterable:
        s = s + pref + str(w) + suff + sep
    return s[:-len(sep)]


class ModelBase(type):
    def __new__(mcls, name, base, attribs: dict):
        fields = {}
        field_names = []
        new_attribs = {}
        pks = []
        for key, value in attribs.items():
            if isinstance(value, Field):
                if value.name is None:
                    value.name = key
                field_names.append(key)
                if isinstance(value, PlaceholderField):
                    continue
                fields[key] = value
                if value.pk:
                    pks.append(key)
            elif key == 'Meta':
                new_attribs['_meta'] = value.__dict__
            else:
                new_attribs[key] = value

        if len(pks) == 0:
            fields['id'] = AutoField(name='id', pk=True)
            field_names.insert(0, 'id')
            pks.append('id')

        new_attribs['_fields'] = fields
        new_attribs['_field_names'] = field_names
        new_attribs['_pk_field_names'] = pks
        new_attribs['_values'] = {}
        if '_meta' not in new_attribs:
            new_attribs['_meta'] = {}

        if 'table_name' in new_attribs['_meta']:
            table_name = new_attribs['_meta']['table_name']
        else:
            table_name = name
        new_attribs['_table_name'] = table_name

        return super().__new__(mcls, name, base, new_attribs)


class AbstractModel(metaclass=ModelBase):
    def __init__(self, **kwargs):
        for key, value in kwargs.items():
            assert key in self.__class__._field_names, "{} is not a field of {}".format(key, self.__class__.__name__)
            setattr(self, key, value)

    @classmethod
    def curser(cls):
        return g.db.cursor()

    @classmethod
    def from_sql(cls, sql, args=None):
        cur = cls.curser()
        if args is None:
            cur.execute(sql)
        else:
            cur.execute(sql, args)
        return [cls._from_dict(obj) for obj in cur.fetchall()]

    @classmethod
    def _from_dict(cls, obj):
        try:
            c = cls()
            for key, field in cls._fields.items():
                # import code
                # code.interact(local=locals())
                setattr(c, key, field.parse_format(obj[field.name]))
        except (KeyError, IndexError):
            # assert False, ('Key {} miss in db table'.format(field.name))
            pass
        return c

    @classmethod
    def gen_sql_plan(cls):
        ifnotexist = getattr(cls._meta, 'if_not_exist', False)
        sql = "CREATE TABLE {}{} (\n".format(' IF NOT EXISTS 'if ifnotexist else '', cls._table_name)
        sql += make_sentence([cls._fields[fn].gen_sql_plan() for fn in cls._field_names if fn in cls._fields.keys()], sep=',\n', pref='    ')
        sql += "\n);\n"
        if 'index' in cls._meta:
            for idx in cls._meta['index']:
                sql += 'CREATE INDEX index_{}_{} on {} ({});\n'.format(
                    cls._table_name,
                    make_sentence(map(lambda key: cls._fields[key].name, idx), '_'),
                    cls._table_name,
                    make_sentence(map(lambda key: cls._fields[key].name, idx), ', ')
                )

        return sql


class CRUDMixin(object):
    def __init__(self, *args, **kwargs):
        super(CRUDMixin, self).__init__(*args, **kwargs)
        self._changed = set()
        self._saved = False
        self._created = False

    def save(self):
        if not self._created:
            self._insert()
        else:
            self._update()

    def _insert(self):
        cur = self.curser()
        keys = []
        values = []
        for fn in self._fields:
            if hasattr(self, fn):
                keys.append(fn)
                values.append(self._fields[fn].to_sql(getattr(self, fn)))
        sql = "INSERT INTO {} ({}) VALUES ({});".format(self._table_name, make_sentence(keys), make_sentence(values))
        cur.execute(sql)

    def _update(self):
        cur = self.curser()
        sql = "UPDATE {} SET {} {}".format(
            self._table_name,
            make_sentence(['{} = {}'.format(
                self._fields[fn].name, 
                self._fields[fn].to_sql(getattr(self, fn))) for fn in self._changed]),
            self._pkwhere()
        )
        cur.execute(sql)

    def delete(self):
        cur = self.curser()
        sql = "DELETE FROM {} {}".format(
            self._table_name,
            self._pkwhere()
        )
        cur.execute(sql)


    def _pkwhere(self):
        sql = "WHERE " + make_sentence(['( {} = {} )'.format(
            self._fields[fn].name, self._fields[fn].to_sql(getattr(self, fn))) for fn in self._pk_field_names], sep=' AND ')
        return sql

    @classmethod
    def _from_dict(cls, obj):
        o = super(CRUDMixin, cls)._from_dict(obj)
        o._changed = set()
        o._saved = True
        o._created = True
        return o

    def __setattr__(self, name, value):
        print(name, value)
        if name in getattr(self, '_fields'):
            super(CRUDMixin, self).__setattr__('_saved', False)
            getattr(self, '_changed').add(name)
        super(CRUDMixin, self).__setattr__(name, value)


class Model(CRUDMixin, AbstractModel):
    def get_all(self):
        collect = {}
        for fn in self._field_names:
            if hasattr(self, fn):
                collect[fn] = getattr(self, fn)
        return collect

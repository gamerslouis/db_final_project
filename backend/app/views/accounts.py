from app.models.auth import User
from flask_login import login_user, logout_user, current_user
import hashlib
from flask_restful import reqparse, marshal_with, Resource, Api, fields
from flask import Blueprint, Response, g


blueprint = Blueprint('accounts', __name__)
api = Api(blueprint)


def hash_pass(args):
    sha = hashlib.sha3_512()
    sha.update(args['password'].encode())
    args['password'] = sha.hexdigest()
    return args


@blueprint.route('/login')
def login():
    parser = reqparse.RequestParser()
    parser.add_argument('username', required=True)
    parser.add_argument('password', required=True)
    args = parser.parse_args()
    args = hash_pass(args)
    user = User.get_login_user(username=args['username'], password=args['password'])
    if user is None:
        return Response('wrong username or password', status=401)
    else:
        login_user(user)
        return Response('', status=200)


@blueprint.route('/logout', methods=['GET'])
def logout():
    logout_user()
    return Response('', status=200)


class Register(Resource):
    resource_fields = {
        'status': fields.String,
    }

    @marshal_with(resource_fields)
    def get(self, **kwargs):
        parser = reqparse.RequestParser()
        parser.add_argument('username', required=True)
        parser.add_argument('password', required=True)
        args = parser.parse_args()
        args = hash_pass(args)
        user = User.from_sql('select * from User where username=?', (args['username'],))
        if len(user) != 0:
            return Response('Username already exist.', status=400)
        user = User(**args)
        user.save()
        return {'status': 'OK'}


class Me(Resource):
    obs_fields = {
        'latitude': fields.Float,
        'longitude': fields.Float,
        'scientific_name': fields.String,
        'file': fields.String
    }

    resource_fields = {
        'username':   fields.String,
        'is_anonymous': fields.Boolean,
        'uploads': fields.List(fields.Nested(obs_fields))
    }

    @marshal_with(resource_fields)
    def get(self, **kwargs):
        cur = g.db.cursor()
        import code
        code.interact(local=locals())
        if current_user.is_active:
            cur.execute('select o.latitude, o.longitude, s.scientific_name, o.file from ObservationPoint as o, Species as s where o.species = s.id and o.user = ?', (current_user.id,))
            return {**current_user.get_all(), 'uploads': cur.fetchall()}
        else:
            return current_user
        


api.add_resource(Me, '/me')
api.add_resource(Register, '/register')

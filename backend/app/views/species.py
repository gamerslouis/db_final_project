from app.models.species import Species, SpeciesTaxonomy, ObservationPoint
from flask_restful import reqparse, marshal_with, Resource, Api, fields
from flask import Blueprint, Response, request
from flask_login import current_user
import uuid
import datetime

blueprint = Blueprint('species', __name__)
api = Api(blueprint)


class Taxonomy(Resource):
    taxonomy_fields = {
        'level':   fields.Integer,
        'name': fields.String,
        'chinese_name': fields.String,
    }

    resource_fields = {
        **taxonomy_fields,
        'parent': fields.Integer,
        'subids': fields.List(fields.Nested(taxonomy_fields))
    }

    @marshal_with(resource_fields)
    def get(self, **kwargs):
        _id = getattr(kwargs, 'id', default=1)

        cur = SpeciesTaxonomy.from_sql('select * from SpeciesTaxonomy where id = ?', (_id,))[0]
        subids = SpeciesTaxonomy.from_sql('select * from SpeciesTaxonomy where parent = ?', (_id,))
        return {**cur.get_all(), 'subids': subids}


class FindSpecies(Resource):
    meta_fields = {
        'district': fields.String
    }

    obs_fields = {
        'latitude': fields.Float,
        'longitude': fields.Float,
        'date': fields.DateTime,
        'photo': fields.String,
        'meta_info': fields.Nested(meta_fields)
    }

    resource_fields = {
        'status': fields.String,
        'data': fields.List(fields.Nested(obs_fields))
    }

    @marshal_with(resource_fields)
    def get(self, **kwargs):
        parser = reqparse.RequestParser()
        parser.add_argument('name', type=str, required=True)
        args = parser.parse_args()
        obs = ObservationPoint.from_sql('select * from ObservationPoint as o,Species as S where o.species = S.id and (S.scientific_name like ? or S.common_name like ?)',
                                        ('%{}%'.format(args['name']), '%{}%'.format(args['name'])))

        return {'status': 'OK', 'data': obs}


class FindLocation(Resource):
    meta_fields = {
        'district': fields.String
    }

    obs_fields = {
        'latitude': fields.Float,
        'longitude': fields.Float,
        'date': fields.DateTime,
        'photo': fields.String,
        'meta_info': fields.Nested(meta_fields)
    }

    species_fields = {
        'scientific_name': fields.String,
        'common_name': fields.String,
        'taxonomy': fields.String,
        'is_endemic': fields.Boolean
    }

    single_fields = {
        'species': fields.Nested(species_fields),
        'obs': fields.Nested(obs_fields)
    }

    resource_fields = {
        'status': fields.String,
        'data': fields.List(fields.Nested(single_fields))
    }

    @marshal_with(resource_fields)
    def get(self, **kwargs):
        parser = reqparse.RequestParser()
        parser.add_argument('latitude', type=float, required=True)
        parser.add_argument('longitude', type=float, required=True)
        args = parser.parse_args()
        la = args['latitude']
        lo = args['longitude']
        spes = Species.from_sql(
            'select * from Species where id in (select species from (select species, count(*) as c from ObservationPoint  where (latitude between ? and ?) and (longitude between ? and ?) group by species order by c desc limit 3))', (la-0.18, la+0.18, lo-0.18, lo+0.18))
        data = []
        for s in spes:
            obs = ObservationPoint.from_sql('select * from ObservationPoint as o where species = ? and (o.latitude between ? and ?) and (o.longitude between ? and ?)',
                                            (s.id, la-0.18, la+0.18, lo-0.18, lo+0.18))
            data.append({
                'species': s,
                'obs': obs
            })
        # import code
        # code.interact(local=locals())

        return {'status': 'OK', 'data': data}


class UploadImage(Resource):
    def post(self, **kwargs):
        try:
            if not current_user.is_active:
                return {'status': 'Unauth'}
            uid = current_user.id
            parser = reqparse.RequestParser()
            parser.add_argument('name', type=str)
            parser.add_argument('longitude', type=float)
            parser.add_argument('latitude', type=float)
            args = parser.parse_args()
            sid = Species.from_sql('select * from Species where scientific_name = ?', (args['name'],))[0].id
            file = request.files['file']
            file_name = 'static/media/{}.jpg'.format(str(uuid.uuid4()))
            file.save(file_name)
            ObservationPoint(latitude=args['latitude'], longitude=args['longitude'],
                             date=datetime.datetime.now(), species=sid, file='/'+file_name, user=uid).save()

            return {'status': 'OK'}
        except Exception as e:
            print(e)
            return {'status': 'Fail'}


api.add_resource(Taxonomy, '/taxonomy', '/taxonomy/<int:id>')
api.add_resource(FindSpecies, '/find/species')
api.add_resource(FindLocation, '/find/location')
api.add_resource(UploadImage, '/upload')

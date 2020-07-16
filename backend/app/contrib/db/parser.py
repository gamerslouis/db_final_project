from flask_restful import reqparse


class ModelParser(reqparse):
    def __init__(self, model_cls):
        self.parser = reqparse.RequestParser()
        for key, f in model_cls._fields.items():
            self.parser.add_argument(key,)

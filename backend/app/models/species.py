from app.contrib.db import Model, Field
from .auth import User


class SpeciesTaxonomy(Model):
    level = Field.IntergerField()
    name = Field.TextField()
    chinese_name = Field.TextField(Null=True)
    parent = Field.IntergerField()


class Species(Model):
    scientific_name = Field.TextField()
    common_name = Field.TextField(Null=True)
    taxonomy = Field.ForeignField(SpeciesTaxonomy)
    is_endemic = Field.BooleanField()

    class Meta:
        index = (('scientific_name',), ('taxonomy',))


class ObservationPoint(Model):
    date = Field.DatetimeField(datetime_format_str="%Y-%m-%d")
    latitude = Field.RealField()
    longitude = Field.RealField()
    meta_info = Field.DictField(default='', Null=True)
    species = Field.ForeignField(Species)
    file = Field.TextField(Null=True)
    user = Field.ForeignField(User, Null=True, default=0)

    class Meta:
        index = (('latitude',), ('longitude',), ('species',))

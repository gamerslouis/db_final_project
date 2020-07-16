from app.contrib.db import Field, Model
from .auth import User
from .species import ObservationPoint


class Friend(Model):
    a = Field.ForeignField(User)
    b = Field.ForeignField(User)

    class Meta:
        index = (('a', 'b'),)


class Like(Model):
    user = Field.ForeignField(User)
    target = Field.ForeignField(ObservationPoint)

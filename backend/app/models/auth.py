from flask_login import UserMixin, AnonymousUserMixin
from app.contrib.db import Model, Field


class User(UserMixin, Model):
    username = Field.TextField()
    password = Field.TextField()
    is_anonymous = Field.PlaceholderField()

    def get_id(self):
        return self.username

    @classmethod
    def get_login_user(cls, username, password):
        try:
            user = User.from_sql('select * from user where username=? and password=?', (username, password))[0]
        except Exception as e:
            print(e)
            return None
        return user

    @classmethod
    def get_user_by_userid(cls, username):
        try:
            user = User.from_sql('select * from user where username=?', (username, ))[0]
        except Exception:
            return None
        return user


class AnonymousUser(AnonymousUserMixin):
    pass


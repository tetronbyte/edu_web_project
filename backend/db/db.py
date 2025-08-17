from flask_pymongo import PyMongo
from flask import current_app

mongo = PyMongo()

def init_db(app):
    mongo.init_app(app)

def get_db():
    return mongo.db

def get_fs():
    # Access GridFS from the correct DB
    return mongo.cx[current_app.config["MONGO_URI"].rsplit('/', 1)[-1]]

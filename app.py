from flask import Flask
from flask_restful import Api
from flask_cors import CORS #comment this on deployment
import pickle

from google.cloud import bigquery

from backend.blueprints.userAddress import user_address_bp
from backend.blueprints.overview import overview_bp

overview_ca = pickle.load( open( "overview_ca.p", "rb" ) )
overview_zip = pickle.load( open( "overview_zip.p", "rb" ) )

app = Flask(__name__, static_url_path='', static_folder='frontend/build')

# Pull in Flask Environment Variables
app.config.from_pyfile('backend/settings.py')

# Initialize BigQuery Client
client = bigquery.Client()

CORS(app) #comment this on deployment
api = Api(app)

app.register_blueprint(user_address_bp)
app.register_blueprint(overview_bp)

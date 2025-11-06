from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_migrate import Migrate
from flask_basicauth import BasicAuth
from flask_mail import Mail
from flask_socketio import SocketIO, emit

app = Flask(__name__)
socketio = SocketIO(app,cors_allowed_origins='*')

# email
app.config['MAIL_SERVER'] = "mail.ncmail.nc"
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = "bqs-clinotag@square.nc"
app.config['MAIL_PASSWORD'] = "58Tfrg$/4K"

mail = Mail(app)

app.config['BASIC_AUTH_USERNAME'] = 'admin'
app.config['BASIC_AUTH_PASSWORD'] = 'admin'

basic_auth = BasicAuth(app)

# jwt-passport
app.config['JWT_SECRET_KEY'] = 'secret!!!'
jwt = JWTManager(app)

# connect to the MySql
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:''@localhost:3306/pulsepoint'
# app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://pulsepoint:Share7#@202.87.138.165:3308/pulsepoint_prod'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
migrate = Migrate(app, db)

@app.before_request
def create_tables():
    # Import models to ensure they are registered
    from models.user import UserModel
    from models.ticket import Ticket
    from models.support import Support
    db.create_all()

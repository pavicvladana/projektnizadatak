from concurrent.futures import process
from datetime import datetime
from datetime import timedelta
from datetime import timezone
from locale import currency
from urllib import response
from decimal import Decimal
from flask import Flask, request, Response
from flask import jsonify

from flask_jwt_extended import create_access_token
from flask_jwt_extended import get_jwt
from flask_jwt_extended import get_jwt_identity
from flask_jwt_extended import jwt_required
from flask_jwt_extended import JWTManager
from flask_jwt_extended import set_access_cookies
from flask_jwt_extended import unset_jwt_cookies
from flask_expects_json import expects_json
import os
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import false
from json_schemas import login_schema, register_schema, activation_schema, deposit_schema, send_schema
from flask_cors import CORS
from random import seed
from random import randint
from threading import Thread
from strenum import StrEnum

seed(datetime.now())

app = Flask(__name__)
CORS(app)

# database setup
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(os.path.dirname(os.path.realpath(__file__)),'database.db')

db = SQLAlchemy(app)

#region models

class CreditCard():
    def __init__(self, cc_number, name, exp_date, password):
        self.cc_number = cc_number
        self.name = name
        self.exp_date = exp_date
        self.password = password

credit_cards = {"1234123412341234":CreditCard("1234123412341234", "Milan miki", "11/22", 1111)}

class User(db.Model):
    username = db.Column(db.String(18), primary_key=True)
    email = db.Column(db.String(50), nullable=False, unique=True)
    active = db.Column(db.Boolean, nullable=False)
    password = db.Column(db.String(25), nullable=False)
    lastname = db.Column(db.String(30), nullable=False)
    firstname = db.Column(db.String(30), nullable=False)
    address = db.Column(db.String(30), nullable=False)
    city = db.Column(db.String(30), nullable=False)
    country = db.Column(db.String(25), nullable=False)
    phone = db.Column(db.String(20), nullable=False)

    def user_data(self):
        output = {}
        output['username'] = self.username
        output['fistname'] = self.firstname
        output['email'] = self.email
        output['active'] = self.active
        output['lastName'] = self.lastname
        output['address'] = self.address
        output['city'] = self.city
        output['country'] = self.country
        output['phone'] = self.phone
        return output

class Account(db.Model):
    id = db.Column(db.String, primary_key=True)
    balance = db.Column(db.DECIMAL(12,2), nullable=False)
    currency = db.Column(db.String(3), nullable=False)
    owner = db.Column(db.String(18), db.ForeignKey(User.username))
    def account_data(self):
            output = {}
            output['id'] = self.id
            output['balance'] = self.balance
            output['currency'] = self.currency
            output['owner'] = self.owner
            return output

class Transaction(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    amount = db.Column(db.DECIMAL(12,2), nullable=False)
    currency = db.Column(db.String(3), nullable=False)
    payer = db.Column(db.String(18), db.ForeignKey(User.username))
    receiver = db.Column(db.String(50), nullable=False)
    state = db.Column(db.String(50), nullable=False)

    def data(self):
            output = {}
            output['id'] = self.id
            output['amount'] = self.amount
            output['currency'] = self.currency
            output['payer'] = self.payer
            output['receiver'] = self.receiver
            output['state'] = self.state
            return output

class ETransactionState(StrEnum):
    in_progress = "IN_PROGRESS"
    success = "SUCCESS"
    failed = "FAILED"

#endregion

# If true this will only allow the cookies that contain your JWTs to be sent
# over https. In production, this should always be set to True
app.config["JWT_SECRET_KEY"] = "sbes-tim"  # Change this in your code!
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=1)

jwt = JWTManager(app)


# Using an `after_request` callback, we refresh any token that is within 30
# minutes of expiring. Change the timedeltas to match the needs of your application.
@app.after_request
def refresh_expiring_jwts(response):
    try:
        exp_timestamp = get_jwt()["exp"]
        now = datetime.now(timezone.utc)
        target_timestamp = datetime.timestamp(now + timedelta(minutes=30))
        if target_timestamp > exp_timestamp:
            access_token = create_access_token(identity=get_jwt_identity())
            set_access_cookies(response, access_token)
        return response
    except (RuntimeError, KeyError):
        # Case where there is not a valid JWT. Just return the original respone
        return response


@app.route("/login", methods=["POST"])
@expects_json(login_schema)
def login():
    data = request.get_json()
    user = User.query.filter_by(email = data['email'], password = data['password']).first()
    if user is None:
        return jsonify({"error":"username/password is wrong"})
        #return jsonify({"error":"username/password is wrong"})

    access_token = create_access_token(identity=user.username)
    return jsonify(access_token=access_token, active=user.active)


@app.route("/logout", methods=["POST"])
def logout():
    response = jsonify({"msg": "logout successful"})
    unset_jwt_cookies(response)
    return response

@app.route("/register", methods=["POST"])
@expects_json(register_schema)
def register():
    data = request.get_json()

    user = User.query.filter_by(email=data['email']).first()
    if user:
        return jsonify({"error":"user with given email already exists!"})

    user = User.query.filter_by(username=data['username']).first()
    if user:
        return jsonify({"error":"user with given username already exists!"})
    

    new_user = User(
         username=data['username'],
         email=data['email'], 
         password=data['password'], 
         active=False,
         firstname=data['firstname'],
         lastname=data['lastname'],
         address=data['address'],
         city=data['city'],
         country=data['country'],
         phone=data['phone']
         )

    db.session.add(new_user)
    db.session.commit()

    return jsonify({'msg' : 'new user created!'})

@app.route("/user", methods=["GET"])
@jwt_required()
def user():
    username = get_jwt_identity()
    user = User.query.filter_by(username=username).first()
    if user is None:
        return jsonify({"error":"unable to find user"})
    
    return user.user_data()

@app.route("/user/activate", methods=["POST"])
@jwt_required()
@expects_json(activation_schema)
def activate_user():
    data = request.get_json()
    username = get_jwt_identity()
    user = User.query.filter_by(username=username).first()
    if user is None:
        return jsonify({"error":"unable to find user"})
    
    if user.active:
        return jsonify({"error": "user is already activated!"})

    cc = credit_cards[data['cc_number']]
    if cc is None:
        return jsonify({"error": "invalid credit card number!"})
    
    user.active = True
    acc = Account(
        id = str(randint(100,999)) + "-" + str(randint(100000,999999)),
        balance = 0,
        currency = "RSD",
        owner = username
    )
    db.session.add(acc)
    db.session.commit()

    return jsonify({"msg":"user activated!"})

@app.route("/user/state")
@jwt_required()
def user_state():
    username = get_jwt_identity()
    user = User.query.filter_by(username=username).first()
    if user is None:
        return jsonify({"error":"unable to find user"})
    
    accs = Account.query.filter_by(owner=user.username)
    
    return jsonify({"accounts": [acc.account_data() for acc in accs]})
        
@app.route("/user/deposit", methods=["POST"])
@jwt_required()
@expects_json(deposit_schema)
def deposit():
    data = request.get_json()
    username = get_jwt_identity()
    user = User.query.filter_by(username=username).first()
    if user is None:
        return jsonify({"error":"unable to find user"})
    if not user.active:
        return jsonify({"error":"user is not activated"})
    
    #check credit card

    acc = Account.query.filter_by(owner=user.username, currency="RSD").first()
    acc.balance += Decimal(data['amount'])
    db.session.commit()

    return jsonify({"msg":"money deposited."})

@app.route("/user/transactions", methods=["Post"])
@jwt_required()
def transactions():
    username = get_jwt_identity()
    user = User.query.filter_by(username=username).first()
    if user is None:
        return jsonify({"error":"unable to find user"})
    
    accs_payer = Transaction.query.filter_by(payer=user.username)
    accs_receiver = Transaction.query.filter_by(receiver=user.username)
    
    return jsonify({"trans_as_payer": [acc.account_data() for acc in accs_payer], "trans_as_receiver": [acc.account_data() for acc in accs_receiver]})

@app.route("/user/send-to-user", methods=["POST"])
@jwt_required()
@expects_json(send_schema)
def send_money_to_user():
    data = request.get_json()
    username = get_jwt_identity()
    user = User.query.filter_by(username=username).first()
    if user is None:
        return jsonify({"error":"unable to find user"})
    if not user.active:
        return jsonify({"error":"user is not activated"})
    
    receiver = User.query.filter_by(email=data['to']).first()
    if receiver is None:
        return jsonify({"error":"unable to find user"})
    if not receiver.active:
        return jsonify({"error":"user is not activated"})
    

    acc = Account.query.filter_by(id=data['acc_id']).first()
    if acc is None:
        return jsonify({"error":"there is no account with given currency"})

    amount = Decimal(data['amount'])
    trans = Transaction(
        amount = amount,
        currency = acc.currency,
        payer = user.username,
        receiver = receiver.username,
        state = str(ETransactionState.in_progress)
    )
    db.session.add(trans)
    
    process = Thread(target=send_to_user_process, args=(trans, acc, receiver, amount, app, ))
    process.start()
    db.session.commit()

    return jsonify({"msg":"transaction started."})

def send_to_user_process(transaction, acc, receiver, amount, app, db):
    with app.app_context():
        transaction = Transaction.query.filter_by(id=transaction.id).first()

        if acc.balance < amount:
            transaction.state = str(ETransactionState.failed)
            return jsonify({"error":"not enough money on account."})

        receiver_acc = Account.query.filter_by(owner=receiver.username, currency=acc.currency).first()
        if receiver_acc is None:
            receiver_acc = Account(
                id = str(randint(100,999)) + "-" + str(randint(100000,999999)),
                balance = 0,
                currency = acc.currency,
                owner = receiver.username
            )
            db.session.add(acc)
        
        
        transaction.state = str(ETransactionState.success)
        acc.balance -= amount
        receiver_acc += amount
        
        db.session.commit()

#@app.route("/user/sent-to-bank-account")
#@jwt_required()
#@expects_json(send_schema)
def send_money_to_bank_account():
    data = request.get_json()
    username = get_jwt_identity()
    user = User.query.filter_by(username=username).first()
    if user is None:
        return jsonify({"error":"unable to find user"})
    if not user.active:
        return jsonify({"error":"user is not activated"})
    
    receiver = User.query.filter_by(username=data['to']).first()
    if receiver is None:
        return jsonify({"error":"unable to find user"})
    if not receiver.active:
        return jsonify({"error":"user is not activated"})
    
    acc = Account.query.filter_by(owner=user.username, currency=data['currency']).first()

    amount = Decimal(data['amount'])
    
    if acc.balance < amount:
        return jsonify({"error":"not enough money on account."})
    
    acc.balance -= amount
    db.session.commit()

    return jsonify({"msg":"money deposited."})



if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(debug=True, use_debugger=False, use_reloader=False)
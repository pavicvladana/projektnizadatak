from concurrent.futures import process
from datetime import datetime
from datetime import timedelta
from datetime import timezone
import email
from locale import currency
from time import sleep
from urllib import response
from decimal import Decimal
from flask import Flask, request, Response, session
from flask import jsonify
import requests
from flask_jwt_extended import create_access_token
from flask_jwt_extended import get_jwt
from flask_jwt_extended import get_jwt_identity
from flask_jwt_extended import jwt_required
from flask_jwt_extended import JWTManager
from flask_expects_json import expects_json
import os
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import false
from json_schemas import *
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
        output['firstname'] = self.firstname
        output['email'] = self.email
        output['active'] = self.active
        output['lastname'] = self.lastname
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
            rec_user = User.query.filter_by(username = self.receiver).first()
            if(rec_user is None):
                output['receiver'] = self.receiver
            else:
                output['receiver'] = rec_user.email
            
            output['state'] = self.state
            return output

class ETransactionState(StrEnum):
    in_progress = "In progress"
    success = "Success"
    failed = "Failed"

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

@app.route('/user', methods=["PUT"])
@jwt_required()
@expects_json(user_edit_schema)
def edit_user():
    data = request.get_json()
    username = get_jwt_identity()
    user = User.query.filter_by(username=username).first()
    if user is None:
        return jsonify({"error":"unable to find user"})

    user.firstname = data['firstname']
    user.lastname = data['lastname']
    user.address = data['address']
    user.city = data['city']
    user.country = data['country']
    user.phone = data['phone']

    db.session.commit()

    return jsonify({"msg":"user successfully modified!"})

@app.route('/user/reset-password', methods=["POST"])
@jwt_required()
@expects_json(password_reset_schema)
def reset_password():
    data = request.get_json()
    username = get_jwt_identity()
    user = User.query.filter_by(username=username).first()
    if user is None:
        return jsonify({"error":"unable to find user"})

    if user.password != data['old_password']:
        return jsonify({"error":"wrong old password!"})

    user.password = data['password']

    db.session.commit()

    return jsonify({"msg":"password successfully changed!"})

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

@app.route("/user/transactions")
@jwt_required()
def transactions():
    username = get_jwt_identity()
    user = User.query.filter_by(username=username).first()
    if user is None:
        return jsonify({"error":"unable to find user"})
    
    trans_payer = Transaction.query.filter_by(payer=user.username)
    trans_receiver = Transaction.query.filter_by(receiver=user.username)
    
    return jsonify({"trans_as_payer": [trans.data() for trans in trans_payer], "trans_as_receiver": [trans.data() for trans in trans_receiver]})

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
    
    if receiver.username == user.username:
        return jsonify({"error":"you cannot send money to your accounts."})

    acc = Account.query.filter_by(id=data['acc_id']).first()
    if acc is None:
        return jsonify({"error":"there is no account with given currency"})

    amount = Decimal(data['amount'])
    
    process = Thread(target=send_to_user_process, args=(user, acc, receiver, amount, app, ))
    process.start()

    return jsonify({"msg":"transaction started."})

def send_to_user_process(payer, acc, receiver, amount, app):
    with app.app_context():
        trans = Transaction(
            amount = amount,
            currency = acc.currency,
            payer = payer.username,
            receiver = receiver.username,
            state = str(ETransactionState.in_progress)
        )
        db.session.add(trans)
        db.session.commit()
        sleep(20)
        acc = Account.query.filter_by(id=acc.id).first()
        if acc.balance < amount:
            trans.state = str(ETransactionState.failed)
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
        
        
        trans.state = str(ETransactionState.success)
        acc.balance -= amount
        receiver_acc.balance += amount
        
        db.session.commit()

@app.route("/user/sent-to-bank-account", methods=["POST"])
@jwt_required()
@expects_json(send_schema)
def send_money_to_bank_account():
    data = request.get_json()
    username = get_jwt_identity()
    user = User.query.filter_by(username=username).first()
    if user is None:
        return jsonify({"error":"unable to find user"})
    if not user.active:
        return jsonify({"error":"user is not activated"})
    
    acc = Account.query.filter_by(id=data['acc_id']).first()
    if acc is None:
        return jsonify({"error":"there is no account with given currency"})

    amount = Decimal(data['amount'])
    
    if acc.balance < amount:
        return jsonify({"error":"not enough money on account."})
    
    process = Thread(target=send_to_bank_account, args=(user, acc.id, data['to'], amount, app,))
    process.start()

    return jsonify({"msg":"money deposited."})

def send_to_bank_account(payer, acc_id, receiver, amount, app):
    with app.app_context():
        acc = Account.query.filter_by(id=acc_id).first()
        trans = Transaction(
            amount = amount,
            payer = payer.username,
            currency = acc.currency,
            receiver = receiver,
            state = str(ETransactionState.in_progress)
        )
        db.session.add(trans)
        db.session.commit()
        sleep(10)

        if acc.balance < amount:
            trans.state = str(ETransactionState.failed)
            db.session.commit()
            return
        
        trans.state = str(ETransactionState.success)
        acc.balance -= amount
        sleep(10)
        db.session.commit()

@app.route("/exchange")
@jwt_required()
def exchange():
    r = requests.get("https://api.fastforex.io/fetch-all?from=RSD&api_key=585d303673-7f543ac429-r6645m").json()['results']
    return r

@app.route("/exchange", methods=['POST'])
@jwt_required()
@expects_json(exchange_schema)
def exchange_money():
    data = request.get_json()
    username = get_jwt_identity()
    user = User.query.filter_by(username=username).first()
    if user is None:
        return jsonify({"error":"unable to find user"})
    if not user.active:
        return jsonify({"error":"user is not activated"})
    
    #check currency
    currency = data['currency']
    r = requests.get("https://api.fastforex.io/fetch-all?from=RSD&api_key=585d303673-7f543ac429-r6645m").json()['results']
    if r is None:
        return jsonify({"error":"invalid currency"})
    #check credit card

    acc = Account.query.filter_by(owner=user.username, currency=currency).first()
    if acc is None:
        acc = Account(
            id = str(randint(100,999)) + "-" + str(randint(100000,999999)),
            balance = 0,
            currency = currency,
            owner = username
        )
        db.session.add(acc)

    acc.balance += Decimal(data['amount'])
    db.session.commit()

    return jsonify({"msg":"money exchanged."})


if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(debug=True, use_debugger=False, use_reloader=False)
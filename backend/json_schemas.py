login_schema = {
    'type': 'object',
    'properties': {
        'email': {'type': 'string'},
        'password': {'type': 'string'}
    },
    'required': ['email', 'password']
}

register_schema = {
    'type': 'object',
    'properties': {
        'username': {'type': 'string'},
        'email': {'type': 'string'},
        'password': {'type': 'string'},
        'firstname': {'type': 'string'},
        'lastname': {'type': 'string'},
        'address': {'type': 'string'},
        'city': {'type': 'string'},
        'country': {'type': 'string'},
        'phone': {'type': 'string'}
    },
    'required': ['email', 'username', 'password', 'firstname', 'lastname', 'address', 'city', 'country', 'phone']
}

password_reset_schema = {
    'type': 'object',
    'properties': {
        'old_password': {'type': 'string'},
        'password': {'type': 'string'}
    },
    'required': ['old_password', 'password']
}


user_edit_schema = {
    'type': 'object',
    'properties': {
        'firstname': {'type': 'string'},
        'lastname': {'type': 'string'},
        'address': {'type': 'string'},
        'city': {'type': 'string'},
        'country': {'type': 'string'},
        'phone': {'type': 'string'}
    },
    'required': ['firstname', 'lastname', 'address', 'city', 'country', 'phone']
}

activation_schema = {
    'type': 'object',
    'properties': {
        'cc_number': {'type': 'string'},
        'name': {'type': 'string'},
        'exp_date': {'type': 'string'},
        'password': {'type': 'string'}
    },
    'required': ['cc_number', 'name', 'exp_date', 'password']
}

deposit_schema = {
    'type': 'object',
    'properties': {
        'cc_number': {'type': 'string'},
        'name': {'type': 'string'},
        'exp_date': {'type': 'string'},
        'password': {'type': 'string'},
        'amount': {'type': 'number'}
    },
    'required': ['cc_number', 'name', 'exp_date', 'password', 'amount']
}

send_schema = {
    'type': 'object',
    'properties': {
        'to': {'type': 'string'},
        'acc_id': {'type': 'string'},
        'amount': {'type': 'number'}
    },
    'required': ['to', 'acc_id', 'amount']
}

exchange_schema = {
    'type': 'object',
    'properties': {
        'cc_number': {'type': 'string'},
        'name': {'type': 'string'},
        'exp_date': {'type': 'string'},
        'password': {'type': 'string'},
        'amount': {'type': 'number'},
        'currency': {'type': 'string'}
    },
    'required': ['cc_number', 'name', 'exp_date', 'password', 'amount', 'currency']
}
from start import db, socketio

class UserModel(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key = True)
    company = db.Column(db.String(255))
    hotelname = db.Column(db.String(255), unique = True)
    firstname = db.Column(db.String(255), nullable = False)
    lastname = db.Column(db.String(255), nullable = False)
    phonenumber = db.Column(db.String(255), nullable = False)
    email = db.Column(db.String(255), nullable = False)
    address = db.Column(db.String(255), nullable = False)
    contact = db.Column(db.String(255))
    password = db.Column(db.String(255), nullable = False)
    status = db.Column(db.Integer, default=0)
    isVerify = db.Column(db.Integer, default=0)
    role = db.Column(db.Integer, default=1)
    uniqueString = db.Column(db.String(255))
    verifyCode = db.Column(db.String(255))

    @socketio.on('connect_device')
    def handle_connect(data):
        socketio.emit('device_connect', data)

    @socketio.on('disconnect_device')
    def handle_disconnect(serialNumber):
        socketio.emit('device_disconnect', serialNumber)
    
    def save_to_db(self):
        db.session.add(self)
        db.session.commit()

    @classmethod
    def find_by_email(cls, email):
        user = db.session.query(cls) \
                        .filter(cls.email == email) \
                        .first()
        if user:
            return {
                'id': user.id,
                'company': user.company,
                'hotelname': user.hotelname,
                'firstname': user.firstname,
                'lastname': user.lastname,
                'phonenumber': user.phonenumber,
                'email': user.email,
                'address': user.address,
                'contact': user.contact,
                'password': user.password,
                'status': user.status,
                'role': user.role,
                'isVerify': user.isVerify
            }
        else:
            return None
        
    @classmethod
    def find_by_hotelname(cls, hotelname):
        user = db.session.query(cls) \
                        .filter(cls.hotelname == hotelname) \
                        .first()
        if user:
            return {
                'id': user.id,
                'company': user.company,
                'hotelname': user.hotelname,
                'firstname': user.firstname,
                'lastname': user.lastname,
                'phonenumber': user.phonenumber,
                'email': user.email,
                'address': user.address,
                'contact': user.contact,
                'password': user.password,
                'status': user.status,
                'role': user.role,
                'isVerify': user.isVerify
            }
        else:
            return None
        
    @classmethod
    def find_by_id(cls, id):
        user = db.session.query(cls) \
                        .filter(cls.id == id) \
                        .first()
        if user:
            return {
                'id': user.id,
                'company': user.company,
                'hotelname': user.hotelname,
                'firstname': user.firstname,
                'lastname': user.lastname,
                'phonenumber': user.phonenumber,
                'email': user.email,
                'address': user.address,
                'contact': user.contact,
                'password': user.password,
                'status': user.status,
                'role': user.role,
                'uniqueString': user.uniqueString,
                'verifyCode': user.verifyCode
            }
        else:
            return None

    @classmethod
    def return_all(cls):
        def to_json(x):
            return {
                'id': x.id,
                'company': x.company,
                'hotelname': x.hotelname,
                'firstname': x.firstname,
                'lastname': x.lastname,
                'phonenumber': x.phonenumber,
                'email': x.email,
                'address': x.address,
                'contact': x.contact,
                'status': x.status,
                'role': x.role,
                'isVerify': x.isVerify,
            }
            
        query_result = db.session.query(
            UserModel.id,
            UserModel.company,
            UserModel.hotelname,
            UserModel.firstname,
            UserModel.lastname,
            UserModel.phonenumber,
            UserModel.email,
            UserModel.address,
            UserModel.contact,
            UserModel.status,
            UserModel.role,
            UserModel.isVerify
        ).filter(UserModel.role == 1)

        return list(map(lambda x: to_json(x), query_result))

    @classmethod
    def delete_all(cls):
        try:
            num_rows_deleted = db.session.query(cls).delete()
            db.session.commit()
            return {'message': '{} row(s) deleted'.format(num_rows_deleted)}
        except:
            return {'message': 'Something went wrong'}
    
    @classmethod
    def update_one(cls, id, status):
        try:
            record = cls.query.get(id)
            record.status = status
            db.session.commit()
        except:
            return {'message': 'error'}
        
    @classmethod
    def update_userinfo(cls, id, password):
        try:
            record = cls.query.get(id)
            record.password = password
            db.session.commit()
        except:
            return {'message': 'error'}
        
    @classmethod
    def update_password(cls, id, firstname, lastname, phonenumber, address, contact):
        try:
            record = cls.query.get(id)
            record.firstname = firstname
            record.lastname = lastname
            record.phonenumber = phonenumber
            record.address = address
            record.contact = contact
            db.session.commit()
        except:
            return {'message': 'error'}
        
    @classmethod
    def verify_account(cls, id):
        try:
            record = cls.query.get(id)
            record.isVerify = 1
            db.session.commit()
        except:
            return {'message': 'error'}
    
    @classmethod
    def update_user_details(cls, id, email, firstname, lastname, company, hotelname, role, status, isVerify):
        try:
            record = cls.query.get(id)
            if not record:
                return {'status': -1, 'message': 'User not found'}
            
            record.email = email
            record.firstname = firstname
            record.lastname = lastname
            record.company = company
            record.hotelname = hotelname
            record.role = role
            record.status = status
            record.isVerify = isVerify
            db.session.commit()
            
            return {'status': 1, 'message': 'User updated successfully'}
        except Exception as e:
            return {'status': -1, 'message': f'Error updating user: {str(e)}'}
        
    @classmethod
    def delete_one(cls, id):
        try:
            row_deleted = cls.query.filter_by(id=id).first()
            if not row_deleted:
                return {'status': -1, 'message': 'User not found'}
            
            db.session.delete(row_deleted)
            db.session.commit()
            return {'status': 1, 'message': 'User deleted successfully'}
        except Exception as e:
            return {'status': -1, 'message': f'Error deleting user: {str(e)}'}
        
    @classmethod
    def update_unique_string(cls, id, unique):
        try:
            record = cls.query.get(id)
            record.uniqueString = unique
            db.session.commit()
        except:
            return {'message': 'error'}
        
    @classmethod
    def update_verify_code(cls, id, verifyCode):
        try:
            record = cls.query.get(id)
            record.verifyCode = verifyCode
            db.session.commit()
        except:
            return {'message': 'error'}

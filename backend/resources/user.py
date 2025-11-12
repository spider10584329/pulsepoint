from flask import request
from models.user import UserModel
from models.appliedproject import AppliedProjectModel
from flask_restful import Resource, reqparse
from datetime import timedelta
from common.password import generate_hash, verify_password
from flask_jwt_extended import (create_access_token, create_refresh_token, jwt_required)
from start import mail, app
from flask_mail import Message
import random
import string
from start import basic_auth

parser = reqparse.RequestParser()
parser.add_argument('id')
parser.add_argument('company')
parser.add_argument('hotelname')
parser.add_argument('firstname')
parser.add_argument('lastname')
parser.add_argument('phonenumber')
parser.add_argument('email')
parser.add_argument('address')
parser.add_argument('contact')
parser.add_argument('password')
parser.add_argument('opassword')
parser.add_argument('npassword')
parser.add_argument('status')
parser.add_argument('projectId')
parser.add_argument('uniqueString')
parser.add_argument('verifyCode')
parser.add_argument('username')
parser.add_argument('role')
parser.add_argument('isVerify')

class UserRegister(Resource):
    def post(self):
        data = parser.parse_args()

        if (UserModel.find_by_email(data['email'])):
            return {
                'message': 'Email {} already exists'.format(data['email']),
                'status': 0
            }, 400
        
        if (UserModel.find_by_hotelname(data['hotelname'])):
            return {
                'message': 'Hotel Name should be unique.'.format(data['hotelname']),
                'status': 0
            }, 400
        
        new_user = UserModel(
            company = data['company'],
            hotelname = data["hotelname"],
            firstname = data['firstname'],
            lastname = data['lastname'],
            phonenumber = data['phonenumber'],
            email = data['email'],
            address = data['address'],
            contact = data['contact'],
            password = generate_hash(data['password'])
        )
        try:
            new_user.save_to_db()

            verifyCode = verifyCode_generator()
            UserModel.update_verify_code(new_user.id, verifyCode)

            msg = Message(subject='From Clinotag Tools As A Service',
                      sender = app.config['MAIL_USERNAME'],
                      recipients=[data['email']],
                      html=f"""<!DOCTYPE html>
                            <html lang='en'>
                            <head>
                                <meta charset='UTF-8'>
                                <meta name='viewport' content='width=device-width, initial-scale=1.0'>
                                <title>Account Verification</title>
                            </head>
                            <body>
                                <p>Hi, {data['firstname']} {data['lastname']}</p>
                                <p>Thank you for signing up for Clinotag Tools As A Service! Please verify your email address by entering the following code:</p>
                                <p>Verification Code: <strong>{verifyCode}</strong></p>
                                <p>This code will expire in 24 hours.</p>
                                <p>If you did not request account verification, please ignore this email.</p>
                                <p>If you have any questions or need assistance, please contact us at [Support Email Address] or [Phone Number].</p><br>
                                <p>Sincerely,</p>
                                <p>The Clinotag Team</p>
                            </body>
                            </html>""")
            try:
                with app.app_context():
                    mail.send(msg)
                return {
                    "message": "Email sent successfully!",
                    'status': 1,
                    'userId': new_user.id
                }, 200
            except Exception as e:
                return f"Failed to send email: {str(e)}", 500
        except Exception as e:
            return {'message': str(e)}, 400

class UserLogin(Resource):
    def post(self):
        data = parser.parse_args()
        current_user = UserModel.find_by_email(data['email'])
        if not current_user:
            return {'message': 'Email {} doesn\'t exists.'.format(data['email']), 'status': -1}, 200
        if verify_password(data['password'], current_user["password"]):
            access_token = create_access_token(identity=data['email'], fresh=False, expires_delta=timedelta(days=1))
            refresh_token = create_refresh_token(identity=data['email'])
            
            user_json = {
                'id': current_user["id"],
                'company': current_user["company"],
                'hotelname': current_user["hotelname"],
                'firstname': current_user["firstname"],
                'lastname': current_user["lastname"],
                'phonenumber': current_user["phonenumber"],
                'email': current_user["email"],
                'address': current_user["address"],
                'contact': current_user["contact"],
                'status': current_user["status"],
                'role': current_user["role"],
                'isVerify': current_user["isVerify"]
            }

            return {
                'message': 'Logged in as {}'.format(current_user["email"]),
                'access_token': f'{access_token}',
                'refresh_token': refresh_token,
                'status': 1,
                'user': user_json
            }, 200
        
        else:
            return {'message': 'Wrong Password', 'status': 0}
        
class UserLoginWithProject(Resource):
    def post(self):
        data = parser.parse_args()
        current_user = UserModel.find_by_email(data['username'])
        if not current_user:
            return {'message': 'Username {} doesn\'t exists.'.format(data['username']), 'status': -1}, 200
        if verify_password(data['password'], current_user["password"]):
            access_token = create_access_token(identity=data['username'], fresh=False, expires_delta=timedelta(days=1))
            refresh_token = create_refresh_token(identity=data['username'])
            
            user_json = {
                'id': current_user["id"],
                'company': current_user["company"],
                'hotelname': current_user["hotelname"],
                'firstname': current_user["firstname"],
                'lastname': current_user["lastname"],
                'phonenumber': current_user["phonenumber"],
                'email': current_user["email"],
                'address': current_user["address"],
                'contact': current_user["contact"],
                'status': current_user["status"],
                'role': current_user["role"]
            }
            userId = current_user["id"]
            
            project = AppliedProjectModel.find_by_user_project(userId, data['projectId'])

            if project:
                project_json = {
                    'isApply': project.is_apply,
                    'purchaseDate': project.purchase_date,
                    'periodicity': project.periodicity,
                    'userCount': project.user_count
                }

                return {
                    'message': 'Logged in as {}'.format(current_user["email"]),
                    'access_token': f'{access_token}',
                    'refresh_token': refresh_token,
                    'status': 1,
                    'user': user_json,
                    'project': project_json
                }, 200
            
            else:
                return {'message': "You have not applied this project yet"}
        
        else:
            return {'message': 'Wrong Password', 'status': 0}
        
class UpdateUserInfo(Resource):
    @jwt_required()
    def post(self):
        data = parser.parse_args()
        current_user = UserModel.find_by_email(data['email'])
        
        try:
            UserModel.update_password(current_user["id"], 
                                      data['firstname'], 
                                      data['lastname'], 
                                      data['phonenumber'],
                                      data['address'],
                                      data['contact'])
            return {'message': 'User Profile Updated', 'status': 1}
        except Exception as e:
            return {'error': str(e), 'status': 0}
        
class UpdatePassword(Resource):
    @jwt_required()
    def post(self):
        data = parser.parse_args()
        current_user = UserModel.find_by_email(data['email'])
        
        if verify_password(data['opassword'], current_user["password"]):
            UserModel.update_password(current_user["id"], generate_hash(data['npassword']))
            
            return {'message': 'Password Updated', 'status': 1}
        else:
            return {'message': 'Wrong Password', 'status': 0}
        
class UpdateNewPassword(Resource):
    @jwt_required()
    def post(self):
        data = parser.parse_args()
        try:
            UserModel.update_password(data['id'], generate_hash(data['npassword']))
            return {'message': 'Password updated!'}, 200
        except Exception as e:
            return {'message': str(e)}, 500

class AllUsers(Resource):
    # @basic_auth.required
    def get(self):
        try:
            return UserModel.return_all()
        except Exception as e:
            return { 'error': str(e) }, 400
    
    @jwt_required()
    def post(self):
        return UserModel.delete_all()
    
class UpdateUser(Resource):
    @jwt_required()
    def put(self):
        data = parser.parse_args()
        return UserModel.update_one(request.args.get('id'), data['status'])

class UpdateUserDetails(Resource):
    @jwt_required()
    def put(self):
        # Handle both JSON and form data
        if request.is_json:
            data = request.get_json()
        else:
            data = parser.parse_args()
        user_id = request.args.get('id')
        
        # Check if password is provided
        password = data.get('password', None)
        
        return UserModel.update_user_details(
            user_id,
            data['email'],
            data['firstname'], 
            data['lastname'],
            data['company'],
            data['hotelname'],
            int(data['role']),
            int(data['status']),
            int(data['isVerify']),
            password
        )
    
class DeleteUser(Resource):
    @jwt_required()
    def delete(self):
        return UserModel.delete_one(request.args.get('id'))
    
class UpdateProfile(Resource):
    @jwt_required()
    def put(self):
        # Handle JSON data
        data = request.get_json()
        
        # Get current user from JWT token
        from flask_jwt_extended import get_jwt_identity
        email = get_jwt_identity()
        current_user = UserModel.find_by_email(email)
        
        print(f"UpdateProfile - Email from JWT: {email}")
        print(f"UpdateProfile - Current user: {current_user}")
        print(f"UpdateProfile - Request data: {data}")
        
        if not current_user:
            return {'message': 'User not found', 'status': 0}, 404
        
        # If password change is requested, verify current password
        if 'password' in data and data.get('password'):
            current_password = data.get('currentPassword')
            if not current_password:
                return {'message': 'Current password is required', 'status': 0}, 400
            
            if not verify_password(current_password, current_user["password"]):
                return {'message': 'Current password is incorrect', 'status': 0}, 400
            
            # Update with new password
            new_password_hash = generate_hash(data['password'])
        else:
            # Keep existing password
            new_password_hash = None
        
        try:
            # Update user information
            result = UserModel.update_user_profile(
                current_user["id"],
                data.get('company', current_user["company"]),
                data.get('hotelname', current_user["hotelname"]),
                data.get('firstname', current_user["firstname"]),
                data.get('lastname', current_user["lastname"]),
                data.get('email', current_user["email"]),
                data.get('phonenumber', current_user["phonenumber"]),
                data.get('address', current_user["address"]),
                data.get('contact', current_user["contact"]),
                new_password_hash
            )
            
            if result['status'] == 1:
                return {'message': 'Profile updated successfully', 'status': 1}, 200
            else:
                print(f"UpdateProfile - Error from model: {result}")
                return {'message': result.get('message', 'Failed to update profile'), 'status': 0}, 500
        except Exception as e:
            print(f"UpdateProfile - Exception: {str(e)}")
            import traceback
            traceback.print_exc()
            return {'message': str(e), 'status': 0}, 500
    
class SendForgetPasswordMail(Resource):
    def post(self):
        data = parser.parse_args()
        user = UserModel.find_by_email(data['email'])

        if user == None:
            return {"message": "Email Not Found", "status": -1}
        else:
            generatedId = id_generator(30)
            UserModel.update_unique_string(user['id'], generatedId)
            msg = Message(subject='From Clinotag Tools As A Service',
                      sender = app.config['MAIL_USERNAME'],
                      recipients=[data['email']],
                      html=f"""<!DOCTYPE html>
                            <html lang='en'>
                            <head>
                                <meta charset='UTF-8'>
                                <meta name='viewport' content='width=device-width, initial-scale=1.0'>
                                <title>Display Image</title>
                            </head>
                            <body>
                                <p>Hi, {user['firstname']} {user['lastname']}</p>
                                <p>You requested a password reset for your Clinotag Tools As A Service account. Click the link below to reset your password:</p>
                                <a href='https://pulsepoint.myrfid.nc/forgot-password/{generatedId}?id={user['id']}'>Reset Password</a>
                                <p>If you did not request a password reset, please ignore this email.</p>
                                <p>For security reasons, this link will expire in 24 hours.</p>
                                <p>If you have any questions or need assistance, please contact us at bqs-clinotag@square.nc</p><br>
                                <p>Sincerely,</p>
                                <p>The Clinotag Team</p>
                            </body>
                            </html>""")
        try:
            with app.app_context():
                mail.send(msg)
            return {"message": "Email sent successfully!"}, 200
        except Exception as e:
            return f"Failed to send email: {str(e)}", 500
        
class CheckUniqueString(Resource):
    def post(self):
        data = parser.parse_args()
        user = UserModel.find_by_id(data['id'])
        uniqueString = data['uniqueString']

        if user == None:
            return {'message': 'User Not Found'}, 500
        if user['uniqueString'] == uniqueString:
            return True
        else:
            return False
        
class CheckVerification(Resource):
    def post(self):
        data = parser.parse_args()
        user = UserModel.find_by_id(data['id'])
        verifyCode = data['verifyCode']

        if user == None:
            return {'message': 'User Not Found'}, 500
        if user['verifyCode'] == verifyCode:
            UserModel.verify_account(data['id'])
            return True
        else:
            return False
        
class SendVerifyEmail(Resource):
    def post(self):
        data = parser.parse_args()

        verifyCode = verifyCode_generator()
        UserModel.update_verify_code(data['id'], verifyCode)

        msg = Message(subject='From Clinotag Tools As A Service',
                    sender = app.config['MAIL_USERNAME'],
                    recipients=[data['email']],
                    html=f"""<!DOCTYPE html>
                        <html lang='en'>
                        <head>
                            <meta charset='UTF-8'>
                            <meta name='viewport' content='width=device-width, initial-scale=1.0'>
                            <title>Account Verification</title>
                        </head>
                        <body>
                            <p>Hi, {data['firstname']} {data['lastname']}</p>
                            <p>Thank you for signing up for Clinotag Tools As A Service! Please verify your email address by entering the following code:</p>
                            <p>Verification Code: <strong>{verifyCode}</strong></p>
                            <p>This code will expire in 24 hours.</p>
                            <p>If you did not request account verification, please ignore this email.</p>
                            <p>If you have any questions or need assistance, please contact us at bqs-clinotag@square.nc</p><br>
                            <p>Sincerely,</p>
                            <p>The Clinotag Team</p>
                        </body>
                        </html>""")
        try:
            with app.app_context():
                mail.send(msg)
            return {
                "message": "Email sent successfully!",
                'status': 1,
                'userId': data['id']
            }, 200
        except Exception as e:
            return f"Failed to send email: {str(e)}", 500
        
def id_generator(size, chars = string.ascii_uppercase + string.digits):
    return ''.join(random.choice(chars) for _ in range(size))

def verifyCode_generator():
    digits = random.sample(range(0, 10), 6)
    return "".join(map(str, digits))

def activeCode_generator():
    chars = string.ascii_uppercase + string.digits
    return ''.join(random.choices(chars, k=6))
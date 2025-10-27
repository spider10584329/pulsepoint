from flask import request
from models.device import DeviceModel
from flask_restful import Resource, reqparse
from datetime import timedelta
from flask_jwt_extended import (create_access_token, create_refresh_token, jwt_required)
import random
import string

parser = reqparse.RequestParser()
parser.add_argument('id')
parser.add_argument('registration')
parser.add_argument('software')
parser.add_argument('serialNumber')
parser.add_argument('comment')
parser.add_argument('activeCode')

class DeviceRegister(Resource):
    def post(self):
        data = parser.parse_args()

        new_device = DeviceModel(
            registration = data['registration'],
            software = data['software'],
            serialNumber = data['serialNumber'],
            comment = data['comment'],
            activeCode = data["activeCode"],
        )
        try:
            new_device.save_to_db()
            return {
                "message": "New Device was Registered Successfully!",
                'status': 1,
                'deviceId': new_device.id
            }, 200
        
        except Exception as e:
            return {'message': str(e)}, 400

class DeviceLogin(Resource):
    def post(self):
        data = parser.parse_args()
        current_device = DeviceModel.find_by_id(data['id'])
        if not current_device:
            return {'message': 'Device doesn\'t exists.', 'status': -1}, 400
        if data['activeCode'] == current_device["activeCode"]:
            access_token = create_access_token(identity=data['id'], fresh=False, expires_delta=timedelta(days=1))
            refresh_token = create_refresh_token(identity=data['id'])
            
            device_json = {
                'id': current_device["id"],
                'name': current_device["name"],
                'activeCode': current_device["activeCode"]
            }

            return {
                'message': 'Logged in as {}'.format(current_device["name"]),
                'access_token': f'{access_token}',
                'refresh_token': refresh_token,
                'status': 1,
                'user': device_json
            }, 200
        
        else:
            return {'message': 'Wrong Password', 'status': 0}, 400
        
class UpdateDeviceInfo(Resource):
    @jwt_required()
    def put(self):
        data = parser.parse_args()
        current_user = DeviceModel.find_by_name(data['name'])
        
        try:
            DeviceModel.update_one(current_user["id"], 
                                      data['name'], 
                                      data['activeCode'])
            return {'message': 'Device Information Updated', 'status': 1}
        except Exception as e:
            return {'error': str(e), 'status': 0}
        
class AllDevices(Resource):
    # @basic_auth.required
    def get(self):
        try:
            return DeviceModel.return_all()
        except Exception as e:
            return { 'error': str(e) }, 400
    
    
class DeleteDevice(Resource):
    @jwt_required()
    def delete(self):
        return DeviceModel.delete_one(request.args.get('id'))
    

def activeCode_generator():
    chars = string.ascii_uppercase + string.digits
    return ''.join(random.choices(chars, k=6))
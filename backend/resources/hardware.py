from models.hardware import HardwareModal
from flask_restful import Resource, reqparse
from flask import request, send_from_directory, make_response
from flask_jwt_extended import jwt_required
import os

parser = reqparse.RequestParser()
parser.add_argument('id')
parser.add_argument('name')
parser.add_argument('description')
parser.add_argument('price')
parser.add_argument('isRent')

class CreateHardware(Resource):
    @jwt_required()
    def post(self):
        file = None

        try:
            if 'file' in request.files:
                file = request.files['file']
            name = request.form.get('name')
            description = request.form.get('description')
            price = request.form.get('price')
            if file:
                file.save(os.path.join('uploads', file.filename))

        except Exception as e:
            return {'message': str(e)}, 500
        
        new_item = HardwareModal(
            name = name,
            description = description,
            price = price,
            filename = file.filename if file else ""
        )
        try:
            new_item.save_to_db()
            return { 
                'status': 1, 
                'id': new_item.id, 
                'name': name,
                'description': description,
                'price': price,
                'isRent':  0
            }, 200
        except:
            return {'status': -1}, 400
        
class ReadAllHardware(Resource):
    @jwt_required()
    def get(self):
        try:
            return HardwareModal.return_all()
        except Exception as e:
            return {'error': str(e)}, 400
    
class UpdateHardware(Resource):
    @jwt_required()
    def put(self):
        data = parser.parse_args()
        
        return HardwareModal.update_one(request.args.get('id'), data['name'], data['description'], data['price'], data['isRent'])
    
class DeleteHardware(Resource):
    @jwt_required()
    def delete(self):
        return HardwareModal.delete_one(request.args.get('id'))
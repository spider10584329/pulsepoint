from models.appliedhardware import AppliedHardwareModel
from flask_restful import Resource, reqparse
from flask import request
from flask_jwt_extended import jwt_required

parser = reqparse.RequestParser()
parser.add_argument('id')
parser.add_argument('userId')
parser.add_argument('hardwareId')
parser.add_argument('applyDate')
parser.add_argument('isApply')
parser.add_argument('purchaseDate')
parser.add_argument('periodicity')
parser.add_argument('managerId')
parser.add_argument('serialNumbers')
parser.add_argument('hardwares', type=list, location='json')
parser.add_argument('specialPrice')
parser.add_argument('contractNumber')
parser.add_argument('comment')

class ApplyHardwares(Resource):
    @jwt_required()
    def post(self):
        data = parser.parse_args()

        hardwareList = data['hardwares']
        
        try:
            for hardware in hardwareList:
                print(hardware['id'])
                item = AppliedHardwareModel.find_by_user_hardware(data['userId'], hardware['id'])

                if item:
                    return {
                        'status': 0
                    }, 200
                
                new_item = AppliedHardwareModel(
                    user_id = data['userId'],
                    hardware_id = hardware['id'],
                    apply_date = data['applyDate'],
                    is_apply = data['isApply'],
                    qty = hardware['qty']
                )

                new_item.save_to_db()
                return { 
                    'status': 1
                }, 200
        except Exception as e:
            return {'status': -1, 'error': str(e)}, 200
        
class UpdateHardwareApply(Resource):
    @jwt_required()
    def put(self):
        data = parser.parse_args()
        return AppliedHardwareModel.update_one(request.args.get('id'), data['isApply'], data['purchaseDate'], data['periodicity'], data['serialNumbers'], data['specialPrice'], data['contractNumber'], data['comment'])

class ReadAllAppliedHardware(Resource):
    @jwt_required()
    def get(self):
        return AppliedHardwareModel.return_all()
    
class ReadHardware(Resource):
    @jwt_required()
    def post(self):
        data = parser.parse_args()
        try:
            return AppliedHardwareModel.return_by_manager_hardware(data['managerId'], data['hardwareId'])
        except Exception as e:
            return {"message": str(e)}
            
class ReadAppliedHardwareByUser(Resource):
    @jwt_required()
    def get(self):
        return AppliedHardwareModel.return_appliedhardware_by_user(request.args.get('id'))
    
class DeleteApplyHardware(Resource):
    @jwt_required()
    def delete(self):
        return AppliedHardwareModel.delete_one(request.args.get('id'))
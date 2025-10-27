from models.appliedproject import AppliedProjectModel
from flask_restful import Resource, reqparse
from flask_jwt_extended import jwt_required
from flask import request

parser = reqparse.RequestParser()
parser.add_argument('id')
parser.add_argument('userId')
parser.add_argument('projectId')
parser.add_argument('applyDate')
parser.add_argument('isApply')
parser.add_argument('purchaseDate')
parser.add_argument('periodicity')
parser.add_argument('userCount')
parser.add_argument('managerId')

class ApplyProject(Resource):
    @jwt_required()
    def post(self):
        data = parser.parse_args()
        
        item = AppliedProjectModel.find_by_user_project(data['userId'], data['projectId'])

        if item:
            return {
                'status': 0
            }, 200
        
        new_item = AppliedProjectModel(
            user_id = data['userId'],
            project_id = data['projectId'],
            apply_date = data['applyDate'],
            is_apply = data['isApply'],
            user_count = data['userCount']
            # purchase_date = data['purchaseDate']
        )
        try:
            new_item.save_to_db()
            return { 
                'status': 1
            }, 200
        except Exception as e:
            return {'status': -1, 'error': str(e)}, 200
        
class UpdateProjectApply(Resource):
    @jwt_required()
    def put(self):
        data = parser.parse_args()
        return AppliedProjectModel.update_one(request.args.get('id'), data['isApply'], data['purchaseDate'], data['periodicity'])

class ReadAllAppliedProject(Resource):
    @jwt_required()
    def get(self):
        return AppliedProjectModel.return_all()
    
class ReadProject(Resource):
    def post(self):
        data = parser.parse_args()
        try:
            return AppliedProjectModel.return_by_manager_project(data['managerId'], data['projectId'])
        except Exception as e:
            return {"message": str(e)}
            
class ReadAppliedProjectByUser(Resource):
    @jwt_required()
    def get(self):
        return AppliedProjectModel.return_appliedproject_by_user(request.args.get('id'))
    
class DeleteApplyProject(Resource):
    @jwt_required()
    def delete(self):
        return AppliedProjectModel.delete_one(request.args.get('id'))
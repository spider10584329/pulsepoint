from models.project import ProjectModel
from flask_restful import Resource, reqparse
from flask import request, send_from_directory, make_response
from flask_jwt_extended import jwt_required
import os

parser = reqparse.RequestParser()
parser.add_argument('id')
parser.add_argument('name')
parser.add_argument('description')
parser.add_argument('website')
parser.add_argument('websiteLink')
parser.add_argument('price')
parser.add_argument('mprice')

class CreateProject(Resource):
    @jwt_required()
    def post(self):
        file = None

        try:
            if 'file' in request.files:
                file = request.files['file']
            name = request.form.get('name')
            description = request.form.get('description')
            websiteLink = request.form.get('website')
            price = request.form.get('price')
            mprice = request.form.get('mprice')
            if file:
                file.save(os.path.join('uploads', file.filename))

        except Exception as e:
            return {'message': str(e)}, 500
        
        new_item = ProjectModel(
            name = name,
            description = description,
            website_link = websiteLink,
            price = price,
            mprice = mprice,
            filename = file.filename if file else ""
        )
        try:
            new_item.save_to_db()
            return { 
                'status': 1, 
                'id': new_item.id, 
                'name': name,
                'description': description,
                'websiteLink': websiteLink,
                'price': price,
                'mprice': mprice
            }, 200
        except:
            return {'status': -1}, 400
        
class ReadAllProject(Resource):
    @jwt_required()
    def get(self):
        try:
            return ProjectModel.return_all()
        except Exception as e:
            return {'error': str(e)}, 400
    
class UpdateProject(Resource):
    @jwt_required()
    def put(self):
        data = parser.parse_args()
        
        return ProjectModel.update_one(request.args.get('id'), data['name'], data['description'], data['websiteLink'], data['price'], data['mprice'])
    
class DeleteProject(Resource):
    @jwt_required()
    def delete(self):
        return ProjectModel.delete_one(request.args.get('id'))
    
class FileDownload(Resource):
    def get(self):
        filepath = request.args.get('filepath')
        response = make_response(send_from_directory('uploads', filepath))
        response.headers['Content-Disposition'] = f'attachment; filename="{filepath}"'
        return response
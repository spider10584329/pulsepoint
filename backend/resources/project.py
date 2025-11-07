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
        try:
            file = None
            filename = None
            
            # Check if request contains multipart form data (with file)
            if request.content_type and 'multipart/form-data' in request.content_type:
                # Handle form data with file upload
                if 'file' in request.files:
                    file = request.files['file']
                    if file and file.filename:
                        filename = file.filename
                        file.save(os.path.join('uploads', filename))
                
                project_id = request.form.get('id')
                name = request.form.get('name')
                description = request.form.get('description')
                websiteLink = request.form.get('website')
                price = request.form.get('price')
                mprice = request.form.get('mprice')
                
            else:
                # Handle JSON data (no file upload)
                data = request.get_json()
                
                if not data:
                    return {'error': 'No data provided', 'status': -1}, 400
                
                project_id = data.get('id')
                name = data.get('name')
                description = data.get('description')
                websiteLink = data.get('website')
                price = data.get('price')
                mprice = data.get('mprice')
            
            if not project_id:
                return {'error': 'Project ID is required', 'status': -1}, 400      
                  
            return ProjectModel.update_one(project_id, name, description, websiteLink, price, mprice, filename)
            
        except Exception as e:
            return {'error': str(e), 'status': -1}, 400
    
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

class PublicProjectList(Resource):
    def get(self):
        """
        Public API endpoint to retrieve list of all projects (software)
        Returns: List of projects with id and name only
        No authentication required - accessible from external sources
        """
        try:
            projects = ProjectModel.return_all()
            
            # Transform the data to return only id and softwarename
            public_list = []
            for project in projects:
                public_list.append({
                    'id': project['id'],
                    'softwarename': project['name']
                })
            
            return public_list, 200
            
        except Exception as e:
            return {'error': str(e), 'message': 'Failed to retrieve project list'}, 500
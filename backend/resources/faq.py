from models.faq import FAQModel
from flask_restful import Resource, reqparse
from flask import request, send_from_directory, make_response
from flask_jwt_extended import jwt_required, get_jwt_identity
import os

parser = reqparse.RequestParser()
parser.add_argument('id')
parser.add_argument('title')

class CreateFAQ(Resource):
    @jwt_required()
    def post(self):
        file = None
        
        try:
            # Get current user from JWT token
            current_user = get_jwt_identity()
            
            if 'file' in request.files:
                file = request.files['file']
                if not file or file.filename == '':
                    return {'status': -1, 'message': 'No file provided'}, 400
                
                # Validate file type (PDF only)
                if not file.filename.lower().endswith('.pdf'):
                    return {'status': -1, 'message': 'Only PDF files are allowed'}, 400
            
            title = request.form.get('title')
            
            if not title:
                return {'status': -1, 'message': 'Title is required'}, 400
            
            if file:
                # Create unique filename to avoid conflicts
                import uuid
                unique_filename = f"faq_{uuid.uuid4().hex}_{file.filename}"
                file.save(os.path.join('uploads', unique_filename))
                filename = unique_filename
            else:
                return {'status': -1, 'message': 'PDF file is required'}, 400

        except Exception as e:
            return {'status': -1, 'message': str(e)}, 500
        
        new_faq = FAQModel(
            title=title,
            filename=filename
        )
        
        try:
            new_faq.save_to_db()
            return { 
                'status': 1, 
                'id': new_faq.id, 
                'title': title,
                'filename': filename,
                'message': 'FAQ created successfully'
            }, 200
        except Exception as e:
            return {'status': -1, 'message': f'Error saving FAQ: {str(e)}'}, 400
        
class ReadAllFAQ(Resource):
    def get(self):
        try:
            return FAQModel.return_all()
        except Exception as e:
            return {'error': str(e)}, 400
    
class UpdateFAQ(Resource):
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
                        # Validate file type (PDF only)
                        if not file.filename.lower().endswith('.pdf'):
                            return {'status': -1, 'message': 'Only PDF files are allowed'}, 400
                        
                        # Create unique filename
                        import uuid
                        filename = f"faq_{uuid.uuid4().hex}_{file.filename}"
                        file.save(os.path.join('uploads', filename))
                
                faq_id = request.form.get('id')
                title = request.form.get('title')
                
            else:
                # Handle JSON data (no file upload)
                data = request.get_json()
                
                if not data:
                    return {'error': 'No data provided', 'status': -1}, 400
                
                faq_id = data.get('id')
                title = data.get('title')
            
            if not faq_id:
                return {'error': 'FAQ ID is required', 'status': -1}, 400
                
            if not title:
                return {'error': 'Title is required', 'status': -1}, 400
                  
            return FAQModel.update_one(faq_id, title, filename)
            
        except Exception as e:
            return {'error': str(e), 'status': -1}, 400
    
class DeleteFAQ(Resource):
    @jwt_required()
    def delete(self):
        faq_id = request.args.get('id')
        if not faq_id:
            return {'error': 'FAQ ID is required', 'status': -1}, 400
            
        return FAQModel.delete_one(faq_id)
    
class FAQFileDownload(Resource):
    def get(self):
        filepath = request.args.get('filepath')
        if not filepath:
            return {'error': 'Filepath is required'}, 400
            
        try:
            response = make_response(send_from_directory('uploads', filepath))
            response.headers['Content-Disposition'] = f'attachment; filename="{filepath}"'
            response.headers['Content-Type'] = 'application/pdf'
            return response
        except FileNotFoundError:
            return {'error': 'File not found'}, 404
        except Exception as e:
            return {'error': str(e)}, 500

class FAQFileViewer(Resource):
    def get(self):
        filepath = request.args.get('filepath')
        if not filepath:
            return {'error': 'Filepath is required'}, 400
            
        try:
            response = make_response(send_from_directory('uploads', filepath))
            response.headers['Content-Disposition'] = f'inline; filename="{filepath}"'
            response.headers['Content-Type'] = 'application/pdf'
            response.headers['Cache-Control'] = 'no-cache'
            return response
        except FileNotFoundError:
            return {'error': 'File not found'}, 404
        except Exception as e:
            return {'error': str(e)}, 500

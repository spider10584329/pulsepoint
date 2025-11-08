from models.project import ProjectModel
from flask_restful import Resource, reqparse
from flask import request, send_from_directory, make_response
from flask_jwt_extended import jwt_required
import os
import uuid
from datetime import datetime
from dateutil.relativedelta import relativedelta

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

class GenerateAPIKey(Resource):
    @jwt_required()
    def post(self):
        """
        Generate an API key and store/update it in database
        Returns: API key and complete API URL
        """
        try:
            # Generate UUID-based API key
            api_key = str(uuid.uuid4())
            
            # Store or update API key in database
            from models.apikey import ApiKeyModel
            ApiKeyModel.create_or_update(api_key)
            
            # Return API key and URL
            api_url = f'/api/pulsepoint/subscription?apikey={api_key}'
            
            return {
                'status': 1,
                'apiKey': api_key,
                'apiUrl': api_url
            }, 200
            
        except Exception as e:
            return {'error': str(e), 'message': 'Failed to generate API key'}, 500

class GetCurrentAPIKey(Resource):
    @jwt_required()
    def get(self):
        """
        Get the current/latest API key from the database
        Returns: API key and complete API URL if exists
        """
        try:
            from models.apikey import ApiKeyModel
            api_record = ApiKeyModel.get_latest()
            
            if not api_record:
                return {'apiKey': '', 'apiUrl': ''}, 200
            
            # Return API key and URL
            api_url = f'/api/pulsepoint/subscription?apikey={api_record.apikey}'
            
            return {
                'apiKey': api_record.apikey,
                'apiUrl': api_url
            }, 200
            
        except Exception as e:
            return {'error': str(e), 'message': 'Failed to retrieve API key'}, 500

class GetSubscriptionData(Resource):
    def get(self):
        """
        Public API endpoint to retrieve subscription data using API key
        Returns: List of approved subscriptions with user and project details
        No JWT required - uses API key for authentication
        """
        try:
            api_key = request.args.get('apikey')
            
            if not api_key:
                return {'error': 'API key is required'}, 400
            
            # Validate API key
            from models.apikey import ApiKeyModel
            api_record = ApiKeyModel.find_by_api_key(api_key)
            
            if not api_record:
                return {'error': 'Invalid API key'}, 401
            
            # Query all approved subscriptions (is_apply = 1)
            # Exclude free trial users (period = 0 or purchase_date is empty)
            from start import db
            from models.appliedproject import AppliedProjectModel
            from models.user import UserModel
            
            query_result = db.session.query(
                UserModel.id.label('customerID'),
                UserModel.email.label('customerEmail'),
                ProjectModel.id.label('softwareID'),
                ProjectModel.name.label('softwareName'),
                AppliedProjectModel.purchase_date,
                AppliedProjectModel.periodicity,
                ProjectModel.mprice,
                ProjectModel.price
            ).join(UserModel, UserModel.id == AppliedProjectModel.user_id) \
             .join(ProjectModel, ProjectModel.id == AppliedProjectModel.project_id) \
             .filter(AppliedProjectModel.is_apply == 1) \
             .filter(AppliedProjectModel.periodicity > 0) \
             .filter(AppliedProjectModel.purchase_date != '') \
             .filter(AppliedProjectModel.purchase_date.isnot(None)) \
             .all()
            
            # Transform data to required format
            subscriptions = []
            for record in query_result:
                # Calculate expiration date
                purchase_date_str = record.purchase_date
                periodicity = record.periodicity
                expiration_date = ''
                
                if purchase_date_str and periodicity:
                    try:
                        # Parse purchase date (handle both date and datetime formats)
                        if ' ' in purchase_date_str:
                            # If it contains time, parse datetime
                            purchase_date_obj = datetime.strptime(purchase_date_str, '%Y-%m-%d %H:%M:%S')
                        else:
                            # If it's just date
                            purchase_date_obj = datetime.strptime(purchase_date_str, '%Y-%m-%d')
                        
                        # Add months to get expiration date
                        expiration_date_obj = purchase_date_obj + relativedelta(months=int(periodicity))
                        expiration_date = expiration_date_obj.strftime('%Y-%m-%d')
                    except Exception as e:
                        expiration_date = ''
                
                # Calculate payment price based on period
                # If period = 12 (annual), use annual price
                # Otherwise, use monthly price * period
                if periodicity == 12:
                    payment_price = float(record.price) if record.price else 0
                else:
                    payment_price = float(record.mprice) * int(periodicity) if record.mprice else 0
                
                subscription_data = {
                    'customerID': record.customerID,
                    'customerEmail': record.customerEmail,
                    'softwareID': record.softwareID,
                    'softwareName': record.softwareName,
                    'purchaseDate': purchase_date_str.split(' ')[0] if ' ' in purchase_date_str else purchase_date_str,
                    'period': record.periodicity if record.periodicity else 0,
                    'paymentPrice': payment_price,
                    'expirationDate': expiration_date
                }
                subscriptions.append(subscription_data)
            
            return subscriptions, 200
            
        except Exception as e:
            return {'error': str(e), 'message': 'Failed to retrieve subscription data'}, 500
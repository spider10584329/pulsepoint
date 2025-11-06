from flask import request, jsonify, send_from_directory
from flask_restful import Resource
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.support import Support
from models.ticket import Ticket
from models.user import UserModel
from start import db, socketio
import os
import uuid
from werkzeug.utils import secure_filename

UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif', 'doc', 'docx'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

class SupportResource(Resource):
    @jwt_required()
    def post(self):
        """Add a message to an existing ticket"""
        current_user_id = get_jwt_identity()
        
        try:
            # Get form data
            ticket_id = request.form.get('ticket_id')
            title = request.form.get('title')
            content = request.form.get('content')
            
            if not ticket_id or not title or not content:
                return {'error': 'Ticket ID, title and content are required'}, 400
            
            # Verify ticket exists and user has access (either owner or support team member)
            current_user_data = UserModel.find_by_email(current_user_id)
            if not current_user_data:
                return {'error': 'User not found'}, 404
                
            ticket = Ticket.query.get(ticket_id)
            
            if not ticket:
                return {'error': 'Ticket not found'}, 404
            
            # Check permissions: user owns ticket OR user is support team member
            if ticket.user_id != current_user_data['id'] and current_user_data['role'] != 2:
                return {'error': 'Access denied'}, 403
            
            # Handle file upload if present
            filename = None
            if 'file' in request.files:
                file = request.files['file']
                if file and file.filename != '' and allowed_file(file.filename):
                    original_filename = secure_filename(file.filename)
                    file_extension = original_filename.rsplit('.', 1)[1].lower()
                    filename = f"{uuid.uuid4()}.{file_extension}"
                    
                    if not os.path.exists(UPLOAD_FOLDER):
                        os.makedirs(UPLOAD_FOLDER)
                    
                    file.save(os.path.join(UPLOAD_FOLDER, filename))
            
            # Create support message
            support_message = Support(
                ticket_id=ticket_id,
                user_id=current_user_data['id'],
                title=title,
                content=content,
                filename=filename
            )
            
            db.session.add(support_message)
            
            # If support team member responds, update ticket status to "In Progress"
            if current_user_data['role'] == 2 and ticket.flag == 0:
                ticket.flag = 1  # In Progress
            
            db.session.commit()
            
            # Emit socket event for real-time updates
            message_data = support_message.to_dict()
            message_data['user'] = {
                'firstname': current_user_data['firstname'],
                'lastname': current_user_data['lastname'],
                'role': current_user_data['role']
            }
            
            # Emit to specific ticket room
            socketio.emit('new_message', {
                'ticket_id': int(ticket_id),
                'message': message_data
            }, room=f'ticket_{ticket_id}')
            
            return {
                'message': 'Support message added successfully',
                'message_id': support_message.id
            }, 201
            
        except Exception as e:
            db.session.rollback()
            return {'error': str(e)}, 500

class AllTicketsResource(Resource):
    @jwt_required()
    def get(self):
        """Get all tickets for support team members"""
        current_user_id = get_jwt_identity()
        current_user_data = UserModel.find_by_email(current_user_id)
        
        # Only support team members can access this
        if not current_user_data or current_user_data['role'] != 2:
            return {'error': 'Access denied'}, 403
        
        try:
            tickets = Ticket.query.order_by(Ticket.created_at.desc()).all()
            
            ticket_list = []
            for ticket in tickets:
                # Get ticket owner info
                user_data = UserModel.find_by_id(ticket.user_id)
                
                # Get message count
                message_count = Support.query.filter_by(ticket_id=ticket.id).count()
                
                # Get latest message
                latest_message = Support.query.filter_by(ticket_id=ticket.id).order_by(Support.created_at.desc()).first()
                
                ticket_dict = ticket.to_dict()
                ticket_dict['user'] = {
                    'firstname': user_data['firstname'] if user_data else 'Unknown',
                    'lastname': user_data['lastname'] if user_data else 'User',
                    'email': user_data['email'] if user_data else 'unknown@email.com'
                }
                ticket_dict['message_count'] = message_count
                ticket_dict['latest_message'] = latest_message.created_at if latest_message else ticket.created_at
                
                ticket_list.append(ticket_dict)
            
            return ticket_list, 200
            
        except Exception as e:
            return {'error': str(e)}, 500

class FileDownloadResource(Resource):
    @jwt_required()
    def get(self, filename):
        """Download an attachment file"""
        current_user_id = get_jwt_identity()
        current_user_data = UserModel.find_by_email(current_user_id)
        
        if not current_user_data:
            return {'error': 'User not found'}, 404
        
        try:
            # Find the support message with this filename
            support_message = Support.query.filter_by(filename=filename).first()
            
            if not support_message:
                return {'error': 'File not found'}, 404
            
            # Get the ticket associated with this message
            ticket = Ticket.query.get(support_message.ticket_id)
            
            if not ticket:
                return {'error': 'Ticket not found'}, 404
            
            # Check permissions: user owns ticket OR user is support team member
            if ticket.user_id != current_user_data['id'] and current_user_data['role'] != 2:
                return {'error': 'Access denied'}, 403
            
            # Check if file exists
            file_path = os.path.join(UPLOAD_FOLDER, filename)
            if not os.path.exists(file_path):
                return {'error': 'File not found on server'}, 404
            
            # Send the file
            return send_from_directory(
                UPLOAD_FOLDER,
                filename,
                as_attachment=True
            )
            
        except Exception as e:
            return {'error': str(e)}, 500

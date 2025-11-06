from flask import request, jsonify
from flask_restful import Resource
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.ticket import Ticket
from models.support import Support
from models.user import UserModel
from start import db
import os
import uuid
from werkzeug.utils import secure_filename
from datetime import datetime

UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif', 'doc', 'docx'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

class TicketResource(Resource):
    @jwt_required()
    def get(self):
        """Get all tickets for the current user"""
        current_user_email = get_jwt_identity()
        
        try:
            # Get user by email
            user_data = UserModel.find_by_email(current_user_email)
            if not user_data:
                return {'error': 'User not found'}, 404
                
            # Get tickets for this user
            tickets = Ticket.query.filter_by(user_id=user_data['id']).order_by(Ticket.id.desc()).all()
            return [ticket.to_dict() for ticket in tickets], 200
            
        except Exception as e:
            print(f"Error in get tickets: {str(e)}")
            return {'error': 'Failed to fetch tickets'}, 500

    @jwt_required()
    def post(self):
        """Create a new ticket"""
        current_user_email = get_jwt_identity()
        
        try:
            # Get user by email
            user_data = UserModel.find_by_email(current_user_email)
            if not user_data:
                return {'error': 'User not found'}, 404
            
            # Get form data
            title = request.form.get('title', '').strip()
            content = request.form.get('content', '').strip()
            
            if not title or not content:
                return {'error': 'Title and content are required'}, 400
            
            # Handle file upload if present
            uploaded_filename = None
            if 'file' in request.files:
                file = request.files['file']
                if file and file.filename and file.filename != '':
                    if allowed_file(file.filename):
                        # Generate unique filename
                        original_filename = secure_filename(file.filename)
                        file_extension = original_filename.rsplit('.', 1)[1].lower()
                        uploaded_filename = f"{uuid.uuid4()}.{file_extension}"
                        
                        # Create upload directory if it doesn't exist
                        if not os.path.exists(UPLOAD_FOLDER):
                            os.makedirs(UPLOAD_FOLDER)
                        
                        # Save file
                        file_path = os.path.join(UPLOAD_FOLDER, uploaded_filename)
                        file.save(file_path)
                    else:
                        return {'error': 'File type not allowed'}, 400
            
            # Start database transaction
            try:
                # Create ticket
                new_ticket = Ticket(
                    user_id=user_data['id'],
                    title=title,
                    flag=0  # 0 = Open
                )
                
                db.session.add(new_ticket)
                db.session.flush()  # Get the ticket ID without committing
                
                # Create initial support message
                initial_message = Support(
                    ticket_id=new_ticket.id,
                    user_id=user_data['id'],
                    title=title,
                    content=content,
                    filename=uploaded_filename  # Can be None
                )
                
                db.session.add(initial_message)
                db.session.commit()
                
                return {
                    'message': 'Ticket created successfully',
                    'ticket_id': new_ticket.id
                }, 201
                
            except Exception as db_error:
                db.session.rollback()
                print(f"Database error: {str(db_error)}")
                
                # Clean up uploaded file if database save failed
                if uploaded_filename:
                    try:
                        file_path = os.path.join(UPLOAD_FOLDER, uploaded_filename)
                        if os.path.exists(file_path):
                            os.remove(file_path)
                    except:
                        pass
                
                return {'error': 'Failed to create ticket'}, 500
            
        except Exception as e:
            print(f"General error in create ticket: {str(e)}")
            return {'error': 'An unexpected error occurred'}, 500

class TicketDetailResource(Resource):
    @jwt_required()
    def get(self, ticket_id):
        """Get ticket details with all messages"""
        current_user_email = get_jwt_identity()
        
        try:
            # Verify user exists - JWT stores email, not ID
            user_data = UserModel.find_by_email(current_user_email)
            if not user_data:
                print(f"User not found for email: {current_user_email}")
                return {'error': 'User not found'}, 404
            
            print(f"User found: ID={user_data['id']}, Email={current_user_email}, Role={user_data.get('role', 'unknown')}")
            print(f"Requesting ticket_id: {ticket_id}")
                
            # Get ticket - for customers (role=1), only show their own tickets
            # For support team (role=2), show any ticket
            if user_data.get('role') == 2:
                # Support team can view any ticket
                ticket = Ticket.query.filter_by(id=ticket_id).first()
                print(f"Support team member accessing ticket {ticket_id}")
            else:
                # Regular users can only view their own tickets
                ticket = Ticket.query.filter_by(id=ticket_id, user_id=user_data['id']).first()
                print(f"Customer accessing their own ticket {ticket_id}")
            
            if not ticket:
                # Check if ticket exists at all
                any_ticket = Ticket.query.filter_by(id=ticket_id).first()
                if any_ticket:
                    print(f"Ticket {ticket_id} exists but belongs to user {any_ticket.user_id}, current user is {user_data['id']}")
                    return {'error': 'Ticket not found or access denied'}, 404
                else:
                    print(f"Ticket {ticket_id} does not exist in database")
                    return {'error': 'Ticket not found'}, 404
            
            print(f"Ticket found: {ticket.id}, title: {ticket.title}")
            
            # Get all messages for this ticket
            messages = Support.query.filter_by(ticket_id=ticket_id).order_by(Support.created_at.asc()).all()
            print(f"Found {len(messages)} messages for ticket {ticket_id}")
            
            # Get user details for each message
            message_list = []
            for message in messages:
                msg_user_data = UserModel.find_by_id(message.user_id)
                message_dict = message.to_dict()
                message_dict['user'] = {
                    'firstname': msg_user_data['firstname'] if msg_user_data else 'Unknown',
                    'lastname': msg_user_data['lastname'] if msg_user_data else 'User',
                    'role': msg_user_data['role'] if msg_user_data else 1
                }
                message_list.append(message_dict)
            
            ticket_dict = ticket.to_dict()
            ticket_dict['messages'] = message_list
            
            print(f"Returning ticket data with {len(message_list)} messages")
            return ticket_dict, 200
            
        except Exception as e:
            print(f"Exception in get ticket detail: {str(e)}")
            import traceback
            traceback.print_exc()
            return {'error': str(e)}, 500
    
    @jwt_required()
    def patch(self, ticket_id):
        """Update ticket status"""
        current_user_email = get_jwt_identity()
        
        try:
            # Verify user exists
            user_data = UserModel.find_by_email(current_user_email)
            if not user_data:
                return {'error': 'User not found'}, 404
            
            # Get ticket
            ticket = Ticket.query.filter_by(id=ticket_id, user_id=user_data['id']).first()
            if not ticket:
                return {'error': 'Ticket not found'}, 404
            
            # Get the new flag value from request
            data = request.get_json()
            new_flag = data.get('flag')
            
            if new_flag is None or not isinstance(new_flag, int) or new_flag not in [0, 1, 2, 3]:
                return {'error': 'Invalid flag value'}, 400
            
            # Update the ticket flag
            ticket.flag = new_flag
            db.session.commit()
            
            return {
                'message': 'Ticket updated successfully',
                'ticket': ticket.to_dict()
            }, 200
            
        except Exception as e:
            db.session.rollback()
            print(f"Error updating ticket: {str(e)}")
            return {'error': 'Failed to update ticket'}, 500
    
    @jwt_required()
    def delete(self, ticket_id):
        """Delete a ticket (only if resolved)"""
        current_user_email = get_jwt_identity()
        
        try:
            # Verify user exists
            user_data = UserModel.find_by_email(current_user_email)
            if not user_data:
                return {'error': 'User not found'}, 404
            
            # Get ticket
            ticket = Ticket.query.filter_by(id=ticket_id, user_id=user_data['id']).first()
            if not ticket:
                return {'error': 'Ticket not found'}, 404
            
            # Check if ticket is resolved (flag = 2)
            if ticket.flag != 2:
                return {'error': 'Can only delete resolved tickets'}, 400
            
            # Delete all support messages associated with this ticket
            Support.query.filter_by(ticket_id=ticket_id).delete()
            
            # Delete the ticket
            db.session.delete(ticket)
            db.session.commit()
            
            return {'message': 'Ticket deleted successfully'}, 200
            
        except Exception as e:
            db.session.rollback()
            print(f"Error deleting ticket: {str(e)}")
            return {'error': 'Failed to delete ticket'}, 500

from flask_restful import Api
from resources.ticket import TicketResource, TicketDetailResource
from resources.support import SupportResource, AllTicketsResource, FileDownloadResource

def ticketRouteIndex(app):
    api = Api(app)
    
    # Ticket routes
    api.add_resource(TicketResource, '/api/ticket')  # GET: user's tickets, POST: create ticket
    api.add_resource(TicketDetailResource, '/api/ticket/<int:ticket_id>')  # GET: ticket with messages
    
    # Support routes
    api.add_resource(SupportResource, '/api/support')  # POST: add message to ticket
    api.add_resource(AllTicketsResource, '/api/tickets/all')  # GET: all tickets for support team
    api.add_resource(FileDownloadResource, '/api/support/file/<string:filename>')  # GET: download file

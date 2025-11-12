from start import app, socketio
from flask_cors import CORS
from flask_socketio import join_room, leave_room, emit

from routes.index import Route_index

CORS(app, resources={r"/*":{"origins":"*"}})
Route_index(app)

@app.route("/")
def index():
    return "hello world"

@app.route("/debug/db")
def debug_db():
    return {
        "db_id": id(db),
        "app_db": id(current_app.extensions['sqlalchemy']),
        "is_same_instance": id(db) == id(current_app.extensions['sqlalchemy']),
        "db_repr": repr(db)
    }
    
    
# Socket.IO event handlers for ticket conversations
@socketio.on('join_ticket')
def handle_join_ticket(data):
    """Join a specific ticket room for real-time updates"""
    ticket_id = data.get('ticket_id')
    if ticket_id:
        room = f'ticket_{ticket_id}'
        join_room(room)
        print(f"Client joined ticket room: {room}")
        emit('joined_ticket', {'ticket_id': ticket_id, 'room': room})

@socketio.on('leave_ticket')
def handle_leave_ticket(data):
    """Leave a specific ticket room"""
    ticket_id = data.get('ticket_id')
    if ticket_id:
        room = f'ticket_{ticket_id}'
        leave_room(room)
        print(f"Client left ticket room: {room}")
        emit('left_ticket', {'ticket_id': ticket_id})

@socketio.on('connect')
def handle_connect():
    """Handle client connection"""
    print('Client connected')
    emit('connected', {'status': 'connected'})

@socketio.on('disconnect')
def handle_disconnect():
    """Handle client disconnection"""
    print('Client disconnected')

if (__name__ == "__main__"):
    # For HTTPS, uncomment these lines and add cert.pem and key.pem files:
    #socketio.run(app, host='localhost', port=5001, debug=True, use_reloader=False, certfile='cert.pem', keyfile='key.pem')
    
    # For HTTP (default):
    socketio.run(app, host='localhost', port=5001, debug=True, use_reloader=False)


from start import db
from datetime import datetime

class Support(db.Model):
    __tablename__ = 'support'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    ticket_id = db.Column(db.Integer, nullable=False)
    user_id = db.Column(db.Integer, nullable=False)
    title = db.Column(db.String(255), nullable=False)
    content = db.Column(db.Text, nullable=False)  # Using Text for longblob equivalent
    filename = db.Column(db.String(255), nullable=True, default=None)
    created_at = db.Column(db.String(255), nullable=False, default=lambda: datetime.now().strftime('%Y-%m-%d %H:%M:%S'))
    
    def to_dict(self):
        # Handle content field - it might be bytes if stored as LONGBLOB
        content_value = self.content
        if isinstance(content_value, bytes):
            content_value = content_value.decode('utf-8')
        
        return {
            'id': self.id,
            'ticket_id': self.ticket_id,
            'user_id': self.user_id,
            'title': self.title,
            'content': content_value,
            'filename': self.filename,
            'created_at': self.created_at
        }

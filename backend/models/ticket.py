from start import db
from datetime import datetime

class Ticket(db.Model):
    __tablename__ = 'ticket'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, nullable=False)
    title = db.Column(db.String(255), nullable=False)
    flag = db.Column(db.Integer, nullable=False, default=0)  # 0=Open, 1=In Progress, 2=Resolved, 3=Closed
    created_at = db.Column(db.String(255), nullable=False, default=lambda: datetime.now().strftime('%Y-%m-%d %H:%M:%S'))
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'title': self.title,
            'flag': self.flag,
            'created_at': self.created_at
        }

from start import db
from datetime import datetime

class ApiKeyModel(db.Model):
    __tablename__ = 'apikey'
        
    id = db.Column(db.Integer, primary_key = True)
    apikey = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def save_to_db(self):
        db.session.add(self)
        db.session.commit()
        
    @classmethod
    def get_latest(cls):
        """
        Get the most recent API key record
        """
        return cls.query.order_by(cls.created_at.desc()).first()
    
    @classmethod
    def create_or_update(cls, api_key):
        """
        Since there's no customer_id field, we'll just update the first/latest record
        or create a new one if none exists
        """
        try:
            existing = cls.get_latest()
            
            if existing:
                # Update existing record
                existing.apikey = api_key
                existing.created_at = datetime.utcnow()
                db.session.commit()
                return existing
            else:
                # Create new record
                new_apikey = cls(apikey=api_key)
                new_apikey.save_to_db()
                return new_apikey
        except Exception as e:
            db.session.rollback()
            raise e
    
    @classmethod
    def find_by_api_key(cls, api_key):
        """
        Find record by API key (for validation)
        """
        return cls.query.filter_by(apikey=api_key).first()

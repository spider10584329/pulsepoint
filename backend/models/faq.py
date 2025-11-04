from start import db

class FAQModel(db.Model):
    __tablename__ = 'faq'
        
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    filename = db.Column(db.String(255), nullable=False)

    def save_to_db(self):
        db.session.add(self)
        db.session.commit()
        
    @classmethod
    def return_all(cls):
        def to_json(x):
            return {
                'id': x.id,
                'title': x.title,
                'filename': x.filename
            }
        return list(map(
            lambda x: to_json(x), 
            cls.query.order_by(cls.id.desc()).all()
        ))
        
    @classmethod
    def find_by_id(cls, faq_id):
        faq = cls.query.get(faq_id)
        if faq:
            return {
                'id': faq.id,
                'title': faq.title,
                'filename': faq.filename
            }
        return None
        
    @classmethod
    def update_one(cls, faq_id, title, filename=None):
        try:
            record = cls.query.get(faq_id)
            if not record:
                return {'status': -1, 'message': 'FAQ not found'}
            
            record.title = title
            
            # Only update filename if a new file was uploaded
            if filename is not None:
                record.filename = filename
            
            db.session.commit()
            
            return {'status': 1, 'message': 'FAQ updated successfully'}
        except Exception as e:
            return {'status': -1, 'message': f'Error updating FAQ: {str(e)}'}
        
    @classmethod
    def delete_one(cls, faq_id):
        try:
            row_deleted = cls.query.filter_by(id=faq_id).first()
            if not row_deleted:
                return {'status': -1, 'message': 'FAQ not found'}
            
            db.session.delete(row_deleted)
            db.session.commit()
            return {'status': 1, 'message': 'FAQ deleted successfully'}
        except Exception as e:
            return {'status': -1, 'message': f'Error deleting FAQ: {str(e)}'}

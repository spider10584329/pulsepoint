from start import db
from sqlalchemy import Numeric

class ProjectModel(db.Model):
    __tablename__ = 'projects'
        
    id = db.Column(db.Integer, primary_key = True)
    name = db.Column(db.String(255))
    description = db.Column(db.String(255))
    website_link = db.Column(db.String(255))
    price = db.Column(db.String(255))
    mprice = db.Column(db.String(255))
    filename = db.Column(db.String(255))

    def save_to_db(self):
        db.session.add(self)
        db.session.commit()
        
    @classmethod
    def return_all(cls):
        def to_json(x):
            return {
                'id': x.id,
                'name': x.name,
                'description': x.description,
                'websiteLink': x.website_link,
                'price': x.price,
                'mprice': x.mprice,
                'filename': x.filename
            }
        return list(map(
            lambda x: to_json(x), 
            ProjectModel.query.all()
        ))
        
    @classmethod
    def update_one(cls, id, name, description, link, price, mprice):
        try:
            record = cls.query.get(id)
            record.name = name
            record.description = description
            record.website_link = link
            record.price = price
            record.mprice = mprice
            db.session.commit()
        except:
            return {'message': 'error'}
        
    @classmethod
    def delete_one(cls, id):
        try:
            row_deleted = cls.query.filter_by(id=id).first()
            db.session.delete(row_deleted)
            db.session.commit()
        except:
            return {'message': 'error'}
from start import db

class HardwareModal(db.Model):
    __tablename__ = 'hardwares'
        
    id = db.Column(db.Integer, primary_key = True)
    name = db.Column(db.String(255))
    description = db.Column(db.String(255))
    price = db.Column(db.String(255))
    filename = db.Column(db.String(255))
    is_rent = db.Column(db.Integer)

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
                'price': x.price,
                'filename': x.filename,
                'isRent': x.is_rent
            }
        return list(map(
            lambda x: to_json(x), 
            HardwareModal.query.all()
        ))
        
    @classmethod
    def update_one(cls, id, name, description, price, isRent):
        try:
            record = cls.query.get(id)
            record.name = name
            record.description = description
            record.price = price
            record.is_rent = isRent
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
from start import db

class DeviceModel(db.Model):
    __tablename__ = 'devices'

    id = db.Column(db.Integer, primary_key = True)
    registration = db.Column(db.String(255))
    software = db.Column(db.String(255))
    serialNumber = db.Column(db.String(255))
    comment = db.Column(db.String(255))
    activeCode = db.Column(db.String(255))
    
    def save_to_db(self):
        db.session.add(self)
        db.session.commit()

    @classmethod
    def find_by_id(cls, id):
        device = db.session.query(cls) \
                        .filter(cls.id == id) \
                        .first()
        if device:
            return {
                'id': device.id,
                'registration': device.registration,
                'software': device.software,
                'serialNumber': device.serialNumber,
                'comment': device.comment,
                'activeCode': device.activeCode
            }
        else:
            return None

    @classmethod
    def return_all(cls):
        def to_json(x):
            return {
                'id': x.id,
                'registration': x.registration,
                'software': x.software,
                'serialNumber': x.serialNumber,
                'comment': x.comment,
                'activeCode': x.activeCode
            }
            
        query_result = db.session.query(
            DeviceModel.id,
            DeviceModel.registration,
            DeviceModel.software,
            DeviceModel.serialNumber,
            DeviceModel.comment,
            DeviceModel.activeCode
        )
        
        return list(map(lambda x: to_json(x), query_result))
    
    @classmethod
    def update_one(cls, id, registration, software, serialNumber, comment, activeCode):
        try:
            record = cls.query.get(id)
            record.registration = registration
            record.software = software
            record.serialNumber = serialNumber
            record.comment = comment
            record.activeCode = activeCode
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

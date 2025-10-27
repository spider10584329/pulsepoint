from start import db
from models.user import UserModel
from models.hardware import HardwareModal

class AppliedHardwareModel(db.Model):
    __tablename__ = 'appliedhardwares'
        
    id = db.Column(db.Integer, primary_key = True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable = False)
    hardware_id = db.Column(db.Integer, db.ForeignKey('hardwares.id'), nullable = False)
    apply_date = db.Column(db.String(255))
    is_apply = db.Column(db.Integer)
    purchase_date = db.Column(db.String(255))
    periodicity = db.Column(db.Integer)
    qty = db.Column(db.Integer)
    serial_numbers = db.Column(db.String(255))
    special_price = db.Column(db.String(255))
    contract_number = db.Column(db.String(255))
    comment = db.Column(db.String(255))

    def save_to_db(self):
        db.session.add(self)
        db.session.commit()
        
    @classmethod
    def find_by_user_hardware(cls, userId, hardwareId):
        return AppliedHardwareModel.query.filter(AppliedHardwareModel.user_id == userId).filter(AppliedHardwareModel.hardware_id == hardwareId).first()

    @classmethod
    def update_one(cls, id, status, purchaseDate, periodicity, serialNumbers, specialPrice, contractNumber, comment):
        try:
            record = cls.query.get(id)
            record.is_apply = status
            record.purchase_date = purchaseDate
            record.periodicity = periodicity
            record.serial_numbers = serialNumbers
            record.special_price = specialPrice
            record.contract_number = contractNumber
            record.comment = comment
            db.session.commit()
        except:
            return {'message': 'error'}
        
    @classmethod
    def return_all(cls):
        def to_json(x):
            return {
                'id': x.id,
                'username': x.firstname +" " + x.lastname,
                'hardwareName': x.hardwareName,
                'applyDate': x.apply_date,
                'qty': x.qty,
                'isApply': x.is_apply,
                'purchaseDate': x.purchase_date,
                'periodicity': x.periodicity,
                'serialNumbers': x.serial_numbers,
                'specialPrice': x.special_price,
                'contractNumber': x.contract_number,
                'comment': x.comment
            }
            
        query_result = db.session.query(
            AppliedHardwareModel.id,
            UserModel.firstname.label('firstname'),
            UserModel.lastname.label('lastname'),
            HardwareModal.name.label('hardwareName'),
            AppliedHardwareModel.apply_date,
            AppliedHardwareModel.is_apply,
            AppliedHardwareModel.purchase_date,
            AppliedHardwareModel.periodicity,
            AppliedHardwareModel.qty,
            AppliedHardwareModel.serial_numbers,
            AppliedHardwareModel.special_price,
            AppliedHardwareModel.contract_number,
            AppliedHardwareModel.comment
        ).join(UserModel, UserModel.id == AppliedHardwareModel.user_id) \
        .join(HardwareModal, HardwareModal.id == AppliedHardwareModel.hardware_id)
        
        return list(map(lambda x: to_json(x), query_result))
    
    @classmethod
    def return_by_manager_hardware(cls, userId, hardwareId):
        try:
            res = cls.query.filter_by(user_id=userId, hardware_id=hardwareId).first()
            return {
                'id': res.id,
                'userId': res.user_id,
                'hardwareId': res.hardware_id
            }
        except Exception as e:
            return {'error': str(e)}
    
    @classmethod
    def return_appliedhardware_by_user(cls, userId):
        def to_json(x):
            return {
                'id': x.id,
                'userId': x.userId,
                'username': x.firstname +" " + x.lastname,
                'hardwareId': x.hardwareId,
                'hardwareName': x.hardwareName,
                'price': x.price,
                'applyDate': x.apply_date,
                'isApply': x.is_apply,
                'purchaseDate': x.purchase_date,
                'periodicity': x.periodicity,
                'qty': x.qty,
                'serialNumbers': x.serial_numbers,
                'specialPrice': x.special_price,
                'contractNumber': x.contract_number,
                'comment': x.comment
            }
            
        query_result = db.session.query(
            AppliedHardwareModel.id,
            UserModel.id.label('userId'),
            UserModel.firstname.label('firstname'),
            UserModel.lastname.label('lastname'),
            HardwareModal.id.label('hardwareId'),
            HardwareModal.name.label('hardwareName'),
            HardwareModal.price.label('price'),
            AppliedHardwareModel.apply_date,
            AppliedHardwareModel.is_apply,
            AppliedHardwareModel.purchase_date,
            AppliedHardwareModel.periodicity,
            AppliedHardwareModel.qty,
            AppliedHardwareModel.serial_numbers,
            AppliedHardwareModel.special_price,
            AppliedHardwareModel.contract_number,
            AppliedHardwareModel.comment
        ).join(UserModel, UserModel.id == AppliedHardwareModel.user_id) \
        .join(HardwareModal, HardwareModal.id == AppliedHardwareModel.hardware_id) \
        .filter(AppliedHardwareModel.user_id == userId)
        
        return list(map(lambda x: to_json(x), query_result))
                     
    @classmethod
    def delete_one(cls, id):
        try:
            row_deleted = cls.query.filter_by(id=id).first()
            db.session.delete(row_deleted)
            db.session.commit()
        except:
            return {'message': 'error'}
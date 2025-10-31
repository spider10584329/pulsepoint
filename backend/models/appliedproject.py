from start import db
from models.user import UserModel
from models.project import ProjectModel

class AppliedProjectModel(db.Model):
    __tablename__ = 'appliedprojects'
        
    id = db.Column(db.Integer, primary_key = True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable = False)
    project_id = db.Column(db.Integer, db.ForeignKey('projects.id'), nullable = False)
    apply_date = db.Column(db.String(255))
    is_apply = db.Column(db.Integer)
    purchase_date = db.Column(db.String(255))
    periodicity = db.Column(db.Integer)
    user_count = db.Column(db.Integer)

    def save_to_db(self):
        db.session.add(self)
        db.session.commit()
        
    @classmethod
    def find_by_user_project(cls, userId, projectId):
        return AppliedProjectModel.query.filter(AppliedProjectModel.user_id == userId).filter(AppliedProjectModel.project_id == projectId).filter(AppliedProjectModel.is_apply == '1').first()

    @classmethod
    def update_one(cls, id, status, purchaseDate=None, periodicity=None, applyDate=None):
        try:
            record = cls.query.get(id)
            if record:
                record.is_apply = status
                if purchaseDate is not None:
                    record.purchase_date = purchaseDate
                if periodicity is not None:
                    record.periodicity = periodicity
                if applyDate is not None:
                    record.apply_date = applyDate
                db.session.commit()
                return {'status': 1, 'message': 'Updated successfully'}
            else:
                return {'status': 0, 'message': 'Record not found'}
        except Exception as e:
            return {'status': -1, 'message': 'Database error', 'error': str(e)}
        
    @classmethod
    def return_all(cls):
        def to_json(x):
           return {
                'id': x.id,
                'userId': getattr(x, 'userId', None),
                'projectId': getattr(x, 'projectId', None),
                'username': f"{x.firstname} {x.lastname}",
                'projectName': x.projectName,
                'applyDate': x.apply_date,
                'isApply': x.is_apply,
                'purchaseDate': x.purchase_date,
                'periodicity': x.periodicity,
                'filename': x.filename
            }
            
        query_result = db.session.query(
            AppliedProjectModel.id,
            UserModel.id.label('userId'),
            ProjectModel.id.label('projectId'),
            UserModel.firstname.label('firstname'),
            UserModel.lastname.label('lastname'),
            ProjectModel.name.label('projectName'),
            AppliedProjectModel.apply_date,
            AppliedProjectModel.is_apply,
            AppliedProjectModel.purchase_date,
            AppliedProjectModel.periodicity,
            ProjectModel.filename.label('filename')
        ).join(UserModel, UserModel.id == AppliedProjectModel.user_id) \
        .join(ProjectModel, ProjectModel.id == AppliedProjectModel.project_id)
        
        return list(map(lambda x: to_json(x), query_result))
    
    @classmethod
    def return_by_manager_project(cls, userId, projectId):
        try:
            res = cls.query.filter_by(user_id=userId, project_id=projectId).first()
            return {
                'id': res.id,
                'userId': res.user_id,
                'projectId': res.project_id,
                'userCount': res.user_count
            }
        except Exception as e:
            return {'error': str(e)}
    
    @classmethod
    def return_appliedproject_by_user(cls, userId):
        def to_json(x):
            return {
                'id': x.id,
                'userId': x.userId,
                'username': x.firstname +" " + x.lastname,
                'projectId': x.projectId,
                'projectName': x.projectName,
                'applyDate': x.apply_date,
                'isApply': x.is_apply,
                'purchaseDate': x.purchase_date,
                'periodicity': x.periodicity,
                'filename': x.filename
            }
            
        query_result = db.session.query(
            AppliedProjectModel.id,
            UserModel.id.label('userId'),
            UserModel.firstname.label('firstname'),
            UserModel.lastname.label('lastname'),
            ProjectModel.id.label('projectId'),
            ProjectModel.name.label('projectName'),
            AppliedProjectModel.apply_date,
            AppliedProjectModel.is_apply,
            AppliedProjectModel.purchase_date,
            AppliedProjectModel.periodicity,
            ProjectModel.filename.label('filename')
        ).join(UserModel, UserModel.id == AppliedProjectModel.user_id) \
        .join(ProjectModel, ProjectModel.id == AppliedProjectModel.project_id) \
        .filter(AppliedProjectModel.user_id == userId)
        
        return list(map(lambda x: to_json(x), query_result))
                     
    @classmethod
    def delete_one(cls, id):
        try:
            row_deleted = cls.query.filter_by(id=id).first()
            db.session.delete(row_deleted)
            db.session.commit()
        except:
            return {'message': 'error'}
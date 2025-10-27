from flask_restful import Api
import resources.appliedproject as AppliedProjectResource

def appliedprojectRouteIndex(app):
    api = Api(app)
    
    api.add_resource(AppliedProjectResource.ApplyProject, '/api/apply/project')
    api.add_resource(AppliedProjectResource.UpdateProjectApply, '/api/apply/project/update')
    api.add_resource(AppliedProjectResource.DeleteApplyProject, '/api/apply/project/delete')
    api.add_resource(AppliedProjectResource.ReadAllAppliedProject, '/api/apply/project/all')
    api.add_resource(AppliedProjectResource.ReadAppliedProjectByUser, '/api/apply/project/foruser')
    api.add_resource(AppliedProjectResource.ReadProject, '/api/user/project/usercount')
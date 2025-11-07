from flask_restful import Api
import resources.project as ProjectResource

def projectRouteIndex(app):
    api = Api(app)
    
    api.add_resource(ProjectResource.CreateProject, '/api/project/create')
    api.add_resource(ProjectResource.ReadAllProject, '/api/project/read')
    api.add_resource(ProjectResource.UpdateProject, '/api/project/update')
    api.add_resource(ProjectResource.DeleteProject, '/api/project/delete')
    api.add_resource(ProjectResource.FileDownload, '/project/download')
    api.add_resource(ProjectResource.PublicProjectList, '/api/public/projects')
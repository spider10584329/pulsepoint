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
    api.add_resource(ProjectResource.GenerateAPIKey, '/api/apikey/generate')
    api.add_resource(ProjectResource.GetCurrentAPIKey, '/api/apikey/current')
    api.add_resource(ProjectResource.GetSubscriptionData, '/api/pulsepoint/subscription')
    api.add_resource(ProjectResource.DownloadSubscriptionCSV, '/api/subscription/download/csv')
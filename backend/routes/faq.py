from flask_restful import Api
import resources.faq as FAQResource

def faqRouteIndex(app):
    api = Api(app)
    
    api.add_resource(FAQResource.CreateFAQ, '/api/faq/create')
    api.add_resource(FAQResource.ReadAllFAQ, '/api/faq/read')
    api.add_resource(FAQResource.UpdateFAQ, '/api/faq/update')
    api.add_resource(FAQResource.DeleteFAQ, '/api/faq/delete')
    api.add_resource(FAQResource.FAQFileDownload, '/faq/download')
    api.add_resource(FAQResource.FAQFileViewer, '/faq/view')

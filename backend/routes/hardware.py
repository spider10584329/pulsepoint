from flask_restful import Api
import resources.hardware as HardwareResource

def hardwareRouteIndex(app):
    api = Api(app)
    
    api.add_resource(HardwareResource.CreateHardware, '/api/hardware/create')
    api.add_resource(HardwareResource.ReadAllHardware, '/api/hardware/read')
    api.add_resource(HardwareResource.UpdateHardware, '/api/hardware/update')
    api.add_resource(HardwareResource.DeleteHardware, '/api/hardware/delete')
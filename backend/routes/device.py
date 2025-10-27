from flask_restful import Api
import resources.device as deviceResource

def deviceRouteIndex(app):
    api = Api(app)
    
    api.add_resource(deviceResource.DeviceRegister, '/api/device/create')
    api.add_resource(deviceResource.DeviceLogin, '/api/device/signin')
    api.add_resource(deviceResource.AllDevices, '/api/device/read')
    api.add_resource(deviceResource.UpdateDeviceInfo, '/api/device/update')
    api.add_resource(deviceResource.DeleteDevice, '/api/device/delete')

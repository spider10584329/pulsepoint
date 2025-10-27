from flask_restful import Api
import resources.appliedhardware as AppliedHardwareResource

def appliedhardwareRouteIndex(app):
    api = Api(app)
    
    api.add_resource(AppliedHardwareResource.ApplyHardwares, '/api/apply/hardware')
    api.add_resource(AppliedHardwareResource.UpdateHardwareApply, '/api/apply/hardware/update')
    api.add_resource(AppliedHardwareResource.DeleteApplyHardware, '/api/apply/hardware/delete')
    api.add_resource(AppliedHardwareResource.ReadAllAppliedHardware, '/api/apply/hardware/all')
    api.add_resource(AppliedHardwareResource.ReadAppliedHardwareByUser, '/api/apply/hardware/foruser')
    api.add_resource(AppliedHardwareResource.ReadHardware, '/api/user/hardware/usercount')
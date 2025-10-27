from routes.user import userRouteIndex
from routes.project import projectRouteIndex
from routes.appliedproject import appliedprojectRouteIndex
from routes.hardware import hardwareRouteIndex
from routes.appliedhardware import appliedhardwareRouteIndex
from routes.device import deviceRouteIndex

def Route_index(app):
    userRouteIndex(app)
    projectRouteIndex(app)
    appliedprojectRouteIndex(app)
    hardwareRouteIndex(app)
    appliedhardwareRouteIndex(app)
    deviceRouteIndex(app)
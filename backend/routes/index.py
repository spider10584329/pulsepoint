from routes.user import userRouteIndex
from routes.project import projectRouteIndex
from routes.appliedproject import appliedprojectRouteIndex
from routes.hardware import hardwareRouteIndex
from routes.appliedhardware import appliedhardwareRouteIndex
from routes.device import deviceRouteIndex
from routes.faq import faqRouteIndex
from routes.ticket import ticketRouteIndex

def Route_index(app):
    userRouteIndex(app)
    projectRouteIndex(app)
    appliedprojectRouteIndex(app)
    hardwareRouteIndex(app)
    appliedhardwareRouteIndex(app)
    deviceRouteIndex(app)
    faqRouteIndex(app)
    ticketRouteIndex(app)
from flask_restful import Api
import resources.user as userResource

def userRouteIndex(app):
    api = Api(app)
    
    api.add_resource(userResource.UserRegister, '/api/user/register')
    api.add_resource(userResource.UserLogin, '/api/user/signin')
    api.add_resource(userResource.UpdatePassword, '/api/user/update/password')
    api.add_resource(userResource.AllUsers, '/api/user/allusers')
    api.add_resource(userResource.UpdateUser, '/api/user/update')
    api.add_resource(userResource.DeleteUser, '/api/user/delete')
    api.add_resource(userResource.UserLoginWithProject, '/api/user/project/signin')
    api.add_resource(userResource.SendForgetPasswordMail, '/api/user/forgot/password')
    api.add_resource(userResource.CheckUniqueString, '/api/user/check/uniquestring')
    api.add_resource(userResource.UpdateNewPassword, '/api/user/update/newpassword')
    api.add_resource(userResource.CheckVerification, '/api/user/verify')
    api.add_resource(userResource.SendVerifyEmail, '/api/user/send/verify-email')

from start import app, socketio
from flask_cors import CORS

from routes.index import Route_index

CORS(app, resources={r"/*":{"origins":"*"}})
Route_index(app)

@app.route("/")
def index():
    return "hello world"

if (__name__ == "__main__"):
    socketio.run(app, host='localhost', port=5001, debug=True, use_reloader=False)


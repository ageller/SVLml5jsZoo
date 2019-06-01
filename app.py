from flask import Flask, render_template, request, session
from flask_socketio import SocketIO, emit

from threading import Lock
import sys
import numpy as np

import json

#read in the data here?
with open('static/data/GZ2data.json', 'r') as json_file:  
    data_json = json.load(json_file)

#print(data_json)

app = Flask(__name__)

# Set this variable to "threading", "eventlet" or "gevent" to test the
# different async modes, or leave it set to None for the application to choose
# the best option based on installed packages.
async_mode = None

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app, async_mode=async_mode)
thread = None
thread_lock = Lock()

#global variables to hold the params object (not all of this needs to be passed along...)
viewerParams = None
updateViewerParams = False
MLParams = None
updateMLParams = False

#number of seconds between updates
seconds = 0.01

#this will pass to the viewer every "seconds" 
def background_thread():
	"""Example of how to send server generated events to clients."""
	global viewerParams, updateViewerParams, MLParams, updateMLParams
	while True:
		socketio.sleep(seconds)
		if (updateViewerParams):
			print("========= viewerParams:",viewerParams.keys())
			socketio.emit('update_viewerParams', viewerParams, namespace='/test')
		if (updateMLParams):
			print("========= MLParams:",MLParams.keys())
			socketio.emit('update_MLParams', MLParams, namespace='/test')
		updateViewerParams = False
		updateMLParams = False
		
#testing the connection
@socketio.on('connection_test', namespace='/test')
def connection_test(message):
	session['receive_count'] = session.get('receive_count', 0) + 1
	emit('connection_response',{'data': message['data'], 'count': session['receive_count']})


#sending data
@socketio.on('input_data_request', namespace='/test')
def input_data_request(message):
	session['receive_count'] = session.get('receive_count', 0) + 1
	emit('input_data_response',data_json)


######for viewer
#will receive data from viewer (and print to console as a test within "from_ml")
@socketio.on('viewer_input', namespace='/test')
def viewer_input(message):
	global viewerParams, updateViewerParams
	updateViewerParams = True
	viewerParams = message

#the background task sends data to the viewer
@socketio.on('connect', namespace='/test')
def from_viewer():
	global thread
	with thread_lock:
		if thread is None:
			thread = socketio.start_background_task(target=background_thread)

#######for ML engine
#will receive data from ml engine (and print to console as a test within "from_ml")
@socketio.on('ml_input', namespace='/test')
def ml_input(message):
	global MLParams, updateMLParams
	updateMLParams = True
	MLParams = message

#the background task sends data to the viewer
@socketio.on('connect', namespace='/test')
def from_viewer():
	global thread
	with thread_lock:
		if thread is None:
			thread = socketio.start_background_task(target=background_thread)

##############

#flask stuff
@app.route("/viewer")
def viewer():  
	return render_template("viewer.html")

@app.route("/ml")
def ml(): 
	return render_template("ml.html")

if __name__ == "__main__":
	socketio.run(app, debug=True, host='0.0.0.0', port=5000)
	#app.run(host='0.0.0.0')






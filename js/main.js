var sensorDataArray = [];

var listSensor = function(event) {
	var sensorData = {};
	// Process event.acceleration,
	// event.accelerationIncludingGravity,
	// event.rotationRate and event.interval
	sensorData.interval = event.interval;
	
	sensorData.gyrox = (event.rotationRate.alpha).toFixed(2);
	sensorData.gyroy = (event.rotationRate.beta).toFixed(2);
	sensorData.gyroz = (event.rotationRate.gamma).toFixed(2);
	sensorData.accx = (event.acceleration.x).toFixed(2);
	sensorData.accy = (event.acceleration.y).toFixed(2);
	sensorData.accz = (event.acceleration.z).toFixed(2);
	sensorData.gx = (event.accelerationIncludingGravity.x - event.acceleration.x)
			.toFixed(2);
	sensorData.gy = (event.accelerationIncludingGravity.y - event.acceleration.y)
			.toFixed(2);
	sensorData.gz = (event.accelerationIncludingGravity.z - event.acceleration.z)
			.toFixed(2);

	sensorData.t =  Date().now();

	sensorDataArray.push(sensorData);
};

var getSensor = function() {

	// add eventListener for tizenhwkey
	document.addEventListener('tizenhwkey', function(e) {
		if (e.keyName === "back") {
			try {
				tizen.application.getCurrentApplication().exit();
			} catch (ignore) {
			}
		}
	});

	var interval = document.querySelector('#interval');

	window.addEventListener("devicemotion", listSensor, true);

};

var SAAgent, SASocket, connectionListener, responseTxt = document
		.getElementById("responseTxt");

var sendData = function() {
	alert("called");
	window.removeEventListener("devicemotion", listSensor, true);
	alert("removed event" + sensorDataArray.length);

	/* Send new data to Consumer */
	SASocket.sendData(SAAgent.channelIds[0], sensorDataArray);
	sensorDataArray = [];

}

/* Make Provider application running in background */
// tizen.application.getCurrentApplication().hide();
function createHTML(log_string) {
	var content = document.getElementById("toast-content");
	content.innerHTML = log_string;
	tau.openPopup("#toast");
}

connectionListener = {
	/* Remote peer agent (Consumer) requests a service (Provider) connection */
	onrequest : function(peerAgent) {

		createHTML("peerAgent: peerAgent.appName<br />"
				+ "is requsting Service conncetion...");

		/* Check connecting peer by appName */
		if (peerAgent.appName === "TizenSensor") {
			SAAgent.acceptServiceConnectionRequest(peerAgent);
			createHTML("Service connection request accepted.");

		} else {
			SAAgent.rejectServiceConnectionRequest(peerAgent);
			createHTML("Service connection request rejected.");

		}
	},

	/* Connection between Provider and Consumer is established */
	onconnect : function(socket) {
		var onConnectionLost, dataOnReceive;

		createHTML("Service connection established");

		/* Obtaining socket */
		SASocket = socket;

		newData = sensorDataArray;
		document.getElementById("toast-content").innerHtml = newData;
		

		createHTML("Send massage:<br />" + newData + "onchannel id "
				+ SAAgent.channelIds[0]);

		onConnectionLost = function onConnectionLost(reason) {
			createHTML("Service Connection disconnected due to following reason:<br />"
					+ reason);
		};

		/* Inform when connection would get lost */
		SASocket.setSocketStatusListener(onConnectionLost);

		dataOnReceive = function dataOnReceive(channelId, data) {
			var newData;

			if (!SAAgent.channelIds[0]) {
				createHTML("Something goes wrong...NO CHANNEL ID!");
				return;
			}

			newData = sensorDataArray;
			document.getElementById("toast-content").innerHtml = newData;
			/* Send new data to Consumer */
			/*SASocket.sendData(SAAgent.channelIds[0], newData);
			createHTML("Send massage:<br />" + newData);*/
		};

		/* Set listener for incoming data from Consumer */
		SASocket.setDataReceiveListener(dataOnReceive);
	},
	onerror : function(errorCode) {
		createHTML("Service connection error<br />errorCode: " + errorCode);
	}
};

function requestOnSuccess(agents) {
	var i = 0;

	for (i; i < agents.length; i += 1) {
		if (agents[i].role === "PROVIDER") {
			createHTML("Service Provider found!<br />" + "Name: "
					+ agents[i].name);
			SAAgent = agents[i];
			break;
		}
	}

	/* Set listener for upcoming connection from Consumer */
	SAAgent.setServiceConnectionListener(connectionListener);
};

function requestOnError(e) {
	createHTML("requestSAAgent Error" + "Error name : " + e.name + "<br />"
			+ "Error message : " + e.message);
};

/* Requests the SAAgent specified in the Accessory Service Profile */
webapis.sa.requestSAAgent(requestOnSuccess, requestOnError);

(function() {
	/* Basic Gear gesture & buttons handler */
	window.addEventListener('tizenhwkey', function(ev) {
		var page, pageid;

		if (ev.keyName === "back") {
			page = document.getElementsByClassName('ui-page-active')[0];
			pageid = page ? page.id : "";
			if (pageid === "main") {
				try {
					tizen.application.getCurrentApplication().exit();
				} catch (ignore) {
				}
			} else {
				window.history.back();
			}
		}
	});
}());

(function(tau) {
	var toastPopup = document.getElementById('toast');

	toastPopup.addEventListener('popupshow', function(ev) {
		setTimeout(function() {
			tau.closePopup();
		}, 3000);
	}, false);
})(window.tau);
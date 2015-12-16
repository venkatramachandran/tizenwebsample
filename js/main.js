function log(logMessage) {
	document.querySelector("#log").innerHTML = logMessage;
}

window.onload = function() {

    // add eventListener for tizenhwkey
    document.addEventListener('tizenhwkey', function(e) {
        if (e.keyName === "back") {
            try {
                tizen.application.getCurrentApplication().exit();
            } catch (ignore) {}
        }
    });

    var interval = document.querySelector('#interval'),
        gyrox = document.querySelector('#gyrox'),
        gyroy = document.querySelector('#gyroy'),
        gyroz = document.querySelector('#gyroz'),
        accx = document.querySelector('#accx'),
        accy = document.querySelector('#accy'),
        accz = document.querySelector('#accz'),
        gx = document.querySelector('#gx'),
        gy = document.querySelector('#gy'),
        gz = document.querySelector('#gz');
    window.addEventListener("devicemotion", function(event) {
        // Process event.acceleration, event.accelerationIncludingGravity,
        // event.rotationRate and event.interval
        interval.innerHTML = event.interval;
        gyrox.innerHTML = (event.rotationRate.alpha).toFixed(2);
        gyroy.innerHTML = (event.rotationRate.beta).toFixed(2);
        gyroz.innerHTML = (event.rotationRate.gamma).toFixed(2);
        accx.innerHTML = (event.acceleration.x).toFixed(2);
        accy.innerHTML = (event.acceleration.y).toFixed(2);
        accz.innerHTML = (event.acceleration.z).toFixed(2);
        gx.innerHTML = (event.accelerationIncludingGravity.x - event.acceleration.x).toFixed(2);
        gy.innerHTML = (event.accelerationIncludingGravity.y - event.acceleration.y).toFixed(2);
        gz.innerHTML = (event.accelerationIncludingGravity.z - event.acceleration.z).toFixed(2);
    }, true);
    log("onLoad complete");
};

var SAAgent,
    SASocket,
    connectionListener = {
        //Remote peer agent (Consumer) requests a service (Provider) connection 
        onrequest: function(peerAgent) {

            //Check connecting peer by appName
            if (peerAgent.appName === "TizenSensor") {
                SAAgent.acceptServiceConnectionRequest(peerAgent);
                log("Service connection request accepted.");
            } else {
                SAAgent.rejectServiceConnectionRequest(peerAgent);
                log("Service connection request rejected.");

            }
        },

        //Connection between Provider and Consumer is established 
        onconnect: function(socket) {
            var onConnectionLost,
                dataOnReceive;

            //Obtaining socket 
            SASocket = socket;

            onConnectionLost = function onConnectionLost(reason) {
                log("connection lost:" + reason);
            };

            //Inform when connection would get lost 
            SASocket.setSocketStatusListener(onConnectionLost);

            dataOnReceive = function dataOnReceive(channelId, data) {
                var newData;

                if (!SAAgent.channelIds[0]) {
                    log("no channel id");
                    return;
                }
                newData = data + " :: " + new Date();

                //Send new data to Consumer 
                SASocket.sendData(SAAgent.channelIds[0], newData);
                log("sent data:" + newData);
            };

            //Set listener for incoming data from Consumer 
            SASocket.setDataReceiveListener(dataOnReceive);
        },
        onerror: function(errorCode) {
            log("Service connection error.errorCode: " + errorCode);
        }
    };

function requestOnSuccess(agents) {
    var i = 0;

    for (i; i < agents.length; i += 1) {
        if (agents[i].role === "PROVIDER") {
            log("Service Provider found!Name: " + agents[i].name);
            SAAgent = agents[i];
            break;
        }
    }

    //Set listener for upcoming connection from Consumer 
    SAAgent.setServiceConnectionListener(connectionListener);
}

function requestOnError(e) {
  log("requestSAAgent Error, Error name : " + e.name + "<br />, Error message : " + e.message);
}
//Requests the SAAgent specified in the Accessory Service Profile 
webapis.sa.requestSAAgent(requestOnSuccess, requestOnError);
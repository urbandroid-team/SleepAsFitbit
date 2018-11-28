import * as messaging from "messaging";
import { me } from "companion";

const POLLING_INTERVAL = 1000
var pollingTimer

initializeWatchMessaging();
startPolling();

function startPolling() {
  console.log("start polling")
  pollingTimer = setInterval(function(){sendMessageToPhone("poll", "0")}, POLLING_INTERVAL)
}

function stopPolling() {
  clearInterval(pollingTimer)
}

function sendMessageToWatch(message) {
  console.log("sendMessageToWatch")
  console.log(message)
  if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
    console.log("sendMessageToWatch peerSocket open")
      messaging.peerSocket.send(message);
  }
}

function sendMessageToPhone(command, data) {
  // console.log("sendMessageToPhone")

  fetch('http://localhost:1764/' + command + '?data=' + data)
  .then(function(response) { return response.text(); })
  .then(function(msg) {
    // console.log('Companion: sendMessageToPhone successful, collecting incoming mail...');
    // console.log(msg);

    // to prevent unnecessary messaging over bt, we throw away empty messages
    if (msg.length > 2) { sendMessageToWatch(msg) }
  })
  .catch(function(error) {
    // this most probably means server on phone is not started
    // TODO: what to do? Probably show something on the watch, like "start tracking on the phone"
    // console.error(error)
  });
}

function initializeWatchMessaging(){
  messaging.peerSocket.onopen = () => {
  }

  messaging.peerSocket.onerror = (err) => {
    console.error(`Connection error: ${err.code} - ${err.message}`);
  }

  messaging.peerSocket.onmessage = (evt) => {
    console.log("Received from watch: " + JSON.stringify(evt.data));
    sendMessageToPhone(evt.data.command, evt.data.data)
  }
}

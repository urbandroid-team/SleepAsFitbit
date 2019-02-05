import * as messaging from "messaging";
import { me } from "companion";
import { MsgQueue } from "../common/msgQueue";

const POLLING_INTERVAL = 2000
var sleepCommTimer
let queueToSleep = new MsgQueue()

startWatchCommChannel();
startSleepCommChannel();

function startSleepCommChannel() {
  console.log("startSleepCommChannel")
  sleepCommTimer = setInterval(() => {
    // queueToSleep.logQueue()
    if (queueToSleep.getMsgCount() > 0) {
      let nextMsg = queueToSleep.getNextMessage()
      sendMessageToSleep(nextMsg[0], nextMsg[1])
    } else {
      sendMessageToSleep('poll', '0')
    }
  }, POLLING_INTERVAL);
}

function stopSleepCommChannel() {
  clearInterval(sleepCommTimer)
}

function sendMessageToWatch(message) {
  console.log("sendMessageToWatch: " + message)
  if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
    console.log("sendMessageToWatch peerSocket open")
      messaging.peerSocket.send(message);
      // TODO vyresit error stav - preposilani
  }
}

function sendMessageToSleep(command, data) {
  console.log("sendMessageToSleep")
  // console.log("sendMessageToSleep: " + command)
  let url = 'http://localhost:1764/' + command + '?data=' + data
  // console.log('url ' + url)
  fetch(url)
  .then(function(response) { return response.text(); })
  .then(function(msg) {
    console.log('sendMessageToSleep success, collecting incoming mail: ' + msg);
    let msgArray = JSON.parse(msg)
    msgArray.forEach(message => {
      sendMessageToWatch(message)
      // console.log("Element " + element['name'])
      // console.log("Element " + element['data'])
    });
  })
  .catch(function(error) {
    // this most probably means server on phone is not started
    // TODO: what to do? Probably show something on the watch, like "start tracking on the phone"
    console.error("sendMessageToSleep err " + error)
  });
}

function startWatchCommChannel(){
  messaging.peerSocket.onopen = () => {
  }

  messaging.peerSocket.onerror = (err) => {
    console.error(`Connection error: ${err.code} - ${err.message}`);
  }

  messaging.peerSocket.onmessage = (evt) => {
    console.log("Received from watch");
    // console.log("Received from watch: " + JSON.stringify(evt.data));
    queueToSleep.addToQueue(evt.data.command, evt.data.data)
  }
}
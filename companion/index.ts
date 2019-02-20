import * as messaging from "messaging";
import { MsgQueue } from "../common/msgQueue";
import { Message } from "../app/model/message";

const POLLING_INTERVAL = 1000
const TO_WATCH_MESSAGING_INTERVAL = 2000

let toSleepQueue = new MsgQueue("toSleep")
let toSleepTimer:any

let toWatchQueue = new MsgQueue("toWatch")
let toWatchTimer:any

// TODO missing adding to toSleepQueue

startSleepPollingTimer(toSleepQueue, toSleepTimer)
initializeToWatchChannel()

function startSleepPollingTimer(queue:MsgQueue, timer: any) {
  timer = setInterval(() => {
    // console.log(">> msg timer to Sleep TICK")
    if (queue.getMsgCount() > 0) {
      queue.logQueue()
      sendMessageToSleep(queue.getNextMessage())
    } else {
      sendMessageToSleep(new Message('poll', '0'))
    }
  }, POLLING_INTERVAL);
}

function sendMessageToSleep(msg:Message) {
  let url = 'http://localhost:1764/' + msg.command + '?data=' + msg.data
  // console.log("sendMessageToSleep " + url)
  fetch(url)
    .then(response => {
      // console.log("sendMessageToSleep response")
      return response.text();
    })
    .then(fromSleepMsg => {
      // console.log("sendMessageToSleep fromSleepMsg")
      processMessageFromSleep(fromSleepMsg)
    })
    .catch(error => {
      // this most probably means server on phone is not started
      // TODO: what to do? Probably show something on the watch, like "start tracking on the phone"
      console.error("sendMessageToSleep err " + error)
    });
}

function processMessageFromSleep(unparsedMsg:any) {
  // console.log("unparsedMsg " + unparsedMsg)
  // console.log("unparsedMsg length " + unparsedMsg.length)
  let msgArray = JSON.parse(unparsedMsg)
  // console.log("parsedMsgArray length " + msgArray.length)
  if (msgArray.length > 0) {
    msgArray.forEach((msg: any) => {
      console.log("Adding to queue " + msg['name'] + " " + msg['data'])
      toWatchQueue.addToQueue(new Message(msg['name'], msg['data']))
    });
  }
}

function initializeToWatchChannel() {
  if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
    startToWatchTimer(toWatchQueue, toWatchTimer)
  } else {
    messaging.peerSocket.onopen = () => {
      startToWatchTimer(toWatchQueue, toWatchTimer)
    }
  }

  messaging.peerSocket.onmessage = (evt) => {
    let msg = Message.deserialize(evt.data)
    console.log("Received from watch " + msg.command);
    // evt.data should be type Message. How to check?
    toSleepQueue.addToQueue(msg)
  }
}

function startToWatchTimer(queue:MsgQueue, timer: any) {
  timer = setInterval(() => {
    // console.log("sending to watch TICK")
    let nextMsg = queue.peekNextMessage()
    if (nextMsg) {
      queue.logQueue()
      sendMessageToWatch(nextMsg, queue)
    }
  }, TO_WATCH_MESSAGING_INTERVAL)
}

function sendMessageToWatch(msg:Message, queue:MsgQueue) {
  if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
    messaging.peerSocket.send(msg.serialize());
    queue.removeNextMessage()
  } else {
    console.error("ToWatch send message error: " + msg)
  }
}
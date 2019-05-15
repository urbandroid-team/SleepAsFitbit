import { MsgQueue } from "../common/msgQueue";
import { Message } from "../app/model/message";
import { FileTransferAdapter } from "./messaging/fileTransferAdapter";
import { me } from 'companion'
import { MessagingAdapter } from "./messaging/messagingAdapter";
import { MockAdapter } from "./messaging/mockAdapter";
import { app } from "peer";

import { version } from "../version"

const POLLING_INTERVAL = 1000

let mockSleep = false;

let toSleepQueue = new MsgQueue("toSleep")
let toSleepTimer:any
var debug = false

let msgAdapter = new MessagingAdapter
// let msgAdapter = new MessagingAdapter

console.log("Companion started")
startSleepPollingTimer(toSleepQueue, toSleepTimer)

// fitlogger.init({
//   doConsoleLog: true
// })

me.wakeInterval = 5 * 60 * 1000
toSleepQueue.addToQueue(new Message("version", version))

msgAdapter.init(
  (msg: Message) => {
    toSleepQueue.addToQueue(msg)
  },
  (msgAcked: Message) => {
    if (msgAcked.command == "ping") {
      sendMessageToSleep(new Message("connected", ""))
    }
    if (msgAcked.command == "stop") {
      me.wakeInterval = undefined
    }
  }
)

me.addEventListener('unload', function() {
  sendMessageToSleep(new Message("companion unloaded", ""))
  console.log("Companion unloaded")
})


function startSleepPollingTimer(queue:MsgQueue, timer: any) {

  toSleepQueue.addToQueue(new Message("companionStart", " peerApp " + (me.launchReasons.peerAppLaunched ? 1 : 0) + " fileTrans " + (me.launchReasons.fileTransfer ? 1 : 0) + " wakeUp " + (me.launchReasons.wokenUp ? 1 : 0)))

  timer = setInterval(() => {
    // console.log(">> msg timer to Sleep TICK")
    if (queue.getMsgCount() > 0) {
      queue.logQueue()
      sendMessageToSleep(queue.peekNextMessage())
    } else {
      sendMessageToSleep(new Message('poll', '0'))
    }
  }, POLLING_INTERVAL);
}

function sendMessageToSleep(msg:Message) {
  // console.log("app readystate: " + app.readyState)

  if (mockSleep) {
    toSleepQueue.clearQueue()
    return
  }

  let url = 'http://localhost:1764/' + encodeURIComponent(msg.command) + '?data=' + encodeURIComponent(msg.data)
  // console.log("sendMessageToSleep " + url)
  fetch(url)
    .then((response:any) => {
      // console.log("sendMessageToSleep response")
      toSleepQueue.removeNextMessage()
      return response.text();
    })
    .then((fromSleepMsg:any) => {
      // console.log("sendMessageToSleep fromSleepMsg")
      processMessageFromSleep(fromSleepMsg)
    })
    .catch((error:any) => {
      // this most probably means server on phone is not started
      // TODO: what to do? Probably show something on the watch, like "start tracking on the phone"
      !debug && console.error("sendMessageToSleep err " + error)
    });

}

function processMessageFromSleep(unparsedMsg:any) {
  // console.log("unparsedMsg " + unparsedMsg)
  // console.log("unparsedMsg length " + unparsedMsg.length)
  let msgArray = JSON.parse(unparsedMsg)
  // console.log("parsedMsgArray length " + msgArray.length)
  if (msgArray.length > 0) {
    let msgs = filterOutStopIfStartPresent(msgArray)

    msgs.forEach((msg: any) => {
      let mess = new Message(msg['name'], msg['data'])

      console.log("Enqueue to watch: " + mess.command + " " + mess.data)
      if (mess.command == 'ping') {
        msgAdapter.send_if_not_enqueued(mess)
      } else {
        msgAdapter.send(mess)
      }
    });
  }
}

function filterOutStopIfStartPresent(msgs:any[]) {
  var startPresent:boolean = msgs.filter(msg => {
    return msg['name'] === 'start'
  }).length > 0

  if (startPresent) {
    return msgs.filter(msg => {
      return msg['name'] !== 'stop'
    })
  }

  return msgs
}

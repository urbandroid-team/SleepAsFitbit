import { MsgQueue } from "../common/msgQueue";
import { Message } from "../app/model/message";
import { FileTransferAdapter } from "./messaging/fileTransferAdapter";
import { me } from 'companion'
import { MessagingAdapter } from "./messaging/messagingAdapter";
import { MockAdapter } from "./messaging/mockAdapter";
//@ts-ignore
import fitlogger from "../node_modules/fitbit-logger/companion";


const POLLING_INTERVAL = 1000

let mockSleep = false;

let toSleepQueue = new MsgQueue("toSleep")
let toSleepTimer:any
var debug = false

let msgAdapter = new MessagingAdapter
// let msgAdapter = new MessagingAdapter

console.log("Companion started")
startSleepPollingTimer(toSleepQueue, toSleepTimer)

fitlogger.init({
  doConsoleLog: true,
  url: 'http://localhost:1764'
})


msgAdapter.init((msg: Message) => {
  toSleepQueue.addToQueue(msg)
})

// TODO when should we cancel the wake interval??
me.wakeInterval = 5 * 60 * 1000

me.addEventListener('unload', function() {
  console.log("Companion unloaded")
  toSleepQueue.addToQueue(new Message("Companion unloaded", null))
})

function startSleepPollingTimer(queue:MsgQueue, timer: any) {

  toSleepQueue.addToQueue(new Message("Companion started", "peerApp " + me.launchReasons.peerAppLaunched + " fileTransfer " + me.launchReasons.fileTransfer + " wokenUp " + me.launchReasons.wokenUp))

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
  if (mockSleep) {
    toSleepQueue.clearQueue()
    return
  }

  let url = 'http://localhost:1764/' + msg.command + '?data=' + msg.data
  // console.log("sendMessageToSleep " + url)
  fetch(url)
    .then((response:any) => {
      // console.log("sendMessageToSleep response")
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
      console.log("Enqueue to watch: " + msg['name'] + " " + msg['data'])
      // toWatchQueue.addToQueue(new Message(msg['name'], msg['data']))
      msgAdapter.send(new Message(msg['name'], msg['data']))
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

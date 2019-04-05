import { MsgQueue } from "../common/msgQueue";
import { Message } from "../app/model/message";
import { FileTransferAdapter } from "./messaging/fileTransferAdapter";
import { me } from 'companion'
import { MessagingAdapter } from "./messaging/messagingAdapter";
import { MockAdapter } from "./messaging/mockAdapter";

const POLLING_INTERVAL = 1000

let toSleepQueue = new MsgQueue("toSleep")
let toSleepTimer:any
var debug = true

let msgAdapter = new MessagingAdapter
// let msgAdapter = new MessagingAdapter

console.log("Companion started")
startSleepPollingTimer(toSleepQueue, toSleepTimer)

msgAdapter.init((msg: Message) => {
  toSleepQueue.addToQueue(msg)
})

// TODO when should we cancel the wake interval??
// me.wakeInterval = 5 * MINUTE_IN_MS

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

// function initializeToWatchChannel() {
//   if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
//     startToWatchTimer(toWatchQueue, toWatchTimer)
//   } else {
//     messaging.peerSocket.onopen = () => {
//       startToWatchTimer(toWatchQueue, toWatchTimer)
//     }
//   }

//   messaging.peerSocket.onmessage = (evt) => {
//     let msg = Message.deserialize(evt.data)
//     console.log("Received from watch " + msg.command);
//     toSleepQueue.addToQueue(msg)
//   }
// }



// function startToWatchTimer(queue:MsgQueue, timer: any) {
//   timer = setInterval(() => {
//     // console.log("sending to watch TICK")
//     let nextMsg = queue.peekNextMessage()
//     if (nextMsg) {
//       queue.logQueue()
//       sendMessageToWatch(nextMsg, queue)
//     }
//   }, TO_WATCH_MESSAGING_INTERVAL)
// }

// function sendMessageToWatch(msg:Message, queue:MsgQueue) {
//   if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
//     messaging.peerSocket.send(msg.serialize());
//     queue.removeNextMessage()
//   } else {
//     console.error("ToWatch send message error: " + msg)
//   }
// }

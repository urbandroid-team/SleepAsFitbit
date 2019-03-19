import { MsgQueue } from "../common/msgQueue";
import { Message } from "../app/model/message";
import { me } from "companion";
import { FileTransferAdapter } from "./messaging/fileTransferAdapter";


const POLLING_INTERVAL = 1000
const TO_WATCH_MESSAGING_INTERVAL = 2000
const MINUTE_IN_MS = 60 * 1000

let toSleepQueue = new MsgQueue("toSleep")
let toSleepTimer:any

let toWatchQueue = new MsgQueue("toWatch")
let toWatchTimer:any

let msgAdapter = new FileTransferAdapter

console.log("Companion started")
startSleepPollingTimer(toSleepQueue, toSleepTimer)


msgAdapter.init((msg: Message) => {
  toSleepQueue.addToQueue(msg)
})

// TODO when should we cancel the wake interval??
// me.wakeInterval = 5 * MINUTE_IN_MS
me.wakeInterval = undefined
console.log(me.wakeInterval)

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

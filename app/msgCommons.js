import * as messaging from "messaging";
import { Hr, Acc } from './sensorsv2'
import { me } from 'appbit'

const MESSAGING_INTERVAL = 1000

// from watch or to Sleep
export const FITBIT_MESSAGE_START_TRACK = "start"
export const FITBIT_MESSAGE_STOP_TRACK = "stop"
export const FITBIT_MESSAGE_DATA = "data"
export const FITBIT_MESSAGE_ALARM_SNOOZE = "alarm_snooze"
export const FITBIT_MESSAGE_ALARM_DISMISS = "alarm_dismiss"
export const FITBIT_MESSAGE_PAUSE = "pause"
export const FITBIT_MESSAGE_RESUME = "resume"

// to watch
export const FITBIT_MESSAGE_PAUSE_TIME = "pause_time"
export const FITBIT_MESSAGE_ALARM_START = "alarm_start"
export const FITBIT_MESSAGE_ALARM_STOP = "alarm_stop"
export const FITBIT_MESSAGE_ALARM_TIME = "alarm_time"
export const FITBIT_MESSAGE_BATCH_SIZE = "batch_size"
export const FITBIT_MESSAGE_HINT = "hint"
export const FITBIT_MESSAGE_SUSPEND = "suspend"

let acc = null
let hr = null
let queue = null
let batch_size = 12

export function sendToCompanion(command, data) {
  if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
    messaging.peerSocket.send({ command: command, data: data })
  }
}

export function initCompanionMessaging() {
  console.log("Max message size=" + messaging.peerSocket.MAX_MESSAGE_SIZE);

  startMessagingTimer()

  messaging.peerSocket.onmessage = (evt) => {
    console.log("received message")
    let parsedMsg = JSON.parse(evt.data)
    handleIncomingMessageArray(parsedMsg)
  }
}

export function handleIncomingMessageArray(msgArray) {
  for (let msg of msgArray) {
    console.log("Received from companion: " + msg.name + ' ' + msg.data);
    handleIncomingMessage(msg)
  }
}

function startMessagingTimer() {
  startTracking(true)
  setInterval(function() {
    // TODO: do something with queue
  }, MESSAGING_INTERVAL)
}

function handleIncomingMessage(msg) {
  switch (msg.name) {
    case FITBIT_MESSAGE_START_TRACK:
      (msg.data == "DO_HR_MONITORING") ? startTracking(true) : startTracking(false)
      break
    case FITBIT_MESSAGE_STOP_TRACK:
      stopTracking()
      break
    case FITBIT_MESSAGE_ALARM_SNOOZE:
      break
    case FITBIT_MESSAGE_ALARM_DISMISS:
      break
    case FITBIT_MESSAGE_PAUSE:
      break
    case FITBIT_MESSAGE_RESUME:
      break

      // to watch
    case FITBIT_MESSAGE_PAUSE_TIME:
      break
    case FITBIT_MESSAGE_ALARM_START:
      startAlarm()
      break
    case FITBIT_MESSAGE_ALARM_STOP:
      break
    case FITBIT_MESSAGE_ALARM_TIME:
      
      break
    case FITBIT_MESSAGE_BATCH_SIZE:
      batch_size = msg.data
      break
    case FITBIT_MESSAGE_HINT:
      break
    case FITBIT_MESSAGE_SUSPEND:
      break
  }
}

function startTracking(hrEnabled) {
  acc = new Acc()
  let accArr = []
  let accRawArr = []
  acc.startSensor((acc, accRaw) => {
    accArr.push.apply(accArr, acc)
    accRawArr.push.apply(accRawArr, accRaw)

    if (accArr.length > batch_size) {
      queue.addToQueue("data",[accArr,accRawArr])
    }
  })

    if (hrEnabled && me.permissions.granted("access_heart_rate")) {
    hr = new Hr()
    hr.startSensor((hr) => {
      queue.addToQueue("hr", hr)
    })
  }
}

function stopTracking() {
  if (acc != null) { acc.stopSensor() }
  if (hr != null) { hr.stopSensor() }
  queue.clearQueue()
  me.exit()
}

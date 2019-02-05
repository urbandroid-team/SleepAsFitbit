import * as messaging from "messaging";
import { Hr, Acc, stopAllSensors } from './controller/sensorsController'
import { me } from 'appbit'
import { AlarmManager } from "./controller/alarmManager";
import { MsgQueue } from "../common/msgQueue";
import * as ui from './view/uiManager'
import * as utils from '../common/utils'
import { VibrationPlayer } from "./controller/vibrationPlayer";

const MESSAGING_INTERVAL = 1000

// from watch or to Sleep
export const FITBIT_MESSAGE_START_TRACK = "start"
export const FITBIT_MESSAGE_STOP_TRACK = "stop"
export const FITBIT_MESSAGE_DATA = "acceld"
export const FITBIT_MESSAGE_HR_DATA = "hrd"
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
let queue = new MsgQueue()
let batch_size = 12

export function startCompanionCommChannel() {
  console.log("Max message size=" + messaging.peerSocket.MAX_MESSAGE_SIZE);

  if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
    startOutMessagingTimer()
  } else {
    messaging.peerSocket.onopen = () => {
      startOutMessagingTimer()
    }
  }

  messaging.peerSocket.onmessage = (evt) => {
    console.log("received message")
    let parsedMsg = JSON.parse(evt.data)
    handleIncomingMessageArray(parsedMsg)
  }
}

export function sendToCompanion(command, data) {
  console.log("sendMesageToCompanion " + command + " " + data)
  try {
    if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
      messaging.peerSocket.send({ command: command, data: data })
    } else {
      console.log("SendToCompanion socket closed, not sending: " + command)
    }
  }
  catch (err) {
    console.log(err)
  }
}

export function handleIncomingMessageArray(msgArray) {
  for (let msg of msgArray) {
    console.log("Received from companion: " + msg.name + ' ' + msg.data);
    handleIncomingMessage(msg)
  }
}

function startOutMessagingTimer() {
  startTracking(true)
  setInterval(function() {
    if (queue.getMsgCount() > 0) {
      let nextMsg = queue.getNextMessage()
      sendToCompanion(nextMsg[0], nextMsg[1])
    }
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
    case FITBIT_MESSAGE_RESUME:
      resumeTracking()
      break
    case FITBIT_MESSAGE_PAUSE_TIME:
      pauseTracking(msg.data)
      break
    case FITBIT_MESSAGE_ALARM_START:
      startAlarm(msg.data)
      break
    case FITBIT_MESSAGE_ALARM_STOP:
      stopAlarm()
      break
    case FITBIT_MESSAGE_ALARM_TIME:
      scheduleAlarm(msg.data)
      break
    case FITBIT_MESSAGE_BATCH_SIZE:
      // TODO tohle nestaci pri sensor batchingu - je potreba vytvorit novy Acc a nejak dumpnout data z toho stareho
      batch_size = msg.data
      break
    case FITBIT_MESSAGE_HINT:
      doHint(msg.data)
      break
    case FITBIT_MESSAGE_SUSPEND:
      // I'm not listening to this!
      break
  }
}

// Specific message handling below

function startTracking(hrEnabled) {

  if (context.tracking) {
    console.log("startTracking - already tracking")
    return
  } else {
    context.tracking = true
  }

  console.log("startTracking")
  queue.addToQueue(FITBIT_MESSAGE_START_TRACK)

  acc = new Acc()
  var accArr = []
  var accRawArr = []
  acc.startSensor((acc, accRaw) => {
    accArr.push.apply(accArr, acc)
    accRawArr = accRawArr.concat(accRaw)
    if (accArr.length > batch_size) {
      queue.addToQueue(FITBIT_MESSAGE_DATA, formatOutgoingAccData(accArr, accRawArr))
      accArr = []
      accRawArr = []
    }
  })

    if (hrEnabled && me.permissions.granted("access_heart_rate")) {
    hr = new Hr()
    hr.startSensor((hr) => {
      queue.addToQueue(FITBIT_MESSAGE_HR_DATA, hr)
    })
  }
}

function formatOutgoingAccData(maxDataArr, maxRawDataArr) {
  // extras.putFloatArray("MAX_DATA", data.split(";")[0].split(":").map{ it.toFloat() }.toFloatArray())
  // extras.putFloatArray("MAX_RAW_DATA", data.split(";")[1].split(":").map{ it.toFloat() }.toFloatArray())
  return [maxDataArr.join(':'),maxRawDataArr.join(':')].join(';')
}

function stopTracking() {
  stopAllSensors([acc,hr])
  queue.clearQueue()
  me.exit()
}

function pauseTracking(timestamp) {
  if (timestamp > 0) {
    ui.setStatusPause()
  } else {
    resumeTracking()
  }
}

function resumeTracking() {
  ui.setStatusTracking()
}

function startAlarm(vibrationDelay) {
  new AlarmManager().startAlarm(vibrationDelay)
}

function stopAlarm() {
  new AlarmManager().stopAlarm()
}

function scheduleAlarm(timestamp) {
  console.log("ScheduleAlarm timestamp: " + timestamp)
  new AlarmManager().scheduleAlarm(timestamp)
}

function doHint(repeat) {
  new VibrationPlayer().doHint(repeat)
}



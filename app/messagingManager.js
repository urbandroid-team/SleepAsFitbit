import * as messaging from "messaging";
import { Hr, Acc } from './sensorsv1'
import { me } from 'appbit'
import { MsgQueue } from './queue.js'

export class MessagingManager {
  constructor() {
    const FITBIT_MESSAGE_START_TRACK = "start"
    const FITBIT_MESSAGE_STOP_TRACK = "stop"
    const FITBIT_MESSAGE_DATA = "data"
    const FITBIT_MESSAGE_ALARM_SNOOZE = "alarm_snooze"
    const FITBIT_MESSAGE_ALARM_DISMISS = "alarm_dismiss"
    const FITBIT_MESSAGE_PAUSE = "pause"
    const FITBIT_MESSAGE_RESUME = "resume"

    // to watch
    const FITBIT_MESSAGE_PAUSE_TIME = "pause_time"
    const FITBIT_MESSAGE_ALARM_START = "alarm_start"
    const FITBIT_MESSAGE_ALARM_STOP = "alarm_stop"
    const FITBIT_MESSAGE_ALARM_TIME = "alarm_time"
    const FITBIT_MESSAGE_BATCH_SIZE = "batch_size"
    const FITBIT_MESSAGE_HINT = "hint"
    const FITBIT_MESSAGE_SUSPEND = "suspend"

    let acc = null
    let hr = null
    let queue = null

    function initCompanionMessaging() {
      console.log("Max message size=" + messaging.peerSocket.MAX_MESSAGE_SIZE);

      queue = new MsgQueue()

      messaging.peerSocket.onmessage = (evt) => {
        console.log("received message")
        let parsedMsg = JSON.parse(evt.data)
        handleIncomingMessageArray(parsedMsg)
      }
    }

    function handleIncomingMessageArray(msgArray) {
      for (let msg of msgArray) {
        console.log("Received from companion: " + msg.name + ' ' + msg.data);
        handleIncomingMessage(msg)
      }
    }

    function handleIncomingMessage(msg) {
      switch (msg.name) {
        case FITBIT_MESSAGE_START_TRACK:
          if (msg.data == "DO_HR_MONITORING") {
            startTracking(true)
          } else {
            startTracking(false)
          }
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
          break
        case FITBIT_MESSAGE_ALARM_STOP:
          break
        case FITBIT_MESSAGE_ALARM_TIME:
          break
        case FITBIT_MESSAGE_BATCH_SIZE:
          break
        case FITBIT_MESSAGE_HINT:
          break
        case FITBIT_MESSAGE_SUSPEND:
          break
      }
    }

    function startTracking(hrEnabled) {
      acc = new Acc()
      acc.startSensor(this)
      console.log("startTracking")
      console.log(this)

      if (hrEnabled) {
        hr = new Hr()
        hr.startSensor(this)
      }
    }

    function stopTracking() {
      if (acc != null) { acc.stopSensor() }
      if (hr != null) { hr.stopSensor() }
      queue.cl
      me.exit()
    }

    initCompanionMessaging()
  }

  sendToCompanion(command, data) {
    if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
      messaging.peerSocket.send({ command: command, data: data })
    }
  }
}
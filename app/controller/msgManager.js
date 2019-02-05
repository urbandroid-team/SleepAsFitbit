import { MsgQueue } from "../../common/msgQueue";
import * as messaging from "messaging";
import { Hr, Acc, stopAllSensors } from './sensorsController'
import { me } from 'appbit'
import { AlarmManager } from "./alarmManager";
import * as ui from '../view/uiManager'
import { VibrationPlayer } from "./vibrationPlayer";
import { Context } from "./context";

export class MsgManager {
  // Static constants
  static get MESSAGING_INTERVAL() { return 1000 }

  // from watch or to Sleep
  static get FITBIT_MESSAGE_START_TRACK() { return "start" }
  static get FITBIT_MESSAGE_STOP_TRACK() { return "stop" }
  static get FITBIT_MESSAGE_DATA() { return "acceld" }
  static get FITBIT_MESSAGE_HR_DATA() { return "hrd" }
  static get FITBIT_MESSAGE_ALARM_SNOOZE() { return "alarm_snooze" }
  static get FITBIT_MESSAGE_ALARM_DISMISS() { return "alarm_dismiss" }
  static get FITBIT_MESSAGE_PAUSE() { return "pause" }
  static get FITBIT_MESSAGE_RESUME() { return "resume" }

  // to watch
  static get FITBIT_MESSAGE_PAUSE_TIME() { return "pause_time" }
  static get FITBIT_MESSAGE_ALARM_START() { return "alarm_start" }
  static get FITBIT_MESSAGE_ALARM_STOP() { return "alarm_stop" }
  static get FITBIT_MESSAGE_ALARM_TIME() { return "alarm_time" }
  static get FITBIT_MESSAGE_BATCH_SIZE() { return "batch_size" }
  static get FITBIT_MESSAGE_HINT() { return "hint" }
  static get FITBIT_MESSAGE_SUSPEND() { return "suspend" }

  constructor(context:Context) {
    this.ctx = context

    this.queue = new MsgQueue()
    this.batch_size = 12
  }

  startCompanionCommChannel() {
    console.log(">>ToCompanion channel init")
    // console.log("Max msg size=" + messaging.peerSocket.MAX_MESSAGE_SIZE);
    if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
      this.startOutMessagingTimer()
    } else {
      messaging.peerSocket.onopen = () => {
        this.startOutMessagingTimer()
      }
    }

    messaging.peerSocket.onmessage = (evt) => {
      console.log("received message")
      let parsedMsg = JSON.parse(evt.data)
      this.handleIncomingMessageArray(parsedMsg)
    }
  }

  startOutMessagingTimer() {
    startTracking(true)
    setInterval(function () {
      if (this.queue.getMsgCount() > 0) {
        let nextMsg = this.queue.getNextMessage()
        this.sendToCompanion(nextMsg[0], nextMsg[1])
      }
    }, MESSAGING_INTERVAL)
  }

  sendToCompanion(command, data) {
    console.log(">>ToCompanion " + command + " " + data)
    try {
      if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
        messaging.peerSocket.send({ command: command, data: data })
      } else {
        console.log(">>ToCompanion socket closed, msg not sent.")
      }
    }
    catch (err) {
      console.log(err)
    }
  }

  handleIncomingMessageArray(msgArray) {
    for (let msg of msgArray) {
      console.log("Received from companion: " + msg.name + ' ' + msg.data);
      this.handleIncomingMessage(msg)
    }
  }

  handleIncomingMessage(msg) {
    switch (msg.name) {
      case MsgManager.FITBIT_MESSAGE_START_TRACK:
        (msg.data == "DO_HR_MONITORING") ? this.startTracking(true) : this.startTracking(false)
        break
      case MsgManager.FITBIT_MESSAGE_STOP_TRACK:
        this.stopTracking()
        break
      case MsgManager.FITBIT_MESSAGE_RESUME:
        this.resumeTracking()
        break
      case MsgManager.FITBIT_MESSAGE_PAUSE_TIME:
        this.pauseTracking(msg.data)
        break
        case MsgManager.FITBIT_MESSAGE_ALARM_START:
        this.startAlarm(msg.data)
        break
      case MsgManager.FITBIT_MESSAGE_ALARM_STOP:
        this.stopAlarm()
        break
      case MsgManager.FITBIT_MESSAGE_ALARM_TIME:
        this.scheduleAlarm(msg.data)
        break
      case MsgManager.FITBIT_MESSAGE_BATCH_SIZE:
        // TODO tohle nestaci pri sensor batchingu - je potreba vytvorit novy Acc a nejak dumpnout data z toho stareho
        this.batch_size = msg.data
        break
      case MsgManager.FITBIT_MESSAGE_HINT:
        this.doHint(msg.data)
        break
      case MsgManager.FITBIT_MESSAGE_SUSPEND:
        // I'm not listening to this!
        break
    }
  }

  // Specific message handling below

  startTracking(hrEnabled) {
    if (!this.ctx.proposeTrackingStart()) {
        console.log("startTracking - already tracking")
        return
    }

    console.log("startTracking")
    this.queue.addToQueue(MsgManager.FITBIT_MESSAGE_START_TRACK)

    acc = new Acc()
    var accArr = []
    var accRawArr = []
    acc.startSensor((acc, accRaw) => {
      accArr.push.apply(accArr, acc)
      accRawArr = accRawArr.concat(accRaw)
      if (accArr.length > batch_size) {
        this.queue.addToQueue(MsgManager.FITBIT_MESSAGE_DATA, this.formatOutgoingAccData(accArr, accRawArr))
        accArr = []
        accRawArr = []
      }
    })

    if (hrEnabled && me.permissions.granted("access_heart_rate")) {
      hr = new Hr()
      hr.startSensor((hr) => {
        this.queue.addToQueue(MsgManager.FITBIT_MESSAGE_HR_DATA, hr)
      })
    }
  }

  formatOutgoingAccData(maxDataArr, maxRawDataArr) {
    return [maxDataArr.join(':'), maxRawDataArr.join(':')].join(';')
  }

  stopTracking() {
    this.ctx.proposeTrackingStop()
    stopAllSensors([acc, hr])
    this.queue.clearQueue()
    me.exit()
  }

  pauseTracking(timestamp) {
    if (timestamp > 0) {
      this.ctx.proposeTrackingPause()
    } else {
      this.resumeTracking()
    }
  }

  resumeTracking() {
    this.ctx.proposeTrackingResume()
  }

  startAlarm(vibrationDelay) {
    new AlarmManager().startAlarm(vibrationDelay)
  }

  stopAlarm() {
    new AlarmManager().stopAlarm()
  }

  scheduleAlarm(timestamp) {
    console.log("ScheduleAlarm timestamp: " + timestamp)
    new AlarmManager().scheduleAlarm(timestamp)
  }

  doHint(repeat) {
    new VibrationPlayer().doHint(repeat)
  }


}
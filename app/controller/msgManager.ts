import * as messaging from "messaging"
import { Context } from "./context"
import { AlarmManager } from "./alarmManager";
import { Message } from "../model/message";

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

  ctx:Context

  constructor(context: Context) {
    this.ctx = context
  }

  public startCompanionCommChannel() {
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
      // console.log("received message " + Message.deserialize(evt.data).command)
      this.handleIncomingMessage(Message.deserialize(evt.data))
    }
  }

  private startOutMessagingTimer() {
    let that = this
    let queue = this.ctx.queue

    this.ctx.businessController.startTracking(true)

    setInterval(function () {
      if (queue.getMsgCount() > 0) {
        let nextMsg = queue.peekNextMessage()
        that.sendToCompanion(nextMsg)
      }
    }, MsgManager.MESSAGING_INTERVAL)
  }

  private sendToCompanion(msg:Message) {
    console.log(">>ToCompanion " + msg.command + " " + msg.data)
    try {
      if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
        messaging.peerSocket.send(msg.serialize())
        this.ctx.queue.removeNextMessage()
      } else {
        console.log(">>ToCompanion socket closed, msg not sent.")
      }
    }
    catch (err) {
      console.log(err)
    }
  }

  private handleIncomingMessage(msg:Message) {
    console.log("MsgManager received: " + msg.serialize())

    switch (msg.command) {
      case MsgManager.FITBIT_MESSAGE_START_TRACK:
        (msg.data == "DO_HR_MONITORING") ? this.ctx.businessController.startTracking(true) : this.ctx.businessController.startTracking(false)
        break
      case MsgManager.FITBIT_MESSAGE_STOP_TRACK:
        this.ctx.businessController.stopTracking()
        break
      case MsgManager.FITBIT_MESSAGE_RESUME:
        this.ctx.businessController.resumeTracking()
        break
      case MsgManager.FITBIT_MESSAGE_PAUSE_TIME:
        this.ctx.businessController.pauseTracking(msg.data)
        break
        case MsgManager.FITBIT_MESSAGE_ALARM_START:
        this.ctx.businessController.startAlarm(msg.data)
        break
      case MsgManager.FITBIT_MESSAGE_ALARM_STOP:
        this.ctx.businessController.stopAlarm()
        break
      case MsgManager.FITBIT_MESSAGE_ALARM_TIME:
        let time = msg.data.split(':')
        this.ctx.businessController.scheduleAlarm(time[0], time[1], time[2])
        break
      case MsgManager.FITBIT_MESSAGE_BATCH_SIZE:
        // TODO tohle nestaci pri sensor batchingu - je potreba vytvorit novy Acc a nejak dumpnout data z toho stareho
        this.ctx.businessController.setBatchSize(msg.data)
        break
      case MsgManager.FITBIT_MESSAGE_HINT:
        this.ctx.businessController.doHint(msg.data)
        break
      case MsgManager.FITBIT_MESSAGE_SUSPEND:
        // I'm not listening to this!
        break
    }
  }

}
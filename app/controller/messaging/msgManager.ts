import { Context } from "../context"
import { Message } from "../../model/message";
import { FileTransferAdapter } from "./fileTransferAdapter";
import { MockAdapter } from "./mockAdapter";
import { MessagingAdapter } from "./messagingAdapter";
import { QueueMessage } from "./queueMessage";

export class MsgManager {
  // Static constants
  // static get MESSAGING_INTERVAL() { return 1000 }

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
  static get FITBIT_MESSAGE_CHECK_CONNECTED() { return "ping" }

  // from watch
  static get FITBIT_MESSAGE_CONFIRM_CONNECTED() { return "connected" }

  ctx:Context
  msgAdapter: FileTransferAdapter | MessagingAdapter | MockAdapter
  debug = false;

  constructor(context: Context) {
    this.ctx = context
    this.msgAdapter = new MessagingAdapter
  }

  public startCompanionCommChannel() {
    console.log(">>ToCompanion channel init")

    // give the companion time to start
    setTimeout(() => {
      this.msgAdapter.init(
        (msg:Message) => {
        // this.ctx.businessController.reportMessageReceived()
        this.handleIncomingMessage(msg)
      },
        (msgAcked: Message) => {
          console.log("Acked " + msgAcked.command)
          if (msgAcked.command == MsgManager.FITBIT_MESSAGE_STOP_TRACK) {
            this.ctx.businessController.exitApp()
          }
        })
    }, 2000)


    // For debugging purposes
    if (this.debug) {
      this.ctx.businessController.startTracking(true)
    }
    this.msgAdapter.send(new Message(MsgManager.FITBIT_MESSAGE_START_TRACK, true))
  }

  public stopMessaging() {
    this.msgAdapter.stop()
  }

  public sendStopTracking() {
    this.msgAdapter.send(new Message(MsgManager.FITBIT_MESSAGE_STOP_TRACK, undefined))
  }

  private handleIncomingMessage(msg: Message) {
    console.log("MsgManager received: " + msg.serialize())

    switch (msg.command) {
      case MsgManager.FITBIT_MESSAGE_START_TRACK:
        this.ctx.businessController.startTracking(msg.data)
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
        this.ctx.businessController.setBatchSize(msg.data)
        break
      case MsgManager.FITBIT_MESSAGE_HINT:
        this.ctx.businessController.doHint(msg.data)
        break
      case MsgManager.FITBIT_MESSAGE_SUSPEND:
        // I'm not listening to this!
        break
      case MsgManager.FITBIT_MESSAGE_CHECK_CONNECTED:
        // Maybe start tracking?
        // Or just indicate connected if not tracking
        break
    }
  }


}
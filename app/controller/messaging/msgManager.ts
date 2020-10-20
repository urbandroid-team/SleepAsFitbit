import { Context } from "../context"
import { Message } from "../../model/message";
import { FileTransferAdapter } from "./fileTransferAdapter";
import { MockAdapter } from "./mockAdapter";
import { MessagingAdapter } from "./messagingAdapter";
import { QueueMessage } from "./queueMessage";
import { MsgConstants } from '../../../common/msgConstants'

export class MsgManager {
  // Static constants
  // static get MESSAGING_INTERVAL() { return 1000 }

  ctx:Context
  msgAdapter: FileTransferAdapter | MessagingAdapter | MockAdapter
  debug = false;

  constructor(context: Context) {
    this.ctx = context
    this.msgAdapter = new MessagingAdapter
    // this.debug = context.debugManager.debug
  }

  public startCompanionCommChannel() {
    console.log("to Companion channel init")

    // give the companion time to start
    setTimeout(() => {
      this.msgAdapter.init(
        (msg:Message) => {
        // this.ctx.businessController.reportMessageReceived()
        this.handleIncomingMessage(msg)
      },
        (msgAcked: Message) => {
          console.log(msgAcked.command + " ACKED")
        })
    }, 2000)


    // For debugging purposes
    if (this.debug) {
      this.ctx.businessController.startTracking(true)
    }
    this.msgAdapter.send(new Message(MsgConstants.FITBIT_MESSAGE_START_TRACK, true))
  }

  public stopMessaging() {
    this.msgAdapter.stop()
  }

  public restartMessaging() {
    this.startCompanionCommChannel()
  }

  public sendStopTracking() {
    this.msgAdapter.send(new Message(MsgConstants.FITBIT_MESSAGE_STOP_TRACK, undefined))
  }

  private handleIncomingMessage(msg: Message) {
    console.log("MsgManager received: " + msg.serialize())

    switch (msg.command) {
      case MsgConstants.FITBIT_MESSAGE_START_TRACK:
        this.ctx.businessController.startTracking(msg.data)
        break
      case MsgConstants.FITBIT_MESSAGE_STOP_TRACK:
        this.ctx.businessController.stopTracking()
        break
      case MsgConstants.FITBIT_MESSAGE_RESUME:
        this.ctx.businessController.startTrackingIfNotTracking()
        this.ctx.businessController.resumeTracking()
        break
      case MsgConstants.FITBIT_MESSAGE_PAUSE_TIME:
        this.ctx.businessController.pauseTracking(msg.data)
        break
        case MsgConstants.FITBIT_MESSAGE_ALARM_START:
        this.ctx.businessController.startAlarm(msg.data)
        break
      case MsgConstants.FITBIT_MESSAGE_ALARM_STOP:
        this.ctx.businessController.stopAlarm()
        break
      case MsgConstants.FITBIT_MESSAGE_ALARM_TIME:
        this.ctx.businessController.startTrackingIfNotTracking()
        let time = msg.data.split(':')
        this.ctx.businessController.scheduleAlarm(time[0], time[1], time[2])
        break
      case MsgConstants.FITBIT_MESSAGE_BATCH_SIZE:
        this.ctx.businessController.startTrackingIfNotTracking()
        this.ctx.businessController.setBatchSize(msg.data)
        break
      case MsgConstants.FITBIT_MESSAGE_HINT:
        this.ctx.businessController.startTrackingIfNotTracking()
        this.ctx.businessController.doHint(msg.data)
        break
      case MsgConstants.FITBIT_MESSAGE_SUSPEND:
        // I'm not listening to this!
        break
      case MsgConstants.FITBIT_MESSAGE_CHECK_CONNECTED:
        // Maybe start tracking?
        // Or just indicate connected if not tracking
        break
      case MsgConstants.FITBIT_MESSAGE_STOP_SENT_TO_SLEEP_FROM_COMPANION:
        console.log('Exiting watch app')
        this.ctx.businessController.exitApp()
    }
  }


}

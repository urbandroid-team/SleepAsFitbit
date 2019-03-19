import { Context } from "./context";
import { MsgManager } from "./messaging/msgManager";
import { me } from "appbit";
import { Message } from "../model/message";

// A facade class that is responsible for controling the flow of the app

export class BusinessController {
  ctx:Context
  batch_acc: any[] = []
  batch_acc_raw: any[] = []

  constructor(context:Context) {
    this.ctx = context
  }

  startTracking(hrEnabled:boolean) {
    console.log("startTracking")

    if (!this.ctx.tracking.tracking) {
      this.ctx.tracking.tracking = true

      if (hrEnabled) {
        this.ctx.tracking.hrTracking = true
      }

      this.ctx.ui.setStatusTracking()
    }

    this.ctx.msgManager.msgAdapter.send(new Message(MsgManager.FITBIT_MESSAGE_START_TRACK, ""))

    // start acc on sensors controller
    this.ctx.sensorsController.startAcc((acc: any, accRaw: any) => {
      this.batch_acc = this.batch_acc.concat(acc)
      this.batch_acc_raw = this.batch_acc_raw.concat(accRaw)
      if (this.batch_acc.length >= this.ctx.tracking.batchSize) {
        this.ctx.msgManager.msgAdapter.send(new Message(MsgManager.FITBIT_MESSAGE_DATA, this.formatOutgoingAccData(this.batch_acc, this.batch_acc_raw)))
        this.batch_acc = []
        this.batch_acc_raw = []
      }
    })

    // start hr on sensors controller
    if (hrEnabled && me.permissions.granted("access_heart_rate")) {
      this.ctx.sensorsController.startHr((hr: any) => {
        this.ctx.msgManager.msgAdapter.send(new Message(MsgManager.FITBIT_MESSAGE_HR_DATA, hr))
      })
    }
  }

  private formatOutgoingAccData(maxDataArr:any, maxRawDataArr:any) {
    return [maxDataArr.join(':'), maxRawDataArr.join(':')].join(';')
  }

  stopTracking() {
    if (this.ctx.tracking.tracking) {
      this.ctx.sensorsController.stopAllSensors([this.ctx.sensorsController.acc, this.ctx.sensorsController.hr])
      this.ctx.queue.clearQueue()
      me.exit()
    }
  }

  pauseTrackingFromWatch() {
    let timestamp = Date.now() + 5 * 60000
    this.pauseTracking(timestamp)
    this.ctx.msgManager.msgAdapter.send(new Message(MsgManager.FITBIT_MESSAGE_PAUSE, timestamp))
  }

  pauseTracking(timestamp: number) {
    if (timestamp > 0) {
      this.ctx.ui.setStatusPause()
    } else if (this.ctx.tracking.trackingPaused) {
      this.resumeTracking()
    }
  }

  resumeTrackingFromWatch() {
    this.resumeTracking()
    this.ctx.msgManager.msgAdapter.send(new Message(MsgManager.FITBIT_MESSAGE_RESUME, ""))
  }

  resumeTracking() {
    this.ctx.tracking.trackingPaused = false
    this.ctx.ui.setStatusTracking()
  }

  startAlarm(vibrationDelay: number) {
    this.ctx.alarm.alarmInProgress = true
    this.ctx.alarmManager.startAlarm(vibrationDelay)

    let ui = this.ctx.ui
    ui.changeToAlarmScreen()
    ui.clearAlarmTime()

  }

  stopAlarm() {
    if (this.ctx.alarm.alarmInProgress) {
      this.ctx.alarm.alarmInProgress = false
      this.ctx.alarmManager.stopAlarm()
      this.ctx.ui.changeToTrackingScreen()
    }
  }

  dismissAlarmFromWatch() {
    // this.stopAlarm()
    this.ctx.msgManager.msgAdapter.send(new Message(MsgManager.FITBIT_MESSAGE_ALARM_DISMISS, ""))
  }

  snoozeAlarmFromWatch() {
    // this.stopAlarm()
    this.ctx.msgManager.msgAdapter.send(new Message(MsgManager.FITBIT_MESSAGE_ALARM_SNOOZE, ""))
  }

  scheduleAlarm(h:number, m:number, timestamp: number) {
    console.log("ScheduleAlarm timestamp: " + timestamp)
    this.ctx.alarm.alarmScheduled = true
    this.ctx.alarmManager.scheduleAlarm(timestamp)
    this.ctx.ui.setAlarmTime(h, m)
  }

  doHint(repeat: number) {
    this.ctx.vibrationPlayer.doHint(repeat)
  }

  setBatchSize(size:number) {
    this.ctx.sensorsController.setBatchSize(size)
  }

}






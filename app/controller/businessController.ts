import { Context } from "./context";
import { MsgManager } from "./messaging/msgManager";
import { me } from "appbit";
import { Message } from "../model/message";
import { display } from "display";

// A facade class that is responsible for controling the flow of the app

export class BusinessController {
  ctx:Context
  batch_acc: number[] = []
  batch_acc_raw: number[] = []

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

    // start acc on sensors controller
    this.ctx.sensorsController.startAcc((acc: number, accRaw: number) => {
      try {
        this.batch_acc = this.batch_acc.concat(acc) // delat push aby se nevolal GC
        this.batch_acc_raw = this.batch_acc_raw.concat(accRaw) // push ...
        if (this.batch_acc.length >= this.ctx.tracking.batchSize) {
          this.ctx.msgManager.msgAdapter.send(new Message(MsgManager.FITBIT_MESSAGE_DATA, this.formatOutgoingAccData(this.batch_acc, this.batch_acc_raw)))
          this.batch_acc = []
          this.batch_acc_raw = []
        }
      } catch (error) {
        console.log(error)
        this.ctx.msgManager.msgAdapter.send(new Message("error in acc cb", error))
      }
    })

    // start hr on sensors controller
    if (hrEnabled && me.permissions.granted("access_heart_rate")) {

      this.ctx.sensorsController.startHr((hr: any) => {
        try {
          this.ctx.msgManager.msgAdapter.send(new Message(MsgManager.FITBIT_MESSAGE_HR_DATA, hr))
        } catch (error) {
          console.log(error)
          this.ctx.msgManager.msgAdapter.send(new Message("error in hr cb", error))
        }
      })
    }
  }

  private formatOutgoingAccData(maxDataArr:any, maxRawDataArr:any) {
    return [maxDataArr.join(':'), maxRawDataArr.join(':')].join(';')
  }

  stopTracking() {
    if (this.ctx.tracking.tracking) {
      console.log("stopTracking")
      this.ctx.sensorsController.stopAllSensors()
      this.ctx.queue.clearQueue()
      this.ctx.msgManager.sendStopTracking()
      this.exitApp()
    }
    console.log("stopTracking - ignored due to no tracking")
  }

  exitApp() {
    me.exit()
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
    display.poke()
    this.ctx.alarmManager.startAlarm(vibrationDelay)

    this.ctx.ui.changeToAlarmScreen()
    this.ctx.ui.clearAlarmTime()
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
    // this.ctx.alarmManager.scheduleAlarm(timestamp)
    this.ctx.ui.setAlarmTime(h, m)
  }

  doHint(repeat: number) {
    this.ctx.vibrationPlayer.doHint(repeat)
  }

  setBatchSize(size:number) {
    this.ctx.sensorsController.setBatchSize(size)
  }

  reportMessageReceived() {
    // TODO this is hacky potential source of ui bugs
    // if (!this.ctx.alarm.alarmInProgress && !this.ctx.tracking.trackingPaused) {
    //   this.ctx.ui.changeToTrackingScreen()
    // }
  }
}






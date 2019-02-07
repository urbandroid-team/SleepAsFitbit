import { Context } from "./context";
import { MsgManager } from "./msgManager";
import { me } from "appbit";

// A facade class that is responsible for controling the flow of the app

export class BusinessController {
  ctx:Context

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

    this.ctx.queue.addToQueue(MsgManager.FITBIT_MESSAGE_START_TRACK, "")

    var acc = this.ctx.acc
    var accArr:any[] = []
    var accRawArr:any[] = []
    acc.startSensor((acc:any, accRaw:any) => {
      accArr.push.apply(accArr, acc)
      accRawArr = accRawArr.concat(accRaw)
      if (accArr.length > this.ctx.tracking.batchSize) {
        this.ctx.queue.addToQueue(MsgManager.FITBIT_MESSAGE_DATA, this.formatOutgoingAccData(accArr, accRawArr))
        accArr = []
        accRawArr = []
      }
    })

    if (hrEnabled && me.permissions.granted("access_heart_rate")) {
      this.ctx.hr.startSensor((hr:any) => {
        this.ctx.queue.addToQueue(MsgManager.FITBIT_MESSAGE_HR_DATA, hr)
      })
    }
  }

  formatOutgoingAccData(maxDataArr:any, maxRawDataArr:any) {
    return [maxDataArr.join(':'), maxRawDataArr.join(':')].join(';')
  }

  stopTracking() {
    if (this.ctx.tracking.tracking) {
      this.ctx.sensorsController.stopAllSensors([this.ctx.acc, this.ctx.hr])
      this.ctx.queue.clearQueue()
      me.exit()
    }
  }

  pauseTracking(timestamp: number) {
    if (timestamp > 0) {
      this.ctx.ui.setStatusPause()
    }
  }

  resumeTracking() {
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






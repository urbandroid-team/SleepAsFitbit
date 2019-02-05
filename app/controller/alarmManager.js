import * as ui from '../view/uiManager'
import { VibrationPlayer } from "./vibrationPlayer";

let instance = null
let TAG = "AlarmManager: "

// Singleton making sure there is only one scheduled alarm at maximum at all times
export class AlarmManager {

  constructor() {
    if (instance) {
      return instance;
    }
    this.instance = this
    this.alarmInProgress = false
    this.alarmScheduledTimeout = null
    this.vibrationDelayTimeout = null
  }

  startAlarm(vibrationDelay) {
    console.log(TAG + "startAlarm, delay " + vibrationDelay);
    this.alarmInProgress = true
    ui.changeToAlarmScreen();
    ui.clearAlarmTime()
    clearTimeout(this.alarmScheduledTimeout)
    clearTimeout(this.vibrationDelayTimeout)

    switch (vibrationDelay) {
      case -1:
        break
      case 0:
        new VibrationPlayer().doAlarm()
        break
      default:
        this.vibrationDelayTimeout = setTimeout(() => {
          new VibrationPlayer().doAlarm()
        }, vibrationDelay);
        break
    }
  }

  scheduleAlarm(timestamp) {
    console.log(TAG + "scheduleAlarm for " + timestamp);
    let timeout = timestamp - (new Date.now())
    ui.setAlarmTime(timestamp)
    clearTimeout(this.alarmScheduledTimeout)
    this.alarmScheduledTimeout = setTimeout(() => {
      this.startAlarm()
    }, timeout)
  }

  stopAlarm() {
    console.log(TAG + "stopAlarm");
    if (this.alarmInProgress) {
      clearTimeout(this.vibrationDelayTimeout)
      this.alarmInProgress = false

      ui.changeToTrackingScreen()
      new VibrationPlayer().stop()
      console.log(TAG + "alarm stopped");
    }
  }

}
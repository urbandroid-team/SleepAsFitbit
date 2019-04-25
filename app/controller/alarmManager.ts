import { Context } from "./context";

let TAG = "AlarmManager: "

export class AlarmManager {

  ctx: Context
  alarmScheduledTimeout:any
  vibrationDelayTimeout:any

  constructor(context: Context) {
    this.ctx = context
    this.alarmScheduledTimeout = null
    this.vibrationDelayTimeout = null
  }

  startAlarm(vibrationDelay: number) {

    console.log(TAG + "startAlarm, delay " + vibrationDelay);

    clearTimeout(this.alarmScheduledTimeout)
    clearTimeout(this.vibrationDelayTimeout)

    switch (vibrationDelay) {
      case -1:
        break
      case 0:
        this.ctx.vibrationPlayer.doAlarm()
        break
      default:
        this.vibrationDelayTimeout = setTimeout(() => {
          this.ctx.vibrationPlayer.doAlarm()
        }, vibrationDelay);
        break
    }
  }

  stopAlarm() {
    console.log(TAG + "stopAlarm");
    clearTimeout(this.vibrationDelayTimeout)

    this.ctx.vibrationPlayer.stop()
    console.log(TAG + "alarm stopped");
  }

  // scheduleAlarm(timestamp: number) {
  //   console.log(TAG + "scheduleAlarm for " + timestamp);

  //   let timeout = timestamp - (Date.now())
  //   clearTimeout(this.alarmScheduledTimeout)
  //   this.alarmScheduledTimeout = setTimeout(() => {
  //     this.ctx.businessController.startAlarm(0)
  //   }, timeout)
  // }

}
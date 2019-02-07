import document from "document";
import clock from 'clock';

export class UIManager {
  alarmScreen:any
  trackingScreen:any
  alarmTime:any
  alarmImg:any
  status:any

  constructor() {
    this.alarmScreen = document.getElementById("alarmScreen")
    this.trackingScreen = document.getElementById("trackingScreen")
    this.alarmTime = document.getElementById("alarmTime")
    this.alarmImg = document.getElementById("alarmImg")
    this.status = document.getElementById('status')
  }

  changeToAlarmScreen() {
    console.log("UI: alarm screen")
    this.alarmScreen.style.display = "inline"
    this.trackingScreen.style.display = "none"
  }

  changeToTrackingScreen() {
    console.log("UI: tracking screen")
    this.alarmScreen.style.display = "none"
    this.trackingScreen.style.display = "inline"
  }

  setAlarmTime(h:number, m:number) {
    console.log("UI: setting alarm")

    if (h && m) {
      // TODO this works wrongly - incorrectly padding
      this.alarmTime.text = this.pad(h,2) + ":" + this.pad(m,2)
      this.alarmImg.href = "alarm.png"
    } else {
      this.alarmImg.href = "dismiss.png"
      this.alarmTime.text = ""
    }

  }
  clearAlarmTime() {
    console.log("UI: clearing alarm")
    this.alarmTime.text = "No alarm"
  }

  setStatusPause() {
    console.log("UI: status pause")
    this.status.text = "Pause"
  }
  setStatusTracking() {
    console.log("UI: status tracking")
    this.status.text = "Tracking..."
  }

  setStatusConnectionError() {
    console.log("UI: status connection error")
    this.status.text = ""
  }

  initializeClock() {
    console.log("UI: initialize clock")
    let clockElement = document.getElementById("clock");
    clock.granularity = 'minutes';

    clock.ontick = function (evt) {
      clockElement.text = ("0" + evt.date.getHours()).slice(-2) + ":" +
        ("0" + evt.date.getMinutes()).slice(-2)
    };
  }

  pad(number:number, size:number):string {
    var s = String(number);
    while (s.length < (size || 2)) { s = "0" + s; }
    return s;
  }


}

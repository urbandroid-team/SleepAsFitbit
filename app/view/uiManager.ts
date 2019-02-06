import document from "document";
import clock from 'clock';

export class UIManager {
  alarmScreen:any
  trackingScreen:any
  alarmTime:any
  status:any

  constructor() {
    this.alarmScreen = document.getElementById("alarmScreen")
    this.trackingScreen = document.getElementById("trackingScreen")
    this.alarmTime = document.getElementById("alarmTime")
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

  setAlarmTime(timestamp:any) {
    console.log("UI: setting alarm")
    if (timestamp) {
      this.alarmTime.text = "🔔" + timestamp
    } else {
      this.alarmTime.text = "🔕"
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
    this.status.text = ""
  }

  initializeClock() {
    let clockElement = document.getElementById("clock");
    clock.granularity = 'minutes';

    clock.ontick = function (evt) {
      clockElement.text = ("0" + evt.date.getHours()).slice(-2) + ":" +
        ("0" + evt.date.getMinutes()).slice(-2)
    };
  }


}

import document from "document";

export class UIManager {
  constructor() {
    this.alarmScreen = document.getElementById("alarmScreen")
    this.trackingScreen = document.getElementById("trackingScreen")
    this.alarmTime = document.getElementById("alarmTime")
    this.status = document.getElementById('status')
  }

  changeToAlarmScreen() {
    console.log("UI: alarm screen")
    alarmScreen.style.display = "inline"
    trackingScreen.style.display = "none"
  }

  changeToTrackingScreen() {
    console.log("UI: tracking screen")
    alarmScreen.style.display = "none"
    trackingScreen.style.display = "inline"
  }

  setAlarmTime(timestamp) {
    console.log("UI: setting alarm")
    if (timestamp) {
      alarmTime.text = "🔔" + timestamp
    } else {
      alarmTime.text = "🔕"
    }

  }
  clearAlarmTime() {
    console.log("UI: clearing alarm")
    alarmTime.text = "No alarm"
  }

  setStatusPause() {
    console.log("UI: status pause")
    status.text = "Pause"
  }
  setStatusTracking() {
    console.log("UI: status tracking")
    status.text = "Tracking..."
  }

  setStatusConnectionError() {
    status.text = ""
  }

}

import document from "document";
import clock from 'clock';
import { Context } from "../controller/context";

export class UIManager {
  static get RES_BTN_PAUSE() { return "pause.png" }
  static get RES_BTN_PLAY() { return "play.png" }

  ctx: Context

  alarmScreen:any
  trackingScreen:any
  alarmTime:any
  alarmImg:any
  status:any
  statusAlarmImg:any
  statusAlarmTime:any
  background:any
  clock: any

  welcomePage: any
  runningPage: any
  exitPage: any

  alarmBtnWrapper:any
  trackingBtnWrapper: any
  trackingBtnBR: any
  alarmBtnTR: any
  alarmBtnBR: any
  btnExitYes: any
  btnExitNo: any
  connectBtn: any

  constructor(context: Context) {
    this.ctx = context
  }

  initialize() {
    // Pages
    this.welcomePage = document.getElementById('welcomePage')
    this.background = document.getElementById('background')
    this.runningPage = document.getElementById('runningPage')
    this.exitPage = document.getElementById('exitPage')
    
    this.runningPage.style.display = "none"
    this.exitPage.style.display = "none"

    // Exit dialog
    this.btnExitYes = document.getElementById("btn-yes")
    this.btnExitNo = document.getElementById("btn-no")

    // Buttons
    this.alarmBtnWrapper = document.getElementById('alarmBtns')
    this.trackingBtnWrapper = document.getElementById('trackingBtns')

    this.trackingBtnBR = document.getElementById('tracking-btn-br')
    this.alarmBtnTR = document.getElementById('alarm-btn-tr')
    this.alarmBtnBR = document.getElementById('alarm-btn-br')
    this.trackingBtnBR.style.display = 'none'

    this.connectBtn = document.getElementById('connectBtn')

    // Upper row
    this.status = document.getElementById('status')
    this.statusAlarmImg = document.getElementById('statusAlarmImg')
    this.statusAlarmTime = document.getElementById('statusAlarmTime')

    // Middle row
    this.clock = document.getElementById("clock");

    // Lower row
    this.alarmImg = document.getElementById("alarmImg")
    this.alarmTime = document.getElementById("alarmTime")

    this.registerButtonActions()
  }

  registerButtonActions() {
    console.log("UI: RegisterButtonActions")

    let that = this
    this.trackingBtnBR.onclick = () => {
      if (that.ctx.tracking.trackingPaused) {
        that.ctx.tracking.trackingPaused = false
        that.ctx.businessController.resumeTrackingFromWatch()
      } else {
        that.ctx.tracking.trackingPaused = true
        that.ctx.businessController.pauseTrackingFromWatch()
      }
    }
    this.alarmBtnTR.onclick = () => {
      this.ctx.businessController.dismissAlarmFromWatch()
    }
    this.alarmBtnBR.onclick = () => {
      this.ctx.businessController.snoozeAlarmFromWatch()
    }
    this.btnExitYes.onclick = () => {
      if (this.ctx.tracking.tracking) {
        this.ctx.businessController.stopTracking()
        this.ctx.businessController.exitApp(10000)
      } else {
        that.ctx.businessController.exitApp()
      }
    }
    this.btnExitNo.onclick = () => {
      this.runningPage.style.display="inline"
      this.exitPage.style.display="none"
    }
    this.connectBtn.onclick = (event: any) => {
      console.log(event)
      this.connectBtn.text = "Connecting..."
    }

    document.onkeypress = function (e) {
      e.preventDefault();
      if (e.key == "up" && that.exitPage.style.display == "inline") {
      }
      if (e.key === "back" || e.key === "down") {
        if (that.exitPage.style.display === "inline") {
          that.runningPage.style.display = "inline";
          that.exitPage.style.display = "none";
        } else {
          that.runningPage.style.display = "none";
          that.exitPage.style.display = "inline";
        }
      }

    }
  }

  changeToAlarmScreen() {
    console.log("UI: alarm screen")

    this.background.style.fill = '#999'

    this.alarmBtnWrapper.style.display = "inline"
    this.trackingBtnWrapper.style.display = "none"

    this.status.style.display = "none"
    this.statusAlarmImg.style.display = "inline"
    this.statusAlarmTime.style.display = "inline"

    this.alarmImg.style.display = "none"
    this.alarmTime.style.display = "none"
  }

  changeToTrackingScreen() {
    console.log("UI: tracking screen")

    this.background.style.fill = 'black'

    this.alarmBtnWrapper.style.display = "none"
    this.trackingBtnWrapper.style.display = "inline"

    this.status.style.display = "inline"
    this.statusAlarmImg.style.display = "none"
    this.statusAlarmTime.style.display = "none"

    this.alarmImg.style.display = "inline"
    this.alarmTime.style.display = "inline"

  }

  setAlarmTime(h:number, m:number) {
    console.log("UI: setting alarm")

    if (h && m) {
      let time = this.pad(h, 2) + ":" + this.pad(m, 2)
      this.alarmTime.text = time
      this.alarmImg.href = "alarm.png"
    } else {
      this.alarmImg.href = "dismiss.png"
      this.alarmTime.text = ""
    }

  }
  clearAlarmTime() {
    console.log("UI: clearing alarm")
    this.alarmTime.text = ""
    this.alarmImg.href = "dismiss.png"
  }

  setStatusPause() {
    console.log("UI: status pause")
    this.status.text = "Paused.."
    this.changeComboBtnIcons(this.trackingBtnBR, UIManager.RES_BTN_PLAY, UIManager.RES_BTN_PLAY)
  }

  setStatusTracking() {
    console.log("UI: status tracking")
    this.status.text = "Tracking..."
    this.changeComboBtnIcons(this.trackingBtnBR, UIManager.RES_BTN_PAUSE, UIManager.RES_BTN_PAUSE)
    this.trackingBtnBR.style.display = 'inline'
    this.welcomePage.style.display = "none"
    this.runningPage.style.display = "inline"
  }

  setStatusConnectionError() {
    console.log("UI: status connection error")
    this.status.text = ""
  }

  setStatusPanic() {
    console.log("UI: status panic")
    this.status.text = "Don't panic!"
  }

  initializeClock() {
    console.log("UI: initialize clock")
    clock.granularity = 'minutes';

    let clockElement = this.clock
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

  changeComboBtnIcons(button:any, image:string, pressedImage:string) {
    button.getElementById('combo-button-icon').image = image
    button.getElementById("combo-button-icon-press").image = pressedImage
  }

}

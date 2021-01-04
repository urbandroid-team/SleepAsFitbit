import document from "document";
import clock from 'clock';
import { Context } from "../controller/context";

enum StyleType {
  DEFAULT,
  ALARM
}

export class UIManager {
  private panicCounter: number = 0;
  static get RES_BTN_PAUSE() { return "pause.png" }
  static get RES_BTN_PLAY() { return "play.png" }

  ctx: Context

  alarmScreen:any
  trackingScreen:any
  alarmTime:any
  alarmImg:any
  status:any
  hr:any
  statusAlarmImg:any
  statusAlarmTime:any
  background:any
  prevBackgroundClass:string
  root:any
  clock: any

  welcomePage: any
  runningPage: any
  exitPage: any

  alarmBtnWrapper:any
  trackingBtn: any
  alarmBtnSnooze: any
  alarmBtnDismiss: any
  btnExitYes: any
  btnExitNo: any

  constructor(context: Context) {
    this.ctx = context
  }

  initialize() {
    // Pages
    this.root = document.getElementById('root');
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
    this.trackingBtn = document.getElementById('trackingBtn')
    this.trackingBtn.style.display = 'none'

    this.alarmBtnSnooze = document.getElementById('alarm-btn-snooze')
    this.alarmBtnDismiss = document.getElementById('alarm-btn-dismiss')

    // Upper row
    this.status = document.getElementById('status')
    this.hr = document.getElementById('hrText')
    this.statusAlarmImg = document.getElementById('statusAlarmImg')
    this.statusAlarmTime = document.getElementById('statusAlarmTime')

    // Middle row
    this.clock = document.getElementById("clock");

    // Lower row
    this.alarmImg = document.getElementById("alarmImg")
    this.alarmTime = document.getElementById("alarmTime")

    this.registerButtonActions()
    this.overrideBackSwipe();
  }

  registerButtonActions() {
    console.log("UI: RegisterButtonActions")

    let that = this
    this.trackingBtn.onclick = () => {
      if (that.ctx.tracking.trackingPaused) {
        that.ctx.tracking.trackingPaused = false
        that.ctx.businessController.resumeTrackingFromWatch()
      } else {
        that.ctx.tracking.trackingPaused = true
        that.ctx.businessController.pauseTrackingFromWatch()
      }
    }
    this.alarmBtnDismiss.onclick = () => {
      this.ctx.businessController.dismissAlarmFromWatch()
    }
    this.alarmBtnSnooze.onclick = () => {
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
      this.exitPage.style.display="none"

      if (this.ctx.tracking.tracking) {
        this.runningPage.style.display="inline"
      } else {
        this.welcomePage.style.display="inline"
      }
    }

    document.onkeypress = (e) => {
      e.preventDefault();
      if (e.key === "back")
        this.showExitPage();
      else
        this.closeExitPage();
    }
  }

  showExitPage() {
    if (this.exitPage.style.display === 'inline')
      return;

    this.prevBackgroundClass = this.background.class;
    this.setStyle(StyleType.DEFAULT);
    this.runningPage.style.display = "none";
    this.welcomePage.style.display = "none";
    this.exitPage.style.display = "inline";
  }

  closeExitPage() {
    if (this.exitPage.style.display === 'none')
      return;

    this.background.class = this.prevBackgroundClass;
    this.runningPage.style.display = "inline";
    this.exitPage.style.display = "none";
  }

  overrideBackSwipe() {
    console.log("UI: OverrideBackSwipe");

    document.onbeforeunload = (e:Event) => {
      if (this.ctx.tracking.tracking) {
        e.preventDefault();
        this.root.x = 0;
        this.showExitPage();
      }
    }
  }

  changeElementClass(element:any, rm:string, add:string) {
    let classes = element.class.split(' ').filter((c:string) => c !== rm);
    if (classes.indexOf(add) === -1)
      classes.push(add);
    element.class = classes.join(" ");
  }

  setStyle(type:StyleType) {
    switch (type) {
      case StyleType.DEFAULT:
        this.changeElementClass(this.background, "alarm-gradient-background",
          "app-gradient-background");
        break;
      case StyleType.ALARM:
        this.changeElementClass(this.background, "app-gradient-background",
          "alarm-gradient-background");
        break;
    }
  }

  switchToRunninagPage() {
    this.welcomePage.style.display = 'none';
    this.runningPage.style.display = 'inline';
  }

  changeToAlarmScreen() {
    console.log("UI: alarm screen")

    this.setStyle(StyleType.ALARM);
    this.switchToRunninagPage();

    this.alarmBtnWrapper.style.display = "inline"
    this.trackingBtn.style.display = "none"

    this.hr.style.display = 'none'
    this.status.style.display = "none"
    this.statusAlarmImg.style.display = "inline"
    this.statusAlarmTime.style.display = "inline"

    this.alarmImg.style.display = "none"
    this.alarmTime.style.display = "none"
  }

  changeToTrackingScreen() {
    console.log("UI: tracking screen")

    this.setStyle(StyleType.DEFAULT);

    this.alarmBtnWrapper.style.display = "none"
    this.trackingBtn.style.display = "inline"

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
    this.updateHr();
    this.changeButtonImageIcon(this.trackingBtn, UIManager.RES_BTN_PLAY)
  }
  setStatusTracking() {
    console.log("UI: status tracking")
    this.updateHr()
    this.status.text = "Tracking"
    this.hr.style.display = 'inline'
    this.changeButtonImageIcon(this.trackingBtn, UIManager.RES_BTN_PAUSE)
    this.trackingBtn.style.display = 'inline'
    this.switchToRunninagPage();
  }
  setStatusConnectionError() {
    console.log("UI: status connection error")
    this.status.text = ""
  }
  setStatusPanic() {
    console.log("UI: status panic")
    this.status.text = "Err:Contact support"
    this.hr.text = ""

    // @ts-ignore
    document.getElementById('panic-counter-' + this.panicCounter).style.display = "inline"
    this.panicCounter += 1
  }
  recoverFromPanic() {
    this.setStatusTracking()
  }
  updateHr() {
    if (!this.ctx.tracking.tracking || !this.ctx.tracking.hrTracking ||
      !this.ctx.sensorsController.hr.getLatestValue()) {
      this.hr.text = ""
      return
    }
    this.hr.text = " ❤" + this.ctx.sensorsController.hr.getLatestValue()
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
  changeButtonImageIcon(button:any, image:string) {
    button.image = image
  }
}

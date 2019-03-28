import { Tracking } from "../model/tracking";
import { Alarm } from "../model/alarm";
import { BusinessController } from "./businessController";
import { MsgQueue } from "../../common/msgQueue";
import { UIManager } from "../view/uiManager";
import { SensorsController } from "./sensorsController";
import { AlarmManager } from "./alarmManager";
import { VibrationPlayer } from "./vibrationPlayer";
import { MsgManager } from "./messaging/msgManager";

export class Context {

  businessController: BusinessController
  queue: MsgQueue
  alarmManager: AlarmManager
  ui: UIManager
  vibrationPlayer: VibrationPlayer
  sensorsController: SensorsController
  msgManager: MsgManager

  alarm: Alarm
  tracking: Tracking
  // private _businessController: BusinessController
  // private _queue: MsgQueue
  // private _alarmManager: AlarmManager
  // private _ui: UIManager
  // private _vibrationPlayer: VibrationPlayer
  // private _sensorsController: SensorsController
  // private _msgManager: MsgManager

  // private _alarm: Alarm
  // private _tracking: Tracking

  constructor() {
    this.businessController = new BusinessController(this) // 14 kb
    this.queue = new MsgQueue("toCompanion") // 2kb
    this.alarmManager = new AlarmManager(this)
    this.ui = new UIManager(this)
    this.vibrationPlayer = new VibrationPlayer()
    this.sensorsController = new SensorsController(this)  // 8 kb
    this.msgManager = new MsgManager(this)

    // state classes
    this.alarm = new Alarm()
    this.tracking = new Tracking()
  }

//   get businessController():BusinessController { return this._businessController }
//   get queue(): MsgQueue { return this._queue }
//   get alarmManager(): AlarmManager { return this._alarmManager }
//   get ui(): UIManager { return this._ui }
//   get vibrationPlayer(): VibrationPlayer { return this._vibrationPlayer }
//   get sensorsController(): SensorsController { return this._sensorsController }
//   get msgManager(): MsgManager { return this._msgManager }

//   get tracking(): Tracking { return this._tracking }
//   get alarm(): Alarm { return this._alarm }
}
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

  private _businessController: BusinessController
  private _queue: MsgQueue
  private _alarmManager: AlarmManager
  private _ui: UIManager
  private _vibrationPlayer: VibrationPlayer
  private _sensorsController: SensorsController
  private _msgManager: MsgManager

  private _alarm: Alarm
  private _tracking: Tracking

  constructor() {
    this._businessController = new BusinessController(this)
    this._queue = new MsgQueue("toCompanion")
    this._alarmManager = new AlarmManager(this)
    this._ui = new UIManager(this)
    this._vibrationPlayer = new VibrationPlayer()
    this._sensorsController = new SensorsController(this)
    this._msgManager = new MsgManager(this)

    // state classes
    this._alarm = new Alarm()
    this._tracking = new Tracking()
  }

  get businessController():BusinessController { return this._businessController }
  get queue(): MsgQueue { return this._queue }
  get alarmManager(): AlarmManager { return this._alarmManager }
  get ui(): UIManager { return this._ui }
  get vibrationPlayer(): VibrationPlayer { return this._vibrationPlayer }
  get sensorsController(): SensorsController { return this._sensorsController }
  get msgManager(): MsgManager { return this._msgManager }

  get tracking(): Tracking { return this._tracking }
  get alarm(): Alarm { return this._alarm }
}
export class Alarm {
  private _alarm_ringing: boolean = false
  private _alarm_snoozed: boolean = false
  private _alarm_scheduled: boolean = false

  get isAlarmRinging(): boolean { return this._alarm_ringing; }
  set setAlarmRinging(state: boolean) { this._alarm_ringing = state; }

  get isAlarmSnoozed(): boolean { return this._alarm_snoozed; }
  set setAlarmSnoozed(state: boolean) { this._alarm_snoozed = state; }

  get isAlarmScheduled(): boolean { return this._alarm_scheduled; }
  set setAlarmScheduled(state: boolean) { this._alarm_scheduled = state; }
}
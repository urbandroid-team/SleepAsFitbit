
export class Alarm {

  constructor() {
  }

  private _alarm_in_progress: boolean = false
  private _alarm_snoozed: boolean = false
  private _alarm_scheduled: boolean = false

  get alarmInProgress(): boolean { return this._alarm_in_progress; }
  set alarmInProgress(state: boolean) { this._alarm_in_progress = state; }

  get alarmSnoozed(): boolean { return this._alarm_snoozed; }
  set alarmSnoozed(state: boolean) { this._alarm_snoozed = state; }

  get alarmScheduled(): boolean { return this._alarm_scheduled; }
  set alarmScheduled(state: boolean) { this._alarm_scheduled = state; }
}
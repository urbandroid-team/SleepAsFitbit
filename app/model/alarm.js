export class Alarm {
  constructor() {
    this.alarm_ringing = false
    this.alarm_snoozed = false;
    this.alarm_scheduled = false;
  }

  isAlarmRinging() { return this.alarm_ringing }
  isAlarmSnoozed() { return this.alarm_snoozed }
  isAlarmScheduled() { return this.alarm_scheduled }

  setAlarmRinging(state:boolean) { this.alarm_ringing = state }
  setAlarmSnoozed(state:boolean) { this.alarm_snoozed = state }
  setAlarmScheduled(state:boolean) { this.alarm_scheduled = state }

}
export enum MsgConstants {
  // from watch or to Sleep
  FITBIT_MESSAGE_START_TRACK = "start",
  FITBIT_MESSAGE_STOP_TRACK = "stop",
  FITBIT_MESSAGE_DATA = "acceld",
  FITBIT_MESSAGE_HR_DATA = "hrd",
  FITBIT_MESSAGE_ALARM_SNOOZE = "alarm_snooze",
  FITBIT_MESSAGE_ALARM_DISMISS = "alarm_dismiss",
  FITBIT_MESSAGE_PAUSE = "pause",
  FITBIT_MESSAGE_RESUME = "resume",

  // to watch
  FITBIT_MESSAGE_PAUSE_TIME = "pause_time",
  FITBIT_MESSAGE_ALARM_START = "alarm_start",
  FITBIT_MESSAGE_ALARM_STOP = "alarm_stop",
  FITBIT_MESSAGE_ALARM_TIME = "alarm_time",
  FITBIT_MESSAGE_BATCH_SIZE = "batch_size",
  FITBIT_MESSAGE_HINT = "hint",
  FITBIT_MESSAGE_SUSPEND = "suspend",
  FITBIT_MESSAGE_CHECK_CONNECTED = "ping",
  FITBIT_MESSAGE_STOP_SENT_TO_SLEEP_FROM_COMPANION = "companion_stopping_sleep",

  // from watch
  FITBIT_MESSAGE_CONFIRM_CONNECTED = "connected",
}
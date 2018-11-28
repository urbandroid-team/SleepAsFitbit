import { vibration } from "haptics";

export class AlarmManager {
  constructor(
    ){
      const PATTERN = "confirmation-max"
  }

  scheduleAlarm(timestamp) {
    setTimeout(() => {

    }, timeout);
  }

  startAlarm() {

  }

  stopAlarm() {
    vibration.stop()
  }
}

// start()
// start(pattern: VibrationPatternName)

// Returns: boolean

// Start a vibration pattern by name.

// Available patterns:

// "bump"
// "nudge"
// "nudge-max"
// "ping"
// "confirmation"
// "confirmation-max"


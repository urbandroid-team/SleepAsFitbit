import { vibration, VibrationPatternName } from "haptics";

export class VibrationPlayer {

  currently_playing:boolean
  vibrationTimer:any

  constructor() {
    this.currently_playing = false
  }

  doHint(repeat: number) {
    if (this.currently_playing) { return }
    let pattern:VibrationPatternName = "confirmation-max"
    this.start(pattern, repeat)
  }

  doAlarm() {
    if (this.currently_playing) { return }
    let pattern:VibrationPatternName = "confirmation-max"
    this.start(pattern, -1)
  }

  start(pattern:VibrationPatternName, repeat: number) {
    this.currently_playing = true

    if (repeat > 0) {
      setTimeout(() => {
        --repeat
        vibration.start(pattern)
        this.start(pattern, repeat)
      }, 1000);
    } else if (repeat < 0) {
      // repeat indefinitely
      this.vibrationTimer = setInterval(() => {
        vibration.start(pattern)
      }, 1000);
    } else {
      return
    }
  }

  stop() {
    clearTimeout(this.vibrationTimer)
    vibration.stop()
    this.currently_playing = false
  }
}


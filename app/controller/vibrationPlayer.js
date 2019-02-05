import { vibration } from "haptics";

export class VibrationPlayer {

  constructor() {
    this.playing = false
  }

  doHint(repeat) {
    if (this.playing) { return }
    let pattern = "confirmation-max"
    this.start(pattern, repeat)
  }

  doAlarm() {
    if (this.playing) { return }
    let pattern = "confirmation-max"
    this.start(pattern)
  }

  start(pattern, repeat) {
    this.playing = true

    if (repeat) {
      setTimeout(() => {
        --repeat
        vibration.start(pattern)
      }, 1000);
    } else {
      // repeat indefinitely
      setInterval(() => {
        vibration.start(pattern)
      }, 1000);
    }
  }

  stop() {
    vibration.stop()
    this.playing = false
  }
}


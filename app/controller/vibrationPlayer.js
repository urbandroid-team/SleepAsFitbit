import { vibration } from "haptics";

let instance = null

// Singleton
export class VibrationPlayer {

  constructor() {
    if (instance) {
      return instance;
    }
    this.instance = this
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


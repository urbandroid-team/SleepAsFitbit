import { Tracking } from "../model/tracking";
import { Alarm } from "../model/alarm";

let instance = null
let TAG = "Context: "

export class Context {

  constructor() {
    if (instance) {
      return instance;
    }
    this.instance = this

    this.tracking = new Tracking()
    this.alarm = new Alarm()
  }

  getTracking() {

  }

  proposeTrackingPause() {
    if (!this.tracking_paused) {
      this.tracking_paused = true
      ui.setStatusPause()
      return true
    }
    return false
  }

  proposeTrackingResume() {
    if (this.tracking_paused) {
      this.tracking_paused = false
      ui.setStatusTracking()
      return true
    }
    return false
  }

  proposeTrackingStop() {
    if (this.tracking) {
      this.tracking = false
      return true
    }
    return false
  }

  proposeTrackingStart() {
    if (!this.tracking) {
      this.tracking = true
      return true
    }
    return false
  }


}
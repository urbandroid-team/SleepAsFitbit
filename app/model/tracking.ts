export class Tracking {
  constructor() {
    this.tracking = false
    this.tracking_paused = false
  }

  isTracking() { return this.tracking }
  isTrackingPaused() { return this.tracking_paused }

  setTracking(state:boolean) { this.tracking = state }
  setTrackingPaused(state:boolean) { this.tracking_paused = state }

}
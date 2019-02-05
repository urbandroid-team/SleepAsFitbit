export class Tracking {
  private _tracking:boolean = false
  private _hr_tracking:boolean = false
  private _tracking_paused:boolean = false

  get isTracking(): boolean { return this._tracking; }
  set setTracking(state: boolean) { this._tracking = state;}

  get isHrTracking(): boolean { return this._hr_tracking; }
  set setHrTracking(state: boolean) { this._hr_tracking = state;}

  get isTrackingPaused(): boolean { return this._tracking_paused; }
  set setTrackingPaused(state: boolean) { this._tracking_paused = state;}

}
export class Tracking {

  constructor() {
  }

  private _tracking:boolean = false
  private _hr_tracking:boolean = false
  private _tracking_paused:boolean = false
  private _batch_size:number = 12

  get tracking():boolean { return this._tracking; }
  set tracking(state:boolean) { this._tracking = state;}

  get hrTracking(): boolean { return this._hr_tracking; }
  set hrTracking(state: boolean) { this._hr_tracking = state;}

  get trackingPaused():boolean { return this._tracking_paused; }
  set trackingPaused(state: boolean) { this._tracking_paused = state;}

  get batchSize():number { return this._batch_size }
  set batchSize(size: number) { this._batch_size = size }

}
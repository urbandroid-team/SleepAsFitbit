import { Acc, Hr } from "../sensors";
import { Context } from "./context";

export class SensorsController {
  acc:Acc
  hr:Hr
  ctx: Context

  constructor(ctx: Context) {
    this.acc = new Acc
    this.hr = new Hr
    this.ctx = ctx
  }

  startAcc(receiver: any) {
    this.acc.startSensor(receiver)
  }

  startHr(receiver: any) {
    this.hr.startSensor(receiver)
  }

  stopAllSensors() {
    [this.acc, this.hr].forEach(sensor => {
      if (sensor != null) { sensor.stopSensor() }
    });
  }

  setBatchSize(size:number) {
    this.ctx.tracking.batchSize = size
  }
}


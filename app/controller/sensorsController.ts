import { Context } from "./context";

export class SensorsController {

  ctx:Context

  constructor(context: Context) {
    this.ctx = context
  }

  startAcc(receiver: any) {
    this.ctx.acc.startSensor(receiver)
  }

  startHr(receiver: any) {
    this.ctx.hr.startSensor(receiver)
  }

  stopAllSensors(sensorArr:any[]) {
    sensorArr.forEach(sensor => {
      if (sensor != null) { sensor.stopSensor() }
    });
  }

  setBatchSize(size:number) {
    // TODO not implemented
    console.log("setBatchSize to be implemented")
    // TODO should set
    // this.ctx.getTracking().batchSize = size
  }
}


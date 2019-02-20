import { Acc, Hr } from "../sensors";

export class SensorsController {
  acc:Acc
  hr:Hr

  constructor() {
    this.acc = new Acc
    this.hr = new Hr
  }

  startAcc(receiver: any) {
    this.acc.startSensor(receiver)
  }

  startHr(receiver: any) {
    this.hr.startSensor(receiver)
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


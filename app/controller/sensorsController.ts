import { Acc, Hr, GeminiAcc } from "../sensors";
import { Context } from "./context";
import { me as device } from "device";

export class SensorsController {
  acc:Acc | GeminiAcc
  hr:Hr
  ctx: Context
  isDeviceGemini: boolean = false


  constructor(ctx: Context) {
    if (device.modelId == '38' || device.modelName == 'Versa Lite') {
      console.log("Aww yeah, gemini...")
      this.isDeviceGemini = true
      this.acc = new GeminiAcc
    } else {
      this.acc = new Acc
    }
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
      if (sensor) { sensor.stopSensor() }
    });
  }

  setBatchSize(size:number) {
    this.ctx.tracking.batchSize = size
  }
}


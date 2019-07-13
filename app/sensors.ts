// Implementation of the Sensor API for Fitbit SDKv2, using sensor batching
import { Accelerometer } from "accelerometer"
import { HeartRateSensor } from "heart-rate"
import * as d from './dataCommons'

export class Acc {

  acc: Accelerometer

  readingsPerBatch:number = 100

  constructor() {
    // 10 readings per second, 100 readings per batch
    // the callback will be called once every batch/frequency seconds
    if (Accelerometer) {
      this.acc = new Accelerometer({ frequency: 10, batch: this.readingsPerBatch });
    }
  }

  startSensor(receiver: any) {
    console.log("Accelerometer started")
    this.acc.onreading = () => {
      console.log("Acc onReading")
      receiver(
        d.computeMaxDiffFromArray(this.acc.readings.x, this.acc.readings.y, this.acc.readings.z),
        d.computeMaxRawFromArray(this.acc.readings.x, this.acc.readings.y, this.acc.readings.z)
      )
    }

    this.acc.start()
  }

  stopSensor() {
    this.acc.stop()
  }
}

export class Hr {

  hrm: HeartRateSensor
  hrArr: Float32Array
  running: boolean = false

  constructor() {
    if (HeartRateSensor) {
      this.hrm = new HeartRateSensor({ frequency: 1, batch: 300 })
    }
  }

  startSensor(receiver: any) {
    console.log("HR startSensor")
    if (this.running) { return }

    this.hrm.onreading = () => {
      console.log("HR onReading")
      receiver(d.computeMedianFromFloat32Array(this.hrm.readings.heartRate))
    }

    this.hrm.start()
  }

  stopSensor() {
    console.log("HR stopSensor, running " + this.running)
    if (!this.running) { return }

    console.log("HR stopping sensor")
    this.hrm.stop()
    this.running = false
  }

}
// Implementation of the Sensor API for Fitbit SDKv2, using sensor batching

import { Accelerometer } from "accelerometer"
import { HeartRateSensor } from "heart-rate"
import * as d from './dataCommons'

export class Acc {
  acc: Accelerometer

  constructor() {
    // 10 readings per second, 100 readings per batch
    // the callback will be called once every batch/frequency seconds
    this.acc = new Accelerometer({ frequency: 10, batch: 100 });
  }

  startSensor(receiver: any) {
    console.log("Accelerometer started")
    this.acc.onreading = () => {
      console.log("Accelerometer onreading")
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

  static get HR_RESTART_PERIOD() { return 5 * 60 * 1000 }

  hrm: HeartRateSensor
  hrArr: any[]

  constructor() {
    this.hrm = new HeartRateSensor()
    this.hrArr = []
  }

  startSensor(receiver: any) {
    console.log("Started HR reading")
    this.hrm.onreading = () => {
      this.hrArr.push(this.hrm.heartRate)
    }

    if (this.hrArr.length > 9) {
      this.stopSensor()
      this.scheduleSensorRestart(Hr.HR_RESTART_PERIOD)
      receiver(d.computeMedianFromArray(this.hrArr))
      this.hrArr.length = 0
    }

    this.hrm.start()
  }

  stopSensor() {
    this.hrm.stop()
  }

  scheduleSensorRestart(delayMilliseconds:number) {
    setTimeout(() => { this.hrm.start() }, delayMilliseconds)
  }
}
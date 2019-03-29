// Implementation of the Sensor API for Fitbit SDKv2, using sensor batching

import { Accelerometer } from "accelerometer"
import { HeartRateSensor } from "heart-rate"
import * as d from './dataCommons'

export class Acc {

  // @ts-ignore
  acc: Accelerometer

  readingsPerBatch:number = 100

  constructor() {
    // 10 readings per second, 100 readings per batch
    // the callback will be called once every batch/frequency seconds

    // @ts-ignore
    this.acc = new Accelerometer({ frequency: 10, batch: this.readingsPerBatch });
  }

  startSensor(receiver: any) {
    console.log("Accelerometer started")
    this.acc.onreading = () => {
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

  // @ts-ignore
  hrm: HeartRateSensor
  hrArr: any[]

  constructor() {
    // @ts-ignore
    this.hrm = new HeartRateSensor()
    this.hrArr = []
  }

  startSensor(receiver: any) {
    console.log("Started HR reading")
    this.hrm.onreading = () => {
      this.hrArr.push(this.hrm.heartRate)

      if (this.hrArr.length > 9) {
        console.log("HR got 10 values, hrArr size: " + this.hrArr.length)
        this.stopSensor()
        this.scheduleSensorRestart( 5*60*1000 )
        receiver(d.computeMedianFromArray(this.hrArr))
        this.hrArr.length = 0
      }

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
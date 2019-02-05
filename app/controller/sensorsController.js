// Implementation of the Sensor API for Fitbit SDKv2, using sensor batching

import { Accelerometer } from "accelerometer"
import { HeartRateSensor } from "heart-rate"
import * as d from '../dataCommons'

export class Acc {

  constructor() {
    // 10 readings per second, 100 readings per batch
    // the callback will be called once every batch/frequency seconds
    this.acc = new Accelerometer({ frequency: 10, batch: 100 });
  }

  startSensor(receiver) {
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
  constructor() {
    this.HR_RESTART_PERIOD = 5 * 60 * 1000
    this.hrm = new HeartRateSensor()
    this.hrArr = []
  }

  startSensor(receiver) {
    console.log("Started HR reading")
    this.hrm.onreading = () => {
      this.hrArr = this.hrm.heartRate
    }

    if (this.hrArr.length > 9) {
      this.stopSensor()
      this.scheduleSensorRestart(this.HR_RESTART_PERIOD)
      receiver(d.computeMedianFromArray(this.hrArr))
      this.hrArr.length = 0
    }

    this.hrm.start()
  }

  stopSensor() {
    this.hrm.stop()
  }

  scheduleSensorRestart(delayMilliseconds) {
    setTimeout(this.hrm.start(), delayMilliseconds)
  }
}

export function stopAllSensors(sensorArr) {
  sensorArr.forEach(sensor => {
    if (sensor != null) { sensor.stopSensor() }
  });
}
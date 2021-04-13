// Implementation of the Sensor API for Fitbit SDKv2, using sensor batching
import { Accelerometer } from "accelerometer"
import { HeartRateSensor } from "heart-rate"
import * as d from './dataCommons'

export class Acc {

  acc: Accelerometer

  static readingsPerBatch:number = 100

  constructor() {
    // 10 readings per second, 100 readings per batch
    // the callback will be called once every batch/frequency seconds
    if (Accelerometer) {
      this.acc = new Accelerometer({ frequency: 10, batch: Acc.readingsPerBatch });
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

// This class is being used only for Gemini (Versa Lite) watch as it seems that Versa Lite is unable to used batched accelerometer readings
export class GeminiAcc {
  acc: Accelerometer

  constructor() {
    // 10 readings per second, 100 readings per batch
    // the callback will be called once every batch/frequency seconds
    if (Accelerometer) {
      this.acc = new Accelerometer({ frequency: 10 });
    }
  }

  startSensor(receiver: any) {
    let currentRawMax:number = 0
    let readingsCounter = Acc.readingsPerBatch

    console.log("Accelerometer started")
    this.acc.onreading = () => {
      // console.log("Acc onReading")
      readingsCounter--
      currentRawMax = Math.max(currentRawMax, d.computeMaxRaw(this.acc.x, this.acc.y, this.acc.z))

      if (readingsCounter < 0) {
        console.log("Acc got max out of 100 values: " + currentRawMax)
        receiver(0, currentRawMax)
        readingsCounter = Acc.readingsPerBatch
      }
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
  private latestValue: number = 0

  constructor() {
    if (HeartRateSensor)
      this.hrm = new HeartRateSensor({ frequency: 1, batch: 60 })
  }

  startSensor(receiver: any) {
    console.log("HR startSensor")
    if (this.hrm.activated) {
      console.log('Hr#startSensor: already activated')
      return
    }

    this.hrm.onreading = () => {
      console.log("HR onReading")
      this.latestValue = d.computeMedianFromFloat32Array(this.hrm.readings.heartRate)
      receiver(this.latestValue)
    }

    this.hrm.start()

    if (!this.latestValue) {
      console.log(`HR initial reading: ${this.hrm.heartRate}`);
      if (this.hrm.heartRate) {
        this.latestValue = this.hrm.heartRate
        receiver(this.latestValue)
      }
    }
  }

  stopSensor() {
    console.log(`HR stopSensor, running: ${this.hrm.activated}`)
    if (!this.hrm.activated) { return }

    console.log("HR stopping sensor")
    this.hrm.stop()
    this.latestValue = 0
  }

  getLatestValue() {
    return this.latestValue
  }

}

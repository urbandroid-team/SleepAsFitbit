// Implementation of the Sensor API for Fitbit SDKv1

import { Accelerometer } from "accelerometer";
import { HeartRateSensor } from "heart-rate";
import { me } from "appbit";
import * as d from './dataCommons'

export class Acc {
  constructor() {
    this.DATA_PERIOD = 10 * 1000

    this.acc = new Accelerometer({ frequency: 10 });
    this.max = 0;
    this.currentMax = 0;
    this.maxRaw = 0;
    this.currenttempMaxRaw = 0;

    this.lastX = 0;
    this.lastY = 0;
    this.lastZ = 0;

    this.currentTsMilliseconds = 0;

  }
  startSensor(receiver) {

    this.currentTsMilliseconds = Date.now()

    this.acc.onreading = () => {
      let x = this.acc.x
      let y = this.acc.y
      let z = this.acc.z

      this.currentMax = d.computeMaxDiff(x, y, z, this.lastX, this.lastY, this.lastZ)
      if (this.currentMax > this.max) {
        this.max = this.currentMax;
      }

      this.currentMaxRaw = d.computeMaxRaw(x, y, z)
      if (this.currentMaxRaw > this.maxRaw) {
        this.maxRaw = this.currentMaxRaw;
      }

      this.lastX = x
      this.lastY = y
      this.lastZ = z

      if (Date.now() - this.currentTsMilliseconds > this.DATA_PERIOD) {
        this.currentTsMilliseconds = Date.now()
        this.gatherAccValues(this.max, this.maxRaw, receiver)
        this.max = 0
        this.maxRaw = 0
      }
    }
    this.acc.start()
  }

  stopSensor() {
    this.acc.stop();
  }

  gatherAccValues(max, max_raw, receiver) {
    receiver([max], [max_raw])
  }
}

export class Hr {
  constructor() {
    this.HR_RESTART_PERIOD = 5 * 60 * 1000;

    this.hrm = new HeartRateSensor()
    this.hrArr = []
  }

  startSensor(receiver) {
    console.log("Started HR reading")
    if (me.permissions.granted("access_heart_rate")) {

      this.hrm.onreading = () => {
        this.hrArr << this.hrm.heartRate
        if (this.hrArr.length > 9) {
          this.stopSensor();
          this.scheduleSensorRestart(this.HR_RESTART_PERIOD);
          receiver(d.computeMedianFromArray(this.hrArr))
          this.hrArr.length = 0
        };
      }

      this.hrm.start();
      console.log("Started HR reading really")
    }
  }

  stopSensor() {
    this.hrm.stop();
  }

  scheduleSensorRestart(delayMilliseconds) {
    setTimeout(this.hrm.start(), delayMilliseconds);
  }

}
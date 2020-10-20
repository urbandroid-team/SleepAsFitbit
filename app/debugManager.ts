import { Context } from "./controller/context";
import { memory } from "system";

export class DebugManager {

  debug:boolean = false
  ctx: Context

  constructor(context: Context) {
    this.ctx = context
    this.observeMemoryPressure()
    this.observeMemory()
  }

  panic() {
    console.error("PANIC")
    this.ctx.businessController.stopTracking()
    this.ctx.businessController.stopAlarm()
    this.ctx.msgManager.stopMessaging()
    this.ctx.ui.setStatusPanic()

    setTimeout(() => {
      this.recoverFromPanic()
    }, 10000)
  }

  startMemLogTimer() {
    let memLogTimer = setInterval(() => {
      let mem = "M " + memory.js.used + " peak " + memory.js.peak
      this.ctx.msgManager.msgAdapter.sendPlain("Mem", mem)
      console.log(mem)
    }, 20000);
  }

  observeMemory() {
    setInterval(() => {
      if (memory.js.used > 60000) {
        this.panic()
      }
    }, 2000);
  }

  observeMemoryPressure() {
    let self = this
    memory.monitor.onmemorypressurechange = function (a) {
      let data = memory.monitor.pressure + " " + "M " + memory.js.used + " peak " + memory.js.peak
      console.log("memoryPressureChange:" + data);
      self.ctx.msgManager.msgAdapter.sendPlain("Mem pressure", data)
    }
  }

  measureTicks() {
    var interval = 100;
    var last = Date.now();
    var timer = setInterval(function () {
      var delta = Date.now() - last - interval;
      if (delta > 100) {
        console.error("eventloop_blocked " + delta);
      }
      last = Date.now();
    }, interval);
  }

  private recoverFromPanic() {
    this.ctx.businessController.startTrackingIfNotTracking()
    this.ctx.msgManager.restartMessaging()
    this.ctx.ui.recoverFromPanic()

  }
}

import { display } from "display";
import { me } from 'appbit'
import { Context } from "./controller/context";
import { memory } from "system";
import { Message } from "./model/message";

  var debug = false;
  var fitbitSdk = 3;

  var ctx = new Context()

try {
  ctx.ui.initialize()
  ctx.ui.changeToTrackingScreen()
  ctx.ui.initializeClock()

  if (debug) {
    display.autoOff = false;
    display.on = true;
  }

  if (fitbitSdk > 1) {
    if (me.appTimeoutEnabled) {
      me.appTimeoutEnabled = false;
      console.log("Setting app timeout: " + me.appTimeoutEnabled)
    }
  }

  ctx.msgManager.startCompanionCommChannel()

  let memLogTimer = setInterval(() => {
    let mem = "M " + memory.js.used + " total " + memory.js.total + " peak " + memory.js.peak
    ctx.msgManager.msgAdapter.send(new Message("Mem", mem))
    console.log(mem)
  }, 10000);

  memory.monitor.onmemorypressurechange = (e) => {
    ctx.msgManager.msgAdapter.send(new Message("Mem pressure", e.target))
  }
} catch (error) {
  console.error(error)
  ctx.msgManager.msgAdapter.send(new Message("error", error))
}

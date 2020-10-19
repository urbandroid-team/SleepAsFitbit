import { display } from "display";
import { me } from 'appbit'
import { Context } from "./controller/context";
import { Message } from "./model/message";

var fitbitSdk = 3;

var ctx = new Context()
var debug = ctx.debugManager.debug

try {
  // fitlogger.init({
  //   automaticInterval: 5000,
  //   doConsoleLog: true,
  //   prefix: 'Logger'
  // })

  ctx.ui.initialize()
  ctx.ui.changeToTrackingScreen()
  ctx.ui.initializeClock()

  if (debug) {
    display.autoOff = false;
    display.on = true;
  }

  if (fitbitSdk > 1) {
    me.appTimeoutEnabled = false;
    console.log("Setting app timeout: " + me.appTimeoutEnabled)
  }
  ctx.msgManager.startCompanionCommChannel()


  // ctx.businessController.startTracking(true)


} catch (error) {
  console.error(error)
  ctx.msgManager.msgAdapter.send(new Message("error", error))
}

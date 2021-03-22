import { display } from "display";
import { me } from 'appbit'
import { Context } from "./controller/context";
import { Message } from "./model/message";
import {AppConfig} from "../common/appConfig";

var fitbitSdk = 3;

var ctx = new Context()

try {
  // fitlogger.init({
  //   automaticInterval: 5000,
  //   doConsoleLog: true,
  //   prefix: 'Logger'
  // })

  ctx.ui.initialize()
  ctx.ui.changeToTrackingScreen()
  ctx.ui.initializeClock()

  if (AppConfig.DEBUG_MAIN) {
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

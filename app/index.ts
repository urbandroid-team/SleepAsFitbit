import { display } from "display";
import { me } from 'appbit'
import { Context } from "./controller/context";
import { MsgManager } from "./controller/msgManager";

var debug = true;
var fitbitSdk = 2;

var ctx = new Context()

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
  }
}

new MsgManager(ctx).startCompanionCommChannel()

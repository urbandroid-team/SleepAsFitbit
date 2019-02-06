import { display } from "display";
import { me } from 'appbit'
import { Context } from "./controller/context";
import { MsgManager } from "./controller/msgManager";
import { UIManager } from "./view/uiManager";

var debug = true;
var fitbitSdk = 2;

var ctx = new Context()

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

ctx.messageManager.startCompanionCommChannel()
import document from "document";
// import document from "@fitbit/sdk"
import { display } from "display";
import { me as device } from "device";
import { me } from 'appbit'
import * as m from './msgCommons'
import * as messaging from "messaging";
import clock from "clock";
import { Context } from "./controller/context";
import { MsgManager } from "./controller/msgManager";
import { UIManager } from "./view/uiManager";

var debug = true;
var fitbitSdk = 2;

var context = new Context()

new UIManager().initializeClock()

if (debug) {
  display.autoOff = false;
  display.on = true;
}

if (fitbitSdk > 1) {
  if (me.appTimeoutEnabled) {
    me.appTimeoutEnabled = false;
  }
}


let msgManager = new MsgManager(context)
msgManager.startCompanionCommChannel()
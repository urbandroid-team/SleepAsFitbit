import document from "document";
import { display } from "display";
import { me as device } from "device";
import { me } from 'appbit'
import * as m from './msgCommons'
import * as messaging from "messaging";
import clock from "clock";
import { Context } from "./controller/context";
import { MsgManager } from "./controller/msgManager";

var debug = true;
var fitbitSdk = 2;

var context = new Context()

let clockElement = document.getElementById("clock");
clock.granularity = 'minutes';

if (debug) {
  display.autoOff = false;
  display.on = true;
}

if (fitbitSdk > 1) {
  if (me.appTimeoutEnabled) {
    me.appTimeoutEnabled = false;
  }
}

clock.ontick = function (evt) {
  clockElement.text = ("0" + evt.date.getHours()).slice(-2) + ":" +
  ("0" + evt.date.getMinutes()).slice(-2)
};

let msgManager = new MsgManager(context)
msgManager.startCompanionCommChannel()
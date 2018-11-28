import document from "document";
import { display } from "display";
import { inspect } from '../common/utils';
import { me as device } from "device";
import { me } from 'appbit'
import * as m from './msgCommons'
import * as messaging from "messaging";


var debug = true;
var sdkv2 = true;

if (debug) {
  display.autoOff = false;
  display.on = true;
}

if (sdkv2) {
  if (me.appTimeoutEnabled) {
    me.appTimeoutEnabled = false;
  }
}

// m.initCompanionMessaging();




testTimeout()


function testTimeout() {
  console.log("testTimeout")
  setTimeout(() => {
    console.log("tick Timeout")
    // changeToAlarmScreen()
  }, 2000)
  setInterval(() => {console.log("tick Interval")}, 1000)
}

function changeToAlarmScreen() {
  console.log("changing to alarm screen")

  let al = document.getElementById("alarmScreen")
  let tr = document.getElementById("trackingScreen")


  al.style.display = "inline"
  tr.style.display = "none"
}
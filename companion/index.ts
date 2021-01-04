import { Message } from "../app/model/message";
import { me } from 'companion'
import { app, device } from "peer";
import { AppConfig } from '../common/appConfig'
import { Context } from "./context";

let context = new Context

me.wakeInterval = AppConfig.defaultCompanionWakeInterval

console.log("Companion started")

context.phoneMessagingAdapter.init()
context.watchMessagingAdapter.init()

me.addEventListener('unload', function() {
  context.phoneMessagingAdapter.send("companion unloaded")
  console.log("Companion unloaded")
})

app.addEventListener("readystatechange", function () {
  context.phoneMessagingAdapter.enqueue(new Message("appRuns", `${app.readyState} ${device.modelName} ${device.modelName}`))
})




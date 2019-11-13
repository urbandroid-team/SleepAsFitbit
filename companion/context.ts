import { PhoneMessagingAdapter } from "./messaging/phoneMessagingAdapter";
import { WatchMessagingAdapter } from "./messaging/watchMessagingAdapter";

export class Context {
  phoneMessagingAdapter: PhoneMessagingAdapter
  watchMessagingAdapter: WatchMessagingAdapter

  constructor() {
    this.phoneMessagingAdapter = new PhoneMessagingAdapter(this)
    this.watchMessagingAdapter = new WatchMessagingAdapter(this)
  }
}
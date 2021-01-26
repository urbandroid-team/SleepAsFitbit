import {QueueMessage} from "./queueMessage";
import {MsgConstants} from "../../../common/msgConstants";
import { Message } from "../../model/message";
import {MultiMessage} from "../../model/MultiMessage";

export class Queue {
	_queue: QueueMessage[] = []

	get length() {
		return this._queue.length
	}

	clear() {
		this._queue.length = 0
	}

	enqueue(qMsg: QueueMessage) {
		this._queue.push(qMsg)
	}

	first() {
		return this._queue[0]
	}

	atIndex(i: number) {
		return this._queue[i]
	}

	removeFirst() {
		this._queue.shift()
	}

	clearExpired() {
		this._queue = this._queue.filter(msg => !msg.expired())
	}

	squashIntoMulti(idForMultiMsg: number) {
		this._queue = [this._queue.reduce((multiMsg, msg) => {
			(multiMsg.body as MultiMessage).addMessage(msg.body)
			return multiMsg
		}, new QueueMessage(idForMultiMsg, new MultiMessage()))]
	}
}

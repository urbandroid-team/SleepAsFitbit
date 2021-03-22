import {QueueMessage} from "./queueMessage";
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
		// TODO: if there's already one multi-message, we can't keep wrapping it with multi ad infinitum


		this._queue = [this._queue.reduce((multiMsg, msg) => {
			if (msg.body.isMultiMessage()) {
				// console.log('Add multi to multi', msg.body);
				(multiMsg.body as MultiMessage).addMessage(msg.body.data)
			} else {
				(multiMsg.body as MultiMessage).addMessage(msg.body)
			}
			return multiMsg
		}, new QueueMessage(idForMultiMsg, new MultiMessage()))]
	}
}

export class Message {
  private _command: string
  private _data: any

  constructor(command:string, data:any) {
    if (command) {
      this._command = command
    }

    if (data) {
      this._data = data
    }
  }

  get command(): string { return this._command; }
  set command(command: string) { this._command = command; }

  get data(): any { return this._data; }
  set data(data: any) { this._data = data; }

  serialize() {
    return [this.command, this.data]
  }

  static deserialize(array:any[]) {
    return new Message(array[0], array[1])
  }

  toString() {
    return this.command + '*' + this.data
  }

  static fromString(str: string): Message {
    let ar = str.split("*")
    return (new Message(ar[0], ar[1]))
  }
}
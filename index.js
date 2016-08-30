const Promise = require('bluebird');

class WaitGroup {
  constructor() {
    this._waiting = 0;

    this._joinProm = null;
    this._joinResolve = null;
  }

  submit() {
    this._waiting += 1;
  }

  complete() {
    this._waiting -= 1;

    if (this._waiting === 0 && this._joinResolve) {
      this._joinResolve();
      delete this._joinResolve;
    }
  }

  waiting() {
    return this._waiting;
  }

  join() {
    if (this._waiting === 0) {
      return Promise.resolve();
    }

    if (this._joinProm) {
      return this._joinProm;
    }

    this._joinProm = new Promise((resolve) => this._joinResolve = resolve);
    return this._joinProm;
  }
}

class TaskPool {
  constructor({ maxConcurrent = Infinity } = {}) {
    this.maxConcurrent = maxConcurrent;
    this.queue = [];
    this.wait = new WaitGroup();
  }

  run(task) {
    const taskProm = new Promise((resolve, reject) => {
      this.queue.push({ task, resolve, reject });
    });

    if (this.wait.waiting() !== this.maxConcurrent) {
      this.wait.submit();
      this._run(this.queue.shift());
    }

    return taskProm;
  }

  _run(next) {
    if (next) {
      const { task, resolve, reject } = next;

      Promise.resolve(task()).then(resolve, reject).finally(() => {
        this._run(this.queue.shift());
      });

      return null;
    } else {
      this.wait.complete();
    }
  }

  running() {
    return this.wait.waiting();
  }

  queued() {
    return this.queue.length;
  }

  join() {
    return this.wait.join();
  }
}

module.exports = TaskPool;
module.exports.WaitGroup = WaitGroup;

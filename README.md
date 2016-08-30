# TaskPool/WaitGroup

> Concurrent task executor for scheduling asynchronous tasks.

## Example

(From the tests)

```javascript
const expect = require('chai').expect;
const TaskPool = require('taskpool');

describe('TaskPool', () => {
  it('never has more than the maxConcurrent tasks running at once', () => {
    const max = 5;
    const tasks = 100;
  
    const pool = new TaskPool({ maxConcurrent: max });
  
    for (let i = 0; i < tasks; i++) {
      pool.run(() => {
        expect(pool.running()).to.be.at.most(max);
      });
    }
  
    return pool.join();
  });
});
```

## Overview

Provides two types, `TaskPool` and `WaitGroup`. `WaitGroup` is a simple, semaphore-like interface
providing `submit`, `complete`, and `join`. `submit` adds a new task, `complete` completes one,
and `join` returns a `Promise` that is resolved when there are next no waiting jobs.

`TaskPool` is built atop `WaitGroup` and provides a wrapper that can limit the concurrency of
many asynchronous tasks and also has a convenient Promise-based interface. It also features `join` for
awaiting the completion of all pending tasks.

## Tests

Run the tests with `npm test`.

## Author

`taskpool` is written and maintained by [Jonathan Reem](https://github.com/reem).

## License

MIT

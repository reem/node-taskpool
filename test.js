/*global describe, it */

const Promise = require('bluebird');
const expect = require('chai').expect;
const TaskPool = require('.');
const WaitGroup = require('.').WaitGroup;

describe('TaskPool', () => {
  it('should run tasks', () => {
    const pool = new TaskPool();
    return pool.run(() => Promise.resolve(10));
  });

  it('should run multiple tasks', () => {
    const pool = new TaskPool();

    return Promise.join(pool.run(() => Promise.resolve(1)),
                        pool.run(() => Promise.resolve(2)));
  });

  it('should run them in submitted order', () => {
    const pool = new TaskPool({ maxConcurrent: 1 });

    const first = pool.run(() => {
      expect(pool.running()).to.equal(1);
    });

    const second = pool.run(() => {
      expect(pool.running()).to.equal(1);
    });

    return Promise.join(first, second);
  });

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

describe('WaitGroup', () => {
  it('should join immediately if there are no waiting tasks', () => {
    const wait = new WaitGroup();
    return wait.join();
  });

  it('should wait for all submitted tasks if there are waiting tasks', () => {
    const wait = new WaitGroup();

    wait.submit();
    wait.submit();
    expect(wait.waiting()).to.equal(2);

    wait.join().then(() => expect(wait.waiting()).to.equal(0));

    wait.complete();
    expect(wait.waiting()).to.equal(1);

    wait.complete();

    return wait.join();
  });
});

BASE: C:\Users\chell\Documents\Sallie_Sovereign\_staging\incoming\node_modules\yocto-queue\readme.md
OTHER: C:\Users\chell\Documents\Sallie_Sovereign\_staging\incoming\node_modules\tinybench\README.md
---- DIFF ----
_I'm transitioning to a full-time open source career. Your support would be greatly appreciated 🙌_
<a href="https://polar.sh/tinylibs/subscriptions"><picture><source media="(prefers-color-scheme: dark)" srcset="https://polar.sh/embed/tiers.svg?org=tinylibs&darkmode"><img alt="Subscription Tiers on Polar" src="https://polar.sh/embed/tiers.svg?org=tinylibs"></picture></a>
# Tinybench 🔎
[![CI](https://github.com/tinylibs/tinybench/actions/workflows/test.yml/badge.svg?branch=main)](https://github.com/tinylibs/tinybench/actions/workflows/test.yml)
[![NPM version](https://img.shields.io/npm/v/tinybench.svg?style=flat)](https://www.npmjs.com/package/tinybench)
Benchmark your code easily with Tinybench, a simple, tiny and light-weight `7KB` (`2KB` minified and gzipped)
benchmarking library!
You can run your benchmarks in multiple JavaScript runtimes, Tinybench is
completely based on the Web APIs with proper timing using `process.hrtime` or
`performance.now`.
- Accurate and precise timing based on the environment
- `Event` and `EventTarget` compatible events
- Statistically analyzed values
- Calculated Percentiles
- Fully detailed results
- No dependencies
_In case you need more tiny libraries like tinypool or tinyspy, please consider submitting an [RFC](https://github.com/tinylibs/rfcs)_
## Installing
```bash
$ npm install -D tinybench
You can start benchmarking by instantiating the `Bench` class and adding
benchmark tasks to it.
import { Bench } from 'tinybench';
const bench = new Bench({ time: 100 });
bench
  .add('faster task', () => {
    console.log('I am faster')
  })
  .add('slower task', async () => {
    await new Promise(r => setTimeout(r, 1)) // we wait 1ms :)
    console.log('I am slower')
  })
  .todo('unimplemented bench')
await bench.warmup(); // make results more reliable, ref: https://github.com/tinylibs/tinybench/pull/50
await bench.run();
console.table(bench.table());
// Output:
// ┌─────────┬───────────────┬──────────┬────────────────────┬───────────┬─────────┐
// │ (index) │   Task Name   │ ops/sec  │ Average Time (ns)  │  Margin   │ Samples │
// ├─────────┼───────────────┼──────────┼────────────────────┼───────────┼─────────┤
// │    0    │ 'faster task' │ '41,621' │ 24025.791819761525 │ '±20.50%' │  4257   │
// │    1    │ 'slower task' │  '828'   │ 1207382.7838323202 │ '±7.07%'  │   83    │
// └─────────┴───────────────┴──────────┴────────────────────┴───────────┴─────────┘
console.table(
  bench.table((task) => ({'Task name': task.name}))
);
// Output:
// ┌─────────┬───────────────────────┐
// │ (index) │       Task name       │
// ├─────────┼───────────────────────┤
// │    0    │ 'unimplemented bench' │
// └─────────┴───────────────────────┘
The `add` method accepts a task name and a task function, so it can benchmark
it! This method returns a reference to the Bench instance, so it's possible to
use it to create an another task for that instance.
Note that the task name should always be unique in an instance, because Tinybench stores the tasks based
on their names in a `Map`.
Also note that `tinybench` does not log any result by default. You can extract the relevant stats
from `bench.tasks` or any other API after running the benchmark, and process them however you want.
## Docs
### `Bench`
The Benchmark instance for keeping track of the benchmark tasks and controlling
them.
Options:
```ts
export type Options = {
  /**
   * time needed for running a benchmark task (milliseconds) @default 500
   */
  time?: number;
  /**
   * number of times that a task should run if even the time option is finished @default 10
   */
  iterations?: number;
  /**
   * function to get the current timestamp in milliseconds
   */
  now?: () => number;
  /**
   * An AbortSignal for aborting the benchmark
   */
  signal?: AbortSignal;

  /**
   * Throw if a task fails (events will not work if true)
   */
  throws?: boolean;

  /**
   * warmup time (milliseconds) @default 100ms
   */
  warmupTime?: number;

  /**
   * warmup iterations @default 5
   */
  warmupIterations?: number;

  /**
   * setup function to run before each benchmark task (cycle)
   */
  setup?: Hook;

  /**
   * teardown function to run after each benchmark task (cycle)
   */
  teardown?: Hook;
};

export type Hook = (task: Task, mode: "warmup" | "run") => void | Promise<void>;

- `async run()`: run the added tasks that were registered using the `add` method
- `async runConcurrently(threshold: number = Infinity, mode: "bench" | "task" = "bench")`: similar to the `run` method but runs concurrently rather than sequentially. See the [Concurrency](#Concurrency) section. 
- `async warmup()`: warm up the benchmark tasks
- `async warmupConcurrently(threshold: number = Infinity, mode: "bench" | "task" = "bench")`: warm up the benchmark tasks concurrently
- `reset()`: reset each task and remove its result
- `add(name: string, fn: Fn, opts?: FnOpts)`: add a benchmark task to the task map
  - `Fn`: `() => any | Promise<any>`
  - `FnOpts`: `{}`: a set of optional functions run during the benchmark lifecycle that can be used to set up or tear down test data or fixtures without affecting the timing of each task
    - `beforeAll?: () => any | Promise<any>`: invoked once before iterations of `fn` begin
    - `beforeEach?: () => any | Promise<any>`: invoked before each time `fn` is executed
    - `afterEach?: () => any | Promise<any>`: invoked after each time `fn` is executed
    - `afterAll?: () => any | Promise<any>`: invoked once after all iterations of `fn` have finished
- `remove(name: string)`: remove a benchmark task from the task map
- `table()`: table of the tasks results
- `get results(): (TaskResult | undefined)[]`: (getter) tasks results as an array
- `get tasks(): Task[]`: (getter) tasks as an array
- `getTask(name: string): Task | undefined`: get a task based on the name
- `todo(name: string, fn?: Fn, opts: FnOptions)`: add a benchmark todo to the todo map
- `get todos(): Task[]`: (getter) tasks todos as an array

### `Task`

A class that represents each benchmark task in Tinybench. It keeps track of the
results, name, Bench instance, the task function and the number of times the task
function has been executed.

- `constructor(bench: Bench, name: string, fn: Fn, opts: FnOptions = {})`
- `bench: Bench`
- `name: string`: task name
- `fn: Fn`: the task function
- `opts: FnOptions`: Task options
- `runs: number`: the number of times the task function has been executed
- `result?: TaskResult`: the result object
- `async run()`: run the current task and write the results in `Task.result` object
- `async warmup()`: warm up the current task
- `setResult(result: Partial<TaskResult>)`: change the result object values
- `reset()`: reset the task to make the `Task.runs` a zero-value and remove the `Task.result` object

```ts
export interface FnOptions {
  /**
   * An optional function that is run before iterations of this task begin
   */
  beforeAll?: (this: Task) => void | Promise<void>;

  /**
   * An optional function that is run before each iteration of this task
   */
  beforeEach?: (this: Task) => void | Promise<void>;

  /**
   * An optional function that is run after each iteration of this task
   */
  afterEach?: (this: Task) => void | Promise<void>;

  /**
   * An optional function that is run after all iterations of this task end
   */
  afterAll?: (this: Task) => void | Promise<void>;
}
```

## `TaskResult`

the benchmark task result object.

```ts
export type TaskResult = {

  /*
   * the last error that was thrown while running the task
   */
  error?: unknown;

  /**
   * The amount of time in milliseconds to run the benchmark task (cycle).
   */
  totalTime: number;

  /**
   * the minimum value in the samples
   */
  min: number;
  /**
   * the maximum value in the samples
   */
  max: number;

  /**
   * the number of operations per second
   */
  hz: number;

  /**
   * how long each operation takes (ms)
   */
  period: number;

  /**
   * task samples of each task iteration time (ms)
   */
  samples: number[];

  /**
   * samples mean/average (estimate of the population mean)
   */
  mean: number;

  /**
   * samples variance (estimate of the population variance)
   */
  variance: number;

  /**
   * samples standard deviation (estimate of the population standard deviation)
   */
  sd: number;

  /**
   * standard error of the mean (a.k.a. the standard deviation of the sampling distribution of the sample mean)
   */
  sem: number;

  /**
   * degrees of freedom
   */
  df: number;

  /**
   * critical value of the samples
   */
  critical: number;

  /**
   * margin of error
   */
  moe: number;

  /**
   * relative margin of error
   */
  rme: number;

  /**
   * p75 percentile
   */
  p75: number;

  /**
   * p99 percentile
   */
  p99: number;

  /**
   * p995 percentile
   */
  p995: number;

  /**
   * p999 percentile
   */
  p999: number;
};
```

### `Events`

Both the `Task` and `Bench` objects extend the `EventTarget` object, so you can attach listeners to different types of events
in each class instance using the universal `addEventListener` and
`removeEventListener`.

```ts
/**
 * Bench events
 */
export type BenchEvents =
  | "abort" // when a signal aborts
  | "complete" // when running a benchmark finishes
  | "error" // when the benchmark task throws
  | "reset" // when the reset function gets called
  | "start" // when running the benchmarks gets started
  | "warmup" // when the benchmarks start getting warmed up (before start)
  | "cycle" // when running each benchmark task gets done (cycle)
  | "add" // when a Task gets added to the Bench
  | "remove" // when a Task gets removed of the Bench
  | "todo"; // when a todo Task gets added to the Bench

/**
 * task events
 */
export type TaskEvents =
  | "abort"
  | "complete"
  | "error"
  | "reset"
  | "start"
  | "warmup"
  | "cycle";
```

For instance:

```js
// runs on each benchmark task's cycle
bench.addEventListener("cycle", (e) => {
  const task = e.task!;
});

// runs only on this benchmark task's cycle
task.addEventListener("cycle", (e) => {
  const task = e.task!;
});
```

### `BenchEvent`

```ts
export type BenchEvent = Event & {
  task: Task | null;
};
```

### `process.hrtime`
if you want more accurate results for nodejs with `process.hrtime`, then import
	the `hrtimeNow` function from the library and pass it to the `Bench` options.

```ts
import { hrtimeNow } from 'tinybench';
```
It may make your benchmarks slower, check #42.

## Concurrency

- When `mode` is set to `null` (default), concurrency is disabled.
- When `mode` is set to 'task', each task's iterations (calls of a task function) run concurrently.
- When `mode` is set to 'bench', different tasks within the bench run concurrently. Concurrent cycles.

```ts
// options way (recommended)
bench.threshold = 10 // The maximum number of concurrent tasks to run. Defaults to Infinity.
bench.concurrency = "task" // The concurrency mode to determine how tasks are run.  
// await bench.warmup()
await bench.run()

// standalone method way
// await bench.warmupConcurrently(10, "task")
await bench.runConcurrently(10, "task") // with runConcurrently, mode is set to 'bench' by default
```

## Prior art

- [Benchmark.js](https://github.com/bestiejs/benchmark.js)
- [Mitata](https://github.com/evanwashere/mitata/)
- [Bema](https://github.com/prisma-labs/bema)

## Authors

| <a href="https://github.com/Aslemammad"> <img width='150' src="https://avatars.githubusercontent.com/u/37929992?v=4" /><br> Mohammad Bagher </a> |
| ------------------------------------------------------------------------------------------------------------------------------------------------ |

## Credits

| <a href="https://github.com/uzlopak"> <img width='150' src="https://avatars.githubusercontent.com/u/5059100?v=4" /><br> Uzlopak </a> | <a href="https://github.com/poyoho"> <img width='150' src="https://avatars.githubusercontent.com/u/36070057?v=4" /><br> poyoho </a> |
| ------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------- |

## Contributing

Feel free to create issues/discussions and then PRs for the project!

## Sponsors

Your sponsorship can make a huge difference in continuing our work in open source!

<p align="center">
  <a href="https://cdn.jsdelivr.net/gh/aslemammad/static/sponsors.svg">
    <img src='https://cdn.jsdelivr.net/gh/aslemammad/static/sponsors.svg'/>
  </a>
</p>

# yocto-queue [![](https://badgen.net/bundlephobia/minzip/yocto-queue)](https://bundlephobia.com/result?p=yocto-queue)
> Tiny queue data structure
You should use this package instead of an array if you do a lot of `Array#push()` and `Array#shift()` on large arrays, since `Array#shift()` has [linear time complexity](https://medium.com/@ariel.salem1989/an-easy-to-use-guide-to-big-o-time-complexity-5dcf4be8a444#:~:text=O(N)%E2%80%94Linear%20Time) *O(n)* while `Queue#dequeue()` has [constant time complexity](https://medium.com/@ariel.salem1989/an-easy-to-use-guide-to-big-o-time-complexity-5dcf4be8a444#:~:text=O(1)%20%E2%80%94%20Constant%20Time) *O(1)*. That makes a huge difference for large arrays.
> A [queue](https://en.wikipedia.org/wiki/Queue_(abstract_data_type)) is an ordered list of elements where an element is inserted at the end of the queue and is removed from the front of the queue. A queue works based on the first-in, first-out ([FIFO](https://en.wikipedia.org/wiki/FIFO_(computing_and_electronics))) principle.
## Install
$ npm install yocto-queue
const Queue = require('yocto-queue');
const queue = new Queue();
queue.enqueue('🦄');
queue.enqueue('🌈');
console.log(queue.size);
//=> 2
console.log(...queue);
//=> '🦄 🌈'
console.log(queue.dequeue());
//=> '🦄'
console.log(queue.dequeue());
//=> '🌈'
## API
### `queue = new Queue()`
The instance is an [`Iterable`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols), which means you can iterate over the queue front to back with a “for…of” loop, or use spreading to convert the queue to an array. Don't do this unless you really need to though, since it's slow.
#### `.enqueue(value)`
Add a value to the queue.
#### `.dequeue()`
Remove the next value in the queue.
Returns the removed value or `undefined` if the queue is empty.
#### `.clear()`
Clear the queue.
#### `.size`
The size of the queue.
## Related
- [quick-lru](https://github.com/sindresorhus/quick-lru) - Simple “Least Recently Used” (LRU) cache

concat-map
==========

Concatenative mapdashery.

[![browser support](http://ci.testling.com/substack/node-concat-map.png)](http://ci.testling.com/substack/node-concat-map)

[![build status](https://secure.travis-ci.org/substack/node-concat-map.png)](http://travis-ci.org/substack/node-concat-map)

example
=======

``` js
var concatMap = require('concat-map');
var xs = [ 1, 2, 3, 4, 5, 6 ];
var ys = concatMap(xs, function (x) {
    return x % 2 ? [ x - 0.1, x, x + 0.1 ] : [];
});
console.dir(ys);
```

***

```
[ 0.9, 1, 1.1, 2.9, 3, 3.1, 4.9, 5, 5.1 ]
```

methods
=======

``` js
var concatMap = require('concat-map')
```

concatMap(xs, fn)
-----------------

Return an array of concatenated elements by calling `fn(x, i)` for each element
`x` and each index `i` in the array `xs`.

When `fn(x, i)` returns an array, its result will be concatenated with the
result array. If `fn(x, i)` returns anything else, that value will be pushed
onto the end of the result array.

install
=======

With [npm](http://npmjs.org) do:

```
npm install concat-map
```

license
=======

MIT

notes
=====

This module was written while sitting high above the ground in a tree.


deep-is
==========

Node's `assert.deepEqual() algorithm` as a standalone module. Exactly like
[deep-equal](https://github.com/substack/node-deep-equal) except for the fact that `deepEqual(NaN, NaN) === true`.

This module is around [5 times faster](https://gist.github.com/2790507)
than wrapping `assert.deepEqual()` in a `try/catch`.

[![browser support](http://ci.testling.com/thlorenz/deep-is.png)](http://ci.testling.com/thlorenz/deep-is)

[![build status](https://secure.travis-ci.org/thlorenz/deep-is.png)](http://travis-ci.org/thlorenz/deep-is)

example
=======

``` js
var equal = require('deep-is');
console.dir([
    equal(
        { a : [ 2, 3 ], b : [ 4 ] },
        { a : [ 2, 3 ], b : [ 4 ] }
    ),
    equal(
        { x : 5, y : [6] },
        { x : 5, y : 6 }
    )
]);
```

methods
=======

var deepIs = require('deep-is')

deepIs(a, b)
---------------

Compare objects `a` and `b`, returning whether they are equal according to a
recursive equality algorithm.

install
=======

With [npm](http://npmjs.org) do:

```
npm install deep-is
```

test
====

With [npm](http://npmjs.org) do:

```
npm test
```

license
=======

Copyright (c) 2012, 2013 Thorsten Lorenz <thlorenz@gmx.de>
Copyright (c) 2012 James Halliday <mail@substack.net>

Derived largely from node's assert module, which has the copyright statement:

Copyright (c) 2009 Thomas Robinson <280north.com>

Released under the MIT license, see LICENSE for details.

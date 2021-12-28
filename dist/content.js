/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/regenerator-runtime/runtime.js":
/*!*****************************************************!*\
  !*** ./node_modules/regenerator-runtime/runtime.js ***!
  \*****************************************************/
/***/ ((module) => {

/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

var runtime = (function (exports) {
  "use strict";

  var Op = Object.prototype;
  var hasOwn = Op.hasOwnProperty;
  var undefined; // More compressible than void 0.
  var $Symbol = typeof Symbol === "function" ? Symbol : {};
  var iteratorSymbol = $Symbol.iterator || "@@iterator";
  var asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator";
  var toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";

  function define(obj, key, value) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
    return obj[key];
  }
  try {
    // IE 8 has a broken Object.defineProperty that only works on DOM objects.
    define({}, "");
  } catch (err) {
    define = function(obj, key, value) {
      return obj[key] = value;
    };
  }

  function wrap(innerFn, outerFn, self, tryLocsList) {
    // If outerFn provided and outerFn.prototype is a Generator, then outerFn.prototype instanceof Generator.
    var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator;
    var generator = Object.create(protoGenerator.prototype);
    var context = new Context(tryLocsList || []);

    // The ._invoke method unifies the implementations of the .next,
    // .throw, and .return methods.
    generator._invoke = makeInvokeMethod(innerFn, self, context);

    return generator;
  }
  exports.wrap = wrap;

  // Try/catch helper to minimize deoptimizations. Returns a completion
  // record like context.tryEntries[i].completion. This interface could
  // have been (and was previously) designed to take a closure to be
  // invoked without arguments, but in all the cases we care about we
  // already have an existing method we want to call, so there's no need
  // to create a new function object. We can even get away with assuming
  // the method takes exactly one argument, since that happens to be true
  // in every case, so we don't have to touch the arguments object. The
  // only additional allocation required is the completion record, which
  // has a stable shape and so hopefully should be cheap to allocate.
  function tryCatch(fn, obj, arg) {
    try {
      return { type: "normal", arg: fn.call(obj, arg) };
    } catch (err) {
      return { type: "throw", arg: err };
    }
  }

  var GenStateSuspendedStart = "suspendedStart";
  var GenStateSuspendedYield = "suspendedYield";
  var GenStateExecuting = "executing";
  var GenStateCompleted = "completed";

  // Returning this object from the innerFn has the same effect as
  // breaking out of the dispatch switch statement.
  var ContinueSentinel = {};

  // Dummy constructor functions that we use as the .constructor and
  // .constructor.prototype properties for functions that return Generator
  // objects. For full spec compliance, you may wish to configure your
  // minifier not to mangle the names of these two functions.
  function Generator() {}
  function GeneratorFunction() {}
  function GeneratorFunctionPrototype() {}

  // This is a polyfill for %IteratorPrototype% for environments that
  // don't natively support it.
  var IteratorPrototype = {};
  define(IteratorPrototype, iteratorSymbol, function () {
    return this;
  });

  var getProto = Object.getPrototypeOf;
  var NativeIteratorPrototype = getProto && getProto(getProto(values([])));
  if (NativeIteratorPrototype &&
      NativeIteratorPrototype !== Op &&
      hasOwn.call(NativeIteratorPrototype, iteratorSymbol)) {
    // This environment has a native %IteratorPrototype%; use it instead
    // of the polyfill.
    IteratorPrototype = NativeIteratorPrototype;
  }

  var Gp = GeneratorFunctionPrototype.prototype =
    Generator.prototype = Object.create(IteratorPrototype);
  GeneratorFunction.prototype = GeneratorFunctionPrototype;
  define(Gp, "constructor", GeneratorFunctionPrototype);
  define(GeneratorFunctionPrototype, "constructor", GeneratorFunction);
  GeneratorFunction.displayName = define(
    GeneratorFunctionPrototype,
    toStringTagSymbol,
    "GeneratorFunction"
  );

  // Helper for defining the .next, .throw, and .return methods of the
  // Iterator interface in terms of a single ._invoke method.
  function defineIteratorMethods(prototype) {
    ["next", "throw", "return"].forEach(function(method) {
      define(prototype, method, function(arg) {
        return this._invoke(method, arg);
      });
    });
  }

  exports.isGeneratorFunction = function(genFun) {
    var ctor = typeof genFun === "function" && genFun.constructor;
    return ctor
      ? ctor === GeneratorFunction ||
        // For the native GeneratorFunction constructor, the best we can
        // do is to check its .name property.
        (ctor.displayName || ctor.name) === "GeneratorFunction"
      : false;
  };

  exports.mark = function(genFun) {
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
    } else {
      genFun.__proto__ = GeneratorFunctionPrototype;
      define(genFun, toStringTagSymbol, "GeneratorFunction");
    }
    genFun.prototype = Object.create(Gp);
    return genFun;
  };

  // Within the body of any async function, `await x` is transformed to
  // `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
  // `hasOwn.call(value, "__await")` to determine if the yielded value is
  // meant to be awaited.
  exports.awrap = function(arg) {
    return { __await: arg };
  };

  function AsyncIterator(generator, PromiseImpl) {
    function invoke(method, arg, resolve, reject) {
      var record = tryCatch(generator[method], generator, arg);
      if (record.type === "throw") {
        reject(record.arg);
      } else {
        var result = record.arg;
        var value = result.value;
        if (value &&
            typeof value === "object" &&
            hasOwn.call(value, "__await")) {
          return PromiseImpl.resolve(value.__await).then(function(value) {
            invoke("next", value, resolve, reject);
          }, function(err) {
            invoke("throw", err, resolve, reject);
          });
        }

        return PromiseImpl.resolve(value).then(function(unwrapped) {
          // When a yielded Promise is resolved, its final value becomes
          // the .value of the Promise<{value,done}> result for the
          // current iteration.
          result.value = unwrapped;
          resolve(result);
        }, function(error) {
          // If a rejected Promise was yielded, throw the rejection back
          // into the async generator function so it can be handled there.
          return invoke("throw", error, resolve, reject);
        });
      }
    }

    var previousPromise;

    function enqueue(method, arg) {
      function callInvokeWithMethodAndArg() {
        return new PromiseImpl(function(resolve, reject) {
          invoke(method, arg, resolve, reject);
        });
      }

      return previousPromise =
        // If enqueue has been called before, then we want to wait until
        // all previous Promises have been resolved before calling invoke,
        // so that results are always delivered in the correct order. If
        // enqueue has not been called before, then it is important to
        // call invoke immediately, without waiting on a callback to fire,
        // so that the async generator function has the opportunity to do
        // any necessary setup in a predictable way. This predictability
        // is why the Promise constructor synchronously invokes its
        // executor callback, and why async functions synchronously
        // execute code before the first await. Since we implement simple
        // async functions in terms of async generators, it is especially
        // important to get this right, even though it requires care.
        previousPromise ? previousPromise.then(
          callInvokeWithMethodAndArg,
          // Avoid propagating failures to Promises returned by later
          // invocations of the iterator.
          callInvokeWithMethodAndArg
        ) : callInvokeWithMethodAndArg();
    }

    // Define the unified helper method that is used to implement .next,
    // .throw, and .return (see defineIteratorMethods).
    this._invoke = enqueue;
  }

  defineIteratorMethods(AsyncIterator.prototype);
  define(AsyncIterator.prototype, asyncIteratorSymbol, function () {
    return this;
  });
  exports.AsyncIterator = AsyncIterator;

  // Note that simple async functions are implemented on top of
  // AsyncIterator objects; they just return a Promise for the value of
  // the final result produced by the iterator.
  exports.async = function(innerFn, outerFn, self, tryLocsList, PromiseImpl) {
    if (PromiseImpl === void 0) PromiseImpl = Promise;

    var iter = new AsyncIterator(
      wrap(innerFn, outerFn, self, tryLocsList),
      PromiseImpl
    );

    return exports.isGeneratorFunction(outerFn)
      ? iter // If outerFn is a generator, return the full iterator.
      : iter.next().then(function(result) {
          return result.done ? result.value : iter.next();
        });
  };

  function makeInvokeMethod(innerFn, self, context) {
    var state = GenStateSuspendedStart;

    return function invoke(method, arg) {
      if (state === GenStateExecuting) {
        throw new Error("Generator is already running");
      }

      if (state === GenStateCompleted) {
        if (method === "throw") {
          throw arg;
        }

        // Be forgiving, per 25.3.3.3.3 of the spec:
        // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume
        return doneResult();
      }

      context.method = method;
      context.arg = arg;

      while (true) {
        var delegate = context.delegate;
        if (delegate) {
          var delegateResult = maybeInvokeDelegate(delegate, context);
          if (delegateResult) {
            if (delegateResult === ContinueSentinel) continue;
            return delegateResult;
          }
        }

        if (context.method === "next") {
          // Setting context._sent for legacy support of Babel's
          // function.sent implementation.
          context.sent = context._sent = context.arg;

        } else if (context.method === "throw") {
          if (state === GenStateSuspendedStart) {
            state = GenStateCompleted;
            throw context.arg;
          }

          context.dispatchException(context.arg);

        } else if (context.method === "return") {
          context.abrupt("return", context.arg);
        }

        state = GenStateExecuting;

        var record = tryCatch(innerFn, self, context);
        if (record.type === "normal") {
          // If an exception is thrown from innerFn, we leave state ===
          // GenStateExecuting and loop back for another invocation.
          state = context.done
            ? GenStateCompleted
            : GenStateSuspendedYield;

          if (record.arg === ContinueSentinel) {
            continue;
          }

          return {
            value: record.arg,
            done: context.done
          };

        } else if (record.type === "throw") {
          state = GenStateCompleted;
          // Dispatch the exception by looping back around to the
          // context.dispatchException(context.arg) call above.
          context.method = "throw";
          context.arg = record.arg;
        }
      }
    };
  }

  // Call delegate.iterator[context.method](context.arg) and handle the
  // result, either by returning a { value, done } result from the
  // delegate iterator, or by modifying context.method and context.arg,
  // setting context.delegate to null, and returning the ContinueSentinel.
  function maybeInvokeDelegate(delegate, context) {
    var method = delegate.iterator[context.method];
    if (method === undefined) {
      // A .throw or .return when the delegate iterator has no .throw
      // method always terminates the yield* loop.
      context.delegate = null;

      if (context.method === "throw") {
        // Note: ["return"] must be used for ES3 parsing compatibility.
        if (delegate.iterator["return"]) {
          // If the delegate iterator has a return method, give it a
          // chance to clean up.
          context.method = "return";
          context.arg = undefined;
          maybeInvokeDelegate(delegate, context);

          if (context.method === "throw") {
            // If maybeInvokeDelegate(context) changed context.method from
            // "return" to "throw", let that override the TypeError below.
            return ContinueSentinel;
          }
        }

        context.method = "throw";
        context.arg = new TypeError(
          "The iterator does not provide a 'throw' method");
      }

      return ContinueSentinel;
    }

    var record = tryCatch(method, delegate.iterator, context.arg);

    if (record.type === "throw") {
      context.method = "throw";
      context.arg = record.arg;
      context.delegate = null;
      return ContinueSentinel;
    }

    var info = record.arg;

    if (! info) {
      context.method = "throw";
      context.arg = new TypeError("iterator result is not an object");
      context.delegate = null;
      return ContinueSentinel;
    }

    if (info.done) {
      // Assign the result of the finished delegate to the temporary
      // variable specified by delegate.resultName (see delegateYield).
      context[delegate.resultName] = info.value;

      // Resume execution at the desired location (see delegateYield).
      context.next = delegate.nextLoc;

      // If context.method was "throw" but the delegate handled the
      // exception, let the outer generator proceed normally. If
      // context.method was "next", forget context.arg since it has been
      // "consumed" by the delegate iterator. If context.method was
      // "return", allow the original .return call to continue in the
      // outer generator.
      if (context.method !== "return") {
        context.method = "next";
        context.arg = undefined;
      }

    } else {
      // Re-yield the result returned by the delegate method.
      return info;
    }

    // The delegate iterator is finished, so forget it and continue with
    // the outer generator.
    context.delegate = null;
    return ContinueSentinel;
  }

  // Define Generator.prototype.{next,throw,return} in terms of the
  // unified ._invoke helper method.
  defineIteratorMethods(Gp);

  define(Gp, toStringTagSymbol, "Generator");

  // A Generator should always return itself as the iterator object when the
  // @@iterator function is called on it. Some browsers' implementations of the
  // iterator prototype chain incorrectly implement this, causing the Generator
  // object to not be returned from this call. This ensures that doesn't happen.
  // See https://github.com/facebook/regenerator/issues/274 for more details.
  define(Gp, iteratorSymbol, function() {
    return this;
  });

  define(Gp, "toString", function() {
    return "[object Generator]";
  });

  function pushTryEntry(locs) {
    var entry = { tryLoc: locs[0] };

    if (1 in locs) {
      entry.catchLoc = locs[1];
    }

    if (2 in locs) {
      entry.finallyLoc = locs[2];
      entry.afterLoc = locs[3];
    }

    this.tryEntries.push(entry);
  }

  function resetTryEntry(entry) {
    var record = entry.completion || {};
    record.type = "normal";
    delete record.arg;
    entry.completion = record;
  }

  function Context(tryLocsList) {
    // The root entry object (effectively a try statement without a catch
    // or a finally block) gives us a place to store values thrown from
    // locations where there is no enclosing try statement.
    this.tryEntries = [{ tryLoc: "root" }];
    tryLocsList.forEach(pushTryEntry, this);
    this.reset(true);
  }

  exports.keys = function(object) {
    var keys = [];
    for (var key in object) {
      keys.push(key);
    }
    keys.reverse();

    // Rather than returning an object with a next method, we keep
    // things simple and return the next function itself.
    return function next() {
      while (keys.length) {
        var key = keys.pop();
        if (key in object) {
          next.value = key;
          next.done = false;
          return next;
        }
      }

      // To avoid creating an additional object, we just hang the .value
      // and .done properties off the next function object itself. This
      // also ensures that the minifier will not anonymize the function.
      next.done = true;
      return next;
    };
  };

  function values(iterable) {
    if (iterable) {
      var iteratorMethod = iterable[iteratorSymbol];
      if (iteratorMethod) {
        return iteratorMethod.call(iterable);
      }

      if (typeof iterable.next === "function") {
        return iterable;
      }

      if (!isNaN(iterable.length)) {
        var i = -1, next = function next() {
          while (++i < iterable.length) {
            if (hasOwn.call(iterable, i)) {
              next.value = iterable[i];
              next.done = false;
              return next;
            }
          }

          next.value = undefined;
          next.done = true;

          return next;
        };

        return next.next = next;
      }
    }

    // Return an iterator with no values.
    return { next: doneResult };
  }
  exports.values = values;

  function doneResult() {
    return { value: undefined, done: true };
  }

  Context.prototype = {
    constructor: Context,

    reset: function(skipTempReset) {
      this.prev = 0;
      this.next = 0;
      // Resetting context._sent for legacy support of Babel's
      // function.sent implementation.
      this.sent = this._sent = undefined;
      this.done = false;
      this.delegate = null;

      this.method = "next";
      this.arg = undefined;

      this.tryEntries.forEach(resetTryEntry);

      if (!skipTempReset) {
        for (var name in this) {
          // Not sure about the optimal order of these conditions:
          if (name.charAt(0) === "t" &&
              hasOwn.call(this, name) &&
              !isNaN(+name.slice(1))) {
            this[name] = undefined;
          }
        }
      }
    },

    stop: function() {
      this.done = true;

      var rootEntry = this.tryEntries[0];
      var rootRecord = rootEntry.completion;
      if (rootRecord.type === "throw") {
        throw rootRecord.arg;
      }

      return this.rval;
    },

    dispatchException: function(exception) {
      if (this.done) {
        throw exception;
      }

      var context = this;
      function handle(loc, caught) {
        record.type = "throw";
        record.arg = exception;
        context.next = loc;

        if (caught) {
          // If the dispatched exception was caught by a catch block,
          // then let that catch block handle the exception normally.
          context.method = "next";
          context.arg = undefined;
        }

        return !! caught;
      }

      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        var record = entry.completion;

        if (entry.tryLoc === "root") {
          // Exception thrown outside of any try block that could handle
          // it, so set the completion value of the entire function to
          // throw the exception.
          return handle("end");
        }

        if (entry.tryLoc <= this.prev) {
          var hasCatch = hasOwn.call(entry, "catchLoc");
          var hasFinally = hasOwn.call(entry, "finallyLoc");

          if (hasCatch && hasFinally) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            } else if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else if (hasCatch) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            }

          } else if (hasFinally) {
            if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else {
            throw new Error("try statement without catch or finally");
          }
        }
      }
    },

    abrupt: function(type, arg) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc <= this.prev &&
            hasOwn.call(entry, "finallyLoc") &&
            this.prev < entry.finallyLoc) {
          var finallyEntry = entry;
          break;
        }
      }

      if (finallyEntry &&
          (type === "break" ||
           type === "continue") &&
          finallyEntry.tryLoc <= arg &&
          arg <= finallyEntry.finallyLoc) {
        // Ignore the finally entry if control is not jumping to a
        // location outside the try/catch block.
        finallyEntry = null;
      }

      var record = finallyEntry ? finallyEntry.completion : {};
      record.type = type;
      record.arg = arg;

      if (finallyEntry) {
        this.method = "next";
        this.next = finallyEntry.finallyLoc;
        return ContinueSentinel;
      }

      return this.complete(record);
    },

    complete: function(record, afterLoc) {
      if (record.type === "throw") {
        throw record.arg;
      }

      if (record.type === "break" ||
          record.type === "continue") {
        this.next = record.arg;
      } else if (record.type === "return") {
        this.rval = this.arg = record.arg;
        this.method = "return";
        this.next = "end";
      } else if (record.type === "normal" && afterLoc) {
        this.next = afterLoc;
      }

      return ContinueSentinel;
    },

    finish: function(finallyLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.finallyLoc === finallyLoc) {
          this.complete(entry.completion, entry.afterLoc);
          resetTryEntry(entry);
          return ContinueSentinel;
        }
      }
    },

    "catch": function(tryLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc === tryLoc) {
          var record = entry.completion;
          if (record.type === "throw") {
            var thrown = record.arg;
            resetTryEntry(entry);
          }
          return thrown;
        }
      }

      // The context.catch method must only be called with a location
      // argument that corresponds to a known catch block.
      throw new Error("illegal catch attempt");
    },

    delegateYield: function(iterable, resultName, nextLoc) {
      this.delegate = {
        iterator: values(iterable),
        resultName: resultName,
        nextLoc: nextLoc
      };

      if (this.method === "next") {
        // Deliberately forget the last sent value so that we don't
        // accidentally pass it on to the delegate.
        this.arg = undefined;
      }

      return ContinueSentinel;
    }
  };

  // Regardless of whether this script is executing as a CommonJS module
  // or not, return the runtime object so that we can declare the variable
  // regeneratorRuntime in the outer scope, which allows this module to be
  // injected easily by `bin/regenerator --include-runtime script.js`.
  return exports;

}(
  // If this script is executing as a CommonJS module, use module.exports
  // as the regeneratorRuntime namespace. Otherwise create a new empty
  // object. Either way, the resulting object will be used to initialize
  // the regeneratorRuntime variable at the top of this file.
   true ? module.exports : 0
));

try {
  regeneratorRuntime = runtime;
} catch (accidentalStrictMode) {
  // This module should not be running in strict mode, so the above
  // assignment should always work unless something is misconfigured. Just
  // in case runtime.js accidentally runs in strict mode, in modern engines
  // we can explicitly access globalThis. In older engines we can escape
  // strict mode using a global Function call. This could conceivably fail
  // if a Content Security Policy forbids using Function, but in that case
  // the proper solution is to fix the accidental strict mode problem. If
  // you've misconfigured your bundler to force strict mode and applied a
  // CSP to forbid Function, and you're not willing to fix either of those
  // problems, please detail your unique predicament in a GitHub issue.
  if (typeof globalThis === "object") {
    globalThis.regeneratorRuntime = runtime;
  } else {
    Function("r", "regeneratorRuntime = r")(runtime);
  }
}


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
(() => {
"use strict";
/*!************************!*\
  !*** ./src/content.js ***!
  \************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var regenerator_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! regenerator-runtime */ "./node_modules/regenerator-runtime/runtime.js");
/* harmony import */ var regenerator_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(regenerator_runtime__WEBPACK_IMPORTED_MODULE_0__);
 //*async function was creating "Error in event handler: ReferenceError: regeneratorRuntime is not defined" problem donno why, importing this shit fixed the problem donno why :)

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }


console.log('"Your browser has been hacked!!" - content.js of YouTube Playlist Duration Extension :)');
var myAPIKey = "AIzaSyAINYkozxfcG-0S5CfhSob0Tuw_coi_U9I";
var currURL;
var currDurationObject; //*______________________HELPER FUNCTIONS_______________________________________________________________________________________
//*get a duration object {years, months, weeks, days , hours , minuts, seconds} from ISO 8601 duration

function parseISO8601Duration(iso8601Duration) {
  var iso8601DurationRegex = /(-)?P(?:([.,\d]+)Y)?(?:([.,\d]+)M)?(?:([.,\d]+)W)?(?:([.,\d]+)D)?T(?:([.,\d]+)H)?(?:([.,\d]+)M)?(?:([.,\d]+)S)?/;
  var matches = iso8601Duration.match(iso8601DurationRegex);
  return {
    sign: matches[1] === undefined ? "+" : "-",
    years: matches[2] === undefined ? 0 : Number(matches[2]),
    months: matches[3] === undefined ? 0 : Number(matches[3]),
    weeks: matches[4] === undefined ? 0 : Number(matches[4]),
    days: matches[5] === undefined ? 0 : Number(matches[5]),
    hours: matches[6] === undefined ? 0 : Number(matches[6]),
    minutes: matches[7] === undefined ? 0 : Number(matches[7]),
    seconds: matches[8] === undefined ? 0 : Number(matches[8])
  };
} //*adds two durations and returns the result


function addDurations(duration1, duration2) {
  var totalYears = 0,
      totalMonths = 0,
      totalWeeks = 0,
      totalDays = 0,
      totalHours = 0,
      totalMinutes = 0,
      totalSeconds = 0;
  totalSeconds += (duration1.seconds + duration2.seconds) % 60;
  totalMinutes += Math.floor((duration1.seconds + duration2.seconds) / 60);
  totalMinutes += (duration1.minutes + duration2.minutes) % 60;
  totalHours += Math.floor((duration1.minutes + duration2.minutes) / 60);
  totalHours += (duration1.hours + duration2.hours) % 24;
  totalDays += Math.floor((duration1.hours + duration2.hours) / 24);
  totalDays += (duration1.days + duration2.days) % 7;
  totalWeeks += Math.floor((duration1.weeks + duration2.weeks) / 7);
  totalWeeks += duration1.weeks + duration2.weeks;
  totalMonths += duration1.months + duration2.months;

  if (totalDays > 30) {
    totalWeeks = Math.floor((totalDays - 30) / 7);
    totalMonths += 1;
  }

  totalYears += duration1.years + duration2.years;

  if (totalMonths > 12) {
    totalYears++;
    totalMonths = totalMonths - 12;
  }

  return {
    years: totalYears,
    months: totalMonths,
    weeks: totalWeeks,
    days: totalDays,
    hours: totalHours,
    minutes: totalMinutes,
    seconds: totalSeconds
  };
} //*check if the given url is valid youtube url or not


function isYoutTubeURLValid(url) {
  var regExp = /^(?:https?:\/\/)?(?:www\.)?youtube\.com(?:\S+)?$/;
  if (url.match(regExp) && url.match(regExp).length > 0) return true;else return false;
} //*get playlist id from youtube playlist url


function getPlaylistIDFromYouTubeURL(url) {
  // const reg = new RegExp("[&?]list=([a-z0-9_]+)", "i");
  var reg = new RegExp("[&?]list=([a-z0-9_-]+)", "i");
  var match = reg.exec(url);

  if (match && match[1].length > 0 && isYoutTubeURLValid(url)) {
    return match[1];
  } else {
    return null;
  }
} //*returns json (promise) after fetching


function fetchJSON(_x) {
  return _fetchJSON.apply(this, arguments);
} //*returns playlistContentDetails (promise) of pageToken(if not null) from playlist id


function _fetchJSON() {
  _fetchJSON = _asyncToGenerator( /*#__PURE__*/regenerator_runtime__WEBPACK_IMPORTED_MODULE_0___default().mark(function _callee(url) {
    var errorMessage,
        _args = arguments;
    return regenerator_runtime__WEBPACK_IMPORTED_MODULE_0___default().wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            errorMessage = _args.length > 1 && _args[1] !== undefined ? _args[1] : "responseNotOk";
            return _context.abrupt("return", fetch(url).then(function (response) {
              // console.log("response : ");
              // console.log(response);
              // console.log(response);
              if (response.ok) return response.json();else {
                if (response.status === 403) {
                  // console.log(`API key quota exceeded for key No : ${currAPIKeyIndex}`);
                  throw new Error("quotaExceeded");
                } else {
                  throw new Error(errorMessage);
                }
              }
            }));

          case 2:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));
  return _fetchJSON.apply(this, arguments);
}

function getPlaylistContentDetailsFromPlaylistID(_x2) {
  return _getPlaylistContentDetailsFromPlaylistID.apply(this, arguments);
} //*returns videoContentDetails (promise) from videoID


function _getPlaylistContentDetailsFromPlaylistID() {
  _getPlaylistContentDetailsFromPlaylistID = _asyncToGenerator( /*#__PURE__*/regenerator_runtime__WEBPACK_IMPORTED_MODULE_0___default().mark(function _callee2(playlistID) {
    var pageToken,
        url,
        data,
        _args2 = arguments;
    return regenerator_runtime__WEBPACK_IMPORTED_MODULE_0___default().wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            pageToken = _args2.length > 1 && _args2[1] !== undefined ? _args2[1] : null;
            if (!pageToken) url = "https://youtube.googleapis.com/youtube/v3/playlistItems?part=contentDetails&maxResults=50&playlistId=".concat(playlistID, "&key=").concat(myAPIKey);else url = "https://youtube.googleapis.com/youtube/v3/playlistItems?part=contentDetails&maxResults=50&pageToken=".concat(pageToken, "&playlistId=").concat(playlistID, "&key=").concat(myAPIKey);
            _context2.prev = 2;
            _context2.next = 5;
            return fetchJSON(url);

          case 5:
            data = _context2.sent;
            return _context2.abrupt("return", data);

          case 9:
            _context2.prev = 9;
            _context2.t0 = _context2["catch"](2);
            throw _context2.t0;

          case 12:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, null, [[2, 9]]);
  }));
  return _getPlaylistContentDetailsFromPlaylistID.apply(this, arguments);
}

function getVideoContentDetailsFromVideoID(_x3) {
  return _getVideoContentDetailsFromVideoID.apply(this, arguments);
}

function _getVideoContentDetailsFromVideoID() {
  _getVideoContentDetailsFromVideoID = _asyncToGenerator( /*#__PURE__*/regenerator_runtime__WEBPACK_IMPORTED_MODULE_0___default().mark(function _callee3(videoID) {
    var url, data;
    return regenerator_runtime__WEBPACK_IMPORTED_MODULE_0___default().wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            url = "https://youtube.googleapis.com/youtube/v3/videos?part=contentDetails&id=".concat(videoID, "&key=").concat(myAPIKey);
            _context3.prev = 1;
            _context3.next = 4;
            return fetchJSON(url);

          case 4:
            data = _context3.sent;
            return _context3.abrupt("return", data);

          case 8:
            _context3.prev = 8;
            _context3.t0 = _context3["catch"](1);
            throw _context3.t0;

          case 11:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3, null, [[1, 8]]);
  }));
  return _getVideoContentDetailsFromVideoID.apply(this, arguments);
}

function durationObjectToString(duration) {
  // debugger;
  var totalDuration = duration;
  var text = "";
  if (totalDuration.years) text += ", ".concat(totalDuration.years, " years");
  if (totalDuration.months) text += ", ".concat(totalDuration.months, " months"); // if (totalDuration.weeks) text += `, ${totalDuration.weeks} weeks`;

  if (totalDuration.days) text += ", ".concat(totalDuration.days, " days");
  if (totalDuration.hours) text += ", ".concat(totalDuration.hours, " hours");
  if (totalDuration.minutes) text += ", ".concat(totalDuration.minutes, " minutes");
  text += ", ".concat(totalDuration.seconds, " seconds"); //remove " ," from start

  text = text.substring(2);
  return text;
} //
//
//
//
//
//
//
///
//
//
//______________________          :)    ______________________________________________
//
//*returns an object {totalDuration, countTotalVid, countPublicVid} from valid youtube playlist ID


function getTotalDurationFromPlaylistID(_x4) {
  return _getTotalDurationFromPlaylistID.apply(this, arguments);
}

function _getTotalDurationFromPlaylistID() {
  _getTotalDurationFromPlaylistID = _asyncToGenerator( /*#__PURE__*/regenerator_runtime__WEBPACK_IMPORTED_MODULE_0___default().mark(function _callee4(playlistID) {
    var countTotalVid, countPublicVid, totalDuration, fetchingFirstPage, currPageToken, playlistContentDetail, promisesArr, i, videoID, videoDatas, _i, currDuration;

    return regenerator_runtime__WEBPACK_IMPORTED_MODULE_0___default().wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            if (playlistID) {
              _context4.next = 3;
              break;
            }

            console.log("Not a valid youtube playlist ID  :)");
            throw new Error("invalidPlaylistID");

          case 3:
            countTotalVid = 0;
            countPublicVid = 0;
            totalDuration = {
              years: 0,
              months: 0,
              weeks: 0,
              days: 0,
              hours: 0,
              minutes: 0,
              seconds: 0
            }; //*Youtube API sends data as a form of pages, with max 50 results per page, and also the nextPageToken is sent with the current page, so we have to traverse through all the pages to get all results

            fetchingFirstPage = true;
            currPageToken = null;

          case 8:
            if (!(fetchingFirstPage || currPageToken)) {
              _context4.next = 35;
              break;
            }

            fetchingFirstPage = false;
            _context4.prev = 10;
            _context4.next = 13;
            return getPlaylistContentDetailsFromPlaylistID(playlistID, currPageToken);

          case 13:
            playlistContentDetail = _context4.sent;
            //get all video content details (promisees) of this page
            promisesArr = [];

            for (i = 0; i < playlistContentDetail.items.length; i++) {
              videoID = playlistContentDetail.items[i].contentDetails.videoId; // console.log(videoID);

              promisesArr.push(getVideoContentDetailsFromVideoID(videoID));
            }

            _context4.prev = 16;
            _context4.next = 19;
            return Promise.all(promisesArr);

          case 19:
            videoDatas = _context4.sent;

            for (_i = 0; _i < videoDatas.length; _i++) {
              countTotalVid++; //*if the video is private , then it wont have any items

              if (videoDatas[_i].items.length) {
                countPublicVid++;
                currDuration = parseISO8601Duration(videoDatas[_i].items[0].contentDetails.duration);
                totalDuration = addDurations(totalDuration, currDuration);
              }
            }

            _context4.next = 26;
            break;

          case 23:
            _context4.prev = 23;
            _context4.t0 = _context4["catch"](16);
            throw _context4.t0;

          case 26:
            //*IMPORTANT : Go to next page____________________________________________________
            currPageToken = playlistContentDetail.nextPageToken; //*____________________________________________________________________
            //*____________________________________________________________________
            //*____________________________________________________________________

            _context4.next = 33;
            break;

          case 29:
            _context4.prev = 29;
            _context4.t1 = _context4["catch"](10);
            console.error("ERROR in fetching playlist page contentDetails: " + _context4.t1);
            throw _context4.t1;

          case 33:
            _context4.next = 8;
            break;

          case 35:
            return _context4.abrupt("return", {
              totalDuration: totalDuration,
              countTotalVid: countTotalVid,
              countPublicVid: countPublicVid
            });

          case 36:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4, null, [[10, 29], [16, 23]]);
  }));
  return _getTotalDurationFromPlaylistID.apply(this, arguments);
}

function getPlaylistDurationFromURL(_x5) {
  return _getPlaylistDurationFromURL.apply(this, arguments);
} //
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//*DESCRIPTION:___________________________________________________________________________
//*When the popup script sends message (request === "sendDurationPlz:)") asking for total duration of the current tab, this event is fired
//*the callback function returns an object ({status , data})
//*status : "done"   => means total duration of the playlist had been calculated through youtube API calls , and data is sent which is ({countPublicVid, countTotalVid , playlistID, totalDuration, totalDurationString})
//*status :  "alreadyComputed"    => means total duration ofor this URL had already been calculated previously,  so previous stored "data" is sent which is ({countPublicVid, countTotalVid , playlistID, totalDuration, totalDurationString})
//*status : "notValidYouTubePlaylistURL"   => means the current tab's URL is not a valid  youtube playlist URL
//*status : "quotaExceeded"   => means the current API key's quota for today has exceeded


function _getPlaylistDurationFromURL() {
  _getPlaylistDurationFromURL = _asyncToGenerator( /*#__PURE__*/regenerator_runtime__WEBPACK_IMPORTED_MODULE_0___default().mark(function _callee5(URL) {
    var playlistID, _yield$getTotalDurati, totalDuration, countTotalVid, countPublicVid;

    return regenerator_runtime__WEBPACK_IMPORTED_MODULE_0___default().wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            // console.log("inside getPlaylistDurationFromURL");
            //remove spaces from start and end
            URL = URL.trim();

            if (isYoutTubeURLValid(URL)) {
              _context5.next = 4;
              break;
            }

            // console.log("Error in getPlaylistDuration() : Not an YouTube URL");
            console.error("Error in getPlaylistDuration() : Not an YouTube URL :)"); // console.log(new Error("invalidURL").message);

            throw new Error("invalidURL");

          case 4:
            playlistID = getPlaylistIDFromYouTubeURL(URL);
            console.log("playlist ID " + playlistID);
            _context5.prev = 6;
            _context5.next = 9;
            return getTotalDurationFromPlaylistID(playlistID);

          case 9:
            _yield$getTotalDurati = _context5.sent;
            totalDuration = _yield$getTotalDurati.totalDuration;
            countTotalVid = _yield$getTotalDurati.countTotalVid;
            countPublicVid = _yield$getTotalDurati.countPublicVid;
            console.log("From Content Script : Total Duration Object : ");
            console.log(totalDuration); // const totalDurationString = durationObjectToString(totalDuration);
            // console.log("total duration : " + totalDurationString);
            // console.log("Total videos : " + countTotalVid);
            // console.log(`Total Public videos : ${countPublicVid}`);

            return _context5.abrupt("return", {
              playlistID: playlistID,
              totalDuration: totalDuration,
              countTotalVid: countTotalVid,
              countPublicVid: countPublicVid
            });

          case 18:
            _context5.prev = 18;
            _context5.t0 = _context5["catch"](6);
            console.error("ERROR in getPlaylistDuration(): " + _context5.t0);
            throw _context5.t0;

          case 22:
          case "end":
            return _context5.stop();
        }
      }
    }, _callee5, null, [[6, 18]]);
  }));
  return _getPlaylistDurationFromURL.apply(this, arguments);
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  // console.log("Message recieved in content script");
  //*if message is sent from extension, not from any tab
  if (!sender.tab) {
    // console.log("message from extension  : " + request);
    var messageToBeSent = {
      status: "none"
    };

    if (request === "sendDurationPlz:)") {
      var currTabURL = location.href;
      console.log("currTabURL in content script : " + currTabURL);

      if (!currTabURL || !isYoutTubeURLValid(currTabURL)) {
        console.log("NOT an YouTube URL");
        messageToBeSent = {
          status: "notValidYouTubePlaylistURL"
        };
        sendResponse(messageToBeSent);
        return;
      } else if (currTabURL && currTabURL === currURL) {
        console.log("Already computed duration for this URL   :)");
        messageToBeSent = {
          status: "alreadyComputed",
          data: currDurationObject
        };
        sendResponse(messageToBeSent);
        return;
      } //* else : Display playlist Duration
      else {
        currURL = currTabURL; //*await inside try catch was not working , but .then.catch worked dunno why :) , so using .then.catch ezz

        getPlaylistDurationFromURL(currURL).then(function (data) {
          currDurationObject = data;
          currDurationObject["totalDurationString"] = durationObjectToString(currDurationObject.totalDuration);
          messageToBeSent = {
            status: "done",
            data: currDurationObject
          };
          sendResponse(messageToBeSent);
        })["catch"](function (error) {
          console.error("ERROR in updateResult(): " + error);

          if (error.message === "quotaExceeded") {
            console.log("API key's quota exceeded");
            messageToBeSent = {
              status: "quotaExceeded"
            };
            sendResponse(messageToBeSent);
            return;
          } else if (error.message === "invalidURL") {
            messageToBeSent = {
              status: "notValidYouTubePlaylistURL"
            };
            sendResponse(messageToBeSent);
            return;
          } else {
            console.log("something worng , Error : ");
            console.error(error);
            messageToBeSent = {
              status: "notValidYouTubePlaylistURL"
            };
            sendResponse(messageToBeSent);
            return;
          }
        });
      }
    }
  }

  return true;
});
})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udGVudC5qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYixJQUFJO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGVBQWU7QUFDZixNQUFNO0FBQ04sZUFBZTtBQUNmO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHOztBQUVIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwwREFBMEQ7QUFDMUQ7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUCxLQUFLO0FBQ0w7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBUTtBQUNSO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0EsV0FBVztBQUNYOztBQUVBO0FBQ0E7QUFDQSx3Q0FBd0MsV0FBVztBQUNuRDtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7O0FBRUE7QUFDQSw0QkFBNEI7QUFDNUI7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsVUFBVTtBQUNWO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBLFVBQVU7QUFDVjtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxVQUFVO0FBQ1Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EscUNBQXFDLGNBQWM7QUFDbkQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxNQUFNO0FBQ047QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsaUNBQWlDLG1CQUFtQjtBQUNwRDtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRzs7QUFFSDtBQUNBO0FBQ0EsR0FBRzs7QUFFSDtBQUNBLGtCQUFrQjs7QUFFbEI7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EseUJBQXlCLGdCQUFnQjtBQUN6QztBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLGFBQWE7QUFDYjtBQUNBOztBQUVBO0FBQ0EsYUFBYTtBQUNiOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSzs7QUFFTDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxLQUFLOztBQUVMO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUEsK0NBQStDLFFBQVE7QUFDdkQ7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLGNBQWM7QUFDZDtBQUNBOztBQUVBLFlBQVk7QUFDWjtBQUNBO0FBQ0E7O0FBRUEsWUFBWTtBQUNaO0FBQ0E7QUFDQTs7QUFFQSxZQUFZO0FBQ1o7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLOztBQUVMO0FBQ0EsK0NBQStDLFFBQVE7QUFDdkQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxLQUFLOztBQUVMO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFFBQVE7QUFDUjtBQUNBO0FBQ0E7QUFDQSxRQUFRO0FBQ1I7QUFDQTs7QUFFQTtBQUNBLEtBQUs7O0FBRUw7QUFDQSwrQ0FBK0MsUUFBUTtBQUN2RDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7O0FBRUw7QUFDQSwrQ0FBK0MsUUFBUTtBQUN2RDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxLQUFLOztBQUVMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLENBQUM7QUFDRDtBQUNB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R0FBRztBQUNkMUMsY0FBQUEsTUFBTSxFQUFFO0FBRE0sYUFBbEI7QUFHQXdDLFlBQUFBLFlBQVksQ0FBQ0UsZUFBRCxDQUFaO0FBQ0E7QUFDSCxXQU5NLE1BTUE7QUFDSHpGLFlBQUFBLE9BQU8sQ0FBQ0MsR0FBUixDQUFZLDRCQUFaO0FBQ0FELFlBQUFBLE9BQU8sQ0FBQzZFLEtBQVIsQ0FBY0EsS0FBZDtBQUNBWSxZQUFBQSxlQUFlLEdBQUc7QUFDZDFDLGNBQUFBLE1BQU0sRUFBRTtBQURNLGFBQWxCO0FBR0F3QyxZQUFBQSxZQUFZLENBQUNFLGVBQUQsQ0FBWjtBQUNBO0FBQ0g7QUFDSixTQXRDTDtBQXVDSDtBQUNKO0FBQ0o7O0FBRUQsU0FBTyxJQUFQO0FBQ0gsQ0EvRUQsRSIsInNvdXJjZXMiOlsid2VicGFjazovL3JlYWN0LWNocm9tZS1leHRlbnNpb24vLi9ub2RlX21vZHVsZXMvcmVnZW5lcmF0b3ItcnVudGltZS9ydW50aW1lLmpzIiwid2VicGFjazovL3JlYWN0LWNocm9tZS1leHRlbnNpb24vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vcmVhY3QtY2hyb21lLWV4dGVuc2lvbi93ZWJwYWNrL3J1bnRpbWUvY29tcGF0IGdldCBkZWZhdWx0IGV4cG9ydCIsIndlYnBhY2s6Ly9yZWFjdC1jaHJvbWUtZXh0ZW5zaW9uL3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly9yZWFjdC1jaHJvbWUtZXh0ZW5zaW9uL3dlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJ3ZWJwYWNrOi8vcmVhY3QtY2hyb21lLWV4dGVuc2lvbi93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovL3JlYWN0LWNocm9tZS1leHRlbnNpb24vLi9zcmMvY29udGVudC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAoYykgMjAxNC1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlIGZvdW5kIGluIHRoZVxuICogTElDRU5TRSBmaWxlIGluIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbnZhciBydW50aW1lID0gKGZ1bmN0aW9uIChleHBvcnRzKSB7XG4gIFwidXNlIHN0cmljdFwiO1xuXG4gIHZhciBPcCA9IE9iamVjdC5wcm90b3R5cGU7XG4gIHZhciBoYXNPd24gPSBPcC5oYXNPd25Qcm9wZXJ0eTtcbiAgdmFyIHVuZGVmaW5lZDsgLy8gTW9yZSBjb21wcmVzc2libGUgdGhhbiB2b2lkIDAuXG4gIHZhciAkU3ltYm9sID0gdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiID8gU3ltYm9sIDoge307XG4gIHZhciBpdGVyYXRvclN5bWJvbCA9ICRTeW1ib2wuaXRlcmF0b3IgfHwgXCJAQGl0ZXJhdG9yXCI7XG4gIHZhciBhc3luY0l0ZXJhdG9yU3ltYm9sID0gJFN5bWJvbC5hc3luY0l0ZXJhdG9yIHx8IFwiQEBhc3luY0l0ZXJhdG9yXCI7XG4gIHZhciB0b1N0cmluZ1RhZ1N5bWJvbCA9ICRTeW1ib2wudG9TdHJpbmdUYWcgfHwgXCJAQHRvU3RyaW5nVGFnXCI7XG5cbiAgZnVuY3Rpb24gZGVmaW5lKG9iaiwga2V5LCB2YWx1ZSkge1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvYmosIGtleSwge1xuICAgICAgdmFsdWU6IHZhbHVlLFxuICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgIHdyaXRhYmxlOiB0cnVlXG4gICAgfSk7XG4gICAgcmV0dXJuIG9ialtrZXldO1xuICB9XG4gIHRyeSB7XG4gICAgLy8gSUUgOCBoYXMgYSBicm9rZW4gT2JqZWN0LmRlZmluZVByb3BlcnR5IHRoYXQgb25seSB3b3JrcyBvbiBET00gb2JqZWN0cy5cbiAgICBkZWZpbmUoe30sIFwiXCIpO1xuICB9IGNhdGNoIChlcnIpIHtcbiAgICBkZWZpbmUgPSBmdW5jdGlvbihvYmosIGtleSwgdmFsdWUpIHtcbiAgICAgIHJldHVybiBvYmpba2V5XSA9IHZhbHVlO1xuICAgIH07XG4gIH1cblxuICBmdW5jdGlvbiB3cmFwKGlubmVyRm4sIG91dGVyRm4sIHNlbGYsIHRyeUxvY3NMaXN0KSB7XG4gICAgLy8gSWYgb3V0ZXJGbiBwcm92aWRlZCBhbmQgb3V0ZXJGbi5wcm90b3R5cGUgaXMgYSBHZW5lcmF0b3IsIHRoZW4gb3V0ZXJGbi5wcm90b3R5cGUgaW5zdGFuY2VvZiBHZW5lcmF0b3IuXG4gICAgdmFyIHByb3RvR2VuZXJhdG9yID0gb3V0ZXJGbiAmJiBvdXRlckZuLnByb3RvdHlwZSBpbnN0YW5jZW9mIEdlbmVyYXRvciA/IG91dGVyRm4gOiBHZW5lcmF0b3I7XG4gICAgdmFyIGdlbmVyYXRvciA9IE9iamVjdC5jcmVhdGUocHJvdG9HZW5lcmF0b3IucHJvdG90eXBlKTtcbiAgICB2YXIgY29udGV4dCA9IG5ldyBDb250ZXh0KHRyeUxvY3NMaXN0IHx8IFtdKTtcblxuICAgIC8vIFRoZSAuX2ludm9rZSBtZXRob2QgdW5pZmllcyB0aGUgaW1wbGVtZW50YXRpb25zIG9mIHRoZSAubmV4dCxcbiAgICAvLyAudGhyb3csIGFuZCAucmV0dXJuIG1ldGhvZHMuXG4gICAgZ2VuZXJhdG9yLl9pbnZva2UgPSBtYWtlSW52b2tlTWV0aG9kKGlubmVyRm4sIHNlbGYsIGNvbnRleHQpO1xuXG4gICAgcmV0dXJuIGdlbmVyYXRvcjtcbiAgfVxuICBleHBvcnRzLndyYXAgPSB3cmFwO1xuXG4gIC8vIFRyeS9jYXRjaCBoZWxwZXIgdG8gbWluaW1pemUgZGVvcHRpbWl6YXRpb25zLiBSZXR1cm5zIGEgY29tcGxldGlvblxuICAvLyByZWNvcmQgbGlrZSBjb250ZXh0LnRyeUVudHJpZXNbaV0uY29tcGxldGlvbi4gVGhpcyBpbnRlcmZhY2UgY291bGRcbiAgLy8gaGF2ZSBiZWVuIChhbmQgd2FzIHByZXZpb3VzbHkpIGRlc2lnbmVkIHRvIHRha2UgYSBjbG9zdXJlIHRvIGJlXG4gIC8vIGludm9rZWQgd2l0aG91dCBhcmd1bWVudHMsIGJ1dCBpbiBhbGwgdGhlIGNhc2VzIHdlIGNhcmUgYWJvdXQgd2VcbiAgLy8gYWxyZWFkeSBoYXZlIGFuIGV4aXN0aW5nIG1ldGhvZCB3ZSB3YW50IHRvIGNhbGwsIHNvIHRoZXJlJ3Mgbm8gbmVlZFxuICAvLyB0byBjcmVhdGUgYSBuZXcgZnVuY3Rpb24gb2JqZWN0LiBXZSBjYW4gZXZlbiBnZXQgYXdheSB3aXRoIGFzc3VtaW5nXG4gIC8vIHRoZSBtZXRob2QgdGFrZXMgZXhhY3RseSBvbmUgYXJndW1lbnQsIHNpbmNlIHRoYXQgaGFwcGVucyB0byBiZSB0cnVlXG4gIC8vIGluIGV2ZXJ5IGNhc2UsIHNvIHdlIGRvbid0IGhhdmUgdG8gdG91Y2ggdGhlIGFyZ3VtZW50cyBvYmplY3QuIFRoZVxuICAvLyBvbmx5IGFkZGl0aW9uYWwgYWxsb2NhdGlvbiByZXF1aXJlZCBpcyB0aGUgY29tcGxldGlvbiByZWNvcmQsIHdoaWNoXG4gIC8vIGhhcyBhIHN0YWJsZSBzaGFwZSBhbmQgc28gaG9wZWZ1bGx5IHNob3VsZCBiZSBjaGVhcCB0byBhbGxvY2F0ZS5cbiAgZnVuY3Rpb24gdHJ5Q2F0Y2goZm4sIG9iaiwgYXJnKSB7XG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiB7IHR5cGU6IFwibm9ybWFsXCIsIGFyZzogZm4uY2FsbChvYmosIGFyZykgfTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIHJldHVybiB7IHR5cGU6IFwidGhyb3dcIiwgYXJnOiBlcnIgfTtcbiAgICB9XG4gIH1cblxuICB2YXIgR2VuU3RhdGVTdXNwZW5kZWRTdGFydCA9IFwic3VzcGVuZGVkU3RhcnRcIjtcbiAgdmFyIEdlblN0YXRlU3VzcGVuZGVkWWllbGQgPSBcInN1c3BlbmRlZFlpZWxkXCI7XG4gIHZhciBHZW5TdGF0ZUV4ZWN1dGluZyA9IFwiZXhlY3V0aW5nXCI7XG4gIHZhciBHZW5TdGF0ZUNvbXBsZXRlZCA9IFwiY29tcGxldGVkXCI7XG5cbiAgLy8gUmV0dXJuaW5nIHRoaXMgb2JqZWN0IGZyb20gdGhlIGlubmVyRm4gaGFzIHRoZSBzYW1lIGVmZmVjdCBhc1xuICAvLyBicmVha2luZyBvdXQgb2YgdGhlIGRpc3BhdGNoIHN3aXRjaCBzdGF0ZW1lbnQuXG4gIHZhciBDb250aW51ZVNlbnRpbmVsID0ge307XG5cbiAgLy8gRHVtbXkgY29uc3RydWN0b3IgZnVuY3Rpb25zIHRoYXQgd2UgdXNlIGFzIHRoZSAuY29uc3RydWN0b3IgYW5kXG4gIC8vIC5jb25zdHJ1Y3Rvci5wcm90b3R5cGUgcHJvcGVydGllcyBmb3IgZnVuY3Rpb25zIHRoYXQgcmV0dXJuIEdlbmVyYXRvclxuICAvLyBvYmplY3RzLiBGb3IgZnVsbCBzcGVjIGNvbXBsaWFuY2UsIHlvdSBtYXkgd2lzaCB0byBjb25maWd1cmUgeW91clxuICAvLyBtaW5pZmllciBub3QgdG8gbWFuZ2xlIHRoZSBuYW1lcyBvZiB0aGVzZSB0d28gZnVuY3Rpb25zLlxuICBmdW5jdGlvbiBHZW5lcmF0b3IoKSB7fVxuICBmdW5jdGlvbiBHZW5lcmF0b3JGdW5jdGlvbigpIHt9XG4gIGZ1bmN0aW9uIEdlbmVyYXRvckZ1bmN0aW9uUHJvdG90eXBlKCkge31cblxuICAvLyBUaGlzIGlzIGEgcG9seWZpbGwgZm9yICVJdGVyYXRvclByb3RvdHlwZSUgZm9yIGVudmlyb25tZW50cyB0aGF0XG4gIC8vIGRvbid0IG5hdGl2ZWx5IHN1cHBvcnQgaXQuXG4gIHZhciBJdGVyYXRvclByb3RvdHlwZSA9IHt9O1xuICBkZWZpbmUoSXRlcmF0b3JQcm90b3R5cGUsIGl0ZXJhdG9yU3ltYm9sLCBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH0pO1xuXG4gIHZhciBnZXRQcm90byA9IE9iamVjdC5nZXRQcm90b3R5cGVPZjtcbiAgdmFyIE5hdGl2ZUl0ZXJhdG9yUHJvdG90eXBlID0gZ2V0UHJvdG8gJiYgZ2V0UHJvdG8oZ2V0UHJvdG8odmFsdWVzKFtdKSkpO1xuICBpZiAoTmF0aXZlSXRlcmF0b3JQcm90b3R5cGUgJiZcbiAgICAgIE5hdGl2ZUl0ZXJhdG9yUHJvdG90eXBlICE9PSBPcCAmJlxuICAgICAgaGFzT3duLmNhbGwoTmF0aXZlSXRlcmF0b3JQcm90b3R5cGUsIGl0ZXJhdG9yU3ltYm9sKSkge1xuICAgIC8vIFRoaXMgZW52aXJvbm1lbnQgaGFzIGEgbmF0aXZlICVJdGVyYXRvclByb3RvdHlwZSU7IHVzZSBpdCBpbnN0ZWFkXG4gICAgLy8gb2YgdGhlIHBvbHlmaWxsLlxuICAgIEl0ZXJhdG9yUHJvdG90eXBlID0gTmF0aXZlSXRlcmF0b3JQcm90b3R5cGU7XG4gIH1cblxuICB2YXIgR3AgPSBHZW5lcmF0b3JGdW5jdGlvblByb3RvdHlwZS5wcm90b3R5cGUgPVxuICAgIEdlbmVyYXRvci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEl0ZXJhdG9yUHJvdG90eXBlKTtcbiAgR2VuZXJhdG9yRnVuY3Rpb24ucHJvdG90eXBlID0gR2VuZXJhdG9yRnVuY3Rpb25Qcm90b3R5cGU7XG4gIGRlZmluZShHcCwgXCJjb25zdHJ1Y3RvclwiLCBHZW5lcmF0b3JGdW5jdGlvblByb3RvdHlwZSk7XG4gIGRlZmluZShHZW5lcmF0b3JGdW5jdGlvblByb3RvdHlwZSwgXCJjb25zdHJ1Y3RvclwiLCBHZW5lcmF0b3JGdW5jdGlvbik7XG4gIEdlbmVyYXRvckZ1bmN0aW9uLmRpc3BsYXlOYW1lID0gZGVmaW5lKFxuICAgIEdlbmVyYXRvckZ1bmN0aW9uUHJvdG90eXBlLFxuICAgIHRvU3RyaW5nVGFnU3ltYm9sLFxuICAgIFwiR2VuZXJhdG9yRnVuY3Rpb25cIlxuICApO1xuXG4gIC8vIEhlbHBlciBmb3IgZGVmaW5pbmcgdGhlIC5uZXh0LCAudGhyb3csIGFuZCAucmV0dXJuIG1ldGhvZHMgb2YgdGhlXG4gIC8vIEl0ZXJhdG9yIGludGVyZmFjZSBpbiB0ZXJtcyBvZiBhIHNpbmdsZSAuX2ludm9rZSBtZXRob2QuXG4gIGZ1bmN0aW9uIGRlZmluZUl0ZXJhdG9yTWV0aG9kcyhwcm90b3R5cGUpIHtcbiAgICBbXCJuZXh0XCIsIFwidGhyb3dcIiwgXCJyZXR1cm5cIl0uZm9yRWFjaChmdW5jdGlvbihtZXRob2QpIHtcbiAgICAgIGRlZmluZShwcm90b3R5cGUsIG1ldGhvZCwgZnVuY3Rpb24oYXJnKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9pbnZva2UobWV0aG9kLCBhcmcpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICBleHBvcnRzLmlzR2VuZXJhdG9yRnVuY3Rpb24gPSBmdW5jdGlvbihnZW5GdW4pIHtcbiAgICB2YXIgY3RvciA9IHR5cGVvZiBnZW5GdW4gPT09IFwiZnVuY3Rpb25cIiAmJiBnZW5GdW4uY29uc3RydWN0b3I7XG4gICAgcmV0dXJuIGN0b3JcbiAgICAgID8gY3RvciA9PT0gR2VuZXJhdG9yRnVuY3Rpb24gfHxcbiAgICAgICAgLy8gRm9yIHRoZSBuYXRpdmUgR2VuZXJhdG9yRnVuY3Rpb24gY29uc3RydWN0b3IsIHRoZSBiZXN0IHdlIGNhblxuICAgICAgICAvLyBkbyBpcyB0byBjaGVjayBpdHMgLm5hbWUgcHJvcGVydHkuXG4gICAgICAgIChjdG9yLmRpc3BsYXlOYW1lIHx8IGN0b3IubmFtZSkgPT09IFwiR2VuZXJhdG9yRnVuY3Rpb25cIlxuICAgICAgOiBmYWxzZTtcbiAgfTtcblxuICBleHBvcnRzLm1hcmsgPSBmdW5jdGlvbihnZW5GdW4pIHtcbiAgICBpZiAoT2JqZWN0LnNldFByb3RvdHlwZU9mKSB7XG4gICAgICBPYmplY3Quc2V0UHJvdG90eXBlT2YoZ2VuRnVuLCBHZW5lcmF0b3JGdW5jdGlvblByb3RvdHlwZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGdlbkZ1bi5fX3Byb3RvX18gPSBHZW5lcmF0b3JGdW5jdGlvblByb3RvdHlwZTtcbiAgICAgIGRlZmluZShnZW5GdW4sIHRvU3RyaW5nVGFnU3ltYm9sLCBcIkdlbmVyYXRvckZ1bmN0aW9uXCIpO1xuICAgIH1cbiAgICBnZW5GdW4ucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShHcCk7XG4gICAgcmV0dXJuIGdlbkZ1bjtcbiAgfTtcblxuICAvLyBXaXRoaW4gdGhlIGJvZHkgb2YgYW55IGFzeW5jIGZ1bmN0aW9uLCBgYXdhaXQgeGAgaXMgdHJhbnNmb3JtZWQgdG9cbiAgLy8gYHlpZWxkIHJlZ2VuZXJhdG9yUnVudGltZS5hd3JhcCh4KWAsIHNvIHRoYXQgdGhlIHJ1bnRpbWUgY2FuIHRlc3RcbiAgLy8gYGhhc093bi5jYWxsKHZhbHVlLCBcIl9fYXdhaXRcIilgIHRvIGRldGVybWluZSBpZiB0aGUgeWllbGRlZCB2YWx1ZSBpc1xuICAvLyBtZWFudCB0byBiZSBhd2FpdGVkLlxuICBleHBvcnRzLmF3cmFwID0gZnVuY3Rpb24oYXJnKSB7XG4gICAgcmV0dXJuIHsgX19hd2FpdDogYXJnIH07XG4gIH07XG5cbiAgZnVuY3Rpb24gQXN5bmNJdGVyYXRvcihnZW5lcmF0b3IsIFByb21pc2VJbXBsKSB7XG4gICAgZnVuY3Rpb24gaW52b2tlKG1ldGhvZCwgYXJnLCByZXNvbHZlLCByZWplY3QpIHtcbiAgICAgIHZhciByZWNvcmQgPSB0cnlDYXRjaChnZW5lcmF0b3JbbWV0aG9kXSwgZ2VuZXJhdG9yLCBhcmcpO1xuICAgICAgaWYgKHJlY29yZC50eXBlID09PSBcInRocm93XCIpIHtcbiAgICAgICAgcmVqZWN0KHJlY29yZC5hcmcpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIHJlc3VsdCA9IHJlY29yZC5hcmc7XG4gICAgICAgIHZhciB2YWx1ZSA9IHJlc3VsdC52YWx1ZTtcbiAgICAgICAgaWYgKHZhbHVlICYmXG4gICAgICAgICAgICB0eXBlb2YgdmFsdWUgPT09IFwib2JqZWN0XCIgJiZcbiAgICAgICAgICAgIGhhc093bi5jYWxsKHZhbHVlLCBcIl9fYXdhaXRcIikpIHtcbiAgICAgICAgICByZXR1cm4gUHJvbWlzZUltcGwucmVzb2x2ZSh2YWx1ZS5fX2F3YWl0KS50aGVuKGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgICAgICBpbnZva2UoXCJuZXh0XCIsIHZhbHVlLCByZXNvbHZlLCByZWplY3QpO1xuICAgICAgICAgIH0sIGZ1bmN0aW9uKGVycikge1xuICAgICAgICAgICAgaW52b2tlKFwidGhyb3dcIiwgZXJyLCByZXNvbHZlLCByZWplY3QpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIFByb21pc2VJbXBsLnJlc29sdmUodmFsdWUpLnRoZW4oZnVuY3Rpb24odW53cmFwcGVkKSB7XG4gICAgICAgICAgLy8gV2hlbiBhIHlpZWxkZWQgUHJvbWlzZSBpcyByZXNvbHZlZCwgaXRzIGZpbmFsIHZhbHVlIGJlY29tZXNcbiAgICAgICAgICAvLyB0aGUgLnZhbHVlIG9mIHRoZSBQcm9taXNlPHt2YWx1ZSxkb25lfT4gcmVzdWx0IGZvciB0aGVcbiAgICAgICAgICAvLyBjdXJyZW50IGl0ZXJhdGlvbi5cbiAgICAgICAgICByZXN1bHQudmFsdWUgPSB1bndyYXBwZWQ7XG4gICAgICAgICAgcmVzb2x2ZShyZXN1bHQpO1xuICAgICAgICB9LCBmdW5jdGlvbihlcnJvcikge1xuICAgICAgICAgIC8vIElmIGEgcmVqZWN0ZWQgUHJvbWlzZSB3YXMgeWllbGRlZCwgdGhyb3cgdGhlIHJlamVjdGlvbiBiYWNrXG4gICAgICAgICAgLy8gaW50byB0aGUgYXN5bmMgZ2VuZXJhdG9yIGZ1bmN0aW9uIHNvIGl0IGNhbiBiZSBoYW5kbGVkIHRoZXJlLlxuICAgICAgICAgIHJldHVybiBpbnZva2UoXCJ0aHJvd1wiLCBlcnJvciwgcmVzb2x2ZSwgcmVqZWN0KTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdmFyIHByZXZpb3VzUHJvbWlzZTtcblxuICAgIGZ1bmN0aW9uIGVucXVldWUobWV0aG9kLCBhcmcpIHtcbiAgICAgIGZ1bmN0aW9uIGNhbGxJbnZva2VXaXRoTWV0aG9kQW5kQXJnKCkge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2VJbXBsKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICAgIGludm9rZShtZXRob2QsIGFyZywgcmVzb2x2ZSwgcmVqZWN0KTtcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBwcmV2aW91c1Byb21pc2UgPVxuICAgICAgICAvLyBJZiBlbnF1ZXVlIGhhcyBiZWVuIGNhbGxlZCBiZWZvcmUsIHRoZW4gd2Ugd2FudCB0byB3YWl0IHVudGlsXG4gICAgICAgIC8vIGFsbCBwcmV2aW91cyBQcm9taXNlcyBoYXZlIGJlZW4gcmVzb2x2ZWQgYmVmb3JlIGNhbGxpbmcgaW52b2tlLFxuICAgICAgICAvLyBzbyB0aGF0IHJlc3VsdHMgYXJlIGFsd2F5cyBkZWxpdmVyZWQgaW4gdGhlIGNvcnJlY3Qgb3JkZXIuIElmXG4gICAgICAgIC8vIGVucXVldWUgaGFzIG5vdCBiZWVuIGNhbGxlZCBiZWZvcmUsIHRoZW4gaXQgaXMgaW1wb3J0YW50IHRvXG4gICAgICAgIC8vIGNhbGwgaW52b2tlIGltbWVkaWF0ZWx5LCB3aXRob3V0IHdhaXRpbmcgb24gYSBjYWxsYmFjayB0byBmaXJlLFxuICAgICAgICAvLyBzbyB0aGF0IHRoZSBhc3luYyBnZW5lcmF0b3IgZnVuY3Rpb24gaGFzIHRoZSBvcHBvcnR1bml0eSB0byBkb1xuICAgICAgICAvLyBhbnkgbmVjZXNzYXJ5IHNldHVwIGluIGEgcHJlZGljdGFibGUgd2F5LiBUaGlzIHByZWRpY3RhYmlsaXR5XG4gICAgICAgIC8vIGlzIHdoeSB0aGUgUHJvbWlzZSBjb25zdHJ1Y3RvciBzeW5jaHJvbm91c2x5IGludm9rZXMgaXRzXG4gICAgICAgIC8vIGV4ZWN1dG9yIGNhbGxiYWNrLCBhbmQgd2h5IGFzeW5jIGZ1bmN0aW9ucyBzeW5jaHJvbm91c2x5XG4gICAgICAgIC8vIGV4ZWN1dGUgY29kZSBiZWZvcmUgdGhlIGZpcnN0IGF3YWl0LiBTaW5jZSB3ZSBpbXBsZW1lbnQgc2ltcGxlXG4gICAgICAgIC8vIGFzeW5jIGZ1bmN0aW9ucyBpbiB0ZXJtcyBvZiBhc3luYyBnZW5lcmF0b3JzLCBpdCBpcyBlc3BlY2lhbGx5XG4gICAgICAgIC8vIGltcG9ydGFudCB0byBnZXQgdGhpcyByaWdodCwgZXZlbiB0aG91Z2ggaXQgcmVxdWlyZXMgY2FyZS5cbiAgICAgICAgcHJldmlvdXNQcm9taXNlID8gcHJldmlvdXNQcm9taXNlLnRoZW4oXG4gICAgICAgICAgY2FsbEludm9rZVdpdGhNZXRob2RBbmRBcmcsXG4gICAgICAgICAgLy8gQXZvaWQgcHJvcGFnYXRpbmcgZmFpbHVyZXMgdG8gUHJvbWlzZXMgcmV0dXJuZWQgYnkgbGF0ZXJcbiAgICAgICAgICAvLyBpbnZvY2F0aW9ucyBvZiB0aGUgaXRlcmF0b3IuXG4gICAgICAgICAgY2FsbEludm9rZVdpdGhNZXRob2RBbmRBcmdcbiAgICAgICAgKSA6IGNhbGxJbnZva2VXaXRoTWV0aG9kQW5kQXJnKCk7XG4gICAgfVxuXG4gICAgLy8gRGVmaW5lIHRoZSB1bmlmaWVkIGhlbHBlciBtZXRob2QgdGhhdCBpcyB1c2VkIHRvIGltcGxlbWVudCAubmV4dCxcbiAgICAvLyAudGhyb3csIGFuZCAucmV0dXJuIChzZWUgZGVmaW5lSXRlcmF0b3JNZXRob2RzKS5cbiAgICB0aGlzLl9pbnZva2UgPSBlbnF1ZXVlO1xuICB9XG5cbiAgZGVmaW5lSXRlcmF0b3JNZXRob2RzKEFzeW5jSXRlcmF0b3IucHJvdG90eXBlKTtcbiAgZGVmaW5lKEFzeW5jSXRlcmF0b3IucHJvdG90eXBlLCBhc3luY0l0ZXJhdG9yU3ltYm9sLCBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH0pO1xuICBleHBvcnRzLkFzeW5jSXRlcmF0b3IgPSBBc3luY0l0ZXJhdG9yO1xuXG4gIC8vIE5vdGUgdGhhdCBzaW1wbGUgYXN5bmMgZnVuY3Rpb25zIGFyZSBpbXBsZW1lbnRlZCBvbiB0b3Agb2ZcbiAgLy8gQXN5bmNJdGVyYXRvciBvYmplY3RzOyB0aGV5IGp1c3QgcmV0dXJuIGEgUHJvbWlzZSBmb3IgdGhlIHZhbHVlIG9mXG4gIC8vIHRoZSBmaW5hbCByZXN1bHQgcHJvZHVjZWQgYnkgdGhlIGl0ZXJhdG9yLlxuICBleHBvcnRzLmFzeW5jID0gZnVuY3Rpb24oaW5uZXJGbiwgb3V0ZXJGbiwgc2VsZiwgdHJ5TG9jc0xpc3QsIFByb21pc2VJbXBsKSB7XG4gICAgaWYgKFByb21pc2VJbXBsID09PSB2b2lkIDApIFByb21pc2VJbXBsID0gUHJvbWlzZTtcblxuICAgIHZhciBpdGVyID0gbmV3IEFzeW5jSXRlcmF0b3IoXG4gICAgICB3cmFwKGlubmVyRm4sIG91dGVyRm4sIHNlbGYsIHRyeUxvY3NMaXN0KSxcbiAgICAgIFByb21pc2VJbXBsXG4gICAgKTtcblxuICAgIHJldHVybiBleHBvcnRzLmlzR2VuZXJhdG9yRnVuY3Rpb24ob3V0ZXJGbilcbiAgICAgID8gaXRlciAvLyBJZiBvdXRlckZuIGlzIGEgZ2VuZXJhdG9yLCByZXR1cm4gdGhlIGZ1bGwgaXRlcmF0b3IuXG4gICAgICA6IGl0ZXIubmV4dCgpLnRoZW4oZnVuY3Rpb24ocmVzdWx0KSB7XG4gICAgICAgICAgcmV0dXJuIHJlc3VsdC5kb25lID8gcmVzdWx0LnZhbHVlIDogaXRlci5uZXh0KCk7XG4gICAgICAgIH0pO1xuICB9O1xuXG4gIGZ1bmN0aW9uIG1ha2VJbnZva2VNZXRob2QoaW5uZXJGbiwgc2VsZiwgY29udGV4dCkge1xuICAgIHZhciBzdGF0ZSA9IEdlblN0YXRlU3VzcGVuZGVkU3RhcnQ7XG5cbiAgICByZXR1cm4gZnVuY3Rpb24gaW52b2tlKG1ldGhvZCwgYXJnKSB7XG4gICAgICBpZiAoc3RhdGUgPT09IEdlblN0YXRlRXhlY3V0aW5nKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkdlbmVyYXRvciBpcyBhbHJlYWR5IHJ1bm5pbmdcIik7XG4gICAgICB9XG5cbiAgICAgIGlmIChzdGF0ZSA9PT0gR2VuU3RhdGVDb21wbGV0ZWQpIHtcbiAgICAgICAgaWYgKG1ldGhvZCA9PT0gXCJ0aHJvd1wiKSB7XG4gICAgICAgICAgdGhyb3cgYXJnO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQmUgZm9yZ2l2aW5nLCBwZXIgMjUuMy4zLjMuMyBvZiB0aGUgc3BlYzpcbiAgICAgICAgLy8gaHR0cHM6Ly9wZW9wbGUubW96aWxsYS5vcmcvfmpvcmVuZG9yZmYvZXM2LWRyYWZ0Lmh0bWwjc2VjLWdlbmVyYXRvcnJlc3VtZVxuICAgICAgICByZXR1cm4gZG9uZVJlc3VsdCgpO1xuICAgICAgfVxuXG4gICAgICBjb250ZXh0Lm1ldGhvZCA9IG1ldGhvZDtcbiAgICAgIGNvbnRleHQuYXJnID0gYXJnO1xuXG4gICAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgICB2YXIgZGVsZWdhdGUgPSBjb250ZXh0LmRlbGVnYXRlO1xuICAgICAgICBpZiAoZGVsZWdhdGUpIHtcbiAgICAgICAgICB2YXIgZGVsZWdhdGVSZXN1bHQgPSBtYXliZUludm9rZURlbGVnYXRlKGRlbGVnYXRlLCBjb250ZXh0KTtcbiAgICAgICAgICBpZiAoZGVsZWdhdGVSZXN1bHQpIHtcbiAgICAgICAgICAgIGlmIChkZWxlZ2F0ZVJlc3VsdCA9PT0gQ29udGludWVTZW50aW5lbCkgY29udGludWU7XG4gICAgICAgICAgICByZXR1cm4gZGVsZWdhdGVSZXN1bHQ7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGNvbnRleHQubWV0aG9kID09PSBcIm5leHRcIikge1xuICAgICAgICAgIC8vIFNldHRpbmcgY29udGV4dC5fc2VudCBmb3IgbGVnYWN5IHN1cHBvcnQgb2YgQmFiZWwnc1xuICAgICAgICAgIC8vIGZ1bmN0aW9uLnNlbnQgaW1wbGVtZW50YXRpb24uXG4gICAgICAgICAgY29udGV4dC5zZW50ID0gY29udGV4dC5fc2VudCA9IGNvbnRleHQuYXJnO1xuXG4gICAgICAgIH0gZWxzZSBpZiAoY29udGV4dC5tZXRob2QgPT09IFwidGhyb3dcIikge1xuICAgICAgICAgIGlmIChzdGF0ZSA9PT0gR2VuU3RhdGVTdXNwZW5kZWRTdGFydCkge1xuICAgICAgICAgICAgc3RhdGUgPSBHZW5TdGF0ZUNvbXBsZXRlZDtcbiAgICAgICAgICAgIHRocm93IGNvbnRleHQuYXJnO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGNvbnRleHQuZGlzcGF0Y2hFeGNlcHRpb24oY29udGV4dC5hcmcpO1xuXG4gICAgICAgIH0gZWxzZSBpZiAoY29udGV4dC5tZXRob2QgPT09IFwicmV0dXJuXCIpIHtcbiAgICAgICAgICBjb250ZXh0LmFicnVwdChcInJldHVyblwiLCBjb250ZXh0LmFyZyk7XG4gICAgICAgIH1cblxuICAgICAgICBzdGF0ZSA9IEdlblN0YXRlRXhlY3V0aW5nO1xuXG4gICAgICAgIHZhciByZWNvcmQgPSB0cnlDYXRjaChpbm5lckZuLCBzZWxmLCBjb250ZXh0KTtcbiAgICAgICAgaWYgKHJlY29yZC50eXBlID09PSBcIm5vcm1hbFwiKSB7XG4gICAgICAgICAgLy8gSWYgYW4gZXhjZXB0aW9uIGlzIHRocm93biBmcm9tIGlubmVyRm4sIHdlIGxlYXZlIHN0YXRlID09PVxuICAgICAgICAgIC8vIEdlblN0YXRlRXhlY3V0aW5nIGFuZCBsb29wIGJhY2sgZm9yIGFub3RoZXIgaW52b2NhdGlvbi5cbiAgICAgICAgICBzdGF0ZSA9IGNvbnRleHQuZG9uZVxuICAgICAgICAgICAgPyBHZW5TdGF0ZUNvbXBsZXRlZFxuICAgICAgICAgICAgOiBHZW5TdGF0ZVN1c3BlbmRlZFlpZWxkO1xuXG4gICAgICAgICAgaWYgKHJlY29yZC5hcmcgPT09IENvbnRpbnVlU2VudGluZWwpIHtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB2YWx1ZTogcmVjb3JkLmFyZyxcbiAgICAgICAgICAgIGRvbmU6IGNvbnRleHQuZG9uZVxuICAgICAgICAgIH07XG5cbiAgICAgICAgfSBlbHNlIGlmIChyZWNvcmQudHlwZSA9PT0gXCJ0aHJvd1wiKSB7XG4gICAgICAgICAgc3RhdGUgPSBHZW5TdGF0ZUNvbXBsZXRlZDtcbiAgICAgICAgICAvLyBEaXNwYXRjaCB0aGUgZXhjZXB0aW9uIGJ5IGxvb3BpbmcgYmFjayBhcm91bmQgdG8gdGhlXG4gICAgICAgICAgLy8gY29udGV4dC5kaXNwYXRjaEV4Y2VwdGlvbihjb250ZXh0LmFyZykgY2FsbCBhYm92ZS5cbiAgICAgICAgICBjb250ZXh0Lm1ldGhvZCA9IFwidGhyb3dcIjtcbiAgICAgICAgICBjb250ZXh0LmFyZyA9IHJlY29yZC5hcmc7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgLy8gQ2FsbCBkZWxlZ2F0ZS5pdGVyYXRvcltjb250ZXh0Lm1ldGhvZF0oY29udGV4dC5hcmcpIGFuZCBoYW5kbGUgdGhlXG4gIC8vIHJlc3VsdCwgZWl0aGVyIGJ5IHJldHVybmluZyBhIHsgdmFsdWUsIGRvbmUgfSByZXN1bHQgZnJvbSB0aGVcbiAgLy8gZGVsZWdhdGUgaXRlcmF0b3IsIG9yIGJ5IG1vZGlmeWluZyBjb250ZXh0Lm1ldGhvZCBhbmQgY29udGV4dC5hcmcsXG4gIC8vIHNldHRpbmcgY29udGV4dC5kZWxlZ2F0ZSB0byBudWxsLCBhbmQgcmV0dXJuaW5nIHRoZSBDb250aW51ZVNlbnRpbmVsLlxuICBmdW5jdGlvbiBtYXliZUludm9rZURlbGVnYXRlKGRlbGVnYXRlLCBjb250ZXh0KSB7XG4gICAgdmFyIG1ldGhvZCA9IGRlbGVnYXRlLml0ZXJhdG9yW2NvbnRleHQubWV0aG9kXTtcbiAgICBpZiAobWV0aG9kID09PSB1bmRlZmluZWQpIHtcbiAgICAgIC8vIEEgLnRocm93IG9yIC5yZXR1cm4gd2hlbiB0aGUgZGVsZWdhdGUgaXRlcmF0b3IgaGFzIG5vIC50aHJvd1xuICAgICAgLy8gbWV0aG9kIGFsd2F5cyB0ZXJtaW5hdGVzIHRoZSB5aWVsZCogbG9vcC5cbiAgICAgIGNvbnRleHQuZGVsZWdhdGUgPSBudWxsO1xuXG4gICAgICBpZiAoY29udGV4dC5tZXRob2QgPT09IFwidGhyb3dcIikge1xuICAgICAgICAvLyBOb3RlOiBbXCJyZXR1cm5cIl0gbXVzdCBiZSB1c2VkIGZvciBFUzMgcGFyc2luZyBjb21wYXRpYmlsaXR5LlxuICAgICAgICBpZiAoZGVsZWdhdGUuaXRlcmF0b3JbXCJyZXR1cm5cIl0pIHtcbiAgICAgICAgICAvLyBJZiB0aGUgZGVsZWdhdGUgaXRlcmF0b3IgaGFzIGEgcmV0dXJuIG1ldGhvZCwgZ2l2ZSBpdCBhXG4gICAgICAgICAgLy8gY2hhbmNlIHRvIGNsZWFuIHVwLlxuICAgICAgICAgIGNvbnRleHQubWV0aG9kID0gXCJyZXR1cm5cIjtcbiAgICAgICAgICBjb250ZXh0LmFyZyA9IHVuZGVmaW5lZDtcbiAgICAgICAgICBtYXliZUludm9rZURlbGVnYXRlKGRlbGVnYXRlLCBjb250ZXh0KTtcblxuICAgICAgICAgIGlmIChjb250ZXh0Lm1ldGhvZCA9PT0gXCJ0aHJvd1wiKSB7XG4gICAgICAgICAgICAvLyBJZiBtYXliZUludm9rZURlbGVnYXRlKGNvbnRleHQpIGNoYW5nZWQgY29udGV4dC5tZXRob2QgZnJvbVxuICAgICAgICAgICAgLy8gXCJyZXR1cm5cIiB0byBcInRocm93XCIsIGxldCB0aGF0IG92ZXJyaWRlIHRoZSBUeXBlRXJyb3IgYmVsb3cuXG4gICAgICAgICAgICByZXR1cm4gQ29udGludWVTZW50aW5lbDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBjb250ZXh0Lm1ldGhvZCA9IFwidGhyb3dcIjtcbiAgICAgICAgY29udGV4dC5hcmcgPSBuZXcgVHlwZUVycm9yKFxuICAgICAgICAgIFwiVGhlIGl0ZXJhdG9yIGRvZXMgbm90IHByb3ZpZGUgYSAndGhyb3cnIG1ldGhvZFwiKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIENvbnRpbnVlU2VudGluZWw7XG4gICAgfVxuXG4gICAgdmFyIHJlY29yZCA9IHRyeUNhdGNoKG1ldGhvZCwgZGVsZWdhdGUuaXRlcmF0b3IsIGNvbnRleHQuYXJnKTtcblxuICAgIGlmIChyZWNvcmQudHlwZSA9PT0gXCJ0aHJvd1wiKSB7XG4gICAgICBjb250ZXh0Lm1ldGhvZCA9IFwidGhyb3dcIjtcbiAgICAgIGNvbnRleHQuYXJnID0gcmVjb3JkLmFyZztcbiAgICAgIGNvbnRleHQuZGVsZWdhdGUgPSBudWxsO1xuICAgICAgcmV0dXJuIENvbnRpbnVlU2VudGluZWw7XG4gICAgfVxuXG4gICAgdmFyIGluZm8gPSByZWNvcmQuYXJnO1xuXG4gICAgaWYgKCEgaW5mbykge1xuICAgICAgY29udGV4dC5tZXRob2QgPSBcInRocm93XCI7XG4gICAgICBjb250ZXh0LmFyZyA9IG5ldyBUeXBlRXJyb3IoXCJpdGVyYXRvciByZXN1bHQgaXMgbm90IGFuIG9iamVjdFwiKTtcbiAgICAgIGNvbnRleHQuZGVsZWdhdGUgPSBudWxsO1xuICAgICAgcmV0dXJuIENvbnRpbnVlU2VudGluZWw7XG4gICAgfVxuXG4gICAgaWYgKGluZm8uZG9uZSkge1xuICAgICAgLy8gQXNzaWduIHRoZSByZXN1bHQgb2YgdGhlIGZpbmlzaGVkIGRlbGVnYXRlIHRvIHRoZSB0ZW1wb3JhcnlcbiAgICAgIC8vIHZhcmlhYmxlIHNwZWNpZmllZCBieSBkZWxlZ2F0ZS5yZXN1bHROYW1lIChzZWUgZGVsZWdhdGVZaWVsZCkuXG4gICAgICBjb250ZXh0W2RlbGVnYXRlLnJlc3VsdE5hbWVdID0gaW5mby52YWx1ZTtcblxuICAgICAgLy8gUmVzdW1lIGV4ZWN1dGlvbiBhdCB0aGUgZGVzaXJlZCBsb2NhdGlvbiAoc2VlIGRlbGVnYXRlWWllbGQpLlxuICAgICAgY29udGV4dC5uZXh0ID0gZGVsZWdhdGUubmV4dExvYztcblxuICAgICAgLy8gSWYgY29udGV4dC5tZXRob2Qgd2FzIFwidGhyb3dcIiBidXQgdGhlIGRlbGVnYXRlIGhhbmRsZWQgdGhlXG4gICAgICAvLyBleGNlcHRpb24sIGxldCB0aGUgb3V0ZXIgZ2VuZXJhdG9yIHByb2NlZWQgbm9ybWFsbHkuIElmXG4gICAgICAvLyBjb250ZXh0Lm1ldGhvZCB3YXMgXCJuZXh0XCIsIGZvcmdldCBjb250ZXh0LmFyZyBzaW5jZSBpdCBoYXMgYmVlblxuICAgICAgLy8gXCJjb25zdW1lZFwiIGJ5IHRoZSBkZWxlZ2F0ZSBpdGVyYXRvci4gSWYgY29udGV4dC5tZXRob2Qgd2FzXG4gICAgICAvLyBcInJldHVyblwiLCBhbGxvdyB0aGUgb3JpZ2luYWwgLnJldHVybiBjYWxsIHRvIGNvbnRpbnVlIGluIHRoZVxuICAgICAgLy8gb3V0ZXIgZ2VuZXJhdG9yLlxuICAgICAgaWYgKGNvbnRleHQubWV0aG9kICE9PSBcInJldHVyblwiKSB7XG4gICAgICAgIGNvbnRleHQubWV0aG9kID0gXCJuZXh0XCI7XG4gICAgICAgIGNvbnRleHQuYXJnID0gdW5kZWZpbmVkO1xuICAgICAgfVxuXG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIFJlLXlpZWxkIHRoZSByZXN1bHQgcmV0dXJuZWQgYnkgdGhlIGRlbGVnYXRlIG1ldGhvZC5cbiAgICAgIHJldHVybiBpbmZvO1xuICAgIH1cblxuICAgIC8vIFRoZSBkZWxlZ2F0ZSBpdGVyYXRvciBpcyBmaW5pc2hlZCwgc28gZm9yZ2V0IGl0IGFuZCBjb250aW51ZSB3aXRoXG4gICAgLy8gdGhlIG91dGVyIGdlbmVyYXRvci5cbiAgICBjb250ZXh0LmRlbGVnYXRlID0gbnVsbDtcbiAgICByZXR1cm4gQ29udGludWVTZW50aW5lbDtcbiAgfVxuXG4gIC8vIERlZmluZSBHZW5lcmF0b3IucHJvdG90eXBlLntuZXh0LHRocm93LHJldHVybn0gaW4gdGVybXMgb2YgdGhlXG4gIC8vIHVuaWZpZWQgLl9pbnZva2UgaGVscGVyIG1ldGhvZC5cbiAgZGVmaW5lSXRlcmF0b3JNZXRob2RzKEdwKTtcblxuICBkZWZpbmUoR3AsIHRvU3RyaW5nVGFnU3ltYm9sLCBcIkdlbmVyYXRvclwiKTtcblxuICAvLyBBIEdlbmVyYXRvciBzaG91bGQgYWx3YXlzIHJldHVybiBpdHNlbGYgYXMgdGhlIGl0ZXJhdG9yIG9iamVjdCB3aGVuIHRoZVxuICAvLyBAQGl0ZXJhdG9yIGZ1bmN0aW9uIGlzIGNhbGxlZCBvbiBpdC4gU29tZSBicm93c2VycycgaW1wbGVtZW50YXRpb25zIG9mIHRoZVxuICAvLyBpdGVyYXRvciBwcm90b3R5cGUgY2hhaW4gaW5jb3JyZWN0bHkgaW1wbGVtZW50IHRoaXMsIGNhdXNpbmcgdGhlIEdlbmVyYXRvclxuICAvLyBvYmplY3QgdG8gbm90IGJlIHJldHVybmVkIGZyb20gdGhpcyBjYWxsLiBUaGlzIGVuc3VyZXMgdGhhdCBkb2Vzbid0IGhhcHBlbi5cbiAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9mYWNlYm9vay9yZWdlbmVyYXRvci9pc3N1ZXMvMjc0IGZvciBtb3JlIGRldGFpbHMuXG4gIGRlZmluZShHcCwgaXRlcmF0b3JTeW1ib2wsIGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzO1xuICB9KTtcblxuICBkZWZpbmUoR3AsIFwidG9TdHJpbmdcIiwgZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIFwiW29iamVjdCBHZW5lcmF0b3JdXCI7XG4gIH0pO1xuXG4gIGZ1bmN0aW9uIHB1c2hUcnlFbnRyeShsb2NzKSB7XG4gICAgdmFyIGVudHJ5ID0geyB0cnlMb2M6IGxvY3NbMF0gfTtcblxuICAgIGlmICgxIGluIGxvY3MpIHtcbiAgICAgIGVudHJ5LmNhdGNoTG9jID0gbG9jc1sxXTtcbiAgICB9XG5cbiAgICBpZiAoMiBpbiBsb2NzKSB7XG4gICAgICBlbnRyeS5maW5hbGx5TG9jID0gbG9jc1syXTtcbiAgICAgIGVudHJ5LmFmdGVyTG9jID0gbG9jc1szXTtcbiAgICB9XG5cbiAgICB0aGlzLnRyeUVudHJpZXMucHVzaChlbnRyeSk7XG4gIH1cblxuICBmdW5jdGlvbiByZXNldFRyeUVudHJ5KGVudHJ5KSB7XG4gICAgdmFyIHJlY29yZCA9IGVudHJ5LmNvbXBsZXRpb24gfHwge307XG4gICAgcmVjb3JkLnR5cGUgPSBcIm5vcm1hbFwiO1xuICAgIGRlbGV0ZSByZWNvcmQuYXJnO1xuICAgIGVudHJ5LmNvbXBsZXRpb24gPSByZWNvcmQ7XG4gIH1cblxuICBmdW5jdGlvbiBDb250ZXh0KHRyeUxvY3NMaXN0KSB7XG4gICAgLy8gVGhlIHJvb3QgZW50cnkgb2JqZWN0IChlZmZlY3RpdmVseSBhIHRyeSBzdGF0ZW1lbnQgd2l0aG91dCBhIGNhdGNoXG4gICAgLy8gb3IgYSBmaW5hbGx5IGJsb2NrKSBnaXZlcyB1cyBhIHBsYWNlIHRvIHN0b3JlIHZhbHVlcyB0aHJvd24gZnJvbVxuICAgIC8vIGxvY2F0aW9ucyB3aGVyZSB0aGVyZSBpcyBubyBlbmNsb3NpbmcgdHJ5IHN0YXRlbWVudC5cbiAgICB0aGlzLnRyeUVudHJpZXMgPSBbeyB0cnlMb2M6IFwicm9vdFwiIH1dO1xuICAgIHRyeUxvY3NMaXN0LmZvckVhY2gocHVzaFRyeUVudHJ5LCB0aGlzKTtcbiAgICB0aGlzLnJlc2V0KHRydWUpO1xuICB9XG5cbiAgZXhwb3J0cy5rZXlzID0gZnVuY3Rpb24ob2JqZWN0KSB7XG4gICAgdmFyIGtleXMgPSBbXTtcbiAgICBmb3IgKHZhciBrZXkgaW4gb2JqZWN0KSB7XG4gICAgICBrZXlzLnB1c2goa2V5KTtcbiAgICB9XG4gICAga2V5cy5yZXZlcnNlKCk7XG5cbiAgICAvLyBSYXRoZXIgdGhhbiByZXR1cm5pbmcgYW4gb2JqZWN0IHdpdGggYSBuZXh0IG1ldGhvZCwgd2Uga2VlcFxuICAgIC8vIHRoaW5ncyBzaW1wbGUgYW5kIHJldHVybiB0aGUgbmV4dCBmdW5jdGlvbiBpdHNlbGYuXG4gICAgcmV0dXJuIGZ1bmN0aW9uIG5leHQoKSB7XG4gICAgICB3aGlsZSAoa2V5cy5sZW5ndGgpIHtcbiAgICAgICAgdmFyIGtleSA9IGtleXMucG9wKCk7XG4gICAgICAgIGlmIChrZXkgaW4gb2JqZWN0KSB7XG4gICAgICAgICAgbmV4dC52YWx1ZSA9IGtleTtcbiAgICAgICAgICBuZXh0LmRvbmUgPSBmYWxzZTtcbiAgICAgICAgICByZXR1cm4gbmV4dDtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBUbyBhdm9pZCBjcmVhdGluZyBhbiBhZGRpdGlvbmFsIG9iamVjdCwgd2UganVzdCBoYW5nIHRoZSAudmFsdWVcbiAgICAgIC8vIGFuZCAuZG9uZSBwcm9wZXJ0aWVzIG9mZiB0aGUgbmV4dCBmdW5jdGlvbiBvYmplY3QgaXRzZWxmLiBUaGlzXG4gICAgICAvLyBhbHNvIGVuc3VyZXMgdGhhdCB0aGUgbWluaWZpZXIgd2lsbCBub3QgYW5vbnltaXplIHRoZSBmdW5jdGlvbi5cbiAgICAgIG5leHQuZG9uZSA9IHRydWU7XG4gICAgICByZXR1cm4gbmV4dDtcbiAgICB9O1xuICB9O1xuXG4gIGZ1bmN0aW9uIHZhbHVlcyhpdGVyYWJsZSkge1xuICAgIGlmIChpdGVyYWJsZSkge1xuICAgICAgdmFyIGl0ZXJhdG9yTWV0aG9kID0gaXRlcmFibGVbaXRlcmF0b3JTeW1ib2xdO1xuICAgICAgaWYgKGl0ZXJhdG9yTWV0aG9kKSB7XG4gICAgICAgIHJldHVybiBpdGVyYXRvck1ldGhvZC5jYWxsKGl0ZXJhYmxlKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHR5cGVvZiBpdGVyYWJsZS5uZXh0ID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgcmV0dXJuIGl0ZXJhYmxlO1xuICAgICAgfVxuXG4gICAgICBpZiAoIWlzTmFOKGl0ZXJhYmxlLmxlbmd0aCkpIHtcbiAgICAgICAgdmFyIGkgPSAtMSwgbmV4dCA9IGZ1bmN0aW9uIG5leHQoKSB7XG4gICAgICAgICAgd2hpbGUgKCsraSA8IGl0ZXJhYmxlLmxlbmd0aCkge1xuICAgICAgICAgICAgaWYgKGhhc093bi5jYWxsKGl0ZXJhYmxlLCBpKSkge1xuICAgICAgICAgICAgICBuZXh0LnZhbHVlID0gaXRlcmFibGVbaV07XG4gICAgICAgICAgICAgIG5leHQuZG9uZSA9IGZhbHNlO1xuICAgICAgICAgICAgICByZXR1cm4gbmV4dDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICBuZXh0LnZhbHVlID0gdW5kZWZpbmVkO1xuICAgICAgICAgIG5leHQuZG9uZSA9IHRydWU7XG5cbiAgICAgICAgICByZXR1cm4gbmV4dDtcbiAgICAgICAgfTtcblxuICAgICAgICByZXR1cm4gbmV4dC5uZXh0ID0gbmV4dDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBSZXR1cm4gYW4gaXRlcmF0b3Igd2l0aCBubyB2YWx1ZXMuXG4gICAgcmV0dXJuIHsgbmV4dDogZG9uZVJlc3VsdCB9O1xuICB9XG4gIGV4cG9ydHMudmFsdWVzID0gdmFsdWVzO1xuXG4gIGZ1bmN0aW9uIGRvbmVSZXN1bHQoKSB7XG4gICAgcmV0dXJuIHsgdmFsdWU6IHVuZGVmaW5lZCwgZG9uZTogdHJ1ZSB9O1xuICB9XG5cbiAgQ29udGV4dC5wcm90b3R5cGUgPSB7XG4gICAgY29uc3RydWN0b3I6IENvbnRleHQsXG5cbiAgICByZXNldDogZnVuY3Rpb24oc2tpcFRlbXBSZXNldCkge1xuICAgICAgdGhpcy5wcmV2ID0gMDtcbiAgICAgIHRoaXMubmV4dCA9IDA7XG4gICAgICAvLyBSZXNldHRpbmcgY29udGV4dC5fc2VudCBmb3IgbGVnYWN5IHN1cHBvcnQgb2YgQmFiZWwnc1xuICAgICAgLy8gZnVuY3Rpb24uc2VudCBpbXBsZW1lbnRhdGlvbi5cbiAgICAgIHRoaXMuc2VudCA9IHRoaXMuX3NlbnQgPSB1bmRlZmluZWQ7XG4gICAgICB0aGlzLmRvbmUgPSBmYWxzZTtcbiAgICAgIHRoaXMuZGVsZWdhdGUgPSBudWxsO1xuXG4gICAgICB0aGlzLm1ldGhvZCA9IFwibmV4dFwiO1xuICAgICAgdGhpcy5hcmcgPSB1bmRlZmluZWQ7XG5cbiAgICAgIHRoaXMudHJ5RW50cmllcy5mb3JFYWNoKHJlc2V0VHJ5RW50cnkpO1xuXG4gICAgICBpZiAoIXNraXBUZW1wUmVzZXQpIHtcbiAgICAgICAgZm9yICh2YXIgbmFtZSBpbiB0aGlzKSB7XG4gICAgICAgICAgLy8gTm90IHN1cmUgYWJvdXQgdGhlIG9wdGltYWwgb3JkZXIgb2YgdGhlc2UgY29uZGl0aW9uczpcbiAgICAgICAgICBpZiAobmFtZS5jaGFyQXQoMCkgPT09IFwidFwiICYmXG4gICAgICAgICAgICAgIGhhc093bi5jYWxsKHRoaXMsIG5hbWUpICYmXG4gICAgICAgICAgICAgICFpc05hTigrbmFtZS5zbGljZSgxKSkpIHtcbiAgICAgICAgICAgIHRoaXNbbmFtZV0gPSB1bmRlZmluZWQ7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcblxuICAgIHN0b3A6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5kb25lID0gdHJ1ZTtcblxuICAgICAgdmFyIHJvb3RFbnRyeSA9IHRoaXMudHJ5RW50cmllc1swXTtcbiAgICAgIHZhciByb290UmVjb3JkID0gcm9vdEVudHJ5LmNvbXBsZXRpb247XG4gICAgICBpZiAocm9vdFJlY29yZC50eXBlID09PSBcInRocm93XCIpIHtcbiAgICAgICAgdGhyb3cgcm9vdFJlY29yZC5hcmc7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzLnJ2YWw7XG4gICAgfSxcblxuICAgIGRpc3BhdGNoRXhjZXB0aW9uOiBmdW5jdGlvbihleGNlcHRpb24pIHtcbiAgICAgIGlmICh0aGlzLmRvbmUpIHtcbiAgICAgICAgdGhyb3cgZXhjZXB0aW9uO1xuICAgICAgfVxuXG4gICAgICB2YXIgY29udGV4dCA9IHRoaXM7XG4gICAgICBmdW5jdGlvbiBoYW5kbGUobG9jLCBjYXVnaHQpIHtcbiAgICAgICAgcmVjb3JkLnR5cGUgPSBcInRocm93XCI7XG4gICAgICAgIHJlY29yZC5hcmcgPSBleGNlcHRpb247XG4gICAgICAgIGNvbnRleHQubmV4dCA9IGxvYztcblxuICAgICAgICBpZiAoY2F1Z2h0KSB7XG4gICAgICAgICAgLy8gSWYgdGhlIGRpc3BhdGNoZWQgZXhjZXB0aW9uIHdhcyBjYXVnaHQgYnkgYSBjYXRjaCBibG9jayxcbiAgICAgICAgICAvLyB0aGVuIGxldCB0aGF0IGNhdGNoIGJsb2NrIGhhbmRsZSB0aGUgZXhjZXB0aW9uIG5vcm1hbGx5LlxuICAgICAgICAgIGNvbnRleHQubWV0aG9kID0gXCJuZXh0XCI7XG4gICAgICAgICAgY29udGV4dC5hcmcgPSB1bmRlZmluZWQ7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gISEgY2F1Z2h0O1xuICAgICAgfVxuXG4gICAgICBmb3IgKHZhciBpID0gdGhpcy50cnlFbnRyaWVzLmxlbmd0aCAtIDE7IGkgPj0gMDsgLS1pKSB7XG4gICAgICAgIHZhciBlbnRyeSA9IHRoaXMudHJ5RW50cmllc1tpXTtcbiAgICAgICAgdmFyIHJlY29yZCA9IGVudHJ5LmNvbXBsZXRpb247XG5cbiAgICAgICAgaWYgKGVudHJ5LnRyeUxvYyA9PT0gXCJyb290XCIpIHtcbiAgICAgICAgICAvLyBFeGNlcHRpb24gdGhyb3duIG91dHNpZGUgb2YgYW55IHRyeSBibG9jayB0aGF0IGNvdWxkIGhhbmRsZVxuICAgICAgICAgIC8vIGl0LCBzbyBzZXQgdGhlIGNvbXBsZXRpb24gdmFsdWUgb2YgdGhlIGVudGlyZSBmdW5jdGlvbiB0b1xuICAgICAgICAgIC8vIHRocm93IHRoZSBleGNlcHRpb24uXG4gICAgICAgICAgcmV0dXJuIGhhbmRsZShcImVuZFwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChlbnRyeS50cnlMb2MgPD0gdGhpcy5wcmV2KSB7XG4gICAgICAgICAgdmFyIGhhc0NhdGNoID0gaGFzT3duLmNhbGwoZW50cnksIFwiY2F0Y2hMb2NcIik7XG4gICAgICAgICAgdmFyIGhhc0ZpbmFsbHkgPSBoYXNPd24uY2FsbChlbnRyeSwgXCJmaW5hbGx5TG9jXCIpO1xuXG4gICAgICAgICAgaWYgKGhhc0NhdGNoICYmIGhhc0ZpbmFsbHkpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnByZXYgPCBlbnRyeS5jYXRjaExvYykge1xuICAgICAgICAgICAgICByZXR1cm4gaGFuZGxlKGVudHJ5LmNhdGNoTG9jLCB0cnVlKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5wcmV2IDwgZW50cnkuZmluYWxseUxvYykge1xuICAgICAgICAgICAgICByZXR1cm4gaGFuZGxlKGVudHJ5LmZpbmFsbHlMb2MpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgfSBlbHNlIGlmIChoYXNDYXRjaCkge1xuICAgICAgICAgICAgaWYgKHRoaXMucHJldiA8IGVudHJ5LmNhdGNoTG9jKSB7XG4gICAgICAgICAgICAgIHJldHVybiBoYW5kbGUoZW50cnkuY2F0Y2hMb2MsIHRydWUpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgfSBlbHNlIGlmIChoYXNGaW5hbGx5KSB7XG4gICAgICAgICAgICBpZiAodGhpcy5wcmV2IDwgZW50cnkuZmluYWxseUxvYykge1xuICAgICAgICAgICAgICByZXR1cm4gaGFuZGxlKGVudHJ5LmZpbmFsbHlMb2MpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcInRyeSBzdGF0ZW1lbnQgd2l0aG91dCBjYXRjaCBvciBmaW5hbGx5XCIpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG5cbiAgICBhYnJ1cHQ6IGZ1bmN0aW9uKHR5cGUsIGFyZykge1xuICAgICAgZm9yICh2YXIgaSA9IHRoaXMudHJ5RW50cmllcy5sZW5ndGggLSAxOyBpID49IDA7IC0taSkge1xuICAgICAgICB2YXIgZW50cnkgPSB0aGlzLnRyeUVudHJpZXNbaV07XG4gICAgICAgIGlmIChlbnRyeS50cnlMb2MgPD0gdGhpcy5wcmV2ICYmXG4gICAgICAgICAgICBoYXNPd24uY2FsbChlbnRyeSwgXCJmaW5hbGx5TG9jXCIpICYmXG4gICAgICAgICAgICB0aGlzLnByZXYgPCBlbnRyeS5maW5hbGx5TG9jKSB7XG4gICAgICAgICAgdmFyIGZpbmFsbHlFbnRyeSA9IGVudHJ5O1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChmaW5hbGx5RW50cnkgJiZcbiAgICAgICAgICAodHlwZSA9PT0gXCJicmVha1wiIHx8XG4gICAgICAgICAgIHR5cGUgPT09IFwiY29udGludWVcIikgJiZcbiAgICAgICAgICBmaW5hbGx5RW50cnkudHJ5TG9jIDw9IGFyZyAmJlxuICAgICAgICAgIGFyZyA8PSBmaW5hbGx5RW50cnkuZmluYWxseUxvYykge1xuICAgICAgICAvLyBJZ25vcmUgdGhlIGZpbmFsbHkgZW50cnkgaWYgY29udHJvbCBpcyBub3QganVtcGluZyB0byBhXG4gICAgICAgIC8vIGxvY2F0aW9uIG91dHNpZGUgdGhlIHRyeS9jYXRjaCBibG9jay5cbiAgICAgICAgZmluYWxseUVudHJ5ID0gbnVsbDtcbiAgICAgIH1cblxuICAgICAgdmFyIHJlY29yZCA9IGZpbmFsbHlFbnRyeSA/IGZpbmFsbHlFbnRyeS5jb21wbGV0aW9uIDoge307XG4gICAgICByZWNvcmQudHlwZSA9IHR5cGU7XG4gICAgICByZWNvcmQuYXJnID0gYXJnO1xuXG4gICAgICBpZiAoZmluYWxseUVudHJ5KSB7XG4gICAgICAgIHRoaXMubWV0aG9kID0gXCJuZXh0XCI7XG4gICAgICAgIHRoaXMubmV4dCA9IGZpbmFsbHlFbnRyeS5maW5hbGx5TG9jO1xuICAgICAgICByZXR1cm4gQ29udGludWVTZW50aW5lbDtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXMuY29tcGxldGUocmVjb3JkKTtcbiAgICB9LFxuXG4gICAgY29tcGxldGU6IGZ1bmN0aW9uKHJlY29yZCwgYWZ0ZXJMb2MpIHtcbiAgICAgIGlmIChyZWNvcmQudHlwZSA9PT0gXCJ0aHJvd1wiKSB7XG4gICAgICAgIHRocm93IHJlY29yZC5hcmc7XG4gICAgICB9XG5cbiAgICAgIGlmIChyZWNvcmQudHlwZSA9PT0gXCJicmVha1wiIHx8XG4gICAgICAgICAgcmVjb3JkLnR5cGUgPT09IFwiY29udGludWVcIikge1xuICAgICAgICB0aGlzLm5leHQgPSByZWNvcmQuYXJnO1xuICAgICAgfSBlbHNlIGlmIChyZWNvcmQudHlwZSA9PT0gXCJyZXR1cm5cIikge1xuICAgICAgICB0aGlzLnJ2YWwgPSB0aGlzLmFyZyA9IHJlY29yZC5hcmc7XG4gICAgICAgIHRoaXMubWV0aG9kID0gXCJyZXR1cm5cIjtcbiAgICAgICAgdGhpcy5uZXh0ID0gXCJlbmRcIjtcbiAgICAgIH0gZWxzZSBpZiAocmVjb3JkLnR5cGUgPT09IFwibm9ybWFsXCIgJiYgYWZ0ZXJMb2MpIHtcbiAgICAgICAgdGhpcy5uZXh0ID0gYWZ0ZXJMb2M7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBDb250aW51ZVNlbnRpbmVsO1xuICAgIH0sXG5cbiAgICBmaW5pc2g6IGZ1bmN0aW9uKGZpbmFsbHlMb2MpIHtcbiAgICAgIGZvciAodmFyIGkgPSB0aGlzLnRyeUVudHJpZXMubGVuZ3RoIC0gMTsgaSA+PSAwOyAtLWkpIHtcbiAgICAgICAgdmFyIGVudHJ5ID0gdGhpcy50cnlFbnRyaWVzW2ldO1xuICAgICAgICBpZiAoZW50cnkuZmluYWxseUxvYyA9PT0gZmluYWxseUxvYykge1xuICAgICAgICAgIHRoaXMuY29tcGxldGUoZW50cnkuY29tcGxldGlvbiwgZW50cnkuYWZ0ZXJMb2MpO1xuICAgICAgICAgIHJlc2V0VHJ5RW50cnkoZW50cnkpO1xuICAgICAgICAgIHJldHVybiBDb250aW51ZVNlbnRpbmVsO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcblxuICAgIFwiY2F0Y2hcIjogZnVuY3Rpb24odHJ5TG9jKSB7XG4gICAgICBmb3IgKHZhciBpID0gdGhpcy50cnlFbnRyaWVzLmxlbmd0aCAtIDE7IGkgPj0gMDsgLS1pKSB7XG4gICAgICAgIHZhciBlbnRyeSA9IHRoaXMudHJ5RW50cmllc1tpXTtcbiAgICAgICAgaWYgKGVudHJ5LnRyeUxvYyA9PT0gdHJ5TG9jKSB7XG4gICAgICAgICAgdmFyIHJlY29yZCA9IGVudHJ5LmNvbXBsZXRpb247XG4gICAgICAgICAgaWYgKHJlY29yZC50eXBlID09PSBcInRocm93XCIpIHtcbiAgICAgICAgICAgIHZhciB0aHJvd24gPSByZWNvcmQuYXJnO1xuICAgICAgICAgICAgcmVzZXRUcnlFbnRyeShlbnRyeSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiB0aHJvd247XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gVGhlIGNvbnRleHQuY2F0Y2ggbWV0aG9kIG11c3Qgb25seSBiZSBjYWxsZWQgd2l0aCBhIGxvY2F0aW9uXG4gICAgICAvLyBhcmd1bWVudCB0aGF0IGNvcnJlc3BvbmRzIHRvIGEga25vd24gY2F0Y2ggYmxvY2suXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJpbGxlZ2FsIGNhdGNoIGF0dGVtcHRcIik7XG4gICAgfSxcblxuICAgIGRlbGVnYXRlWWllbGQ6IGZ1bmN0aW9uKGl0ZXJhYmxlLCByZXN1bHROYW1lLCBuZXh0TG9jKSB7XG4gICAgICB0aGlzLmRlbGVnYXRlID0ge1xuICAgICAgICBpdGVyYXRvcjogdmFsdWVzKGl0ZXJhYmxlKSxcbiAgICAgICAgcmVzdWx0TmFtZTogcmVzdWx0TmFtZSxcbiAgICAgICAgbmV4dExvYzogbmV4dExvY1xuICAgICAgfTtcblxuICAgICAgaWYgKHRoaXMubWV0aG9kID09PSBcIm5leHRcIikge1xuICAgICAgICAvLyBEZWxpYmVyYXRlbHkgZm9yZ2V0IHRoZSBsYXN0IHNlbnQgdmFsdWUgc28gdGhhdCB3ZSBkb24ndFxuICAgICAgICAvLyBhY2NpZGVudGFsbHkgcGFzcyBpdCBvbiB0byB0aGUgZGVsZWdhdGUuXG4gICAgICAgIHRoaXMuYXJnID0gdW5kZWZpbmVkO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gQ29udGludWVTZW50aW5lbDtcbiAgICB9XG4gIH07XG5cbiAgLy8gUmVnYXJkbGVzcyBvZiB3aGV0aGVyIHRoaXMgc2NyaXB0IGlzIGV4ZWN1dGluZyBhcyBhIENvbW1vbkpTIG1vZHVsZVxuICAvLyBvciBub3QsIHJldHVybiB0aGUgcnVudGltZSBvYmplY3Qgc28gdGhhdCB3ZSBjYW4gZGVjbGFyZSB0aGUgdmFyaWFibGVcbiAgLy8gcmVnZW5lcmF0b3JSdW50aW1lIGluIHRoZSBvdXRlciBzY29wZSwgd2hpY2ggYWxsb3dzIHRoaXMgbW9kdWxlIHRvIGJlXG4gIC8vIGluamVjdGVkIGVhc2lseSBieSBgYmluL3JlZ2VuZXJhdG9yIC0taW5jbHVkZS1ydW50aW1lIHNjcmlwdC5qc2AuXG4gIHJldHVybiBleHBvcnRzO1xuXG59KFxuICAvLyBJZiB0aGlzIHNjcmlwdCBpcyBleGVjdXRpbmcgYXMgYSBDb21tb25KUyBtb2R1bGUsIHVzZSBtb2R1bGUuZXhwb3J0c1xuICAvLyBhcyB0aGUgcmVnZW5lcmF0b3JSdW50aW1lIG5hbWVzcGFjZS4gT3RoZXJ3aXNlIGNyZWF0ZSBhIG5ldyBlbXB0eVxuICAvLyBvYmplY3QuIEVpdGhlciB3YXksIHRoZSByZXN1bHRpbmcgb2JqZWN0IHdpbGwgYmUgdXNlZCB0byBpbml0aWFsaXplXG4gIC8vIHRoZSByZWdlbmVyYXRvclJ1bnRpbWUgdmFyaWFibGUgYXQgdGhlIHRvcCBvZiB0aGlzIGZpbGUuXG4gIHR5cGVvZiBtb2R1bGUgPT09IFwib2JqZWN0XCIgPyBtb2R1bGUuZXhwb3J0cyA6IHt9XG4pKTtcblxudHJ5IHtcbiAgcmVnZW5lcmF0b3JSdW50aW1lID0gcnVudGltZTtcbn0gY2F0Y2ggKGFjY2lkZW50YWxTdHJpY3RNb2RlKSB7XG4gIC8vIFRoaXMgbW9kdWxlIHNob3VsZCBub3QgYmUgcnVubmluZyBpbiBzdHJpY3QgbW9kZSwgc28gdGhlIGFib3ZlXG4gIC8vIGFzc2lnbm1lbnQgc2hvdWxkIGFsd2F5cyB3b3JrIHVubGVzcyBzb21ldGhpbmcgaXMgbWlzY29uZmlndXJlZC4gSnVzdFxuICAvLyBpbiBjYXNlIHJ1bnRpbWUuanMgYWNjaWRlbnRhbGx5IHJ1bnMgaW4gc3RyaWN0IG1vZGUsIGluIG1vZGVybiBlbmdpbmVzXG4gIC8vIHdlIGNhbiBleHBsaWNpdGx5IGFjY2VzcyBnbG9iYWxUaGlzLiBJbiBvbGRlciBlbmdpbmVzIHdlIGNhbiBlc2NhcGVcbiAgLy8gc3RyaWN0IG1vZGUgdXNpbmcgYSBnbG9iYWwgRnVuY3Rpb24gY2FsbC4gVGhpcyBjb3VsZCBjb25jZWl2YWJseSBmYWlsXG4gIC8vIGlmIGEgQ29udGVudCBTZWN1cml0eSBQb2xpY3kgZm9yYmlkcyB1c2luZyBGdW5jdGlvbiwgYnV0IGluIHRoYXQgY2FzZVxuICAvLyB0aGUgcHJvcGVyIHNvbHV0aW9uIGlzIHRvIGZpeCB0aGUgYWNjaWRlbnRhbCBzdHJpY3QgbW9kZSBwcm9ibGVtLiBJZlxuICAvLyB5b3UndmUgbWlzY29uZmlndXJlZCB5b3VyIGJ1bmRsZXIgdG8gZm9yY2Ugc3RyaWN0IG1vZGUgYW5kIGFwcGxpZWQgYVxuICAvLyBDU1AgdG8gZm9yYmlkIEZ1bmN0aW9uLCBhbmQgeW91J3JlIG5vdCB3aWxsaW5nIHRvIGZpeCBlaXRoZXIgb2YgdGhvc2VcbiAgLy8gcHJvYmxlbXMsIHBsZWFzZSBkZXRhaWwgeW91ciB1bmlxdWUgcHJlZGljYW1lbnQgaW4gYSBHaXRIdWIgaXNzdWUuXG4gIGlmICh0eXBlb2YgZ2xvYmFsVGhpcyA9PT0gXCJvYmplY3RcIikge1xuICAgIGdsb2JhbFRoaXMucmVnZW5lcmF0b3JSdW50aW1lID0gcnVudGltZTtcbiAgfSBlbHNlIHtcbiAgICBGdW5jdGlvbihcInJcIiwgXCJyZWdlbmVyYXRvclJ1bnRpbWUgPSByXCIpKHJ1bnRpbWUpO1xuICB9XG59XG4iLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiLy8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbl9fd2VicGFja19yZXF1aXJlX18ubiA9IChtb2R1bGUpID0+IHtcblx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG5cdFx0KCkgPT4gKG1vZHVsZVsnZGVmYXVsdCddKSA6XG5cdFx0KCkgPT4gKG1vZHVsZSk7XG5cdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsIHsgYTogZ2V0dGVyIH0pO1xuXHRyZXR1cm4gZ2V0dGVyO1xufTsiLCIvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9ucyBmb3IgaGFybW9ueSBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSAoZXhwb3J0cywgZGVmaW5pdGlvbikgPT4ge1xuXHRmb3IodmFyIGtleSBpbiBkZWZpbml0aW9uKSB7XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGRlZmluaXRpb24sIGtleSkgJiYgIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBrZXkpKSB7XG5cdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywga2V5LCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZGVmaW5pdGlvbltrZXldIH0pO1xuXHRcdH1cblx0fVxufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSAob2JqLCBwcm9wKSA9PiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCkpIiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG4vLyphc3luYyBmdW5jdGlvbiB3YXMgY3JlYXRpbmcgXCJFcnJvciBpbiBldmVudCBoYW5kbGVyOiBSZWZlcmVuY2VFcnJvcjogcmVnZW5lcmF0b3JSdW50aW1lIGlzIG5vdCBkZWZpbmVkXCIgcHJvYmxlbSBkb25ubyB3aHksIGltcG9ydGluZyB0aGlzIHNoaXQgZml4ZWQgdGhlIHByb2JsZW0gZG9ubm8gd2h5IDopXHJcbmltcG9ydCByZWdlbmVyYXRvclJ1bnRpbWUgZnJvbSBcInJlZ2VuZXJhdG9yLXJ1bnRpbWVcIjtcclxuXHJcbmNvbnNvbGUubG9nKFxyXG4gICAgJ1wiWW91ciBicm93c2VyIGhhcyBiZWVuIGhhY2tlZCEhXCIgLSBjb250ZW50LmpzIG9mIFlvdVR1YmUgUGxheWxpc3QgRHVyYXRpb24gRXh0ZW5zaW9uIDopJ1xyXG4pO1xyXG5cclxubGV0IG15QVBJS2V5ID0gYEFJemFTeUFJTllrb3p4ZmNHLTBTNUNmaFNvYjBUdXdfY29pX1U5SWA7XHJcbmxldCBjdXJyVVJMO1xyXG5sZXQgY3VyckR1cmF0aW9uT2JqZWN0O1xyXG5cclxuLy8qX19fX19fX19fX19fX19fX19fX19fX0hFTFBFUiBGVU5DVElPTlNfX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19cclxuXHJcbi8vKmdldCBhIGR1cmF0aW9uIG9iamVjdCB7eWVhcnMsIG1vbnRocywgd2Vla3MsIGRheXMgLCBob3VycyAsIG1pbnV0cywgc2Vjb25kc30gZnJvbSBJU08gODYwMSBkdXJhdGlvblxyXG5mdW5jdGlvbiBwYXJzZUlTTzg2MDFEdXJhdGlvbihpc284NjAxRHVyYXRpb24pIHtcclxuICAgIGNvbnN0IGlzbzg2MDFEdXJhdGlvblJlZ2V4ID1cclxuICAgICAgICAvKC0pP1AoPzooWy4sXFxkXSspWSk/KD86KFsuLFxcZF0rKU0pPyg/OihbLixcXGRdKylXKT8oPzooWy4sXFxkXSspRCk/VCg/OihbLixcXGRdKylIKT8oPzooWy4sXFxkXSspTSk/KD86KFsuLFxcZF0rKVMpPy87XHJcbiAgICBjb25zdCBtYXRjaGVzID0gaXNvODYwMUR1cmF0aW9uLm1hdGNoKGlzbzg2MDFEdXJhdGlvblJlZ2V4KTtcclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIHNpZ246IG1hdGNoZXNbMV0gPT09IHVuZGVmaW5lZCA/IFwiK1wiIDogXCItXCIsXHJcbiAgICAgICAgeWVhcnM6IG1hdGNoZXNbMl0gPT09IHVuZGVmaW5lZCA/IDAgOiBOdW1iZXIobWF0Y2hlc1syXSksXHJcbiAgICAgICAgbW9udGhzOiBtYXRjaGVzWzNdID09PSB1bmRlZmluZWQgPyAwIDogTnVtYmVyKG1hdGNoZXNbM10pLFxyXG4gICAgICAgIHdlZWtzOiBtYXRjaGVzWzRdID09PSB1bmRlZmluZWQgPyAwIDogTnVtYmVyKG1hdGNoZXNbNF0pLFxyXG4gICAgICAgIGRheXM6IG1hdGNoZXNbNV0gPT09IHVuZGVmaW5lZCA/IDAgOiBOdW1iZXIobWF0Y2hlc1s1XSksXHJcbiAgICAgICAgaG91cnM6IG1hdGNoZXNbNl0gPT09IHVuZGVmaW5lZCA/IDAgOiBOdW1iZXIobWF0Y2hlc1s2XSksXHJcbiAgICAgICAgbWludXRlczogbWF0Y2hlc1s3XSA9PT0gdW5kZWZpbmVkID8gMCA6IE51bWJlcihtYXRjaGVzWzddKSxcclxuICAgICAgICBzZWNvbmRzOiBtYXRjaGVzWzhdID09PSB1bmRlZmluZWQgPyAwIDogTnVtYmVyKG1hdGNoZXNbOF0pLFxyXG4gICAgfTtcclxufVxyXG5cclxuLy8qYWRkcyB0d28gZHVyYXRpb25zIGFuZCByZXR1cm5zIHRoZSByZXN1bHRcclxuZnVuY3Rpb24gYWRkRHVyYXRpb25zKGR1cmF0aW9uMSwgZHVyYXRpb24yKSB7XHJcbiAgICBsZXQgdG90YWxZZWFycyA9IDAsXHJcbiAgICAgICAgdG90YWxNb250aHMgPSAwLFxyXG4gICAgICAgIHRvdGFsV2Vla3MgPSAwLFxyXG4gICAgICAgIHRvdGFsRGF5cyA9IDAsXHJcbiAgICAgICAgdG90YWxIb3VycyA9IDAsXHJcbiAgICAgICAgdG90YWxNaW51dGVzID0gMCxcclxuICAgICAgICB0b3RhbFNlY29uZHMgPSAwO1xyXG5cclxuICAgIHRvdGFsU2Vjb25kcyArPSAoZHVyYXRpb24xLnNlY29uZHMgKyBkdXJhdGlvbjIuc2Vjb25kcykgJSA2MDtcclxuICAgIHRvdGFsTWludXRlcyArPSBNYXRoLmZsb29yKChkdXJhdGlvbjEuc2Vjb25kcyArIGR1cmF0aW9uMi5zZWNvbmRzKSAvIDYwKTtcclxuXHJcbiAgICB0b3RhbE1pbnV0ZXMgKz0gKGR1cmF0aW9uMS5taW51dGVzICsgZHVyYXRpb24yLm1pbnV0ZXMpICUgNjA7XHJcbiAgICB0b3RhbEhvdXJzICs9IE1hdGguZmxvb3IoKGR1cmF0aW9uMS5taW51dGVzICsgZHVyYXRpb24yLm1pbnV0ZXMpIC8gNjApO1xyXG5cclxuICAgIHRvdGFsSG91cnMgKz0gKGR1cmF0aW9uMS5ob3VycyArIGR1cmF0aW9uMi5ob3VycykgJSAyNDtcclxuICAgIHRvdGFsRGF5cyArPSBNYXRoLmZsb29yKChkdXJhdGlvbjEuaG91cnMgKyBkdXJhdGlvbjIuaG91cnMpIC8gMjQpO1xyXG5cclxuICAgIHRvdGFsRGF5cyArPSAoZHVyYXRpb24xLmRheXMgKyBkdXJhdGlvbjIuZGF5cykgJSA3O1xyXG4gICAgdG90YWxXZWVrcyArPSBNYXRoLmZsb29yKChkdXJhdGlvbjEud2Vla3MgKyBkdXJhdGlvbjIud2Vla3MpIC8gNyk7XHJcblxyXG4gICAgdG90YWxXZWVrcyArPSBkdXJhdGlvbjEud2Vla3MgKyBkdXJhdGlvbjIud2Vla3M7XHJcbiAgICB0b3RhbE1vbnRocyArPSBkdXJhdGlvbjEubW9udGhzICsgZHVyYXRpb24yLm1vbnRocztcclxuICAgIGlmICh0b3RhbERheXMgPiAzMCkge1xyXG4gICAgICAgIHRvdGFsV2Vla3MgPSBNYXRoLmZsb29yKCh0b3RhbERheXMgLSAzMCkgLyA3KTtcclxuICAgICAgICB0b3RhbE1vbnRocyArPSAxO1xyXG4gICAgfVxyXG5cclxuICAgIHRvdGFsWWVhcnMgKz0gZHVyYXRpb24xLnllYXJzICsgZHVyYXRpb24yLnllYXJzO1xyXG4gICAgaWYgKHRvdGFsTW9udGhzID4gMTIpIHtcclxuICAgICAgICB0b3RhbFllYXJzKys7XHJcbiAgICAgICAgdG90YWxNb250aHMgPSB0b3RhbE1vbnRocyAtIDEyO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgeWVhcnM6IHRvdGFsWWVhcnMsXHJcbiAgICAgICAgbW9udGhzOiB0b3RhbE1vbnRocyxcclxuICAgICAgICB3ZWVrczogdG90YWxXZWVrcyxcclxuICAgICAgICBkYXlzOiB0b3RhbERheXMsXHJcbiAgICAgICAgaG91cnM6IHRvdGFsSG91cnMsXHJcbiAgICAgICAgbWludXRlczogdG90YWxNaW51dGVzLFxyXG4gICAgICAgIHNlY29uZHM6IHRvdGFsU2Vjb25kcyxcclxuICAgIH07XHJcbn1cclxuXHJcbi8vKmNoZWNrIGlmIHRoZSBnaXZlbiB1cmwgaXMgdmFsaWQgeW91dHViZSB1cmwgb3Igbm90XHJcbmZ1bmN0aW9uIGlzWW91dFR1YmVVUkxWYWxpZCh1cmwpIHtcclxuICAgIGNvbnN0IHJlZ0V4cCA9IC9eKD86aHR0cHM/OlxcL1xcLyk/KD86d3d3XFwuKT95b3V0dWJlXFwuY29tKD86XFxTKyk/JC87XHJcbiAgICBpZiAodXJsLm1hdGNoKHJlZ0V4cCkgJiYgdXJsLm1hdGNoKHJlZ0V4cCkubGVuZ3RoID4gMCkgcmV0dXJuIHRydWU7XHJcbiAgICBlbHNlIHJldHVybiBmYWxzZTtcclxufVxyXG5cclxuLy8qZ2V0IHBsYXlsaXN0IGlkIGZyb20geW91dHViZSBwbGF5bGlzdCB1cmxcclxuZnVuY3Rpb24gZ2V0UGxheWxpc3RJREZyb21Zb3VUdWJlVVJMKHVybCkge1xyXG4gICAgLy8gY29uc3QgcmVnID0gbmV3IFJlZ0V4cChcIlsmP11saXN0PShbYS16MC05X10rKVwiLCBcImlcIik7XHJcbiAgICBjb25zdCByZWcgPSBuZXcgUmVnRXhwKFwiWyY/XWxpc3Q9KFthLXowLTlfLV0rKVwiLCBcImlcIik7XHJcblxyXG4gICAgY29uc3QgbWF0Y2ggPSByZWcuZXhlYyh1cmwpO1xyXG5cclxuICAgIGlmIChtYXRjaCAmJiBtYXRjaFsxXS5sZW5ndGggPiAwICYmIGlzWW91dFR1YmVVUkxWYWxpZCh1cmwpKSB7XHJcbiAgICAgICAgcmV0dXJuIG1hdGNoWzFdO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxufVxyXG5cclxuLy8qcmV0dXJucyBqc29uIChwcm9taXNlKSBhZnRlciBmZXRjaGluZ1xyXG5hc3luYyBmdW5jdGlvbiBmZXRjaEpTT04odXJsLCBlcnJvck1lc3NhZ2UgPSBcInJlc3BvbnNlTm90T2tcIikge1xyXG4gICAgcmV0dXJuIGZldGNoKHVybCkudGhlbigocmVzcG9uc2UpID0+IHtcclxuICAgICAgICAvLyBjb25zb2xlLmxvZyhcInJlc3BvbnNlIDogXCIpO1xyXG4gICAgICAgIC8vIGNvbnNvbGUubG9nKHJlc3BvbnNlKTtcclxuXHJcbiAgICAgICAgLy8gY29uc29sZS5sb2cocmVzcG9uc2UpO1xyXG5cclxuICAgICAgICBpZiAocmVzcG9uc2Uub2spIHJldHVybiByZXNwb25zZS5qc29uKCk7XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIGlmIChyZXNwb25zZS5zdGF0dXMgPT09IDQwMykge1xyXG4gICAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2coYEFQSSBrZXkgcXVvdGEgZXhjZWVkZWQgZm9yIGtleSBObyA6ICR7Y3VyckFQSUtleUluZGV4fWApO1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwicXVvdGFFeGNlZWRlZFwiKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihlcnJvck1lc3NhZ2UpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcbn1cclxuXHJcbi8vKnJldHVybnMgcGxheWxpc3RDb250ZW50RGV0YWlscyAocHJvbWlzZSkgb2YgcGFnZVRva2VuKGlmIG5vdCBudWxsKSBmcm9tIHBsYXlsaXN0IGlkXHJcbmFzeW5jIGZ1bmN0aW9uIGdldFBsYXlsaXN0Q29udGVudERldGFpbHNGcm9tUGxheWxpc3RJRChcclxuICAgIHBsYXlsaXN0SUQsXHJcbiAgICBwYWdlVG9rZW4gPSBudWxsXHJcbikge1xyXG4gICAgbGV0IHVybDtcclxuICAgIGlmICghcGFnZVRva2VuKVxyXG4gICAgICAgIHVybCA9IGBodHRwczovL3lvdXR1YmUuZ29vZ2xlYXBpcy5jb20veW91dHViZS92My9wbGF5bGlzdEl0ZW1zP3BhcnQ9Y29udGVudERldGFpbHMmbWF4UmVzdWx0cz01MCZwbGF5bGlzdElkPSR7cGxheWxpc3RJRH0ma2V5PSR7bXlBUElLZXl9YDtcclxuICAgIGVsc2VcclxuICAgICAgICB1cmwgPSBgaHR0cHM6Ly95b3V0dWJlLmdvb2dsZWFwaXMuY29tL3lvdXR1YmUvdjMvcGxheWxpc3RJdGVtcz9wYXJ0PWNvbnRlbnREZXRhaWxzJm1heFJlc3VsdHM9NTAmcGFnZVRva2VuPSR7cGFnZVRva2VufSZwbGF5bGlzdElkPSR7cGxheWxpc3RJRH0ma2V5PSR7bXlBUElLZXl9YDtcclxuXHJcbiAgICB0cnkge1xyXG4gICAgICAgIGNvbnN0IGRhdGEgPSBhd2FpdCBmZXRjaEpTT04odXJsKTtcclxuICAgICAgICByZXR1cm4gZGF0YTtcclxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgdGhyb3cgZXJyb3I7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8vKnJldHVybnMgdmlkZW9Db250ZW50RGV0YWlscyAocHJvbWlzZSkgZnJvbSB2aWRlb0lEXHJcbmFzeW5jIGZ1bmN0aW9uIGdldFZpZGVvQ29udGVudERldGFpbHNGcm9tVmlkZW9JRCh2aWRlb0lEKSB7XHJcbiAgICBjb25zdCB1cmwgPSBgaHR0cHM6Ly95b3V0dWJlLmdvb2dsZWFwaXMuY29tL3lvdXR1YmUvdjMvdmlkZW9zP3BhcnQ9Y29udGVudERldGFpbHMmaWQ9JHt2aWRlb0lEfSZrZXk9JHtteUFQSUtleX1gO1xyXG5cclxuICAgIHRyeSB7XHJcbiAgICAgICAgY29uc3QgZGF0YSA9IGF3YWl0IGZldGNoSlNPTih1cmwpO1xyXG4gICAgICAgIHJldHVybiBkYXRhO1xyXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICB0aHJvdyBlcnJvcjtcclxuICAgIH1cclxufVxyXG5cclxuZnVuY3Rpb24gZHVyYXRpb25PYmplY3RUb1N0cmluZyhkdXJhdGlvbikge1xyXG4gICAgLy8gZGVidWdnZXI7XHJcbiAgICBsZXQgdG90YWxEdXJhdGlvbiA9IGR1cmF0aW9uO1xyXG5cclxuICAgIGxldCB0ZXh0ID0gXCJcIjtcclxuICAgIGlmICh0b3RhbER1cmF0aW9uLnllYXJzKSB0ZXh0ICs9IGAsICR7dG90YWxEdXJhdGlvbi55ZWFyc30geWVhcnNgO1xyXG4gICAgaWYgKHRvdGFsRHVyYXRpb24ubW9udGhzKSB0ZXh0ICs9IGAsICR7dG90YWxEdXJhdGlvbi5tb250aHN9IG1vbnRoc2A7XHJcbiAgICAvLyBpZiAodG90YWxEdXJhdGlvbi53ZWVrcykgdGV4dCArPSBgLCAke3RvdGFsRHVyYXRpb24ud2Vla3N9IHdlZWtzYDtcclxuICAgIGlmICh0b3RhbER1cmF0aW9uLmRheXMpIHRleHQgKz0gYCwgJHt0b3RhbER1cmF0aW9uLmRheXN9IGRheXNgO1xyXG4gICAgaWYgKHRvdGFsRHVyYXRpb24uaG91cnMpIHRleHQgKz0gYCwgJHt0b3RhbER1cmF0aW9uLmhvdXJzfSBob3Vyc2A7XHJcbiAgICBpZiAodG90YWxEdXJhdGlvbi5taW51dGVzKSB0ZXh0ICs9IGAsICR7dG90YWxEdXJhdGlvbi5taW51dGVzfSBtaW51dGVzYDtcclxuICAgIHRleHQgKz0gYCwgJHt0b3RhbER1cmF0aW9uLnNlY29uZHN9IHNlY29uZHNgO1xyXG4gICAgLy9yZW1vdmUgXCIgLFwiIGZyb20gc3RhcnRcclxuICAgIHRleHQgPSB0ZXh0LnN1YnN0cmluZygyKTtcclxuXHJcbiAgICByZXR1cm4gdGV4dDtcclxufVxyXG4vL1xyXG4vL1xyXG4vL1xyXG5cclxuLy9cclxuLy9cclxuLy9cclxuLy9cclxuLy8vXHJcbi8vXHJcbi8vXHJcbi8vX19fX19fX19fX19fX19fX19fX19fXyAgICAgICAgICA6KSAgICBfX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fXHJcbi8vXHJcblxyXG4vLypyZXR1cm5zIGFuIG9iamVjdCB7dG90YWxEdXJhdGlvbiwgY291bnRUb3RhbFZpZCwgY291bnRQdWJsaWNWaWR9IGZyb20gdmFsaWQgeW91dHViZSBwbGF5bGlzdCBJRFxyXG5cclxuYXN5bmMgZnVuY3Rpb24gZ2V0VG90YWxEdXJhdGlvbkZyb21QbGF5bGlzdElEKHBsYXlsaXN0SUQpIHtcclxuICAgIC8vIGRlYnVnZ2VyO1xyXG5cclxuICAgIGlmICghcGxheWxpc3RJRCkge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKFwiTm90IGEgdmFsaWQgeW91dHViZSBwbGF5bGlzdCBJRCAgOilcIik7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiaW52YWxpZFBsYXlsaXN0SURcIik7XHJcbiAgICB9XHJcblxyXG4gICAgbGV0IGNvdW50VG90YWxWaWQgPSAwO1xyXG4gICAgbGV0IGNvdW50UHVibGljVmlkID0gMDtcclxuXHJcbiAgICBsZXQgdG90YWxEdXJhdGlvbiA9IHtcclxuICAgICAgICB5ZWFyczogMCxcclxuICAgICAgICBtb250aHM6IDAsXHJcbiAgICAgICAgd2Vla3M6IDAsXHJcbiAgICAgICAgZGF5czogMCxcclxuICAgICAgICBob3VyczogMCxcclxuICAgICAgICBtaW51dGVzOiAwLFxyXG4gICAgICAgIHNlY29uZHM6IDAsXHJcbiAgICB9O1xyXG5cclxuICAgIC8vKllvdXR1YmUgQVBJIHNlbmRzIGRhdGEgYXMgYSBmb3JtIG9mIHBhZ2VzLCB3aXRoIG1heCA1MCByZXN1bHRzIHBlciBwYWdlLCBhbmQgYWxzbyB0aGUgbmV4dFBhZ2VUb2tlbiBpcyBzZW50IHdpdGggdGhlIGN1cnJlbnQgcGFnZSwgc28gd2UgaGF2ZSB0byB0cmF2ZXJzZSB0aHJvdWdoIGFsbCB0aGUgcGFnZXMgdG8gZ2V0IGFsbCByZXN1bHRzXHJcblxyXG4gICAgbGV0IGZldGNoaW5nRmlyc3RQYWdlID0gdHJ1ZTtcclxuICAgIGxldCBjdXJyUGFnZVRva2VuID0gbnVsbDtcclxuXHJcbiAgICB3aGlsZSAoZmV0Y2hpbmdGaXJzdFBhZ2UgfHwgY3VyclBhZ2VUb2tlbikge1xyXG4gICAgICAgIGZldGNoaW5nRmlyc3RQYWdlID0gZmFsc2U7XHJcblxyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHBsYXlsaXN0Q29udGVudERldGFpbCA9XHJcbiAgICAgICAgICAgICAgICBhd2FpdCBnZXRQbGF5bGlzdENvbnRlbnREZXRhaWxzRnJvbVBsYXlsaXN0SUQoXHJcbiAgICAgICAgICAgICAgICAgICAgcGxheWxpc3RJRCxcclxuICAgICAgICAgICAgICAgICAgICBjdXJyUGFnZVRva2VuXHJcbiAgICAgICAgICAgICAgICApO1xyXG5cclxuICAgICAgICAgICAgLy9nZXQgYWxsIHZpZGVvIGNvbnRlbnQgZGV0YWlscyAocHJvbWlzZWVzKSBvZiB0aGlzIHBhZ2VcclxuICAgICAgICAgICAgbGV0IHByb21pc2VzQXJyID0gW107XHJcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcGxheWxpc3RDb250ZW50RGV0YWlsLml0ZW1zLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCB2aWRlb0lEID1cclxuICAgICAgICAgICAgICAgICAgICBwbGF5bGlzdENvbnRlbnREZXRhaWwuaXRlbXNbaV0uY29udGVudERldGFpbHMudmlkZW9JZDtcclxuICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKHZpZGVvSUQpO1xyXG5cclxuICAgICAgICAgICAgICAgIHByb21pc2VzQXJyLnB1c2goZ2V0VmlkZW9Db250ZW50RGV0YWlsc0Zyb21WaWRlb0lEKHZpZGVvSUQpKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIC8vd2hlbiBldmVyeSBwcm9taXNlcyBoYXMgYmVlbiByZXNvbHZlZCwgc3VtIHVwIHRoZSBkdXJhdGlvbnNcclxuICAgICAgICAgICAgICAgIGNvbnN0IHZpZGVvRGF0YXMgPSBhd2FpdCBQcm9taXNlLmFsbChwcm9taXNlc0Fycik7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHZpZGVvRGF0YXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgICAgICBjb3VudFRvdGFsVmlkKys7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vKmlmIHRoZSB2aWRlbyBpcyBwcml2YXRlICwgdGhlbiBpdCB3b250IGhhdmUgYW55IGl0ZW1zXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHZpZGVvRGF0YXNbaV0uaXRlbXMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvdW50UHVibGljVmlkKys7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgY3VyckR1cmF0aW9uID0gcGFyc2VJU084NjAxRHVyYXRpb24oXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2aWRlb0RhdGFzW2ldLml0ZW1zWzBdLmNvbnRlbnREZXRhaWxzLmR1cmF0aW9uXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0b3RhbER1cmF0aW9uID0gYWRkRHVyYXRpb25zKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdG90YWxEdXJhdGlvbixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJEdXJhdGlvblxyXG4gICAgICAgICAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUuZXJyb3IoXCJFUlJPUiBpbiBmZXRjaGluZyB2aWRlbyBjb250ZW50RGV0YWlscyA6IFwiICsgZXJyb3IpO1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgZXJyb3I7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vKklNUE9SVEFOVCA6IEdvIHRvIG5leHQgcGFnZV9fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19cclxuICAgICAgICAgICAgY3VyclBhZ2VUb2tlbiA9IHBsYXlsaXN0Q29udGVudERldGFpbC5uZXh0UGFnZVRva2VuO1xyXG4gICAgICAgICAgICAvLypfX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX1xyXG4gICAgICAgICAgICAvLypfX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX1xyXG4gICAgICAgICAgICAvLypfX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX1xyXG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXHJcbiAgICAgICAgICAgICAgICBcIkVSUk9SIGluIGZldGNoaW5nIHBsYXlsaXN0IHBhZ2UgY29udGVudERldGFpbHM6IFwiICsgZXJyb3JcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgdGhyb3cgZXJyb3I7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgdG90YWxEdXJhdGlvbjogdG90YWxEdXJhdGlvbixcclxuICAgICAgICBjb3VudFRvdGFsVmlkOiBjb3VudFRvdGFsVmlkLFxyXG4gICAgICAgIGNvdW50UHVibGljVmlkOiBjb3VudFB1YmxpY1ZpZCxcclxuICAgIH07XHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIGdldFBsYXlsaXN0RHVyYXRpb25Gcm9tVVJMKFVSTCkge1xyXG4gICAgLy8gY29uc29sZS5sb2coXCJpbnNpZGUgZ2V0UGxheWxpc3REdXJhdGlvbkZyb21VUkxcIik7XHJcblxyXG4gICAgLy9yZW1vdmUgc3BhY2VzIGZyb20gc3RhcnQgYW5kIGVuZFxyXG4gICAgVVJMID0gVVJMLnRyaW0oKTtcclxuXHJcbiAgICBpZiAoIWlzWW91dFR1YmVVUkxWYWxpZChVUkwpKSB7XHJcbiAgICAgICAgLy8gY29uc29sZS5sb2coXCJFcnJvciBpbiBnZXRQbGF5bGlzdER1cmF0aW9uKCkgOiBOb3QgYW4gWW91VHViZSBVUkxcIik7XHJcbiAgICAgICAgY29uc29sZS5lcnJvcihcIkVycm9yIGluIGdldFBsYXlsaXN0RHVyYXRpb24oKSA6IE5vdCBhbiBZb3VUdWJlIFVSTCA6KVwiKTtcclxuICAgICAgICAvLyBjb25zb2xlLmxvZyhuZXcgRXJyb3IoXCJpbnZhbGlkVVJMXCIpLm1lc3NhZ2UpO1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcImludmFsaWRVUkxcIik7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgcGxheWxpc3RJRCA9IGdldFBsYXlsaXN0SURGcm9tWW91VHViZVVSTChVUkwpO1xyXG4gICAgY29uc29sZS5sb2coXCJwbGF5bGlzdCBJRCBcIiArIHBsYXlsaXN0SUQpO1xyXG5cclxuICAgIHRyeSB7XHJcbiAgICAgICAgY29uc3QgeyB0b3RhbER1cmF0aW9uLCBjb3VudFRvdGFsVmlkLCBjb3VudFB1YmxpY1ZpZCB9ID1cclxuICAgICAgICAgICAgYXdhaXQgZ2V0VG90YWxEdXJhdGlvbkZyb21QbGF5bGlzdElEKHBsYXlsaXN0SUQpO1xyXG5cclxuICAgICAgICBjb25zb2xlLmxvZyhcIkZyb20gQ29udGVudCBTY3JpcHQgOiBUb3RhbCBEdXJhdGlvbiBPYmplY3QgOiBcIik7XHJcbiAgICAgICAgY29uc29sZS5sb2codG90YWxEdXJhdGlvbik7XHJcblxyXG4gICAgICAgIC8vIGNvbnN0IHRvdGFsRHVyYXRpb25TdHJpbmcgPSBkdXJhdGlvbk9iamVjdFRvU3RyaW5nKHRvdGFsRHVyYXRpb24pO1xyXG4gICAgICAgIC8vIGNvbnNvbGUubG9nKFwidG90YWwgZHVyYXRpb24gOiBcIiArIHRvdGFsRHVyYXRpb25TdHJpbmcpO1xyXG4gICAgICAgIC8vIGNvbnNvbGUubG9nKFwiVG90YWwgdmlkZW9zIDogXCIgKyBjb3VudFRvdGFsVmlkKTtcclxuICAgICAgICAvLyBjb25zb2xlLmxvZyhgVG90YWwgUHVibGljIHZpZGVvcyA6ICR7Y291bnRQdWJsaWNWaWR9YCk7XHJcblxyXG4gICAgICAgIHJldHVybiB7IHBsYXlsaXN0SUQsIHRvdGFsRHVyYXRpb24sIGNvdW50VG90YWxWaWQsIGNvdW50UHVibGljVmlkIH07XHJcbiAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoXCJFUlJPUiBpbiBnZXRQbGF5bGlzdER1cmF0aW9uKCk6IFwiICsgZXJyb3IpO1xyXG5cclxuICAgICAgICB0aHJvdyBlcnJvcjtcclxuICAgIH1cclxufVxyXG4vL1xyXG4vL1xyXG5cclxuLy9cclxuLy9cclxuLy9cclxuLy9cclxuXHJcbi8vXHJcbi8vXHJcbi8vXHJcbi8vXHJcbi8vXHJcbi8vXHJcbi8vXHJcbi8vXHJcbi8vXHJcbi8vXHJcbi8vXHJcbi8vXHJcbi8vXHJcbi8vXHJcblxyXG4vLypERVNDUklQVElPTjpfX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19cclxuXHJcbi8vKldoZW4gdGhlIHBvcHVwIHNjcmlwdCBzZW5kcyBtZXNzYWdlIChyZXF1ZXN0ID09PSBcInNlbmREdXJhdGlvblBsejopXCIpIGFza2luZyBmb3IgdG90YWwgZHVyYXRpb24gb2YgdGhlIGN1cnJlbnQgdGFiLCB0aGlzIGV2ZW50IGlzIGZpcmVkXHJcbi8vKnRoZSBjYWxsYmFjayBmdW5jdGlvbiByZXR1cm5zIGFuIG9iamVjdCAoe3N0YXR1cyAsIGRhdGF9KVxyXG5cclxuLy8qc3RhdHVzIDogXCJkb25lXCIgICA9PiBtZWFucyB0b3RhbCBkdXJhdGlvbiBvZiB0aGUgcGxheWxpc3QgaGFkIGJlZW4gY2FsY3VsYXRlZCB0aHJvdWdoIHlvdXR1YmUgQVBJIGNhbGxzICwgYW5kIGRhdGEgaXMgc2VudCB3aGljaCBpcyAoe2NvdW50UHVibGljVmlkLCBjb3VudFRvdGFsVmlkICwgcGxheWxpc3RJRCwgdG90YWxEdXJhdGlvbiwgdG90YWxEdXJhdGlvblN0cmluZ30pXHJcblxyXG4vLypzdGF0dXMgOiAgXCJhbHJlYWR5Q29tcHV0ZWRcIiAgICA9PiBtZWFucyB0b3RhbCBkdXJhdGlvbiBvZm9yIHRoaXMgVVJMIGhhZCBhbHJlYWR5IGJlZW4gY2FsY3VsYXRlZCBwcmV2aW91c2x5LCAgc28gcHJldmlvdXMgc3RvcmVkIFwiZGF0YVwiIGlzIHNlbnQgd2hpY2ggaXMgKHtjb3VudFB1YmxpY1ZpZCwgY291bnRUb3RhbFZpZCAsIHBsYXlsaXN0SUQsIHRvdGFsRHVyYXRpb24sIHRvdGFsRHVyYXRpb25TdHJpbmd9KVxyXG5cclxuLy8qc3RhdHVzIDogXCJub3RWYWxpZFlvdVR1YmVQbGF5bGlzdFVSTFwiICAgPT4gbWVhbnMgdGhlIGN1cnJlbnQgdGFiJ3MgVVJMIGlzIG5vdCBhIHZhbGlkICB5b3V0dWJlIHBsYXlsaXN0IFVSTFxyXG5cclxuLy8qc3RhdHVzIDogXCJxdW90YUV4Y2VlZGVkXCIgICA9PiBtZWFucyB0aGUgY3VycmVudCBBUEkga2V5J3MgcXVvdGEgZm9yIHRvZGF5IGhhcyBleGNlZWRlZFxyXG5cclxuY2hyb21lLnJ1bnRpbWUub25NZXNzYWdlLmFkZExpc3RlbmVyKGZ1bmN0aW9uIChyZXF1ZXN0LCBzZW5kZXIsIHNlbmRSZXNwb25zZSkge1xyXG4gICAgLy8gY29uc29sZS5sb2coXCJNZXNzYWdlIHJlY2lldmVkIGluIGNvbnRlbnQgc2NyaXB0XCIpO1xyXG5cclxuICAgIC8vKmlmIG1lc3NhZ2UgaXMgc2VudCBmcm9tIGV4dGVuc2lvbiwgbm90IGZyb20gYW55IHRhYlxyXG4gICAgaWYgKCFzZW5kZXIudGFiKSB7XHJcbiAgICAgICAgLy8gY29uc29sZS5sb2coXCJtZXNzYWdlIGZyb20gZXh0ZW5zaW9uICA6IFwiICsgcmVxdWVzdCk7XHJcblxyXG4gICAgICAgIGxldCBtZXNzYWdlVG9CZVNlbnQgPSB7IHN0YXR1czogXCJub25lXCIgfTtcclxuXHJcbiAgICAgICAgaWYgKHJlcXVlc3QgPT09IFwic2VuZER1cmF0aW9uUGx6OilcIikge1xyXG4gICAgICAgICAgICBsZXQgY3VyclRhYlVSTCA9IGxvY2F0aW9uLmhyZWY7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiY3VyclRhYlVSTCBpbiBjb250ZW50IHNjcmlwdCA6IFwiICsgY3VyclRhYlVSTCk7XHJcblxyXG4gICAgICAgICAgICBpZiAoIWN1cnJUYWJVUkwgfHwgIWlzWW91dFR1YmVVUkxWYWxpZChjdXJyVGFiVVJMKSkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJOT1QgYW4gWW91VHViZSBVUkxcIik7XHJcbiAgICAgICAgICAgICAgICBtZXNzYWdlVG9CZVNlbnQgPSB7IHN0YXR1czogXCJub3RWYWxpZFlvdVR1YmVQbGF5bGlzdFVSTFwiIH07XHJcblxyXG4gICAgICAgICAgICAgICAgc2VuZFJlc3BvbnNlKG1lc3NhZ2VUb0JlU2VudCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoY3VyclRhYlVSTCAmJiBjdXJyVGFiVVJMID09PSBjdXJyVVJMKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIkFscmVhZHkgY29tcHV0ZWQgZHVyYXRpb24gZm9yIHRoaXMgVVJMICAgOilcIik7XHJcbiAgICAgICAgICAgICAgICBtZXNzYWdlVG9CZVNlbnQgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzOiBcImFscmVhZHlDb21wdXRlZFwiLFxyXG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IGN1cnJEdXJhdGlvbk9iamVjdCxcclxuICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAgICAgc2VuZFJlc3BvbnNlKG1lc3NhZ2VUb0JlU2VudCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy8qIGVsc2UgOiBEaXNwbGF5IHBsYXlsaXN0IER1cmF0aW9uXHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgY3VyclVSTCA9IGN1cnJUYWJVUkw7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8qYXdhaXQgaW5zaWRlIHRyeSBjYXRjaCB3YXMgbm90IHdvcmtpbmcgLCBidXQgLnRoZW4uY2F0Y2ggd29ya2VkIGR1bm5vIHdoeSA6KSAsIHNvIHVzaW5nIC50aGVuLmNhdGNoIGV6elxyXG5cclxuICAgICAgICAgICAgICAgIGdldFBsYXlsaXN0RHVyYXRpb25Gcm9tVVJMKGN1cnJVUkwpXHJcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY3VyckR1cmF0aW9uT2JqZWN0ID0gZGF0YTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY3VyckR1cmF0aW9uT2JqZWN0W1widG90YWxEdXJhdGlvblN0cmluZ1wiXSA9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkdXJhdGlvbk9iamVjdFRvU3RyaW5nKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJEdXJhdGlvbk9iamVjdC50b3RhbER1cmF0aW9uXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZVRvQmVTZW50ID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhdHVzOiBcImRvbmVcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IGN1cnJEdXJhdGlvbk9iamVjdCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbmRSZXNwb25zZShtZXNzYWdlVG9CZVNlbnQpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgLmNhdGNoKGZ1bmN0aW9uIChlcnJvcikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiRVJST1IgaW4gdXBkYXRlUmVzdWx0KCk6IFwiICsgZXJyb3IpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZXJyb3IubWVzc2FnZSA9PT0gXCJxdW90YUV4Y2VlZGVkXCIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiQVBJIGtleSdzIHF1b3RhIGV4Y2VlZGVkXCIpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2VUb0JlU2VudCA9IHsgc3RhdHVzOiBcInF1b3RhRXhjZWVkZWRcIiB9O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VuZFJlc3BvbnNlKG1lc3NhZ2VUb0JlU2VudCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoZXJyb3IubWVzc2FnZSA9PT0gXCJpbnZhbGlkVVJMXCIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2VUb0JlU2VudCA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGF0dXM6IFwibm90VmFsaWRZb3VUdWJlUGxheWxpc3RVUkxcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZW5kUmVzcG9uc2UobWVzc2FnZVRvQmVTZW50KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwic29tZXRoaW5nIHdvcm5nICwgRXJyb3IgOiBcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGVycm9yKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2VUb0JlU2VudCA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGF0dXM6IFwibm90VmFsaWRZb3VUdWJlUGxheWxpc3RVUkxcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZW5kUmVzcG9uc2UobWVzc2FnZVRvQmVTZW50KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB0cnVlO1xyXG59KTtcclxuIl0sIm5hbWVzIjpbInJlZ2VuZXJhdG9yUnVudGltZSIsImNvbnNvbGUiLCJsb2ciLCJteUFQSUtleSIsImN1cnJVUkwiLCJjdXJyRHVyYXRpb25PYmplY3QiLCJwYXJzZUlTTzg2MDFEdXJhdGlvbiIsImlzbzg2MDFEdXJhdGlvbiIsImlzbzg2MDFEdXJhdGlvblJlZ2V4IiwibWF0Y2hlcyIsIm1hdGNoIiwic2lnbiIsInVuZGVmaW5lZCIsInllYXJzIiwiTnVtYmVyIiwibW9udGhzIiwid2Vla3MiLCJkYXlzIiwiaG91cnMiLCJtaW51dGVzIiwic2Vjb25kcyIsImFkZER1cmF0aW9ucyIsImR1cmF0aW9uMSIsImR1cmF0aW9uMiIsInRvdGFsWWVhcnMiLCJ0b3RhbE1vbnRocyIsInRvdGFsV2Vla3MiLCJ0b3RhbERheXMiLCJ0b3RhbEhvdXJzIiwidG90YWxNaW51dGVzIiwidG90YWxTZWNvbmRzIiwiTWF0aCIsImZsb29yIiwiaXNZb3V0VHViZVVSTFZhbGlkIiwidXJsIiwicmVnRXhwIiwibGVuZ3RoIiwiZ2V0UGxheWxpc3RJREZyb21Zb3VUdWJlVVJMIiwicmVnIiwiUmVnRXhwIiwiZXhlYyIsImZldGNoSlNPTiIsImVycm9yTWVzc2FnZSIsImZldGNoIiwidGhlbiIsInJlc3BvbnNlIiwib2siLCJqc29uIiwic3RhdHVzIiwiRXJyb3IiLCJnZXRQbGF5bGlzdENvbnRlbnREZXRhaWxzRnJvbVBsYXlsaXN0SUQiLCJwbGF5bGlzdElEIiwicGFnZVRva2VuIiwiZGF0YSIsImdldFZpZGVvQ29udGVudERldGFpbHNGcm9tVmlkZW9JRCIsInZpZGVvSUQiLCJkdXJhdGlvbk9iamVjdFRvU3RyaW5nIiwiZHVyYXRpb24iLCJ0b3RhbER1cmF0aW9uIiwidGV4dCIsInN1YnN0cmluZyIsImdldFRvdGFsRHVyYXRpb25Gcm9tUGxheWxpc3RJRCIsImNvdW50VG90YWxWaWQiLCJjb3VudFB1YmxpY1ZpZCIsImZldGNoaW5nRmlyc3RQYWdlIiwiY3VyclBhZ2VUb2tlbiIsInBsYXlsaXN0Q29udGVudERldGFpbCIsInByb21pc2VzQXJyIiwiaSIsIml0ZW1zIiwiY29udGVudERldGFpbHMiLCJ2aWRlb0lkIiwicHVzaCIsIlByb21pc2UiLCJhbGwiLCJ2aWRlb0RhdGFzIiwiY3VyckR1cmF0aW9uIiwibmV4dFBhZ2VUb2tlbiIsImVycm9yIiwiZ2V0UGxheWxpc3REdXJhdGlvbkZyb21VUkwiLCJVUkwiLCJ0cmltIiwiY2hyb21lIiwicnVudGltZSIsIm9uTWVzc2FnZSIsImFkZExpc3RlbmVyIiwicmVxdWVzdCIsInNlbmRlciIsInNlbmRSZXNwb25zZSIsInRhYiIsIm1lc3NhZ2VUb0JlU2VudCIsImN1cnJUYWJVUkwiLCJsb2NhdGlvbiIsImhyZWYiLCJtZXNzYWdlIl0sInNvdXJjZVJvb3QiOiIifQ==
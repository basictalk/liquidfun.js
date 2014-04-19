// Note: For maximum-speed code, see "Optimizing Code" on the Emscripten wiki, https://github.com/kripken/emscripten/wiki/Optimizing-Code
// Note: Some Emscripten settings may limit the speed of the generated code.
// The Module object: Our interface to the outside world. We import
// and export values on it, and do the work to get that through
// closure compiler if necessary. There are various ways Module can be used:
// 1. Not defined. We create it here
// 2. A function parameter, function(Module) { ..generated code.. }
// 3. pre-run appended it, var Module = {}; ..generated code..
// 4. External script tag defines var Module.
// We need to do an eval in order to handle the closure compiler
// case, where this code here is minified but Module was defined
// elsewhere (e.g. case 4 above). We also need to check if Module
// already exists (e.g. case 3 above).
// Note that if you want to run closure, and also to use Module
// after the generated code, you will need to define   var Module = {};
// before the code. Then that object will be used in the code, and you
// can continue to use Module afterwards as well.
var Module;
if (!Module) Module = eval('(function() { try { return Module || {} } catch(e) { return {} } })()');

// Sometimes an existing Module object exists with properties
// meant to overwrite the default module functionality. Here
// we collect those properties and reapply _after_ we configure
// the current environment's defaults to avoid having to be so
// defensive during initialization.
var moduleOverrides = {};
for (var key in Module) {
  if (Module.hasOwnProperty(key)) {
    moduleOverrides[key] = Module[key];
  }
}

// The environment setup code below is customized to use Module.
// *** Environment setup code ***
var ENVIRONMENT_IS_NODE = typeof process === 'object' && typeof require === 'function';
var ENVIRONMENT_IS_WEB = typeof window === 'object';
var ENVIRONMENT_IS_WORKER = typeof importScripts === 'function';
var ENVIRONMENT_IS_SHELL = !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_WORKER;

if (ENVIRONMENT_IS_NODE) {
  // Expose functionality in the same simple way that the shells work
  // Note that we pollute the global namespace here, otherwise we break in node
  if (!Module['print']) Module['print'] = function print(x) {
    process['stdout'].write(x + '\n');
  };
  if (!Module['printErr']) Module['printErr'] = function printErr(x) {
    process['stderr'].write(x + '\n');
  };

  var nodeFS = require('fs');
  var nodePath = require('path');

  Module['read'] = function read(filename, binary) {
    filename = nodePath['normalize'](filename);
    var ret = nodeFS['readFileSync'](filename);
    // The path is absolute if the normalized version is the same as the resolved.
    if (!ret && filename != nodePath['resolve'](filename)) {
      filename = path.join(__dirname, '..', 'src', filename);
      ret = nodeFS['readFileSync'](filename);
    }
    if (ret && !binary) ret = ret.toString();
    return ret;
  };

  Module['readBinary'] = function readBinary(filename) { return Module['read'](filename, true) };

  Module['load'] = function load(f) {
    globalEval(read(f));
  };

  Module['arguments'] = process['argv'].slice(2);

  module['exports'] = Module;
}
else if (ENVIRONMENT_IS_SHELL) {
  if (!Module['print']) Module['print'] = print;
  if (typeof printErr != 'undefined') Module['printErr'] = printErr; // not present in v8 or older sm

  if (typeof read != 'undefined') {
    Module['read'] = read;
  } else {
    Module['read'] = function read() { throw 'no read() available (jsc?)' };
  }

  Module['readBinary'] = function readBinary(f) {
    return read(f, 'binary');
  };

  if (typeof scriptArgs != 'undefined') {
    Module['arguments'] = scriptArgs;
  } else if (typeof arguments != 'undefined') {
    Module['arguments'] = arguments;
  }

  this['Module'] = Module;

  eval("if (typeof gc === 'function' && gc.toString().indexOf('[native code]') > 0) var gc = undefined"); // wipe out the SpiderMonkey shell 'gc' function, which can confuse closure (uses it as a minified name, and it is then initted to a non-falsey value unexpectedly)
}
else if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
  Module['read'] = function read(url) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, false);
    xhr.send(null);
    return xhr.responseText;
  };

  if (typeof arguments != 'undefined') {
    Module['arguments'] = arguments;
  }

  if (typeof console !== 'undefined') {
    if (!Module['print']) Module['print'] = function print(x) {
      console.log(x);
    };
    if (!Module['printErr']) Module['printErr'] = function printErr(x) {
      console.log(x);
    };
  } else {
    // Probably a worker, and without console.log. We can do very little here...
    var TRY_USE_DUMP = false;
    if (!Module['print']) Module['print'] = (TRY_USE_DUMP && (typeof(dump) !== "undefined") ? (function(x) {
      dump(x);
    }) : (function(x) {
      // self.postMessage(x); // enable this if you want stdout to be sent as messages
    }));
  }

  if (ENVIRONMENT_IS_WEB) {
    this['Module'] = Module;
  } else {
    Module['load'] = importScripts;
  }
}
else {
  // Unreachable because SHELL is dependant on the others
  throw 'Unknown runtime environment. Where are we?';
}

function globalEval(x) {
  eval.call(null, x);
}
if (!Module['load'] == 'undefined' && Module['read']) {
  Module['load'] = function load(f) {
    globalEval(Module['read'](f));
  };
}
if (!Module['print']) {
  Module['print'] = function(){};
}
if (!Module['printErr']) {
  Module['printErr'] = Module['print'];
}
if (!Module['arguments']) {
  Module['arguments'] = [];
}
// *** Environment setup code ***

// Closure helpers
Module.print = Module['print'];
Module.printErr = Module['printErr'];

// Callbacks
Module['preRun'] = [];
Module['postRun'] = [];

// Merge back in the overrides
for (var key in moduleOverrides) {
  if (moduleOverrides.hasOwnProperty(key)) {
    Module[key] = moduleOverrides[key];
  }
}



// === Auto-generated preamble library stuff ===

//========================================
// Runtime code shared with compiler
//========================================

var Runtime = {
  stackSave: function () {
    return STACKTOP;
  },
  stackRestore: function (stackTop) {
    STACKTOP = stackTop;
  },
  forceAlign: function (target, quantum) {
    quantum = quantum || 4;
    if (quantum == 1) return target;
    if (isNumber(target) && isNumber(quantum)) {
      return Math.ceil(target/quantum)*quantum;
    } else if (isNumber(quantum) && isPowerOfTwo(quantum)) {
      return '(((' +target + ')+' + (quantum-1) + ')&' + -quantum + ')';
    }
    return 'Math.ceil((' + target + ')/' + quantum + ')*' + quantum;
  },
  isNumberType: function (type) {
    return type in Runtime.INT_TYPES || type in Runtime.FLOAT_TYPES;
  },
  isPointerType: function isPointerType(type) {
  return type[type.length-1] == '*';
},
  isStructType: function isStructType(type) {
  if (isPointerType(type)) return false;
  if (isArrayType(type)) return true;
  if (/<?\{ ?[^}]* ?\}>?/.test(type)) return true; // { i32, i8 } etc. - anonymous struct types
  // See comment in isStructPointerType()
  return type[0] == '%';
},
  INT_TYPES: {"i1":0,"i8":0,"i16":0,"i32":0,"i64":0},
  FLOAT_TYPES: {"float":0,"double":0},
  or64: function (x, y) {
    var l = (x | 0) | (y | 0);
    var h = (Math.round(x / 4294967296) | Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  and64: function (x, y) {
    var l = (x | 0) & (y | 0);
    var h = (Math.round(x / 4294967296) & Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  xor64: function (x, y) {
    var l = (x | 0) ^ (y | 0);
    var h = (Math.round(x / 4294967296) ^ Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  getNativeTypeSize: function (type) {
    switch (type) {
      case 'i1': case 'i8': return 1;
      case 'i16': return 2;
      case 'i32': return 4;
      case 'i64': return 8;
      case 'float': return 4;
      case 'double': return 8;
      default: {
        if (type[type.length-1] === '*') {
          return Runtime.QUANTUM_SIZE; // A pointer
        } else if (type[0] === 'i') {
          var bits = parseInt(type.substr(1));
          assert(bits % 8 === 0);
          return bits/8;
        } else {
          return 0;
        }
      }
    }
  },
  getNativeFieldSize: function (type) {
    return Math.max(Runtime.getNativeTypeSize(type), Runtime.QUANTUM_SIZE);
  },
  dedup: function dedup(items, ident) {
  var seen = {};
  if (ident) {
    return items.filter(function(item) {
      if (seen[item[ident]]) return false;
      seen[item[ident]] = true;
      return true;
    });
  } else {
    return items.filter(function(item) {
      if (seen[item]) return false;
      seen[item] = true;
      return true;
    });
  }
},
  set: function set() {
  var args = typeof arguments[0] === 'object' ? arguments[0] : arguments;
  var ret = {};
  for (var i = 0; i < args.length; i++) {
    ret[args[i]] = 0;
  }
  return ret;
},
  STACK_ALIGN: 8,
  getAlignSize: function (type, size, vararg) {
    // we align i64s and doubles on 64-bit boundaries, unlike x86
    if (vararg) return 8;
    if (!vararg && (type == 'i64' || type == 'double')) return 8;
    if (!type) return Math.min(size, 8); // align structures internally to 64 bits
    return Math.min(size || (type ? Runtime.getNativeFieldSize(type) : 0), Runtime.QUANTUM_SIZE);
  },
  calculateStructAlignment: function calculateStructAlignment(type) {
    type.flatSize = 0;
    type.alignSize = 0;
    var diffs = [];
    var prev = -1;
    var index = 0;
    type.flatIndexes = type.fields.map(function(field) {
      index++;
      var size, alignSize;
      if (Runtime.isNumberType(field) || Runtime.isPointerType(field)) {
        size = Runtime.getNativeTypeSize(field); // pack char; char; in structs, also char[X]s.
        alignSize = Runtime.getAlignSize(field, size);
      } else if (Runtime.isStructType(field)) {
        if (field[1] === '0') {
          // this is [0 x something]. When inside another structure like here, it must be at the end,
          // and it adds no size
          // XXX this happens in java-nbody for example... assert(index === type.fields.length, 'zero-length in the middle!');
          size = 0;
          if (Types.types[field]) {
            alignSize = Runtime.getAlignSize(null, Types.types[field].alignSize);
          } else {
            alignSize = type.alignSize || QUANTUM_SIZE;
          }
        } else {
          size = Types.types[field].flatSize;
          alignSize = Runtime.getAlignSize(null, Types.types[field].alignSize);
        }
      } else if (field[0] == 'b') {
        // bN, large number field, like a [N x i8]
        size = field.substr(1)|0;
        alignSize = 1;
      } else if (field[0] === '<') {
        // vector type
        size = alignSize = Types.types[field].flatSize; // fully aligned
      } else if (field[0] === 'i') {
        // illegal integer field, that could not be legalized because it is an internal structure field
        // it is ok to have such fields, if we just use them as markers of field size and nothing more complex
        size = alignSize = parseInt(field.substr(1))/8;
        assert(size % 1 === 0, 'cannot handle non-byte-size field ' + field);
      } else {
        assert(false, 'invalid type for calculateStructAlignment');
      }
      if (type.packed) alignSize = 1;
      type.alignSize = Math.max(type.alignSize, alignSize);
      var curr = Runtime.alignMemory(type.flatSize, alignSize); // if necessary, place this on aligned memory
      type.flatSize = curr + size;
      if (prev >= 0) {
        diffs.push(curr-prev);
      }
      prev = curr;
      return curr;
    });
    if (type.name_ && type.name_[0] === '[') {
      // arrays have 2 elements, so we get the proper difference. then we scale here. that way we avoid
      // allocating a potentially huge array for [999999 x i8] etc.
      type.flatSize = parseInt(type.name_.substr(1))*type.flatSize/2;
    }
    type.flatSize = Runtime.alignMemory(type.flatSize, type.alignSize);
    if (diffs.length == 0) {
      type.flatFactor = type.flatSize;
    } else if (Runtime.dedup(diffs).length == 1) {
      type.flatFactor = diffs[0];
    }
    type.needsFlattening = (type.flatFactor != 1);
    return type.flatIndexes;
  },
  generateStructInfo: function (struct, typeName, offset) {
    var type, alignment;
    if (typeName) {
      offset = offset || 0;
      type = (typeof Types === 'undefined' ? Runtime.typeInfo : Types.types)[typeName];
      if (!type) return null;
      if (type.fields.length != struct.length) {
        printErr('Number of named fields must match the type for ' + typeName + ': possibly duplicate struct names. Cannot return structInfo');
        return null;
      }
      alignment = type.flatIndexes;
    } else {
      var type = { fields: struct.map(function(item) { return item[0] }) };
      alignment = Runtime.calculateStructAlignment(type);
    }
    var ret = {
      __size__: type.flatSize
    };
    if (typeName) {
      struct.forEach(function(item, i) {
        if (typeof item === 'string') {
          ret[item] = alignment[i] + offset;
        } else {
          // embedded struct
          var key;
          for (var k in item) key = k;
          ret[key] = Runtime.generateStructInfo(item[key], type.fields[i], alignment[i]);
        }
      });
    } else {
      struct.forEach(function(item, i) {
        ret[item[1]] = alignment[i];
      });
    }
    return ret;
  },
  dynCall: function (sig, ptr, args) {
    if (args && args.length) {
      if (!args.splice) args = Array.prototype.slice.call(args);
      args.splice(0, 0, ptr);
      return Module['dynCall_' + sig].apply(null, args);
    } else {
      return Module['dynCall_' + sig].call(null, ptr);
    }
  },
  functionPointers: [],
  addFunction: function (func) {
    for (var i = 0; i < Runtime.functionPointers.length; i++) {
      if (!Runtime.functionPointers[i]) {
        Runtime.functionPointers[i] = func;
        return 2*(1 + i);
      }
    }
    throw 'Finished up all reserved function pointers. Use a higher value for RESERVED_FUNCTION_POINTERS.';
  },
  removeFunction: function (index) {
    Runtime.functionPointers[(index-2)/2] = null;
  },
  getAsmConst: function (code, numArgs) {
    // code is a constant string on the heap, so we can cache these
    if (!Runtime.asmConstCache) Runtime.asmConstCache = {};
    var func = Runtime.asmConstCache[code];
    if (func) return func;
    var args = [];
    for (var i = 0; i < numArgs; i++) {
      args.push(String.fromCharCode(36) + i); // $0, $1 etc
    }
    code = Pointer_stringify(code);
    if (code[0] === '"') {
      // tolerate EM_ASM("..code..") even though EM_ASM(..code..) is correct
      if (code.indexOf('"', 1) === code.length-1) {
        code = code.substr(1, code.length-2);
      } else {
        // something invalid happened, e.g. EM_ASM("..code($0)..", input)
        abort('invalid EM_ASM input |' + code + '|. Please use EM_ASM(..code..) (no quotes) or EM_ASM({ ..code($0).. }, input) (to input values)');
      }
    }
    return Runtime.asmConstCache[code] = eval('(function(' + args.join(',') + '){ ' + code + ' })'); // new Function does not allow upvars in node
  },
  warnOnce: function (text) {
    if (!Runtime.warnOnce.shown) Runtime.warnOnce.shown = {};
    if (!Runtime.warnOnce.shown[text]) {
      Runtime.warnOnce.shown[text] = 1;
      Module.printErr(text);
    }
  },
  funcWrappers: {},
  getFuncWrapper: function (func, sig) {
    assert(sig);
    if (!Runtime.funcWrappers[func]) {
      Runtime.funcWrappers[func] = function dynCall_wrapper() {
        return Runtime.dynCall(sig, func, arguments);
      };
    }
    return Runtime.funcWrappers[func];
  },
  UTF8Processor: function () {
    var buffer = [];
    var needed = 0;
    this.processCChar = function (code) {
      code = code & 0xFF;

      if (buffer.length == 0) {
        if ((code & 0x80) == 0x00) {        // 0xxxxxxx
          return String.fromCharCode(code);
        }
        buffer.push(code);
        if ((code & 0xE0) == 0xC0) {        // 110xxxxx
          needed = 1;
        } else if ((code & 0xF0) == 0xE0) { // 1110xxxx
          needed = 2;
        } else {                            // 11110xxx
          needed = 3;
        }
        return '';
      }

      if (needed) {
        buffer.push(code);
        needed--;
        if (needed > 0) return '';
      }

      var c1 = buffer[0];
      var c2 = buffer[1];
      var c3 = buffer[2];
      var c4 = buffer[3];
      var ret;
      if (buffer.length == 2) {
        ret = String.fromCharCode(((c1 & 0x1F) << 6)  | (c2 & 0x3F));
      } else if (buffer.length == 3) {
        ret = String.fromCharCode(((c1 & 0x0F) << 12) | ((c2 & 0x3F) << 6)  | (c3 & 0x3F));
      } else {
        // http://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
        var codePoint = ((c1 & 0x07) << 18) | ((c2 & 0x3F) << 12) |
                        ((c3 & 0x3F) << 6)  | (c4 & 0x3F);
        ret = String.fromCharCode(
          Math.floor((codePoint - 0x10000) / 0x400) + 0xD800,
          (codePoint - 0x10000) % 0x400 + 0xDC00);
      }
      buffer.length = 0;
      return ret;
    }
    this.processJSString = function processJSString(string) {
      string = unescape(encodeURIComponent(string));
      var ret = [];
      for (var i = 0; i < string.length; i++) {
        ret.push(string.charCodeAt(i));
      }
      return ret;
    }
  },
  getCompilerSetting: function (name) {
    throw 'You must build with -s RETAIN_COMPILER_SETTINGS=1 for Runtime.getCompilerSetting or emscripten_get_compiler_setting to work';
  },
  stackAlloc: function (size) { var ret = STACKTOP;STACKTOP = (STACKTOP + size)|0;STACKTOP = (((STACKTOP)+7)&-8); return ret; },
  staticAlloc: function (size) { var ret = STATICTOP;STATICTOP = (STATICTOP + size)|0;STATICTOP = (((STATICTOP)+7)&-8); return ret; },
  dynamicAlloc: function (size) { var ret = DYNAMICTOP;DYNAMICTOP = (DYNAMICTOP + size)|0;DYNAMICTOP = (((DYNAMICTOP)+7)&-8); if (DYNAMICTOP >= TOTAL_MEMORY) enlargeMemory();; return ret; },
  alignMemory: function (size,quantum) { var ret = size = Math.ceil((size)/(quantum ? quantum : 8))*(quantum ? quantum : 8); return ret; },
  makeBigInt: function (low,high,unsigned) { var ret = (unsigned ? ((+((low>>>0)))+((+((high>>>0)))*(+4294967296))) : ((+((low>>>0)))+((+((high|0)))*(+4294967296)))); return ret; },
  GLOBAL_BASE: 8,
  QUANTUM_SIZE: 4,
  __dummy__: 0
}


Module['Runtime'] = Runtime;









//========================================
// Runtime essentials
//========================================

var __THREW__ = 0; // Used in checking for thrown exceptions.

var ABORT = false; // whether we are quitting the application. no code should run after this. set in exit() and abort()
var EXITSTATUS = 0;

var undef = 0;
// tempInt is used for 32-bit signed values or smaller. tempBigInt is used
// for 32-bit unsigned values or more than 32 bits. TODO: audit all uses of tempInt
var tempValue, tempInt, tempBigInt, tempInt2, tempBigInt2, tempPair, tempBigIntI, tempBigIntR, tempBigIntS, tempBigIntP, tempBigIntD, tempDouble, tempFloat;
var tempI64, tempI64b;
var tempRet0, tempRet1, tempRet2, tempRet3, tempRet4, tempRet5, tempRet6, tempRet7, tempRet8, tempRet9;

function assert(condition, text) {
  if (!condition) {
    abort('Assertion failed: ' + text);
  }
}

var globalScope = this;

// C calling interface. A convenient way to call C functions (in C files, or
// defined with extern "C").
//
// Note: LLVM optimizations can inline and remove functions, after which you will not be
//       able to call them. Closure can also do so. To avoid that, add your function to
//       the exports using something like
//
//         -s EXPORTED_FUNCTIONS='["_main", "_myfunc"]'
//
// @param ident      The name of the C function (note that C++ functions will be name-mangled - use extern "C")
// @param returnType The return type of the function, one of the JS types 'number', 'string' or 'array' (use 'number' for any C pointer, and
//                   'array' for JavaScript arrays and typed arrays; note that arrays are 8-bit).
// @param argTypes   An array of the types of arguments for the function (if there are no arguments, this can be ommitted). Types are as in returnType,
//                   except that 'array' is not possible (there is no way for us to know the length of the array)
// @param args       An array of the arguments to the function, as native JS values (as in returnType)
//                   Note that string arguments will be stored on the stack (the JS string will become a C string on the stack).
// @return           The return value, as a native JS value (as in returnType)
function ccall(ident, returnType, argTypes, args) {
  return ccallFunc(getCFunc(ident), returnType, argTypes, args);
}
Module["ccall"] = ccall;

// Returns the C function with a specified identifier (for C++, you need to do manual name mangling)
function getCFunc(ident) {
  try {
    var func = Module['_' + ident]; // closure exported function
    if (!func) func = eval('_' + ident); // explicit lookup
  } catch(e) {
  }
  assert(func, 'Cannot call unknown function ' + ident + ' (perhaps LLVM optimizations or closure removed it?)');
  return func;
}

// Internal function that does a C call using a function, not an identifier
function ccallFunc(func, returnType, argTypes, args) {
  var stack = 0;
  function toC(value, type) {
    if (type == 'string') {
      if (value === null || value === undefined || value === 0) return 0; // null string
      value = intArrayFromString(value);
      type = 'array';
    }
    if (type == 'array') {
      if (!stack) stack = Runtime.stackSave();
      var ret = Runtime.stackAlloc(value.length);
      writeArrayToMemory(value, ret);
      return ret;
    }
    return value;
  }
  function fromC(value, type) {
    if (type == 'string') {
      return Pointer_stringify(value);
    }
    assert(type != 'array');
    return value;
  }
  var i = 0;
  var cArgs = args ? args.map(function(arg) {
    return toC(arg, argTypes[i++]);
  }) : [];
  var ret = fromC(func.apply(null, cArgs), returnType);
  if (stack) Runtime.stackRestore(stack);
  return ret;
}

// Returns a native JS wrapper for a C function. This is similar to ccall, but
// returns a function you can call repeatedly in a normal way. For example:
//
//   var my_function = cwrap('my_c_function', 'number', ['number', 'number']);
//   alert(my_function(5, 22));
//   alert(my_function(99, 12));
//
function cwrap(ident, returnType, argTypes) {
  var func = getCFunc(ident);
  return function() {
    return ccallFunc(func, returnType, argTypes, Array.prototype.slice.call(arguments));
  }
}
Module["cwrap"] = cwrap;

// Sets a value in memory in a dynamic way at run-time. Uses the
// type data. This is the same as makeSetValue, except that
// makeSetValue is done at compile-time and generates the needed
// code then, whereas this function picks the right code at
// run-time.
// Note that setValue and getValue only do *aligned* writes and reads!
// Note that ccall uses JS types as for defining types, while setValue and
// getValue need LLVM types ('i8', 'i32') - this is a lower-level operation
function setValue(ptr, value, type, noSafe) {
  type = type || 'i8';
  if (type.charAt(type.length-1) === '*') type = 'i32'; // pointers are 32-bit
    switch(type) {
      case 'i1': HEAP8[(ptr)]=value; break;
      case 'i8': HEAP8[(ptr)]=value; break;
      case 'i16': HEAP16[((ptr)>>1)]=value; break;
      case 'i32': HEAP32[((ptr)>>2)]=value; break;
      case 'i64': (tempI64 = [value>>>0,(tempDouble=value,(+(Math_abs(tempDouble))) >= (+1) ? (tempDouble > (+0) ? ((Math_min((+(Math_floor((tempDouble)/(+4294967296)))), (+4294967295)))|0)>>>0 : (~~((+(Math_ceil((tempDouble - +(((~~(tempDouble)))>>>0))/(+4294967296))))))>>>0) : 0)],HEAP32[((ptr)>>2)]=tempI64[0],HEAP32[(((ptr)+(4))>>2)]=tempI64[1]); break;
      case 'float': HEAPF32[((ptr)>>2)]=value; break;
      case 'double': HEAPF64[((ptr)>>3)]=value; break;
      default: abort('invalid type for setValue: ' + type);
    }
}
Module['setValue'] = setValue;

// Parallel to setValue.
function getValue(ptr, type, noSafe) {
  type = type || 'i8';
  if (type.charAt(type.length-1) === '*') type = 'i32'; // pointers are 32-bit
    switch(type) {
      case 'i1': return HEAP8[(ptr)];
      case 'i8': return HEAP8[(ptr)];
      case 'i16': return HEAP16[((ptr)>>1)];
      case 'i32': return HEAP32[((ptr)>>2)];
      case 'i64': return HEAP32[((ptr)>>2)];
      case 'float': return HEAPF32[((ptr)>>2)];
      case 'double': return HEAPF64[((ptr)>>3)];
      default: abort('invalid type for setValue: ' + type);
    }
  return null;
}
Module['getValue'] = getValue;

var ALLOC_NORMAL = 0; // Tries to use _malloc()
var ALLOC_STACK = 1; // Lives for the duration of the current function call
var ALLOC_STATIC = 2; // Cannot be freed
var ALLOC_DYNAMIC = 3; // Cannot be freed except through sbrk
var ALLOC_NONE = 4; // Do not allocate
Module['ALLOC_NORMAL'] = ALLOC_NORMAL;
Module['ALLOC_STACK'] = ALLOC_STACK;
Module['ALLOC_STATIC'] = ALLOC_STATIC;
Module['ALLOC_DYNAMIC'] = ALLOC_DYNAMIC;
Module['ALLOC_NONE'] = ALLOC_NONE;

// allocate(): This is for internal use. You can use it yourself as well, but the interface
//             is a little tricky (see docs right below). The reason is that it is optimized
//             for multiple syntaxes to save space in generated code. So you should
//             normally not use allocate(), and instead allocate memory using _malloc(),
//             initialize it with setValue(), and so forth.
// @slab: An array of data, or a number. If a number, then the size of the block to allocate,
//        in *bytes* (note that this is sometimes confusing: the next parameter does not
//        affect this!)
// @types: Either an array of types, one for each byte (or 0 if no type at that position),
//         or a single type which is used for the entire block. This only matters if there
//         is initial data - if @slab is a number, then this does not matter at all and is
//         ignored.
// @allocator: How to allocate memory, see ALLOC_*
function allocate(slab, types, allocator, ptr) {
  var zeroinit, size;
  if (typeof slab === 'number') {
    zeroinit = true;
    size = slab;
  } else {
    zeroinit = false;
    size = slab.length;
  }

  var singleType = typeof types === 'string' ? types : null;

  var ret;
  if (allocator == ALLOC_NONE) {
    ret = ptr;
  } else {
    ret = [_malloc, Runtime.stackAlloc, Runtime.staticAlloc, Runtime.dynamicAlloc][allocator === undefined ? ALLOC_STATIC : allocator](Math.max(size, singleType ? 1 : types.length));
  }

  if (zeroinit) {
    var ptr = ret, stop;
    assert((ret & 3) == 0);
    stop = ret + (size & ~3);
    for (; ptr < stop; ptr += 4) {
      HEAP32[((ptr)>>2)]=0;
    }
    stop = ret + size;
    while (ptr < stop) {
      HEAP8[((ptr++)|0)]=0;
    }
    return ret;
  }

  if (singleType === 'i8') {
    if (slab.subarray || slab.slice) {
      HEAPU8.set(slab, ret);
    } else {
      HEAPU8.set(new Uint8Array(slab), ret);
    }
    return ret;
  }

  var i = 0, type, typeSize, previousType;
  while (i < size) {
    var curr = slab[i];

    if (typeof curr === 'function') {
      curr = Runtime.getFunctionIndex(curr);
    }

    type = singleType || types[i];
    if (type === 0) {
      i++;
      continue;
    }

    if (type == 'i64') type = 'i32'; // special case: we have one i32 here, and one i32 later

    setValue(ret+i, curr, type);

    // no need to look up size unless type changes, so cache it
    if (previousType !== type) {
      typeSize = Runtime.getNativeTypeSize(type);
      previousType = type;
    }
    i += typeSize;
  }

  return ret;
}
Module['allocate'] = allocate;

function Pointer_stringify(ptr, /* optional */ length) {
  // TODO: use TextDecoder
  // Find the length, and check for UTF while doing so
  var hasUtf = false;
  var t;
  var i = 0;
  while (1) {
    t = HEAPU8[(((ptr)+(i))|0)];
    if (t >= 128) hasUtf = true;
    else if (t == 0 && !length) break;
    i++;
    if (length && i == length) break;
  }
  if (!length) length = i;

  var ret = '';

  if (!hasUtf) {
    var MAX_CHUNK = 1024; // split up into chunks, because .apply on a huge string can overflow the stack
    var curr;
    while (length > 0) {
      curr = String.fromCharCode.apply(String, HEAPU8.subarray(ptr, ptr + Math.min(length, MAX_CHUNK)));
      ret = ret ? ret + curr : curr;
      ptr += MAX_CHUNK;
      length -= MAX_CHUNK;
    }
    return ret;
  }

  var utf8 = new Runtime.UTF8Processor();
  for (i = 0; i < length; i++) {
    t = HEAPU8[(((ptr)+(i))|0)];
    ret += utf8.processCChar(t);
  }
  return ret;
}
Module['Pointer_stringify'] = Pointer_stringify;

// Given a pointer 'ptr' to a null-terminated UTF16LE-encoded string in the emscripten HEAP, returns
// a copy of that string as a Javascript String object.
function UTF16ToString(ptr) {
  var i = 0;

  var str = '';
  while (1) {
    var codeUnit = HEAP16[(((ptr)+(i*2))>>1)];
    if (codeUnit == 0)
      return str;
    ++i;
    // fromCharCode constructs a character from a UTF-16 code unit, so we can pass the UTF16 string right through.
    str += String.fromCharCode(codeUnit);
  }
}
Module['UTF16ToString'] = UTF16ToString;

// Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr',
// null-terminated and encoded in UTF16LE form. The copy will require at most (str.length*2+1)*2 bytes of space in the HEAP.
function stringToUTF16(str, outPtr) {
  for(var i = 0; i < str.length; ++i) {
    // charCodeAt returns a UTF-16 encoded code unit, so it can be directly written to the HEAP.
    var codeUnit = str.charCodeAt(i); // possibly a lead surrogate
    HEAP16[(((outPtr)+(i*2))>>1)]=codeUnit;
  }
  // Null-terminate the pointer to the HEAP.
  HEAP16[(((outPtr)+(str.length*2))>>1)]=0;
}
Module['stringToUTF16'] = stringToUTF16;

// Given a pointer 'ptr' to a null-terminated UTF32LE-encoded string in the emscripten HEAP, returns
// a copy of that string as a Javascript String object.
function UTF32ToString(ptr) {
  var i = 0;

  var str = '';
  while (1) {
    var utf32 = HEAP32[(((ptr)+(i*4))>>2)];
    if (utf32 == 0)
      return str;
    ++i;
    // Gotcha: fromCharCode constructs a character from a UTF-16 encoded code (pair), not from a Unicode code point! So encode the code point to UTF-16 for constructing.
    if (utf32 >= 0x10000) {
      var ch = utf32 - 0x10000;
      str += String.fromCharCode(0xD800 | (ch >> 10), 0xDC00 | (ch & 0x3FF));
    } else {
      str += String.fromCharCode(utf32);
    }
  }
}
Module['UTF32ToString'] = UTF32ToString;

// Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr',
// null-terminated and encoded in UTF32LE form. The copy will require at most (str.length+1)*4 bytes of space in the HEAP,
// but can use less, since str.length does not return the number of characters in the string, but the number of UTF-16 code units in the string.
function stringToUTF32(str, outPtr) {
  var iChar = 0;
  for(var iCodeUnit = 0; iCodeUnit < str.length; ++iCodeUnit) {
    // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code unit, not a Unicode code point of the character! We must decode the string to UTF-32 to the heap.
    var codeUnit = str.charCodeAt(iCodeUnit); // possibly a lead surrogate
    if (codeUnit >= 0xD800 && codeUnit <= 0xDFFF) {
      var trailSurrogate = str.charCodeAt(++iCodeUnit);
      codeUnit = 0x10000 + ((codeUnit & 0x3FF) << 10) | (trailSurrogate & 0x3FF);
    }
    HEAP32[(((outPtr)+(iChar*4))>>2)]=codeUnit;
    ++iChar;
  }
  // Null-terminate the pointer to the HEAP.
  HEAP32[(((outPtr)+(iChar*4))>>2)]=0;
}
Module['stringToUTF32'] = stringToUTF32;

function demangle(func) {
  var i = 3;
  // params, etc.
  var basicTypes = {
    'v': 'void',
    'b': 'bool',
    'c': 'char',
    's': 'short',
    'i': 'int',
    'l': 'long',
    'f': 'float',
    'd': 'double',
    'w': 'wchar_t',
    'a': 'signed char',
    'h': 'unsigned char',
    't': 'unsigned short',
    'j': 'unsigned int',
    'm': 'unsigned long',
    'x': 'long long',
    'y': 'unsigned long long',
    'z': '...'
  };
  var subs = [];
  var first = true;
  function dump(x) {
    //return;
    if (x) Module.print(x);
    Module.print(func);
    var pre = '';
    for (var a = 0; a < i; a++) pre += ' ';
    Module.print (pre + '^');
  }
  function parseNested() {
    i++;
    if (func[i] === 'K') i++; // ignore const
    var parts = [];
    while (func[i] !== 'E') {
      if (func[i] === 'S') { // substitution
        i++;
        var next = func.indexOf('_', i);
        var num = func.substring(i, next) || 0;
        parts.push(subs[num] || '?');
        i = next+1;
        continue;
      }
      if (func[i] === 'C') { // constructor
        parts.push(parts[parts.length-1]);
        i += 2;
        continue;
      }
      var size = parseInt(func.substr(i));
      var pre = size.toString().length;
      if (!size || !pre) { i--; break; } // counter i++ below us
      var curr = func.substr(i + pre, size);
      parts.push(curr);
      subs.push(curr);
      i += pre + size;
    }
    i++; // skip E
    return parts;
  }
  function parse(rawList, limit, allowVoid) { // main parser
    limit = limit || Infinity;
    var ret = '', list = [];
    function flushList() {
      return '(' + list.join(', ') + ')';
    }
    var name;
    if (func[i] === 'N') {
      // namespaced N-E
      name = parseNested().join('::');
      limit--;
      if (limit === 0) return rawList ? [name] : name;
    } else {
      // not namespaced
      if (func[i] === 'K' || (first && func[i] === 'L')) i++; // ignore const and first 'L'
      var size = parseInt(func.substr(i));
      if (size) {
        var pre = size.toString().length;
        name = func.substr(i + pre, size);
        i += pre + size;
      }
    }
    first = false;
    if (func[i] === 'I') {
      i++;
      var iList = parse(true);
      var iRet = parse(true, 1, true);
      ret += iRet[0] + ' ' + name + '<' + iList.join(', ') + '>';
    } else {
      ret = name;
    }
    paramLoop: while (i < func.length && limit-- > 0) {
      //dump('paramLoop');
      var c = func[i++];
      if (c in basicTypes) {
        list.push(basicTypes[c]);
      } else {
        switch (c) {
          case 'P': list.push(parse(true, 1, true)[0] + '*'); break; // pointer
          case 'R': list.push(parse(true, 1, true)[0] + '&'); break; // reference
          case 'L': { // literal
            i++; // skip basic type
            var end = func.indexOf('E', i);
            var size = end - i;
            list.push(func.substr(i, size));
            i += size + 2; // size + 'EE'
            break;
          }
          case 'A': { // array
            var size = parseInt(func.substr(i));
            i += size.toString().length;
            if (func[i] !== '_') throw '?';
            i++; // skip _
            list.push(parse(true, 1, true)[0] + ' [' + size + ']');
            break;
          }
          case 'E': break paramLoop;
          default: ret += '?' + c; break paramLoop;
        }
      }
    }
    if (!allowVoid && list.length === 1 && list[0] === 'void') list = []; // avoid (void)
    return rawList ? list : ret + flushList();
  }
  try {
    // Special-case the entry point, since its name differs from other name mangling.
    if (func == 'Object._main' || func == '_main') {
      return 'main()';
    }
    if (typeof func === 'number') func = Pointer_stringify(func);
    if (func[0] !== '_') return func;
    if (func[1] !== '_') return func; // C function
    if (func[2] !== 'Z') return func;
    switch (func[3]) {
      case 'n': return 'operator new()';
      case 'd': return 'operator delete()';
    }
    return parse();
  } catch(e) {
    return func;
  }
}

function demangleAll(text) {
  return text.replace(/__Z[\w\d_]+/g, function(x) { var y = demangle(x); return x === y ? x : (x + ' [' + y + ']') });
}

function stackTrace() {
  var stack = new Error().stack;
  return stack ? demangleAll(stack) : '(no stack trace available)'; // Stack trace is not available at least on IE10 and Safari 6.
}

// Memory management

var PAGE_SIZE = 4096;
function alignMemoryPage(x) {
  return (x+4095)&-4096;
}

var HEAP;
var HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;

var STATIC_BASE = 0, STATICTOP = 0, staticSealed = false; // static area
var STACK_BASE = 0, STACKTOP = 0, STACK_MAX = 0; // stack area
var DYNAMIC_BASE = 0, DYNAMICTOP = 0; // dynamic area handled by sbrk

function enlargeMemory() {
  abort('Cannot enlarge memory arrays. Either (1) compile with -s TOTAL_MEMORY=X with X higher than the current value ' + TOTAL_MEMORY + ', (2) compile with ALLOW_MEMORY_GROWTH which adjusts the size at runtime but prevents some optimizations, or (3) set Module.TOTAL_MEMORY before the program runs.');
}

var TOTAL_STACK = Module['TOTAL_STACK'] || 5242880;
var TOTAL_MEMORY = Module['TOTAL_MEMORY'] || 33554432;
var FAST_MEMORY = Module['FAST_MEMORY'] || 2097152;

var totalMemory = 4096;
while (totalMemory < TOTAL_MEMORY || totalMemory < 2*TOTAL_STACK) {
  if (totalMemory < 16*1024*1024) {
    totalMemory *= 2;
  } else {
    totalMemory += 16*1024*1024
  }
}
if (totalMemory !== TOTAL_MEMORY) {
  Module.printErr('increasing TOTAL_MEMORY to ' + totalMemory + ' to be more reasonable');
  TOTAL_MEMORY = totalMemory;
}

// Initialize the runtime's memory
// check for full engine support (use string 'subarray' to avoid closure compiler confusion)
assert(typeof Int32Array !== 'undefined' && typeof Float64Array !== 'undefined' && !!(new Int32Array(1)['subarray']) && !!(new Int32Array(1)['set']),
       'JS engine does not provide full typed array support');

var buffer = new ArrayBuffer(TOTAL_MEMORY);
HEAP8 = new Int8Array(buffer);
HEAP16 = new Int16Array(buffer);
HEAP32 = new Int32Array(buffer);
HEAPU8 = new Uint8Array(buffer);
HEAPU16 = new Uint16Array(buffer);
HEAPU32 = new Uint32Array(buffer);
HEAPF32 = new Float32Array(buffer);
HEAPF64 = new Float64Array(buffer);

// Endianness check (note: assumes compiler arch was little-endian)
HEAP32[0] = 255;
assert(HEAPU8[0] === 255 && HEAPU8[3] === 0, 'Typed arrays 2 must be run on a little-endian system');

Module['HEAP'] = HEAP;
Module['HEAP8'] = HEAP8;
Module['HEAP16'] = HEAP16;
Module['HEAP32'] = HEAP32;
Module['HEAPU8'] = HEAPU8;
Module['HEAPU16'] = HEAPU16;
Module['HEAPU32'] = HEAPU32;
Module['HEAPF32'] = HEAPF32;
Module['HEAPF64'] = HEAPF64;

function callRuntimeCallbacks(callbacks) {
  while(callbacks.length > 0) {
    var callback = callbacks.shift();
    if (typeof callback == 'function') {
      callback();
      continue;
    }
    var func = callback.func;
    if (typeof func === 'number') {
      if (callback.arg === undefined) {
        Runtime.dynCall('v', func);
      } else {
        Runtime.dynCall('vi', func, [callback.arg]);
      }
    } else {
      func(callback.arg === undefined ? null : callback.arg);
    }
  }
}

var __ATPRERUN__  = []; // functions called before the runtime is initialized
var __ATINIT__    = []; // functions called during startup
var __ATMAIN__    = []; // functions called when main() is to be run
var __ATEXIT__    = []; // functions called during shutdown
var __ATPOSTRUN__ = []; // functions called after the runtime has exited

var runtimeInitialized = false;

function preRun() {
  // compatibility - merge in anything from Module['preRun'] at this time
  if (Module['preRun']) {
    if (typeof Module['preRun'] == 'function') Module['preRun'] = [Module['preRun']];
    while (Module['preRun'].length) {
      addOnPreRun(Module['preRun'].shift());
    }
  }
  callRuntimeCallbacks(__ATPRERUN__);
}

function ensureInitRuntime() {
  if (runtimeInitialized) return;
  runtimeInitialized = true;
  callRuntimeCallbacks(__ATINIT__);
}

function preMain() {
  callRuntimeCallbacks(__ATMAIN__);
}

function exitRuntime() {
  callRuntimeCallbacks(__ATEXIT__);
}

function postRun() {
  // compatibility - merge in anything from Module['postRun'] at this time
  if (Module['postRun']) {
    if (typeof Module['postRun'] == 'function') Module['postRun'] = [Module['postRun']];
    while (Module['postRun'].length) {
      addOnPostRun(Module['postRun'].shift());
    }
  }
  callRuntimeCallbacks(__ATPOSTRUN__);
}

function addOnPreRun(cb) {
  __ATPRERUN__.unshift(cb);
}
Module['addOnPreRun'] = Module.addOnPreRun = addOnPreRun;

function addOnInit(cb) {
  __ATINIT__.unshift(cb);
}
Module['addOnInit'] = Module.addOnInit = addOnInit;

function addOnPreMain(cb) {
  __ATMAIN__.unshift(cb);
}
Module['addOnPreMain'] = Module.addOnPreMain = addOnPreMain;

function addOnExit(cb) {
  __ATEXIT__.unshift(cb);
}
Module['addOnExit'] = Module.addOnExit = addOnExit;

function addOnPostRun(cb) {
  __ATPOSTRUN__.unshift(cb);
}
Module['addOnPostRun'] = Module.addOnPostRun = addOnPostRun;

// Tools

// This processes a JS string into a C-line array of numbers, 0-terminated.
// For LLVM-originating strings, see parser.js:parseLLVMString function
function intArrayFromString(stringy, dontAddNull, length /* optional */) {
  var ret = (new Runtime.UTF8Processor()).processJSString(stringy);
  if (length) {
    ret.length = length;
  }
  if (!dontAddNull) {
    ret.push(0);
  }
  return ret;
}
Module['intArrayFromString'] = intArrayFromString;

function intArrayToString(array) {
  var ret = [];
  for (var i = 0; i < array.length; i++) {
    var chr = array[i];
    if (chr > 0xFF) {
      chr &= 0xFF;
    }
    ret.push(String.fromCharCode(chr));
  }
  return ret.join('');
}
Module['intArrayToString'] = intArrayToString;

// Write a Javascript array to somewhere in the heap
function writeStringToMemory(string, buffer, dontAddNull) {
  var array = intArrayFromString(string, dontAddNull);
  var i = 0;
  while (i < array.length) {
    var chr = array[i];
    HEAP8[(((buffer)+(i))|0)]=chr;
    i = i + 1;
  }
}
Module['writeStringToMemory'] = writeStringToMemory;

function writeArrayToMemory(array, buffer) {
  for (var i = 0; i < array.length; i++) {
    HEAP8[(((buffer)+(i))|0)]=array[i];
  }
}
Module['writeArrayToMemory'] = writeArrayToMemory;

function writeAsciiToMemory(str, buffer, dontAddNull) {
  for (var i = 0; i < str.length; i++) {
    HEAP8[(((buffer)+(i))|0)]=str.charCodeAt(i);
  }
  if (!dontAddNull) HEAP8[(((buffer)+(str.length))|0)]=0;
}
Module['writeAsciiToMemory'] = writeAsciiToMemory;

function unSign(value, bits, ignore) {
  if (value >= 0) {
    return value;
  }
  return bits <= 32 ? 2*Math.abs(1 << (bits-1)) + value // Need some trickery, since if bits == 32, we are right at the limit of the bits JS uses in bitshifts
                    : Math.pow(2, bits)         + value;
}
function reSign(value, bits, ignore) {
  if (value <= 0) {
    return value;
  }
  var half = bits <= 32 ? Math.abs(1 << (bits-1)) // abs is needed if bits == 32
                        : Math.pow(2, bits-1);
  if (value >= half && (bits <= 32 || value > half)) { // for huge values, we can hit the precision limit and always get true here. so don't do that
                                                       // but, in general there is no perfect solution here. With 64-bit ints, we get rounding and errors
                                                       // TODO: In i64 mode 1, resign the two parts separately and safely
    value = -2*half + value; // Cannot bitshift half, as it may be at the limit of the bits JS uses in bitshifts
  }
  return value;
}

// check for imul support, and also for correctness ( https://bugs.webkit.org/show_bug.cgi?id=126345 )
if (!Math['imul'] || Math['imul'](0xffffffff, 5) !== -5) Math['imul'] = function imul(a, b) {
  var ah  = a >>> 16;
  var al = a & 0xffff;
  var bh  = b >>> 16;
  var bl = b & 0xffff;
  return (al*bl + ((ah*bl + al*bh) << 16))|0;
};
Math.imul = Math['imul'];


var Math_abs = Math.abs;
var Math_cos = Math.cos;
var Math_sin = Math.sin;
var Math_tan = Math.tan;
var Math_acos = Math.acos;
var Math_asin = Math.asin;
var Math_atan = Math.atan;
var Math_atan2 = Math.atan2;
var Math_exp = Math.exp;
var Math_log = Math.log;
var Math_sqrt = Math.sqrt;
var Math_ceil = Math.ceil;
var Math_floor = Math.floor;
var Math_pow = Math.pow;
var Math_imul = Math.imul;
var Math_fround = Math.fround;
var Math_min = Math.min;

// A counter of dependencies for calling run(). If we need to
// do asynchronous work before running, increment this and
// decrement it. Incrementing must happen in a place like
// PRE_RUN_ADDITIONS (used by emcc to add file preloading).
// Note that you can add dependencies in preRun, even though
// it happens right before run - run will be postponed until
// the dependencies are met.
var runDependencies = 0;
var runDependencyWatcher = null;
var dependenciesFulfilled = null; // overridden to take different actions when all run dependencies are fulfilled

function addRunDependency(id) {
  runDependencies++;
  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }
}
Module['addRunDependency'] = addRunDependency;
function removeRunDependency(id) {
  runDependencies--;
  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }
  if (runDependencies == 0) {
    if (runDependencyWatcher !== null) {
      clearInterval(runDependencyWatcher);
      runDependencyWatcher = null;
    }
    if (dependenciesFulfilled) {
      var callback = dependenciesFulfilled;
      dependenciesFulfilled = null;
      callback(); // can add another dependenciesFulfilled
    }
  }
}
Module['removeRunDependency'] = removeRunDependency;

Module["preloadedImages"] = {}; // maps url to image data
Module["preloadedAudios"] = {}; // maps url to audio data


var memoryInitializer = null;

// === Body ===



STATIC_BASE = 8;

STATICTOP = STATIC_BASE + 9736;








/* global initializers */ __ATINIT__.push({ func: function() { runPostSets() } });

















































































































































































































































































var __ZTVN10__cxxabiv120__si_class_type_infoE;
__ZTVN10__cxxabiv120__si_class_type_infoE=allocate([0,0,0,0,48,30,0,0,36,0,0,0,208,0,0,0,188,0,0,0,58,0,0,0,4,0,0,0,8,0,0,0,2,0,0,0,16,0,0,0,0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);;
var __ZTVN10__cxxabiv117__class_type_infoE;
__ZTVN10__cxxabiv117__class_type_infoE=allocate([0,0,0,0,64,30,0,0,36,0,0,0,54,0,0,0,188,0,0,0,58,0,0,0,4,0,0,0,2,0,0,0,4,0,0,0,10,0,0,0,0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);;



































































































































































































































































var __ZN12b2ChainShapeD1Ev;
var __ZN12b2BroadPhaseC1Ev;
var __ZN12b2BroadPhaseD1Ev;
var __ZN13b2DynamicTreeC1Ev;
var __ZN13b2DynamicTreeD1Ev;
var __ZN8b2IslandC1EiiiP16b2StackAllocatorP17b2ContactListener;
var __ZN8b2IslandD1Ev;
var __ZN12b2MouseJointC1EPK15b2MouseJointDef;
var __ZN12b2MotorJointC1EPK15b2MotorJointDef;
var __ZN15b2DistanceJointC1EPK18b2DistanceJointDef;
var __ZN15b2FrictionJointC1EPK18b2FrictionJointDef;
var __ZN11b2WeldJointC1EPK14b2WeldJointDef;
var __ZN11b2GearJointC1EPK14b2GearJointDef;
var __ZN16b2PrismaticJointC1EPK19b2PrismaticJointDef;
var __ZN11b2RopeJointC1EPK14b2RopeJointDef;
var __ZN15b2RevoluteJointC1EPK18b2RevoluteJointDef;
var __ZN12b2WheelJointC1EPK15b2WheelJointDef;
var __ZN13b2PulleyJointC1EPK16b2PulleyJointDef;
var __ZN15b2ContactSolverC1EP18b2ContactSolverDef;
var __ZN15b2ContactSolverD1Ev;
var __ZN9b2FixtureC1Ev;
var __ZN7b2WorldC1ERK6b2Vec2;
var __ZN7b2WorldD1Ev;
var __ZN6b2BodyC1EPK9b2BodyDefP7b2World;
var __ZN6b2BodyD1Ev;
var __ZN16b2ContactManagerC1Ev;
var __ZN16b2VoronoiDiagramC1EP16b2StackAllocatori;
var __ZN16b2VoronoiDiagramD1Ev;
var __ZN15b2ParticleGroupC1Ev;
var __ZN16b2ParticleSystemC1EPK19b2ParticleSystemDefP7b2World;
var __ZN16b2ParticleSystemD1Ev;
var __ZN16b2BlockAllocatorC1Ev;
var __ZN16b2BlockAllocatorD1Ev;
var __ZN7b2TimerC1Ev;
var __ZN16b2StackAllocatorC1Ev;
var __ZN16b2StackAllocatorD1Ev;
/* memory initializer */ allocate([110,101,120,116,0,0,0,0,9,98,50,66,111,100,121,58,32,123,0,0,0,0,0,0,184,19,0,0,0,0,0,0,40,19,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,104,7,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,128,19,0,0,0,0,0,0,0,21,0,0,0,0,0,0,32,32,106,100,46,108,101,110,103,116,104,66,32,61,32,37,46,49,53,108,101,102,59,10,0,0,0,0,0,0,0,0,32,32,106,100,46,109,97,120,77,111,116,111,114,84,111,114,113,117,101,32,61,32,37,46,49,53,108,101,102,59,10,0,32,32,106,100,46,117,112,112,101,114,65,110,103,108,101,32,61,32,37,46,49,53,108,101,102,59,10,0,0,0,0,0,32,32,106,100,46,108,111,119,101,114,84,114,97,110,115,108,97,116,105,111,110,32,61,32,37,46,49,53,108,101,102,59,10,0,0,0,0,0,0,0,32,32,106,111,105,110,116,115,91,37,100,93,32,61,32,109,95,119,111,114,108,100,45,62,67,114,101,97,116,101,74,111,105,110,116,40,38,106,100,41,59,10,0,0,0,0,0,0,32,32,106,111,105,110,116,115,91,37,100,93,32,61,32,109,95,119,111,114,108,100,45,62,67,114,101,97,116,101,74,111,105,110,116,40,38,106,100,41,59,10,0,0,0,0,0,0,32,32,106,111,105,110,116,115,91,37,100,93,32,61,32,109,95,119,111,114,108,100,45,62,67,114,101,97,116,101,74,111,105,110,116,40,38,106,100,41,59,10,0,0,0,0,0,0,9,125,0,0,0,0,0,0,32,32,106,100,46,108,101,110,103,116,104,65,32,61,32,37,46,49,53,108,101,102,59,10,0,0,0,0,0,0,0,0,32,32,106,100,46,109,111,116,111,114,83,112,101,101,100,32,61,32,37,46,49,53,108,101,102,59,10,0,0,0,0,0,32,32,106,100,46,108,111,119,101,114,65,110,103,108,101,32,61,32,37,46,49,53,108,101,102,59,10,0,0,0,0,0,32,32,106,100,46,101,110,97,98,108,101,76,105,109,105,116,32,61,32,98,111,111,108,40,37,100,41,59,10,0,0,0,32,32,106,100,46,100,97,109,112,105,110,103,82,97,116,105,111,32,61,32,37,46,49,53,108,101,102,59,10,0,0,0,32,32,106,111,105,110,116,115,91,37,100,93,32,61,32,109,95,119,111,114,108,100,45,62,67,114,101,97,116,101,74,111,105,110,116,40,38,106,100,41,59,10,0,0,0,0,0,0,32,32,106,100,46,100,97,109,112,105,110,103,82,97,116,105,111,32,61,32,37,46,49,53,108,101,102,59,10,0,0,0,32,32,106,100,46,99,111,114,114,101,99,116,105,111,110,70,97,99,116,111,114,32,61,32,37,46,49,53,108,101,102,59,10,0,0,0,0,0,0,0,9,9,117,115,101,114,68,97,116,97,58,32,37,117,10,0,32,32,106,100,46,108,111,99,97,108,65,110,99,104,111,114,66,46,83,101,116,40,37,46,49,53,108,101,102,44,32,37,46,49,53,108,101,102,41,59,10,0,0,0,0,0,0,0,32,32,106,100,46,101,110,97,98,108,101,77,111,116,111,114,32,61,32,98,111,111,108,40,37,100,41,59,10,0,0,0,32,32,106,100,46,101,110,97,98,108,101,76,105,109,105,116,32,61,32,98,111,111,108,40,37,100,41,59,10,0,0,0,32,32,106,111,105,110,116,115,91,37,100,93,32,61,32,109,95,119,111,114,108,100,45,62,67,114,101,97,116,101,74,111,105,110,116,40,38,106,100,41,59,10,0,0,0,0,0,0,32,32,106,100,46,114,101,102,101,114,101,110,99,101,65,110,103,108,101,32,61,32,37,46,49,53,108,101,102,59,10,0,32,32,106,111,105,110,116,115,91,37,100,93,32,61,32,109,95,119,111,114,108,100,45,62,67,114,101,97,116,101,74,111,105,110,116,40,38,106,100,41,59,10,0,0,0,0,0,0,32,32,106,100,46,102,114,101,113,117,101,110,99,121,72,122,32,61,32,37,46,49,53,108,101,102,59,10,0,0,0,0,32,32,106,100,46,109,97,120,84,111,114,113,117,101,32,61,32,37,46,49,53,108,101,102,59,10,0,0,0,0,0,0,32,32,106,100,46,102,114,101,113,117,101,110,99,121,72,122,32,61,32,37,46,49,53,108,101,102,59,10,0,0,0,0,32,32,106,100,46,109,97,120,84,111,114,113,117,101,32,61,32,37,46,49,53,108,101,102,59,10,0,0,0,0,0,0,9,9,120,102,58,32,37,117,44,10,0,0,0,0,0,0,32,32,106,100,46,108,111,99,97,108,65,110,99,104,111,114,65,46,83,101,116,40,37,46,49,53,108,101,102,44,32,37,46,49,53,108,101,102,41,59,10,0,0,0,0,0,0,0,32,32,106,100,46,108,111,99,97,108,65,120,105,115,65,46,83,101,116,40,37,46,49,53,108,101,102,44,32,37,46,49,53,108,101,102,41,59,10,0,32,32,106,100,46,114,101,102,101,114,101,110,99,101,65,110,103,108,101,32,61,32,37,46,49,53,108,101,102,59,10,0,32,32,106,100,46,109,97,120,76,101,110,103,116,104,32,61,32,37,46,49,53,108,101,102,59,10,0,0,0,0,0,0,32,32,106,100,46,108,111,99,97,108,65,120,105,115,65,46,83,101,116,40,37,46,49,53,108,101,102,44,32,37,46,49,53,108,101,102,41,59,10,0,32,32,106,100,46,114,97,116,105,111,32,61,32,37,46,49,53,108,101,102,59,10,0,0,32,32,106,100,46,114,101,102,101,114,101,110,99,101,65,110,103,108,101,32,61,32,37,46,49,53,108,101,102,59,10,0,32,32,106,100,46,109,97,120,70,111,114,99,101,32,61,32,37,46,49,53,108,101,102,59,10,0,0,0,0,0,0,0,32,32,106,100,46,108,101,110,103,116,104,32,61,32,37,46,49,53,108,101,102,59,10,0,32,32,106,100,46,109,97,120,70,111,114,99,101,32,61,32,37,46,49,53,108,101,102,59,10,0,0,0,0,0,0,0,9,9,105,115,108,97,110,100,73,110,100,101,120,58,32,37,117,44,10,0,0,0,0,0,32,32,106,100,46,103,114,111,117,110,100,65,110,99,104,111,114,66,46,83,101,116,40,37,46,49,53,108,101,102,44,32,37,46,49,53,108,101,102,41,59,10,0,0,0,0,0,0,32,32,106,100,46,108,111,99,97,108,65,110,99,104,111,114,66,46,83,101,116,40,37,46,49,53,108,101,102,44,32,37,46,49,53,108,101,102,41,59,10,0,0,0,0,0,0,0,32,32,106,100,46,108,111,99,97,108,65,110,99,104,111,114,66,46,83,101,116,40,37,46,49,53,108,101,102,44,32,37,46,49,53,108,101,102,41,59,10,0,0,0,0,0,0,0,32,32,106,100,46,108,111,99,97,108,65,110,99,104,111,114,66,46,83,101,116,40,37,46,49,53,108,101,102,44,32,37,46,49,53,108,101,102,41,59,10,0,0,0,0,0,0,0,32,32,106,100,46,108,111,99,97,108,65,110,99,104,111,114,66,46,83,101,116,40,37,46,49,53,108,101,102,44,32,37,46,49,53,108,101,102,41,59,10,0,0,0,0,0,0,0,32,32,106,100,46,106,111,105,110,116,50,32,61,32,106,111,105,110,116,115,91,37,100,93,59,10,0,0,0,0,0,0,32,32,106,100,46,108,111,99,97,108,65,110,99,104,111,114,66,46,83,101,116,40,37,46,49,53,108,101,102,44,32,37,46,49,53,108,101,102,41,59,10,0,0,0,0,0,0,0,32,32,106,100,46,108,111,99,97,108,65,110,99,104,111,114,66,46,83,101,116,40,37,46,49,53,108,101,102,44,32,37,46,49,53,108,101,102,41,59,10,0,0,0,0,0,0,0,32,32,106,100,46,108,111,99,97,108,65,110,99,104,111,114,66,46,83,101,116,40,37,46,49,53,108,101,102,44,32,37,46,49,53,108,101,102,41,59,10,0,0,0,0,0,0,0,32,32,106,100,46,97,110,103,117,108,97,114,79,102,102,115,101,116,32,61,32,37,46,49,53,108,101,102,59,10,0,0,9,9,116,121,112,101,58,32,37,117,44,10,0,0,0,0,76,105,113,117,105,100,70,117,110,32,49,46,48,46,48,0,32,32,106,100,46,103,114,111,117,110,100,65,110,99,104,111,114,65,46,83,101,116,40,37,46,49,53,108,101,102,44,32,37,46,49,53,108,101,102,41,59,10,0,0,0,0,0,0,32,32,106,100,46,108,111,99,97,108,65,110,99,104,111,114,65,46,83,101,116,40,37,46,49,53,108,101,102,44,32,37,46,49,53,108,101,102,41,59,10,0,0,0,0,0,0,0,32,32,106,100,46,108,111,99,97,108,65,110,99,104,111,114,65,46,83,101,116,40,37,46,49,53,108,101,102,44,32,37,46,49,53,108,101,102,41,59,10,0,0,0,0,0,0,0,32,32,106,100,46,108,111,99,97,108,65,110,99,104,111,114,65,46,83,101,116,40,37,46,49,53,108,101,102,44,32,37,46,49,53,108,101,102,41,59,10,0,0,0,0,0,0,0,32,32,106,100,46,108,111,99,97,108,65,110,99,104,111,114,65,46,83,101,116,40,37,46,49,53,108,101,102,44,32,37,46,49,53,108,101,102,41,59,10,0,0,0,0,0,0,0,32,32,106,100,46,106,111,105,110,116,49,32,61,32,106,111,105,110,116,115,91,37,100,93,59,10,0,0,0,0,0,0,32,32,106,100,46,108,111,99,97,108,65,110,99,104,111,114,65,46,83,101,116,40,37,46,49,53,108,101,102,44,32,37,46,49,53,108,101,102,41,59,10,0,0,0,0,0,0,0,32,32,106,100,46,108,111,99,97,108,65,110,99,104,111,114,65,46,83,101,116,40,37,46,49,53,108,101,102,44,32,37,46,49,53,108,101,102,41,59,10,0,0,0,0,0,0,0,32,32,106,100,46,108,111,99,97,108,65,110,99,104,111,114,65,46,83,101,116,40,37,46,49,53,108,101,102,44,32,37,46,49,53,108,101,102,41,59,10,0,0,0,0,0,0,0,32,32,106,100,46,108,105,110,101,97,114,79,102,102,115,101,116,46,83,101,116,40,37,46,49,53,108,101,102,44,32,37,46,49,53,108,101,102,41,59,10,0,0,0,0,0,0,0,117,115,101,114,100,97,116,97,32,45,32,37,100,10,0,0,115,116,100,58,58,98,97,100,95,97,108,108,111,99,0,0,32,32,106,100,46,99,111,108,108,105,100,101,67,111,110,110,101,99,116,101,100,32,61,32,98,111,111,108,40,37,100,41,59,10,0,0,0,0,0,0,32,32,106,100,46,99,111,108,108,105,100,101,67,111,110,110,101,99,116,101,100,32,61,32,98,111,111,108,40,37,100,41,59,10,0,0,0,0,0,0,32,32,106,100,46,99,111,108,108,105,100,101,67,111,110,110,101,99,116,101,100,32,61,32,98,111,111,108,40,37,100,41,59,10,0,0,0,0,0,0,32,32,106,100,46,99,111,108,108,105,100,101,67,111,110,110,101,99,116,101,100,32,61,32,98,111,111,108,40,37,100,41,59,10,0,0,0,0,0,0,32,32,106,100,46,99,111,108,108,105,100,101,67,111,110,110,101,99,116,101,100,32,61,32,98,111,111,108,40,37,100,41,59,10,0,0,0,0,0,0,32,32,106,100,46,99,111,108,108,105,100,101,67,111,110,110,101,99,116,101,100,32,61,32,98,111,111,108,40,37,100,41,59,10,0,0,0,0,0,0,32,32,106,100,46,99,111,108,108,105,100,101,67,111,110,110,101,99,116,101,100,32,61,32,98,111,111,108,40,37,100,41,59,10,0,0,0,0,0,0,32,32,106,100,46,99,111,108,108,105,100,101,67,111,110,110,101,99,116,101,100,32,61,32,98,111,111,108,40,37,100,41,59,10,0,0,0,0,0,0,32,32,106,100,46,99,111,108,108,105,100,101,67,111,110,110,101,99,116,101,100,32,61,32,98,111,111,108,40,37,100,41,59,10,0,0,0,0,0,0,32,32,106,100,46,99,111,108,108,105,100,101,67,111,110,110,101,99,116,101,100,32,61,32,98,111,111,108,40,37,100,41,59,10,0,0,0,0,0,0,37,102,32,37,102,44,32,37,102,32,37,102,10,0,0,0,32,32,98,50,80,117,108,108,101,121,74,111,105,110,116,68,101,102,32,106,100,59,10,0,32,32,98,50,87,104,101,101,108,74,111,105,110,116,68,101,102,32,106,100,59,10,0,0,32,32,106,100,46,98,111,100,121,66,32,61,32,98,111,100,105,101,115,91,37,100,93,59,10,0,0,0,0,0,0,0,32,32,106,100,46,98,111,100,121,66,32,61,32,98,111,100,105,101,115,91,37,100,93,59,10,0,0,0,0,0,0,0,32,32,106,100,46,98,111,100,121,66,32,61,32,98,111,100,105,101,115,91,37,100,93,59,10,0,0,0,0,0,0,0,32,32,106,100,46,98,111,100,121,66,32,61,32,98,111,100,105,101,115,91,37,100,93,59,10,0,0,0,0,0,0,0,32,32,106,100,46,98,111,100,121,66,32,61,32,98,111,100,105,101,115,91,37,100,93,59,10,0,0,0,0,0,0,0,32,32,106,100,46,98,111,100,121,66,32,61,32,98,111,100,105,101,115,91,37,100,93,59,10,0,0,0,0,0,0,0,32,32,106,100,46,98,111,100,121,66,32,61,32,98,111,100,105,101,115,91,37,100,93,59,10,0,0,0,0,0,0,0,32,32,106,100,46,98,111,100,121,66,32,61,32,98,111,100,105,101,115,91,37,100,93,59,10,0,0,0,0,0,0,0,32,32,106,100,46,98,111,100,121,66,32,61,32,98,111,100,105,101,115,91,37,100,93,59,10,0,0,0,0,0,0,0,32,32,106,100,46,98,111,100,121,66,32,61,32,98,111,100,105,101,115,91,37,100,93,59,10,0,0,0,0,0,0,0,32,32,98,50,82,101,118,111,108,117,116,101,74,111,105,110,116,68,101,102,32,106,100,59,10,0,0,0,0,0,0,0,37,102,32,37,102,32,37,102,10,0,0,0,0,0,0,0,47,47,32,68,117,109,112,32,105,115,32,110,111,116,32,115,117,112,112,111,114,116,101,100,32,102,111,114,32,116,104,105,115,32,106,111,105,110,116,32,116,121,112,101,46,10,0,0,32,32,98,50,82,111,112,101,74,111,105,110,116,68,101,102,32,106,100,59,10,0,0,0,32,32,98,50,80,114,105,115,109,97,116,105,99,74,111,105,110,116,68,101,102,32,106,100,59,10,0,0,0,0,0,0,32,32,98,50,71,101,97,114,74,111,105,110,116,68,101,102,32,106,100,59,10,0,0,0,32,32,98,50,87,101,108,100,74,111,105,110,116,68,101,102,32,106,100,59,10,0,0,0,32,32,106,111,105,110,116,115,91,37,100,93,32,61,32,109,95,119,111,114,108,100,45,62,67,114,101,97,116,101,74,111,105,110,116,40,38,106,100,41,59,10,0,0,0,0,0,0,32,32,106,111,105,110,116,115,91,37,100,93,32,61,32,109,95,119,111,114,108,100,45,62,67,114,101,97,116,101,74,111,105,110,116,40,38,106,100,41,59,10,0,0,0,0,0,0,32,32,98,50,70,114,105,99,116,105,111,110,74,111,105,110,116,68,101,102,32,106,100,59,10,0,0,0,0,0,0,0,32,32,106,100,46,109,97,120,77,111,116,111,114,70,111,114,99,101,32,61,32,37,46,49,53,108,101,102,59,10,0,0,32,32,106,100,46,98,111,100,121,65,32,61,32,98,111,100,105,101,115,91,37,100,93,59,10,0,0,0,0,0,0,0,32,32,106,100,46,98,111,100,121,65,32,61,32,98,111,100,105,101,115,91,37,100,93,59,10,0,0,0,0,0,0,0,32,32,106,111,105,110,116,115,91,37,100,93,32,61,32,109,95,119,111,114,108,100,45,62,67,114,101,97,116,101,74,111,105,110,116,40,38,106,100,41,59,10,0,0,0,0,0,0,32,32,106,100,46,109,97,120,77,111,116,111,114,84,111,114,113,117,101,32,61,32,37,46,49,53,108,101,102,59,10,0,32,32,106,100,46,98,111,100,121,65,32,61,32,98,111,100,105,101,115,91,37,100,93,59,10,0,0,0,0,0,0,0,32,32,106,100,46,109,111,116,111,114,83,112,101,101,100,32,61,32,37,46,49,53,108,101,102,59,10,0,0,0,0,0,32,32,106,100,46,98,111,100,121,65,32,61,32,98,111,100,105,101,115,91,37,100,93,59,10,0,0,0,0,0,0,0,32,32,98,50,68,105,115,116,97,110,99,101,74,111,105,110,116,68,101,102,32,106,100,59,10,0,0,0,0,0,0,0,32,32,106,100,46,98,111,100,121,65,32,61,32,98,111,100,105,101,115,91,37,100,93,59,10,0,0,0,0,0,0,0,32,32,106,100,46,98,111,100,121,65,32,61,32,98,111,100,105,101,115,91,37,100,93,59,10,0,0,0,0,0,0,0,32,32,106,100,46,98,111,100,121,65,32,61,32,98,111,100,105,101,115,91,37,100,93,59,10,0,0,0,0,0,0,0,32,32,106,100,46,98,111,100,121,65,32,61,32,98,111,100,105,101,115,91,37,100,93,59,10,0,0,0,0,0,0,0,32,32,106,111,105,110,116,115,91,37,100,93,32,61,32,109,95,119,111,114,108,100,45,62,67,114,101,97,116,101,74,111,105,110,116,40,38,106,100,41,59,10,0,0,0,0,0,0,32,32,106,100,46,100,97,109,112,105,110,103,82,97,116,105,111,32,61,32,37,46,49,53,108,101,102,59,10,0,0,0,32,32,106,100,46,109,111,116,111,114,83,112,101,101,100,32,61,32,37,46,49,53,108,101,102,59,10,0,0,0,0,0,32,32,106,100,46,98,111,100,121,65,32,61,32,98,111,100,105,101,115,91,37,100,93,59,10,0,0,0,0,0,0,0,32,32,106,100,46,101,110,97,98,108,101,77,111,116,111,114,32,61,32,98,111,111,108,40,37,100,41,59,10,0,0,0,32,32,98,50,77,111,116,111,114,74,111,105,110,116,68,101,102,32,106,100,59,10,0,0,32,32,106,100,46,114,97,116,105,111,32,61,32,37,46,49,53,108,101,102,59,10,0,0,32,32,106,100,46,102,114,101,113,117,101,110,99,121,72,122,32,61,32,37,46,49,53,108,101,102,59,10,0,0,0,0,32,32,106,100,46,101,110,97,98,108,101,77,111,116,111,114,32,61,32,98,111,111,108,40,37,100,41,59,10,0,0,0,32,32,106,100,46,117,112,112,101,114,84,114,97,110,115,108,97,116,105,111,110,32,61,32,37,46,49,53,108,101,102,59,10,0,0,0,0,0,0,0,32,32,106,100,46,98,111,100,121,65,32,61,32,98,111,100,105,101,115,91,37,100,93,59,10,0,0,0,0,0,0,0,77,111,117,115,101,32,106,111,105,110,116,32,100,117,109,112,105,110,103,32,105,115,32,110,111,116,32,115,117,112,112,111,114,116,101,100,46,10,0,0,0,0,0,0,160,29,0,0,128,0,0,0,116,0,0,0,8,0,0,0,2,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,176,29,0,0,78,0,0,0,160,0,0,0,16,0,0,0,8,0,0,0,16,0,0,0,6,0,0,0,12,0,0,0,6,0,0,0,18,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,192,29,0,0,10,0,0,0,6,0,0,0,28,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,208,29,0,0,114,0,0,0,2,0,0,0,12,0,0,0,6,0,0,0,20,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,224,29,0,0,190,0,0,0,80,0,0,0,46,0,0,0,12,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,240,29,0,0,94,0,0,0,186,0,0,0,34,0,0,0,6,0,0,0,20,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,16,30,0,0,84,0,0,0,164,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,40,30,0,0,182,0,0,0,146,0,0,0,46,0,0,0,2,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,96,30,0,0,2,0,0,0,44,0,0,0,96,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,112,30,0,0,2,0,0,0,2,0,0,0,2,0,0,0,2,0,0,0,102,0,0,0,94,0,0,0,202,0,0,0,24,0,0,0,2,0,0,0,2,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,120,30,0,0,14,0,0,0,30,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,136,30,0,0,4,0,0,0,112,0,0,0,156,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,152,30,0,0,24,0,0,0,104,0,0,0,62,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,168,30,0,0,34,0,0,0,70,0,0,0,126,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,184,30,0,0,56,0,0,0,170,0,0,0,66,0,0,0,124,0,0,0,12,0,0,0,22,0,0,0,2,0,0,0,32,0,0,0,4,0,0,0,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,200,30,0,0,30,0,0,0,64,0,0,0,12,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,216,30,0,0,76,0,0,0,22,0,0,0,30,0,0,0,46,0,0,0,12,0,0,0,22,0,0,0,2,0,0,0,32,0,0,0,16,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,224,30,0,0,92,0,0,0,18,0,0,0,22,0,0,0,6,0,0,0,20,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,240,30,0,0,70,0,0,0,110,0,0,0,24,0,0,0,16,0,0,0,14,0,0,0,94,0,0,0,210,0,0,0,48,0,0,0,12,0,0,0,22,0,0,0,38,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,31,0,0,12,0,0,0,82,0,0,0,120,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,16,31,0,0,14,0,0,0,26,0,0,0,4,0,0,0,2,0,0,0,66,0,0,0,94,0,0,0,34,0,0,0,192,0,0,0,128,0,0,0,68,0,0,0,28,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,40,31,0,0,108,0,0,0,102,0,0,0,28,0,0,0,10,0,0,0,130,0,0,0,94,0,0,0,72,0,0,0,28,0,0,0,132,0,0,0,10,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,56,31,0,0,130,0,0,0,16,0,0,0,16,0,0,0,12,0,0,0,100,0,0,0,94,0,0,0,172,0,0,0,40,0,0,0,74,0,0,0,34,0,0,0,42,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,72,31,0,0,166,0,0,0,110,0,0,0,14,0,0,0,8,0,0,0,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,80,31,0,0,8,0,0,0,132,0,0,0,20,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,96,31,0,0,74,0,0,0,134,0,0,0,10,0,0,0,4,0,0,0,8,0,0,0,12,0,0,0,6,0,0,0,2,0,0,0,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,112,31,0,0,90,0,0,0,24,0,0,0,22,0,0,0,22,0,0,0,124,0,0,0,42,0,0,0,122,0,0,0,68,0,0,0,64,0,0,0,88,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,128,31,0,0,212,0,0,0,154,0,0,0,18,0,0,0,6,0,0,0,20,0,0,0,10,0,0,0,22,0,0,0,26,0,0,0,20,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,144,31,0,0,136,0,0,0,134,0,0,0,10,0,0,0,4,0,0,0,178,0,0,0,94,0,0,0,4,0,0,0,60,0,0,0,84,0,0,0,56,0,0,0,48,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,160,31,0,0,4,0,0,0,126,0,0,0,8,0,0,0,6,0,0,0,52,0,0,0,8,0,0,0,152,0,0,0,196,0,0,0,58,0,0,0,20,0,0,0,32,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,176,31,0,0,60,0,0,0,92,0,0,0,12,0,0,0,8,0,0,0,204,0,0,0,94,0,0,0,176,0,0,0,108,0,0,0,18,0,0,0,142,0,0,0,52,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,192,31,0,0,142,0,0,0,168,0,0,0,54,0,0,0,10,0,0,0,18,0,0,0,16,0,0,0,16,0,0,0,18,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,208,31,0,0,114,0,0,0,104,0,0,0,14,0,0,0,20,0,0,0,90,0,0,0,94,0,0,0,184,0,0,0,26,0,0,0,6,0,0,0,120,0,0,0,56,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,224,31,0,0,86,0,0,0,78,0,0,0,30,0,0,0,18,0,0,0,194,0,0,0,94,0,0,0,32,0,0,0,88,0,0,0,138,0,0,0,38,0,0,0,40,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,240,31,0,0,72,0,0,0,28,0,0,0,26,0,0,0,14,0,0,0,206,0,0,0,94,0,0,0,174,0,0,0,140,0,0,0,140,0,0,0,44,0,0,0,58,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,32,0,0,198,0,0,0,38,0,0,0,50,0,0,0,12,0,0,0,10,0,0,0,4,0,0,0,20,0,0,0,20,0,0,0,32,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,90,78,49,54,98,50,80,97,114,116,105,99,108,101,83,121,115,116,101,109,52,49,85,112,100,97,116,101,80,97,105,114,115,65,110,100,84,114,105,97,100,115,87,105,116,104,82,101,97,99,116,105,118,101,80,97,114,116,105,99,108,101,115,69,118,69,49,52,82,101,97,99,116,105,118,101,70,105,108,116,101,114,0,0,0,0,0,0,90,78,49,54,98,50,80,97,114,116,105,99,108,101,83,121,115,116,101,109,51,51,67,114,101,97,116,101,80,97,114,116,105,99,108,101,115,87,105,116,104,83,104,97,112,101,115,70,111,114,71,114,111,117,112,69,80,75,80,75,55,98,50,83,104,97,112,101,105,82,75,49,56,98,50,80,97,114,116,105,99,108,101,71,114,111,117,112,68,101,102,82,75,49,49,98,50,84,114,97,110,115,102,111,114,109,69,49,52,67,111,109,112,111,115,105,116,101,83,104,97,112,101,0,0,0,0,0,90,78,49,54,98,50,80,97,114,116,105,99,108,101,83,121,115,116,101,109,50,48,85,112,100,97,116,101,80,97,105,114,115,65,110,100,84,114,105,97,100,115,69,105,105,82,75,78,83,95,49,54,67,111,110,110,101,99,116,105,111,110,70,105,108,116,101,114,69,69,50,48,85,112,100,97,116,101,84,114,105,97,100,115,67,97,108,108,98,97,99,107,0,0,0,0,90,78,49,54,98,50,80,97,114,116,105,99,108,101,83,121,115,116,101,109,49,56,85,112,100,97,116,101,66,111,100,121,67,111,110,116,97,99,116,115,69,118,69,50,54,85,112,100,97,116,101,66,111,100,121,67,111,110,116,97,99,116,115,67,97,108,108,98,97,99,107,0,90,78,49,54,98,50,80,97,114,116,105,99,108,101,83,121,115,116,101,109,49,56,74,111,105,110,80,97,114,116,105,99,108,101,71,114,111,117,112,115,69,80,49,53,98,50,80,97,114,116,105,99,108,101,71,114,111,117,112,83,49,95,69,50,52,74,111,105,110,80,97,114,116,105,99,108,101,71,114,111,117,112,115,70,105,108,116,101,114,0,0,0,0,0,0,0,90,78,49,54,98,50,80,97,114,116,105,99,108,101,83,121,115,116,101,109,49,52,83,111,108,118,101,67,111,108,108,105,115,105,111,110,69,82,75,49,48,98,50,84,105,109,101,83,116,101,112,69,50,50,83,111,108,118,101,67,111,108,108,105,115,105,111,110,67,97,108,108,98,97,99,107,0,0,0,0,83,116,57,116,121,112,101,95,105,110,102,111,0,0,0,0,83,116,57,101,120,99,101,112,116,105,111,110,0,0,0,0,83,116,57,98,97,100,95,97,108,108,111,99,0,0,0,0,78,49,54,98,50,86,111,114,111,110,111,105,68,105,97,103,114,97,109,49,50,78,111,100,101,67,97,108,108,98,97,99,107,69,0,0,0,0,0,0,78,49,54,98,50,80,97,114,116,105,99,108,101,83,121,115,116,101,109,49,54,67,111,110,110,101,99,116,105,111,110,70,105,108,116,101,114,69,0,0,78,49,48,95,95,99,120,120,97,98,105,118,49,50,48,95,95,115,105,95,99,108,97,115,115,95,116,121,112,101,95,105,110,102,111,69,0,0,0,0,78,49,48,95,95,99,120,120,97,98,105,118,49,49,55,95,95,99,108,97,115,115,95,116,121,112,101,95,105,110,102,111,69,0,0,0,0,0,0,0,78,49,48,95,95,99,120,120,97,98,105,118,49,49,54,95,95,115,104,105,109,95,116,121,112,101,95,105,110,102,111,69,0,0,0,0,0,0,0,0,57,98,50,67,111,110,116,97,99,116,0,0,0,0,0,0,55,98,50,83,104,97,112,101,0,0,0,0,0,0,0,0,55,98,50,74,111,105,110,116,0,0,0,0,0,0,0,0,50,53,98,50,80,111,108,121,103,111,110,65,110,100,67,105,114,99,108,101,67,111,110,116,97,99,116,0,0,0,0,0,50,52,98,50,67,104,97,105,110,65,110,100,80,111,108,121,103,111,110,67,111,110,116,97,99,116,0,0,0,0,0,0,50,51,98,50,69,100,103,101,65,110,100,80,111,108,121,103,111,110,67,111,110,116,97,99,116,0,0,0,0,0,0,0,50,51,98,50,67,104,97,105,110,65,110,100,67,105,114,99,108,101,67,111,110,116,97,99,116,0,0,0,0,0,0,0,50,50,98,50,87,111,114,108,100,67,111,110,116,97,99,116,76,105,115,116,101,110,101,114,0,0,0,0,0,0,0,0,50,50,98,50,69,100,103,101,65,110,100,67,105,114,99,108,101,67,111,110,116,97,99,116,0,0,0,0,0,0,0,0,49,55,98,50,67,111,110,116,97,99,116,76,105,115,116,101,110,101,114,0,0,0,0,0,49,55,81,117,101,114,121,65,65,66,66,67,97,108,108,98,97,99,107,0,0,0,0,0,49,54,98,50,80,114,105,115,109,97,116,105,99,74,111,105,110,116,0,0,0,0,0,0,49,54,98,50,80,111,108,121,103,111,110,67,111,110,116,97,99,116,0,0,0,0,0,0,49,53,98,50,82,101,118,111,108,117,116,101,74,111,105,110,116,0,0,0,0,0,0,0,49,53,98,50,81,117,101,114,121,67,97,108,108,98,97,99,107,0,0,0,0,0,0,0,49,53,98,50,70,114,105,99,116,105,111,110,74,111,105,110,116,0,0,0,0,0,0,0,49,53,98,50,68,105,115,116,97,110,99,101,74,111,105,110,116,0,0,0,0,0,0,0,49,53,98,50,67,111,110,116,97,99,116,70,105,108,116,101,114,0,0,0,0,0,0,0,49,53,98,50,67,105,114,99,108,101,67,111,110,116,97,99,116,0,0,0,0,0,0,0,49,52,98,50,80,111,108,121,103,111,110,83,104,97,112,101,0,0,0,0,0,0,0,0,49,51,98,50,80,117,108,108,101,121,74,111,105,110,116,0,49,51,98,50,67,105,114,99,108,101,83,104,97,112,101,0,49,50,98,50,87,104,101,101,108,74,111,105,110,116,0,0,49,50,98,50,77,111,117,115,101,74,111,105,110,116,0,0,49,50,98,50,77,111,116,111,114,74,111,105,110,116,0,0,49,50,98,50,67,104,97,105,110,83,104,97,112,101,0,0,49,49,98,50,87,101,108,100,74,111,105,110,116,0,0,0,49,49,98,50,82,111,112,101,74,111,105,110,116,0,0,0,49,49,98,50,71,101,97,114,74,111,105,110,116,0,0,0,49,49,98,50,69,100,103,101,83,104,97,112,101,0,0,0,0,0,0,0,224,23,0,0,40,30,0,0,0,0,0,0,0,0,0,0,56,24,0,0,104,30,0,0,0,0,0,0,0,0,0,0,184,24,0,0,32,30,0,0,0,0,0,0,0,0,0,0,24,25,0,0,32,31,0,0,0,0,0,0,0,0,0,0,96,25,0,0,40,30,0,0,0,0,0,0,0,0,0,0,192,25,0,0,32,31,0,0,0,0,0,0,0,0,0,0,16,26,0,0,0,0,0,0,32,26,0,0,0,0,0,0,48,26,0,0,8,30,0,0,0,0,0,0,0,0,0,0,64,26,0,0,0,0,0,0,104,26,0,0,0,0,0,0,144,26,0,0,64,30,0,0,0,0,0,0,0,0,0,0,184,26,0,0,80,30,0,0,0,0,0,0,0,0,0,0,224,26,0,0,0,30,0,0,0,0,0,0,0,0,0,0,8,27,0,0,0,0,0,0,24,27,0,0,0,0,0,0,40,27,0,0,0,0,0,0,56,27,0,0,96,30,0,0,0,0,0,0,0,0,0,0,88,27,0,0,96,30,0,0,0,0,0,0,0,0,0,0,120,27,0,0,96,30,0,0,0,0,0,0,0,0,0,0,152,27,0,0,96,30,0,0,0,0,0,0,0,0,0,0,184,27,0,0,216,30,0,0,0,0,0,0,0,0,0,0,216,27,0,0,96,30,0,0,0,0,0,0,0,0,0,0,248,27,0,0,0,0,0,0,16,28,0,0,32,31,0,0,0,0,0,0,0,0,0,0,40,28,0,0,112,30,0,0,0,0,0,0,0,0,0,0,64,28,0,0,96,30,0,0,0,0,0,0,0,0,0,0,88,28,0,0,112,30,0,0,0,0,0,0,0,0,0,0,112,28,0,0,0,0,0,0,136,28,0,0,112,30,0,0,0,0,0,0,0,0,0,0,160,28,0,0,112,30,0,0,0,0,0,0,0,0,0,0,184,28,0,0,0,0,0,0,208,28,0,0,96,30,0,0,0,0,0,0,0,0,0,0,232,28,0,0,104,30,0,0,0,0,0,0,0,0,0,0,0,29,0,0,112,30,0,0,0,0,0,0,0,0,0,0,16,29,0,0,104,30,0,0,0,0,0,0,0,0,0,0,32,29,0,0,112,30,0,0,0,0,0,0,0,0,0,0,48,29,0,0,112,30,0,0,0,0,0,0,0,0,0,0,64,29,0,0,112,30,0,0,0,0,0,0,0,0,0,0,80,29,0,0,104,30,0,0,0,0,0,0,0,0,0,0,96,29,0,0,112,30,0,0,0,0,0,0,0,0,0,0,112,29,0,0,112,30,0,0,0,0,0,0,0,0,0,0,128,29,0,0,112,30,0,0,0,0,0,0,0,0,0,0,144,29,0,0,104,30,0,0,0,0,0,0,16,0,0,0,32,0,0,0,64,0,0,0,96,0,0,0,128,0,0,0,160,0,0,0,192,0,0,0,224,0,0,0,0,1,0,0,64,1,0,0,128,1,0,0,192,1,0,0,0,2,0,0,128,2,0,0,8,0,0,0,0,0,0,0,6,0,0,0,0,0,0,0,48,0,0,0,0,0,0,0], "i8", ALLOC_NONE, Runtime.GLOBAL_BASE);



var tempDoublePtr = Runtime.alignMemory(allocate(12, "i8", ALLOC_STATIC), 8);

assert(tempDoublePtr % 8 == 0);

function copyTempFloat(ptr) { // functions, because inlining this code increases code size too much

  HEAP8[tempDoublePtr] = HEAP8[ptr];

  HEAP8[tempDoublePtr+1] = HEAP8[ptr+1];

  HEAP8[tempDoublePtr+2] = HEAP8[ptr+2];

  HEAP8[tempDoublePtr+3] = HEAP8[ptr+3];

}

function copyTempDouble(ptr) {

  HEAP8[tempDoublePtr] = HEAP8[ptr];

  HEAP8[tempDoublePtr+1] = HEAP8[ptr+1];

  HEAP8[tempDoublePtr+2] = HEAP8[ptr+2];

  HEAP8[tempDoublePtr+3] = HEAP8[ptr+3];

  HEAP8[tempDoublePtr+4] = HEAP8[ptr+4];

  HEAP8[tempDoublePtr+5] = HEAP8[ptr+5];

  HEAP8[tempDoublePtr+6] = HEAP8[ptr+6];

  HEAP8[tempDoublePtr+7] = HEAP8[ptr+7];

}


  
  function __ZSt18uncaught_exceptionv() { // std::uncaught_exception()
      return !!__ZSt18uncaught_exceptionv.uncaught_exception;
    }
  
  
  
  function ___cxa_is_number_type(type) {
      var isNumber = false;
      try { if (type == __ZTIi) isNumber = true } catch(e){}
      try { if (type == __ZTIj) isNumber = true } catch(e){}
      try { if (type == __ZTIl) isNumber = true } catch(e){}
      try { if (type == __ZTIm) isNumber = true } catch(e){}
      try { if (type == __ZTIx) isNumber = true } catch(e){}
      try { if (type == __ZTIy) isNumber = true } catch(e){}
      try { if (type == __ZTIf) isNumber = true } catch(e){}
      try { if (type == __ZTId) isNumber = true } catch(e){}
      try { if (type == __ZTIe) isNumber = true } catch(e){}
      try { if (type == __ZTIc) isNumber = true } catch(e){}
      try { if (type == __ZTIa) isNumber = true } catch(e){}
      try { if (type == __ZTIh) isNumber = true } catch(e){}
      try { if (type == __ZTIs) isNumber = true } catch(e){}
      try { if (type == __ZTIt) isNumber = true } catch(e){}
      return isNumber;
    }function ___cxa_does_inherit(definiteType, possibilityType, possibility) {
      if (possibility == 0) return false;
      if (possibilityType == 0 || possibilityType == definiteType)
        return true;
      var possibility_type_info;
      if (___cxa_is_number_type(possibilityType)) {
        possibility_type_info = possibilityType;
      } else {
        var possibility_type_infoAddr = HEAP32[((possibilityType)>>2)] - 8;
        possibility_type_info = HEAP32[((possibility_type_infoAddr)>>2)];
      }
      switch (possibility_type_info) {
      case 0: // possibility is a pointer
        // See if definite type is a pointer
        var definite_type_infoAddr = HEAP32[((definiteType)>>2)] - 8;
        var definite_type_info = HEAP32[((definite_type_infoAddr)>>2)];
        if (definite_type_info == 0) {
          // Also a pointer; compare base types of pointers
          var defPointerBaseAddr = definiteType+8;
          var defPointerBaseType = HEAP32[((defPointerBaseAddr)>>2)];
          var possPointerBaseAddr = possibilityType+8;
          var possPointerBaseType = HEAP32[((possPointerBaseAddr)>>2)];
          return ___cxa_does_inherit(defPointerBaseType, possPointerBaseType, possibility);
        } else
          return false; // one pointer and one non-pointer
      case 1: // class with no base class
        return false;
      case 2: // class with base class
        var parentTypeAddr = possibilityType + 8;
        var parentType = HEAP32[((parentTypeAddr)>>2)];
        return ___cxa_does_inherit(definiteType, parentType, possibility);
      default:
        return false; // some unencountered type
      }
    }
  
  
  
  var ___cxa_last_thrown_exception=0;function ___resumeException(ptr) {
      if (!___cxa_last_thrown_exception) { ___cxa_last_thrown_exception = ptr; }
      throw ptr + " - Exception catching is disabled, this exception cannot be caught. Compile with -s DISABLE_EXCEPTION_CATCHING=0 or DISABLE_EXCEPTION_CATCHING=2 to catch.";
    }
  
  var ___cxa_exception_header_size=8;function ___cxa_find_matching_catch(thrown, throwntype) {
      if (thrown == -1) thrown = ___cxa_last_thrown_exception;
      header = thrown - ___cxa_exception_header_size;
      if (throwntype == -1) throwntype = HEAP32[((header)>>2)];
      var typeArray = Array.prototype.slice.call(arguments, 2);
  
      // If throwntype is a pointer, this means a pointer has been
      // thrown. When a pointer is thrown, actually what's thrown
      // is a pointer to the pointer. We'll dereference it.
      if (throwntype != 0 && !___cxa_is_number_type(throwntype)) {
        var throwntypeInfoAddr= HEAP32[((throwntype)>>2)] - 8;
        var throwntypeInfo= HEAP32[((throwntypeInfoAddr)>>2)];
        if (throwntypeInfo == 0)
          thrown = HEAP32[((thrown)>>2)];
      }
      // The different catch blocks are denoted by different types.
      // Due to inheritance, those types may not precisely match the
      // type of the thrown object. Find one which matches, and
      // return the type of the catch block which should be called.
      for (var i = 0; i < typeArray.length; i++) {
        if (___cxa_does_inherit(typeArray[i], throwntype, thrown))
          return ((asm["setTempRet0"](typeArray[i]),thrown)|0);
      }
      // Shouldn't happen unless we have bogus data in typeArray
      // or encounter a type for which emscripten doesn't have suitable
      // typeinfo defined. Best-efforts match just in case.
      return ((asm["setTempRet0"](throwntype),thrown)|0);
    }function ___gxx_personality_v0() {
    }

  
  
  function __exit(status) {
      // void _exit(int status);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/exit.html
      Module['exit'](status);
    }function _exit(status) {
      __exit(status);
    }function __ZSt9terminatev() {
      _exit(-1234);
    }

  
  
  
  
  var ERRNO_CODES={EPERM:1,ENOENT:2,ESRCH:3,EINTR:4,EIO:5,ENXIO:6,E2BIG:7,ENOEXEC:8,EBADF:9,ECHILD:10,EAGAIN:11,EWOULDBLOCK:11,ENOMEM:12,EACCES:13,EFAULT:14,ENOTBLK:15,EBUSY:16,EEXIST:17,EXDEV:18,ENODEV:19,ENOTDIR:20,EISDIR:21,EINVAL:22,ENFILE:23,EMFILE:24,ENOTTY:25,ETXTBSY:26,EFBIG:27,ENOSPC:28,ESPIPE:29,EROFS:30,EMLINK:31,EPIPE:32,EDOM:33,ERANGE:34,ENOMSG:42,EIDRM:43,ECHRNG:44,EL2NSYNC:45,EL3HLT:46,EL3RST:47,ELNRNG:48,EUNATCH:49,ENOCSI:50,EL2HLT:51,EDEADLK:35,ENOLCK:37,EBADE:52,EBADR:53,EXFULL:54,ENOANO:55,EBADRQC:56,EBADSLT:57,EDEADLOCK:35,EBFONT:59,ENOSTR:60,ENODATA:61,ETIME:62,ENOSR:63,ENONET:64,ENOPKG:65,EREMOTE:66,ENOLINK:67,EADV:68,ESRMNT:69,ECOMM:70,EPROTO:71,EMULTIHOP:72,EDOTDOT:73,EBADMSG:74,ENOTUNIQ:76,EBADFD:77,EREMCHG:78,ELIBACC:79,ELIBBAD:80,ELIBSCN:81,ELIBMAX:82,ELIBEXEC:83,ENOSYS:38,ENOTEMPTY:39,ENAMETOOLONG:36,ELOOP:40,EOPNOTSUPP:95,EPFNOSUPPORT:96,ECONNRESET:104,ENOBUFS:105,EAFNOSUPPORT:97,EPROTOTYPE:91,ENOTSOCK:88,ENOPROTOOPT:92,ESHUTDOWN:108,ECONNREFUSED:111,EADDRINUSE:98,ECONNABORTED:103,ENETUNREACH:101,ENETDOWN:100,ETIMEDOUT:110,EHOSTDOWN:112,EHOSTUNREACH:113,EINPROGRESS:115,EALREADY:114,EDESTADDRREQ:89,EMSGSIZE:90,EPROTONOSUPPORT:93,ESOCKTNOSUPPORT:94,EADDRNOTAVAIL:99,ENETRESET:102,EISCONN:106,ENOTCONN:107,ETOOMANYREFS:109,EUSERS:87,EDQUOT:122,ESTALE:116,ENOTSUP:95,ENOMEDIUM:123,EILSEQ:84,EOVERFLOW:75,ECANCELED:125,ENOTRECOVERABLE:131,EOWNERDEAD:130,ESTRPIPE:86};
  
  var ERRNO_MESSAGES={0:"Success",1:"Not super-user",2:"No such file or directory",3:"No such process",4:"Interrupted system call",5:"I/O error",6:"No such device or address",7:"Arg list too long",8:"Exec format error",9:"Bad file number",10:"No children",11:"No more processes",12:"Not enough core",13:"Permission denied",14:"Bad address",15:"Block device required",16:"Mount device busy",17:"File exists",18:"Cross-device link",19:"No such device",20:"Not a directory",21:"Is a directory",22:"Invalid argument",23:"Too many open files in system",24:"Too many open files",25:"Not a typewriter",26:"Text file busy",27:"File too large",28:"No space left on device",29:"Illegal seek",30:"Read only file system",31:"Too many links",32:"Broken pipe",33:"Math arg out of domain of func",34:"Math result not representable",35:"File locking deadlock error",36:"File or path name too long",37:"No record locks available",38:"Function not implemented",39:"Directory not empty",40:"Too many symbolic links",42:"No message of desired type",43:"Identifier removed",44:"Channel number out of range",45:"Level 2 not synchronized",46:"Level 3 halted",47:"Level 3 reset",48:"Link number out of range",49:"Protocol driver not attached",50:"No CSI structure available",51:"Level 2 halted",52:"Invalid exchange",53:"Invalid request descriptor",54:"Exchange full",55:"No anode",56:"Invalid request code",57:"Invalid slot",59:"Bad font file fmt",60:"Device not a stream",61:"No data (for no delay io)",62:"Timer expired",63:"Out of streams resources",64:"Machine is not on the network",65:"Package not installed",66:"The object is remote",67:"The link has been severed",68:"Advertise error",69:"Srmount error",70:"Communication error on send",71:"Protocol error",72:"Multihop attempted",73:"Cross mount point (not really error)",74:"Trying to read unreadable message",75:"Value too large for defined data type",76:"Given log. name not unique",77:"f.d. invalid for this operation",78:"Remote address changed",79:"Can   access a needed shared lib",80:"Accessing a corrupted shared lib",81:".lib section in a.out corrupted",82:"Attempting to link in too many libs",83:"Attempting to exec a shared library",84:"Illegal byte sequence",86:"Streams pipe error",87:"Too many users",88:"Socket operation on non-socket",89:"Destination address required",90:"Message too long",91:"Protocol wrong type for socket",92:"Protocol not available",93:"Unknown protocol",94:"Socket type not supported",95:"Not supported",96:"Protocol family not supported",97:"Address family not supported by protocol family",98:"Address already in use",99:"Address not available",100:"Network interface is not configured",101:"Network is unreachable",102:"Connection reset by network",103:"Connection aborted",104:"Connection reset by peer",105:"No buffer space available",106:"Socket is already connected",107:"Socket is not connected",108:"Can't send after socket shutdown",109:"Too many references",110:"Connection timed out",111:"Connection refused",112:"Host is down",113:"Host is unreachable",114:"Socket already connected",115:"Connection already in progress",116:"Stale file handle",122:"Quota exceeded",123:"No medium (in tape drive)",125:"Operation canceled",130:"Previous owner died",131:"State not recoverable"};
  
  
  var ___errno_state=0;function ___setErrNo(value) {
      // For convenient setting and returning of errno.
      HEAP32[((___errno_state)>>2)]=value;
      return value;
    }
  
  var PATH={splitPath:function (filename) {
        var splitPathRe = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
        return splitPathRe.exec(filename).slice(1);
      },normalizeArray:function (parts, allowAboveRoot) {
        // if the path tries to go above the root, `up` ends up > 0
        var up = 0;
        for (var i = parts.length - 1; i >= 0; i--) {
          var last = parts[i];
          if (last === '.') {
            parts.splice(i, 1);
          } else if (last === '..') {
            parts.splice(i, 1);
            up++;
          } else if (up) {
            parts.splice(i, 1);
            up--;
          }
        }
        // if the path is allowed to go above the root, restore leading ..s
        if (allowAboveRoot) {
          for (; up--; up) {
            parts.unshift('..');
          }
        }
        return parts;
      },normalize:function (path) {
        var isAbsolute = path.charAt(0) === '/',
            trailingSlash = path.substr(-1) === '/';
        // Normalize the path
        path = PATH.normalizeArray(path.split('/').filter(function(p) {
          return !!p;
        }), !isAbsolute).join('/');
        if (!path && !isAbsolute) {
          path = '.';
        }
        if (path && trailingSlash) {
          path += '/';
        }
        return (isAbsolute ? '/' : '') + path;
      },dirname:function (path) {
        var result = PATH.splitPath(path),
            root = result[0],
            dir = result[1];
        if (!root && !dir) {
          // No dirname whatsoever
          return '.';
        }
        if (dir) {
          // It has a dirname, strip trailing slash
          dir = dir.substr(0, dir.length - 1);
        }
        return root + dir;
      },basename:function (path) {
        // EMSCRIPTEN return '/'' for '/', not an empty string
        if (path === '/') return '/';
        var lastSlash = path.lastIndexOf('/');
        if (lastSlash === -1) return path;
        return path.substr(lastSlash+1);
      },extname:function (path) {
        return PATH.splitPath(path)[3];
      },join:function () {
        var paths = Array.prototype.slice.call(arguments, 0);
        return PATH.normalize(paths.join('/'));
      },join2:function (l, r) {
        return PATH.normalize(l + '/' + r);
      },resolve:function () {
        var resolvedPath = '',
          resolvedAbsolute = false;
        for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
          var path = (i >= 0) ? arguments[i] : FS.cwd();
          // Skip empty and invalid entries
          if (typeof path !== 'string') {
            throw new TypeError('Arguments to path.resolve must be strings');
          } else if (!path) {
            continue;
          }
          resolvedPath = path + '/' + resolvedPath;
          resolvedAbsolute = path.charAt(0) === '/';
        }
        // At this point the path should be resolved to a full absolute path, but
        // handle relative paths to be safe (might happen when process.cwd() fails)
        resolvedPath = PATH.normalizeArray(resolvedPath.split('/').filter(function(p) {
          return !!p;
        }), !resolvedAbsolute).join('/');
        return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
      },relative:function (from, to) {
        from = PATH.resolve(from).substr(1);
        to = PATH.resolve(to).substr(1);
        function trim(arr) {
          var start = 0;
          for (; start < arr.length; start++) {
            if (arr[start] !== '') break;
          }
          var end = arr.length - 1;
          for (; end >= 0; end--) {
            if (arr[end] !== '') break;
          }
          if (start > end) return [];
          return arr.slice(start, end - start + 1);
        }
        var fromParts = trim(from.split('/'));
        var toParts = trim(to.split('/'));
        var length = Math.min(fromParts.length, toParts.length);
        var samePartsLength = length;
        for (var i = 0; i < length; i++) {
          if (fromParts[i] !== toParts[i]) {
            samePartsLength = i;
            break;
          }
        }
        var outputParts = [];
        for (var i = samePartsLength; i < fromParts.length; i++) {
          outputParts.push('..');
        }
        outputParts = outputParts.concat(toParts.slice(samePartsLength));
        return outputParts.join('/');
      }};
  
  var TTY={ttys:[],init:function () {
        // https://github.com/kripken/emscripten/pull/1555
        // if (ENVIRONMENT_IS_NODE) {
        //   // currently, FS.init does not distinguish if process.stdin is a file or TTY
        //   // device, it always assumes it's a TTY device. because of this, we're forcing
        //   // process.stdin to UTF8 encoding to at least make stdin reading compatible
        //   // with text files until FS.init can be refactored.
        //   process['stdin']['setEncoding']('utf8');
        // }
      },shutdown:function () {
        // https://github.com/kripken/emscripten/pull/1555
        // if (ENVIRONMENT_IS_NODE) {
        //   // inolen: any idea as to why node -e 'process.stdin.read()' wouldn't exit immediately (with process.stdin being a tty)?
        //   // isaacs: because now it's reading from the stream, you've expressed interest in it, so that read() kicks off a _read() which creates a ReadReq operation
        //   // inolen: I thought read() in that case was a synchronous operation that just grabbed some amount of buffered data if it exists?
        //   // isaacs: it is. but it also triggers a _read() call, which calls readStart() on the handle
        //   // isaacs: do process.stdin.pause() and i'd think it'd probably close the pending call
        //   process['stdin']['pause']();
        // }
      },register:function (dev, ops) {
        TTY.ttys[dev] = { input: [], output: [], ops: ops };
        FS.registerDevice(dev, TTY.stream_ops);
      },stream_ops:{open:function (stream) {
          var tty = TTY.ttys[stream.node.rdev];
          if (!tty) {
            throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
          }
          stream.tty = tty;
          stream.seekable = false;
        },close:function (stream) {
          // flush any pending line data
          if (stream.tty.output.length) {
            stream.tty.ops.put_char(stream.tty, 10);
          }
        },read:function (stream, buffer, offset, length, pos /* ignored */) {
          if (!stream.tty || !stream.tty.ops.get_char) {
            throw new FS.ErrnoError(ERRNO_CODES.ENXIO);
          }
          var bytesRead = 0;
          for (var i = 0; i < length; i++) {
            var result;
            try {
              result = stream.tty.ops.get_char(stream.tty);
            } catch (e) {
              throw new FS.ErrnoError(ERRNO_CODES.EIO);
            }
            if (result === undefined && bytesRead === 0) {
              throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
            }
            if (result === null || result === undefined) break;
            bytesRead++;
            buffer[offset+i] = result;
          }
          if (bytesRead) {
            stream.node.timestamp = Date.now();
          }
          return bytesRead;
        },write:function (stream, buffer, offset, length, pos) {
          if (!stream.tty || !stream.tty.ops.put_char) {
            throw new FS.ErrnoError(ERRNO_CODES.ENXIO);
          }
          for (var i = 0; i < length; i++) {
            try {
              stream.tty.ops.put_char(stream.tty, buffer[offset+i]);
            } catch (e) {
              throw new FS.ErrnoError(ERRNO_CODES.EIO);
            }
          }
          if (length) {
            stream.node.timestamp = Date.now();
          }
          return i;
        }},default_tty_ops:{get_char:function (tty) {
          if (!tty.input.length) {
            var result = null;
            if (ENVIRONMENT_IS_NODE) {
              result = process['stdin']['read']();
              if (!result) {
                if (process['stdin']['_readableState'] && process['stdin']['_readableState']['ended']) {
                  return null;  // EOF
                }
                return undefined;  // no data available
              }
            } else if (typeof window != 'undefined' &&
              typeof window.prompt == 'function') {
              // Browser.
              result = window.prompt('Input: ');  // returns null on cancel
              if (result !== null) {
                result += '\n';
              }
            } else if (typeof readline == 'function') {
              // Command line.
              result = readline();
              if (result !== null) {
                result += '\n';
              }
            }
            if (!result) {
              return null;
            }
            tty.input = intArrayFromString(result, true);
          }
          return tty.input.shift();
        },put_char:function (tty, val) {
          if (val === null || val === 10) {
            Module['print'](tty.output.join(''));
            tty.output = [];
          } else {
            tty.output.push(TTY.utf8.processCChar(val));
          }
        }},default_tty1_ops:{put_char:function (tty, val) {
          if (val === null || val === 10) {
            Module['printErr'](tty.output.join(''));
            tty.output = [];
          } else {
            tty.output.push(TTY.utf8.processCChar(val));
          }
        }}};
  
  var MEMFS={ops_table:null,CONTENT_OWNING:1,CONTENT_FLEXIBLE:2,CONTENT_FIXED:3,mount:function (mount) {
        return MEMFS.createNode(null, '/', 16384 | 511 /* 0777 */, 0);
      },createNode:function (parent, name, mode, dev) {
        if (FS.isBlkdev(mode) || FS.isFIFO(mode)) {
          // no supported
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (!MEMFS.ops_table) {
          MEMFS.ops_table = {
            dir: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr,
                lookup: MEMFS.node_ops.lookup,
                mknod: MEMFS.node_ops.mknod,
                rename: MEMFS.node_ops.rename,
                unlink: MEMFS.node_ops.unlink,
                rmdir: MEMFS.node_ops.rmdir,
                readdir: MEMFS.node_ops.readdir,
                symlink: MEMFS.node_ops.symlink
              },
              stream: {
                llseek: MEMFS.stream_ops.llseek
              }
            },
            file: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr
              },
              stream: {
                llseek: MEMFS.stream_ops.llseek,
                read: MEMFS.stream_ops.read,
                write: MEMFS.stream_ops.write,
                allocate: MEMFS.stream_ops.allocate,
                mmap: MEMFS.stream_ops.mmap
              }
            },
            link: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr,
                readlink: MEMFS.node_ops.readlink
              },
              stream: {}
            },
            chrdev: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr
              },
              stream: FS.chrdev_stream_ops
            },
          };
        }
        var node = FS.createNode(parent, name, mode, dev);
        if (FS.isDir(node.mode)) {
          node.node_ops = MEMFS.ops_table.dir.node;
          node.stream_ops = MEMFS.ops_table.dir.stream;
          node.contents = {};
        } else if (FS.isFile(node.mode)) {
          node.node_ops = MEMFS.ops_table.file.node;
          node.stream_ops = MEMFS.ops_table.file.stream;
          node.contents = [];
          node.contentMode = MEMFS.CONTENT_FLEXIBLE;
        } else if (FS.isLink(node.mode)) {
          node.node_ops = MEMFS.ops_table.link.node;
          node.stream_ops = MEMFS.ops_table.link.stream;
        } else if (FS.isChrdev(node.mode)) {
          node.node_ops = MEMFS.ops_table.chrdev.node;
          node.stream_ops = MEMFS.ops_table.chrdev.stream;
        }
        node.timestamp = Date.now();
        // add the new node to the parent
        if (parent) {
          parent.contents[name] = node;
        }
        return node;
      },ensureFlexible:function (node) {
        if (node.contentMode !== MEMFS.CONTENT_FLEXIBLE) {
          var contents = node.contents;
          node.contents = Array.prototype.slice.call(contents);
          node.contentMode = MEMFS.CONTENT_FLEXIBLE;
        }
      },node_ops:{getattr:function (node) {
          var attr = {};
          // device numbers reuse inode numbers.
          attr.dev = FS.isChrdev(node.mode) ? node.id : 1;
          attr.ino = node.id;
          attr.mode = node.mode;
          attr.nlink = 1;
          attr.uid = 0;
          attr.gid = 0;
          attr.rdev = node.rdev;
          if (FS.isDir(node.mode)) {
            attr.size = 4096;
          } else if (FS.isFile(node.mode)) {
            attr.size = node.contents.length;
          } else if (FS.isLink(node.mode)) {
            attr.size = node.link.length;
          } else {
            attr.size = 0;
          }
          attr.atime = new Date(node.timestamp);
          attr.mtime = new Date(node.timestamp);
          attr.ctime = new Date(node.timestamp);
          // NOTE: In our implementation, st_blocks = Math.ceil(st_size/st_blksize),
          //       but this is not required by the standard.
          attr.blksize = 4096;
          attr.blocks = Math.ceil(attr.size / attr.blksize);
          return attr;
        },setattr:function (node, attr) {
          if (attr.mode !== undefined) {
            node.mode = attr.mode;
          }
          if (attr.timestamp !== undefined) {
            node.timestamp = attr.timestamp;
          }
          if (attr.size !== undefined) {
            MEMFS.ensureFlexible(node);
            var contents = node.contents;
            if (attr.size < contents.length) contents.length = attr.size;
            else while (attr.size > contents.length) contents.push(0);
          }
        },lookup:function (parent, name) {
          throw FS.genericErrors[ERRNO_CODES.ENOENT];
        },mknod:function (parent, name, mode, dev) {
          return MEMFS.createNode(parent, name, mode, dev);
        },rename:function (old_node, new_dir, new_name) {
          // if we're overwriting a directory at new_name, make sure it's empty.
          if (FS.isDir(old_node.mode)) {
            var new_node;
            try {
              new_node = FS.lookupNode(new_dir, new_name);
            } catch (e) {
            }
            if (new_node) {
              for (var i in new_node.contents) {
                throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
              }
            }
          }
          // do the internal rewiring
          delete old_node.parent.contents[old_node.name];
          old_node.name = new_name;
          new_dir.contents[new_name] = old_node;
          old_node.parent = new_dir;
        },unlink:function (parent, name) {
          delete parent.contents[name];
        },rmdir:function (parent, name) {
          var node = FS.lookupNode(parent, name);
          for (var i in node.contents) {
            throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
          }
          delete parent.contents[name];
        },readdir:function (node) {
          var entries = ['.', '..']
          for (var key in node.contents) {
            if (!node.contents.hasOwnProperty(key)) {
              continue;
            }
            entries.push(key);
          }
          return entries;
        },symlink:function (parent, newname, oldpath) {
          var node = MEMFS.createNode(parent, newname, 511 /* 0777 */ | 40960, 0);
          node.link = oldpath;
          return node;
        },readlink:function (node) {
          if (!FS.isLink(node.mode)) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
          return node.link;
        }},stream_ops:{read:function (stream, buffer, offset, length, position) {
          var contents = stream.node.contents;
          if (position >= contents.length)
            return 0;
          var size = Math.min(contents.length - position, length);
          assert(size >= 0);
          if (size > 8 && contents.subarray) { // non-trivial, and typed array
            buffer.set(contents.subarray(position, position + size), offset);
          } else
          {
            for (var i = 0; i < size; i++) {
              buffer[offset + i] = contents[position + i];
            }
          }
          return size;
        },write:function (stream, buffer, offset, length, position, canOwn) {
          var node = stream.node;
          node.timestamp = Date.now();
          var contents = node.contents;
          if (length && contents.length === 0 && position === 0 && buffer.subarray) {
            // just replace it with the new data
            if (canOwn && offset === 0) {
              node.contents = buffer; // this could be a subarray of Emscripten HEAP, or allocated from some other source.
              node.contentMode = (buffer.buffer === HEAP8.buffer) ? MEMFS.CONTENT_OWNING : MEMFS.CONTENT_FIXED;
            } else {
              node.contents = new Uint8Array(buffer.subarray(offset, offset+length));
              node.contentMode = MEMFS.CONTENT_FIXED;
            }
            return length;
          }
          MEMFS.ensureFlexible(node);
          var contents = node.contents;
          while (contents.length < position) contents.push(0);
          for (var i = 0; i < length; i++) {
            contents[position + i] = buffer[offset + i];
          }
          return length;
        },llseek:function (stream, offset, whence) {
          var position = offset;
          if (whence === 1) {  // SEEK_CUR.
            position += stream.position;
          } else if (whence === 2) {  // SEEK_END.
            if (FS.isFile(stream.node.mode)) {
              position += stream.node.contents.length;
            }
          }
          if (position < 0) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
          stream.ungotten = [];
          stream.position = position;
          return position;
        },allocate:function (stream, offset, length) {
          MEMFS.ensureFlexible(stream.node);
          var contents = stream.node.contents;
          var limit = offset + length;
          while (limit > contents.length) contents.push(0);
        },mmap:function (stream, buffer, offset, length, position, prot, flags) {
          if (!FS.isFile(stream.node.mode)) {
            throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
          }
          var ptr;
          var allocated;
          var contents = stream.node.contents;
          // Only make a new copy when MAP_PRIVATE is specified.
          if ( !(flags & 2) &&
                (contents.buffer === buffer || contents.buffer === buffer.buffer) ) {
            // We can't emulate MAP_SHARED when the file is not backed by the buffer
            // we're mapping to (e.g. the HEAP buffer).
            allocated = false;
            ptr = contents.byteOffset;
          } else {
            // Try to avoid unnecessary slices.
            if (position > 0 || position + length < contents.length) {
              if (contents.subarray) {
                contents = contents.subarray(position, position + length);
              } else {
                contents = Array.prototype.slice.call(contents, position, position + length);
              }
            }
            allocated = true;
            ptr = _malloc(length);
            if (!ptr) {
              throw new FS.ErrnoError(ERRNO_CODES.ENOMEM);
            }
            buffer.set(contents, ptr);
          }
          return { ptr: ptr, allocated: allocated };
        }}};
  
  var IDBFS={dbs:{},indexedDB:function () {
        return window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
      },DB_VERSION:21,DB_STORE_NAME:"FILE_DATA",mount:function (mount) {
        // reuse all of the core MEMFS functionality
        return MEMFS.mount.apply(null, arguments);
      },syncfs:function (mount, populate, callback) {
        IDBFS.getLocalSet(mount, function(err, local) {
          if (err) return callback(err);
  
          IDBFS.getRemoteSet(mount, function(err, remote) {
            if (err) return callback(err);
  
            var src = populate ? remote : local;
            var dst = populate ? local : remote;
  
            IDBFS.reconcile(src, dst, callback);
          });
        });
      },getDB:function (name, callback) {
        // check the cache first
        var db = IDBFS.dbs[name];
        if (db) {
          return callback(null, db);
        }
  
        var req;
        try {
          req = IDBFS.indexedDB().open(name, IDBFS.DB_VERSION);
        } catch (e) {
          return callback(e);
        }
        req.onupgradeneeded = function(e) {
          var db = e.target.result;
          var transaction = e.target.transaction;
  
          var fileStore;
  
          if (db.objectStoreNames.contains(IDBFS.DB_STORE_NAME)) {
            fileStore = transaction.objectStore(IDBFS.DB_STORE_NAME);
          } else {
            fileStore = db.createObjectStore(IDBFS.DB_STORE_NAME);
          }
  
          fileStore.createIndex('timestamp', 'timestamp', { unique: false });
        };
        req.onsuccess = function() {
          db = req.result;
  
          // add to the cache
          IDBFS.dbs[name] = db;
          callback(null, db);
        };
        req.onerror = function() {
          callback(this.error);
        };
      },getLocalSet:function (mount, callback) {
        var entries = {};
  
        function isRealDir(p) {
          return p !== '.' && p !== '..';
        };
        function toAbsolute(root) {
          return function(p) {
            return PATH.join2(root, p);
          }
        };
  
        var check = FS.readdir(mount.mountpoint).filter(isRealDir).map(toAbsolute(mount.mountpoint));
  
        while (check.length) {
          var path = check.pop();
          var stat;
  
          try {
            stat = FS.stat(path);
          } catch (e) {
            return callback(e);
          }
  
          if (FS.isDir(stat.mode)) {
            check.push.apply(check, FS.readdir(path).filter(isRealDir).map(toAbsolute(path)));
          }
  
          entries[path] = { timestamp: stat.mtime };
        }
  
        return callback(null, { type: 'local', entries: entries });
      },getRemoteSet:function (mount, callback) {
        var entries = {};
  
        IDBFS.getDB(mount.mountpoint, function(err, db) {
          if (err) return callback(err);
  
          var transaction = db.transaction([IDBFS.DB_STORE_NAME], 'readonly');
          transaction.onerror = function() { callback(this.error); };
  
          var store = transaction.objectStore(IDBFS.DB_STORE_NAME);
          var index = store.index('timestamp');
  
          index.openKeyCursor().onsuccess = function(event) {
            var cursor = event.target.result;
  
            if (!cursor) {
              return callback(null, { type: 'remote', db: db, entries: entries });
            }
  
            entries[cursor.primaryKey] = { timestamp: cursor.key };
  
            cursor.continue();
          };
        });
      },loadLocalEntry:function (path, callback) {
        var stat, node;
  
        try {
          var lookup = FS.lookupPath(path);
          node = lookup.node;
          stat = FS.stat(path);
        } catch (e) {
          return callback(e);
        }
  
        if (FS.isDir(stat.mode)) {
          return callback(null, { timestamp: stat.mtime, mode: stat.mode });
        } else if (FS.isFile(stat.mode)) {
          return callback(null, { timestamp: stat.mtime, mode: stat.mode, contents: node.contents });
        } else {
          return callback(new Error('node type not supported'));
        }
      },storeLocalEntry:function (path, entry, callback) {
        try {
          if (FS.isDir(entry.mode)) {
            FS.mkdir(path, entry.mode);
          } else if (FS.isFile(entry.mode)) {
            FS.writeFile(path, entry.contents, { encoding: 'binary', canOwn: true });
          } else {
            return callback(new Error('node type not supported'));
          }
  
          FS.utime(path, entry.timestamp, entry.timestamp);
        } catch (e) {
          return callback(e);
        }
  
        callback(null);
      },removeLocalEntry:function (path, callback) {
        try {
          var lookup = FS.lookupPath(path);
          var stat = FS.stat(path);
  
          if (FS.isDir(stat.mode)) {
            FS.rmdir(path);
          } else if (FS.isFile(stat.mode)) {
            FS.unlink(path);
          }
        } catch (e) {
          return callback(e);
        }
  
        callback(null);
      },loadRemoteEntry:function (store, path, callback) {
        var req = store.get(path);
        req.onsuccess = function(event) { callback(null, event.target.result); };
        req.onerror = function() { callback(this.error); };
      },storeRemoteEntry:function (store, path, entry, callback) {
        var req = store.put(entry, path);
        req.onsuccess = function() { callback(null); };
        req.onerror = function() { callback(this.error); };
      },removeRemoteEntry:function (store, path, callback) {
        var req = store.delete(path);
        req.onsuccess = function() { callback(null); };
        req.onerror = function() { callback(this.error); };
      },reconcile:function (src, dst, callback) {
        var total = 0;
  
        var create = [];
        Object.keys(src.entries).forEach(function (key) {
          var e = src.entries[key];
          var e2 = dst.entries[key];
          if (!e2 || e.timestamp > e2.timestamp) {
            create.push(key);
            total++;
          }
        });
  
        var remove = [];
        Object.keys(dst.entries).forEach(function (key) {
          var e = dst.entries[key];
          var e2 = src.entries[key];
          if (!e2) {
            remove.push(key);
            total++;
          }
        });
  
        if (!total) {
          return callback(null);
        }
  
        var errored = false;
        var completed = 0;
        var db = src.type === 'remote' ? src.db : dst.db;
        var transaction = db.transaction([IDBFS.DB_STORE_NAME], 'readwrite');
        var store = transaction.objectStore(IDBFS.DB_STORE_NAME);
  
        function done(err) {
          if (err) {
            if (!done.errored) {
              done.errored = true;
              return callback(err);
            }
            return;
          }
          if (++completed >= total) {
            return callback(null);
          }
        };
  
        transaction.onerror = function() { done(this.error); };
  
        // sort paths in ascending order so directory entries are created
        // before the files inside them
        create.sort().forEach(function (path) {
          if (dst.type === 'local') {
            IDBFS.loadRemoteEntry(store, path, function (err, entry) {
              if (err) return done(err);
              IDBFS.storeLocalEntry(path, entry, done);
            });
          } else {
            IDBFS.loadLocalEntry(path, function (err, entry) {
              if (err) return done(err);
              IDBFS.storeRemoteEntry(store, path, entry, done);
            });
          }
        });
  
        // sort paths in descending order so files are deleted before their
        // parent directories
        remove.sort().reverse().forEach(function(path) {
          if (dst.type === 'local') {
            IDBFS.removeLocalEntry(path, done);
          } else {
            IDBFS.removeRemoteEntry(store, path, done);
          }
        });
      }};
  
  var NODEFS={isWindows:false,staticInit:function () {
        NODEFS.isWindows = !!process.platform.match(/^win/);
      },mount:function (mount) {
        assert(ENVIRONMENT_IS_NODE);
        return NODEFS.createNode(null, '/', NODEFS.getMode(mount.opts.root), 0);
      },createNode:function (parent, name, mode, dev) {
        if (!FS.isDir(mode) && !FS.isFile(mode) && !FS.isLink(mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var node = FS.createNode(parent, name, mode);
        node.node_ops = NODEFS.node_ops;
        node.stream_ops = NODEFS.stream_ops;
        return node;
      },getMode:function (path) {
        var stat;
        try {
          stat = fs.lstatSync(path);
          if (NODEFS.isWindows) {
            // On Windows, directories return permission bits 'rw-rw-rw-', even though they have 'rwxrwxrwx', so 
            // propagate write bits to execute bits.
            stat.mode = stat.mode | ((stat.mode & 146) >> 1);
          }
        } catch (e) {
          if (!e.code) throw e;
          throw new FS.ErrnoError(ERRNO_CODES[e.code]);
        }
        return stat.mode;
      },realPath:function (node) {
        var parts = [];
        while (node.parent !== node) {
          parts.push(node.name);
          node = node.parent;
        }
        parts.push(node.mount.opts.root);
        parts.reverse();
        return PATH.join.apply(null, parts);
      },flagsToPermissionStringMap:{0:"r",1:"r+",2:"r+",64:"r",65:"r+",66:"r+",129:"rx+",193:"rx+",514:"w+",577:"w",578:"w+",705:"wx",706:"wx+",1024:"a",1025:"a",1026:"a+",1089:"a",1090:"a+",1153:"ax",1154:"ax+",1217:"ax",1218:"ax+",4096:"rs",4098:"rs+"},flagsToPermissionString:function (flags) {
        if (flags in NODEFS.flagsToPermissionStringMap) {
          return NODEFS.flagsToPermissionStringMap[flags];
        } else {
          return flags;
        }
      },node_ops:{getattr:function (node) {
          var path = NODEFS.realPath(node);
          var stat;
          try {
            stat = fs.lstatSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
          // node.js v0.10.20 doesn't report blksize and blocks on Windows. Fake them with default blksize of 4096.
          // See http://support.microsoft.com/kb/140365
          if (NODEFS.isWindows && !stat.blksize) {
            stat.blksize = 4096;
          }
          if (NODEFS.isWindows && !stat.blocks) {
            stat.blocks = (stat.size+stat.blksize-1)/stat.blksize|0;
          }
          return {
            dev: stat.dev,
            ino: stat.ino,
            mode: stat.mode,
            nlink: stat.nlink,
            uid: stat.uid,
            gid: stat.gid,
            rdev: stat.rdev,
            size: stat.size,
            atime: stat.atime,
            mtime: stat.mtime,
            ctime: stat.ctime,
            blksize: stat.blksize,
            blocks: stat.blocks
          };
        },setattr:function (node, attr) {
          var path = NODEFS.realPath(node);
          try {
            if (attr.mode !== undefined) {
              fs.chmodSync(path, attr.mode);
              // update the common node structure mode as well
              node.mode = attr.mode;
            }
            if (attr.timestamp !== undefined) {
              var date = new Date(attr.timestamp);
              fs.utimesSync(path, date, date);
            }
            if (attr.size !== undefined) {
              fs.truncateSync(path, attr.size);
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },lookup:function (parent, name) {
          var path = PATH.join2(NODEFS.realPath(parent), name);
          var mode = NODEFS.getMode(path);
          return NODEFS.createNode(parent, name, mode);
        },mknod:function (parent, name, mode, dev) {
          var node = NODEFS.createNode(parent, name, mode, dev);
          // create the backing node for this in the fs root as well
          var path = NODEFS.realPath(node);
          try {
            if (FS.isDir(node.mode)) {
              fs.mkdirSync(path, node.mode);
            } else {
              fs.writeFileSync(path, '', { mode: node.mode });
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
          return node;
        },rename:function (oldNode, newDir, newName) {
          var oldPath = NODEFS.realPath(oldNode);
          var newPath = PATH.join2(NODEFS.realPath(newDir), newName);
          try {
            fs.renameSync(oldPath, newPath);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },unlink:function (parent, name) {
          var path = PATH.join2(NODEFS.realPath(parent), name);
          try {
            fs.unlinkSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },rmdir:function (parent, name) {
          var path = PATH.join2(NODEFS.realPath(parent), name);
          try {
            fs.rmdirSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },readdir:function (node) {
          var path = NODEFS.realPath(node);
          try {
            return fs.readdirSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },symlink:function (parent, newName, oldPath) {
          var newPath = PATH.join2(NODEFS.realPath(parent), newName);
          try {
            fs.symlinkSync(oldPath, newPath);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },readlink:function (node) {
          var path = NODEFS.realPath(node);
          try {
            return fs.readlinkSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        }},stream_ops:{open:function (stream) {
          var path = NODEFS.realPath(stream.node);
          try {
            if (FS.isFile(stream.node.mode)) {
              stream.nfd = fs.openSync(path, NODEFS.flagsToPermissionString(stream.flags));
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },close:function (stream) {
          try {
            if (FS.isFile(stream.node.mode) && stream.nfd) {
              fs.closeSync(stream.nfd);
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },read:function (stream, buffer, offset, length, position) {
          // FIXME this is terrible.
          var nbuffer = new Buffer(length);
          var res;
          try {
            res = fs.readSync(stream.nfd, nbuffer, 0, length, position);
          } catch (e) {
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
          if (res > 0) {
            for (var i = 0; i < res; i++) {
              buffer[offset + i] = nbuffer[i];
            }
          }
          return res;
        },write:function (stream, buffer, offset, length, position) {
          // FIXME this is terrible.
          var nbuffer = new Buffer(buffer.subarray(offset, offset + length));
          var res;
          try {
            res = fs.writeSync(stream.nfd, nbuffer, 0, length, position);
          } catch (e) {
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
          return res;
        },llseek:function (stream, offset, whence) {
          var position = offset;
          if (whence === 1) {  // SEEK_CUR.
            position += stream.position;
          } else if (whence === 2) {  // SEEK_END.
            if (FS.isFile(stream.node.mode)) {
              try {
                var stat = fs.fstatSync(stream.nfd);
                position += stat.size;
              } catch (e) {
                throw new FS.ErrnoError(ERRNO_CODES[e.code]);
              }
            }
          }
  
          if (position < 0) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
  
          stream.position = position;
          return position;
        }}};
  
  var _stdin=allocate(1, "i32*", ALLOC_STATIC);
  
  var _stdout=allocate(1, "i32*", ALLOC_STATIC);
  
  var _stderr=allocate(1, "i32*", ALLOC_STATIC);
  
  function _fflush(stream) {
      // int fflush(FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fflush.html
      // we don't currently perform any user-space buffering of data
    }var FS={root:null,mounts:[],devices:[null],streams:[],nextInode:1,nameTable:null,currentPath:"/",initialized:false,ignorePermissions:true,ErrnoError:null,genericErrors:{},handleFSError:function (e) {
        if (!(e instanceof FS.ErrnoError)) throw e + ' : ' + stackTrace();
        return ___setErrNo(e.errno);
      },lookupPath:function (path, opts) {
        path = PATH.resolve(FS.cwd(), path);
        opts = opts || {};
  
        var defaults = {
          follow_mount: true,
          recurse_count: 0
        };
        for (var key in defaults) {
          if (opts[key] === undefined) {
            opts[key] = defaults[key];
          }
        }
  
        if (opts.recurse_count > 8) {  // max recursive lookup of 8
          throw new FS.ErrnoError(ERRNO_CODES.ELOOP);
        }
  
        // split the path
        var parts = PATH.normalizeArray(path.split('/').filter(function(p) {
          return !!p;
        }), false);
  
        // start at the root
        var current = FS.root;
        var current_path = '/';
  
        for (var i = 0; i < parts.length; i++) {
          var islast = (i === parts.length-1);
          if (islast && opts.parent) {
            // stop resolving
            break;
          }
  
          current = FS.lookupNode(current, parts[i]);
          current_path = PATH.join2(current_path, parts[i]);
  
          // jump to the mount's root node if this is a mountpoint
          if (FS.isMountpoint(current)) {
            if (!islast || (islast && opts.follow_mount)) {
              current = current.mounted.root;
            }
          }
  
          // by default, lookupPath will not follow a symlink if it is the final path component.
          // setting opts.follow = true will override this behavior.
          if (!islast || opts.follow) {
            var count = 0;
            while (FS.isLink(current.mode)) {
              var link = FS.readlink(current_path);
              current_path = PATH.resolve(PATH.dirname(current_path), link);
              
              var lookup = FS.lookupPath(current_path, { recurse_count: opts.recurse_count });
              current = lookup.node;
  
              if (count++ > 40) {  // limit max consecutive symlinks to 40 (SYMLOOP_MAX).
                throw new FS.ErrnoError(ERRNO_CODES.ELOOP);
              }
            }
          }
        }
  
        return { path: current_path, node: current };
      },getPath:function (node) {
        var path;
        while (true) {
          if (FS.isRoot(node)) {
            var mount = node.mount.mountpoint;
            if (!path) return mount;
            return mount[mount.length-1] !== '/' ? mount + '/' + path : mount + path;
          }
          path = path ? node.name + '/' + path : node.name;
          node = node.parent;
        }
      },hashName:function (parentid, name) {
        var hash = 0;
  
  
        for (var i = 0; i < name.length; i++) {
          hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0;
        }
        return ((parentid + hash) >>> 0) % FS.nameTable.length;
      },hashAddNode:function (node) {
        var hash = FS.hashName(node.parent.id, node.name);
        node.name_next = FS.nameTable[hash];
        FS.nameTable[hash] = node;
      },hashRemoveNode:function (node) {
        var hash = FS.hashName(node.parent.id, node.name);
        if (FS.nameTable[hash] === node) {
          FS.nameTable[hash] = node.name_next;
        } else {
          var current = FS.nameTable[hash];
          while (current) {
            if (current.name_next === node) {
              current.name_next = node.name_next;
              break;
            }
            current = current.name_next;
          }
        }
      },lookupNode:function (parent, name) {
        var err = FS.mayLookup(parent);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        var hash = FS.hashName(parent.id, name);
        for (var node = FS.nameTable[hash]; node; node = node.name_next) {
          var nodeName = node.name;
          if (node.parent.id === parent.id && nodeName === name) {
            return node;
          }
        }
        // if we failed to find it in the cache, call into the VFS
        return FS.lookup(parent, name);
      },createNode:function (parent, name, mode, rdev) {
        if (!FS.FSNode) {
          FS.FSNode = function(parent, name, mode, rdev) {
            if (!parent) {
              parent = this;  // root node sets parent to itself
            }
            this.parent = parent;
            this.mount = parent.mount;
            this.mounted = null;
            this.id = FS.nextInode++;
            this.name = name;
            this.mode = mode;
            this.node_ops = {};
            this.stream_ops = {};
            this.rdev = rdev;
          };
  
          FS.FSNode.prototype = {};
  
          // compatibility
          var readMode = 292 | 73;
          var writeMode = 146;
  
          // NOTE we must use Object.defineProperties instead of individual calls to
          // Object.defineProperty in order to make closure compiler happy
          Object.defineProperties(FS.FSNode.prototype, {
            read: {
              get: function() { return (this.mode & readMode) === readMode; },
              set: function(val) { val ? this.mode |= readMode : this.mode &= ~readMode; }
            },
            write: {
              get: function() { return (this.mode & writeMode) === writeMode; },
              set: function(val) { val ? this.mode |= writeMode : this.mode &= ~writeMode; }
            },
            isFolder: {
              get: function() { return FS.isDir(this.mode); },
            },
            isDevice: {
              get: function() { return FS.isChrdev(this.mode); },
            },
          });
        }
  
        var node = new FS.FSNode(parent, name, mode, rdev);
  
        FS.hashAddNode(node);
  
        return node;
      },destroyNode:function (node) {
        FS.hashRemoveNode(node);
      },isRoot:function (node) {
        return node === node.parent;
      },isMountpoint:function (node) {
        return !!node.mounted;
      },isFile:function (mode) {
        return (mode & 61440) === 32768;
      },isDir:function (mode) {
        return (mode & 61440) === 16384;
      },isLink:function (mode) {
        return (mode & 61440) === 40960;
      },isChrdev:function (mode) {
        return (mode & 61440) === 8192;
      },isBlkdev:function (mode) {
        return (mode & 61440) === 24576;
      },isFIFO:function (mode) {
        return (mode & 61440) === 4096;
      },isSocket:function (mode) {
        return (mode & 49152) === 49152;
      },flagModes:{"r":0,"rs":1052672,"r+":2,"w":577,"wx":705,"xw":705,"w+":578,"wx+":706,"xw+":706,"a":1089,"ax":1217,"xa":1217,"a+":1090,"ax+":1218,"xa+":1218},modeStringToFlags:function (str) {
        var flags = FS.flagModes[str];
        if (typeof flags === 'undefined') {
          throw new Error('Unknown file open mode: ' + str);
        }
        return flags;
      },flagsToPermissionString:function (flag) {
        var accmode = flag & 2097155;
        var perms = ['r', 'w', 'rw'][accmode];
        if ((flag & 512)) {
          perms += 'w';
        }
        return perms;
      },nodePermissions:function (node, perms) {
        if (FS.ignorePermissions) {
          return 0;
        }
        // return 0 if any user, group or owner bits are set.
        if (perms.indexOf('r') !== -1 && !(node.mode & 292)) {
          return ERRNO_CODES.EACCES;
        } else if (perms.indexOf('w') !== -1 && !(node.mode & 146)) {
          return ERRNO_CODES.EACCES;
        } else if (perms.indexOf('x') !== -1 && !(node.mode & 73)) {
          return ERRNO_CODES.EACCES;
        }
        return 0;
      },mayLookup:function (dir) {
        return FS.nodePermissions(dir, 'x');
      },mayCreate:function (dir, name) {
        try {
          var node = FS.lookupNode(dir, name);
          return ERRNO_CODES.EEXIST;
        } catch (e) {
        }
        return FS.nodePermissions(dir, 'wx');
      },mayDelete:function (dir, name, isdir) {
        var node;
        try {
          node = FS.lookupNode(dir, name);
        } catch (e) {
          return e.errno;
        }
        var err = FS.nodePermissions(dir, 'wx');
        if (err) {
          return err;
        }
        if (isdir) {
          if (!FS.isDir(node.mode)) {
            return ERRNO_CODES.ENOTDIR;
          }
          if (FS.isRoot(node) || FS.getPath(node) === FS.cwd()) {
            return ERRNO_CODES.EBUSY;
          }
        } else {
          if (FS.isDir(node.mode)) {
            return ERRNO_CODES.EISDIR;
          }
        }
        return 0;
      },mayOpen:function (node, flags) {
        if (!node) {
          return ERRNO_CODES.ENOENT;
        }
        if (FS.isLink(node.mode)) {
          return ERRNO_CODES.ELOOP;
        } else if (FS.isDir(node.mode)) {
          if ((flags & 2097155) !== 0 ||  // opening for write
              (flags & 512)) {
            return ERRNO_CODES.EISDIR;
          }
        }
        return FS.nodePermissions(node, FS.flagsToPermissionString(flags));
      },MAX_OPEN_FDS:4096,nextfd:function (fd_start, fd_end) {
        fd_start = fd_start || 0;
        fd_end = fd_end || FS.MAX_OPEN_FDS;
        for (var fd = fd_start; fd <= fd_end; fd++) {
          if (!FS.streams[fd]) {
            return fd;
          }
        }
        throw new FS.ErrnoError(ERRNO_CODES.EMFILE);
      },getStream:function (fd) {
        return FS.streams[fd];
      },createStream:function (stream, fd_start, fd_end) {
        if (!FS.FSStream) {
          FS.FSStream = function(){};
          FS.FSStream.prototype = {};
          // compatibility
          Object.defineProperties(FS.FSStream.prototype, {
            object: {
              get: function() { return this.node; },
              set: function(val) { this.node = val; }
            },
            isRead: {
              get: function() { return (this.flags & 2097155) !== 1; }
            },
            isWrite: {
              get: function() { return (this.flags & 2097155) !== 0; }
            },
            isAppend: {
              get: function() { return (this.flags & 1024); }
            }
          });
        }
        if (stream.__proto__) {
          // reuse the object
          stream.__proto__ = FS.FSStream.prototype;
        } else {
          var newStream = new FS.FSStream();
          for (var p in stream) {
            newStream[p] = stream[p];
          }
          stream = newStream;
        }
        var fd = FS.nextfd(fd_start, fd_end);
        stream.fd = fd;
        FS.streams[fd] = stream;
        return stream;
      },closeStream:function (fd) {
        FS.streams[fd] = null;
      },getStreamFromPtr:function (ptr) {
        return FS.streams[ptr - 1];
      },getPtrForStream:function (stream) {
        return stream ? stream.fd + 1 : 0;
      },chrdev_stream_ops:{open:function (stream) {
          var device = FS.getDevice(stream.node.rdev);
          // override node's stream ops with the device's
          stream.stream_ops = device.stream_ops;
          // forward the open call
          if (stream.stream_ops.open) {
            stream.stream_ops.open(stream);
          }
        },llseek:function () {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }},major:function (dev) {
        return ((dev) >> 8);
      },minor:function (dev) {
        return ((dev) & 0xff);
      },makedev:function (ma, mi) {
        return ((ma) << 8 | (mi));
      },registerDevice:function (dev, ops) {
        FS.devices[dev] = { stream_ops: ops };
      },getDevice:function (dev) {
        return FS.devices[dev];
      },getMounts:function (mount) {
        var mounts = [];
        var check = [mount];
  
        while (check.length) {
          var m = check.pop();
  
          mounts.push(m);
  
          check.push.apply(check, m.mounts);
        }
  
        return mounts;
      },syncfs:function (populate, callback) {
        if (typeof(populate) === 'function') {
          callback = populate;
          populate = false;
        }
  
        var mounts = FS.getMounts(FS.root.mount);
        var completed = 0;
  
        function done(err) {
          if (err) {
            if (!done.errored) {
              done.errored = true;
              return callback(err);
            }
            return;
          }
          if (++completed >= mounts.length) {
            callback(null);
          }
        };
  
        // sync all mounts
        mounts.forEach(function (mount) {
          if (!mount.type.syncfs) {
            return done(null);
          }
          mount.type.syncfs(mount, populate, done);
        });
      },mount:function (type, opts, mountpoint) {
        var root = mountpoint === '/';
        var pseudo = !mountpoint;
        var node;
  
        if (root && FS.root) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        } else if (!root && !pseudo) {
          var lookup = FS.lookupPath(mountpoint, { follow_mount: false });
  
          mountpoint = lookup.path;  // use the absolute path
          node = lookup.node;
  
          if (FS.isMountpoint(node)) {
            throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
          }
  
          if (!FS.isDir(node.mode)) {
            throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR);
          }
        }
  
        var mount = {
          type: type,
          opts: opts,
          mountpoint: mountpoint,
          mounts: []
        };
  
        // create a root node for the fs
        var mountRoot = type.mount(mount);
        mountRoot.mount = mount;
        mount.root = mountRoot;
  
        if (root) {
          FS.root = mountRoot;
        } else if (node) {
          // set as a mountpoint
          node.mounted = mount;
  
          // add the new mount to the current mount's children
          if (node.mount) {
            node.mount.mounts.push(mount);
          }
        }
  
        return mountRoot;
      },unmount:function (mountpoint) {
        var lookup = FS.lookupPath(mountpoint, { follow_mount: false });
  
        if (!FS.isMountpoint(lookup.node)) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
  
        // destroy the nodes for this mount, and all its child mounts
        var node = lookup.node;
        var mount = node.mounted;
        var mounts = FS.getMounts(mount);
  
        Object.keys(FS.nameTable).forEach(function (hash) {
          var current = FS.nameTable[hash];
  
          while (current) {
            var next = current.name_next;
  
            if (mounts.indexOf(current.mount) !== -1) {
              FS.destroyNode(current);
            }
  
            current = next;
          }
        });
  
        // no longer a mountpoint
        node.mounted = null;
  
        // remove this mount from the child mounts
        var idx = node.mount.mounts.indexOf(mount);
        assert(idx !== -1);
        node.mount.mounts.splice(idx, 1);
      },lookup:function (parent, name) {
        return parent.node_ops.lookup(parent, name);
      },mknod:function (path, mode, dev) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        var err = FS.mayCreate(parent, name);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.mknod) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        return parent.node_ops.mknod(parent, name, mode, dev);
      },create:function (path, mode) {
        mode = mode !== undefined ? mode : 438 /* 0666 */;
        mode &= 4095;
        mode |= 32768;
        return FS.mknod(path, mode, 0);
      },mkdir:function (path, mode) {
        mode = mode !== undefined ? mode : 511 /* 0777 */;
        mode &= 511 | 512;
        mode |= 16384;
        return FS.mknod(path, mode, 0);
      },mkdev:function (path, mode, dev) {
        if (typeof(dev) === 'undefined') {
          dev = mode;
          mode = 438 /* 0666 */;
        }
        mode |= 8192;
        return FS.mknod(path, mode, dev);
      },symlink:function (oldpath, newpath) {
        var lookup = FS.lookupPath(newpath, { parent: true });
        var parent = lookup.node;
        var newname = PATH.basename(newpath);
        var err = FS.mayCreate(parent, newname);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.symlink) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        return parent.node_ops.symlink(parent, newname, oldpath);
      },rename:function (old_path, new_path) {
        var old_dirname = PATH.dirname(old_path);
        var new_dirname = PATH.dirname(new_path);
        var old_name = PATH.basename(old_path);
        var new_name = PATH.basename(new_path);
        // parents must exist
        var lookup, old_dir, new_dir;
        try {
          lookup = FS.lookupPath(old_path, { parent: true });
          old_dir = lookup.node;
          lookup = FS.lookupPath(new_path, { parent: true });
          new_dir = lookup.node;
        } catch (e) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        // need to be part of the same mount
        if (old_dir.mount !== new_dir.mount) {
          throw new FS.ErrnoError(ERRNO_CODES.EXDEV);
        }
        // source must exist
        var old_node = FS.lookupNode(old_dir, old_name);
        // old path should not be an ancestor of the new path
        var relative = PATH.relative(old_path, new_dirname);
        if (relative.charAt(0) !== '.') {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        // new path should not be an ancestor of the old path
        relative = PATH.relative(new_path, old_dirname);
        if (relative.charAt(0) !== '.') {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
        }
        // see if the new path already exists
        var new_node;
        try {
          new_node = FS.lookupNode(new_dir, new_name);
        } catch (e) {
          // not fatal
        }
        // early out if nothing needs to change
        if (old_node === new_node) {
          return;
        }
        // we'll need to delete the old entry
        var isdir = FS.isDir(old_node.mode);
        var err = FS.mayDelete(old_dir, old_name, isdir);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        // need delete permissions if we'll be overwriting.
        // need create permissions if new doesn't already exist.
        err = new_node ?
          FS.mayDelete(new_dir, new_name, isdir) :
          FS.mayCreate(new_dir, new_name);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!old_dir.node_ops.rename) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isMountpoint(old_node) || (new_node && FS.isMountpoint(new_node))) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        // if we are going to change the parent, check write permissions
        if (new_dir !== old_dir) {
          err = FS.nodePermissions(old_dir, 'w');
          if (err) {
            throw new FS.ErrnoError(err);
          }
        }
        // remove the node from the lookup hash
        FS.hashRemoveNode(old_node);
        // do the underlying fs rename
        try {
          old_dir.node_ops.rename(old_node, new_dir, new_name);
        } catch (e) {
          throw e;
        } finally {
          // add the node back to the hash (in case node_ops.rename
          // changed its name)
          FS.hashAddNode(old_node);
        }
      },rmdir:function (path) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        var node = FS.lookupNode(parent, name);
        var err = FS.mayDelete(parent, name, true);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.rmdir) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isMountpoint(node)) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        parent.node_ops.rmdir(parent, name);
        FS.destroyNode(node);
      },readdir:function (path) {
        var lookup = FS.lookupPath(path, { follow: true });
        var node = lookup.node;
        if (!node.node_ops.readdir) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR);
        }
        return node.node_ops.readdir(node);
      },unlink:function (path) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        var node = FS.lookupNode(parent, name);
        var err = FS.mayDelete(parent, name, false);
        if (err) {
          // POSIX says unlink should set EPERM, not EISDIR
          if (err === ERRNO_CODES.EISDIR) err = ERRNO_CODES.EPERM;
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.unlink) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isMountpoint(node)) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        parent.node_ops.unlink(parent, name);
        FS.destroyNode(node);
      },readlink:function (path) {
        var lookup = FS.lookupPath(path);
        var link = lookup.node;
        if (!link.node_ops.readlink) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        return link.node_ops.readlink(link);
      },stat:function (path, dontFollow) {
        var lookup = FS.lookupPath(path, { follow: !dontFollow });
        var node = lookup.node;
        if (!node.node_ops.getattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        return node.node_ops.getattr(node);
      },lstat:function (path) {
        return FS.stat(path, true);
      },chmod:function (path, mode, dontFollow) {
        var node;
        if (typeof path === 'string') {
          var lookup = FS.lookupPath(path, { follow: !dontFollow });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        node.node_ops.setattr(node, {
          mode: (mode & 4095) | (node.mode & ~4095),
          timestamp: Date.now()
        });
      },lchmod:function (path, mode) {
        FS.chmod(path, mode, true);
      },fchmod:function (fd, mode) {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        FS.chmod(stream.node, mode);
      },chown:function (path, uid, gid, dontFollow) {
        var node;
        if (typeof path === 'string') {
          var lookup = FS.lookupPath(path, { follow: !dontFollow });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        node.node_ops.setattr(node, {
          timestamp: Date.now()
          // we ignore the uid / gid for now
        });
      },lchown:function (path, uid, gid) {
        FS.chown(path, uid, gid, true);
      },fchown:function (fd, uid, gid) {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        FS.chown(stream.node, uid, gid);
      },truncate:function (path, len) {
        if (len < 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var node;
        if (typeof path === 'string') {
          var lookup = FS.lookupPath(path, { follow: true });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isDir(node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
        }
        if (!FS.isFile(node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var err = FS.nodePermissions(node, 'w');
        if (err) {
          throw new FS.ErrnoError(err);
        }
        node.node_ops.setattr(node, {
          size: len,
          timestamp: Date.now()
        });
      },ftruncate:function (fd, len) {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if ((stream.flags & 2097155) === 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        FS.truncate(stream.node, len);
      },utime:function (path, atime, mtime) {
        var lookup = FS.lookupPath(path, { follow: true });
        var node = lookup.node;
        node.node_ops.setattr(node, {
          timestamp: Math.max(atime, mtime)
        });
      },open:function (path, flags, mode, fd_start, fd_end) {
        flags = typeof flags === 'string' ? FS.modeStringToFlags(flags) : flags;
        mode = typeof mode === 'undefined' ? 438 /* 0666 */ : mode;
        if ((flags & 64)) {
          mode = (mode & 4095) | 32768;
        } else {
          mode = 0;
        }
        var node;
        if (typeof path === 'object') {
          node = path;
        } else {
          path = PATH.normalize(path);
          try {
            var lookup = FS.lookupPath(path, {
              follow: !(flags & 131072)
            });
            node = lookup.node;
          } catch (e) {
            // ignore
          }
        }
        // perhaps we need to create the node
        if ((flags & 64)) {
          if (node) {
            // if O_CREAT and O_EXCL are set, error out if the node already exists
            if ((flags & 128)) {
              throw new FS.ErrnoError(ERRNO_CODES.EEXIST);
            }
          } else {
            // node doesn't exist, try to create it
            node = FS.mknod(path, mode, 0);
          }
        }
        if (!node) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
        }
        // can't truncate a device
        if (FS.isChrdev(node.mode)) {
          flags &= ~512;
        }
        // check permissions
        var err = FS.mayOpen(node, flags);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        // do truncation if necessary
        if ((flags & 512)) {
          FS.truncate(node, 0);
        }
        // we've already handled these, don't pass down to the underlying vfs
        flags &= ~(128 | 512);
  
        // register the stream with the filesystem
        var stream = FS.createStream({
          node: node,
          path: FS.getPath(node),  // we want the absolute path to the node
          flags: flags,
          seekable: true,
          position: 0,
          stream_ops: node.stream_ops,
          // used by the file family libc calls (fopen, fwrite, ferror, etc.)
          ungotten: [],
          error: false
        }, fd_start, fd_end);
        // call the new stream's open function
        if (stream.stream_ops.open) {
          stream.stream_ops.open(stream);
        }
        if (Module['logReadFiles'] && !(flags & 1)) {
          if (!FS.readFiles) FS.readFiles = {};
          if (!(path in FS.readFiles)) {
            FS.readFiles[path] = 1;
            Module['printErr']('read file: ' + path);
          }
        }
        return stream;
      },close:function (stream) {
        try {
          if (stream.stream_ops.close) {
            stream.stream_ops.close(stream);
          }
        } catch (e) {
          throw e;
        } finally {
          FS.closeStream(stream.fd);
        }
      },llseek:function (stream, offset, whence) {
        if (!stream.seekable || !stream.stream_ops.llseek) {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }
        return stream.stream_ops.llseek(stream, offset, whence);
      },read:function (stream, buffer, offset, length, position) {
        if (length < 0 || position < 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        if ((stream.flags & 2097155) === 1) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if (FS.isDir(stream.node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
        }
        if (!stream.stream_ops.read) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var seeking = true;
        if (typeof position === 'undefined') {
          position = stream.position;
          seeking = false;
        } else if (!stream.seekable) {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }
        var bytesRead = stream.stream_ops.read(stream, buffer, offset, length, position);
        if (!seeking) stream.position += bytesRead;
        return bytesRead;
      },write:function (stream, buffer, offset, length, position, canOwn) {
        if (length < 0 || position < 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        if ((stream.flags & 2097155) === 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if (FS.isDir(stream.node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
        }
        if (!stream.stream_ops.write) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var seeking = true;
        if (typeof position === 'undefined') {
          position = stream.position;
          seeking = false;
        } else if (!stream.seekable) {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }
        if (stream.flags & 1024) {
          // seek to the end before writing in append mode
          FS.llseek(stream, 0, 2);
        }
        var bytesWritten = stream.stream_ops.write(stream, buffer, offset, length, position, canOwn);
        if (!seeking) stream.position += bytesWritten;
        return bytesWritten;
      },allocate:function (stream, offset, length) {
        if (offset < 0 || length <= 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        if ((stream.flags & 2097155) === 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if (!FS.isFile(stream.node.mode) && !FS.isDir(node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
        }
        if (!stream.stream_ops.allocate) {
          throw new FS.ErrnoError(ERRNO_CODES.EOPNOTSUPP);
        }
        stream.stream_ops.allocate(stream, offset, length);
      },mmap:function (stream, buffer, offset, length, position, prot, flags) {
        // TODO if PROT is PROT_WRITE, make sure we have write access
        if ((stream.flags & 2097155) === 1) {
          throw new FS.ErrnoError(ERRNO_CODES.EACCES);
        }
        if (!stream.stream_ops.mmap) {
          throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
        }
        return stream.stream_ops.mmap(stream, buffer, offset, length, position, prot, flags);
      },ioctl:function (stream, cmd, arg) {
        if (!stream.stream_ops.ioctl) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTTY);
        }
        return stream.stream_ops.ioctl(stream, cmd, arg);
      },readFile:function (path, opts) {
        opts = opts || {};
        opts.flags = opts.flags || 'r';
        opts.encoding = opts.encoding || 'binary';
        if (opts.encoding !== 'utf8' && opts.encoding !== 'binary') {
          throw new Error('Invalid encoding type "' + opts.encoding + '"');
        }
        var ret;
        var stream = FS.open(path, opts.flags);
        var stat = FS.stat(path);
        var length = stat.size;
        var buf = new Uint8Array(length);
        FS.read(stream, buf, 0, length, 0);
        if (opts.encoding === 'utf8') {
          ret = '';
          var utf8 = new Runtime.UTF8Processor();
          for (var i = 0; i < length; i++) {
            ret += utf8.processCChar(buf[i]);
          }
        } else if (opts.encoding === 'binary') {
          ret = buf;
        }
        FS.close(stream);
        return ret;
      },writeFile:function (path, data, opts) {
        opts = opts || {};
        opts.flags = opts.flags || 'w';
        opts.encoding = opts.encoding || 'utf8';
        if (opts.encoding !== 'utf8' && opts.encoding !== 'binary') {
          throw new Error('Invalid encoding type "' + opts.encoding + '"');
        }
        var stream = FS.open(path, opts.flags, opts.mode);
        if (opts.encoding === 'utf8') {
          var utf8 = new Runtime.UTF8Processor();
          var buf = new Uint8Array(utf8.processJSString(data));
          FS.write(stream, buf, 0, buf.length, 0, opts.canOwn);
        } else if (opts.encoding === 'binary') {
          FS.write(stream, data, 0, data.length, 0, opts.canOwn);
        }
        FS.close(stream);
      },cwd:function () {
        return FS.currentPath;
      },chdir:function (path) {
        var lookup = FS.lookupPath(path, { follow: true });
        if (!FS.isDir(lookup.node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR);
        }
        var err = FS.nodePermissions(lookup.node, 'x');
        if (err) {
          throw new FS.ErrnoError(err);
        }
        FS.currentPath = lookup.path;
      },createDefaultDirectories:function () {
        FS.mkdir('/tmp');
      },createDefaultDevices:function () {
        // create /dev
        FS.mkdir('/dev');
        // setup /dev/null
        FS.registerDevice(FS.makedev(1, 3), {
          read: function() { return 0; },
          write: function() { return 0; }
        });
        FS.mkdev('/dev/null', FS.makedev(1, 3));
        // setup /dev/tty and /dev/tty1
        // stderr needs to print output using Module['printErr']
        // so we register a second tty just for it.
        TTY.register(FS.makedev(5, 0), TTY.default_tty_ops);
        TTY.register(FS.makedev(6, 0), TTY.default_tty1_ops);
        FS.mkdev('/dev/tty', FS.makedev(5, 0));
        FS.mkdev('/dev/tty1', FS.makedev(6, 0));
        // we're not going to emulate the actual shm device,
        // just create the tmp dirs that reside in it commonly
        FS.mkdir('/dev/shm');
        FS.mkdir('/dev/shm/tmp');
      },createStandardStreams:function () {
        // TODO deprecate the old functionality of a single
        // input / output callback and that utilizes FS.createDevice
        // and instead require a unique set of stream ops
  
        // by default, we symlink the standard streams to the
        // default tty devices. however, if the standard streams
        // have been overwritten we create a unique device for
        // them instead.
        if (Module['stdin']) {
          FS.createDevice('/dev', 'stdin', Module['stdin']);
        } else {
          FS.symlink('/dev/tty', '/dev/stdin');
        }
        if (Module['stdout']) {
          FS.createDevice('/dev', 'stdout', null, Module['stdout']);
        } else {
          FS.symlink('/dev/tty', '/dev/stdout');
        }
        if (Module['stderr']) {
          FS.createDevice('/dev', 'stderr', null, Module['stderr']);
        } else {
          FS.symlink('/dev/tty1', '/dev/stderr');
        }
  
        // open default streams for the stdin, stdout and stderr devices
        var stdin = FS.open('/dev/stdin', 'r');
        HEAP32[((_stdin)>>2)]=FS.getPtrForStream(stdin);
        assert(stdin.fd === 0, 'invalid handle for stdin (' + stdin.fd + ')');
  
        var stdout = FS.open('/dev/stdout', 'w');
        HEAP32[((_stdout)>>2)]=FS.getPtrForStream(stdout);
        assert(stdout.fd === 1, 'invalid handle for stdout (' + stdout.fd + ')');
  
        var stderr = FS.open('/dev/stderr', 'w');
        HEAP32[((_stderr)>>2)]=FS.getPtrForStream(stderr);
        assert(stderr.fd === 2, 'invalid handle for stderr (' + stderr.fd + ')');
      },ensureErrnoError:function () {
        if (FS.ErrnoError) return;
        FS.ErrnoError = function ErrnoError(errno) {
          this.errno = errno;
          for (var key in ERRNO_CODES) {
            if (ERRNO_CODES[key] === errno) {
              this.code = key;
              break;
            }
          }
          this.message = ERRNO_MESSAGES[errno];
        };
        FS.ErrnoError.prototype = new Error();
        FS.ErrnoError.prototype.constructor = FS.ErrnoError;
        // Some errors may happen quite a bit, to avoid overhead we reuse them (and suffer a lack of stack info)
        [ERRNO_CODES.ENOENT].forEach(function(code) {
          FS.genericErrors[code] = new FS.ErrnoError(code);
          FS.genericErrors[code].stack = '<generic error, no stack>';
        });
      },staticInit:function () {
        FS.ensureErrnoError();
  
        FS.nameTable = new Array(4096);
  
        FS.mount(MEMFS, {}, '/');
  
        FS.createDefaultDirectories();
        FS.createDefaultDevices();
      },init:function (input, output, error) {
        assert(!FS.init.initialized, 'FS.init was previously called. If you want to initialize later with custom parameters, remove any earlier calls (note that one is automatically added to the generated code)');
        FS.init.initialized = true;
  
        FS.ensureErrnoError();
  
        // Allow Module.stdin etc. to provide defaults, if none explicitly passed to us here
        Module['stdin'] = input || Module['stdin'];
        Module['stdout'] = output || Module['stdout'];
        Module['stderr'] = error || Module['stderr'];
  
        FS.createStandardStreams();
      },quit:function () {
        FS.init.initialized = false;
        for (var i = 0; i < FS.streams.length; i++) {
          var stream = FS.streams[i];
          if (!stream) {
            continue;
          }
          FS.close(stream);
        }
      },getMode:function (canRead, canWrite) {
        var mode = 0;
        if (canRead) mode |= 292 | 73;
        if (canWrite) mode |= 146;
        return mode;
      },joinPath:function (parts, forceRelative) {
        var path = PATH.join.apply(null, parts);
        if (forceRelative && path[0] == '/') path = path.substr(1);
        return path;
      },absolutePath:function (relative, base) {
        return PATH.resolve(base, relative);
      },standardizePath:function (path) {
        return PATH.normalize(path);
      },findObject:function (path, dontResolveLastLink) {
        var ret = FS.analyzePath(path, dontResolveLastLink);
        if (ret.exists) {
          return ret.object;
        } else {
          ___setErrNo(ret.error);
          return null;
        }
      },analyzePath:function (path, dontResolveLastLink) {
        // operate from within the context of the symlink's target
        try {
          var lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
          path = lookup.path;
        } catch (e) {
        }
        var ret = {
          isRoot: false, exists: false, error: 0, name: null, path: null, object: null,
          parentExists: false, parentPath: null, parentObject: null
        };
        try {
          var lookup = FS.lookupPath(path, { parent: true });
          ret.parentExists = true;
          ret.parentPath = lookup.path;
          ret.parentObject = lookup.node;
          ret.name = PATH.basename(path);
          lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
          ret.exists = true;
          ret.path = lookup.path;
          ret.object = lookup.node;
          ret.name = lookup.node.name;
          ret.isRoot = lookup.path === '/';
        } catch (e) {
          ret.error = e.errno;
        };
        return ret;
      },createFolder:function (parent, name, canRead, canWrite) {
        var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(canRead, canWrite);
        return FS.mkdir(path, mode);
      },createPath:function (parent, path, canRead, canWrite) {
        parent = typeof parent === 'string' ? parent : FS.getPath(parent);
        var parts = path.split('/').reverse();
        while (parts.length) {
          var part = parts.pop();
          if (!part) continue;
          var current = PATH.join2(parent, part);
          try {
            FS.mkdir(current);
          } catch (e) {
            // ignore EEXIST
          }
          parent = current;
        }
        return current;
      },createFile:function (parent, name, properties, canRead, canWrite) {
        var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(canRead, canWrite);
        return FS.create(path, mode);
      },createDataFile:function (parent, name, data, canRead, canWrite, canOwn) {
        var path = name ? PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name) : parent;
        var mode = FS.getMode(canRead, canWrite);
        var node = FS.create(path, mode);
        if (data) {
          if (typeof data === 'string') {
            var arr = new Array(data.length);
            for (var i = 0, len = data.length; i < len; ++i) arr[i] = data.charCodeAt(i);
            data = arr;
          }
          // make sure we can write to the file
          FS.chmod(node, mode | 146);
          var stream = FS.open(node, 'w');
          FS.write(stream, data, 0, data.length, 0, canOwn);
          FS.close(stream);
          FS.chmod(node, mode);
        }
        return node;
      },createDevice:function (parent, name, input, output) {
        var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(!!input, !!output);
        if (!FS.createDevice.major) FS.createDevice.major = 64;
        var dev = FS.makedev(FS.createDevice.major++, 0);
        // Create a fake device that a set of stream ops to emulate
        // the old behavior.
        FS.registerDevice(dev, {
          open: function(stream) {
            stream.seekable = false;
          },
          close: function(stream) {
            // flush any pending line data
            if (output && output.buffer && output.buffer.length) {
              output(10);
            }
          },
          read: function(stream, buffer, offset, length, pos /* ignored */) {
            var bytesRead = 0;
            for (var i = 0; i < length; i++) {
              var result;
              try {
                result = input();
              } catch (e) {
                throw new FS.ErrnoError(ERRNO_CODES.EIO);
              }
              if (result === undefined && bytesRead === 0) {
                throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
              }
              if (result === null || result === undefined) break;
              bytesRead++;
              buffer[offset+i] = result;
            }
            if (bytesRead) {
              stream.node.timestamp = Date.now();
            }
            return bytesRead;
          },
          write: function(stream, buffer, offset, length, pos) {
            for (var i = 0; i < length; i++) {
              try {
                output(buffer[offset+i]);
              } catch (e) {
                throw new FS.ErrnoError(ERRNO_CODES.EIO);
              }
            }
            if (length) {
              stream.node.timestamp = Date.now();
            }
            return i;
          }
        });
        return FS.mkdev(path, mode, dev);
      },createLink:function (parent, name, target, canRead, canWrite) {
        var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        return FS.symlink(target, path);
      },forceLoadFile:function (obj) {
        if (obj.isDevice || obj.isFolder || obj.link || obj.contents) return true;
        var success = true;
        if (typeof XMLHttpRequest !== 'undefined') {
          throw new Error("Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.");
        } else if (Module['read']) {
          // Command-line.
          try {
            // WARNING: Can't read binary files in V8's d8 or tracemonkey's js, as
            //          read() will try to parse UTF8.
            obj.contents = intArrayFromString(Module['read'](obj.url), true);
          } catch (e) {
            success = false;
          }
        } else {
          throw new Error('Cannot load without read() or XMLHttpRequest.');
        }
        if (!success) ___setErrNo(ERRNO_CODES.EIO);
        return success;
      },createLazyFile:function (parent, name, url, canRead, canWrite) {
        if (typeof XMLHttpRequest !== 'undefined') {
          if (!ENVIRONMENT_IS_WORKER) throw 'Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc';
          // Lazy chunked Uint8Array (implements get and length from Uint8Array). Actual getting is abstracted away for eventual reuse.
          function LazyUint8Array() {
            this.lengthKnown = false;
            this.chunks = []; // Loaded chunks. Index is the chunk number
          }
          LazyUint8Array.prototype.get = function LazyUint8Array_get(idx) {
            if (idx > this.length-1 || idx < 0) {
              return undefined;
            }
            var chunkOffset = idx % this.chunkSize;
            var chunkNum = Math.floor(idx / this.chunkSize);
            return this.getter(chunkNum)[chunkOffset];
          }
          LazyUint8Array.prototype.setDataGetter = function LazyUint8Array_setDataGetter(getter) {
            this.getter = getter;
          }
          LazyUint8Array.prototype.cacheLength = function LazyUint8Array_cacheLength() {
              // Find length
              var xhr = new XMLHttpRequest();
              xhr.open('HEAD', url, false);
              xhr.send(null);
              if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
              var datalength = Number(xhr.getResponseHeader("Content-length"));
              var header;
              var hasByteServing = (header = xhr.getResponseHeader("Accept-Ranges")) && header === "bytes";
              var chunkSize = 1024*1024; // Chunk size in bytes
  
              if (!hasByteServing) chunkSize = datalength;
  
              // Function to get a range from the remote URL.
              var doXHR = (function(from, to) {
                if (from > to) throw new Error("invalid range (" + from + ", " + to + ") or no bytes requested!");
                if (to > datalength-1) throw new Error("only " + datalength + " bytes available! programmer error!");
  
                // TODO: Use mozResponseArrayBuffer, responseStream, etc. if available.
                var xhr = new XMLHttpRequest();
                xhr.open('GET', url, false);
                if (datalength !== chunkSize) xhr.setRequestHeader("Range", "bytes=" + from + "-" + to);
  
                // Some hints to the browser that we want binary data.
                if (typeof Uint8Array != 'undefined') xhr.responseType = 'arraybuffer';
                if (xhr.overrideMimeType) {
                  xhr.overrideMimeType('text/plain; charset=x-user-defined');
                }
  
                xhr.send(null);
                if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
                if (xhr.response !== undefined) {
                  return new Uint8Array(xhr.response || []);
                } else {
                  return intArrayFromString(xhr.responseText || '', true);
                }
              });
              var lazyArray = this;
              lazyArray.setDataGetter(function(chunkNum) {
                var start = chunkNum * chunkSize;
                var end = (chunkNum+1) * chunkSize - 1; // including this byte
                end = Math.min(end, datalength-1); // if datalength-1 is selected, this is the last block
                if (typeof(lazyArray.chunks[chunkNum]) === "undefined") {
                  lazyArray.chunks[chunkNum] = doXHR(start, end);
                }
                if (typeof(lazyArray.chunks[chunkNum]) === "undefined") throw new Error("doXHR failed!");
                return lazyArray.chunks[chunkNum];
              });
  
              this._length = datalength;
              this._chunkSize = chunkSize;
              this.lengthKnown = true;
          }
  
          var lazyArray = new LazyUint8Array();
          Object.defineProperty(lazyArray, "length", {
              get: function() {
                  if(!this.lengthKnown) {
                      this.cacheLength();
                  }
                  return this._length;
              }
          });
          Object.defineProperty(lazyArray, "chunkSize", {
              get: function() {
                  if(!this.lengthKnown) {
                      this.cacheLength();
                  }
                  return this._chunkSize;
              }
          });
  
          var properties = { isDevice: false, contents: lazyArray };
        } else {
          var properties = { isDevice: false, url: url };
        }
  
        var node = FS.createFile(parent, name, properties, canRead, canWrite);
        // This is a total hack, but I want to get this lazy file code out of the
        // core of MEMFS. If we want to keep this lazy file concept I feel it should
        // be its own thin LAZYFS proxying calls to MEMFS.
        if (properties.contents) {
          node.contents = properties.contents;
        } else if (properties.url) {
          node.contents = null;
          node.url = properties.url;
        }
        // override each stream op with one that tries to force load the lazy file first
        var stream_ops = {};
        var keys = Object.keys(node.stream_ops);
        keys.forEach(function(key) {
          var fn = node.stream_ops[key];
          stream_ops[key] = function forceLoadLazyFile() {
            if (!FS.forceLoadFile(node)) {
              throw new FS.ErrnoError(ERRNO_CODES.EIO);
            }
            return fn.apply(null, arguments);
          };
        });
        // use a custom read function
        stream_ops.read = function stream_ops_read(stream, buffer, offset, length, position) {
          if (!FS.forceLoadFile(node)) {
            throw new FS.ErrnoError(ERRNO_CODES.EIO);
          }
          var contents = stream.node.contents;
          if (position >= contents.length)
            return 0;
          var size = Math.min(contents.length - position, length);
          assert(size >= 0);
          if (contents.slice) { // normal array
            for (var i = 0; i < size; i++) {
              buffer[offset + i] = contents[position + i];
            }
          } else {
            for (var i = 0; i < size; i++) { // LazyUint8Array from sync binary XHR
              buffer[offset + i] = contents.get(position + i);
            }
          }
          return size;
        };
        node.stream_ops = stream_ops;
        return node;
      },createPreloadedFile:function (parent, name, url, canRead, canWrite, onload, onerror, dontCreateFile, canOwn) {
        Browser.init();
        // TODO we should allow people to just pass in a complete filename instead
        // of parent and name being that we just join them anyways
        var fullname = name ? PATH.resolve(PATH.join2(parent, name)) : parent;
        function processData(byteArray) {
          function finish(byteArray) {
            if (!dontCreateFile) {
              FS.createDataFile(parent, name, byteArray, canRead, canWrite, canOwn);
            }
            if (onload) onload();
            removeRunDependency('cp ' + fullname);
          }
          var handled = false;
          Module['preloadPlugins'].forEach(function(plugin) {
            if (handled) return;
            if (plugin['canHandle'](fullname)) {
              plugin['handle'](byteArray, fullname, finish, function() {
                if (onerror) onerror();
                removeRunDependency('cp ' + fullname);
              });
              handled = true;
            }
          });
          if (!handled) finish(byteArray);
        }
        addRunDependency('cp ' + fullname);
        if (typeof url == 'string') {
          Browser.asyncLoad(url, function(byteArray) {
            processData(byteArray);
          }, onerror);
        } else {
          processData(url);
        }
      },indexedDB:function () {
        return window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
      },DB_NAME:function () {
        return 'EM_FS_' + window.location.pathname;
      },DB_VERSION:20,DB_STORE_NAME:"FILE_DATA",saveFilesToDB:function (paths, onload, onerror) {
        onload = onload || function(){};
        onerror = onerror || function(){};
        var indexedDB = FS.indexedDB();
        try {
          var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION);
        } catch (e) {
          return onerror(e);
        }
        openRequest.onupgradeneeded = function openRequest_onupgradeneeded() {
          console.log('creating db');
          var db = openRequest.result;
          db.createObjectStore(FS.DB_STORE_NAME);
        };
        openRequest.onsuccess = function openRequest_onsuccess() {
          var db = openRequest.result;
          var transaction = db.transaction([FS.DB_STORE_NAME], 'readwrite');
          var files = transaction.objectStore(FS.DB_STORE_NAME);
          var ok = 0, fail = 0, total = paths.length;
          function finish() {
            if (fail == 0) onload(); else onerror();
          }
          paths.forEach(function(path) {
            var putRequest = files.put(FS.analyzePath(path).object.contents, path);
            putRequest.onsuccess = function putRequest_onsuccess() { ok++; if (ok + fail == total) finish() };
            putRequest.onerror = function putRequest_onerror() { fail++; if (ok + fail == total) finish() };
          });
          transaction.onerror = onerror;
        };
        openRequest.onerror = onerror;
      },loadFilesFromDB:function (paths, onload, onerror) {
        onload = onload || function(){};
        onerror = onerror || function(){};
        var indexedDB = FS.indexedDB();
        try {
          var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION);
        } catch (e) {
          return onerror(e);
        }
        openRequest.onupgradeneeded = onerror; // no database to load from
        openRequest.onsuccess = function openRequest_onsuccess() {
          var db = openRequest.result;
          try {
            var transaction = db.transaction([FS.DB_STORE_NAME], 'readonly');
          } catch(e) {
            onerror(e);
            return;
          }
          var files = transaction.objectStore(FS.DB_STORE_NAME);
          var ok = 0, fail = 0, total = paths.length;
          function finish() {
            if (fail == 0) onload(); else onerror();
          }
          paths.forEach(function(path) {
            var getRequest = files.get(path);
            getRequest.onsuccess = function getRequest_onsuccess() {
              if (FS.analyzePath(path).exists) {
                FS.unlink(path);
              }
              FS.createDataFile(PATH.dirname(path), PATH.basename(path), getRequest.result, true, true, true);
              ok++;
              if (ok + fail == total) finish();
            };
            getRequest.onerror = function getRequest_onerror() { fail++; if (ok + fail == total) finish() };
          });
          transaction.onerror = onerror;
        };
        openRequest.onerror = onerror;
      }};
  
  
  
  
  function _mkport() { throw 'TODO' }var SOCKFS={mount:function (mount) {
        return FS.createNode(null, '/', 16384 | 511 /* 0777 */, 0);
      },createSocket:function (family, type, protocol) {
        var streaming = type == 1;
        if (protocol) {
          assert(streaming == (protocol == 6)); // if SOCK_STREAM, must be tcp
        }
  
        // create our internal socket structure
        var sock = {
          family: family,
          type: type,
          protocol: protocol,
          server: null,
          peers: {},
          pending: [],
          recv_queue: [],
          sock_ops: SOCKFS.websocket_sock_ops
        };
  
        // create the filesystem node to store the socket structure
        var name = SOCKFS.nextname();
        var node = FS.createNode(SOCKFS.root, name, 49152, 0);
        node.sock = sock;
  
        // and the wrapping stream that enables library functions such
        // as read and write to indirectly interact with the socket
        var stream = FS.createStream({
          path: name,
          node: node,
          flags: FS.modeStringToFlags('r+'),
          seekable: false,
          stream_ops: SOCKFS.stream_ops
        });
  
        // map the new stream to the socket structure (sockets have a 1:1
        // relationship with a stream)
        sock.stream = stream;
  
        return sock;
      },getSocket:function (fd) {
        var stream = FS.getStream(fd);
        if (!stream || !FS.isSocket(stream.node.mode)) {
          return null;
        }
        return stream.node.sock;
      },stream_ops:{poll:function (stream) {
          var sock = stream.node.sock;
          return sock.sock_ops.poll(sock);
        },ioctl:function (stream, request, varargs) {
          var sock = stream.node.sock;
          return sock.sock_ops.ioctl(sock, request, varargs);
        },read:function (stream, buffer, offset, length, position /* ignored */) {
          var sock = stream.node.sock;
          var msg = sock.sock_ops.recvmsg(sock, length);
          if (!msg) {
            // socket is closed
            return 0;
          }
          buffer.set(msg.buffer, offset);
          return msg.buffer.length;
        },write:function (stream, buffer, offset, length, position /* ignored */) {
          var sock = stream.node.sock;
          return sock.sock_ops.sendmsg(sock, buffer, offset, length);
        },close:function (stream) {
          var sock = stream.node.sock;
          sock.sock_ops.close(sock);
        }},nextname:function () {
        if (!SOCKFS.nextname.current) {
          SOCKFS.nextname.current = 0;
        }
        return 'socket[' + (SOCKFS.nextname.current++) + ']';
      },websocket_sock_ops:{createPeer:function (sock, addr, port) {
          var ws;
  
          if (typeof addr === 'object') {
            ws = addr;
            addr = null;
            port = null;
          }
  
          if (ws) {
            // for sockets that've already connected (e.g. we're the server)
            // we can inspect the _socket property for the address
            if (ws._socket) {
              addr = ws._socket.remoteAddress;
              port = ws._socket.remotePort;
            }
            // if we're just now initializing a connection to the remote,
            // inspect the url property
            else {
              var result = /ws[s]?:\/\/([^:]+):(\d+)/.exec(ws.url);
              if (!result) {
                throw new Error('WebSocket URL must be in the format ws(s)://address:port');
              }
              addr = result[1];
              port = parseInt(result[2], 10);
            }
          } else {
            // create the actual websocket object and connect
            try {
              var url = 'ws://' + addr + ':' + port;
              // the node ws library API is slightly different than the browser's
              var opts = ENVIRONMENT_IS_NODE ? {headers: {'websocket-protocol': ['binary']}} : ['binary'];
              // If node we use the ws library.
              var WebSocket = ENVIRONMENT_IS_NODE ? require('ws') : window['WebSocket'];
              ws = new WebSocket(url, opts);
              ws.binaryType = 'arraybuffer';
            } catch (e) {
              throw new FS.ErrnoError(ERRNO_CODES.EHOSTUNREACH);
            }
          }
  
  
          var peer = {
            addr: addr,
            port: port,
            socket: ws,
            dgram_send_queue: []
          };
  
          SOCKFS.websocket_sock_ops.addPeer(sock, peer);
          SOCKFS.websocket_sock_ops.handlePeerEvents(sock, peer);
  
          // if this is a bound dgram socket, send the port number first to allow
          // us to override the ephemeral port reported to us by remotePort on the
          // remote end.
          if (sock.type === 2 && typeof sock.sport !== 'undefined') {
            peer.dgram_send_queue.push(new Uint8Array([
                255, 255, 255, 255,
                'p'.charCodeAt(0), 'o'.charCodeAt(0), 'r'.charCodeAt(0), 't'.charCodeAt(0),
                ((sock.sport & 0xff00) >> 8) , (sock.sport & 0xff)
            ]));
          }
  
          return peer;
        },getPeer:function (sock, addr, port) {
          return sock.peers[addr + ':' + port];
        },addPeer:function (sock, peer) {
          sock.peers[peer.addr + ':' + peer.port] = peer;
        },removePeer:function (sock, peer) {
          delete sock.peers[peer.addr + ':' + peer.port];
        },handlePeerEvents:function (sock, peer) {
          var first = true;
  
          var handleOpen = function () {
            try {
              var queued = peer.dgram_send_queue.shift();
              while (queued) {
                peer.socket.send(queued);
                queued = peer.dgram_send_queue.shift();
              }
            } catch (e) {
              // not much we can do here in the way of proper error handling as we've already
              // lied and said this data was sent. shut it down.
              peer.socket.close();
            }
          };
  
          function handleMessage(data) {
            assert(typeof data !== 'string' && data.byteLength !== undefined);  // must receive an ArrayBuffer
            data = new Uint8Array(data);  // make a typed array view on the array buffer
  
  
            // if this is the port message, override the peer's port with it
            var wasfirst = first;
            first = false;
            if (wasfirst &&
                data.length === 10 &&
                data[0] === 255 && data[1] === 255 && data[2] === 255 && data[3] === 255 &&
                data[4] === 'p'.charCodeAt(0) && data[5] === 'o'.charCodeAt(0) && data[6] === 'r'.charCodeAt(0) && data[7] === 't'.charCodeAt(0)) {
              // update the peer's port and it's key in the peer map
              var newport = ((data[8] << 8) | data[9]);
              SOCKFS.websocket_sock_ops.removePeer(sock, peer);
              peer.port = newport;
              SOCKFS.websocket_sock_ops.addPeer(sock, peer);
              return;
            }
  
            sock.recv_queue.push({ addr: peer.addr, port: peer.port, data: data });
          };
  
          if (ENVIRONMENT_IS_NODE) {
            peer.socket.on('open', handleOpen);
            peer.socket.on('message', function(data, flags) {
              if (!flags.binary) {
                return;
              }
              handleMessage((new Uint8Array(data)).buffer);  // copy from node Buffer -> ArrayBuffer
            });
            peer.socket.on('error', function() {
              // don't throw
            });
          } else {
            peer.socket.onopen = handleOpen;
            peer.socket.onmessage = function peer_socket_onmessage(event) {
              handleMessage(event.data);
            };
          }
        },poll:function (sock) {
          if (sock.type === 1 && sock.server) {
            // listen sockets should only say they're available for reading
            // if there are pending clients.
            return sock.pending.length ? (64 | 1) : 0;
          }
  
          var mask = 0;
          var dest = sock.type === 1 ?  // we only care about the socket state for connection-based sockets
            SOCKFS.websocket_sock_ops.getPeer(sock, sock.daddr, sock.dport) :
            null;
  
          if (sock.recv_queue.length ||
              !dest ||  // connection-less sockets are always ready to read
              (dest && dest.socket.readyState === dest.socket.CLOSING) ||
              (dest && dest.socket.readyState === dest.socket.CLOSED)) {  // let recv return 0 once closed
            mask |= (64 | 1);
          }
  
          if (!dest ||  // connection-less sockets are always ready to write
              (dest && dest.socket.readyState === dest.socket.OPEN)) {
            mask |= 4;
          }
  
          if ((dest && dest.socket.readyState === dest.socket.CLOSING) ||
              (dest && dest.socket.readyState === dest.socket.CLOSED)) {
            mask |= 16;
          }
  
          return mask;
        },ioctl:function (sock, request, arg) {
          switch (request) {
            case 21531:
              var bytes = 0;
              if (sock.recv_queue.length) {
                bytes = sock.recv_queue[0].data.length;
              }
              HEAP32[((arg)>>2)]=bytes;
              return 0;
            default:
              return ERRNO_CODES.EINVAL;
          }
        },close:function (sock) {
          // if we've spawned a listen server, close it
          if (sock.server) {
            try {
              sock.server.close();
            } catch (e) {
            }
            sock.server = null;
          }
          // close any peer connections
          var peers = Object.keys(sock.peers);
          for (var i = 0; i < peers.length; i++) {
            var peer = sock.peers[peers[i]];
            try {
              peer.socket.close();
            } catch (e) {
            }
            SOCKFS.websocket_sock_ops.removePeer(sock, peer);
          }
          return 0;
        },bind:function (sock, addr, port) {
          if (typeof sock.saddr !== 'undefined' || typeof sock.sport !== 'undefined') {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);  // already bound
          }
          sock.saddr = addr;
          sock.sport = port || _mkport();
          // in order to emulate dgram sockets, we need to launch a listen server when
          // binding on a connection-less socket
          // note: this is only required on the server side
          if (sock.type === 2) {
            // close the existing server if it exists
            if (sock.server) {
              sock.server.close();
              sock.server = null;
            }
            // swallow error operation not supported error that occurs when binding in the
            // browser where this isn't supported
            try {
              sock.sock_ops.listen(sock, 0);
            } catch (e) {
              if (!(e instanceof FS.ErrnoError)) throw e;
              if (e.errno !== ERRNO_CODES.EOPNOTSUPP) throw e;
            }
          }
        },connect:function (sock, addr, port) {
          if (sock.server) {
            throw new FS.ErrnoError(ERRNO_CODS.EOPNOTSUPP);
          }
  
          // TODO autobind
          // if (!sock.addr && sock.type == 2) {
          // }
  
          // early out if we're already connected / in the middle of connecting
          if (typeof sock.daddr !== 'undefined' && typeof sock.dport !== 'undefined') {
            var dest = SOCKFS.websocket_sock_ops.getPeer(sock, sock.daddr, sock.dport);
            if (dest) {
              if (dest.socket.readyState === dest.socket.CONNECTING) {
                throw new FS.ErrnoError(ERRNO_CODES.EALREADY);
              } else {
                throw new FS.ErrnoError(ERRNO_CODES.EISCONN);
              }
            }
          }
  
          // add the socket to our peer list and set our
          // destination address / port to match
          var peer = SOCKFS.websocket_sock_ops.createPeer(sock, addr, port);
          sock.daddr = peer.addr;
          sock.dport = peer.port;
  
          // always "fail" in non-blocking mode
          throw new FS.ErrnoError(ERRNO_CODES.EINPROGRESS);
        },listen:function (sock, backlog) {
          if (!ENVIRONMENT_IS_NODE) {
            throw new FS.ErrnoError(ERRNO_CODES.EOPNOTSUPP);
          }
          if (sock.server) {
             throw new FS.ErrnoError(ERRNO_CODES.EINVAL);  // already listening
          }
          var WebSocketServer = require('ws').Server;
          var host = sock.saddr;
          sock.server = new WebSocketServer({
            host: host,
            port: sock.sport
            // TODO support backlog
          });
  
          sock.server.on('connection', function(ws) {
            if (sock.type === 1) {
              var newsock = SOCKFS.createSocket(sock.family, sock.type, sock.protocol);
  
              // create a peer on the new socket
              var peer = SOCKFS.websocket_sock_ops.createPeer(newsock, ws);
              newsock.daddr = peer.addr;
              newsock.dport = peer.port;
  
              // push to queue for accept to pick up
              sock.pending.push(newsock);
            } else {
              // create a peer on the listen socket so calling sendto
              // with the listen socket and an address will resolve
              // to the correct client
              SOCKFS.websocket_sock_ops.createPeer(sock, ws);
            }
          });
          sock.server.on('closed', function() {
            sock.server = null;
          });
          sock.server.on('error', function() {
            // don't throw
          });
        },accept:function (listensock) {
          if (!listensock.server) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
          var newsock = listensock.pending.shift();
          newsock.stream.flags = listensock.stream.flags;
          return newsock;
        },getname:function (sock, peer) {
          var addr, port;
          if (peer) {
            if (sock.daddr === undefined || sock.dport === undefined) {
              throw new FS.ErrnoError(ERRNO_CODES.ENOTCONN);
            }
            addr = sock.daddr;
            port = sock.dport;
          } else {
            // TODO saddr and sport will be set for bind()'d UDP sockets, but what
            // should we be returning for TCP sockets that've been connect()'d?
            addr = sock.saddr || 0;
            port = sock.sport || 0;
          }
          return { addr: addr, port: port };
        },sendmsg:function (sock, buffer, offset, length, addr, port) {
          if (sock.type === 2) {
            // connection-less sockets will honor the message address,
            // and otherwise fall back to the bound destination address
            if (addr === undefined || port === undefined) {
              addr = sock.daddr;
              port = sock.dport;
            }
            // if there was no address to fall back to, error out
            if (addr === undefined || port === undefined) {
              throw new FS.ErrnoError(ERRNO_CODES.EDESTADDRREQ);
            }
          } else {
            // connection-based sockets will only use the bound
            addr = sock.daddr;
            port = sock.dport;
          }
  
          // find the peer for the destination address
          var dest = SOCKFS.websocket_sock_ops.getPeer(sock, addr, port);
  
          // early out if not connected with a connection-based socket
          if (sock.type === 1) {
            if (!dest || dest.socket.readyState === dest.socket.CLOSING || dest.socket.readyState === dest.socket.CLOSED) {
              throw new FS.ErrnoError(ERRNO_CODES.ENOTCONN);
            } else if (dest.socket.readyState === dest.socket.CONNECTING) {
              throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
            }
          }
  
          // create a copy of the incoming data to send, as the WebSocket API
          // doesn't work entirely with an ArrayBufferView, it'll just send
          // the entire underlying buffer
          var data;
          if (buffer instanceof Array || buffer instanceof ArrayBuffer) {
            data = buffer.slice(offset, offset + length);
          } else {  // ArrayBufferView
            data = buffer.buffer.slice(buffer.byteOffset + offset, buffer.byteOffset + offset + length);
          }
  
          // if we're emulating a connection-less dgram socket and don't have
          // a cached connection, queue the buffer to send upon connect and
          // lie, saying the data was sent now.
          if (sock.type === 2) {
            if (!dest || dest.socket.readyState !== dest.socket.OPEN) {
              // if we're not connected, open a new connection
              if (!dest || dest.socket.readyState === dest.socket.CLOSING || dest.socket.readyState === dest.socket.CLOSED) {
                dest = SOCKFS.websocket_sock_ops.createPeer(sock, addr, port);
              }
              dest.dgram_send_queue.push(data);
              return length;
            }
          }
  
          try {
            // send the actual data
            dest.socket.send(data);
            return length;
          } catch (e) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
        },recvmsg:function (sock, length) {
          // http://pubs.opengroup.org/onlinepubs/7908799/xns/recvmsg.html
          if (sock.type === 1 && sock.server) {
            // tcp servers should not be recv()'ing on the listen socket
            throw new FS.ErrnoError(ERRNO_CODES.ENOTCONN);
          }
  
          var queued = sock.recv_queue.shift();
          if (!queued) {
            if (sock.type === 1) {
              var dest = SOCKFS.websocket_sock_ops.getPeer(sock, sock.daddr, sock.dport);
  
              if (!dest) {
                // if we have a destination address but are not connected, error out
                throw new FS.ErrnoError(ERRNO_CODES.ENOTCONN);
              }
              else if (dest.socket.readyState === dest.socket.CLOSING || dest.socket.readyState === dest.socket.CLOSED) {
                // return null if the socket has closed
                return null;
              }
              else {
                // else, our socket is in a valid state but truly has nothing available
                throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
              }
            } else {
              throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
            }
          }
  
          // queued.data will be an ArrayBuffer if it's unadulterated, but if it's
          // requeued TCP data it'll be an ArrayBufferView
          var queuedLength = queued.data.byteLength || queued.data.length;
          var queuedOffset = queued.data.byteOffset || 0;
          var queuedBuffer = queued.data.buffer || queued.data;
          var bytesRead = Math.min(length, queuedLength);
          var res = {
            buffer: new Uint8Array(queuedBuffer, queuedOffset, bytesRead),
            addr: queued.addr,
            port: queued.port
          };
  
  
          // push back any unread data for TCP connections
          if (sock.type === 1 && bytesRead < queuedLength) {
            var bytesRemaining = queuedLength - bytesRead;
            queued.data = new Uint8Array(queuedBuffer, queuedOffset + bytesRead, bytesRemaining);
            sock.recv_queue.unshift(queued);
          }
  
          return res;
        }}};function _send(fd, buf, len, flags) {
      var sock = SOCKFS.getSocket(fd);
      if (!sock) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      // TODO honor flags
      return _write(fd, buf, len);
    }
  
  function _pwrite(fildes, buf, nbyte, offset) {
      // ssize_t pwrite(int fildes, const void *buf, size_t nbyte, off_t offset);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/write.html
      var stream = FS.getStream(fildes);
      if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      try {
        var slab = HEAP8;
        return FS.write(stream, slab, buf, nbyte, offset);
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
    }function _write(fildes, buf, nbyte) {
      // ssize_t write(int fildes, const void *buf, size_t nbyte);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/write.html
      var stream = FS.getStream(fildes);
      if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
  
  
      try {
        var slab = HEAP8;
        return FS.write(stream, slab, buf, nbyte);
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
    }
  
  function _fileno(stream) {
      // int fileno(FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fileno.html
      return FS.getStreamFromPtr(stream).fd;
    }function _fwrite(ptr, size, nitems, stream) {
      // size_t fwrite(const void *restrict ptr, size_t size, size_t nitems, FILE *restrict stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fwrite.html
      var bytesToWrite = nitems * size;
      if (bytesToWrite == 0) return 0;
      var fd = _fileno(stream);
      var bytesWritten = _write(fd, ptr, bytesToWrite);
      if (bytesWritten == -1) {
        var streamObj = FS.getStreamFromPtr(stream);
        if (streamObj) streamObj.error = true;
        return 0;
      } else {
        return Math.floor(bytesWritten / size);
      }
    }
  
  
   
  Module["_strlen"] = _strlen;
  
  function __reallyNegative(x) {
      return x < 0 || (x === 0 && (1/x) === -Infinity);
    }function __formatString(format, varargs) {
      var textIndex = format;
      var argIndex = 0;
      function getNextArg(type) {
        // NOTE: Explicitly ignoring type safety. Otherwise this fails:
        //       int x = 4; printf("%c\n", (char)x);
        var ret;
        if (type === 'double') {
          ret = HEAPF64[(((varargs)+(argIndex))>>3)];
        } else if (type == 'i64') {
          ret = [HEAP32[(((varargs)+(argIndex))>>2)],
                 HEAP32[(((varargs)+(argIndex+8))>>2)]];
          argIndex += 8; // each 32-bit chunk is in a 64-bit block
  
        } else {
          type = 'i32'; // varargs are always i32, i64, or double
          ret = HEAP32[(((varargs)+(argIndex))>>2)];
        }
        argIndex += Math.max(Runtime.getNativeFieldSize(type), Runtime.getAlignSize(type, null, true));
        return ret;
      }
  
      var ret = [];
      var curr, next, currArg;
      while(1) {
        var startTextIndex = textIndex;
        curr = HEAP8[(textIndex)];
        if (curr === 0) break;
        next = HEAP8[((textIndex+1)|0)];
        if (curr == 37) {
          // Handle flags.
          var flagAlwaysSigned = false;
          var flagLeftAlign = false;
          var flagAlternative = false;
          var flagZeroPad = false;
          var flagPadSign = false;
          flagsLoop: while (1) {
            switch (next) {
              case 43:
                flagAlwaysSigned = true;
                break;
              case 45:
                flagLeftAlign = true;
                break;
              case 35:
                flagAlternative = true;
                break;
              case 48:
                if (flagZeroPad) {
                  break flagsLoop;
                } else {
                  flagZeroPad = true;
                  break;
                }
              case 32:
                flagPadSign = true;
                break;
              default:
                break flagsLoop;
            }
            textIndex++;
            next = HEAP8[((textIndex+1)|0)];
          }
  
          // Handle width.
          var width = 0;
          if (next == 42) {
            width = getNextArg('i32');
            textIndex++;
            next = HEAP8[((textIndex+1)|0)];
          } else {
            while (next >= 48 && next <= 57) {
              width = width * 10 + (next - 48);
              textIndex++;
              next = HEAP8[((textIndex+1)|0)];
            }
          }
  
          // Handle precision.
          var precisionSet = false, precision = -1;
          if (next == 46) {
            precision = 0;
            precisionSet = true;
            textIndex++;
            next = HEAP8[((textIndex+1)|0)];
            if (next == 42) {
              precision = getNextArg('i32');
              textIndex++;
            } else {
              while(1) {
                var precisionChr = HEAP8[((textIndex+1)|0)];
                if (precisionChr < 48 ||
                    precisionChr > 57) break;
                precision = precision * 10 + (precisionChr - 48);
                textIndex++;
              }
            }
            next = HEAP8[((textIndex+1)|0)];
          }
          if (precision < 0) {
            precision = 6; // Standard default.
            precisionSet = false;
          }
  
          // Handle integer sizes. WARNING: These assume a 32-bit architecture!
          var argSize;
          switch (String.fromCharCode(next)) {
            case 'h':
              var nextNext = HEAP8[((textIndex+2)|0)];
              if (nextNext == 104) {
                textIndex++;
                argSize = 1; // char (actually i32 in varargs)
              } else {
                argSize = 2; // short (actually i32 in varargs)
              }
              break;
            case 'l':
              var nextNext = HEAP8[((textIndex+2)|0)];
              if (nextNext == 108) {
                textIndex++;
                argSize = 8; // long long
              } else {
                argSize = 4; // long
              }
              break;
            case 'L': // long long
            case 'q': // int64_t
            case 'j': // intmax_t
              argSize = 8;
              break;
            case 'z': // size_t
            case 't': // ptrdiff_t
            case 'I': // signed ptrdiff_t or unsigned size_t
              argSize = 4;
              break;
            default:
              argSize = null;
          }
          if (argSize) textIndex++;
          next = HEAP8[((textIndex+1)|0)];
  
          // Handle type specifier.
          switch (String.fromCharCode(next)) {
            case 'd': case 'i': case 'u': case 'o': case 'x': case 'X': case 'p': {
              // Integer.
              var signed = next == 100 || next == 105;
              argSize = argSize || 4;
              var currArg = getNextArg('i' + (argSize * 8));
              var origArg = currArg;
              var argText;
              // Flatten i64-1 [low, high] into a (slightly rounded) double
              if (argSize == 8) {
                currArg = Runtime.makeBigInt(currArg[0], currArg[1], next == 117);
              }
              // Truncate to requested size.
              if (argSize <= 4) {
                var limit = Math.pow(256, argSize) - 1;
                currArg = (signed ? reSign : unSign)(currArg & limit, argSize * 8);
              }
              // Format the number.
              var currAbsArg = Math.abs(currArg);
              var prefix = '';
              if (next == 100 || next == 105) {
                if (argSize == 8 && i64Math) argText = i64Math.stringify(origArg[0], origArg[1], null); else
                argText = reSign(currArg, 8 * argSize, 1).toString(10);
              } else if (next == 117) {
                if (argSize == 8 && i64Math) argText = i64Math.stringify(origArg[0], origArg[1], true); else
                argText = unSign(currArg, 8 * argSize, 1).toString(10);
                currArg = Math.abs(currArg);
              } else if (next == 111) {
                argText = (flagAlternative ? '0' : '') + currAbsArg.toString(8);
              } else if (next == 120 || next == 88) {
                prefix = (flagAlternative && currArg != 0) ? '0x' : '';
                if (argSize == 8 && i64Math) {
                  if (origArg[1]) {
                    argText = (origArg[1]>>>0).toString(16);
                    var lower = (origArg[0]>>>0).toString(16);
                    while (lower.length < 8) lower = '0' + lower;
                    argText += lower;
                  } else {
                    argText = (origArg[0]>>>0).toString(16);
                  }
                } else
                if (currArg < 0) {
                  // Represent negative numbers in hex as 2's complement.
                  currArg = -currArg;
                  argText = (currAbsArg - 1).toString(16);
                  var buffer = [];
                  for (var i = 0; i < argText.length; i++) {
                    buffer.push((0xF - parseInt(argText[i], 16)).toString(16));
                  }
                  argText = buffer.join('');
                  while (argText.length < argSize * 2) argText = 'f' + argText;
                } else {
                  argText = currAbsArg.toString(16);
                }
                if (next == 88) {
                  prefix = prefix.toUpperCase();
                  argText = argText.toUpperCase();
                }
              } else if (next == 112) {
                if (currAbsArg === 0) {
                  argText = '(nil)';
                } else {
                  prefix = '0x';
                  argText = currAbsArg.toString(16);
                }
              }
              if (precisionSet) {
                while (argText.length < precision) {
                  argText = '0' + argText;
                }
              }
  
              // Add sign if needed
              if (currArg >= 0) {
                if (flagAlwaysSigned) {
                  prefix = '+' + prefix;
                } else if (flagPadSign) {
                  prefix = ' ' + prefix;
                }
              }
  
              // Move sign to prefix so we zero-pad after the sign
              if (argText.charAt(0) == '-') {
                prefix = '-' + prefix;
                argText = argText.substr(1);
              }
  
              // Add padding.
              while (prefix.length + argText.length < width) {
                if (flagLeftAlign) {
                  argText += ' ';
                } else {
                  if (flagZeroPad) {
                    argText = '0' + argText;
                  } else {
                    prefix = ' ' + prefix;
                  }
                }
              }
  
              // Insert the result into the buffer.
              argText = prefix + argText;
              argText.split('').forEach(function(chr) {
                ret.push(chr.charCodeAt(0));
              });
              break;
            }
            case 'f': case 'F': case 'e': case 'E': case 'g': case 'G': {
              // Float.
              var currArg = getNextArg('double');
              var argText;
              if (isNaN(currArg)) {
                argText = 'nan';
                flagZeroPad = false;
              } else if (!isFinite(currArg)) {
                argText = (currArg < 0 ? '-' : '') + 'inf';
                flagZeroPad = false;
              } else {
                var isGeneral = false;
                var effectivePrecision = Math.min(precision, 20);
  
                // Convert g/G to f/F or e/E, as per:
                // http://pubs.opengroup.org/onlinepubs/9699919799/functions/printf.html
                if (next == 103 || next == 71) {
                  isGeneral = true;
                  precision = precision || 1;
                  var exponent = parseInt(currArg.toExponential(effectivePrecision).split('e')[1], 10);
                  if (precision > exponent && exponent >= -4) {
                    next = ((next == 103) ? 'f' : 'F').charCodeAt(0);
                    precision -= exponent + 1;
                  } else {
                    next = ((next == 103) ? 'e' : 'E').charCodeAt(0);
                    precision--;
                  }
                  effectivePrecision = Math.min(precision, 20);
                }
  
                if (next == 101 || next == 69) {
                  argText = currArg.toExponential(effectivePrecision);
                  // Make sure the exponent has at least 2 digits.
                  if (/[eE][-+]\d$/.test(argText)) {
                    argText = argText.slice(0, -1) + '0' + argText.slice(-1);
                  }
                } else if (next == 102 || next == 70) {
                  argText = currArg.toFixed(effectivePrecision);
                  if (currArg === 0 && __reallyNegative(currArg)) {
                    argText = '-' + argText;
                  }
                }
  
                var parts = argText.split('e');
                if (isGeneral && !flagAlternative) {
                  // Discard trailing zeros and periods.
                  while (parts[0].length > 1 && parts[0].indexOf('.') != -1 &&
                         (parts[0].slice(-1) == '0' || parts[0].slice(-1) == '.')) {
                    parts[0] = parts[0].slice(0, -1);
                  }
                } else {
                  // Make sure we have a period in alternative mode.
                  if (flagAlternative && argText.indexOf('.') == -1) parts[0] += '.';
                  // Zero pad until required precision.
                  while (precision > effectivePrecision++) parts[0] += '0';
                }
                argText = parts[0] + (parts.length > 1 ? 'e' + parts[1] : '');
  
                // Capitalize 'E' if needed.
                if (next == 69) argText = argText.toUpperCase();
  
                // Add sign.
                if (currArg >= 0) {
                  if (flagAlwaysSigned) {
                    argText = '+' + argText;
                  } else if (flagPadSign) {
                    argText = ' ' + argText;
                  }
                }
              }
  
              // Add padding.
              while (argText.length < width) {
                if (flagLeftAlign) {
                  argText += ' ';
                } else {
                  if (flagZeroPad && (argText[0] == '-' || argText[0] == '+')) {
                    argText = argText[0] + '0' + argText.slice(1);
                  } else {
                    argText = (flagZeroPad ? '0' : ' ') + argText;
                  }
                }
              }
  
              // Adjust case.
              if (next < 97) argText = argText.toUpperCase();
  
              // Insert the result into the buffer.
              argText.split('').forEach(function(chr) {
                ret.push(chr.charCodeAt(0));
              });
              break;
            }
            case 's': {
              // String.
              var arg = getNextArg('i8*');
              var argLength = arg ? _strlen(arg) : '(null)'.length;
              if (precisionSet) argLength = Math.min(argLength, precision);
              if (!flagLeftAlign) {
                while (argLength < width--) {
                  ret.push(32);
                }
              }
              if (arg) {
                for (var i = 0; i < argLength; i++) {
                  ret.push(HEAPU8[((arg++)|0)]);
                }
              } else {
                ret = ret.concat(intArrayFromString('(null)'.substr(0, argLength), true));
              }
              if (flagLeftAlign) {
                while (argLength < width--) {
                  ret.push(32);
                }
              }
              break;
            }
            case 'c': {
              // Character.
              if (flagLeftAlign) ret.push(getNextArg('i8'));
              while (--width > 0) {
                ret.push(32);
              }
              if (!flagLeftAlign) ret.push(getNextArg('i8'));
              break;
            }
            case 'n': {
              // Write the length written so far to the next parameter.
              var ptr = getNextArg('i32*');
              HEAP32[((ptr)>>2)]=ret.length;
              break;
            }
            case '%': {
              // Literal percent sign.
              ret.push(curr);
              break;
            }
            default: {
              // Unknown specifiers remain untouched.
              for (var i = startTextIndex; i < textIndex + 2; i++) {
                ret.push(HEAP8[(i)]);
              }
            }
          }
          textIndex += 2;
          // TODO: Support a/A (hex float) and m (last error) specifiers.
          // TODO: Support %1${specifier} for arg selection.
        } else {
          ret.push(curr);
          textIndex += 1;
        }
      }
      return ret;
    }function _fprintf(stream, format, varargs) {
      // int fprintf(FILE *restrict stream, const char *restrict format, ...);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/printf.html
      var result = __formatString(format, varargs);
      var stack = Runtime.stackSave();
      var ret = _fwrite(allocate(result, 'i8', ALLOC_STACK), 1, result.length, stream);
      Runtime.stackRestore(stack);
      return ret;
    }function _printf(format, varargs) {
      // int printf(const char *restrict format, ...);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/printf.html
      var stdout = HEAP32[((_stdout)>>2)];
      return _fprintf(stdout, format, varargs);
    }

  function _b2WorldQueryAABB(fixturePtr) {
      b2World.QueryAABB(fixturePtr);
    }

  function _b2WorldPostSolve(contactPtr, impulsePtr) {
      b2World.PostSolve(contactPtr, impulsePtr);
    }

  function _b2WorldPreSolve(contactPtr, oldManifoldPtr) {
      b2World.PreSolve(contactPtr, oldManifoldPtr);
    }

  function _b2WorldEndContactBody(contactPtr) {
      b2World.EndContactBody(contactPtr);
    }

  function _b2WorldBeginContactBody(contactPtr) {
      b2World.BeginContactBody(contactPtr);
    }

  
   
  Module["_memset"] = _memset;var _llvm_memset_p0i8_i64=_memset;

  
  function _fputs(s, stream) {
      // int fputs(const char *restrict s, FILE *restrict stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fputs.html
      var fd = _fileno(stream);
      return _write(fd, s, _strlen(s));
    }
  
  function _fputc(c, stream) {
      // int fputc(int c, FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fputc.html
      var chr = unSign(c & 0xFF);
      HEAP8[((_fputc.ret)|0)]=chr;
      var fd = _fileno(stream);
      var ret = _write(fd, _fputc.ret, 1);
      if (ret == -1) {
        var streamObj = FS.getStreamFromPtr(stream);
        if (streamObj) streamObj.error = true;
        return -1;
      } else {
        return chr;
      }
    }function _puts(s) {
      // int puts(const char *s);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/puts.html
      // NOTE: puts() always writes an extra newline.
      var stdout = HEAP32[((_stdout)>>2)];
      var ret = _fputs(s, stdout);
      if (ret < 0) {
        return ret;
      } else {
        var newlineRet = _fputc(10, stdout);
        return (newlineRet < 0) ? -1 : ret + 1;
      }
    }

  var _sqrtf=Math_sqrt;

  
  
  function _emscripten_memcpy_big(dest, src, num) {
      HEAPU8.set(HEAPU8.subarray(src, src+num), dest);
      return dest;
    } 
  Module["_memcpy"] = _memcpy;var _llvm_memcpy_p0i8_p0i8_i32=_memcpy;

  var _sinf=Math_sin;

  var _cosf=Math_cos;

  var _floorf=Math_floor;

  var _llvm_memset_p0i8_i32=_memset;

  function _llvm_lifetime_start() {}

  function _llvm_lifetime_end() {}

  function ___cxa_pure_virtual() {
      ABORT = true;
      throw 'Pure virtual function called!';
    }

  
   
  Module["_memmove"] = _memmove;var _llvm_memmove_p0i8_p0i8_i32=_memmove;

  function __ZNSt9exceptionD2Ev() {}

  function _abort() {
      Module['abort']();
    }

  function ___errno_location() {
      return ___errno_state;
    }

  function _sbrk(bytes) {
      // Implement a Linux-like 'memory area' for our 'process'.
      // Changes the size of the memory area by |bytes|; returns the
      // address of the previous top ('break') of the memory area
      // We control the "dynamic" memory - DYNAMIC_BASE to DYNAMICTOP
      var self = _sbrk;
      if (!self.called) {
        DYNAMICTOP = alignMemoryPage(DYNAMICTOP); // make sure we start out aligned
        self.called = true;
        assert(Runtime.dynamicAlloc);
        self.alloc = Runtime.dynamicAlloc;
        Runtime.dynamicAlloc = function() { abort('cannot dynamically allocate, sbrk now has control') };
      }
      var ret = DYNAMICTOP;
      if (bytes != 0) self.alloc(bytes);
      return ret;  // Previous break location.
    }

  function _sysconf(name) {
      // long sysconf(int name);
      // http://pubs.opengroup.org/onlinepubs/009695399/functions/sysconf.html
      switch(name) {
        case 30: return PAGE_SIZE;
        case 132:
        case 133:
        case 12:
        case 137:
        case 138:
        case 15:
        case 235:
        case 16:
        case 17:
        case 18:
        case 19:
        case 20:
        case 149:
        case 13:
        case 10:
        case 236:
        case 153:
        case 9:
        case 21:
        case 22:
        case 159:
        case 154:
        case 14:
        case 77:
        case 78:
        case 139:
        case 80:
        case 81:
        case 79:
        case 82:
        case 68:
        case 67:
        case 164:
        case 11:
        case 29:
        case 47:
        case 48:
        case 95:
        case 52:
        case 51:
        case 46:
          return 200809;
        case 27:
        case 246:
        case 127:
        case 128:
        case 23:
        case 24:
        case 160:
        case 161:
        case 181:
        case 182:
        case 242:
        case 183:
        case 184:
        case 243:
        case 244:
        case 245:
        case 165:
        case 178:
        case 179:
        case 49:
        case 50:
        case 168:
        case 169:
        case 175:
        case 170:
        case 171:
        case 172:
        case 97:
        case 76:
        case 32:
        case 173:
        case 35:
          return -1;
        case 176:
        case 177:
        case 7:
        case 155:
        case 8:
        case 157:
        case 125:
        case 126:
        case 92:
        case 93:
        case 129:
        case 130:
        case 131:
        case 94:
        case 91:
          return 1;
        case 74:
        case 60:
        case 69:
        case 70:
        case 4:
          return 1024;
        case 31:
        case 42:
        case 72:
          return 32;
        case 87:
        case 26:
        case 33:
          return 2147483647;
        case 34:
        case 1:
          return 47839;
        case 38:
        case 36:
          return 99;
        case 43:
        case 37:
          return 2048;
        case 0: return 2097152;
        case 3: return 65536;
        case 28: return 32768;
        case 44: return 32767;
        case 75: return 16384;
        case 39: return 1000;
        case 89: return 700;
        case 71: return 256;
        case 40: return 255;
        case 2: return 100;
        case 180: return 64;
        case 25: return 20;
        case 5: return 16;
        case 6: return 6;
        case 73: return 4;
        case 84: return 1;
      }
      ___setErrNo(ERRNO_CODES.EINVAL);
      return -1;
    }

  function _time(ptr) {
      var ret = Math.floor(Date.now()/1000);
      if (ptr) {
        HEAP32[((ptr)>>2)]=ret;
      }
      return ret;
    }

  function ___cxa_allocate_exception(size) {
      var ptr = _malloc(size + ___cxa_exception_header_size);
      return ptr + ___cxa_exception_header_size;
    }

  function ___cxa_throw(ptr, type, destructor) {
      if (!___cxa_throw.initialized) {
        try {
          HEAP32[((__ZTVN10__cxxabiv119__pointer_type_infoE)>>2)]=0; // Workaround for libcxxabi integration bug
        } catch(e){}
        try {
          HEAP32[((__ZTVN10__cxxabiv117__class_type_infoE)>>2)]=1; // Workaround for libcxxabi integration bug
        } catch(e){}
        try {
          HEAP32[((__ZTVN10__cxxabiv120__si_class_type_infoE)>>2)]=2; // Workaround for libcxxabi integration bug
        } catch(e){}
        ___cxa_throw.initialized = true;
      }
      var header = ptr - ___cxa_exception_header_size;
      HEAP32[((header)>>2)]=type;
      HEAP32[(((header)+(4))>>2)]=destructor;
      ___cxa_last_thrown_exception = ptr;
      if (!("uncaught_exception" in __ZSt18uncaught_exceptionv)) {
        __ZSt18uncaught_exceptionv.uncaught_exception = 1;
      } else {
        __ZSt18uncaught_exceptionv.uncaught_exception++;
      }
      throw ptr + " - Exception catching is disabled, this exception cannot be caught. Compile with -s DISABLE_EXCEPTION_CATCHING=0 or DISABLE_EXCEPTION_CATCHING=2 to catch.";
    }

  function ___cxa_call_unexpected(exception) {
      Module.printErr('Unexpected exception thrown, this is not properly supported - aborting');
      ABORT = true;
      throw exception;
    }

  
  var ___cxa_caught_exceptions=[];function ___cxa_begin_catch(ptr) {
      __ZSt18uncaught_exceptionv.uncaught_exception--;
      ___cxa_caught_exceptions.push(___cxa_last_thrown_exception);
      return ptr;
    }

  
  function ___cxa_free_exception(ptr) {
      try {
        return _free(ptr - ___cxa_exception_header_size);
      } catch(e) { // XXX FIXME
      }
    }function ___cxa_end_catch() {
      if (___cxa_end_catch.rethrown) {
        ___cxa_end_catch.rethrown = false;
        return;
      }
      // Clear state flag.
      asm['setThrew'](0);
      // Call destructor if one is registered then clear it.
      var ptr = ___cxa_caught_exceptions.pop();
      if (ptr) {
        header = ptr - ___cxa_exception_header_size;
        var destructor = HEAP32[(((header)+(4))>>2)];
        if (destructor) {
          Runtime.dynCall('vi', destructor, [ptr]);
          HEAP32[(((header)+(4))>>2)]=0;
        }
        ___cxa_free_exception(ptr);
        ___cxa_last_thrown_exception = 0;
      }
    }






  var Browser={mainLoop:{scheduler:null,method:"",shouldPause:false,paused:false,queue:[],pause:function () {
          Browser.mainLoop.shouldPause = true;
        },resume:function () {
          if (Browser.mainLoop.paused) {
            Browser.mainLoop.paused = false;
            Browser.mainLoop.scheduler();
          }
          Browser.mainLoop.shouldPause = false;
        },updateStatus:function () {
          if (Module['setStatus']) {
            var message = Module['statusMessage'] || 'Please wait...';
            var remaining = Browser.mainLoop.remainingBlockers;
            var expected = Browser.mainLoop.expectedBlockers;
            if (remaining) {
              if (remaining < expected) {
                Module['setStatus'](message + ' (' + (expected - remaining) + '/' + expected + ')');
              } else {
                Module['setStatus'](message);
              }
            } else {
              Module['setStatus']('');
            }
          }
        }},isFullScreen:false,pointerLock:false,moduleContextCreatedCallbacks:[],workers:[],init:function () {
        if (!Module["preloadPlugins"]) Module["preloadPlugins"] = []; // needs to exist even in workers
  
        if (Browser.initted || ENVIRONMENT_IS_WORKER) return;
        Browser.initted = true;
  
        try {
          new Blob();
          Browser.hasBlobConstructor = true;
        } catch(e) {
          Browser.hasBlobConstructor = false;
          console.log("warning: no blob constructor, cannot create blobs with mimetypes");
        }
        Browser.BlobBuilder = typeof MozBlobBuilder != "undefined" ? MozBlobBuilder : (typeof WebKitBlobBuilder != "undefined" ? WebKitBlobBuilder : (!Browser.hasBlobConstructor ? console.log("warning: no BlobBuilder") : null));
        Browser.URLObject = typeof window != "undefined" ? (window.URL ? window.URL : window.webkitURL) : undefined;
        if (!Module.noImageDecoding && typeof Browser.URLObject === 'undefined') {
          console.log("warning: Browser does not support creating object URLs. Built-in browser image decoding will not be available.");
          Module.noImageDecoding = true;
        }
  
        // Support for plugins that can process preloaded files. You can add more of these to
        // your app by creating and appending to Module.preloadPlugins.
        //
        // Each plugin is asked if it can handle a file based on the file's name. If it can,
        // it is given the file's raw data. When it is done, it calls a callback with the file's
        // (possibly modified) data. For example, a plugin might decompress a file, or it
        // might create some side data structure for use later (like an Image element, etc.).
  
        var imagePlugin = {};
        imagePlugin['canHandle'] = function imagePlugin_canHandle(name) {
          return !Module.noImageDecoding && /\.(jpg|jpeg|png|bmp)$/i.test(name);
        };
        imagePlugin['handle'] = function imagePlugin_handle(byteArray, name, onload, onerror) {
          var b = null;
          if (Browser.hasBlobConstructor) {
            try {
              b = new Blob([byteArray], { type: Browser.getMimetype(name) });
              if (b.size !== byteArray.length) { // Safari bug #118630
                // Safari's Blob can only take an ArrayBuffer
                b = new Blob([(new Uint8Array(byteArray)).buffer], { type: Browser.getMimetype(name) });
              }
            } catch(e) {
              Runtime.warnOnce('Blob constructor present but fails: ' + e + '; falling back to blob builder');
            }
          }
          if (!b) {
            var bb = new Browser.BlobBuilder();
            bb.append((new Uint8Array(byteArray)).buffer); // we need to pass a buffer, and must copy the array to get the right data range
            b = bb.getBlob();
          }
          var url = Browser.URLObject.createObjectURL(b);
          var img = new Image();
          img.onload = function img_onload() {
            assert(img.complete, 'Image ' + name + ' could not be decoded');
            var canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            var ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            Module["preloadedImages"][name] = canvas;
            Browser.URLObject.revokeObjectURL(url);
            if (onload) onload(byteArray);
          };
          img.onerror = function img_onerror(event) {
            console.log('Image ' + url + ' could not be decoded');
            if (onerror) onerror();
          };
          img.src = url;
        };
        Module['preloadPlugins'].push(imagePlugin);
  
        var audioPlugin = {};
        audioPlugin['canHandle'] = function audioPlugin_canHandle(name) {
          return !Module.noAudioDecoding && name.substr(-4) in { '.ogg': 1, '.wav': 1, '.mp3': 1 };
        };
        audioPlugin['handle'] = function audioPlugin_handle(byteArray, name, onload, onerror) {
          var done = false;
          function finish(audio) {
            if (done) return;
            done = true;
            Module["preloadedAudios"][name] = audio;
            if (onload) onload(byteArray);
          }
          function fail() {
            if (done) return;
            done = true;
            Module["preloadedAudios"][name] = new Audio(); // empty shim
            if (onerror) onerror();
          }
          if (Browser.hasBlobConstructor) {
            try {
              var b = new Blob([byteArray], { type: Browser.getMimetype(name) });
            } catch(e) {
              return fail();
            }
            var url = Browser.URLObject.createObjectURL(b); // XXX we never revoke this!
            var audio = new Audio();
            audio.addEventListener('canplaythrough', function() { finish(audio) }, false); // use addEventListener due to chromium bug 124926
            audio.onerror = function audio_onerror(event) {
              if (done) return;
              console.log('warning: browser could not fully decode audio ' + name + ', trying slower base64 approach');
              function encode64(data) {
                var BASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
                var PAD = '=';
                var ret = '';
                var leftchar = 0;
                var leftbits = 0;
                for (var i = 0; i < data.length; i++) {
                  leftchar = (leftchar << 8) | data[i];
                  leftbits += 8;
                  while (leftbits >= 6) {
                    var curr = (leftchar >> (leftbits-6)) & 0x3f;
                    leftbits -= 6;
                    ret += BASE[curr];
                  }
                }
                if (leftbits == 2) {
                  ret += BASE[(leftchar&3) << 4];
                  ret += PAD + PAD;
                } else if (leftbits == 4) {
                  ret += BASE[(leftchar&0xf) << 2];
                  ret += PAD;
                }
                return ret;
              }
              audio.src = 'data:audio/x-' + name.substr(-3) + ';base64,' + encode64(byteArray);
              finish(audio); // we don't wait for confirmation this worked - but it's worth trying
            };
            audio.src = url;
            // workaround for chrome bug 124926 - we do not always get oncanplaythrough or onerror
            Browser.safeSetTimeout(function() {
              finish(audio); // try to use it even though it is not necessarily ready to play
            }, 10000);
          } else {
            return fail();
          }
        };
        Module['preloadPlugins'].push(audioPlugin);
  
        // Canvas event setup
  
        var canvas = Module['canvas'];
        canvas.requestPointerLock = canvas['requestPointerLock'] ||
                                    canvas['mozRequestPointerLock'] ||
                                    canvas['webkitRequestPointerLock'];
        canvas.exitPointerLock = document['exitPointerLock'] ||
                                 document['mozExitPointerLock'] ||
                                 document['webkitExitPointerLock'] ||
                                 function(){}; // no-op if function does not exist
        canvas.exitPointerLock = canvas.exitPointerLock.bind(document);
  
        function pointerLockChange() {
          Browser.pointerLock = document['pointerLockElement'] === canvas ||
                                document['mozPointerLockElement'] === canvas ||
                                document['webkitPointerLockElement'] === canvas;
        }
  
        document.addEventListener('pointerlockchange', pointerLockChange, false);
        document.addEventListener('mozpointerlockchange', pointerLockChange, false);
        document.addEventListener('webkitpointerlockchange', pointerLockChange, false);
  
        if (Module['elementPointerLock']) {
          canvas.addEventListener("click", function(ev) {
            if (!Browser.pointerLock && canvas.requestPointerLock) {
              canvas.requestPointerLock();
              ev.preventDefault();
            }
          }, false);
        }
      },createContext:function (canvas, useWebGL, setInModule, webGLContextAttributes) {
        var ctx;
        var errorInfo = '?';
        function onContextCreationError(event) {
          errorInfo = event.statusMessage || errorInfo;
        }
        try {
          if (useWebGL) {
            var contextAttributes = {
              antialias: false,
              alpha: false
            };
  
            if (webGLContextAttributes) {
              for (var attribute in webGLContextAttributes) {
                contextAttributes[attribute] = webGLContextAttributes[attribute];
              }
            }
  
  
            canvas.addEventListener('webglcontextcreationerror', onContextCreationError, false);
            try {
              ['experimental-webgl', 'webgl'].some(function(webglId) {
                return ctx = canvas.getContext(webglId, contextAttributes);
              });
            } finally {
              canvas.removeEventListener('webglcontextcreationerror', onContextCreationError, false);
            }
          } else {
            ctx = canvas.getContext('2d');
          }
          if (!ctx) throw ':(';
        } catch (e) {
          Module.print('Could not create canvas: ' + [errorInfo, e]);
          return null;
        }
        if (useWebGL) {
          // Set the background of the WebGL canvas to black
          canvas.style.backgroundColor = "black";
  
          // Warn on context loss
          canvas.addEventListener('webglcontextlost', function(event) {
            alert('WebGL context lost. You will need to reload the page.');
          }, false);
        }
        if (setInModule) {
          GLctx = Module.ctx = ctx;
          Module.useWebGL = useWebGL;
          Browser.moduleContextCreatedCallbacks.forEach(function(callback) { callback() });
          Browser.init();
        }
        return ctx;
      },destroyContext:function (canvas, useWebGL, setInModule) {},fullScreenHandlersInstalled:false,lockPointer:undefined,resizeCanvas:undefined,requestFullScreen:function (lockPointer, resizeCanvas) {
        Browser.lockPointer = lockPointer;
        Browser.resizeCanvas = resizeCanvas;
        if (typeof Browser.lockPointer === 'undefined') Browser.lockPointer = true;
        if (typeof Browser.resizeCanvas === 'undefined') Browser.resizeCanvas = false;
  
        var canvas = Module['canvas'];
        function fullScreenChange() {
          Browser.isFullScreen = false;
          if ((document['webkitFullScreenElement'] || document['webkitFullscreenElement'] ||
               document['mozFullScreenElement'] || document['mozFullscreenElement'] ||
               document['fullScreenElement'] || document['fullscreenElement']) === canvas) {
            canvas.cancelFullScreen = document['cancelFullScreen'] ||
                                      document['mozCancelFullScreen'] ||
                                      document['webkitCancelFullScreen'];
            canvas.cancelFullScreen = canvas.cancelFullScreen.bind(document);
            if (Browser.lockPointer) canvas.requestPointerLock();
            Browser.isFullScreen = true;
            if (Browser.resizeCanvas) Browser.setFullScreenCanvasSize();
          } else if (Browser.resizeCanvas){
            Browser.setWindowedCanvasSize();
          }
          if (Module['onFullScreen']) Module['onFullScreen'](Browser.isFullScreen);
        }
  
        if (!Browser.fullScreenHandlersInstalled) {
          Browser.fullScreenHandlersInstalled = true;
          document.addEventListener('fullscreenchange', fullScreenChange, false);
          document.addEventListener('mozfullscreenchange', fullScreenChange, false);
          document.addEventListener('webkitfullscreenchange', fullScreenChange, false);
        }
  
        canvas.requestFullScreen = canvas['requestFullScreen'] ||
                                   canvas['mozRequestFullScreen'] ||
                                   (canvas['webkitRequestFullScreen'] ? function() { canvas['webkitRequestFullScreen'](Element['ALLOW_KEYBOARD_INPUT']) } : null);
        canvas.requestFullScreen();
      },requestAnimationFrame:function requestAnimationFrame(func) {
        if (typeof window === 'undefined') { // Provide fallback to setTimeout if window is undefined (e.g. in Node.js)
          setTimeout(func, 1000/60);
        } else {
          if (!window.requestAnimationFrame) {
            window.requestAnimationFrame = window['requestAnimationFrame'] ||
                                           window['mozRequestAnimationFrame'] ||
                                           window['webkitRequestAnimationFrame'] ||
                                           window['msRequestAnimationFrame'] ||
                                           window['oRequestAnimationFrame'] ||
                                           window['setTimeout'];
          }
          window.requestAnimationFrame(func);
        }
      },safeCallback:function (func) {
        return function() {
          if (!ABORT) return func.apply(null, arguments);
        };
      },safeRequestAnimationFrame:function (func) {
        return Browser.requestAnimationFrame(function() {
          if (!ABORT) func();
        });
      },safeSetTimeout:function (func, timeout) {
        return setTimeout(function() {
          if (!ABORT) func();
        }, timeout);
      },safeSetInterval:function (func, timeout) {
        return setInterval(function() {
          if (!ABORT) func();
        }, timeout);
      },getMimetype:function (name) {
        return {
          'jpg': 'image/jpeg',
          'jpeg': 'image/jpeg',
          'png': 'image/png',
          'bmp': 'image/bmp',
          'ogg': 'audio/ogg',
          'wav': 'audio/wav',
          'mp3': 'audio/mpeg'
        }[name.substr(name.lastIndexOf('.')+1)];
      },getUserMedia:function (func) {
        if(!window.getUserMedia) {
          window.getUserMedia = navigator['getUserMedia'] ||
                                navigator['mozGetUserMedia'];
        }
        window.getUserMedia(func);
      },getMovementX:function (event) {
        return event['movementX'] ||
               event['mozMovementX'] ||
               event['webkitMovementX'] ||
               0;
      },getMovementY:function (event) {
        return event['movementY'] ||
               event['mozMovementY'] ||
               event['webkitMovementY'] ||
               0;
      },getMouseWheelDelta:function (event) {
        return Math.max(-1, Math.min(1, event.type === 'DOMMouseScroll' ? event.detail : -event.wheelDelta));
      },mouseX:0,mouseY:0,mouseMovementX:0,mouseMovementY:0,calculateMouseEvent:function (event) { // event should be mousemove, mousedown or mouseup
        if (Browser.pointerLock) {
          // When the pointer is locked, calculate the coordinates
          // based on the movement of the mouse.
          // Workaround for Firefox bug 764498
          if (event.type != 'mousemove' &&
              ('mozMovementX' in event)) {
            Browser.mouseMovementX = Browser.mouseMovementY = 0;
          } else {
            Browser.mouseMovementX = Browser.getMovementX(event);
            Browser.mouseMovementY = Browser.getMovementY(event);
          }
          
          // check if SDL is available
          if (typeof SDL != "undefined") {
          	Browser.mouseX = SDL.mouseX + Browser.mouseMovementX;
          	Browser.mouseY = SDL.mouseY + Browser.mouseMovementY;
          } else {
          	// just add the mouse delta to the current absolut mouse position
          	// FIXME: ideally this should be clamped against the canvas size and zero
          	Browser.mouseX += Browser.mouseMovementX;
          	Browser.mouseY += Browser.mouseMovementY;
          }        
        } else {
          // Otherwise, calculate the movement based on the changes
          // in the coordinates.
          var rect = Module["canvas"].getBoundingClientRect();
          var x, y;
          
          // Neither .scrollX or .pageXOffset are defined in a spec, but
          // we prefer .scrollX because it is currently in a spec draft.
          // (see: http://www.w3.org/TR/2013/WD-cssom-view-20131217/)
          var scrollX = ((typeof window.scrollX !== 'undefined') ? window.scrollX : window.pageXOffset);
          var scrollY = ((typeof window.scrollY !== 'undefined') ? window.scrollY : window.pageYOffset);
          if (event.type == 'touchstart' ||
              event.type == 'touchend' ||
              event.type == 'touchmove') {
            var t = event.touches.item(0);
            if (t) {
              x = t.pageX - (scrollX + rect.left);
              y = t.pageY - (scrollY + rect.top);
            } else {
              return;
            }
          } else {
            x = event.pageX - (scrollX + rect.left);
            y = event.pageY - (scrollY + rect.top);
          }
  
          // the canvas might be CSS-scaled compared to its backbuffer;
          // SDL-using content will want mouse coordinates in terms
          // of backbuffer units.
          var cw = Module["canvas"].width;
          var ch = Module["canvas"].height;
          x = x * (cw / rect.width);
          y = y * (ch / rect.height);
  
          Browser.mouseMovementX = x - Browser.mouseX;
          Browser.mouseMovementY = y - Browser.mouseY;
          Browser.mouseX = x;
          Browser.mouseY = y;
        }
      },xhrLoad:function (url, onload, onerror) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'arraybuffer';
        xhr.onload = function xhr_onload() {
          if (xhr.status == 200 || (xhr.status == 0 && xhr.response)) { // file URLs can return 0
            onload(xhr.response);
          } else {
            onerror();
          }
        };
        xhr.onerror = onerror;
        xhr.send(null);
      },asyncLoad:function (url, onload, onerror, noRunDep) {
        Browser.xhrLoad(url, function(arrayBuffer) {
          assert(arrayBuffer, 'Loading data file "' + url + '" failed (no arrayBuffer).');
          onload(new Uint8Array(arrayBuffer));
          if (!noRunDep) removeRunDependency('al ' + url);
        }, function(event) {
          if (onerror) {
            onerror();
          } else {
            throw 'Loading data file "' + url + '" failed.';
          }
        });
        if (!noRunDep) addRunDependency('al ' + url);
      },resizeListeners:[],updateResizeListeners:function () {
        var canvas = Module['canvas'];
        Browser.resizeListeners.forEach(function(listener) {
          listener(canvas.width, canvas.height);
        });
      },setCanvasSize:function (width, height, noUpdates) {
        var canvas = Module['canvas'];
        canvas.width = width;
        canvas.height = height;
        if (!noUpdates) Browser.updateResizeListeners();
      },windowedWidth:0,windowedHeight:0,setFullScreenCanvasSize:function () {
        var canvas = Module['canvas'];
        this.windowedWidth = canvas.width;
        this.windowedHeight = canvas.height;
        canvas.width = screen.width;
        canvas.height = screen.height;
        // check if SDL is available   
        if (typeof SDL != "undefined") {
        	var flags = HEAPU32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)];
        	flags = flags | 0x00800000; // set SDL_FULLSCREEN flag
        	HEAP32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)]=flags
        }
        Browser.updateResizeListeners();
      },setWindowedCanvasSize:function () {
        var canvas = Module['canvas'];
        canvas.width = this.windowedWidth;
        canvas.height = this.windowedHeight;
        // check if SDL is available       
        if (typeof SDL != "undefined") {
        	var flags = HEAPU32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)];
        	flags = flags & ~0x00800000; // clear SDL_FULLSCREEN flag
        	HEAP32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)]=flags
        }
        Browser.updateResizeListeners();
      }};
FS.staticInit();__ATINIT__.unshift({ func: function() { if (!Module["noFSInit"] && !FS.init.initialized) FS.init() } });__ATMAIN__.push({ func: function() { FS.ignorePermissions = false } });__ATEXIT__.push({ func: function() { FS.quit() } });Module["FS_createFolder"] = FS.createFolder;Module["FS_createPath"] = FS.createPath;Module["FS_createDataFile"] = FS.createDataFile;Module["FS_createPreloadedFile"] = FS.createPreloadedFile;Module["FS_createLazyFile"] = FS.createLazyFile;Module["FS_createLink"] = FS.createLink;Module["FS_createDevice"] = FS.createDevice;
___errno_state = Runtime.staticAlloc(4); HEAP32[((___errno_state)>>2)]=0;
__ATINIT__.unshift({ func: function() { TTY.init() } });__ATEXIT__.push({ func: function() { TTY.shutdown() } });TTY.utf8 = new Runtime.UTF8Processor();
if (ENVIRONMENT_IS_NODE) { var fs = require("fs"); NODEFS.staticInit(); }
__ATINIT__.push({ func: function() { SOCKFS.root = FS.mount(SOCKFS, {}, null); } });
_fputc.ret = allocate([0], "i8", ALLOC_STATIC);
Module["requestFullScreen"] = function Module_requestFullScreen(lockPointer, resizeCanvas) { Browser.requestFullScreen(lockPointer, resizeCanvas) };
  Module["requestAnimationFrame"] = function Module_requestAnimationFrame(func) { Browser.requestAnimationFrame(func) };
  Module["setCanvasSize"] = function Module_setCanvasSize(width, height, noUpdates) { Browser.setCanvasSize(width, height, noUpdates) };
  Module["pauseMainLoop"] = function Module_pauseMainLoop() { Browser.mainLoop.pause() };
  Module["resumeMainLoop"] = function Module_resumeMainLoop() { Browser.mainLoop.resume() };
  Module["getUserMedia"] = function Module_getUserMedia() { Browser.getUserMedia() }
STACK_BASE = STACKTOP = Runtime.alignMemory(STATICTOP);

staticSealed = true; // seal the static portion of memory

STACK_MAX = STACK_BASE + 5242880;

DYNAMIC_BASE = DYNAMICTOP = Runtime.alignMemory(STACK_MAX);

assert(DYNAMIC_BASE < TOTAL_MEMORY, "TOTAL_MEMORY not big enough for stack");

 var ctlz_i8 = allocate([8,7,6,6,5,5,5,5,4,4,4,4,4,4,4,4,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], "i8", ALLOC_DYNAMIC);
 var cttz_i8 = allocate([8,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,6,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,7,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,6,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0], "i8", ALLOC_DYNAMIC);

var Math_min = Math.min;
function invoke_ii(index,a1) {
  try {
    return Module["dynCall_ii"](index,a1);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_viiiii(index,a1,a2,a3,a4,a5) {
  try {
    Module["dynCall_viiiii"](index,a1,a2,a3,a4,a5);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_vi(index,a1) {
  try {
    Module["dynCall_vi"](index,a1);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_vii(index,a1,a2) {
  try {
    Module["dynCall_vii"](index,a1,a2);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_iiii(index,a1,a2,a3) {
  try {
    return Module["dynCall_iiii"](index,a1,a2,a3);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_fif(index,a1,a2) {
  try {
    return Module["dynCall_fif"](index,a1,a2);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_viii(index,a1,a2,a3) {
  try {
    Module["dynCall_viii"](index,a1,a2,a3);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_v(index) {
  try {
    Module["dynCall_v"](index);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_iiiii(index,a1,a2,a3,a4) {
  try {
    return Module["dynCall_iiiii"](index,a1,a2,a3,a4);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_viif(index,a1,a2,a3) {
  try {
    Module["dynCall_viif"](index,a1,a2,a3);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_viiiiii(index,a1,a2,a3,a4,a5,a6) {
  try {
    Module["dynCall_viiiiii"](index,a1,a2,a3,a4,a5,a6);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_iii(index,a1,a2) {
  try {
    return Module["dynCall_iii"](index,a1,a2);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_iiiiii(index,a1,a2,a3,a4,a5) {
  try {
    return Module["dynCall_iiiiii"](index,a1,a2,a3,a4,a5);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_viiii(index,a1,a2,a3,a4) {
  try {
    Module["dynCall_viiii"](index,a1,a2,a3,a4);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function asmPrintInt(x, y) {
  Module.print('int ' + x + ',' + y);// + ' ' + new Error().stack);
}
function asmPrintFloat(x, y) {
  Module.print('float ' + x + ',' + y);// + ' ' + new Error().stack);
}
// EMSCRIPTEN_START_ASM
var asm=(function(global,env,buffer){"use asm";var a=new global.Int8Array(buffer);var b=new global.Int16Array(buffer);var c=new global.Int32Array(buffer);var d=new global.Uint8Array(buffer);var e=new global.Uint16Array(buffer);var f=new global.Uint32Array(buffer);var g=new global.Float32Array(buffer);var h=new global.Float64Array(buffer);var i=env.STACKTOP|0;var j=env.STACK_MAX|0;var k=env.tempDoublePtr|0;var l=env.ABORT|0;var m=env.cttz_i8|0;var n=env.ctlz_i8|0;var o=env.__ZTVN10__cxxabiv120__si_class_type_infoE|0;var p=env.__ZTVN10__cxxabiv117__class_type_infoE|0;var q=+env.NaN;var r=+env.Infinity;var s=0;var t=0;var u=0;var v=0;var w=0,x=0,y=0,z=0,A=0.0,B=0,C=0,D=0,E=0.0;var F=0;var G=0;var H=0;var I=0;var J=0;var K=0;var L=0;var M=0;var N=0;var O=0;var P=global.Math.floor;var Q=global.Math.abs;var R=global.Math.sqrt;var S=global.Math.pow;var T=global.Math.cos;var U=global.Math.sin;var V=global.Math.tan;var W=global.Math.acos;var X=global.Math.asin;var Y=global.Math.atan;var Z=global.Math.atan2;var _=global.Math.exp;var $=global.Math.log;var aa=global.Math.ceil;var ba=global.Math.imul;var ca=env.abort;var da=env.assert;var ea=env.asmPrintInt;var fa=env.asmPrintFloat;var ga=env.min;var ha=env.invoke_ii;var ia=env.invoke_viiiii;var ja=env.invoke_vi;var ka=env.invoke_vii;var la=env.invoke_iiii;var ma=env.invoke_fif;var na=env.invoke_viii;var oa=env.invoke_v;var pa=env.invoke_iiiii;var qa=env.invoke_viif;var ra=env.invoke_viiiiii;var sa=env.invoke_iii;var ta=env.invoke_iiiiii;var ua=env.invoke_viiii;var va=env._llvm_lifetime_end;var wa=env._cosf;var xa=env.___cxa_call_unexpected;var ya=env._floorf;var za=env.___cxa_free_exception;var Aa=env.___cxa_throw;var Ba=env._sinf;var Ca=env._abort;var Da=env._fprintf;var Ea=env.___cxa_end_catch;var Fa=env._b2WorldBeginContactBody;var Ga=env._printf;var Ha=env._fflush;var Ia=env.__reallyNegative;var Ja=env._sqrtf;var Ka=env._fputc;var La=env._sysconf;var Ma=env._puts;var Na=env.___setErrNo;var Oa=env._fwrite;var Pa=env._send;var Qa=env._write;var Ra=env._fputs;var Sa=env._exit;var Ta=env.___cxa_find_matching_catch;var Ua=env.___cxa_allocate_exception;var Va=env.___cxa_pure_virtual;var Wa=env._b2WorldEndContactBody;var Xa=env._fileno;var Ya=env.__formatString;var Za=env._time;var _a=env.___cxa_is_number_type;var $a=env.___cxa_does_inherit;var ab=env.__ZSt9terminatev;var bb=env._b2WorldPreSolve;var cb=env.___cxa_begin_catch;var db=env._emscripten_memcpy_big;var eb=env.__ZSt18uncaught_exceptionv;var fb=env._b2WorldQueryAABB;var gb=env._pwrite;var hb=env._sbrk;var ib=env.__ZNSt9exceptionD2Ev;var jb=env.___errno_location;var kb=env.___gxx_personality_v0;var lb=env._b2WorldPostSolve;var mb=env._llvm_lifetime_start;var nb=env._mkport;var ob=env.___resumeException;var pb=env.__exit;var qb=0.0;
// EMSCRIPTEN_START_FUNCS
function il(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0;e=i;i=i+768|0;h=e+448|0;k=e+480|0;g=e+512|0;m=e+544|0;q=e+576|0;p=e+608|0;l=e+640|0;n=e+672|0;o=e+704|0;x=e+736|0;u=e+416|0;t=e+352|0;s=e+320|0;G=e+384|0;E=e|0;C=e+32|0;A=e+96|0;F=e+128|0;B=e+64|0;r=e+160|0;z=e+192|0;y=e+256|0;w=e+288|0;v=e+224|0;a:while(1){H=b;j=b-28|0;f=j;b:while(1){I=a;K=H-I|0;switch((K|0)/28|0|0){case 0:case 1:{D=66;break a};case 3:{D=6;break a};case 2:{D=4;break a};case 5:{D=15;break a};case 4:{D=14;break a};default:{}}if((K|0)<868){D=21;break a}L=(K|0)/56|0;J=a+(L*28|0)|0;do{if((K|0)>27972){M=(K|0)/112|0;K=a+(M*28|0)|0;L=a+((M+L|0)*28|0)|0;M=jl(a,K,J,L,d)|0;if(!(Cb[c[d>>2]&63](j,L)|0)){break}N=L;c[u>>2]=c[N>>2];c[u+4>>2]=c[N+4>>2];c[u+8>>2]=c[N+8>>2];c[u+12>>2]=c[N+12>>2];c[u+16>>2]=c[N+16>>2];c[u+20>>2]=c[N+20>>2];c[u+24>>2]=c[N+24>>2];c[N>>2]=c[f>>2];c[N+4>>2]=c[f+4>>2];c[N+8>>2]=c[f+8>>2];c[N+12>>2]=c[f+12>>2];c[N+16>>2]=c[f+16>>2];c[N+20>>2]=c[f+20>>2];c[N+24>>2]=c[f+24>>2];c[f>>2]=c[u>>2];c[f+4>>2]=c[u+4>>2];c[f+8>>2]=c[u+8>>2];c[f+12>>2]=c[u+12>>2];c[f+16>>2]=c[u+16>>2];c[f+20>>2]=c[u+20>>2];c[f+24>>2]=c[u+24>>2];if(!(Cb[c[d>>2]&63](L,J)|0)){M=M+1|0;break}L=J;c[t>>2]=c[L>>2];c[t+4>>2]=c[L+4>>2];c[t+8>>2]=c[L+8>>2];c[t+12>>2]=c[L+12>>2];c[t+16>>2]=c[L+16>>2];c[t+20>>2]=c[L+20>>2];c[t+24>>2]=c[L+24>>2];c[L>>2]=c[N>>2];c[L+4>>2]=c[N+4>>2];c[L+8>>2]=c[N+8>>2];c[L+12>>2]=c[N+12>>2];c[L+16>>2]=c[N+16>>2];c[L+20>>2]=c[N+20>>2];c[L+24>>2]=c[N+24>>2];c[N>>2]=c[t>>2];c[N+4>>2]=c[t+4>>2];c[N+8>>2]=c[t+8>>2];c[N+12>>2]=c[t+12>>2];c[N+16>>2]=c[t+16>>2];c[N+20>>2]=c[t+20>>2];c[N+24>>2]=c[t+24>>2];if(!(Cb[c[d>>2]&63](J,K)|0)){M=M+2|0;break}N=K;c[s>>2]=c[N>>2];c[s+4>>2]=c[N+4>>2];c[s+8>>2]=c[N+8>>2];c[s+12>>2]=c[N+12>>2];c[s+16>>2]=c[N+16>>2];c[s+20>>2]=c[N+20>>2];c[s+24>>2]=c[N+24>>2];c[N>>2]=c[L>>2];c[N+4>>2]=c[L+4>>2];c[N+8>>2]=c[L+8>>2];c[N+12>>2]=c[L+12>>2];c[N+16>>2]=c[L+16>>2];c[N+20>>2]=c[L+20>>2];c[N+24>>2]=c[L+24>>2];c[L>>2]=c[s>>2];c[L+4>>2]=c[s+4>>2];c[L+8>>2]=c[s+8>>2];c[L+12>>2]=c[s+12>>2];c[L+16>>2]=c[s+16>>2];c[L+20>>2]=c[s+20>>2];c[L+24>>2]=c[s+24>>2];if(!(Cb[c[d>>2]&63](K,a)|0)){M=M+3|0;break}O=a;c[G>>2]=c[O>>2];c[G+4>>2]=c[O+4>>2];c[G+8>>2]=c[O+8>>2];c[G+12>>2]=c[O+12>>2];c[G+16>>2]=c[O+16>>2];c[G+20>>2]=c[O+20>>2];c[G+24>>2]=c[O+24>>2];c[O>>2]=c[N>>2];c[O+4>>2]=c[N+4>>2];c[O+8>>2]=c[N+8>>2];c[O+12>>2]=c[N+12>>2];c[O+16>>2]=c[N+16>>2];c[O+20>>2]=c[N+20>>2];c[O+24>>2]=c[N+24>>2];c[N>>2]=c[G>>2];c[N+4>>2]=c[G+4>>2];c[N+8>>2]=c[G+8>>2];c[N+12>>2]=c[G+12>>2];c[N+16>>2]=c[G+16>>2];c[N+20>>2]=c[G+20>>2];c[N+24>>2]=c[G+24>>2];M=M+4|0}else{O=Cb[c[d>>2]&63](J,a)|0;K=Cb[c[d>>2]&63](j,J)|0;if(!O){if(!K){M=0;break}K=J;c[w>>2]=c[K>>2];c[w+4>>2]=c[K+4>>2];c[w+8>>2]=c[K+8>>2];c[w+12>>2]=c[K+12>>2];c[w+16>>2]=c[K+16>>2];c[w+20>>2]=c[K+20>>2];c[w+24>>2]=c[K+24>>2];c[K>>2]=c[f>>2];c[K+4>>2]=c[f+4>>2];c[K+8>>2]=c[f+8>>2];c[K+12>>2]=c[f+12>>2];c[K+16>>2]=c[f+16>>2];c[K+20>>2]=c[f+20>>2];c[K+24>>2]=c[f+24>>2];c[f>>2]=c[w>>2];c[f+4>>2]=c[w+4>>2];c[f+8>>2]=c[w+8>>2];c[f+12>>2]=c[w+12>>2];c[f+16>>2]=c[w+16>>2];c[f+20>>2]=c[w+20>>2];c[f+24>>2]=c[w+24>>2];if(!(Cb[c[d>>2]&63](J,a)|0)){M=1;break}M=a;c[v>>2]=c[M>>2];c[v+4>>2]=c[M+4>>2];c[v+8>>2]=c[M+8>>2];c[v+12>>2]=c[M+12>>2];c[v+16>>2]=c[M+16>>2];c[v+20>>2]=c[M+20>>2];c[v+24>>2]=c[M+24>>2];c[M>>2]=c[K>>2];c[M+4>>2]=c[K+4>>2];c[M+8>>2]=c[K+8>>2];c[M+12>>2]=c[K+12>>2];c[M+16>>2]=c[K+16>>2];c[M+20>>2]=c[K+20>>2];c[M+24>>2]=c[K+24>>2];c[K>>2]=c[v>>2];c[K+4>>2]=c[v+4>>2];c[K+8>>2]=c[v+8>>2];c[K+12>>2]=c[v+12>>2];c[K+16>>2]=c[v+16>>2];c[K+20>>2]=c[v+20>>2];c[K+24>>2]=c[v+24>>2];M=2;break}if(K){M=a;c[r>>2]=c[M>>2];c[r+4>>2]=c[M+4>>2];c[r+8>>2]=c[M+8>>2];c[r+12>>2]=c[M+12>>2];c[r+16>>2]=c[M+16>>2];c[r+20>>2]=c[M+20>>2];c[r+24>>2]=c[M+24>>2];c[M>>2]=c[f>>2];c[M+4>>2]=c[f+4>>2];c[M+8>>2]=c[f+8>>2];c[M+12>>2]=c[f+12>>2];c[M+16>>2]=c[f+16>>2];c[M+20>>2]=c[f+20>>2];c[M+24>>2]=c[f+24>>2];c[f>>2]=c[r>>2];c[f+4>>2]=c[r+4>>2];c[f+8>>2]=c[r+8>>2];c[f+12>>2]=c[r+12>>2];c[f+16>>2]=c[r+16>>2];c[f+20>>2]=c[r+20>>2];c[f+24>>2]=c[r+24>>2];M=1;break}O=a;c[z>>2]=c[O>>2];c[z+4>>2]=c[O+4>>2];c[z+8>>2]=c[O+8>>2];c[z+12>>2]=c[O+12>>2];c[z+16>>2]=c[O+16>>2];c[z+20>>2]=c[O+20>>2];c[z+24>>2]=c[O+24>>2];K=J;c[O>>2]=c[K>>2];c[O+4>>2]=c[K+4>>2];c[O+8>>2]=c[K+8>>2];c[O+12>>2]=c[K+12>>2];c[O+16>>2]=c[K+16>>2];c[O+20>>2]=c[K+20>>2];c[O+24>>2]=c[K+24>>2];c[K>>2]=c[z>>2];c[K+4>>2]=c[z+4>>2];c[K+8>>2]=c[z+8>>2];c[K+12>>2]=c[z+12>>2];c[K+16>>2]=c[z+16>>2];c[K+20>>2]=c[z+20>>2];c[K+24>>2]=c[z+24>>2];if(!(Cb[c[d>>2]&63](j,J)|0)){M=1;break}c[y>>2]=c[K>>2];c[y+4>>2]=c[K+4>>2];c[y+8>>2]=c[K+8>>2];c[y+12>>2]=c[K+12>>2];c[y+16>>2]=c[K+16>>2];c[y+20>>2]=c[K+20>>2];c[y+24>>2]=c[K+24>>2];c[K>>2]=c[f>>2];c[K+4>>2]=c[f+4>>2];c[K+8>>2]=c[f+8>>2];c[K+12>>2]=c[f+12>>2];c[K+16>>2]=c[f+16>>2];c[K+20>>2]=c[f+20>>2];c[K+24>>2]=c[f+24>>2];c[f>>2]=c[y>>2];c[f+4>>2]=c[y+4>>2];c[f+8>>2]=c[y+8>>2];c[f+12>>2]=c[y+12>>2];c[f+16>>2]=c[y+16>>2];c[f+20>>2]=c[y+20>>2];c[f+24>>2]=c[y+24>>2];M=2}}while(0);do{if(Cb[c[d>>2]&63](a,J)|0){L=j}else{L=j;while(1){L=L-28|0;if((a|0)==(L|0)){break}if(Cb[c[d>>2]&63](L,J)|0){D=49;break}}if((D|0)==49){D=0;N=a;c[B>>2]=c[N>>2];c[B+4>>2]=c[N+4>>2];c[B+8>>2]=c[N+8>>2];c[B+12>>2]=c[N+12>>2];c[B+16>>2]=c[N+16>>2];c[B+20>>2]=c[N+20>>2];c[B+24>>2]=c[N+24>>2];O=L;c[N>>2]=c[O>>2];c[N+4>>2]=c[O+4>>2];c[N+8>>2]=c[O+8>>2];c[N+12>>2]=c[O+12>>2];c[N+16>>2]=c[O+16>>2];c[N+20>>2]=c[O+20>>2];c[N+24>>2]=c[O+24>>2];c[O>>2]=c[B>>2];c[O+4>>2]=c[B+4>>2];c[O+8>>2]=c[B+8>>2];c[O+12>>2]=c[B+12>>2];c[O+16>>2]=c[B+16>>2];c[O+20>>2]=c[B+20>>2];c[O+24>>2]=c[B+24>>2];M=M+1|0;break}J=a+28|0;if(!(Cb[c[d>>2]&63](a,j)|0)){while(1){if((J|0)==(j|0)){D=66;break a}I=J+28|0;if(Cb[c[d>>2]&63](a,J)|0){break}else{J=I}}c[F>>2]=c[J>>2];c[F+4>>2]=c[J+4>>2];c[F+8>>2]=c[J+8>>2];c[F+12>>2]=c[J+12>>2];c[F+16>>2]=c[J+16>>2];c[F+20>>2]=c[J+20>>2];c[F+24>>2]=c[J+24>>2];c[J>>2]=c[f>>2];c[J+4>>2]=c[f+4>>2];c[J+8>>2]=c[f+8>>2];c[J+12>>2]=c[f+12>>2];c[J+16>>2]=c[f+16>>2];c[J+20>>2]=c[f+20>>2];c[J+24>>2]=c[f+24>>2];c[f>>2]=c[F>>2];c[f+4>>2]=c[F+4>>2];c[f+8>>2]=c[F+8>>2];c[f+12>>2]=c[F+12>>2];c[f+16>>2]=c[F+16>>2];c[f+20>>2]=c[F+20>>2];c[f+24>>2]=c[F+24>>2];J=I}if((J|0)==(j|0)){D=66;break a}else{I=j}while(1){while(1){K=J+28|0;if(Cb[c[d>>2]&63](a,J)|0){break}else{J=K}}do{I=I-28|0;}while(Cb[c[d>>2]&63](a,I)|0);if(!(J>>>0<I>>>0)){a=J;continue b}O=J;c[A>>2]=c[O>>2];c[A+4>>2]=c[O+4>>2];c[A+8>>2]=c[O+8>>2];c[A+12>>2]=c[O+12>>2];c[A+16>>2]=c[O+16>>2];c[A+20>>2]=c[O+20>>2];c[A+24>>2]=c[O+24>>2];J=I;c[O>>2]=c[J>>2];c[O+4>>2]=c[J+4>>2];c[O+8>>2]=c[J+8>>2];c[O+12>>2]=c[J+12>>2];c[O+16>>2]=c[J+16>>2];c[O+20>>2]=c[J+20>>2];c[O+24>>2]=c[J+24>>2];c[J>>2]=c[A>>2];c[J+4>>2]=c[A+4>>2];c[J+8>>2]=c[A+8>>2];c[J+12>>2]=c[A+12>>2];c[J+16>>2]=c[A+16>>2];c[J+20>>2]=c[A+20>>2];c[J+24>>2]=c[A+24>>2];J=K}}}while(0);K=a+28|0;c:do{if(K>>>0<L>>>0){while(1){O=K;while(1){K=O+28|0;if(Cb[c[d>>2]&63](O,J)|0){O=K}else{N=L;break}}do{N=N-28|0;}while(!(Cb[c[d>>2]&63](N,J)|0));if(O>>>0>N>>>0){K=O;break c}P=O;c[C>>2]=c[P>>2];c[C+4>>2]=c[P+4>>2];c[C+8>>2]=c[P+8>>2];c[C+12>>2]=c[P+12>>2];c[C+16>>2]=c[P+16>>2];c[C+20>>2]=c[P+20>>2];c[C+24>>2]=c[P+24>>2];L=N;c[P>>2]=c[L>>2];c[P+4>>2]=c[L+4>>2];c[P+8>>2]=c[L+8>>2];c[P+12>>2]=c[L+12>>2];c[P+16>>2]=c[L+16>>2];c[P+20>>2]=c[L+20>>2];c[P+24>>2]=c[L+24>>2];c[L>>2]=c[C>>2];c[L+4>>2]=c[C+4>>2];c[L+8>>2]=c[C+8>>2];c[L+12>>2]=c[C+12>>2];c[L+16>>2]=c[C+16>>2];c[L+20>>2]=c[C+20>>2];c[L+24>>2]=c[C+24>>2];L=N;M=M+1|0;J=(J|0)==(O|0)?N:J}}}while(0);do{if((K|0)!=(J|0)){if(!(Cb[c[d>>2]&63](J,K)|0)){break}O=K;c[E>>2]=c[O>>2];c[E+4>>2]=c[O+4>>2];c[E+8>>2]=c[O+8>>2];c[E+12>>2]=c[O+12>>2];c[E+16>>2]=c[O+16>>2];c[E+20>>2]=c[O+20>>2];c[E+24>>2]=c[O+24>>2];P=J;c[O>>2]=c[P>>2];c[O+4>>2]=c[P+4>>2];c[O+8>>2]=c[P+8>>2];c[O+12>>2]=c[P+12>>2];c[O+16>>2]=c[P+16>>2];c[O+20>>2]=c[P+20>>2];c[O+24>>2]=c[P+24>>2];c[P>>2]=c[E>>2];c[P+4>>2]=c[E+4>>2];c[P+8>>2]=c[E+8>>2];c[P+12>>2]=c[E+12>>2];c[P+16>>2]=c[E+16>>2];c[P+20>>2]=c[E+20>>2];c[P+24>>2]=c[E+24>>2];M=M+1|0}}while(0);if((M|0)==0){L=ll(a,K,d)|0;J=K+28|0;if(ll(J,b,d)|0){D=61;break}if(L){a=J;continue}}P=K;if((P-I|0)>=(H-P|0)){D=65;break}il(a,K,d);a=K+28|0}if((D|0)==61){D=0;if(L){D=66;break}else{b=K;continue}}else if((D|0)==65){D=0;il(K+28|0,b,d);b=K;continue}}if((D|0)==4){if(!(Cb[c[d>>2]&63](j,a)|0)){i=e;return}P=x;O=a;c[P>>2]=c[O>>2];c[P+4>>2]=c[O+4>>2];c[P+8>>2]=c[O+8>>2];c[P+12>>2]=c[O+12>>2];c[P+16>>2]=c[O+16>>2];c[P+20>>2]=c[O+20>>2];c[P+24>>2]=c[O+24>>2];c[O>>2]=c[f>>2];c[O+4>>2]=c[f+4>>2];c[O+8>>2]=c[f+8>>2];c[O+12>>2]=c[f+12>>2];c[O+16>>2]=c[f+16>>2];c[O+20>>2]=c[f+20>>2];c[O+24>>2]=c[f+24>>2];c[f>>2]=c[P>>2];c[f+4>>2]=c[P+4>>2];c[f+8>>2]=c[P+8>>2];c[f+12>>2]=c[P+12>>2];c[f+16>>2]=c[P+16>>2];c[f+20>>2]=c[P+20>>2];c[f+24>>2]=c[P+24>>2];i=e;return}else if((D|0)==6){g=a+28|0;P=Cb[c[d>>2]&63](g,a)|0;h=Cb[c[d>>2]&63](j,g)|0;if(!P){if(!h){i=e;return}P=o;h=g;c[P>>2]=c[h>>2];c[P+4>>2]=c[h+4>>2];c[P+8>>2]=c[h+8>>2];c[P+12>>2]=c[h+12>>2];c[P+16>>2]=c[h+16>>2];c[P+20>>2]=c[h+20>>2];c[P+24>>2]=c[h+24>>2];c[h>>2]=c[f>>2];c[h+4>>2]=c[f+4>>2];c[h+8>>2]=c[f+8>>2];c[h+12>>2]=c[f+12>>2];c[h+16>>2]=c[f+16>>2];c[h+20>>2]=c[f+20>>2];c[h+24>>2]=c[f+24>>2];c[f>>2]=c[P>>2];c[f+4>>2]=c[P+4>>2];c[f+8>>2]=c[P+8>>2];c[f+12>>2]=c[P+12>>2];c[f+16>>2]=c[P+16>>2];c[f+20>>2]=c[P+20>>2];c[f+24>>2]=c[P+24>>2];if(!(Cb[c[d>>2]&63](g,a)|0)){i=e;return}P=l;O=a;c[P>>2]=c[O>>2];c[P+4>>2]=c[O+4>>2];c[P+8>>2]=c[O+8>>2];c[P+12>>2]=c[O+12>>2];c[P+16>>2]=c[O+16>>2];c[P+20>>2]=c[O+20>>2];c[P+24>>2]=c[O+24>>2];c[O>>2]=c[h>>2];c[O+4>>2]=c[h+4>>2];c[O+8>>2]=c[h+8>>2];c[O+12>>2]=c[h+12>>2];c[O+16>>2]=c[h+16>>2];c[O+20>>2]=c[h+20>>2];c[O+24>>2]=c[h+24>>2];c[h>>2]=c[P>>2];c[h+4>>2]=c[P+4>>2];c[h+8>>2]=c[P+8>>2];c[h+12>>2]=c[P+12>>2];c[h+16>>2]=c[P+16>>2];c[h+20>>2]=c[P+20>>2];c[h+24>>2]=c[P+24>>2];i=e;return}if(h){P=q;O=a;c[P>>2]=c[O>>2];c[P+4>>2]=c[O+4>>2];c[P+8>>2]=c[O+8>>2];c[P+12>>2]=c[O+12>>2];c[P+16>>2]=c[O+16>>2];c[P+20>>2]=c[O+20>>2];c[P+24>>2]=c[O+24>>2];c[O>>2]=c[f>>2];c[O+4>>2]=c[f+4>>2];c[O+8>>2]=c[f+8>>2];c[O+12>>2]=c[f+12>>2];c[O+16>>2]=c[f+16>>2];c[O+20>>2]=c[f+20>>2];c[O+24>>2]=c[f+24>>2];c[f>>2]=c[P>>2];c[f+4>>2]=c[P+4>>2];c[f+8>>2]=c[P+8>>2];c[f+12>>2]=c[P+12>>2];c[f+16>>2]=c[P+16>>2];c[f+20>>2]=c[P+20>>2];c[f+24>>2]=c[P+24>>2];i=e;return}P=p;O=a;c[P>>2]=c[O>>2];c[P+4>>2]=c[O+4>>2];c[P+8>>2]=c[O+8>>2];c[P+12>>2]=c[O+12>>2];c[P+16>>2]=c[O+16>>2];c[P+20>>2]=c[O+20>>2];c[P+24>>2]=c[O+24>>2];a=g;c[O>>2]=c[a>>2];c[O+4>>2]=c[a+4>>2];c[O+8>>2]=c[a+8>>2];c[O+12>>2]=c[a+12>>2];c[O+16>>2]=c[a+16>>2];c[O+20>>2]=c[a+20>>2];c[O+24>>2]=c[a+24>>2];c[a>>2]=c[P>>2];c[a+4>>2]=c[P+4>>2];c[a+8>>2]=c[P+8>>2];c[a+12>>2]=c[P+12>>2];c[a+16>>2]=c[P+16>>2];c[a+20>>2]=c[P+20>>2];c[a+24>>2]=c[P+24>>2];if(!(Cb[c[d>>2]&63](j,g)|0)){i=e;return}P=n;c[P>>2]=c[a>>2];c[P+4>>2]=c[a+4>>2];c[P+8>>2]=c[a+8>>2];c[P+12>>2]=c[a+12>>2];c[P+16>>2]=c[a+16>>2];c[P+20>>2]=c[a+20>>2];c[P+24>>2]=c[a+24>>2];c[a>>2]=c[f>>2];c[a+4>>2]=c[f+4>>2];c[a+8>>2]=c[f+8>>2];c[a+12>>2]=c[f+12>>2];c[a+16>>2]=c[f+16>>2];c[a+20>>2]=c[f+20>>2];c[a+24>>2]=c[f+24>>2];c[f>>2]=c[P>>2];c[f+4>>2]=c[P+4>>2];c[f+8>>2]=c[P+8>>2];c[f+12>>2]=c[P+12>>2];c[f+16>>2]=c[P+16>>2];c[f+20>>2]=c[P+20>>2];c[f+24>>2]=c[P+24>>2];i=e;return}else if((D|0)==14){jl(a,a+28|0,a+56|0,j,d)|0;i=e;return}else if((D|0)==15){l=a+28|0;n=a+56|0;o=a+84|0;jl(a,l,n,o,d)|0;if(!(Cb[c[d>>2]&63](j,o)|0)){i=e;return}P=m;j=o;c[P>>2]=c[j>>2];c[P+4>>2]=c[j+4>>2];c[P+8>>2]=c[j+8>>2];c[P+12>>2]=c[j+12>>2];c[P+16>>2]=c[j+16>>2];c[P+20>>2]=c[j+20>>2];c[P+24>>2]=c[j+24>>2];c[j>>2]=c[f>>2];c[j+4>>2]=c[f+4>>2];c[j+8>>2]=c[f+8>>2];c[j+12>>2]=c[f+12>>2];c[j+16>>2]=c[f+16>>2];c[j+20>>2]=c[f+20>>2];c[j+24>>2]=c[f+24>>2];c[f>>2]=c[P>>2];c[f+4>>2]=c[P+4>>2];c[f+8>>2]=c[P+8>>2];c[f+12>>2]=c[P+12>>2];c[f+16>>2]=c[P+16>>2];c[f+20>>2]=c[P+20>>2];c[f+24>>2]=c[P+24>>2];if(!(Cb[c[d>>2]&63](o,n)|0)){i=e;return}P=k;f=n;c[P>>2]=c[f>>2];c[P+4>>2]=c[f+4>>2];c[P+8>>2]=c[f+8>>2];c[P+12>>2]=c[f+12>>2];c[P+16>>2]=c[f+16>>2];c[P+20>>2]=c[f+20>>2];c[P+24>>2]=c[f+24>>2];c[f>>2]=c[j>>2];c[f+4>>2]=c[j+4>>2];c[f+8>>2]=c[j+8>>2];c[f+12>>2]=c[j+12>>2];c[f+16>>2]=c[j+16>>2];c[f+20>>2]=c[j+20>>2];c[f+24>>2]=c[j+24>>2];c[j>>2]=c[P>>2];c[j+4>>2]=c[P+4>>2];c[j+8>>2]=c[P+8>>2];c[j+12>>2]=c[P+12>>2];c[j+16>>2]=c[P+16>>2];c[j+20>>2]=c[P+20>>2];c[j+24>>2]=c[P+24>>2];if(!(Cb[c[d>>2]&63](n,l)|0)){i=e;return}P=h;h=l;c[P>>2]=c[h>>2];c[P+4>>2]=c[h+4>>2];c[P+8>>2]=c[h+8>>2];c[P+12>>2]=c[h+12>>2];c[P+16>>2]=c[h+16>>2];c[P+20>>2]=c[h+20>>2];c[P+24>>2]=c[h+24>>2];c[h>>2]=c[f>>2];c[h+4>>2]=c[f+4>>2];c[h+8>>2]=c[f+8>>2];c[h+12>>2]=c[f+12>>2];c[h+16>>2]=c[f+16>>2];c[h+20>>2]=c[f+20>>2];c[h+24>>2]=c[f+24>>2];c[f>>2]=c[P>>2];c[f+4>>2]=c[P+4>>2];c[f+8>>2]=c[P+8>>2];c[f+12>>2]=c[P+12>>2];c[f+16>>2]=c[P+16>>2];c[f+20>>2]=c[P+20>>2];c[f+24>>2]=c[P+24>>2];if(!(Cb[c[d>>2]&63](l,a)|0)){i=e;return}P=g;O=a;c[P>>2]=c[O>>2];c[P+4>>2]=c[O+4>>2];c[P+8>>2]=c[O+8>>2];c[P+12>>2]=c[O+12>>2];c[P+16>>2]=c[O+16>>2];c[P+20>>2]=c[O+20>>2];c[P+24>>2]=c[O+24>>2];c[O>>2]=c[h>>2];c[O+4>>2]=c[h+4>>2];c[O+8>>2]=c[h+8>>2];c[O+12>>2]=c[h+12>>2];c[O+16>>2]=c[h+16>>2];c[O+20>>2]=c[h+20>>2];c[O+24>>2]=c[h+24>>2];c[h>>2]=c[P>>2];c[h+4>>2]=c[P+4>>2];c[h+8>>2]=c[P+8>>2];c[h+12>>2]=c[P+12>>2];c[h+16>>2]=c[P+16>>2];c[h+20>>2]=c[P+20>>2];c[h+24>>2]=c[P+24>>2];i=e;return}else if((D|0)==21){kl(a,b,d);i=e;return}else if((D|0)==66){i=e;return}}function jl(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;h=i;i=i+256|0;g=h|0;j=h+32|0;k=h+64|0;p=h+96|0;n=h+128|0;m=h+160|0;l=h+192|0;q=h+224|0;r=Cb[c[f>>2]&63](b,a)|0;o=Cb[c[f>>2]&63](d,b)|0;do{if(r){if(o){r=p;q=a;c[r>>2]=c[q>>2];c[r+4>>2]=c[q+4>>2];c[r+8>>2]=c[q+8>>2];c[r+12>>2]=c[q+12>>2];c[r+16>>2]=c[q+16>>2];c[r+20>>2]=c[q+20>>2];c[r+24>>2]=c[q+24>>2];l=d;c[q>>2]=c[l>>2];c[q+4>>2]=c[l+4>>2];c[q+8>>2]=c[l+8>>2];c[q+12>>2]=c[l+12>>2];c[q+16>>2]=c[l+16>>2];c[q+20>>2]=c[l+20>>2];c[q+24>>2]=c[l+24>>2];c[l>>2]=c[r>>2];c[l+4>>2]=c[r+4>>2];c[l+8>>2]=c[r+8>>2];c[l+12>>2]=c[r+12>>2];c[l+16>>2]=c[r+16>>2];c[l+20>>2]=c[r+20>>2];c[l+24>>2]=c[r+24>>2];l=1;break}r=n;q=a;c[r>>2]=c[q>>2];c[r+4>>2]=c[q+4>>2];c[r+8>>2]=c[q+8>>2];c[r+12>>2]=c[q+12>>2];c[r+16>>2]=c[q+16>>2];c[r+20>>2]=c[q+20>>2];c[r+24>>2]=c[q+24>>2];m=b;c[q>>2]=c[m>>2];c[q+4>>2]=c[m+4>>2];c[q+8>>2]=c[m+8>>2];c[q+12>>2]=c[m+12>>2];c[q+16>>2]=c[m+16>>2];c[q+20>>2]=c[m+20>>2];c[q+24>>2]=c[m+24>>2];c[m>>2]=c[r>>2];c[m+4>>2]=c[r+4>>2];c[m+8>>2]=c[r+8>>2];c[m+12>>2]=c[r+12>>2];c[m+16>>2]=c[r+16>>2];c[m+20>>2]=c[r+20>>2];c[m+24>>2]=c[r+24>>2];if(!(Cb[c[f>>2]&63](d,b)|0)){l=1;break}r=l;c[r>>2]=c[m>>2];c[r+4>>2]=c[m+4>>2];c[r+8>>2]=c[m+8>>2];c[r+12>>2]=c[m+12>>2];c[r+16>>2]=c[m+16>>2];c[r+20>>2]=c[m+20>>2];c[r+24>>2]=c[m+24>>2];l=d;c[m>>2]=c[l>>2];c[m+4>>2]=c[l+4>>2];c[m+8>>2]=c[l+8>>2];c[m+12>>2]=c[l+12>>2];c[m+16>>2]=c[l+16>>2];c[m+20>>2]=c[l+20>>2];c[m+24>>2]=c[l+24>>2];c[l>>2]=c[r>>2];c[l+4>>2]=c[r+4>>2];c[l+8>>2]=c[r+8>>2];c[l+12>>2]=c[r+12>>2];c[l+16>>2]=c[r+16>>2];c[l+20>>2]=c[r+20>>2];c[l+24>>2]=c[r+24>>2];l=2}else{if(!o){l=0;break}l=b;c[q>>2]=c[l>>2];c[q+4>>2]=c[l+4>>2];c[q+8>>2]=c[l+8>>2];c[q+12>>2]=c[l+12>>2];c[q+16>>2]=c[l+16>>2];c[q+20>>2]=c[l+20>>2];c[q+24>>2]=c[l+24>>2];r=d;c[l>>2]=c[r>>2];c[l+4>>2]=c[r+4>>2];c[l+8>>2]=c[r+8>>2];c[l+12>>2]=c[r+12>>2];c[l+16>>2]=c[r+16>>2];c[l+20>>2]=c[r+20>>2];c[l+24>>2]=c[r+24>>2];c[r>>2]=c[q>>2];c[r+4>>2]=c[q+4>>2];c[r+8>>2]=c[q+8>>2];c[r+12>>2]=c[q+12>>2];c[r+16>>2]=c[q+16>>2];c[r+20>>2]=c[q+20>>2];c[r+24>>2]=c[q+24>>2];if(!(Cb[c[f>>2]&63](b,a)|0)){l=1;break}r=m;q=a;c[r>>2]=c[q>>2];c[r+4>>2]=c[q+4>>2];c[r+8>>2]=c[q+8>>2];c[r+12>>2]=c[q+12>>2];c[r+16>>2]=c[q+16>>2];c[r+20>>2]=c[q+20>>2];c[r+24>>2]=c[q+24>>2];c[q>>2]=c[l>>2];c[q+4>>2]=c[l+4>>2];c[q+8>>2]=c[l+8>>2];c[q+12>>2]=c[l+12>>2];c[q+16>>2]=c[l+16>>2];c[q+20>>2]=c[l+20>>2];c[q+24>>2]=c[l+24>>2];c[l>>2]=c[r>>2];c[l+4>>2]=c[r+4>>2];c[l+8>>2]=c[r+8>>2];c[l+12>>2]=c[r+12>>2];c[l+16>>2]=c[r+16>>2];c[l+20>>2]=c[r+20>>2];c[l+24>>2]=c[r+24>>2];l=2}}while(0);if(!(Cb[c[f>>2]&63](e,d)|0)){r=l;i=h;return r|0}q=k;k=d;c[q>>2]=c[k>>2];c[q+4>>2]=c[k+4>>2];c[q+8>>2]=c[k+8>>2];c[q+12>>2]=c[k+12>>2];c[q+16>>2]=c[k+16>>2];c[q+20>>2]=c[k+20>>2];c[q+24>>2]=c[k+24>>2];r=e;c[k>>2]=c[r>>2];c[k+4>>2]=c[r+4>>2];c[k+8>>2]=c[r+8>>2];c[k+12>>2]=c[r+12>>2];c[k+16>>2]=c[r+16>>2];c[k+20>>2]=c[r+20>>2];c[k+24>>2]=c[r+24>>2];c[r>>2]=c[q>>2];c[r+4>>2]=c[q+4>>2];c[r+8>>2]=c[q+8>>2];c[r+12>>2]=c[q+12>>2];c[r+16>>2]=c[q+16>>2];c[r+20>>2]=c[q+20>>2];c[r+24>>2]=c[q+24>>2];if(!(Cb[c[f>>2]&63](d,b)|0)){r=l+1|0;i=h;return r|0}r=j;j=b;c[r>>2]=c[j>>2];c[r+4>>2]=c[j+4>>2];c[r+8>>2]=c[j+8>>2];c[r+12>>2]=c[j+12>>2];c[r+16>>2]=c[j+16>>2];c[r+20>>2]=c[j+20>>2];c[r+24>>2]=c[j+24>>2];c[j>>2]=c[k>>2];c[j+4>>2]=c[k+4>>2];c[j+8>>2]=c[k+8>>2];c[j+12>>2]=c[k+12>>2];c[j+16>>2]=c[k+16>>2];c[j+20>>2]=c[k+20>>2];c[j+24>>2]=c[k+24>>2];c[k>>2]=c[r>>2];c[k+4>>2]=c[r+4>>2];c[k+8>>2]=c[r+8>>2];c[k+12>>2]=c[r+12>>2];c[k+16>>2]=c[r+16>>2];c[k+20>>2]=c[r+20>>2];c[k+24>>2]=c[r+24>>2];if(!(Cb[c[f>>2]&63](b,a)|0)){r=l+2|0;i=h;return r|0}r=g;q=a;c[r>>2]=c[q>>2];c[r+4>>2]=c[q+4>>2];c[r+8>>2]=c[q+8>>2];c[r+12>>2]=c[q+12>>2];c[r+16>>2]=c[q+16>>2];c[r+20>>2]=c[q+20>>2];c[r+24>>2]=c[q+24>>2];c[q>>2]=c[j>>2];c[q+4>>2]=c[j+4>>2];c[q+8>>2]=c[j+8>>2];c[q+12>>2]=c[j+12>>2];c[q+16>>2]=c[j+16>>2];c[q+20>>2]=c[j+20>>2];c[q+24>>2]=c[j+24>>2];c[j>>2]=c[r>>2];c[j+4>>2]=c[r+4>>2];c[j+8>>2]=c[r+8>>2];c[j+12>>2]=c[r+12>>2];c[j+16>>2]=c[r+16>>2];c[j+20>>2]=c[r+20>>2];c[j+24>>2]=c[r+24>>2];r=l+3|0;i=h;return r|0}function kl(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0;f=i;i=i+192|0;n=f|0;o=f+32|0;k=f+64|0;j=f+96|0;m=f+128|0;e=f+160|0;g=a+56|0;h=a+28|0;p=Cb[c[d>>2]&63](h,a)|0;l=Cb[c[d>>2]&63](g,h)|0;do{if(p){if(l){o=n;n=a;c[o>>2]=c[n>>2];c[o+4>>2]=c[n+4>>2];c[o+8>>2]=c[n+8>>2];c[o+12>>2]=c[n+12>>2];c[o+16>>2]=c[n+16>>2];c[o+20>>2]=c[n+20>>2];c[o+24>>2]=c[n+24>>2];p=g;c[n>>2]=c[p>>2];c[n+4>>2]=c[p+4>>2];c[n+8>>2]=c[p+8>>2];c[n+12>>2]=c[p+12>>2];c[n+16>>2]=c[p+16>>2];c[n+20>>2]=c[p+20>>2];c[n+24>>2]=c[p+24>>2];c[p>>2]=c[o>>2];c[p+4>>2]=c[o+4>>2];c[p+8>>2]=c[o+8>>2];c[p+12>>2]=c[o+12>>2];c[p+16>>2]=c[o+16>>2];c[p+20>>2]=c[o+20>>2];c[p+24>>2]=c[o+24>>2];break}p=o;o=a;c[p>>2]=c[o>>2];c[p+4>>2]=c[o+4>>2];c[p+8>>2]=c[o+8>>2];c[p+12>>2]=c[o+12>>2];c[p+16>>2]=c[o+16>>2];c[p+20>>2]=c[o+20>>2];c[p+24>>2]=c[o+24>>2];k=h;c[o>>2]=c[k>>2];c[o+4>>2]=c[k+4>>2];c[o+8>>2]=c[k+8>>2];c[o+12>>2]=c[k+12>>2];c[o+16>>2]=c[k+16>>2];c[o+20>>2]=c[k+20>>2];c[o+24>>2]=c[k+24>>2];c[k>>2]=c[p>>2];c[k+4>>2]=c[p+4>>2];c[k+8>>2]=c[p+8>>2];c[k+12>>2]=c[p+12>>2];c[k+16>>2]=c[p+16>>2];c[k+20>>2]=c[p+20>>2];c[k+24>>2]=c[p+24>>2];if(!(Cb[c[d>>2]&63](g,h)|0)){break}o=j;c[o>>2]=c[k>>2];c[o+4>>2]=c[k+4>>2];c[o+8>>2]=c[k+8>>2];c[o+12>>2]=c[k+12>>2];c[o+16>>2]=c[k+16>>2];c[o+20>>2]=c[k+20>>2];c[o+24>>2]=c[k+24>>2];p=g;c[k>>2]=c[p>>2];c[k+4>>2]=c[p+4>>2];c[k+8>>2]=c[p+8>>2];c[k+12>>2]=c[p+12>>2];c[k+16>>2]=c[p+16>>2];c[k+20>>2]=c[p+20>>2];c[k+24>>2]=c[p+24>>2];c[p>>2]=c[o>>2];c[p+4>>2]=c[o+4>>2];c[p+8>>2]=c[o+8>>2];c[p+12>>2]=c[o+12>>2];c[p+16>>2]=c[o+16>>2];c[p+20>>2]=c[o+20>>2];c[p+24>>2]=c[o+24>>2];}else{if(!l){break}o=m;j=h;c[o>>2]=c[j>>2];c[o+4>>2]=c[j+4>>2];c[o+8>>2]=c[j+8>>2];c[o+12>>2]=c[j+12>>2];c[o+16>>2]=c[j+16>>2];c[o+20>>2]=c[j+20>>2];c[o+24>>2]=c[j+24>>2];p=g;c[j>>2]=c[p>>2];c[j+4>>2]=c[p+4>>2];c[j+8>>2]=c[p+8>>2];c[j+12>>2]=c[p+12>>2];c[j+16>>2]=c[p+16>>2];c[j+20>>2]=c[p+20>>2];c[j+24>>2]=c[p+24>>2];c[p>>2]=c[o>>2];c[p+4>>2]=c[o+4>>2];c[p+8>>2]=c[o+8>>2];c[p+12>>2]=c[o+12>>2];c[p+16>>2]=c[o+16>>2];c[p+20>>2]=c[o+20>>2];c[p+24>>2]=c[o+24>>2];if(!(Cb[c[d>>2]&63](h,a)|0)){break}p=k;o=a;c[p>>2]=c[o>>2];c[p+4>>2]=c[o+4>>2];c[p+8>>2]=c[o+8>>2];c[p+12>>2]=c[o+12>>2];c[p+16>>2]=c[o+16>>2];c[p+20>>2]=c[o+20>>2];c[p+24>>2]=c[o+24>>2];c[o>>2]=c[j>>2];c[o+4>>2]=c[j+4>>2];c[o+8>>2]=c[j+8>>2];c[o+12>>2]=c[j+12>>2];c[o+16>>2]=c[j+16>>2];c[o+20>>2]=c[j+20>>2];c[o+24>>2]=c[j+24>>2];c[j>>2]=c[p>>2];c[j+4>>2]=c[p+4>>2];c[j+8>>2]=c[p+8>>2];c[j+12>>2]=c[p+12>>2];c[j+16>>2]=c[p+16>>2];c[j+20>>2]=c[p+20>>2];c[j+24>>2]=c[p+24>>2];}}while(0);j=a+84|0;if((j|0)==(b|0)){i=f;return}h=e;while(1){if(Cb[c[d>>2]&63](j,g)|0){l=j;c[h>>2]=c[l>>2];c[h+4>>2]=c[l+4>>2];c[h+8>>2]=c[l+8>>2];c[h+12>>2]=c[l+12>>2];c[h+16>>2]=c[l+16>>2];c[h+20>>2]=c[l+20>>2];c[h+24>>2]=c[l+24>>2];l=j;while(1){p=l;l=g;c[p>>2]=c[l>>2];c[p+4>>2]=c[l+4>>2];c[p+8>>2]=c[l+8>>2];c[p+12>>2]=c[l+12>>2];c[p+16>>2]=c[l+16>>2];c[p+20>>2]=c[l+20>>2];c[p+24>>2]=c[l+24>>2];if((g|0)==(a|0)){break}k=g-28|0;if(Cb[c[d>>2]&63](e,k)|0){l=g;g=k}else{break}}c[l>>2]=c[h>>2];c[l+4>>2]=c[h+4>>2];c[l+8>>2]=c[h+8>>2];c[l+12>>2]=c[h+12>>2];c[l+16>>2]=c[h+16>>2];c[l+20>>2]=c[h+20>>2];c[l+24>>2]=c[h+24>>2]}k=j+28|0;if((k|0)==(b|0)){break}else{g=j;j=k}}i=f;return}function ll(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0;e=i;i=i+512|0;q=e|0;p=e+32|0;k=e+64|0;j=e+96|0;r=e+128|0;n=e+288|0;m=e+320|0;h=e+352|0;l=e+384|0;o=e+416|0;s=e+448|0;g=e+480|0;switch((b-a|0)/28|0|0){case 4:{jl(a,a+28|0,a+56|0,b-28|0,d)|0;s=1;i=e;return s|0};case 5:{f=a+28|0;g=a+56|0;h=a+84|0;j=b-28|0;jl(a,f,g,h,d)|0;if(!(Cb[c[d>>2]&63](j,h)|0)){s=1;i=e;return s|0}r=e+256|0;b=h;c[r>>2]=c[b>>2];c[r+4>>2]=c[b+4>>2];c[r+8>>2]=c[b+8>>2];c[r+12>>2]=c[b+12>>2];c[r+16>>2]=c[b+16>>2];c[r+20>>2]=c[b+20>>2];c[r+24>>2]=c[b+24>>2];s=j;c[b>>2]=c[s>>2];c[b+4>>2]=c[s+4>>2];c[b+8>>2]=c[s+8>>2];c[b+12>>2]=c[s+12>>2];c[b+16>>2]=c[s+16>>2];c[b+20>>2]=c[s+20>>2];c[b+24>>2]=c[s+24>>2];c[s>>2]=c[r>>2];c[s+4>>2]=c[r+4>>2];c[s+8>>2]=c[r+8>>2];c[s+12>>2]=c[r+12>>2];c[s+16>>2]=c[r+16>>2];c[s+20>>2]=c[r+20>>2];c[s+24>>2]=c[r+24>>2];if(!(Cb[c[d>>2]&63](h,g)|0)){s=1;i=e;return s|0}s=e+192|0;h=g;c[s>>2]=c[h>>2];c[s+4>>2]=c[h+4>>2];c[s+8>>2]=c[h+8>>2];c[s+12>>2]=c[h+12>>2];c[s+16>>2]=c[h+16>>2];c[s+20>>2]=c[h+20>>2];c[s+24>>2]=c[h+24>>2];c[h>>2]=c[b>>2];c[h+4>>2]=c[b+4>>2];c[h+8>>2]=c[b+8>>2];c[h+12>>2]=c[b+12>>2];c[h+16>>2]=c[b+16>>2];c[h+20>>2]=c[b+20>>2];c[h+24>>2]=c[b+24>>2];c[b>>2]=c[s>>2];c[b+4>>2]=c[s+4>>2];c[b+8>>2]=c[s+8>>2];c[b+12>>2]=c[s+12>>2];c[b+16>>2]=c[s+16>>2];c[b+20>>2]=c[s+20>>2];c[b+24>>2]=c[s+24>>2];if(!(Cb[c[d>>2]&63](g,f)|0)){s=1;i=e;return s|0}s=e+160|0;b=f;c[s>>2]=c[b>>2];c[s+4>>2]=c[b+4>>2];c[s+8>>2]=c[b+8>>2];c[s+12>>2]=c[b+12>>2];c[s+16>>2]=c[b+16>>2];c[s+20>>2]=c[b+20>>2];c[s+24>>2]=c[b+24>>2];c[b>>2]=c[h>>2];c[b+4>>2]=c[h+4>>2];c[b+8>>2]=c[h+8>>2];c[b+12>>2]=c[h+12>>2];c[b+16>>2]=c[h+16>>2];c[b+20>>2]=c[h+20>>2];c[b+24>>2]=c[h+24>>2];c[h>>2]=c[s>>2];c[h+4>>2]=c[s+4>>2];c[h+8>>2]=c[s+8>>2];c[h+12>>2]=c[s+12>>2];c[h+16>>2]=c[s+16>>2];c[h+20>>2]=c[s+20>>2];c[h+24>>2]=c[s+24>>2];if(!(Cb[c[d>>2]&63](f,a)|0)){s=1;i=e;return s|0}s=e+224|0;r=a;c[s>>2]=c[r>>2];c[s+4>>2]=c[r+4>>2];c[s+8>>2]=c[r+8>>2];c[s+12>>2]=c[r+12>>2];c[s+16>>2]=c[r+16>>2];c[s+20>>2]=c[r+20>>2];c[s+24>>2]=c[r+24>>2];c[r>>2]=c[b>>2];c[r+4>>2]=c[b+4>>2];c[r+8>>2]=c[b+8>>2];c[r+12>>2]=c[b+12>>2];c[r+16>>2]=c[b+16>>2];c[r+20>>2]=c[b+20>>2];c[r+24>>2]=c[b+24>>2];c[b>>2]=c[s>>2];c[b+4>>2]=c[s+4>>2];c[b+8>>2]=c[s+8>>2];c[b+12>>2]=c[s+12>>2];c[b+16>>2]=c[s+16>>2];c[b+20>>2]=c[s+20>>2];c[b+24>>2]=c[s+24>>2];s=1;i=e;return s|0};case 0:case 1:{s=1;i=e;return s|0};case 3:{f=a+28|0;b=b-28|0;s=Cb[c[d>>2]&63](f,a)|0;g=Cb[c[d>>2]&63](b,f)|0;if(!s){if(!g){s=1;i=e;return s|0}r=o;g=f;c[r>>2]=c[g>>2];c[r+4>>2]=c[g+4>>2];c[r+8>>2]=c[g+8>>2];c[r+12>>2]=c[g+12>>2];c[r+16>>2]=c[g+16>>2];c[r+20>>2]=c[g+20>>2];c[r+24>>2]=c[g+24>>2];s=b;c[g>>2]=c[s>>2];c[g+4>>2]=c[s+4>>2];c[g+8>>2]=c[s+8>>2];c[g+12>>2]=c[s+12>>2];c[g+16>>2]=c[s+16>>2];c[g+20>>2]=c[s+20>>2];c[g+24>>2]=c[s+24>>2];c[s>>2]=c[r>>2];c[s+4>>2]=c[r+4>>2];c[s+8>>2]=c[r+8>>2];c[s+12>>2]=c[r+12>>2];c[s+16>>2]=c[r+16>>2];c[s+20>>2]=c[r+20>>2];c[s+24>>2]=c[r+24>>2];if(!(Cb[c[d>>2]&63](f,a)|0)){s=1;i=e;return s|0}s=h;r=a;c[s>>2]=c[r>>2];c[s+4>>2]=c[r+4>>2];c[s+8>>2]=c[r+8>>2];c[s+12>>2]=c[r+12>>2];c[s+16>>2]=c[r+16>>2];c[s+20>>2]=c[r+20>>2];c[s+24>>2]=c[r+24>>2];c[r>>2]=c[g>>2];c[r+4>>2]=c[g+4>>2];c[r+8>>2]=c[g+8>>2];c[r+12>>2]=c[g+12>>2];c[r+16>>2]=c[g+16>>2];c[r+20>>2]=c[g+20>>2];c[r+24>>2]=c[g+24>>2];c[g>>2]=c[s>>2];c[g+4>>2]=c[s+4>>2];c[g+8>>2]=c[s+8>>2];c[g+12>>2]=c[s+12>>2];c[g+16>>2]=c[s+16>>2];c[g+20>>2]=c[s+20>>2];c[g+24>>2]=c[s+24>>2];s=1;i=e;return s|0}if(g){r=n;q=a;c[r>>2]=c[q>>2];c[r+4>>2]=c[q+4>>2];c[r+8>>2]=c[q+8>>2];c[r+12>>2]=c[q+12>>2];c[r+16>>2]=c[q+16>>2];c[r+20>>2]=c[q+20>>2];c[r+24>>2]=c[q+24>>2];s=b;c[q>>2]=c[s>>2];c[q+4>>2]=c[s+4>>2];c[q+8>>2]=c[s+8>>2];c[q+12>>2]=c[s+12>>2];c[q+16>>2]=c[s+16>>2];c[q+20>>2]=c[s+20>>2];c[q+24>>2]=c[s+24>>2];c[s>>2]=c[r>>2];c[s+4>>2]=c[r+4>>2];c[s+8>>2]=c[r+8>>2];c[s+12>>2]=c[r+12>>2];c[s+16>>2]=c[r+16>>2];c[s+20>>2]=c[r+20>>2];c[s+24>>2]=c[r+24>>2];s=1;i=e;return s|0}s=m;r=a;c[s>>2]=c[r>>2];c[s+4>>2]=c[r+4>>2];c[s+8>>2]=c[r+8>>2];c[s+12>>2]=c[r+12>>2];c[s+16>>2]=c[r+16>>2];c[s+20>>2]=c[r+20>>2];c[s+24>>2]=c[r+24>>2];a=f;c[r>>2]=c[a>>2];c[r+4>>2]=c[a+4>>2];c[r+8>>2]=c[a+8>>2];c[r+12>>2]=c[a+12>>2];c[r+16>>2]=c[a+16>>2];c[r+20>>2]=c[a+20>>2];c[r+24>>2]=c[a+24>>2];c[a>>2]=c[s>>2];c[a+4>>2]=c[s+4>>2];c[a+8>>2]=c[s+8>>2];c[a+12>>2]=c[s+12>>2];c[a+16>>2]=c[s+16>>2];c[a+20>>2]=c[s+20>>2];c[a+24>>2]=c[s+24>>2];if(!(Cb[c[d>>2]&63](b,f)|0)){s=1;i=e;return s|0}r=l;c[r>>2]=c[a>>2];c[r+4>>2]=c[a+4>>2];c[r+8>>2]=c[a+8>>2];c[r+12>>2]=c[a+12>>2];c[r+16>>2]=c[a+16>>2];c[r+20>>2]=c[a+20>>2];c[r+24>>2]=c[a+24>>2];s=b;c[a>>2]=c[s>>2];c[a+4>>2]=c[s+4>>2];c[a+8>>2]=c[s+8>>2];c[a+12>>2]=c[s+12>>2];c[a+16>>2]=c[s+16>>2];c[a+20>>2]=c[s+20>>2];c[a+24>>2]=c[s+24>>2];c[s>>2]=c[r>>2];c[s+4>>2]=c[r+4>>2];c[s+8>>2]=c[r+8>>2];c[s+12>>2]=c[r+12>>2];c[s+16>>2]=c[r+16>>2];c[s+20>>2]=c[r+20>>2];c[s+24>>2]=c[r+24>>2];s=1;i=e;return s|0};case 2:{b=b-28|0;if(!(Cb[c[d>>2]&63](b,a)|0)){s=1;i=e;return s|0}r=s;q=a;c[r>>2]=c[q>>2];c[r+4>>2]=c[q+4>>2];c[r+8>>2]=c[q+8>>2];c[r+12>>2]=c[q+12>>2];c[r+16>>2]=c[q+16>>2];c[r+20>>2]=c[q+20>>2];c[r+24>>2]=c[q+24>>2];s=b;c[q>>2]=c[s>>2];c[q+4>>2]=c[s+4>>2];c[q+8>>2]=c[s+8>>2];c[q+12>>2]=c[s+12>>2];c[q+16>>2]=c[s+16>>2];c[q+20>>2]=c[s+20>>2];c[q+24>>2]=c[s+24>>2];c[s>>2]=c[r>>2];c[s+4>>2]=c[r+4>>2];c[s+8>>2]=c[r+8>>2];c[s+12>>2]=c[r+12>>2];c[s+16>>2]=c[r+16>>2];c[s+20>>2]=c[r+20>>2];c[s+24>>2]=c[r+24>>2];s=1;i=e;return s|0};default:{l=a+56|0;h=a+28|0;s=Cb[c[d>>2]&63](h,a)|0;m=Cb[c[d>>2]&63](l,h)|0;do{if(s){if(m){r=q;q=a;c[r>>2]=c[q>>2];c[r+4>>2]=c[q+4>>2];c[r+8>>2]=c[q+8>>2];c[r+12>>2]=c[q+12>>2];c[r+16>>2]=c[q+16>>2];c[r+20>>2]=c[q+20>>2];c[r+24>>2]=c[q+24>>2];s=l;c[q>>2]=c[s>>2];c[q+4>>2]=c[s+4>>2];c[q+8>>2]=c[s+8>>2];c[q+12>>2]=c[s+12>>2];c[q+16>>2]=c[s+16>>2];c[q+20>>2]=c[s+20>>2];c[q+24>>2]=c[s+24>>2];c[s>>2]=c[r>>2];c[s+4>>2]=c[r+4>>2];c[s+8>>2]=c[r+8>>2];c[s+12>>2]=c[r+12>>2];c[s+16>>2]=c[r+16>>2];c[s+20>>2]=c[r+20>>2];c[s+24>>2]=c[r+24>>2];break}s=p;r=a;c[s>>2]=c[r>>2];c[s+4>>2]=c[r+4>>2];c[s+8>>2]=c[r+8>>2];c[s+12>>2]=c[r+12>>2];c[s+16>>2]=c[r+16>>2];c[s+20>>2]=c[r+20>>2];c[s+24>>2]=c[r+24>>2];k=h;c[r>>2]=c[k>>2];c[r+4>>2]=c[k+4>>2];c[r+8>>2]=c[k+8>>2];c[r+12>>2]=c[k+12>>2];c[r+16>>2]=c[k+16>>2];c[r+20>>2]=c[k+20>>2];c[r+24>>2]=c[k+24>>2];c[k>>2]=c[s>>2];c[k+4>>2]=c[s+4>>2];c[k+8>>2]=c[s+8>>2];c[k+12>>2]=c[s+12>>2];c[k+16>>2]=c[s+16>>2];c[k+20>>2]=c[s+20>>2];c[k+24>>2]=c[s+24>>2];if(!(Cb[c[d>>2]&63](l,h)|0)){break}r=j;c[r>>2]=c[k>>2];c[r+4>>2]=c[k+4>>2];c[r+8>>2]=c[k+8>>2];c[r+12>>2]=c[k+12>>2];c[r+16>>2]=c[k+16>>2];c[r+20>>2]=c[k+20>>2];c[r+24>>2]=c[k+24>>2];s=l;c[k>>2]=c[s>>2];c[k+4>>2]=c[s+4>>2];c[k+8>>2]=c[s+8>>2];c[k+12>>2]=c[s+12>>2];c[k+16>>2]=c[s+16>>2];c[k+20>>2]=c[s+20>>2];c[k+24>>2]=c[s+24>>2];c[s>>2]=c[r>>2];c[s+4>>2]=c[r+4>>2];c[s+8>>2]=c[r+8>>2];c[s+12>>2]=c[r+12>>2];c[s+16>>2]=c[r+16>>2];c[s+20>>2]=c[r+20>>2];c[s+24>>2]=c[r+24>>2];}else{if(!m){break}j=h;c[r>>2]=c[j>>2];c[r+4>>2]=c[j+4>>2];c[r+8>>2]=c[j+8>>2];c[r+12>>2]=c[j+12>>2];c[r+16>>2]=c[j+16>>2];c[r+20>>2]=c[j+20>>2];c[r+24>>2]=c[j+24>>2];s=l;c[j>>2]=c[s>>2];c[j+4>>2]=c[s+4>>2];c[j+8>>2]=c[s+8>>2];c[j+12>>2]=c[s+12>>2];c[j+16>>2]=c[s+16>>2];c[j+20>>2]=c[s+20>>2];c[j+24>>2]=c[s+24>>2];c[s>>2]=c[r>>2];c[s+4>>2]=c[r+4>>2];c[s+8>>2]=c[r+8>>2];c[s+12>>2]=c[r+12>>2];c[s+16>>2]=c[r+16>>2];c[s+20>>2]=c[r+20>>2];c[s+24>>2]=c[r+24>>2];if(!(Cb[c[d>>2]&63](h,a)|0)){break}s=k;r=a;c[s>>2]=c[r>>2];c[s+4>>2]=c[r+4>>2];c[s+8>>2]=c[r+8>>2];c[s+12>>2]=c[r+12>>2];c[s+16>>2]=c[r+16>>2];c[s+20>>2]=c[r+20>>2];c[s+24>>2]=c[r+24>>2];c[r>>2]=c[j>>2];c[r+4>>2]=c[j+4>>2];c[r+8>>2]=c[j+8>>2];c[r+12>>2]=c[j+12>>2];c[r+16>>2]=c[j+16>>2];c[r+20>>2]=c[j+20>>2];c[r+24>>2]=c[j+24>>2];c[j>>2]=c[s>>2];c[j+4>>2]=c[s+4>>2];c[j+8>>2]=c[s+8>>2];c[j+12>>2]=c[s+12>>2];c[j+16>>2]=c[s+16>>2];c[j+20>>2]=c[s+20>>2];c[j+24>>2]=c[s+24>>2];}}while(0);j=a+84|0;if((j|0)==(b|0)){s=1;i=e;return s|0}h=g;k=0;while(1){if(Cb[c[d>>2]&63](j,l)|0){n=j;c[h>>2]=c[n>>2];c[h+4>>2]=c[n+4>>2];c[h+8>>2]=c[n+8>>2];c[h+12>>2]=c[n+12>>2];c[h+16>>2]=c[n+16>>2];c[h+20>>2]=c[n+20>>2];c[h+24>>2]=c[n+24>>2];n=j;while(1){s=n;n=l;c[s>>2]=c[n>>2];c[s+4>>2]=c[n+4>>2];c[s+8>>2]=c[n+8>>2];c[s+12>>2]=c[n+12>>2];c[s+16>>2]=c[n+16>>2];c[s+20>>2]=c[n+20>>2];c[s+24>>2]=c[n+24>>2];if((l|0)==(a|0)){break}m=l-28|0;if(Cb[c[d>>2]&63](g,m)|0){n=l;l=m}else{break}}c[n>>2]=c[h>>2];c[n+4>>2]=c[h+4>>2];c[n+8>>2]=c[h+8>>2];c[n+12>>2]=c[h+12>>2];c[n+16>>2]=c[h+16>>2];c[n+20>>2]=c[h+20>>2];c[n+24>>2]=c[h+24>>2];k=k+1|0;if((k|0)==8){break}}m=j+28|0;if((m|0)==(b|0)){d=1;f=35;break}else{l=j;j=m}}if((f|0)==35){i=e;return d|0}s=(j+28|0)==(b|0);i=e;return s|0}}return 0}function ml(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0;e=i;i=i+8|0;f=e|0;a:while(1){k=b;h=b-8|0;g=h;b:while(1){l=a;o=k-l|0;n=o>>3;switch(n|0){case 3:{j=6;break a};case 4:{j=14;break a};case 0:case 1:{j=83;break a};case 2:{j=4;break a};case 5:{j=26;break a};default:{}}if((o|0)<248){j=28;break a}p=(n|0)/2|0;m=a+(p<<3)|0;do{if((o|0)>7992){r=(n|0)/4|0;p=nl(a,a+(r<<3)|0,m,a+(r+p<<3)|0,h,d)|0}else{r=Cb[c[d>>2]&63](m,a)|0;q=Cb[c[d>>2]&63](h,m)|0;if(!r){if(!q){p=0;break}n=m;q=c[n>>2]|0;r=c[n+4>>2]|0;p=c[g+4>>2]|0;c[n>>2]=c[g>>2];c[n+4>>2]=p;c[g>>2]=q;c[g+4>>2]=r;if(!(Cb[c[d>>2]&63](m,a)|0)){p=1;break}q=a;r=c[q>>2]|0;p=c[q+4>>2]|0;o=c[n+4>>2]|0;c[q>>2]=c[n>>2];c[q+4>>2]=o;c[n>>2]=r;c[n+4>>2]=p;p=2;break}p=a;o=c[p>>2]|0;n=c[p+4>>2]|0;if(q){r=c[g+4>>2]|0;c[p>>2]=c[g>>2];c[p+4>>2]=r;c[g>>2]=o;c[g+4>>2]=n;p=1;break}q=m;r=c[q+4>>2]|0;c[p>>2]=c[q>>2];c[p+4>>2]=r;c[q>>2]=o;c[q+4>>2]=n;if(!(Cb[c[d>>2]&63](h,m)|0)){p=1;break}r=c[q>>2]|0;p=c[q+4>>2]|0;o=c[g+4>>2]|0;c[q>>2]=c[g>>2];c[q+4>>2]=o;c[g>>2]=r;c[g+4>>2]=p;p=2}}while(0);do{if(Cb[c[d>>2]&63](a,m)|0){o=h}else{o=h;while(1){o=o-8|0;if((a|0)==(o|0)){break}if(Cb[c[d>>2]&63](o,m)|0){j=66;break}}if((j|0)==66){j=0;s=a;n=c[s>>2]|0;q=c[s+4>>2]|0;r=o;t=c[r+4>>2]|0;c[s>>2]=c[r>>2];c[s+4>>2]=t;c[r>>2]=n;c[r+4>>2]=q;p=p+1|0;break}m=a+8|0;if(!(Cb[c[d>>2]&63](a,h)|0)){while(1){if((m|0)==(h|0)){j=83;break a}l=m+8|0;if(Cb[c[d>>2]&63](a,m)|0){break}else{m=l}}s=m;t=c[s>>2]|0;m=c[s+4>>2]|0;r=c[g+4>>2]|0;c[s>>2]=c[g>>2];c[s+4>>2]=r;c[g>>2]=t;c[g+4>>2]=m;m=l}if((m|0)==(h|0)){j=83;break a}else{l=h}while(1){while(1){n=m+8|0;if(Cb[c[d>>2]&63](a,m)|0){break}else{m=n}}do{l=l-8|0;}while(Cb[c[d>>2]&63](a,l)|0);if(!(m>>>0<l>>>0)){a=m;continue b}r=m;s=c[r>>2]|0;t=c[r+4>>2]|0;m=l;q=c[m+4>>2]|0;c[r>>2]=c[m>>2];c[r+4>>2]=q;c[m>>2]=s;c[m+4>>2]=t;m=n}}}while(0);n=a+8|0;c:do{if(n>>>0<o>>>0){while(1){r=n;while(1){n=r+8|0;if(Cb[c[d>>2]&63](r,m)|0){r=n}else{q=o;break}}do{q=q-8|0;}while(!(Cb[c[d>>2]&63](q,m)|0));if(r>>>0>q>>>0){n=r;break c}u=r;s=c[u>>2]|0;t=c[u+4>>2]|0;o=q;v=c[o+4>>2]|0;c[u>>2]=c[o>>2];c[u+4>>2]=v;c[o>>2]=s;c[o+4>>2]=t;o=q;p=p+1|0;m=(m|0)==(r|0)?q:m}}}while(0);do{if((n|0)!=(m|0)){if(!(Cb[c[d>>2]&63](m,n)|0)){break}s=n;t=c[s>>2]|0;u=c[s+4>>2]|0;v=m;r=c[v+4>>2]|0;c[s>>2]=c[v>>2];c[s+4>>2]=r;c[v>>2]=t;c[v+4>>2]=u;p=p+1|0}}while(0);if((p|0)==0){o=ol(a,n,d)|0;m=n+8|0;if(ol(m,b,d)|0){j=78;break}if(o){a=m;continue}}v=n;if((v-l|0)>=(k-v|0)){j=82;break}ml(a,n,d);a=n+8|0}if((j|0)==78){j=0;if(o){j=83;break}else{b=n;continue}}else if((j|0)==82){j=0;ml(n+8|0,b,d);b=n;continue}}if((j|0)==4){if(!(Cb[c[d>>2]&63](h,a)|0)){i=e;return}t=a;u=c[t>>2]|0;v=c[t+4>>2]|0;s=c[g+4>>2]|0;c[t>>2]=c[g>>2];c[t+4>>2]=s;c[g>>2]=u;c[g+4>>2]=v;i=e;return}else if((j|0)==6){f=a+8|0;v=Cb[c[d>>2]&63](f,a)|0;b=Cb[c[d>>2]&63](h,f)|0;if(!v){if(!b){i=e;return}b=f;u=c[b>>2]|0;v=c[b+4>>2]|0;t=c[g+4>>2]|0;c[b>>2]=c[g>>2];c[b+4>>2]=t;c[g>>2]=u;c[g+4>>2]=v;if(!(Cb[c[d>>2]&63](f,a)|0)){i=e;return}t=a;u=c[t>>2]|0;v=c[t+4>>2]|0;s=c[b+4>>2]|0;c[t>>2]=c[b>>2];c[t+4>>2]=s;c[b>>2]=u;c[b+4>>2]=v;i=e;return}k=c[a>>2]|0;j=c[a+4>>2]|0;if(b){v=c[g+4>>2]|0;c[a>>2]=c[g>>2];c[a+4>>2]=v;c[g>>2]=k;c[g+4>>2]=j;i=e;return}b=f;v=c[b+4>>2]|0;c[a>>2]=c[b>>2];c[a+4>>2]=v;c[b>>2]=k;c[b+4>>2]=j;if(!(Cb[c[d>>2]&63](h,f)|0)){i=e;return}u=c[b>>2]|0;v=c[b+4>>2]|0;t=c[g+4>>2]|0;c[b>>2]=c[g>>2];c[b+4>>2]=t;c[g>>2]=u;c[g+4>>2]=v;i=e;return}else if((j|0)==14){f=a+8|0;b=a+16|0;v=Cb[c[d>>2]&63](f,a)|0;m=Cb[c[d>>2]&63](b,f)|0;do{if(v){l=a;k=c[l>>2]|0;j=c[l+4>>2]|0;if(m){v=b;u=c[v+4>>2]|0;c[l>>2]=c[v>>2];c[l+4>>2]=u;c[v>>2]=k;c[v+4>>2]=j;break}m=f;v=c[m+4>>2]|0;c[l>>2]=c[m>>2];c[l+4>>2]=v;c[m>>2]=k;c[m+4>>2]=j;if(!(Cb[c[d>>2]&63](b,f)|0)){break}t=c[m>>2]|0;u=c[m+4>>2]|0;v=b;s=c[v+4>>2]|0;c[m>>2]=c[v>>2];c[m+4>>2]=s;c[v>>2]=t;c[v+4>>2]=u}else{if(!m){break}j=f;t=c[j>>2]|0;u=c[j+4>>2]|0;v=b;s=c[v+4>>2]|0;c[j>>2]=c[v>>2];c[j+4>>2]=s;c[v>>2]=t;c[v+4>>2]=u;if(!(Cb[c[d>>2]&63](f,a)|0)){break}t=a;u=c[t>>2]|0;v=c[t+4>>2]|0;s=c[j+4>>2]|0;c[t>>2]=c[j>>2];c[t+4>>2]=s;c[j>>2]=u;c[j+4>>2]=v}}while(0);if(!(Cb[c[d>>2]&63](h,b)|0)){i=e;return}h=b;u=c[h>>2]|0;v=c[h+4>>2]|0;t=c[g+4>>2]|0;c[h>>2]=c[g>>2];c[h+4>>2]=t;c[g>>2]=u;c[g+4>>2]=v;if(!(Cb[c[d>>2]&63](b,f)|0)){i=e;return}b=f;u=c[b>>2]|0;v=c[b+4>>2]|0;t=c[h+4>>2]|0;c[b>>2]=c[h>>2];c[b+4>>2]=t;c[h>>2]=u;c[h+4>>2]=v;if(!(Cb[c[d>>2]&63](f,a)|0)){i=e;return}t=a;u=c[t>>2]|0;v=c[t+4>>2]|0;s=c[b+4>>2]|0;c[t>>2]=c[b>>2];c[t+4>>2]=s;c[b>>2]=u;c[b+4>>2]=v;i=e;return}else if((j|0)==26){nl(a,a+8|0,a+16|0,a+24|0,h,d)|0;i=e;return}else if((j|0)==28){g=f;h=a+16|0;j=a+8|0;v=Cb[c[d>>2]&63](j,a)|0;n=Cb[c[d>>2]&63](h,j)|0;do{if(v){k=a;l=c[k>>2]|0;m=c[k+4>>2]|0;if(n){v=h;u=c[v+4>>2]|0;c[k>>2]=c[v>>2];c[k+4>>2]=u;c[v>>2]=l;c[v+4>>2]=m;break}n=j;v=c[n+4>>2]|0;c[k>>2]=c[n>>2];c[k+4>>2]=v;c[n>>2]=l;c[n+4>>2]=m;if(!(Cb[c[d>>2]&63](h,j)|0)){break}t=c[n>>2]|0;u=c[n+4>>2]|0;v=h;s=c[v+4>>2]|0;c[n>>2]=c[v>>2];c[n+4>>2]=s;c[v>>2]=t;c[v+4>>2]=u}else{if(!n){break}k=j;t=c[k>>2]|0;u=c[k+4>>2]|0;v=h;s=c[v+4>>2]|0;c[k>>2]=c[v>>2];c[k+4>>2]=s;c[v>>2]=t;c[v+4>>2]=u;if(!(Cb[c[d>>2]&63](j,a)|0)){break}t=a;u=c[t>>2]|0;v=c[t+4>>2]|0;s=c[k+4>>2]|0;c[t>>2]=c[k>>2];c[t+4>>2]=s;c[k>>2]=u;c[k+4>>2]=v}}while(0);j=a+24|0;if((j|0)==(b|0)){i=e;return}while(1){if(Cb[c[d>>2]&63](j,h)|0){v=j;m=c[v+4>>2]|0;c[f>>2]=c[v>>2];c[f+4>>2]=m;m=j;while(1){l=h;v=m;u=c[l+4>>2]|0;c[v>>2]=c[l>>2];c[v+4>>2]=u;if((h|0)==(a|0)){break}k=h-8|0;if(Cb[c[d>>2]&63](g,k)|0){m=h;h=k}else{break}}v=c[f+4>>2]|0;c[l>>2]=c[f>>2];c[l+4>>2]=v}k=j+8|0;if((k|0)==(b|0)){break}else{h=j;j=k}}i=e;return}else if((j|0)==83){i=e;return}}function nl(a,b,d,e,f,g){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,i=0,j=0,k=0,l=0,m=0;j=Cb[c[g>>2]&63](b,a)|0;k=Cb[c[g>>2]&63](d,b)|0;do{if(j){i=a;h=c[i>>2]|0;j=c[i+4>>2]|0;if(k){k=d;l=c[k+4>>2]|0;c[i>>2]=c[k>>2];c[i+4>>2]=l;c[k>>2]=h;c[k+4>>2]=j;h=1;break}k=b;l=c[k+4>>2]|0;c[i>>2]=c[k>>2];c[i+4>>2]=l;c[k>>2]=h;c[k+4>>2]=j;if(!(Cb[c[g>>2]&63](d,b)|0)){h=1;break}j=c[k>>2]|0;l=c[k+4>>2]|0;h=d;i=c[h+4>>2]|0;c[k>>2]=c[h>>2];c[k+4>>2]=i;c[h>>2]=j;c[h+4>>2]=l;h=2}else{if(!k){h=0;break}h=b;j=c[h>>2]|0;k=c[h+4>>2]|0;l=d;i=c[l+4>>2]|0;c[h>>2]=c[l>>2];c[h+4>>2]=i;c[l>>2]=j;c[l+4>>2]=k;if(!(Cb[c[g>>2]&63](b,a)|0)){h=1;break}j=a;k=c[j>>2]|0;l=c[j+4>>2]|0;i=c[h+4>>2]|0;c[j>>2]=c[h>>2];c[j+4>>2]=i;c[h>>2]=k;c[h+4>>2]=l;h=2}}while(0);do{if(Cb[c[g>>2]&63](e,d)|0){i=d;j=c[i>>2]|0;k=c[i+4>>2]|0;l=e;m=c[l+4>>2]|0;c[i>>2]=c[l>>2];c[i+4>>2]=m;c[l>>2]=j;c[l+4>>2]=k;if(!(Cb[c[g>>2]&63](d,b)|0)){h=h+1|0;break}j=b;l=c[j>>2]|0;m=c[j+4>>2]|0;k=c[i+4>>2]|0;c[j>>2]=c[i>>2];c[j+4>>2]=k;c[i>>2]=l;c[i+4>>2]=m;if(!(Cb[c[g>>2]&63](b,a)|0)){h=h+2|0;break}k=a;l=c[k>>2]|0;m=c[k+4>>2]|0;i=c[j+4>>2]|0;c[k>>2]=c[j>>2];c[k+4>>2]=i;c[j>>2]=l;c[j+4>>2]=m;h=h+3|0}}while(0);if(!(Cb[c[g>>2]&63](f,e)|0)){m=h;return m|0}i=e;k=c[i>>2]|0;l=c[i+4>>2]|0;m=f;j=c[m+4>>2]|0;c[i>>2]=c[m>>2];c[i+4>>2]=j;c[m>>2]=k;c[m+4>>2]=l;if(!(Cb[c[g>>2]&63](e,d)|0)){m=h+1|0;return m|0}f=d;l=c[f>>2]|0;m=c[f+4>>2]|0;k=c[i+4>>2]|0;c[f>>2]=c[i>>2];c[f+4>>2]=k;c[i>>2]=l;c[i+4>>2]=m;if(!(Cb[c[g>>2]&63](d,b)|0)){m=h+2|0;return m|0}d=b;l=c[d>>2]|0;m=c[d+4>>2]|0;k=c[f+4>>2]|0;c[d>>2]=c[f>>2];c[d+4>>2]=k;c[f>>2]=l;c[f+4>>2]=m;if(!(Cb[c[g>>2]&63](b,a)|0)){m=h+3|0;return m|0}k=a;l=c[k>>2]|0;m=c[k+4>>2]|0;j=c[d+4>>2]|0;c[k>>2]=c[d>>2];c[k+4>>2]=j;c[d>>2]=l;c[d+4>>2]=m;m=h+4|0;return m|0}function ol(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0;e=i;i=i+8|0;g=e|0;h=g;switch(b-a>>3|0){case 0:case 1:{o=1;i=e;return o|0};case 4:{f=a+8|0;g=a+16|0;b=b-8|0;o=Cb[c[d>>2]&63](f,a)|0;l=Cb[c[d>>2]&63](g,f)|0;do{if(o){k=a;j=c[k>>2]|0;h=c[k+4>>2]|0;if(l){o=g;n=c[o+4>>2]|0;c[k>>2]=c[o>>2];c[k+4>>2]=n;c[o>>2]=j;c[o+4>>2]=h;break}l=f;o=c[l+4>>2]|0;c[k>>2]=c[l>>2];c[k+4>>2]=o;c[l>>2]=j;c[l+4>>2]=h;if(!(Cb[c[d>>2]&63](g,f)|0)){break}m=c[l>>2]|0;n=c[l+4>>2]|0;o=g;k=c[o+4>>2]|0;c[l>>2]=c[o>>2];c[l+4>>2]=k;c[o>>2]=m;c[o+4>>2]=n}else{if(!l){break}h=f;m=c[h>>2]|0;n=c[h+4>>2]|0;o=g;l=c[o+4>>2]|0;c[h>>2]=c[o>>2];c[h+4>>2]=l;c[o>>2]=m;c[o+4>>2]=n;if(!(Cb[c[d>>2]&63](f,a)|0)){break}m=a;n=c[m>>2]|0;o=c[m+4>>2]|0;l=c[h+4>>2]|0;c[m>>2]=c[h>>2];c[m+4>>2]=l;c[h>>2]=n;c[h+4>>2]=o}}while(0);if(!(Cb[c[d>>2]&63](b,g)|0)){o=1;i=e;return o|0}h=g;m=c[h>>2]|0;n=c[h+4>>2]|0;o=b;l=c[o+4>>2]|0;c[h>>2]=c[o>>2];c[h+4>>2]=l;c[o>>2]=m;c[o+4>>2]=n;if(!(Cb[c[d>>2]&63](g,f)|0)){o=1;i=e;return o|0}b=f;n=c[b>>2]|0;o=c[b+4>>2]|0;m=c[h+4>>2]|0;c[b>>2]=c[h>>2];c[b+4>>2]=m;c[h>>2]=n;c[h+4>>2]=o;if(!(Cb[c[d>>2]&63](f,a)|0)){o=1;i=e;return o|0}m=a;n=c[m>>2]|0;o=c[m+4>>2]|0;l=c[b+4>>2]|0;c[m>>2]=c[b>>2];c[m+4>>2]=l;c[b>>2]=n;c[b+4>>2]=o;o=1;i=e;return o|0};case 3:{f=a+8|0;b=b-8|0;o=Cb[c[d>>2]&63](f,a)|0;j=Cb[c[d>>2]&63](b,f)|0;if(!o){if(!j){o=1;i=e;return o|0}g=f;m=c[g>>2]|0;n=c[g+4>>2]|0;o=b;l=c[o+4>>2]|0;c[g>>2]=c[o>>2];c[g+4>>2]=l;c[o>>2]=m;c[o+4>>2]=n;if(!(Cb[c[d>>2]&63](f,a)|0)){o=1;i=e;return o|0}m=a;n=c[m>>2]|0;o=c[m+4>>2]|0;l=c[g+4>>2]|0;c[m>>2]=c[g>>2];c[m+4>>2]=l;c[g>>2]=n;c[g+4>>2]=o;o=1;i=e;return o|0}g=c[a>>2]|0;h=c[a+4>>2]|0;if(j){o=b;n=c[o+4>>2]|0;c[a>>2]=c[o>>2];c[a+4>>2]=n;c[o>>2]=g;c[o+4>>2]=h;o=1;i=e;return o|0}j=f;o=c[j+4>>2]|0;c[a>>2]=c[j>>2];c[a+4>>2]=o;c[j>>2]=g;c[j+4>>2]=h;if(!(Cb[c[d>>2]&63](b,f)|0)){o=1;i=e;return o|0}m=c[j>>2]|0;n=c[j+4>>2]|0;o=b;l=c[o+4>>2]|0;c[j>>2]=c[o>>2];c[j+4>>2]=l;c[o>>2]=m;c[o+4>>2]=n;o=1;i=e;return o|0};case 2:{b=b-8|0;if(!(Cb[c[d>>2]&63](b,a)|0)){o=1;i=e;return o|0}l=a;m=c[l>>2]|0;n=c[l+4>>2]|0;o=b;k=c[o+4>>2]|0;c[l>>2]=c[o>>2];c[l+4>>2]=k;c[o>>2]=m;c[o+4>>2]=n;o=1;i=e;return o|0};case 5:{nl(a,a+8|0,a+16|0,a+24|0,b-8|0,d)|0;o=1;i=e;return o|0};default:{k=a+16|0;j=a+8|0;n=Cb[c[d>>2]&63](j,a)|0;o=Cb[c[d>>2]&63](k,j)|0;do{if(n){l=a;m=c[l>>2]|0;n=c[l+4>>2]|0;if(o){o=k;j=c[o+4>>2]|0;c[l>>2]=c[o>>2];c[l+4>>2]=j;c[o>>2]=m;c[o+4>>2]=n;break}o=j;p=c[o+4>>2]|0;c[l>>2]=c[o>>2];c[l+4>>2]=p;c[o>>2]=m;c[o+4>>2]=n;if(!(Cb[c[d>>2]&63](k,j)|0)){break}m=c[o>>2]|0;n=c[o+4>>2]|0;p=k;l=c[p+4>>2]|0;c[o>>2]=c[p>>2];c[o+4>>2]=l;c[p>>2]=m;c[p+4>>2]=n}else{if(!o){break}l=j;n=c[l>>2]|0;o=c[l+4>>2]|0;p=k;m=c[p+4>>2]|0;c[l>>2]=c[p>>2];c[l+4>>2]=m;c[p>>2]=n;c[p+4>>2]=o;if(!(Cb[c[d>>2]&63](j,a)|0)){break}n=a;o=c[n>>2]|0;p=c[n+4>>2]|0;m=c[l+4>>2]|0;c[n>>2]=c[l>>2];c[n+4>>2]=m;c[l>>2]=o;c[l+4>>2]=p}}while(0);j=a+24|0;if((j|0)==(b|0)){p=1;i=e;return p|0}else{l=k;k=0}while(1){if(Cb[c[d>>2]&63](j,l)|0){p=j;m=c[p+4>>2]|0;c[g>>2]=c[p>>2];c[g+4>>2]=m;m=j;while(1){n=l;p=m;o=c[n+4>>2]|0;c[p>>2]=c[n>>2];c[p+4>>2]=o;if((l|0)==(a|0)){break}o=l-8|0;if(Cb[c[d>>2]&63](h,o)|0){m=l;l=o}else{break}}p=c[g+4>>2]|0;c[n>>2]=c[g>>2];c[n+4>>2]=p;k=k+1|0;if((k|0)==8){break}}m=j+8|0;if((m|0)==(b|0)){d=1;f=41;break}else{l=j;j=m}}if((f|0)==41){i=e;return d|0}p=(j+8|0)==(b|0);i=e;return p|0}}return 0}function pl(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0;a:while(1){i=b;h=b-8|0;f=b-8+4|0;e=h;b:while(1){j=a;l=i-j|0;m=l>>3;switch(m|0){case 3:{g=6;break a};case 5:{g=15;break a};case 0:case 1:{g=70;break a};case 2:{g=4;break a};case 4:{g=14;break a};default:{}}if((l|0)<248){g=21;break a}n=(m|0)/2|0;k=a+(n<<3)|0;do{if((l|0)>7992){o=(m|0)/4|0;m=a+(o<<3)|0;p=o+n|0;q=a+(p<<3)|0;l=ql(a,m,k,q,0)|0;p=a+(p<<3)+4|0;if(!((c[f>>2]|0)>>>0<(c[p>>2]|0)>>>0)){m=l;o=a+(n<<3)+4|0;break}s=c[q>>2]|0;r=c[q+4>>2]|0;t=c[e+4>>2]|0;c[q>>2]=c[e>>2];c[q+4>>2]=t;c[e>>2]=s;c[e+4>>2]=r;n=a+(n<<3)+4|0;if(!((c[p>>2]|0)>>>0<(c[n>>2]|0)>>>0)){m=l+1|0;o=n;break}p=k;s=c[p>>2]|0;t=c[p+4>>2]|0;r=c[q+4>>2]|0;c[p>>2]=c[q>>2];c[p+4>>2]=r;c[q>>2]=s;c[q+4>>2]=t;o=a+(o<<3)+4|0;if(!((c[n>>2]|0)>>>0<(c[o>>2]|0)>>>0)){m=l+2|0;o=n;break}s=c[m>>2]|0;t=c[m+4>>2]|0;r=c[p+4>>2]|0;c[m>>2]=c[p>>2];c[m+4>>2]=r;c[p>>2]=s;c[p+4>>2]=t;if((c[o>>2]|0)>>>0<(c[a+4>>2]|0)>>>0){s=a;t=c[s>>2]|0;o=c[s+4>>2]|0;r=c[m+4>>2]|0;c[s>>2]=c[m>>2];c[s+4>>2]=r;c[m>>2]=t;c[m+4>>2]=o;m=l+4|0;o=n;break}else{m=l+3|0;o=n;break}}else{l=a+(n<<3)+4|0;t=c[l>>2]|0;m=a+4|0;o=(c[f>>2]|0)>>>0<t>>>0;if(!(t>>>0<(c[m>>2]|0)>>>0)){if(!o){m=0;o=l;break}n=k;s=c[n>>2]|0;t=c[n+4>>2]|0;r=c[e+4>>2]|0;c[n>>2]=c[e>>2];c[n+4>>2]=r;c[e>>2]=s;c[e+4>>2]=t;if(!((c[l>>2]|0)>>>0<(c[m>>2]|0)>>>0)){m=1;o=l;break}t=a;o=c[t>>2]|0;m=c[t+4>>2]|0;s=c[n+4>>2]|0;c[t>>2]=c[n>>2];c[t+4>>2]=s;c[n>>2]=o;c[n+4>>2]=m;m=2;o=l;break}p=a;n=c[p>>2]|0;m=c[p+4>>2]|0;if(o){o=c[e+4>>2]|0;c[p>>2]=c[e>>2];c[p+4>>2]=o;c[e>>2]=n;c[e+4>>2]=m;m=1;o=l;break}o=k;t=c[o+4>>2]|0;c[p>>2]=c[o>>2];c[p+4>>2]=t;c[o>>2]=n;c[o+4>>2]=m;if(!((c[f>>2]|0)>>>0<m>>>0)){m=1;o=l;break}t=c[e+4>>2]|0;c[o>>2]=c[e>>2];c[o+4>>2]=t;c[e>>2]=n;c[e+4>>2]=m;m=2;o=l}}while(0);l=a+4|0;n=c[l>>2]|0;o=c[o>>2]|0;do{if(n>>>0<o>>>0){n=h}else{p=h;while(1){q=p-8|0;if((a|0)==(q|0)){break}if((c[p-8+4>>2]|0)>>>0<o>>>0){g=53;break}else{p=q}}if((g|0)==53){g=0;r=a;s=c[r>>2]|0;t=c[r+4>>2]|0;n=q;p=c[n+4>>2]|0;c[r>>2]=c[n>>2];c[r+4>>2]=p;c[n>>2]=s;c[n+4>>2]=t;n=q;m=m+1|0;break}a=a+8|0;if(!(n>>>0<(c[f>>2]|0)>>>0)){while(1){if((a|0)==(h|0)){g=70;break a}j=a+8|0;if(n>>>0<(c[a+4>>2]|0)>>>0){break}else{a=j}}s=a;t=c[s>>2]|0;a=c[s+4>>2]|0;r=c[e+4>>2]|0;c[s>>2]=c[e>>2];c[s+4>>2]=r;c[e>>2]=t;c[e+4>>2]=a;a=j}if((a|0)==(h|0)){g=70;break a}else{m=h}while(1){j=c[l>>2]|0;while(1){k=a+8|0;if(j>>>0<(c[a+4>>2]|0)>>>0){break}else{a=k}}while(1){n=m-8|0;if(j>>>0<(c[m-8+4>>2]|0)>>>0){m=n}else{break}}if(!(a>>>0<n>>>0)){continue b}s=a;t=c[s>>2]|0;a=c[s+4>>2]|0;m=n;r=c[m+4>>2]|0;c[s>>2]=c[m>>2];c[s+4>>2]=r;c[m>>2]=t;c[m+4>>2]=a;m=n;a=k}}}while(0);l=a+8|0;c:do{if(l>>>0<n>>>0){while(1){o=c[k+4>>2]|0;q=l;while(1){l=q+8|0;if((c[q+4>>2]|0)>>>0<o>>>0){q=l}else{break}}while(1){p=n-8|0;if((c[n-8+4>>2]|0)>>>0<o>>>0){break}else{n=p}}if(q>>>0>p>>>0){l=q;break c}r=q;s=c[r>>2]|0;t=c[r+4>>2]|0;n=p;o=c[n+4>>2]|0;c[r>>2]=c[n>>2];c[r+4>>2]=o;c[n>>2]=s;c[n+4>>2]=t;n=p;m=m+1|0;k=(k|0)==(q|0)?p:k}}}while(0);do{if((l|0)!=(k|0)){if(!((c[k+4>>2]|0)>>>0<(c[l+4>>2]|0)>>>0)){break}q=l;r=c[q>>2]|0;s=c[q+4>>2]|0;t=k;p=c[t+4>>2]|0;c[q>>2]=c[t>>2];c[q+4>>2]=p;c[t>>2]=r;c[t+4>>2]=s;m=m+1|0}}while(0);if((m|0)==0){k=sl(a,l,0)|0;m=l+8|0;if(sl(m,b,0)|0){g=65;break}if(k){a=m;continue}}t=l;if((t-j|0)>=(i-t|0)){g=69;break}pl(a,l,d);a=l+8|0}if((g|0)==65){g=0;if(k){g=70;break}else{b=l;continue}}else if((g|0)==69){g=0;pl(l+8|0,b,d);b=l;continue}}if((g|0)==4){if(!((c[f>>2]|0)>>>0<(c[a+4>>2]|0)>>>0)){return}r=a;s=c[r>>2]|0;t=c[r+4>>2]|0;q=c[e+4>>2]|0;c[r>>2]=c[e>>2];c[r+4>>2]=q;c[e>>2]=s;c[e+4>>2]=t;return}else if((g|0)==6){d=a+8|0;h=a+12|0;t=c[h>>2]|0;i=a+4|0;g=(c[f>>2]|0)>>>0<t>>>0;if(!(t>>>0<(c[i>>2]|0)>>>0)){if(!g){return}s=c[d>>2]|0;t=c[d+4>>2]|0;r=c[e+4>>2]|0;c[d>>2]=c[e>>2];c[d+4>>2]=r;c[e>>2]=s;c[e+4>>2]=t;if(!((c[h>>2]|0)>>>0<(c[i>>2]|0)>>>0)){return}r=a;s=c[r>>2]|0;t=c[r+4>>2]|0;q=c[d+4>>2]|0;c[r>>2]=c[d>>2];c[r+4>>2]=q;c[d>>2]=s;c[d+4>>2]=t;return}i=c[a>>2]|0;h=c[a+4>>2]|0;if(g){t=c[e+4>>2]|0;c[a>>2]=c[e>>2];c[a+4>>2]=t;c[e>>2]=i;c[e+4>>2]=h;return}t=c[d+4>>2]|0;c[a>>2]=c[d>>2];c[a+4>>2]=t;c[d>>2]=i;c[d+4>>2]=h;if(!((c[f>>2]|0)>>>0<h>>>0)){return}t=c[e+4>>2]|0;c[d>>2]=c[e>>2];c[d+4>>2]=t;c[e>>2]=i;c[e+4>>2]=h;return}else if((g|0)==14){ql(a,a+8|0,a+16|0,h,0)|0;return}else if((g|0)==15){g=a+8|0;d=a+16|0;i=a+24|0;ql(a,g,d,i,0)|0;h=a+28|0;if(!((c[f>>2]|0)>>>0<(c[h>>2]|0)>>>0)){return}f=i;s=c[f>>2]|0;t=c[f+4>>2]|0;r=c[e+4>>2]|0;c[f>>2]=c[e>>2];c[f+4>>2]=r;c[e>>2]=s;c[e+4>>2]=t;if(!((c[h>>2]|0)>>>0<(c[a+20>>2]|0)>>>0)){return}s=c[d>>2]|0;t=c[d+4>>2]|0;h=c[f>>2]|0;e=c[f+4>>2]|0;c[d>>2]=h;c[d+4>>2]=e;c[f>>2]=s;c[f+4>>2]=t;f=e;if(!(f>>>0<(c[a+12>>2]|0)>>>0)){return}s=c[g>>2]|0;t=c[g+4>>2]|0;c[g>>2]=h;c[g+4>>2]=e;c[d>>2]=s;c[d+4>>2]=t;if(!(f>>>0<(c[a+4>>2]|0)>>>0)){return}r=a;s=c[r>>2]|0;t=c[r+4>>2]|0;c[r>>2]=h;c[r+4>>2]=e;c[g>>2]=s;c[g+4>>2]=t;return}else if((g|0)==21){rl(a,b,0);return}else if((g|0)==70){return}}function ql(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0;f=b+4|0;m=c[f>>2]|0;g=a+4|0;h=d+4|0;j=c[h>>2]|0;k=j>>>0<m>>>0;do{if(m>>>0<(c[g>>2]|0)>>>0){m=a;i=c[m>>2]|0;j=c[m+4>>2]|0;if(k){l=d;k=c[l+4>>2]|0;c[m>>2]=c[l>>2];c[m+4>>2]=k;c[l>>2]=i;c[l+4>>2]=j;i=1;break}l=b;k=c[l+4>>2]|0;c[m>>2]=c[l>>2];c[m+4>>2]=k;c[l>>2]=i;c[l+4>>2]=j;k=c[h>>2]|0;m=j;if(!(k>>>0<m>>>0)){i=1;j=k;break}k=d;n=c[k+4>>2]|0;c[l>>2]=c[k>>2];c[l+4>>2]=n;c[k>>2]=i;c[k+4>>2]=j;i=2;j=m}else{if(!k){i=0;break}i=b;m=c[i>>2]|0;j=c[i+4>>2]|0;n=d;l=c[n+4>>2]|0;c[i>>2]=c[n>>2];c[i+4>>2]=l;c[n>>2]=m;c[n+4>>2]=j;if(!((c[f>>2]|0)>>>0<(c[g>>2]|0)>>>0)){i=1;break}m=a;n=c[m>>2]|0;j=c[m+4>>2]|0;l=c[i+4>>2]|0;c[m>>2]=c[i>>2];c[m+4>>2]=l;c[i>>2]=n;c[i+4>>2]=j;i=2;j=c[h>>2]|0}}while(0);if(!((c[e+4>>2]|0)>>>0<j>>>0)){n=i;return n|0}l=c[d>>2]|0;m=c[d+4>>2]|0;n=e;k=c[n+4>>2]|0;c[d>>2]=c[n>>2];c[d+4>>2]=k;c[n>>2]=l;c[n+4>>2]=m;if(!((c[h>>2]|0)>>>0<(c[f>>2]|0)>>>0)){n=i+1|0;return n|0}m=c[b>>2]|0;n=c[b+4>>2]|0;l=c[d+4>>2]|0;c[b>>2]=c[d>>2];c[b+4>>2]=l;c[d>>2]=m;c[d+4>>2]=n;if(!((c[f>>2]|0)>>>0<(c[g>>2]|0)>>>0)){n=i+2|0;return n|0}l=a;m=c[l>>2]|0;n=c[l+4>>2]|0;k=c[b+4>>2]|0;c[l>>2]=c[b>>2];c[l+4>>2]=k;c[b>>2]=m;c[b+4>>2]=n;n=i+3|0;return n|0}function rl(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0;d=a+16|0;j=a+8|0;k=c[a+12>>2]|0;f=c[a+4>>2]|0;e=c[a+20>>2]|0;i=e>>>0<k>>>0;do{if(k>>>0<f>>>0){h=a;g=c[h>>2]|0;f=c[h+4>>2]|0;if(i){k=d;j=c[k+4>>2]|0;c[h>>2]=c[k>>2];c[h+4>>2]=j;c[k>>2]=g;c[k+4>>2]=f;break}k=c[j+4>>2]|0;c[h>>2]=c[j>>2];c[h+4>>2]=k;c[j>>2]=g;c[j+4>>2]=f;if(!(e>>>0<f>>>0)){break}k=d;i=c[k+4>>2]|0;c[j>>2]=c[k>>2];c[j+4>>2]=i;c[k>>2]=g;c[k+4>>2]=f}else{if(!i){break}h=c[j>>2]|0;i=c[j+4>>2]|0;k=d;g=c[k>>2]|0;e=c[k+4>>2]|0;c[j>>2]=g;c[j+4>>2]=e;c[k>>2]=h;c[k+4>>2]=i;if(!(e>>>0<f>>>0)){break}h=a;i=c[h>>2]|0;k=c[h+4>>2]|0;c[h>>2]=g;c[h+4>>2]=e;c[j>>2]=i;c[j+4>>2]=k}}while(0);e=a+24|0;if((e|0)==(b|0)){return}while(1){if((c[e+4>>2]|0)>>>0<(c[d+4>>2]|0)>>>0){g=e;i=c[g>>2]|0;g=c[g+4>>2]|0;h=g;f=h;k=e;while(1){j=d;l=c[j+4>>2]|0;c[k>>2]=c[j>>2];c[k+4>>2]=l;if((d|0)==(a|0)){break}if(f>>>0<(c[d-8+4>>2]|0)>>>0){k=d;d=d-8|0}else{break}}c[j>>2]=i|0;c[j+4>>2]=h|g&0}f=e+8|0;if((f|0)==(b|0)){break}else{d=e;e=f}}return}function sl(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0;switch(b-a>>3|0){case 5:{e=a+8|0;g=a+16|0;d=a+24|0;ql(a,e,g,d,0)|0;f=a+28|0;if(!((c[b-8+4>>2]|0)>>>0<(c[f>>2]|0)>>>0)){m=1;return m|0}k=c[d>>2]|0;l=c[d+4>>2]|0;m=b-8|0;j=c[m+4>>2]|0;c[d>>2]=c[m>>2];c[d+4>>2]=j;c[m>>2]=k;c[m+4>>2]=l;if(!((c[f>>2]|0)>>>0<(c[a+20>>2]|0)>>>0)){m=1;return m|0}l=c[g>>2]|0;m=c[g+4>>2]|0;b=c[d>>2]|0;f=c[d+4>>2]|0;c[g>>2]=b;c[g+4>>2]=f;c[d>>2]=l;c[d+4>>2]=m;d=f;if(!(d>>>0<(c[a+12>>2]|0)>>>0)){m=1;return m|0}l=c[e>>2]|0;m=c[e+4>>2]|0;c[e>>2]=b;c[e+4>>2]=f;c[g>>2]=l;c[g+4>>2]=m;if(!(d>>>0<(c[a+4>>2]|0)>>>0)){m=1;return m|0}k=a;l=c[k>>2]|0;m=c[k+4>>2]|0;c[k>>2]=b;c[k+4>>2]=f;c[e>>2]=l;c[e+4>>2]=m;m=1;return m|0};case 4:{ql(a,a+8|0,a+16|0,b-8|0,0)|0;m=1;return m|0};case 3:{d=a+8|0;e=b-8|0;h=a+12|0;m=c[h>>2]|0;g=a+4|0;b=b-8+4|0;f=(c[b>>2]|0)>>>0<m>>>0;if(!(m>>>0<(c[g>>2]|0)>>>0)){if(!f){m=1;return m|0}k=c[d>>2]|0;l=c[d+4>>2]|0;m=e;j=c[m+4>>2]|0;c[d>>2]=c[m>>2];c[d+4>>2]=j;c[m>>2]=k;c[m+4>>2]=l;if(!((c[h>>2]|0)>>>0<(c[g>>2]|0)>>>0)){m=1;return m|0}k=a;l=c[k>>2]|0;m=c[k+4>>2]|0;j=c[d+4>>2]|0;c[k>>2]=c[d>>2];c[k+4>>2]=j;c[d>>2]=l;c[d+4>>2]=m;m=1;return m|0}g=c[a>>2]|0;h=c[a+4>>2]|0;if(f){m=e;l=c[m+4>>2]|0;c[a>>2]=c[m>>2];c[a+4>>2]=l;c[m>>2]=g;c[m+4>>2]=h;m=1;return m|0}m=c[d+4>>2]|0;c[a>>2]=c[d>>2];c[a+4>>2]=m;c[d>>2]=g;c[d+4>>2]=h;if(!((c[b>>2]|0)>>>0<h>>>0)){m=1;return m|0}m=e;l=c[m+4>>2]|0;c[d>>2]=c[m>>2];c[d+4>>2]=l;c[m>>2]=g;c[m+4>>2]=h;m=1;return m|0};case 2:{if(!((c[b-8+4>>2]|0)>>>0<(c[a+4>>2]|0)>>>0)){m=1;return m|0}j=a;k=c[j>>2]|0;l=c[j+4>>2]|0;m=b-8|0;i=c[m+4>>2]|0;c[j>>2]=c[m>>2];c[j+4>>2]=i;c[m>>2]=k;c[m+4>>2]=l;m=1;return m|0};case 0:case 1:{m=1;return m|0};default:{f=a+16|0;i=a+8|0;m=c[a+12>>2]|0;g=c[a+4>>2]|0;d=c[a+20>>2]|0;h=d>>>0<m>>>0;do{if(m>>>0<g>>>0){j=a;g=c[j>>2]|0;k=c[j+4>>2]|0;if(h){m=f;l=c[m+4>>2]|0;c[j>>2]=c[m>>2];c[j+4>>2]=l;c[m>>2]=g;c[m+4>>2]=k;break}m=c[i+4>>2]|0;c[j>>2]=c[i>>2];c[j+4>>2]=m;c[i>>2]=g;c[i+4>>2]=k;if(!(d>>>0<k>>>0)){break}m=f;l=c[m+4>>2]|0;c[i>>2]=c[m>>2];c[i+4>>2]=l;c[m>>2]=g;c[m+4>>2]=k}else{if(!h){break}k=c[i>>2]|0;l=c[i+4>>2]|0;m=f;d=c[m>>2]|0;h=c[m+4>>2]|0;c[i>>2]=d;c[i+4>>2]=h;c[m>>2]=k;c[m+4>>2]=l;if(!(h>>>0<g>>>0)){break}k=a;l=c[k>>2]|0;m=c[k+4>>2]|0;c[k>>2]=d;c[k+4>>2]=h;c[i>>2]=l;c[i+4>>2]=m}}while(0);d=a+24|0;if((d|0)==(b|0)){m=1;return m|0}else{g=0}while(1){if((c[d+4>>2]|0)>>>0<(c[f+4>>2]|0)>>>0){k=d;i=c[k>>2]|0;k=c[k+4>>2]|0;j=k;h=j;m=d;while(1){l=f;n=c[l+4>>2]|0;c[m>>2]=c[l>>2];c[m+4>>2]=n;if((f|0)==(a|0)){break}if(h>>>0<(c[f-8+4>>2]|0)>>>0){m=f;f=f-8|0}else{break}}c[l>>2]=i|0;c[l+4>>2]=j|k&0;g=g+1|0;if((g|0)==8){break}}h=d+8|0;if((h|0)==(b|0)){a=1;e=34;break}else{f=d;d=h}}if((e|0)==34){return a|0}n=(d+8|0)==(b|0);return n|0}}return 0}function tl(a,b,d,e,f,g){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0;h=i;i=i+128|0;j=h|0;k=h+64|0;if((e|0)==0|(e|0)==1){i=h;return}else if((e|0)==2){j=b-60|0;if(!(Cb[c[d>>2]&63](j,a)|0)){i=h;return}l=k;g=a;fn(l|0,g|0,60)|0;k=j;fn(g|0,k|0,60)|0;fn(k|0,l|0,60)|0;i=h;return}else{if((e|0)<129){f=j;if((a|0)==(b|0)){i=h;return}e=a+60|0;if((e|0)==(b|0)){i=h;return}do{fn(f|0,e|0,60)|0;a:do{if((e|0)==(a|0)){k=a}else{k=e;while(1){g=k-60|0;if(!(Cb[c[d>>2]&63](j,g)|0)){break a}fn(k|0,g|0,60)|0;if((g|0)==(a|0)){k=a;break}else{k=g}}}}while(0);fn(k|0,f|0,60)|0;e=e+60|0;}while((e|0)!=(b|0));i=h;return}l=(e|0)/2|0;k=a+(l*60|0)|0;if((e|0)>(g|0)){tl(a,k,d,l,f,g);e=e-l|0;tl(k,b,d,e,f,g);vl(a,k,b,d,l,e,f,g);i=h;return}ul(a,k,d,l,f);j=f+(l*60|0)|0;ul(k,b,d,e-l|0,j);b=f+(e*60|0)|0;b:do{if(!((e+1|0)>>>0<3>>>0)){e=j;while(1){if((e|0)==(b|0)){break}g=a;if(Cb[c[d>>2]&63](e,f)|0){fn(g|0,e|0,60)|0;e=e+60|0}else{fn(g|0,f|0,60)|0;f=f+60|0}a=a+60|0;if((f|0)==(j|0)){j=e;break b}}if((f|0)==(j|0)){i=h;return}while(1){fn(a|0,f|0,60)|0;f=f+60|0;if((f|0)==(j|0)){break}else{a=a+60|0}}i=h;return}}while(0);if((j|0)==(b|0)){i=h;return}while(1){fn(a|0,j|0,60)|0;j=j+60|0;if((j|0)==(b|0)){break}else{a=a+60|0}}i=h;return}}function ul(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0;if((e|0)==0){return}else if((e|0)==2){b=b-60|0;g=(f|0)==0;if(Cb[c[d>>2]&63](b,a)|0){if(!g){fn(f|0,b|0,60)|0}b=f+60|0;if((b|0)==0){return}fn(b|0,a|0,60)|0;return}else{if(!g){fn(f|0,a|0,60)|0}d=f+60|0;if((d|0)==0){return}fn(d|0,b|0,60)|0;return}}else if((e|0)==1){if((f|0)==0){return}fn(f|0,a|0,60)|0;return}else{if((e|0)<9){if((a|0)==(b|0)){return}if((f|0)==0){e=0}else{fn(f|0,a|0,60)|0;e=f}g=a+60|0;if((g|0)==(b|0)){return}while(1){a=e+60|0;h=(a|0)==0;do{if(Cb[c[d>>2]&63](g,e)|0){if(!h){fn(a|0,e|0,60)|0}a:do{if((e|0)==(f|0)){e=f}else{while(1){h=e-60|0;if(!(Cb[c[d>>2]&63](g,h)|0)){break a}fn(e|0,h|0,60)|0;if((h|0)==(f|0)){e=f;break}else{e=h}}}}while(0);fn(e|0,g|0,60)|0}else{if(h){a=0;break}fn(a|0,g|0,60)|0}}while(0);g=g+60|0;if((g|0)==(b|0)){break}else{e=a}}return}i=(e|0)/2|0;g=a+(i*60|0)|0;tl(a,g,d,i,f,i);h=e-i|0;tl(g,b,d,h,f+(i*60|0)|0,h);b:do{if(!((e+1|0)>>>0<3>>>0)){e=g;while(1){if((e|0)==(b|0)){break}h=(f|0)==0;if(Cb[c[d>>2]&63](e,a)|0){if(!h){fn(f|0,e|0,60)|0}e=e+60|0}else{if(!h){fn(f|0,a|0,60)|0}a=a+60|0}f=f+60|0;if((a|0)==(g|0)){g=e;break b}}if((a|0)==(g|0)){return}while(1){if((f|0)!=0){fn(f|0,a|0,60)|0}a=a+60|0;if((a|0)==(g|0)){break}else{f=f+60|0}}return}}while(0);if((g|0)==(b|0)){return}while(1){if((f|0)!=0){fn(f|0,g|0,60)|0}g=g+60|0;if((g|0)==(b|0)){break}else{f=f+60|0}}return}}function vl(a,b,d,e,f,g,h,j){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0;k=i;i=i+320|0;l=k+256|0;if((g|0)==0){i=k;return}m=k|0;p=k+64|0;n=k+192|0;o=k+128|0;a:while(1){q=d;while(1){if((f|0)==0){m=45;break a}else{u=f}while(1){if(Cb[c[e>>2]&63](b,a)|0){break}u=u-1|0;if((u|0)==0){m=45;break a}else{a=a+60|0}}if(!((u|0)>(j|0)&(g|0)>(j|0))){m=8;break a}if((u|0)<(g|0)){r=(g|0)/2|0;s=b+(r*60|0)|0;f=a;t=a;v=(b-f|0)/60|0;b:while(1){while(1){if((v|0)==0){break b}w=(v|0)/2|0;if(Cb[c[e>>2]&63](s,t+(w*60|0)|0)|0){v=w}else{break}}t=t+((w+1|0)*60|0)|0;v=v-1-w|0}f=(t-f|0)/60|0}else{if((u|0)==1){m=17;break a}f=(u|0)/2|0;t=a+(f*60|0)|0;r=b;s=b;w=(q-r|0)/60|0;c:while(1){while(1){if((w|0)==0){break c}v=(w|0)/2|0;if(Cb[c[e>>2]&63](s+(v*60|0)|0,t)|0){break}else{w=v}}s=s+((v+1|0)*60|0)|0;w=w-1-v|0}r=(s-r|0)/60|0}u=u-f|0;v=g-r|0;d:do{if((t|0)==(b|0)){w=s}else{if((b|0)==(s|0)){w=t;break}if((t+60|0)==(b|0)){D=t;fn(m|0,D|0,60)|0;w=s-b|0;gn(D|0,b|0,w|0)|0;w=t+(((w|0)/60|0)*60|0)|0;fn(w|0,m|0,60)|0;break}if((b+60|0)==(s|0)){C=s-60|0;fn(p|0,C|0,60)|0;C=C-t|0;w=s+(((C|0)/-60|0)*60|0)|0;D=t;gn(w|0,D|0,C|0)|0;fn(D|0,p|0,60)|0;break}x=b;w=(x-t|0)/60|0;y=s;x=(y-x|0)/60|0;if((w|0)==(x|0)){x=t;w=b;while(1){C=x;fn(o|0,C|0,60)|0;D=w;fn(C|0,D|0,60)|0;fn(D|0,o|0,60)|0;x=x+60|0;if((x|0)==(b|0)){w=b;break d}else{w=w+60|0}}}else{A=w;z=x}while(1){b=(A|0)%(z|0)|0;if((b|0)==0){break}else{A=z;z=b}}if((z|0)!=0){b=w-1|0;A=t+(z*60|0)|0;while(1){z=A-60|0;fn(n|0,z|0,60)|0;B=A+(b*60|0)|0;C=z;while(1){A=B;fn(C|0,A|0,60)|0;C=(y-B|0)/60|0;if((w|0)<(C|0)){D=B+(w*60|0)|0}else{D=t+((w-C|0)*60|0)|0}if((D|0)==(z|0)){break}else{C=B;B=D}}fn(A|0,n|0,60)|0;if((z|0)==(t|0)){break}else{A=z}}}w=t+(x*60|0)|0}}while(0);if((r+f|0)>=(v+u|0)){break}vl(a,t,w,e,f,r,h,j);if((g|0)==(r|0)){m=45;break a}else{g=v;f=u;b=s;a=w}}vl(w,s,d,e,u,v,h,j);if((r|0)==0){m=45;break}else{g=r;d=w;b=t}}if((m|0)==8){wl(a,b,d,e,u,g,h);i=k;return}else if((m|0)==17){D=l;B=a;fn(D|0,B|0,60)|0;C=b;fn(B|0,C|0,60)|0;fn(C|0,D|0,60)|0;i=k;return}else if((m|0)==45){i=k;return}}function wl(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0;j=i;t=a;w=b;p=i;i=i+8|0;o=p;u=i;i=i+8|0;s=u;v=i;i=i+8|0;q=v;k=i;i=i+8|0;r=k;l=i;i=i+8|0;m=i;i=i+4|0;i=i+7&-8;n=i;i=i+8|0;if((f|0)>(g|0)){if((b|0)==(d|0)){b=h}else{g=(((d-60+(-w|0)|0)>>>0)/60|0)+1|0;a=h;while(1){if((a|0)!=0){fn(a|0,b|0,60)|0}b=b+60|0;if((b|0)==(d|0)){break}else{a=a+60|0}}b=h+(g*60|0)|0}f=w;c[p>>2]=f;c[p+4>>2]=f;f=t;c[u>>2]=f;c[u+4>>2]=f;f=b;c[v>>2]=f;c[v+4>>2]=f;f=h;c[k>>2]=f;c[k+4>>2]=f;c[l>>2]=d;c[l+4>>2]=d;c[m>>2]=e;xl(n,o,s,q,r,l,m);i=j;return}a:do{if((a|0)!=(b|0)){l=(((b-60+(-t|0)|0)>>>0)/60|0)+1|0;m=a;k=h;while(1){if((k|0)!=0){fn(k|0,m|0,60)|0}m=m+60|0;if((m|0)==(b|0)){break}else{k=k+60|0}}k=h+(l*60|0)|0;if((k|0)==(h|0)){break}while(1){if((b|0)==(d|0)){break}l=a;if(Cb[c[e>>2]&63](b,h)|0){fn(l|0,b|0,60)|0;b=b+60|0}else{fn(l|0,h|0,60)|0;h=h+60|0}a=a+60|0;if((h|0)==(k|0)){break a}}gn(a|0,h|0,k-h|0)|0;i=j;return}}while(0);gn(a|0,b|0,d-b|0)|0;i=j;return}function xl(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0;j=i;l=b;b=i;i=i+8|0;c[b>>2]=c[l>>2];c[b+4>>2]=c[l+4>>2];l=d;d=i;i=i+8|0;c[d>>2]=c[l>>2];c[d+4>>2]=c[l+4>>2];l=e;e=i;i=i+8|0;c[e>>2]=c[l>>2];c[e+4>>2]=c[l+4>>2];l=f;q=i;i=i+8|0;c[q>>2]=c[l>>2];c[q+4>>2]=c[l+4>>2];l=g;g=i;i=i+8|0;c[g>>2]=c[l>>2];c[g+4>>2]=c[l+4>>2];l=h;h=i;i=i+4|0;i=i+7&-8;c[h>>2]=c[l>>2];l=b;r=c[l+4>>2]|0;f=c[d+4>>2]|0;d=f;m=e;s=c[m+4>>2]|0;a:do{if((r|0)==(d|0)){q=c[q+4>>2]|0}else{k=e+4|0;e=e|0;n=b+4|0;b=b|0;o=c[h>>2]|0;p=g+4|0;h=g|0;q=c[q+4>>2]|0;while(1){if((s|0)==(q|0)){break}r=(c[k>>2]|0)-60|0;c[e>>2]=r;s=(c[n>>2]|0)-60|0;c[b>>2]=s;u=Cb[c[o>>2]&63](r,s)|0;t=(c[p>>2]|0)-60|0;c[h>>2]=t;if(u){c[b>>2]=s;fn(t|0,s|0,60)|0;c[n>>2]=s}else{c[e>>2]=r;fn(t|0,r|0,60)|0;c[k>>2]=r}c[p>>2]=t;r=c[l+4>>2]|0;s=c[m+4>>2]|0;if((r|0)==(d|0)){break a}}k=c[g+4>>2]|0;if((r|0)==(d|0)){d=c[g>>2]|0}else{f=((r-60+(-f|0)|0)>>>0)/60|0;g=k;do{g=g-60|0;r=r-60|0;fn(g|0,r|0,60)|0;}while((r|0)!=(d|0));k=k+(~f*60|0)|0;d=k}u=a;c[u>>2]=d;c[u+4>>2]=k;i=j;return}}while(0);d=c[g+4>>2]|0;f=q;if((s|0)==(f|0)){g=c[g>>2]|0}else{g=((s-60+(-q|0)|0)>>>0)/60|0;k=d;do{k=k-60|0;s=s-60|0;fn(k|0,s|0,60)|0;}while((s|0)!=(f|0));d=d+(~g*60|0)|0;g=d}u=a;c[u>>2]=g;c[u+4>>2]=d;i=j;return}function yl(a,b,d,e,f,g){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0;h=i;i=i+48|0;j=h|0;k=h+24|0;if((e|0)==0|(e|0)==1){i=h;return}else if((e|0)==2){j=b-20|0;if(!(Cb[c[d>>2]&63](j,a)|0)){i=h;return}g=a;c[k>>2]=c[g>>2];c[k+4>>2]=c[g+4>>2];c[k+8>>2]=c[g+8>>2];c[k+12>>2]=c[g+12>>2];c[k+16>>2]=c[g+16>>2];l=j;c[g>>2]=c[l>>2];c[g+4>>2]=c[l+4>>2];c[g+8>>2]=c[l+8>>2];c[g+12>>2]=c[l+12>>2];c[g+16>>2]=c[l+16>>2];c[l>>2]=c[k>>2];c[l+4>>2]=c[k+4>>2];c[l+8>>2]=c[k+8>>2];c[l+12>>2]=c[k+12>>2];c[l+16>>2]=c[k+16>>2];i=h;return}else{if((e|0)<129){f=j;if((a|0)==(b|0)){i=h;return}e=a+20|0;if((e|0)==(b|0)){i=h;return}do{l=e;c[f>>2]=c[l>>2];c[f+4>>2]=c[l+4>>2];c[f+8>>2]=c[l+8>>2];c[f+12>>2]=c[l+12>>2];c[f+16>>2]=c[l+16>>2];a:do{if((e|0)==(a|0)){k=a}else{k=e;while(1){g=k-20|0;if(!(Cb[c[d>>2]&63](j,g)|0)){break a}l=k;k=g;c[l>>2]=c[k>>2];c[l+4>>2]=c[k+4>>2];c[l+8>>2]=c[k+8>>2];c[l+12>>2]=c[k+12>>2];c[l+16>>2]=c[k+16>>2];if((g|0)==(a|0)){k=a;break}else{k=g}}}}while(0);l=k;c[l>>2]=c[f>>2];c[l+4>>2]=c[f+4>>2];c[l+8>>2]=c[f+8>>2];c[l+12>>2]=c[f+12>>2];c[l+16>>2]=c[f+16>>2];e=e+20|0;}while((e|0)!=(b|0));i=h;return}l=(e|0)/2|0;k=a+(l*20|0)|0;if((e|0)>(g|0)){yl(a,k,d,l,f,g);e=e-l|0;yl(k,b,d,e,f,g);Al(a,k,b,d,l,e,f,g);i=h;return}zl(a,k,d,l,f);j=f+(l*20|0)|0;zl(k,b,d,e-l|0,j);b=f+(e*20|0)|0;b:do{if(!((e+1|0)>>>0<3>>>0)){e=j;while(1){if((e|0)==(b|0)){break}g=a;if(Cb[c[d>>2]&63](e,f)|0){l=e;c[g>>2]=c[l>>2];c[g+4>>2]=c[l+4>>2];c[g+8>>2]=c[l+8>>2];c[g+12>>2]=c[l+12>>2];c[g+16>>2]=c[l+16>>2];e=e+20|0}else{l=f;c[g>>2]=c[l>>2];c[g+4>>2]=c[l+4>>2];c[g+8>>2]=c[l+8>>2];c[g+12>>2]=c[l+12>>2];c[g+16>>2]=c[l+16>>2];f=f+20|0}a=a+20|0;if((f|0)==(j|0)){j=e;break b}}if((f|0)==(j|0)){i=h;return}while(1){l=a;k=f;c[l>>2]=c[k>>2];c[l+4>>2]=c[k+4>>2];c[l+8>>2]=c[k+8>>2];c[l+12>>2]=c[k+12>>2];c[l+16>>2]=c[k+16>>2];f=f+20|0;if((f|0)==(j|0)){break}else{a=a+20|0}}i=h;return}}while(0);if((j|0)==(b|0)){i=h;return}while(1){l=a;k=j;c[l>>2]=c[k>>2];c[l+4>>2]=c[k+4>>2];c[l+8>>2]=c[k+8>>2];c[l+12>>2]=c[k+12>>2];c[l+16>>2]=c[k+16>>2];j=j+20|0;if((j|0)==(b|0)){break}else{a=a+20|0}}i=h;return}}function zl(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0;if((e|0)==2){b=b-20|0;g=(f|0)==0;if(Cb[c[d>>2]&63](b,a)|0){if(!g){h=f;e=b;c[h>>2]=c[e>>2];c[h+4>>2]=c[e+4>>2];c[h+8>>2]=c[e+8>>2];c[h+12>>2]=c[e+12>>2];c[h+16>>2]=c[e+16>>2]}b=f+20|0;if((b|0)==0){return}h=b;e=a;c[h>>2]=c[e>>2];c[h+4>>2]=c[e+4>>2];c[h+8>>2]=c[e+8>>2];c[h+12>>2]=c[e+12>>2];c[h+16>>2]=c[e+16>>2];return}else{if(!g){h=f;e=a;c[h>>2]=c[e>>2];c[h+4>>2]=c[e+4>>2];c[h+8>>2]=c[e+8>>2];c[h+12>>2]=c[e+12>>2];c[h+16>>2]=c[e+16>>2]}d=f+20|0;if((d|0)==0){return}h=d;e=b;c[h>>2]=c[e>>2];c[h+4>>2]=c[e+4>>2];c[h+8>>2]=c[e+8>>2];c[h+12>>2]=c[e+12>>2];c[h+16>>2]=c[e+16>>2];return}}else if((e|0)==1){if((f|0)==0){return}h=f;e=a;c[h>>2]=c[e>>2];c[h+4>>2]=c[e+4>>2];c[h+8>>2]=c[e+8>>2];c[h+12>>2]=c[e+12>>2];c[h+16>>2]=c[e+16>>2];return}else if((e|0)==0){return}else{if((e|0)<9){if((a|0)==(b|0)){return}if((f|0)==0){e=0}else{e=f;h=a;c[e>>2]=c[h>>2];c[e+4>>2]=c[h+4>>2];c[e+8>>2]=c[h+8>>2];c[e+12>>2]=c[h+12>>2];c[e+16>>2]=c[h+16>>2];e=f}g=a+20|0;if((g|0)==(b|0)){return}while(1){a=e+20|0;h=(a|0)==0;do{if(Cb[c[d>>2]&63](g,e)|0){if(!h){h=a;i=e;c[h>>2]=c[i>>2];c[h+4>>2]=c[i+4>>2];c[h+8>>2]=c[i+8>>2];c[h+12>>2]=c[i+12>>2];c[h+16>>2]=c[i+16>>2]}a:do{if((e|0)==(f|0)){e=f}else{while(1){h=e-20|0;if(!(Cb[c[d>>2]&63](g,h)|0)){break a}i=e;e=h;c[i>>2]=c[e>>2];c[i+4>>2]=c[e+4>>2];c[i+8>>2]=c[e+8>>2];c[i+12>>2]=c[e+12>>2];c[i+16>>2]=c[e+16>>2];if((h|0)==(f|0)){e=f;break}else{e=h}}}}while(0);i=e;h=g;c[i>>2]=c[h>>2];c[i+4>>2]=c[h+4>>2];c[i+8>>2]=c[h+8>>2];c[i+12>>2]=c[h+12>>2];c[i+16>>2]=c[h+16>>2]}else{if(h){a=0;break}i=a;h=g;c[i>>2]=c[h>>2];c[i+4>>2]=c[h+4>>2];c[i+8>>2]=c[h+8>>2];c[i+12>>2]=c[h+12>>2];c[i+16>>2]=c[h+16>>2]}}while(0);g=g+20|0;if((g|0)==(b|0)){break}else{e=a}}return}h=(e|0)/2|0;g=a+(h*20|0)|0;yl(a,g,d,h,f,h);i=e-h|0;yl(g,b,d,i,f+(h*20|0)|0,i);b:do{if(!((e+1|0)>>>0<3>>>0)){e=g;while(1){if((e|0)==(b|0)){break}h=(f|0)==0;if(Cb[c[d>>2]&63](e,a)|0){if(!h){i=f;h=e;c[i>>2]=c[h>>2];c[i+4>>2]=c[h+4>>2];c[i+8>>2]=c[h+8>>2];c[i+12>>2]=c[h+12>>2];c[i+16>>2]=c[h+16>>2]}e=e+20|0}else{if(!h){i=f;h=a;c[i>>2]=c[h>>2];c[i+4>>2]=c[h+4>>2];c[i+8>>2]=c[h+8>>2];c[i+12>>2]=c[h+12>>2];c[i+16>>2]=c[h+16>>2]}a=a+20|0}f=f+20|0;if((a|0)==(g|0)){g=e;break b}}if((a|0)==(g|0)){return}while(1){if((f|0)!=0){i=f;h=a;c[i>>2]=c[h>>2];c[i+4>>2]=c[h+4>>2];c[i+8>>2]=c[h+8>>2];c[i+12>>2]=c[h+12>>2];c[i+16>>2]=c[h+16>>2]}a=a+20|0;if((a|0)==(g|0)){break}else{f=f+20|0}}return}}while(0);if((g|0)==(b|0)){return}while(1){if((f|0)!=0){i=f;h=g;c[i>>2]=c[h>>2];c[i+4>>2]=c[h+4>>2];c[i+8>>2]=c[h+8>>2];c[i+12>>2]=c[h+12>>2];c[i+16>>2]=c[h+16>>2]}g=g+20|0;if((g|0)==(b|0)){break}else{f=f+20|0}}return}}function Al(a,b,d,e,f,g,h,j){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0;k=i;i=i+120|0;l=k+96|0;if((g|0)==0){i=k;return}m=k|0;p=k+24|0;n=k+72|0;o=k+48|0;a:while(1){q=d;while(1){if((f|0)==0){m=45;break a}else{u=f}while(1){if(Cb[c[e>>2]&63](b,a)|0){break}u=u-1|0;if((u|0)==0){m=45;break a}else{a=a+20|0}}if(!((u|0)>(j|0)&(g|0)>(j|0))){m=8;break a}if((u|0)<(g|0)){r=(g|0)/2|0;s=b+(r*20|0)|0;f=a;t=a;v=(b-f|0)/20|0;b:while(1){while(1){if((v|0)==0){break b}w=(v|0)/2|0;if(Cb[c[e>>2]&63](s,t+(w*20|0)|0)|0){v=w}else{break}}t=t+((w+1|0)*20|0)|0;v=v-1-w|0}f=(t-f|0)/20|0}else{if((u|0)==1){m=17;break a}f=(u|0)/2|0;t=a+(f*20|0)|0;r=b;s=b;w=(q-r|0)/20|0;c:while(1){while(1){if((w|0)==0){break c}v=(w|0)/2|0;if(Cb[c[e>>2]&63](s+(v*20|0)|0,t)|0){break}else{w=v}}s=s+((v+1|0)*20|0)|0;w=w-1-v|0}r=(s-r|0)/20|0}u=u-f|0;v=g-r|0;d:do{if((t|0)==(b|0)){w=s}else{if((b|0)==(s|0)){w=t;break}if((t+20|0)==(b|0)){C=t;c[m>>2]=c[C>>2];c[m+4>>2]=c[C+4>>2];c[m+8>>2]=c[C+8>>2];c[m+12>>2]=c[C+12>>2];c[m+16>>2]=c[C+16>>2];w=s-b|0;gn(C|0,b|0,w|0)|0;w=t+(((w|0)/20|0)*20|0)|0;C=w;c[C>>2]=c[m>>2];c[C+4>>2]=c[m+4>>2];c[C+8>>2]=c[m+8>>2];c[C+12>>2]=c[m+12>>2];c[C+16>>2]=c[m+16>>2];break}if((b+20|0)==(s|0)){B=s-20|0;w=B;c[p>>2]=c[w>>2];c[p+4>>2]=c[w+4>>2];c[p+8>>2]=c[w+8>>2];c[p+12>>2]=c[w+12>>2];c[p+16>>2]=c[w+16>>2];B=B-t|0;w=s+(((B|0)/-20|0)*20|0)|0;C=t;gn(w|0,C|0,B|0)|0;c[C>>2]=c[p>>2];c[C+4>>2]=c[p+4>>2];c[C+8>>2]=c[p+8>>2];c[C+12>>2]=c[p+12>>2];c[C+16>>2]=c[p+16>>2];break}x=b;w=(x-t|0)/20|0;y=s;x=(y-x|0)/20|0;if((w|0)==(x|0)){x=t;w=b;while(1){B=x;c[o>>2]=c[B>>2];c[o+4>>2]=c[B+4>>2];c[o+8>>2]=c[B+8>>2];c[o+12>>2]=c[B+12>>2];c[o+16>>2]=c[B+16>>2];C=w;c[B>>2]=c[C>>2];c[B+4>>2]=c[C+4>>2];c[B+8>>2]=c[C+8>>2];c[B+12>>2]=c[C+12>>2];c[B+16>>2]=c[C+16>>2];c[C>>2]=c[o>>2];c[C+4>>2]=c[o+4>>2];c[C+8>>2]=c[o+8>>2];c[C+12>>2]=c[o+12>>2];c[C+16>>2]=c[o+16>>2];x=x+20|0;if((x|0)==(b|0)){w=b;break d}else{w=w+20|0}}}else{A=w;z=x}while(1){b=(A|0)%(z|0)|0;if((b|0)==0){break}else{A=z;z=b}}if((z|0)!=0){b=w-1|0;A=t+(z*20|0)|0;while(1){z=A-20|0;B=z;c[n>>2]=c[B>>2];c[n+4>>2]=c[B+4>>2];c[n+8>>2]=c[B+8>>2];c[n+12>>2]=c[B+12>>2];c[n+16>>2]=c[B+16>>2];A=A+(b*20|0)|0;B=z;while(1){C=B;B=A;c[C>>2]=c[B>>2];c[C+4>>2]=c[B+4>>2];c[C+8>>2]=c[B+8>>2];c[C+12>>2]=c[B+12>>2];c[C+16>>2]=c[B+16>>2];C=(y-A|0)/20|0;if((w|0)<(C|0)){C=A+(w*20|0)|0}else{C=t+((w-C|0)*20|0)|0}if((C|0)==(z|0)){break}else{B=A;A=C}}c[B>>2]=c[n>>2];c[B+4>>2]=c[n+4>>2];c[B+8>>2]=c[n+8>>2];c[B+12>>2]=c[n+12>>2];c[B+16>>2]=c[n+16>>2];if((z|0)==(t|0)){break}else{A=z}}}w=t+(x*20|0)|0}}while(0);if((r+f|0)>=(v+u|0)){break}Al(a,t,w,e,f,r,h,j);if((g|0)==(r|0)){m=45;break a}else{g=v;f=u;b=s;a=w}}Al(w,s,d,e,u,v,h,j);if((r|0)==0){m=45;break}else{g=r;d=w;b=t}}if((m|0)==8){Bl(a,b,d,e,u,g,h);i=k;return}else if((m|0)==17){B=l;A=a;c[B>>2]=c[A>>2];c[B+4>>2]=c[A+4>>2];c[B+8>>2]=c[A+8>>2];c[B+12>>2]=c[A+12>>2];c[B+16>>2]=c[A+16>>2];C=b;c[A>>2]=c[C>>2];c[A+4>>2]=c[C+4>>2];c[A+8>>2]=c[C+8>>2];c[A+12>>2]=c[C+12>>2];c[A+16>>2]=c[C+16>>2];c[C>>2]=c[B>>2];c[C+4>>2]=c[B+4>>2];c[C+8>>2]=c[B+8>>2];c[C+12>>2]=c[B+12>>2];c[C+16>>2]=c[B+16>>2];i=k;return}else if((m|0)==45){i=k;return}}function Bl(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0;j=i;t=a;w=b;p=i;i=i+8|0;o=p;u=i;i=i+8|0;s=u;v=i;i=i+8|0;q=v;k=i;i=i+8|0;r=k;l=i;i=i+8|0;m=i;i=i+4|0;i=i+7&-8;n=i;i=i+8|0;if((f|0)>(g|0)){if((b|0)==(d|0)){b=h}else{g=(((d-20+(-w|0)|0)>>>0)/20|0)+1|0;a=h;while(1){if((a|0)!=0){f=a;x=b;c[f>>2]=c[x>>2];c[f+4>>2]=c[x+4>>2];c[f+8>>2]=c[x+8>>2];c[f+12>>2]=c[x+12>>2];c[f+16>>2]=c[x+16>>2]}b=b+20|0;if((b|0)==(d|0)){break}else{a=a+20|0}}b=h+(g*20|0)|0}x=w;c[p>>2]=x;c[p+4>>2]=x;x=t;c[u>>2]=x;c[u+4>>2]=x;x=b;c[v>>2]=x;c[v+4>>2]=x;x=h;c[k>>2]=x;c[k+4>>2]=x;c[l>>2]=d;c[l+4>>2]=d;c[m>>2]=e;Cl(n,o,s,q,r,l,m);i=j;return}a:do{if((a|0)!=(b|0)){l=(((b-20+(-t|0)|0)>>>0)/20|0)+1|0;m=a;k=h;while(1){if((k|0)!=0){x=k;f=m;c[x>>2]=c[f>>2];c[x+4>>2]=c[f+4>>2];c[x+8>>2]=c[f+8>>2];c[x+12>>2]=c[f+12>>2];c[x+16>>2]=c[f+16>>2]}m=m+20|0;if((m|0)==(b|0)){break}else{k=k+20|0}}k=h+(l*20|0)|0;if((k|0)==(h|0)){break}while(1){if((b|0)==(d|0)){break}l=a;if(Cb[c[e>>2]&63](b,h)|0){x=b;c[l>>2]=c[x>>2];c[l+4>>2]=c[x+4>>2];c[l+8>>2]=c[x+8>>2];c[l+12>>2]=c[x+12>>2];c[l+16>>2]=c[x+16>>2];b=b+20|0}else{x=h;c[l>>2]=c[x>>2];c[l+4>>2]=c[x+4>>2];c[l+8>>2]=c[x+8>>2];c[l+12>>2]=c[x+12>>2];c[l+16>>2]=c[x+16>>2];h=h+20|0}a=a+20|0;if((h|0)==(k|0)){break a}}gn(a|0,h|0,k-h|0)|0;i=j;return}}while(0);gn(a|0,b|0,d-b|0)|0;i=j;return}function Cl(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0;j=i;l=b;b=i;i=i+8|0;c[b>>2]=c[l>>2];c[b+4>>2]=c[l+4>>2];l=d;d=i;i=i+8|0;c[d>>2]=c[l>>2];c[d+4>>2]=c[l+4>>2];l=e;e=i;i=i+8|0;c[e>>2]=c[l>>2];c[e+4>>2]=c[l+4>>2];l=f;q=i;i=i+8|0;c[q>>2]=c[l>>2];c[q+4>>2]=c[l+4>>2];l=g;g=i;i=i+8|0;c[g>>2]=c[l>>2];c[g+4>>2]=c[l+4>>2];l=h;h=i;i=i+4|0;i=i+7&-8;c[h>>2]=c[l>>2];l=b;r=c[l+4>>2]|0;f=c[d+4>>2]|0;d=f;m=e;s=c[m+4>>2]|0;a:do{if((r|0)==(d|0)){q=c[q+4>>2]|0}else{k=e+4|0;e=e|0;n=b+4|0;b=b|0;o=c[h>>2]|0;p=g+4|0;h=g|0;q=c[q+4>>2]|0;while(1){if((s|0)==(q|0)){break}r=(c[k>>2]|0)-20|0;c[e>>2]=r;s=(c[n>>2]|0)-20|0;c[b>>2]=s;u=Cb[c[o>>2]&63](r,s)|0;t=(c[p>>2]|0)-20|0;c[h>>2]=t;if(u){c[b>>2]=s;u=t;r=s;c[u>>2]=c[r>>2];c[u+4>>2]=c[r+4>>2];c[u+8>>2]=c[r+8>>2];c[u+12>>2]=c[r+12>>2];c[u+16>>2]=c[r+16>>2];c[n>>2]=s}else{c[e>>2]=r;u=t;s=r;c[u>>2]=c[s>>2];c[u+4>>2]=c[s+4>>2];c[u+8>>2]=c[s+8>>2];c[u+12>>2]=c[s+12>>2];c[u+16>>2]=c[s+16>>2];c[k>>2]=r}c[p>>2]=t;r=c[l+4>>2]|0;s=c[m+4>>2]|0;if((r|0)==(d|0)){break a}}k=c[g+4>>2]|0;if((r|0)==(d|0)){d=c[g>>2]|0}else{f=((r-20+(-f|0)|0)>>>0)/20|0;g=k;do{g=g-20|0;r=r-20|0;u=g;t=r;c[u>>2]=c[t>>2];c[u+4>>2]=c[t+4>>2];c[u+8>>2]=c[t+8>>2];c[u+12>>2]=c[t+12>>2];c[u+16>>2]=c[t+16>>2];}while((r|0)!=(d|0));k=k+(~f*20|0)|0;d=k}u=a;c[u>>2]=d;c[u+4>>2]=k;i=j;return}}while(0);d=c[g+4>>2]|0;f=q;if((s|0)==(f|0)){g=c[g>>2]|0}else{g=((s-20+(-q|0)|0)>>>0)/20|0;k=d;do{k=k-20|0;s=s-20|0;u=k;t=s;c[u>>2]=c[t>>2];c[u+4>>2]=c[t+4>>2];c[u+8>>2]=c[t+8>>2];c[u+12>>2]=c[t+12>>2];c[u+16>>2]=c[t+16>>2];}while((s|0)!=(f|0));d=d+(~g*20|0)|0;g=d}u=a;c[u>>2]=g;c[u+4>>2]=d;i=j;return}function Dl(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0;e=a|0;d=a|0;b=a+4|0;f=c[b>>2]|0;if((f|0)!=(d|0)){do{f=Am(f)|0;g=c[f>>2]|0;if((g|0)!=0){h=f+32|0;i=0;while(1){k=h|0;l=h+4|0;j=h|0;c[(c[j>>2]|0)+4>>2]=c[l>>2];c[c[l>>2]>>2]=c[j>>2];c[l>>2]=k;c[j>>2]=k;i=i+1|0;if(i>>>0<g>>>0){h=h+12|0}else{break}}}Cm(e,f);f=c[b>>2]|0;}while((f|0)!=(d|0))}l=a+12|0;j=a+20|0;i=a+24|0;k=j|0;c[(c[k>>2]|0)+4>>2]=c[i>>2];c[c[i>>2]>>2]=c[k>>2];c[i>>2]=j;c[k>>2]=j;k=l|0;j=a+16|0;l=l|0;c[(c[l>>2]|0)+4>>2]=c[j>>2];c[c[j>>2]>>2]=c[l>>2];c[j>>2]=k;c[l>>2]=k;Dm(e);l=a|0;c[(c[l>>2]|0)+4>>2]=c[b>>2];c[c[b>>2]>>2]=c[l>>2];c[b>>2]=d;c[l>>2]=d;return}function El(a){a=a|0;return}function Fl(a){a=a|0;$m(a);return}function Gl(b,d){b=b|0;d=d|0;var e=0,f=0,h=0,j=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0.0,K=0.0,L=0,M=0.0,N=0.0,O=0,P=0,Q=0,R=0.0,S=0.0,T=0.0,U=0.0,V=0,W=0,X=0,Y=0,Z=0,_=0.0,$=0.0,aa=0.0,ba=0.0,ca=0.0;e=i;i=i+40|0;n=e|0;o=e+16|0;if((a[d+38|0]|0)!=0){i=e;return 1}j=d+12|0;f=c[j>>2]|0;l=d+8|0;y=c[l>>2]|0;h=b+4|0;q=c[h>>2]|0;m=c[q+220>>2]|0;q=c[q+212>>2]|0;f=rb[c[(c[f>>2]|0)+12>>2]&15](f)|0;if((f|0)<=0){i=e;return 1}d=d+24|0;p=m+(q<<3)|0;u=q<<3>>3;x=y+28|0;w=y+32|0;v=y+40|0;t=y+36|0;s=y+24|0;r=y+20|0;q=y+12|0;E=y+16|0;A=o;y=o+8|0;I=b+8|0;D=y;z=o+16|0;H=n;G=n+8|0;F=o|0;C=o+4|0;y=y|0;B=o+12|0;L=b+12|0;b=0;do{O=c[d>>2]|0;S=+g[O+(b*28|0)+12>>2];Q=c[h>>2]|0;N=+g[Q+40>>2];M=+g[O+(b*28|0)>>2]-N;J=+g[O+(b*28|0)+4>>2]-N;K=+g[O+(b*28|0)+8>>2]+N;R=+g[Q+44>>2];O=(~~(R*J+2048.0)<<20)+~~(R*M*256.0+524288.0)|0;P=m;V=u;a:while(1){while(1){if((V|0)==0){break a}W=(V|0)/2|0;if((c[P+(W<<3)+4>>2]|0)>>>0<O>>>0){break}else{V=W}}P=P+(W+1<<3)|0;V=V-1-W|0}N=S+N;V=(~~(N*R+2048.0)<<20)+~~(K*R*256.0+524288.0)|0;O=P;X=p-P>>3;b:while(1){while(1){if((X|0)==0){break b}W=(X|0)/2|0;if((c[O+(W<<3)+4>>2]|0)>>>0>V>>>0){X=W}else{break}}O=O+(W+1<<3)|0;X=X-1-W|0}c:do{if((P|0)!=(O|0)){Y=Q;while(1){Q=c[P>>2]|0;X=(c[Y+112>>2]|0)+(Q<<3)|0;V=c[X>>2]|0;X=c[X+4>>2]|0;T=(c[k>>2]=V,+g[k>>2]);W=X;U=(c[k>>2]=W,+g[k>>2]);do{if(!(M>T|T>K)){if(J>U|U>N){break}Z=(c[Y+120>>2]|0)+(Q<<3)|0;S=+g[Z>>2];R=+g[Z+4>>2];if((c[Y+24>>2]|0)==0){$=T- +g[x>>2];aa=U- +g[w>>2];ca=+g[v>>2];_=+g[t>>2];ba=$*ca+aa*_;_=ca*aa+$*(-0.0-_);$=+g[s>>2];aa=+g[r>>2];V=(g[k>>2]=+g[q>>2]+($*ba-aa*_),c[k>>2]|0);W=(g[k>>2]=+g[E>>2]+(ba*aa+$*_),c[k>>2]|0);V=V|0}else{W=W|X&0;V=V|0|0}c[A>>2]=V;c[A+4>>2]=W;ca=+g[I>>2];ba=+(T+S*ca);ca=+(U+R*ca);g[D>>2]=ba;g[D+4>>2]=ca;g[z>>2]=1.0;Z=c[j>>2]|0;if(!(Db[c[(c[Z>>2]|0)+24>>2]&31](Z,n,o,(c[l>>2]|0)+12|0,b)|0)){break}aa=+g[H>>2];ba=+g[G>>2];$=1.0-ba;ca=+g[L>>2];aa=ca*(aa*.004999999888241291+(+g[F>>2]*$+ba*+g[y>>2])-T);ba=ca*(+g[H+4>>2]*.004999999888241291+($*+g[C>>2]+ba*+g[B>>2])-U);V=(c[(c[h>>2]|0)+120>>2]|0)+(Q<<3)|0;$=+aa;ca=+ba;g[V>>2]=$;g[V+4>>2]=ca;V=c[h>>2]|0;ca=+g[V+40>>2]*.75;ca=+g[L>>2]*ca*+g[V+28>>2]*ca;S=(S-aa)*ca;R=(R-ba)*ca;if(!(S!=0.0|R!=0.0)){break}if((c[(c[V+104>>2]|0)+(Q<<2)>>2]&4|0)!=0){break}X=V+21|0;W=V+128|0;if((a[X]|0)==0){en(c[W>>2]|0,0,c[V+56>>2]<<3|0)|0;a[X]=1}Z=c[W>>2]|0;Y=Z+(Q<<3)|0;g[Y>>2]=S+ +g[Y>>2];Z=Z+(Q<<3)+4|0;g[Z>>2]=R+ +g[Z>>2]}}while(0);P=P+8|0;if((P|0)==(O|0)){break c}Y=c[h>>2]|0}}}while(0);b=b+1|0;}while((b|0)<(f|0));i=e;return 1}function Hl(a){a=a|0;return}function Il(a){a=a|0;$m(a);return}function Jl(b,d){b=b|0;d=d|0;var e=0.0,f=0,h=0,j=0,l=0,m=0,n=0.0,o=0,p=0,q=0,r=0.0,s=0.0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0.0,E=0.0,F=0.0,G=0.0,H=0,I=0,J=0,K=0,L=0,M=0.0,N=0,O=0,P=0,Q=0,R=0,S=0.0,T=0.0;j=i;i=i+8|0;h=j|0;m=h;q=i;i=i+4|0;i=i+7&-8;f=i;i=i+8|0;if((a[d+38|0]|0)!=0){i=j;return 1}o=d+12|0;t=c[o>>2]|0;p=d+8|0;l=c[p>>2]|0;R=l+60|0;e=+g[R>>2];n=+g[R+4>>2];r=+g[l+132>>2];S=+g[l+44>>2];s=+g[l+48>>2];s=r*(S*S+s*s);s=+g[l+140>>2]+s-s;if(r>0.0){r=1.0/r}else{r=0.0}if(s>0.0){s=1.0/s}else{s=0.0}w=rb[c[(c[t>>2]|0)+12>>2]&15](t)|0;if((w|0)<=0){i=j;return 1}t=d+24|0;A=b+4|0;x=h;v=m+4|0;u=b+12|0;y=f+4|0;B=f|0;z=b+16|0;b=b+20|0;C=0;do{L=c[t>>2]|0;S=+g[L+(C*28|0)+12>>2];J=c[A>>2]|0;G=+g[J+40>>2];D=+g[L+(C*28|0)>>2]-G;F=+g[L+(C*28|0)+4>>2]-G;E=+g[L+(C*28|0)+8>>2]+G;L=c[J+220>>2]|0;K=c[J+212>>2]|0;M=+g[J+44>>2];H=(~~(F*M+2048.0)<<20)+~~(D*M*256.0+524288.0)|0;I=L;N=K<<3>>3;a:while(1){while(1){if((N|0)==0){break a}O=(N|0)/2|0;if((c[I+(O<<3)+4>>2]|0)>>>0<H>>>0){break}else{N=O}}I=I+(O+1<<3)|0;N=N-1-O|0}G=S+G;N=(~~(G*M+2048.0)<<20)+~~(E*M*256.0+524288.0)|0;H=I;L=L+(K<<3)-I>>3;b:while(1){while(1){if((L|0)==0){break b}K=(L|0)/2|0;if((c[H+(K<<3)+4>>2]|0)>>>0>N>>>0){L=K}else{break}}H=H+(K+1<<3)|0;L=L-1-K|0}c:do{if((I|0)!=(H|0)){K=J;while(1){J=c[I>>2]|0;R=(c[K+112>>2]|0)+(J<<3)|0;Q=c[R>>2]|0;R=c[R+4>>2]|0;c[h>>2]=Q;c[h+4>>2]=R;S=(c[k>>2]=Q,+g[k>>2]);M=(c[k>>2]=R,+g[k>>2]);d:do{if(!(D>S|S>E)){if(F>M|M>G){break}N=c[o>>2]|0;Bb[c[(c[N>>2]|0)+20>>2]&31](N,(c[p>>2]|0)+12|0,m,q,f,C);N=c[A>>2]|0;if(!(+g[q>>2]<+g[N+40>>2])){break}K=c[u>>2]|0;do{if((K|0)!=0){if((c[(c[N+104>>2]|0)+(J<<2)>>2]&65536|0)==0){break}if(!(zb[c[(c[K>>2]|0)+12>>2]&15](K,d,N,J)|0)){break d}N=c[A>>2]|0}}while(0);if((c[(c[N+104>>2]|0)+(J<<2)>>2]&4|0)==0){M=+g[N+44>>2]*1.3333333730697632;M=M*+g[N+32>>2]*M}else{M=0.0}S=(+g[x>>2]-e)*+g[y>>2]-(+g[v>>2]-n)*+g[B>>2];M=r+M+S*s*S;L=c[N+244>>2]|0;P=c[N+236>>2]|0;K=N+240|0;O=c[K>>2]|0;if((O|0)<=(P|0)){P=(P|0)==0?256:P<<1;N=N+376|0;Q=mm(c[N>>2]|0,P*28|0)|0;if((L|0)!=0){R=O*28|0;fn(Q|0,L|0,R)|0;nm(c[N>>2]|0,L,R)}c[K>>2]=P;L=Q;N=c[A>>2]|0}c[N+244>>2]=L;L=c[A>>2]|0;N=c[L+236>>2]|0;L=c[L+244>>2]|0;K=L+(N*28|0)|0;c[K>>2]=J;c[L+(N*28|0)+4>>2]=l;c[L+(N*28|0)+8>>2]=d;g[L+(N*28|0)+12>>2]=1.0- +g[q>>2]*+g[(c[A>>2]|0)+44>>2];R=L+(N*28|0)+16|0;T=+(-0.0- +g[B>>2]);S=+(-0.0- +g[y>>2]);g[R>>2]=T;g[R+4>>2]=S;if(M>0.0){M=1.0/M}else{M=0.0}g[L+(N*28|0)+24>>2]=M;L=c[z>>2]|0;e:do{if((L|0)!=0){N=c[b>>2]|0;P=c[N+8>>2]|0;do{if((P|0)!=0){O=c[N>>2]|0;Q=O;R=Q+(P<<3)-O>>3;f:do{if((R|0)!=0){while(1){while(1){P=(R|0)/2|0;if((c[Q+(P<<3)>>2]|0)>>>0<d>>>0){if((c[Q+(P<<3)+4>>2]|0)<(J|0)){break}}if((R+1|0)>>>0<3>>>0){break f}else{R=P}}Q=Q+(P+1<<3)|0;R=R-1|0;if((R|0)==(P|0)){break}else{R=R-P|0}}}}while(0);if((Q|0)==0){break}N=(c[N+4>>2]|0)+((Q-O|0)>>>3)|0;if((a[N]|0)==0){break}a[N]=0;break e}}while(0);xb[c[(c[L>>2]|0)+16>>2]&31](L,c[A>>2]|0,K)}}while(0);R=c[A>>2]|0;Q=R+236|0;c[Q>>2]=(c[Q>>2]|0)+1;Kk(R,J)}}while(0);I=I+8|0;if((I|0)==(H|0)){break c}K=c[A>>2]|0}}}while(0);C=C+1|0;}while((C|0)<(w|0));i=j;return 1}function Kl(a,b){a=a|0;b=b|0;if(!((c[a>>2]|0)>>>0<(c[b>>2]|0)>>>0)){b=0;return b|0}b=(c[a+4>>2]|0)<(c[b+4>>2]|0);return b|0}function Ll(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0;e=i;i=i+8|0;f=e|0;a:while(1){k=b;h=b-8|0;g=h;b:while(1){l=a;o=k-l|0;n=o>>3;switch(n|0){case 4:{j=14;break a};case 0:case 1:{j=83;break a};case 3:{j=6;break a};case 2:{j=4;break a};case 5:{j=26;break a};default:{}}if((o|0)<248){j=28;break a}p=(n|0)/2|0;m=a+(p<<3)|0;do{if((o|0)>7992){r=(n|0)/4|0;p=Ml(a,a+(r<<3)|0,m,a+(r+p<<3)|0,h,d)|0}else{r=Cb[c[d>>2]&63](m,a)|0;q=Cb[c[d>>2]&63](h,m)|0;if(!r){if(!q){p=0;break}n=m;q=c[n>>2]|0;r=c[n+4>>2]|0;p=c[g+4>>2]|0;c[n>>2]=c[g>>2];c[n+4>>2]=p;c[g>>2]=q;c[g+4>>2]=r;if(!(Cb[c[d>>2]&63](m,a)|0)){p=1;break}q=a;r=c[q>>2]|0;p=c[q+4>>2]|0;o=c[n+4>>2]|0;c[q>>2]=c[n>>2];c[q+4>>2]=o;c[n>>2]=r;c[n+4>>2]=p;p=2;break}p=a;o=c[p>>2]|0;n=c[p+4>>2]|0;if(q){r=c[g+4>>2]|0;c[p>>2]=c[g>>2];c[p+4>>2]=r;c[g>>2]=o;c[g+4>>2]=n;p=1;break}q=m;r=c[q+4>>2]|0;c[p>>2]=c[q>>2];c[p+4>>2]=r;c[q>>2]=o;c[q+4>>2]=n;if(!(Cb[c[d>>2]&63](h,m)|0)){p=1;break}r=c[q>>2]|0;p=c[q+4>>2]|0;o=c[g+4>>2]|0;c[q>>2]=c[g>>2];c[q+4>>2]=o;c[g>>2]=r;c[g+4>>2]=p;p=2}}while(0);do{if(Cb[c[d>>2]&63](a,m)|0){o=h}else{o=h;while(1){o=o-8|0;if((a|0)==(o|0)){break}if(Cb[c[d>>2]&63](o,m)|0){j=66;break}}if((j|0)==66){j=0;s=a;n=c[s>>2]|0;q=c[s+4>>2]|0;r=o;t=c[r+4>>2]|0;c[s>>2]=c[r>>2];c[s+4>>2]=t;c[r>>2]=n;c[r+4>>2]=q;p=p+1|0;break}m=a+8|0;if(!(Cb[c[d>>2]&63](a,h)|0)){while(1){if((m|0)==(h|0)){j=83;break a}l=m+8|0;if(Cb[c[d>>2]&63](a,m)|0){break}else{m=l}}s=m;t=c[s>>2]|0;m=c[s+4>>2]|0;r=c[g+4>>2]|0;c[s>>2]=c[g>>2];c[s+4>>2]=r;c[g>>2]=t;c[g+4>>2]=m;m=l}if((m|0)==(h|0)){j=83;break a}else{l=h}while(1){while(1){n=m+8|0;if(Cb[c[d>>2]&63](a,m)|0){break}else{m=n}}do{l=l-8|0;}while(Cb[c[d>>2]&63](a,l)|0);if(!(m>>>0<l>>>0)){a=m;continue b}r=m;s=c[r>>2]|0;t=c[r+4>>2]|0;m=l;q=c[m+4>>2]|0;c[r>>2]=c[m>>2];c[r+4>>2]=q;c[m>>2]=s;c[m+4>>2]=t;m=n}}}while(0);n=a+8|0;c:do{if(n>>>0<o>>>0){while(1){r=n;while(1){n=r+8|0;if(Cb[c[d>>2]&63](r,m)|0){r=n}else{q=o;break}}do{q=q-8|0;}while(!(Cb[c[d>>2]&63](q,m)|0));if(r>>>0>q>>>0){n=r;break c}u=r;s=c[u>>2]|0;t=c[u+4>>2]|0;o=q;v=c[o+4>>2]|0;c[u>>2]=c[o>>2];c[u+4>>2]=v;c[o>>2]=s;c[o+4>>2]=t;o=q;p=p+1|0;m=(m|0)==(r|0)?q:m}}}while(0);do{if((n|0)!=(m|0)){if(!(Cb[c[d>>2]&63](m,n)|0)){break}s=n;t=c[s>>2]|0;u=c[s+4>>2]|0;v=m;r=c[v+4>>2]|0;c[s>>2]=c[v>>2];c[s+4>>2]=r;c[v>>2]=t;c[v+4>>2]=u;p=p+1|0}}while(0);if((p|0)==0){o=Nl(a,n,d)|0;m=n+8|0;if(Nl(m,b,d)|0){j=78;break}if(o){a=m;continue}}v=n;if((v-l|0)>=(k-v|0)){j=82;break}Ll(a,n,d);a=n+8|0}if((j|0)==78){j=0;if(o){j=83;break}else{b=n;continue}}else if((j|0)==82){j=0;Ll(n+8|0,b,d);b=n;continue}}if((j|0)==4){if(!(Cb[c[d>>2]&63](h,a)|0)){i=e;return}t=a;u=c[t>>2]|0;v=c[t+4>>2]|0;s=c[g+4>>2]|0;c[t>>2]=c[g>>2];c[t+4>>2]=s;c[g>>2]=u;c[g+4>>2]=v;i=e;return}else if((j|0)==6){f=a+8|0;v=Cb[c[d>>2]&63](f,a)|0;b=Cb[c[d>>2]&63](h,f)|0;if(!v){if(!b){i=e;return}b=f;u=c[b>>2]|0;v=c[b+4>>2]|0;t=c[g+4>>2]|0;c[b>>2]=c[g>>2];c[b+4>>2]=t;c[g>>2]=u;c[g+4>>2]=v;if(!(Cb[c[d>>2]&63](f,a)|0)){i=e;return}t=a;u=c[t>>2]|0;v=c[t+4>>2]|0;s=c[b+4>>2]|0;c[t>>2]=c[b>>2];c[t+4>>2]=s;c[b>>2]=u;c[b+4>>2]=v;i=e;return}k=c[a>>2]|0;j=c[a+4>>2]|0;if(b){v=c[g+4>>2]|0;c[a>>2]=c[g>>2];c[a+4>>2]=v;c[g>>2]=k;c[g+4>>2]=j;i=e;return}b=f;v=c[b+4>>2]|0;c[a>>2]=c[b>>2];c[a+4>>2]=v;c[b>>2]=k;c[b+4>>2]=j;if(!(Cb[c[d>>2]&63](h,f)|0)){i=e;return}u=c[b>>2]|0;v=c[b+4>>2]|0;t=c[g+4>>2]|0;c[b>>2]=c[g>>2];c[b+4>>2]=t;c[g>>2]=u;c[g+4>>2]=v;i=e;return}else if((j|0)==14){f=a+8|0;b=a+16|0;v=Cb[c[d>>2]&63](f,a)|0;m=Cb[c[d>>2]&63](b,f)|0;do{if(v){l=a;k=c[l>>2]|0;j=c[l+4>>2]|0;if(m){v=b;u=c[v+4>>2]|0;c[l>>2]=c[v>>2];c[l+4>>2]=u;c[v>>2]=k;c[v+4>>2]=j;break}m=f;v=c[m+4>>2]|0;c[l>>2]=c[m>>2];c[l+4>>2]=v;c[m>>2]=k;c[m+4>>2]=j;if(!(Cb[c[d>>2]&63](b,f)|0)){break}t=c[m>>2]|0;u=c[m+4>>2]|0;v=b;s=c[v+4>>2]|0;c[m>>2]=c[v>>2];c[m+4>>2]=s;c[v>>2]=t;c[v+4>>2]=u}else{if(!m){break}j=f;t=c[j>>2]|0;u=c[j+4>>2]|0;v=b;s=c[v+4>>2]|0;c[j>>2]=c[v>>2];c[j+4>>2]=s;c[v>>2]=t;c[v+4>>2]=u;if(!(Cb[c[d>>2]&63](f,a)|0)){break}t=a;u=c[t>>2]|0;v=c[t+4>>2]|0;s=c[j+4>>2]|0;c[t>>2]=c[j>>2];c[t+4>>2]=s;c[j>>2]=u;c[j+4>>2]=v}}while(0);if(!(Cb[c[d>>2]&63](h,b)|0)){i=e;return}h=b;u=c[h>>2]|0;v=c[h+4>>2]|0;t=c[g+4>>2]|0;c[h>>2]=c[g>>2];c[h+4>>2]=t;c[g>>2]=u;c[g+4>>2]=v;if(!(Cb[c[d>>2]&63](b,f)|0)){i=e;return}b=f;u=c[b>>2]|0;v=c[b+4>>2]|0;t=c[h+4>>2]|0;c[b>>2]=c[h>>2];c[b+4>>2]=t;c[h>>2]=u;c[h+4>>2]=v;if(!(Cb[c[d>>2]&63](f,a)|0)){i=e;return}t=a;u=c[t>>2]|0;v=c[t+4>>2]|0;s=c[b+4>>2]|0;c[t>>2]=c[b>>2];c[t+4>>2]=s;c[b>>2]=u;c[b+4>>2]=v;i=e;return}else if((j|0)==26){Ml(a,a+8|0,a+16|0,a+24|0,h,d)|0;i=e;return}else if((j|0)==28){g=f;h=a+16|0;j=a+8|0;v=Cb[c[d>>2]&63](j,a)|0;n=Cb[c[d>>2]&63](h,j)|0;do{if(v){k=a;l=c[k>>2]|0;m=c[k+4>>2]|0;if(n){v=h;u=c[v+4>>2]|0;c[k>>2]=c[v>>2];c[k+4>>2]=u;c[v>>2]=l;c[v+4>>2]=m;break}n=j;v=c[n+4>>2]|0;c[k>>2]=c[n>>2];c[k+4>>2]=v;c[n>>2]=l;c[n+4>>2]=m;if(!(Cb[c[d>>2]&63](h,j)|0)){break}t=c[n>>2]|0;u=c[n+4>>2]|0;v=h;s=c[v+4>>2]|0;c[n>>2]=c[v>>2];c[n+4>>2]=s;c[v>>2]=t;c[v+4>>2]=u}else{if(!n){break}k=j;t=c[k>>2]|0;u=c[k+4>>2]|0;v=h;s=c[v+4>>2]|0;c[k>>2]=c[v>>2];c[k+4>>2]=s;c[v>>2]=t;c[v+4>>2]=u;if(!(Cb[c[d>>2]&63](j,a)|0)){break}t=a;u=c[t>>2]|0;v=c[t+4>>2]|0;s=c[k+4>>2]|0;c[t>>2]=c[k>>2];c[t+4>>2]=s;c[k>>2]=u;c[k+4>>2]=v}}while(0);j=a+24|0;if((j|0)==(b|0)){i=e;return}while(1){if(Cb[c[d>>2]&63](j,h)|0){v=j;m=c[v+4>>2]|0;c[f>>2]=c[v>>2];c[f+4>>2]=m;m=j;while(1){l=h;v=m;u=c[l+4>>2]|0;c[v>>2]=c[l>>2];c[v+4>>2]=u;if((h|0)==(a|0)){break}k=h-8|0;if(Cb[c[d>>2]&63](g,k)|0){m=h;h=k}else{break}}v=c[f+4>>2]|0;c[l>>2]=c[f>>2];c[l+4>>2]=v}k=j+8|0;if((k|0)==(b|0)){break}else{h=j;j=k}}i=e;return}else if((j|0)==83){i=e;return}}function Ml(a,b,d,e,f,g){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,i=0,j=0,k=0,l=0,m=0;j=Cb[c[g>>2]&63](b,a)|0;k=Cb[c[g>>2]&63](d,b)|0;do{if(j){i=a;h=c[i>>2]|0;j=c[i+4>>2]|0;if(k){k=d;l=c[k+4>>2]|0;c[i>>2]=c[k>>2];c[i+4>>2]=l;c[k>>2]=h;c[k+4>>2]=j;h=1;break}k=b;l=c[k+4>>2]|0;c[i>>2]=c[k>>2];c[i+4>>2]=l;c[k>>2]=h;c[k+4>>2]=j;if(!(Cb[c[g>>2]&63](d,b)|0)){h=1;break}j=c[k>>2]|0;l=c[k+4>>2]|0;h=d;i=c[h+4>>2]|0;c[k>>2]=c[h>>2];c[k+4>>2]=i;c[h>>2]=j;c[h+4>>2]=l;h=2}else{if(!k){h=0;break}h=b;j=c[h>>2]|0;k=c[h+4>>2]|0;l=d;i=c[l+4>>2]|0;c[h>>2]=c[l>>2];c[h+4>>2]=i;c[l>>2]=j;c[l+4>>2]=k;if(!(Cb[c[g>>2]&63](b,a)|0)){h=1;break}j=a;k=c[j>>2]|0;l=c[j+4>>2]|0;i=c[h+4>>2]|0;c[j>>2]=c[h>>2];c[j+4>>2]=i;c[h>>2]=k;c[h+4>>2]=l;h=2}}while(0);do{if(Cb[c[g>>2]&63](e,d)|0){i=d;j=c[i>>2]|0;k=c[i+4>>2]|0;l=e;m=c[l+4>>2]|0;c[i>>2]=c[l>>2];c[i+4>>2]=m;c[l>>2]=j;c[l+4>>2]=k;if(!(Cb[c[g>>2]&63](d,b)|0)){h=h+1|0;break}j=b;l=c[j>>2]|0;m=c[j+4>>2]|0;k=c[i+4>>2]|0;c[j>>2]=c[i>>2];c[j+4>>2]=k;c[i>>2]=l;c[i+4>>2]=m;if(!(Cb[c[g>>2]&63](b,a)|0)){h=h+2|0;break}k=a;l=c[k>>2]|0;m=c[k+4>>2]|0;i=c[j+4>>2]|0;c[k>>2]=c[j>>2];c[k+4>>2]=i;c[j>>2]=l;c[j+4>>2]=m;h=h+3|0}}while(0);if(!(Cb[c[g>>2]&63](f,e)|0)){m=h;return m|0}i=e;k=c[i>>2]|0;l=c[i+4>>2]|0;m=f;j=c[m+4>>2]|0;c[i>>2]=c[m>>2];c[i+4>>2]=j;c[m>>2]=k;c[m+4>>2]=l;if(!(Cb[c[g>>2]&63](e,d)|0)){m=h+1|0;return m|0}f=d;l=c[f>>2]|0;m=c[f+4>>2]|0;k=c[i+4>>2]|0;c[f>>2]=c[i>>2];c[f+4>>2]=k;c[i>>2]=l;c[i+4>>2]=m;if(!(Cb[c[g>>2]&63](d,b)|0)){m=h+2|0;return m|0}d=b;l=c[d>>2]|0;m=c[d+4>>2]|0;k=c[f+4>>2]|0;c[d>>2]=c[f>>2];c[d+4>>2]=k;c[f>>2]=l;c[f+4>>2]=m;if(!(Cb[c[g>>2]&63](b,a)|0)){m=h+3|0;return m|0}k=a;l=c[k>>2]|0;m=c[k+4>>2]|0;j=c[d+4>>2]|0;c[k>>2]=c[d>>2];c[k+4>>2]=j;c[d>>2]=l;c[d+4>>2]=m;m=h+4|0;return m|0}function Nl(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0;e=i;i=i+8|0;g=e|0;h=g;switch(b-a>>3|0){case 4:{f=a+8|0;g=a+16|0;b=b-8|0;o=Cb[c[d>>2]&63](f,a)|0;l=Cb[c[d>>2]&63](g,f)|0;do{if(o){k=a;j=c[k>>2]|0;h=c[k+4>>2]|0;if(l){o=g;n=c[o+4>>2]|0;c[k>>2]=c[o>>2];c[k+4>>2]=n;c[o>>2]=j;c[o+4>>2]=h;break}l=f;o=c[l+4>>2]|0;c[k>>2]=c[l>>2];c[k+4>>2]=o;c[l>>2]=j;c[l+4>>2]=h;if(!(Cb[c[d>>2]&63](g,f)|0)){break}m=c[l>>2]|0;n=c[l+4>>2]|0;o=g;k=c[o+4>>2]|0;c[l>>2]=c[o>>2];c[l+4>>2]=k;c[o>>2]=m;c[o+4>>2]=n}else{if(!l){break}h=f;m=c[h>>2]|0;n=c[h+4>>2]|0;o=g;l=c[o+4>>2]|0;c[h>>2]=c[o>>2];c[h+4>>2]=l;c[o>>2]=m;c[o+4>>2]=n;if(!(Cb[c[d>>2]&63](f,a)|0)){break}m=a;n=c[m>>2]|0;o=c[m+4>>2]|0;l=c[h+4>>2]|0;c[m>>2]=c[h>>2];c[m+4>>2]=l;c[h>>2]=n;c[h+4>>2]=o}}while(0);if(!(Cb[c[d>>2]&63](b,g)|0)){o=1;i=e;return o|0}h=g;m=c[h>>2]|0;n=c[h+4>>2]|0;o=b;l=c[o+4>>2]|0;c[h>>2]=c[o>>2];c[h+4>>2]=l;c[o>>2]=m;c[o+4>>2]=n;if(!(Cb[c[d>>2]&63](g,f)|0)){o=1;i=e;return o|0}b=f;n=c[b>>2]|0;o=c[b+4>>2]|0;m=c[h+4>>2]|0;c[b>>2]=c[h>>2];c[b+4>>2]=m;c[h>>2]=n;c[h+4>>2]=o;if(!(Cb[c[d>>2]&63](f,a)|0)){o=1;i=e;return o|0}m=a;n=c[m>>2]|0;o=c[m+4>>2]|0;l=c[b+4>>2]|0;c[m>>2]=c[b>>2];c[m+4>>2]=l;c[b>>2]=n;c[b+4>>2]=o;o=1;i=e;return o|0};case 0:case 1:{o=1;i=e;return o|0};case 3:{f=a+8|0;b=b-8|0;o=Cb[c[d>>2]&63](f,a)|0;j=Cb[c[d>>2]&63](b,f)|0;if(!o){if(!j){o=1;i=e;return o|0}g=f;m=c[g>>2]|0;n=c[g+4>>2]|0;o=b;l=c[o+4>>2]|0;c[g>>2]=c[o>>2];c[g+4>>2]=l;c[o>>2]=m;c[o+4>>2]=n;if(!(Cb[c[d>>2]&63](f,a)|0)){o=1;i=e;return o|0}m=a;n=c[m>>2]|0;o=c[m+4>>2]|0;l=c[g+4>>2]|0;c[m>>2]=c[g>>2];c[m+4>>2]=l;c[g>>2]=n;c[g+4>>2]=o;o=1;i=e;return o|0}g=c[a>>2]|0;h=c[a+4>>2]|0;if(j){o=b;n=c[o+4>>2]|0;c[a>>2]=c[o>>2];c[a+4>>2]=n;c[o>>2]=g;c[o+4>>2]=h;o=1;i=e;return o|0}j=f;o=c[j+4>>2]|0;c[a>>2]=c[j>>2];c[a+4>>2]=o;c[j>>2]=g;c[j+4>>2]=h;if(!(Cb[c[d>>2]&63](b,f)|0)){o=1;i=e;return o|0}m=c[j>>2]|0;n=c[j+4>>2]|0;o=b;l=c[o+4>>2]|0;c[j>>2]=c[o>>2];c[j+4>>2]=l;c[o>>2]=m;c[o+4>>2]=n;o=1;i=e;return o|0};case 2:{b=b-8|0;if(!(Cb[c[d>>2]&63](b,a)|0)){o=1;i=e;return o|0}l=a;m=c[l>>2]|0;n=c[l+4>>2]|0;o=b;k=c[o+4>>2]|0;c[l>>2]=c[o>>2];c[l+4>>2]=k;c[o>>2]=m;c[o+4>>2]=n;o=1;i=e;return o|0};case 5:{Ml(a,a+8|0,a+16|0,a+24|0,b-8|0,d)|0;o=1;i=e;return o|0};default:{k=a+16|0;j=a+8|0;n=Cb[c[d>>2]&63](j,a)|0;o=Cb[c[d>>2]&63](k,j)|0;do{if(n){l=a;m=c[l>>2]|0;n=c[l+4>>2]|0;if(o){o=k;j=c[o+4>>2]|0;c[l>>2]=c[o>>2];c[l+4>>2]=j;c[o>>2]=m;c[o+4>>2]=n;break}o=j;p=c[o+4>>2]|0;c[l>>2]=c[o>>2];c[l+4>>2]=p;c[o>>2]=m;c[o+4>>2]=n;if(!(Cb[c[d>>2]&63](k,j)|0)){break}m=c[o>>2]|0;n=c[o+4>>2]|0;p=k;l=c[p+4>>2]|0;c[o>>2]=c[p>>2];c[o+4>>2]=l;c[p>>2]=m;c[p+4>>2]=n}else{if(!o){break}l=j;n=c[l>>2]|0;o=c[l+4>>2]|0;p=k;m=c[p+4>>2]|0;c[l>>2]=c[p>>2];c[l+4>>2]=m;c[p>>2]=n;c[p+4>>2]=o;if(!(Cb[c[d>>2]&63](j,a)|0)){break}n=a;o=c[n>>2]|0;p=c[n+4>>2]|0;m=c[l+4>>2]|0;c[n>>2]=c[l>>2];c[n+4>>2]=m;c[l>>2]=o;c[l+4>>2]=p}}while(0);j=a+24|0;if((j|0)==(b|0)){p=1;i=e;return p|0}else{l=k;k=0}while(1){if(Cb[c[d>>2]&63](j,l)|0){p=j;m=c[p+4>>2]|0;c[g>>2]=c[p>>2];c[g+4>>2]=m;m=j;while(1){n=l;p=m;o=c[n+4>>2]|0;c[p>>2]=c[n>>2];c[p+4>>2]=o;if((l|0)==(a|0)){break}o=l-8|0;if(Cb[c[d>>2]&63](h,o)|0){m=l;l=o}else{break}}p=c[g+4>>2]|0;c[n>>2]=c[g>>2];c[n+4>>2]=p;k=k+1|0;if((k|0)==8){break}}m=j+8|0;if((m|0)==(b|0)){d=1;f=41;break}else{l=j;j=m}}if((f|0)==41){i=e;return d|0}p=(j+8|0)==(b|0);i=e;return p|0}}return 0}function Ol(a){a=a|0;return}function Pl(a){a=a|0;$m(a);return}function Ql(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,h=0.0,i=0,j=0,k=0,l=0,m=0.0,n=0.0,o=0.0,p=0.0,q=0.0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0.0,A=0.0,B=0,C=0.0,D=0.0;f=a+4|0;s=c[(c[f>>2]|0)+104>>2]|0;s=c[s+(d<<2)>>2]|c[s+(b<<2)>>2]|c[s+(e<<2)>>2];if((s&16|0)==0){return}y=c[a+8>>2]|0;if(!(zb[c[(c[y>>2]|0)+16>>2]&15](y,b,d,e)|0)){return}w=c[f>>2]|0;r=c[w+112>>2]|0;l=r+(b<<3)|0;n=+g[l>>2];i=r+(d<<3)|0;q=+g[i>>2];m=n-q;a=r+(b<<3)+4|0;p=+g[a>>2];k=r+(d<<3)+4|0;h=+g[k>>2];o=p-h;j=r+(e<<3)|0;A=+g[j>>2];q=q-A;r=r+(e<<3)+4|0;z=+g[r>>2];h=h-z;n=A-n;p=z-p;z=+g[w+48>>2]*4.0;if(m*m+o*o>z){return}if(q*q+h*h>z){return}if(n*n+p*p>z){return}v=c[w+268>>2]|0;x=c[w+260>>2]|0;t=w+264|0;u=c[t>>2]|0;if((u|0)<=(x|0)){x=(x|0)==0?256:x<<1;y=w+376|0;w=mm(c[y>>2]|0,x*60|0)|0;if((v|0)!=0){B=v;v=u*60|0;fn(w|0,B|0,v)|0;nm(c[y>>2]|0,B,v)}c[t>>2]=x;v=w;w=c[f>>2]|0}c[w+268>>2]=v;u=c[f>>2]|0;v=c[u+160>>2]|0;x=c[v+(b<<2)>>2]|0;w=c[v+(d<<2)>>2]|0;v=c[v+(e<<2)>>2]|0;t=c[u+260>>2]|0;u=c[u+268>>2]|0;c[u+(t*60|0)>>2]=b;c[u+(t*60|0)+4>>2]=d;c[u+(t*60|0)+8>>2]=e;c[u+(t*60|0)+12>>2]=s;if((x|0)==0){z=1.0}else{z=+g[x+16>>2]}if((w|0)==0){A=1.0}else{A=+g[w+16>>2]}z=z<A?z:A;if((v|0)==0){A=1.0}else{A=+g[v+16>>2]}g[u+(t*60|0)+16>>2]=z<A?z:A;C=+g[l>>2];D=+g[a>>2];A=(C+ +g[i>>2]+ +g[j>>2])*.3333333432674408;z=(D+ +g[k>>2]+ +g[r>>2])*.3333333432674408;B=u+(t*60|0)+20|0;C=+(C-A);D=+(D-z);g[B>>2]=C;g[B+4>>2]=D;B=u+(t*60|0)+28|0;D=+(+g[i>>2]-A);C=+(+g[k>>2]-z);g[B>>2]=D;g[B+4>>2]=C;B=u+(t*60|0)+36|0;A=+(+g[j>>2]-A);z=+(+g[r>>2]-z);g[B>>2]=A;g[B+4>>2]=z;g[u+(t*60|0)+44>>2]=-0.0-(m*n+o*p);g[u+(t*60|0)+48>>2]=-0.0-(m*q+o*h);g[u+(t*60|0)+52>>2]=-0.0-(q*n+h*p);n=+g[l>>2];z=+g[k>>2];o=+g[a>>2];p=+g[i>>2];q=+g[r>>2];A=+g[j>>2];g[u+(t*60|0)+56>>2]=o*A-n*q+(n*z-o*p+(p*q-z*A));B=(c[f>>2]|0)+260|0;c[B>>2]=(c[B>>2]|0)+1;return}function Rl(a){a=a|0;return}function Sl(a){a=a|0;$m(a);return}function Tl(a,b){a=a|0;b=b|0;return(c[(c[a+4>>2]|0)+(b<<2)>>2]&4096|0)!=0|0}function Ul(a,b,c){a=a|0;b=b|0;c=c|0;return 1}function Vl(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;return 1}function Wl(a){a=a|0;$m(a);return}function Xl(a,b){a=a|0;b=b|0;return 1}function Yl(a){a=a|0;return}function Zl(a){a=a|0;$m(a);return}function _l(a,b,d){a=a|0;b=b|0;d=d|0;a=c[a+4>>2]|0;b=(a|0)<=(b|0);d=(a|0)>(d|0);if(b|d){return d&b|0}else{return 1}return 0}function $l(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;a=c[a+4>>2]|0;b=(a|0)>(b|0);d=(a|0)>(d|0);if(b|d|(a|0)>(e|0)){return(a|0)<=(e|0)|b&d^1|0}else{return 0}return 0}function am(a){a=a|0;return}function bm(a){a=a|0;$m(a);return}function cm(a,b){a=a|0;b=b|0;return 0}function dm(a){a=a|0;return 1}function em(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0;e=a+16|0;a=a+12|0;f=0;while(1){if((f|0)>=(c[e>>2]|0)){e=0;b=4;break}g=c[(c[a>>2]|0)+(f<<2)>>2]|0;if(vb[c[(c[g>>2]|0)+16>>2]&31](g,b,d)|0){e=1;b=4;break}else{f=f+1|0}}if((b|0)==4){return e|0}return 0}function fm(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;return}function gm(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;return 0}function hm(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0.0,w=0.0,x=0.0,y=0.0,z=0;l=i;i=i+16|0;h=l|0;j=b|0;g[j>>2]=3.4028234663852886e+38;e=b+4|0;g[e>>2]=3.4028234663852886e+38;g[b+8>>2]=-3.4028234663852886e+38;f=b+12|0;g[f>>2]=-3.4028234663852886e+38;k=a+16|0;if((c[k>>2]|0)<=0){i=l;return}n=a+12|0;o=h|0;m=h+4|0;a=b;b=b+8|0;q=b|0;r=h+8|0;t=h+12|0;u=0;do{s=c[(c[n>>2]|0)+(u<<2)>>2]|0;s=rb[c[(c[s>>2]|0)+12>>2]&15](s)|0;if((s|0)>0){p=0;do{z=c[(c[n>>2]|0)+(u<<2)>>2]|0;Eb[c[(c[z>>2]|0)+28>>2]&63](z,h,d,p);y=+g[j>>2];x=+g[o>>2];v=+g[e>>2];w=+g[m>>2];x=+(y<x?y:x);y=+(v<w?v:w);g[a>>2]=x;g[a+4>>2]=y;y=+g[q>>2];x=+g[r>>2];v=+g[f>>2];w=+g[t>>2];x=+(y>x?y:x);y=+(v>w?v:w);g[b>>2]=x;g[b+4>>2]=y;p=p+1|0;}while((p|0)<(s|0))}u=u+1|0;}while((u|0)<(c[k>>2]|0));i=l;return}function im(a,b,c){a=a|0;b=b|0;c=+c;return}function jm(a,b){a=a|0;b=b|0;var d=0,e=0,f=0;f=b+4|0;e=b|0;c[(c[e>>2]|0)+4>>2]=c[f>>2];c[c[f>>2]>>2]=c[e>>2];c[f>>2]=b;c[e>>2]=b;d=a+12|0;c[f>>2]=c[d>>2];c[e>>2]=a+8;c[c[d>>2]>>2]=b;c[d>>2]=b;return}function km(b){b=b|0;var d=0,e=0;d=b+68|0;e=d|0;c[b+72>>2]=e;c[d>>2]=e;d=b+8|0;c[d>>2]=128;c[b+4>>2]=0;e=xm(1024)|0;c[b>>2]=e;en(e|0,0,c[d>>2]<<3|0)|0;en(b+12|0,0,56)|0;if((a[9064]|0)==0){d=0;b=1}else{return}do{if((b|0)>(c[8208+(d<<2)>>2]|0)){d=d+1|0;a[9072+b|0]=d}else{a[9072+b|0]=d}b=b+1|0;}while((b|0)<641);a[9064]=1;return}function lm(a){a=a|0;var b=0,d=0,e=0,f=0;d=a+4|0;b=a|0;f=c[b>>2]|0;if((c[d>>2]|0)>0){e=0;do{ym(c[f+(e<<3)+4>>2]|0);e=e+1|0;f=c[b>>2]|0}while((e|0)<(c[d>>2]|0))}ym(f);f=a+68|0;Dm(f);e=f|0;d=a+72|0;f=f|0;c[(c[f>>2]|0)+4>>2]=c[d>>2];c[c[d>>2]>>2]=c[f>>2];c[d>>2]=e;c[f>>2]=e;return}function mm(a,b){a=a|0;b=b|0;var e=0,f=0,g=0,h=0,i=0,j=0;if((b|0)==0){j=0;return j|0}if((b|0)>640){j=Bm(a+68|0,b)|0;return j|0}f=d[9072+b|0]|0;b=a+12+(f<<2)|0;e=c[b>>2]|0;if((e|0)!=0){c[b>>2]=c[e>>2];j=e;return j|0}e=a+4|0;g=c[e>>2]|0;h=a+8|0;a=a|0;if((g|0)==(c[h>>2]|0)){i=c[a>>2]|0;j=g+128|0;c[h>>2]=j;j=xm(j<<3)|0;c[a>>2]=j;g=i;fn(j|0,g|0,c[e>>2]<<3)|0;en((c[a>>2]|0)+(c[e>>2]<<3)|0,0,1024)|0;ym(g);g=c[e>>2]|0}j=c[a>>2]|0;i=xm(16384)|0;a=j+(g<<3)+4|0;c[a>>2]=i;f=c[8208+(f<<2)>>2]|0;c[j+(g<<3)>>2]=f;g=(16384/(f|0)|0)-1|0;if((g|0)>0){h=0;j=i;while(1){i=h+1|0;c[j+(ba(h,f)|0)>>2]=j+(ba(i,f)|0);j=c[a>>2]|0;if((i|0)<(g|0)){h=i}else{i=j;break}}}c[i+(ba(g,f)|0)>>2]=0;c[b>>2]=c[c[a>>2]>>2];c[e>>2]=(c[e>>2]|0)+1;j=c[a>>2]|0;return j|0}function nm(a,b,e){a=a|0;b=b|0;e=e|0;if((e|0)==0){return}if((e|0)>640){Cm(a+68|0,b);return}else{e=a+12+((d[9072+e|0]|0)<<2)|0;c[b>>2]=c[e>>2];c[e>>2]=b;return}}function om(a,b,c){a=a|0;b=b|0;c=c|0;var d=0.0,e=0.0,f=0.0,h=0.0,i=0.0,j=0.0,k=0.0,l=0.0,m=0.0,n=0.0,o=0.0,p=0.0,q=0.0,r=0.0,s=0.0,t=0.0;e=+g[b+16>>2];l=+g[b+32>>2];h=+g[b+20>>2];d=+g[b+28>>2];o=e*l-h*d;k=+g[b+24>>2];f=+g[b+12>>2];n=h*k-l*f;m=d*f-e*k;j=+g[b>>2];i=+g[b+4>>2];p=+g[b+8>>2];q=o*j+i*n+m*p;if(q!=0.0){q=1.0/q}r=+g[c>>2];s=+g[c+4>>2];t=+g[c+8>>2];g[a>>2]=q*(o*r+s*n+m*t);g[a+4>>2]=q*((s*l-t*d)*j+i*(t*k-l*r)+(d*r-s*k)*p);g[a+8>>2]=q*((e*t-h*s)*j+i*(h*r-t*f)+(s*f-e*r)*p);return}function pm(a,b,c){a=a|0;b=b|0;c=c|0;var d=0.0,e=0.0,f=0.0,h=0.0,i=0.0,j=0.0,k=0.0;e=+g[b>>2];f=+g[b+12>>2];d=+g[b+4>>2];h=+g[b+16>>2];i=e*h-f*d;if(i!=0.0){i=1.0/i}j=+g[c>>2];k=+g[c+4>>2];g[a>>2]=i*(h*j-f*k);g[a+4>>2]=i*(e*k-d*j);return}function qm(a,b){a=a|0;b=b|0;var c=0.0,d=0.0,e=0.0,f=0.0,h=0.0;c=+g[a>>2];e=+g[a+12>>2];d=+g[a+4>>2];f=+g[a+16>>2];h=c*f-e*d;if(h!=0.0){h=1.0/h}g[b>>2]=f*h;f=-0.0-h;g[b+12>>2]=e*f;g[b+8>>2]=0.0;g[b+4>>2]=d*f;g[b+16>>2]=c*h;en(b+20|0,0,16)|0;return}function rm(a,b){a=a|0;b=b|0;var c=0.0,d=0.0,e=0.0,f=0.0,h=0.0,i=0.0,j=0.0,k=0.0,l=0.0,m=0.0;d=+g[a+16>>2];c=+g[a+32>>2];l=d*c;m=+g[a+20>>2];f=+g[a+28>>2];h=+g[a+24>>2];i=+g[a+12>>2];k=c*i;j=f*i-d*h;e=+g[a>>2];m=(l-m*f)*e+ +g[a+4>>2]*(m*h-k)+j*+g[a+8>>2];if(m!=0.0){m=1.0/m}g[b>>2]=m*(l-f*f);l=m*(h*f-k);g[b+4>>2]=l;k=m*j;g[b+8>>2]=k;g[b+12>>2]=l;g[b+16>>2]=m*(e*c-h*h);l=m*(i*h-e*f);g[b+20>>2]=l;g[b+24>>2]=k;g[b+28>>2]=l;g[b+32>>2]=m*(e*d-i*i);return}function sm(a){a=a|0;return}function tm(a){a=a|0;return}function um(a){a=a|0;return+0.0}function vm(a,b){a=a|0;b=b|0;return Xm(a)|0}function wm(a,b){a=a|0;b=b|0;Ym(a);return}function xm(a){a=a|0;c[2434]=(c[2434]|0)+1;return Cb[c[2068]&63](a,c[2430]|0)|0}function ym(a){a=a|0;c[2434]=(c[2434]|0)-1;ub[c[2070]&255](a,c[2430]|0);return}function zm(a,b){a=a|0;b=b|0;return}function Am(a){a=a|0;return a+43&-32|0}function Bm(a,b){a=a|0;b=b|0;var d=0,e=0;e=xm(b+44|0)|0;c[e>>2]=e;b=e+43&-32;c[b-4>>2]=e;d=e;c[e+4>>2]=a;a=a|0;c[e>>2]=c[a>>2];c[(c[a>>2]|0)+4>>2]=d;c[a>>2]=d;return b|0}function Cm(a,b){a=a|0;b=b|0;var d=0,e=0;a=c[b-4>>2]|0;d=a|0;e=a+4|0;b=a|0;c[(c[b>>2]|0)+4>>2]=c[e>>2];c[c[e>>2]>>2]=c[b>>2];c[e>>2]=d;c[b>>2]=d;ym(a);return}function Dm(a){a=a|0;var b=0,d=0,e=0,f=0;b=a|0;a=a+4|0;d=c[a>>2]|0;if((d|0)==(b|0)){return}do{f=d+4|0;e=d|0;c[(c[e>>2]|0)+4>>2]=c[f>>2];c[c[f>>2]>>2]=c[e>>2];c[f>>2]=d;c[e>>2]=d;ym(d);d=c[a>>2]|0;}while((d|0)!=(b|0));return}function Em(a){a=a|0;c[a+102400>>2]=0;c[a+102404>>2]=0;c[a+102408>>2]=0;c[a+102796>>2]=0;return}function Fm(a){a=a|0;return}function Gm(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0;e=b+102796|0;g=c[e>>2]|0;f=b+102412+(g*12|0)|0;c[b+102412+(g*12|0)+4>>2]=d;h=b+102400|0;i=c[h>>2]|0;if((i+d|0)>102400){c[f>>2]=xm(d)|0;a[b+102412+(g*12|0)+8|0]=1}else{c[f>>2]=b+i;a[b+102412+(g*12|0)+8|0]=0;c[h>>2]=(c[h>>2]|0)+d}h=b+102404|0;g=(c[h>>2]|0)+d|0;c[h>>2]=g;b=b+102408|0;h=c[b>>2]|0;c[b>>2]=(h|0)>(g|0)?h:g;c[e>>2]=(c[e>>2]|0)+1;return c[f>>2]|0}function Hm(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0;h=(c[b+102796>>2]|0)-1|0;f=b+102412+(h*12|0)|0;d=b+102412+(h*12|0)+4|0;g=e-(c[d>>2]|0)|0;if((g|0)<=0){j=f|0;j=c[j>>2]|0;return j|0}i=b+102412+(h*12|0)+8|0;do{if((a[i]|0)==0){j=b+102400|0;h=(c[j>>2]|0)+g|0;if((h|0)>102400){g=xm(e)|0;h=f|0;fn(g|0,c[h>>2]|0,c[d>>2]|0)|0;c[j>>2]=(c[j>>2]|0)-(c[d>>2]|0);c[h>>2]=g;a[i]=1;break}else{c[j>>2]=h;h=b+102404|0;g=(c[h>>2]|0)+g|0;c[h>>2]=g;b=b+102408|0;h=c[b>>2]|0;c[b>>2]=(h|0)>(g|0)?h:g;break}}else{i=xm(e)|0;j=f|0;fn(i|0,c[j>>2]|0,c[d>>2]|0)|0;ym(c[j>>2]|0);c[j>>2]=i}}while(0);c[d>>2]=e;j=f|0;j=c[j>>2]|0;return j|0}function Im(b,d){b=b|0;d=d|0;var e=0,f=0,g=0;e=b+102796|0;g=c[e>>2]|0;f=g-1|0;if((a[b+102412+(f*12|0)+8|0]|0)==0){f=b+102412+(f*12|0)+4|0;d=b+102400|0;c[d>>2]=(c[d>>2]|0)-(c[f>>2]|0)}else{ym(d);g=c[e>>2]|0;f=b+102412+(f*12|0)+4|0}d=b+102404|0;c[d>>2]=(c[d>>2]|0)-(c[f>>2]|0);c[e>>2]=g-1;return}function Jm(a){a=a|0;return}function Km(a){a=a|0;Jm(a|0);return}function Lm(a){a=a|0;return}function Mm(a){a=a|0;return}function Nm(a){a=a|0;Jm(a|0);$m(a);return}function Om(a){a=a|0;Jm(a|0);$m(a);return}function Pm(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0;e=i;i=i+56|0;f=e|0;if((a|0)==(b|0)){g=1;i=e;return g|0}if((b|0)==0){g=0;i=e;return g|0}g=Sm(b,7760,7744,-1)|0;b=g;if((g|0)==0){g=0;i=e;return g|0}en(f|0,0,56)|0;c[f>>2]=b;c[f+8>>2]=a;c[f+12>>2]=-1;c[f+48>>2]=1;Eb[c[(c[g>>2]|0)+28>>2]&63](b,f,c[d>>2]|0,1);if((c[f+24>>2]|0)!=1){g=0;i=e;return g|0}c[d>>2]=c[f+16>>2];g=1;i=e;return g|0}function Qm(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0;if((c[d+8>>2]|0)!=(b|0)){return}b=d+16|0;g=c[b>>2]|0;if((g|0)==0){c[b>>2]=e;c[d+24>>2]=f;c[d+36>>2]=1;return}if((g|0)!=(e|0)){g=d+36|0;c[g>>2]=(c[g>>2]|0)+1;c[d+24>>2]=2;a[d+54|0]=1;return}e=d+24|0;if((c[e>>2]|0)!=2){return}c[e>>2]=f;return}function Rm(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0;if((b|0)!=(c[d+8>>2]|0)){g=c[b+8>>2]|0;Eb[c[(c[g>>2]|0)+28>>2]&63](g,d,e,f);return}b=d+16|0;g=c[b>>2]|0;if((g|0)==0){c[b>>2]=e;c[d+24>>2]=f;c[d+36>>2]=1;return}if((g|0)!=(e|0)){g=d+36|0;c[g>>2]=(c[g>>2]|0)+1;c[d+24>>2]=2;a[d+54|0]=1;return}e=d+24|0;if((c[e>>2]|0)!=2){return}c[e>>2]=f;return}function Sm(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0;f=i;i=i+56|0;g=f|0;j=c[a>>2]|0;k=a+(c[j-8>>2]|0)|0;j=c[j-4>>2]|0;h=j;c[g>>2]=d;c[g+4>>2]=a;c[g+8>>2]=b;c[g+12>>2]=e;b=g+16|0;n=g+20|0;e=g+24|0;l=g+28|0;a=g+32|0;m=g+40|0;en(b|0,0,39)|0;if((j|0)==(d|0)){c[g+48>>2]=1;Bb[c[(c[j>>2]|0)+20>>2]&31](h,g,k,k,1,0);i=f;return((c[e>>2]|0)==1?k:0)|0}sb[c[(c[j>>2]|0)+24>>2]&7](h,g,k,1,0);d=c[g+36>>2]|0;if((d|0)==1){do{if((c[e>>2]|0)!=1){if((c[m>>2]|0)!=0){n=0;i=f;return n|0}if((c[l>>2]|0)!=1){n=0;i=f;return n|0}if((c[a>>2]|0)==1){break}else{d=0}i=f;return d|0}}while(0);n=c[b>>2]|0;i=f;return n|0}else if((d|0)==0){if((c[m>>2]|0)!=1){n=0;i=f;return n|0}if((c[l>>2]|0)!=1){n=0;i=f;return n|0}n=(c[a>>2]|0)==1?c[n>>2]|0:0;i=f;return n|0}else{n=0;i=f;return n|0}return 0}function Tm(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,i=0,j=0,k=0;i=b|0;if((i|0)==(c[d+8>>2]|0)){if((c[d+4>>2]|0)!=(e|0)){return}h=d+28|0;if((c[h>>2]|0)==1){return}c[h>>2]=f;return}if((i|0)!=(c[d>>2]|0)){j=c[b+8>>2]|0;sb[c[(c[j>>2]|0)+24>>2]&7](j,d,e,f,g);return}do{if((c[d+16>>2]|0)!=(e|0)){i=d+20|0;if((c[i>>2]|0)==(e|0)){break}c[d+32>>2]=f;f=d+44|0;if((c[f>>2]|0)==4){return}j=d+52|0;a[j]=0;k=d+53|0;a[k]=0;b=c[b+8>>2]|0;Bb[c[(c[b>>2]|0)+20>>2]&31](b,d,e,e,1,g);if((a[k]|0)==0){b=0;h=13}else{if((a[j]|0)==0){b=1;h=13}}a:do{if((h|0)==13){c[i>>2]=e;k=d+40|0;c[k>>2]=(c[k>>2]|0)+1;do{if((c[d+36>>2]|0)==1){if((c[d+24>>2]|0)!=2){h=16;break}a[d+54|0]=1;if(b){break a}}else{h=16}}while(0);if((h|0)==16){if(b){break}}c[f>>2]=4;return}}while(0);c[f>>2]=3;return}}while(0);if((f|0)!=1){return}c[d+32>>2]=1;return}function Um(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;if((c[d+8>>2]|0)==(b|0)){if((c[d+4>>2]|0)!=(e|0)){return}d=d+28|0;if((c[d>>2]|0)==1){return}c[d>>2]=f;return}if((c[d>>2]|0)!=(b|0)){return}do{if((c[d+16>>2]|0)!=(e|0)){b=d+20|0;if((c[b>>2]|0)==(e|0)){break}c[d+32>>2]=f;c[b>>2]=e;g=d+40|0;c[g>>2]=(c[g>>2]|0)+1;do{if((c[d+36>>2]|0)==1){if((c[d+24>>2]|0)!=2){break}a[d+54|0]=1}}while(0);c[d+44>>2]=4;return}}while(0);if((f|0)!=1){return}c[d+32>>2]=1;return}function Vm(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;if((b|0)!=(c[d+8>>2]|0)){b=c[b+8>>2]|0;Bb[c[(c[b>>2]|0)+20>>2]&31](b,d,e,f,g,h);return}a[d+53|0]=1;if((c[d+4>>2]|0)!=(f|0)){return}a[d+52|0]=1;b=d+16|0;f=c[b>>2]|0;if((f|0)==0){c[b>>2]=e;c[d+24>>2]=g;c[d+36>>2]=1;if(!((c[d+48>>2]|0)==1&(g|0)==1)){return}a[d+54|0]=1;return}if((f|0)!=(e|0)){h=d+36|0;c[h>>2]=(c[h>>2]|0)+1;a[d+54|0]=1;return}e=d+24|0;b=c[e>>2]|0;if((b|0)==2){c[e>>2]=g}else{g=b}if(!((c[d+48>>2]|0)==1&(g|0)==1)){return}a[d+54|0]=1;return}function Wm(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;if((c[d+8>>2]|0)!=(b|0)){return}a[d+53|0]=1;if((c[d+4>>2]|0)!=(f|0)){return}a[d+52|0]=1;f=d+16|0;b=c[f>>2]|0;if((b|0)==0){c[f>>2]=e;c[d+24>>2]=g;c[d+36>>2]=1;if(!((c[d+48>>2]|0)==1&(g|0)==1)){return}a[d+54|0]=1;return}if((b|0)!=(e|0)){h=d+36|0;c[h>>2]=(c[h>>2]|0)+1;a[d+54|0]=1;return}e=d+24|0;f=c[e>>2]|0;if((f|0)==2){c[e>>2]=g}else{g=f}if(!((c[d+48>>2]|0)==1&(g|0)==1)){return}a[d+54|0]=1;return}



function bk(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0;e=i;i=i+8|0;h=e|0;g=h;switch(b-a>>3|0){case 5:{f=a+8|0;g=a+16|0;h=a+24|0;j=b-8|0;$j(a,f,g,h,d)|0;if(!(Cb[c[d>>2]&63](j,h)|0)){o=1;i=e;return o|0}b=h;m=c[b>>2]|0;n=c[b+4>>2]|0;o=j;l=c[o+4>>2]|0;c[b>>2]=c[o>>2];c[b+4>>2]=l;c[o>>2]=m;c[o+4>>2]=n;if(!(Cb[c[d>>2]&63](h,g)|0)){o=1;i=e;return o|0}h=g;n=c[h>>2]|0;o=c[h+4>>2]|0;m=c[b+4>>2]|0;c[h>>2]=c[b>>2];c[h+4>>2]=m;c[b>>2]=n;c[b+4>>2]=o;if(!(Cb[c[d>>2]&63](g,f)|0)){o=1;i=e;return o|0}b=f;n=c[b>>2]|0;o=c[b+4>>2]|0;m=c[h+4>>2]|0;c[b>>2]=c[h>>2];c[b+4>>2]=m;c[h>>2]=n;c[h+4>>2]=o;if(!(Cb[c[d>>2]&63](f,a)|0)){o=1;i=e;return o|0}m=a;n=c[m>>2]|0;o=c[m+4>>2]|0;l=c[b+4>>2]|0;c[m>>2]=c[b>>2];c[m+4>>2]=l;c[b>>2]=n;c[b+4>>2]=o;o=1;i=e;return o|0};case 3:{f=a+8|0;b=b-8|0;o=Cb[c[d>>2]&63](f,a)|0;h=Cb[c[d>>2]&63](b,f)|0;if(!o){if(!h){o=1;i=e;return o|0}g=f;m=c[g>>2]|0;n=c[g+4>>2]|0;o=b;l=c[o+4>>2]|0;c[g>>2]=c[o>>2];c[g+4>>2]=l;c[o>>2]=m;c[o+4>>2]=n;if(!(Cb[c[d>>2]&63](f,a)|0)){o=1;i=e;return o|0}m=a;n=c[m>>2]|0;o=c[m+4>>2]|0;l=c[g+4>>2]|0;c[m>>2]=c[g>>2];c[m+4>>2]=l;c[g>>2]=n;c[g+4>>2]=o;o=1;i=e;return o|0}g=c[a>>2]|0;j=c[a+4>>2]|0;if(h){o=b;n=c[o+4>>2]|0;c[a>>2]=c[o>>2];c[a+4>>2]=n;c[o>>2]=g;c[o+4>>2]=j;o=1;i=e;return o|0}h=f;o=c[h+4>>2]|0;c[a>>2]=c[h>>2];c[a+4>>2]=o;c[h>>2]=g;c[h+4>>2]=j;if(!(Cb[c[d>>2]&63](b,f)|0)){o=1;i=e;return o|0}m=c[h>>2]|0;n=c[h+4>>2]|0;o=b;l=c[o+4>>2]|0;c[h>>2]=c[o>>2];c[h+4>>2]=l;c[o>>2]=m;c[o+4>>2]=n;o=1;i=e;return o|0};case 2:{b=b-8|0;if(!(Cb[c[d>>2]&63](b,a)|0)){o=1;i=e;return o|0}l=a;m=c[l>>2]|0;n=c[l+4>>2]|0;o=b;k=c[o+4>>2]|0;c[l>>2]=c[o>>2];c[l+4>>2]=k;c[o>>2]=m;c[o+4>>2]=n;o=1;i=e;return o|0};case 4:{$j(a,a+8|0,a+16|0,b-8|0,d)|0;o=1;i=e;return o|0};case 0:case 1:{o=1;i=e;return o|0};default:{k=a+16|0;j=a+8|0;n=Cb[c[d>>2]&63](j,a)|0;o=Cb[c[d>>2]&63](k,j)|0;do{if(n){l=a;m=c[l>>2]|0;n=c[l+4>>2]|0;if(o){o=k;j=c[o+4>>2]|0;c[l>>2]=c[o>>2];c[l+4>>2]=j;c[o>>2]=m;c[o+4>>2]=n;break}o=j;p=c[o+4>>2]|0;c[l>>2]=c[o>>2];c[l+4>>2]=p;c[o>>2]=m;c[o+4>>2]=n;if(!(Cb[c[d>>2]&63](k,j)|0)){break}m=c[o>>2]|0;n=c[o+4>>2]|0;p=k;l=c[p+4>>2]|0;c[o>>2]=c[p>>2];c[o+4>>2]=l;c[p>>2]=m;c[p+4>>2]=n}else{if(!o){break}l=j;n=c[l>>2]|0;o=c[l+4>>2]|0;p=k;m=c[p+4>>2]|0;c[l>>2]=c[p>>2];c[l+4>>2]=m;c[p>>2]=n;c[p+4>>2]=o;if(!(Cb[c[d>>2]&63](j,a)|0)){break}n=a;o=c[n>>2]|0;p=c[n+4>>2]|0;m=c[l+4>>2]|0;c[n>>2]=c[l>>2];c[n+4>>2]=m;c[l>>2]=o;c[l+4>>2]=p}}while(0);j=a+24|0;if((j|0)==(b|0)){p=1;i=e;return p|0}else{l=0}while(1){if(Cb[c[d>>2]&63](j,k)|0){p=j;n=c[p+4>>2]|0;c[h>>2]=c[p>>2];c[h+4>>2]=n;n=j;while(1){o=k;p=n;n=c[o+4>>2]|0;c[p>>2]=c[o>>2];c[p+4>>2]=n;if((k|0)==(a|0)){break}m=k-8|0;if(Cb[c[d>>2]&63](g,m)|0){n=k;k=m}else{break}}p=c[h+4>>2]|0;c[o>>2]=c[h>>2];c[o+4>>2]=p;l=l+1|0;if((l|0)==8){break}}m=j+8|0;if((m|0)==(b|0)){d=1;f=34;break}else{k=j;j=m}}if((f|0)==34){i=e;return d|0}p=(j+8|0)==(b|0);i=e;return p|0}}return 0}function ck(a){a=a|0;$m(a);return}function dk(a,b){a=a|0;b=b|0;return}function ek(a,b){a=a|0;b=b|0;return}function fk(a,b,c){a=a|0;b=b|0;c=c|0;return}function gk(a,b,c){a=a|0;b=b|0;c=c|0;return}function hk(a,b,d){a=a|0;b=b|0;d=d|0;c[a>>2]=b;c[a+4>>2]=Gm(b,d<<4)|0;c[a+8>>2]=d;en(a+12|0,0,16)|0;return}function ik(a){a=a|0;var b=0,d=0;d=c[a+24>>2]|0;b=a|0;if((d|0)!=0){Im(c[b>>2]|0,d)}Im(c[b>>2]|0,c[a+4>>2]|0);return}function jk(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0;i=b+12|0;g=c[i>>2]|0;c[i>>2]=g+1;b=c[b+4>>2]|0;i=d;d=b+(g<<4)|0;h=c[i+4>>2]|0;c[d>>2]=c[i>>2];c[d+4>>2]=h;c[b+(g<<4)+8>>2]=e;a[b+(g<<4)+12|0]=f&1;return}function kk(b,d,e){b=b|0;d=+d;e=+e;var f=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0.0,o=0.0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0.0,x=0.0,y=0.0,z=0.0,A=0,B=0;d=1.0/d;k=b+12|0;f=c[k>>2]|0;if((f|0)>0){h=c[b+4>>2]|0;w=3.4028234663852886e+38;y=3.4028234663852886e+38;o=-3.4028234663852886e+38;n=-3.4028234663852886e+38;i=0;while(1){if((a[h+(i<<4)+12|0]|0)!=0){z=+g[h+(i<<4)>>2];x=+g[h+(i<<4)+4>>2];n=n>z?n:z;o=o>x?o:x;y=y<z?y:z;w=w<x?w:x}i=i+1|0;if((i|0)>=(f|0)){x=o;z=n;break}}}else{w=3.4028234663852886e+38;y=3.4028234663852886e+38;x=-3.4028234663852886e+38;z=-3.4028234663852886e+38}n=y-e;o=w-e;r=~~(d*(z+e-n))+1|0;f=b+16|0;c[f>>2]=r;h=~~(d*(x+e-o))+1|0;i=b+20|0;c[i>>2]=h;p=b|0;r=Gm(c[p>>2]|0,ba(h<<2,r)|0)|0;h=b+24|0;c[h>>2]=r;l=c[f>>2]|0;m=c[i>>2]|0;j=ba(m,l)|0;a:do{if((j|0)>0){q=0;while(1){c[r+(q<<2)>>2]=0;q=q+1|0;if((q|0)>=(j|0)){break a}r=c[h>>2]|0}}}while(0);j=c[p>>2]|0;q=ba(l<<2,m)|0;p=Gm(j,q<<4)|0;if((c[k>>2]|0)>0){b=b+4|0;r=0;l=0;while(1){s=c[b>>2]|0;t=s+(l<<4)|0;s=s+(l<<4)+4|0;z=d*(+g[t>>2]-n);m=t;x=+z;y=+(d*(+g[s>>2]-o));g[m>>2]=x;g[m+4>>2]=y;m=~~z;s=~~+g[s>>2];do{if((s|m|0)>-1){u=c[f>>2]|0;if((m|0)>=(u|0)){break}if((s|0)>=(c[i>>2]|0)){break}u=(ba(u,s)|0)+m|0;if((r|0)>=(q|0)){if((r|0)>0){v=0;do{v=v+1|0;}while((v|0)<(r|0))}q=(q|0)>0?q<<1:1;p=Hm(j,p,q<<4)|0}c[p+(r<<4)>>2]=m;c[p+(r<<4)+4>>2]=s;c[p+(r<<4)+8>>2]=u;c[p+(r<<4)+12>>2]=t;r=r+1|0}}while(0);l=l+1|0;if((l|0)>=(c[k>>2]|0)){s=0;break}}}else{s=0;r=0}b:while(1){do{if((s|0)==(r|0)){break b}k=c[p+(s<<4)>>2]|0;m=c[p+(s<<4)+4>>2]|0;l=c[p+(s<<4)+8>>2]|0;b=c[p+(s<<4)+12>>2]|0;s=s+1|0;t=(c[h>>2]|0)+(l<<2)|0;}while((c[t>>2]|0)!=0);c[t>>2]=b;if((k|0)>0){t=k-1|0;u=l-1|0;do{if((r|0)>=(q|0)){if((s|0)<(r|0)){v=s;do{A=p+(v-s<<4)|0;B=p+(v<<4)|0;c[A>>2]=c[B>>2];c[A+4>>2]=c[B+4>>2];c[A+8>>2]=c[B+8>>2];c[A+12>>2]=c[B+12>>2];v=v+1|0;}while((v|0)<(r|0))}r=r-s|0;if((r|0)<(q|0)){s=0;break}q=(q|0)>0?q<<1:1;p=Hm(j,p,q<<4)|0;s=0}}while(0);c[p+(r<<4)>>2]=t;c[p+(r<<4)+4>>2]=m;c[p+(r<<4)+8>>2]=u;c[p+(r<<4)+12>>2]=b;r=r+1|0}if((m|0)>0){t=m-1|0;u=l-(c[f>>2]|0)|0;do{if((r|0)>=(q|0)){if((s|0)<(r|0)){v=s;do{B=p+(v-s<<4)|0;A=p+(v<<4)|0;c[B>>2]=c[A>>2];c[B+4>>2]=c[A+4>>2];c[B+8>>2]=c[A+8>>2];c[B+12>>2]=c[A+12>>2];v=v+1|0;}while((v|0)<(r|0))}r=r-s|0;if((r|0)<(q|0)){s=0;break}q=(q|0)>0?q<<1:1;p=Hm(j,p,q<<4)|0;s=0}}while(0);c[p+(r<<4)>>2]=k;c[p+(r<<4)+4>>2]=t;c[p+(r<<4)+8>>2]=u;c[p+(r<<4)+12>>2]=b;r=r+1|0}if((k|0)<((c[f>>2]|0)-1|0)){u=k+1|0;t=l+1|0;do{if((r|0)>=(q|0)){if((s|0)<(r|0)){v=s;do{B=p+(v-s<<4)|0;A=p+(v<<4)|0;c[B>>2]=c[A>>2];c[B+4>>2]=c[A+4>>2];c[B+8>>2]=c[A+8>>2];c[B+12>>2]=c[A+12>>2];v=v+1|0;}while((v|0)<(r|0))}r=r-s|0;if((r|0)<(q|0)){s=0;break}q=(q|0)>0?q<<1:1;p=Hm(j,p,q<<4)|0;s=0}}while(0);c[p+(r<<4)>>2]=u;c[p+(r<<4)+4>>2]=m;c[p+(r<<4)+8>>2]=t;c[p+(r<<4)+12>>2]=b;r=r+1|0}if((m|0)>=((c[i>>2]|0)-1|0)){continue}m=m+1|0;l=(c[f>>2]|0)+l|0;do{if((r|0)>=(q|0)){if((s|0)<(r|0)){t=s;do{B=p+(t-s<<4)|0;A=p+(t<<4)|0;c[B>>2]=c[A>>2];c[B+4>>2]=c[A+4>>2];c[B+8>>2]=c[A+8>>2];c[B+12>>2]=c[A+12>>2];t=t+1|0;}while((t|0)<(r|0))}r=r-s|0;if((r|0)<(q|0)){s=0;break}q=(q|0)>0?q<<1:1;p=Hm(j,p,q<<4)|0;s=0}}while(0);c[p+(r<<4)>>2]=k;c[p+(r<<4)+4>>2]=m;c[p+(r<<4)+8>>2]=l;c[p+(r<<4)+12>>2]=b;r=r+1|0}m=c[i>>2]|0;if((m|0)>0){l=r;s=r;k=0;b=c[f>>2]|0;while(1){if((b-1|0)>0){r=l;m=0;v=b;while(1){u=(ba(v,k)|0)+m|0;t=c[h>>2]|0;l=c[t+(u<<2)>>2]|0;b=u+1|0;t=c[t+(b<<2)>>2]|0;if((l|0)==(t|0)){b=v;m=m+1|0}else{do{if((r|0)>=(q|0)){if((s|0)<(r|0)){v=s;do{B=p+(v-s<<4)|0;A=p+(v<<4)|0;c[B>>2]=c[A>>2];c[B+4>>2]=c[A+4>>2];c[B+8>>2]=c[A+8>>2];c[B+12>>2]=c[A+12>>2];v=v+1|0;}while((v|0)<(r|0))}r=r-s|0;if((r|0)<(q|0)){s=0;break}q=(q|0)>0?q<<1:1;p=Hm(j,p,q<<4)|0;s=0}}while(0);c[p+(r<<4)>>2]=m;c[p+(r<<4)+4>>2]=k;c[p+(r<<4)+8>>2]=u;c[p+(r<<4)+12>>2]=t;r=r+1|0;m=m+1|0;do{if((r|0)>=(q|0)){if((s|0)<(r|0)){t=s;do{B=p+(t-s<<4)|0;A=p+(t<<4)|0;c[B>>2]=c[A>>2];c[B+4>>2]=c[A+4>>2];c[B+8>>2]=c[A+8>>2];c[B+12>>2]=c[A+12>>2];t=t+1|0;}while((t|0)<(r|0))}r=r-s|0;if((r|0)<(q|0)){s=0;break}q=(q|0)>0?q<<1:1;p=Hm(j,p,q<<4)|0;s=0}}while(0);c[p+(r<<4)>>2]=m;c[p+(r<<4)+4>>2]=k;c[p+(r<<4)+8>>2]=b;c[p+(r<<4)+12>>2]=l;r=r+1|0;b=c[f>>2]|0}if((m|0)<(b-1|0)){v=b}else{break}}m=c[i>>2]|0}else{r=l}k=k+1|0;if((k|0)<(m|0)){l=r}else{k=r;l=m;break}}}else{k=r;s=r;l=m}if((l-1|0)>0){r=k;b=0;m=c[f>>2]|0;while(1){k=b+1|0;if((m|0)>0){l=0;v=m;while(1){t=(ba(v,b)|0)+l|0;u=c[h>>2]|0;m=c[u+(t<<2)>>2]|0;u=c[u+(t+v<<2)>>2]|0;if((m|0)==(u|0)){m=v}else{do{if((r|0)>=(q|0)){if((s|0)<(r|0)){v=s;do{B=p+(v-s<<4)|0;A=p+(v<<4)|0;c[B>>2]=c[A>>2];c[B+4>>2]=c[A+4>>2];c[B+8>>2]=c[A+8>>2];c[B+12>>2]=c[A+12>>2];v=v+1|0;}while((v|0)<(r|0))}r=r-s|0;if((r|0)<(q|0)){s=0;break}q=(q|0)>0?q<<1:1;p=Hm(j,p,q<<4)|0;s=0}}while(0);c[p+(r<<4)>>2]=l;c[p+(r<<4)+4>>2]=b;c[p+(r<<4)+8>>2]=t;c[p+(r<<4)+12>>2]=u;u=r+1|0;r=(c[f>>2]|0)+t|0;do{if((u|0)<(q|0)){t=u}else{if((s|0)<(u|0)){t=s;do{B=p+(t-s<<4)|0;A=p+(t<<4)|0;c[B>>2]=c[A>>2];c[B+4>>2]=c[A+4>>2];c[B+8>>2]=c[A+8>>2];c[B+12>>2]=c[A+12>>2];t=t+1|0;}while((t|0)<(u|0))}t=u-s|0;if((t|0)<(q|0)){s=0;break}q=(q|0)>0?q<<1:1;p=Hm(j,p,q<<4)|0;s=0}}while(0);c[p+(t<<4)>>2]=l;c[p+(t<<4)+4>>2]=k;c[p+(t<<4)+8>>2]=r;c[p+(t<<4)+12>>2]=m;r=t+1|0;m=c[f>>2]|0}l=l+1|0;if((l|0)<(m|0)){v=m}else{break}}l=c[i>>2]|0}if((k|0)<(l-1|0)){b=k}else{break}}}else{r=k}if((s|0)==(r|0)){B=p;Im(j,B);return}c:while(1){t=c[h>>2]|0;while(1){b=c[p+(s<<4)>>2]|0;m=c[p+(s<<4)+4>>2]|0;l=c[p+(s<<4)+8>>2]|0;k=c[p+(s<<4)+12>>2]|0;s=s+1|0;u=t+(l<<2)|0;v=c[u>>2]|0;if((v|0)!=(k|0)){y=+(b|0);w=+g[v>>2]-y;z=+(m|0);x=+g[v+4>>2]-z;y=+g[k>>2]-y;z=+g[k+4>>2]-z;if(w*w+x*x>y*y+z*z){break}}if((s|0)==(r|0)){f=141;break c}}c[u>>2]=k;if((b|0)>0){t=b-1|0;u=l-1|0;do{if((r|0)>=(q|0)){if((s|0)<(r|0)){v=s;do{B=p+(v-s<<4)|0;A=p+(v<<4)|0;c[B>>2]=c[A>>2];c[B+4>>2]=c[A+4>>2];c[B+8>>2]=c[A+8>>2];c[B+12>>2]=c[A+12>>2];v=v+1|0;}while((v|0)<(r|0))}r=r-s|0;if((r|0)<(q|0)){s=0;break}q=(q|0)>0?q<<1:1;p=Hm(j,p,q<<4)|0;s=0}}while(0);c[p+(r<<4)>>2]=t;c[p+(r<<4)+4>>2]=m;c[p+(r<<4)+8>>2]=u;c[p+(r<<4)+12>>2]=k;r=r+1|0}if((m|0)>0){t=m-1|0;u=l-(c[f>>2]|0)|0;do{if((r|0)>=(q|0)){if((s|0)<(r|0)){v=s;do{B=p+(v-s<<4)|0;A=p+(v<<4)|0;c[B>>2]=c[A>>2];c[B+4>>2]=c[A+4>>2];c[B+8>>2]=c[A+8>>2];c[B+12>>2]=c[A+12>>2];v=v+1|0;}while((v|0)<(r|0))}r=r-s|0;if((r|0)<(q|0)){s=0;break}q=(q|0)>0?q<<1:1;p=Hm(j,p,q<<4)|0;s=0}}while(0);c[p+(r<<4)>>2]=b;c[p+(r<<4)+4>>2]=t;c[p+(r<<4)+8>>2]=u;c[p+(r<<4)+12>>2]=k;r=r+1|0}if((b|0)<((c[f>>2]|0)-1|0)){t=b+1|0;u=l+1|0;do{if((r|0)>=(q|0)){if((s|0)<(r|0)){v=s;do{B=p+(v-s<<4)|0;A=p+(v<<4)|0;c[B>>2]=c[A>>2];c[B+4>>2]=c[A+4>>2];c[B+8>>2]=c[A+8>>2];c[B+12>>2]=c[A+12>>2];v=v+1|0;}while((v|0)<(r|0))}r=r-s|0;if((r|0)<(q|0)){s=0;break}q=(q|0)>0?q<<1:1;p=Hm(j,p,q<<4)|0;s=0}}while(0);c[p+(r<<4)>>2]=t;c[p+(r<<4)+4>>2]=m;c[p+(r<<4)+8>>2]=u;c[p+(r<<4)+12>>2]=k;r=r+1|0}if((m|0)<((c[i>>2]|0)-1|0)){m=m+1|0;l=(c[f>>2]|0)+l|0;do{if((r|0)>=(q|0)){if((s|0)<(r|0)){t=s;do{B=p+(t-s<<4)|0;A=p+(t<<4)|0;c[B>>2]=c[A>>2];c[B+4>>2]=c[A+4>>2];c[B+8>>2]=c[A+8>>2];c[B+12>>2]=c[A+12>>2];t=t+1|0;}while((t|0)<(r|0))}r=r-s|0;if((r|0)<(q|0)){s=0;break}q=(q|0)>0?q<<1:1;p=Hm(j,p,q<<4)|0;s=0}}while(0);c[p+(r<<4)>>2]=b;c[p+(r<<4)+4>>2]=m;c[p+(r<<4)+8>>2]=l;c[p+(r<<4)+12>>2]=k;r=r+1|0}if((s|0)==(r|0)){f=141;break}}if((f|0)==141){B=p;Im(j,B);return}}function lk(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0;f=b+20|0;i=c[f>>2]|0;if((i-1|0)<=0){return}e=b+16|0;g=b+24|0;b=d;h=0;j=c[e>>2]|0;do{if((j-1|0)>0){i=0;m=j;do{k=(ba(m,h)|0)+i|0;o=c[g>>2]|0;j=c[o+(k<<2)>>2]|0;n=k+1|0;l=c[o+(n<<2)>>2]|0;k=c[o+(k+m<<2)>>2]|0;m=c[o+(n+m<<2)>>2]|0;a:do{if((l|0)!=(k|0)){b:do{if(!((j|0)==(l|0)|(j|0)==(k|0))){do{if((a[j+12|0]|0)==0){if((a[l+12|0]|0)!=0){break}if((a[k+12|0]|0)==0){break b}}}while(0);Eb[c[(c[b>>2]|0)+8>>2]&63](d,c[j+8>>2]|0,c[l+8>>2]|0,c[k+8>>2]|0)}}while(0);if((m|0)==(l|0)|(m|0)==(k|0)){break}do{if((a[l+12|0]|0)==0){if((a[m+12|0]|0)!=0){break}if((a[k+12|0]|0)==0){break a}}}while(0);Eb[c[(c[b>>2]|0)+8>>2]&63](d,c[l+8>>2]|0,c[m+8>>2]|0,c[k+8>>2]|0)}}while(0);i=i+1|0;m=c[e>>2]|0;}while((i|0)<(m-1|0));j=m;i=c[f>>2]|0}h=h+1|0;}while((h|0)<(i-1|0));return}function mk(a){a=a|0;var b=0,d=0,e=0;en(a|0,0,16)|0;g[a+16>>2]=1.0;c[a+20>>2]=0;c[a+24>>2]=0;c[a+28>>2]=-1;g[a+32>>2]=0.0;g[a+36>>2]=0.0;b=a+40|0;d=8376;e=c[d+4>>2]|0;c[b>>2]=c[d>>2];c[b+4>>2]=e;b=a+48|0;e=8376;d=c[e+4>>2]|0;c[b>>2]=c[e>>2];c[b+4>>2]=d;en(a+56|0,0,16)|0;g[a+72>>2]=1.0;c[a+76>>2]=0;return}function nk(a){a=a|0;var b=0,d=0,e=0,f=0.0,h=0,i=0,j=0,k=0.0,l=0.0,m=0.0,n=0.0,o=0.0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0.0,y=0.0,z=0.0,A=0.0,B=0.0;d=a+28|0;i=c[a>>2]|0;b=c[i+4>>2]|0;if((c[d>>2]|0)==(b|0)){return}f=+g[i+40>>2]*.75;f=f*+g[i+28>>2]*f;u=a+32|0;g[u>>2]=0.0;s=a+40|0;w=a+44|0;v=a+48|0;t=a+52|0;en(s|0,0,16)|0;h=c[a+4>>2]|0;e=c[a+8>>2]|0;j=(h|0)<(e|0);do{if(j){p=c[i+112>>2]|0;q=c[i+120>>2]|0;r=h;o=0.0;n=0.0;m=0.0;l=0.0;k=0.0;do{o=f+o;g[u>>2]=o;x=f*+g[p+(r<<3)+4>>2];n=f*+g[p+(r<<3)>>2]+n;g[s>>2]=n;m=x+m;g[w>>2]=m;x=f*+g[q+(r<<3)+4>>2];l=f*+g[q+(r<<3)>>2]+l;g[v>>2]=l;k=x+k;g[t>>2]=k;r=r+1|0;}while((r|0)<(e|0));if(o>0.0){x=1.0/o;n=x*n;g[s>>2]=n;m=x*m;g[w>>2]=m;x=1.0/o;l=x*l;g[v>>2]=l;k=x*k;g[t>>2]=k}p=a+36|0;g[p>>2]=0.0;a=a+56|0;g[a>>2]=0.0;if(!j){break}j=c[i+112>>2]|0;i=c[i+120>>2]|0;x=0.0;o=0.0;do{B=+g[j+(h<<3)>>2]-n;z=+g[j+(h<<3)+4>>2]-m;y=+g[i+(h<<3)>>2]-l;A=+g[i+(h<<3)+4>>2]-k;x=f*(B*B+z*z)+x;g[p>>2]=x;o=o+f*(B*A-z*y);g[a>>2]=o;h=h+1|0;}while((h|0)<(e|0));if(!(x>0.0)){break}g[a>>2]=1.0/x*o}else{g[a+36>>2]=0.0;g[a+56>>2]=0.0}}while(0);c[d>>2]=b;return}function ok(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,h=0,i=0,j=0,k=0.0;i=b+68|0;j=i|0;c[b+72>>2]=j;c[i>>2]=j;c[b+76>>2]=256;i=b+80|0;j=i|0;c[b+84>>2]=j;c[i>>2]=j;i=b+88|0;c[b+92>>2]=i;c[i>>2]=i;c[b+152>>2]=0;c[b+156>>2]=0;c[b+164>>2]=0;c[b+168>>2]=0;i=b+272|0;j=b+308|0;en(b+96|0,0,32)|0;en(b+176|0,0,24)|0;en(i|0,0,16)|0;g[j>>2]=1.0;g[b+312>>2]=.05000000074505806;g[b+316>>2]=1.0;g[b+320>>2]=.25;g[b+324>>2]=.25;g[b+328>>2]=.25;g[b+332>>2]=.20000000298023224;g[b+336>>2]=.20000000298023224;g[b+340>>2]=1.0;g[b+344>>2]=.5;g[b+348>>2]=.5;g[b+352>>2]=.20000000298023224;g[b+356>>2]=.20000000298023224;c[b+360>>2]=8;g[b+364>>2]=.5;f=b+368|0;a[f]=1;g[b+372>>2]=.01666666753590107;a[b|0]=0;c[b+4>>2]=0;c[b+8>>2]=0;a[b+12|0]=0;c[b+16>>2]=0;a[b+20|0]=0;a[b+21|0]=0;c[b+24>>2]=0;a[b+52|0]=0;g[b+28>>2]=1.0;g[b+32>>2]=1.0;g[b+36>>2]=1.0;k=+g[d>>2]*2.0;g[b+40>>2]=k;g[b+48>>2]=k*k;g[b+44>>2]=1.0/k;c[b+56>>2]=0;h=b+60|0;c[h>>2]=0;c[b+64>>2]=0;c[b+160>>2]=0;c[b+300>>2]=0;c[b+304>>2]=0;en(b+128|0,0,24)|0;en(b+212|0,0,60)|0;fn(j|0,d|0,68)|0;d=b+376|0;c[d>>2]=e;c[b+172>>2]=0;c[b+200>>2]=0;c[b+204>>2]=0;c[b+208>>2]=0;e=b+288|0;c[e>>2]=0;c[e+4>>2]=0;a[b+296|0]=0;e=a[f]|0;if(e<<24>>24==0){a[f]=e;return}sk(b,256);j=mm(c[d>>2]|0,c[h>>2]<<2)|0;en(j|0,0,c[h>>2]<<2|0)|0;c[i>>2]=j;a[f]=e;return}function pk(a){a=a|0;var b=0,d=0,e=0;d=a+304|0;while(1){b=c[d>>2]|0;if((b|0)==0){break}qk(a,b)}do{if((c[a+100>>2]|0)==0){d=a+96|0;b=c[d>>2]|0;if((b|0)==0){break}nm(c[a+376>>2]|0,b,c[a+60>>2]<<2);c[d>>2]=0}}while(0);do{if((c[a+108>>2]|0)==0){d=a+104|0;b=c[d>>2]|0;if((b|0)==0){break}nm(c[a+376>>2]|0,b,c[a+60>>2]<<2);c[d>>2]=0}}while(0);do{if((c[a+180>>2]|0)==0){d=a+176|0;b=c[d>>2]|0;if((b|0)==0){break}nm(c[a+376>>2]|0,b,c[a+60>>2]<<2);c[d>>2]=0}}while(0);do{if((c[a+188>>2]|0)==0){d=a+184|0;b=c[d>>2]|0;if((b|0)==0){break}nm(c[a+376>>2]|0,b,c[a+60>>2]<<2);c[d>>2]=0}}while(0);do{if((c[a+196>>2]|0)==0){d=a+192|0;b=c[d>>2]|0;if((b|0)==0){break}nm(c[a+376>>2]|0,b,c[a+60>>2]<<2);c[d>>2]=0}}while(0);do{if((c[a+116>>2]|0)==0){d=a+112|0;b=c[d>>2]|0;if((b|0)==0){break}nm(c[a+376>>2]|0,b,c[a+60>>2]<<3);c[d>>2]=0}}while(0);do{if((c[a+124>>2]|0)==0){b=a+120|0;d=c[b>>2]|0;if((d|0)==0){break}nm(c[a+376>>2]|0,d,c[a+60>>2]<<3);c[b>>2]=0}}while(0);do{if((c[a+156>>2]|0)==0){d=a+152|0;b=c[d>>2]|0;if((b|0)==0){break}nm(c[a+376>>2]|0,b|0,c[a+60>>2]<<2);c[d>>2]=0}}while(0);do{if((c[a+168>>2]|0)==0){d=a+164|0;b=c[d>>2]|0;if((b|0)==0){break}nm(c[a+376>>2]|0,b,c[a+60>>2]<<2);c[d>>2]=0}}while(0);do{if((c[a+276>>2]|0)==0){d=a+272|0;b=c[d>>2]|0;if((b|0)==0){break}nm(c[a+376>>2]|0,b,c[a+60>>2]<<2);c[d>>2]=0}}while(0);do{if((c[a+284>>2]|0)==0){b=a+280|0;d=c[b>>2]|0;if((d|0)==0){break}nm(c[a+376>>2]|0,d,c[a+60>>2]<<2);c[b>>2]=0}}while(0);d=a+128|0;b=a+60|0;e=c[d>>2]|0;if((e|0)!=0){nm(c[a+376>>2]|0,e,c[b>>2]<<3);c[d>>2]=0}d=a+132|0;e=c[d>>2]|0;if((e|0)!=0){nm(c[a+376>>2]|0,e,c[b>>2]<<2);c[d>>2]=0}d=a+136|0;e=c[d>>2]|0;if((e|0)!=0){nm(c[a+376>>2]|0,e,c[b>>2]<<2);c[d>>2]=0}e=a+140|0;d=c[e>>2]|0;if((d|0)!=0){nm(c[a+376>>2]|0,d,c[b>>2]<<2);c[e>>2]=0}d=a+144|0;e=c[d>>2]|0;if((e|0)!=0){nm(c[a+376>>2]|0,e,c[b>>2]<<3);c[d>>2]=0}d=a+148|0;e=c[d>>2]|0;if((e|0)!=0){nm(c[a+376>>2]|0,e,c[b>>2]<<2);c[d>>2]=0}e=a+160|0;d=c[e>>2]|0;if((d|0)!=0){nm(c[a+376>>2]|0,d,c[b>>2]<<2);c[e>>2]=0}b=a+220|0;d=c[b>>2]|0;if((d|0)!=0){nm(c[a+376>>2]|0,d,c[a+216>>2]<<3);c[b>>2]=0}b=a+232|0;d=c[b>>2]|0;if((d|0)!=0){nm(c[a+376>>2]|0,d,(c[a+228>>2]|0)*24|0);c[b>>2]=0}b=a+244|0;d=c[b>>2]|0;if((d|0)!=0){nm(c[a+376>>2]|0,d,(c[a+240>>2]|0)*28|0);c[b>>2]=0}b=a+256|0;d=c[b>>2]|0;if((d|0)!=0){nm(c[a+376>>2]|0,d,(c[a+252>>2]|0)*20|0);c[b>>2]=0}b=a+268|0;d=c[b>>2]|0;if((d|0)!=0){nm(c[a+376>>2]|0,d,(c[a+264>>2]|0)*60|0);c[b>>2]=0}b=a+208|0;d=c[b>>2]|0;if((d|0)==0){e=a+68|0;Dl(e);return}nm(c[a+376>>2]|0,d,c[a+204>>2]<<2);c[b>>2]=0;e=a+68|0;Dl(e);return}function qk(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0;e=b+376|0;f=c[(c[e>>2]|0)+102992>>2]|0;if((f|0)!=0){ub[c[(c[f>>2]|0)+16>>2]&255](f,d)}g=d+12|0;i=c[g>>2]|0;h=i<<4;f=h&16;if((((h|-17)^16)&i|0)!=0){a[b+20|0]=1}h=b+16|0;i=c[h>>2]|0;if((f&~i|0)!=0){c[h>>2]=i|f}c[g>>2]=f;h=c[d+4>>2]|0;f=c[d+8>>2]|0;if((h|0)<(f|0)){g=b+160|0;do{c[(c[g>>2]|0)+(h<<2)>>2]=0;h=h+1|0;}while((h|0)<(f|0))}g=d+20|0;h=c[g>>2]|0;f=d+24|0;if((h|0)!=0){c[h+24>>2]=c[f>>2]}h=c[f>>2]|0;if((h|0)!=0){c[h+20>>2]=c[g>>2]}g=b+304|0;if((c[g>>2]|0)!=(d|0)){h=b+300|0;i=c[h>>2]|0;i=i-1|0;c[h>>2]=i;h=c[e>>2]|0;h=h|0;i=d;nm(h,i,80);return}c[g>>2]=c[f>>2];h=b+300|0;i=c[h>>2]|0;i=i-1|0;c[h>>2]=i;h=c[e>>2]|0;h=h|0;i=d;nm(h,i,80);return}function rk(a){a=a|0;var b=0,d=0,e=0;b=a+152|0;d=c[b>>2]|0;if((d|0)!=0){e=d;c[b>>2]=e;return e|0}d=a+60|0;e=c[d>>2]|0;if((e|0)==0){sk(a,256);e=c[d>>2]|0}e=mm(c[a+376>>2]|0,e<<2)|0;en(e|0,0,c[d>>2]<<2|0)|0;c[b>>2]=e;return e|0}function sk(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0;d=c[a+64>>2]|0;if((d|0)!=0){b=(d|0)<(b|0)?d:b}i=a+108|0;d=c[i>>2]|0;if((d|0)!=0){b=(b|0)>(d|0)?d:b}h=a+116|0;d=c[h>>2]|0;if((d|0)!=0){b=(b|0)>(d|0)?d:b}g=a+124|0;d=c[g>>2]|0;if((d|0)!=0){b=(b|0)>(d|0)?d:b}f=a+156|0;d=c[f>>2]|0;if((d|0)!=0){b=(b|0)>(d|0)?d:b}e=a+168|0;d=c[e>>2]|0;if((d|0)!=0){b=(b|0)>(d|0)?d:b}d=a+60|0;m=c[d>>2]|0;if((m|0)>=(b|0)){return}j=a+96|0;o=c[j>>2]|0;p=(o|0)==0;do{if((c[a+100>>2]|0)==0&(p^1)){n=a+376|0;l=mm(c[n>>2]|0,b<<2)|0;k=l;if(p){break}p=m<<2;fn(l|0,o|0,p)|0;nm(c[n>>2]|0,o,p)}else{k=o}}while(0);c[j>>2]=k;k=c[d>>2]|0;c[a+76>>2]=b-k;j=a+104|0;l=c[j>>2]|0;do{if((c[i>>2]|0)==0){n=a+376|0;m=mm(c[n>>2]|0,b<<2)|0;i=m;if((l|0)==0){l=i;break}p=l;l=k<<2;fn(m|0,p|0,l)|0;nm(c[n>>2]|0,p,l);l=i}}while(0);c[j>>2]=l;i=(c[a+172>>2]|0)>0;l=c[d>>2]|0;j=a+176|0;k=c[j>>2]|0;m=(k|0)==0;do{if((c[a+180>>2]|0)==0&(m&i^1)){p=a+376|0;o=mm(c[p>>2]|0,b<<2)|0;n=o;if(m){k=n;break}m=k;k=l<<2;fn(o|0,m|0,k)|0;nm(c[p>>2]|0,m,k);k=n}}while(0);c[j>>2]=k;o=c[d>>2]|0;j=a+184|0;n=c[j>>2]|0;p=(n|0)==0;do{if((c[a+188>>2]|0)==0&(p&i^1)){l=a+376|0;m=mm(c[l>>2]|0,b<<2)|0;k=m;if(p){break}p=o<<2;fn(m|0,n|0,p)|0;nm(c[l>>2]|0,n,p)}else{k=n}}while(0);c[j>>2]=k;l=c[d>>2]|0;j=a+192|0;m=c[j>>2]|0;k=(m|0)==0;do{if((c[a+196>>2]|0)==0&(k&i^1)){n=a+376|0;i=mm(c[n>>2]|0,b<<2)|0;o=i;if(k){m=o;break}p=m;m=l<<2;fn(i|0,p|0,m)|0;nm(c[n>>2]|0,p,m);m=o}}while(0);c[j>>2]=m;k=c[d>>2]|0;i=a+112|0;j=c[i>>2]|0;do{if((c[h>>2]|0)==0){m=a+376|0;l=mm(c[m>>2]|0,b<<3)|0;h=l;if((j|0)==0){j=h;break}p=j;j=k<<3;fn(l|0,p|0,j)|0;nm(c[m>>2]|0,p,j);j=h}}while(0);c[i>>2]=j;k=c[d>>2]|0;h=a+120|0;j=c[h>>2]|0;do{if((c[g>>2]|0)==0){g=a+376|0;i=b<<3;m=mm(c[g>>2]|0,i)|0;l=m;if((j|0)==0){j=l;break}p=j;j=k<<3;fn(m|0,p|0,j)|0;nm(c[g>>2]|0,p,j);j=l}else{g=a+376|0;i=b<<3}}while(0);c[h>>2]=j;j=a+128|0;l=c[j>>2]|0;k=c[d>>2]|0;h=mm(c[g>>2]|0,i)|0;if((l|0)!=0){o=l;p=k<<3;fn(h|0,o|0,p)|0;nm(c[g>>2]|0,o,p)}c[j>>2]=h;l=a+132|0;m=c[l>>2]|0;j=c[d>>2]|0;h=b<<2;k=mm(c[g>>2]|0,h)|0;if((m|0)!=0){o=m;p=j<<2;fn(k|0,o|0,p)|0;nm(c[g>>2]|0,o,p)}c[l>>2]=k;j=a+136|0;k=c[j>>2]|0;if((k|0)==0){k=0}else{n=c[d>>2]|0;p=mm(c[g>>2]|0,h)|0;o=k;k=n<<2;fn(p|0,o|0,k)|0;nm(c[g>>2]|0,o,k);k=p}c[j>>2]=k;k=a+140|0;m=c[k>>2]|0;l=c[d>>2]|0;j=mm(c[g>>2]|0,h)|0;if((m|0)!=0){o=m;p=l<<2;fn(j|0,o|0,p)|0;nm(c[g>>2]|0,o,p)}c[k>>2]=j;j=a+144|0;k=c[j>>2]|0;if((k|0)==0){i=0}else{p=c[d>>2]|0;i=mm(c[g>>2]|0,i)|0;o=k;p=p<<3;fn(i|0,o|0,p)|0;nm(c[g>>2]|0,o,p)}c[j>>2]=i;i=a+148|0;j=c[i>>2]|0;if((j|0)==0){j=0}else{n=c[d>>2]|0;p=mm(c[g>>2]|0,h)|0;o=j;j=n<<2;fn(p|0,o|0,j)|0;nm(c[g>>2]|0,o,j);j=p}c[i>>2]=j;j=c[d>>2]|0;i=a+152|0;k=c[i>>2]|0;l=(k|0)==0;do{if((c[f>>2]|0)==0&(l^1)){f=mm(c[g>>2]|0,h)|0;m=f;if(l){k=m;break}p=k|0;k=j<<2;fn(f|0,p|0,k)|0;nm(c[g>>2]|0,p,k);k=m}}while(0);c[i>>2]=k;i=a+160|0;k=c[i>>2]|0;j=c[d>>2]|0;f=mm(c[g>>2]|0,h)|0;if((k|0)!=0){o=k;p=j<<2;fn(f|0,o|0,p)|0;nm(c[g>>2]|0,o,p)}c[i>>2]=f;i=c[d>>2]|0;f=a+164|0;j=c[f>>2]|0;k=(j|0)==0;do{if((c[e>>2]|0)==0&(k^1)){e=mm(c[g>>2]|0,h)|0;l=e;if(k){j=l;break}p=j;j=i<<2;fn(e|0,p|0,j)|0;nm(c[g>>2]|0,p,j);j=l}}while(0);c[f>>2]=j;k=c[d>>2]|0;e=a+272|0;j=c[e>>2]|0;l=(j|0)==0;do{if((c[a+276>>2]|0)==0&(l^1)){f=mm(c[g>>2]|0,h)|0;i=f;if(l){break}o=j;p=k<<2;fn(f|0,o|0,p)|0;nm(c[g>>2]|0,o,p)}else{i=j}}while(0);c[e>>2]=i;i=c[d>>2]|0;e=a+280|0;j=c[e>>2]|0;f=(j|0)==0;do{if((c[a+284>>2]|0)==0&(f^1)){h=mm(c[g>>2]|0,h)|0;a=h;if(f){j=a;break}p=j;j=i<<2;fn(h|0,p|0,j)|0;nm(c[g>>2]|0,p,j);j=a}}while(0);c[e>>2]=j;c[d>>2]=b;return}function tk(b,d){b=b|0;d=d|0;var e=0,f=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0.0,q=0;h=b+376|0;if((c[(c[h>>2]|0)+102876>>2]&2|0)!=0){o=0;return o|0}k=b+56|0;f=c[k>>2]|0;i=b+60|0;e=c[i>>2]|0;if((f|0)>=(e|0)){sk(b,(f|0)==0?256:f<<1);f=c[k>>2]|0;e=c[i>>2]|0}do{if((f|0)<(e|0)){l=b+104|0}else{if((a[b+368|0]|0)==0){o=-1;return o|0}else{e=c[b+280>>2]|0;f=c[e+(f-1<<2)>>2]|0;f=+(c[(c[b+272>>2]|0)+(f<<2)>>2]|0)>0.0?f:c[e>>2]|0;l=b+104|0;xk(b,f,c[(c[l>>2]|0)+(f<<2)>>2]|2);uk(b);f=c[k>>2]|0;break}}}while(0);e=f+1|0;c[k>>2]=e;c[(c[l>>2]|0)+(f<<2)>>2]=0;k=c[b+176>>2]|0;if((k|0)!=0){c[k+(f<<2)>>2]=0}k=c[b+184>>2]|0;if((k|0)!=0){c[k+(f<<2)>>2]=0}k=c[b+192>>2]|0;if((k|0)!=0){c[k+(f<<2)>>2]=0}n=d+4|0;o=(c[b+112>>2]|0)+(f<<3)|0;k=c[n+4>>2]|0;c[o>>2]=c[n>>2];c[o+4>>2]=k;o=d+12|0;k=(c[b+120>>2]|0)+(f<<3)|0;n=c[o+4>>2]|0;c[k>>2]=c[o>>2];c[k+4>>2]=n;g[(c[b+132>>2]|0)+(f<<2)>>2]=0.0;k=(c[b+128>>2]|0)+(f<<3)|0;n=8376;o=c[n+4>>2]|0;c[k>>2]=c[n>>2];c[k+4>>2]=o;k=c[b+136>>2]|0;if((k|0)!=0){g[k+(f<<2)>>2]=0.0}k=c[b+148>>2]|0;if((k|0)!=0){g[k+(f<<2)>>2]=0.0}l=b+152|0;m=c[l>>2]|0;k=d+20|0;a:do{if((m|0)==0){do{if((a[k]|0)==0){if((a[d+21|0]|0)!=0){break}if((a[d+22|0]|0)!=0){break}if((a[d+23|0]|0)==0){break a}}}while(0);j=c[i>>2]|0;if((j|0)==0){sk(b,256);j=c[i>>2]|0}m=mm(c[h>>2]|0,j<<2)|0;en(m|0,0,c[i>>2]<<2|0)|0;j=26}else{j=26}}while(0);if((j|0)==26){c[l>>2]=m;l=a[d+21|0]|0;n=a[d+22|0]|0;o=a[d+23|0]|0;a[m+(f<<2)|0]=a[k]|0;a[m+(f<<2)+1|0]=l;a[m+(f<<2)+2|0]=n;a[m+(f<<2)+3|0]=o}l=b+164|0;m=c[l>>2]|0;k=d+28|0;do{if((m|0)==0){if((c[k>>2]|0)==0){break}j=c[i>>2]|0;if((j|0)==0){sk(b,256);j=c[i>>2]|0}m=mm(c[h>>2]|0,j<<2)|0;en(m|0,0,c[i>>2]<<2|0)|0;j=32}else{j=32}}while(0);if((j|0)==32){c[l>>2]=m;c[m+(f<<2)>>2]=c[k>>2]}i=c[b+96>>2]|0;if((i|0)!=0){c[i+(f<<2)>>2]=0}j=b+220|0;m=c[j>>2]|0;i=b+212|0;n=c[i>>2]|0;l=b+216|0;k=c[l>>2]|0;if((k|0)<=(n|0)){n=(n|0)==0?256:n<<1;o=mm(c[h>>2]|0,n<<3)|0;if((m|0)!=0){q=m;m=k<<3;fn(o|0,q|0,m)|0;nm(c[h>>2]|0,q,m)}c[l>>2]=n;m=o}c[j>>2]=m;p=+g[d+24>>2];h=p>0.0;if((c[b+272>>2]|0)!=0|h){if(!h){h=c[b+292>>2]|0;p=+g[b+372>>2]*+(((h|0)<0?-h|0:0)-h|0)}vk(b,f,p);c[(c[b+280>>2]|0)+(f<<2)>>2]=f;m=c[j>>2]|0}j=c[i>>2]|0;c[i>>2]=j+1;c[m+(j<<3)>>2]=f;j=c[d+32>>2]|0;c[(c[b+160>>2]|0)+(f<<2)>>2]=j;do{if((j|0)!=0){h=j+4|0;i=c[h>>2]|0;k=j+8|0;j=c[k>>2]|0;if((i|0)<(j|0)){wk(b,i,j,f);c[k>>2]=e;break}else{c[h>>2]=f;c[k>>2]=e;break}}}while(0);xk(b,f,c[d>>2]|0);q=f;return q|0}function uk(b){b=b|0;var d=0,e=0,f=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0;e=b+376|0;d=b+56|0;f=Gm((c[e>>2]|0)+76|0,c[d>>2]<<2)|0;h=f;if((c[d>>2]|0)>0){p=b+104|0;l=b+96|0;A=b+176|0;n=b+184|0;m=b+192|0;w=b+112|0;x=b+120|0;y=b+160|0;z=b+21|0;u=b+136|0;t=b+148|0;s=b+152|0;q=b+164|0;o=b+272|0;v=b+128|0;r=b+80|0;B=0;i=0;j=0;do{E=c[p>>2]|0;C=c[E+(B<<2)>>2]|0;if((C&2|0)==0){c[h+(B<<2)>>2]=j;do{if((B|0)!=(j|0)){D=c[l>>2]|0;if((D|0)!=0){E=c[D+(B<<2)>>2]|0;if((E|0)!=0){c[E+8>>2]=j}c[D+(j<<2)>>2]=E;E=c[p>>2]|0}c[E+(j<<2)>>2]=c[E+(B<<2)>>2];D=c[A>>2]|0;if((D|0)!=0){c[D+(j<<2)>>2]=c[D+(B<<2)>>2]}D=c[n>>2]|0;if((D|0)!=0){c[D+(j<<2)>>2]=c[D+(B<<2)>>2]}D=c[m>>2]|0;if((D|0)!=0){c[D+(j<<2)>>2]=c[D+(B<<2)>>2]}E=c[w>>2]|0;D=E+(B<<3)|0;E=E+(j<<3)|0;F=c[D+4>>2]|0;c[E>>2]=c[D>>2];c[E+4>>2]=F;E=c[x>>2]|0;F=E+(B<<3)|0;E=E+(j<<3)|0;D=c[F+4>>2]|0;c[E>>2]=c[F>>2];c[E+4>>2]=D;E=c[y>>2]|0;c[E+(j<<2)>>2]=c[E+(B<<2)>>2];if((a[z]|0)!=0){F=c[v>>2]|0;D=F+(B<<3)|0;F=F+(j<<3)|0;E=c[D+4>>2]|0;c[F>>2]=c[D>>2];c[F+4>>2]=E}D=c[u>>2]|0;if((D|0)!=0){g[D+(j<<2)>>2]=+g[D+(B<<2)>>2]}D=c[t>>2]|0;if((D|0)!=0){g[D+(j<<2)>>2]=+g[D+(B<<2)>>2]}D=c[s>>2]|0;if((D|0)!=0){G=a[D+(B<<2)+1|0]|0;E=a[D+(B<<2)+2|0]|0;F=a[D+(B<<2)+3|0]|0;a[D+(j<<2)|0]=a[D+(B<<2)|0]|0;a[D+(j<<2)+1|0]=G;a[D+(j<<2)+2|0]=E;a[D+(j<<2)+3|0]=F}D=c[q>>2]|0;if((D|0)!=0){c[D+(j<<2)>>2]=c[D+(B<<2)>>2]}D=c[o>>2]|0;if((D|0)==0){break}c[D+(j<<2)>>2]=c[D+(B<<2)>>2]}}while(0);j=j+1|0;i=C|i}else{D=c[(c[e>>2]|0)+102992>>2]|0;if(!((C&512|0)==0|(D|0)==0)){xb[c[(c[D>>2]|0)+20>>2]&31](D,b,B)}C=c[l>>2]|0;do{if((C|0)!=0){D=C+(B<<2)|0;C=c[D>>2]|0;if((C|0)==0){break}c[C+8>>2]=-1;c[D>>2]=0;jm(r,C|0)}}while(0);c[h+(B<<2)>>2]=-1}B=B+1|0;}while((B|0)<(c[d>>2]|0))}else{i=0;j=0}l=b+212|0;p=c[l>>2]|0;m=b+220|0;n=c[m>>2]|0;if((p|0)>0){o=0;do{p=n+(o<<3)|0;c[p>>2]=c[h+(c[p>>2]<<2)>>2];o=o+1|0;p=c[l>>2]|0;}while((o|0)<(p|0))}o=n+(p<<3)|0;q=n;while(1){if((q|0)==(o|0)){break}if((c[q>>2]|0)<0){p=q;n=q;k=40;break}else{q=q+8|0}}if((k|0)==40){a:while(1){k=0;do{p=p+8|0;if((p|0)==(o|0)){break a}}while((c[p>>2]|0)<0);F=p;k=n;G=c[F+4>>2]|0;c[k>>2]=c[F>>2];c[k+4>>2]=G;n=n+8|0;k=40}o=n;n=c[m>>2]|0}c[l>>2]=o-n>>3;l=b+224|0;n=c[l>>2]|0;m=b+232|0;o=c[m>>2]|0;if((n|0)>0){p=0;do{n=o+(p*24|0)|0;c[n>>2]=c[h+(c[n>>2]<<2)>>2];n=o+(p*24|0)+4|0;c[n>>2]=c[h+(c[n>>2]<<2)>>2];p=p+1|0;n=c[l>>2]|0;}while((p|0)<(n|0))}n=o+(n*24|0)|0;q=o;while(1){if((q|0)==(n|0)){break}if((c[q>>2]|0)<0){k=50;break}p=q+24|0;if((c[q+4>>2]|0)<0){k=52;break}else{q=p}}if((k|0)==50){p=q+24|0;k=52}if((k|0)==52){b:do{if((p|0)==(n|0)){n=q}else{o=q;while(1){while(1){if((c[p>>2]|0)>=0){if((c[q+28>>2]|0)>=0){break}}r=p+24|0;if((r|0)==(n|0)){n=o;break b}else{q=p;p=r}}r=o;G=p;c[r>>2]=c[G>>2];c[r+4>>2]=c[G+4>>2];c[r+8>>2]=c[G+8>>2];c[r+12>>2]=c[G+12>>2];c[r+16>>2]=c[G+16>>2];c[r+20>>2]=c[G+20>>2];o=o+24|0;r=p+24|0;if((r|0)==(n|0)){n=o;break}else{q=p;p=r}}}}while(0);o=c[m>>2]|0}c[l>>2]=(n-o|0)/24|0;l=b+236|0;o=c[l>>2]|0;m=b+244|0;n=c[m>>2]|0;if((o|0)>0){p=0;do{o=n+(p*28|0)|0;c[o>>2]=c[h+(c[o>>2]<<2)>>2];p=p+1|0;o=c[l>>2]|0;}while((p|0)<(o|0))}o=n+(o*28|0)|0;q=n;while(1){if((q|0)==(o|0)){break}if((c[q>>2]|0)<0){p=q;n=q;k=64;break}else{q=q+28|0}}if((k|0)==64){c:while(1){k=0;do{p=p+28|0;if((p|0)==(o|0)){break c}}while((c[p>>2]|0)<0);k=n;G=p;c[k>>2]=c[G>>2];c[k+4>>2]=c[G+4>>2];c[k+8>>2]=c[G+8>>2];c[k+12>>2]=c[G+12>>2];c[k+16>>2]=c[G+16>>2];c[k+20>>2]=c[G+20>>2];c[k+24>>2]=c[G+24>>2];n=n+28|0;k=64}o=n;n=c[m>>2]|0}c[l>>2]=(o-n|0)/28|0;l=b+248|0;n=c[l>>2]|0;m=b+256|0;o=c[m>>2]|0;if((n|0)>0){p=0;do{n=o+(p*20|0)|0;c[n>>2]=c[h+(c[n>>2]<<2)>>2];n=o+(p*20|0)+4|0;c[n>>2]=c[h+(c[n>>2]<<2)>>2];p=p+1|0;n=c[l>>2]|0;}while((p|0)<(n|0))}n=o+(n*20|0)|0;q=o;while(1){if((q|0)==(n|0)){break}if((c[q>>2]|0)<0){k=74;break}p=q+20|0;if((c[q+4>>2]|0)<0){k=76;break}else{q=p}}if((k|0)==74){p=q+20|0;k=76}if((k|0)==76){d:do{if((p|0)==(n|0)){n=q}else{o=q;while(1){while(1){if((c[p>>2]|0)>=0){if((c[q+24>>2]|0)>=0){break}}r=p+20|0;if((r|0)==(n|0)){n=o;break d}else{q=p;p=r}}r=o;G=p;c[r>>2]=c[G>>2];c[r+4>>2]=c[G+4>>2];c[r+8>>2]=c[G+8>>2];c[r+12>>2]=c[G+12>>2];c[r+16>>2]=c[G+16>>2];o=o+20|0;r=p+20|0;if((r|0)==(n|0)){n=o;break}else{q=p;p=r}}}}while(0);o=c[m>>2]|0}c[l>>2]=(n-o|0)/20|0;l=b+260|0;p=c[l>>2]|0;m=b+268|0;o=c[m>>2]|0;if((p|0)>0){n=0;do{p=o+(n*60|0)|0;c[p>>2]=c[h+(c[p>>2]<<2)>>2];p=o+(n*60|0)+4|0;c[p>>2]=c[h+(c[p>>2]<<2)>>2];p=o+(n*60|0)+8|0;c[p>>2]=c[h+(c[p>>2]<<2)>>2];n=n+1|0;p=c[l>>2]|0;}while((n|0)<(p|0))}n=o+(p*60|0)|0;p=o;while(1){if((p|0)==(n|0)){break}if((c[p>>2]|0)<0){k=90;break}if((c[p+4>>2]|0)<0){k=90;break}if((c[p+8>>2]|0)<0){k=90;break}else{p=p+60|0}}if((k|0)==90){o=p+60|0;e:do{if((o|0)==(n|0)){n=p}else{k=p;while(1){f:while(1){do{if((c[o>>2]|0)>=0){if((c[p+64>>2]|0)<0){break}if((c[p+68>>2]|0)>=0){break f}}}while(0);q=o+60|0;if((q|0)==(n|0)){n=k;break e}else{p=o;o=q}}fn(k|0,o|0,60)|0;k=k+60|0;q=o+60|0;if((q|0)==(n|0)){n=k;break}else{p=o;o=q}}}}while(0);o=c[m>>2]|0}c[l>>2]=(n-o|0)/60|0;k=c[b+280>>2]|0;do{if((k|0)!=0){n=c[d>>2]|0;if((n|0)>0){m=0;l=0}else{break}do{o=c[h+(c[k+(l<<2)>>2]<<2)>>2]|0;if(!((o|0)==-1)){c[k+(m<<2)>>2]=o;m=m+1|0;n=c[d>>2]|0}l=l+1|0;}while((l|0)<(n|0))}}while(0);k=b+304|0;p=c[k>>2]|0;if((p|0)!=0){l=b+16|0;o=b+148|0;n=b+60|0;m=b+20|0;do{r=p+4|0;w=c[r>>2]|0;q=p+8|0;s=c[q>>2]|0;if((w|0)<(s|0)){u=j;v=0;t=0;do{x=c[h+(w<<2)>>2]|0;if((x|0)>-1){y=x+1|0;v=(v|0)>(y|0)?v:y;u=(u|0)<(x|0)?u:x}else{t=1}w=w+1|0;}while((w|0)<(s|0))}else{u=j;v=0;t=0}do{if((u|0)<(v|0)){c[r>>2]=u;c[q>>2]=v;if(!t){break}q=p+12|0;r=c[q>>2]|0;if((r&1|0)==0){break}r=r|16;s=c[l>>2]|0;if((r&~s|0)!=0){t=c[o>>2]|0;if((t|0)==0){s=c[n>>2]|0;if((s|0)==0){sk(b,256);s=c[n>>2]|0}t=mm(c[e>>2]|0,s<<2)|0;en(t|0,0,c[n>>2]<<2|0)|0;s=c[l>>2]|0}c[o>>2]=t;c[l>>2]=s|r}c[q>>2]=r}else{c[r>>2]=0;c[q>>2]=0;r=p+12|0;t=c[r>>2]|0;if((t&4|0)!=0){break}q=t|8;if(((t&-9^-9)&t|0)!=0){a[m]=1}s=c[l>>2]|0;if((q&~s|0)!=0){if((t&1|0)!=0){t=c[o>>2]|0;if((t|0)==0){s=c[n>>2]|0;if((s|0)==0){sk(b,256);s=c[n>>2]|0}t=mm(c[e>>2]|0,s<<2)|0;en(t|0,0,c[n>>2]<<2|0)|0;s=c[l>>2]|0}c[o>>2]=t}c[l>>2]=s|q}c[r>>2]=q}}while(0);p=c[p+24>>2]|0;}while((p|0)!=0)}c[d>>2]=j;Im((c[e>>2]|0)+76|0,f);c[b+8>>2]=i;a[b+12|0]=0;d=c[k>>2]|0;if((d|0)==0){return}while(1){e=c[d+24>>2]|0;if((c[d+12>>2]&8|0)!=0){qk(b,d)}if((e|0)==0){break}else{d=e}}return}function vk(b,d,e){b=b|0;d=d|0;e=+e;var f=0,h=0,i=0,j=0,k=0;i=b+280|0;k=c[i>>2]|0;h=(k|0)==0;f=b+272|0;j=c[f>>2]|0;if((j|0)==0){j=b+60|0;k=c[j>>2]|0;if((k|0)==0){sk(b,256);k=c[j>>2]|0}k=mm(c[b+376>>2]|0,k<<2)|0;en(k|0,0,c[j>>2]<<2|0)|0;j=k;k=c[i>>2]|0}c[f>>2]=j;if((k|0)==0){j=b+60|0;k=c[j>>2]|0;if((k|0)==0){sk(b,256);k=c[j>>2]|0}k=mm(c[b+376>>2]|0,k<<2)|0;en(k|0,0,c[j>>2]<<2|0)|0}c[i>>2]=k;do{if(h){h=c[b+56>>2]|0;if((h|0)>0){i=0}else{break}do{c[k+(i<<2)>>2]=i;i=i+1|0;}while((i|0)<(h|0))}}while(0);h=~~(e/+g[b+372>>2]);if((h|0)>0){h=(c[b+292>>2]|0)+h|0}f=(c[f>>2]|0)+(d<<2)|0;if((h|0)==(c[f>>2]|0)){return}c[f>>2]=h;a[b+296|0]=1;return}function wk(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0.0,t=0,u=0;if((d|0)==(e|0)|(e|0)==(f|0)){return}h=c[b+104>>2]|0;i=h+(d<<2)|0;l=h+(e<<2)|0;k=h+(f<<2)|0;j=i;a:do{if((d+1|0)==(e|0)){t=c[i>>2]|0;u=k-l|0;gn(j|0,l|0,u|0)|0;c[h+((u>>2)+d<<2)>>2]=t}else{if((e+1|0)==(f|0)){t=h+(f-1<<2)|0;u=c[t>>2]|0;t=t-i|0;gn(h+(f-(t>>2)<<2)|0,j|0,t|0)|0;c[i>>2]=u;break}n=l;j=n-i>>2;n=k-n>>2;if((j|0)==(n|0)){h=l;while(1){u=c[i>>2]|0;c[i>>2]=c[h>>2];c[h>>2]=u;i=i+4|0;if((i|0)==(l|0)){break a}else{h=h+4|0}}}else{l=j}while(1){m=(l|0)%(n|0)|0;if((m|0)==0){break}else{l=n;n=m}}if((n|0)==0){break}l=j-1|0;m=j+d|0;p=h+(n+d<<2)|0;while(1){o=p-4|0;n=c[o>>2]|0;p=p+(l<<2)|0;r=o;while(1){c[r>>2]=c[p>>2];q=k-p>>2;if((j|0)<(q|0)){q=p+(j<<2)|0}else{q=h+(m-q<<2)|0}if((q|0)==(o|0)){break}else{r=p;p=q}}c[p>>2]=n;if((o|0)==(i|0)){break}else{p=o}}}}while(0);h=c[b+176>>2]|0;b:do{if((h|0)!=0){i=h+(d<<2)|0;l=h+(e<<2)|0;k=h+(f<<2)|0;j=i;if((d+1|0)==(e|0)){t=c[i>>2]|0;u=k-l|0;gn(j|0,l|0,u|0)|0;c[h+((u>>2)+d<<2)>>2]=t;break}if((e+1|0)==(f|0)){t=h+(f-1<<2)|0;u=c[t>>2]|0;t=t-i|0;gn(h+(f-(t>>2)<<2)|0,j|0,t|0)|0;c[i>>2]=u;break}n=l;j=n-i>>2;n=k-n>>2;if((j|0)==(n|0)){h=l;while(1){u=c[i>>2]|0;c[i>>2]=c[h>>2];c[h>>2]=u;i=i+4|0;if((i|0)==(l|0)){break b}else{h=h+4|0}}}else{l=j}while(1){m=(l|0)%(n|0)|0;if((m|0)==0){break}else{l=n;n=m}}if((n|0)==0){break}m=j-1|0;l=j+d|0;p=h+(n+d<<2)|0;while(1){n=p-4|0;o=c[n>>2]|0;p=p+(m<<2)|0;q=n;while(1){c[q>>2]=c[p>>2];q=k-p>>2;if((j|0)<(q|0)){r=p+(j<<2)|0}else{r=h+(l-q<<2)|0}if((r|0)==(n|0)){break}else{q=p;p=r}}c[p>>2]=o;if((n|0)==(i|0)){break}else{p=n}}}}while(0);h=c[b+184>>2]|0;c:do{if((h|0)!=0){i=h+(d<<2)|0;l=h+(e<<2)|0;k=h+(f<<2)|0;j=i;if((d+1|0)==(e|0)){t=c[i>>2]|0;u=k-l|0;gn(j|0,l|0,u|0)|0;c[h+((u>>2)+d<<2)>>2]=t;break}if((e+1|0)==(f|0)){t=h+(f-1<<2)|0;u=c[t>>2]|0;t=t-i|0;gn(h+(f-(t>>2)<<2)|0,j|0,t|0)|0;c[i>>2]=u;break}n=l;j=n-i>>2;n=k-n>>2;if((j|0)==(n|0)){h=l;while(1){u=c[i>>2]|0;c[i>>2]=c[h>>2];c[h>>2]=u;i=i+4|0;if((i|0)==(l|0)){break c}else{h=h+4|0}}}else{l=j}while(1){m=(l|0)%(n|0)|0;if((m|0)==0){break}else{l=n;n=m}}if((n|0)==0){break}m=j-1|0;l=j+d|0;p=h+(n+d<<2)|0;while(1){n=p-4|0;o=c[n>>2]|0;p=p+(m<<2)|0;r=n;while(1){c[r>>2]=c[p>>2];q=k-p>>2;if((j|0)<(q|0)){q=p+(j<<2)|0}else{q=h+(l-q<<2)|0}if((q|0)==(n|0)){break}else{r=p;p=q}}c[p>>2]=o;if((n|0)==(i|0)){break}else{p=n}}}}while(0);i=c[b+192>>2]|0;d:do{if((i|0)!=0){h=i+(d<<2)|0;l=i+(e<<2)|0;k=i+(f<<2)|0;j=h;if((d+1|0)==(e|0)){t=c[h>>2]|0;u=k-l|0;gn(j|0,l|0,u|0)|0;c[i+((u>>2)+d<<2)>>2]=t;break}if((e+1|0)==(f|0)){t=i+(f-1<<2)|0;u=c[t>>2]|0;t=t-h|0;gn(i+(f-(t>>2)<<2)|0,j|0,t|0)|0;c[h>>2]=u;break}n=l;j=n-h>>2;n=k-n>>2;if((j|0)==(n|0)){i=l;while(1){u=c[h>>2]|0;c[h>>2]=c[i>>2];c[i>>2]=u;h=h+4|0;if((h|0)==(l|0)){break d}else{i=i+4|0}}}else{l=j}while(1){m=(l|0)%(n|0)|0;if((m|0)==0){break}else{l=n;n=m}}if((n|0)==0){break}m=j-1|0;l=j+d|0;p=i+(n+d<<2)|0;while(1){n=p-4|0;o=c[n>>2]|0;p=p+(m<<2)|0;r=n;while(1){c[r>>2]=c[p>>2];q=k-p>>2;if((j|0)<(q|0)){q=p+(j<<2)|0}else{q=i+(l-q<<2)|0}if((q|0)==(n|0)){break}else{r=p;p=q}}c[p>>2]=o;if((n|0)==(h|0)){break}else{p=n}}}}while(0);i=c[b+112>>2]|0;h=i+(d<<3)|0;l=i+(e<<3)|0;k=i+(f<<3)|0;j=h;e:do{if((d+1|0)==(e|0)){t=h;r=c[t>>2]|0;t=c[t+4>>2]|0;u=k-l|0;gn(j|0,l|0,u|0)|0;u=i+((u>>3)+d<<3)|0;c[u>>2]=r;c[u+4>>2]=t}else{if((e+1|0)==(f|0)){u=i+(f-1<<3)|0;t=u;r=c[t>>2]|0;t=c[t+4>>2]|0;u=u-h|0;gn(i+(f-(u>>3)<<3)|0,j|0,u|0)|0;u=h;c[u>>2]=r;c[u+4>>2]=t;break}n=l;j=n-h>>3;n=k-n>>3;if((j|0)==(n|0)){i=l;while(1){q=h;r=c[q>>2]|0;t=c[q+4>>2]|0;u=i;p=c[u+4>>2]|0;c[q>>2]=c[u>>2];c[q+4>>2]=p;c[u>>2]=r;c[u+4>>2]=t;h=h+8|0;if((h|0)==(l|0)){break e}else{i=i+8|0}}}else{l=j}while(1){m=(l|0)%(n|0)|0;if((m|0)==0){break}else{l=n;n=m}}if((n|0)==0){break}l=j-1|0;m=j+d|0;q=i+(n+d<<3)|0;while(1){o=q-8|0;n=o;p=c[n>>2]|0;n=c[n+4>>2]|0;q=q+(l<<3)|0;t=o;while(1){r=q;u=c[r+4>>2]|0;c[t>>2]=c[r>>2];c[t+4>>2]=u;t=k-q>>3;if((j|0)<(t|0)){u=q+(j<<3)|0}else{u=i+(m-t<<3)|0}if((u|0)==(o|0)){break}else{t=q;q=u}}c[r>>2]=p;c[r+4>>2]=n;if((o|0)==(h|0)){break}else{q=o}}}}while(0);i=c[b+120>>2]|0;h=i+(d<<3)|0;l=i+(e<<3)|0;k=i+(f<<3)|0;j=h;f:do{if((d+1|0)==(e|0)){t=h;r=c[t>>2]|0;t=c[t+4>>2]|0;u=k-l|0;gn(j|0,l|0,u|0)|0;u=i+((u>>3)+d<<3)|0;c[u>>2]=r;c[u+4>>2]=t}else{if((e+1|0)==(f|0)){u=i+(f-1<<3)|0;t=u;r=c[t>>2]|0;t=c[t+4>>2]|0;u=u-h|0;gn(i+(f-(u>>3)<<3)|0,j|0,u|0)|0;u=h;c[u>>2]=r;c[u+4>>2]=t;break}n=l;j=n-h>>3;n=k-n>>3;if((j|0)==(n|0)){i=l;while(1){q=h;r=c[q>>2]|0;t=c[q+4>>2]|0;u=i;p=c[u+4>>2]|0;c[q>>2]=c[u>>2];c[q+4>>2]=p;c[u>>2]=r;c[u+4>>2]=t;h=h+8|0;if((h|0)==(l|0)){break f}else{i=i+8|0}}}else{l=j}while(1){m=(l|0)%(n|0)|0;if((m|0)==0){break}else{l=n;n=m}}if((n|0)==0){break}m=j-1|0;l=j+d|0;q=i+(n+d<<3)|0;while(1){p=q-8|0;n=p;o=c[n>>2]|0;n=c[n+4>>2]|0;r=q+(m<<3)|0;u=p;while(1){q=r;t=u;u=c[q+4>>2]|0;c[t>>2]=c[q>>2];c[t+4>>2]=u;t=k-r>>3;if((j|0)<(t|0)){t=r+(j<<3)|0}else{t=i+(l-t<<3)|0}if((t|0)==(p|0)){break}else{u=r;r=t}}c[q>>2]=o;c[q+4>>2]=n;if((p|0)==(h|0)){break}else{q=p}}}}while(0);i=c[b+160>>2]|0;h=i+(d<<2)|0;l=i+(e<<2)|0;k=i+(f<<2)|0;j=h;g:do{if((d+1|0)==(e|0)){t=c[h>>2]|0;u=k-l|0;gn(j|0,l|0,u|0)|0;c[i+((u>>2)+d<<2)>>2]=t}else{if((e+1|0)==(f|0)){t=i+(f-1<<2)|0;u=c[t>>2]|0;t=t-h|0;gn(i+(f-(t>>2)<<2)|0,j|0,t|0)|0;c[h>>2]=u;break}n=l;j=n-h>>2;n=k-n>>2;if((j|0)==(n|0)){i=l;while(1){u=c[h>>2]|0;c[h>>2]=c[i>>2];c[i>>2]=u;h=h+4|0;if((h|0)==(l|0)){break g}else{i=i+4|0}}}else{l=j}while(1){m=(l|0)%(n|0)|0;if((m|0)==0){break}else{l=n;n=m}}if((n|0)==0){break}l=j-1|0;m=j+d|0;p=i+(n+d<<2)|0;while(1){o=p-4|0;n=c[o>>2]|0;p=p+(l<<2)|0;q=o;while(1){c[q>>2]=c[p>>2];q=k-p>>2;if((j|0)<(q|0)){r=p+(j<<2)|0}else{r=i+(m-q<<2)|0}if((r|0)==(o|0)){break}else{q=p;p=r}}c[p>>2]=n;if((o|0)==(h|0)){break}else{p=o}}}}while(0);h:do{if((a[b+21|0]|0)!=0){i=c[b+128>>2]|0;h=i+(d<<3)|0;l=i+(e<<3)|0;k=i+(f<<3)|0;j=h;if((d+1|0)==(e|0)){t=h;r=c[t>>2]|0;t=c[t+4>>2]|0;u=k-l|0;gn(j|0,l|0,u|0)|0;u=i+((u>>3)+d<<3)|0;c[u>>2]=r;c[u+4>>2]=t;break}if((e+1|0)==(f|0)){u=i+(f-1<<3)|0;t=u;r=c[t>>2]|0;t=c[t+4>>2]|0;u=u-h|0;gn(i+(f-(u>>3)<<3)|0,j|0,u|0)|0;u=h;c[u>>2]=r;c[u+4>>2]=t;break}n=l;j=n-h>>3;n=k-n>>3;if((j|0)==(n|0)){i=l;while(1){q=h;r=c[q>>2]|0;t=c[q+4>>2]|0;u=i;p=c[u+4>>2]|0;c[q>>2]=c[u>>2];c[q+4>>2]=p;c[u>>2]=r;c[u+4>>2]=t;h=h+8|0;if((h|0)==(l|0)){break h}else{i=i+8|0}}}else{l=j}while(1){m=(l|0)%(n|0)|0;if((m|0)==0){break}else{l=n;n=m}}if((n|0)==0){break}l=j-1|0;m=j+d|0;q=i+(n+d<<3)|0;while(1){n=q-8|0;o=n;p=c[o>>2]|0;o=c[o+4>>2]|0;q=q+(l<<3)|0;u=n;while(1){r=q;t=u;u=c[r+4>>2]|0;c[t>>2]=c[r>>2];c[t+4>>2]=u;t=k-q>>3;if((j|0)<(t|0)){t=q+(j<<3)|0}else{t=i+(m-t<<3)|0}if((t|0)==(n|0)){break}else{u=q;q=t}}c[r>>2]=p;c[r+4>>2]=o;if((n|0)==(h|0)){break}else{q=n}}}}while(0);i=c[b+136>>2]|0;i:do{if((i|0)!=0){h=i+(d<<2)|0;l=i+(e<<2)|0;k=i+(f<<2)|0;j=h;if((d+1|0)==(e|0)){s=+g[h>>2];u=k-l|0;gn(j|0,l|0,u|0)|0;g[i+((u>>2)+d<<2)>>2]=s;break}if((e+1|0)==(f|0)){u=i+(f-1<<2)|0;s=+g[u>>2];u=u-h|0;gn(i+(f-(u>>2)<<2)|0,j|0,u|0)|0;g[h>>2]=s;break}n=l;j=n-h>>2;n=k-n>>2;if((j|0)==(n|0)){i=l;while(1){s=+g[h>>2];g[h>>2]=+g[i>>2];g[i>>2]=s;h=h+4|0;if((h|0)==(l|0)){break i}else{i=i+4|0}}}else{l=j}while(1){m=(l|0)%(n|0)|0;if((m|0)==0){break}else{l=n;n=m}}if((n|0)==0){break}l=j-1|0;m=j+d|0;o=i+(n+d<<2)|0;while(1){n=o-4|0;s=+g[n>>2];o=o+(l<<2)|0;p=n;while(1){g[p>>2]=+g[o>>2];p=k-o>>2;if((j|0)<(p|0)){q=o+(j<<2)|0}else{q=i+(m-p<<2)|0}if((q|0)==(n|0)){break}else{p=o;o=q}}g[o>>2]=s;if((n|0)==(h|0)){break}else{o=n}}}}while(0);h=c[b+148>>2]|0;j:do{if((h|0)!=0){i=h+(d<<2)|0;l=h+(e<<2)|0;k=h+(f<<2)|0;j=i;if((d+1|0)==(e|0)){s=+g[i>>2];u=k-l|0;gn(j|0,l|0,u|0)|0;g[h+((u>>2)+d<<2)>>2]=s;break}if((e+1|0)==(f|0)){u=h+(f-1<<2)|0;s=+g[u>>2];u=u-i|0;gn(h+(f-(u>>2)<<2)|0,j|0,u|0)|0;g[i>>2]=s;break}n=l;j=n-i>>2;n=k-n>>2;if((j|0)==(n|0)){h=l;while(1){s=+g[i>>2];g[i>>2]=+g[h>>2];g[h>>2]=s;i=i+4|0;if((i|0)==(l|0)){break j}else{h=h+4|0}}}else{l=j}while(1){m=(l|0)%(n|0)|0;if((m|0)==0){break}else{l=n;n=m}}if((n|0)==0){break}m=j-1|0;l=j+d|0;o=h+(n+d<<2)|0;while(1){n=o-4|0;s=+g[n>>2];o=o+(m<<2)|0;q=n;while(1){g[q>>2]=+g[o>>2];p=k-o>>2;if((j|0)<(p|0)){p=o+(j<<2)|0}else{p=h+(l-p<<2)|0}if((p|0)==(n|0)){break}else{q=o;o=p}}g[o>>2]=s;if((n|0)==(i|0)){break}else{o=n}}}}while(0);h=c[b+152>>2]|0;if((h|0)!=0){bl(h+(d<<2)|0,h+(e<<2)|0,h+(f<<2)|0)|0}h=c[b+164>>2]|0;k:do{if((h|0)!=0){i=h+(d<<2)|0;l=h+(e<<2)|0;k=h+(f<<2)|0;j=i;if((d+1|0)==(e|0)){t=c[i>>2]|0;u=k-l|0;gn(j|0,l|0,u|0)|0;c[h+((u>>2)+d<<2)>>2]=t;break}if((e+1|0)==(f|0)){t=h+(f-1<<2)|0;u=c[t>>2]|0;t=t-i|0;gn(h+(f-(t>>2)<<2)|0,j|0,t|0)|0;c[i>>2]=u;break}n=l;j=n-i>>2;n=k-n>>2;if((j|0)==(n|0)){h=l;while(1){u=c[i>>2]|0;c[i>>2]=c[h>>2];c[h>>2]=u;i=i+4|0;if((i|0)==(l|0)){break k}else{h=h+4|0}}}else{l=j}while(1){m=(l|0)%(n|0)|0;if((m|0)==0){break}else{l=n;n=m}}if((n|0)==0){break}l=j-1|0;m=j+d|0;p=h+(n+d<<2)|0;while(1){o=p-4|0;n=c[o>>2]|0;p=p+(l<<2)|0;r=o;while(1){c[r>>2]=c[p>>2];q=k-p>>2;if((j|0)<(q|0)){q=p+(j<<2)|0}else{q=h+(m-q<<2)|0}if((q|0)==(o|0)){break}else{r=p;p=q}}c[p>>2]=n;if((o|0)==(i|0)){break}else{p=o}}}}while(0);h=b+96|0;j=c[h>>2]|0;do{if((j|0)!=0){i=j+(d<<2)|0;m=j+(e<<2)|0;l=j+(f<<2)|0;k=i;l:do{if((d+1|0)==(e|0)){t=c[i>>2]|0;u=l-m|0;gn(k|0,m|0,u|0)|0;c[j+((u>>2)+d<<2)>>2]=t}else{if((e+1|0)==(f|0)){t=j+(f-1<<2)|0;u=c[t>>2]|0;t=t-i|0;gn(j+(f-(t>>2)<<2)|0,k|0,t|0)|0;c[i>>2]=u;break}o=m;k=o-i>>2;o=l-o>>2;if((k|0)==(o|0)){j=m;while(1){u=c[i>>2]|0;c[i>>2]=c[j>>2];c[j>>2]=u;i=i+4|0;if((i|0)==(m|0)){break l}else{j=j+4|0}}}else{m=k}while(1){n=(m|0)%(o|0)|0;if((n|0)==0){break}else{m=o;o=n}}if((o|0)==0){break}m=k-1|0;n=k+d|0;q=j+(o+d<<2)|0;while(1){p=q-4|0;o=c[p>>2]|0;q=q+(m<<2)|0;r=p;while(1){c[r>>2]=c[q>>2];r=l-q>>2;if((k|0)<(r|0)){t=q+(k<<2)|0}else{t=j+(n-r<<2)|0}if((t|0)==(p|0)){break}else{r=q;q=t}}c[q>>2]=o;if((p|0)==(i|0)){break}else{q=p}}}}while(0);if((d|0)>=(f|0)){break}i=c[h>>2]|0;k=f-e|0;j=d-e|0;h=d;do{l=c[i+(h<<2)>>2]|0;if((l|0)!=0){l=l+8|0;m=c[l>>2]|0;do{if((m|0)>=(d|0)){if((m|0)<(e|0)){m=k+m|0;break}else{m=m+((m|0)<(f|0)?j:0)|0;break}}}while(0);c[l>>2]=m}h=h+1|0;}while((h|0)<(f|0))}}while(0);i=c[b+272>>2]|0;do{if((i|0)!=0){h=i+(d<<2)|0;l=i+(e<<2)|0;k=i+(f<<2)|0;j=h;m:do{if((d+1|0)==(e|0)){t=c[h>>2]|0;u=k-l|0;gn(j|0,l|0,u|0)|0;c[i+((u>>2)+d<<2)>>2]=t}else{if((e+1|0)==(f|0)){t=i+(f-1<<2)|0;u=c[t>>2]|0;t=t-h|0;gn(i+(f-(t>>2)<<2)|0,j|0,t|0)|0;c[h>>2]=u;break}n=l;j=n-h>>2;n=k-n>>2;if((j|0)==(n|0)){i=l;while(1){u=c[h>>2]|0;c[h>>2]=c[i>>2];c[i>>2]=u;h=h+4|0;if((h|0)==(l|0)){break m}else{i=i+4|0}}}else{l=j}while(1){m=(l|0)%(n|0)|0;if((m|0)==0){break}else{l=n;n=m}}if((n|0)==0){break}m=j-1|0;l=j+d|0;p=i+(n+d<<2)|0;while(1){o=p-4|0;n=c[o>>2]|0;p=p+(m<<2)|0;r=o;while(1){c[r>>2]=c[p>>2];q=k-p>>2;if((j|0)<(q|0)){q=p+(j<<2)|0}else{q=i+(l-q<<2)|0}if((q|0)==(o|0)){break}else{r=p;p=q}}c[p>>2]=n;if((o|0)==(h|0)){break}else{p=o}}}}while(0);h=c[b+56>>2]|0;l=c[b+280>>2]|0;if((h|0)<=0){break}m=f-e|0;k=d-e|0;i=0;do{j=l+(i<<2)|0;n=c[j>>2]|0;do{if((n|0)>=(d|0)){if((n|0)<(e|0)){n=m+n|0;break}else{n=n+((n|0)<(f|0)?k:0)|0;break}}}while(0);c[j>>2]=n;i=i+1|0;}while((i|0)<(h|0))}}while(0);k=b+212|0;if((c[k>>2]|0)>0){h=c[b+220>>2]|0;j=f-e|0;m=d-e|0;i=0;do{l=h+(i<<3)|0;n=c[l>>2]|0;do{if((n|0)>=(d|0)){if((n|0)<(e|0)){n=j+n|0;break}else{n=n+((n|0)<(f|0)?m:0)|0;break}}}while(0);c[l>>2]=n;i=i+1|0;}while((i|0)<(c[k>>2]|0))}i=b+224|0;if((c[i>>2]|0)>0){j=c[b+232>>2]|0;k=f-e|0;h=d-e|0;l=0;do{m=j+(l*24|0)|0;n=c[m>>2]|0;do{if((n|0)>=(d|0)){if((n|0)<(e|0)){n=k+n|0;break}else{n=n+((n|0)<(f|0)?h:0)|0;break}}}while(0);c[m>>2]=n;m=j+(l*24|0)+4|0;n=c[m>>2]|0;do{if((n|0)>=(d|0)){if((n|0)<(e|0)){n=k+n|0;break}else{n=n+((n|0)<(f|0)?h:0)|0;break}}}while(0);c[m>>2]=n;l=l+1|0;}while((l|0)<(c[i>>2]|0))}l=b+236|0;if((c[l>>2]|0)>0){h=c[b+244>>2]|0;j=f-e|0;i=d-e|0;m=0;do{k=h+(m*28|0)|0;n=c[k>>2]|0;do{if((n|0)>=(d|0)){if((n|0)<(e|0)){n=j+n|0;break}else{n=n+((n|0)<(f|0)?i:0)|0;break}}}while(0);c[k>>2]=n;m=m+1|0;}while((m|0)<(c[l>>2]|0))}j=b+248|0;if((c[j>>2]|0)>0){h=c[b+256>>2]|0;k=f-e|0;i=d-e|0;l=0;do{m=h+(l*20|0)|0;n=c[m>>2]|0;do{if((n|0)>=(d|0)){if((n|0)<(e|0)){n=k+n|0;break}else{n=n+((n|0)<(f|0)?i:0)|0;break}}}while(0);c[m>>2]=n;m=h+(l*20|0)+4|0;n=c[m>>2]|0;do{if((n|0)>=(d|0)){if((n|0)<(e|0)){n=k+n|0;break}else{n=n+((n|0)<(f|0)?i:0)|0;break}}}while(0);c[m>>2]=n;l=l+1|0;}while((l|0)<(c[j>>2]|0))}i=b+260|0;if((c[i>>2]|0)>0){l=c[b+268>>2]|0;j=f-e|0;k=d-e|0;h=0;do{m=l+(h*60|0)|0;n=c[m>>2]|0;do{if((n|0)>=(d|0)){if((n|0)<(e|0)){n=j+n|0;break}else{n=n+((n|0)<(f|0)?k:0)|0;break}}}while(0);c[m>>2]=n;m=l+(h*60|0)+4|0;n=c[m>>2]|0;do{if((n|0)>=(d|0)){if((n|0)<(e|0)){n=j+n|0;break}else{n=n+((n|0)<(f|0)?k:0)|0;break}}}while(0);c[m>>2]=n;m=l+(h*60|0)+8|0;n=c[m>>2]|0;do{if((n|0)>=(d|0)){if((n|0)<(e|0)){n=j+n|0;break}else{n=n+((n|0)<(f|0)?k:0)|0;break}}}while(0);c[m>>2]=n;h=h+1|0;}while((h|0)<(c[i>>2]|0))}i=c[b+304>>2]|0;if((i|0)==0){return}h=f-e|0;b=d-e|0;do{j=i+4|0;k=c[j>>2]|0;do{if((k|0)>=(d|0)){if((k|0)<(e|0)){k=h+k|0;break}else{k=k+((k|0)<(f|0)?b:0)|0;break}}}while(0);c[j>>2]=k;j=i+8|0;k=(c[j>>2]|0)-1|0;do{if((k|0)>=(d|0)){if((k|0)<(e|0)){k=h+k|0;break}else{k=k+((k|0)<(f|0)?b:0)|0;break}}}while(0);c[j>>2]=k+1;i=c[i+24>>2]|0;}while((i|0)!=0);return}function xk(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0;f=(c[b+104>>2]|0)+(d<<2)|0;if((c[f>>2]&~e|0)!=0){a[b+12|0]=1}d=b+8|0;if((~c[d>>2]&e|0)==0){c[f>>2]=e;return}if((e&128|0)!=0){g=b+144|0;h=c[g>>2]|0;if((h|0)==0){h=b+60|0;i=c[h>>2]|0;if((i|0)==0){sk(b,256);i=c[h>>2]|0}i=mm(c[b+376>>2]|0,i<<3)|0;en(i|0,0,c[h>>2]<<3|0)|0;h=i}c[g>>2]=h}if((e&256|0)!=0){g=b+152|0;h=c[g>>2]|0;if((h|0)==0){h=b+60|0;i=c[h>>2]|0;if((i|0)==0){sk(b,256);i=c[h>>2]|0}i=mm(c[b+376>>2]|0,i<<2)|0;en(i|0,0,c[h>>2]<<2|0)|0;h=i}c[g>>2]=h}c[d>>2]=c[d>>2]|e;c[f>>2]=e;return}function yk(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var h=0,j=0,l=0,m=0,n=0,o=0,p=0,q=0.0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ba=0,ca=0,da=0,ea=0,fa=0,ga=0,ha=0,ia=0.0,ja=0.0,ka=0.0,la=0.0,ma=0.0,na=0.0,oa=0,pa=0,qa=0,ra=0,sa=0,ta=0.0,ua=0.0,va=0.0;l=i;i=i+88|0;h=l|0;j=l+40|0;q=+g[e+52>>2];if(q==0.0){q=+g[b+40>>2]*.75}r=rb[c[(c[d>>2]|0)+12>>2]&15](d)|0;if((r|0)<=0){i=l;return}o=j|0;X=j+4|0;W=j+8|0;n=j+28|0;m=d+4|0;Y=d+8|0;S=d+12|0;P=j+12|0;K=d+20|0;J=j+20|0;I=d+28|0;H=j+28|0;F=d+36|0;E=j+36|0;D=d+44|0;C=j+44|0;B=d+45|0;z=j+45|0;s=j+20|0;U=j+12|0;p=j+24|0;V=j+16|0;v=h|0;A=h+4|0;G=h+12|0;L=h+20|0;M=h+21|0;N=h+22|0;O=h+23|0;Q=h+24|0;T=h+28|0;t=h+32|0;u=e|0;w=f+12|0;x=f+8|0;y=f|0;fa=f+4|0;ea=e+28|0;ba=e+8|0;f=e+12|0;Z=e+20|0;aa=e+24|0;da=e+32|0;$=e+33|0;_=e+34|0;ca=e+35|0;ga=e+64|0;e=e+68|0;ha=0;na=0.0;while(1){c[o>>2]=6064;c[X>>2]=1;g[W>>2]=.009999999776482582;en(n|0,0,18)|0;if((c[m>>2]|0)==1){c[X>>2]=1;g[W>>2]=+g[Y>>2];qa=c[S>>2]|0;oa=c[S+4>>2]|0;c[P>>2]=qa;c[P+4>>2]=oa;ra=c[K>>2]|0;pa=c[K+4>>2]|0;c[J>>2]=ra;c[J+4>>2]=pa;sa=c[I+4>>2]|0;c[H>>2]=c[I>>2];c[H+4>>2]=sa;sa=c[F+4>>2]|0;c[E>>2]=c[F>>2];c[E+4>>2]=sa;a[C]=a[D]|0;a[z]=a[B]|0;ja=(c[k>>2]=ra,+g[k>>2]);ma=(c[k>>2]=qa,+g[k>>2]);ia=(c[k>>2]=pa,+g[k>>2]);la=(c[k>>2]=oa,+g[k>>2])}else{Je(d,j,ha);ja=+g[s>>2];ia=+g[p>>2];ma=+g[U>>2];la=+g[V>>2]}ja=ja-ma;ka=ia-la;ia=+R(ja*ja+ka*ka);a:do{if(na<ia){while(1){va=na/ia;ua=ma+ja*va;va=ka*va+la;c[t>>2]=0;c[v>>2]=c[u>>2];ta=+g[w>>2];la=+g[x>>2];ma=+g[y>>2]+(ua*ta-va*la);la=va*ta+ua*la+ +g[fa>>2];ua=+ma;ta=+la;g[A>>2]=ua;g[A+4>>2]=ta;ta=+g[ea>>2];la=+(+g[Z>>2]+(la- +g[f>>2])*(-0.0-ta));ma=+(ta*(ma- +g[ba>>2])+ +g[aa>>2]);g[G>>2]=la;g[G+4>>2]=ma;qa=a[$]|0;ra=a[_]|0;sa=a[ca]|0;a[L]=a[da]|0;a[M]=qa;a[N]=ra;a[O]=sa;g[Q>>2]=+g[ga>>2];c[T>>2]=c[e>>2];tk(b,h)|0;na=q+na;if(!(na<ia)){break a}ma=+g[U>>2];la=+g[V>>2]}}}while(0);ha=ha+1|0;if((ha|0)>=(r|0)){break}na=na-ia}i=l;return}function zk(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var h=0,j=0,k=0,l=0,m=0,n=0.0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,Q=0,R=0,S=0.0,T=0.0,U=0.0,V=0.0,W=0,X=0,Y=0,Z=0.0,_=0.0,$=0.0;l=i;i=i+80|0;k=l|0;h=l+40|0;p=l+56|0;j=l+72|0;n=+g[e+52>>2];if(n==0.0){n=+g[b+40>>2]*.75}g[h>>2]=0.0;g[h+4>>2]=0.0;g[h+8>>2]=0.0;g[h+12>>2]=1.0;Eb[c[(c[d>>2]|0)+28>>2]&63](d,p,h,0);S=n*+P(+g[p+4>>2]/n);o=p+12|0;T=+g[o>>2];if(!(S<T)){i=l;return}m=p|0;s=p+8|0;x=j|0;z=j+4|0;p=d;v=k|0;B=k+4|0;D=k+12|0;E=k+20|0;F=k+21|0;q=k+22|0;r=k+23|0;C=k+24|0;t=k+28|0;G=k+32|0;u=e|0;w=f+12|0;y=f+8|0;A=f|0;J=f+4|0;Q=e+28|0;H=e+8|0;O=e+12|0;R=e+20|0;I=e+24|0;N=e+32|0;K=e+33|0;L=e+34|0;M=e+35|0;f=e+64|0;e=e+68|0;U=+g[s>>2];do{V=n*+P(+g[m>>2]/n);if(V<U){do{g[x>>2]=V;g[z>>2]=S;if(vb[c[(c[p>>2]|0)+16>>2]&31](d,h,j)|0){c[G>>2]=0;c[v>>2]=c[u>>2];_=+g[w>>2];$=+g[x>>2];Z=+g[y>>2];T=+g[z>>2];U=+g[A>>2]+(_*$-Z*T);T=$*Z+_*T+ +g[J>>2];_=+U;Z=+T;g[B>>2]=_;g[B+4>>2]=Z;Z=+g[Q>>2];T=+(+g[R>>2]+(T- +g[O>>2])*(-0.0-Z));U=+(Z*(U- +g[H>>2])+ +g[I>>2]);g[D>>2]=T;g[D+4>>2]=U;Y=a[K]|0;X=a[L]|0;W=a[M]|0;a[E]=a[N]|0;a[F]=Y;a[q]=X;a[r]=W;g[C>>2]=+g[f>>2];c[t>>2]=c[e>>2];tk(b,k)|0}V=n+V;U=+g[s>>2];}while(V<U);T=+g[o>>2]}S=n+S;}while(S<T);i=l;return}function Ak(b,d){b=b|0;d=d|0;var e=0,f=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0.0,P=0.0,Q=0.0,R=0.0,S=0,V=0.0,W=0.0,X=0.0,Y=0.0;e=i;i=i+80|0;l=e|0;o=e+40|0;k=e+64|0;n=k;f=i;i=i+4|0;i=i+7&-8;j=b+376|0;if((c[(c[j>>2]|0)+102876>>2]&2|0)!=0){N=0;i=e;return N|0}q=k|0;R=+g[d+16>>2];m=d+8|0;N=c[m+4>>2]|0;c[q>>2]=c[m>>2];c[q+4>>2]=N;q=k+8|0;g[q>>2]=+U(R);N=n+12|0;g[N>>2]=+T(R);m=b+56|0;h=c[m>>2]|0;p=c[d+40>>2]|0;do{if((p|0)!=0){r=c[p+4>>2]|0;if((r|0)==1|(r|0)==3){yk(b,p,d,n);break}else if((r|0)==2|(r|0)==0){zk(b,p,d,n);break}else{break}}}while(0);p=c[d+44>>2]|0;if((p|0)!=0){M=c[d+48>>2]|0;c[o>>2]=4400;c[o+12>>2]=p;c[o+16>>2]=M;zk(b,o|0,d,n)}u=d+56|0;if((c[u>>2]|0)>0){v=d+60|0;y=l|0;D=l+4|0;J=l+12|0;B=l+20|0;A=l+21|0;z=l+22|0;t=l+23|0;r=l+24|0;M=l+28|0;w=l+32|0;x=d|0;E=d+28|0;H=d+8|0;G=d+12|0;F=d+20|0;I=d+24|0;C=d+32|0;K=d+33|0;L=d+34|0;o=d+35|0;s=d+64|0;p=d+68|0;O=+g[N>>2];Q=+g[q>>2];P=+g[k>>2];R=+g[n+4>>2];n=0;do{S=(c[v>>2]|0)+(n<<3)|0;W=+g[S>>2];Y=+g[S+4>>2];c[w>>2]=0;c[y>>2]=c[x>>2];V=P+(W*O-Y*Q);W=O*Y+W*Q+R;Y=+V;X=+W;g[D>>2]=Y;g[D+4>>2]=X;X=+g[E>>2];W=+(+g[F>>2]+(W- +g[G>>2])*(-0.0-X));V=+(X*(V- +g[H>>2])+ +g[I>>2]);g[J>>2]=W;g[J+4>>2]=V;S=a[K]|0;q=a[L]|0;N=a[o]|0;a[B]=a[C]|0;a[A]=S;a[z]=q;a[t]=N;g[r>>2]=+g[s>>2];c[M>>2]=c[p>>2];tk(b,l)|0;n=n+1|0;}while((n|0)<(c[u>>2]|0))}m=c[m>>2]|0;l=mm(c[j>>2]|0,80)|0;if((l|0)==0){l=0}else{mk(l)}c[l>>2]=b;c[l+4>>2]=h;c[l+8>>2]=m;g[l+16>>2]=+g[d+36>>2];c[l+76>>2]=c[d+68>>2];n=l+60|0;c[n>>2]=c[k>>2];c[n+4>>2]=c[k+4>>2];c[n+8>>2]=c[k+8>>2];c[n+12>>2]=c[k+12>>2];c[l+20>>2]=0;k=b+304|0;c[l+24>>2]=c[k>>2];n=c[k>>2]|0;if((n|0)!=0){c[n+20>>2]=l}c[k>>2]=l;S=b+300|0;c[S>>2]=(c[S>>2]|0)+1;if((h|0)<(m|0)){n=b+160|0;k=h;do{c[(c[n>>2]|0)+(k<<2)>>2]=l;k=k+1|0;}while((k|0)<(m|0))}n=c[d+4>>2]|0;k=l+12|0;o=c[k>>2]|0;n=((o^n)&1|0)==0?n:n|16;if((o&~n|0)!=0){a[b+20|0]=1}o=b+16|0;q=c[o>>2]|0;if((n&~q|0)!=0){if((n&1|0)!=0){p=b+148|0;r=c[p>>2]|0;if((r|0)==0){q=b+60|0;r=c[q>>2]|0;if((r|0)==0){sk(b,256);r=c[q>>2]|0}r=mm(c[j>>2]|0,r<<2)|0;en(r|0,0,c[q>>2]<<2|0)|0;q=c[o>>2]|0}c[p>>2]=r}c[o>>2]=q|n}c[k>>2]=n;c[f>>2]=4640;Bk(b,1);Ck(b,h,m,f);d=d+72|0;f=c[d>>2]|0;if((f|0)==0){S=l;i=e;return S|0}Dk(b,f,l);S=c[d>>2]|0;i=e;return S|0}function Bk(b,d){b=b|0;d=d|0;var e=0,f=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0.0;e=i;i=i+24|0;k=e|0;p=e+8|0;s=c[b+220>>2]|0;t=c[b+212>>2]|0;q=s+(t<<3)|0;t=(t|0)>0;if(t){h=c[b+112>>2]|0;A=+g[b+44>>2];j=s;do{z=c[j>>2]|0;c[j+4>>2]=(~~(+g[h+(z<<3)+4>>2]*A+2048.0)<<20)+~~(+g[h+(z<<3)>>2]*A*256.0+524288.0);j=j+8|0;}while(j>>>0<q>>>0)}pl(s,q,k);o=b+8|0;r=c[o>>2]|0;n=c[b+376>>2]|0;if((r&32768|0)==0){l=0}else{l=c[n+102952>>2]|0}j=p|0;c[j>>2]=0;m=p+4|0;c[m>>2]=0;k=p+8|0;c[k>>2]=0;h=p+12|0;c[h>>2]=n+76;n=(l|0)!=0;if(n){z=b+224|0;Ik(p,c[b+232>>2]|0,c[z>>2]|0,c[b+104>>2]|0);r=c[o>>2]|0;o=z}else{o=b+224|0}c[o>>2]=0;if((r&131072|0)==0){r=0}else{r=c[(c[b+376>>2]|0)+102948>>2]|0}if(t){v=s;u=s;while(1){x=u+4|0;y=(c[x>>2]|0)+256|0;s=u+8|0;t=s>>>0<q>>>0;a:do{if(t){w=u|0;z=s;do{if(y>>>0<(c[z+4>>2]|0)>>>0){break a}Jk(b,c[w>>2]|0,c[z>>2]|0,r,l,p);z=z+8|0;}while(z>>>0<q>>>0)}}while(0);x=c[x>>2]|0;w=x+1048320|0;while(1){if(!(v>>>0<q>>>0)){break}if(w>>>0>(c[v+4>>2]|0)>>>0){v=v+8|0}else{f=30;break}}b:do{if((f|0)==30){f=0;w=x+1048832|0;u=u|0;x=v;do{if(w>>>0<(c[x+4>>2]|0)>>>0){break b}Jk(b,c[u>>2]|0,c[x>>2]|0,r,l,p);x=x+8|0;}while(x>>>0<q>>>0)}}while(0);if(t){u=s}else{break}}}if(d){p=b+232|0;q=c[p>>2]|0;d=q+((c[o>>2]|0)*24|0)|0;s=q;while(1){if((s|0)==(d|0)){break}if((c[s+8>>2]&2|0)==0){s=s+24|0}else{r=s;q=s;f=38;break}}if((f|0)==38){c:while(1){f=0;s=r;while(1){r=s+24|0;if((r|0)==(d|0)){break c}if((c[s+32>>2]&2|0)==0){break}else{s=r}}f=q;z=r;c[f>>2]=c[z>>2];c[f+4>>2]=c[z+4>>2];c[f+8>>2]=c[z+8>>2];c[f+12>>2]=c[z+12>>2];c[f+16>>2]=c[z+16>>2];c[f+20>>2]=c[z+20>>2];q=q+24|0;f=38}d=q;q=c[p>>2]|0}c[o>>2]=(d-q|0)/24|0}do{if(n){o=c[k>>2]|0;p=c[j>>2]|0;n=p;m=c[m>>2]|0;if((o|0)<=0){break}f=l;p=0;while(1){if((a[m+p|0]|0)!=0){Eb[c[(c[f>>2]|0)+28>>2]&63](l,b,c[n+(p<<3)>>2]|0,c[n+(p<<3)+4>>2]|0)}p=p+1|0;if((p|0)>=(o|0)){f=50;break}}}else{f=50}}while(0);if((f|0)==50){p=c[j>>2]|0}if((p|0)==0){i=e;return}Im(c[h>>2]|0,p);c[j>>2]=0;c[k>>2]=0;i=e;return}function Ck(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0.0,L=0.0;h=i;i=i+64|0;o=h|0;k=h+8|0;f=h+16|0;l=h+48|0;n=(b|0)<(d|0);if(!n){i=h;return}p=c[a+104>>2]|0;q=b;m=0;do{m=c[p+(q<<2)>>2]|m;q=q+1|0;}while((q|0)<(d|0));if((m&1032|0)!=0){q=a+224|0;if((c[q>>2]|0)>0){v=a+232|0;w=a+104|0;x=a+160|0;t=e;r=e;y=a+256|0;p=a+248|0;z=a+252|0;u=a+112|0;s=a+376|0;A=0;do{F=c[v>>2]|0;B=c[F+(A*24|0)>>2]|0;C=c[F+(A*24|0)+4>>2]|0;G=c[w>>2]|0;H=c[G+(B<<2)>>2]|0;G=c[G+(C<<2)>>2]|0;D=c[x>>2]|0;E=c[D+(B<<2)>>2]|0;D=c[D+(C<<2)>>2]|0;do{if((C|0)<(d|0)&(((B|0)>=(d|0)|(B|0)<(b|0)|(C|0)<(b|0))^1)){J=G|H;if((J&2|0)!=0|(J&1032|0)==0){break}if(!(Cb[c[(c[t>>2]|0)+8>>2]&63](e,B)|0)){if(!(Cb[c[(c[t>>2]|0)+8>>2]&63](e,C)|0)){break}}if((H&28|0)==0){if((E|0)==0){break}if((c[E+12>>2]&2|0)==0){break}}if((G&28|0)==0){if((D|0)==0){break}if((c[D+12>>2]&2|0)==0){break}}if(!(vb[c[(c[r>>2]|0)+12>>2]&31](e,B,C)|0)){break}G=c[y>>2]|0;I=c[p>>2]|0;H=c[z>>2]|0;if((H|0)<=(I|0)){J=(I|0)==0?256:I<<1;I=mm(c[s>>2]|0,J*20|0)|0;if((G|0)!=0){H=H*20|0;fn(I|0,G|0,H)|0;nm(c[s>>2]|0,G,H)}c[z>>2]=J;G=I;I=c[p>>2]|0}c[y>>2]=G;c[G+(I*20|0)>>2]=B;c[G+(I*20|0)+4>>2]=C;c[G+(I*20|0)+8>>2]=c[F+(A*24|0)+8>>2];if((E|0)==0){K=1.0}else{K=+g[E+16>>2]}if((D|0)==0){L=1.0}else{L=+g[D+16>>2]}g[G+(I*20|0)+12>>2]=K<L?K:L;J=c[u>>2]|0;K=+g[J+(B<<3)>>2]- +g[J+(C<<3)>>2];L=+g[J+(B<<3)+4>>2]- +g[J+(C<<3)+4>>2];g[G+(I*20|0)+16>>2]=+R(K*K+L*L);c[p>>2]=(c[p>>2]|0)+1}}while(0);A=A+1|0;}while((A|0)<(c[q>>2]|0))}else{y=a+256|0;p=a+248|0}q=c[y>>2]|0;J=c[p>>2]|0;r=q+(J*20|0)|0;c[o>>2]=14;J=J*20|0;s=(J|0)/20|0;a:do{if((J|0)>2560){t=s;while(1){J=_m(t*20|0,8856)|0;u=J;if((J|0)!=0){break a}if((t|0)>1){t=(t|0)/2|0}else{t=0;break}}}else{u=0;t=0}}while(0);yl(q,r,o,s,u,t);if((u|0)!=0){$m(u)}q=c[y>>2]|0;r=c[p>>2]|0;o=q+(r*20|0)|0;b:do{if((r|0)!=1)if((r|0)==0){r=q;j=43}else{r=q;s=q+20|0;u=c[q>>2]|0;while(1){t=c[s>>2]|0;if((u|0)==(t|0)){if((c[r+4>>2]|0)==(c[r+24>>2]|0)){j=43;break b}}u=s+20|0;if((u|0)==(o|0)){break}else{r=s;s=u;u=t}}}}while(0);do{if((j|0)==43){if((r|0)==(o|0)){break}t=r+20|0;c:while(1){q=r|0;s=r+4|0;u=t;while(1){t=u+20|0;if((t|0)==(o|0)){break c}if((c[q>>2]|0)!=(c[t>>2]|0)){break}if((c[s>>2]|0)==(c[u+24>>2]|0)){u=t}else{break}}J=r+20|0;I=J;H=t;c[I>>2]=c[H>>2];c[I+4>>2]=c[H+4>>2];c[I+8>>2]=c[H+8>>2];c[I+12>>2]=c[H+12>>2];c[I+16>>2]=c[H+16>>2];r=J}o=r+20|0;q=c[y>>2]|0}}while(0);c[p>>2]=(o-q|0)/20|0}if((m&16|0)==0){i=h;return}hk(f,(c[a+376>>2]|0)+76|0,d-b|0);if(n){p=a+104|0;o=a+160|0;m=a+112|0;n=e;do{r=c[(c[p>>2]|0)+(b<<2)>>2]|0;do{if((r&2|0)==0){q=c[(c[o>>2]|0)+(b<<2)>>2]|0;if((r&28|0)==0){if((q|0)==0){break}if((c[q+12>>2]&2|0)==0){break}}J=c[m>>2]|0;jk(f,J+(b<<3)|0,b,Cb[c[(c[n>>2]|0)+8>>2]&63](e,b)|0)}}while(0);b=b+1|0;}while((b|0)<(d|0))}L=+g[a+40>>2]*.75;kk(f,L*.5,L*2.0);c[l>>2]=4456;c[l+4>>2]=a;c[l+8>>2]=e;lk(f,l|0);l=a+268|0;d=c[l>>2]|0;a=a+260|0;J=c[a>>2]|0;b=d+(J*60|0)|0;c[k>>2]=26;J=J*60|0;e=(J|0)/60|0;d:do{if((J|0)>7680){m=e;while(1){J=_m(m*60|0,8856)|0;n=J;if((J|0)!=0){break d}if((m|0)>1){m=(m|0)/2|0}else{m=0;break}}}else{n=0;m=0}}while(0);tl(d,b,k,e,n,m);if((n|0)!=0){$m(n)}d=c[l>>2]|0;e=c[a>>2]|0;k=d+(e*60|0)|0;e:do{if((e|0)!=1)if((e|0)==0){b=d;j=81}else{b=d;e=d+60|0;n=c[d>>2]|0;while(1){m=c[e>>2]|0;do{if((n|0)==(m|0)){if((c[b+4>>2]|0)!=(c[b+64>>2]|0)){break}if((c[b+8>>2]|0)==(c[b+68>>2]|0)){j=81;break e}}}while(0);n=e+60|0;if((n|0)==(k|0)){break}else{b=e;e=n;n=m}}}}while(0);do{if((j|0)==81){if((b|0)==(k|0)){break}m=b+60|0;f:while(1){j=b|0;d=b+4|0;e=b+8|0;while(1){n=m+60|0;if((n|0)==(k|0)){break f}if((c[j>>2]|0)!=(c[n>>2]|0)){break}if((c[d>>2]|0)!=(c[m+64>>2]|0)){break}if((c[e>>2]|0)==(c[m+68>>2]|0)){m=n}else{break}}J=b+60|0;fn(J|0,n|0,60)|0;m=n;b=J}k=b+60|0;d=c[l>>2]|0}}while(0);c[a>>2]=(k-d|0)/60|0;ik(f);i=h;return}function Dk(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0;f=i;i=i+8|0;l=f|0;k=b+376|0;if((c[(c[k>>2]|0)+102876>>2]&2|0)!=0){i=f;return}g=e+4|0;h=e+8|0;wk(b,c[g>>2]|0,c[h>>2]|0,c[b+56>>2]|0);n=d+4|0;j=d+8|0;wk(b,c[n>>2]|0,c[j>>2]|0,c[g>>2]|0);p=c[g>>2]|0;c[l>>2]=4528;c[l+4>>2]=p;Bk(b,1);Ck(b,c[n>>2]|0,c[h>>2]|0,l|0);n=c[g>>2]|0;l=c[h>>2]|0;if((n|0)<(l|0)){m=b+160|0;do{c[(c[m>>2]|0)+(n<<2)>>2]=d;n=n+1|0;}while((n|0)<(l|0))}d=d+12|0;m=c[d>>2]|0;l=c[e+12>>2]|m;l=((l^m)&1|0)==0?l:l|16;if((m&~l|0)!=0){a[b+20|0]=1}m=b+16|0;o=c[m>>2]|0;if((l&~o|0)!=0){if((l&1|0)!=0){n=b+148|0;p=c[n>>2]|0;if((p|0)==0){o=b+60|0;p=c[o>>2]|0;if((p|0)==0){sk(b,256);p=c[o>>2]|0}p=mm(c[k>>2]|0,p<<2)|0;en(p|0,0,c[o>>2]<<2|0)|0;o=c[m>>2]|0}c[n>>2]=p}c[m>>2]=o|l}c[d>>2]=l;c[j>>2]=c[h>>2];c[g>>2]=c[h>>2];qk(b,e);i=f;return}function Ek(a){a=a|0;return}function Fk(a,b){a=a|0;b=b|0;var d=0,e=0;e=c[a>>2]|0;d=c[b>>2]|0;if((e|0)==(d|0)){a=(c[a+4>>2]|0)<(c[b+4>>2]|0);return a|0}else{a=(e-d|0)<0;return a|0}return 0}function Gk(a,b){a=a|0;b=b|0;var d=0,e=0;e=c[a>>2]|0;d=c[b>>2]|0;if((e|0)!=(d|0)){e=(e-d|0)<0;return e|0}e=c[a+4>>2]|0;d=c[b+4>>2]|0;if((e|0)==(d|0)){e=(c[a+8>>2]|0)<(c[b+8>>2]|0);return e|0}else{e=(e-d|0)<0;return e|0}return 0}function Hk(b){b=b|0;var d=0,e=0,f=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0.0,v=0,w=0.0,x=0.0,y=0,z=0.0;d=b+376|0;i=b+224|0;e=Gm((c[d>>2]|0)+76|0,(c[i>>2]|0)*24|0)|0;f=e;n=c[i>>2]|0;if((n|0)>0){h=b+232|0;l=b+160|0;m=0;k=0;do{r=c[h>>2]|0;o=r+(m*24|0)|0;q=c[l>>2]|0;p=c[q+(c[o>>2]<<2)>>2]|0;do{if((p|0)!=0){if((p|0)!=(c[q+(c[r+(m*24|0)+4>>2]<<2)>>2]|0)){break}if((c[p+12>>2]&16|0)==0){break}n=f+(k*24|0)|0;y=o;c[n>>2]=c[y>>2];c[n+4>>2]=c[y+4>>2];c[n+8>>2]=c[y+8>>2];c[n+12>>2]=c[y+12>>2];c[n+16>>2]=c[y+16>>2];c[n+20>>2]=c[y+20>>2];k=k+1|0;n=c[i>>2]|0}}while(0);m=m+1|0;}while((m|0)<(n|0))}else{k=0}h=Gm((c[d>>2]|0)+76|0,c[b+300>>2]<<2)|0;i=h;r=c[b+304>>2]|0;do{if((r|0)==0){m=0;j=11}else{n=b+16|0;o=b+140|0;l=b+148|0;p=b+60|0;q=b+20|0;m=0;do{t=r+12|0;y=c[t>>2]|0;do{if((y&16|0)!=0){s=m+1|0;c[i+(m<<2)>>2]=r;m=y&-17;if((((y|16)^-17)&y|0)!=0){a[q]=1}v=c[n>>2]|0;if((m&~v|0)!=0){if((y&1|0)!=0){y=c[l>>2]|0;if((y|0)==0){v=c[p>>2]|0;if((v|0)==0){sk(b,256);v=c[p>>2]|0}y=mm(c[d>>2]|0,v<<2)|0;en(y|0,0,c[p>>2]<<2|0)|0;v=c[n>>2]|0}c[l>>2]=y}c[n>>2]=v|m}c[t>>2]=m;v=c[r+4>>2]|0;t=c[r+8>>2]|0;if((v|0)>=(t|0)){m=s;break}m=v+1|0;en((c[o>>2]|0)+(v<<2)|0,0,((t|0)>(m|0)?t:m)-v<<2|0)|0;m=s}}while(0);r=c[r+24>>2]|0;}while((r|0)!=0);n=(m|0)>0;if(!n){j=11;break}o=b+132|0;l=b+148|0;q=0;do{p=c[i+(q<<2)>>2]|0;t=c[p+4>>2]|0;p=c[p+8>>2]|0;if((t|0)<(p|0)){r=c[o>>2]|0;s=c[l>>2]|0;do{g[s+(t<<2)>>2]=+g[r+(t<<2)>>2]<.800000011920929?0.0:3.4028234663852886e+38;t=t+1|0;}while((t|0)<(p|0))}q=q+1|0;}while((q|0)<(m|0))}}while(0);if((j|0)==11){l=b+148|0;n=0}j=~~+R(+(c[b+56>>2]|0));a:do{if((k|0)>0){o=0;while(1){if((o|0)>=(j|0)){break a}p=c[l>>2]|0;q=0;s=0;do{u=1.0- +g[f+(q*24|0)+12>>2];t=p+(c[f+(q*24|0)>>2]<<2)|0;r=p+(c[f+(q*24|0)+4>>2]<<2)|0;w=+g[r>>2];x=u+w;z=+g[t>>2];u=u+z;if(z>x){g[t>>2]=x;s=1;w=+g[r>>2]}if(w>u){g[r>>2]=u;s=1}q=q+1|0;}while((q|0)<(k|0));if(s){o=o+1|0}else{break}}}}while(0);if(!n){y=c[d>>2]|0;y=y+76|0;Im(y,h);y=c[d>>2]|0;y=y+76|0;Im(y,e);return}j=b+40|0;k=0;do{f=c[i+(k<<2)>>2]|0;o=c[f+4>>2]|0;f=f+8|0;if((o|0)<(c[f>>2]|0)){b=c[l>>2]|0;do{n=b+(o<<2)|0;u=+g[n>>2];if(u<3.4028234663852886e+38){u=u*+g[j>>2]}else{u=0.0}g[n>>2]=u;o=o+1|0;}while((o|0)<(c[f>>2]|0))}k=k+1|0;}while((k|0)<(m|0));y=c[d>>2]|0;y=y+76|0;Im(y,h);y=c[d>>2]|0;y=y+76|0;Im(y,e);return}function Ik(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0;g=i;i=i+8|0;f=g|0;h=a|0;j=c[h>>2]|0;if((j|0)!=0){Im(c[a+12>>2]|0,j);c[h>>2]=0;c[a+8>>2]=0}if((d|0)==0){j=c[a+8>>2]|0}else{j=Gm(c[a+12>>2]|0,d*9|0)|0;c[h>>2]=j;j=j+(d<<3)|0;c[a+4>>2]=j;en(j|0,1,d|0)|0;c[a+8>>2]=d;j=d}if((j|0)==0){i=g;return}h=c[h>>2]|0;if((d|0)>0){j=0;l=0;do{m=c[b+(j*24|0)>>2]|0;do{if(!((m|0)==-1)){n=b+(j*24|0)+4|0;k=c[n>>2]|0;if((k|0)==-1){break}if(((c[e+(k<<2)>>2]|c[e+(m<<2)>>2])&32768|0)==0){break}c[h+(j<<3)>>2]=m;c[h+(j<<3)+4>>2]=c[n>>2];l=l+1|0}}while(0);j=j+1|0;}while((j|0)<(d|0))}else{l=0}c[a+8>>2]=l;c[f>>2]=24;ml(h,h+(l<<3)|0,f);i=g;return}function Jk(b,d,e,f,h,i){b=b|0;d=d|0;e=e|0;f=f|0;h=h|0;i=i|0;var j=0,l=0,m=0.0,n=0.0,o=0,p=0.0,q=0,r=0,s=0,t=0,u=0,v=0,w=0.0;u=c[b+112>>2]|0;p=+g[u+(e<<3)>>2]- +g[u+(d<<3)>>2];n=+g[u+(e<<3)+4>>2]- +g[u+(d<<3)+4>>2];m=p*p+n*n;if(!(m<+g[b+48>>2])){return}do{if((f|0)!=0){u=c[b+104>>2]|0;if(((c[u+(e<<2)>>2]|c[u+(d<<2)>>2])&131072|0)==0){break}if(zb[c[(c[f>>2]|0)+16>>2]&15](f,b,d,e)|0){break}return}}while(0);f=b+232|0;r=c[f>>2]|0;l=b+224|0;s=c[l>>2]|0;q=b+228|0;o=c[q>>2]|0;if((o|0)<=(s|0)){s=(s|0)==0?256:s<<1;t=b+376|0;u=mm(c[t>>2]|0,s*24|0)|0;if((r|0)!=0){v=r;r=o*24|0;fn(u|0,v|0,r)|0;nm(c[t>>2]|0,v,r)}c[q>>2]=s;r=u;s=c[l>>2]|0}c[f>>2]=r;w=(c[k>>2]=1597463007-((g[k>>2]=m,c[k>>2]|0)>>1),+g[k>>2]);w=w*(1.5-w*m*.5*w);f=r+(s*24|0)|0;c[f>>2]=d;c[r+(s*24|0)+4>>2]=e;v=c[b+104>>2]|0;c[r+(s*24|0)+8>>2]=c[v+(e<<2)>>2]|c[v+(d<<2)>>2];g[r+(s*24|0)+12>>2]=1.0-m*w*+g[b+44>>2];v=r+(s*24|0)+16|0;m=+(p*w);p=+(n*w);g[v>>2]=m;g[v+4>>2]=p;c[l>>2]=(c[l>>2]|0)+1;if((h|0)==0){return}q=c[i+8>>2]|0;do{if((q|0)!=0){l=c[i>>2]|0;o=l;q=o+(q<<3)-l>>3;r=(q|0)==0;a:do{if(r){s=o}else{u=q;s=o;while(1){while(1){t=(u|0)/2|0;if((c[s+(t<<3)>>2]|0)<(d|0)){if((c[s+(t<<3)+4>>2]|0)<(e|0)){break}}if((u+1|0)>>>0<3>>>0){break a}else{u=t}}s=s+(t+1<<3)|0;u=u-1|0;if((u|0)==(t|0)){break}else{u=u-t|0}}}}while(0);if((s|0)==0){j=19}else{t=(s-l|0)>>>3;s=c[i+4>>2]|0;if((a[s+t|0]|0)==0){j=19}}if((j|0)==19){b:do{if(!r){while(1){while(1){j=(q|0)/2|0;if((c[o+(j<<3)>>2]|0)<(e|0)){if((c[o+(j<<3)+4>>2]|0)<(d|0)){break}}if((q+1|0)>>>0<3>>>0){break b}else{q=j}}o=o+(j+1<<3)|0;q=q-1|0;if((q|0)==(j|0)){break}else{q=q-j|0}}}}while(0);if((o|0)==0){break}t=(o-l|0)>>>3;s=c[i+4>>2]|0;if((a[s+t|0]|0)==0){break}}a[s+t|0]=0;return}}while(0);xb[c[(c[h>>2]|0)+24>>2]&31](h,b,f);return}function Kk(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0;e=a+172|0;if((c[e>>2]|0)<1){return}f=(c[a+192>>2]|0)+(b<<2)|0;d=(c[a+176>>2]|0)+(b<<2)|0;k=(c[a+184>>2]|0)+(b<<2)|0;l=(c[k>>2]|0)+1|0;c[k>>2]=l;do{if((l|0)==2){l=(c[f>>2]|0)+1|0;c[f>>2]=l;if((l|0)<=(c[e>>2]|0)){break}f=a+208|0;g=c[f>>2]|0;e=a+200|0;j=c[e>>2]|0;i=a+204|0;h=c[i>>2]|0;if((h|0)<=(j|0)){k=(j|0)==0?256:j<<1;l=a+376|0;j=mm(c[l>>2]|0,k<<2)|0;if((g|0)!=0){h=h<<2;fn(j|0,g|0,h)|0;nm(c[l>>2]|0,g,h)}c[i>>2]=k;g=j;j=c[e>>2]|0}c[f>>2]=g;c[e>>2]=j+1;c[g+(j<<2)>>2]=b}}while(0);c[d>>2]=c[a+4>>2];return}function Lk(a,b){a=a|0;b=b|0;if((c[a>>2]|0)>=(c[b>>2]|0)){b=0;return b|0}b=(c[a+4>>2]|0)<(c[b+4>>2]|0);return b|0}function Mk(b){b=b|0;var d=0,e=0,f=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0.0,D=0.0,E=0.0,F=0.0,G=0,H=0.0,I=0.0,J=0,K=0,L=0.0,M=0.0;h=i;i=i+96|0;m=h|0;q=h+16|0;n=h+24|0;t=h+32|0;w=h+40|0;r=h+56|0;v=h+80|0;s=v|0;p=v;x=b+8|0;o=c[b+376>>2]|0;if((c[x>>2]&16384|0)==0){j=0}else{j=c[o+102952>>2]|0}u=b+376|0;d=w|0;c[d>>2]=0;l=w+4|0;c[l>>2]=0;f=w+8|0;c[f>>2]=0;e=w+12|0;c[e>>2]=o+76;o=(j|0)!=0;do{if(o){A=c[b+244>>2]|0;B=c[b+236>>2]|0;z=c[b+104>>2]|0;if((B|0)==0){break}y=Gm(c[e>>2]|0,B*9|0)|0;c[d>>2]=y;y=y+(B<<3)|0;c[l>>2]=y;en(y|0,1,B|0)|0;c[f>>2]=B;y=c[d>>2]|0;if((B|0)>0){G=0;J=0;do{K=c[A+(G*28|0)>>2]|0;do{if(!((K|0)==-1)){if((c[z+(K<<2)>>2]&16384|0)==0){break}c[y+(G<<3)>>2]=c[A+(G*28|0)+8>>2];c[y+(G<<3)+4>>2]=K;J=J+1|0}}while(0);G=G+1|0;}while((G|0)<(B|0))}else{J=0}c[f>>2]=J;c[t>>2]=36;Ll(y,y+(J<<3)|0,t)}}while(0);do{if((c[b+172>>2]|0)>0){t=c[b+56>>2]|0;if((t|0)<=0){break}z=c[b+184>>2]|0;A=b+4|0;B=c[b+176>>2]|0;y=b+192|0;G=0;do{c[z+(G<<2)>>2]=0;if((c[A>>2]|0)>((c[B+(G<<2)>>2]|0)+1|0)){c[(c[y>>2]|0)+(G<<2)>>2]=0}G=G+1|0;}while((G|0)<(t|0))}}while(0);t=b+236|0;c[t>>2]=0;c[b+200>>2]=0;u=c[u>>2]|0;y=c[x>>2]|0;if((y&65536|0)==0){x=0}else{x=c[u+102948>>2]|0}if((y&16384|0)==0){y=0}else{y=c[u+102952>>2]|0}c[r>>2]=4488;c[r+4>>2]=b;c[r+8>>2]=u;c[r+12>>2]=x;c[r+16>>2]=y;c[r+20>>2]=w;z=c[b+56>>2]|0;x=v;g[x>>2]=3.4028234663852886e+38;w=p+4|0;g[w>>2]=3.4028234663852886e+38;B=v+8|0;y=B;g[y>>2]=-3.4028234663852886e+38;v=p+12|0;g[v>>2]=-3.4028234663852886e+38;if((z|0)>0){A=c[b+112>>2]|0;G=0;F=3.4028234663852886e+38;E=3.4028234663852886e+38;C=-3.4028234663852886e+38;D=-3.4028234663852886e+38;do{K=A+(G<<3)|0;I=+g[K>>2];H=+g[K+4>>2];F=F<I?F:I;E=E<H?E:H;M=+F;L=+E;g[s>>2]=M;g[s+4>>2]=L;C=C>I?C:I;D=D>H?D:H;L=+C;M=+D;g[B>>2]=L;g[B+4>>2]=M;G=G+1|0;}while((G|0)<(z|0))}else{F=3.4028234663852886e+38;E=3.4028234663852886e+38;C=-3.4028234663852886e+38;D=-3.4028234663852886e+38}M=+g[b+40>>2];g[x>>2]=F-M;g[w>>2]=E-M;g[y>>2]=C+M;g[v>>2]=D+M;Gj(u,r|0,p);if((a[b+52|0]|0)!=0){r=b+244|0;K=c[r>>2]|0;p=K+((c[t>>2]|0)*28|0)|0;c[q>>2]=44;il(K,p,q);c[n>>2]=0;r=c[r>>2]|0;p=r+((c[t>>2]|0)*28|0)|0;c[m>>2]=b;c[m+4>>2]=-1;c[m+8>>2]=0;c[m+12>>2]=n;while(1){if((r|0)==(p|0)){break}if(hl(m,r)|0){q=r;k=33;break}else{r=r+28|0}}a:do{if((k|0)==33){while(1){k=0;do{q=q+28|0;if((q|0)==(p|0)){break a}}while(hl(m,q)|0);k=r;K=q;c[k>>2]=c[K>>2];c[k+4>>2]=c[K+4>>2];c[k+8>>2]=c[K+8>>2];c[k+12>>2]=c[K+12>>2];c[k+16>>2]=c[K+16>>2];c[k+20>>2]=c[K+20>>2];c[k+24>>2]=c[K+24>>2];r=r+28|0;k=33}}}while(0);c[t>>2]=(c[t>>2]|0)-(c[n>>2]|0)}do{if(o){o=c[d>>2]|0;m=o;n=c[l>>2]|0;l=c[f>>2]|0;if((l|0)<=0){break}k=j;o=0;while(1){if((a[n+o|0]|0)!=0){Eb[c[(c[k>>2]|0)+20>>2]&63](j,c[m+(o<<3)>>2]|0,b,c[m+(o<<3)+4>>2]|0)}o=o+1|0;if((o|0)>=(l|0)){k=50;break}}}else{k=50}}while(0);if((k|0)==50){o=c[d>>2]|0}if((o|0)==0){i=h;return}Im(c[e>>2]|0,o);c[d>>2]=0;c[f>>2]=0;i=h;return}function Nk(a,b){a=a|0;b=b|0;var d=0,e=0;e=c[a>>2]|0;d=c[b>>2]|0;if((e|0)==(d|0)){a=+g[a+12>>2]>+g[b+12>>2];return a|0}else{a=(e|0)<(d|0);return a|0}return 0}function Ok(a,b){a=a|0;b=b|0;var d=0.0,e=0,f=0,h=0,j=0,k=0,l=0,m=0,n=0.0,o=0,p=0,q=0.0,r=0.0,s=0.0,t=0.0,u=0.0,v=0.0,w=0.0,x=0.0,y=0.0,z=0;p=i;i=i+16|0;h=p|0;k=h|0;e=h;f=i;i=i+36|0;i=i+7&-8;g[h>>2]=3.4028234663852886e+38;g[e+4>>2]=3.4028234663852886e+38;h=h+8|0;g[h>>2]=-3.4028234663852886e+38;g[e+12>>2]=-3.4028234663852886e+38;j=c[a+56>>2]|0;if((j|0)<=0){m=f|0;c[m>>2]=4568;m=f+4|0;c[m>>2]=a;m=f+8|0;o=b;c[m>>2]=c[o>>2];c[m+4>>2]=c[o+4>>2];c[m+8>>2]=c[o+8>>2];c[m+12>>2]=c[o+12>>2];c[m+16>>2]=c[o+16>>2];c[m+20>>2]=c[o+20>>2];c[m+24>>2]=c[o+24>>2];m=a+376|0;m=c[m>>2]|0;o=f|0;Gj(m,o,e);i=p;return}l=c[a+120>>2]|0;m=c[a+112>>2]|0;n=+g[b>>2];o=0;s=3.4028234663852886e+38;r=3.4028234663852886e+38;q=-3.4028234663852886e+38;d=-3.4028234663852886e+38;do{z=l+(o<<3)|0;w=+g[z>>2];u=+g[z+4>>2];z=m+(o<<3)|0;v=+g[z>>2];t=+g[z+4>>2];w=v+w*n;u=u*n+t;x=v<w?v:w;y=t<u?t:u;s=s<x?s:x;r=r<y?r:y;x=+s;y=+r;g[k>>2]=x;g[k+4>>2]=y;v=v>w?v:w;t=t>u?t:u;q=q>v?q:v;d=d>t?d:t;x=+q;y=+d;g[h>>2]=x;g[h+4>>2]=y;o=o+1|0;}while((o|0)<(j|0));o=f|0;c[o>>2]=4568;o=f+4|0;c[o>>2]=a;o=f+8|0;z=b;c[o>>2]=c[z>>2];c[o+4>>2]=c[z+4>>2];c[o+8>>2]=c[z+8>>2];c[o+12>>2]=c[z+12>>2];c[o+16>>2]=c[z+16>>2];c[o+20>>2]=c[z+20>>2];c[o+24>>2]=c[z+24>>2];o=a+376|0;o=c[o>>2]|0;z=f|0;Gj(o,z,e);i=p;return}function Pk(b,d){b=b|0;d=d|0;var e=0,f=0,h=0.0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0.0,y=0.0,z=0.0,A=0.0,B=0.0,C=0.0,D=0,E=0.0,F=0.0,G=0.0,H=0.0,I=0.0,J=0.0,K=0,L=0,M=0,N=0,O=0.0,P=0.0,Q=0.0,S=0.0,T=0.0,U=0.0,V=0.0,W=0.0,X=0,Y=0.0,Z=0,_=0.0;e=b+56|0;m=c[e>>2]|0;if((m|0)>0){j=b+104|0;k=b+160|0;i=b+120|0;f=b+112|0;l=0;do{n=c[(c[j>>2]|0)+(l<<2)>>2]|0;do{if((n&1024|0)!=0){if((n&4|0)!=0){Z=c[i>>2]|0;g[Z+(l<<3)>>2]=0.0;g[Z+(l<<3)+4>>2]=0.0;break}n=c[(c[k>>2]|0)+(l<<2)>>2]|0;if((c[n+12>>2]&2|0)==0){break}m=(c[i>>2]|0)+(l<<3)|0;nk(n);Z=n+48|0;W=+g[Z>>2];U=+g[Z+4>>2];nk(n);V=+g[n+56>>2];Z=c[f>>2]|0;nk(n);X=n+40|0;Y=+g[X>>2];W=+(W+(+g[Z+(l<<3)+4>>2]- +g[X+4>>2])*(-0.0-V));Y=+(U+V*(+g[Z+(l<<3)>>2]-Y));g[m>>2]=W;g[m+4>>2]=Y;m=c[e>>2]|0}}while(0);l=l+1|0;}while((l|0)<(m|0))}j=c[b+220>>2]|0;o=c[b+212>>2]|0;h=+g[d>>2]*2.5;i=b+248|0;L=c[i>>2]|0;if((L|0)<=0){return}k=b+256|0;l=b+112|0;m=b+40|0;f=b+44|0;n=j+(o<<3)|0;q=o<<3>>3;o=b+120|0;p=b+160|0;s=d+4|0;r=b+28|0;t=b+104|0;d=b+21|0;b=b+128|0;u=0;do{w=c[k>>2]|0;do{if((c[w+(u*20|0)+8>>2]&1024|0)!=0){v=c[w+(u*20|0)>>2]|0;w=c[w+(u*20|0)+4>>2]|0;M=c[l>>2]|0;N=M+(v<<3)|0;y=+g[N>>2];B=+g[N+4>>2];N=M+(w<<3)|0;G=+g[N>>2];H=+g[N+4>>2];N=B>H;C=+g[m>>2];z=(y<G?y:G)-C;A=(B<H?B:H)-C;x=C+(y>G?y:G);E=+g[f>>2];D=(~~(E*A+2048.0)<<20)+~~(E*z*256.0+524288.0)|0;K=j;Z=q;a:while(1){while(1){if((Z|0)==0){break a}X=(Z|0)/2|0;if((c[K+(X<<3)+4>>2]|0)>>>0<D>>>0){break}else{Z=X}}K=K+(X+1<<3)|0;Z=Z-1-X|0}C=C+(N?B:H);N=(~~(C*E+2048.0)<<20)+~~(x*E*256.0+524288.0)|0;D=K;Z=n-K>>3;b:while(1){while(1){if((Z|0)==0){break b}X=(Z|0)/2|0;if((c[D+(X<<3)+4>>2]|0)>>>0>N>>>0){Z=X}else{break}}D=D+(X+1<<3)|0;Z=Z-1-X|0}Z=c[o>>2]|0;X=Z+(v<<3)|0;E=+g[X>>2];F=+g[X+4>>2];Z=Z+(w<<3)|0;I=+g[Z>>2];G=G-y;J=H-B;H=I-E;I=+g[Z+4>>2]-F;if((K|0)==(D|0)){break}while(1){L=c[K>>2]|0;Z=M+(L<<3)|0;P=+g[Z>>2];O=+g[Z+4>>2];c:do{if(!(z>P|P>x|A>O|O>C)){M=c[p>>2]|0;N=c[M+(L<<2)>>2]|0;if((c[M+(v<<2)>>2]|0)==(N|0)){break}if((c[M+(w<<2)>>2]|0)==(N|0)){break}N=c[o>>2]|0;Q=P-y;U=O-B;M=N+(L<<3)|0;P=+g[M>>2];T=P-E;N=N+(L<<3)+4|0;O=+g[N>>2];S=O-F;W=H*S-I*T;V=G*S-J*T-(I*Q-H*U);Y=G*U-J*Q;do{if(W==0.0){if(V==0.0){break c}V=(-0.0-Y)/V;if(!(V>=0.0&V<h)){break c}W=G+H*V;Y=J+I*V;Y=(W*(Q+T*V)+Y*(U+S*V))/(W*W+Y*Y);if(!(Y>=0.0&Y<=1.0)){break c}}else{Y=V*V-Y*4.0*W;if(Y<0.0){break c}_=+R(Y);Y=W*2.0;W=(-0.0-V-_)/Y;Y=(_-V)/Y;X=W>Y;V=X?Y:W;W=X?W:Y;_=G+H*V;Y=J+I*V;Y=(_*(Q+T*V)+Y*(U+S*V))/(_*_+Y*Y);if(V>=0.0&V<h){if(Y>=0.0&Y<=1.0){break}}if(!(W>=0.0&W<h)){break c}_=G+H*W;Y=J+I*W;Y=(_*(Q+T*W)+Y*(U+S*W))/(_*_+Y*Y);if(!(Y>=0.0&Y<=1.0)){break c}}}while(0);Q=E+H*Y-P;S=F+I*Y-O;U=+g[m>>2]*.75;U=U*+g[r>>2]*U*(-0.0- +g[s>>2]);T=Q*U;U=S*U;do{if(T!=0.0|U!=0.0){if((c[(c[t>>2]|0)+(L<<2)>>2]&4|0)!=0){break}if((a[d]|0)==0){en(c[b>>2]|0,0,c[e>>2]<<3|0)|0;a[d]=1}Z=c[b>>2]|0;X=Z+(L<<3)|0;g[X>>2]=T+ +g[X>>2];Z=Z+(L<<3)+4|0;g[Z>>2]=U+ +g[Z>>2];P=+g[M>>2];O=+g[N>>2]}}while(0);g[M>>2]=Q+P;g[N>>2]=S+O}}while(0);K=K+8|0;if((K|0)==(D|0)){break}M=c[l>>2]|0}L=c[i>>2]|0}}while(0);u=u+1|0;}while((u|0)<(L|0));return}function Qk(b,d){b=b|0;d=d|0;var e=0,f=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0.0,Q=0.0,S=0,T=0,U=0,V=0.0,W=0,X=0,Y=0.0,Z=0,_=0,$=0;e=i;i=i+40|0;O=e|0;j=e+8|0;f=b+56|0;if((c[f>>2]|0)==0){i=e;return}if((c[b+272>>2]|0)!=0){Rk(b,d)}h=b+8|0;if((c[h>>2]&2|0)!=0){uk(b)}p=b+12|0;if((a[p]|0)!=0){c[h>>2]=0;l=c[f>>2]|0;if((l|0)>0){o=c[b+104>>2]|0;n=0;m=0;do{m=c[o+(n<<2)>>2]|m;c[h>>2]=m;n=n+1|0;}while((n|0)<(l|0))}a[p]=0}m=b+20|0;if((a[m]|0)!=0){l=b+16|0;c[l>>2]=0;n=c[b+304>>2]|0;if((n|0)!=0){o=0;do{o=c[n+12>>2]|o;c[l>>2]=o;n=c[n+24>>2]|0;}while((n|0)!=0)}a[m]=0}if((a[b|0]|0)!=0){i=e;return}n=b+24|0;c[n>>2]=0;o=d+20|0;if((c[o>>2]|0)<=0){i=e;return}m=b+4|0;l=j;C=j|0;B=j+4|0;r=b+132|0;w=b+236|0;q=b+244|0;J=b+224|0;G=b+232|0;z=b+16|0;N=b+21|0;D=b+36|0;E=b+376|0;y=b+120|0;A=b+40|0;K=b+104|0;p=b+112|0;I=b+348|0;H=b+160|0;F=b+148|0;L=b+344|0;M=b+340|0;v=b+44|0;u=b+32|0;x=b+128|0;t=O|0;s=O+4|0;O=O|0;do{c[m>>2]=(c[m>>2]|0)+1;c[l>>2]=c[d>>2];c[l+4>>2]=c[d+4>>2];c[l+8>>2]=c[d+8>>2];c[l+12>>2]=c[d+12>>2];c[l+16>>2]=c[d+16>>2];c[l+20>>2]=c[d+20>>2];c[l+24>>2]=c[d+24>>2];P=+(c[o>>2]|0);Q=+g[C>>2]/P;g[C>>2]=Q;P=+g[B>>2]*P;g[B>>2]=P;Mk(b);Bk(b,0);en(c[r>>2]|0,0,c[f>>2]<<2|0)|0;T=c[w>>2]|0;if((T|0)>0){W=c[q>>2]|0;U=c[r>>2]|0;S=0;do{Z=U+(c[W+(S*28|0)>>2]<<2)|0;g[Z>>2]=+g[W+(S*28|0)+12>>2]+ +g[Z>>2];S=S+1|0;}while((S|0)<(T|0))}S=c[J>>2]|0;if((S|0)>0){T=c[G>>2]|0;U=c[r>>2]|0;W=0;do{Z=c[T+(W*24|0)+4>>2]|0;Y=+g[T+(W*24|0)+12>>2];X=U+(c[T+(W*24|0)>>2]<<2)|0;g[X>>2]=Y+ +g[X>>2];Z=U+(Z<<2)|0;g[Z>>2]=Y+ +g[Z>>2];W=W+1|0;}while((W|0)<(S|0))}if((c[z>>2]&16|0)!=0){Hk(b)}S=c[h>>2]|0;if((S&4096|0)!=0){Z=c[K>>2]|0;c[t>>2]=4360;c[s>>2]=Z;Ck(b,0,c[f>>2]|0,O);if((c[f>>2]|0)>0){T=c[K>>2]|0;S=0;do{Z=T+(S<<2)|0;c[Z>>2]=c[Z>>2]&-4097;S=S+1|0;}while((S|0)<(c[f>>2]|0))}S=c[h>>2]&-4097;c[h>>2]=S}if((a[N]|0)!=0){Y=+g[v>>2]*1.3333333730697632;Q=Q*Y*+g[u>>2]*Y;U=c[f>>2]|0;if((U|0)>0){X=c[y>>2]|0;W=c[x>>2]|0;T=0;do{Y=Q*+g[W+(T<<3)+4>>2];Z=X+(T<<3)|0;g[Z>>2]=Q*+g[W+(T<<3)>>2]+ +g[Z>>2];Z=X+(T<<3)+4|0;g[Z>>2]=Y+ +g[Z>>2];T=T+1|0;}while((T|0)<(U|0))}a[N]=0}if((S&32|0)!=0){Sk(b);S=c[h>>2]|0}do{if((S&8192|0)!=0){Q=+g[M>>2]*+g[A>>2]*P;U=c[J>>2]|0;if((U|0)<=0){break}W=c[G>>2]|0;X=0;do{do{if((c[W+(X*24|0)+8>>2]&8192|0)!=0){Z=c[W+(X*24|0)>>2]|0;T=c[W+(X*24|0)+4>>2]|0;_=c[H>>2]|0;if((c[_+(Z<<2)>>2]|0)==(c[_+(T<<2)>>2]|0)){break}_=W+(X*24|0)+16|0;V=+g[_>>2];Y=Q*+g[W+(X*24|0)+12>>2];V=Y*V;Y=Y*+g[_+4>>2];_=c[y>>2]|0;$=_+(Z<<3)|0;g[$>>2]=+g[$>>2]-V;Z=_+(Z<<3)+4|0;g[Z>>2]=+g[Z>>2]-Y;Z=_+(T<<3)|0;g[Z>>2]=V+ +g[Z>>2];_=_+(T<<3)+4|0;g[_>>2]=Y+ +g[_>>2]}}while(0);X=X+1|0;}while((X|0)<(U|0))}}while(0);do{if((S&64|0)!=0){P=+g[L>>2]*+g[A>>2]*P;T=c[J>>2]|0;if((T|0)<=0){break}U=c[G>>2]|0;W=0;do{do{if((c[U+(W*24|0)+8>>2]&64|0)!=0){Q=+g[U+(W*24|0)+12>>2];if(!(Q>.25)){break}Z=c[U+(W*24|0)>>2]|0;$=c[U+(W*24|0)+4>>2]|0;_=U+(W*24|0)+16|0;V=+g[_>>2];Y=P*(Q+-.25);V=Y*V;Y=Y*+g[_+4>>2];_=c[y>>2]|0;X=_+(Z<<3)|0;g[X>>2]=+g[X>>2]-V;Z=_+(Z<<3)+4|0;g[Z>>2]=+g[Z>>2]-Y;Z=_+($<<3)|0;g[Z>>2]=V+ +g[Z>>2];$=_+($<<3)+4|0;g[$>>2]=Y+ +g[$>>2]}}while(0);W=W+1|0;}while((W|0)<(T|0))}}while(0);if((S&128|0)!=0){Tk(b,j)}do{if((c[z>>2]&1|0)!=0){P=+g[B>>2]*+g[I>>2];X=c[J>>2]|0;if((X|0)<=0){break}Z=c[G>>2]|0;W=c[H>>2]|0;S=0;do{T=c[Z+(S*24|0)>>2]|0;U=c[Z+(S*24|0)+4>>2]|0;if((c[W+(T<<2)>>2]|0)!=(c[W+(U<<2)>>2]|0)){$=Z+(S*24|0)+16|0;V=+g[$>>2];_=c[F>>2]|0;Y=+g[Z+(S*24|0)+12>>2]*P*(+g[_+(T<<2)>>2]+ +g[_+(U<<2)>>2]);V=V*Y;Y=+g[$+4>>2]*Y;$=c[y>>2]|0;_=$+(T<<3)|0;g[_>>2]=+g[_>>2]-V;_=$+(T<<3)+4|0;g[_>>2]=+g[_>>2]-Y;_=$+(U<<3)|0;g[_>>2]=V+ +g[_>>2];$=$+(U<<3)+4|0;g[$>>2]=Y+ +g[$>>2]}S=S+1|0;}while((S|0)<(X|0))}}while(0);if((c[h>>2]&256|0)!=0){Uk(b)}Q=+g[C>>2]*+g[D>>2];S=(c[E>>2]|0)+102980|0;P=+g[S>>2];P=Q*P;Q=Q*+g[S+4>>2];S=c[f>>2]|0;if((S|0)>0){T=c[y>>2]|0;U=0;do{$=T+(U<<3)|0;g[$>>2]=P+ +g[$>>2];$=T+(U<<3)+4|0;g[$>>2]=Q+ +g[$>>2];U=U+1|0;}while((U|0)<(S|0))}if((c[h>>2]&2048|0)!=0){Vk(b,j)}Wk(b,j);Xk(b,j);S=c[h>>2]|0;if((S&2048|0)!=0){Yk(b);S=c[h>>2]|0}if((S&16|0)!=0){Zk(b,j);S=c[h>>2]|0}if((S&8|0)!=0){_k(b,j)}V=+g[A>>2]*+g[B>>2];V=V*V;X=c[f>>2]|0;if((X|0)>0){U=c[y>>2]|0;W=0;do{T=U+(W<<3)|0;Y=+g[T>>2];S=U+(W<<3)+4|0;P=+g[S>>2];Q=Y*Y+P*P;if(Q>V){Q=+R(V/Q);g[T>>2]=Y*Q;g[S>>2]=P*Q}W=W+1|0;}while((W|0)<(X|0))}if((c[h>>2]&1024|0)!=0){Pk(b,j)}Ok(b,j);if((c[z>>2]&2|0)!=0){$k(b,j)}S=c[f>>2]|0;do{if((c[h>>2]&4|0)==0){k=88}else{if((S|0)<=0){break}k=c[K>>2]|0;T=0;while(1){if((c[k+(T<<2)>>2]&4|0)!=0){$=c[y>>2]|0;g[$+(T<<3)>>2]=0.0;g[$+(T<<3)+4>>2]=0.0}T=T+1|0;if((T|0)>=(S|0)){k=88;break}}}}while(0);do{if((k|0)==88){k=0;if((S|0)<=0){break}U=c[p>>2]|0;P=+g[C>>2];W=c[y>>2]|0;T=0;do{Y=P*+g[W+(T<<3)+4>>2];$=U+(T<<3)|0;g[$>>2]=P*+g[W+(T<<3)>>2]+ +g[$>>2];$=U+(T<<3)+4|0;g[$>>2]=Y+ +g[$>>2];T=T+1|0;}while((T|0)<(S|0))}}while(0);$=(c[n>>2]|0)+1|0;c[n>>2]=$;}while(($|0)<(c[o>>2]|0));i=e;return}function Rk(b,d){b=b|0;d=d|0;var e=0,f=0,h=0,j=0,k=0,l=0,m=0.0,n=0;e=i;i=i+8|0;j=e|0;f=b+288|0;m=+g[d>>2]/+g[b+372>>2]*4294967296.0;h=hn(~~+m>>>0,(E=+m,+Q(E)>=1.0?E>0.0?(ga(+P(E/4294967296.0),4294967295.0)|0)>>>0:~~+aa((E- +(~~E>>>0))/4294967296.0)>>>0:0),c[f>>2]|0,c[f+4>>2]|0)|0;d=F;c[f>>2]=h;c[f+4>>2]=d;f=c[b+272>>2]|0;h=c[b+280>>2]|0;k=c[b+56>>2]|0;l=b+296|0;if((a[l]|0)!=0){c[j>>2]=f;cl(h,h+(k<<2)|0,j);a[l]=0}if((k|0)<=0){i=e;return}j=b+104|0;while(1){k=k-1|0;l=c[h+(k<<2)>>2]|0;n=c[f+(l<<2)>>2]|0;if((d|0)<(n|0)|(n|0)<1){b=7;break}xk(b,l,c[(c[j>>2]|0)+(l<<2)>>2]|2);if((k|0)<=0){b=7;break}}if((b|0)==7){i=e;return}}function Sk(a){a=a|0;var d=0.0,e=0,f=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0.0,p=0,q=0,r=0,s=0.0,t=0,u=0,v=0.0,w=0.0,x=0,y=0,z=0.0,A=0.0,B=0,C=0.0;d=+g[a+328>>2];r=c[a+236>>2]|0;if((r|0)>0){h=a+112|0;i=a+120|0;j=a+44|0;k=a+32|0;f=c[a+244>>2]|0;l=c[a+104>>2]|0;m=0;do{x=c[f+(m*28|0)>>2]|0;do{if((c[l+(x<<2)>>2]&32|0)!=0){p=c[f+(m*28|0)+4>>2]|0;u=(c[h>>2]|0)+(x<<3)|0;s=+g[u>>2];o=+g[u+4>>2];u=p+88|0;v=+g[u>>2];q=p+60|0;n=p+64|0;e=p+80|0;t=p+84|0;y=c[i>>2]|0;B=y+(x<<3)|0;C=+g[B>>2];y=y+(x<<3)+4|0;A=+g[y>>2];z=+g[f+(m*28|0)+12>>2]*d*+g[f+(m*28|0)+24>>2];w=z*(+g[e>>2]+(o- +g[n>>2])*(-0.0-v)-C);v=z*(v*(s- +g[q>>2])+ +g[t>>2]-A);z=+g[j>>2]*1.3333333730697632;z=z*+g[k>>2]*z;g[B>>2]=C+w*z;g[y>>2]=A+v*z;w=-0.0-w;v=-0.0-v;if((c[p>>2]|0)!=2){break}x=p+4|0;y=b[x>>1]|0;if((y&2)==0){y=y|2;b[x>>1]=y;g[p+160>>2]=0.0}if((y&2)==0){break}C=+g[p+136>>2];g[e>>2]=C*w+ +g[e>>2];g[t>>2]=C*v+ +g[t>>2];g[u>>2]=+g[u>>2]+ +g[p+144>>2]*((s- +g[q>>2])*v-(o- +g[n>>2])*w)}}while(0);m=m+1|0;}while((m|0)<(r|0))}e=c[a+224>>2]|0;if((e|0)<=0){return}f=c[a+232>>2]|0;a=a+120|0;h=0;do{if((c[f+(h*24|0)+8>>2]&32|0)!=0){x=c[f+(h*24|0)>>2]|0;B=c[f+(h*24|0)+4>>2]|0;t=c[a>>2]|0;y=t+(B<<3)|0;u=t+(x<<3)|0;w=+g[u>>2];B=t+(B<<3)+4|0;x=t+(x<<3)+4|0;z=+g[x>>2];C=d*+g[f+(h*24|0)+12>>2];A=C*(+g[y>>2]-w);C=C*(+g[B>>2]-z);g[u>>2]=w+A;g[x>>2]=z+C;g[y>>2]=+g[y>>2]-A;g[B>>2]=+g[B>>2]-C}h=h+1|0;}while((h|0)<(e|0));return}function Tk(a,b){a=a|0;b=b|0;var d=0,e=0.0,f=0.0,h=0.0,i=0,j=0,k=0,l=0,m=0,n=0.0,o=0.0,p=0.0,q=0,r=0,s=0;i=a+56|0;if((c[i>>2]|0)>0){j=a+144|0;d=0;do{m=(c[j>>2]|0)+(d<<3)|0;k=8376;l=c[k+4>>2]|0;c[m>>2]=c[k>>2];c[m+4>>2]=l;d=d+1|0;}while((d|0)<(c[i>>2]|0))}d=c[a+224>>2]|0;i=(d|0)>0;if(i){k=a+144|0;l=c[a+232>>2]|0;j=0;do{if((c[l+(j*24|0)+8>>2]&128|0)!=0){r=c[l+(j*24|0)>>2]|0;m=c[l+(j*24|0)+4>>2]|0;p=+g[l+(j*24|0)+12>>2];q=l+(j*24|0)+16|0;o=+g[q>>2];p=p*(1.0-p);o=p*o;p=p*+g[q+4>>2];q=c[k>>2]|0;s=q+(r<<3)|0;g[s>>2]=+g[s>>2]-o;r=q+(r<<3)+4|0;g[r>>2]=+g[r>>2]-p;r=q+(m<<3)|0;g[r>>2]=o+ +g[r>>2];m=q+(m<<3)+4|0;g[m>>2]=p+ +g[m>>2]}j=j+1|0;}while((j|0)<(d|0))}f=+g[a+40>>2]*+g[b+4>>2];h=+g[a+332>>2]*f;e=f*+g[a+336>>2];f=f*.5;if(!i){return}j=a+132|0;b=a+144|0;i=a+120|0;a=c[a+232>>2]|0;m=0;do{if((c[a+(m*24|0)+8>>2]&128|0)!=0){k=c[a+(m*24|0)>>2]|0;l=c[a+(m*24|0)+4>>2]|0;r=a+(m*24|0)+16|0;o=+g[r>>2];p=+g[r+4>>2];r=c[j>>2]|0;s=c[b>>2]|0;n=h*(+g[r+(k<<2)>>2]+ +g[r+(l<<2)>>2]+-2.0)+e*(o*(+g[s+(l<<3)>>2]- +g[s+(k<<3)>>2])+p*(+g[s+(l<<3)+4>>2]- +g[s+(k<<3)+4>>2]));n=+g[a+(m*24|0)+12>>2]*(n<f?n:f);o=o*n;p=p*n;s=c[i>>2]|0;r=s+(k<<3)|0;g[r>>2]=+g[r>>2]-o;r=s+(k<<3)+4|0;g[r>>2]=+g[r>>2]-p;r=s+(l<<3)|0;g[r>>2]=+g[r>>2]+o;s=s+(l<<3)+4|0;g[s>>2]=+g[s>>2]+p}m=m+1|0;}while((m|0)<(d|0));return}function Uk(b){b=b|0;var e=0,f=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0;e=~~(+g[b+364>>2]*128.0);if((e|0)==0){return}h=b+224|0;l=c[h>>2]|0;if((l|0)<=0){return}i=b+232|0;f=b+104|0;j=b+152|0;b=d[8264]|0;k=0;do{n=c[i>>2]|0;m=c[n+(k*24|0)>>2]|0;n=c[n+(k*24|0)+4>>2]|0;o=c[f>>2]|0;if((c[o+(m<<2)>>2]&256&c[o+(n<<2)>>2]|0)!=0){o=c[j>>2]|0;t=o+(n<<2)|0;z=o+(m<<2)|0;A=d[z]|0;u=(ba((d[t]|0)-A|0,e)|0)>>b;r=o+(n<<2)+1|0;x=o+(m<<2)+1|0;y=d[x]|0;s=(ba((d[r]|0)-y|0,e)|0)>>b;p=o+(n<<2)+2|0;v=o+(m<<2)+2|0;w=d[v]|0;q=(ba((d[p]|0)-w|0,e)|0)>>b;l=o+(n<<2)+3|0;n=o+(m<<2)+3|0;m=d[n]|0;o=(ba((d[l]|0)-m|0,e)|0)>>b;a[z]=u+A;a[x]=s+y;a[v]=q+w;a[n]=o+m;a[t]=(d[t]|0)-u;a[r]=(d[r]|0)-s;a[p]=(d[p]|0)-q;a[l]=(d[l]|0)-o;l=c[h>>2]|0}k=k+1|0;}while((k|0)<(l|0));return}function Vk(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,h=0,i=0.0,j=0.0,k=0.0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0.0,t=0,u=0,v=0,w=0;d=a+136|0;e=c[d>>2]|0;if((e|0)==0){e=a+60|0;f=c[e>>2]|0;if((f|0)==0){sk(a,256);f=c[e>>2]|0}r=mm(c[a+376>>2]|0,f<<2)|0;en(r|0,0,c[e>>2]<<2|0)|0;e=r}c[d>>2]=e;k=+g[a+40>>2]*+g[b+4>>2];k=+g[a+28>>2]*k*k;i=+g[a+352>>2]*k;k=k*.25;j=+g[a+356>>2];h=a+360|0;if((c[h>>2]|0)<=0){return}m=a+140|0;e=a+56|0;f=a+224|0;l=a+132|0;b=a+104|0;n=a+232|0;a=1;r=c[e>>2]|0;while(1){en(c[m>>2]|0,0,r<<2|0)|0;q=c[f>>2]|0;if((q|0)>0){o=c[n>>2]|0;p=0;do{if((c[o+(p*24|0)+8>>2]&2048|0)!=0){t=c[o+(p*24|0)>>2]|0;r=c[o+(p*24|0)+4>>2]|0;s=+g[o+(p*24|0)+12>>2];u=c[d>>2]|0;v=c[m>>2]|0;w=v+(t<<2)|0;g[w>>2]=s*+g[u+(r<<2)>>2]+ +g[w>>2];r=v+(r<<2)|0;g[r>>2]=s*+g[u+(t<<2)>>2]+ +g[r>>2]}p=p+1|0;}while((p|0)<(q|0))}r=c[e>>2]|0;if((r|0)>0){p=c[l>>2]|0;q=c[b>>2]|0;o=0;do{s=+g[p+(o<<2)>>2];if((c[q+(o<<2)>>2]&2048|0)==0){g[(c[d>>2]|0)+(o<<2)>>2]=0.0}else{s=(i*(s+-1.0)+ +g[(c[m>>2]|0)+(o<<2)>>2])/(j+s);s=s<k?s:k;g[(c[d>>2]|0)+(o<<2)>>2]=s<0.0?0.0:s}o=o+1|0;}while((o|0)<(r|0))}if((a|0)>=(c[h>>2]|0)){break}a=a+1|0}return}function Wk(a,d){a=a|0;d=d|0;var e=0.0,f=0.0,h=0,i=0,j=0,k=0.0,l=0.0,m=0.0,n=0.0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0.0;i=a+28|0;j=a+40|0;f=+g[j>>2]*+g[d+4>>2];f=+g[i>>2]*f*f;e=+g[a+312>>2]*f;f=f*.25;h=c[a+56>>2]|0;o=(h|0)>0;if(o){q=c[a+132>>2]|0;r=c[a+140>>2]|0;p=0;do{k=+g[q+(p<<2)>>2]+-1.0;k=e*(k<0.0?0.0:k);g[r+(p<<2)>>2]=k<f?k:f;p=p+1|0;}while((p|0)<(h|0))}s=c[a+8>>2]|0;if(!((s&192|0)==0|o^1)){r=c[a+104>>2]|0;p=a+140|0;q=0;do{if((c[r+(q<<2)>>2]&192|0)!=0){g[(c[p>>2]|0)+(q<<2)>>2]=0.0}q=q+1|0;}while((q|0)<(h|0))}if(!((s&2048|0)==0|o^1)){o=c[a+104>>2]|0;p=a+136|0;q=a+140|0;r=0;do{if((c[o+(r<<2)>>2]&2048|0)!=0){u=(c[q>>2]|0)+(r<<2)|0;g[u>>2]=+g[(c[p>>2]|0)+(r<<2)>>2]+ +g[u>>2]}r=r+1|0;}while((r|0)<(h|0))}f=+g[d>>2]/(+g[i>>2]*+g[j>>2]);s=c[a+236>>2]|0;if((s|0)>0){o=a+44|0;d=a+32|0;r=c[a+244>>2]|0;q=c[a+112>>2]|0;p=c[a+140>>2]|0;j=c[a+120>>2]|0;i=0;do{u=c[r+(i*28|0)>>2]|0;h=c[r+(i*28|0)+4>>2]|0;m=+g[r+(i*28|0)+12>>2];t=r+(i*28|0)+16|0;n=+g[t>>2];v=+g[t+4>>2];t=q+(u<<3)|0;l=+g[t>>2];k=+g[t+4>>2];m=f*m*+g[r+(i*28|0)+24>>2]*(e*m+ +g[p+(u<<2)>>2]);n=n*m;m=v*m;v=+g[o>>2]*1.3333333730697632;v=v*+g[d>>2]*v;t=j+(u<<3)|0;g[t>>2]=+g[t>>2]-n*v;u=j+(u<<3)+4|0;g[u>>2]=+g[u>>2]-m*v;do{if((c[h>>2]|0)==2){u=h+4|0;t=b[u>>1]|0;if((t&2)==0){t=t|2;b[u>>1]=t;g[h+160>>2]=0.0}if((t&2)==0){break}v=+g[h+136>>2];u=h+80|0;g[u>>2]=n*v+ +g[u>>2];u=h+84|0;g[u>>2]=m*v+ +g[u>>2];u=h+88|0;g[u>>2]=+g[u>>2]+ +g[h+144>>2]*(m*(l- +g[h+60>>2])-n*(k- +g[h+64>>2]))}}while(0);i=i+1|0;}while((i|0)<(s|0))}h=c[a+224>>2]|0;if((h|0)<=0){return}i=c[a+232>>2]|0;j=c[a+140>>2]|0;a=c[a+120>>2]|0;d=0;do{t=c[i+(d*24|0)>>2]|0;u=c[i+(d*24|0)+4>>2]|0;s=i+(d*24|0)+16|0;n=+g[s>>2];v=f*+g[i+(d*24|0)+12>>2]*(+g[j+(t<<2)>>2]+ +g[j+(u<<2)>>2]);n=n*v;v=+g[s+4>>2]*v;s=a+(t<<3)|0;g[s>>2]=+g[s>>2]-n;t=a+(t<<3)+4|0;g[t>>2]=+g[t>>2]-v;t=a+(u<<3)|0;g[t>>2]=n+ +g[t>>2];u=a+(u<<3)+4|0;g[u>>2]=v+ +g[u>>2];d=d+1|0;}while((d|0)<(h|0));return}function Xk(a,d){a=a|0;d=d|0;var e=0.0,f=0.0,h=0,i=0,j=0.0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0.0,s=0,t=0.0,u=0,v=0,w=0.0,x=0,y=0.0,z=0.0,A=0.0,B=0,C=0.0,D=0.0,E=0.0;e=+g[a+316>>2];f=1.0/(+g[a+40>>2]*+g[d+4>>2]);m=c[a+236>>2]|0;if((m|0)>0){j=-0.0-f;d=a+44|0;h=a+32|0;i=c[a+244>>2]|0;k=c[a+112>>2]|0;l=c[a+120>>2]|0;v=0;do{x=c[i+(v*28|0)>>2]|0;n=c[i+(v*28|0)+4>>2]|0;q=i+(v*28|0)+16|0;y=+g[q>>2];z=+g[q+4>>2];q=k+(x<<3)|0;r=+g[q>>2];t=+g[q+4>>2];q=n+88|0;D=+g[q>>2];s=n+60|0;u=n+64|0;o=n+80|0;p=n+84|0;B=l+(x<<3)|0;A=+g[B>>2];x=l+(x<<3)+4|0;C=+g[x>>2];D=y*(+g[o>>2]+(t- +g[u>>2])*(-0.0-D)-A)+z*(D*(r- +g[s>>2])+ +g[p>>2]-C);do{if(D<0.0){w=e*+g[i+(v*28|0)+12>>2];E=D*j;E=E<.5?E:.5;E=D*+g[i+(v*28|0)+24>>2]*(w>E?w:E);w=y*E;y=z*E;E=+g[d>>2]*1.3333333730697632;E=E*+g[h>>2]*E;g[B>>2]=A+E*w;g[x>>2]=C+E*y;w=-0.0-w;y=-0.0-y;if((c[n>>2]|0)!=2){break}x=n+4|0;B=b[x>>1]|0;if((B&2)==0){B=B|2;b[x>>1]=B;g[n+160>>2]=0.0}if((B&2)==0){break}E=+g[n+136>>2];g[o>>2]=E*w+ +g[o>>2];g[p>>2]=E*y+ +g[p>>2];g[q>>2]=+g[q>>2]+ +g[n+144>>2]*((r- +g[s>>2])*y-(t- +g[u>>2])*w)}}while(0);v=v+1|0;}while((v|0)<(m|0))}d=c[a+224>>2]|0;if((d|0)<=0){return}f=-0.0-f;h=c[a+232>>2]|0;i=c[a+120>>2]|0;a=0;do{l=c[h+(a*24|0)>>2]|0;n=c[h+(a*24|0)+4>>2]|0;m=h+(a*24|0)+16|0;r=+g[m>>2];t=+g[m+4>>2];m=i+(n<<3)|0;k=i+(l<<3)|0;w=+g[k>>2];n=i+(n<<3)+4|0;l=i+(l<<3)+4|0;y=+g[l>>2];z=r*(+g[m>>2]-w)+t*(+g[n>>2]-y);if(z<0.0){j=e*+g[h+(a*24|0)+12>>2];A=z*f;A=A<.5?A:.5;E=z*(j>A?j:A);D=r*E;E=t*E;g[k>>2]=w+D;g[l>>2]=y+E;g[m>>2]=+g[m>>2]-D;g[n>>2]=+g[n>>2]-E}a=a+1|0;}while((a|0)<(d|0));return}function Yk(a){a=a|0;var d=0,e=0,f=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0.0,r=0,s=0.0,t=0.0,u=0.0,v=0.0,w=0,x=0.0,y=0.0,z=0,A=0;d=c[a+236>>2]|0;if((d|0)<=0){return}h=a+112|0;i=a+120|0;e=a+44|0;f=a+32|0;j=c[a+244>>2]|0;a=c[a+104>>2]|0;k=0;do{z=c[j+(k*28|0)>>2]|0;do{if((c[a+(z<<2)>>2]&2048|0)!=0){m=c[j+(k*28|0)+4>>2]|0;p=j+(k*28|0)+16|0;t=+g[p>>2];u=+g[p+4>>2];p=(c[h>>2]|0)+(z<<3)|0;q=+g[p>>2];s=+g[p+4>>2];p=m+88|0;y=+g[p>>2];r=m+60|0;l=m+64|0;n=m+80|0;o=m+84|0;A=c[i>>2]|0;w=A+(z<<3)|0;v=+g[w>>2];z=A+(z<<3)+4|0;x=+g[z>>2];y=t*(+g[n>>2]+(s- +g[l>>2])*(-0.0-y)-v)+u*(y*(q- +g[r>>2])+ +g[o>>2]-x);if(!(y<0.0)){break}y=y*+g[j+(k*28|0)+24>>2]*.5;t=t*y;u=u*y;y=+g[e>>2]*1.3333333730697632;y=y*+g[f>>2]*y;g[w>>2]=v+t*y;g[z>>2]=x+u*y;t=-0.0-t;u=-0.0-u;if((c[m>>2]|0)!=2){break}w=m+4|0;z=b[w>>1]|0;if((z&2)==0){z=z|2;b[w>>1]=z;g[m+160>>2]=0.0}if((z&2)==0){break}y=+g[m+136>>2];g[n>>2]=y*t+ +g[n>>2];g[o>>2]=y*u+ +g[o>>2];g[p>>2]=+g[p>>2]+ +g[m+144>>2]*((q- +g[r>>2])*u-(s- +g[l>>2])*t)}}while(0);k=k+1|0;}while((k|0)<(d|0));return}function Zk(a,b){a=a|0;b=b|0;var d=0,e=0.0,f=0,h=0,i=0,j=0,l=0.0,m=0.0,n=0.0,o=0.0,p=0.0,q=0.0,r=0,s=0.0,t=0,u=0,v=0,w=0.0,x=0,y=0.0,z=0,A=0,B=0,C=0.0,D=0.0,E=0,F=0.0,G=0.0,H=0.0,I=0.0;e=+g[b+4>>2]*+g[a+320>>2];d=c[a+260>>2]|0;if((d|0)<=0){return}f=a+112|0;h=a+120|0;b=b|0;a=c[a+268>>2]|0;i=0;do{if((c[a+(i*60|0)+12>>2]&16|0)!=0){B=c[a+(i*60|0)>>2]|0;v=c[a+(i*60|0)+4>>2]|0;j=c[a+(i*60|0)+8>>2]|0;A=c[f>>2]|0;z=A+(B<<3)|0;F=+g[z>>2];w=+g[z+4>>2];z=A+(v<<3)|0;y=+g[z>>2];p=+g[z+4>>2];A=A+(j<<3)|0;n=+g[A>>2];z=c[h>>2]|0;C=+g[b>>2];E=z+(B<<3)|0;G=+g[E>>2];B=z+(B<<3)+4|0;D=+g[B>>2];F=F+C*G;w=w+C*D;x=z+(v<<3)|0;v=z+(v<<3)+4|0;y=y+C*+g[x>>2];p=p+C*+g[v>>2];r=z+(j<<3)|0;j=z+(j<<3)+4|0;n=n+C*+g[r>>2];C=+g[A+4>>2]+C*+g[j>>2];s=(F+y+n)*.3333333432674408;l=(w+p+C)*.3333333432674408;F=F-s;w=w-l;y=y-s;p=p-l;s=n-s;l=C-l;C=+g[a+(i*60|0)+20>>2];n=+g[a+(i*60|0)+24>>2];A=a+(i*60|0)+28|0;I=+g[A>>2];z=a+(i*60|0)+32|0;m=+g[z>>2];u=a+(i*60|0)+36|0;H=+g[u>>2];t=a+(i*60|0)+40|0;q=+g[t>>2];o=C*w-n*F+(I*p-m*y)+(H*l-s*q);q=C*F+n*w+(I*y+m*p)+(s*H+l*q);H=o*o+q*q;m=(c[k>>2]=1597463007-((g[k>>2]=H,c[k>>2]|0)>>1),+g[k>>2]);m=m*(1.5-m*H*.5*m);o=o*m;m=q*m;q=e*+g[a+(i*60|0)+16>>2];g[E>>2]=G+q*(C*m-n*o-F);g[B>>2]=D+q*(C*o+n*m-w);w=+g[A>>2];n=+g[z>>2];g[x>>2]=+g[x>>2]+q*(w*m-n*o-y);g[v>>2]=+g[v>>2]+q*(w*o+n*m-p);p=+g[u>>2];n=+g[t>>2];g[r>>2]=+g[r>>2]+q*(p*m-n*o-s);g[j>>2]=+g[j>>2]+q*(p*o+n*m-l)}i=i+1|0;}while((i|0)<(d|0));return}function _k(a,b){a=a|0;b=b|0;var d=0,e=0.0,f=0,h=0,i=0,j=0,k=0.0,l=0,m=0.0,n=0,o=0.0,p=0,q=0.0,r=0.0,s=0,t=0.0,u=0;e=+g[b+4>>2]*+g[a+324>>2];d=c[a+248>>2]|0;if((d|0)<=0){return}f=a+112|0;h=a+120|0;b=b|0;a=c[a+256>>2]|0;i=0;do{if((c[a+(i*20|0)+8>>2]&8|0)!=0){n=c[a+(i*20|0)>>2]|0;j=c[a+(i*20|0)+4>>2]|0;s=c[f>>2]|0;u=s+(n<<3)|0;m=+g[u>>2];k=+g[u+4>>2];s=s+(j<<3)|0;t=+g[s>>2];u=c[h>>2]|0;r=+g[b>>2];p=u+(n<<3)|0;q=+g[p>>2];n=u+(n<<3)+4|0;o=+g[n>>2];l=u+(j<<3)|0;j=u+(j<<3)+4|0;m=t+r*+g[l>>2]-(m+r*q);r=+g[s+4>>2]+r*+g[j>>2]-(k+r*o);k=+R(m*m+r*r);k=(+g[a+(i*20|0)+16>>2]-k)*e*+g[a+(i*20|0)+12>>2]/k;m=m*k;k=r*k;g[p>>2]=q-m;g[n>>2]=o-k;g[l>>2]=m+ +g[l>>2];g[j>>2]=k+ +g[j>>2]}i=i+1|0;}while((i|0)<(d|0));return}function $k(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,h=0,i=0.0,j=0.0,k=0.0,l=0.0,m=0,n=0.0,o=0.0,p=0.0,q=0.0,r=0.0,s=0;f=c[a+304>>2]|0;if((f|0)==0){return}d=b|0;e=b+4|0;b=a+120|0;a=a+112|0;do{do{if((c[f+12>>2]&2|0)!=0){nk(f);j=+g[d>>2];n=j*+g[f+56>>2];k=+U(n);n=+T(n);r=+g[f+40>>2];l=+g[f+44>>2];i=j*+g[f+48>>2]+r-(n*r-k*l);l=j*+g[f+52>>2]+l-(k*r+n*l);m=f+60|0;r=+g[f+72>>2];j=+g[f+68>>2];o=+(k*r+n*j);j=+(n*r-k*j);r=+g[m>>2];p=+g[f+64>>2];q=+(i+(n*r-k*p));p=+(l+(k*r+n*p));g[m>>2]=q;g[m+4>>2]=p;m=f+68|0;g[m>>2]=o;g[m+4>>2]=j;j=+g[e>>2];i=i*j;l=l*j;k=k*j;j=(n+-1.0)*j;m=c[f+4>>2]|0;h=f+8|0;if((m|0)>=(c[h>>2]|0)){break}do{s=c[a>>2]|0;p=+g[s+(m<<3)>>2];r=+g[s+(m<<3)+4>>2];s=(c[b>>2]|0)+(m<<3)|0;q=+(i+(j*p-k*r));r=+(l+(k*p+j*r));g[s>>2]=q;g[s+4>>2]=r;m=m+1|0;}while((m|0)<(c[h>>2]|0))}}while(0);f=c[f+24>>2]|0;}while((f|0)!=0);return}function al(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,h=0,i=0,j=0.0,k=0,l=0,m=0,n=0.0,o=0,p=0;l=c[a+212>>2]|0;if((l|0)==0){return}m=c[a+220>>2]|0;n=+g[a+44>>2];e=d|0;j=+g[e>>2];f=d+4|0;h=(~~(n*+g[f>>2]+2048.0)<<20)+~~(n*j*256.0+524288.0)|0;k=m;i=l<<3>>3;a:while(1){while(1){if((i|0)==0){break a}o=(i|0)/2|0;if((c[k+(o<<3)+4>>2]|0)>>>0<h>>>0){break}else{i=o}}k=k+(o+1<<3)|0;i=i-1-o|0}h=d+8|0;d=d+12|0;o=(~~(n*+g[d>>2]+2048.0)<<20)+~~(n*+g[h>>2]*256.0+524288.0)|0;i=k;m=m+(l<<3)-k>>3;b:while(1){while(1){if((m|0)==0){break b}l=(m|0)/2|0;if((c[i+(l<<3)+4>>2]|0)>>>0>o>>>0){m=l}else{break}}i=i+(l+1<<3)|0;m=m-1-l|0}if(!(k>>>0<i>>>0)){return}l=a+112|0;m=b;c:while(1){o=c[k>>2]|0;p=c[l>>2]|0;n=+g[p+(o<<3)>>2];do{if(j<n){if(!(n<+g[h>>2])){break}j=+g[p+(o<<3)+4>>2];if(!(+g[f>>2]<j)){break}if(!(j<+g[d>>2])){break}if(!(vb[c[(c[m>>2]|0)+12>>2]&31](b,a,o)|0)){a=21;break c}}}while(0);k=k+8|0;if(!(k>>>0<i>>>0)){a=21;break}j=+g[e>>2]}if((a|0)==21){return}}function bl(b,c,e){b=b|0;c=c|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0;g=((e-4+(-c|0)|0)>>>2)+1|0;j=b;h=c;while(1){f=j;f=d[f]|d[f+1|0]<<8|d[f+2|0]<<16|d[f+3|0]<<24|0;m=h|0;l=h+1|0;p=a[l]|0;k=h+2|0;o=a[k]|0;i=h+3|0;n=a[i]|0;a[j|0]=a[m]|0;a[j+1|0]=p;a[j+2|0]=o;a[j+3|0]=n;a[m]=f;a[l]=f>>>8;a[k]=f>>>16;a[i]=f>>>24;j=j+4|0;i=h+4|0;f=(j|0)==(c|0);if((i|0)==(e|0)){break}h=i;c=f?i:c}b=b+(g<<2)|0;if(f){return b|0}else{h=b;f=c}a:while(1){while(1){g=h;g=d[g]|d[g+1|0]<<8|d[g+2|0]<<16|d[g+3|0]<<24|0;n=f|0;o=f+1|0;k=a[o]|0;p=f+2|0;l=a[p]|0;i=f+3|0;m=a[i]|0;a[h|0]=a[n]|0;a[h+1|0]=k;a[h+2|0]=l;a[h+3|0]=m;a[n]=g;a[o]=g>>>8;a[p]=g>>>16;a[i]=g>>>24;h=h+4|0;i=f+4|0;g=(h|0)==(c|0);if((i|0)!=(e|0)){break}if(g){break a}else{f=c}}f=i;c=g?i:c}return b|0}function cl(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0.0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0;f=d|0;a:while(1){h=b;g=b-4|0;i=b-8|0;b:while(1){k=a;j=h-k|0;n=j>>2;switch(n|0){case 2:{e=4;break a};case 3:{e=8;break a};case 0:case 1:{e=80;break a};case 4:{e=9;break a};case 5:{e=10;break a};default:{}}if((j|0)<124){e=12;break a}m=(n|0)/2|0;l=a+(m<<2)|0;if((j|0)>3996){p=(n|0)/4|0;p=fl(a,a+(p<<2)|0,l,a+(p+m<<2)|0,g,d)|0}else{p=dl(a,l,g,c[f>>2]|0)|0}r=c[a>>2]|0;j=c[f>>2]|0;m=c[j+(r<<2)>>2]|0;q=c[j+(c[l>>2]<<2)>>2]|0;o=+(m|0);n=o<=0.0;t=+(q|0)<=0.0;if(n^t){if(n){s=g;m=p}else{e=30}}else{if((m|0)>(q|0)){s=g;m=p}else{e=30}}c:do{if((e|0)==30){e=0;d:do{if((a|0)!=(i|0)){s=i;while(1){u=c[s>>2]|0;w=c[j+(u<<2)>>2]|0;v=+(w|0)<=0.0;if(v^t){if(v){break}}else{if((w|0)>(q|0)){break}}s=s-4|0;if((a|0)==(s|0)){break d}}c[a>>2]=u;c[s>>2]=r;m=p+1|0;break c}}while(0);l=a+4|0;k=c[g>>2]|0;p=c[j+(k<<2)>>2]|0;if(n^+(p|0)<=0.0){if(!n){e=34}}else{if((m|0)<=(p|0)){e=34}}if((e|0)==34){e=0;if((l|0)==(g|0)){e=80;break a}e:do{if(o>0.0){while(1){n=c[l>>2]|0;w=c[j+(n<<2)>>2]|0;if(+(w|0)>0.0&(m|0)>(w|0)){break e}l=l+4|0;if((l|0)==(g|0)){e=80;break a}}}else{while(1){n=c[l>>2]|0;w=c[j+(n<<2)>>2]|0;if(+(w|0)>0.0|(m|0)>(w|0)){break e}l=l+4|0;if((l|0)==(g|0)){e=80;break a}}}}while(0);c[l>>2]=k;c[g>>2]=n;l=l+4|0}if((l|0)==(g|0)){e=80;break a}else{n=g}while(1){k=c[j+(c[a>>2]<<2)>>2]|0;p=+(k|0)>0.0;f:do{if(p){while(1){m=c[l>>2]|0;w=c[j+(m<<2)>>2]|0;if(+(w|0)>0.0&(k|0)>(w|0)){break f}l=l+4|0}}else{while(1){m=c[l>>2]|0;w=c[j+(m<<2)>>2]|0;if(+(w|0)>0.0|(k|0)>(w|0)){break f}l=l+4|0}}}while(0);if(p){do{n=n-4|0;p=c[n>>2]|0;w=c[j+(p<<2)>>2]|0;}while(+(w|0)>0.0&(k|0)>(w|0))}else{do{n=n-4|0;p=c[n>>2]|0;w=c[j+(p<<2)>>2]|0;}while(+(w|0)>0.0|(k|0)>(w|0))}if(!(l>>>0<n>>>0)){a=l;continue b}c[l>>2]=p;c[n>>2]=m;l=l+4|0}}}while(0);n=a+4|0;g:do{if(n>>>0<s>>>0){while(1){q=c[j+(c[l>>2]<<2)>>2]|0;p=+(q|0)<=0.0;r=n;while(1){n=c[r>>2]|0;t=c[j+(n<<2)>>2]|0;u=+(t|0)<=0.0;if(u^p){if(!u){break}}else{if((t|0)<=(q|0)){break}}r=r+4|0}while(1){t=s-4|0;v=c[t>>2]|0;s=c[j+(v<<2)>>2]|0;u=+(s|0)<=0.0;if(u^p){if(u){break}else{s=t;continue}}else{if((s|0)>(q|0)){break}else{s=t;continue}}}if(r>>>0>t>>>0){n=r;break g}c[r>>2]=v;c[t>>2]=n;s=t;n=r+4|0;m=m+1|0;l=(l|0)==(r|0)?t:l}}}while(0);do{if((n|0)!=(l|0)){r=c[l>>2]|0;q=c[n>>2]|0;p=c[j+(r<<2)>>2]|0;j=c[j+(q<<2)>>2]|0;s=+(p|0)<=0.0;if(s^+(j|0)<=0.0){if(!s){break}}else{if((p|0)<=(j|0)){break}}c[n>>2]=r;c[l>>2]=q;m=m+1|0}}while(0);if((m|0)==0){l=gl(a,n,d)|0;j=n+4|0;if(gl(j,b,d)|0){e=75;break}if(l){a=j;continue}}w=n;if((w-k|0)>=(h-w|0)){e=79;break}cl(a,n,d);a=n+4|0}if((e|0)==75){e=0;if(l){e=80;break}else{b=n;continue}}else if((e|0)==79){e=0;cl(n+4|0,b,d);b=n;continue}}if((e|0)==4){b=c[g>>2]|0;e=c[a>>2]|0;f=c[f>>2]|0;h=c[f+(b<<2)>>2]|0;f=c[f+(e<<2)>>2]|0;d=+(h|0)<=0.0;do{if(d^+(f|0)<=0.0){if(d){break}return}else{if((h|0)>(f|0)){break}return}}while(0);c[a>>2]=b;c[g>>2]=e;return}else if((e|0)==8){dl(a,a+4|0,g,c[f>>2]|0)|0;return}else if((e|0)==9){el(a,a+4|0,a+8|0,g,d)|0;return}else if((e|0)==10){fl(a,a+4|0,a+8|0,a+12|0,g,d)|0;return}else if((e|0)==12){i=a+8|0;dl(a,a+4|0,i,c[f>>2]|0)|0;g=a+12|0;if((g|0)==(b|0)){return}f=c[f>>2]|0;while(1){d=c[g>>2]|0;j=c[i>>2]|0;h=f+(d<<2)|0;k=c[h>>2]|0;l=c[f+(j<<2)>>2]|0;m=+(k|0)<=0.0;if(m^+(l|0)<=0.0){if(m){e=17}}else{if((k|0)>(l|0)){e=17}}if((e|0)==17){e=0;c[g>>2]=j;h:do{if((i|0)==(a|0)){i=a}else{while(1){j=i-4|0;m=c[j>>2]|0;k=c[h>>2]|0;n=c[f+(m<<2)>>2]|0;l=+(k|0)<=0.0;if(l^+(n|0)<=0.0){if(!l){break h}}else{if((k|0)<=(n|0)){break h}}c[i>>2]=m;if((j|0)==(a|0)){i=a;break}else{i=j}}}}while(0);c[i>>2]=d}d=g+4|0;if((d|0)==(b|0)){break}else{i=g;g=d}}return}else if((e|0)==80){return}}function dl(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0;h=c[b>>2]|0;f=c[a>>2]|0;j=c[e+(h<<2)>>2]|0;g=e+(f<<2)|0;k=c[g>>2]|0;i=+(j|0)<=0.0;if(i^+(k|0)<=0.0){k=i}else{k=(j|0)>(k|0)}l=c[d>>2]|0;n=c[e+(l<<2)>>2]|0;m=+(n|0)<=0.0;if(!(m^i)){m=(n|0)>(j|0)}if(!k){if(!m){n=0;return n|0}c[b>>2]=l;c[d>>2]=h;f=c[b>>2]|0;d=c[a>>2]|0;g=c[e+(f<<2)>>2]|0;e=c[e+(d<<2)>>2]|0;h=+(g|0)<=0.0;do{if(h^+(e|0)<=0.0){if(h){break}else{b=1}return b|0}else{if((g|0)>(e|0)){break}else{b=1}return b|0}}while(0);c[a>>2]=f;c[b>>2]=d;n=2;return n|0}if(m){c[a>>2]=l;c[d>>2]=f;n=1;return n|0}c[a>>2]=h;c[b>>2]=f;a=c[d>>2]|0;e=c[e+(a<<2)>>2]|0;h=c[g>>2]|0;g=+(e|0)<=0.0;do{if(g^+(h|0)<=0.0){if(g){break}else{b=1}return b|0}else{if((e|0)>(h|0)){break}else{b=1}return b|0}}while(0);c[b>>2]=a;c[d>>2]=f;n=2;return n|0}function el(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0,l=0;g=f|0;f=dl(a,b,d,c[g>>2]|0)|0;j=c[e>>2]|0;k=c[d>>2]|0;g=c[g>>2]|0;i=c[g+(j<<2)>>2]|0;h=c[g+(k<<2)>>2]|0;l=+(i|0)<=0.0;do{if(l^+(h|0)<=0.0){if(l){break}return f|0}else{if((i|0)>(h|0)){break}return f|0}}while(0);c[d>>2]=j;c[e>>2]=k;j=f+1|0;e=c[d>>2]|0;i=c[b>>2]|0;h=c[g+(e<<2)>>2]|0;l=c[g+(i<<2)>>2]|0;k=+(h|0)<=0.0;do{if(k^+(l|0)<=0.0){if(k){break}else{f=j}return f|0}else{if((h|0)>(l|0)){break}else{f=j}return f|0}}while(0);c[b>>2]=e;c[d>>2]=i;h=f+2|0;e=c[b>>2]|0;d=c[a>>2]|0;i=c[g+(e<<2)>>2]|0;j=c[g+(d<<2)>>2]|0;g=+(i|0)<=0.0;do{if(g^+(j|0)<=0.0){if(g){break}else{f=h}return f|0}else{if((i|0)>(j|0)){break}else{f=h}return f|0}}while(0);c[a>>2]=e;c[b>>2]=d;l=f+3|0;return l|0}function fl(a,b,d,e,f,g){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,i=0,j=0,k=0,l=0,m=0;h=el(a,b,d,e,g)|0;i=c[f>>2]|0;j=c[e>>2]|0;g=c[g>>2]|0;m=c[g+(i<<2)>>2]|0;l=c[g+(j<<2)>>2]|0;k=+(m|0)<=0.0;do{if(k^+(l|0)<=0.0){if(k){break}return h|0}else{if((m|0)>(l|0)){break}return h|0}}while(0);c[e>>2]=i;c[f>>2]=j;k=h+1|0;j=c[e>>2]|0;f=c[d>>2]|0;i=c[g+(j<<2)>>2]|0;m=c[g+(f<<2)>>2]|0;l=+(i|0)<=0.0;do{if(l^+(m|0)<=0.0){if(l){break}else{h=k}return h|0}else{if((i|0)>(m|0)){break}else{h=k}return h|0}}while(0);c[d>>2]=j;c[e>>2]=f;f=h+2|0;i=c[d>>2]|0;j=c[b>>2]|0;e=c[g+(i<<2)>>2]|0;l=c[g+(j<<2)>>2]|0;k=+(e|0)<=0.0;do{if(k^+(l|0)<=0.0){if(k){break}else{h=f}return h|0}else{if((e|0)>(l|0)){break}else{h=f}return h|0}}while(0);c[b>>2]=i;c[d>>2]=j;e=h+3|0;j=c[b>>2]|0;i=c[a>>2]|0;d=c[g+(j<<2)>>2]|0;f=c[g+(i<<2)>>2]|0;g=+(d|0)<=0.0;do{if(g^+(f|0)<=0.0){if(g){break}else{h=e}return h|0}else{if((d|0)>(f|0)){break}else{h=e}return h|0}}while(0);c[a>>2]=j;c[b>>2]=i;m=h+4|0;return m|0}function gl(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0;switch(b-a>>2|0){case 0:case 1:{o=1;return o|0};case 4:{el(a,a+4|0,a+8|0,b-4|0,d)|0;o=1;return o|0};case 5:{fl(a,a+4|0,a+8|0,a+12|0,b-4|0,d)|0;o=1;return o|0};case 3:{dl(a,a+4|0,b-4|0,c[d>>2]|0)|0;o=1;return o|0};case 2:{b=b-4|0;f=c[b>>2]|0;e=c[a>>2]|0;h=c[d>>2]|0;g=c[h+(f<<2)>>2]|0;h=c[h+(e<<2)>>2]|0;d=+(g|0)<=0.0;do{if(d^+(h|0)<=0.0){if(d){break}else{a=1}return a|0}else{if((g|0)>(h|0)){break}else{a=1}return a|0}}while(0);c[a>>2]=f;c[b>>2]=e;o=1;return o|0};default:{j=a+8|0;d=d|0;dl(a,a+4|0,j,c[d>>2]|0)|0;f=a+12|0;if((f|0)==(b|0)){o=1;return o|0}d=c[d>>2]|0;g=0;while(1){h=c[f>>2]|0;n=c[j>>2]|0;i=d+(h<<2)|0;l=c[i>>2]|0;m=c[d+(n<<2)>>2]|0;k=+(l|0)<=0.0;if(k^+(m|0)<=0.0){if(k){e=14}}else{if((l|0)>(m|0)){e=14}}if((e|0)==14){e=0;c[f>>2]=n;a:do{if((j|0)==(a|0)){j=a}else{while(1){o=j-4|0;n=c[o>>2]|0;k=c[i>>2]|0;l=c[d+(n<<2)>>2]|0;m=+(k|0)<=0.0;if(m^+(l|0)<=0.0){if(!m){break a}}else{if((k|0)<=(l|0)){break a}}c[j>>2]=n;if((o|0)==(a|0)){j=a;break}else{j=o}}}}while(0);c[j>>2]=h;g=g+1|0;if((g|0)==8){break}}h=f+4|0;if((h|0)==(b|0)){a=1;e=22;break}else{j=f;f=h}}if((e|0)==22){return a|0}o=(f+4|0)==(b|0);return o|0}}return 0}function hl(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,h=0,j=0,k=0,l=0,m=0,n=0.0,o=0.0,p=0.0,q=0;e=i;i=i+24|0;f=e|0;h=e+8|0;j=e+16|0;m=b|0;l=a+4|0;k=a+8|0;do{if((c[m>>2]|0)==(c[l>>2]|0)){l=c[k>>2]|0;c[a+8>>2]=l+1;if((l|0)<=3){break}m=c[a+12>>2]|0;c[m>>2]=(c[m>>2]|0)+1;m=1;i=e;return m|0}else{c[k>>2]=0;c[l>>2]=c[m>>2];c[a+8>>2]=1}}while(0);l=b+16|0;p=+g[l>>2];q=c[a>>2]|0;o=+g[q+40>>2]*(1.0- +g[b+12>>2]);k=c[m>>2]|0;m=c[q+112>>2]|0;n=+g[l+4>>2]*o+ +g[m+(k<<3)+4>>2];g[f>>2]=+g[m+(k<<3)>>2]+p*o;g[f+4>>2]=n;k=b+8|0;m=c[k>>2]|0;b=c[m+12>>2]|0;if(vb[c[(c[b>>2]|0)+16>>2]&31](b,(c[m+8>>2]|0)+12|0,f)|0){q=0;i=e;return q|0}l=c[(c[k>>2]|0)+12>>2]|0;l=rb[c[(c[l>>2]|0)+12>>2]&15](l)|0;b=0;while(1){if((b|0)>=(l|0)){break}q=c[k>>2]|0;m=c[q+12>>2]|0;Bb[c[(c[m>>2]|0)+20>>2]&31](m,(c[q+8>>2]|0)+12|0,f,h,j,b);if(+g[h>>2]<.004999999888241291){f=0;d=10;break}else{b=b+1|0}}if((d|0)==10){i=e;return f|0}q=c[a+12>>2]|0;c[q>>2]=(c[q>>2]|0)+1;q=1;i=e;return q|0}



function mh(b,d){b=b|0;d=d|0;var e=0,f=0,h=0,i=0,j=0.0,l=0.0,m=0.0,n=0.0,o=0.0,p=0.0,q=0.0,r=0.0,s=0.0,t=0.0,u=0.0,v=0.0,w=0.0,x=0.0,y=0,z=0.0,A=0,B=0.0,C=0.0,D=0.0,E=0.0,F=0.0,G=0.0,H=0,I=0,J=0,K=0,L=0,M=0;i=c[b+48>>2]|0;e=c[i+8>>2]|0;f=b+96|0;c[f>>2]=e;L=c[b+52>>2]|0;J=c[L+8>>2]|0;h=b+100|0;c[h>>2]=J;H=i+44|0;A=b+128|0;I=c[H>>2]|0;H=c[H+4>>2]|0;c[A>>2]=I;c[A+4>>2]=H;A=L+44|0;K=b+136|0;y=c[A>>2]|0;A=c[A+4>>2]|0;c[K>>2]=y;c[K+4>>2]=A;j=+g[i+136>>2];g[b+144>>2]=j;o=+g[L+136>>2];g[b+148>>2]=o;x=+g[i+144>>2];g[b+152>>2]=x;q=+g[L+144>>2];g[b+156>>2]=q;L=c[d+28>>2]|0;i=L+(e*12|0)|0;z=+g[i>>2];B=+g[i+4>>2];s=+g[L+(e*12|0)+8>>2];i=d+32|0;K=c[i>>2]|0;M=K+(e*12|0)|0;m=+g[M>>2];l=+g[M+4>>2];w=+g[K+(e*12|0)+8>>2];M=L+(J*12|0)|0;C=+g[M>>2];D=+g[M+4>>2];F=+g[L+(J*12|0)+8>>2];L=K+(J*12|0)|0;p=+g[L>>2];n=+g[L+4>>2];r=+g[K+(J*12|0)+8>>2];t=+U(s);s=+T(s);G=+U(F);F=+T(F);E=+g[b+68>>2]-(c[k>>2]=I,+g[k>>2]);v=+g[b+72>>2]-(c[k>>2]=H,+g[k>>2]);u=s*E-t*v;v=t*E+s*v;H=b+112|0;s=+u;E=+v;g[H>>2]=s;g[H+4>>2]=E;E=+g[b+76>>2]-(c[k>>2]=y,+g[k>>2]);s=+g[b+80>>2]-(c[k>>2]=A,+g[k>>2]);t=F*E-G*s;s=G*E+F*s;A=b+120|0;F=+t;E=+s;g[A>>2]=F;g[A+4>>2]=E;A=b+104|0;z=C+t-z-u;B=D+s-B-v;y=A;D=+z;C=+B;g[y>>2]=D;g[y+4>>2]=C;A=A|0;y=b+108|0;C=+R(z*z+B*B);g[b+88>>2]=C;c[b+164>>2]=C- +g[b+84>>2]>0.0?2:0;if(!(C>.004999999888241291)){g[A>>2]=0.0;g[y>>2]=0.0;g[b+160>>2]=0.0;g[b+92>>2]=0.0;return}G=1.0/C;z=G*z;g[A>>2]=z;B=G*B;g[y>>2]=B;G=u*B-v*z;C=B*t-z*s;C=o+(j+G*G*x)+C*C*q;if(C!=0.0){C=1.0/C}else{C=0.0}g[b+160>>2]=C;if((a[d+24|0]|0)==0){g[b+92>>2]=0.0}else{M=b+92|0;G=+g[d+8>>2]*+g[M>>2];g[M>>2]=G;F=z*G;G=G*B;w=w-x*(G*u-F*v);r=r+q*(G*t-F*s);p=p+F*o;n=n+G*o;m=m-F*j;l=l-G*j}M=(c[i>>2]|0)+(e*12|0)|0;G=+m;F=+l;g[M>>2]=G;g[M+4>>2]=F;M=c[i>>2]|0;g[M+((c[f>>2]|0)*12|0)+8>>2]=w;M=M+((c[h>>2]|0)*12|0)|0;F=+p;G=+n;g[M>>2]=F;g[M+4>>2]=G;g[(c[i>>2]|0)+((c[h>>2]|0)*12|0)+8>>2]=r;return}function nh(a,b){a=a|0;b=b|0;var d=0,e=0.0,f=0.0,h=0.0,i=0.0,j=0.0,k=0.0,l=0.0,m=0.0,n=0.0,o=0,p=0.0,q=0,r=0,s=0.0,t=0.0,u=0.0,v=0.0,w=0,x=0,y=0,z=0.0;q=a+96|0;r=c[q>>2]|0;d=b+32|0;x=c[d>>2]|0;o=x+(r*12|0)|0;m=+g[o>>2];n=+g[o+4>>2];f=+g[x+(r*12|0)+8>>2];r=a+100|0;w=c[r>>2]|0;y=x+(w*12|0)|0;s=+g[y>>2];t=+g[y+4>>2];j=+g[x+(w*12|0)+8>>2];i=+g[a+116>>2];h=+g[a+112>>2];l=+g[a+124>>2];k=+g[a+120>>2];u=+g[a+88>>2]- +g[a+84>>2];p=+g[a+104>>2];e=+g[a+108>>2];v=(s+l*(-0.0-j)-(m+i*(-0.0-f)))*p+(t+j*k-(n+f*h))*e;if(u<0.0){v=v+u*+g[b+4>>2]}b=a+92|0;u=+g[b>>2];v=u+v*(-0.0- +g[a+160>>2]);z=v>0.0?0.0:v;g[b>>2]=z;u=z-u;z=p*u;p=e*u;e=+g[a+144>>2];i=f- +g[a+152>>2]*(h*p-i*z);u=+g[a+148>>2];v=j+ +g[a+156>>2]*(p*k-z*l);m=+(m-e*z);n=+(n-e*p);g[o>>2]=m;g[o+4>>2]=n;y=c[d>>2]|0;g[y+((c[q>>2]|0)*12|0)+8>>2]=i;y=y+((c[r>>2]|0)*12|0)|0;s=+(s+z*u);u=+(t+p*u);g[y>>2]=s;g[y+4>>2]=u;g[(c[d>>2]|0)+((c[r>>2]|0)*12|0)+8>>2]=v;return}function oh(a,b){a=a|0;b=b|0;var d=0,e=0.0,f=0.0,h=0.0,i=0.0,j=0.0,k=0.0,l=0.0,m=0,n=0,o=0.0,p=0.0,q=0.0,r=0.0,s=0.0,t=0.0,u=0,v=0.0,w=0,x=0,y=0.0;d=a+96|0;n=c[d>>2]|0;m=b+28|0;w=c[m>>2]|0;b=w+(n*12|0)|0;k=+g[b>>2];l=+g[b+4>>2];o=+g[w+(n*12|0)+8>>2];n=a+100|0;u=c[n>>2]|0;x=w+(u*12|0)|0;p=+g[x>>2];q=+g[x+4>>2];h=+g[w+(u*12|0)+8>>2];i=+U(o);t=+T(o);r=+U(h);s=+T(h);j=+g[a+68>>2]- +g[a+128>>2];f=+g[a+72>>2]- +g[a+132>>2];e=t*j-i*f;f=i*j+t*f;t=+g[a+76>>2]- +g[a+136>>2];j=+g[a+80>>2]- +g[a+140>>2];i=s*t-r*j;j=r*t+s*j;s=p+i-k-e;t=q+j-l-f;r=+R(s*s+t*t);if(r<1.1920928955078125e-7){r=0.0}else{v=1.0/r;s=s*v;t=t*v}u=a+84|0;v=r- +g[u>>2];v=v<.20000000298023224?v:.20000000298023224;y=(v<0.0?0.0:v)*(-0.0- +g[a+160>>2]);s=s*y;t=t*y;y=+g[a+144>>2];f=o- +g[a+152>>2]*(e*t-f*s);o=+g[a+148>>2];v=h+ +g[a+156>>2]*(i*t-j*s);k=+(k-y*s);l=+(l-y*t);g[b>>2]=k;g[b+4>>2]=l;x=c[m>>2]|0;g[x+((c[d>>2]|0)*12|0)+8>>2]=f;x=x+((c[n>>2]|0)*12|0)|0;s=+(p+o*s);t=+(q+o*t);g[x>>2]=s;g[x+4>>2]=t;g[(c[m>>2]|0)+((c[n>>2]|0)*12|0)+8>>2]=v;return r- +g[u>>2]<.004999999888241291|0}function ph(a,b){a=a|0;b=b|0;var d=0.0,e=0.0,f=0.0,h=0.0,i=0.0,j=0;j=c[b+48>>2]|0;i=+g[j+24>>2];h=+g[b+68>>2];f=+g[j+20>>2];e=+g[b+72>>2];d=h*f+i*e+ +g[j+16>>2];g[a>>2]=+g[j+12>>2]+(i*h-f*e);g[a+4>>2]=d;return}function qh(a,b){a=a|0;b=b|0;var d=0.0,e=0.0,f=0.0,h=0.0,i=0.0,j=0;j=c[b+52>>2]|0;i=+g[j+24>>2];h=+g[b+76>>2];f=+g[j+20>>2];e=+g[b+80>>2];d=h*f+i*e+ +g[j+16>>2];g[a>>2]=+g[j+12>>2]+(i*h-f*e);g[a+4>>2]=d;return}function rh(a,b,c){a=a|0;b=b|0;c=+c;var d=0.0;d=+g[b+92>>2]*c;c=d*+g[b+108>>2];g[a>>2]=+g[b+104>>2]*d;g[a+4>>2]=c;return}function sh(a,b){a=a|0;b=+b;return+0.0}function th(a){a=a|0;var b=0,e=0,f=0.0,j=0,k=0;b=i;k=c[(c[a+48>>2]|0)+8>>2]|0;j=c[(c[a+52>>2]|0)+8>>2]|0;zm(3288,(e=i,i=i+1|0,i=i+7&-8,c[e>>2]=0,e)|0);i=e;zm(3760,(e=i,i=i+8|0,c[e>>2]=k,e)|0);i=e;zm(2968,(e=i,i=i+8|0,c[e>>2]=j,e)|0);i=e;zm(2528,(e=i,i=i+8|0,c[e>>2]=d[a+61|0]|0,e)|0);i=e;f=+g[a+72>>2];zm(2056,(e=i,i=i+16|0,h[e>>3]=+g[a+68>>2],h[e+8>>3]=f,e)|0);i=e;f=+g[a+80>>2];zm(1576,(e=i,i=i+16|0,h[e>>3]=+g[a+76>>2],h[e+8>>3]=f,e)|0);i=e;zm(1192,(e=i,i=i+8|0,h[e>>3]=+g[a+84>>2],e)|0);i=e;zm(800,(e=i,i=i+8|0,c[e>>2]=c[a+56>>2],e)|0);i=e;i=b;return}function uh(a){a=a|0;return}function vh(a){a=a|0;$m(a);return}function wh(a,b){a=a|0;b=b|0;switch(c[a>>2]|0){case 2:{b=mm(b,256)|0;if((b|0)==0){b=0}else{Vg(b,a)}b=b|0;return b|0};case 5:{b=mm(b,168)|0;if((b|0)==0){b=0}else{yf(b,a)}b=b|0;return b|0};case 1:{b=mm(b,228)|0;if((b|0)==0){b=0}else{Dh(b,a)}b=b|0;return b|0};case 4:{b=mm(b,196)|0;if((b|0)==0){b=0}else{gi(b,a)}b=b|0;return b|0};case 6:{b=mm(b,276)|0;if((b|0)==0){b=0}else{Ig(b,a)}b=b|0;return b|0};case 7:{b=mm(b,224)|0;if((b|0)==0){b=0}else{Vh(b,a)}b=b|0;return b|0};case 8:{b=mm(b,208)|0;if((b|0)==0){b=0}else{xg(b,a)}b=b|0;return b|0};case 9:{b=mm(b,180)|0;if((b|0)==0){b=0}else{lg(b,a)}b=b|0;return b|0};case 10:{b=mm(b,168)|0;if((b|0)==0){b=0}else{lh(b,a)}b=b|0;return b|0};case 11:{b=mm(b,192)|0;if((b|0)==0){b=0}else{Mf(b,a)}b=b|0;return b|0};case 3:{b=mm(b,176)|0;if((b|0)==0){b=0}else{$f(b,a)}b=b|0;return b|0};default:{b=0;return b|0}}return 0}function xh(a,b){a=a|0;b=b|0;tb[c[(c[a>>2]|0)+24>>2]&255](a);switch(c[a+4>>2]|0){case 8:{nm(b,a,208);return};case 11:{nm(b,a,192);return};case 2:{nm(b,a,256);return};case 1:{nm(b,a,228);return};case 3:{nm(b,a,176);return};case 5:{nm(b,a,168);return};case 9:{nm(b,a,180);return};case 10:{nm(b,a,168);return};case 4:{nm(b,a,196);return};case 6:{nm(b,a,276);return};case 7:{nm(b,a,224);return};default:{return}}}function yh(b,d){b=b|0;d=d|0;c[b>>2]=4712;c[b+4>>2]=c[d>>2];c[b+8>>2]=0;c[b+12>>2]=0;c[b+48>>2]=c[d+8>>2];c[b+52>>2]=c[d+12>>2];c[b+56>>2]=0;a[b+61|0]=a[d+16|0]|0;a[b+60|0]=0;c[b+64>>2]=c[d+4>>2];en(b+16|0,0,32)|0;return}function zh(a){a=a|0;var b=0;a=i;zm(3240,(b=i,i=i+1|0,i=i+7&-8,c[b>>2]=0,b)|0);i=b;i=a;return}function Ah(a){a=a|0;return}function Bh(a){a=a|0;$m(a);return}function Ch(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0.0,h=0.0,i=0.0,j=0.0,k=0.0,l=0,m=0;c[a+8>>2]=b;c[a+12>>2]=d;l=e|0;k=+g[l>>2]- +g[b+12>>2];e=e+4|0;f=+g[e>>2]- +g[b+16>>2];h=+g[b+24>>2];i=+g[b+20>>2];m=a+20|0;j=+(k*h+f*i);i=+(h*f+k*(-0.0-i));g[m>>2]=j;g[m+4>>2]=i;i=+g[l>>2]- +g[d+12>>2];j=+g[e>>2]- +g[d+16>>2];k=+g[d+24>>2];f=+g[d+20>>2];e=a+28|0;h=+(i*k+j*f);f=+(k*j+i*(-0.0-f));g[e>>2]=h;g[e+4>>2]=f;g[a+36>>2]=+g[d+72>>2]- +g[b+72>>2];return}function Dh(b,d){b=b|0;d=d|0;var e=0,f=0,h=0;yh(b|0,d|0);c[b>>2]=5184;f=d+20|0;h=b+68|0;e=c[f+4>>2]|0;c[h>>2]=c[f>>2];c[h+4>>2]=e;h=d+28|0;e=b+76|0;f=c[h+4>>2]|0;c[e>>2]=c[h>>2];c[e+4>>2]=f;g[b+116>>2]=+g[d+36>>2];en(b+84|0,0,16)|0;g[b+120>>2]=+g[d+44>>2];g[b+124>>2]=+g[d+48>>2];g[b+104>>2]=+g[d+60>>2];g[b+108>>2]=+g[d+56>>2];a[b+112|0]=a[d+40|0]|0;a[b+100|0]=a[d+52|0]|0;c[b+224>>2]=0;return}function Eh(b,d){b=b|0;d=d|0;var e=0.0,f=0.0,h=0.0,i=0.0,j=0.0,l=0.0,m=0,n=0,o=0,p=0,q=0.0,r=0.0,s=0.0,t=0.0,u=0.0,v=0.0,w=0.0,x=0.0,y=0.0,z=0.0,A=0.0,B=0,C=0.0,D=0.0,E=0.0,F=0,G=0,H=0,I=0,J=0,K=0,L=0;m=c[b+48>>2]|0;n=c[m+8>>2]|0;o=b+128|0;c[o>>2]=n;K=c[b+52>>2]|0;I=c[K+8>>2]|0;p=b+132|0;c[p>>2]=I;G=m+44|0;B=b+152|0;H=c[G>>2]|0;G=c[G+4>>2]|0;c[B>>2]=H;c[B+4>>2]=G;B=K+44|0;J=b+160|0;F=c[B>>2]|0;B=c[B+4>>2]|0;c[J>>2]=F;c[J+4>>2]=B;x=+g[m+136>>2];g[b+168>>2]=x;w=+g[K+136>>2];g[b+172>>2]=w;q=+g[m+144>>2];g[b+176>>2]=q;t=+g[K+144>>2];g[b+180>>2]=t;K=c[d+28>>2]|0;z=+g[K+(n*12|0)+8>>2];m=d+32|0;J=c[m>>2]|0;L=J+(n*12|0)|0;j=+g[L>>2];l=+g[L+4>>2];v=+g[J+(n*12|0)+8>>2];y=+g[K+(I*12|0)+8>>2];K=J+(I*12|0)|0;h=+g[K>>2];i=+g[K+4>>2];f=+g[J+(I*12|0)+8>>2];u=+U(z);e=+T(z);D=+U(y);C=+T(y);A=+g[b+68>>2]-(c[k>>2]=H,+g[k>>2]);s=+g[b+72>>2]-(c[k>>2]=G,+g[k>>2]);r=e*A-u*s;s=u*A+e*s;G=b+136|0;e=+r;A=+s;g[G>>2]=e;g[G+4>>2]=A;A=+g[b+76>>2]-(c[k>>2]=F,+g[k>>2]);e=+g[b+80>>2]-(c[k>>2]=B,+g[k>>2]);u=C*A-D*e;e=D*A+C*e;B=b+144|0;C=+u;A=+e;g[B>>2]=C;g[B+4>>2]=A;A=q+t;B=A==0.0;C=x+w;g[b+184>>2]=C+q*s*s+t*e*e;D=-0.0-s;E=q*r*D-t*e*u;g[b+196>>2]=E;D=q*D-t*e;g[b+208>>2]=D;g[b+188>>2]=E;g[b+200>>2]=C+q*r*r+t*u*u;C=q*r+t*u;g[b+212>>2]=C;g[b+192>>2]=D;g[b+204>>2]=C;g[b+216>>2]=A;if(A>0.0){A=1.0/A}g[b+220>>2]=A;if((a[b+100|0]|0)==0|B){g[b+96>>2]=0.0}do{if((a[b+112|0]|0)==0|B){c[b+224>>2]=0}else{y=y-z- +g[b+116>>2];z=+g[b+124>>2];A=+g[b+120>>2];C=z-A;if(!(C>0.0)){C=-0.0-C}if(C<.06981317698955536){c[b+224>>2]=3;break}if(!(y>A)){B=b+224|0;if((c[B>>2]|0)!=1){g[b+92>>2]=0.0}c[B>>2]=1;break}B=b+224|0;if(y<z){c[B>>2]=0;g[b+92>>2]=0.0;break}if((c[B>>2]|0)!=2){g[b+92>>2]=0.0}c[B>>2]=2}}while(0);B=b+84|0;if((a[d+24|0]|0)==0){en(B|0,0,16)|0;A=v;E=f;C=h;D=i;y=j;z=l;L=c[m>>2]|0;L=L+(n*12|0)|0;H=(g[k>>2]=y,c[k>>2]|0);J=(g[k>>2]=z,c[k>>2]|0);K=0;I=0;H=K|H;I=J|I;J=L|0;c[J>>2]=H;L=L+4|0;c[L>>2]=I;L=c[o>>2]|0;I=c[m>>2]|0;L=I+(L*12|0)+8|0;g[L>>2]=A;L=c[p>>2]|0;L=I+(L*12|0)|0;I=(g[k>>2]=C,c[k>>2]|0);J=(g[k>>2]=D,c[k>>2]|0);H=0;K=0;I=H|I;K=J|K;J=L|0;c[J>>2]=I;L=L+4|0;c[L>>2]=K;L=c[p>>2]|0;K=c[m>>2]|0;L=K+(L*12|0)+8|0;g[L>>2]=E;return}else{H=d+8|0;C=+g[H>>2];L=B|0;y=C*+g[L>>2];g[L>>2]=y;L=b+88|0;z=C*+g[L>>2];g[L>>2]=z;L=b+92|0;C=C*+g[L>>2];g[L>>2]=C;L=b+96|0;E=+g[H>>2]*+g[L>>2];g[L>>2]=E;A=v-q*(C+(E+(z*r-y*s)));E=f+t*(C+(E+(z*u-y*e)));C=h+w*y;D=i+w*z;y=j-x*y;z=l-x*z;L=c[m>>2]|0;L=L+(n*12|0)|0;H=(g[k>>2]=y,c[k>>2]|0);J=(g[k>>2]=z,c[k>>2]|0);K=0;I=0;H=K|H;I=J|I;J=L|0;c[J>>2]=H;L=L+4|0;c[L>>2]=I;L=c[o>>2]|0;I=c[m>>2]|0;L=I+(L*12|0)+8|0;g[L>>2]=A;L=c[p>>2]|0;L=I+(L*12|0)|0;I=(g[k>>2]=C,c[k>>2]|0);J=(g[k>>2]=D,c[k>>2]|0);H=0;K=0;I=H|I;K=J|K;J=L|0;c[J>>2]=I;L=L+4|0;c[L>>2]=K;L=c[p>>2]|0;K=c[m>>2]|0;L=K+(L*12|0)+8|0;g[L>>2]=E;return}}function Fh(b,d){b=b|0;d=d|0;var e=0.0,f=0,h=0.0,j=0.0,k=0,l=0.0,m=0.0,n=0.0,o=0.0,p=0,q=0,r=0.0,s=0,t=0.0,u=0.0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0.0,F=0.0,G=0.0,H=0.0,I=0.0,J=0.0,K=0.0,L=0,M=0.0,N=0,O=0.0;p=i;i=i+80|0;L=p|0;D=p+16|0;v=p+32|0;w=p+40|0;x=p+48|0;y=p+56|0;A=p+64|0;B=p+72|0;f=b+128|0;k=c[f>>2]|0;q=d+32|0;N=c[q>>2]|0;z=N+(k*12|0)|0;r=+g[z>>2];h=+g[z+4>>2];t=+g[N+(k*12|0)+8>>2];k=b+132|0;z=c[k>>2]|0;C=N+(z*12|0)|0;l=+g[C>>2];n=+g[C+4>>2];u=+g[N+(z*12|0)+8>>2];o=+g[b+168>>2];m=+g[b+172>>2];j=+g[b+176>>2];e=+g[b+180>>2];z=j+e==0.0;do{if((a[b+100|0]|0)!=0){if((c[b+224>>2]|0)==3|z){break}C=b+96|0;E=+g[C>>2];H=+g[d>>2]*+g[b+104>>2];G=E+(u-t- +g[b+108>>2])*(-0.0- +g[b+220>>2]);F=-0.0-H;G=G<H?G:H;O=G<F?F:G;g[C>>2]=O;O=O-E;t=t-j*O;u=u+e*O}}while(0);do{if((a[b+112|0]|0)==0){s=15}else{N=b+224|0;if((c[N>>2]|0)==0|z){s=15;break}A=b+148|0;z=b+144|0;B=b+140|0;C=b+136|0;H=l+ +g[A>>2]*(-0.0-u)-r- +g[B>>2]*(-0.0-t);F=n+u*+g[z>>2]-h-t*+g[C>>2];g[L>>2]=H;g[L+4>>2]=F;g[L+8>>2]=u-t;d=b+184|0;om(D,d,L);J=+g[D>>2];K=-0.0-J;I=+g[D+4>>2];G=-0.0-I;M=+g[D+8>>2];E=-0.0-M;D=c[N>>2]|0;do{if((D|0)==3){N=b+84|0;g[N>>2]=+g[N>>2]-J;N=b+88|0;g[N>>2]=+g[N>>2]-I;N=b+92|0;g[N>>2]=+g[N>>2]-M}else if((D|0)==1){x=b+84|0;y=b+92|0;O=+g[y>>2];M=O-M;if(M<0.0){K=O*+g[b+212>>2]-F;g[v>>2]=O*+g[b+208>>2]-H;g[v+4>>2]=K;pm(w,d,v);K=+g[w>>2];G=+g[w+4>>2];E=-0.0- +g[y>>2];N=x|0;g[N>>2]=K+ +g[N>>2];N=b+88|0;g[N>>2]=G+ +g[N>>2];g[y>>2]=0.0;break}else{N=x|0;g[N>>2]=+g[N>>2]-J;N=b+88|0;g[N>>2]=+g[N>>2]-I;g[y>>2]=M;break}}else if((D|0)==2){w=b+84|0;v=b+92|0;O=+g[v>>2];M=O-M;if(M>0.0){K=O*+g[b+212>>2]-F;g[x>>2]=O*+g[b+208>>2]-H;g[x+4>>2]=K;pm(y,d,x);K=+g[y>>2];G=+g[y+4>>2];E=-0.0- +g[v>>2];N=w|0;g[N>>2]=K+ +g[N>>2];N=b+88|0;g[N>>2]=G+ +g[N>>2];g[v>>2]=0.0;break}else{N=w|0;g[N>>2]=+g[N>>2]-J;N=b+88|0;g[N>>2]=+g[N>>2]-I;g[v>>2]=M;break}}}while(0);F=E+(G*+g[C>>2]-K*+g[B>>2]);E=E+(G*+g[z>>2]-K*+g[A>>2])}}while(0);if((s|0)==15){N=b+148|0;L=b+144|0;d=b+140|0;D=b+136|0;K=-0.0-(n+u*+g[L>>2]-h-t*+g[D>>2]);g[B>>2]=-0.0-(l+ +g[N>>2]*(-0.0-u)-r- +g[d>>2]*(-0.0-t));g[B+4>>2]=K;pm(A,b+184|0,B);K=+g[A>>2];C=b+84|0;g[C>>2]=K+ +g[C>>2];G=+g[A+4>>2];C=b+88|0;g[C>>2]=G+ +g[C>>2];F=G*+g[D>>2]-K*+g[d>>2];E=G*+g[L>>2]-K*+g[N>>2]}N=(c[q>>2]|0)+((c[f>>2]|0)*12|0)|0;O=+(r-o*K);M=+(h-o*G);g[N>>2]=O;g[N+4>>2]=M;N=c[q>>2]|0;g[N+((c[f>>2]|0)*12|0)+8>>2]=t-j*F;N=N+((c[k>>2]|0)*12|0)|0;M=+(l+m*K);O=+(n+m*G);g[N>>2]=M;g[N+4>>2]=O;g[(c[q>>2]|0)+((c[k>>2]|0)*12|0)+8>>2]=u+e*E;i=p;return}function Gh(b,d){b=b|0;d=d|0;var e=0,f=0.0,h=0,i=0,j=0.0,k=0.0,l=0.0,m=0.0,n=0.0,o=0.0,p=0.0,q=0.0,r=0.0,s=0.0,t=0.0,u=0.0,v=0.0,w=0.0,x=0.0,y=0.0,z=0.0,A=0.0,B=0.0,C=0.0,D=0.0,E=0,F=0,G=0;e=b+128|0;i=c[e>>2]|0;h=d+28|0;F=c[h>>2]|0;d=F+(i*12|0)|0;f=+g[d>>2];l=+g[d+4>>2];m=+g[F+(i*12|0)+8>>2];i=b+132|0;E=c[i>>2]|0;G=F+(E*12|0)|0;j=+g[G>>2];k=+g[G+4>>2];n=+g[F+(E*12|0)+8>>2];E=b+176|0;F=b+180|0;do{if((a[b+112|0]|0)==0){p=0.0;q=+g[E>>2];o=+g[F>>2]}else{o=+g[F>>2];q=+g[E>>2];E=c[b+224>>2]|0;if((E|0)==0|o+q==0.0){p=0.0;break}p=n-m- +g[b+116>>2];do{if((E|0)==3){p=p- +g[b+120>>2];p=p<.13962635397911072?p:.13962635397911072;p=p<-.13962635397911072?-.13962635397911072:p;r=p*(-0.0- +g[b+220>>2]);if(p>0.0){break}p=-0.0-p}else if((E|0)==1){p=p- +g[b+120>>2];r=p+.03490658849477768;r=r<0.0?r:0.0;p=-0.0-p;r=(r<-.13962635397911072?-.13962635397911072:r)*(-0.0- +g[b+220>>2])}else if((E|0)==2){p=p- +g[b+124>>2];r=p+-.03490658849477768;r=r<.13962635397911072?r:.13962635397911072;r=(r<0.0?0.0:r)*(-0.0- +g[b+220>>2])}else{p=0.0;r=0.0}}while(0);m=m-r*q;n=n+r*o}}while(0);s=+U(m);r=+T(m);x=+U(n);t=+T(n);y=+g[b+68>>2]- +g[b+152>>2];w=+g[b+72>>2]- +g[b+156>>2];v=r*y-s*w;w=s*y+r*w;r=+g[b+76>>2]- +g[b+160>>2];y=+g[b+80>>2]- +g[b+164>>2];s=t*r-x*y;y=x*r+t*y;t=j+s-f-v;r=k+y-l-w;x=+R(t*t+r*r);u=+g[b+168>>2];z=+g[b+172>>2];D=u+z;A=D+w*w*q+y*y*o;C=s*o;B=w*v*(-0.0-q)-y*C;C=D+v*v*q+s*C;D=A*C-B*B;if(D!=0.0){D=1.0/D}C=-0.0-(t*C-r*B)*D;D=-0.0-(r*A-t*B)*D;B=+(f-u*C);A=+(l-u*D);g[d>>2]=B;g[d+4>>2]=A;G=c[h>>2]|0;g[G+((c[e>>2]|0)*12|0)+8>>2]=m-q*(v*D-w*C);G=G+((c[i>>2]|0)*12|0)|0;A=+(j+z*C);B=+(k+z*D);g[G>>2]=A;g[G+4>>2]=B;g[(c[h>>2]|0)+((c[i>>2]|0)*12|0)+8>>2]=n+o*(s*D-y*C);if(x>.004999999888241291){G=0;return G|0}G=p<=.03490658849477768;return G|0}function Hh(a,b){a=a|0;b=b|0;var d=0.0,e=0.0,f=0.0,h=0.0,i=0.0,j=0;j=c[b+48>>2]|0;i=+g[j+24>>2];h=+g[b+68>>2];f=+g[j+20>>2];e=+g[b+72>>2];d=h*f+i*e+ +g[j+16>>2];g[a>>2]=+g[j+12>>2]+(i*h-f*e);g[a+4>>2]=d;return}function Ih(a,b){a=a|0;b=b|0;var d=0.0,e=0.0,f=0.0,h=0.0,i=0.0,j=0;j=c[b+52>>2]|0;i=+g[j+24>>2];h=+g[b+76>>2];f=+g[j+20>>2];e=+g[b+80>>2];d=h*f+i*e+ +g[j+16>>2];g[a>>2]=+g[j+12>>2]+(i*h-f*e);g[a+4>>2]=d;return}function Jh(a,b,c){a=a|0;b=b|0;c=+c;var d=0.0;d=+g[b+88>>2]*c;g[a>>2]=+g[b+84>>2]*c;g[a+4>>2]=d;return}function Kh(a,b){a=a|0;b=+b;return+(+g[a+92>>2]*b)}function Lh(a){a=a|0;return+(+g[(c[a+52>>2]|0)+72>>2]- +g[(c[a+48>>2]|0)+72>>2]- +g[a+116>>2])}function Mh(b){b=b|0;return(a[b+100|0]|0)!=0|0}function Nh(d,e){d=d|0;e=e|0;var f=0,h=0,i=0;f=c[d+48>>2]|0;h=f+4|0;i=b[h>>1]|0;if((i&2)==0){b[h>>1]=i|2;g[f+160>>2]=0.0}i=c[d+52>>2]|0;h=i+4|0;f=b[h>>1]|0;if(!((f&2)==0)){i=d+100|0;h=e&1;a[i]=h;return}b[h>>1]=f|2;g[i+160>>2]=0.0;i=d+100|0;h=e&1;a[i]=h;return}function Oh(a,d){a=a|0;d=+d;var e=0,f=0,h=0;e=c[a+48>>2]|0;f=e+4|0;h=b[f>>1]|0;if((h&2)==0){b[f>>1]=h|2;g[e+160>>2]=0.0}h=c[a+52>>2]|0;f=h+4|0;e=b[f>>1]|0;if(!((e&2)==0)){h=a+108|0;g[h>>2]=d;return}b[f>>1]=e|2;g[h+160>>2]=0.0;h=a+108|0;g[h>>2]=d;return}function Ph(b){b=b|0;return(a[b+112|0]|0)!=0|0}function Qh(e,f){e=e|0;f=f|0;var h=0,i=0,j=0,k=0;h=e+112|0;if((f&1|0)==(d[h]|0|0)){return}i=c[e+48>>2]|0;j=i+4|0;k=b[j>>1]|0;if((k&2)==0){b[j>>1]=k|2;g[i+160>>2]=0.0}i=c[e+52>>2]|0;j=i+4|0;k=b[j>>1]|0;if((k&2)==0){b[j>>1]=k|2;g[i+160>>2]=0.0}a[h]=f&1;g[e+92>>2]=0.0;return}function Rh(a){a=a|0;var b=0,e=0,f=0.0,j=0,k=0;b=i;k=c[(c[a+48>>2]|0)+8>>2]|0;j=c[(c[a+52>>2]|0)+8>>2]|0;zm(3192,(e=i,i=i+1|0,i=i+7&-8,c[e>>2]=0,e)|0);i=e;zm(3696,(e=i,i=i+8|0,c[e>>2]=k,e)|0);i=e;zm(2936,(e=i,i=i+8|0,c[e>>2]=j,e)|0);i=e;zm(2488,(e=i,i=i+8|0,c[e>>2]=d[a+61|0]|0,e)|0);i=e;f=+g[a+72>>2];zm(2008,(e=i,i=i+16|0,h[e>>3]=+g[a+68>>2],h[e+8>>3]=f,e)|0);i=e;f=+g[a+80>>2];zm(1528,(e=i,i=i+16|0,h[e>>3]=+g[a+76>>2],h[e+8>>3]=f,e)|0);i=e;zm(1160,(e=i,i=i+8|0,h[e>>3]=+g[a+116>>2],e)|0);i=e;zm(768,(e=i,i=i+8|0,c[e>>2]=d[a+112|0]|0,e)|0);i=e;zm(456,(e=i,i=i+8|0,h[e>>3]=+g[a+120>>2],e)|0);i=e;zm(168,(e=i,i=i+8|0,h[e>>3]=+g[a+124>>2],e)|0);i=e;zm(4208,(e=i,i=i+8|0,c[e>>2]=d[a+100|0]|0,e)|0);i=e;zm(4032,(e=i,i=i+8|0,h[e>>3]=+g[a+108>>2],e)|0);i=e;zm(3664,(e=i,i=i+8|0,h[e>>3]=+g[a+104>>2],e)|0);i=e;zm(3440,(e=i,i=i+8|0,c[e>>2]=c[a+56>>2],e)|0);i=e;i=b;return}function Sh(a){a=a|0;return}function Th(a){a=a|0;$m(a);return}function Uh(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var h=0.0,i=0.0,j=0.0,k=0.0,l=0.0,m=0,n=0,o=0;c[a+8>>2]=b;c[a+12>>2]=d;o=e|0;i=+g[o>>2]- +g[b+12>>2];n=e+4|0;j=+g[n>>2]- +g[b+16>>2];m=b+24|0;l=+g[m>>2];e=b+20|0;k=+g[e>>2];b=a+20|0;h=+(i*l+j*k);k=+(l*j+i*(-0.0-k));g[b>>2]=h;g[b+4>>2]=k;k=+g[o>>2]- +g[d+12>>2];h=+g[n>>2]- +g[d+16>>2];i=+g[d+24>>2];j=+g[d+20>>2];b=a+28|0;l=+(k*i+h*j);j=+(i*h+k*(-0.0-j));g[b>>2]=l;g[b+4>>2]=j;j=+g[m>>2];l=+g[f>>2];k=+g[e>>2];h=+g[f+4>>2];e=a+36|0;i=+(j*l+k*h);h=+(l*(-0.0-k)+j*h);g[e>>2]=i;g[e+4>>2]=h;return}function Vh(b,d){b=b|0;d=d|0;var e=0,f=0,h=0;yh(b|0,d|0);c[b>>2]=5624;e=d+20|0;f=b+76|0;h=c[e+4>>2]|0;c[f>>2]=c[e>>2];c[f+4>>2]=h;f=d+28|0;h=b+84|0;e=c[f+4>>2]|0;c[h>>2]=c[f>>2];c[h+4>>2]=e;h=d+36|0;e=b+92|0;f=c[h>>2]|0;h=c[h+4>>2]|0;c[e>>2]=f;c[e+4>>2]=h;e=b+100|0;g[e>>2]=(c[k>>2]=h,+g[k>>2])*-1.0;c[e+4>>2]=f;g[b+204>>2]=0.0;g[b+108>>2]=0.0;g[b+208>>2]=0.0;g[b+112>>2]=0.0;g[b+212>>2]=0.0;g[b+116>>2]=0.0;g[b+120>>2]=+g[d+48>>2];g[b+124>>2]=+g[d+52>>2];a[b+128|0]=a[d+44|0]|0;g[b+68>>2]=+g[d+56>>2];g[b+72>>2]=+g[d+60>>2];g[b+216>>2]=0.0;g[b+220>>2]=0.0;en(b+172|0,0,16)|0;return}function Wh(b,d){b=b|0;d=d|0;var e=0.0,f=0.0,h=0.0,i=0.0,j=0.0,l=0.0,m=0.0,n=0.0,o=0,p=0,q=0.0,r=0.0,s=0.0,t=0.0,u=0.0,v=0.0,w=0,x=0,y=0.0,z=0.0,A=0,B=0,C=0.0,D=0,E=0.0,F=0.0,G=0.0,H=0.0,I=0.0,J=0.0,K=0.0,L=0.0,M=0,N=0,O=0,P=0,Q=0,R=0.0,S=0.0;w=c[b+48>>2]|0;x=c[w+8>>2]|0;p=b+132|0;c[p>>2]=x;P=c[b+52>>2]|0;N=c[P+8>>2]|0;o=b+136|0;c[o>>2]=N;A=w+44|0;D=b+140|0;M=c[A>>2]|0;A=c[A+4>>2]|0;c[D>>2]=M;c[D+4>>2]=A;D=P+44|0;O=b+148|0;B=c[D>>2]|0;D=c[D+4>>2]|0;c[O>>2]=B;c[O+4>>2]=D;h=+g[w+136>>2];g[b+156>>2]=h;i=+g[P+136>>2];g[b+160>>2]=i;f=+g[w+144>>2];g[b+164>>2]=f;n=+g[P+144>>2];g[b+168>>2]=n;P=c[d+28>>2]|0;w=P+(x*12|0)|0;z=+g[w>>2];y=+g[w+4>>2];E=+g[P+(x*12|0)+8>>2];w=d+32|0;O=c[w>>2]|0;Q=O+(x*12|0)|0;u=+g[Q>>2];v=+g[Q+4>>2];q=+g[O+(x*12|0)+8>>2];Q=P+(N*12|0)|0;m=+g[Q>>2];j=+g[Q+4>>2];e=+g[P+(N*12|0)+8>>2];P=O+(N*12|0)|0;s=+g[P>>2];t=+g[P+4>>2];r=+g[O+(N*12|0)+8>>2];L=+U(E);E=+T(E);H=+U(e);e=+T(e);l=+g[b+76>>2]-(c[k>>2]=M,+g[k>>2]);F=+g[b+80>>2]-(c[k>>2]=A,+g[k>>2]);G=E*l-L*F;F=L*l+E*F;l=+g[b+84>>2]-(c[k>>2]=B,+g[k>>2]);I=+g[b+88>>2]-(c[k>>2]=D,+g[k>>2]);J=e*l-H*I;I=H*l+e*I;z=m+J-z-G;y=j+I-y-F;j=+g[b+100>>2];m=+g[b+104>>2];e=E*j-L*m;m=L*j+E*m;D=b+180|0;j=+e;l=+m;g[D>>2]=j;g[D+4>>2]=l;G=G+z;F=F+y;l=m*G-e*F;g[b+196>>2]=l;j=J*m-I*e;g[b+200>>2]=j;H=h+i;C=H+l*f*l+j*n*j;if(C>0.0){C=1.0/C}g[b+204>>2]=C;A=b+212|0;g[A>>2]=0.0;D=b+216|0;g[D>>2]=0.0;B=b+220|0;g[B>>2]=0.0;K=+g[b+68>>2];do{if(K>0.0){S=+g[b+92>>2];R=+g[b+96>>2];C=E*S-L*R;E=L*S+E*R;Q=b+172|0;R=+C;L=+E;g[Q>>2]=R;g[Q+4>>2]=L;L=G*E-F*C;g[b+188>>2]=L;F=J*E-I*C;g[b+192>>2]=F;F=H+L*f*L+F*n*F;if(!(F>0.0)){break}I=1.0/F;g[A>>2]=I;S=K*6.2831854820251465;H=S*I*S;G=+g[d>>2];I=G*(S*I*2.0*+g[b+72>>2]+G*H);if(I>0.0){I=1.0/I}g[B>>2]=I;g[D>>2]=(z*C+y*E)*G*H*I;y=F+I;g[A>>2]=y;if(!(y>0.0)){break}g[A>>2]=1.0/y}else{g[b+116>>2]=0.0}}while(0);do{if((a[b+128|0]|0)==0){g[b+208>>2]=0.0;g[b+112>>2]=0.0}else{y=n+f;A=b+208|0;g[A>>2]=y;if(!(y>0.0)){break}g[A>>2]=1.0/y}}while(0);if((a[d+24|0]|0)==0){g[b+108>>2]=0.0;g[b+116>>2]=0.0;g[b+112>>2]=0.0;K=q;S=r;L=s;R=t;I=u;J=v;Q=c[w>>2]|0;Q=Q+(x*12|0)|0;M=(g[k>>2]=I,c[k>>2]|0);O=(g[k>>2]=J,c[k>>2]|0);P=0;N=0;M=P|M;N=O|N;O=Q|0;c[O>>2]=M;Q=Q+4|0;c[Q>>2]=N;Q=c[p>>2]|0;N=c[w>>2]|0;Q=N+(Q*12|0)+8|0;g[Q>>2]=K;Q=c[o>>2]|0;Q=N+(Q*12|0)|0;N=(g[k>>2]=L,c[k>>2]|0);O=(g[k>>2]=R,c[k>>2]|0);M=0;P=0;N=M|N;P=O|P;O=Q|0;c[O>>2]=N;Q=Q+4|0;c[Q>>2]=P;Q=c[o>>2]|0;P=c[w>>2]|0;Q=P+(Q*12|0)+8|0;g[Q>>2]=S;return}else{M=d+8|0;Q=b+108|0;L=+g[M>>2]*+g[Q>>2];g[Q>>2]=L;Q=b+116|0;S=+g[M>>2]*+g[Q>>2];g[Q>>2]=S;Q=b+112|0;R=+g[M>>2]*+g[Q>>2];g[Q>>2]=R;I=L*e+S*+g[b+172>>2];J=L*m+S*+g[b+176>>2];K=q-(R+(L*l+S*+g[b+188>>2]))*f;S=r+(R+(L*j+S*+g[b+192>>2]))*n;L=s+I*i;R=t+J*i;I=u-I*h;J=v-J*h;Q=c[w>>2]|0;Q=Q+(x*12|0)|0;M=(g[k>>2]=I,c[k>>2]|0);O=(g[k>>2]=J,c[k>>2]|0);P=0;N=0;M=P|M;N=O|N;O=Q|0;c[O>>2]=M;Q=Q+4|0;c[Q>>2]=N;Q=c[p>>2]|0;N=c[w>>2]|0;Q=N+(Q*12|0)+8|0;g[Q>>2]=K;Q=c[o>>2]|0;Q=N+(Q*12|0)|0;N=(g[k>>2]=L,c[k>>2]|0);O=(g[k>>2]=R,c[k>>2]|0);M=0;P=0;N=M|N;P=O|P;O=Q|0;c[O>>2]=N;Q=Q+4|0;c[Q>>2]=P;Q=c[o>>2]|0;P=c[w>>2]|0;Q=P+(Q*12|0)+8|0;g[Q>>2]=S;return}}function Xh(a,b){a=a|0;b=b|0;var d=0.0,e=0.0,f=0.0,h=0.0,i=0.0,j=0.0,k=0.0,l=0.0,m=0.0,n=0.0,o=0,p=0,q=0,r=0,s=0,t=0.0,u=0.0,v=0.0,w=0.0,x=0.0,y=0.0,z=0,A=0;d=+g[a+156>>2];t=+g[a+160>>2];h=+g[a+164>>2];j=+g[a+168>>2];r=a+132|0;s=c[r>>2]|0;q=b+32|0;z=c[q>>2]|0;p=z+(s*12|0)|0;l=+g[p>>2];n=+g[p+4>>2];x=+g[z+(s*12|0)+8>>2];s=a+136|0;o=c[s>>2]|0;A=z+(o*12|0)|0;u=+g[A>>2];v=+g[A+4>>2];w=+g[z+(o*12|0)+8>>2];k=+g[a+172>>2];m=+g[a+176>>2];i=+g[a+192>>2];f=+g[a+188>>2];o=a+116|0;y=+g[o>>2];e=(+g[a+216>>2]+(w*i+(k*(u-l)+m*(v-n))-x*f)+ +g[a+220>>2]*y)*(-0.0- +g[a+212>>2]);g[o>>2]=y+e;k=k*e;m=m*e;l=l-d*k;n=n-d*m;f=x-h*e*f;k=u+t*k;m=v+t*m;i=w+j*e*i;o=a+112|0;e=+g[o>>2];w=+g[b>>2]*+g[a+120>>2];v=e+(i-f- +g[a+124>>2])*(-0.0- +g[a+208>>2]);u=-0.0-w;v=v<w?v:w;w=v<u?u:v;g[o>>2]=w;w=w-e;f=f-h*w;w=i+j*w;u=+g[a+180>>2];v=+g[a+184>>2];x=+g[a+200>>2];i=+g[a+196>>2];y=((k-l)*u+(m-n)*v+x*w-i*f)*(-0.0- +g[a+204>>2]);A=a+108|0;g[A>>2]=+g[A>>2]+y;u=u*y;v=v*y;l=+(l-d*u);n=+(n-d*v);g[p>>2]=l;g[p+4>>2]=n;A=c[q>>2]|0;g[A+((c[r>>2]|0)*12|0)+8>>2]=f-h*i*y;A=A+((c[s>>2]|0)*12|0)|0;u=+(k+t*u);v=+(m+t*v);g[A>>2]=u;g[A+4>>2]=v;g[(c[q>>2]|0)+((c[s>>2]|0)*12|0)+8>>2]=w+j*x*y;return}function Yh(a,b){a=a|0;b=b|0;var d=0,e=0.0,f=0.0,h=0.0,i=0.0,j=0.0,k=0,l=0.0,m=0.0,n=0.0,o=0.0,p=0.0,q=0.0,r=0.0,s=0,t=0.0,u=0.0,v=0.0,w=0.0,x=0.0,y=0.0,z=0.0,A=0.0,B=0.0,C=0,D=0,E=0,F=0.0;d=a+132|0;s=c[d>>2]|0;k=b+28|0;D=c[k>>2]|0;b=D+(s*12|0)|0;h=+g[b>>2];j=+g[b+4>>2];l=+g[D+(s*12|0)+8>>2];s=a+136|0;C=c[s>>2]|0;E=D+(C*12|0)|0;t=+g[E>>2];v=+g[E+4>>2];w=+g[D+(C*12|0)+8>>2];u=+U(l);p=+T(l);i=+U(w);n=+T(w);r=+g[a+76>>2]- +g[a+140>>2];e=+g[a+80>>2]- +g[a+144>>2];m=p*r-u*e;e=u*r+p*e;r=+g[a+84>>2]- +g[a+148>>2];y=+g[a+88>>2]- +g[a+152>>2];x=n*r-i*y;y=i*r+n*y;n=t-h+x-m;r=v-j+y-e;i=+g[a+100>>2];f=+g[a+104>>2];o=p*i-u*f;f=u*i+p*f;p=o*n+f*r;i=+g[a+156>>2];u=+g[a+160>>2];q=+g[a+164>>2];B=+g[a+196>>2];z=+g[a+168>>2];A=+g[a+200>>2];A=i+u+B*q*B+A*z*A;if(A!=0.0){A=(-0.0-p)/A}else{A=0.0}F=o*A;B=f*A;h=+(h-F*i);j=+(j-B*i);g[b>>2]=h;g[b+4>>2]=j;E=c[k>>2]|0;g[E+((c[d>>2]|0)*12|0)+8>>2]=l-(f*(m+n)-o*(e+r))*A*q;E=E+((c[s>>2]|0)*12|0)|0;t=+(t+F*u);B=+(v+B*u);g[E>>2]=t;g[E+4>>2]=B;g[(c[k>>2]|0)+((c[s>>2]|0)*12|0)+8>>2]=w+(x*f-y*o)*A*z;if(p>0.0){F=p;E=F<=.004999999888241291;return E|0}F=-0.0-p;E=F<=.004999999888241291;return E|0}function Zh(a,b){a=a|0;b=b|0;var d=0.0,e=0.0,f=0.0,h=0.0,i=0.0,j=0;j=c[b+48>>2]|0;i=+g[j+24>>2];h=+g[b+76>>2];f=+g[j+20>>2];e=+g[b+80>>2];d=h*f+i*e+ +g[j+16>>2];g[a>>2]=+g[j+12>>2]+(i*h-f*e);g[a+4>>2]=d;return}function _h(a,b){a=a|0;b=b|0;var d=0.0,e=0.0,f=0.0,h=0.0,i=0.0,j=0;j=c[b+52>>2]|0;i=+g[j+24>>2];h=+g[b+84>>2];f=+g[j+20>>2];e=+g[b+88>>2];d=h*f+i*e+ +g[j+16>>2];g[a>>2]=+g[j+12>>2]+(i*h-f*e);g[a+4>>2]=d;return}function $h(a,b,c){a=a|0;b=b|0;c=+c;var d=0.0,e=0.0,f=0.0;f=+g[b+108>>2];e=+g[b+116>>2];d=(f*+g[b+184>>2]+e*+g[b+176>>2])*c;g[a>>2]=(f*+g[b+180>>2]+e*+g[b+172>>2])*c;g[a+4>>2]=d;return}function ai(a,b){a=a|0;b=+b;return+(+g[a+112>>2]*b)}function bi(a,d){a=a|0;d=+d;var e=0,f=0,h=0;e=c[a+48>>2]|0;f=e+4|0;h=b[f>>1]|0;if((h&2)==0){b[f>>1]=h|2;g[e+160>>2]=0.0}h=c[a+52>>2]|0;f=h+4|0;e=b[f>>1]|0;if(!((e&2)==0)){h=a+124|0;g[h>>2]=d;return}b[f>>1]=e|2;g[h+160>>2]=0.0;h=a+124|0;g[h>>2]=d;return}function ci(a){a=a|0;var b=0,e=0,f=0.0,j=0,k=0;b=i;k=c[(c[a+48>>2]|0)+8>>2]|0;j=c[(c[a+52>>2]|0)+8>>2]|0;zm(2848,(e=i,i=i+1|0,i=i+7&-8,c[e>>2]=0,e)|0);i=e;zm(3584,(e=i,i=i+8|0,c[e>>2]=k,e)|0);i=e;zm(2904,(e=i,i=i+8|0,c[e>>2]=j,e)|0);i=e;zm(2448,(e=i,i=i+8|0,c[e>>2]=d[a+61|0]|0,e)|0);i=e;f=+g[a+80>>2];zm(1960,(e=i,i=i+16|0,h[e>>3]=+g[a+76>>2],h[e+8>>3]=f,e)|0);i=e;f=+g[a+88>>2];zm(1480,(e=i,i=i+16|0,h[e>>3]=+g[a+84>>2],h[e+8>>3]=f,e)|0);i=e;f=+g[a+96>>2];zm(1120,(e=i,i=i+16|0,h[e>>3]=+g[a+92>>2],h[e+8>>3]=f,e)|0);i=e;zm(736,(e=i,i=i+8|0,c[e>>2]=d[a+128|0]|0,e)|0);i=e;zm(424,(e=i,i=i+8|0,h[e>>3]=+g[a+124>>2],e)|0);i=e;zm(136,(e=i,i=i+8|0,h[e>>3]=+g[a+120>>2],e)|0);i=e;zm(4176,(e=i,i=i+8|0,h[e>>3]=+g[a+68>>2],e)|0);i=e;zm(4e3,(e=i,i=i+8|0,h[e>>3]=+g[a+72>>2],e)|0);i=e;zm(3616,(e=i,i=i+8|0,c[e>>2]=c[a+56>>2],e)|0);i=e;i=b;return}function di(a){a=a|0;return}function ei(a){a=a|0;$m(a);return}function fi(a,b,d,e,f,h,i,j){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;h=h|0;i=i|0;j=+j;var k=0.0,l=0.0,m=0,n=0,o=0.0,p=0.0,q=0.0,r=0;c[a+8>>2]=b;c[a+12>>2]=d;m=e;r=a+20|0;n=c[m+4>>2]|0;c[r>>2]=c[m>>2];c[r+4>>2]=n;r=f;n=a+28|0;m=c[r+4>>2]|0;c[n>>2]=c[r>>2];c[n+4>>2]=m;n=h|0;q=+g[n>>2]- +g[b+12>>2];m=h+4|0;k=+g[m>>2]- +g[b+16>>2];l=+g[b+24>>2];o=+g[b+20>>2];b=a+36|0;p=+(q*l+k*o);o=+(l*k+q*(-0.0-o));g[b>>2]=p;g[b+4>>2]=o;b=i|0;o=+g[b>>2]- +g[d+12>>2];h=i+4|0;p=+g[h>>2]- +g[d+16>>2];q=+g[d+24>>2];k=+g[d+20>>2];i=a+44|0;l=+(o*q+p*k);k=+(q*p+o*(-0.0-k));g[i>>2]=l;g[i+4>>2]=k;k=+g[n>>2]- +g[e>>2];l=+g[m>>2]- +g[e+4>>2];g[a+52>>2]=+R(k*k+l*l);l=+g[b>>2]- +g[f>>2];k=+g[h>>2]- +g[f+4>>2];g[a+56>>2]=+R(l*l+k*k);g[a+60>>2]=j;return}function gi(a,b){a=a|0;b=b|0;var d=0,e=0.0,f=0,h=0;yh(a|0,b|0);c[a>>2]=5504;h=b+20|0;f=a+68|0;d=c[h+4>>2]|0;c[f>>2]=c[h>>2];c[f+4>>2]=d;f=b+28|0;d=a+76|0;h=c[f+4>>2]|0;c[d>>2]=c[f>>2];c[d+4>>2]=h;d=b+36|0;h=a+92|0;f=c[d+4>>2]|0;c[h>>2]=c[d>>2];c[h+4>>2]=f;h=b+44|0;f=a+100|0;d=c[h+4>>2]|0;c[f>>2]=c[h>>2];c[f+4>>2]=d;f=b+52|0;g[a+84>>2]=+g[f>>2];d=b+56|0;g[a+88>>2]=+g[d>>2];e=+g[b+60>>2];g[a+112>>2]=e;g[a+108>>2]=+g[f>>2]+e*+g[d>>2];g[a+116>>2]=0.0;return}function hi(b,d){b=b|0;d=d|0;var e=0.0,f=0.0,h=0.0,i=0.0,j=0.0,l=0.0,m=0,n=0,o=0,p=0,q=0.0,r=0.0,s=0.0,t=0.0,u=0.0,v=0.0,w=0.0,x=0.0,y=0.0,z=0.0,A=0.0,B=0.0,C=0.0,D=0,E=0,F=0.0,G=0,H=0.0,I=0,J=0,K=0,L=0,M=0;m=c[b+48>>2]|0;n=c[m+8>>2]|0;o=b+120|0;c[o>>2]=n;L=c[b+52>>2]|0;J=c[L+8>>2]|0;p=b+124|0;c[p>>2]=J;G=m+44|0;E=b+160|0;I=c[G>>2]|0;G=c[G+4>>2]|0;c[E>>2]=I;c[E+4>>2]=G;E=L+44|0;K=b+168|0;D=c[E>>2]|0;E=c[E+4>>2]|0;c[K>>2]=D;c[K+4>>2]=E;x=+g[m+136>>2];g[b+176>>2]=x;e=+g[L+136>>2];g[b+180>>2]=e;q=+g[m+144>>2];g[b+184>>2]=q;t=+g[L+144>>2];g[b+188>>2]=t;L=c[d+28>>2]|0;m=L+(n*12|0)|0;z=+g[m>>2];F=+g[m+4>>2];v=+g[L+(n*12|0)+8>>2];m=d+32|0;K=c[m>>2]|0;M=K+(n*12|0)|0;j=+g[M>>2];l=+g[M+4>>2];w=+g[K+(n*12|0)+8>>2];M=L+(J*12|0)|0;B=+g[M>>2];C=+g[M+4>>2];A=+g[L+(J*12|0)+8>>2];L=K+(J*12|0)|0;h=+g[L>>2];i=+g[L+4>>2];f=+g[K+(J*12|0)+8>>2];u=+U(v);v=+T(v);H=+U(A);A=+T(A);y=+g[b+92>>2]-(c[k>>2]=I,+g[k>>2]);s=+g[b+96>>2]-(c[k>>2]=G,+g[k>>2]);r=v*y-u*s;s=u*y+v*s;G=b+144|0;v=+r;y=+s;g[G>>2]=v;g[G+4>>2]=y;y=+g[b+100>>2]-(c[k>>2]=D,+g[k>>2]);v=+g[b+104>>2]-(c[k>>2]=E,+g[k>>2]);u=A*y-H*v;v=H*y+A*v;E=b+152|0;A=+u;y=+v;g[E>>2]=A;g[E+4>>2]=y;E=b+128|0;z=z+r- +g[b+68>>2];F=F+s- +g[b+72>>2];D=E;y=+z;A=+F;g[D>>2]=y;g[D+4>>2]=A;D=b+136|0;B=B+u- +g[b+76>>2];C=C+v- +g[b+80>>2];G=D;A=+B;y=+C;g[G>>2]=A;g[G+4>>2]=y;E=E|0;y=+R(z*z+F*F);D=D|0;A=+R(B*B+C*C);if(y>.04999999701976776){y=1.0/y;z=z*y;g[E>>2]=z;y=y*F}else{g[E>>2]=0.0;y=0.0;z=0.0}g[b+132>>2]=y;if(A>.04999999701976776){H=1.0/A;A=H*B;g[D>>2]=A;B=H*C}else{g[D>>2]=0.0;B=0.0;A=0.0}g[b+140>>2]=B;H=r*y-s*z;F=u*B-v*A;C=+g[b+112>>2];F=x+H*H*q+C*C*(e+F*F*t);if(F>0.0){F=1.0/F}g[b+192>>2]=F;if((a[d+24|0]|0)==0){g[b+116>>2]=0.0;B=w;H=f;C=h;F=i;z=j;A=l;M=c[m>>2]|0;M=M+(n*12|0)|0;I=(g[k>>2]=z,c[k>>2]|0);K=(g[k>>2]=A,c[k>>2]|0);L=0;J=0;I=L|I;J=K|J;K=M|0;c[K>>2]=I;M=M+4|0;c[M>>2]=J;M=c[o>>2]|0;J=c[m>>2]|0;M=J+(M*12|0)+8|0;g[M>>2]=B;M=c[p>>2]|0;M=J+(M*12|0)|0;J=(g[k>>2]=C,c[k>>2]|0);K=(g[k>>2]=F,c[k>>2]|0);I=0;L=0;J=I|J;L=K|L;K=M|0;c[K>>2]=J;M=M+4|0;c[M>>2]=L;M=c[p>>2]|0;L=c[m>>2]|0;M=L+(M*12|0)+8|0;g[M>>2]=H;return}else{M=b+116|0;F=+g[d+8>>2]*+g[M>>2];g[M>>2]=F;H=-0.0-F;z=z*H;y=y*H;F=F*(-0.0-C);C=A*F;F=B*F;B=w+q*(y*r-z*s);H=f+t*(F*u-C*v);C=h+C*e;F=i+F*e;z=j+z*x;A=l+y*x;M=c[m>>2]|0;M=M+(n*12|0)|0;I=(g[k>>2]=z,c[k>>2]|0);K=(g[k>>2]=A,c[k>>2]|0);L=0;J=0;I=L|I;J=K|J;K=M|0;c[K>>2]=I;M=M+4|0;c[M>>2]=J;M=c[o>>2]|0;J=c[m>>2]|0;M=J+(M*12|0)+8|0;g[M>>2]=B;M=c[p>>2]|0;M=J+(M*12|0)|0;J=(g[k>>2]=C,c[k>>2]|0);K=(g[k>>2]=F,c[k>>2]|0);I=0;L=0;J=I|J;L=K|L;K=M|0;c[K>>2]=J;M=M+4|0;c[M>>2]=L;M=c[p>>2]|0;L=c[m>>2]|0;M=L+(M*12|0)+8|0;g[M>>2]=H;return}}function ii(a,b){a=a|0;b=b|0;var d=0,e=0.0,f=0.0,h=0.0,i=0.0,j=0.0,k=0.0,l=0,m=0.0,n=0,o=0.0,p=0.0,q=0.0,r=0.0,s=0.0,t=0.0,u=0.0,v=0.0,w=0.0,x=0.0,y=0,z=0,A=0;l=a+120|0;y=c[l>>2]|0;d=b+32|0;z=c[d>>2]|0;n=z+(y*12|0)|0;s=+g[n>>2];r=+g[n+4>>2];v=+g[z+(y*12|0)+8>>2];b=a+124|0;y=c[b>>2]|0;A=z+(y*12|0)|0;k=+g[A>>2];j=+g[A+4>>2];u=+g[z+(y*12|0)+8>>2];m=+g[a+148>>2];f=+g[a+144>>2];e=+g[a+156>>2];t=+g[a+152>>2];p=+g[a+128>>2];x=+g[a+132>>2];i=+g[a+112>>2];h=+g[a+136>>2];o=+g[a+140>>2];w=(-0.0-((s+m*(-0.0-v))*p+(r+v*f)*x)-i*((k+e*(-0.0-u))*h+(j+u*t)*o))*(-0.0- +g[a+192>>2]);y=a+116|0;g[y>>2]=+g[y>>2]+w;q=-0.0-w;p=p*q;q=x*q;i=w*(-0.0-i);h=h*i;i=o*i;o=+g[a+176>>2];m=v+ +g[a+184>>2]*(q*f-p*m);f=+g[a+180>>2];e=u+ +g[a+188>>2]*(i*t-h*e);p=+(s+p*o);o=+(r+q*o);g[n>>2]=p;g[n+4>>2]=o;a=c[d>>2]|0;g[a+((c[l>>2]|0)*12|0)+8>>2]=m;a=a+((c[b>>2]|0)*12|0)|0;h=+(k+h*f);f=+(j+i*f);g[a>>2]=h;g[a+4>>2]=f;g[(c[d>>2]|0)+((c[b>>2]|0)*12|0)+8>>2]=e;return}function ji(a,b){a=a|0;b=b|0;var d=0,e=0.0,f=0.0,h=0.0,i=0.0,j=0,k=0,l=0.0,m=0.0,n=0.0,o=0.0,p=0.0,q=0.0,r=0.0,s=0.0,t=0.0,u=0.0,v=0.0,w=0.0,x=0.0,y=0.0,z=0.0,A=0.0,B=0.0,C=0.0,D=0,E=0,F=0,G=0.0;d=a+120|0;j=c[d>>2]|0;k=b+28|0;E=c[k>>2]|0;b=E+(j*12|0)|0;q=+g[b>>2];p=+g[b+4>>2];e=+g[E+(j*12|0)+8>>2];j=a+124|0;D=c[j>>2]|0;F=E+(D*12|0)|0;i=+g[F>>2];l=+g[F+4>>2];m=+g[E+(D*12|0)+8>>2];n=+U(e);t=+T(e);v=+U(m);r=+T(m);o=+g[a+92>>2]- +g[a+160>>2];h=+g[a+96>>2]- +g[a+164>>2];f=t*o-n*h;h=n*o+t*h;t=+g[a+100>>2]- +g[a+168>>2];o=+g[a+104>>2]- +g[a+172>>2];n=r*t-v*o;o=v*t+r*o;r=q+f- +g[a+68>>2];t=p+h- +g[a+72>>2];v=i+n- +g[a+76>>2];w=l+o- +g[a+80>>2];s=+R(r*r+t*t);u=+R(v*v+w*w);if(s>.04999999701976776){C=1.0/s;r=r*C;t=t*C}else{r=0.0;t=0.0}if(u>.04999999701976776){x=1.0/u;v=v*x;x=w*x}else{v=0.0;x=0.0}G=f*t-h*r;C=n*x-o*v;z=+g[a+176>>2];A=+g[a+184>>2];B=+g[a+180>>2];w=+g[a+188>>2];y=+g[a+112>>2];C=z+G*G*A+y*y*(B+C*C*w);if(C>0.0){C=1.0/C}s=+g[a+108>>2]-s-u*y;if(s>0.0){u=s}else{u=-0.0-s}C=s*(-0.0-C);G=-0.0-C;s=r*G;t=t*G;C=C*(-0.0-y);G=v*C;C=x*C;y=+(q+s*z);z=+(p+t*z);g[b>>2]=y;g[b+4>>2]=z;F=c[k>>2]|0;g[F+((c[d>>2]|0)*12|0)+8>>2]=e+(f*t-h*s)*A;F=F+((c[j>>2]|0)*12|0)|0;A=+(i+G*B);B=+(l+C*B);g[F>>2]=A;g[F+4>>2]=B;g[(c[k>>2]|0)+((c[j>>2]|0)*12|0)+8>>2]=m+w*(n*C-o*G);return u<.004999999888241291|0}function ki(a,b){a=a|0;b=b|0;var d=0.0,e=0.0,f=0.0,h=0.0,i=0.0,j=0;j=c[b+48>>2]|0;i=+g[j+24>>2];h=+g[b+92>>2];f=+g[j+20>>2];e=+g[b+96>>2];d=h*f+i*e+ +g[j+16>>2];g[a>>2]=+g[j+12>>2]+(i*h-f*e);g[a+4>>2]=d;return}function li(a,b){a=a|0;b=b|0;var d=0.0,e=0.0,f=0.0,h=0.0,i=0.0,j=0;j=c[b+52>>2]|0;i=+g[j+24>>2];h=+g[b+100>>2];f=+g[j+20>>2];e=+g[b+104>>2];d=h*f+i*e+ +g[j+16>>2];g[a>>2]=+g[j+12>>2]+(i*h-f*e);g[a+4>>2]=d;return}function mi(a,b,c){a=a|0;b=b|0;c=+c;var d=0.0,e=0.0;e=+g[b+116>>2];d=e*+g[b+140>>2]*c;g[a>>2]=e*+g[b+136>>2]*c;g[a+4>>2]=d;return}function ni(a,b){a=a|0;b=+b;return+0.0}function oi(a){a=a|0;var b=0,e=0,f=0.0,j=0,k=0;b=i;k=c[(c[a+48>>2]|0)+8>>2]|0;j=c[(c[a+52>>2]|0)+8>>2]|0;zm(2824,(e=i,i=i+1|0,i=i+7&-8,c[e>>2]=0,e)|0);i=e;zm(3552,(e=i,i=i+8|0,c[e>>2]=k,e)|0);i=e;zm(2872,(e=i,i=i+8|0,c[e>>2]=j,e)|0);i=e;zm(2408,(e=i,i=i+8|0,c[e>>2]=d[a+61|0]|0,e)|0);i=e;f=+g[a+72>>2];zm(1912,(e=i,i=i+16|0,h[e>>3]=+g[a+68>>2],h[e+8>>3]=f,e)|0);i=e;f=+g[a+80>>2];zm(1432,(e=i,i=i+16|0,h[e>>3]=+g[a+76>>2],h[e+8>>3]=f,e)|0);i=e;f=+g[a+96>>2];zm(1072,(e=i,i=i+16|0,h[e>>3]=+g[a+92>>2],h[e+8>>3]=f,e)|0);i=e;f=+g[a+104>>2];zm(688,(e=i,i=i+16|0,h[e>>3]=+g[a+100>>2],h[e+8>>3]=f,e)|0);i=e;zm(392,(e=i,i=i+8|0,h[e>>3]=+g[a+84>>2],e)|0);i=e;zm(104,(e=i,i=i+8|0,h[e>>3]=+g[a+88>>2],e)|0);i=e;zm(4152,(e=i,i=i+8|0,h[e>>3]=+g[a+112>>2],e)|0);i=e;zm(3952,(e=i,i=i+8|0,c[e>>2]=c[a+56>>2],e)|0);i=e;i=b;return}function pi(a,b){a=a|0;b=b|0;var c=0,d=0;d=b|0;c=a+68|0;g[c>>2]=+g[c>>2]- +g[d>>2];c=b+4|0;b=a+72|0;g[b>>2]=+g[b>>2]- +g[c>>2];b=a+76|0;g[b>>2]=+g[b>>2]- +g[d>>2];b=a+80|0;g[b>>2]=+g[b>>2]- +g[c>>2];return}function qi(a){a=a|0;return}function ri(a){a=a|0;$m(a);return}function si(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;f=mm(f,148)|0;if((f|0)==0){f=0;f=f|0;return f|0}zi(f,a,b,d,e);c[f>>2]=4808;f=f|0;return f|0}function ti(a,b){a=a|0;b=b|0;tb[c[(c[a>>2]|0)+4>>2]&255](a);nm(b,a,148);return}function ui(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,h=0,j=0;f=i;i=i+48|0;h=f|0;j=c[(c[a+48>>2]|0)+12>>2]|0;c[h>>2]=6064;c[h+4>>2]=1;g[h+8>>2]=.009999999776482582;en(h+28|0,0,18)|0;Je(j,h,c[a+56>>2]|0);jf(b,h,d,c[(c[a+52>>2]|0)+12>>2]|0,e);i=f;return}function vi(a){a=a|0;return}function wi(a){a=a|0;$m(a);return}function xi(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,i=0,j=0;if((a[8864]|0)==0){c[2218]=10;c[2219]=36;a[8880]=1;c[2242]=14;c[2243]=32;a[8976]=1;c[2224]=14;c[2225]=32;a[8904]=0;c[2248]=2;c[2249]=54;a[9e3]=1;c[2230]=8;c[2231]=100;a[8928]=1;c[2221]=8;c[2222]=100;a[8892]=0;c[2236]=24;c[2237]=122;a[8952]=1;c[2245]=24;c[2246]=122;a[8988]=0;c[2254]=18;c[2255]=40;a[9024]=1;c[2227]=18;c[2228]=40;a[8916]=0;c[2260]=4;c[2261]=76;a[9048]=1;c[2251]=4;c[2252]=76;a[9012]=0;a[8864]=1}i=c[(c[b+12>>2]|0)+4>>2]|0;j=c[(c[e+12>>2]|0)+4>>2]|0;h=c[8872+(i*48|0)+(j*12|0)>>2]|0;if((h|0)==0){j=0;return j|0}if((a[8872+(i*48|0)+(j*12|0)+8|0]|0)==0){j=Db[h&31](e,f,b,d,g)|0;return j|0}else{j=Db[h&31](b,d,e,f,g)|0;return j|0}return 0}function yi(d,e){d=d|0;e=e|0;var f=0,h=0,i=0,j=0,k=0;f=c[d+48>>2]|0;h=c[d+52>>2]|0;do{if((c[d+124>>2]|0)>0){if((a[f+38|0]|0)!=0){break}if((a[h+38|0]|0)!=0){break}i=c[f+8>>2]|0;j=i+4|0;k=b[j>>1]|0;if((k&2)==0){b[j>>1]=k|2;g[i+160>>2]=0.0}k=c[h+8>>2]|0;j=k+4|0;i=b[j>>1]|0;if(!((i&2)==0)){break}b[j>>1]=i|2;g[k+160>>2]=0.0}}while(0);ub[c[8872+((c[(c[f+12>>2]|0)+4>>2]|0)*48|0)+((c[(c[h+12>>2]|0)+4>>2]|0)*12|0)+4>>2]&255](d,e);return}function zi(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var h=0.0,i=0.0;c[a>>2]=4680;c[a+4>>2]=4;c[a+48>>2]=b;c[a+52>>2]=e;c[a+56>>2]=d;c[a+60>>2]=f;c[a+124>>2]=0;c[a+128>>2]=0;en(a+8|0,0,40)|0;g[a+136>>2]=+R(+g[b+16>>2]*+g[e+16>>2]);h=+g[b+20>>2];i=+g[e+20>>2];g[a+140>>2]=h>i?h:i;g[a+144>>2]=0.0;return}function Ai(d,e){d=d|0;e=e|0;var f=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0;f=i;i=i+64|0;h=f|0;t=d+64|0;fn(h|0,t|0,64)|0;k=d+4|0;n=c[k>>2]|0;c[k>>2]=n|4;n=n>>>1;p=c[d+48>>2]|0;s=c[d+52>>2]|0;j=(a[s+38|0]|a[p+38|0])<<24>>24!=0;m=c[p+8>>2]|0;l=c[s+8>>2]|0;r=m+12|0;q=l+12|0;do{if(j){p=of(c[p+12>>2]|0,c[d+56>>2]|0,c[s+12>>2]|0,c[d+60>>2]|0,r,q)|0;c[d+124>>2]=0;n=n&1}else{Eb[c[c[d>>2]>>2]&63](d,t,r,q);v=d+124|0;p=(c[v>>2]|0)>0;if(p){q=c[h+60>>2]|0;w=0;do{t=d+64+(w*20|0)+8|0;g[t>>2]=0.0;s=d+64+(w*20|0)+12|0;g[s>>2]=0.0;r=c[d+64+(w*20|0)+16>>2]|0;u=0;while(1){if((u|0)>=(q|0)){break}if((c[h+(u*20|0)+16>>2]|0)==(r|0)){o=8;break}else{u=u+1|0}}if((o|0)==8){o=0;g[t>>2]=+g[h+(u*20|0)+8>>2];g[s>>2]=+g[h+(u*20|0)+12>>2]}w=w+1|0;}while((w|0)<(c[v>>2]|0))}n=n&1;if(!(p^(n|0)!=0)){break}o=m+4|0;q=b[o>>1]|0;if((q&2)==0){b[o>>1]=q|2;g[m+160>>2]=0.0}o=l+4|0;m=b[o>>1]|0;if(!((m&2)==0)){break}b[o>>1]=m|2;g[l+160>>2]=0.0}}while(0);l=c[k>>2]|0;c[k>>2]=p?l|2:l&-3;k=(n|0)==0;l=p^1;m=(e|0)==0;if(!(k^1|l|m)){ub[c[(c[e>>2]|0)+8>>2]&255](e,d)}if(!(k|p|m)){ub[c[(c[e>>2]|0)+12>>2]&255](e,d)}if(j|l|m){i=f;return}xb[c[(c[e>>2]|0)+32>>2]&31](e,d,h);i=f;return}function Bi(a){a=a|0;return}function Ci(a){a=a|0;$m(a);return}function Di(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;f=mm(f,148)|0;if((f|0)==0){e=0;e=e|0;return e|0}zi(f,a,0,d,0);c[f>>2]=4776;e=f;e=e|0;return e|0}function Ei(a,b){a=a|0;b=b|0;tb[c[(c[a>>2]|0)+4>>2]&255](a);nm(b,a,148);return}function Fi(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;Xe(b,c[(c[a+48>>2]|0)+12>>2]|0,d,c[(c[a+52>>2]|0)+12>>2]|0,e);return}function Gi(a){a=a|0;return}function Hi(a){a=a|0;$m(a);return}function Ii(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;f=mm(f,148)|0;if((f|0)==0){e=0;e=e|0;return e|0}zi(f,a,0,d,0);c[f>>2]=5416;e=f;e=e|0;return e|0}function Ji(a,b){a=a|0;b=b|0;tb[c[(c[a>>2]|0)+4>>2]&255](a);nm(b,a,148);return}function Ki(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;We(b,c[(c[a+48>>2]|0)+12>>2]|0,d,c[(c[a+52>>2]|0)+12>>2]|0,e);return}function Li(a){a=a|0;return}function Mi(a){a=a|0;$m(a);return}function Ni(b,d){b=b|0;d=d|0;var e=0,f=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0.0,q=0.0,r=0,s=0,t=0,u=0,v=0,w=0,x=0;l=b;k=d;c[l>>2]=c[k>>2];c[l+4>>2]=c[k+4>>2];c[l+8>>2]=c[k+8>>2];c[l+12>>2]=c[k+12>>2];c[l+16>>2]=c[k+16>>2];c[l+20>>2]=c[k+20>>2];c[l+24>>2]=c[k+24>>2];l=c[d+44>>2]|0;k=b+36|0;c[k>>2]=l;e=c[d+32>>2]|0;f=b+52|0;c[f>>2]=e;h=b+40|0;c[h>>2]=Gm(l,e*88|0)|0;k=Gm(c[k>>2]|0,(c[f>>2]|0)*156|0)|0;e=b+44|0;c[e>>2]=k;c[b+28>>2]=c[d+36>>2];c[b+32>>2]=c[d+40>>2];l=c[d+28>>2]|0;i=b+48|0;c[i>>2]=l;if((c[f>>2]|0)<=0){return}d=b+24|0;b=b+8|0;j=0;while(1){m=c[l+(j<<2)>>2]|0;v=c[m+48>>2]|0;u=c[m+52>>2]|0;q=+g[(c[v+12>>2]|0)+8>>2];p=+g[(c[u+12>>2]|0)+8>>2];v=c[v+8>>2]|0;u=c[u+8>>2]|0;o=c[m+124>>2]|0;g[k+(j*156|0)+136>>2]=+g[m+136>>2];g[k+(j*156|0)+140>>2]=+g[m+140>>2];g[k+(j*156|0)+144>>2]=+g[m+144>>2];x=v+8|0;c[k+(j*156|0)+112>>2]=c[x>>2];w=u+8|0;c[k+(j*156|0)+116>>2]=c[w>>2];t=v+136|0;g[k+(j*156|0)+120>>2]=+g[t>>2];l=u+136|0;g[k+(j*156|0)+124>>2]=+g[l>>2];s=v+144|0;g[k+(j*156|0)+128>>2]=+g[s>>2];r=u+144|0;g[k+(j*156|0)+132>>2]=+g[r>>2];c[k+(j*156|0)+152>>2]=j;c[k+(j*156|0)+148>>2]=o;en(k+(j*156|0)+80|0,0,32)|0;n=c[h>>2]|0;c[n+(j*88|0)+32>>2]=c[x>>2];c[n+(j*88|0)+36>>2]=c[w>>2];g[n+(j*88|0)+40>>2]=+g[t>>2];g[n+(j*88|0)+44>>2]=+g[l>>2];v=v+44|0;l=n+(j*88|0)+48|0;t=c[v+4>>2]|0;c[l>>2]=c[v>>2];c[l+4>>2]=t;u=u+44|0;l=n+(j*88|0)+56|0;t=c[u+4>>2]|0;c[l>>2]=c[u>>2];c[l+4>>2]=t;g[n+(j*88|0)+64>>2]=+g[s>>2];g[n+(j*88|0)+68>>2]=+g[r>>2];r=m+104|0;s=n+(j*88|0)+16|0;l=c[r+4>>2]|0;c[s>>2]=c[r>>2];c[s+4>>2]=l;s=m+112|0;l=n+(j*88|0)+24|0;r=c[s+4>>2]|0;c[l>>2]=c[s>>2];c[l+4>>2]=r;c[n+(j*88|0)+84>>2]=o;g[n+(j*88|0)+76>>2]=q;g[n+(j*88|0)+80>>2]=p;c[n+(j*88|0)+72>>2]=c[m+120>>2];if((o|0)>0){l=0;do{if((a[d]|0)==0){g[k+(j*156|0)+(l*36|0)+16>>2]=0.0;g[k+(j*156|0)+(l*36|0)+20>>2]=0.0}else{g[k+(j*156|0)+(l*36|0)+16>>2]=+g[b>>2]*+g[m+64+(l*20|0)+8>>2];g[k+(j*156|0)+(l*36|0)+20>>2]=+g[b>>2]*+g[m+64+(l*20|0)+12>>2]}g[k+(j*156|0)+(l*36|0)+24>>2]=0.0;g[k+(j*156|0)+(l*36|0)+28>>2]=0.0;g[k+(j*156|0)+(l*36|0)+32>>2]=0.0;v=m+64+(l*20|0)|0;x=n+(j*88|0)+(l<<3)|0;en(k+(j*156|0)+(l*36|0)|0,0,16)|0;w=c[v+4>>2]|0;c[x>>2]=c[v>>2];c[x+4>>2]=w;l=l+1|0;}while((l|0)<(o|0))}j=j+1|0;if((j|0)>=(c[f>>2]|0)){break}l=c[i>>2]|0;k=c[e>>2]|0}return}function Oi(a){a=a|0;var b=0;b=a+36|0;Im(c[b>>2]|0,c[a+44>>2]|0);Im(c[b>>2]|0,c[a+40>>2]|0);return}function Pi(a){a=a|0;var b=0,d=0,e=0,f=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0.0,z=0.0,A=0,B=0,C=0.0,D=0.0,E=0,F=0.0,G=0,H=0.0,I=0.0,J=0.0,K=0.0,L=0.0,M=0.0,N=0.0,O=0.0,P=0.0,Q=0.0,R=0,S=0,V=0.0,W=0.0,X=0.0,Y=0.0,Z=0.0,_=0.0,$=0,aa=0.0,ba=0.0,ca=0.0,da=0.0,ea=0,fa=0;d=i;i=i+16|0;q=d|0;p=q|0;f=q;s=i;i=i+16|0;k=s|0;h=s;u=i;i=i+32|0;j=u|0;e=u;b=a+52|0;if((c[b>>2]|0)<=0){i=d;return}l=a+44|0;m=a+40|0;n=a+48|0;o=a+28|0;a=a+32|0;r=q+8|0;q=r;r=r+4|0;t=s+8|0;s=t;t=t+4|0;w=u+8|0;u=0;do{v=c[l>>2]|0;$=c[m>>2]|0;_=+g[$+(u*88|0)+76>>2];aa=+g[$+(u*88|0)+80>>2];B=(c[(c[n>>2]|0)+(c[v+(u*156|0)+152>>2]<<2)>>2]|0)+64|0;S=c[v+(u*156|0)+112>>2]|0;x=c[v+(u*156|0)+116>>2]|0;C=+g[v+(u*156|0)+120>>2];D=+g[v+(u*156|0)+124>>2];z=+g[v+(u*156|0)+128>>2];y=+g[v+(u*156|0)+132>>2];A=$+(u*88|0)+48|0;ba=+g[A>>2];da=+g[A+4>>2];$=$+(u*88|0)+56|0;X=+g[$>>2];V=+g[$+4>>2];$=c[o>>2]|0;A=$+(S*12|0)|0;N=+g[A>>2];O=+g[A+4>>2];ca=+g[$+(S*12|0)+8>>2];A=c[a>>2]|0;R=A+(S*12|0)|0;I=+g[R>>2];L=+g[R+4>>2];M=+g[A+(S*12|0)+8>>2];S=$+(x*12|0)|0;P=+g[S>>2];Q=+g[S+4>>2];W=+g[$+(x*12|0)+8>>2];$=A+(x*12|0)|0;H=+g[$>>2];J=+g[$+4>>2];K=+g[A+(x*12|0)+8>>2];Y=+U(ca);g[q>>2]=Y;ca=+T(ca);g[r>>2]=ca;Z=+U(W);g[s>>2]=Z;W=+T(W);g[t>>2]=W;F=+(N-(ba*ca-da*Y));Y=+(O-(da*ca+ba*Y));g[p>>2]=F;g[p+4>>2]=Y;Y=+(P-(X*W-V*Z));Z=+(Q-(V*W+X*Z));g[k>>2]=Y;g[k+4>>2]=Z;mf(e,B,f,_,h,aa);B=v+(u*156|0)+72|0;x=B;A=c[j+4>>2]|0;c[x>>2]=c[j>>2];c[x+4>>2]=A;x=v+(u*156|0)+148|0;A=c[x>>2]|0;do{if((A|0)>0){G=v+(u*156|0)+76|0;S=B|0;F=C+D;V=-0.0-K;W=-0.0-M;R=v+(u*156|0)+140|0;E=0;do{$=w+(E<<3)|0;X=+g[$>>2]-N;ea=w+(E<<3)+4|0;fa=v+(u*156|0)+(E*36|0)|0;Z=+X;_=+(+g[ea>>2]-O);g[fa>>2]=Z;g[fa+4>>2]=_;_=+g[$>>2]-P;$=v+(u*156|0)+(E*36|0)+8|0;Z=+_;ca=+(+g[ea>>2]-Q);g[$>>2]=Z;g[$+4>>2]=ca;ca=+g[G>>2];Z=+g[v+(u*156|0)+(E*36|0)+4>>2];aa=+g[S>>2];da=X*ca-Z*aa;Y=+g[v+(u*156|0)+(E*36|0)+12>>2];aa=ca*_-aa*Y;aa=F+da*z*da+aa*y*aa;if(aa>0.0){aa=1.0/aa}else{aa=0.0}g[v+(u*156|0)+(E*36|0)+24>>2]=aa;aa=+g[G>>2];ca=+g[S>>2]*-1.0;da=X*ca-aa*Z;aa=ca*_-aa*Y;aa=F+da*z*da+aa*y*aa;if(aa>0.0){aa=1.0/aa}else{aa=0.0}g[v+(u*156|0)+(E*36|0)+28>>2]=aa;$=v+(u*156|0)+(E*36|0)+32|0;g[$>>2]=0.0;X=+g[S>>2]*(H+Y*V-I-Z*W)+ +g[G>>2]*(J+K*_-L-M*X);if(X<-1.0){g[$>>2]=X*(-0.0- +g[R>>2])}E=E+1|0;}while((E|0)<(A|0));if((c[x>>2]|0)!=2){break}aa=+g[v+(u*156|0)+76>>2];da=+g[B>>2];Z=+g[v+(u*156|0)>>2]*aa- +g[v+(u*156|0)+4>>2]*da;_=aa*+g[v+(u*156|0)+8>>2]-da*+g[v+(u*156|0)+12>>2];ca=aa*+g[v+(u*156|0)+36>>2]-da*+g[v+(u*156|0)+40>>2];da=aa*+g[v+(u*156|0)+44>>2]-da*+g[v+(u*156|0)+48>>2];aa=C+D;ba=z*Z;D=y*_;C=aa+Z*ba+_*D;y=aa+ca*z*ca+da*y*da;z=aa+ba*ca+D*da;D=C*y-z*z;if(!(C*C<D*1.0e3)){c[x>>2]=1;break}g[v+(u*156|0)+96>>2]=C;g[v+(u*156|0)+100>>2]=z;g[v+(u*156|0)+104>>2]=z;g[v+(u*156|0)+108>>2]=y;if(D!=0.0){D=1.0/D}da=z*(-0.0-D);g[v+(u*156|0)+80>>2]=y*D;g[v+(u*156|0)+84>>2]=da;g[v+(u*156|0)+88>>2]=da;g[v+(u*156|0)+92>>2]=C*D}}while(0);u=u+1|0;}while((u|0)<(c[b>>2]|0));i=d;return}function Qi(a){a=a|0;var b=0,d=0,e=0,f=0,h=0,i=0,j=0.0,k=0,l=0.0,m=0.0,n=0,o=0.0,p=0.0,q=0.0,r=0.0,s=0.0,t=0.0,u=0.0,v=0.0,w=0.0,x=0.0,y=0,z=0,A=0.0,B=0.0,C=0.0;b=a+52|0;if((c[b>>2]|0)<=0){return}d=a+44|0;h=a+32|0;i=0;y=c[h>>2]|0;do{n=c[d>>2]|0;e=c[n+(i*156|0)+112>>2]|0;f=c[n+(i*156|0)+116>>2]|0;m=+g[n+(i*156|0)+120>>2];j=+g[n+(i*156|0)+128>>2];o=+g[n+(i*156|0)+124>>2];l=+g[n+(i*156|0)+132>>2];k=c[n+(i*156|0)+148>>2]|0;a=y+(e*12|0)|0;w=+g[a>>2];s=+g[a+4>>2];u=+g[y+(e*12|0)+8>>2];z=y+(f*12|0)|0;x=+g[z>>2];v=+g[z+4>>2];t=+g[y+(f*12|0)+8>>2];y=n+(i*156|0)+72|0;r=+g[y>>2];q=+g[y+4>>2];p=r*-1.0;if((k|0)>0){y=0;do{C=+g[n+(i*156|0)+(y*36|0)+16>>2];A=+g[n+(i*156|0)+(y*36|0)+20>>2];B=r*C+q*A;A=q*C+p*A;u=u-j*(+g[n+(i*156|0)+(y*36|0)>>2]*A- +g[n+(i*156|0)+(y*36|0)+4>>2]*B);w=w-m*B;s=s-m*A;t=t+l*(A*+g[n+(i*156|0)+(y*36|0)+8>>2]-B*+g[n+(i*156|0)+(y*36|0)+12>>2]);x=x+o*B;v=v+o*A;y=y+1|0;}while((y|0)<(k|0))}C=+w;B=+s;g[a>>2]=C;g[a+4>>2]=B;y=c[h>>2]|0;g[y+(e*12|0)+8>>2]=u;y=y+(f*12|0)|0;B=+x;C=+v;g[y>>2]=B;g[y+4>>2]=C;y=c[h>>2]|0;g[y+(f*12|0)+8>>2]=t;i=i+1|0;}while((i|0)<(c[b>>2]|0));return}function Ri(a){a=a|0;var b=0,d=0,e=0,f=0,h=0,i=0,j=0,k=0.0,l=0.0,m=0.0,n=0.0,o=0.0,p=0.0,q=0,r=0,s=0.0,t=0.0,u=0.0,v=0.0,w=0.0,x=0.0,y=0,z=0,A=0,B=0.0,C=0.0,D=0.0,E=0.0,F=0.0,G=0.0,H=0.0,I=0.0,J=0.0,K=0.0,L=0.0,M=0.0,N=0.0,O=0,P=0.0,Q=0.0,R=0.0,S=0,T=0.0,U=0.0;e=a+52|0;if((c[e>>2]|0)<=0){return}d=a+44|0;a=a+32|0;f=0;A=c[a>>2]|0;do{q=c[d>>2]|0;r=q+(f*156|0)|0;i=c[q+(f*156|0)+112>>2]|0;j=c[q+(f*156|0)+116>>2]|0;k=+g[q+(f*156|0)+120>>2];n=+g[q+(f*156|0)+128>>2];l=+g[q+(f*156|0)+124>>2];m=+g[q+(f*156|0)+132>>2];y=q+(f*156|0)+148|0;z=c[y>>2]|0;h=A+(i*12|0)|0;t=+g[h>>2];s=+g[h+4>>2];v=+g[A+(i*12|0)+8>>2];S=A+(j*12|0)|0;x=+g[S>>2];u=+g[S+4>>2];w=+g[A+(j*12|0)+8>>2];S=q+(f*156|0)+72|0;p=+g[S>>2];o=+g[S+4>>2];B=p*-1.0;C=+g[q+(f*156|0)+136>>2];do{if((z|0)>0){A=q+(f*156|0)+144|0;O=0;do{D=+g[q+(f*156|0)+(O*36|0)+12>>2];I=+g[q+(f*156|0)+(O*36|0)+8>>2];H=+g[q+(f*156|0)+(O*36|0)+4>>2];G=+g[q+(f*156|0)+(O*36|0)>>2];K=C*+g[q+(f*156|0)+(O*36|0)+16>>2];S=q+(f*156|0)+(O*36|0)+20|0;F=+g[S>>2];J=F+ +g[q+(f*156|0)+(O*36|0)+28>>2]*(-0.0-(o*(x+D*(-0.0-w)-t-H*(-0.0-v))+B*(u+w*I-s-v*G)- +g[A>>2]));E=-0.0-K;J=J<K?J:K;R=J<E?E:J;Q=R-F;g[S>>2]=R;R=o*Q;Q=B*Q;t=t-k*R;s=s-k*Q;v=v-n*(G*Q-H*R);x=x+l*R;u=u+l*Q;w=w+m*(I*Q-D*R);O=O+1|0;}while((O|0)<(z|0));if((c[y>>2]|0)!=1){b=8;break}B=+g[q+(f*156|0)+12>>2];C=+g[q+(f*156|0)+8>>2];D=+g[q+(f*156|0)+4>>2];E=+g[r>>2];r=q+(f*156|0)+16|0;F=+g[r>>2];G=F+(p*(x+B*(-0.0-w)-t-D*(-0.0-v))+o*(u+w*C-s-v*E)- +g[q+(f*156|0)+32>>2])*(-0.0- +g[q+(f*156|0)+24>>2]);Q=G>0.0?G:0.0;R=Q-F;g[r>>2]=Q;Q=p*R;R=o*R;v=v-n*(E*R-D*Q);w=w+m*(C*R-B*Q);x=x+l*Q;u=u+l*R;t=t-k*Q;s=s-k*R}else{b=8}}while(0);a:do{if((b|0)==8){b=0;z=q+(f*156|0)+16|0;H=+g[z>>2];y=q+(f*156|0)+52|0;D=+g[y>>2];U=-0.0-w;B=+g[q+(f*156|0)+12>>2];C=+g[q+(f*156|0)+8>>2];M=-0.0-v;F=+g[q+(f*156|0)+4>>2];I=+g[r>>2];G=+g[q+(f*156|0)+48>>2];E=+g[q+(f*156|0)+44>>2];L=+g[q+(f*156|0)+40>>2];K=+g[q+(f*156|0)+36>>2];N=+g[q+(f*156|0)+104>>2];P=+g[q+(f*156|0)+100>>2];J=p*(x+B*U-t-F*M)+o*(u+w*C-s-v*I)- +g[q+(f*156|0)+32>>2]-(H*+g[q+(f*156|0)+96>>2]+D*N);M=p*(x+G*U-t-L*M)+o*(u+w*E-s-v*K)- +g[q+(f*156|0)+68>>2]-(H*P+D*+g[q+(f*156|0)+108>>2]);U=+g[q+(f*156|0)+80>>2]*J+ +g[q+(f*156|0)+88>>2]*M;T=J*+g[q+(f*156|0)+84>>2]+M*+g[q+(f*156|0)+92>>2];Q=-0.0-U;R=-0.0-T;if(!(U>-0.0|T>-0.0)){J=Q-H;N=R-D;M=p*J;J=o*J;P=p*N;N=o*N;T=M+P;U=J+N;g[z>>2]=Q;g[y>>2]=R;v=v-n*(I*J-F*M+(K*N-L*P));w=w+m*(C*J-B*M+(E*N-G*P));x=x+l*T;u=u+l*U;t=t-k*T;s=s-k*U;break}Q=J*(-0.0- +g[q+(f*156|0)+24>>2]);do{if(!(Q<0.0)){if(M+Q*P<0.0){break}M=Q-H;P=0.0-D;N=p*M;M=o*M;R=p*P;P=o*P;T=R+N;U=P+M;g[z>>2]=Q;g[y>>2]=0.0;v=v-n*(M*I-N*F+(P*K-R*L));w=w+m*(M*C-N*B+(P*E-R*G));x=x+l*T;u=u+l*U;t=t-k*T;s=s-k*U;break a}}while(0);P=M*(-0.0- +g[q+(f*156|0)+60>>2]);do{if(!(P<0.0)){if(J+P*N<0.0){break}M=0.0-H;Q=P-D;N=p*M;M=o*M;R=p*Q;Q=o*Q;T=N+R;U=M+Q;g[z>>2]=0.0;g[y>>2]=P;v=v-n*(M*I-N*F+(Q*K-R*L));w=w+m*(M*C-N*B+(Q*E-R*G));x=x+l*T;u=u+l*U;t=t-k*T;s=s-k*U;break a}}while(0);if(J<0.0|M<0.0){break}N=0.0-H;Q=0.0-D;P=p*N;N=o*N;R=p*Q;Q=o*Q;T=P+R;U=N+Q;g[z>>2]=0.0;g[y>>2]=0.0;v=v-n*(N*I-P*F+(Q*K-R*L));w=w+m*(N*C-P*B+(Q*E-R*G));x=x+l*T;u=u+l*U;t=t-k*T;s=s-k*U}}while(0);U=+t;T=+s;g[h>>2]=U;g[h+4>>2]=T;A=c[a>>2]|0;g[A+(i*12|0)+8>>2]=v;A=A+(j*12|0)|0;T=+x;U=+u;g[A>>2]=T;g[A+4>>2]=U;A=c[a>>2]|0;g[A+(j*12|0)+8>>2]=w;f=f+1|0;}while((f|0)<(c[e>>2]|0));return}function Si(a){a=a|0;var b=0,d=0,e=0,f=0,h=0,i=0;b=c[a+52>>2]|0;if((b|0)<=0){return}d=c[a+44>>2]|0;a=c[a+48>>2]|0;e=0;do{f=c[a+(c[d+(e*156|0)+152>>2]<<2)>>2]|0;h=c[d+(e*156|0)+148>>2]|0;if((h|0)>0){i=0;do{g[f+64+(i*20|0)+8>>2]=+g[d+(e*156|0)+(i*36|0)+16>>2];g[f+64+(i*20|0)+12>>2]=+g[d+(e*156|0)+(i*36|0)+20>>2];i=i+1|0;}while((i|0)<(h|0))}e=e+1|0;}while((e|0)<(b|0));return}function Ti(a){a=a|0;var b=0,d=0,e=0,f=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0.0,y=0.0,z=0.0,A=0.0,B=0,C=0.0,D=0.0,E=0.0,F=0.0,G=0.0,H=0.0,I=0.0,J=0.0,K=0.0,L=0.0,M=0.0,N=0.0,O=0,P=0.0,Q=0.0,R=0.0,S=0.0,V=0.0,W=0.0,X=0.0,Y=0.0,Z=0,_=0.0;b=i;i=i+16|0;m=b|0;j=m|0;f=m;o=i;i=i+16|0;k=o|0;h=o;e=i;i=i+20|0;i=i+7&-8;d=a+52|0;if((c[d>>2]|0)<=0){Y=0.0;O=Y>=-.014999999664723873;i=b;return O|0}l=a+40|0;a=a+28|0;m=m+8|0;n=m;m=m+4|0;o=o+8|0;s=o;o=o+4|0;p=e;q=e+8|0;r=e+16|0;t=0;H=0.0;O=c[a>>2]|0;do{B=c[l>>2]|0;w=B+(t*88|0)|0;v=c[B+(t*88|0)+32>>2]|0;u=c[B+(t*88|0)+36>>2]|0;Z=B+(t*88|0)+48|0;C=+g[Z>>2];D=+g[Z+4>>2];x=+g[B+(t*88|0)+40>>2];y=+g[B+(t*88|0)+64>>2];Z=B+(t*88|0)+56|0;E=+g[Z>>2];F=+g[Z+4>>2];z=+g[B+(t*88|0)+44>>2];A=+g[B+(t*88|0)+68>>2];B=c[B+(t*88|0)+84>>2]|0;Z=O+(v*12|0)|0;I=+g[Z>>2];J=+g[Z+4>>2];K=+g[O+(v*12|0)+8>>2];Z=O+(u*12|0)|0;L=+g[Z>>2];M=+g[Z+4>>2];N=+g[O+(u*12|0)+8>>2];if((B|0)>0){G=x+z;O=0;do{W=+U(K);g[n>>2]=W;X=+T(K);g[m>>2]=X;P=+U(N);g[s>>2]=P;R=+T(N);g[o>>2]=R;Q=+(I-(C*X-D*W));W=+(J-(D*X+C*W));g[j>>2]=Q;g[j+4>>2]=W;W=+(L-(E*R-F*P));P=+(M-(F*R+E*P));g[k>>2]=W;g[k+4>>2]=P;Ui(e,w,f,h,O);P=+g[p>>2];W=+g[p+4>>2];R=+g[q>>2];Q=+g[q+4>>2];X=+g[r>>2];V=R-I;S=Q-J;R=R-L;Q=Q-M;H=H<X?H:X;X=(X+.004999999888241291)*.20000000298023224;Y=X<0.0?X:0.0;X=W*V-P*S;_=W*R-P*Q;X=_*A*_+(G+X*y*X);if(X>0.0){X=(-0.0-(Y<-.20000000298023224?-.20000000298023224:Y))/X}else{X=0.0}_=P*X;Y=W*X;I=I-x*_;J=J-x*Y;K=K-y*(V*Y-S*_);L=L+z*_;M=M+z*Y;N=N+A*(R*Y-Q*_);O=O+1|0;}while((O|0)<(B|0));O=c[a>>2]|0}O=O+(v*12|0)|0;_=+I;Y=+J;g[O>>2]=_;g[O+4>>2]=Y;O=c[a>>2]|0;g[O+(v*12|0)+8>>2]=K;O=O+(u*12|0)|0;Y=+L;_=+M;g[O>>2]=Y;g[O+4>>2]=_;O=c[a>>2]|0;g[O+(u*12|0)+8>>2]=N;t=t+1|0;}while((t|0)<(c[d>>2]|0));Z=H>=-.014999999664723873;i=b;return Z|0}function Ui(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var h=0.0,i=0.0,j=0.0,k=0.0,l=0.0,m=0.0,n=0.0,o=0.0,p=0,q=0.0,r=0.0,s=0.0,t=0,u=0;p=c[b+72>>2]|0;if((p|0)==1){t=d+12|0;i=+g[t>>2];j=+g[b+16>>2];p=d+8|0;k=+g[p>>2];m=+g[b+20>>2];h=i*j-k*m;m=j*k+i*m;u=a;i=+h;k=+m;g[u>>2]=i;g[u+4>>2]=k;k=+g[t>>2];i=+g[b+24>>2];j=+g[p>>2];l=+g[b+28>>2];q=+g[e+12>>2];s=+g[b+(f<<3)>>2];r=+g[e+8>>2];o=+g[b+(f<<3)+4>>2];n=+g[e>>2]+(q*s-r*o);o=s*r+q*o+ +g[e+4>>2];g[a+16>>2]=h*(n-(+g[d>>2]+(k*i-j*l)))+(o-(i*j+k*l+ +g[d+4>>2]))*m- +g[b+76>>2]- +g[b+80>>2];f=a+8|0;n=+n;o=+o;g[f>>2]=n;g[f+4>>2]=o;return}else if((p|0)==2){p=e+12|0;k=+g[p>>2];l=+g[b+16>>2];t=e+8|0;m=+g[t>>2];s=+g[b+20>>2];r=k*l-m*s;s=l*m+k*s;u=a;k=+r;m=+s;g[u>>2]=k;g[u+4>>2]=m;m=+g[p>>2];k=+g[b+24>>2];l=+g[t>>2];n=+g[b+28>>2];j=+g[d+12>>2];h=+g[b+(f<<3)>>2];i=+g[d+8>>2];q=+g[b+(f<<3)+4>>2];o=+g[d>>2]+(j*h-i*q);q=h*i+j*q+ +g[d+4>>2];g[a+16>>2]=r*(o-(+g[e>>2]+(m*k-l*n)))+(q-(k*l+m*n+ +g[e+4>>2]))*s- +g[b+76>>2]- +g[b+80>>2];t=a+8|0;o=+o;q=+q;g[t>>2]=o;g[t+4>>2]=q;r=+(-0.0-r);s=+(-0.0-s);g[u>>2]=r;g[u+4>>2]=s;return}else if((p|0)==0){k=+g[d+12>>2];l=+g[b+24>>2];s=+g[d+8>>2];j=+g[b+28>>2];h=+g[d>>2]+(k*l-s*j);j=l*s+k*j+ +g[d+4>>2];k=+g[e+12>>2];s=+g[b>>2];l=+g[e+8>>2];m=+g[b+4>>2];i=+g[e>>2]+(k*s-l*m);m=s*l+k*m+ +g[e+4>>2];k=i-h;l=m-j;u=a;s=+k;n=+l;g[u>>2]=s;g[u+4>>2]=n;n=+R(k*k+l*l);if(n<1.1920928955078125e-7){o=k;n=l}else{n=1.0/n;o=k*n;g[a>>2]=o;n=l*n;g[a+4>>2]=n}u=a+8|0;r=+((h+i)*.5);s=+((j+m)*.5);g[u>>2]=r;g[u+4>>2]=s;g[a+16>>2]=k*o+l*n- +g[b+76>>2]- +g[b+80>>2];return}else{g[a+16>>2]=0.0;u=a;t=8376;f=c[t+4>>2]|0;c[u>>2]=c[t>>2];c[u+4>>2]=f;u=a+8|0;f=8376;t=c[f+4>>2]|0;c[u>>2]=c[f>>2];c[u+4>>2]=t;return}}function Vi(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0.0,z=0,A=0.0,B=0.0,C=0.0,D=0.0,E=0.0,F=0.0,G=0,H=0.0,I=0.0,J=0.0,K=0.0,L=0.0,M=0.0,N=0.0,O=0.0,P=0.0,Q=0,R=0.0,S=0.0,V=0.0,W=0.0,X=0.0,Y=0.0,Z=0.0,_=0.0,$=0,aa=0.0;e=i;i=i+16|0;o=e|0;l=o|0;j=o;q=i;i=i+16|0;f=q|0;k=q;h=i;i=i+20|0;i=i+7&-8;n=a+52|0;if((c[n>>2]|0)<=0){_=0.0;Q=_>=-.007499999832361937;i=e;return Q|0}m=a+40|0;a=a+28|0;p=o+8|0;o=p;p=p+4|0;t=q+8|0;r=t;t=t+4|0;u=h;s=h+8|0;q=h+16|0;v=0;J=0.0;do{Q=c[m>>2]|0;z=Q+(v*88|0)|0;w=c[Q+(v*88|0)+32>>2]|0;x=c[Q+(v*88|0)+36>>2]|0;G=Q+(v*88|0)+48|0;C=+g[G>>2];D=+g[G+4>>2];G=Q+(v*88|0)+56|0;E=+g[G>>2];F=+g[G+4>>2];G=c[Q+(v*88|0)+84>>2]|0;if((w|0)==(b|0)|(w|0)==(d|0)){A=+g[Q+(v*88|0)+40>>2];B=+g[Q+(v*88|0)+64>>2]}else{A=0.0;B=0.0}if((x|0)==(b|0)|(x|0)==(d|0)){y=+g[Q+(v*88|0)+44>>2];H=+g[Q+(v*88|0)+68>>2]}else{y=0.0;H=0.0}Q=c[a>>2]|0;$=Q+(w*12|0)|0;P=+g[$>>2];O=+g[$+4>>2];N=+g[Q+(w*12|0)+8>>2];$=Q+(x*12|0)|0;M=+g[$>>2];L=+g[$+4>>2];K=+g[Q+(x*12|0)+8>>2];if((G|0)>0){I=A+y;Q=0;do{W=+U(N);g[o>>2]=W;Z=+T(N);g[p>>2]=Z;Y=+U(K);g[r>>2]=Y;S=+T(K);g[t>>2]=S;V=+(P-(C*Z-D*W));W=+(O-(D*Z+C*W));g[l>>2]=V;g[l+4>>2]=W;W=+(M-(E*S-F*Y));Y=+(L-(F*S+E*Y));g[f>>2]=W;g[f+4>>2]=Y;Ui(h,z,j,k,Q);Y=+g[u>>2];W=+g[u+4>>2];S=+g[s>>2];V=+g[s+4>>2];Z=+g[q>>2];X=S-P;R=V-O;S=S-M;V=V-L;J=J<Z?J:Z;Z=(Z+.004999999888241291)*.75;Z=Z<0.0?Z:0.0;_=W*X-Y*R;aa=W*S-Y*V;_=aa*H*aa+(I+_*B*_);if(_>0.0){Z=(-0.0-(Z<-.20000000298023224?-.20000000298023224:Z))/_}else{Z=0.0}aa=Y*Z;_=W*Z;P=P-A*aa;O=O-A*_;N=N-B*(X*_-R*aa);M=M+y*aa;L=L+y*_;K=K+H*(S*_-V*aa);Q=Q+1|0;}while((Q|0)<(G|0));Q=c[a>>2]|0}$=Q+(w*12|0)|0;aa=+P;_=+O;g[$>>2]=aa;g[$+4>>2]=_;$=c[a>>2]|0;g[$+(w*12|0)+8>>2]=N;$=$+(x*12|0)|0;_=+M;aa=+L;g[$>>2]=_;g[$+4>>2]=aa;g[(c[a>>2]|0)+(x*12|0)+8>>2]=K;v=v+1|0;}while((v|0)<(c[n>>2]|0));$=J>=-.007499999832361937;i=e;return $|0}function Wi(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;f=mm(f,148)|0;if((f|0)==0){e=0;e=e|0;return e|0}zi(f,a,0,d,0);c[f>>2]=4960;e=f;e=e|0;return e|0}function Xi(a,b){a=a|0;b=b|0;tb[c[(c[a>>2]|0)+4>>2]&255](a);nm(b,a,148);return}function Yi(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;ff(b,c[(c[a+48>>2]|0)+12>>2]|0,d,c[(c[a+52>>2]|0)+12>>2]|0,e);return}function Zi(a){a=a|0;return}function _i(a){a=a|0;$m(a);return}function $i(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;f=mm(f,148)|0;if((f|0)==0){f=0;f=f|0;return f|0}zi(f,a,b,d,e);c[f>>2]=4872;f=f|0;return f|0}function aj(a,b){a=a|0;b=b|0;tb[c[(c[a>>2]|0)+4>>2]&255](a);nm(b,a,148);return}function bj(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,h=0,j=0;f=i;i=i+48|0;h=f|0;j=c[(c[a+48>>2]|0)+12>>2]|0;c[h>>2]=6064;c[h+4>>2]=1;g[h+8>>2]=.009999999776482582;en(h+28|0,0,18)|0;Je(j,h,c[a+56>>2]|0);ff(b,h,d,c[(c[a+52>>2]|0)+12>>2]|0,e);i=f;return}function cj(a){a=a|0;return}function dj(a){a=a|0;$m(a);return}function ej(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;f=mm(f,148)|0;if((f|0)==0){e=0;e=e|0;return e|0}zi(f,a,0,d,0);c[f>>2]=4840;e=f;e=e|0;return e|0}function fj(a,b){a=a|0;b=b|0;tb[c[(c[a>>2]|0)+4>>2]&255](a);nm(b,a,148);return}function gj(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;jf(b,c[(c[a+48>>2]|0)+12>>2]|0,d,c[(c[a+52>>2]|0)+12>>2]|0,e);return}function hj(a){a=a|0;return}function ij(a){a=a|0;$m(a);return}function jj(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;f=mm(f,148)|0;if((f|0)==0){e=0;e=e|0;return e|0}zi(f,a,0,d,0);c[f>>2]=5152;e=f;e=e|0;return e|0}function kj(a,b){a=a|0;b=b|0;tb[c[(c[a>>2]|0)+4>>2]&255](a);nm(b,a,148);return}function lj(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;kf(b,c[(c[a+48>>2]|0)+12>>2]|0,d,c[(c[a+52>>2]|0)+12>>2]|0,e);return}function mj(a){a=a|0;return}function nj(a){a=a|0;$m(a);return}function oj(a){a=a|0;b[a+32>>1]=1;b[a+34>>1]=-1;b[a+36>>1]=0;c[a+40>>2]=0;c[a+24>>2]=0;c[a+28>>2]=0;en(a|0,0,16)|0;return}function pj(d,e,f,h){d=d|0;e=e|0;f=f|0;h=h|0;var i=0,j=0,k=0.0;c[d+40>>2]=c[h+4>>2];g[d+16>>2]=+g[h+8>>2];g[d+20>>2]=+g[h+12>>2];c[d+8>>2]=f;c[d+4>>2]=0;f=d+32|0;j=h+22|0;b[f>>1]=b[j>>1]|0;b[f+2>>1]=b[j+2>>1]|0;b[f+4>>1]=b[j+4>>1]|0;a[d+38|0]=a[h+20|0]|0;f=c[h>>2]|0;f=Cb[c[(c[f>>2]|0)+8>>2]&63](f,e)|0;c[d+12>>2]=f;f=rb[c[(c[f>>2]|0)+12>>2]&15](f)|0;j=mm(e,f*28|0)|0;e=d+24|0;c[e>>2]=j;if((f|0)>0){i=0}else{j=d+28|0;c[j>>2]=0;j=h+16|0;k=+g[j>>2];j=d|0;g[j>>2]=k;return}do{c[j+(i*28|0)+16>>2]=0;j=c[e>>2]|0;c[j+(i*28|0)+24>>2]=-1;i=i+1|0;}while((i|0)<(f|0));j=d+28|0;c[j>>2]=0;j=h+16|0;k=+g[j>>2];j=d|0;g[j>>2]=k;return}function qj(a,b){a=a|0;b=b|0;var d=0,e=0;d=a+12|0;e=c[d>>2]|0;e=rb[c[(c[e>>2]|0)+12>>2]&15](e)|0;a=a+24|0;nm(b,c[a>>2]|0,e*28|0);c[a>>2]=0;a=c[d>>2]|0;e=c[a+4>>2]|0;if((e|0)==1){tb[c[c[a>>2]>>2]&255](a);nm(b,a,48);c[d>>2]=0;return}else if((e|0)==0){tb[c[c[a>>2]>>2]&255](a);nm(b,a,20);c[d>>2]=0;return}else if((e|0)==2){tb[c[c[a>>2]>>2]&255](a);nm(b,a,152);c[d>>2]=0;return}else if((e|0)==3){tb[c[c[a>>2]>>2]&255](a);nm(b,a,40);c[d>>2]=0;return}else{c[d>>2]=0;return}}function rj(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0;e=a+12|0;h=c[e>>2]|0;h=rb[c[(c[h>>2]|0)+12>>2]&15](h)|0;f=a+28|0;c[f>>2]=h;if((h|0)<=0){return}g=a+24|0;h=0;do{i=c[g>>2]|0;j=i+(h*28|0)|0;l=c[e>>2]|0;k=j|0;Eb[c[(c[l>>2]|0)+28>>2]&63](l,k,d,h);c[i+(h*28|0)+24>>2]=Re(b,k,j)|0;c[i+(h*28|0)+16>>2]=a;c[i+(h*28|0)+20>>2]=h;h=h+1|0;}while((h|0)<(c[f>>2]|0));return}function sj(a,b){a=a|0;b=b|0;var d=0,e=0,f=0;d=a+28|0;if((c[d>>2]|0)<=0){c[d>>2]=0;return}a=a+24|0;e=0;do{f=(c[a>>2]|0)+(e*28|0)+24|0;Se(b,c[f>>2]|0);c[f>>2]=-1;e=e+1|0;}while((e|0)<(c[d>>2]|0));c[d>>2]=0;return}function tj(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0.0,G=0.0,H=0.0,I=0.0;m=i;i=i+40|0;j=m|0;k=m+16|0;f=m+32|0;h=a+28|0;if((c[h>>2]|0)<=0){i=m;return}l=a+24|0;w=a+12|0;y=j|0;z=k|0;A=j+4|0;B=k+4|0;s=j+8|0;t=k+8|0;u=j+12|0;v=k+12|0;o=e|0;p=d|0;a=e+4|0;n=d+4|0;q=f|0;r=f+4|0;C=0;do{D=c[l>>2]|0;E=c[w>>2]|0;x=D+(C*28|0)+20|0;Eb[c[(c[E>>2]|0)+28>>2]&63](E,j,d,c[x>>2]|0);E=c[w>>2]|0;Eb[c[(c[E>>2]|0)+28>>2]&63](E,k,e,c[x>>2]|0);x=D+(C*28|0)|0;H=+g[y>>2];I=+g[z>>2];G=+g[A>>2];F=+g[B>>2];E=x;H=+(H<I?H:I);I=+(G<F?G:F);g[E>>2]=H;g[E+4>>2]=I;I=+g[s>>2];H=+g[t>>2];F=+g[u>>2];G=+g[v>>2];E=D+(C*28|0)+8|0;H=+(I>H?I:H);I=+(F>G?F:G);g[E>>2]=H;g[E+4>>2]=I;I=+g[a>>2]- +g[n>>2];g[q>>2]=+g[o>>2]- +g[p>>2];g[r>>2]=I;Te(b,c[D+(C*28|0)+24>>2]|0,x,f);C=C+1|0;}while((C|0)<(c[h>>2]|0));i=m;return}function uj(b,d){b=b|0;d=d|0;var e=0,f=0,h=0;e=b|0;km(e);Em(b+76|0);Sj(b+102880|0);c[b+102992>>2]=0;c[b+102996>>2]=0;en(b+102960|0,0,20)|0;a[b+103004|0]=1;a[b+103005|0]=1;a[b+103006|0]=0;a[b+103007|0]=1;a[b+102988|0]=1;h=d;d=b+102980|0;f=c[h+4>>2]|0;c[d>>2]=c[h>>2];c[d+4>>2]=f;c[b+102876>>2]=4;g[b+103e3>>2]=0.0;c[b+102956>>2]=e;c[b+103040>>2]=72;c[b+103044>>2]=c[16];en(b+103008|0,0,32)|0;return}function vj(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0;e=c[a+102960>>2]|0;if((e|0)!=0){b=a|0;while(1){d=c[e+112>>2]|0;e=c[e+116>>2]|0;while(1){if((e|0)==0){break}i=c[e+4>>2]|0;c[e+28>>2]=0;qj(e,b);e=i}if((d|0)==0){break}else{e=d}}}e=a+102968|0;f=c[e>>2]|0;if((f|0)!=0){d=a+102876|0;b=a|0;do{if((c[d>>2]&2|0)==0){g=f+380|0;i=c[g>>2]|0;h=f+384|0;if((i|0)!=0){c[i+384>>2]=c[h>>2]}i=c[h>>2]|0;if((i|0)!=0){c[i+380>>2]=c[g>>2]}if((c[e>>2]|0)==(f|0)){c[e>>2]=c[h>>2]}pk(f);nm(b,f|0,392);f=c[e>>2]|0}}while((f|0)!=0)}Qe(a+102880|0);Fm(a+76|0);lm(a|0);return}function wj(a,b){a=a|0;b=b|0;var d=0,e=0,f=0;if((c[a+102876>>2]&2|0)!=0){return}e=b+380|0;f=c[e>>2]|0;d=b+384|0;if((f|0)!=0){c[f+384>>2]=c[d>>2]}f=c[d>>2]|0;if((f|0)!=0){c[f+380>>2]=c[e>>2]}e=a+102968|0;if((c[e>>2]|0)==(b|0)){c[e>>2]=c[d>>2]}pk(b);nm(a|0,b|0,392);return}function xj(a,b){a=a|0;b=b|0;c[a+102952>>2]=b;return}function yj(a,b){a=a|0;b=b|0;var d=0,e=0;if((c[a+102876>>2]&2|0)!=0){e=0;return e|0}d=mm(a|0,168)|0;if((d|0)==0){d=0}else{Ij(d,b,a)}c[d+108>>2]=0;b=a+102960|0;c[d+112>>2]=c[b>>2];e=c[b>>2]|0;if((e|0)!=0){c[e+108>>2]=d}c[b>>2]=d;e=a+102972|0;c[e>>2]=(c[e>>2]|0)+1;e=d;return e|0}function zj(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0;if((c[a+102876>>2]&2|0)!=0){return}e=b+124|0;g=c[e>>2]|0;if((g|0)!=0){d=a+102992|0;while(1){f=c[g+12>>2]|0;h=c[d>>2]|0;if((h|0)==0){g=g+4|0}else{g=g+4|0;ub[c[(c[h>>2]|0)+8>>2]&255](h,c[g>>2]|0)}Aj(a,c[g>>2]|0);c[e>>2]=f;if((f|0)==0){break}else{g=f}}}c[e>>2]=0;d=b+128|0;f=c[d>>2]|0;if((f|0)!=0){e=a+102880|0;while(1){g=c[f+12>>2]|0;Tj(e,c[f+4>>2]|0);if((g|0)==0){break}else{f=g}}}c[d>>2]=0;d=b+116|0;j=c[d>>2]|0;if((j|0)==0){g=b+120|0}else{h=a+102992|0;f=a+102880|0;e=a|0;g=b+120|0;while(1){i=c[j+4>>2]|0;k=c[h>>2]|0;if((k|0)!=0){ub[c[(c[k>>2]|0)+12>>2]&255](k,j)}sj(j,f);qj(j,e);nm(e,j,44);c[d>>2]=i;c[g>>2]=(c[g>>2]|0)-1;if((i|0)==0){break}else{j=i}}}c[d>>2]=0;c[g>>2]=0;e=b+108|0;f=c[e>>2]|0;d=b+112|0;if((f|0)!=0){c[f+112>>2]=c[d>>2]}f=c[d>>2]|0;if((f|0)!=0){c[f+108>>2]=c[e>>2]}e=a+102960|0;if((c[e>>2]|0)==(b|0)){c[e>>2]=c[d>>2]}k=a+102972|0;c[k>>2]=(c[k>>2]|0)-1;Jj(b);nm(a|0,b,168);return}function Aj(d,e){d=d|0;e=e|0;var f=0,h=0,i=0,j=0,k=0,l=0;if((c[d+102876>>2]&2|0)!=0){return}f=a[e+61|0]|0;i=e+8|0;j=c[i>>2]|0;h=e+12|0;if((j|0)!=0){c[j+12>>2]=c[h>>2]}j=c[h>>2]|0;if((j|0)!=0){c[j+8>>2]=c[i>>2]}i=d+102964|0;if((c[i>>2]|0)==(e|0)){c[i>>2]=c[h>>2]}h=c[e+48>>2]|0;i=c[e+52>>2]|0;k=h+4|0;j=b[k>>1]|0;if((j&2)==0){b[k>>1]=j|2;g[h+160>>2]=0.0}j=i+4|0;k=b[j>>1]|0;if((k&2)==0){b[j>>1]=k|2;g[i+160>>2]=0.0}j=e+24|0;l=c[j>>2]|0;k=e+28|0;if((l|0)!=0){c[l+12>>2]=c[k>>2]}l=c[k>>2]|0;if((l|0)!=0){c[l+8>>2]=c[j>>2]}l=h+124|0;if((e+16|0)==(c[l>>2]|0)){c[l>>2]=c[k>>2]}c[j>>2]=0;c[k>>2]=0;k=e+40|0;l=c[k>>2]|0;j=e+44|0;if((l|0)!=0){c[l+12>>2]=c[j>>2]}l=c[j>>2]|0;if((l|0)!=0){c[l+8>>2]=c[k>>2]}l=i+124|0;if((e+32|0)==(c[l>>2]|0)){c[l>>2]=c[j>>2]}c[k>>2]=0;c[j>>2]=0;xh(e,d|0);l=d+102976|0;c[l>>2]=(c[l>>2]|0)-1;if(!(f<<24>>24==0)){return}e=c[i+128>>2]|0;if((e|0)==0){return}do{if((c[e>>2]|0)==(h|0)){l=(c[e+4>>2]|0)+4|0;c[l>>2]=c[l>>2]|8}e=c[e+12>>2]|0;}while((e|0)!=0);return}function Bj(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0;if((c[b+102876>>2]&2|0)!=0){i=0;return i|0}e=wh(d,b|0)|0;c[e+8>>2]=0;g=b+102964|0;c[e+12>>2]=c[g>>2];f=c[g>>2]|0;if((f|0)!=0){c[f+8>>2]=e}c[g>>2]=e;g=b+102976|0;c[g>>2]=(c[g>>2]|0)+1;g=e+16|0;c[e+20>>2]=e;b=e+52|0;c[g>>2]=c[b>>2];c[e+24>>2]=0;f=e+48|0;h=c[f>>2]|0;i=h+124|0;c[e+28>>2]=c[i>>2];i=c[i>>2]|0;if((i|0)!=0){c[i+8>>2]=g;h=c[f>>2]|0}c[h+124>>2]=g;g=e+32|0;c[e+36>>2]=e;c[g>>2]=c[f>>2];c[e+40>>2]=0;f=c[b>>2]|0;h=f+124|0;c[e+44>>2]=c[h>>2];h=c[h>>2]|0;if((h|0)!=0){c[h+8>>2]=g;f=c[b>>2]|0}c[f+124>>2]=g;b=c[d+8>>2]|0;if((a[d+16|0]|0)!=0){i=e;return i|0}d=c[(c[d+12>>2]|0)+128>>2]|0;if((d|0)==0){i=e;return i|0}do{if((c[d>>2]|0)==(b|0)){i=(c[d+4>>2]|0)+4|0;c[i>>2]=c[i>>2]|8}d=c[d+12>>2]|0;}while((d|0)!=0);return e|0}function Cj(a,b){a=a|0;b=b|0;var d=0;if((c[a+102876>>2]&2|0)!=0){b=0;return b|0}d=mm(a|0,392)|0;if((d|0)==0){d=0}else{ok(d,b,a)}c[d+380>>2]=0;a=a+102968|0;c[d+384>>2]=c[a>>2];b=c[a>>2]|0;if((b|0)!=0){c[b+380>>2]=d}c[a>>2]=d;b=d;return b|0}function Dj(d,e){d=d|0;e=e|0;var f=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0;h=i;i=i+96|0;f=h|0;m=h+56|0;j=h+88|0;k=d+102960|0;l=c[k>>2]|0;if((l|0)!=0){do{L=l+28|0;K=l+12|0;c[L>>2]=c[K>>2];c[L+4>>2]=c[K+4>>2];c[L+8>>2]=c[K+8>>2];c[L+12>>2]=c[K+12>>2];l=c[l+112>>2]|0;}while((l|0)!=0)}o=d+103020|0;g[o>>2]=0.0;p=d+103024|0;g[p>>2]=0.0;q=d+103028|0;g[q>>2]=0.0;r=d+102972|0;l=d+102880|0;n=d+76|0;pf(f,c[r>>2]|0,c[d+102944>>2]|0,c[d+102976>>2]|0,n,c[d+102952>>2]|0);s=c[k>>2]|0;if((s|0)!=0){do{L=s+4|0;b[L>>1]=b[L>>1]&-2;s=c[s+112>>2]|0;}while((s|0)!=0)}s=c[d+102940>>2]|0;if((s|0)!=0){do{L=s+4|0;c[L>>2]=c[L>>2]&-2;s=c[s+12>>2]|0;}while((s|0)!=0)}s=c[d+102964>>2]|0;if((s|0)!=0){do{a[s+60|0]=0;s=c[s+12>>2]|0;}while((s|0)!=0)}w=Gm(n,c[r>>2]<<2)|0;x=w;E=c[k>>2]|0;if((E|0)!=0){y=f+28|0;t=f+36|0;v=f+32|0;r=f+8|0;u=f+16|0;s=f+12|0;z=d+102980|0;A=d+102988|0;B=m+12|0;C=m+16|0;D=m+20|0;do{F=E+4|0;G=b[F>>1]|0;do{if((G&35)==34){if((c[E>>2]|0)==0){break}c[y>>2]=0;c[t>>2]=0;c[v>>2]=0;c[x>>2]=E;b[F>>1]=G|1;G=1;H=0;while(1){G=G-1|0;F=c[x+(G<<2)>>2]|0;c[F+8>>2]=H;H=c[y>>2]|0;c[(c[r>>2]|0)+(H<<2)>>2]=F;c[y>>2]=H+1;H=F+4|0;I=b[H>>1]|0;if((I&2)==0){b[H>>1]=I|2;g[F+160>>2]=0.0}do{if((c[F>>2]|0)!=0){H=c[F+128>>2]|0;if((H|0)!=0){do{J=c[H+4>>2]|0;I=J+4|0;do{if((c[I>>2]&7|0)==6){if((a[(c[J+48>>2]|0)+38|0]|0)!=0){break}if((a[(c[J+52>>2]|0)+38|0]|0)!=0){break}K=c[t>>2]|0;c[t>>2]=K+1;c[(c[s>>2]|0)+(K<<2)>>2]=J;c[I>>2]=c[I>>2]|1;K=c[H>>2]|0;I=K+4|0;J=b[I>>1]|0;if(!((J&1)==0)){break}c[x+(G<<2)>>2]=K;b[I>>1]=J|1;G=G+1|0}}while(0);H=c[H+12>>2]|0;}while((H|0)!=0)}F=c[F+124>>2]|0;if((F|0)==0){break}do{L=F+4|0;J=c[L>>2]|0;do{if((a[J+60|0]|0)==0){H=c[F>>2]|0;K=H+4|0;I=b[K>>1]|0;if((I&32)==0){break}M=c[v>>2]|0;c[v>>2]=M+1;c[(c[u>>2]|0)+(M<<2)>>2]=J;a[(c[L>>2]|0)+60|0]=1;if(!((I&1)==0)){break}c[x+(G<<2)>>2]=H;b[K>>1]=I|1;G=G+1|0}}while(0);F=c[F+12>>2]|0;}while((F|0)!=0)}}while(0);if((G|0)<=0){break}H=c[y>>2]|0}rf(f,m,e,z,(a[A]|0)!=0);g[o>>2]=+g[B>>2]+ +g[o>>2];g[p>>2]=+g[C>>2]+ +g[p>>2];g[q>>2]=+g[D>>2]+ +g[q>>2];F=c[y>>2]|0;if((F|0)<=0){break}H=c[r>>2]|0;I=0;do{G=c[H+(I<<2)>>2]|0;if((c[G>>2]|0)==0){M=G+4|0;b[M>>1]=b[M>>1]&-2}I=I+1|0;}while((I|0)<(F|0))}}while(0);E=c[E+112>>2]|0;}while((E|0)!=0)}Im(n,w);sm(j);k=c[k>>2]|0;if((k|0)!=0){do{do{if(!((b[k+4>>1]&1)==0)){if((c[k>>2]|0)==0){break}Mj(k)}}while(0);k=c[k+112>>2]|0;}while((k|0)!=0)}Vj(l);g[d+103032>>2]=+um(j);qf(f);i=h;return}function Ej(d,e){d=d|0;e=e|0;var f=0,h=0,j=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0.0,ba=0,ca=0,da=0,ea=0,fa=0,ga=0,ha=0,ia=0,ja=0,ka=0,la=0,ma=0,na=0,oa=0,pa=0,qa=0,ra=0,sa=0,ta=0,ua=0,va=0,wa=0,xa=0,ya=0.0,za=0.0,Aa=0.0,Ba=0.0,Ca=0.0,Da=0;h=i;i=i+360|0;j=h|0;p=h+56|0;n=h+192|0;s=h+200|0;x=h+240|0;m=h+280|0;K=h+288|0;l=h+328|0;q=d+102880|0;o=d+102952|0;pf(j,64,32,0,d+76|0,c[o>>2]|0);f=d+103007|0;do{if((a[f]|0)==0){r=d+102940|0}else{r=c[d+102960>>2]|0;if((r|0)!=0){do{xa=r+4|0;b[xa>>1]=b[xa>>1]&-2;g[r+76>>2]=0.0;r=c[r+112>>2]|0;}while((r|0)!=0)}r=d+102940|0;t=c[r>>2]|0;if((t|0)==0){break}do{xa=t+4|0;c[xa>>2]=c[xa>>2]&-34;c[t+128>>2]=0;g[t+132>>2]=1.0;t=c[t+12>>2]|0;}while((t|0)!=0)}}while(0);C=j+28|0;B=j+36|0;A=j+32|0;z=j+8|0;y=j+12|0;t=m|0;w=m+4|0;v=j+40|0;u=j+44|0;J=e|0;I=l|0;H=l+4|0;E=l+8|0;G=l+16|0;D=e+12|0;F=l+12|0;L=e+20|0;M=l+20|0;e=l+24|0;Y=d+103006|0;Z=p+16|0;P=p+20|0;X=p+24|0;V=p+44|0;W=p+48|0;d=p+52|0;N=p|0;O=p+28|0;Q=p+56|0;S=p+92|0;R=p+128|0;$=n|0;_=n+4|0;while(1){ca=c[r>>2]|0;if((ca|0)==0){m=1;l=83;break}else{aa=1.0;ba=0}do{da=ca+4|0;ea=c[da>>2]|0;do{if((ea&4|0)!=0){if((c[ca+128>>2]|0)>8){break}if((ea&32|0)==0){fa=c[ca+48>>2]|0;ea=c[ca+52>>2]|0;if((a[fa+38|0]|0)!=0){break}if((a[ea+38|0]|0)!=0){break}ha=c[fa+8>>2]|0;ga=c[ea+8>>2]|0;la=c[ha>>2]|0;ja=c[ga>>2]|0;ka=b[ha+4>>1]|0;ia=b[ga+4>>1]|0;if(((ka&2)==0|(la|0)==0)&((ia&2)==0|(ja|0)==0)){break}if((ka&8)==0){ka=(la|0)!=2|0}else{ka=1}if((ia&8)==0){if((ka|0)==0&(ja|0)==2){break}}ja=ha+44|0;ka=ha+76|0;za=+g[ka>>2];ia=ga+44|0;la=ga+76|0;ya=+g[la>>2];do{if(za<ya){Aa=(ya-za)/(1.0-za);wa=ha+52|0;Ca=+g[wa>>2];xa=ha+56|0;Ba=+g[xa>>2];za=Aa*(+g[ha+64>>2]-Ba);g[wa>>2]=Ca+Aa*(+g[ha+60>>2]-Ca);g[xa>>2]=Ba+za;xa=ha+68|0;za=+g[xa>>2];g[xa>>2]=za+Aa*(+g[ha+72>>2]-za);g[ka>>2]=ya}else{if(!(ya<za)){ya=za;break}Ca=(za-ya)/(1.0-ya);wa=ga+52|0;Aa=+g[wa>>2];xa=ga+56|0;Ba=+g[xa>>2];ya=Ca*(+g[ga+64>>2]-Ba);g[wa>>2]=Aa+Ca*(+g[ga+60>>2]-Aa);g[xa>>2]=Ba+ya;xa=ga+68|0;ya=+g[xa>>2];g[xa>>2]=ya+Ca*(+g[ga+72>>2]-ya);g[la>>2]=za;ya=za}}while(0);wa=c[ca+56>>2]|0;xa=c[ca+60>>2]|0;c[Z>>2]=0;c[P>>2]=0;g[X>>2]=0.0;c[V>>2]=0;c[W>>2]=0;g[d>>2]=0.0;ee(N,c[fa+12>>2]|0,wa);ee(O,c[ea+12>>2]|0,xa);fn(Q|0,ja|0,36)|0;fn(S|0,ia|0,36)|0;g[R>>2]=1.0;ae(n,p);if((c[$>>2]|0)==3){ya=ya+(1.0-ya)*+g[_>>2];ya=ya<1.0?ya:1.0}else{ya=1.0}g[ca+132>>2]=ya;c[da>>2]=c[da>>2]|32}else{ya=+g[ca+132>>2]}if(!(ya<aa)){break}ba=ca;aa=ya}}while(0);ca=c[ca+12>>2]|0;}while((ca|0)!=0);if((ba|0)==0|aa>.9999988079071045){m=1;l=83;break}ca=c[(c[ba+48>>2]|0)+8>>2]|0;ea=c[(c[ba+52>>2]|0)+8>>2]|0;ma=ca+44|0;fn(s|0,ma|0,36)|0;na=ea+44|0;fn(x|0,na|0,36)|0;sa=ca+76|0;Ba=+g[sa>>2];Ba=(aa-Ba)/(1.0-Ba);qa=ca+60|0;fa=ca+52|0;ya=+g[fa>>2];ra=ca+64|0;pa=ca+56|0;Aa=+g[pa>>2];za=Ba*(+g[ra>>2]-Aa);g[fa>>2]=ya+Ba*(+g[qa>>2]-ya);g[pa>>2]=Aa+za;pa=ca+72|0;fa=ca+68|0;za=+g[fa>>2];za=za+Ba*(+g[pa>>2]-za);g[fa>>2]=za;g[sa>>2]=aa;sa=ca+52|0;fa=ca+60|0;ka=c[sa>>2]|0;sa=c[sa+4>>2]|0;c[fa>>2]=ka;c[fa+4>>2]=sa;g[pa>>2]=za;Ba=+U(za);fa=ca+20|0;g[fa>>2]=Ba;za=+T(za);ga=ca+24|0;g[ga>>2]=za;la=ca+44|0;Aa=+g[la>>2];oa=ca+48|0;ya=+g[oa>>2];Ca=(c[k>>2]=ka,+g[k>>2])-(za*Aa-Ba*ya);ya=(c[k>>2]=sa,+g[k>>2])-(Ba*Aa+za*ya);sa=ca+12|0;Ca=+Ca;ya=+ya;g[sa>>2]=Ca;g[sa+4>>2]=ya;ka=ea+76|0;ya=+g[ka>>2];ya=(aa-ya)/(1.0-ya);ia=ea+60|0;ua=ea+52|0;Ca=+g[ua>>2];ha=ea+64|0;ta=ea+56|0;za=+g[ta>>2];Aa=ya*(+g[ha>>2]-za);g[ua>>2]=Ca+ya*(+g[ia>>2]-Ca);g[ta>>2]=za+Aa;ta=ea+72|0;ua=ea+68|0;Aa=+g[ua>>2];Aa=Aa+ya*(+g[ta>>2]-Aa);g[ua>>2]=Aa;g[ka>>2]=aa;ka=ea+52|0;ua=ea+60|0;da=c[ka>>2]|0;ka=c[ka+4>>2]|0;c[ua>>2]=da;c[ua+4>>2]=ka;g[ta>>2]=Aa;ya=+U(Aa);ua=ea+20|0;g[ua>>2]=ya;Aa=+T(Aa);va=ea+24|0;g[va>>2]=Aa;wa=ea+44|0;za=+g[wa>>2];xa=ea+48|0;Ca=+g[xa>>2];Ba=(c[k>>2]=da,+g[k>>2])-(Aa*za-ya*Ca);Ca=(c[k>>2]=ka,+g[k>>2])-(ya*za+Aa*Ca);ka=ea+12|0;Ba=+Ba;Ca=+Ca;g[ka>>2]=Ba;g[ka+4>>2]=Ca;Ai(ba,c[o>>2]|0);da=ba+4|0;ja=c[da>>2]|0;c[da>>2]=ja&-33;Da=ba+128|0;c[Da>>2]=(c[Da>>2]|0)+1;if((ja&6|0)!=6){c[da>>2]=ja&-37;fn(ma|0,s|0,36)|0;fn(na|0,x|0,36)|0;za=+g[pa>>2];Ba=+U(za);g[fa>>2]=Ba;za=+T(za);g[ga>>2]=za;Ca=+g[la>>2];Aa=+g[oa>>2];ya=+(+g[qa>>2]-(za*Ca-Ba*Aa));Aa=+(+g[ra>>2]-(Ba*Ca+za*Aa));g[sa>>2]=ya;g[sa+4>>2]=Aa;Aa=+g[ta>>2];ya=+U(Aa);g[ua>>2]=ya;Aa=+T(Aa);g[va>>2]=Aa;za=+g[wa>>2];Ca=+g[xa>>2];Ba=+(+g[ia>>2]-(Aa*za-ya*Ca));Ca=+(+g[ha>>2]-(ya*za+Aa*Ca));g[ka>>2]=Ba;g[ka+4>>2]=Ca;continue}ha=ca+4|0;ja=b[ha>>1]|0;if((ja&2)==0){ja=ja|2;b[ha>>1]=ja;g[ca+160>>2]=0.0}ia=ea+4|0;fa=b[ia>>1]|0;if((fa&2)==0){b[ia>>1]=fa|2;g[ea+160>>2]=0.0;ja=b[ha>>1]|0}c[C>>2]=0;c[B>>2]=0;c[A>>2]=0;fa=ca+8|0;c[fa>>2]=0;Da=c[C>>2]|0;c[(c[z>>2]|0)+(Da<<2)>>2]=ca;Da=Da+1|0;c[C>>2]=Da;ga=ea+8|0;c[ga>>2]=Da;Da=c[C>>2]|0;c[(c[z>>2]|0)+(Da<<2)>>2]=ea;c[C>>2]=Da+1;Da=c[B>>2]|0;c[B>>2]=Da+1;c[(c[y>>2]|0)+(Da<<2)>>2]=ba;b[ha>>1]=ja|1;b[ia>>1]=b[ia>>1]|1;c[da>>2]=c[da>>2]|1;c[t>>2]=ca;c[w>>2]=ea;ba=1;while(1){a:do{if((c[ca>>2]|0)==2){da=c[ca+128>>2]|0;if((da|0)==0){break}ca=ca+4|0;do{if((c[C>>2]|0)==(c[v>>2]|0)){break a}if((c[B>>2]|0)==(c[u>>2]|0)){break a}ja=c[da+4>>2]|0;ka=ja+4|0;b:do{if((c[ka>>2]&1|0)==0){ha=c[da>>2]|0;ia=ha|0;do{if((c[ia>>2]|0)==2){if(!((b[ca>>1]&8)==0)){break}if((b[ha+4>>1]&8)==0){break b}}}while(0);if((a[(c[ja+48>>2]|0)+38|0]|0)!=0){break}if((a[(c[ja+52>>2]|0)+38|0]|0)!=0){break}la=ha+44|0;fn(K|0,la|0,36)|0;ea=ha+4|0;if((b[ea>>1]&1)==0){Da=ha+76|0;ya=+g[Da>>2];ya=(aa-ya)/(1.0-ya);va=ha+52|0;Ca=+g[va>>2];wa=ha+56|0;za=+g[wa>>2];Aa=ya*(+g[ha+64>>2]-za);g[va>>2]=Ca+ya*(+g[ha+60>>2]-Ca);g[wa>>2]=za+Aa;wa=ha+72|0;va=ha+68|0;Aa=+g[va>>2];Aa=Aa+ya*(+g[wa>>2]-Aa);g[va>>2]=Aa;g[Da>>2]=aa;Da=ha+52|0;va=ha+60|0;xa=c[Da>>2]|0;Da=c[Da+4>>2]|0;c[va>>2]=xa;c[va+4>>2]=Da;g[wa>>2]=Aa;ya=+U(Aa);g[ha+20>>2]=ya;Aa=+T(Aa);g[ha+24>>2]=Aa;za=+g[ha+44>>2];Ca=+g[ha+48>>2];Ba=(c[k>>2]=xa,+g[k>>2])-(Aa*za-ya*Ca);Ca=(c[k>>2]=Da,+g[k>>2])-(ya*za+Aa*Ca);Da=ha+12|0;Ba=+Ba;Ca=+Ca;g[Da>>2]=Ba;g[Da+4>>2]=Ca}Ai(ja,c[o>>2]|0);ma=c[ka>>2]|0;if((ma&4|0)==0){fn(la|0,K|0,36)|0;Aa=+g[ha+72>>2];ya=+U(Aa);g[ha+20>>2]=ya;Aa=+T(Aa);g[ha+24>>2]=Aa;za=+g[ha+44>>2];Ca=+g[ha+48>>2];Da=ha+12|0;Ba=+(+g[ha+60>>2]-(Aa*za-ya*Ca));Ca=+(+g[ha+64>>2]-(ya*za+Aa*Ca));g[Da>>2]=Ba;g[Da+4>>2]=Ca;break}if((ma&2|0)==0){fn(la|0,K|0,36)|0;Aa=+g[ha+72>>2];ya=+U(Aa);g[ha+20>>2]=ya;Aa=+T(Aa);g[ha+24>>2]=Aa;za=+g[ha+44>>2];Ca=+g[ha+48>>2];Da=ha+12|0;Ba=+(+g[ha+60>>2]-(Aa*za-ya*Ca));Ca=+(+g[ha+64>>2]-(ya*za+Aa*Ca));g[Da>>2]=Ba;g[Da+4>>2]=Ca;break}c[ka>>2]=ma|1;Da=c[B>>2]|0;c[B>>2]=Da+1;c[(c[y>>2]|0)+(Da<<2)>>2]=ja;ja=b[ea>>1]|0;if(!((ja&1)==0)){break}b[ea>>1]=ja|1;do{if((c[ia>>2]|0)!=0){if(!((ja&2)==0)){break}b[ea>>1]=ja|3;g[ha+160>>2]=0.0}}while(0);c[ha+8>>2]=c[C>>2];Da=c[C>>2]|0;c[(c[z>>2]|0)+(Da<<2)>>2]=ha;c[C>>2]=Da+1}}while(0);da=c[da+12>>2]|0;}while((da|0)!=0)}}while(0);if((ba|0)>=2){break}ca=c[m+(ba<<2)>>2]|0;ba=ba+1|0}Ca=(1.0-aa)*+g[J>>2];g[I>>2]=Ca;g[H>>2]=1.0/Ca;g[E>>2]=1.0;c[G>>2]=20;c[F>>2]=c[D>>2];c[M>>2]=c[L>>2];a[e]=0;sf(j,l,c[fa>>2]|0,c[ga>>2]|0);ca=c[C>>2]|0;if((ca|0)>0){ba=0;do{da=c[(c[z>>2]|0)+(ba<<2)>>2]|0;Da=da+4|0;b[Da>>1]=b[Da>>1]&-2;if((c[da>>2]|0)==2){Mj(da);ca=c[da+128>>2]|0;if((ca|0)!=0){do{Da=(c[ca+4>>2]|0)+4|0;c[Da>>2]=c[Da>>2]&-34;ca=c[ca+12>>2]|0;}while((ca|0)!=0)}ca=c[C>>2]|0}ba=ba+1|0;}while((ba|0)<(ca|0))}Vj(q);if((a[Y]|0)!=0){m=0;l=83;break}}if((l|0)==83){a[f]=m;qf(j);i=h;return}}function Fj(b,d,e,f,h){b=b|0;d=+d;e=e|0;f=f|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;k=i;i=i+64|0;j=k|0;n=k+8|0;r=k+40|0;p=k+48|0;o=k+56|0;sm(j);l=b+102876|0;q=c[l>>2]|0;if((q&1|0)!=0){Vj(b+102880|0);q=c[l>>2]&-2;c[l>>2]=q}c[l>>2]=q|2;q=n|0;g[q>>2]=d;c[n+12>>2]=e;c[n+16>>2]=f;c[n+20>>2]=h;h=d>0.0;if(h){g[n+4>>2]=1.0/d}else{g[n+4>>2]=0.0}f=b+103e3|0;g[n+8>>2]=+g[f>>2]*d;a[n+24|0]=a[b+103004|0]|0;sm(r);Uj(b+102880|0);g[b+103012>>2]=+um(r);if(!((a[b+103007|0]|0)==0|h^1)){sm(p);r=c[b+102968>>2]|0;if((r|0)!=0){do{Qk(r,n);r=c[r+384>>2]|0;}while((r|0)!=0)}Dj(b,n);g[b+103016>>2]=+um(p)}do{if((a[b+103005|0]|0)==0){m=13}else{d=+g[q>>2];if(!(d>0.0)){break}sm(o);Ej(b,n);g[b+103036>>2]=+um(o);m=13}}while(0);if((m|0)==13){d=+g[q>>2]}if(d>0.0){g[f>>2]=+g[n+4>>2]}m=c[l>>2]|0;if((m&4|0)==0){e=m&-3;c[l>>2]=e;d=+um(j);e=b+103008|0;g[e>>2]=d;i=k;return}n=c[b+102960>>2]|0;if((n|0)==0){e=m&-3;c[l>>2]=e;d=+um(j);e=b+103008|0;g[e>>2]=d;i=k;return}do{g[n+92>>2]=0.0;g[n+96>>2]=0.0;g[n+100>>2]=0.0;n=c[n+112>>2]|0;}while((n|0)!=0);e=m&-3;c[l>>2]=e;d=+um(j);e=b+103008|0;g[e>>2]=d;i=k;return}function Gj(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0;e=i;i=i+8|0;f=e|0;g=a+102880|0;c[f>>2]=g;c[f+4>>2]=b;Hj(g|0,f,d);f=c[a+102968>>2]|0;if((f|0)==0){i=e;return}a=b;do{if(Cb[c[(c[a>>2]|0)+16>>2]&63](b,f)|0){al(f,b,d)}f=c[f+384>>2]|0;}while((f|0)!=0);i=e;return}function Hj(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0;f=i;i=i+1040|0;k=f|0;e=k+4|0;h=k|0;c[h>>2]=e;j=k+1028|0;c[j>>2]=0;k=k+1032|0;c[k>>2]=256;s=c[h>>2]|0;c[s+(c[j>>2]<<2)>>2]=c[a>>2];t=(c[j>>2]|0)+1|0;c[j>>2]=t;a:do{if((t|0)>0){a=a+4|0;m=d|0;l=d+4|0;n=d+8|0;d=d+12|0;o=b|0;b=b+4|0;while(1){t=t-1|0;c[j>>2]=t;p=c[s+(t<<2)>>2]|0;do{if(!((p|0)==-1)){q=c[a>>2]|0;if(+g[m>>2]- +g[q+(p*36|0)+8>>2]>0.0|+g[l>>2]- +g[q+(p*36|0)+12>>2]>0.0|+g[q+(p*36|0)>>2]- +g[n>>2]>0.0|+g[q+(p*36|0)+4>>2]- +g[d>>2]>0.0){break}r=q+(p*36|0)+24|0;if((c[r>>2]|0)==-1){t=c[b>>2]|0;if(!(Cb[c[(c[t>>2]|0)+8>>2]&63](t,c[(c[(c[(c[o>>2]|0)+4>>2]|0)+(p*36|0)+16>>2]|0)+16>>2]|0)|0)){break a}t=c[j>>2]|0;break}do{if((t|0)==(c[k>>2]|0)){c[k>>2]=t<<1;u=xm(t<<3)|0;c[h>>2]=u;t=s;fn(u|0,t|0,c[j>>2]<<2)|0;if((s|0)==(e|0)){break}ym(t)}}while(0);s=c[h>>2]|0;c[s+(c[j>>2]<<2)>>2]=c[r>>2];r=(c[j>>2]|0)+1|0;c[j>>2]=r;p=q+(p*36|0)+28|0;do{if((r|0)==(c[k>>2]|0)){c[k>>2]=r<<1;u=xm(r<<3)|0;c[h>>2]=u;q=s;fn(u|0,q|0,c[j>>2]<<2)|0;if((s|0)==(e|0)){break}ym(q)}}while(0);c[(c[h>>2]|0)+(c[j>>2]<<2)>>2]=c[p>>2];t=(c[j>>2]|0)+1|0;c[j>>2]=t}}while(0);if((t|0)<=0){break a}s=c[h>>2]|0}}}while(0);j=c[h>>2]|0;if((j|0)==(e|0)){i=f;return}ym(j);c[h>>2]=0;i=f;return}function Ij(d,e,f){d=d|0;e=e|0;f=f|0;var h=0,j=0,k=0,l=0,m=0,n=0.0;h=i;k=d+12|0;j=d+4|0;b[j>>1]=0;if((a[e+39|0]|0)==0){l=0}else{b[j>>1]=8;l=8}if((a[e+38|0]|0)!=0){l=l|16;b[j>>1]=l}if((a[e+36|0]|0)!=0){l=l|4;b[j>>1]=l}if((a[e+37|0]|0)!=0){l=l|2;b[j>>1]=l}if((a[e+40|0]|0)!=0){b[j>>1]=l|32}c[d+104>>2]=f;j=e+4|0;l=k;f=c[j>>2]|0;j=c[j+4>>2]|0;c[l>>2]=f;c[l+4>>2]=j;l=e+12|0;n=+g[l>>2];g[d+20>>2]=+U(n);g[d+24>>2]=+T(n);m=d+28|0;c[m>>2]=c[k>>2];c[m+4>>2]=c[k+4>>2];c[m+8>>2]=c[k+8>>2];c[m+12>>2]=c[k+12>>2];g[d+44>>2]=0.0;g[d+48>>2]=0.0;k=d+52|0;c[k>>2]=f;c[k+4>>2]=j;k=d+60|0;c[k>>2]=f;c[k+4>>2]=j;g[d+68>>2]=+g[l>>2];g[d+72>>2]=+g[l>>2];g[d+76>>2]=0.0;c[d+124>>2]=0;c[d+128>>2]=0;c[d+108>>2]=0;c[d+112>>2]=0;k=e+16|0;l=d+80|0;j=c[k+4>>2]|0;c[l>>2]=c[k>>2];c[l+4>>2]=j;g[d+88>>2]=+g[e+24>>2];g[d+148>>2]=+g[e+28>>2];g[d+152>>2]=+g[e+32>>2];g[d+156>>2]=+g[e+48>>2];g[d+92>>2]=0.0;g[d+96>>2]=0.0;g[d+100>>2]=0.0;g[d+160>>2]=0.0;l=c[e>>2]|0;c[d>>2]=l;j=d+132|0;if((l|0)==2){g[j>>2]=1.0;g[d+136>>2]=1.0;l=d+140|0;g[l>>2]=0.0;l=d+144|0;g[l>>2]=0.0;l=e+44|0;l=c[l>>2]|0;m=d+164|0;c[m>>2]=l;m=d+116|0;c[m>>2]=0;m=d+120|0;c[m>>2]=0;Ga(2376,(m=i,i=i+8|0,c[m>>2]=164,m)|0)|0;i=m;i=h;return}else{g[j>>2]=0.0;g[d+136>>2]=0.0;l=d+140|0;g[l>>2]=0.0;l=d+144|0;g[l>>2]=0.0;l=e+44|0;l=c[l>>2]|0;m=d+164|0;c[m>>2]=l;m=d+116|0;c[m>>2]=0;m=d+120|0;c[m>>2]=0;Ga(2376,(m=i,i=i+8|0,c[m>>2]=164,m)|0)|0;i=m;i=h;return}}function Jj(a){a=a|0;return}function Kj(a,d){a=a|0;d=d|0;var e=0,f=0,h=0,j=0,l=0,m=0.0,n=0.0,o=0.0,p=0.0,q=0.0,r=0;e=i;i=i+16|0;j=e|0;f=a+104|0;if((c[(c[f>>2]|0)+102876>>2]&2|0)!=0){i=e;return}h=a|0;if((c[h>>2]|0)==(d|0)){i=e;return}c[h>>2]=d;Lj(a);do{if((c[h>>2]|0)==0){g[a+80>>2]=0.0;g[a+84>>2]=0.0;g[a+88>>2]=0.0;o=+g[a+72>>2];g[a+68>>2]=o;l=a+60|0;d=a+52|0;r=c[l>>2]|0;l=c[l+4>>2]|0;c[d>>2]=r;c[d+4>>2]=l;d=j|0;h=j;j=j+8|0;q=+U(o);g[j>>2]=q;o=+T(o);g[j+4>>2]=o;p=+g[a+44>>2];m=+g[a+48>>2];n=(c[k>>2]=r,+g[k>>2])-(o*p-q*m);m=(c[k>>2]=l,+g[k>>2])-(q*p+o*m);n=+n;m=+m;g[d>>2]=n;g[d+4>>2]=m;d=(c[f>>2]|0)+102880|0;l=c[a+116>>2]|0;if((l|0)==0){break}j=a+12|0;do{tj(l,d,h,j);l=c[l+4>>2]|0;}while((l|0)!=0)}}while(0);h=a+4|0;j=b[h>>1]|0;if((j&2)==0){b[h>>1]=j|2;g[a+160>>2]=0.0}g[a+92>>2]=0.0;g[a+96>>2]=0.0;g[a+100>>2]=0.0;h=a+128|0;j=c[h>>2]|0;if((j|0)!=0){while(1){d=c[j+12>>2]|0;Tj((c[f>>2]|0)+102880|0,c[j+4>>2]|0);if((d|0)==0){break}else{j=d}}}c[h>>2]=0;f=(c[f>>2]|0)+102880|0;d=c[a+116>>2]|0;if((d|0)==0){i=e;return}do{j=c[d+28>>2]|0;if((j|0)>0){h=d+24|0;a=0;do{Ue(f,c[(c[h>>2]|0)+(a*28|0)+24>>2]|0);a=a+1|0;}while((a|0)<(j|0))}d=c[d+4>>2]|0;}while((d|0)!=0);i=e;return}function Lj(a){a=a|0;var d=0,e=0,f=0,h=0,j=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0.0,t=0.0,u=0.0,v=0.0,w=0,x=0.0,y=0,z=0.0,A=0.0;d=i;i=i+16|0;p=d|0;m=a+132|0;l=a+136|0;j=a+140|0;f=a+144|0;e=a+44|0;g[e>>2]=0.0;g[a+48>>2]=0.0;en(m|0,0,16)|0;if((c[a>>2]|0)>>>0<2>>>0){r=a+12|0;w=a+52|0;q=c[r>>2]|0;r=c[r+4>>2]|0;c[w>>2]=q;c[w+4>>2]=r;w=a+60|0;c[w>>2]=q;c[w+4>>2]=r;g[a+68>>2]=+g[a+72>>2];i=d;return}w=8376;v=+g[w>>2];t=+g[w+4>>2];w=c[a+116>>2]|0;do{if((w|0)==0){s=0.0;h=10}else{q=p|0;n=p+4|0;o=p+8|0;r=p+12|0;u=0.0;s=0.0;do{x=+g[w>>2];if(!(x==0.0)){y=c[w+12>>2]|0;Ab[c[(c[y>>2]|0)+32>>2]&63](y,p,x);s=+g[q>>2];u=s+ +g[m>>2];g[m>>2]=u;v=v+s*+g[n>>2];t=t+s*+g[o>>2];s=+g[r>>2]+ +g[j>>2];g[j>>2]=s}w=c[w+4>>2]|0;}while((w|0)!=0);if(!(u>0.0)){h=10;break}x=1.0/u;g[l>>2]=x;v=v*x;t=t*x}}while(0);if((h|0)==10){g[m>>2]=1.0;g[l>>2]=1.0;u=1.0}do{if(s>0.0){if(!((b[a+4>>1]&16)==0)){h=14;break}s=s-(t*t+v*v)*u;g[j>>2]=s;s=1.0/s}else{h=14}}while(0);if((h|0)==14){g[j>>2]=0.0;s=0.0}g[f>>2]=s;y=a+60|0;x=+g[y>>2];s=+g[y+4>>2];w=e;A=+v;z=+t;g[w>>2]=A;g[w+4>>2]=z;z=+g[a+24>>2];A=+g[a+20>>2];u=+g[a+12>>2]+(z*v-A*t);t=v*A+z*t+ +g[a+16>>2];w=(g[k>>2]=u,c[k>>2]|0);w=w|0;v=+t;c[y>>2]=w;g[y+4>>2]=v;y=a+52|0;c[y>>2]=w;g[y+4>>2]=v;v=+g[a+88>>2];y=a+80|0;g[y>>2]=+g[y>>2]+(t-s)*(-0.0-v);y=a+84|0;g[y>>2]=v*(u-x)+ +g[y>>2];i=d;return}function Mj(a){a=a|0;var b=0,d=0,e=0,f=0,h=0.0,j=0.0,k=0.0,l=0.0,m=0.0;b=i;i=i+16|0;f=b|0;d=f|0;e=f;f=f+8|0;k=+g[a+68>>2];l=+U(k);g[f>>2]=l;k=+T(k);g[f+4>>2]=k;m=+g[a+44>>2];h=+g[a+48>>2];j=+(+g[a+52>>2]-(k*m-l*h));h=+(+g[a+56>>2]-(m*l+k*h));g[d>>2]=j;g[d+4>>2]=h;d=(c[a+104>>2]|0)+102880|0;f=c[a+116>>2]|0;if((f|0)==0){i=b;return}a=a+12|0;do{tj(f,d,e,a);f=c[f+4>>2]|0;}while((f|0)!=0);i=b;return}function Nj(a,d){a=a|0;d=d|0;var e=0,f=0,h=0;e=a+104|0;f=c[e>>2]|0;if((c[f+102876>>2]&2|0)!=0){h=0;return h|0}f=f|0;h=mm(f,44)|0;if((h|0)==0){h=0}else{oj(h)}pj(h,f,a,d);if(!((b[a+4>>1]&32)==0)){rj(h,(c[e>>2]|0)+102880|0,a+12|0)}f=a+116|0;c[h+4>>2]=c[f>>2];c[f>>2]=h;f=a+120|0;c[f>>2]=(c[f>>2]|0)+1;c[h+8>>2]=a;if(+g[h>>2]>0.0){Lj(a)}f=(c[e>>2]|0)+102876|0;c[f>>2]=c[f>>2]|1;return h|0}function Oj(a,d){a=a|0;d=d|0;var e=0,f=0,g=0,h=0;e=a+104|0;if((c[(c[e>>2]|0)+102876>>2]&2|0)!=0){return}g=a+116|0;while(1){f=c[g>>2]|0;if((f|0)==0){break}if((f|0)==(d|0)){h=5;break}else{g=f+4|0}}if((h|0)==5){c[g>>2]=c[d+4>>2]}f=c[a+128>>2]|0;if((f|0)!=0){do{g=c[f+4>>2]|0;f=c[f+12>>2]|0;if((c[g+48>>2]|0)==(d|0)|(c[g+52>>2]|0)==(d|0)){Tj((c[e>>2]|0)+102880|0,g)}}while((f|0)!=0)}f=c[e>>2]|0;e=f|0;if(!((b[a+4>>1]&32)==0)){sj(d,f+102880|0)}qj(d,e);c[d+8>>2]=0;c[d+4>>2]=0;nm(e,d,44);h=a+120|0;c[h>>2]=(c[h>>2]|0)-1;Lj(a);return}function Pj(b,d){b=b|0;d=d|0;do{if((c[b>>2]|0)!=2){if((c[d>>2]|0)==2){break}else{d=0}return d|0}}while(0);b=c[b+124>>2]|0;if((b|0)==0){b=1;return b|0}while(1){if((c[b>>2]|0)==(d|0)){if((a[(c[b+4>>2]|0)+61|0]|0)==0){d=0;b=7;break}}b=c[b+12>>2]|0;if((b|0)==0){d=1;b=7;break}}if((b|0)==7){return d|0}return 0}function Qj(a,b,d){a=a|0;b=b|0;d=+d;var e=0,f=0,h=0.0,i=0,j=0.0,l=0.0,m=0.0,n=0.0,o=0,p=0;f=c[a+104>>2]|0;if((c[f+102876>>2]&2|0)!=0){return}e=a+12|0;m=+U(d);g[a+20>>2]=m;l=+T(d);g[a+24>>2]=l;o=e;i=c[b>>2]|0;b=c[b+4>>2]|0;c[o>>2]=i;c[o+4>>2]=b;o=a+28|0;p=e;c[o>>2]=c[p>>2];c[o+4>>2]=c[p+4>>2];c[o+8>>2]=c[p+8>>2];c[o+12>>2]=c[p+12>>2];n=+g[a+44>>2];h=+g[a+48>>2];j=(c[k>>2]=i,+g[k>>2])+(l*n-m*h);h=n*m+l*h+(c[k>>2]=b,+g[k>>2]);b=a+60|0;i=(g[k>>2]=j,c[k>>2]|0);i=i|0;h=+h;c[b>>2]=i;g[b+4>>2]=h;g[a+72>>2]=d;b=a+52|0;c[b>>2]=i;g[b+4>>2]=h;g[a+68>>2]=d;f=f+102880|0;a=c[a+116>>2]|0;if((a|0)==0){return}do{tj(a,f,e,e);a=c[a+4>>2]|0;}while((a|0)!=0);return}function Rj(a){a=a|0;return}function Sj(a){a=a|0;Pe(a|0);c[a+60>>2]=0;c[a+64>>2]=0;c[a+68>>2]=96;c[a+72>>2]=88;c[a+76>>2]=0;return}function Tj(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0;e=c[(c[b+48>>2]|0)+8>>2]|0;d=c[(c[b+52>>2]|0)+8>>2]|0;f=c[a+72>>2]|0;do{if((f|0)!=0){if((c[b+4>>2]&2|0)==0){break}ub[c[(c[f>>2]|0)+12>>2]&255](f,b)}}while(0);g=b+8|0;h=c[g>>2]|0;f=b+12|0;if((h|0)!=0){c[h+12>>2]=c[f>>2]}h=c[f>>2]|0;if((h|0)!=0){c[h+8>>2]=c[g>>2]}g=a+60|0;if((c[g>>2]|0)==(b|0)){c[g>>2]=c[f>>2]}g=b+24|0;h=c[g>>2]|0;f=b+28|0;if((h|0)!=0){c[h+12>>2]=c[f>>2]}h=c[f>>2]|0;if((h|0)!=0){c[h+8>>2]=c[g>>2]}e=e+128|0;if((b+16|0)==(c[e>>2]|0)){c[e>>2]=c[f>>2]}f=b+40|0;g=c[f>>2]|0;e=b+44|0;if((g|0)!=0){c[g+12>>2]=c[e>>2]}g=c[e>>2]|0;if((g|0)!=0){c[g+8>>2]=c[f>>2]}d=d+128|0;if((b+32|0)!=(c[d>>2]|0)){h=a+76|0;h=c[h>>2]|0;yi(b,h);h=a+64|0;g=c[h>>2]|0;g=g-1|0;c[h>>2]=g;return}c[d>>2]=c[e>>2];h=a+76|0;h=c[h>>2]|0;yi(b,h);h=a+64|0;g=c[h>>2]|0;g=g-1|0;c[h>>2]=g;return}function Uj(a){a=a|0;var d=0,e=0,f=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;j=c[a+60>>2]|0;if((j|0)==0){return}h=a+4|0;f=a+72|0;e=a+68|0;do{k=c[j+48>>2]|0;i=c[j+52>>2]|0;l=c[j+56>>2]|0;m=c[j+60>>2]|0;o=c[k+8>>2]|0;n=c[i+8>>2]|0;p=j+4|0;a:do{if((c[p>>2]&8|0)==0){d=11}else{if(!(Pj(n,o)|0)){q=c[j+12>>2]|0;Tj(a,j);j=q;break}q=c[e>>2]|0;do{if((q|0)!=0){if(vb[c[(c[q>>2]|0)+8>>2]&31](q,k,i)|0){break}q=c[j+12>>2]|0;Tj(a,j);j=q;break a}}while(0);c[p>>2]=c[p>>2]&-9;d=11}}while(0);do{if((d|0)==11){d=0;if((b[o+4>>1]&2)==0){o=0}else{o=(c[o>>2]|0)!=0|0}if((b[n+4>>1]&2)==0){n=1}else{n=(c[n>>2]|0)==0}if((o|0)==0&n){j=c[j+12>>2]|0;break}o=c[(c[k+24>>2]|0)+(l*28|0)+24>>2]|0;q=c[(c[i+24>>2]|0)+(m*28|0)+24>>2]|0;p=c[h>>2]|0;if(+g[p+(q*36|0)>>2]- +g[p+(o*36|0)+8>>2]>0.0|+g[p+(q*36|0)+4>>2]- +g[p+(o*36|0)+12>>2]>0.0|+g[p+(o*36|0)>>2]- +g[p+(q*36|0)+8>>2]>0.0|+g[p+(o*36|0)+4>>2]- +g[p+(q*36|0)+12>>2]>0.0){q=c[j+12>>2]|0;Tj(a,j);j=q;break}else{Ai(j,c[f>>2]|0);j=c[j+12>>2]|0;break}}}while(0);}while((j|0)!=0);return}function Vj(a){a=a|0;Wj(a|0,a);return}function Wj(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0;e=i;i=i+8|0;f=e|0;d=a+52|0;c[d>>2]=0;g=a+40|0;n=c[g>>2]|0;if((n|0)>0){k=a+32|0;l=a+56|0;h=a|0;j=a+4|0;m=0;do{o=c[(c[k>>2]|0)+(m<<2)>>2]|0;c[l>>2]=o;if(!((o|0)==-1)){Yj(h,a,(c[j>>2]|0)+(o*36|0)|0);n=c[g>>2]|0}m=m+1|0;}while((m|0)<(n|0));h=c[d>>2]|0}else{h=0}c[g>>2]=0;g=a+44|0;o=c[g>>2]|0;c[f>>2]=30;_j(o,o+(h<<3)|0,f);if((c[d>>2]|0)<=0){i=e;return}a=a+4|0;k=0;a:while(1){f=c[g>>2]|0;h=f+(k<<3)|0;j=c[a>>2]|0;f=f+(k<<3)+4|0;Xj(b,c[j+((c[h>>2]|0)*36|0)+16>>2]|0,c[j+((c[f>>2]|0)*36|0)+16>>2]|0);j=c[d>>2]|0;while(1){k=k+1|0;if((k|0)>=(j|0)){break a}l=c[g>>2]|0;if((c[l+(k<<3)>>2]|0)!=(c[h>>2]|0)){continue a}if((c[l+(k<<3)+4>>2]|0)!=(c[f>>2]|0)){continue a}}}i=e;return}function Xj(d,e,f){d=d|0;e=e|0;f=f|0;var h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0;i=c[e+16>>2]|0;h=c[f+16>>2]|0;e=c[e+20>>2]|0;f=c[f+20>>2]|0;k=c[i+8>>2]|0;j=c[h+8>>2]|0;if((k|0)==(j|0)){return}o=c[j+128>>2]|0;a:do{if((o|0)!=0){while(1){if((c[o>>2]|0)==(k|0)){n=c[o+4>>2]|0;l=c[n+48>>2]|0;p=c[n+52>>2]|0;m=c[n+56>>2]|0;n=c[n+60>>2]|0;if((l|0)==(i|0)&(p|0)==(h|0)&(m|0)==(e|0)&(n|0)==(f|0)){l=24;break}if((l|0)==(h|0)&(p|0)==(i|0)&(m|0)==(f|0)&(n|0)==(e|0)){l=24;break}}o=c[o+12>>2]|0;if((o|0)==0){break a}}if((l|0)==24){return}}}while(0);if(!(Pj(j,k)|0)){return}j=c[d+68>>2]|0;do{if((j|0)!=0){if(vb[c[(c[j>>2]|0)+8>>2]&31](j,i,h)|0){break}return}}while(0);j=xi(i,e,h,f,c[d+76>>2]|0)|0;if((j|0)==0){return}e=c[j+48>>2]|0;f=c[j+52>>2]|0;i=c[e+8>>2]|0;h=c[f+8>>2]|0;c[j+8>>2]=0;k=d+60|0;c[j+12>>2]=c[k>>2];l=c[k>>2]|0;if((l|0)!=0){c[l+8>>2]=j}c[k>>2]=j;k=j+16|0;c[j+20>>2]=j;c[k>>2]=h;c[j+24>>2]=0;l=i+128|0;c[j+28>>2]=c[l>>2];m=c[l>>2]|0;if((m|0)!=0){c[m+8>>2]=k}c[l>>2]=k;l=j+32|0;c[j+36>>2]=j;c[l>>2]=i;c[j+40>>2]=0;k=h+128|0;c[j+44>>2]=c[k>>2];j=c[k>>2]|0;if((j|0)!=0){c[j+8>>2]=l}c[k>>2]=l;do{if((a[e+38|0]|0)==0){if((a[f+38|0]|0)!=0){break}e=i+4|0;f=b[e>>1]|0;if((f&2)==0){b[e>>1]=f|2;g[i+160>>2]=0.0}e=h+4|0;i=b[e>>1]|0;if(!((i&2)==0)){break}b[e>>1]=i|2;g[h+160>>2]=0.0}}while(0);p=d+64|0;c[p>>2]=(c[p>>2]|0)+1;return}function Yj(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0;h=i;i=i+1040|0;k=h|0;f=k+4|0;e=k|0;c[e>>2]=f;j=k+1028|0;c[j>>2]=0;k=k+1032|0;c[k>>2]=256;q=c[e>>2]|0;c[q+(c[j>>2]<<2)>>2]=c[a>>2];s=(c[j>>2]|0)+1|0;c[j>>2]=s;a:do{if((s|0)>0){n=a+4|0;m=d|0;l=d+4|0;a=d+8|0;d=d+12|0;while(1){s=s-1|0;c[j>>2]=s;o=c[q+(s<<2)>>2]|0;do{if(!((o|0)==-1)){p=c[n>>2]|0;if(+g[m>>2]- +g[p+(o*36|0)+8>>2]>0.0|+g[l>>2]- +g[p+(o*36|0)+12>>2]>0.0|+g[p+(o*36|0)>>2]- +g[a>>2]>0.0|+g[p+(o*36|0)+4>>2]- +g[d>>2]>0.0){break}r=p+(o*36|0)+24|0;if((c[r>>2]|0)==-1){if(!(Ve(b,o)|0)){break a}s=c[j>>2]|0;break}do{if((s|0)==(c[k>>2]|0)){c[k>>2]=s<<1;t=xm(s<<3)|0;c[e>>2]=t;s=q;fn(t|0,s|0,c[j>>2]<<2)|0;if((q|0)==(f|0)){break}ym(s)}}while(0);q=c[e>>2]|0;c[q+(c[j>>2]<<2)>>2]=c[r>>2];r=(c[j>>2]|0)+1|0;c[j>>2]=r;o=p+(o*36|0)+28|0;do{if((r|0)==(c[k>>2]|0)){c[k>>2]=r<<1;t=xm(r<<3)|0;c[e>>2]=t;p=q;fn(t|0,p|0,c[j>>2]<<2)|0;if((q|0)==(f|0)){break}ym(p)}}while(0);c[(c[e>>2]|0)+(c[j>>2]<<2)>>2]=c[o>>2];s=(c[j>>2]|0)+1|0;c[j>>2]=s}}while(0);if((s|0)<=0){break a}q=c[e>>2]|0}}}while(0);b=c[e>>2]|0;if((b|0)==(f|0)){i=h;return}ym(b);c[e>>2]=0;i=h;return}function Zj(a,b){a=a|0;b=b|0;var d=0,e=0;d=c[a>>2]|0;e=c[b>>2]|0;if((d|0)<(e|0)){b=1;return b|0}if((d|0)!=(e|0)){b=0;return b|0}b=(c[a+4>>2]|0)<(c[b+4>>2]|0);return b|0}function _j(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0;a:while(1){h=b;f=b-8|0;e=f;b:while(1){i=a;k=h-i|0;m=k>>3;switch(m|0){case 5:{g=15;break a};case 4:{g=14;break a};case 3:{g=6;break a};case 2:{g=4;break a};case 0:case 1:{g=66;break a};default:{}}if((k|0)<248){g=21;break a}l=(m|0)/2|0;j=a+(l<<3)|0;do{if((k|0)>7992){m=(m|0)/4|0;k=a+(m<<3)|0;l=a+(m+l<<3)|0;m=$j(a,k,j,l,d)|0;if(!(Cb[c[d>>2]&63](f,l)|0)){break}n=l;p=c[n>>2]|0;o=c[n+4>>2]|0;q=c[e+4>>2]|0;c[n>>2]=c[e>>2];c[n+4>>2]=q;c[e>>2]=p;c[e+4>>2]=o;if(!(Cb[c[d>>2]&63](l,j)|0)){m=m+1|0;break}l=j;p=c[l>>2]|0;q=c[l+4>>2]|0;o=c[n+4>>2]|0;c[l>>2]=c[n>>2];c[l+4>>2]=o;c[n>>2]=p;c[n+4>>2]=q;if(!(Cb[c[d>>2]&63](j,k)|0)){m=m+2|0;break}n=k;p=c[n>>2]|0;q=c[n+4>>2]|0;o=c[l+4>>2]|0;c[n>>2]=c[l>>2];c[n+4>>2]=o;c[l>>2]=p;c[l+4>>2]=q;if(!(Cb[c[d>>2]&63](k,a)|0)){m=m+3|0;break}o=a;p=c[o>>2]|0;q=c[o+4>>2]|0;l=c[n+4>>2]|0;c[o>>2]=c[n>>2];c[o+4>>2]=l;c[n>>2]=p;c[n+4>>2]=q;m=m+4|0}else{q=Cb[c[d>>2]&63](j,a)|0;n=Cb[c[d>>2]&63](f,j)|0;if(!q){if(!n){m=0;break}k=j;p=c[k>>2]|0;q=c[k+4>>2]|0;o=c[e+4>>2]|0;c[k>>2]=c[e>>2];c[k+4>>2]=o;c[e>>2]=p;c[e+4>>2]=q;if(!(Cb[c[d>>2]&63](j,a)|0)){m=1;break}p=a;q=c[p>>2]|0;m=c[p+4>>2]|0;o=c[k+4>>2]|0;c[p>>2]=c[k>>2];c[p+4>>2]=o;c[k>>2]=q;c[k+4>>2]=m;m=2;break}k=a;l=c[k>>2]|0;m=c[k+4>>2]|0;if(n){q=c[e+4>>2]|0;c[k>>2]=c[e>>2];c[k+4>>2]=q;c[e>>2]=l;c[e+4>>2]=m;m=1;break}n=j;q=c[n+4>>2]|0;c[k>>2]=c[n>>2];c[k+4>>2]=q;c[n>>2]=l;c[n+4>>2]=m;if(!(Cb[c[d>>2]&63](f,j)|0)){m=1;break}q=c[n>>2]|0;m=c[n+4>>2]|0;p=c[e+4>>2]|0;c[n>>2]=c[e>>2];c[n+4>>2]=p;c[e>>2]=q;c[e+4>>2]=m;m=2}}while(0);do{if(Cb[c[d>>2]&63](a,j)|0){l=f}else{l=f;while(1){l=l-8|0;if((a|0)==(l|0)){break}if(Cb[c[d>>2]&63](l,j)|0){g=49;break}}if((g|0)==49){g=0;n=a;o=c[n>>2]|0;p=c[n+4>>2]|0;q=l;k=c[q+4>>2]|0;c[n>>2]=c[q>>2];c[n+4>>2]=k;c[q>>2]=o;c[q+4>>2]=p;m=m+1|0;break}j=a+8|0;if(!(Cb[c[d>>2]&63](a,f)|0)){while(1){if((j|0)==(f|0)){g=66;break a}i=j+8|0;if(Cb[c[d>>2]&63](a,j)|0){break}else{j=i}}p=j;q=c[p>>2]|0;j=c[p+4>>2]|0;o=c[e+4>>2]|0;c[p>>2]=c[e>>2];c[p+4>>2]=o;c[e>>2]=q;c[e+4>>2]=j;j=i}if((j|0)==(f|0)){g=66;break a}else{i=f}while(1){while(1){k=j+8|0;if(Cb[c[d>>2]&63](a,j)|0){break}else{j=k}}do{i=i-8|0;}while(Cb[c[d>>2]&63](a,i)|0);if(!(j>>>0<i>>>0)){a=j;continue b}o=j;p=c[o>>2]|0;q=c[o+4>>2]|0;j=i;n=c[j+4>>2]|0;c[o>>2]=c[j>>2];c[o+4>>2]=n;c[j>>2]=p;c[j+4>>2]=q;j=k}}}while(0);k=a+8|0;c:do{if(k>>>0<l>>>0){while(1){o=k;while(1){k=o+8|0;if(Cb[c[d>>2]&63](o,j)|0){o=k}else{n=l;break}}do{n=n-8|0;}while(!(Cb[c[d>>2]&63](n,j)|0));if(o>>>0>n>>>0){k=o;break c}r=o;p=c[r>>2]|0;q=c[r+4>>2]|0;l=n;s=c[l+4>>2]|0;c[r>>2]=c[l>>2];c[r+4>>2]=s;c[l>>2]=p;c[l+4>>2]=q;l=n;m=m+1|0;j=(j|0)==(o|0)?n:j}}}while(0);do{if((k|0)!=(j|0)){if(!(Cb[c[d>>2]&63](j,k)|0)){break}p=k;q=c[p>>2]|0;r=c[p+4>>2]|0;s=j;o=c[s+4>>2]|0;c[p>>2]=c[s>>2];c[p+4>>2]=o;c[s>>2]=q;c[s+4>>2]=r;m=m+1|0}}while(0);if((m|0)==0){j=bk(a,k,d)|0;l=k+8|0;if(bk(l,b,d)|0){g=61;break}if(j){a=l;continue}}s=k;if((s-i|0)>=(h-s|0)){g=65;break}_j(a,k,d);a=k+8|0}if((g|0)==61){g=0;if(j){g=66;break}else{b=k;continue}}else if((g|0)==65){g=0;_j(k+8|0,b,d);b=k;continue}}if((g|0)==4){if(!(Cb[c[d>>2]&63](f,a)|0)){return}q=a;r=c[q>>2]|0;s=c[q+4>>2]|0;p=c[e+4>>2]|0;c[q>>2]=c[e>>2];c[q+4>>2]=p;c[e>>2]=r;c[e+4>>2]=s;return}else if((g|0)==6){g=a+8|0;s=Cb[c[d>>2]&63](g,a)|0;h=Cb[c[d>>2]&63](f,g)|0;if(!s){if(!h){return}f=g;r=c[f>>2]|0;s=c[f+4>>2]|0;q=c[e+4>>2]|0;c[f>>2]=c[e>>2];c[f+4>>2]=q;c[e>>2]=r;c[e+4>>2]=s;if(!(Cb[c[d>>2]&63](g,a)|0)){return}q=a;r=c[q>>2]|0;s=c[q+4>>2]|0;p=c[f+4>>2]|0;c[q>>2]=c[f>>2];c[q+4>>2]=p;c[f>>2]=r;c[f+4>>2]=s;return}i=c[a>>2]|0;b=c[a+4>>2]|0;if(h){s=c[e+4>>2]|0;c[a>>2]=c[e>>2];c[a+4>>2]=s;c[e>>2]=i;c[e+4>>2]=b;return}h=g;s=c[h+4>>2]|0;c[a>>2]=c[h>>2];c[a+4>>2]=s;c[h>>2]=i;c[h+4>>2]=b;if(!(Cb[c[d>>2]&63](f,g)|0)){return}r=c[h>>2]|0;s=c[h+4>>2]|0;q=c[e+4>>2]|0;c[h>>2]=c[e>>2];c[h+4>>2]=q;c[e>>2]=r;c[e+4>>2]=s;return}else if((g|0)==14){$j(a,a+8|0,a+16|0,f,d)|0;return}else if((g|0)==15){g=a+8|0;h=a+16|0;b=a+24|0;$j(a,g,h,b,d)|0;if(!(Cb[c[d>>2]&63](f,b)|0)){return}f=b;r=c[f>>2]|0;s=c[f+4>>2]|0;q=c[e+4>>2]|0;c[f>>2]=c[e>>2];c[f+4>>2]=q;c[e>>2]=r;c[e+4>>2]=s;if(!(Cb[c[d>>2]&63](b,h)|0)){return}e=h;r=c[e>>2]|0;s=c[e+4>>2]|0;q=c[f+4>>2]|0;c[e>>2]=c[f>>2];c[e+4>>2]=q;c[f>>2]=r;c[f+4>>2]=s;if(!(Cb[c[d>>2]&63](h,g)|0)){return}f=g;r=c[f>>2]|0;s=c[f+4>>2]|0;q=c[e+4>>2]|0;c[f>>2]=c[e>>2];c[f+4>>2]=q;c[e>>2]=r;c[e+4>>2]=s;if(!(Cb[c[d>>2]&63](g,a)|0)){return}q=a;r=c[q>>2]|0;s=c[q+4>>2]|0;p=c[f+4>>2]|0;c[q>>2]=c[f>>2];c[q+4>>2]=p;c[f>>2]=r;c[f+4>>2]=s;return}else if((g|0)==21){ak(a,b,d);return}else if((g|0)==66){return}}function $j(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0;i=Cb[c[f>>2]&63](b,a)|0;j=Cb[c[f>>2]&63](d,b)|0;do{if(i){h=a;i=c[h>>2]|0;g=c[h+4>>2]|0;if(j){j=d;k=c[j+4>>2]|0;c[h>>2]=c[j>>2];c[h+4>>2]=k;c[j>>2]=i;c[j+4>>2]=g;g=1;break}j=b;k=c[j+4>>2]|0;c[h>>2]=c[j>>2];c[h+4>>2]=k;c[j>>2]=i;c[j+4>>2]=g;if(!(Cb[c[f>>2]&63](d,b)|0)){g=1;break}i=c[j>>2]|0;k=c[j+4>>2]|0;g=d;h=c[g+4>>2]|0;c[j>>2]=c[g>>2];c[j+4>>2]=h;c[g>>2]=i;c[g+4>>2]=k;g=2}else{if(!j){g=0;break}g=b;i=c[g>>2]|0;j=c[g+4>>2]|0;k=d;h=c[k+4>>2]|0;c[g>>2]=c[k>>2];c[g+4>>2]=h;c[k>>2]=i;c[k+4>>2]=j;if(!(Cb[c[f>>2]&63](b,a)|0)){g=1;break}i=a;j=c[i>>2]|0;k=c[i+4>>2]|0;h=c[g+4>>2]|0;c[i>>2]=c[g>>2];c[i+4>>2]=h;c[g>>2]=j;c[g+4>>2]=k;g=2}}while(0);if(!(Cb[c[f>>2]&63](e,d)|0)){k=g;return k|0}h=d;i=c[h>>2]|0;j=c[h+4>>2]|0;k=e;e=c[k+4>>2]|0;c[h>>2]=c[k>>2];c[h+4>>2]=e;c[k>>2]=i;c[k+4>>2]=j;if(!(Cb[c[f>>2]&63](d,b)|0)){k=g+1|0;return k|0}d=b;j=c[d>>2]|0;k=c[d+4>>2]|0;i=c[h+4>>2]|0;c[d>>2]=c[h>>2];c[d+4>>2]=i;c[h>>2]=j;c[h+4>>2]=k;if(!(Cb[c[f>>2]&63](b,a)|0)){k=g+2|0;return k|0}i=a;j=c[i>>2]|0;k=c[i+4>>2]|0;h=c[d+4>>2]|0;c[i>>2]=c[d>>2];c[i+4>>2]=h;c[d>>2]=j;c[d+4>>2]=k;k=g+3|0;return k|0}function ak(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0;g=i;i=i+8|0;e=g|0;f=e;h=a+16|0;j=a+8|0;m=Cb[c[d>>2]&63](j,a)|0;n=Cb[c[d>>2]&63](h,j)|0;do{if(m){k=a;m=c[k>>2]|0;l=c[k+4>>2]|0;if(n){n=h;j=c[n+4>>2]|0;c[k>>2]=c[n>>2];c[k+4>>2]=j;c[n>>2]=m;c[n+4>>2]=l;break}n=j;o=c[n+4>>2]|0;c[k>>2]=c[n>>2];c[k+4>>2]=o;c[n>>2]=m;c[n+4>>2]=l;if(!(Cb[c[d>>2]&63](h,j)|0)){break}l=c[n>>2]|0;m=c[n+4>>2]|0;o=h;k=c[o+4>>2]|0;c[n>>2]=c[o>>2];c[n+4>>2]=k;c[o>>2]=l;c[o+4>>2]=m}else{if(!n){break}k=j;m=c[k>>2]|0;n=c[k+4>>2]|0;o=h;l=c[o+4>>2]|0;c[k>>2]=c[o>>2];c[k+4>>2]=l;c[o>>2]=m;c[o+4>>2]=n;if(!(Cb[c[d>>2]&63](j,a)|0)){break}m=a;n=c[m>>2]|0;o=c[m+4>>2]|0;l=c[k+4>>2]|0;c[m>>2]=c[k>>2];c[m+4>>2]=l;c[k>>2]=n;c[k+4>>2]=o}}while(0);j=a+24|0;if((j|0)==(b|0)){i=g;return}while(1){if(Cb[c[d>>2]&63](j,h)|0){o=j;k=c[o+4>>2]|0;c[e>>2]=c[o>>2];c[e+4>>2]=k;k=j;while(1){l=h;o=k;n=c[l+4>>2]|0;c[o>>2]=c[l>>2];c[o+4>>2]=n;if((h|0)==(a|0)){break}m=h-8|0;if(Cb[c[d>>2]&63](f,m)|0){k=h;h=m}else{break}}o=c[e+4>>2]|0;c[l>>2]=c[e>>2];c[l+4>>2]=o}k=j+8|0;if((k|0)==(b|0)){break}else{h=j;j=k}}i=g;return}



function gf(b,d,e,f,h,j){b=b|0;d=d|0;e=e|0;f=f|0;h=h|0;j=j|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0.0,G=0.0,H=0.0,I=0.0,J=0.0,K=0.0,L=0.0,M=0,N=0.0,O=0.0,P=0.0,Q=0.0,S=0,T=0,U=0.0,V=0.0,W=0.0,X=0,Y=0,Z=0.0;l=i;i=i+40|0;B=l|0;u=l+16|0;t=u|0;v=u;r=i;i=i+56|0;s=i;i=i+24|0;n=i;i=i+24|0;q=n|0;m=n;o=b+132|0;G=+g[f+12>>2];V=+g[j+8>>2];U=+g[f+8>>2];K=+g[j+12>>2];F=G*V-U*K;K=V*U+G*K;V=+F;J=+K;L=+g[j>>2]- +g[f>>2];H=+g[j+4>>2]- +g[f+4>>2];I=G*L+U*H;H=L*(-0.0-U)+G*H;G=+I;U=+H;p=o;g[p>>2]=G;g[p+4>>2]=U;p=b+140|0;g[p>>2]=V;g[p+4>>2]=J;p=b+144|0;J=+g[h+12>>2];f=b+140|0;V=+g[h+16>>2];j=o|0;I=I+(K*J-F*V);o=b+136|0;H=J*F+K*V+H;S=b+148|0;V=+I;K=+H;g[S>>2]=V;g[S+4>>2]=K;S=e+28|0;A=b+156|0;M=c[S>>2]|0;S=c[S+4>>2]|0;c[A>>2]=M;c[A+4>>2]=S;A=e+12|0;x=b+164|0;z=c[A>>2]|0;A=c[A+4>>2]|0;c[x>>2]=z;c[x+4>>2]=A;E=e+20|0;w=b+172|0;Y=c[E>>2]|0;E=c[E+4>>2]|0;c[w>>2]=Y;c[w+4>>2]=E;X=e+36|0;D=b+180|0;T=c[X>>2]|0;X=c[X+4>>2]|0;c[D>>2]=T;c[D+4>>2]=X;D=(a[e+44|0]|0)!=0;C=(a[e+45|0]|0)!=0;K=(c[k>>2]=Y,+g[k>>2]);V=(c[k>>2]=z,+g[k>>2]);F=K-V;J=(c[k>>2]=E,+g[k>>2]);E=b+168|0;U=(c[k>>2]=A,+g[k>>2]);G=J-U;L=+R(F*F+G*G);Q=(c[k>>2]=M,+g[k>>2]);P=(c[k>>2]=S,+g[k>>2]);O=(c[k>>2]=T,+g[k>>2]);N=(c[k>>2]=X,+g[k>>2]);if(!(L<1.1920928955078125e-7)){W=1.0/L;F=F*W;G=G*W}A=b+196|0;L=-0.0-F;z=A|0;g[z>>2]=G;e=b+200|0;g[e>>2]=L;L=(I-V)*G+(H-U)*L;if(D){W=V-Q;V=U-P;U=+R(W*W+V*V);if(U<1.1920928955078125e-7){U=W}else{Z=1.0/U;U=W*Z;V=V*Z}Z=-0.0-U;g[b+188>>2]=V;g[b+192>>2]=Z;P=(I-Q)*V+(H-P)*Z;M=G*U-F*V>=0.0}else{P=0.0;M=0}a:do{if(C){Q=O-K;O=N-J;N=+R(Q*Q+O*O);if(N<1.1920928955078125e-7){N=Q}else{Z=1.0/N;N=Q*Z;O=O*Z}Z=-0.0-N;S=b+204|0;g[S>>2]=O;T=b+208|0;g[T>>2]=Z;X=F*O-G*N>0.0;H=(I-K)*O+(H-J)*Z;if(!D){D=L>=0.0;if(!C){a[b+248|0]=D&1;y=b+212|0;if(D){C=y;y=64;break}else{C=y;y=65;break}}if(X){do{if(D){a[b+248|0]=1;C=b+212|0}else{Y=H>=0.0;a[b+248|0]=Y&1;C=b+212|0;if(Y){break}T=C;Y=(g[k>>2]=-0.0-G,c[k>>2]|0);Y=Y|0;Z=+F;c[T>>2]=Y;g[T+4>>2]=Z;T=b+228|0;c[T>>2]=Y;g[T+4>>2]=Z;T=A;Y=b+236|0;X=c[T+4>>2]|0;c[Y>>2]=c[T>>2];c[Y+4>>2]=X;break a}}while(0);X=A;T=C;Y=c[X+4>>2]|0;c[T>>2]=c[X>>2];c[T+4>>2]=Y;T=b+228|0;W=+(-0.0- +g[z>>2]);Z=+(-0.0- +g[e>>2]);g[T>>2]=W;g[T+4>>2]=Z;T=b+204|0;Y=b+236|0;X=c[T+4>>2]|0;c[Y>>2]=c[T>>2];c[Y+4>>2]=X;break}else{do{if(D){Y=H>=0.0;a[b+248|0]=Y&1;C=b+212|0;if(!Y){break}X=A;Y=C;T=c[X>>2]|0;X=c[X+4>>2]|0;c[Y>>2]=T;c[Y+4>>2]=X;Y=b+228|0;W=+(-0.0-(c[k>>2]=T,+g[k>>2]));Z=+F;g[Y>>2]=W;g[Y+4>>2]=Z;Y=b+236|0;c[Y>>2]=T;c[Y+4>>2]=X;break a}else{a[b+248|0]=0;C=b+212|0}}while(0);T=C;Z=+(-0.0-G);W=+F;g[T>>2]=Z;g[T+4>>2]=W;T=b+228|0;W=+(-0.0- +g[b+204>>2]);Z=+(-0.0- +g[b+208>>2]);g[T>>2]=W;g[T+4>>2]=Z;T=A;Y=b+236|0;X=c[T+4>>2]|0;c[Y>>2]=c[T>>2];c[Y+4>>2]=X;break}}if(M&X){do{if(P<0.0&L<0.0){Y=H>=0.0;a[b+248|0]=Y&1;C=b+212|0;if(Y){break}Y=C;X=(g[k>>2]=-0.0-G,c[k>>2]|0);X=X|0;Z=+F;c[Y>>2]=X;g[Y+4>>2]=Z;Y=b+228|0;c[Y>>2]=X;g[Y+4>>2]=Z;Y=b+236|0;c[Y>>2]=X;g[Y+4>>2]=Z;break a}else{a[b+248|0]=1;C=b+212|0}}while(0);Y=A;X=C;T=c[Y+4>>2]|0;c[X>>2]=c[Y>>2];c[X+4>>2]=T;X=b+188|0;T=b+228|0;Y=c[X+4>>2]|0;c[T>>2]=c[X>>2];c[T+4>>2]=Y;T=b+204|0;Y=b+236|0;X=c[T+4>>2]|0;c[Y>>2]=c[T>>2];c[Y+4>>2]=X;break}if(M){do{if(P<0.0){if(L<0.0){a[b+248|0]=0;C=b+212|0}else{Y=H>=0.0;a[b+248|0]=Y&1;C=b+212|0;if(Y){break}}Y=C;W=+(-0.0-G);Z=+F;g[Y>>2]=W;g[Y+4>>2]=Z;Y=b+228|0;Z=+(-0.0- +g[S>>2]);W=+(-0.0- +g[T>>2]);g[Y>>2]=Z;g[Y+4>>2]=W;Y=b+236|0;W=+(-0.0- +g[z>>2]);Z=+(-0.0- +g[e>>2]);g[Y>>2]=W;g[Y+4>>2]=Z;break a}else{a[b+248|0]=1;C=b+212|0}}while(0);T=A;S=C;Y=c[T+4>>2]|0;c[S>>2]=c[T>>2];c[S+4>>2]=Y;S=b+188|0;Y=b+228|0;X=c[S+4>>2]|0;c[Y>>2]=c[S>>2];c[Y+4>>2]=X;Y=b+236|0;X=c[T+4>>2]|0;c[Y>>2]=c[T>>2];c[Y+4>>2]=X;break}if(!X){do{if(P<0.0|L<0.0){a[b+248|0]=0;C=b+212|0}else{Y=H>=0.0;a[b+248|0]=Y&1;C=b+212|0;if(!Y){break}X=A;Y=C;T=c[X>>2]|0;X=c[X+4>>2]|0;c[Y>>2]=T;c[Y+4>>2]=X;Y=b+228|0;c[Y>>2]=T;c[Y+4>>2]=X;Y=b+236|0;c[Y>>2]=T;c[Y+4>>2]=X;break a}}while(0);Y=C;W=+(-0.0-G);Z=+F;g[Y>>2]=W;g[Y+4>>2]=Z;Y=b+228|0;Z=+(-0.0- +g[S>>2]);W=+(-0.0- +g[T>>2]);g[Y>>2]=Z;g[Y+4>>2]=W;Y=b+236|0;W=+(-0.0- +g[b+188>>2]);Z=+(-0.0- +g[b+192>>2]);g[Y>>2]=W;g[Y+4>>2]=Z;break}do{if(H<0.0){if(P<0.0){a[b+248|0]=0;C=b+212|0}else{Y=L>=0.0;a[b+248|0]=Y&1;C=b+212|0;if(Y){break}}Y=C;W=+(-0.0-G);Z=+F;g[Y>>2]=W;g[Y+4>>2]=Z;Y=b+228|0;Z=+(-0.0- +g[z>>2]);W=+(-0.0- +g[e>>2]);g[Y>>2]=Z;g[Y+4>>2]=W;Y=b+236|0;W=+(-0.0- +g[b+188>>2]);Z=+(-0.0- +g[b+192>>2]);g[Y>>2]=W;g[Y+4>>2]=Z;break a}else{a[b+248|0]=1;C=b+212|0}}while(0);X=A;T=C;Y=c[X+4>>2]|0;c[T>>2]=c[X>>2];c[T+4>>2]=Y;T=b+228|0;Y=c[X+4>>2]|0;c[T>>2]=c[X>>2];c[T+4>>2]=Y;T=b+204|0;Y=b+236|0;X=c[T+4>>2]|0;c[Y>>2]=c[T>>2];c[Y+4>>2]=X}else{if(!D){Y=L>=0.0;a[b+248|0]=Y&1;C=b+212|0;if(Y){y=64;break}else{y=65;break}}C=P>=0.0;if(M){do{if(C){a[b+248|0]=1;C=b+212|0}else{Y=L>=0.0;a[b+248|0]=Y&1;C=b+212|0;if(Y){break}S=C;Y=(g[k>>2]=-0.0-G,c[k>>2]|0);T=0;Z=+F;c[S>>2]=T|Y;g[S+4>>2]=Z;S=A;Y=b+228|0;X=c[S>>2]|0;S=c[S+4>>2]|0;c[Y>>2]=X;c[Y+4>>2]=S;Y=b+236|0;c[Y>>2]=T|(g[k>>2]=-0.0-(c[k>>2]=X,+g[k>>2]),c[k>>2]|0);g[Y+4>>2]=Z;break a}}while(0);X=A;T=C;Y=c[X+4>>2]|0;c[T>>2]=c[X>>2];c[T+4>>2]=Y;T=b+188|0;Y=b+228|0;X=c[T+4>>2]|0;c[Y>>2]=c[T>>2];c[Y+4>>2]=X;Y=b+236|0;W=+(-0.0- +g[z>>2]);Z=+(-0.0- +g[e>>2]);g[Y>>2]=W;g[Y+4>>2]=Z;break}else{do{if(C){Y=L>=0.0;a[b+248|0]=Y&1;C=b+212|0;if(!Y){break}T=A;Y=C;X=c[T>>2]|0;T=c[T+4>>2]|0;c[Y>>2]=X;c[Y+4>>2]=T;Y=b+228|0;c[Y>>2]=X;c[Y+4>>2]=T;Y=b+236|0;W=+(-0.0-(c[k>>2]=X,+g[k>>2]));Z=+F;g[Y>>2]=W;g[Y+4>>2]=Z;break a}else{a[b+248|0]=0;C=b+212|0}}while(0);T=C;Z=+(-0.0-G);W=+F;g[T>>2]=Z;g[T+4>>2]=W;T=A;Y=b+228|0;X=c[T+4>>2]|0;c[Y>>2]=c[T>>2];c[Y+4>>2]=X;Y=b+236|0;W=+(-0.0- +g[b+188>>2]);Z=+(-0.0- +g[b+192>>2]);g[Y>>2]=W;g[Y+4>>2]=Z;break}}}while(0);if((y|0)==64){T=A;Y=C;X=c[T>>2]|0;T=c[T+4>>2]|0;c[Y>>2]=X;c[Y+4>>2]=T;Y=b+228|0;X=(g[k>>2]=-0.0-(c[k>>2]=X,+g[k>>2]),c[k>>2]|0);X=X|0;Z=+F;c[Y>>2]=X;g[Y+4>>2]=Z;Y=b+236|0;c[Y>>2]=X;g[Y+4>>2]=Z}else if((y|0)==65){X=C;W=+(-0.0-G);Z=+F;g[X>>2]=W;g[X+4>>2]=Z;X=A;Y=b+228|0;T=c[X>>2]|0;X=c[X+4>>2]|0;c[Y>>2]=T;c[Y+4>>2]=X;Y=b+236|0;c[Y>>2]=T;c[Y+4>>2]=X}D=h+148|0;S=b+128|0;c[S>>2]=c[D>>2];if((c[D>>2]|0)>0){C=0;do{U=+g[p>>2];W=+g[h+20+(C<<3)>>2];Z=+g[f>>2];V=+g[h+20+(C<<3)+4>>2];Y=b+(C<<3)|0;Q=+(+g[j>>2]+(U*W-Z*V));V=+(W*Z+U*V+ +g[o>>2]);g[Y>>2]=Q;g[Y+4>>2]=V;V=+g[p>>2];Q=+g[h+84+(C<<3)>>2];U=+g[f>>2];Z=+g[h+84+(C<<3)+4>>2];Y=b+64+(C<<3)|0;W=+(V*Q-U*Z);Z=+(Q*U+V*Z);g[Y>>2]=W;g[Y+4>>2]=Z;C=C+1|0;}while((C|0)<(c[D>>2]|0))}D=b+244|0;g[D>>2]=.019999999552965164;C=d+60|0;c[C>>2]=0;M=b+248|0;T=c[S>>2]|0;if((T|0)<=0){i=l;return}G=+g[b+164>>2];I=+g[E>>2];H=+g[b+212>>2];J=+g[b+216>>2];E=0;F=3.4028234663852886e+38;do{K=H*(+g[b+(E<<3)>>2]-G)+J*(+g[b+(E<<3)+4>>2]-I);F=K<F?K:F;E=E+1|0;}while((E|0)<(T|0));if(F>.019999999552965164){i=l;return}hf(B,b);T=c[B>>2]|0;do{if((T|0)==0){y=75}else{G=+g[B+8>>2];if(G>+g[D>>2]){i=l;return}if(!(G>F*.9800000190734863+.0010000000474974513)){y=75;break}E=c[B+4>>2]|0;B=u;X=d+56|0;if((T|0)==1){y=77;break}c[X>>2]=2;Y=c[x+4>>2]|0;c[t>>2]=c[x>>2];c[t+4>>2]=Y;Y=u+8|0;X=Y;a[Y]=0;Y=E&255;a[X+1|0]=Y;a[X+2|0]=0;a[X+3|0]=1;X=v+12|0;t=c[w+4>>2]|0;c[X>>2]=c[w>>2];c[X+4>>2]=t;X=v+20|0;t=X;a[X]=0;a[t+1|0]=Y;a[t+2|0]=0;a[t+3|0]=1;c[r>>2]=E;t=E+1|0;x=(t|0)<(c[S>>2]|0)?t:0;c[r+4>>2]=x;v=b+(E<<3)|0;t=r+8|0;e=c[v>>2]|0;v=c[v+4>>2]|0;c[t>>2]=e;c[t+4>>2]=v;x=b+(x<<3)|0;t=r+16|0;w=c[x>>2]|0;x=c[x+4>>2]|0;c[t>>2]=w;c[t+4>>2]=x;t=b+64+(E<<3)|0;b=r+24|0;u=c[t>>2]|0;t=c[t+4>>2]|0;c[b>>2]=u;c[b+4>>2]=t;b=0}}while(0);if((y|0)==75){B=u;X=d+56|0;y=77}do{if((y|0)==77){c[X>>2]=1;y=c[S>>2]|0;if((y|0)>1){H=+g[b+216>>2];I=+g[b+212>>2];S=0;G=I*+g[b+64>>2]+H*+g[b+68>>2];T=1;while(1){F=I*+g[b+64+(T<<3)>>2]+H*+g[b+64+(T<<3)+4>>2];E=F<G;S=E?T:S;T=T+1|0;if((T|0)<(y|0)){G=E?F:G}else{break}}}else{S=0}E=S+1|0;Y=(E|0)<(y|0)?E:0;T=b+(S<<3)|0;X=c[T+4>>2]|0;c[t>>2]=c[T>>2];c[t+4>>2]=X;X=u+8|0;T=X;a[X]=0;a[T+1|0]=S;a[T+2|0]=1;a[T+3|0]=0;T=b+(Y<<3)|0;X=v+12|0;b=c[T+4>>2]|0;c[X>>2]=c[T>>2];c[X+4>>2]=b;X=v+20|0;b=X;a[X]=0;a[b+1|0]=Y;a[b+2|0]=1;a[b+3|0]=0;b=r|0;if((a[M]|0)==0){c[b>>2]=1;c[r+4>>2]=0;b=r+8|0;E=c[w>>2]|0;v=c[w+4>>2]|0;c[b>>2]=E;c[b+4>>2]=v;b=r+16|0;w=c[x>>2]|0;x=c[x+4>>2]|0;c[b>>2]=w;c[b+4>>2]=x;b=r+24|0;u=(g[k>>2]=-0.0- +g[z>>2],c[k>>2]|0);t=(g[k>>2]=-0.0- +g[e>>2],c[k>>2]|0);c[b>>2]=u;c[b+4>>2]=t;e=E;E=1;b=1;break}else{c[b>>2]=0;c[r+4>>2]=1;t=r+8|0;e=c[x>>2]|0;v=c[x+4>>2]|0;c[t>>2]=e;c[t+4>>2]=v;t=r+16|0;E=c[w>>2]|0;x=c[w+4>>2]|0;c[t>>2]=E;c[t+4>>2]=x;t=A;w=r+24|0;u=c[t>>2]|0;t=c[t+4>>2]|0;c[w>>2]=u;c[w+4>>2]=t;w=E;E=0;b=1;break}}}while(0);O=(c[k>>2]=t,+g[k>>2]);Z=(c[k>>2]=u,+g[k>>2]);P=(c[k>>2]=e,+g[k>>2]);Q=(c[k>>2]=v,+g[k>>2]);U=(c[k>>2]=w,+g[k>>2]);W=(c[k>>2]=x,+g[k>>2]);Y=r+32|0;x=r+24|0;t=r+28|0;w=x|0;Z=-0.0-Z;g[Y>>2]=O;g[r+36>>2]=Z;z=r+44|0;V=-0.0-O;e=z;g[e>>2]=V;c[e+4>>2]=u;e=r+8|0;y=e|0;v=r+12|0;Z=O*P+Q*Z;g[r+40>>2]=Z;A=r+52|0;g[A>>2]=U*V+(c[k>>2]=u,+g[k>>2])*W;u=s|0;s=r|0;if((nf(u,B,Y,Z,E)|0)<2){i=l;return}if((nf(n,u,z,+g[A>>2],c[r+4>>2]|0)|0)<2){i=l;return}r=d+40|0;do{if(b){T=x;S=r;Y=c[T>>2]|0;T=c[T+4>>2]|0;c[S>>2]=Y;c[S+4>>2]=T;S=e;T=d+48|0;X=c[S>>2]|0;S=c[S+4>>2]|0;c[T>>2]=X;c[T+4>>2]=S;G=(c[k>>2]=X,+g[k>>2]);F=(c[k>>2]=Y,+g[k>>2]);H=+g[v>>2];I=+g[t>>2];L=+g[n>>2];K=+g[m+4>>2];J=+g[D>>2];if((L-G)*F+(K-H)*I>J){q=0}else{W=L- +g[j>>2];V=K- +g[o>>2];U=+g[p>>2];J=+g[f>>2];q=d;Z=+(W*U+V*J);J=+(U*V+W*(-0.0-J));g[q>>2]=Z;g[q+4>>2]=J;c[d+16>>2]=c[n+8>>2];q=1;J=+g[D>>2]}K=+g[m+12>>2];L=+g[n+16>>2];if((K-G)*F+(L-H)*I>J){break}V=K- +g[j>>2];U=L- +g[o>>2];Q=+g[p>>2];Z=+g[f>>2];Y=d+(q*20|0)|0;W=+(V*Q+U*Z);Z=+(Q*U+V*(-0.0-Z));g[Y>>2]=W;g[Y+4>>2]=Z;c[d+(q*20|0)+16>>2]=c[m+20>>2];q=q+1|0}else{T=c[s>>2]|0;S=h+84+(T<<3)|0;Y=r;X=c[S+4>>2]|0;c[Y>>2]=c[S>>2];c[Y+4>>2]=X;T=h+20+(T<<3)|0;Y=d+48|0;X=c[T+4>>2]|0;c[Y>>2]=c[T>>2];c[Y+4>>2]=X;F=+g[y>>2];G=+g[w>>2];H=+g[v>>2];I=+g[t>>2];J=+g[D>>2];if((+g[n>>2]-F)*G+(+g[m+4>>2]-H)*I>J){q=0}else{Y=d;T=c[q+4>>2]|0;c[Y>>2]=c[q>>2];c[Y+4>>2]=T;Y=n+8|0;T=Y;X=d+16|0;q=X;a[q+2|0]=a[T+3|0]|0;a[q+3|0]=a[T+2|0]|0;a[X]=a[T+1|0]|0;a[q+1|0]=a[Y]|0;q=1;J=+g[D>>2]}f=m+12|0;if((+g[f>>2]-F)*G+(+g[n+16>>2]-H)*I>J){break}T=f;X=d+(q*20|0)|0;S=c[T+4>>2]|0;c[X>>2]=c[T>>2];c[X+4>>2]=S;X=m+20|0;S=X;T=d+(q*20|0)+16|0;Y=T;a[Y+2|0]=a[S+3|0]|0;a[Y+3|0]=a[S+2|0]|0;a[T]=a[S+1|0]|0;a[Y+1|0]=a[X]|0;q=q+1|0}}while(0);c[C>>2]=q;i=l;return}function hf(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,h=0.0,i=0.0,j=0,k=0.0,l=0.0,m=0.0,n=0,o=0,p=0,q=0,r=0.0,s=0.0,t=0,u=0.0,v=0.0,w=0.0,x=0.0,y=0.0,z=0.0,A=0.0;f=a|0;c[f>>2]=0;e=a+4|0;c[e>>2]=-1;q=a+8|0;g[q>>2]=-3.4028234663852886e+38;i=+g[b+216>>2];h=+g[b+212>>2];a=c[b+128>>2]|0;if((a|0)<=0){return}s=+g[b+164>>2];m=+g[b+168>>2];l=+g[b+172>>2];k=+g[b+176>>2];r=+g[b+244>>2];n=b+228|0;o=b+232|0;p=b+236|0;j=b+240|0;t=0;v=-3.4028234663852886e+38;while(1){u=+g[b+64+(t<<3)>>2];w=-0.0-u;x=-0.0- +g[b+64+(t<<3)+4>>2];A=+g[b+(t<<3)>>2];z=+g[b+(t<<3)+4>>2];y=(A-s)*w+(z-m)*x;z=(A-l)*w+(z-k)*x;y=y<z?y:z;if(y>r){break}if(i*u+h*x<0.0){if((w- +g[n>>2])*h+(x- +g[o>>2])*i>=-.03490658849477768&y>v){d=8}}else{if((w- +g[p>>2])*h+(x- +g[j>>2])*i>=-.03490658849477768&y>v){d=8}}if((d|0)==8){d=0;c[f>>2]=2;c[e>>2]=t;g[q>>2]=y;v=y}t=t+1|0;if((t|0)>=(a|0)){d=10;break}}if((d|0)==10){return}c[f>>2]=2;c[e>>2]=t;g[q>>2]=y;return}function jf(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;var f=0;f=i;i=i+256|0;gf(f|0,a,b,c,d,e);i=f;return}function kf(b,d,e,f,h){b=b|0;d=d|0;e=e|0;f=f|0;h=h|0;var j=0,k=0,l=0,m=0.0,n=0.0,o=0.0,p=0.0,q=0.0,r=0.0,s=0,t=0,u=0,v=0.0,w=0.0,x=0.0,y=0.0,z=0,A=0,B=0,C=0,D=0.0,E=0.0,F=0.0,G=0.0,H=0.0,I=0.0,J=0.0,K=0,L=0.0,M=0,N=0,O=0.0,P=0.0,Q=0.0,S=0.0;j=i;i=i+40|0;z=j|0;C=j+8|0;A=j+16|0;B=A|0;t=i;i=i+8|0;u=i;i=i+24|0;l=i;i=i+24|0;s=i;i=i+8|0;k=b+60|0;c[k>>2]=0;m=+g[d+8>>2]+ +g[f+8>>2];c[z>>2]=0;n=+lf(z,d,e,f,h);if(n>m){i=j;return}c[C>>2]=0;o=+lf(C,f,h,d,e);if(o>m){i=j;return}if(o>n+.0005000000237487257){w=+g[h>>2];v=+g[h+4>>2];x=+g[h+8>>2];y=+g[h+12>>2];r=+g[e>>2];p=+g[e+4>>2];q=+g[e+8>>2];n=+g[e+12>>2];h=c[C>>2]|0;c[b+56>>2]=2;C=f;f=1}else{w=+g[e>>2];v=+g[e+4>>2];x=+g[e+8>>2];y=+g[e+12>>2];r=+g[h>>2];p=+g[h+4>>2];q=+g[h+8>>2];n=+g[h+12>>2];h=c[z>>2]|0;c[b+56>>2]=1;C=d;d=f;f=0}z=A;e=c[d+148>>2]|0;E=+g[C+84+(h<<3)>>2];P=+g[C+84+(h<<3)+4>>2];F=y*E-x*P;P=x*E+y*P;E=n*F+q*P;o=-0.0-q;F=n*P+F*o;if((e|0)>0){M=0;D=3.4028234663852886e+38;N=0;while(1){G=E*+g[d+84+(M<<3)>>2]+F*+g[d+84+(M<<3)+4>>2];K=G<D;N=K?M:N;M=M+1|0;if((M|0)<(e|0)){D=K?G:D}else{break}}}else{N=0}K=N+1|0;M=(K|0)<(e|0)?K:0;O=+g[d+20+(N<<3)>>2];L=+g[d+20+(N<<3)+4>>2];P=+(r+(n*O-q*L));L=+(p+(q*O+n*L));g[B>>2]=P;g[B+4>>2]=L;K=h&255;e=A+8|0;A=e;a[e]=K;a[A+1|0]=N;a[A+2|0]=1;a[A+3|0]=0;L=+g[d+20+(M<<3)>>2];P=+g[d+20+(M<<3)+4>>2];N=z+12|0;O=+(r+(n*L-q*P));P=+(p+(q*L+n*P));g[N>>2]=O;g[N+4>>2]=P;N=z+20|0;A=N;a[N]=K;a[A+1|0]=M;a[A+2|0]=1;a[A+3|0]=0;A=h+1|0;A=(A|0)<(c[C+148>>2]|0)?A:0;N=C+20+(h<<3)|0;H=+g[N>>2];G=+g[N+4>>2];N=C+20+(A<<3)|0;J=+g[N>>2];I=+g[N+4>>2];L=J-H;P=I-G;D=+R(L*L+P*P);if(!(D<1.1920928955078125e-7)){O=1.0/D;L=L*O;P=P*O}O=y*L-x*P;E=y*P+x*L;g[t>>2]=O;g[t+4>>2]=E;D=O*-1.0;S=w+(y*H-x*G);Q=v+(x*H+y*G);u=u|0;F=S*E+Q*D;g[s>>2]=-0.0-O;g[s+4>>2]=-0.0-E;if((nf(u,z,s,m-(S*O+Q*E),h)|0)<2){i=j;return}if((nf(l|0,u,t,m+((w+(y*J-x*I))*O+(v+(x*J+y*I))*E),A)|0)<2){i=j;return}s=b+40|0;w=+P;v=+(L*-1.0);g[s>>2]=w;g[s+4>>2]=v;s=b+48|0;v=+((H+J)*.5);w=+((G+I)*.5);g[s>>2]=v;g[s+4>>2]=w;w=+g[l>>2];v=+g[l+4>>2];s=E*w+D*v-F>m;do{if(f<<24>>24==0){if(s){s=0}else{P=w-r;S=v-p;s=b;Q=+(n*P+q*S);S=+(P*o+n*S);g[s>>2]=Q;g[s+4>>2]=S;c[b+16>>2]=c[l+8>>2];s=1}v=+g[l+12>>2];w=+g[l+16>>2];if(E*v+D*w-F>m){break}P=v-r;S=w-p;N=b+(s*20|0)|0;Q=+(n*P+q*S);S=+(P*o+n*S);g[N>>2]=Q;g[N+4>>2]=S;c[b+(s*20|0)+16>>2]=c[l+20>>2];s=s+1|0}else{if(s){s=0}else{P=w-r;S=v-p;M=b;Q=+(n*P+q*S);S=+(P*o+n*S);g[M>>2]=Q;g[M+4>>2]=S;M=b+16|0;N=c[l+8>>2]|0;c[M>>2]=N;s=M;a[M]=N>>>8;a[s+1|0]=N;a[s+2|0]=N>>>24;a[s+3|0]=N>>>16;s=1}v=+g[l+12>>2];w=+g[l+16>>2];if(E*v+D*w-F>m){break}P=v-r;S=w-p;K=b+(s*20|0)|0;Q=+(n*P+q*S);S=+(P*o+n*S);g[K>>2]=Q;g[K+4>>2]=S;K=b+(s*20|0)+16|0;M=c[l+20>>2]|0;c[K>>2]=M;N=K;a[K]=M>>>8;a[N+1|0]=M;a[N+2|0]=M>>>24;a[N+3|0]=M>>>16;s=s+1|0}}while(0);c[k>>2]=s;i=j;return}function lf(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var h=0,i=0,j=0.0,k=0.0,l=0.0,m=0.0,n=0.0,o=0.0,p=0.0,q=0,r=0.0,s=0.0,t=0.0,u=0.0;h=c[b+148>>2]|0;i=c[e+148>>2]|0;u=+g[f+12>>2];s=+g[d+8>>2];t=+g[f+8>>2];j=+g[d+12>>2];k=u*s-t*j;j=s*t+u*j;s=+g[d>>2]- +g[f>>2];l=+g[d+4>>2]- +g[f+4>>2];m=u*s+t*l;l=s*(-0.0-t)+u*l;if((h|0)<=0){u=-3.4028234663852886e+38;q=0;c[a>>2]=q;return+u}if((i|0)>0){n=-3.4028234663852886e+38;f=0;d=0}else{n=-3.4028234663852886e+38;i=0;d=0;do{b=n<3.4028234663852886e+38;n=b?3.4028234663852886e+38:n;d=b?i:d;i=i+1|0;}while((i|0)<(h|0));c[a>>2]=d;return+n}do{o=+g[b+84+(f<<3)>>2];s=+g[b+84+(f<<3)+4>>2];u=j*o-k*s;s=k*o+j*s;o=+g[b+20+(f<<3)>>2];r=+g[b+20+(f<<3)+4>>2];t=m+(j*o-k*r);r=l+(k*o+j*r);o=3.4028234663852886e+38;q=0;do{p=u*(+g[e+20+(q<<3)>>2]-t)+s*(+g[e+20+(q<<3)+4>>2]-r);o=p<o?p:o;q=q+1|0;}while((q|0)<(i|0));q=o>n;n=q?o:n;d=q?f:d;f=f+1|0;}while((f|0)<(h|0));c[a>>2]=d;return+n}function mf(a,b,d,e,f,h){a=a|0;b=b|0;d=d|0;e=+e;f=f|0;h=+h;var i=0,j=0,k=0.0,l=0.0,m=0,n=0,o=0,p=0,q=0,r=0.0,s=0.0,t=0.0,u=0.0,v=0.0,w=0.0,x=0.0,y=0;i=b+60|0;if((c[i>>2]|0)==0){return}j=c[b+56>>2]|0;if((j|0)==0){i=a|0;g[i>>2]=1.0;j=a+4|0;g[j>>2]=0.0;u=+g[d+12>>2];v=+g[b+48>>2];t=+g[d+8>>2];l=+g[b+52>>2];k=+g[d>>2]+(u*v-t*l);l=v*t+u*l+ +g[d+4>>2];u=+g[f+12>>2];t=+g[b>>2];v=+g[f+8>>2];s=+g[b+4>>2];r=+g[f>>2]+(u*t-v*s);s=t*v+u*s+ +g[f+4>>2];u=k-r;v=l-s;do{if(u*u+v*v>1.4210854715202004e-14){u=r-k;t=s-l;q=a;w=+u;v=+t;g[q>>2]=w;g[q+4>>2]=v;v=+R(u*u+t*t);if(v<1.1920928955078125e-7){break}w=1.0/v;u=u*w;g[i>>2]=u;t=t*w;g[j>>2]=t}else{u=1.0;t=0.0}}while(0);k=k+u*e;w=l+t*e;r=r-u*h;v=s-t*h;q=a+8|0;l=+((k+r)*.5);s=+((w+v)*.5);g[q>>2]=l;g[q+4>>2]=s;g[a+24>>2]=u*(r-k)+t*(v-w);return}else if((j|0)==1){p=d+12|0;u=+g[p>>2];v=+g[b+40>>2];q=d+8|0;w=+g[q>>2];r=+g[b+44>>2];s=u*v-w*r;r=v*w+u*r;o=a;u=+s;w=+r;g[o>>2]=u;g[o+4>>2]=w;w=+g[p>>2];u=+g[b+48>>2];v=+g[q>>2];l=+g[b+52>>2];k=+g[d>>2]+(w*u-v*l);l=u*v+w*l+ +g[d+4>>2];if((c[i>>2]|0)<=0){return}j=f+12|0;m=f+8|0;n=f|0;f=f+4|0;d=a|0;o=a+4|0;p=0;while(1){w=+g[j>>2];x=+g[b+(p*20|0)>>2];u=+g[m>>2];v=+g[b+(p*20|0)+4>>2];t=+g[n>>2]+(w*x-u*v);v=x*u+w*v+ +g[f>>2];w=e-(s*(t-k)+(v-l)*r);u=t+s*w;w=v+r*w;t=t-s*h;v=v-r*h;q=a+8+(p<<3)|0;r=+((t+u)*.5);s=+((v+w)*.5);g[q>>2]=r;g[q+4>>2]=s;g[a+24+(p<<2)>>2]=+g[d>>2]*(t-u)+ +g[o>>2]*(v-w);p=p+1|0;if((p|0)>=(c[i>>2]|0)){break}s=+g[d>>2];r=+g[o>>2]}return}else if((j|0)==2){p=f+12|0;v=+g[p>>2];w=+g[b+40>>2];q=f+8|0;x=+g[q>>2];r=+g[b+44>>2];s=v*w-x*r;r=w*x+v*r;j=a;v=+s;x=+r;g[j>>2]=v;g[j+4>>2]=x;x=+g[p>>2];v=+g[b+48>>2];w=+g[q>>2];l=+g[b+52>>2];k=+g[f>>2]+(x*v-w*l);l=v*w+x*l+ +g[f+4>>2];if((c[i>>2]|0)>0){f=d+12|0;m=d+8|0;n=d|0;o=d+4|0;p=a|0;d=a+4|0;q=0;do{x=+g[f>>2];t=+g[b+(q*20|0)>>2];w=+g[m>>2];u=+g[b+(q*20|0)+4>>2];v=+g[n>>2]+(x*t-w*u);u=t*w+x*u+ +g[o>>2];x=h-(s*(v-k)+(u-l)*r);w=v+s*x;x=u+r*x;v=v-s*e;s=u-r*e;y=a+8+(q<<3)|0;u=+((v+w)*.5);r=+((s+x)*.5);g[y>>2]=u;g[y+4>>2]=r;g[a+24+(q<<2)>>2]=+g[p>>2]*(v-w)+ +g[d>>2]*(s-x);q=q+1|0;s=+g[p>>2];r=+g[d>>2]}while((q|0)<(c[i>>2]|0))}w=+(-0.0-s);x=+(-0.0-r);g[j>>2]=w;g[j+4>>2]=x;return}else{return}}function nf(b,d,e,f,h){b=b|0;d=d|0;e=e|0;f=+f;h=h|0;var i=0,j=0,k=0,l=0.0,m=0,n=0,o=0.0,p=0.0,q=0;p=+g[e>>2];i=d|0;o=+g[e+4>>2];e=d+4|0;l=p*+g[i>>2]+o*+g[e>>2]-f;m=d+12|0;j=m|0;k=d+16|0;f=p*+g[j>>2]+o*+g[k>>2]-f;if(l>0.0){n=0}else{n=b;q=d;c[n>>2]=c[q>>2];c[n+4>>2]=c[q+4>>2];c[n+8>>2]=c[q+8>>2];n=1}if(!(f>0.0)){q=b+(n*12|0)|0;c[q>>2]=c[m>>2];c[q+4>>2]=c[m+4>>2];c[q+8>>2]=c[m+8>>2];n=n+1|0}if(!(l*f<0.0)){q=n;return q|0}f=l/(l-f);o=+g[i>>2];p=+g[e>>2];m=b+(n*12|0)|0;o=+(o+f*(+g[j>>2]-o));p=+(p+f*(+g[k>>2]-p));g[m>>2]=o;g[m+4>>2]=p;m=b+(n*12|0)+8|0;q=m;a[m]=h;a[q+1|0]=a[d+9|0]|0;a[q+2|0]=0;a[q+3|0]=1;q=n+1|0;return q|0}function of(d,e,f,h,j,k){d=d|0;e=e|0;f=f|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0;m=i;i=i+136|0;n=m|0;o=m+96|0;l=m+112|0;c[n+16>>2]=0;c[n+20>>2]=0;g[n+24>>2]=0.0;c[n+44>>2]=0;c[n+48>>2]=0;g[n+52>>2]=0.0;ee(n|0,d,e);ee(n+28|0,f,h);d=n+56|0;e=j;c[d>>2]=c[e>>2];c[d+4>>2]=c[e+4>>2];c[d+8>>2]=c[e+8>>2];c[d+12>>2]=c[e+12>>2];d=n+72|0;e=k;c[d>>2]=c[e>>2];c[d+4>>2]=c[e+4>>2];c[d+8>>2]=c[e+8>>2];c[d+12>>2]=c[e+12>>2];a[n+88|0]=1;b[o+4>>1]=0;ge(l,o,n);i=m;return+g[l+16>>2]<11920928955078125.0e-22|0}function pf(a,b,d,e,f,g){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,i=0;h=a+40|0;c[h>>2]=b;c[a+44>>2]=d;c[a+48>>2]=e;c[a+28>>2]=0;c[a+36>>2]=0;c[a+32>>2]=0;i=a|0;c[i>>2]=f;c[a+4>>2]=g;c[a+8>>2]=Gm(f,b<<2)|0;c[a+12>>2]=Gm(c[i>>2]|0,d<<2)|0;c[a+16>>2]=Gm(c[i>>2]|0,e<<2)|0;c[a+24>>2]=Gm(c[i>>2]|0,(c[h>>2]|0)*12|0)|0;c[a+20>>2]=Gm(c[i>>2]|0,(c[h>>2]|0)*12|0)|0;return}function qf(a){a=a|0;var b=0;b=a|0;Im(c[b>>2]|0,c[a+20>>2]|0);Im(c[b>>2]|0,c[a+24>>2]|0);Im(c[b>>2]|0,c[a+16>>2]|0);Im(c[b>>2]|0,c[a+12>>2]|0);Im(c[b>>2]|0,c[a+8>>2]|0);return}function rf(d,e,f,h,j){d=d|0;e=e|0;f=f|0;h=h|0;j=j|0;var l=0,m=0,n=0,o=0.0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0.0,y=0,z=0.0,A=0.0,B=0.0,C=0.0,D=0,E=0,F=0.0,G=0,H=0.0,I=0,J=0.0;m=i;i=i+176|0;p=m|0;q=m+24|0;r=m+32|0;v=m+72|0;l=m+120|0;sm(q);o=+g[f>>2];n=d+28|0;if((c[n>>2]|0)>0){s=d+8|0;t=h|0;w=h+4|0;h=d+20|0;u=d+24|0;E=0;do{G=c[(c[s>>2]|0)+(E<<2)>>2]|0;y=G+60|0;D=c[y>>2]|0;y=c[y+4>>2]|0;x=+g[G+72>>2];I=G+80|0;B=+g[I>>2];A=+g[I+4>>2];z=+g[G+88>>2];I=G+52|0;c[I>>2]=D;c[I+4>>2]=y;g[G+68>>2]=x;if((c[G>>2]|0)==2){C=+g[G+156>>2];F=+g[G+136>>2];H=1.0/(o*+g[G+148>>2]+1.0);z=(z+o*+g[G+144>>2]*+g[G+100>>2])*(1.0/(o*+g[G+152>>2]+1.0));B=(B+o*(C*+g[t>>2]+F*+g[G+92>>2]))*H;A=(A+o*(C*+g[w>>2]+F*+g[G+96>>2]))*H}I=(c[h>>2]|0)+(E*12|0)|0;c[I>>2]=D;c[I+4>>2]=y;g[(c[h>>2]|0)+(E*12|0)+8>>2]=x;I=(c[u>>2]|0)+(E*12|0)|0;F=+B;H=+A;g[I>>2]=F;g[I+4>>2]=H;g[(c[u>>2]|0)+(E*12|0)+8>>2]=z;E=E+1|0;}while((E|0)<(c[n>>2]|0))}else{h=d+20|0;u=d+24|0}tm(q);G=r;t=f;c[G>>2]=c[t>>2];c[G+4>>2]=c[t+4>>2];c[G+8>>2]=c[t+8>>2];c[G+12>>2]=c[t+12>>2];c[G+16>>2]=c[t+16>>2];c[G+20>>2]=c[t+20>>2];c[G+24>>2]=c[t+24>>2];G=c[h>>2]|0;c[r+28>>2]=G;I=c[u>>2]|0;c[r+32>>2]=I;s=v;c[s>>2]=c[t>>2];c[s+4>>2]=c[t+4>>2];c[s+8>>2]=c[t+8>>2];c[s+12>>2]=c[t+12>>2];c[s+16>>2]=c[t+16>>2];c[s+20>>2]=c[t+20>>2];c[s+24>>2]=c[t+24>>2];s=d+12|0;c[v+28>>2]=c[s>>2];t=d+36|0;c[v+32>>2]=c[t>>2];c[v+36>>2]=G;c[v+40>>2]=I;c[v+44>>2]=c[d>>2];Ni(l,v);Pi(l);if((a[f+24|0]|0)!=0){Qi(l)}v=d+32|0;if((c[v>>2]|0)>0){w=d+16|0;y=0;do{I=c[(c[w>>2]|0)+(y<<2)>>2]|0;ub[c[(c[I>>2]|0)+32>>2]&255](I,r);y=y+1|0;}while((y|0)<(c[v>>2]|0))}g[e+12>>2]=+um(q);tm(q);w=f+12|0;if((c[w>>2]|0)>0){y=d+16|0;E=0;do{if((c[v>>2]|0)>0){D=0;do{I=c[(c[y>>2]|0)+(D<<2)>>2]|0;ub[c[(c[I>>2]|0)+36>>2]&255](I,r);D=D+1|0;}while((D|0)<(c[v>>2]|0))}Ri(l);E=E+1|0;}while((E|0)<(c[w>>2]|0))}Si(l);g[e+16>>2]=+um(q);if((c[n>>2]|0)>0){w=0;D=c[u>>2]|0;do{I=c[h>>2]|0;y=I+(w*12|0)|0;z=+g[y>>2];x=+g[y+4>>2];A=+g[I+(w*12|0)+8>>2];I=D+(w*12|0)|0;C=+g[I>>2];F=+g[I+4>>2];B=+g[D+(w*12|0)+8>>2];J=o*C;H=o*F;H=J*J+H*H;if(H>4.0){J=2.0/+R(H);C=C*J;F=F*J}H=o*B;if(H*H>2.4674012660980225){if(!(H>0.0)){H=-0.0-H}B=B*(1.5707963705062866/H)}J=+(z+o*C);H=+(x+o*F);g[y>>2]=J;g[y+4>>2]=H;g[(c[h>>2]|0)+(w*12|0)+8>>2]=A+o*B;D=(c[u>>2]|0)+(w*12|0)|0;H=+C;J=+F;g[D>>2]=H;g[D+4>>2]=J;D=c[u>>2]|0;g[D+(w*12|0)+8>>2]=B;w=w+1|0;}while((w|0)<(c[n>>2]|0))}tm(q);w=f+16|0;y=d+16|0;f=0;while(1){if((f|0)>=(c[w>>2]|0)){r=1;break}D=Ti(l)|0;if((c[v>>2]|0)>0){G=1;E=0;do{I=c[(c[y>>2]|0)+(E<<2)>>2]|0;G=G&(Cb[c[(c[I>>2]|0)+40>>2]&63](I,r)|0);E=E+1|0;}while((E|0)<(c[v>>2]|0))}else{G=1}if(D&G){r=0;break}else{f=f+1|0}}if((c[n>>2]|0)>0){v=d+8|0;f=0;do{I=c[(c[v>>2]|0)+(f<<2)>>2]|0;G=(c[h>>2]|0)+(f*12|0)|0;w=I+60|0;E=c[G>>2]|0;G=c[G+4>>2]|0;c[w>>2]=E;c[w+4>>2]=G;F=+g[(c[h>>2]|0)+(f*12|0)+8>>2];g[I+72>>2]=F;w=(c[u>>2]|0)+(f*12|0)|0;D=I+80|0;y=c[w+4>>2]|0;c[D>>2]=c[w>>2];c[D+4>>2]=y;g[I+88>>2]=+g[(c[u>>2]|0)+(f*12|0)+8>>2];B=+U(F);g[I+20>>2]=B;F=+T(F);g[I+24>>2]=F;C=+g[I+44>>2];J=+g[I+48>>2];H=(c[k>>2]=E,+g[k>>2])-(F*C-B*J);J=(c[k>>2]=G,+g[k>>2])-(B*C+F*J);I=I+12|0;H=+H;J=+J;g[I>>2]=H;g[I+4>>2]=J;f=f+1|0;}while((f|0)<(c[n>>2]|0))}g[e+20>>2]=+um(q);u=c[l+44>>2]|0;h=d+4|0;do{if((c[h>>2]|0)!=0){if((c[t>>2]|0)<=0){break}e=p+16|0;w=0;do{f=c[(c[s>>2]|0)+(w<<2)>>2]|0;q=c[u+(w*156|0)+148>>2]|0;c[e>>2]=q;if((q|0)>0){v=0;do{g[p+(v<<2)>>2]=+g[u+(w*156|0)+(v*36|0)+16>>2];g[p+8+(v<<2)>>2]=+g[u+(w*156|0)+(v*36|0)+20>>2];v=v+1|0;}while((v|0)<(q|0))}I=c[h>>2]|0;xb[c[(c[I>>2]|0)+36>>2]&31](I,f,p);w=w+1|0;}while((w|0)<(c[t>>2]|0))}}while(0);if(!j){Oi(l);i=m;return}j=c[n>>2]|0;p=(j|0)>0;if(p){e=c[d+8>>2]|0;x=3.4028234663852886e+38;q=0;do{s=c[e+(q<<2)>>2]|0;a:do{if((c[s>>2]|0)!=0){do{if(!((b[s+4>>1]&4)==0)){J=+g[s+88>>2];if(J*J>.001218469929881394){break}H=+g[s+80>>2];J=+g[s+84>>2];if(H*H+J*J>9999999747378752.0e-20){break}I=s+160|0;z=o+ +g[I>>2];g[I>>2]=z;x=x<z?x:z;break a}}while(0);g[s+160>>2]=0.0;x=0.0}}while(0);q=q+1|0;}while((q|0)<(j|0))}else{x=3.4028234663852886e+38}if(x<.5|r|p^1){Oi(l);i=m;return}d=d+8|0;p=0;do{I=c[(c[d>>2]|0)+(p<<2)>>2]|0;G=I+4|0;b[G>>1]=b[G>>1]&-3;g[I+160>>2]=0.0;en(I+80|0,0,24)|0;p=p+1|0;}while((p|0)<(c[n>>2]|0));Oi(l);i=m;return}function sf(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,h=0,j=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0.0,s=0.0,t=0.0,u=0.0,v=0.0,w=0.0,x=0.0,y=0.0,z=0,A=0,B=0,C=0,D=0.0;f=i;i=i+128|0;h=f|0;q=f+24|0;j=f+72|0;n=a+28|0;if((c[n>>2]|0)>0){p=a+8|0;o=a+20|0;m=a+24|0;z=0;while(1){A=c[(c[p>>2]|0)+(z<<2)>>2]|0;B=A+60|0;C=(c[o>>2]|0)+(z*12|0)|0;l=c[B+4>>2]|0;c[C>>2]=c[B>>2];c[C+4>>2]=l;g[(c[o>>2]|0)+(z*12|0)+8>>2]=+g[A+72>>2];C=A+80|0;l=(c[m>>2]|0)+(z*12|0)|0;B=c[C+4>>2]|0;c[l>>2]=c[C>>2];c[l+4>>2]=B;l=c[m>>2]|0;g[l+(z*12|0)+8>>2]=+g[A+88>>2];z=z+1|0;if((z|0)>=(c[n>>2]|0)){z=l;break}}}else{z=c[a+24>>2]|0;o=a+20|0}m=a+12|0;c[q+28>>2]=c[m>>2];l=a+36|0;c[q+32>>2]=c[l>>2];c[q+44>>2]=c[a>>2];p=q;C=b;c[p>>2]=c[C>>2];c[p+4>>2]=c[C+4>>2];c[p+8>>2]=c[C+8>>2];c[p+12>>2]=c[C+12>>2];c[p+16>>2]=c[C+16>>2];c[p+20>>2]=c[C+20>>2];c[p+24>>2]=c[C+24>>2];c[q+36>>2]=c[o>>2];p=a+24|0;c[q+40>>2]=z;Ni(j,q);z=b+16|0;q=0;while(1){if((q|0)>=(c[z>>2]|0)){break}if(Vi(j,d,e)|0){break}else{q=q+1|0}}q=a+8|0;B=(c[o>>2]|0)+(d*12|0)|0;A=(c[(c[q>>2]|0)+(d<<2)>>2]|0)+52|0;C=c[B+4>>2]|0;c[A>>2]=c[B>>2];c[A+4>>2]=C;A=c[o>>2]|0;C=c[q>>2]|0;g[(c[C+(d<<2)>>2]|0)+68>>2]=+g[A+(d*12|0)+8>>2];A=A+(e*12|0)|0;C=(c[C+(e<<2)>>2]|0)+52|0;B=c[A+4>>2]|0;c[C>>2]=c[A>>2];c[C+4>>2]=B;g[(c[(c[q>>2]|0)+(e<<2)>>2]|0)+68>>2]=+g[(c[o>>2]|0)+(e*12|0)+8>>2];Pi(j);e=b+12|0;if((c[e>>2]|0)>0){d=0;do{Ri(j);d=d+1|0;}while((d|0)<(c[e>>2]|0))}r=+g[b>>2];if((c[n>>2]|0)>0){b=0;do{C=c[o>>2]|0;d=C+(b*12|0)|0;t=+g[d>>2];s=+g[d+4>>2];u=+g[C+(b*12|0)+8>>2];C=c[p>>2]|0;B=C+(b*12|0)|0;w=+g[B>>2];x=+g[B+4>>2];v=+g[C+(b*12|0)+8>>2];D=r*w;y=r*x;y=D*D+y*y;if(y>4.0){D=2.0/+R(y);w=w*D;x=x*D}y=r*v;if(y*y>2.4674012660980225){if(!(y>0.0)){y=-0.0-y}v=v*(1.5707963705062866/y)}y=t+r*w;t=s+r*x;D=u+r*v;z=(g[k>>2]=y,c[k>>2]|0);z=z|0;u=+t;c[d>>2]=z;g[d+4>>2]=u;g[(c[o>>2]|0)+(b*12|0)+8>>2]=D;C=(c[p>>2]|0)+(b*12|0)|0;A=(g[k>>2]=w,c[k>>2]|0);A=A|0;x=+x;c[C>>2]=A;g[C+4>>2]=x;g[(c[p>>2]|0)+(b*12|0)+8>>2]=v;C=c[(c[q>>2]|0)+(b<<2)>>2]|0;B=C+60|0;c[B>>2]=z;g[B+4>>2]=u;g[C+72>>2]=D;B=C+80|0;c[B>>2]=A;g[B+4>>2]=x;g[C+88>>2]=v;v=+U(D);g[C+20>>2]=v;x=+T(D);g[C+24>>2]=x;w=+g[C+44>>2];D=+g[C+48>>2];C=C+12|0;y=+(y-(x*w-v*D));D=+(t-(v*w+x*D));g[C>>2]=y;g[C+4>>2]=D;b=b+1|0;}while((b|0)<(c[n>>2]|0))}n=c[j+44>>2]|0;a=a+4|0;if((c[a>>2]|0)==0){Oi(j);i=f;return}if((c[l>>2]|0)<=0){Oi(j);i=f;return}o=h+16|0;p=0;do{q=c[(c[m>>2]|0)+(p<<2)>>2]|0;b=c[n+(p*156|0)+148>>2]|0;c[o>>2]=b;if((b|0)>0){d=0;do{g[h+(d<<2)>>2]=+g[n+(p*156|0)+(d*36|0)+16>>2];g[h+8+(d<<2)>>2]=+g[n+(p*156|0)+(d*36|0)+20>>2];d=d+1|0;}while((d|0)<(b|0))}C=c[a>>2]|0;xb[c[(c[C>>2]|0)+36>>2]&31](C,q,h);p=p+1|0;}while((p|0)<(c[l>>2]|0));Oi(j);i=f;return}function tf(a,c,d){a=a|0;c=c|0;d=d|0;a=b[c+36>>1]|0;if(!(a<<16>>16!=(b[d+36>>1]|0)|a<<16>>16==0)){a=a<<16>>16>0;return a|0}if((b[d+32>>1]&b[c+34>>1])<<16>>16==0){a=0;return a|0}a=(b[d+34>>1]&b[c+32>>1])<<16>>16!=0;return a|0}function uf(a){a=a|0;return}function vf(a){a=a|0;$m(a);return}function wf(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;return 1}function xf(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;return 1}function yf(a,b){a=a|0;b=b|0;var d=0,e=0.0,f=0.0,h=0.0,i=0.0,j=0.0,l=0,m=0;yh(a|0,b|0);c[a>>2]=5688;l=b+20|0;d=a+76|0;m=c[l>>2]|0;l=c[l+4>>2]|0;c[d>>2]=m;c[d+4>>2]=l;d=c[a+52>>2]|0;h=(c[k>>2]=m,+g[k>>2])- +g[d+12>>2];i=(c[k>>2]=l,+g[k>>2])- +g[d+16>>2];j=+g[d+24>>2];e=+g[d+20>>2];d=a+68|0;f=+(h*j+i*e);e=+(j*i+h*(-0.0-e));g[d>>2]=f;g[d+4>>2]=e;g[a+104>>2]=+g[b+28>>2];g[a+96>>2]=0.0;g[a+100>>2]=0.0;g[a+84>>2]=+g[b+32>>2];g[a+88>>2]=+g[b+36>>2];g[a+92>>2]=0.0;g[a+108>>2]=0.0;return}function zf(a,d){a=a|0;d=d|0;var e=0,f=0,h=0;e=c[a+52>>2]|0;f=e+4|0;h=b[f>>1]|0;if((h&2)==0){b[f>>1]=h|2;g[e+160>>2]=0.0}f=d;a=a+76|0;h=c[f+4>>2]|0;c[a>>2]=c[f>>2];c[a+4>>2]=h;return}function Af(b,d){b=b|0;d=d|0;var e=0,f=0,h=0,i=0.0,j=0.0,l=0.0,m=0.0,n=0.0,o=0.0,p=0.0,q=0.0,r=0.0,s=0.0,t=0.0,u=0.0,v=0.0,w=0.0,x=0,y=0,z=0,A=0,B=0;z=c[b+52>>2]|0;f=c[z+8>>2]|0;h=b+116|0;c[h>>2]=f;x=z+44|0;e=b+128|0;y=c[x>>2]|0;x=c[x+4>>2]|0;c[e>>2]=y;c[e+4>>2]=x;j=+g[z+136>>2];g[b+136>>2]=j;i=+g[z+144>>2];g[b+140>>2]=i;e=c[d+28>>2]|0;A=e+(f*12|0)|0;o=+g[A>>2];p=+g[A+4>>2];s=+g[e+(f*12|0)+8>>2];e=d+32|0;A=c[e>>2]|0;B=A+(f*12|0)|0;m=+g[B>>2];l=+g[B+4>>2];n=+g[A+(f*12|0)+8>>2];u=+U(s);s=+T(s);t=+g[z+132>>2];v=+g[b+84>>2]*6.2831854820251465;r=+g[d>>2];q=r*t*v*v;t=r*(v*t*2.0*+g[b+88>>2]+q);v=(c[k>>2]=y,+g[k>>2]);r=(c[k>>2]=x,+g[k>>2]);if(t!=0.0){t=1.0/t}g[b+108>>2]=t;q=q*t;g[b+92>>2]=q;w=+g[b+68>>2]-v;v=+g[b+72>>2]-r;r=s*w-u*v;s=u*w+s*v;B=b+120|0;v=+r;u=+s;g[B>>2]=v;g[B+4>>2]=u;u=t+(j+s*i*s);v=s*r*(-0.0-i);t=t+(j+r*i*r);w=u*t-v*v;if(w!=0.0){w=1.0/w}v=v*(-0.0-w);g[b+144>>2]=t*w;g[b+148>>2]=v;g[b+152>>2]=v;g[b+156>>2]=u*w;x=b+160|0;v=o+r- +g[b+76>>2];w=p+s- +g[b+80>>2];B=x;t=+v;u=+w;g[B>>2]=t;g[B+4>>2]=u;g[x>>2]=q*v;g[b+164>>2]=q*w;n=n*.9800000190734863;x=b+96|0;if((a[d+24|0]|0)==0){g[x>>2]=0.0;g[b+100>>2]=0.0;w=n;u=m;v=l;B=c[e>>2]|0;B=B+(f*12|0)|0;y=(g[k>>2]=u,c[k>>2]|0);z=(g[k>>2]=v,c[k>>2]|0);x=0;A=0;y=x|y;A=z|A;z=B|0;c[z>>2]=y;B=B+4|0;c[B>>2]=A;B=c[h>>2]|0;A=c[e>>2]|0;B=A+(B*12|0)+8|0;g[B>>2]=w;return}else{v=+g[d+8>>2];B=x|0;u=v*+g[B>>2];g[B>>2]=u;B=b+100|0;v=v*+g[B>>2];g[B>>2]=v;w=n+i*(v*r-u*s);u=m+j*u;v=l+v*j;B=c[e>>2]|0;B=B+(f*12|0)|0;y=(g[k>>2]=u,c[k>>2]|0);z=(g[k>>2]=v,c[k>>2]|0);x=0;A=0;y=x|y;A=z|A;z=B|0;c[z>>2]=y;B=B+4|0;c[B>>2]=A;B=c[h>>2]|0;A=c[e>>2]|0;B=A+(B*12|0)+8|0;g[B>>2]=w;return}}function Bf(a,b){a=a|0;b=b|0;var d=0.0,e=0,f=0,h=0.0,i=0.0,j=0.0,k=0.0,l=0.0,m=0.0,n=0,o=0.0,p=0,q=0,r=0.0,s=0.0,t=0.0,u=0.0,v=0;n=a+116|0;v=c[n>>2]|0;e=b+32|0;q=c[e>>2]|0;f=q+(v*12|0)|0;i=+g[f>>2];h=+g[f+4>>2];l=+g[q+(v*12|0)+8>>2];j=+g[a+124>>2];k=+g[a+120>>2];r=+g[a+108>>2];v=a+96|0;q=v|0;u=+g[q>>2];p=a+100|0;o=+g[p>>2];s=-0.0-(i+j*(-0.0-l)+ +g[a+160>>2]+r*u);r=-0.0-(h+l*k+ +g[a+164>>2]+r*o);t=+g[a+148>>2]*s+ +g[a+156>>2]*r;d=+g[v>>2];m=+g[v+4>>2];r=u+(+g[a+144>>2]*s+ +g[a+152>>2]*r);g[q>>2]=r;o=t+o;g[p>>2]=o;t=+g[b>>2]*+g[a+104>>2];s=o*o+r*r;if(s>t*t){u=t/+R(s);r=r*u;g[q>>2]=r;o=u*o;g[p>>2]=o}s=r-d;r=o-m;t=+g[a+136>>2];u=l+ +g[a+140>>2]*(r*k-s*j);s=+(i+s*t);t=+(h+r*t);g[f>>2]=s;g[f+4>>2]=t;g[(c[e>>2]|0)+((c[n>>2]|0)*12|0)+8>>2]=u;return}function Cf(a,b){a=a|0;b=b|0;return 1}function Df(a,b){a=a|0;b=b|0;var d=0;d=b+76|0;b=a;a=c[d+4>>2]|0;c[b>>2]=c[d>>2];c[b+4>>2]=a;return}function Ef(a,b){a=a|0;b=b|0;var d=0.0,e=0.0,f=0.0,h=0.0,i=0.0,j=0;j=c[b+52>>2]|0;i=+g[j+24>>2];h=+g[b+68>>2];f=+g[j+20>>2];e=+g[b+72>>2];d=h*f+i*e+ +g[j+16>>2];g[a>>2]=+g[j+12>>2]+(i*h-f*e);g[a+4>>2]=d;return}function Ff(a,b,c){a=a|0;b=b|0;c=+c;var d=0.0;d=+g[b+100>>2]*c;g[a>>2]=+g[b+96>>2]*c;g[a+4>>2]=d;return}function Gf(a,b){a=a|0;b=+b;return+(b*0.0)}function Hf(a,b){a=a|0;b=b|0;var c=0;c=a+76|0;g[c>>2]=+g[c>>2]- +g[b>>2];a=a+80|0;g[a>>2]=+g[a>>2]- +g[b+4>>2];return}function If(a){a=a|0;var b=0;a=i;zm(4312,(b=i,i=i+1|0,i=i+7&-8,c[b>>2]=0,b)|0);i=b;i=a;return}function Jf(a){a=a|0;return}function Kf(a){a=a|0;$m(a);return}function Lf(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0.0,h=0.0,i=0.0,j=0.0,k=0.0;c[a+8>>2]=b;c[a+12>>2]=d;e=d+12|0;i=+g[e>>2];i=i- +g[b+12>>2];j=+g[e+4>>2]- +g[b+16>>2];k=+g[b+24>>2];f=+g[b+20>>2];e=a+20|0;h=+(i*k+j*f);f=+(k*j+i*(-0.0-f));g[e>>2]=h;g[e+4>>2]=f;g[a+28>>2]=+g[d+72>>2]- +g[b+72>>2];return}function Mf(a,b){a=a|0;b=b|0;var d=0,e=0,f=0;yh(a|0,b|0);c[a>>2]=5752;f=b+20|0;d=a+68|0;e=c[f+4>>2]|0;c[d>>2]=c[f>>2];c[d+4>>2]=e;g[a+76>>2]=+g[b+28>>2];g[a+80>>2]=0.0;g[a+84>>2]=0.0;g[a+88>>2]=0.0;g[a+92>>2]=+g[b+32>>2];g[a+96>>2]=+g[b+36>>2];g[a+100>>2]=+g[b+40>>2];return}function Nf(b,d){b=b|0;d=d|0;var e=0.0,f=0.0,h=0.0,i=0.0,j=0.0,l=0.0,m=0,n=0,o=0,p=0,q=0.0,r=0.0,s=0.0,t=0.0,u=0.0,v=0.0,w=0.0,x=0.0,y=0.0,z=0.0,A=0.0,B=0.0,C=0.0,D=0.0,E=0.0,F=0.0,G=0.0,H=0.0,I=0.0,J=0.0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0;m=c[b+48>>2]|0;n=c[m+8>>2]|0;o=b+104|0;c[o>>2]=n;Q=c[b+52>>2]|0;O=c[Q+8>>2]|0;p=b+108|0;c[p>>2]=O;M=m+44|0;K=b+128|0;N=c[M>>2]|0;M=c[M+4>>2]|0;c[K>>2]=N;c[K+4>>2]=M;K=Q+44|0;P=b+136|0;L=c[K>>2]|0;K=c[K+4>>2]|0;c[P>>2]=L;c[P+4>>2]=K;e=+g[m+136>>2];g[b+156>>2]=e;w=+g[Q+136>>2];g[b+160>>2]=w;q=+g[m+144>>2];g[b+164>>2]=q;t=+g[Q+144>>2];g[b+168>>2]=t;Q=c[d+28>>2]|0;m=Q+(n*12|0)|0;y=+g[m>>2];B=+g[m+4>>2];D=+g[Q+(n*12|0)+8>>2];m=d+32|0;P=c[m>>2]|0;R=P+(n*12|0)|0;j=+g[R>>2];l=+g[R+4>>2];x=+g[P+(n*12|0)+8>>2];R=Q+(O*12|0)|0;F=+g[R>>2];A=+g[R+4>>2];C=+g[Q+(O*12|0)+8>>2];Q=P+(O*12|0)|0;h=+g[Q>>2];i=+g[Q+4>>2];f=+g[P+(O*12|0)+8>>2];z=+U(D);E=+T(D);G=+U(C);H=+T(C);v=-0.0-(c[k>>2]=N,+g[k>>2]);s=-0.0-(c[k>>2]=M,+g[k>>2]);r=E*v-z*s;s=z*v+E*s;M=b+112|0;v=+r;J=+s;g[M>>2]=v;g[M+4>>2]=J;J=-0.0-(c[k>>2]=L,+g[k>>2]);v=-0.0-(c[k>>2]=K,+g[k>>2]);u=H*J-G*v;v=G*J+H*v;K=b+120|0;H=+u;J=+v;g[K>>2]=H;g[K+4>>2]=J;J=e+w;H=J+s*q*s+v*t*v;G=t*u;I=s*r*(-0.0-q)-v*G;G=J+r*q*r+u*G;J=H*G-I*I;if(J!=0.0){J=1.0/J}I=I*(-0.0-J);g[b+172>>2]=G*J;g[b+176>>2]=I;g[b+180>>2]=I;g[b+184>>2]=H*J;G=q+t;if(G>0.0){G=1.0/G}g[b+188>>2]=G;H=+g[b+68>>2];J=+g[b+72>>2];K=b+144|0;I=+(F+u-y-r-(E*H-z*J));J=+(A+v-B-s-(z*H+E*J));g[K>>2]=I;g[K+4>>2]=J;g[b+152>>2]=C-D- +g[b+76>>2];K=b+80|0;if((a[d+24|0]|0)==0){g[K>>2]=0.0;g[b+84>>2]=0.0;g[b+88>>2]=0.0;G=x;J=f;H=h;I=i;E=j;F=l;R=c[m>>2]|0;R=R+(n*12|0)|0;N=(g[k>>2]=E,c[k>>2]|0);P=(g[k>>2]=F,c[k>>2]|0);Q=0;O=0;N=Q|N;O=P|O;P=R|0;c[P>>2]=N;R=R+4|0;c[R>>2]=O;R=c[o>>2]|0;O=c[m>>2]|0;R=O+(R*12|0)+8|0;g[R>>2]=G;R=c[p>>2]|0;R=O+(R*12|0)|0;O=(g[k>>2]=H,c[k>>2]|0);P=(g[k>>2]=I,c[k>>2]|0);N=0;Q=0;O=N|O;Q=P|Q;P=R|0;c[P>>2]=O;R=R+4|0;c[R>>2]=Q;R=c[p>>2]|0;Q=c[m>>2]|0;R=Q+(R*12|0)+8|0;g[R>>2]=J;return}else{N=d+8|0;F=+g[N>>2];R=K|0;E=F*+g[R>>2];g[R>>2]=E;R=b+84|0;F=F*+g[R>>2];g[R>>2]=F;R=b+88|0;J=+g[N>>2]*+g[R>>2];g[R>>2]=J;G=x-q*(J+(F*r-E*s));J=f+t*(J+(F*u-E*v));H=h+w*E;I=i+w*F;E=j-e*E;F=l-e*F;R=c[m>>2]|0;R=R+(n*12|0)|0;N=(g[k>>2]=E,c[k>>2]|0);P=(g[k>>2]=F,c[k>>2]|0);Q=0;O=0;N=Q|N;O=P|O;P=R|0;c[P>>2]=N;R=R+4|0;c[R>>2]=O;R=c[o>>2]|0;O=c[m>>2]|0;R=O+(R*12|0)+8|0;g[R>>2]=G;R=c[p>>2]|0;R=O+(R*12|0)|0;O=(g[k>>2]=H,c[k>>2]|0);P=(g[k>>2]=I,c[k>>2]|0);N=0;Q=0;O=N|O;Q=P|Q;P=R|0;c[P>>2]=O;R=R+4|0;c[R>>2]=Q;R=c[p>>2]|0;Q=c[m>>2]|0;R=Q+(R*12|0)+8|0;g[R>>2]=J;return}}function Of(a,b){a=a|0;b=b|0;var d=0.0,e=0.0,f=0,h=0,i=0.0,j=0,k=0,l=0.0,m=0.0,n=0.0,o=0.0,p=0.0,q=0.0,r=0.0,s=0.0,t=0.0,u=0.0,v=0.0,w=0.0,x=0.0,y=0.0,z=0,A=0.0,B=0.0,C=0.0,D=0,E=0;j=a+104|0;k=c[j>>2]|0;h=b+32|0;D=c[h>>2]|0;f=D+(k*12|0)|0;e=+g[f>>2];l=+g[f+4>>2];r=+g[D+(k*12|0)+8>>2];k=a+108|0;z=c[k>>2]|0;E=D+(z*12|0)|0;d=+g[E>>2];n=+g[E+4>>2];s=+g[D+(z*12|0)+8>>2];p=+g[a+156>>2];m=+g[a+160>>2];i=+g[a+164>>2];o=+g[a+168>>2];q=+g[b>>2];x=+g[b+4>>2]*+g[a+100>>2];b=a+88|0;t=+g[b>>2];v=q*+g[a+96>>2];w=t+(s-r+x*+g[a+152>>2])*(-0.0- +g[a+188>>2]);u=-0.0-v;v=w<v?w:v;w=v<u?u:v;g[b>>2]=w;w=w-t;r=r-i*w;s=s+o*w;w=+g[a+124>>2];v=+g[a+120>>2];u=+g[a+116>>2];t=+g[a+112>>2];B=+g[a+144>>2]*x+(d+w*(-0.0-s)-e-u*(-0.0-r));C=x*+g[a+148>>2]+(n+v*s-l-t*r);A=+g[a+184>>2]*C+ +g[a+176>>2]*B;b=a+80|0;z=b;x=+g[z>>2];y=+g[z+4>>2];b=b|0;B=x-(+g[a+180>>2]*C+ +g[a+172>>2]*B);g[b>>2]=B;z=a+84|0;A=+g[z>>2]-A;g[z>>2]=A;q=q*+g[a+92>>2];C=B*B+A*A;if(C>q*q){C=+R(C);if(!(C<1.1920928955078125e-7)){C=1.0/C;B=B*C;g[b>>2]=B;A=A*C;g[z>>2]=A}B=q*B;g[b>>2]=B;A=q*A;g[z>>2]=A}C=B-x;B=A-y;A=+(e-p*C);y=+(l-p*B);g[f>>2]=A;g[f+4>>2]=y;E=c[h>>2]|0;g[E+((c[j>>2]|0)*12|0)+8>>2]=r-i*(t*B-C*u);E=E+((c[k>>2]|0)*12|0)|0;y=+(d+m*C);A=+(n+m*B);g[E>>2]=y;g[E+4>>2]=A;g[(c[h>>2]|0)+((c[k>>2]|0)*12|0)+8>>2]=s+o*(B*v-C*w);return}function Pf(a,b){a=a|0;b=b|0;return 1}function Qf(a,b){a=a|0;b=b|0;var d=0;d=(c[b+48>>2]|0)+12|0;b=a;a=c[d+4>>2]|0;c[b>>2]=c[d>>2];c[b+4>>2]=a;return}function Rf(a,b){a=a|0;b=b|0;var d=0;d=(c[b+52>>2]|0)+12|0;b=a;a=c[d+4>>2]|0;c[b>>2]=c[d>>2];c[b+4>>2]=a;return}function Sf(a,b,c){a=a|0;b=b|0;c=+c;var d=0.0;d=+g[b+84>>2]*c;g[a>>2]=+g[b+80>>2]*c;g[a+4>>2]=d;return}function Tf(a,b){a=a|0;b=+b;return+(+g[a+88>>2]*b)}function Uf(a,d){a=a|0;d=d|0;var e=0,f=0,h=0,i=0;e=a+68|0;do{if(!(+g[d>>2]!=+g[e>>2])){if(+g[d+4>>2]!=+g[a+72>>2]){break}return}}while(0);f=c[a+48>>2]|0;h=f+4|0;i=b[h>>1]|0;if((i&2)==0){b[h>>1]=i|2;g[f+160>>2]=0.0}a=c[a+52>>2]|0;f=a+4|0;h=b[f>>1]|0;if((h&2)==0){b[f>>1]=h|2;g[a+160>>2]=0.0}f=d;i=e;h=c[f+4>>2]|0;c[i>>2]=c[f>>2];c[i+4>>2]=h;return}function Vf(a,d){a=a|0;d=+d;var e=0,f=0,h=0,i=0;e=a+76|0;if(!(+g[e>>2]!=d)){return}f=c[a+48>>2]|0;h=f+4|0;i=b[h>>1]|0;if((i&2)==0){b[h>>1]=i|2;g[f+160>>2]=0.0}a=c[a+52>>2]|0;f=a+4|0;h=b[f>>1]|0;if((h&2)==0){b[f>>1]=h|2;g[a+160>>2]=0.0}g[e>>2]=d;return}function Wf(a){a=a|0;var b=0,e=0,f=0.0,j=0,k=0;b=i;k=c[(c[a+48>>2]|0)+8>>2]|0;j=c[(c[a+52>>2]|0)+8>>2]|0;zm(4128,(e=i,i=i+1|0,i=i+7&-8,c[e>>2]=0,e)|0);i=e;zm(4280,(e=i,i=i+8|0,c[e>>2]=k,e)|0);i=e;zm(3160,(e=i,i=i+8|0,c[e>>2]=j,e)|0);i=e;zm(2768,(e=i,i=i+8|0,c[e>>2]=d[a+61|0]|0,e)|0);i=e;f=+g[a+72>>2];zm(2328,(e=i,i=i+16|0,h[e>>3]=+g[a+68>>2],h[e+8>>3]=f,e)|0);i=e;zm(1848,(e=i,i=i+8|0,h[e>>3]=+g[a+76>>2],e)|0);i=e;zm(1376,(e=i,i=i+8|0,h[e>>3]=+g[a+92>>2],e)|0);i=e;zm(1024,(e=i,i=i+8|0,h[e>>3]=+g[a+96>>2],e)|0);i=e;zm(632,(e=i,i=i+8|0,h[e>>3]=+g[a+100>>2],e)|0);i=e;zm(336,(e=i,i=i+8|0,c[e>>2]=c[a+56>>2],e)|0);i=e;i=b;return}function Xf(a,b){a=a|0;b=b|0;return}function Yf(a){a=a|0;return}function Zf(a){a=a|0;$m(a);return}function _f(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var h=0.0,i=0.0,j=0,k=0,l=0.0,m=0.0,n=0.0;c[a+8>>2]=b;c[a+12>>2]=d;j=e|0;n=+g[j>>2]- +g[b+12>>2];e=e+4|0;i=+g[e>>2]- +g[b+16>>2];h=+g[b+24>>2];l=+g[b+20>>2];k=a+20|0;m=+(n*h+i*l);l=+(h*i+n*(-0.0-l));g[k>>2]=m;g[k+4>>2]=l;k=f|0;l=+g[k>>2]- +g[d+12>>2];b=f+4|0;m=+g[b>>2]- +g[d+16>>2];n=+g[d+24>>2];i=+g[d+20>>2];f=a+28|0;h=+(l*n+m*i);i=+(n*m+l*(-0.0-i));g[f>>2]=h;g[f+4>>2]=i;i=+g[k>>2]- +g[j>>2];h=+g[b>>2]- +g[e>>2];g[a+36>>2]=+R(i*i+h*h);return}function $f(a,b){a=a|0;b=b|0;var d=0,e=0,f=0;yh(a|0,b|0);c[a>>2]=5312;e=b+20|0;f=a+80|0;d=c[e+4>>2]|0;c[f>>2]=c[e>>2];c[f+4>>2]=d;f=b+28|0;d=a+88|0;e=c[f+4>>2]|0;c[d>>2]=c[f>>2];c[d+4>>2]=e;g[a+104>>2]=+g[b+36>>2];g[a+68>>2]=+g[b+40>>2];g[a+72>>2]=+g[b+44>>2];g[a+100>>2]=0.0;g[a+96>>2]=0.0;g[a+76>>2]=0.0;return}function ag(b,d){b=b|0;d=d|0;var e=0.0,f=0.0,h=0.0,i=0.0,j=0.0,l=0.0,m=0.0,n=0,o=0,p=0,q=0,r=0.0,s=0.0,t=0.0,u=0.0,v=0.0,w=0.0,x=0.0,y=0,z=0.0,A=0.0,B=0.0,C=0.0,D=0.0,E=0.0,F=0.0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0.0;n=c[b+48>>2]|0;o=c[n+8>>2]|0;p=b+108|0;c[p>>2]=o;L=c[b+52>>2]|0;J=c[L+8>>2]|0;q=b+112|0;c[q>>2]=J;H=n+44|0;y=b+140|0;I=c[H>>2]|0;H=c[H+4>>2]|0;c[y>>2]=I;c[y+4>>2]=H;y=L+44|0;K=b+148|0;G=c[y>>2]|0;y=c[y+4>>2]|0;c[K>>2]=G;c[K+4>>2]=y;e=+g[n+136>>2];g[b+156>>2]=e;x=+g[L+136>>2];g[b+160>>2]=x;r=+g[n+144>>2];g[b+164>>2]=r;u=+g[L+144>>2];g[b+168>>2]=u;L=c[d+28>>2]|0;n=L+(o*12|0)|0;A=+g[n>>2];z=+g[n+4>>2];w=+g[L+(o*12|0)+8>>2];n=d+32|0;K=c[n>>2]|0;M=K+(o*12|0)|0;l=+g[M>>2];m=+g[M+4>>2];f=+g[K+(o*12|0)+8>>2];M=L+(J*12|0)|0;C=+g[M>>2];F=+g[M+4>>2];D=+g[L+(J*12|0)+8>>2];L=K+(J*12|0)|0;i=+g[L>>2];j=+g[L+4>>2];h=+g[K+(J*12|0)+8>>2];v=+U(w);w=+T(w);B=+U(D);D=+T(D);E=+g[b+80>>2]-(c[k>>2]=I,+g[k>>2]);t=+g[b+84>>2]-(c[k>>2]=H,+g[k>>2]);s=w*E-v*t;t=v*E+w*t;H=b+124|0;w=+s;E=+t;g[H>>2]=w;g[H+4>>2]=E;E=+g[b+88>>2]-(c[k>>2]=G,+g[k>>2]);w=+g[b+92>>2]-(c[k>>2]=y,+g[k>>2]);v=D*E-B*w;w=B*E+D*w;y=b+132|0;D=+v;E=+w;g[y>>2]=D;g[y+4>>2]=E;y=b+116|0;A=C+v-A-s;z=F+w-z-t;G=y;F=+A;C=+z;g[G>>2]=F;g[G+4>>2]=C;y=y|0;C=+R(A*A+z*z);if(C>.004999999888241291){E=1.0/C;F=A*E;g[y>>2]=F;A=E*z;z=F}else{g[y>>2]=0.0;A=0.0;z=0.0}g[b+120>>2]=A;F=A*s-t*z;B=A*v-z*w;B=x+(e+F*F*r)+B*B*u;if(B!=0.0){F=1.0/B}else{F=0.0}y=b+172|0;g[y>>2]=F;D=+g[b+68>>2];if(D>0.0){C=C- +g[b+104>>2];N=D*6.2831854820251465;D=N*F*N;E=+g[d>>2];F=E*(N*F*2.0*+g[b+72>>2]+D*E);G=b+96|0;g[G>>2]=F;if(F!=0.0){F=1.0/F}else{F=0.0}g[G>>2]=F;g[b+76>>2]=D*C*E*F;B=B+F;if(B!=0.0){B=1.0/B}else{B=0.0}g[y>>2]=B}else{g[b+96>>2]=0.0;g[b+76>>2]=0.0}if((a[d+24|0]|0)==0){g[b+100>>2]=0.0;D=f;N=h;E=i;F=j;B=l;C=m;M=c[n>>2]|0;M=M+(o*12|0)|0;I=(g[k>>2]=B,c[k>>2]|0);K=(g[k>>2]=C,c[k>>2]|0);L=0;J=0;I=L|I;J=K|J;K=M|0;c[K>>2]=I;M=M+4|0;c[M>>2]=J;M=c[p>>2]|0;J=c[n>>2]|0;M=J+(M*12|0)+8|0;g[M>>2]=D;M=c[q>>2]|0;M=J+(M*12|0)|0;J=(g[k>>2]=E,c[k>>2]|0);K=(g[k>>2]=F,c[k>>2]|0);I=0;L=0;J=I|J;L=K|L;K=M|0;c[K>>2]=J;M=M+4|0;c[M>>2]=L;M=c[q>>2]|0;L=c[n>>2]|0;M=L+(M*12|0)+8|0;g[M>>2]=N;return}else{M=b+100|0;C=+g[d+8>>2]*+g[M>>2];g[M>>2]=C;B=z*C;C=C*A;D=f-r*(C*s-B*t);N=h+u*(C*v-B*w);E=i+B*x;F=j+C*x;B=l-B*e;C=m-C*e;M=c[n>>2]|0;M=M+(o*12|0)|0;I=(g[k>>2]=B,c[k>>2]|0);K=(g[k>>2]=C,c[k>>2]|0);L=0;J=0;I=L|I;J=K|J;K=M|0;c[K>>2]=I;M=M+4|0;c[M>>2]=J;M=c[p>>2]|0;J=c[n>>2]|0;M=J+(M*12|0)+8|0;g[M>>2]=D;M=c[q>>2]|0;M=J+(M*12|0)|0;J=(g[k>>2]=E,c[k>>2]|0);K=(g[k>>2]=F,c[k>>2]|0);I=0;L=0;J=I|J;L=K|L;K=M|0;c[K>>2]=J;M=M+4|0;c[M>>2]=L;M=c[q>>2]|0;L=c[n>>2]|0;M=L+(M*12|0)+8|0;g[M>>2]=N;return}}function bg(a,b){a=a|0;b=b|0;var d=0,e=0.0,f=0.0,h=0.0,i=0.0,j=0.0,k=0.0,l=0,m=0.0,n=0,o=0.0,p=0.0,q=0.0,r=0.0,s=0.0,t=0.0,u=0,v=0.0,w=0,x=0;l=a+108|0;u=c[l>>2]|0;d=b+32|0;w=c[d>>2]|0;n=w+(u*12|0)|0;p=+g[n>>2];q=+g[n+4>>2];t=+g[w+(u*12|0)+8>>2];b=a+112|0;u=c[b>>2]|0;x=w+(u*12|0)|0;k=+g[x>>2];j=+g[x+4>>2];s=+g[w+(u*12|0)+8>>2];m=+g[a+128>>2];f=+g[a+124>>2];e=+g[a+136>>2];r=+g[a+132>>2];h=+g[a+116>>2];o=+g[a+120>>2];u=a+100|0;v=+g[u>>2];i=(+g[a+76>>2]+(h*(k+e*(-0.0-s)-(p+m*(-0.0-t)))+o*(j+s*r-(q+t*f)))+ +g[a+96>>2]*v)*(-0.0- +g[a+172>>2]);g[u>>2]=v+i;h=h*i;i=o*i;o=+g[a+156>>2];m=t- +g[a+164>>2]*(i*f-h*m);f=+g[a+160>>2];e=s+ +g[a+168>>2]*(i*r-h*e);p=+(p-o*h);o=+(q-o*i);g[n>>2]=p;g[n+4>>2]=o;a=c[d>>2]|0;g[a+((c[l>>2]|0)*12|0)+8>>2]=m;a=a+((c[b>>2]|0)*12|0)|0;h=+(k+h*f);f=+(j+i*f);g[a>>2]=h;g[a+4>>2]=f;g[(c[d>>2]|0)+((c[b>>2]|0)*12|0)+8>>2]=e;return}function cg(a,b){a=a|0;b=b|0;var d=0,e=0.0,f=0.0,h=0.0,i=0.0,j=0.0,k=0.0,l=0.0,m=0.0,n=0,o=0,p=0.0,q=0.0,r=0.0,s=0.0,t=0.0,u=0,v=0,w=0,x=0.0,y=0.0;if(+g[a+68>>2]>0.0){o=1;return o|0}d=a+108|0;o=c[d>>2]|0;n=b+28|0;v=c[n>>2]|0;b=v+(o*12|0)|0;l=+g[b>>2];m=+g[b+4>>2];e=+g[v+(o*12|0)+8>>2];o=a+112|0;u=c[o>>2]|0;w=v+(u*12|0)|0;q=+g[w>>2];p=+g[w+4>>2];i=+g[v+(u*12|0)+8>>2];j=+U(e);s=+T(e);t=+U(i);r=+T(i);k=+g[a+80>>2]- +g[a+140>>2];h=+g[a+84>>2]- +g[a+144>>2];f=s*k-j*h;h=j*k+s*h;s=+g[a+88>>2]- +g[a+148>>2];k=+g[a+92>>2]- +g[a+152>>2];j=r*s-t*k;k=t*s+r*k;r=q+j-l-f;s=p+k-m-h;t=+R(r*r+s*s);if(t<1.1920928955078125e-7){t=0.0}else{x=1.0/t;r=r*x;s=s*x}t=t- +g[a+104>>2];t=t<.20000000298023224?t:.20000000298023224;t=t<-.20000000298023224?-.20000000298023224:t;y=t*(-0.0- +g[a+172>>2]);r=r*y;s=s*y;y=+g[a+156>>2];f=e- +g[a+164>>2]*(f*s-h*r);h=+g[a+160>>2];x=i+ +g[a+168>>2]*(j*s-k*r);l=+(l-y*r);m=+(m-y*s);g[b>>2]=l;g[b+4>>2]=m;w=c[n>>2]|0;g[w+((c[d>>2]|0)*12|0)+8>>2]=f;w=w+((c[o>>2]|0)*12|0)|0;r=+(q+h*r);s=+(p+h*s);g[w>>2]=r;g[w+4>>2]=s;g[(c[n>>2]|0)+((c[o>>2]|0)*12|0)+8>>2]=x;if(!(t>0.0)){t=-0.0-t}w=t<.004999999888241291;return w|0}function dg(a,b){a=a|0;b=b|0;var d=0.0,e=0.0,f=0.0,h=0.0,i=0.0,j=0;j=c[b+48>>2]|0;i=+g[j+24>>2];h=+g[b+80>>2];f=+g[j+20>>2];e=+g[b+84>>2];d=h*f+i*e+ +g[j+16>>2];g[a>>2]=+g[j+12>>2]+(i*h-f*e);g[a+4>>2]=d;return}function eg(a,b){a=a|0;b=b|0;var d=0.0,e=0.0,f=0.0,h=0.0,i=0.0,j=0;j=c[b+52>>2]|0;i=+g[j+24>>2];h=+g[b+88>>2];f=+g[j+20>>2];e=+g[b+92>>2];d=h*f+i*e+ +g[j+16>>2];g[a>>2]=+g[j+12>>2]+(i*h-f*e);g[a+4>>2]=d;return}function fg(a,b,c){a=a|0;b=b|0;c=+c;var d=0.0;d=+g[b+100>>2]*c;c=d*+g[b+120>>2];g[a>>2]=+g[b+116>>2]*d;g[a+4>>2]=c;return}function gg(a,b){a=a|0;b=+b;return+0.0}function hg(a){a=a|0;var b=0,e=0,f=0.0,j=0,k=0;b=i;k=c[(c[a+48>>2]|0)+8>>2]|0;j=c[(c[a+52>>2]|0)+8>>2]|0;zm(3792,(e=i,i=i+1|0,i=i+7&-8,c[e>>2]=0,e)|0);i=e;zm(4064,(e=i,i=i+8|0,c[e>>2]=k,e)|0);i=e;zm(3128,(e=i,i=i+8|0,c[e>>2]=j,e)|0);i=e;zm(2728,(e=i,i=i+8|0,c[e>>2]=d[a+61|0]|0,e)|0);i=e;f=+g[a+84>>2];zm(2280,(e=i,i=i+16|0,h[e>>3]=+g[a+80>>2],h[e+8>>3]=f,e)|0);i=e;f=+g[a+92>>2];zm(1800,(e=i,i=i+16|0,h[e>>3]=+g[a+88>>2],h[e+8>>3]=f,e)|0);i=e;zm(1352,(e=i,i=i+8|0,h[e>>3]=+g[a+104>>2],e)|0);i=e;zm(992,(e=i,i=i+8|0,h[e>>3]=+g[a+68>>2],e)|0);i=e;zm(600,(e=i,i=i+8|0,h[e>>3]=+g[a+72>>2],e)|0);i=e;zm(288,(e=i,i=i+8|0,c[e>>2]=c[a+56>>2],e)|0);i=e;i=b;return}function ig(a){a=a|0;return}function jg(a){a=a|0;$m(a);return}function kg(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0.0,h=0.0,i=0.0,j=0.0,k=0.0,l=0;c[a+8>>2]=b;c[a+12>>2]=d;l=e|0;k=+g[l>>2]- +g[b+12>>2];e=e+4|0;f=+g[e>>2]- +g[b+16>>2];h=+g[b+24>>2];i=+g[b+20>>2];b=a+20|0;j=+(k*h+f*i);i=+(h*f+k*(-0.0-i));g[b>>2]=j;g[b+4>>2]=i;i=+g[l>>2]- +g[d+12>>2];j=+g[e>>2]- +g[d+16>>2];k=+g[d+24>>2];f=+g[d+20>>2];e=a+28|0;h=+(i*k+j*f);f=+(k*j+i*(-0.0-f));g[e>>2]=h;g[e+4>>2]=f;return}function lg(a,b){a=a|0;b=b|0;var d=0,e=0,f=0;yh(a|0,b|0);c[a>>2]=5248;e=b+20|0;f=a+68|0;d=c[e+4>>2]|0;c[f>>2]=c[e>>2];c[f+4>>2]=d;f=b+28|0;d=a+76|0;e=c[f+4>>2]|0;c[d>>2]=c[f>>2];c[d+4>>2]=e;g[a+84>>2]=0.0;g[a+88>>2]=0.0;g[a+92>>2]=0.0;g[a+96>>2]=+g[b+36>>2];g[a+100>>2]=+g[b+40>>2];return}function mg(b,d){b=b|0;d=d|0;var e=0,f=0,h=0,i=0,j=0.0,l=0.0,m=0.0,n=0.0,o=0.0,p=0.0,q=0.0,r=0.0,s=0.0,t=0.0,u=0.0,v=0.0,w=0.0,x=0.0,y=0.0,z=0.0,A=0.0,B=0.0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0;h=c[b+48>>2]|0;i=c[h+8>>2]|0;e=b+104|0;c[e>>2]=i;I=c[b+52>>2]|0;G=c[I+8>>2]|0;f=b+108|0;c[f>>2]=G;E=h+44|0;C=b+128|0;F=c[E>>2]|0;E=c[E+4>>2]|0;c[C>>2]=F;c[C+4>>2]=E;C=I+44|0;H=b+136|0;D=c[C>>2]|0;C=c[C+4>>2]|0;c[H>>2]=D;c[H+4>>2]=C;j=+g[h+136>>2];g[b+144>>2]=j;o=+g[I+136>>2];g[b+148>>2]=o;v=+g[h+144>>2];g[b+152>>2]=v;q=+g[I+144>>2];g[b+156>>2]=q;I=c[d+28>>2]|0;s=+g[I+(i*12|0)+8>>2];h=d+32|0;H=c[h>>2]|0;J=H+(i*12|0)|0;m=+g[J>>2];l=+g[J+4>>2];u=+g[H+(i*12|0)+8>>2];A=+g[I+(G*12|0)+8>>2];I=H+(G*12|0)|0;p=+g[I>>2];n=+g[I+4>>2];t=+g[H+(G*12|0)+8>>2];r=+U(s);s=+T(s);y=+U(A);A=+T(A);B=+g[b+68>>2]-(c[k>>2]=F,+g[k>>2]);x=+g[b+72>>2]-(c[k>>2]=E,+g[k>>2]);w=s*B-r*x;x=r*B+s*x;E=b+112|0;s=+w;B=+x;g[E>>2]=s;g[E+4>>2]=B;B=+g[b+76>>2]-(c[k>>2]=D,+g[k>>2]);s=+g[b+80>>2]-(c[k>>2]=C,+g[k>>2]);r=A*B-y*s;s=y*B+A*s;C=b+120|0;A=+r;B=+s;g[C>>2]=A;g[C+4>>2]=B;B=j+o;A=B+x*v*x+s*q*s;y=q*r;z=x*w*(-0.0-v)-s*y;y=B+w*v*w+r*y;B=A*y-z*z;if(B!=0.0){B=1.0/B}z=z*(-0.0-B);g[b+160>>2]=y*B;g[b+164>>2]=z;g[b+168>>2]=z;g[b+172>>2]=A*B;y=v+q;if(y>0.0){y=1.0/y}g[b+176>>2]=y;C=b+84|0;if((a[d+24|0]|0)==0){g[C>>2]=0.0;g[b+88>>2]=0.0;g[b+92>>2]=0.0}else{I=d+8|0;B=+g[I>>2];J=C|0;A=B*+g[J>>2];g[J>>2]=A;J=b+88|0;B=B*+g[J>>2];g[J>>2]=B;J=b+92|0;z=+g[I>>2]*+g[J>>2];g[J>>2]=z;u=u-v*(z+(B*w-A*x));t=t+q*(z+(B*r-A*s));p=p+o*A;n=n+o*B;m=m-j*A;l=l-j*B}J=(c[h>>2]|0)+(i*12|0)|0;B=+m;A=+l;g[J>>2]=B;g[J+4>>2]=A;J=c[h>>2]|0;g[J+((c[e>>2]|0)*12|0)+8>>2]=u;J=J+((c[f>>2]|0)*12|0)|0;A=+p;B=+n;g[J>>2]=A;g[J+4>>2]=B;g[(c[h>>2]|0)+((c[f>>2]|0)*12|0)+8>>2]=t;return}function ng(a,b){a=a|0;b=b|0;var d=0.0,e=0.0,f=0,h=0,i=0.0,j=0,k=0,l=0.0,m=0.0,n=0.0,o=0.0,p=0.0,q=0.0,r=0.0,s=0.0,t=0.0,u=0.0,v=0.0,w=0.0,x=0.0,y=0.0,z=0,A=0.0,B=0.0,C=0.0,D=0,E=0;j=a+104|0;k=c[j>>2]|0;h=b+32|0;D=c[h>>2]|0;f=D+(k*12|0)|0;e=+g[f>>2];l=+g[f+4>>2];r=+g[D+(k*12|0)+8>>2];k=a+108|0;z=c[k>>2]|0;E=D+(z*12|0)|0;d=+g[E>>2];n=+g[E+4>>2];s=+g[D+(z*12|0)+8>>2];p=+g[a+144>>2];m=+g[a+148>>2];i=+g[a+152>>2];o=+g[a+156>>2];q=+g[b>>2];b=a+92|0;t=+g[b>>2];w=q*+g[a+100>>2];v=t+(s-r)*(-0.0- +g[a+176>>2]);u=-0.0-w;v=v<w?v:w;v=v<u?u:v;g[b>>2]=v;v=v-t;r=r-i*v;v=s+o*v;w=+g[a+124>>2];u=+g[a+120>>2];s=+g[a+116>>2];t=+g[a+112>>2];B=d+w*(-0.0-v)-e-s*(-0.0-r);C=n+u*v-l-t*r;A=+g[a+172>>2]*C+ +g[a+164>>2]*B;b=a+84|0;z=b;x=+g[z>>2];y=+g[z+4>>2];b=b|0;B=x-(+g[a+168>>2]*C+ +g[a+160>>2]*B);g[b>>2]=B;z=a+88|0;A=+g[z>>2]-A;g[z>>2]=A;q=q*+g[a+96>>2];C=B*B+A*A;if(C>q*q){C=+R(C);if(!(C<1.1920928955078125e-7)){C=1.0/C;B=B*C;g[b>>2]=B;A=A*C;g[z>>2]=A}B=q*B;g[b>>2]=B;A=q*A;g[z>>2]=A}C=B-x;B=A-y;A=+(e-p*C);y=+(l-p*B);g[f>>2]=A;g[f+4>>2]=y;E=c[h>>2]|0;g[E+((c[j>>2]|0)*12|0)+8>>2]=r-i*(t*B-C*s);E=E+((c[k>>2]|0)*12|0)|0;y=+(d+m*C);A=+(n+m*B);g[E>>2]=y;g[E+4>>2]=A;g[(c[h>>2]|0)+((c[k>>2]|0)*12|0)+8>>2]=v+o*(B*u-C*w);return}function og(a,b){a=a|0;b=b|0;return 1}function pg(a,b){a=a|0;b=b|0;var d=0.0,e=0.0,f=0.0,h=0.0,i=0.0,j=0;j=c[b+48>>2]|0;i=+g[j+24>>2];h=+g[b+68>>2];f=+g[j+20>>2];e=+g[b+72>>2];d=h*f+i*e+ +g[j+16>>2];g[a>>2]=+g[j+12>>2]+(i*h-f*e);g[a+4>>2]=d;return}function qg(a,b){a=a|0;b=b|0;var d=0.0,e=0.0,f=0.0,h=0.0,i=0.0,j=0;j=c[b+52>>2]|0;i=+g[j+24>>2];h=+g[b+76>>2];f=+g[j+20>>2];e=+g[b+80>>2];d=h*f+i*e+ +g[j+16>>2];g[a>>2]=+g[j+12>>2]+(i*h-f*e);g[a+4>>2]=d;return}function rg(a,b,c){a=a|0;b=b|0;c=+c;var d=0.0;d=+g[b+88>>2]*c;g[a>>2]=+g[b+84>>2]*c;g[a+4>>2]=d;return}function sg(a,b){a=a|0;b=+b;return+(+g[a+92>>2]*b)}function tg(a){a=a|0;var b=0,e=0,f=0.0,j=0,k=0;b=i;k=c[(c[a+48>>2]|0)+8>>2]|0;j=c[(c[a+52>>2]|0)+8>>2]|0;zm(3488,(e=i,i=i+1|0,i=i+7&-8,c[e>>2]=0,e)|0);i=e;zm(3920,(e=i,i=i+8|0,c[e>>2]=k,e)|0);i=e;zm(3096,(e=i,i=i+8|0,c[e>>2]=j,e)|0);i=e;zm(2688,(e=i,i=i+8|0,c[e>>2]=d[a+61|0]|0,e)|0);i=e;f=+g[a+72>>2];zm(2232,(e=i,i=i+16|0,h[e>>3]=+g[a+68>>2],h[e+8>>3]=f,e)|0);i=e;f=+g[a+80>>2];zm(1752,(e=i,i=i+16|0,h[e>>3]=+g[a+76>>2],h[e+8>>3]=f,e)|0);i=e;zm(1320,(e=i,i=i+8|0,h[e>>3]=+g[a+96>>2],e)|0);i=e;zm(960,(e=i,i=i+8|0,h[e>>3]=+g[a+100>>2],e)|0);i=e;zm(552,(e=i,i=i+8|0,c[e>>2]=c[a+56>>2],e)|0);i=e;i=b;return}function ug(a){a=a|0;return}function vg(a){a=a|0;$m(a);return}function wg(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0.0,h=0.0,i=0.0,j=0.0,k=0.0,l=0,m=0;c[a+8>>2]=b;c[a+12>>2]=d;l=e|0;k=+g[l>>2]- +g[b+12>>2];e=e+4|0;f=+g[e>>2]- +g[b+16>>2];h=+g[b+24>>2];i=+g[b+20>>2];m=a+20|0;j=+(k*h+f*i);i=+(h*f+k*(-0.0-i));g[m>>2]=j;g[m+4>>2]=i;i=+g[l>>2]- +g[d+12>>2];j=+g[e>>2]- +g[d+16>>2];k=+g[d+24>>2];f=+g[d+20>>2];e=a+28|0;h=+(i*k+j*f);f=+(k*j+i*(-0.0-f));g[e>>2]=h;g[e+4>>2]=f;g[a+36>>2]=+g[d+72>>2]- +g[b+72>>2];return}function xg(a,b){a=a|0;b=b|0;var d=0,e=0,f=0;yh(a|0,b|0);c[a>>2]=5872;e=b+20|0;f=a+80|0;d=c[e+4>>2]|0;c[f>>2]=c[e>>2];c[f+4>>2]=d;f=b+28|0;d=a+88|0;e=c[f+4>>2]|0;c[d>>2]=c[f>>2];c[d+4>>2]=e;g[a+96>>2]=+g[b+36>>2];g[a+68>>2]=+g[b+40>>2];g[a+72>>2]=+g[b+44>>2];g[a+104>>2]=0.0;g[a+108>>2]=0.0;g[a+112>>2]=0.0;return}function yg(b,d){b=b|0;d=d|0;var e=0.0,f=0.0,h=0.0,j=0.0,l=0.0,m=0.0,n=0,o=0,p=0,q=0,r=0.0,s=0,t=0,u=0.0,v=0,w=0,x=0.0,y=0.0,z=0.0,A=0.0,B=0,C=0.0,D=0.0,E=0.0,F=0,G=0,H=0.0,I=0.0,J=0.0,K=0.0,L=0,M=0,N=0;q=i;i=i+40|0;F=q|0;o=c[b+48>>2]|0;M=c[o+8>>2]|0;n=b+116|0;c[n>>2]=M;L=c[b+52>>2]|0;s=c[L+8>>2]|0;p=b+120|0;c[p>>2]=s;v=o+44|0;t=b+140|0;B=c[v>>2]|0;v=c[v+4>>2]|0;c[t>>2]=B;c[t+4>>2]=v;t=L+44|0;G=b+148|0;w=c[t>>2]|0;t=c[t+4>>2]|0;c[G>>2]=w;c[G+4>>2]=t;e=+g[o+136>>2];g[b+156>>2]=e;x=+g[L+136>>2];g[b+160>>2]=x;r=+g[o+144>>2];g[b+164>>2]=r;u=+g[L+144>>2];g[b+168>>2]=u;L=c[d+28>>2]|0;C=+g[L+(M*12|0)+8>>2];o=d+32|0;G=c[o>>2]|0;N=G+(M*12|0)|0;l=+g[N>>2];m=+g[N+4>>2];y=+g[G+(M*12|0)+8>>2];A=+g[L+(s*12|0)+8>>2];L=G+(s*12|0)|0;h=+g[L>>2];j=+g[L+4>>2];f=+g[G+(s*12|0)+8>>2];z=+U(C);E=+T(C);K=+U(A);I=+T(A);s=b+124|0;H=+g[b+80>>2]-(c[k>>2]=B,+g[k>>2]);J=+g[b+84>>2]-(c[k>>2]=v,+g[k>>2]);D=E*H-z*J;J=z*H+E*J;v=s;E=+D;H=+J;g[v>>2]=E;g[v+4>>2]=H;v=b+132|0;H=+g[b+88>>2]-(c[k>>2]=w,+g[k>>2]);E=+g[b+92>>2]-(c[k>>2]=t,+g[k>>2]);z=I*H-K*E;E=K*H+I*E;t=v;I=+z;H=+E;g[t>>2]=I;g[t+4>>2]=H;H=e+x;t=b+128|0;w=b+136|0;g[F>>2]=H+r*J*J+u*E*E;J=-0.0-J;s=s|0;v=v|0;I=r*D*J-u*E*z;g[F+12>>2]=I;E=r*J-u*E;g[F+24>>2]=E;g[F+4>>2]=I;g[F+16>>2]=H+r*D*D+u*z*z;z=r*D+u*z;g[F+28>>2]=z;g[F+8>>2]=E;g[F+20>>2]=z;z=r+u;g[F+32>>2]=z;B=b+68|0;G=b+172|0;if(+g[B>>2]>0.0){qm(F,G);if(z>0.0){E=1.0/z}else{E=0.0}A=A-C- +g[b+96>>2];K=+g[B>>2]*6.2831854820251465;C=K*E*K;D=+g[d>>2];E=D*(K*E*2.0*+g[b+72>>2]+D*C);B=b+100|0;g[B>>2]=E;if(E!=0.0){E=1.0/E}else{E=0.0}g[B>>2]=E;g[b+76>>2]=A*D*C*E;z=z+E;if(z!=0.0){z=1.0/z}else{z=0.0}g[b+204>>2]=z}else{rm(F,G);g[b+100>>2]=0.0;g[b+76>>2]=0.0}B=b+104|0;if((a[d+24|0]|0)==0){g[B>>2]=0.0;g[b+108>>2]=0.0;g[b+112>>2]=0.0;H=y;K=f;I=h;J=j;D=l;E=m;N=c[n>>2]|0;F=c[o>>2]|0;N=F+(N*12|0)|0;F=(g[k>>2]=D,c[k>>2]|0);L=(g[k>>2]=E,c[k>>2]|0);M=0;G=0;F=M|F;G=L|G;L=N|0;c[L>>2]=F;N=N+4|0;c[N>>2]=G;N=c[n>>2]|0;G=c[o>>2]|0;N=G+(N*12|0)+8|0;g[N>>2]=H;N=c[p>>2]|0;N=G+(N*12|0)|0;G=(g[k>>2]=I,c[k>>2]|0);L=(g[k>>2]=J,c[k>>2]|0);F=0;M=0;G=F|G;M=L|M;L=N|0;c[L>>2]=G;N=N+4|0;c[N>>2]=M;N=c[p>>2]|0;M=c[o>>2]|0;N=M+(N*12|0)+8|0;g[N>>2]=K;i=q;return}else{K=+g[d+8>>2];N=B|0;D=K*+g[N>>2];g[N>>2]=D;N=b+108|0;E=K*+g[N>>2];g[N>>2]=E;N=b+112|0;K=K*+g[N>>2];g[N>>2]=K;H=y-r*(K+(E*+g[s>>2]-D*+g[t>>2]));K=f+u*(K+(E*+g[v>>2]-D*+g[w>>2]));I=h+x*D;J=j+x*E;D=l-e*D;E=m-e*E;N=c[n>>2]|0;F=c[o>>2]|0;N=F+(N*12|0)|0;F=(g[k>>2]=D,c[k>>2]|0);L=(g[k>>2]=E,c[k>>2]|0);M=0;G=0;F=M|F;G=L|G;L=N|0;c[L>>2]=F;N=N+4|0;c[N>>2]=G;N=c[n>>2]|0;G=c[o>>2]|0;N=G+(N*12|0)+8|0;g[N>>2]=H;N=c[p>>2]|0;N=G+(N*12|0)|0;G=(g[k>>2]=I,c[k>>2]|0);L=(g[k>>2]=J,c[k>>2]|0);F=0;M=0;G=F|G;M=L|M;L=N|0;c[L>>2]=G;N=N+4|0;c[N>>2]=M;N=c[p>>2]|0;M=c[o>>2]|0;N=M+(N*12|0)+8|0;g[N>>2]=K;i=q;return}}function zg(a,b){a=a|0;b=b|0;var d=0,e=0.0,f=0.0,h=0.0,i=0.0,j=0,k=0.0,l=0.0,m=0,n=0.0,o=0.0,p=0.0,q=0.0,r=0,s=0,t=0,u=0.0,v=0.0,w=0.0,x=0.0,y=0.0,z=0.0,A=0.0,B=0.0,C=0.0;d=a+116|0;m=c[d>>2]|0;b=b+32|0;s=c[b>>2]|0;j=s+(m*12|0)|0;e=+g[j>>2];l=+g[j+4>>2];q=+g[s+(m*12|0)+8>>2];m=a+120|0;r=c[m>>2]|0;t=s+(r*12|0)|0;i=+g[t>>2];h=+g[t+4>>2];o=+g[s+(r*12|0)+8>>2];k=+g[a+156>>2];f=+g[a+160>>2];p=+g[a+164>>2];n=+g[a+168>>2];if(+g[a+68>>2]>0.0){t=a+112|0;z=+g[t>>2];w=(o-q+ +g[a+76>>2]+ +g[a+100>>2]*z)*(-0.0- +g[a+204>>2]);g[t>>2]=z+w;z=q-p*w;w=o+n*w;u=+g[a+136>>2];v=+g[a+132>>2];x=+g[a+128>>2];y=+g[a+124>>2];A=i+u*(-0.0-w)-e-x*(-0.0-z);q=h+v*w-l-y*z;B=+g[a+184>>2]*q+ +g[a+172>>2]*A;A=+g[a+188>>2]*q+ +g[a+176>>2]*A;q=-0.0-B;o=-0.0-A;t=a+104|0;g[t>>2]=+g[t>>2]-B;t=a+108|0;g[t>>2]=+g[t>>2]-A;p=z-p*(y*o-x*q);n=w+n*(v*o-u*q)}else{y=+g[a+136>>2];x=+g[a+132>>2];w=+g[a+128>>2];v=+g[a+124>>2];B=i+y*(-0.0-o)-e-w*(-0.0-q);A=h+o*x-l-q*v;z=o-q;C=B*+g[a+172>>2]+A*+g[a+184>>2]+z*+g[a+196>>2];u=B*+g[a+176>>2]+A*+g[a+188>>2]+z*+g[a+200>>2];z=B*+g[a+180>>2]+A*+g[a+192>>2]+z*+g[a+204>>2];A=-0.0-C;B=-0.0-u;t=a+104|0;g[t>>2]=+g[t>>2]-C;t=a+108|0;g[t>>2]=+g[t>>2]-u;t=a+112|0;g[t>>2]=+g[t>>2]-z;p=q-p*(v*B-w*A-z);n=o+n*(x*B-y*A-z);q=A;o=B}C=+(e-k*q);B=+(l-k*o);g[j>>2]=C;g[j+4>>2]=B;t=c[b>>2]|0;g[t+((c[d>>2]|0)*12|0)+8>>2]=p;t=t+((c[m>>2]|0)*12|0)|0;B=+(i+f*q);C=+(h+f*o);g[t>>2]=B;g[t+4>>2]=C;g[(c[b>>2]|0)+((c[m>>2]|0)*12|0)+8>>2]=n;return}function Ag(a,b){a=a|0;b=b|0;var d=0,e=0,f=0.0,h=0.0,j=0.0,k=0.0,l=0.0,m=0.0,n=0.0,o=0.0,p=0,q=0.0,r=0.0,s=0.0,t=0.0,u=0,v=0,w=0,x=0.0,y=0.0,z=0.0,A=0.0,B=0.0,C=0,D=0,E=0.0,F=0.0,G=0,H=0,I=0,J=0.0;e=i;i=i+88|0;u=e|0;D=e+40|0;C=e+48|0;v=e+56|0;w=e+72|0;d=a+116|0;G=c[d>>2]|0;p=b+28|0;H=c[p>>2]|0;b=H+(G*12|0)|0;r=+g[b>>2];j=+g[b+4>>2];k=+g[H+(G*12|0)+8>>2];b=a+120|0;G=c[b>>2]|0;I=H+(G*12|0)|0;m=+g[I>>2];o=+g[I+4>>2];n=+g[H+(G*12|0)+8>>2];s=+U(k);y=+T(k);F=+U(n);x=+T(n);h=+g[a+156>>2];f=+g[a+160>>2];l=+g[a+164>>2];q=+g[a+168>>2];t=+g[a+80>>2]- +g[a+140>>2];A=+g[a+84>>2]- +g[a+144>>2];z=y*t-s*A;A=s*t+y*A;y=+g[a+88>>2]- +g[a+148>>2];t=+g[a+92>>2]- +g[a+152>>2];s=x*y-F*t;t=F*y+x*t;x=h+f;g[u>>2]=x+l*A*A+q*t*t;y=-0.0-A;F=l*z*y-q*t*s;g[u+12>>2]=F;y=l*y-q*t;g[u+24>>2]=y;g[u+4>>2]=F;g[u+16>>2]=x+l*z*z+q*s*s;x=l*z+q*s;g[u+28>>2]=x;g[u+8>>2]=y;g[u+20>>2]=x;g[u+32>>2]=l+q;x=m+s-r-z;y=o+t-j-A;if(+g[a+68>>2]>0.0){g[D>>2]=x;g[D+4>>2]=y;B=+R(y*y+x*x);pm(C,u,D);y=-0.0- +g[C>>2];F=-0.0- +g[C+4>>2];x=z*F-A*y;E=0.0;s=s*F-t*y;t=F}else{F=n-k- +g[a+96>>2];B=+R(x*x+y*y);if(F>0.0){E=F}else{E=-0.0-F}g[v>>2]=x;g[v+4>>2]=y;g[v+8>>2]=F;om(w,u,v);y=-0.0- +g[w>>2];F=-0.0- +g[w+4>>2];J=+g[w+8>>2];x=z*F-A*y-J;s=s*F-t*y-J;t=F}I=(c[p>>2]|0)+((c[d>>2]|0)*12|0)|0;J=+(r-h*y);F=+(j-h*t);g[I>>2]=J;g[I+4>>2]=F;I=c[p>>2]|0;g[I+((c[d>>2]|0)*12|0)+8>>2]=k-l*x;I=I+((c[b>>2]|0)*12|0)|0;F=+(m+f*y);J=+(o+f*t);g[I>>2]=F;g[I+4>>2]=J;g[(c[p>>2]|0)+((c[b>>2]|0)*12|0)+8>>2]=n+q*s;if(B>.004999999888241291){I=0;i=e;return I|0}I=E<=.03490658849477768;i=e;return I|0}function Bg(a,b){a=a|0;b=b|0;var d=0.0,e=0.0,f=0.0,h=0.0,i=0.0,j=0;j=c[b+48>>2]|0;i=+g[j+24>>2];h=+g[b+80>>2];f=+g[j+20>>2];e=+g[b+84>>2];d=h*f+i*e+ +g[j+16>>2];g[a>>2]=+g[j+12>>2]+(i*h-f*e);g[a+4>>2]=d;return}function Cg(a,b){a=a|0;b=b|0;var d=0.0,e=0.0,f=0.0,h=0.0,i=0.0,j=0;j=c[b+52>>2]|0;i=+g[j+24>>2];h=+g[b+88>>2];f=+g[j+20>>2];e=+g[b+92>>2];d=h*f+i*e+ +g[j+16>>2];g[a>>2]=+g[j+12>>2]+(i*h-f*e);g[a+4>>2]=d;return}function Dg(a,b,c){a=a|0;b=b|0;c=+c;var d=0.0;d=+g[b+108>>2]*c;g[a>>2]=+g[b+104>>2]*c;g[a+4>>2]=d;return}function Eg(a,b){a=a|0;b=+b;return+(+g[a+112>>2]*b)}function Fg(a){a=a|0;var b=0,e=0,f=0.0,j=0,k=0;b=i;k=c[(c[a+48>>2]|0)+8>>2]|0;j=c[(c[a+52>>2]|0)+8>>2]|0;zm(3368,(e=i,i=i+1|0,i=i+7&-8,c[e>>2]=0,e)|0);i=e;zm(3888,(e=i,i=i+8|0,c[e>>2]=k,e)|0);i=e;zm(3064,(e=i,i=i+8|0,c[e>>2]=j,e)|0);i=e;zm(2648,(e=i,i=i+8|0,c[e>>2]=d[a+61|0]|0,e)|0);i=e;f=+g[a+84>>2];zm(2184,(e=i,i=i+16|0,h[e>>3]=+g[a+80>>2],h[e+8>>3]=f,e)|0);i=e;f=+g[a+92>>2];zm(1704,(e=i,i=i+16|0,h[e>>3]=+g[a+88>>2],h[e+8>>3]=f,e)|0);i=e;zm(1288,(e=i,i=i+8|0,h[e>>3]=+g[a+96>>2],e)|0);i=e;zm(928,(e=i,i=i+8|0,h[e>>3]=+g[a+68>>2],e)|0);i=e;zm(520,(e=i,i=i+8|0,h[e>>3]=+g[a+72>>2],e)|0);i=e;zm(240,(e=i,i=i+8|0,c[e>>2]=c[a+56>>2],e)|0);i=e;i=b;return}function Gg(a){a=a|0;return}function Hg(a){a=a|0;$m(a);return}function Ig(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,h=0,i=0,j=0,l=0,m=0,n=0,o=0,p=0,q=0.0,r=0.0,s=0.0,t=0.0,u=0,v=0.0,w=0,x=0.0,y=0.0,z=0.0,A=0.0,B=0.0,C=0.0,D=0.0,E=0,F=0.0;yh(a|0,b|0);c[a>>2]=6e3;m=a+92|0;d=a+100|0;n=a+108|0;h=a+116|0;u=a+124|0;e=a+132|0;l=b+20|0;p=c[l>>2]|0;c[a+68>>2]=p;i=b+24|0;j=c[i>>2]|0;c[a+72>>2]=j;w=c[p+4>>2]|0;c[a+76>>2]=w;f=c[j+4>>2]|0;c[a+80>>2]=f;o=c[p+48>>2]|0;c[a+84>>2]=o;p=c[p+52>>2]|0;c[a+48>>2]=p;t=+g[p+20>>2];s=+g[p+24>>2];r=+g[o+20>>2];q=+g[o+24>>2];l=c[l>>2]|0;if((w|0)==1){t=+g[p+72>>2];v=+g[o+72>>2];p=l+68|0;o=n;w=c[p+4>>2]|0;c[o>>2]=c[p>>2];c[o+4>>2]=w;o=l+76|0;w=m;p=c[o+4>>2]|0;c[w>>2]=c[o>>2];c[w+4>>2]=p;q=+g[l+116>>2];g[a+140>>2]=q;g[u>>2]=0.0;g[a+128>>2]=0.0;q=t-v-q}else{B=+g[o+16>>2];x=+g[o+12>>2];C=+g[p+16>>2];D=+g[p+12>>2];w=l+68|0;p=n;E=c[w>>2]|0;n=c[w+4>>2]|0;c[p>>2]=E;c[p+4>>2]=n;p=l+76|0;w=m;o=c[p>>2]|0;p=c[p+4>>2]|0;c[w>>2]=o;c[w+4>>2]=p;g[a+140>>2]=+g[l+100>>2];w=l+84|0;m=u;u=c[w>>2]|0;w=c[w+4>>2]|0;c[m>>2]=u;c[m+4>>2]=w;y=(c[k>>2]=E,+g[k>>2]);v=(c[k>>2]=n,+g[k>>2]);A=(c[k>>2]=o,+g[k>>2]);z=(c[k>>2]=p,+g[k>>2]);x=D-x+(s*A-t*z);t=C-B+(t*A+s*z);s=(c[k>>2]=u,+g[k>>2])*(q*x+r*t-y);q=s+(c[k>>2]=w,+g[k>>2])*(x*(-0.0-r)+q*t-v)}l=c[j+48>>2]|0;c[a+88>>2]=l;j=c[j+52>>2]|0;c[a+52>>2]=j;v=+g[j+20>>2];t=+g[j+24>>2];s=+g[l+20>>2];r=+g[l+24>>2];i=c[i>>2]|0;if((f|0)==1){B=+g[j+72>>2];D=+g[l+72>>2];w=i+68|0;u=h;E=c[w+4>>2]|0;c[u>>2]=c[w>>2];c[u+4>>2]=E;u=i+76|0;E=d;w=c[u+4>>2]|0;c[E>>2]=c[u>>2];c[E+4>>2]=w;C=+g[i+116>>2];g[a+144>>2]=C;g[e>>2]=0.0;g[a+136>>2]=0.0;C=B-D-C;E=b+28|0;D=+g[E>>2];E=a+152|0;g[E>>2]=D;D=C*D;D=q+D;E=a+148|0;g[E>>2]=D;E=a+156|0;g[E>>2]=0.0;return}else{y=+g[l+16>>2];B=+g[l+12>>2];x=+g[j+16>>2];F=+g[j+12>>2];o=i+68|0;u=h;n=c[o>>2]|0;o=c[o+4>>2]|0;c[u>>2]=n;c[u+4>>2]=o;u=i+76|0;E=d;p=c[u>>2]|0;u=c[u+4>>2]|0;c[E>>2]=p;c[E+4>>2]=u;g[a+144>>2]=+g[i+100>>2];E=i+84|0;m=e;w=c[E>>2]|0;E=c[E+4>>2]|0;c[m>>2]=w;c[m+4>>2]=E;A=(c[k>>2]=n,+g[k>>2]);C=(c[k>>2]=o,+g[k>>2]);z=(c[k>>2]=p,+g[k>>2]);D=(c[k>>2]=u,+g[k>>2]);B=F-B+(t*z-v*D);D=x-y+(v*z+t*D);A=(c[k>>2]=w,+g[k>>2])*(r*B+s*D-A);C=A+(c[k>>2]=E,+g[k>>2])*(B*(-0.0-s)+r*D-C);E=b+28|0;D=+g[E>>2];E=a+152|0;g[E>>2]=D;D=C*D;D=q+D;E=a+148|0;g[E>>2]=D;E=a+156|0;g[E>>2]=0.0;return}}function Jg(b,d){b=b|0;d=d|0;var e=0,f=0,h=0,i=0,j=0,l=0,m=0.0,n=0.0,o=0.0,p=0.0,q=0.0,r=0.0,s=0.0,t=0.0,u=0.0,v=0.0,w=0.0,x=0.0,y=0.0,z=0.0,A=0.0,B=0.0,C=0.0,D=0.0,E=0.0,F=0.0,G=0.0,H=0.0,I=0,J=0.0,K=0.0,L=0.0,M=0.0,N=0.0,O=0.0,P=0.0,Q=0.0,R=0.0,S=0.0,V=0.0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ba=0,ca=0,da=0,ea=0,fa=0,ga=0,ha=0,ia=0.0,ja=0.0,ka=0.0,la=0.0,ma=0.0,na=0.0,oa=0.0;ga=c[b+48>>2]|0;j=c[ga+8>>2]|0;l=b+160|0;c[l>>2]=j;ca=c[b+52>>2]|0;fa=c[ca+8>>2]|0;e=b+164|0;c[e>>2]=fa;i=c[b+84>>2]|0;ea=c[i+8>>2]|0;f=b+168|0;c[f>>2]=ea;da=c[b+88>>2]|0;I=c[da+8>>2]|0;h=b+172|0;c[h>>2]=I;X=ga+44|0;_=b+176|0;Z=c[X>>2]|0;X=c[X+4>>2]|0;c[_>>2]=Z;c[_+4>>2]=X;_=ca+44|0;Y=b+184|0;$=c[_>>2]|0;_=c[_+4>>2]|0;c[Y>>2]=$;c[Y+4>>2]=_;Y=i+44|0;aa=b+192|0;W=c[Y>>2]|0;Y=c[Y+4>>2]|0;c[aa>>2]=W;c[aa+4>>2]=Y;aa=da+44|0;ha=b+200|0;ba=c[aa>>2]|0;aa=c[aa+4>>2]|0;c[ha>>2]=ba;c[ha+4>>2]=aa;E=+g[ga+136>>2];g[b+208>>2]=E;F=+g[ca+136>>2];g[b+212>>2]=F;G=+g[i+136>>2];g[b+216>>2]=G;H=+g[da+136>>2];g[b+220>>2]=H;B=+g[ga+144>>2];g[b+224>>2]=B;v=+g[ca+144>>2];g[b+228>>2]=v;x=+g[i+144>>2];g[b+232>>2]=x;C=+g[da+144>>2];g[b+236>>2]=C;da=c[d+28>>2]|0;K=+g[da+(j*12|0)+8>>2];i=d+32|0;ca=c[i>>2]|0;ga=ca+(j*12|0)|0;n=+g[ga>>2];m=+g[ga+4>>2];A=+g[ca+(j*12|0)+8>>2];M=+g[da+(fa*12|0)+8>>2];ga=ca+(fa*12|0)|0;p=+g[ga>>2];o=+g[ga+4>>2];u=+g[ca+(fa*12|0)+8>>2];z=+g[da+(ea*12|0)+8>>2];fa=ca+(ea*12|0)|0;r=+g[fa>>2];q=+g[fa+4>>2];y=+g[ca+(ea*12|0)+8>>2];O=+g[da+(I*12|0)+8>>2];da=ca+(I*12|0)|0;t=+g[da>>2];s=+g[da+4>>2];D=+g[ca+(I*12|0)+8>>2];J=+U(K);K=+T(K);N=+U(M);M=+T(M);w=+U(z);z=+T(z);P=+U(O);O=+T(O);I=b+272|0;g[I>>2]=0.0;Q=(c[k>>2]=ba,+g[k>>2]);R=(c[k>>2]=aa,+g[k>>2]);S=(c[k>>2]=$,+g[k>>2]);L=(c[k>>2]=_,+g[k>>2]);if((c[b+76>>2]|0)==1){g[b+240>>2]=0.0;g[b+244>>2]=0.0;g[b+256>>2]=1.0;g[b+264>>2]=1.0;V=B+x;z=0.0;w=0.0;K=1.0;J=1.0}else{V=(c[k>>2]=X,+g[k>>2]);la=(c[k>>2]=Z,+g[k>>2]);ia=(c[k>>2]=Y,+g[k>>2]);ma=+g[b+124>>2];ja=+g[b+128>>2];ka=z*ma-w*ja;ja=w*ma+z*ja;ma=+g[b+108>>2]-(c[k>>2]=W,+g[k>>2]);ia=+g[b+112>>2]-ia;la=+g[b+92>>2]-la;V=+g[b+96>>2]-V;ha=b+240|0;oa=+ka;na=+ja;g[ha>>2]=oa;g[ha+4>>2]=na;ia=ja*(z*ma-w*ia)-ka*(w*ma+z*ia);g[b+264>>2]=ia;K=ja*(K*la-J*V)-ka*(J*la+K*V);g[b+256>>2]=K;V=G+E+ia*x*ia+K*B*K;z=ka;w=ja;J=ia}V=V+0.0;g[I>>2]=V;if((c[b+80>>2]|0)==1){g[b+248>>2]=0.0;g[b+252>>2]=0.0;O=+g[b+152>>2];g[b+260>>2]=O;g[b+268>>2]=O;P=O*O*(v+C);M=0.0;L=0.0;N=O}else{ia=+g[b+132>>2];ja=+g[b+136>>2];ka=O*ia-P*ja;ja=P*ia+O*ja;Q=+g[b+116>>2]-Q;ia=+g[b+120>>2]-R;la=+g[b+100>>2]-S;ma=+g[b+104>>2]-L;na=+g[b+152>>2];oa=ka*na;L=ja*na;ha=b+248|0;R=+oa;S=+L;g[ha>>2]=R;g[ha+4>>2]=S;O=(ja*(O*Q-P*ia)-ka*(P*Q+O*ia))*na;g[b+268>>2]=O;N=na*(ja*(M*la-N*ma)-ka*(N*la+M*ma));g[b+260>>2]=N;P=na*na*(H+F)+O*C*O+N*N*v;M=oa}P=V+P;g[I>>2]=P;if(P>0.0){P=1.0/P}else{P=0.0}g[I>>2]=P;I=b+156|0;if((a[d+24|0]|0)==0){g[I>>2]=0.0}else{ka=+g[I>>2];oa=E*ka;na=ka*F;ma=ka*G;la=ka*H;D=D-ka*C*O;A=A+ka*B*K;y=y-ka*x*J;u=u+ka*v*N;t=t-M*la;s=s-L*la;r=r-z*ma;q=q-w*ma;p=p+M*na;o=o+na*L;n=n+z*oa;m=m+oa*w}ha=(c[i>>2]|0)+(j*12|0)|0;oa=+n;na=+m;g[ha>>2]=oa;g[ha+4>>2]=na;ha=c[i>>2]|0;g[ha+((c[l>>2]|0)*12|0)+8>>2]=A;ha=ha+((c[e>>2]|0)*12|0)|0;na=+p;oa=+o;g[ha>>2]=na;g[ha+4>>2]=oa;ha=c[i>>2]|0;g[ha+((c[e>>2]|0)*12|0)+8>>2]=u;ha=ha+((c[f>>2]|0)*12|0)|0;oa=+r;na=+q;g[ha>>2]=oa;g[ha+4>>2]=na;ha=c[i>>2]|0;g[ha+((c[f>>2]|0)*12|0)+8>>2]=y;ha=ha+((c[h>>2]|0)*12|0)|0;na=+t;oa=+s;g[ha>>2]=na;g[ha+4>>2]=oa;g[(c[i>>2]|0)+((c[h>>2]|0)*12|0)+8>>2]=D;return}function Kg(a,b){a=a|0;b=b|0;var d=0,e=0.0,f=0.0,h=0.0,i=0.0,j=0.0,k=0.0,l=0,m=0.0,n=0.0,o=0.0,p=0.0,q=0.0,r=0.0,s=0,t=0.0,u=0.0,v=0.0,w=0.0,x=0,y=0.0,z=0,A=0.0,B=0.0,C=0.0,D=0.0,E=0.0,F=0,G=0,H=0;x=a+160|0;s=c[x>>2]|0;d=b+32|0;G=c[d>>2]|0;z=G+(s*12|0)|0;B=+g[z>>2];C=+g[z+4>>2];u=+g[G+(s*12|0)+8>>2];s=a+164|0;l=c[s>>2]|0;b=G+(l*12|0)|0;v=+g[b>>2];w=+g[b+4>>2];n=+g[G+(l*12|0)+8>>2];l=a+168|0;b=c[l>>2]|0;F=G+(b*12|0)|0;r=+g[F>>2];q=+g[F+4>>2];f=+g[G+(b*12|0)+8>>2];b=a+172|0;F=c[b>>2]|0;H=G+(F*12|0)|0;k=+g[H>>2];j=+g[H+4>>2];E=+g[G+(F*12|0)+8>>2];o=+g[a+240>>2];p=+g[a+244>>2];h=+g[a+248>>2];i=+g[a+252>>2];y=+g[a+256>>2];m=+g[a+264>>2];t=+g[a+260>>2];e=+g[a+268>>2];D=((B-r)*o+(C-q)*p+((v-k)*h+(w-j)*i)+(u*y-f*m+(n*t-E*e)))*(-0.0- +g[a+272>>2]);F=a+156|0;g[F>>2]=+g[F>>2]+D;A=+g[a+208>>2]*D;y=u+D*+g[a+224>>2]*y;u=D*+g[a+212>>2];t=n+D*+g[a+228>>2]*t;n=D*+g[a+216>>2];m=f-D*+g[a+232>>2]*m;f=D*+g[a+220>>2];e=E-D*+g[a+236>>2]*e;B=+(B+o*A);A=+(C+p*A);g[z>>2]=B;g[z+4>>2]=A;a=c[d>>2]|0;g[a+((c[x>>2]|0)*12|0)+8>>2]=y;a=a+((c[s>>2]|0)*12|0)|0;v=+(v+h*u);u=+(w+u*i);g[a>>2]=v;g[a+4>>2]=u;a=c[d>>2]|0;g[a+((c[s>>2]|0)*12|0)+8>>2]=t;a=a+((c[l>>2]|0)*12|0)|0;o=+(r-o*n);n=+(q-p*n);g[a>>2]=o;g[a+4>>2]=n;a=c[d>>2]|0;g[a+((c[l>>2]|0)*12|0)+8>>2]=m;a=a+((c[b>>2]|0)*12|0)|0;h=+(k-h*f);f=+(j-i*f);g[a>>2]=h;g[a+4>>2]=f;g[(c[d>>2]|0)+((c[b>>2]|0)*12|0)+8>>2]=e;return}function Lg(a,b){a=a|0;b=b|0;var d=0,e=0.0,f=0.0,h=0,i=0.0,j=0.0,k=0.0,l=0,m=0.0,n=0.0,o=0.0,p=0,q=0,r=0.0,s=0.0,t=0.0,u=0.0,v=0.0,w=0.0,x=0.0,y=0.0,z=0.0,A=0.0,B=0.0,C=0.0,D=0.0,E=0.0,F=0.0,G=0.0,H=0.0,I=0.0,J=0.0,K=0.0,L=0.0,M=0,N=0,O=0,P=0.0,Q=0.0,R=0.0,S=0.0,V=0.0,W=0.0,X=0.0;d=a+160|0;h=c[d>>2]|0;b=b+28|0;N=c[b>>2]|0;q=N+(h*12|0)|0;u=+g[q>>2];t=+g[q+4>>2];e=+g[N+(h*12|0)+8>>2];h=a+164|0;l=c[h>>2]|0;p=N+(l*12|0)|0;i=+g[p>>2];j=+g[p+4>>2];k=+g[N+(l*12|0)+8>>2];l=a+168|0;p=c[l>>2]|0;M=N+(p*12|0)|0;m=+g[M>>2];n=+g[M+4>>2];o=+g[N+(p*12|0)+8>>2];p=a+172|0;M=c[p>>2]|0;O=N+(M*12|0)|0;f=+g[O>>2];r=+g[O+4>>2];s=+g[N+(M*12|0)+8>>2];v=+U(e);w=+T(e);D=+U(k);E=+T(k);x=+U(o);y=+T(o);H=+U(s);F=+T(s);if((c[a+76>>2]|0)==1){z=+g[a+224>>2];A=+g[a+232>>2];B=z+A;w=1.0;v=1.0;C=e-o- +g[a+140>>2];x=0.0;y=0.0}else{Q=+g[a+124>>2];G=+g[a+128>>2];K=y*Q-x*G;L=x*Q+y*G;P=+g[a+108>>2]- +g[a+192>>2];C=+g[a+112>>2]- +g[a+196>>2];A=+g[a+92>>2]- +g[a+176>>2];J=+g[a+96>>2]- +g[a+180>>2];I=w*A-v*J;J=v*A+w*J;w=L*(y*P-x*C)-K*(x*P+y*C);v=L*I-K*J;A=+g[a+232>>2];z=+g[a+224>>2];I=u-m+I;J=t-n+J;B=+g[a+216>>2]+ +g[a+208>>2]+w*w*A+v*z*v;C=Q*(y*I+x*J-P)+G*(I*(-0.0-x)+y*J-C);x=K;y=L}if((c[a+80>>2]|0)==1){L=+g[a+152>>2];F=+g[a+228>>2];H=+g[a+236>>2];G=L*L*(F+H);D=L;E=L;K=k-s- +g[a+144>>2];J=0.0;I=0.0}else{X=+g[a+132>>2];V=+g[a+136>>2];J=F*X-H*V;I=H*X+F*V;W=+g[a+116>>2]- +g[a+200>>2];K=+g[a+120>>2]- +g[a+204>>2];L=+g[a+100>>2]- +g[a+184>>2];R=+g[a+104>>2]- +g[a+188>>2];S=E*L-D*R;R=D*L+E*R;L=+g[a+152>>2];D=L*(I*(F*W-H*K)-J*(H*W+F*K));E=L*(I*S-J*R);Q=+g[a+236>>2];P=+g[a+228>>2];S=i-f+S;R=j-r+R;G=L*L*(+g[a+220>>2]+ +g[a+212>>2])+D*D*Q+E*P*E;K=X*(F*S+H*R-W)+V*(S*(-0.0-H)+F*R-K);J=J*L;I=I*L;F=P;H=Q}B=B+0.0+G;if(B>0.0){B=(-0.0-(C+K*L- +g[a+148>>2]))/B}else{B=0.0}S=B*+g[a+208>>2];V=B*+g[a+212>>2];W=B*+g[a+216>>2];X=B*+g[a+220>>2];R=+(u+x*S);S=+(t+y*S);g[q>>2]=R;g[q+4>>2]=S;O=c[b>>2]|0;g[O+((c[d>>2]|0)*12|0)+8>>2]=e+v*B*z;O=O+((c[h>>2]|0)*12|0)|0;S=+(i+J*V);V=+(j+I*V);g[O>>2]=S;g[O+4>>2]=V;O=c[b>>2]|0;g[O+((c[h>>2]|0)*12|0)+8>>2]=k+E*B*F;O=O+((c[l>>2]|0)*12|0)|0;V=+(m-x*W);W=+(n-y*W);g[O>>2]=V;g[O+4>>2]=W;O=c[b>>2]|0;g[O+((c[l>>2]|0)*12|0)+8>>2]=o-w*B*A;O=O+((c[p>>2]|0)*12|0)|0;W=+(f-J*X);X=+(r-I*X);g[O>>2]=W;g[O+4>>2]=X;g[(c[b>>2]|0)+((c[p>>2]|0)*12|0)+8>>2]=s-D*B*H;return 1}function Mg(a,b){a=a|0;b=b|0;var d=0.0,e=0.0,f=0.0,h=0.0,i=0.0,j=0;j=c[b+48>>2]|0;i=+g[j+24>>2];h=+g[b+92>>2];f=+g[j+20>>2];e=+g[b+96>>2];d=h*f+i*e+ +g[j+16>>2];g[a>>2]=+g[j+12>>2]+(i*h-f*e);g[a+4>>2]=d;return}function Ng(a,b){a=a|0;b=b|0;var d=0.0,e=0.0,f=0.0,h=0.0,i=0.0,j=0;j=c[b+52>>2]|0;i=+g[j+24>>2];h=+g[b+100>>2];f=+g[j+20>>2];e=+g[b+104>>2];d=h*f+i*e+ +g[j+16>>2];g[a>>2]=+g[j+12>>2]+(i*h-f*e);g[a+4>>2]=d;return}function Og(a,b,c){a=a|0;b=b|0;c=+c;var d=0.0,e=0.0;e=+g[b+156>>2];d=e*+g[b+244>>2]*c;g[a>>2]=e*+g[b+240>>2]*c;g[a+4>>2]=d;return}function Pg(a,b){a=a|0;b=+b;return+(+g[a+156>>2]*+g[a+256>>2]*b)}function Qg(a){a=a|0;return+(+g[a+152>>2])}function Rg(a){a=a|0;var b=0,e=0,f=0,j=0,k=0,l=0;b=i;l=c[(c[a+48>>2]|0)+8>>2]|0;k=c[(c[a+52>>2]|0)+8>>2]|0;j=c[(c[a+68>>2]|0)+56>>2]|0;f=c[(c[a+72>>2]|0)+56>>2]|0;zm(3344,(e=i,i=i+1|0,i=i+7&-8,c[e>>2]=0,e)|0);i=e;zm(3856,(e=i,i=i+8|0,c[e>>2]=l,e)|0);i=e;zm(3032,(e=i,i=i+8|0,c[e>>2]=k,e)|0);i=e;zm(2608,(e=i,i=i+8|0,c[e>>2]=d[a+61|0]|0,e)|0);i=e;zm(2152,(e=i,i=i+8|0,c[e>>2]=j,e)|0);i=e;zm(1672,(e=i,i=i+8|0,c[e>>2]=f,e)|0);i=e;zm(1264,(e=i,i=i+8|0,h[e>>3]=+g[a+152>>2],e)|0);i=e;zm(880,(e=i,i=i+8|0,c[e>>2]=c[a+56>>2],e)|0);i=e;i=b;return}function Sg(a){a=a|0;return}function Tg(a){a=a|0;$m(a);return}function Ug(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var h=0.0,i=0.0,j=0.0,k=0.0,l=0.0,m=0,n=0,o=0,p=0;c[a+8>>2]=b;c[a+12>>2]=d;o=e|0;i=+g[o>>2]- +g[b+12>>2];n=e+4|0;j=+g[n>>2]- +g[b+16>>2];m=b+24|0;l=+g[m>>2];e=b+20|0;k=+g[e>>2];p=a+20|0;h=+(i*l+j*k);k=+(l*j+i*(-0.0-k));g[p>>2]=h;g[p+4>>2]=k;k=+g[o>>2]- +g[d+12>>2];h=+g[n>>2]- +g[d+16>>2];i=+g[d+24>>2];j=+g[d+20>>2];n=a+28|0;l=+(k*i+h*j);j=+(i*h+k*(-0.0-j));g[n>>2]=l;g[n+4>>2]=j;j=+g[m>>2];l=+g[f>>2];k=+g[e>>2];h=+g[f+4>>2];e=a+36|0;i=+(j*l+k*h);h=+(l*(-0.0-k)+j*h);g[e>>2]=i;g[e+4>>2]=h;g[a+44>>2]=+g[d+72>>2]- +g[b+72>>2];return}function Vg(b,d){b=b|0;d=d|0;var e=0.0,f=0.0,h=0,i=0.0,j=0,l=0,m=0;yh(b|0,d|0);c[b>>2]=5088;h=b+84|0;m=d+20|0;l=b+68|0;j=c[m+4>>2]|0;c[l>>2]=c[m>>2];c[l+4>>2]=j;l=d+28|0;j=b+76|0;m=c[l+4>>2]|0;c[j>>2]=c[l>>2];c[j+4>>2]=m;j=d+36|0;m=h;l=c[j>>2]|0;j=c[j+4>>2]|0;c[m>>2]=l;c[m+4>>2]=j;e=(c[k>>2]=l,+g[k>>2]);f=(c[k>>2]=j,+g[k>>2]);i=+R(e*e+f*f);if(!(i<1.1920928955078125e-7)){i=1.0/i;e=e*i;g[h>>2]=e;f=f*i;g[b+88>>2]=f}m=b+92|0;f=+(f*-1.0);i=+e;g[m>>2]=f;g[m+4>>2]=i;g[b+100>>2]=+g[d+44>>2];g[b+252>>2]=0.0;en(b+104|0,0,16)|0;g[b+120>>2]=+g[d+52>>2];g[b+124>>2]=+g[d+56>>2];g[b+128>>2]=+g[d+64>>2];g[b+132>>2]=+g[d+68>>2];a[b+136|0]=a[d+48|0]|0;a[b+137|0]=a[d+60|0]|0;c[b+140>>2]=0;en(b+184|0,0,16)|0;return}function Wg(b,d){b=b|0;d=d|0;var e=0.0,f=0.0,h=0.0,i=0.0,j=0.0,l=0,m=0,n=0,o=0,p=0.0,q=0.0,r=0.0,s=0.0,t=0.0,u=0.0,v=0.0,w=0.0,x=0.0,y=0.0,z=0.0,A=0.0,B=0.0,C=0.0,D=0.0,E=0.0,F=0.0,G=0.0,H=0.0,I=0.0,J=0.0,K=0.0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,V=0.0,W=0.0;l=c[b+48>>2]|0;m=c[l+8>>2]|0;n=b+144|0;c[n>>2]=m;R=c[b+52>>2]|0;P=c[R+8>>2]|0;o=b+148|0;c[o>>2]=P;N=l+44|0;L=b+152|0;O=c[N>>2]|0;N=c[N+4>>2]|0;c[L>>2]=O;c[L+4>>2]=N;L=R+44|0;Q=b+160|0;M=c[L>>2]|0;L=c[L+4>>2]|0;c[Q>>2]=M;c[Q+4>>2]=L;w=+g[l+136>>2];g[b+168>>2]=w;e=+g[R+136>>2];g[b+172>>2]=e;r=+g[l+144>>2];g[b+176>>2]=r;t=+g[R+144>>2];g[b+180>>2]=t;R=c[d+28>>2]|0;l=R+(m*12|0)|0;D=+g[l>>2];E=+g[l+4>>2];z=+g[R+(m*12|0)+8>>2];l=d+32|0;Q=c[l>>2]|0;S=Q+(m*12|0)|0;i=+g[S>>2];j=+g[S+4>>2];x=+g[Q+(m*12|0)+8>>2];S=R+(P*12|0)|0;q=+g[S>>2];u=+g[S+4>>2];p=+g[R+(P*12|0)+8>>2];R=Q+(P*12|0)|0;f=+g[R>>2];h=+g[R+4>>2];v=+g[Q+(P*12|0)+8>>2];K=+U(z);z=+T(z);F=+U(p);p=+T(p);s=+g[b+68>>2]-(c[k>>2]=O,+g[k>>2]);J=+g[b+72>>2]-(c[k>>2]=N,+g[k>>2]);A=z*s-K*J;J=K*s+z*J;s=+g[b+76>>2]-(c[k>>2]=M,+g[k>>2]);B=+g[b+80>>2]-(c[k>>2]=L,+g[k>>2]);I=p*s-F*B;B=F*s+p*B;D=q-D+I-A;E=u-E+B-J;u=+g[b+84>>2];q=+g[b+88>>2];p=z*u-K*q;q=K*u+z*q;L=b+184|0;u=+p;s=+q;g[L>>2]=u;g[L+4>>2]=s;A=A+D;J=J+E;s=A*q-J*p;g[b+208>>2]=s;u=I*q-B*p;g[b+212>>2]=u;F=w+e;H=r*s;G=t*u;C=F+s*H+u*G;if(C>0.0){y=1.0/C}else{y=C}g[b+252>>2]=y;W=+g[b+92>>2];V=+g[b+96>>2];y=z*W-K*V;z=K*W+z*V;S=b+192|0;V=+y;W=+z;g[S>>2]=V;g[S+4>>2]=W;A=A*z-J*y;g[b+200>>2]=A;B=I*z-B*y;g[b+204>>2]=B;W=r*A;V=t*B;K=W+V;I=W*s+V*u;J=t+r;G=H+G;g[b+216>>2]=F+A*W+B*V;g[b+220>>2]=K;g[b+224>>2]=I;g[b+228>>2]=K;g[b+232>>2]=J==0.0?1.0:J;g[b+236>>2]=G;g[b+240>>2]=I;g[b+244>>2]=G;g[b+248>>2]=C;do{if((a[b+136|0]|0)==0){c[b+140>>2]=0;g[b+112>>2]=0.0}else{C=D*p+E*q;D=+g[b+124>>2];E=+g[b+120>>2];F=D-E;if(!(F>0.0)){F=-0.0-F}if(F<.009999999776482582){c[b+140>>2]=3;break}if(!(C>E)){L=b+140|0;if((c[L>>2]|0)==1){break}c[L>>2]=1;g[b+112>>2]=0.0;break}L=b+140|0;if(C<D){c[L>>2]=0;g[b+112>>2]=0.0;break}if((c[L>>2]|0)==2){break}c[L>>2]=2;g[b+112>>2]=0.0}}while(0);if((a[b+137|0]|0)==0){g[b+116>>2]=0.0}L=b+104|0;if((a[d+24|0]|0)==0){en(L|0,0,16)|0;J=x;W=v;K=f;V=h;H=i;I=j;S=c[l>>2]|0;S=S+(m*12|0)|0;O=(g[k>>2]=H,c[k>>2]|0);Q=(g[k>>2]=I,c[k>>2]|0);R=0;P=0;O=R|O;P=Q|P;Q=S|0;c[Q>>2]=O;S=S+4|0;c[S>>2]=P;S=c[n>>2]|0;P=c[l>>2]|0;S=P+(S*12|0)+8|0;g[S>>2]=J;S=c[o>>2]|0;S=P+(S*12|0)|0;P=(g[k>>2]=K,c[k>>2]|0);Q=(g[k>>2]=V,c[k>>2]|0);O=0;R=0;P=O|P;R=Q|R;Q=S|0;c[Q>>2]=P;S=S+4|0;c[S>>2]=R;S=c[o>>2]|0;R=c[l>>2]|0;S=R+(S*12|0)+8|0;g[S>>2]=W;return}else{O=d+8|0;W=+g[O>>2];S=L|0;K=W*+g[S>>2];g[S>>2]=K;S=b+108|0;V=W*+g[S>>2];g[S>>2]=V;S=b+112|0;W=W*+g[S>>2];g[S>>2]=W;S=b+116|0;H=+g[O>>2]*+g[S>>2];g[S>>2]=H;W=H+W;H=K*y+p*W;I=K*z+W*q;J=x-r*(K*A+V+W*s);W=v+t*(V+K*B+W*u);K=f+e*H;V=h+e*I;H=i-w*H;I=j-w*I;S=c[l>>2]|0;S=S+(m*12|0)|0;O=(g[k>>2]=H,c[k>>2]|0);Q=(g[k>>2]=I,c[k>>2]|0);R=0;P=0;O=R|O;P=Q|P;Q=S|0;c[Q>>2]=O;S=S+4|0;c[S>>2]=P;S=c[n>>2]|0;P=c[l>>2]|0;S=P+(S*12|0)+8|0;g[S>>2]=J;S=c[o>>2]|0;S=P+(S*12|0)|0;P=(g[k>>2]=K,c[k>>2]|0);Q=(g[k>>2]=V,c[k>>2]|0);O=0;R=0;P=O|P;R=Q|R;Q=S|0;c[Q>>2]=P;S=S+4|0;c[S>>2]=R;S=c[o>>2]|0;R=c[l>>2]|0;S=R+(S*12|0)+8|0;g[S>>2]=W;return}}function Xg(b,d){b=b|0;d=d|0;var e=0,f=0.0,h=0.0,j=0,k=0.0,l=0.0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0.0,u=0.0,v=0.0,w=0.0,x=0.0,y=0.0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0.0,H=0,I=0,J=0.0,K=0.0,L=0,M=0,N=0,O=0.0,P=0.0,Q=0.0,R=0.0,S=0,T=0.0;m=i;i=i+64|0;r=m|0;s=m+16|0;p=m+32|0;q=m+40|0;C=m+48|0;A=m+56|0;n=b+144|0;j=c[n>>2]|0;o=d+32|0;N=c[o>>2]|0;S=N+(j*12|0)|0;x=+g[S>>2];y=+g[S+4>>2];t=+g[N+(j*12|0)+8>>2];j=b+148|0;S=c[j>>2]|0;M=N+(S*12|0)|0;v=+g[M>>2];w=+g[M+4>>2];u=+g[N+(S*12|0)+8>>2];f=+g[b+168>>2];k=+g[b+172>>2];h=+g[b+176>>2];l=+g[b+180>>2];do{if((a[b+137|0]|0)!=0){if((c[b+140>>2]|0)==3){break}K=+g[b+184>>2];P=+g[b+188>>2];G=+g[b+212>>2];O=+g[b+208>>2];z=b+116|0;J=+g[z>>2];R=+g[d>>2]*+g[b+128>>2];T=J+ +g[b+252>>2]*(+g[b+132>>2]-((v-x)*K+(w-y)*P+u*G-t*O));Q=-0.0-R;R=T<R?T:R;Q=R<Q?Q:R;g[z>>2]=Q;Q=Q-J;R=K*Q;T=P*Q;t=t-h*O*Q;u=u+l*G*Q;v=v+k*R;w=w+k*T;x=x-f*R;y=y-f*T}}while(0);R=v-x;Q=w-y;z=b+192|0;d=b+196|0;B=b+204|0;D=b+200|0;O=R*+g[z>>2]+Q*+g[d>>2]+u*+g[B>>2]-t*+g[D>>2];P=u-t;do{if((a[b+136|0]|0)==0){e=10}else{F=b+140|0;if((c[F>>2]|0)==0){e=10;break}A=b+184|0;C=b+188|0;E=b+212|0;I=b+208|0;M=b+104|0;K=+g[M>>2];L=b+108|0;J=+g[L>>2];H=b+112|0;G=+g[H>>2];N=b+216|0;O=-0.0-O;P=-0.0-P;Q=-0.0-(R*+g[A>>2]+Q*+g[C>>2]+u*+g[E>>2]-t*+g[I>>2]);g[s>>2]=O;g[s+4>>2]=P;g[s+8>>2]=Q;om(r,N,s);s=r|0;g[M>>2]=+g[s>>2]+ +g[M>>2];S=r+4|0;g[L>>2]=+g[S>>2]+ +g[L>>2];r=r+8|0;Q=+g[r>>2]+ +g[H>>2];g[H>>2]=Q;F=c[F>>2]|0;if((F|0)==1){Q=Q>0.0?Q:0.0;g[H>>2]=Q}else if((F|0)==2){Q=Q<0.0?Q:0.0;g[H>>2]=Q}R=Q-G;T=P-R*+g[b+244>>2];g[p>>2]=O- +g[b+240>>2]*R;g[p+4>>2]=T;pm(q,N,p);T=K+ +g[q>>2];O=J+ +g[q+4>>2];g[M>>2]=T;g[L>>2]=O;T=T-K;J=O-J;O=+g[H>>2]-G;g[s>>2]=T;g[S>>2]=J;g[r>>2]=O;G=T*+g[D>>2]+J+O*+g[I>>2];J=J+T*+g[B>>2]+O*+g[E>>2];K=T*+g[d>>2]+O*+g[C>>2];O=T*+g[z>>2]+O*+g[A>>2]}}while(0);if((e|0)==10){g[A>>2]=-0.0-O;g[A+4>>2]=-0.0-P;pm(C,b+216|0,A);O=+g[C>>2];S=b+104|0;g[S>>2]=O+ +g[S>>2];J=+g[C+4>>2];S=b+108|0;g[S>>2]=J+ +g[S>>2];G=O*+g[D>>2]+J;J=J+O*+g[B>>2];K=O*+g[d>>2];O=O*+g[z>>2]}S=(c[o>>2]|0)+((c[n>>2]|0)*12|0)|0;T=+(x-f*O);R=+(y-f*K);g[S>>2]=T;g[S+4>>2]=R;S=c[o>>2]|0;g[S+((c[n>>2]|0)*12|0)+8>>2]=t-h*G;S=S+((c[j>>2]|0)*12|0)|0;R=+(v+k*O);T=+(w+k*K);g[S>>2]=R;g[S+4>>2]=T;g[(c[o>>2]|0)+((c[j>>2]|0)*12|0)+8>>2]=u+l*J;i=m;return}function Yg(b,d){b=b|0;d=d|0;var e=0,f=0,h=0.0,j=0.0,k=0.0,l=0.0,m=0.0,n=0.0,o=0.0,p=0.0,q=0.0,r=0,s=0.0,t=0.0,u=0.0,v=0.0,w=0.0,x=0.0,y=0.0,z=0.0,A=0.0,B=0.0,C=0,D=0,E=0.0,F=0,G=0.0,H=0,I=0,J=0.0,K=0.0,L=0.0,M=0.0,N=0.0,O=0.0,P=0.0,Q=0.0,R=0.0,S=0.0,V=0,W=0;f=i;i=i+72|0;H=f|0;F=f+40|0;I=f+56|0;e=b+144|0;C=c[e>>2]|0;d=d+28|0;D=c[d>>2]|0;r=D+(C*12|0)|0;j=+g[r>>2];l=+g[r+4>>2];m=+g[D+(C*12|0)+8>>2];r=b+148|0;V=c[r>>2]|0;W=D+(V*12|0)|0;s=+g[W>>2];h=+g[W+4>>2];v=+g[D+(V*12|0)+8>>2];Q=+U(m);S=+T(m);o=+U(v);L=+T(v);k=+g[b+168>>2];t=+g[b+172>>2];n=+g[b+176>>2];w=+g[b+180>>2];K=+g[b+68>>2]- +g[b+152>>2];p=+g[b+72>>2]- +g[b+156>>2];E=S*K-Q*p;p=Q*K+S*p;K=+g[b+76>>2]- +g[b+160>>2];y=+g[b+80>>2]- +g[b+164>>2];G=L*K-o*y;y=o*K+L*y;L=s+G-j-E;K=h+y-l-p;o=+g[b+84>>2];u=+g[b+88>>2];z=S*o-Q*u;u=Q*o+S*u;E=E+L;p=p+K;o=u*E-z*p;x=G*u-y*z;R=+g[b+92>>2];A=+g[b+96>>2];B=S*R-Q*A;A=Q*R+S*A;p=A*E-B*p;y=G*A-y*B;G=B*L+A*K;E=v-m- +g[b+100>>2];if(G>0.0){J=G}else{J=-0.0-G}if(E>0.0){q=E}else{q=-0.0-E}do{if((a[b+136|0]|0)==0){b=0;M=0.0}else{K=z*L+u*K;M=+g[b+124>>2];L=+g[b+120>>2];N=M-L;if(!(N>0.0)){N=-0.0-N}if(N<.009999999776482582){L=K<.20000000298023224?K:.20000000298023224;if(!(K>0.0)){K=-0.0-K}J=J>K?J:K;b=1;M=L<-.20000000298023224?-.20000000298023224:L;break}if(!(K>L)){M=K-L+.004999999888241291;M=M<0.0?M:0.0;K=L-K;J=J>K?J:K;b=1;M=M<-.20000000298023224?-.20000000298023224:M;break}if(K<M){b=0;M=0.0;break}L=K-M;K=L+-.004999999888241291;K=K<.20000000298023224?K:.20000000298023224;J=J>L?J:L;b=1;M=K<0.0?0.0:K}}while(0);N=k+t;O=n*p;P=w*y;L=y*P+(N+p*O);K=P+O;if(b){P=x*P+o*O;O=n+w;S=n*o;R=w*x;Q=R+S;g[H>>2]=L;g[H+4>>2]=K;g[H+8>>2]=P;g[H+12>>2]=K;g[H+16>>2]=O==0.0?1.0:O;g[H+20>>2]=Q;g[H+24>>2]=P;g[H+28>>2]=Q;g[H+32>>2]=x*R+(N+o*S);g[I>>2]=-0.0-G;g[I+4>>2]=-0.0-E;g[I+8>>2]=-0.0-M;om(F,H,I);E=+g[F>>2];G=+g[F+4>>2];K=+g[F+8>>2];C=c[e>>2]|0;D=c[d>>2]|0}else{M=n+w;M=M==0.0?1.0:M;G=-0.0-G;N=-0.0-E;O=M*L-K*K;if(O!=0.0){O=1.0/O}E=(M*G-K*N)*O;G=(L*N-K*G)*O;K=0.0}R=z*K+B*E;S=u*K+A*E;W=D+(C*12|0)|0;P=+(j-k*R);Q=+(l-k*S);g[W>>2]=P;g[W+4>>2]=Q;W=c[d>>2]|0;g[W+((c[e>>2]|0)*12|0)+8>>2]=m-n*(o*K+(G+p*E));W=W+((c[r>>2]|0)*12|0)|0;R=+(s+t*R);S=+(h+t*S);g[W>>2]=R;g[W+4>>2]=S;g[(c[d>>2]|0)+((c[r>>2]|0)*12|0)+8>>2]=v+w*(x*K+(G+y*E));if(J>.004999999888241291){W=0;i=f;return W|0}W=q<=.03490658849477768;i=f;return W|0}function Zg(a,b){a=a|0;b=b|0;var d=0.0,e=0.0,f=0.0,h=0.0,i=0.0,j=0;j=c[b+48>>2]|0;i=+g[j+24>>2];h=+g[b+68>>2];f=+g[j+20>>2];e=+g[b+72>>2];d=h*f+i*e+ +g[j+16>>2];g[a>>2]=+g[j+12>>2]+(i*h-f*e);g[a+4>>2]=d;return}function _g(a,b){a=a|0;b=b|0;var d=0.0,e=0.0,f=0.0,h=0.0,i=0.0,j=0;j=c[b+52>>2]|0;i=+g[j+24>>2];h=+g[b+76>>2];f=+g[j+20>>2];e=+g[b+80>>2];d=h*f+i*e+ +g[j+16>>2];g[a>>2]=+g[j+12>>2]+(i*h-f*e);g[a+4>>2]=d;return}function $g(a,b,c){a=a|0;b=b|0;c=+c;var d=0.0,e=0.0,f=0.0;f=+g[b+104>>2];e=+g[b+116>>2]+ +g[b+112>>2];d=(f*+g[b+196>>2]+e*+g[b+188>>2])*c;g[a>>2]=(f*+g[b+192>>2]+ +g[b+184>>2]*e)*c;g[a+4>>2]=d;return}function ah(a,b){a=a|0;b=+b;return+(+g[a+108>>2]*b)}function bh(a){a=a|0;var b=0.0,d=0.0,e=0.0,f=0.0,h=0,i=0.0,j=0.0,k=0,l=0.0,m=0.0,n=0.0,o=0.0;h=c[a+48>>2]|0;d=+g[h+24>>2];j=+g[a+68>>2];f=+g[h+20>>2];i=+g[a+72>>2];k=c[a+52>>2]|0;m=+g[k+24>>2];o=+g[a+76>>2];n=+g[k+20>>2];l=+g[a+80>>2];e=+g[a+84>>2];b=+g[a+88>>2];return+((+g[k+12>>2]+(m*o-n*l)-(+g[h+12>>2]+(d*j-f*i)))*(d*e-f*b)+(o*n+m*l+ +g[k+16>>2]-(j*f+d*i+ +g[h+16>>2]))*(f*e+d*b))}function ch(b){b=b|0;return(a[b+136|0]|0)!=0|0}function dh(e,f){e=e|0;f=f|0;var h=0,i=0,j=0,k=0;h=e+136|0;if((f&1|0)==(d[h]|0|0)){return}i=c[e+48>>2]|0;j=i+4|0;k=b[j>>1]|0;if((k&2)==0){b[j>>1]=k|2;g[i+160>>2]=0.0}i=c[e+52>>2]|0;j=i+4|0;k=b[j>>1]|0;if((k&2)==0){b[j>>1]=k|2;g[i+160>>2]=0.0}a[h]=f&1;g[e+112>>2]=0.0;return}function eh(b){b=b|0;return(a[b+137|0]|0)!=0|0}function fh(d,e){d=d|0;e=e|0;var f=0,h=0,i=0;f=c[d+48>>2]|0;h=f+4|0;i=b[h>>1]|0;if((i&2)==0){b[h>>1]=i|2;g[f+160>>2]=0.0}i=c[d+52>>2]|0;h=i+4|0;f=b[h>>1]|0;if(!((f&2)==0)){i=d+137|0;h=e&1;a[i]=h;return}b[h>>1]=f|2;g[i+160>>2]=0.0;i=d+137|0;h=e&1;a[i]=h;return}function gh(a,d){a=a|0;d=+d;var e=0,f=0,h=0;e=c[a+48>>2]|0;f=e+4|0;h=b[f>>1]|0;if((h&2)==0){b[f>>1]=h|2;g[e+160>>2]=0.0}h=c[a+52>>2]|0;f=h+4|0;e=b[f>>1]|0;if(!((e&2)==0)){h=a+132|0;g[h>>2]=d;return}b[f>>1]=e|2;g[h+160>>2]=0.0;h=a+132|0;g[h>>2]=d;return}function hh(a,b){a=a|0;b=+b;return+(+g[a+116>>2]*b)}function ih(a){a=a|0;var b=0,e=0,f=0.0,j=0,k=0;b=i;k=c[(c[a+48>>2]|0)+8>>2]|0;j=c[(c[a+52>>2]|0)+8>>2]|0;zm(3312,(e=i,i=i+1|0,i=i+7&-8,c[e>>2]=0,e)|0);i=e;zm(3824,(e=i,i=i+8|0,c[e>>2]=k,e)|0);i=e;zm(3e3,(e=i,i=i+8|0,c[e>>2]=j,e)|0);i=e;zm(2568,(e=i,i=i+8|0,c[e>>2]=d[a+61|0]|0,e)|0);i=e;f=+g[a+72>>2];zm(2104,(e=i,i=i+16|0,h[e>>3]=+g[a+68>>2],h[e+8>>3]=f,e)|0);i=e;f=+g[a+80>>2];zm(1624,(e=i,i=i+16|0,h[e>>3]=+g[a+76>>2],h[e+8>>3]=f,e)|0);i=e;f=+g[a+88>>2];zm(1224,(e=i,i=i+16|0,h[e>>3]=+g[a+84>>2],h[e+8>>3]=f,e)|0);i=e;zm(848,(e=i,i=i+8|0,h[e>>3]=+g[a+100>>2],e)|0);i=e;zm(488,(e=i,i=i+8|0,c[e>>2]=d[a+136|0]|0,e)|0);i=e;zm(200,(e=i,i=i+8|0,h[e>>3]=+g[a+120>>2],e)|0);i=e;zm(4240,(e=i,i=i+8|0,h[e>>3]=+g[a+124>>2],e)|0);i=e;zm(4096,(e=i,i=i+8|0,c[e>>2]=d[a+137|0]|0,e)|0);i=e;zm(3728,(e=i,i=i+8|0,h[e>>3]=+g[a+132>>2],e)|0);i=e;zm(3520,(e=i,i=i+8|0,h[e>>3]=+g[a+128>>2],e)|0);i=e;zm(3392,(e=i,i=i+8|0,c[e>>2]=c[a+56>>2],e)|0);i=e;i=b;return}function jh(a){a=a|0;return}function kh(a){a=a|0;$m(a);return}function lh(a,b){a=a|0;b=b|0;var d=0,e=0,f=0;yh(a|0,b|0);c[a>>2]=5936;e=b+20|0;f=a+68|0;d=c[e+4>>2]|0;c[f>>2]=c[e>>2];c[f+4>>2]=d;f=b+28|0;d=a+76|0;e=c[f+4>>2]|0;c[d>>2]=c[f>>2];c[d+4>>2]=e;g[a+84>>2]=+g[b+36>>2];g[a+160>>2]=0.0;g[a+92>>2]=0.0;c[a+164>>2]=0;g[a+88>>2]=0.0;return}



function Fb(a){a=a|0;var b=0;b=i;i=i+a|0;i=i+7&-8;return b|0}function Gb(){return i|0}function Hb(a){a=a|0;i=a}function Ib(a,b){a=a|0;b=b|0;if((s|0)==0){s=a;t=b}}function Jb(b){b=b|0;a[k]=a[b];a[k+1|0]=a[b+1|0];a[k+2|0]=a[b+2|0];a[k+3|0]=a[b+3|0]}function Kb(b){b=b|0;a[k]=a[b];a[k+1|0]=a[b+1|0];a[k+2|0]=a[b+2|0];a[k+3|0]=a[b+3|0];a[k+4|0]=a[b+4|0];a[k+5|0]=a[b+5|0];a[k+6|0]=a[b+6|0];a[k+7|0]=a[b+7|0]}function Lb(a){a=a|0;F=a}function Mb(a){a=a|0;G=a}function Nb(a){a=a|0;H=a}function Ob(a){a=a|0;I=a}function Pb(a){a=a|0;J=a}function Qb(a){a=a|0;K=a}function Rb(a){a=a|0;L=a}function Sb(a){a=a|0;M=a}function Tb(a){a=a|0;N=a}function Ub(a){a=a|0;O=a}function Vb(){c[1896]=o+8;c[1900]=o+8;c[1904]=o+8;c[1908]=o+8;c[1912]=o+8;c[1916]=o+8;c[1920]=p+8;c[1922]=p+8;c[1924]=o+8;c[1928]=p+8;c[1930]=p+8;c[1932]=o+8;c[1936]=o+8;c[1940]=o+8;c[1944]=p+8;c[1946]=p+8;c[1948]=p+8;c[1950]=o+8;c[1954]=o+8;c[1958]=o+8;c[1962]=o+8;c[1966]=o+8;c[1970]=o+8;c[1974]=p+8;c[1976]=o+8;c[1980]=o+8;c[1984]=o+8;c[1988]=o+8;c[1992]=p+8;c[1994]=o+8;c[1998]=o+8;c[2002]=p+8;c[2004]=o+8;c[2008]=o+8;c[2012]=o+8;c[2016]=o+8;c[2020]=o+8;c[2024]=o+8;c[2028]=o+8;c[2032]=o+8;c[2036]=o+8;c[2040]=o+8;c[2044]=o+8;c[2048]=o+8}function Wb(a){a=a|0;return+(+(c[a+60>>2]|0))}function Xb(d,e,f,j,k,l,m,n,o,p,q){d=d|0;e=+e;f=+f;j=+j;k=+k;l=+l;m=+m;n=+n;o=+o;p=p|0;q=+q;var r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0;s=i;i=i+1104|0;x=s|0;r=s+8|0;u=s+40|0;t=s+80|0;h[x>>3]=l;v=r|0;c[v>>2]=0;g[r+16>>2]=e;g[r+8>>2]=f;a[r+20|0]=j!=0.0|0;g[r+12>>2]=k;c[r+4>>2]=x;b[r+22>>1]=~~m;b[r+26>>1]=~~n;b[r+24>>1]=~~o;c[u>>2]=5816;c[u+4>>2]=3;g[u+8>>2]=.009999999776482582;c[u+12>>2]=0;c[u+16>>2]=0;a[u+36|0]=0;a[u+37|0]=0;x=t|0;w=~~(q*.5);if(q>0.0){y=0;z=0;while(1){A=t+(y<<3)|0;j=+(+g[p+(z<<2)>>2]);l=+(+g[p+((z|1)<<2)>>2]);g[A>>2]=j;g[A+4>>2]=l;z=z+2|0;if(+(z|0)<q){y=y+1|0}else{break}}}Ge(u,x,w);c[v>>2]=u;A=Nj(d,r)|0;Fe(u);i=s;return A|0}function Yb(d,e,f,j,k,l,m,n,o,p,q,r){d=d|0;e=+e;f=+f;j=+j;k=+k;l=+l;m=+m;n=+n;o=+o;p=+p;q=+q;r=+r;var s=0,t=0,u=0,v=0;s=i;i=i+64|0;v=s|0;t=s+8|0;u=s+40|0;h[v>>3]=l;g[t+16>>2]=e;g[t+8>>2]=f;a[t+20|0]=j!=0.0|0;g[t+12>>2]=k;c[t+4>>2]=v;b[t+22>>1]=~~m;b[t+26>>1]=~~n;b[t+24>>1]=~~o;c[u>>2]=5568;en(u+4|0,0,12)|0;g[u+12>>2]=p;g[u+16>>2]=q;g[u+8>>2]=r;c[t>>2]=u;d=Nj(d,t)|0;i=s;return d|0}function Zb(a){a=a|0;return}function _b(b,d,e,f,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z,A,B){b=b|0;d=+d;e=+e;f=+f;j=+j;k=+k;l=+l;m=+m;n=+n;o=+o;p=+p;q=+q;r=+r;s=+s;t=+t;u=+u;v=+v;w=+w;x=+x;y=+y;z=+z;A=+A;B=+B;var C=0,D=0,E=0,F=0,G=0,H=0,I=0;C=i;i=i+112|0;G=C|0;D=C+8|0;F=C+88|0;h[G>>3]=y;H=D+8|0;I=D+20|0;E=D+40|0;en(E|0,0,28)|0;g[D+16>>2]=d;g[D+28>>2]=e;a[D+32|0]=~~f;a[D+33|0]=~~j;a[D+34|0]=~~k;a[D+35|0]=~~l;c[D>>2]=~~m;c[D+72>>2]=0;c[D+4>>2]=~~o;g[D+64>>2]=p;n=+q;u=+r;g[I>>2]=n;g[I+4>>2]=u;u=+s;n=+t;g[H>>2]=u;g[H+4>>2]=n;c[D+60>>2]=0;c[D+56>>2]=~~v;c[D+48>>2]=0;c[D+44>>2]=0;g[D+36>>2]=w;g[D+52>>2]=x;c[D+68>>2]=G;c[F>>2]=5568;c[F+4>>2]=0;G=F+12|0;n=+z;u=+A;g[G>>2]=n;g[G+4>>2]=u;g[F+8>>2]=B;c[E>>2]=F;b=Ak(b,D)|0;i=C;return b|0}function $b(d,e,f,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y){d=d|0;e=+e;f=+f;j=+j;k=+k;l=+l;m=+m;n=+n;o=+o;p=+p;q=+q;r=+r;s=+s;t=+t;u=+u;v=+v;w=+w;x=+x;y=+y;var z=0,A=0,B=0,C=0;z=i;i=i+88|0;C=z|0;A=z+8|0;B=z+40|0;h[C>>3]=l;g[A+16>>2]=e;g[A+8>>2]=f;a[A+20|0]=j!=0.0|0;g[A+12>>2]=k;c[A+4>>2]=C;b[A+22>>1]=~~m;b[A+26>>1]=~~n;b[A+24>>1]=~~o;c[B>>2]=6064;c[B+4>>2]=1;g[B+8>>2]=.009999999776482582;en(B+28|0,0,18)|0;C=B+28|0;l=+r;e=+s;g[C>>2]=l;g[C+4>>2]=e;C=B+12|0;e=+t;l=+u;g[C>>2]=e;g[C+4>>2]=l;C=B+20|0;l=+v;e=+w;g[C>>2]=l;g[C+4>>2]=e;C=B+36|0;e=+x;l=+y;g[C>>2]=e;g[C+4>>2]=l;a[B+44|0]=p!=0.0|0;a[B+45|0]=q!=0.0|0;c[A>>2]=B;d=Nj(d,A)|0;i=z;return d|0}function ac(a){a=a|0;return}function bc(d,e,f,j,k,l,m,n,o,p,q,r,s,t,u){d=d|0;e=+e;f=+f;j=+j;k=+k;l=+l;m=+m;n=+n;o=+o;p=+p;q=+q;r=+r;s=+s;t=+t;u=+u;var v=0,w=0,x=0,y=0,z=0;v=i;i=i+216|0;z=v|0;w=v+8|0;y=v+40|0;x=v+64|0;h[z>>3]=l;g[w+16>>2]=e;g[w+8>>2]=f;a[w+20|0]=j!=0.0|0;g[w+12>>2]=k;c[w+4>>2]=z;b[w+22>>1]=~~m;b[w+26>>1]=~~n;b[w+24>>1]=~~o;g[y>>2]=p;g[y+4>>2]=q;g[y+8>>2]=r;g[y+12>>2]=s;g[y+16>>2]=t;g[y+20>>2]=u;c[x>>2]=5448;c[x+4>>2]=2;g[x+8>>2]=.009999999776482582;c[x+148>>2]=0;g[x+12>>2]=0.0;g[x+16>>2]=0.0;re(x,y|0,3);c[w>>2]=x;d=Nj(d,w)|0;i=v;return d|0}function cc(a){a=a|0;return}function dc(d,e,f,j,k,l,m,n,o,p,q,r,s,t,u,v,w){d=d|0;e=+e;f=+f;j=+j;k=+k;l=+l;m=+m;n=+n;o=+o;p=+p;q=+q;r=+r;s=+s;t=+t;u=+u;v=+v;w=+w;var x=0,y=0,z=0,A=0,B=0;x=i;i=i+224|0;B=x|0;y=x+8|0;A=x+40|0;z=x+72|0;h[B>>3]=l;g[y+16>>2]=e;g[y+8>>2]=f;a[y+20|0]=j!=0.0|0;g[y+12>>2]=k;c[y+4>>2]=B;b[y+22>>1]=~~m;b[y+26>>1]=~~n;b[y+24>>1]=~~o;g[A>>2]=p;g[A+4>>2]=q;g[A+8>>2]=r;g[A+12>>2]=s;g[A+16>>2]=t;g[A+20>>2]=u;g[A+24>>2]=v;g[A+28>>2]=w;c[z>>2]=5448;c[z+4>>2]=2;g[z+8>>2]=.009999999776482582;c[z+148>>2]=0;g[z+12>>2]=0.0;g[z+16>>2]=0.0;re(z,A|0,4);c[y>>2]=z;d=Nj(d,y)|0;i=x;return d|0}function ec(d,e,f,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y){d=d|0;e=+e;f=+f;j=+j;k=+k;l=+l;m=+m;n=+n;o=+o;p=+p;q=+q;r=+r;s=+s;t=+t;u=+u;v=+v;w=+w;x=+x;y=+y;var z=0,A=0,B=0,C=0,D=0;z=i;i=i+232|0;D=z|0;A=z+8|0;C=z+40|0;B=z+80|0;h[D>>3]=l;g[A+16>>2]=e;g[A+8>>2]=f;a[A+20|0]=j!=0.0|0;g[A+12>>2]=k;c[A+4>>2]=D;b[A+22>>1]=~~m;b[A+26>>1]=~~n;b[A+24>>1]=~~o;g[C>>2]=p;g[C+4>>2]=q;g[C+8>>2]=r;g[C+12>>2]=s;g[C+16>>2]=t;g[C+20>>2]=u;g[C+24>>2]=v;g[C+28>>2]=w;g[C+32>>2]=x;g[C+36>>2]=y;c[B>>2]=5448;c[B+4>>2]=2;g[B+8>>2]=.009999999776482582;c[B+148>>2]=0;g[B+12>>2]=0.0;g[B+16>>2]=0.0;re(B,C|0,5);c[A>>2]=B;d=Nj(d,A)|0;i=z;return d|0}function fc(d,e,f,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z,A){d=d|0;e=+e;f=+f;j=+j;k=+k;l=+l;m=+m;n=+n;o=+o;p=+p;q=+q;r=+r;s=+s;t=+t;u=+u;v=+v;w=+w;x=+x;y=+y;z=+z;A=+A;var B=0,C=0,D=0,E=0,F=0;B=i;i=i+240|0;F=B|0;C=B+8|0;E=B+40|0;D=B+88|0;h[F>>3]=l;g[C+16>>2]=e;g[C+8>>2]=f;a[C+20|0]=j!=0.0|0;g[C+12>>2]=k;c[C+4>>2]=F;b[C+22>>1]=~~m;b[C+26>>1]=~~n;b[C+24>>1]=~~o;g[E>>2]=p;g[E+4>>2]=q;g[E+8>>2]=r;g[E+12>>2]=s;g[E+16>>2]=t;g[E+20>>2]=u;g[E+24>>2]=v;g[E+28>>2]=w;g[E+32>>2]=x;g[E+36>>2]=y;g[E+40>>2]=z;g[E+44>>2]=A;c[D>>2]=5448;c[D+4>>2]=2;g[D+8>>2]=.009999999776482582;c[D+148>>2]=0;g[D+12>>2]=0.0;g[D+16>>2]=0.0;re(D,E|0,6);c[C>>2]=D;d=Nj(d,C)|0;i=B;return d|0}function gc(b,d,e,f,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z,A,B,C,D,E,F,G){b=b|0;d=+d;e=+e;f=+f;j=+j;k=+k;l=+l;m=+m;n=+n;o=+o;p=+p;q=+q;r=+r;s=+s;t=+t;u=+u;v=+v;w=+w;x=+x;y=+y;z=+z;A=+A;B=+B;C=+C;D=+D;E=+E;F=+F;G=+G;var H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0;H=i;i=i+272|0;M=H|0;I=H+8|0;L=H+88|0;K=H+120|0;h[M>>3]=y;N=I+8|0;O=I+20|0;J=I+40|0;en(J|0,0,28)|0;g[I+16>>2]=d;g[I+28>>2]=e;a[I+32|0]=~~f;a[I+33|0]=~~j;a[I+34|0]=~~k;a[I+35|0]=~~l;c[I>>2]=~~m;c[I+72>>2]=0;c[I+4>>2]=~~o;g[I+64>>2]=p;u=+q;n=+r;g[O>>2]=u;g[O+4>>2]=n;n=+s;u=+t;g[N>>2]=n;g[N+4>>2]=u;c[I+60>>2]=0;c[I+56>>2]=~~v;c[I+48>>2]=0;c[I+44>>2]=0;g[I+36>>2]=w;g[I+52>>2]=x;c[I+68>>2]=M;g[L>>2]=z;g[L+4>>2]=A;g[L+8>>2]=B;g[L+12>>2]=C;g[L+16>>2]=D;g[L+20>>2]=E;g[L+24>>2]=F;g[L+28>>2]=G;c[K>>2]=5448;c[K+4>>2]=2;g[K+8>>2]=.009999999776482582;c[K+148>>2]=0;g[K+12>>2]=0.0;g[K+16>>2]=0.0;re(K,L|0,4);c[J>>2]=K;b=Ak(b,I)|0;i=H;return b|0}function hc(a,d,e){a=a|0;d=+d;e=+e;var f=0,h=0;if((c[a>>2]|0)!=2){return}h=a+4|0;f=b[h>>1]|0;do{if(e!=0.0){if(!((f&2)==0)){break}f=f|2;b[h>>1]=f;g[a+160>>2]=0.0}}while(0);if((f&2)==0){return}h=a+88|0;g[h>>2]=+g[h>>2]+d*+g[a+144>>2];return}function ic(a,d,e,f,h,i){a=a|0;d=+d;e=+e;f=+f;h=+h;i=+i;var j=0,k=0;if((c[a>>2]|0)!=2){return}k=a+4|0;j=b[k>>1]|0;do{if(i!=0.0){if(!((j&2)==0)){break}j=j|2;b[k>>1]=j;g[a+160>>2]=0.0}}while(0);if((j&2)==0){return}k=a+92|0;g[k>>2]=d+ +g[k>>2];k=a+96|0;g[k>>2]=e+ +g[k>>2];k=a+100|0;g[k>>2]=+g[k>>2]+(e*(f- +g[a+60>>2])-d*(h- +g[a+64>>2]));return}function jc(a,d,e){a=a|0;d=+d;e=+e;var f=0,h=0;if((c[a>>2]|0)!=2){return}h=a+4|0;f=b[h>>1]|0;do{if(e!=0.0){if(!((f&2)==0)){break}f=f|2;b[h>>1]=f;g[a+160>>2]=0.0}}while(0);if((f&2)==0){return}h=a+100|0;g[h>>2]=d+ +g[h>>2];return}function kc(a,b){a=a|0;b=b|0;Oj(a,b);return}function lc(a){a=a|0;return+(+g[a+72>>2])}function mc(a){a=a|0;return+(+g[a+88>>2])}function nc(a){a=a|0;var b=0.0,c=0.0;c=+g[a+44>>2];b=+g[a+48>>2];return+(+g[a+140>>2]+ +g[a+132>>2]*(c*c+b*b))}function oc(a,b){a=a|0;b=b|0;var c=0.0;c=+g[a+84>>2];g[b>>2]=+g[a+80>>2];g[b+4>>2]=c;return}function pc(a,b,c,d){a=a|0;b=+b;c=+c;d=d|0;var e=0.0,f=0.0;e=b- +g[a+12>>2];c=c- +g[a+16>>2];f=+g[a+24>>2];b=+g[a+20>>2];g[d>>2]=e*f+c*b;g[d+4>>2]=f*c+e*(-0.0-b);return}function qc(a,b,c,d){a=a|0;b=+b;c=+c;d=d|0;var e=0.0,f=0.0;e=b- +g[a+12>>2];c=c- +g[a+16>>2];f=+g[a+24>>2];b=+g[a+20>>2];g[d>>2]=e*f+c*b;g[d+4>>2]=f*c+e*(-0.0-b);return}function rc(a){a=a|0;return+(+g[a+132>>2])}function sc(a,b){a=a|0;b=b|0;var c=0.0;c=+g[a+16>>2];g[b>>2]=+g[a+12>>2];g[b+4>>2]=c;return}function tc(a,b){a=a|0;b=b|0;g[b>>2]=+g[a+12>>2];g[b+4>>2]=+g[a+16>>2];g[b+8>>2]=+g[a+20>>2];g[b+12>>2]=+g[a+24>>2];return}function uc(a){a=a|0;return+(+((c[a>>2]|0)>>>0>>>0))}function vc(a,b){a=a|0;b=b|0;var c=0.0;c=+g[a+64>>2];g[b>>2]=+g[a+60>>2];g[b+4>>2]=c;return}function wc(a,b,c,d){a=a|0;b=+b;c=+c;d=d|0;var e=0.0,f=0.0,h=0.0;h=b;e=c;f=+g[a+24>>2];c=+g[a+20>>2];b=e*f+h*c+ +g[a+16>>2];g[d>>2]=+g[a+12>>2]+(h*f-e*c);g[d+4>>2]=b;return}function xc(a,b,c,d){a=a|0;b=+b;c=+c;d=d|0;var e=0.0,f=0.0,h=0.0;h=b;e=c;f=+g[a+24>>2];c=+g[a+20>>2];b=e*f+h*c+ +g[a+16>>2];g[d>>2]=+g[a+12>>2]+(h*f-e*c);g[d+4>>2]=b;return}function yc(a,c){a=a|0;c=+c;var d=0,e=0;d=a+4|0;e=b[d>>1]|0;if(!(c!=0.0)){b[d>>1]=e&-3;g[a+160>>2]=0.0;en(a+80|0,0,24)|0;return}if(!((e&2)==0)){return}b[d>>1]=e|2;g[a+160>>2]=0.0;return}function zc(a,d){a=a|0;d=+d;var e=0,f=0;if((c[a>>2]|0)==0){return}do{if(d*d>0.0){f=a+4|0;e=b[f>>1]|0;if(!((e&2)==0)){break}b[f>>1]=e|2;g[a+160>>2]=0.0}}while(0);g[a+88>>2]=d;return}function Ac(a,d,e){a=a|0;d=+d;e=+e;var f=0,h=0;if((c[a>>2]|0)==0){return}do{if(d*d+e*e>0.0){h=a+4|0;f=b[h>>1]|0;if(!((f&2)==0)){break}b[h>>1]=f|2;g[a+160>>2]=0.0}}while(0);h=a+80|0;d=+d;e=+e;g[h>>2]=d;g[h+4>>2]=e;return}function Bc(a,b,c,d){a=a|0;b=+b;c=+c;d=+d;var e=0,f=0;e=i;i=i+8|0;f=e|0;g[f>>2]=b;g[f+4>>2]=c;Qj(a,f,d);i=e;return}function Cc(a,b){a=a|0;b=+b;Kj(a,~~b);return}function Dc(a,b,d){a=a|0;b=+b;d=+d;var e=0,f=0,h=0;e=i;i=i+8|0;f=e|0;g[f>>2]=b;g[f+4>>2]=d;h=c[a+12>>2]|0;b=+(((vb[c[(c[h>>2]|0)+16>>2]&31](h,(c[a+8>>2]|0)+12|0,f)|0)&1)>>>0);i=e;return+b}function Ec(a){a=a|0;return}function Fc(a){a=a|0;return}function Gc(a,b){a=+a;b=+b;var c=0,d=0,e=0;d=i;i=i+8|0;e=d|0;c=Zm(103048)|0;g[e>>2]=a;g[e+4>>2]=b;uj(c,e);i=d;return c|0}function Hc(b,d,e,f,h,j,k,l,m,n,o,p,q,r,s,t,u){b=b|0;d=+d;e=+e;f=+f;h=+h;j=+j;k=+k;l=+l;m=+m;n=+n;o=+o;p=+p;q=+q;r=+r;s=+s;t=+t;u=u|0;var v=0,w=0,x=0;v=i;i=i+56|0;w=v|0;x=w+4|0;en(x|0,0,24)|0;a[w+40|0]=d!=0.0|0;a[w+36|0]=e!=0.0|0;g[w+12>>2]=f;g[w+24>>2]=h;g[w+32>>2]=j;a[w+37|0]=k!=0.0|0;a[w+39|0]=l!=0.0|0;a[w+38|0]=m!=0.0|0;g[w+48>>2]=n;g[w+28>>2]=o;g[w+16>>2]=p;g[w+20>>2]=q;g[x>>2]=r;g[w+8>>2]=s;c[w>>2]=~~t;c[w+44>>2]=u;u=yj(b,w)|0;Ma(16)|0;Ga(1880,(b=i,i=i+8|0,c[b>>2]=0,b)|0)|0;i=b;Ga(1408,(b=i,i=i+8|0,c[b>>2]=8,b)|0)|0;i=b;Ga(1056,(b=i,i=i+8|0,c[b>>2]=12,b)|0)|0;i=b;Ga(672,(b=i,i=i+8|0,c[b>>2]=164,b)|0)|0;i=b;Ga(384,(b=i,i=i+1|0,i=i+7&-8,c[b>>2]=0,b)|0)|0;i=b;i=v;return u|0}function Ic(b,d,e,f,h,j,k,l,m,n,o,p,q,r,s,t,u,v){b=b|0;d=+d;e=+e;f=+f;h=+h;j=+j;k=+k;l=+l;m=+m;n=+n;o=+o;p=+p;q=+q;r=+r;s=+s;t=+t;u=+u;v=+v;var w=0,x=0;w=i;i=i+72|0;x=w|0;g[x+56>>2]=d;g[x+8>>2]=e;a[x+60|0]=f!=0.0|0;g[x+40>>2]=h;g[x+12>>2]=j;g[x+64>>2]=k;g[x+36>>2]=l;g[x+4>>2]=m;g[x>>2]=n;g[x+32>>2]=o;g[x+16>>2]=p;c[x+52>>2]=~~q;g[x+48>>2]=r;g[x+44>>2]=s;g[x+28>>2]=t;g[x+24>>2]=u;g[x+20>>2]=v;b=Cj(b,x)|0;i=w;return b|0}function Jc(a){a=a|0;if((a|0)==0){return}vj(a);$m(a);return}function Kc(a,b){a=a|0;b=b|0;zj(a,b);return}function Lc(a,b){a=a|0;b=b|0;Aj(a,b);return}function Mc(a,b){a=a|0;b=b|0;wj(a,b);return}function Nc(a,b,c,d,e){a=a|0;b=+b;c=+c;d=+d;e=+e;var f=0,h=0,j=0;f=i;i=i+16|0;h=f|0;j=h|0;b=+b;c=+c;g[j>>2]=b;g[j+4>>2]=c;j=h+8|0;c=+d;b=+e;g[j>>2]=c;g[j+4>>2]=b;Gj(a,32,h);i=f;return}function Oc(a){a=a|0;xj(a,40);return}function Pc(a,b,c){a=a|0;b=+b;c=+c;var d=0.0;a=a+102980|0;d=+b;b=+c;g[a>>2]=d;g[a+4>>2]=b;return}function Qc(a,b,c,d){a=a|0;b=+b;c=+c;d=+d;Fj(a,b,~~c,~~d,3);return}function Rc(a){a=a|0;return a+64|0}function Sc(b,d,e,f,h,j,k,l,m,n,o){b=b|0;d=d|0;e=e|0;f=+f;h=+h;j=+j;k=+k;l=+l;m=+m;n=+n;o=+o;var p=0,q=0,r=0;p=i;i=i+48|0;q=p|0;en(q|0,0,16)|0;c[q>>2]=3;r=q+20|0;c[r>>2]=0;c[r+4>>2]=0;c[q+8>>2]=d;c[q+12>>2]=e;a[q+16|0]=f!=0.0|0;g[q+44>>2]=h;g[q+40>>2]=j;g[q+36>>2]=k;d=q+20|0;f=+l;h=+m;g[d>>2]=f;g[d+4>>2]=h;d=q+28|0;h=+n;f=+o;g[d>>2]=h;g[d+4>>2]=f;d=Bj(b,q|0)|0;i=p;return d|0}function Tc(b,d,e,f,j,k,l,m,n,o){b=b|0;d=d|0;e=e|0;f=+f;j=+j;k=+k;l=+l;m=+m;n=+n;o=+o;var p=0,q=0,r=0,s=0,t=0,u=0.0;p=i;i=i+64|0;q=p|0;s=p+48|0;r=p+56|0;en(q|0,0,16)|0;c[q>>2]=3;en(q+20|0,0,16)|0;g[q+36>>2]=1.0;a[q+16|0]=m!=0.0|0;u=n;g[q+44>>2]=u;n=o;g[q+40>>2]=n;Ma(8)|0;Ga(3224,(t=i,i=i+24|0,h[t>>3]=u,h[t+8>>3]=n,h[t+16>>3]=m,t)|0)|0;i=t;Ga(2808,(t=i,i=i+32|0,h[t>>3]=f,h[t+8>>3]=j,h[t+16>>3]=k,h[t+24>>3]=l,t)|0)|0;i=t;g[s>>2]=f;g[s+4>>2]=j;g[r>>2]=k;g[r+4>>2]=l;_f(q,d,e,s,r);d=Bj(b,q|0)|0;i=p;return d|0}function Uc(b,d,e,f,h,j,k,l,m,n){b=b|0;d=d|0;e=e|0;f=+f;h=+h;j=+j;k=+k;l=+l;m=+m;n=+n;var o=0,p=0;o=i;i=i+48|0;p=o|0;en(p|0,0,16)|0;c[p>>2]=9;en(p+20|0,0,20)|0;c[p+8>>2]=d;c[p+12>>2]=e;a[p+16|0]=f!=0.0|0;d=p+20|0;f=+h;h=+j;g[d>>2]=f;g[d+4>>2]=h;d=p+28|0;h=+k;f=+l;g[d>>2]=h;g[d+4>>2]=f;g[p+36>>2]=m;g[p+40>>2]=n;d=Bj(b,p|0)|0;i=o;return d|0}function Vc(b,d,e,f,h,j,k,l){b=b|0;d=d|0;e=e|0;f=+f;h=+h;j=+j;k=+k;l=+l;var m=0,n=0,o=0;m=i;i=i+56|0;n=m|0;o=m+48|0;en(n|0,0,16)|0;c[n>>2]=9;en(n+20|0,0,20)|0;a[n+16|0]=j!=0.0|0;g[n+36>>2]=k;g[n+40>>2]=l;g[o>>2]=f;g[o+4>>2]=h;kg(n,d,e,o);d=Bj(b,n|0)|0;i=m;return d|0}function Wc(a){a=a|0;return+(+Qg(a))}function Xc(b,d,e,f,h,j,k){b=b|0;d=d|0;e=e|0;f=+f;h=h|0;j=j|0;k=+k;var l=0,m=0;l=i;i=i+32|0;m=l|0;en(m|0,0,16)|0;c[m>>2]=6;c[m+8>>2]=d;c[m+12>>2]=e;a[m+16|0]=f!=0.0|0;c[m+20>>2]=h;c[m+24>>2]=j;g[m+28>>2]=k;d=Bj(b,m|0)|0;i=l;return d|0}function Yc(a){a=a|0;return c[a+48>>2]|0}function Zc(a){a=a|0;return c[a+52>>2]|0}function _c(a,b){a=a|0;b=+b;Vf(a,b);return}function $c(a,b,c){a=a|0;b=+b;c=+c;var d=0,e=0;d=i;i=i+8|0;e=d|0;g[e>>2]=b;g[e+4>>2]=c;Uf(a,e);i=d;return}function ad(b,d,e,f,h,j,k,l,m,n){b=b|0;d=d|0;e=e|0;f=+f;h=+h;j=+j;k=+k;l=+l;m=+m;n=+n;var o=0,p=0;o=i;i=i+48|0;p=o|0;en(p|0,0,16)|0;c[p>>2]=11;c[p+8>>2]=d;c[p+12>>2]=e;a[p+16|0]=f!=0.0|0;g[p+28>>2]=h;g[p+40>>2]=j;d=p+20|0;h=+k;f=+l;g[d>>2]=h;g[d+4>>2]=f;g[p+32>>2]=m;g[p+36>>2]=n;d=Bj(b,p|0)|0;i=o;return d|0}function bd(b,d,e,f,h,j,k){b=b|0;d=d|0;e=e|0;f=+f;h=+h;j=+j;k=+k;var l=0,m=0;l=i;i=i+48|0;m=l|0;en(m|0,0,16)|0;c[m>>2]=11;g[m+20>>2]=0.0;g[m+24>>2]=0.0;g[m+28>>2]=0.0;a[m+16|0]=f!=0.0|0;g[m+40>>2]=h;g[m+32>>2]=j;g[m+36>>2]=k;Lf(m,d,e);d=Bj(b,m|0)|0;i=l;return d|0}function cd(a,b,c){a=a|0;b=+b;c=+c;var d=0,e=0;d=i;i=i+8|0;e=d|0;g[e>>2]=b;g[e+4>>2]=c;zf(a,e);i=d;return}function dd(b,d,e,f,h,j,k,l,m){b=b|0;d=d|0;e=e|0;f=+f;h=+h;j=+j;k=+k;l=+l;m=+m;var n=0,o=0;n=i;i=i+40|0;o=n|0;en(o|0,0,16)|0;c[o>>2]=5;c[o+8>>2]=d;c[o+12>>2]=e;a[o+16|0]=f!=0.0|0;g[o+36>>2]=h;g[o+32>>2]=j;g[o+28>>2]=k;d=o+20|0;h=+l;f=+m;g[d>>2]=h;g[d+4>>2]=f;d=Bj(b,o|0)|0;i=n;return d|0}function ed(a,b){a=a|0;b=+b;dh(a,b!=0.0);return}function fd(a,b){a=a|0;b=+b;fh(a,b!=0.0);return}function gd(a){a=a|0;return+(+bh(a))}function hd(a){a=a|0;return+(+g[a+132>>2])}function id(a,b){a=a|0;b=+b;return+(+hh(a,b))}function jd(a){a=a|0;return+(+(((ch(a)|0)&1)>>>0))}function kd(a){a=a|0;return+(+(((eh(a)|0)&1)>>>0))}function ld(a,b){a=a|0;b=+b;gh(a,b);return}function md(b,d,e,f,h,j,k,l,m,n,o,p,q,r,s,t,u){b=b|0;d=d|0;e=e|0;f=+f;h=+h;j=+j;k=+k;l=+l;m=+m;n=+n;o=+o;p=+p;q=+q;r=+r;s=+s;t=+t;u=+u;var v=0,w=0,x=0;v=i;i=i+72|0;w=v|0;en(w|0,0,16)|0;c[w>>2]=2;x=w+20|0;c[x>>2]=0;c[x+4>>2]=0;c[w+8>>2]=d;c[w+12>>2]=e;a[w+16|0]=f!=0.0|0;a[w+48|0]=h!=0.0|0;a[w+60|0]=j!=0.0|0;d=w+20|0;h=+k;f=+l;g[d>>2]=h;g[d+4>>2]=f;d=w+28|0;f=+m;h=+n;g[d>>2]=f;g[d+4>>2]=h;d=w+36|0;h=+o;f=+p;g[d>>2]=h;g[d+4>>2]=f;g[w+52>>2]=q;g[w+64>>2]=r;g[w+68>>2]=s;g[w+44>>2]=t;g[w+56>>2]=u;d=Bj(b,w|0)|0;i=v;return d|0}function nd(b,d,e,f,h,j,k,l,m,n,o,p,q,r){b=b|0;d=d|0;e=e|0;f=+f;h=+h;j=+j;k=+k;l=+l;m=+m;n=+n;o=+o;p=+p;q=+q;r=+r;var s=0,t=0,u=0,v=0;s=i;i=i+88|0;t=s|0;v=s+72|0;u=s+80|0;en(t|0,0,16)|0;c[t>>2]=2;en(t+20|0,0,16)|0;g[t+36>>2]=1.0;g[t+40>>2]=0.0;g[t+44>>2]=0.0;a[t+16|0]=l!=0.0|0;a[t+48|0]=m!=0.0|0;a[t+60|0]=n!=0.0|0;g[t+52>>2]=o;g[t+64>>2]=p;g[t+68>>2]=q;g[t+56>>2]=r;g[v>>2]=f;g[v+4>>2]=h;g[u>>2]=j;g[u+4>>2]=k;Ug(t,d,e,v,u);e=Bj(b,t|0)|0;i=s;return e|0}function od(b,d,e,f,h,j,k,l,m,n,o,p,q,r,s){b=b|0;d=d|0;e=e|0;f=+f;h=+h;j=+j;k=+k;l=+l;m=+m;n=+n;o=+o;p=+p;q=+q;r=+r;s=+s;var t=0,u=0;t=i;i=i+64|0;u=t|0;en(u|0,0,12)|0;c[u>>2]=4;c[u+8>>2]=d;c[u+12>>2]=e;a[u+16|0]=f!=0.0|0;d=u+20|0;f=+h;h=+j;g[d>>2]=f;g[d+4>>2]=h;d=u+28|0;h=+k;f=+l;g[d>>2]=h;g[d+4>>2]=f;g[u+52>>2]=m;g[u+56>>2]=n;d=u+36|0;f=+o;h=+p;g[d>>2]=f;g[d+4>>2]=h;d=u+44|0;h=+q;f=+r;g[d>>2]=h;g[d+4>>2]=f;g[u+60>>2]=s;d=Bj(b,u|0)|0;i=t;return d|0}function pd(b,d,e,f,h,j,k,l,m,n,o,p,q){b=b|0;d=d|0;e=e|0;f=+f;h=+h;j=+j;k=+k;l=+l;m=+m;n=+n;o=+o;p=+p;q=+q;var r=0,s=0,t=0,u=0,v=0,w=0;r=i;i=i+96|0;s=r|0;w=r+64|0;v=r+72|0;u=r+80|0;t=r+88|0;en(s|0,0,16)|0;c[s>>2]=4;g[s+20>>2]=-1.0;g[s+24>>2]=1.0;g[s+28>>2]=1.0;g[s+32>>2]=1.0;g[s+36>>2]=-1.0;g[s+40>>2]=0.0;g[s+44>>2]=1.0;g[s+48>>2]=0.0;g[s+52>>2]=0.0;g[s+56>>2]=0.0;g[s+60>>2]=1.0;a[s+16|0]=q!=0.0|0;g[w>>2]=l;g[w+4>>2]=m;g[v>>2]=n;g[v+4>>2]=o;g[u>>2]=f;g[u+4>>2]=h;g[t>>2]=j;g[t+4>>2]=k;fi(s,d,e,w,v,u,t,p);d=Bj(b,s|0)|0;i=r;return d|0}function qd(a,b){a=a|0;b=+b;Qh(a,b!=0.0);return}function rd(a,b){a=a|0;b=+b;Nh(a,b!=0.0);return}function sd(a){a=a|0;return+(+Lh(a))}function td(a){a=a|0;return+(+(((Ph(a)|0)&1)>>>0))}function ud(a){a=a|0;return+(+(((Mh(a)|0)&1)>>>0))}function vd(b,d,e,f,h,j,k,l,m,n,o,p,q,r,s){b=b|0;d=d|0;e=e|0;f=+f;h=+h;j=+j;k=+k;l=+l;m=+m;n=+n;o=+o;p=+p;q=+q;r=+r;s=+s;var t=0,u=0;t=i;i=i+64|0;u=t|0;en(u|0,0,16)|0;c[u>>2]=1;en(u+20|0,0,16)|0;c[u+8>>2]=d;c[u+12>>2]=e;a[u+16|0]=f!=0.0|0;a[u+40|0]=h!=0.0|0;a[u+52|0]=j!=0.0|0;d=u+20|0;f=+l;h=+m;g[d>>2]=f;g[d+4>>2]=h;d=u+28|0;h=+n;f=+o;g[d>>2]=h;g[d+4>>2]=f;g[u+44>>2]=k;g[u+60>>2]=p;g[u+56>>2]=q;g[u+36>>2]=r;g[u+48>>2]=s;d=Bj(b,u|0)|0;i=t;return d|0}function wd(b,d,e,f,h,j,k,l,m,n,o,p){b=b|0;d=d|0;e=e|0;f=+f;h=+h;j=+j;k=+k;l=+l;m=+m;n=+n;o=+o;p=+p;var q=0,r=0,s=0;q=i;i=i+72|0;r=q|0;s=q+64|0;en(r|0,0,16)|0;c[r>>2]=1;en(r+20|0,0,20)|0;a[r+16|0]=j!=0.0|0;a[r+40|0]=k!=0.0|0;a[r+52|0]=l!=0.0|0;g[r+44>>2]=m;g[r+60>>2]=n;g[r+56>>2]=o;g[r+48>>2]=p;g[s>>2]=f;g[s+4>>2]=h;Ch(r,d,e,s);e=Bj(b,r|0)|0;i=q;return e|0}function xd(a,b){a=a|0;b=+b;Oh(a,b);return}function yd(b,d,e,f,h,j,k,l,m){b=b|0;d=d|0;e=e|0;f=+f;h=+h;j=+j;k=+k;l=+l;m=+m;var n=0,o=0;n=i;i=i+40|0;o=n|0;en(o|0,0,16)|0;c[o>>2]=10;c[o+8>>2]=d;c[o+12>>2]=e;a[o+16|0]=f!=0.0|0;d=o+20|0;f=+h;h=+j;g[d>>2]=f;g[d+4>>2]=h;d=o+28|0;h=+k;f=+l;g[d>>2]=h;g[d+4>>2]=f;g[o+36>>2]=m;d=Bj(b,o|0)|0;i=n;return d|0}function zd(b,d,e,f,h,j,k,l,m,n,o){b=b|0;d=d|0;e=e|0;f=+f;h=+h;j=+j;k=+k;l=+l;m=+m;n=+n;o=+o;var p=0,q=0;p=i;i=i+48|0;q=p|0;en(q|0,0,16)|0;c[q>>2]=8;en(q+20|0,0,16)|0;c[q+8>>2]=d;c[q+12>>2]=e;a[q+16|0]=f!=0.0|0;g[q+44>>2]=h;g[q+40>>2]=j;d=q+20|0;f=+k;h=+l;g[d>>2]=f;g[d+4>>2]=h;d=q+28|0;h=+m;f=+n;g[d>>2]=h;g[d+4>>2]=f;g[q+36>>2]=o;d=Bj(b,q|0)|0;i=p;return d|0}function Ad(b,d,e,f,h,j,k,l){b=b|0;d=d|0;e=e|0;f=+f;h=+h;j=+j;k=+k;l=+l;var m=0,n=0,o=0;m=i;i=i+56|0;n=m|0;o=m+48|0;en(n|0,0,16)|0;c[n>>2]=8;en(n+20|0,0,20)|0;a[n+16|0]=j!=0.0|0;g[n+44>>2]=k;g[n+40>>2]=l;g[o>>2]=f;g[o+4>>2]=h;wg(n,d,e,o);d=Bj(b,n|0)|0;i=m;return d|0}function Bd(a,b){a=a|0;b=+b;bi(a,b);return}function Cd(a,b){a=a|0;b=+b;g[a+68>>2]=b;return}function Dd(b,d,e,f,h,j,k,l,m,n,o,p,q,r,s){b=b|0;d=d|0;e=e|0;f=+f;h=+h;j=+j;k=+k;l=+l;m=+m;n=+n;o=+o;p=+p;q=+q;r=+r;s=+s;var t=0,u=0,v=0;t=i;i=i+64|0;u=t|0;en(u|0,0,16)|0;c[u>>2]=7;v=u+20|0;c[v>>2]=0;c[v+4>>2]=0;c[u+8>>2]=d;c[u+12>>2]=e;a[u+16|0]=f!=0.0|0;g[u+60>>2]=h;a[u+44|0]=j!=0.0|0;g[u+56>>2]=k;d=u+20|0;h=+l;f=+m;g[d>>2]=h;g[d+4>>2]=f;d=u+28|0;f=+n;h=+o;g[d>>2]=f;g[d+4>>2]=h;d=u+36|0;h=+p;f=+q;g[d>>2]=h;g[d+4>>2]=f;g[u+48>>2]=r;g[u+52>>2]=s;d=Bj(b,u|0)|0;i=t;return d|0}function Ed(b,d,e,f,h,j,k,l,m,n,o,p,q){b=b|0;d=d|0;e=e|0;f=+f;h=+h;j=+j;k=+k;l=+l;m=+m;n=+n;o=+o;p=+p;q=+q;var r=0,s=0,t=0,u=0;r=i;i=i+80|0;s=r|0;u=r+64|0;t=r+72|0;en(s|0,0,16)|0;c[s>>2]=7;en(s+20|0,0,16)|0;g[s+36>>2]=1.0;g[s+40>>2]=0.0;a[s+16|0]=l!=0.0|0;g[s+60>>2]=m;a[s+44|0]=n!=0.0|0;g[s+56>>2]=o;g[s+48>>2]=p;g[s+52>>2]=q;g[u>>2]=f;g[u+4>>2]=h;g[t>>2]=j;g[t+4>>2]=k;Uh(s,d,e,u,t);e=Bj(b,s|0)|0;i=r;return e|0}function Fd(b,d,e,f,j,k,l,m,n,o,p,q,r){b=b|0;d=+d;e=+e;f=+f;j=+j;k=+k;l=+l;m=+m;n=+n;o=+o;p=+p;q=+q;r=+r;var s=0,t=0,u=0,v=0,w=0,x=0;s=i;i=i+56|0;x=s|0;v=s+8|0;t=s+16|0;h[x>>3]=l;h[v>>3]=p;w=t+4|0;u=t+12|0;a[t+20|0]=~~d;a[t+21|0]=~~f;a[t+22|0]=~~e;a[t+23|0]=~~j;c[t>>2]=~~k;c[t+32>>2]=x;g[t+24>>2]=m;l=+n;p=+o;g[w>>2]=l;g[w+4>>2]=p;c[t+28>>2]=v;p=+q;l=+r;g[u>>2]=p;g[u+4>>2]=l;l=+(tk(b,t)|0);i=s;return+l}function Gd(a){a=a|0;return rk(a)|0}function Hd(a){a=a|0;return+(+(c[a+56>>2]|0))}function Id(a){a=a|0;return c[a+112>>2]|0}function Jd(a,b){a=a|0;b=+b;g[a+316>>2]=b;return}function Kd(a,b){a=a|0;b=+b;g[a+28>>2]=b;g[a+32>>2]=1.0/b;return}function Ld(a,b){a=a|0;b=+b;b=b*2.0;g[a+40>>2]=b;g[a+48>>2]=b*b;g[a+44>>2]=1.0/b;return}function Md(a){a=a|0;$m(a);return}function Nd(a,b){a=a|0;b=b|0;return fb(b|0)|0}function Od(a,b,c){a=a|0;b=b|0;c=c|0;return 0}function Pd(a,b){a=a|0;b=b|0;return 1}function Qd(a){a=a|0;$m(a);return}function Rd(a,b){a=a|0;b=b|0;Fa(b|0);return}function Sd(a,b){a=a|0;b=b|0;Wa(b|0);return}function Td(a,b,c){a=a|0;b=b|0;c=c|0;return}function Ud(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;return}function Vd(a,b,c){a=a|0;b=b|0;c=c|0;return}function Wd(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;return}function Xd(a,b,c){a=a|0;b=b|0;c=c|0;bb(b|0,c|0);return}function Yd(a,b,c){a=a|0;b=b|0;c=c|0;lb(b|0,c|0);return}function Zd(a){a=a|0;$m(a);return}function _d(a){a=a|0;$m(a);return}function $d(a){a=a|0;$m(a);return}function ae(d,e){d=d|0;e=e|0;var f=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0.0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0.0,A=0,B=0,C=0,D=0,E=0,F=0,G=0.0,H=0.0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,Q=0,R=0.0,S=0,V=0,W=0,X=0,Y=0,Z=0,_=0.0,$=0,aa=0.0,ba=0,ca=0.0,da=0.0,ea=0,fa=0.0,ga=0.0,ha=0.0,ia=0,ja=0.0,ka=0.0,la=0.0;f=i;i=i+344|0;h=f|0;p=f+8|0;o=f+48|0;n=f+88|0;q=f+104|0;s=f+200|0;m=f+224|0;k=f+328|0;l=f+336|0;sm(h);c[2086]=(c[2086]|0)+1;j=d|0;c[j>>2]=0;ia=e+128|0;d=d+4|0;g[d>>2]=+g[ia>>2];y=e|0;t=e+28|0;fn(p|0,e+56|0,36)|0;fn(o|0,e+92|0,36)|0;u=p+24|0;ca=+g[u>>2];da=+P(ca/6.2831854820251465)*6.2831854820251465;ca=ca-da;g[u>>2]=ca;v=p+28|0;da=+g[v>>2]-da;g[v>>2]=da;w=o+24|0;aa=+g[w>>2];_=+P(aa/6.2831854820251465)*6.2831854820251465;aa=aa-_;g[w>>2]=aa;x=o+28|0;_=+g[x>>2]-_;g[x>>2]=_;r=+g[ia>>2];z=+g[e+24>>2]+ +g[e+52>>2]+-.014999999664723873;z=z<.004999999888241291?.004999999888241291:z;b[n+4>>1]=0;V=q;c[V>>2]=c[e>>2];c[V+4>>2]=c[e+4>>2];c[V+8>>2]=c[e+8>>2];c[V+12>>2]=c[e+12>>2];c[V+16>>2]=c[e+16>>2];c[V+20>>2]=c[e+20>>2];c[V+24>>2]=c[e+24>>2];e=q+28|0;V=t;c[e>>2]=c[V>>2];c[e+4>>2]=c[V+4>>2];c[e+8>>2]=c[V+8>>2];c[e+12>>2]=c[V+12>>2];c[e+16>>2]=c[V+16>>2];c[e+20>>2]=c[V+20>>2];c[e+24>>2]=c[V+24>>2];a[q+88|0]=0;e=p+8|0;V=p+12|0;S=p+16|0;F=p+20|0;I=p|0;J=p+4|0;M=o+8|0;O=o+12|0;N=o+16|0;Q=o+20|0;K=o|0;L=o+4|0;X=q+56|0;Y=q+64|0;D=q+68|0;C=q+72|0;B=q+80|0;A=q+84|0;W=s+16|0;G=z+.0012499999720603228;H=z+-.0012499999720603228;R=0.0;E=0;a:while(1){la=1.0-R;fa=la*ca+R*da;da=+U(fa);fa=+T(fa);ka=+g[I>>2];ca=+g[J>>2];_=la*aa+R*_;ja=+U(_);_=+T(_);aa=+g[K>>2];ha=+g[L>>2];ga=la*+g[M>>2]+R*+g[N>>2]-(_*aa-ja*ha);ha=la*+g[O>>2]+R*+g[Q>>2]-(ja*aa+_*ha);aa=+(la*+g[e>>2]+R*+g[S>>2]-(fa*ka-da*ca));ca=+(la*+g[V>>2]+R*+g[F>>2]-(da*ka+fa*ca));g[X>>2]=aa;g[X+4>>2]=ca;g[Y>>2]=da;g[D>>2]=fa;ga=+ga;ha=+ha;g[C>>2]=ga;g[C+4>>2]=ha;g[B>>2]=ja;g[A>>2]=_;ge(s,n,q);_=+g[W>>2];if(!(_>0.0)){k=3;break}if(_<G){k=5;break}+be(m,n,y,p,t,o,R);Z=0;aa=r;do{ga=+ce(m,k,l,aa);if(ga>G){k=8;break a}if(ga>H){R=aa;break}$=c[k>>2]|0;ba=c[l>>2]|0;da=+de(m,$,ba,R);if(da<H){k=11;break a}if(da>G){ca=aa;_=R;ea=0}else{k=13;break a}while(1){if((ea&1|0)==0){ha=(_+ca)*.5}else{ha=_+(z-da)*(ca-_)/(ga-da)}ea=ea+1|0;c[2078]=(c[2078]|0)+1;fa=+de(m,$,ba,ha);ja=fa-z;if(!(ja>0.0)){ja=-0.0-ja}if(ja<.0012499999720603228){aa=ha;break}ia=fa>z;if((ea|0)==50){break}else{ca=ia?ca:ha;_=ia?ha:_;da=ia?fa:da;ga=ia?ga:fa}}$=c[2080]|0;c[2080]=($|0)>(ea|0)?$:ea;Z=Z+1|0;}while((Z|0)!=8);E=E+1|0;c[2084]=(c[2084]|0)+1;if((E|0)==20){k=25;break}ca=+g[u>>2];da=+g[v>>2];aa=+g[w>>2];_=+g[x>>2]}if((k|0)==3){c[j>>2]=2;g[d>>2]=0.0;j=c[2082]|0;ia=(j|0)>(E|0);ia=ia?j:E;c[2082]=ia;r=+um(h);z=+g[14];ia=z>r;la=ia?z:r;g[14]=la;la=+g[12];la=r+la;g[12]=la;i=f;return}else if((k|0)==5){c[j>>2]=3;g[d>>2]=R;j=c[2082]|0;ia=(j|0)>(E|0);ia=ia?j:E;c[2082]=ia;r=+um(h);z=+g[14];ia=z>r;la=ia?z:r;g[14]=la;la=+g[12];la=r+la;g[12]=la;i=f;return}else if((k|0)==8){c[j>>2]=4;g[d>>2]=r}else if((k|0)==11){c[j>>2]=1;g[d>>2]=R}else if((k|0)==13){c[j>>2]=3;g[d>>2]=R}else if((k|0)==25){c[j>>2]=1;g[d>>2]=R;E=20;j=c[2082]|0;ia=(j|0)>(E|0);ia=ia?j:E;c[2082]=ia;r=+um(h);z=+g[14];ia=z>r;la=ia?z:r;g[14]=la;la=+g[12];la=r+la;g[12]=la;i=f;return}c[2084]=(c[2084]|0)+1;E=E+1|0;j=c[2082]|0;ia=(j|0)>(E|0);ia=ia?j:E;c[2082]=ia;r=+um(h);z=+g[14];ia=z>r;la=ia?z:r;g[14]=la;la=+g[12];la=r+la;g[12]=la;i=f;return}function be(e,f,h,i,j,k,l){e=e|0;f=f|0;h=h|0;i=i|0;j=j|0;k=k|0;l=+l;var m=0.0,n=0.0,o=0.0,p=0.0,q=0.0,r=0.0,s=0.0,t=0.0,u=0.0,v=0.0,w=0.0,x=0.0,y=0.0,z=0.0,A=0,B=0,C=0.0;c[e>>2]=h;c[e+4>>2]=j;A=b[f+4>>1]|0;B=e+8|0;fn(B|0,i|0,36)|0;i=e+44|0;fn(i|0,k|0,36)|0;x=1.0-l;q=x*+g[e+32>>2]+ +g[e+36>>2]*l;p=+U(q);q=+T(q);n=+g[B>>2];m=+g[e+12>>2];r=x*+g[e+16>>2]+ +g[e+24>>2]*l-(q*n-p*m);m=x*+g[e+20>>2]+ +g[e+28>>2]*l-(p*n+q*m);n=x*+g[e+68>>2]+ +g[e+72>>2]*l;o=+U(n);n=+T(n);y=+g[i>>2];z=+g[e+48>>2];s=x*+g[e+52>>2]+ +g[e+60>>2]*l-(n*y-o*z);l=x*+g[e+56>>2]+ +g[e+64>>2]*l-(o*y+n*z);if(A<<16>>16==1){c[e+80>>2]=0;B=(c[h+16>>2]|0)+(d[f+6|0]<<3)|0;y=+g[B>>2];z=+g[B+4>>2];f=(c[j+16>>2]|0)+(d[f+9|0]<<3)|0;w=+g[f>>2];x=+g[f+4>>2];f=e+92|0;r=s+(n*w-o*x)-(r+(q*y-p*z));n=l+(o*w+n*x)-(m+(p*y+q*z));B=f;z=+r;m=+n;g[B>>2]=z;g[B+4>>2]=m;m=+R(r*r+n*n);if(m<1.1920928955078125e-7){m=0.0}else{z=1.0/m;g[f>>2]=r*z;g[e+96>>2]=n*z}B=e+84|0;k=8376;A=c[k+4>>2]|0;c[B>>2]=c[k>>2];c[B+4>>2]=A;z=m;return+z}i=f+6|0;k=f+7|0;A=e+80|0;if((a[i]|0)==(a[k]|0)){c[A>>2]=2;j=c[j+16>>2]|0;B=j+(d[f+9|0]<<3)|0;u=+g[B>>2];t=+g[B+4>>2];j=j+(d[f+10|0]<<3)|0;v=+g[j>>2];w=+g[j+4>>2];j=e+92|0;y=w-t;x=(v-u)*-1.0;f=j;C=+y;z=+x;g[f>>2]=C;g[f+4>>2]=z;z=+R(y*y+x*x);if(!(z<1.1920928955078125e-7)){C=1.0/z;y=y*C;g[j>>2]=y;x=x*C;g[e+96>>2]=x}z=(u+v)*.5;C=(t+w)*.5;B=e+84|0;w=+z;v=+C;g[B>>2]=w;g[B+4>>2]=v;B=(c[h+16>>2]|0)+(d[i]<<3)|0;v=+g[B>>2];w=+g[B+4>>2];m=(n*y-o*x)*(r+(q*v-p*w)-(s+(n*z-o*C)))+(o*y+n*x)*(m+(p*v+q*w)-(l+(o*z+n*C)));if(!(m<0.0)){C=m;return+C}z=+(-0.0-y);C=+(-0.0-x);g[f>>2]=z;g[f+4>>2]=C;C=-0.0-m;return+C}else{c[A>>2]=1;h=c[h+16>>2]|0;i=h+(d[i]<<3)|0;t=+g[i>>2];u=+g[i+4>>2];i=h+(d[k]<<3)|0;w=+g[i>>2];v=+g[i+4>>2];i=e+92|0;z=v-u;x=(w-t)*-1.0;h=i;C=+z;y=+x;g[h>>2]=C;g[h+4>>2]=y;y=+R(z*z+x*x);if(y<1.1920928955078125e-7){y=z}else{C=1.0/y;y=z*C;g[i>>2]=y;x=x*C;g[e+96>>2]=x}z=(t+w)*.5;C=(u+v)*.5;B=e+84|0;w=+z;v=+C;g[B>>2]=w;g[B+4>>2]=v;B=(c[j+16>>2]|0)+(d[f+9|0]<<3)|0;v=+g[B>>2];w=+g[B+4>>2];m=(q*y-p*x)*(s+(n*v-o*w)-(r+(q*z-p*C)))+(p*y+q*x)*(l+(o*v+n*w)-(m+(p*z+q*C)));if(!(m<0.0)){C=m;return+C}z=+(-0.0-y);C=+(-0.0-x);g[h>>2]=z;g[h+4>>2]=C;C=-0.0-m;return+C}return 0.0}function ce(a,b,d,e){a=a|0;b=b|0;d=d|0;e=+e;var f=0.0,h=0.0,i=0.0,j=0.0,k=0.0,l=0.0,m=0.0,n=0.0,o=0.0,p=0,q=0.0,r=0.0,s=0,t=0.0,u=0.0,v=0,w=0.0,x=0.0,y=0,z=0;u=1.0-e;j=u*+g[a+32>>2]+ +g[a+36>>2]*e;f=+U(j);j=+T(j);i=+g[a+8>>2];h=+g[a+12>>2];m=u*+g[a+16>>2]+ +g[a+24>>2]*e-(j*i-f*h);h=u*+g[a+20>>2]+ +g[a+28>>2]*e-(f*i+j*h);i=u*+g[a+68>>2]+ +g[a+72>>2]*e;k=+U(i);i=+T(i);w=+g[a+44>>2];x=+g[a+48>>2];l=u*+g[a+52>>2]+ +g[a+60>>2]*e-(i*w-k*x);e=u*+g[a+56>>2]+ +g[a+64>>2]*e-(k*w+i*x);p=c[a+80>>2]|0;if((p|0)==2){w=+g[a+92>>2];o=+g[a+96>>2];n=i*w-k*o;o=k*w+i*o;w=+g[a+84>>2];x=+g[a+88>>2];l=l+(i*w-k*x);i=e+(k*w+i*x);k=-0.0-o;e=j*(-0.0-n)+f*k;k=f*n+j*k;c[d>>2]=-1;a=c[a>>2]|0;d=c[a+16>>2]|0;a=c[a+20>>2]|0;if((a|0)>1){r=k*+g[d+4>>2]+e*+g[d>>2];v=1;s=0;while(1){q=e*+g[d+(v<<3)>>2]+k*+g[d+(v<<3)+4>>2];p=q>r;s=p?v:s;v=v+1|0;if((v|0)<(a|0)){r=p?q:r}else{break}}}else{s=0}c[b>>2]=s;z=d+(s<<3)|0;w=+g[z>>2];x=+g[z+4>>2];x=n*(m+(j*w-f*x)-l)+o*(h+(f*w+j*x)-i);return+x}else if((p|0)==0){o=+g[a+92>>2];n=+g[a+96>>2];w=j*o+f*n;x=o*(-0.0-f)+j*n;r=-0.0-n;q=i*(-0.0-o)+k*r;r=k*o+i*r;v=c[a>>2]|0;p=c[v+16>>2]|0;v=c[v+20>>2]|0;if((v|0)>1){u=x*+g[p+4>>2]+w*+g[p>>2];z=1;y=0;while(1){t=w*+g[p+(z<<3)>>2]+x*+g[p+(z<<3)+4>>2];s=t>u;y=s?z:y;z=z+1|0;if((z|0)<(v|0)){u=s?t:u}else{break}}}else{y=0}c[b>>2]=y;s=c[a+4>>2]|0;a=c[s+16>>2]|0;s=c[s+20>>2]|0;if((s|0)>1){u=r*+g[a+4>>2]+q*+g[a>>2];z=1;y=0;while(1){t=q*+g[a+(z<<3)>>2]+r*+g[a+(z<<3)+4>>2];v=t>u;y=v?z:y;z=z+1|0;if((z|0)<(s|0)){u=v?t:u}else{break}}}else{y=0}c[d>>2]=y;z=p+(c[b>>2]<<3)|0;w=+g[z>>2];x=+g[z+4>>2];z=a+(y<<3)|0;t=+g[z>>2];u=+g[z+4>>2];x=o*(l+(i*t-k*u)-(m+(j*w-f*x)))+n*(e+(k*t+i*u)-(h+(f*w+j*x)));return+x}else if((p|0)==1){w=+g[a+92>>2];n=+g[a+96>>2];o=j*w-f*n;n=f*w+j*n;w=+g[a+84>>2];x=+g[a+88>>2];m=m+(j*w-f*x);f=h+(f*w+j*x);h=-0.0-n;j=i*(-0.0-o)+k*h;h=k*o+i*h;c[b>>2]=-1;a=c[a+4>>2]|0;b=c[a+16>>2]|0;a=c[a+20>>2]|0;if((a|0)>1){q=h*+g[b+4>>2]+j*+g[b>>2];s=1;v=0;while(1){r=j*+g[b+(s<<3)>>2]+h*+g[b+(s<<3)+4>>2];p=r>q;v=p?s:v;s=s+1|0;if((s|0)<(a|0)){q=p?r:q}else{break}}}else{v=0}c[d>>2]=v;z=b+(v<<3)|0;w=+g[z>>2];x=+g[z+4>>2];x=o*(l+(i*w-k*x)-m)+n*(e+(k*w+i*x)-f);return+x}else{c[b>>2]=-1;c[d>>2]=-1;x=0.0;return+x}return 0.0}function de(a,b,d,e){a=a|0;b=b|0;d=d|0;e=+e;var f=0.0,h=0.0,i=0.0,j=0.0,k=0.0,l=0.0,m=0.0,n=0,o=0.0,p=0.0,q=0.0,r=0.0,s=0.0,t=0.0;q=1.0-e;k=q*+g[a+32>>2]+ +g[a+36>>2]*e;f=+U(k);k=+T(k);i=+g[a+8>>2];h=+g[a+12>>2];l=q*+g[a+16>>2]+ +g[a+24>>2]*e-(k*i-f*h);h=q*+g[a+20>>2]+ +g[a+28>>2]*e-(f*i+k*h);i=q*+g[a+68>>2]+ +g[a+72>>2]*e;j=+U(i);i=+T(i);p=+g[a+44>>2];o=+g[a+48>>2];m=q*+g[a+52>>2]+ +g[a+60>>2]*e-(i*p-j*o);e=q*+g[a+56>>2]+ +g[a+64>>2]*e-(j*p+i*o);n=c[a+80>>2]|0;if((n|0)==0){n=(c[(c[a>>2]|0)+16>>2]|0)+(b<<3)|0;p=+g[n>>2];q=+g[n+4>>2];n=(c[(c[a+4>>2]|0)+16>>2]|0)+(d<<3)|0;r=+g[n>>2];o=+g[n+4>>2];q=+g[a+92>>2]*(m+(i*r-j*o)-(l+(k*p-f*q)))+ +g[a+96>>2]*(e+(j*r+i*o)-(h+(f*p+k*q)));return+q}else if((n|0)==2){t=+g[a+92>>2];s=+g[a+96>>2];q=+g[a+84>>2];r=+g[a+88>>2];n=(c[(c[a>>2]|0)+16>>2]|0)+(b<<3)|0;o=+g[n>>2];p=+g[n+4>>2];r=(i*t-j*s)*(l+(k*o-f*p)-(m+(i*q-j*r)))+(j*t+i*s)*(h+(f*o+k*p)-(e+(j*q+i*r)));return+r}else if((n|0)==1){o=+g[a+92>>2];p=+g[a+96>>2];s=+g[a+84>>2];t=+g[a+88>>2];n=(c[(c[a+4>>2]|0)+16>>2]|0)+(d<<3)|0;q=+g[n>>2];r=+g[n+4>>2];t=(k*o-f*p)*(m+(i*q-j*r)-(l+(k*s-f*t)))+(f*o+k*p)*(e+(j*q+i*r)-(h+(f*s+k*t)));return+t}else{t=0.0;return+t}return 0.0}function ee(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,h=0,i=0;e=c[b+4>>2]|0;if((e|0)==1){c[a+16>>2]=b+12;c[a+20>>2]=2;g[a+24>>2]=+g[b+8>>2];return}else if((e|0)==0){c[a+16>>2]=b+12;c[a+20>>2]=1;g[a+24>>2]=+g[b+8>>2];return}else if((e|0)==3){f=b+12|0;i=(c[f>>2]|0)+(d<<3)|0;e=a;h=c[i+4>>2]|0;c[e>>2]=c[i>>2];c[e+4>>2]=h;d=d+1|0;e=a+8|0;f=c[f>>2]|0;if((d|0)<(c[b+16>>2]|0)){f=f+(d<<3)|0;i=e;h=c[f+4>>2]|0;c[i>>2]=c[f>>2];c[i+4>>2]=h}else{i=e;h=c[f+4>>2]|0;c[i>>2]=c[f>>2];c[i+4>>2]=h}c[a+16>>2]=a;c[a+20>>2]=2;g[a+24>>2]=+g[b+8>>2];return}else if((e|0)==2){c[a+16>>2]=b+20;c[a+20>>2]=c[b+148>>2];g[a+24>>2]=+g[b+8>>2];return}else{return}}function fe(a){a=a|0;var b=0,d=0.0,e=0.0,f=0.0,h=0,i=0.0,j=0.0,k=0.0,l=0.0,m=0.0,n=0.0,o=0.0,p=0.0,q=0.0,r=0.0,s=0.0,t=0.0,u=0.0,v=0.0,w=0;h=a+16|0;r=+g[h>>2];p=+g[h+4>>2];h=a+36|0;b=a+52|0;o=+g[b>>2];q=+g[b+4>>2];b=a+72|0;w=a+88|0;s=+g[w>>2];l=+g[w+4>>2];u=o-r;k=q-p;d=r*u+p*k;i=o*u+q*k;j=s-r;t=l-p;f=r*j+p*t;e=s*j+l*t;v=s-o;m=l-q;n=o*v+q*m;m=s*v+l*m;j=u*t-k*j;k=(o*l-q*s)*j;l=(p*s-r*l)*j;j=(r*q-p*o)*j;if(!(d<-0.0|f<-0.0)){g[a+24>>2]=1.0;c[a+108>>2]=1;return}if(!(d>=-0.0|i<=0.0|j>0.0)){v=1.0/(i-d);g[a+24>>2]=i*v;g[a+60>>2]=v*(-0.0-d);c[a+108>>2]=2;return}if(!(f>=-0.0|e<=0.0|l>0.0)){v=1.0/(e-f);g[a+24>>2]=e*v;g[a+96>>2]=v*(-0.0-f);c[a+108>>2]=2;fn(h|0,b|0,36)|0;return}if(!(i>0.0|n<-0.0)){g[a+60>>2]=1.0;c[a+108>>2]=1;fn(a|0,h|0,36)|0;return}if(!(e>0.0|m>0.0)){g[a+96>>2]=1.0;c[a+108>>2]=1;fn(a|0,b|0,36)|0;return}if(n>=-0.0|m<=0.0|k>0.0){v=1.0/(j+(k+l));g[a+24>>2]=k*v;g[a+60>>2]=l*v;g[a+96>>2]=j*v;c[a+108>>2]=3;return}else{v=1.0/(m-n);g[a+60>>2]=m*v;g[a+96>>2]=v*(-0.0-n);c[a+108>>2]=2;fn(a|0,b|0,36)|0;return}}function ge(d,e,f){d=d|0;e=e|0;f=f|0;var h=0,j=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0.0,x=0,y=0,z=0.0,A=0,B=0.0,C=0,D=0,E=0,F=0.0,G=0.0,H=0.0,I=0,J=0,K=0.0,L=0.0,M=0.0,N=0,O=0,P=0,Q=0,S=0,T=0,U=0.0,V=0.0,W=0.0,X=0,Y=0.0,Z=0,_=0,$=0.0,aa=0.0,ba=0,ca=0;h=i;i=i+144|0;x=h|0;A=h+16|0;n=h+32|0;t=n|0;m=n;I=i;i=i+12|0;i=i+7&-8;J=i;i=i+12|0;i=i+7&-8;c[2092]=(c[2092]|0)+1;j=x;u=f+56|0;c[j>>2]=c[u>>2];c[j+4>>2]=c[u+4>>2];c[j+8>>2]=c[u+8>>2];c[j+12>>2]=c[u+12>>2];j=A;u=f+72|0;c[j>>2]=c[u>>2];c[j+4>>2]=c[u+4>>2];c[j+8>>2]=c[u+8>>2];c[j+12>>2]=c[u+12>>2];he(m,e,f|0,x,f+28|0,A);j=n;en(I|0,0,12)|0;en(J|0,0,12)|0;u=m+108|0;L=+g[x+12>>2];M=+g[x+8>>2];D=f+16|0;E=f+20|0;z=+g[x>>2];K=+g[x+4>>2];H=+g[A+12>>2];B=+g[A+8>>2];w=-0.0-B;x=f+44|0;C=f+48|0;F=+g[A>>2];G=+g[A+4>>2];A=n+16|0;l=A;o=m+20|0;p=m+52|0;q=n+56|0;v=m+52|0;r=n+24|0;s=m+60|0;y=n;N=m+36|0;P=0;O=c[u>>2]|0;a:while(1){Q=(O|0)>0;if(Q){S=0;do{c[I+(S<<2)>>2]=c[j+(S*36|0)+28>>2];c[J+(S<<2)>>2]=c[j+(S*36|0)+32>>2];S=S+1|0;}while((S|0)<(O|0))}do{if((O|0)==2){aa=+g[A>>2];U=+g[A+4>>2];$=+g[v>>2];Y=+g[v+4>>2];W=$-aa;V=Y-U;U=aa*W+U*V;if(!(U<-0.0)){g[r>>2]=1.0;c[u>>2]=1;T=13;break}V=$*W+Y*V;if(V>0.0){aa=1.0/(V-U);g[r>>2]=V*aa;g[s>>2]=aa*(-0.0-U);c[u>>2]=2;T=14;break}else{g[s>>2]=1.0;c[u>>2]=1;fn(y|0,N|0,36)|0;T=13;break}}else if((O|0)==3){fe(m);S=c[u>>2]|0;if((S|0)==3){T=11;break a}else{T=12}}else{S=O;T=12}}while(0);do{if((T|0)==12){T=0;if((S|0)==1){T=13;break}else if((S|0)==2){T=14;break}ca=8376;U=+g[ca>>2];V=+g[ca+4>>2]}}while(0);do{if((T|0)==13){U=-0.0- +g[l>>2];V=-0.0- +g[o>>2];S=1}else if((T|0)==14){aa=+g[l>>2];V=+g[p>>2]-aa;$=+g[o>>2];U=+g[q>>2]-$;if(V*(-0.0-$)-U*(-0.0-aa)>0.0){U=U*-1.0;S=2;break}else{V=V*-1.0;S=2;break}}}while(0);if(V*V+U*U<1.4210854715202004e-14){O=S;T=31;break}X=j+(S*36|0)|0;$=-0.0-V;aa=L*(-0.0-U)+M*$;$=L*$+U*M;Z=c[D>>2]|0;ba=c[E>>2]|0;if((ba|0)>1){Y=$*+g[Z+4>>2]+aa*+g[Z>>2];ca=1;T=0;while(1){W=aa*+g[Z+(ca<<3)>>2]+$*+g[Z+(ca<<3)+4>>2];_=W>Y;T=_?ca:T;ca=ca+1|0;if((ca|0)<(ba|0)){Y=_?W:Y}else{break}}}else{T=0}c[j+(S*36|0)+28>>2]=T;$=+g[Z+(T<<3)>>2];Y=+g[Z+(T<<3)+4>>2];W=z+(L*$-M*Y);aa=+W;Y=+($*M+L*Y+K);g[X>>2]=aa;g[X+4>>2]=Y;Y=U*H+V*B;U=V*H+U*w;X=c[x>>2]|0;Z=c[C>>2]|0;if((Z|0)>1){V=U*+g[X+4>>2]+Y*+g[X>>2];ca=1;ba=0;while(1){$=Y*+g[X+(ca<<3)>>2]+U*+g[X+(ca<<3)+4>>2];_=$>V;ba=_?ca:ba;ca=ca+1|0;if((ca|0)<(Z|0)){V=_?$:V}else{break}}}else{ba=0}c[j+(S*36|0)+32>>2]=ba;V=+g[X+(ba<<3)>>2];aa=+g[X+(ba<<3)+4>>2];$=F+(H*V-B*aa);ca=j+(S*36|0)+8|0;Y=+$;aa=+(V*B+H*aa+G);g[ca>>2]=Y;g[ca+4>>2]=aa;ca=j+(S*36|0)+16|0;$=+($-W);aa=+(+g[j+(S*36|0)+12>>2]- +g[j+(S*36|0)+4>>2]);g[ca>>2]=$;g[ca+4>>2]=aa;P=P+1|0;c[2090]=(c[2090]|0)+1;if(Q){Q=0;do{if((T|0)==(c[I+(Q<<2)>>2]|0)){if((ba|0)==(c[J+(Q<<2)>>2]|0)){T=30;break a}}Q=Q+1|0;}while((Q|0)<(O|0))}O=(c[u>>2]|0)+1|0;c[u>>2]=O;if((P|0)>=20){T=31;break}}if((T|0)==11){t=c[2088]|0;c[2088]=(t|0)>(P|0)?t:P;v=d+8|0;T=35}else if((T|0)==30){O=c[u>>2]|0;T=31}do{if((T|0)==31){u=c[2088]|0;c[2088]=(u|0)>(P|0)?u:P;v=d+8|0;if((O|0)==1){O=d;_=c[t>>2]|0;ca=c[t+4>>2]|0;c[O>>2]=_;c[O+4>>2]=ca;O=n+8|0;Z=v;ba=c[O>>2]|0;O=c[O+4>>2]|0;c[Z>>2]=ba;c[Z+4>>2]=O;F=(c[k>>2]=_,+g[k>>2]);B=(c[k>>2]=ba,+g[k>>2]);w=(c[k>>2]=ca,+g[k>>2]);z=(c[k>>2]=O,+g[k>>2]);O=1;break}else if((O|0)==2){$=+g[r>>2];z=+g[s>>2];F=$*+g[n>>2]+z*+g[m+36>>2];w=$*+g[m+4>>2]+z*+g[n+40>>2];O=d;aa=+F;B=+w;g[O>>2]=aa;g[O+4>>2]=B;B=$*+g[n+8>>2]+z*+g[m+44>>2];z=$*+g[m+12>>2]+z*+g[n+48>>2];O=v;$=+B;aa=+z;g[O>>2]=$;g[O+4>>2]=aa;O=2;break}else if((O|0)==3){T=35;break}else{F=+g[d>>2];B=+g[v>>2];w=+g[d+4>>2];z=+g[d+12>>2];break}}}while(0);if((T|0)==35){w=+g[r>>2];F=+g[s>>2];z=+g[n+96>>2];B=w*+g[n>>2]+F*+g[m+36>>2]+z*+g[n+72>>2];z=w*+g[m+4>>2]+F*+g[n+40>>2]+z*+g[m+76>>2];O=d;ca=(g[k>>2]=B,c[k>>2]|0);ca=ca|0;F=+z;c[O>>2]=ca;g[O+4>>2]=F;O=v;c[O>>2]=ca;g[O+4>>2]=F;F=B;w=z;O=3}r=d|0;s=v|0;$=F-B;u=d+4|0;t=d+12|0;aa=w-z;x=d+16|0;g[x>>2]=+R($*$+aa*aa);c[d+20>>2]=P;if((O|0)==2){aa=+g[l>>2]- +g[p>>2];w=+g[o>>2]- +g[q>>2];w=+R(aa*aa+w*w);T=39}else if((O|0)==3){w=+g[l>>2];aa=+g[o>>2];w=(+g[p>>2]-w)*(+g[m+92>>2]-aa)-(+g[q>>2]-aa)*(+g[n+88>>2]-w);T=39}else{g[e>>2]=0.0;b[e+4>>1]=O;if((O|0)>0){l=0;T=41}}if((T|0)==39){g[e>>2]=w;b[e+4>>1]=O;l=0;T=41}if((T|0)==41){while(1){a[e+6+l|0]=c[j+(l*36|0)+28>>2];a[e+9+l|0]=c[j+(l*36|0)+32>>2];l=l+1|0;if((l|0)<(O|0)){T=41}else{break}}}if((a[f+88|0]|0)==0){i=h;return}w=+g[f+24>>2];z=+g[f+52>>2];B=+g[x>>2];F=w+z;if(!(B>F&B>1.1920928955078125e-7)){ca=d;ba=(g[k>>2]=(+g[r>>2]+ +g[s>>2])*.5,c[k>>2]|0);ba=ba|0;aa=+((+g[u>>2]+ +g[t>>2])*.5);c[ca>>2]=ba;g[ca+4>>2]=aa;ca=v;c[ca>>2]=ba;g[ca+4>>2]=aa;g[x>>2]=0.0;i=h;return}g[x>>2]=B-F;F=+g[s>>2];H=+g[r>>2];M=F-H;B=+g[t>>2];G=+g[u>>2];K=B-G;L=+R(M*M+K*K);if(L<1.1920928955078125e-7){L=M}else{aa=1.0/L;L=M*aa;K=K*aa}g[r>>2]=w*L+H;g[u>>2]=w*K+G;g[s>>2]=F-z*L;g[t>>2]=B-z*K;i=h;return}function he(a,e,f,h,i,j){a=a|0;e=e|0;f=f|0;h=h|0;i=i|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0.0,A=0.0,B=0.0,C=0.0,D=0.0,E=0.0,F=0.0,G=0.0,H=0;x=b[e+4>>1]|0;y=x&65535;l=a+108|0;c[l>>2]=y;m=a|0;if(!(x<<16>>16==0)){p=f+16|0;q=i+16|0;n=h+12|0;s=h+8|0;t=h|0;u=h+4|0;v=j+12|0;w=j+8|0;o=j|0;r=j+4|0;x=0;do{H=d[e+6+x|0]|0;c[m+(x*36|0)+28>>2]=H;y=d[e+9+x|0]|0;c[m+(x*36|0)+32>>2]=y;H=(c[p>>2]|0)+(H<<3)|0;A=+g[H>>2];C=+g[H+4>>2];y=(c[q>>2]|0)+(y<<3)|0;D=+g[y>>2];F=+g[y+4>>2];G=+g[n>>2];E=+g[s>>2];z=+g[t>>2]+(A*G-C*E);y=m+(x*36|0)|0;B=+z;E=+(G*C+A*E+ +g[u>>2]);g[y>>2]=B;g[y+4>>2]=E;E=+g[v>>2];B=+g[w>>2];A=+g[o>>2]+(D*E-F*B);y=m+(x*36|0)+8|0;C=+A;B=+(F*E+D*B+ +g[r>>2]);g[y>>2]=C;g[y+4>>2]=B;y=m+(x*36|0)+16|0;z=+(A-z);A=+(+g[m+(x*36|0)+12>>2]- +g[m+(x*36|0)+4>>2]);g[y>>2]=z;g[y+4>>2]=A;g[m+(x*36|0)+24>>2]=0.0;x=x+1|0;y=c[l>>2]|0;}while((x|0)<(y|0))}do{if((y|0)>1){z=+g[e>>2];if((y|0)==2){G=+g[a+16>>2]- +g[a+52>>2];A=+g[a+20>>2]- +g[a+56>>2];A=+R(G*G+A*A)}else if((y|0)==3){A=+g[a+16>>2];G=+g[a+20>>2];A=(+g[a+52>>2]-A)*(+g[a+92>>2]-G)-(+g[a+56>>2]-G)*(+g[a+88>>2]-A)}else{A=0.0}if(!(A<z*.5)){if(!(z*2.0<A|A<1.1920928955078125e-7)){k=11;break}}c[l>>2]=0}else{k=11}}while(0);do{if((k|0)==11){if((y|0)==0){break}return}}while(0);c[a+28>>2]=0;c[a+32>>2]=0;H=c[f+16>>2]|0;E=+g[H>>2];C=+g[H+4>>2];H=c[i+16>>2]|0;B=+g[H>>2];A=+g[H+4>>2];D=+g[h+12>>2];G=+g[h+8>>2];F=+g[h>>2]+(E*D-C*G);G=D*C+E*G+ +g[h+4>>2];H=a;E=+F;C=+G;g[H>>2]=E;g[H+4>>2]=C;C=+g[j+12>>2];E=+g[j+8>>2];D=+g[j>>2]+(B*C-A*E);E=A*C+B*E+ +g[j+4>>2];H=a+8|0;B=+D;C=+E;g[H>>2]=B;g[H+4>>2]=C;H=a+16|0;F=+(D-F);G=+(E-G);g[H>>2]=F;g[H+4>>2]=G;g[a+24>>2]=1.0;c[l>>2]=1;return}function ie(b,d){b=b|0;d=d|0;var e=0,f=0,h=0;d=mm(d,48)|0;if((d|0)==0){d=0}else{c[d>>2]=6064;c[d+4>>2]=1;g[d+8>>2]=.009999999776482582;en(d+28|0,0,18)|0}c[d+4>>2]=c[b+4>>2];g[d+8>>2]=+g[b+8>>2];h=b+12|0;e=d+12|0;f=c[h+4>>2]|0;c[e>>2]=c[h>>2];c[e+4>>2]=f;e=b+20|0;f=d+20|0;h=c[e+4>>2]|0;c[f>>2]=c[e>>2];c[f+4>>2]=h;f=b+28|0;h=d+28|0;e=c[f+4>>2]|0;c[h>>2]=c[f>>2];c[h+4>>2]=e;h=b+36|0;e=d+36|0;f=c[h+4>>2]|0;c[e>>2]=c[h>>2];c[e+4>>2]=f;a[d+44|0]=a[b+44|0]|0;a[d+45|0]=a[b+45|0]|0;return d|0}function je(a){a=a|0;return 1}function ke(a,b,c){a=a|0;b=b|0;c=c|0;return 0}function le(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;var h=0.0,i=0.0,j=0.0,k=0.0,l=0.0,m=0.0,n=0.0,o=0.0,p=0.0,q=0.0;j=+g[b+12>>2];m=+g[a+12>>2];i=+g[b+8>>2];k=+g[a+16>>2];n=+g[b>>2];o=n+(j*m-i*k);l=+g[b+4>>2];k=m*i+j*k+l;m=+g[a+20>>2];h=+g[a+24>>2];n=n+(j*m-i*h);h=l+(i*m+j*h);j=+g[c>>2];m=j-o;i=+g[c+4>>2];l=i-k;o=n-o;k=h-k;p=m*o+l*k;do{if(p>0.0){q=o*o+k*k;if(p>q){m=j-n;l=i-h;break}else{q=p/q;m=m-o*q;l=l-k*q;break}}}while(0);h=+R(l*l+m*m);g[d>>2]=h;if(h>0.0){i=1.0/h;h=m*i;i=l*i}else{a=8376;h=+g[a>>2];i=+g[a+4>>2]}a=e;p=+h;q=+i;g[a>>2]=p;g[a+4>>2]=q;return}function me(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;var f=0.0,h=0.0,i=0.0,j=0.0,k=0.0,l=0.0,m=0.0,n=0.0,o=0.0,p=0.0,q=0.0,r=0.0,s=0.0,t=0;o=+g[d>>2];k=+g[c>>2]-o;l=+g[d+4>>2];n=+g[c+4>>2]-l;e=d+12|0;i=+g[e>>2];d=d+8|0;h=+g[d>>2];f=k*i+n*h;j=-0.0-h;k=i*n+k*j;o=+g[c+8>>2]-o;l=+g[c+12>>2]-l;h=i*o+h*l-f;l=o*j+i*l-k;t=a+12|0;i=+g[t>>2];j=+g[t+4>>2];a=a+20|0;o=+g[a>>2];o=o-i;n=+g[a+4>>2]-j;r=-0.0-o;m=o*o+n*n;p=+R(m);if(p<1.1920928955078125e-7){q=n}else{s=1.0/p;q=n*s;r=s*r}p=(j-k)*r+(i-f)*q;s=l*r+h*q;if(s==0.0){t=0;return t|0}s=p/s;if(s<0.0){t=0;return t|0}if(+g[c+16>>2]<s|m==0.0){t=0;return t|0}o=(o*(f+h*s-i)+n*(k+l*s-j))/m;if(o<0.0|o>1.0){t=0;return t|0}g[b+8>>2]=s;s=+g[e>>2];h=+g[d>>2];f=q*s-r*h;h=r*s+q*h;if(p>0.0){t=b;r=+(-0.0-f);s=+(-0.0-h);g[t>>2]=r;g[t+4>>2]=s;t=1;return t|0}else{t=b;r=+f;s=+h;g[t>>2]=r;g[t+4>>2]=s;t=1;return t|0}return 0}function ne(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0.0,f=0.0,h=0.0,i=0.0,j=0.0,k=0.0,l=0.0,m=0.0;j=+g[c+12>>2];k=+g[a+12>>2];l=+g[c+8>>2];f=+g[a+16>>2];i=+g[c>>2];h=i+(j*k-l*f);m=+g[c+4>>2];f=k*l+j*f+m;k=+g[a+20>>2];e=+g[a+24>>2];i=i+(j*k-l*e);e=m+(l*k+j*e);j=+g[a+8>>2];a=b;k=+((h<i?h:i)-j);m=+((f<e?f:e)-j);g[a>>2]=k;g[a+4>>2]=m;b=b+8|0;h=+(j+(h>i?h:i));m=+(j+(f>e?f:e));g[b>>2]=h;g[b+4>>2]=m;return}function oe(a,b,c){a=a|0;b=b|0;c=+c;var d=0,e=0.0;g[b>>2]=0.0;d=b+4|0;e=+((+g[a+12>>2]+ +g[a+20>>2])*.5);c=+((+g[a+16>>2]+ +g[a+24>>2])*.5);g[d>>2]=e;g[d+4>>2]=c;g[b+12>>2]=0.0;return}function pe(a,b){a=a|0;b=b|0;var d=0,e=0,f=0;b=mm(b,152)|0;if((b|0)==0){b=0}else{c[b>>2]=5448;c[b+4>>2]=2;g[b+8>>2]=.009999999776482582;c[b+148>>2]=0;g[b+12>>2]=0.0;g[b+16>>2]=0.0}c[b+4>>2]=c[a+4>>2];g[b+8>>2]=+g[a+8>>2];f=a+12|0;d=b+12|0;e=c[f+4>>2]|0;c[d>>2]=c[f>>2];c[d+4>>2]=e;fn(b+20|0,a+20|0,64)|0;fn(b+84|0,a+84|0,64)|0;c[b+148>>2]=c[a+148>>2];return b|0}function qe(a){a=a|0;return 1}function re(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,h=0,j=0,l=0,m=0,n=0,o=0.0,p=0.0,q=0.0,r=0.0,s=0.0,t=0,u=0,v=0,w=0.0,x=0.0,y=0.0;f=i;i=i+96|0;j=f|0;h=f+64|0;if((d|0)<3){c[a+148>>2]=4;g[a+20>>2]=-1.0;g[a+24>>2]=-1.0;g[a+28>>2]=1.0;g[a+32>>2]=-1.0;g[a+36>>2]=1.0;g[a+40>>2]=1.0;g[a+44>>2]=-1.0;g[a+48>>2]=1.0;g[a+84>>2]=0.0;g[a+88>>2]=-1.0;g[a+92>>2]=1.0;g[a+96>>2]=0.0;g[a+100>>2]=0.0;g[a+104>>2]=1.0;g[a+108>>2]=-1.0;g[a+112>>2]=0.0;g[a+12>>2]=0.0;g[a+16>>2]=0.0;i=f;return}l=(d|0)<8?d:8;do{if((l|0)>0){m=0;d=0;do{v=b+(m<<3)|0;n=c[v>>2]|0;v=c[v+4>>2]|0;p=(c[k>>2]=n,+g[k>>2]);u=v;o=(c[k>>2]=u,+g[k>>2]);t=0;while(1){if((t|0)>=(d|0)){e=7;break}r=p- +g[j+(t<<3)>>2];s=o- +g[j+(t<<3)+4>>2];if(r*r+s*s<.0024999999441206455){break}else{t=t+1|0}}if((e|0)==7){e=0;t=j+(d<<3)|0;c[t>>2]=n|0;c[t+4>>2]=u|v&0;d=d+1|0}m=m+1|0;}while((m|0)<(l|0));if((d|0)<3){break}l=0;o=+g[j>>2];b=1;while(1){p=+g[j+(b<<3)>>2];do{if(p>o){e=22}else{if(!(p==o)){break}if(+g[j+(b<<3)+4>>2]<+g[j+(l<<3)+4>>2]){e=22}}}while(0);if((e|0)==22){e=0;o=p;l=b}b=b+1|0;if((b|0)>=(d|0)){m=l;b=0;break}}while(1){c[h+(b<<2)>>2]=m;t=0;n=1;do{do{if((t|0)==(m|0)){t=n}else{s=+g[j+(m<<3)>>2];q=+g[j+(t<<3)>>2]-s;r=+g[j+(m<<3)+4>>2];p=+g[j+(t<<3)+4>>2]-r;s=+g[j+(n<<3)>>2]-s;r=+g[j+(n<<3)+4>>2]-r;o=q*r-p*s;t=o<0.0?n:t;if(!(o==0.0)){break}if(!(s*s+r*r>q*q+p*p)){break}t=n}}while(0);n=n+1|0;}while((n|0)<(d|0));b=b+1|0;if((t|0)==(l|0)){break}else{m=t}}c[a+148>>2]=b;d=(b|0)>0;do{if(d){l=0;do{t=j+(c[h+(l<<2)>>2]<<3)|0;v=a+20+(l<<3)|0;u=c[t+4>>2]|0;c[v>>2]=c[t>>2];c[v+4>>2]=u;l=l+1|0;}while((l|0)<(b|0));if(d){m=0}else{e=30;break}while(1){h=m+1|0;j=(h|0)<(b|0);u=j?h:0;o=+g[a+20+(u<<3)+4>>2]- +g[a+20+(m<<3)+4>>2];l=a+84+(m<<3)|0;v=l;q=+o;p=+((+g[a+20+(u<<3)>>2]- +g[a+20+(m<<3)>>2])*-1.0);g[v>>2]=q;g[v+4>>2]=p;m=a+84+(m<<3)+4|0;p=+g[m>>2];q=+R(o*o+p*p);if(!(q<1.1920928955078125e-7)){s=1.0/q;g[l>>2]=o*s;g[m>>2]=p*s}if(j){m=h}else{break}}h=a+12|0;j=a+20|0;if(d){d=0;r=0.0;q=0.0;p=0.0}else{r=0.0;q=0.0;p=0.0;break}do{l=a+20+(d<<3)|0;s=+g[l>>2];o=+g[l+4>>2];d=d+1|0;l=(d|0)<(b|0);if(l){m=a+20+(d<<3)|0}else{m=j}v=m;y=+g[v>>2];x=+g[v+4>>2];w=(s*x-o*y)*.5;r=r+w;w=w*.3333333432674408;q=q+(s+0.0+y)*w;p=p+(o+0.0+x)*w}while(l)}else{e=30}}while(0);if((e|0)==30){r=0.0;q=0.0;p=0.0;h=a+12|0}y=1.0/r;v=h;x=+(q*y);y=+(p*y);g[v>>2]=x;g[v+4>>2]=y;i=f;return}}while(0);c[a+148>>2]=4;g[a+20>>2]=-1.0;g[a+24>>2]=-1.0;g[a+28>>2]=1.0;g[a+32>>2]=-1.0;g[a+36>>2]=1.0;g[a+40>>2]=1.0;g[a+44>>2]=-1.0;g[a+48>>2]=1.0;g[a+84>>2]=0.0;g[a+88>>2]=-1.0;g[a+92>>2]=1.0;g[a+96>>2]=0.0;g[a+100>>2]=0.0;g[a+104>>2]=1.0;g[a+108>>2]=-1.0;g[a+112>>2]=0.0;g[a+12>>2]=0.0;g[a+16>>2]=0.0;i=f;return}function se(a,b,d){a=a|0;b=b|0;d=d|0;var e=0.0,f=0.0,h=0.0,i=0.0,j=0.0;h=+g[d>>2]- +g[b>>2];i=+g[d+4>>2]- +g[b+4>>2];j=+g[b+12>>2];f=+g[b+8>>2];e=h*j+i*f;f=j*i+h*(-0.0-f);b=c[a+148>>2]|0;d=0;while(1){if((d|0)>=(b|0)){b=1;a=4;break}if((e- +g[a+20+(d<<3)>>2])*+g[a+84+(d<<3)>>2]+(f- +g[a+20+(d<<3)+4>>2])*+g[a+84+(d<<3)+4>>2]>0.0){b=0;a=4;break}else{d=d+1|0}}if((a|0)==4){return b|0}return 0}function te(a,b,d,e,f,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;h=h|0;var i=0.0,j=0.0,k=0.0,l=0.0,m=0,n=0.0,o=0.0,p=0,q=0.0,r=0.0,s=0;r=+g[d>>2]- +g[b>>2];q=+g[d+4>>2]- +g[b+4>>2];d=b+12|0;o=+g[d>>2];b=b+8|0;i=+g[b>>2];j=r*o+q*i;i=o*q+r*(-0.0-i);h=c[a+148>>2]|0;m=(h|0)>0;do{if(m){k=i;l=j;p=0;o=-3.4028234663852886e+38;while(1){s=a+84+(p<<3)|0;n=(j- +g[a+20+(p<<3)>>2])*+g[s>>2]+(i- +g[a+20+(p<<3)+4>>2])*+g[a+84+(p<<3)+4>>2];if(n>o){l=+g[s>>2];k=+g[s+4>>2]}else{n=o}p=p+1|0;if((p|0)<(h|0)){o=n}else{break}}if(!(n>0.0)){j=l;i=k;break}n=n*n;if(m){m=0;do{q=j- +g[a+20+(m<<3)>>2];r=i- +g[a+20+(m<<3)+4>>2];o=q*q+r*r;p=n>o;k=p?r:k;l=p?q:l;n=p?o:n;m=m+1|0;}while((m|0)<(h|0))}g[e>>2]=+R(n);r=+g[d>>2];j=+g[b>>2];i=l*r-k*j;j=k*r+l*j;s=f;r=+i;k=+j;g[s>>2]=r;g[s+4>>2]=k;k=+R(i*i+j*j);if(k<1.1920928955078125e-7){return}r=1.0/k;g[f>>2]=i*r;g[f+4>>2]=j*r;return}else{n=-3.4028234663852886e+38}}while(0);g[e>>2]=n;o=+g[d>>2];r=+g[b>>2];s=f;q=+(j*o-i*r);r=+(i*o+j*r);g[s>>2]=q;g[s+4>>2]=r;return}function ue(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var h=0,i=0.0,j=0.0,k=0.0,l=0,m=0,n=0.0,o=0.0,p=0.0,q=0.0,r=0.0,s=0.0;r=+g[e>>2];j=+g[d>>2]-r;k=+g[e+4>>2];q=+g[d+4>>2]-k;f=e+12|0;n=+g[f>>2];e=e+8|0;o=+g[e>>2];i=j*n+q*o;p=-0.0-o;j=n*q+j*p;r=+g[d+8>>2]-r;k=+g[d+12>>2]-k;o=n*r+o*k-i;k=r*p+n*k-j;l=c[a+148>>2]|0;n=0.0;m=0;h=-1;p=+g[d+16>>2];a:while(1){if((m|0)>=(l|0)){l=12;break}s=+g[a+84+(m<<3)>>2];q=+g[a+84+(m<<3)+4>>2];r=(+g[a+20+(m<<3)>>2]-i)*s+(+g[a+20+(m<<3)+4>>2]-j)*q;q=o*s+k*q;b:do{if(q==0.0){if(r<0.0){b=0;l=14;break a}}else{do{if(q<0.0){if(!(r<n*q)){break}n=r/q;h=m;break b}}while(0);if(!(q>0.0)){break}if(!(r<p*q)){break}p=r/q}}while(0);if(p<n){b=0;l=14;break}else{m=m+1|0}}if((l|0)==12){if(!((h|0)>-1)){d=0;return d|0}g[b+8>>2]=n;q=+g[f>>2];o=+g[a+84+(h<<3)>>2];p=+g[e>>2];s=+g[a+84+(h<<3)+4>>2];d=b;r=+(q*o-p*s);s=+(o*p+q*s);g[d>>2]=r;g[d+4>>2]=s;d=1;return d|0}else if((l|0)==14){return b|0}return 0}function ve(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0.0,h=0.0,i=0.0,j=0.0,k=0.0,l=0.0,m=0.0,n=0.0,o=0.0,p=0.0,q=0.0;f=+g[d+12>>2];p=+g[a+20>>2];i=+g[d+8>>2];m=+g[a+24>>2];h=+g[d>>2];k=h+(f*p-i*m);j=+g[d+4>>2];m=p*i+f*m+j;d=c[a+148>>2]|0;if((d|0)>1){l=m;n=k;e=1;do{q=+g[a+20+(e<<3)>>2];o=+g[a+20+(e<<3)+4>>2];p=h+(f*q-i*o);o=q*i+f*o+j;n=n<p?n:p;l=l<o?l:o;k=k>p?k:p;m=m>o?m:o;e=e+1|0;}while((e|0)<(d|0))}else{l=m;n=k}q=+g[a+8>>2];e=b;o=+(n-q);p=+(l-q);g[e>>2]=o;g[e+4>>2]=p;e=b+8|0;p=+(k+q);q=+(m+q);g[e>>2]=p;g[e+4>>2]=q;return}function we(a,b,d){a=a|0;b=b|0;d=+d;var e=0.0,f=0.0,h=0,i=0,j=0.0,k=0,l=0.0,m=0.0,n=0.0,o=0.0,p=0,q=0,r=0.0,s=0,t=0,u=0.0,v=0.0,w=0.0,x=0.0;h=c[a+148>>2]|0;i=(h|0)>0;do{if(i){f=0.0;e=0.0;k=0;do{e=e+ +g[a+20+(k<<3)>>2];f=f+ +g[a+20+(k<<3)+4>>2];k=k+1|0;}while((k|0)<(h|0));r=1.0/+(h|0);e=e*r;f=f*r;if(!i){n=0.0;r=0.0;m=0.0;j=0.0;break}i=a+20|0;k=a+24|0;n=0.0;r=0.0;q=0;m=0.0;j=0.0;do{o=+g[a+20+(q<<3)>>2]-e;l=+g[a+20+(q<<3)+4>>2]-f;q=q+1|0;p=(q|0)<(h|0);if(p){t=a+20+(q<<3)|0;s=a+20+(q<<3)+4|0}else{t=i;s=k}v=+g[t>>2]-e;u=+g[s>>2]-f;w=o*u-l*v;x=w*.5;j=j+x;x=x*.3333333432674408;r=r+(o+v)*x;n=n+(l+u)*x;m=m+w*.0833333358168602*(v*v+(o*o+o*v)+(u*u+(l*l+l*u)))}while(p)}else{f=1.0/+(h|0);n=0.0;r=0.0;m=0.0;j=0.0;e=f*0.0;f=f*0.0}}while(0);o=j*d;g[b>>2]=o;x=1.0/j;w=r*x;x=n*x;u=e+w;v=f+x;t=b+4|0;n=+u;r=+v;g[t>>2]=n;g[t+4>>2]=r;g[b+12>>2]=m*d+o*(u*u+v*v-(w*w+x*x));return}function xe(a,b){a=a|0;b=b|0;var d=0,e=0;b=mm(b,20)|0;if((b|0)==0){b=0}else{c[b>>2]=5568;en(b+4|0,0,16)|0}c[b+4>>2]=c[a+4>>2];g[b+8>>2]=+g[a+8>>2];e=a+12|0;a=b+12|0;d=c[e+4>>2]|0;c[a>>2]=c[e>>2];c[a+4>>2]=d;return b|0}function ye(a){a=a|0;return 1}function ze(a,b,c){a=a|0;b=b|0;c=c|0;var d=0.0,e=0.0,f=0.0,h=0.0,i=0.0;d=+g[b+12>>2];i=+g[a+12>>2];h=+g[b+8>>2];e=+g[a+16>>2];f=+g[c>>2]-(+g[b>>2]+(d*i-h*e));e=+g[c+4>>2]-(+g[b+4>>2]+(i*h+d*e));d=+g[a+8>>2];return f*f+e*e<=d*d|0}function Ae(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;var h=0.0,i=0.0,j=0.0,k=0.0,l=0.0;h=+g[b+12>>2];l=+g[a+12>>2];k=+g[b+8>>2];j=+g[a+16>>2];i=+g[c>>2]-(+g[b>>2]+(h*l-k*j));j=+g[c+4>>2]-(+g[b+4>>2]+(l*k+h*j));h=+R(i*i+j*j);g[d>>2]=h- +g[a+8>>2];h=1.0/h;f=e;i=+(i*h);h=+(j*h);g[f>>2]=i;g[f+4>>2]=h;return}function Be(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;var f=0.0,h=0.0,i=0.0,j=0.0,k=0.0,l=0.0,m=0.0;m=+g[d+12>>2];j=+g[a+12>>2];l=+g[d+8>>2];h=+g[a+16>>2];k=+g[c>>2];f=k-(+g[d>>2]+(m*j-l*h));i=+g[c+4>>2];h=i-(+g[d+4>>2]+(j*l+m*h));m=+g[a+8>>2];k=+g[c+8>>2]-k;i=+g[c+12>>2]-i;l=f*k+h*i;j=k*k+i*i;m=l*l-(f*f+h*h-m*m)*j;if(m<0.0|j<1.1920928955078125e-7){e=0;return e|0}m=l+ +R(m);l=-0.0-m;if(m>-0.0){e=0;return e|0}if(j*+g[c+16>>2]<l){e=0;return e|0}m=l/j;g[b+8>>2]=m;f=f+k*m;i=h+i*m;e=b;m=+f;h=+i;g[e>>2]=m;g[e+4>>2]=h;h=+R(f*f+i*i);if(h<1.1920928955078125e-7){e=1;return e|0}m=1.0/h;g[b>>2]=f*m;g[b+4>>2]=i*m;e=1;return e|0}function Ce(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0.0,f=0.0,h=0.0,i=0.0,j=0.0;e=+g[c+12>>2];j=+g[a+12>>2];i=+g[c+8>>2];f=+g[a+16>>2];h=+g[c>>2]+(e*j-i*f);f=+g[c+4>>2]+(j*i+e*f);d=a+8|0;e=+g[d>>2];g[b>>2]=h-e;g[b+4>>2]=f-e;e=+g[d>>2];g[b+8>>2]=h+e;g[b+12>>2]=f+e;return}function De(a,b,d){a=a|0;b=b|0;d=+d;var e=0.0,f=0.0,h=0.0,i=0,j=0,k=0,l=0,m=0;j=a+8|0;h=+g[j>>2];h=h*d*3.1415927410125732*h;g[b>>2]=h;i=a+12|0;m=i;k=b+4|0;l=c[m+4>>2]|0;c[k>>2]=c[m>>2];c[k+4>>2]=l;f=+g[j>>2];e=+g[i>>2];d=+g[a+16>>2];g[b+12>>2]=h*(f*f*.5+(e*e+d*d));return}function Ee(a){a=a|0;c[a>>2]=5816;ym(c[a+12>>2]|0);$m(a);return}function Fe(a){a=a|0;var b=0;c[a>>2]=5816;b=a+12|0;ym(c[b>>2]|0);c[b>>2]=0;c[a+16>>2]=0;return}function Ge(a,b,d){a=a|0;b=b|0;d=d|0;var e=0;e=a+16|0;c[e>>2]=d;d=xm(d<<3)|0;c[a+12>>2]=d;fn(d|0,b|0,c[e>>2]<<3)|0;en(a+20|0,0,18)|0;return}function He(b,d){b=b|0;d=d|0;var e=0,f=0,h=0;d=mm(d,40)|0;if((d|0)==0){d=0}else{c[d>>2]=5816;c[d+4>>2]=3;g[d+8>>2]=.009999999776482582;c[d+12>>2]=0;c[d+16>>2]=0;a[d+36|0]=0;a[d+37|0]=0}h=c[b+12>>2]|0;e=c[b+16>>2]|0;f=d+16|0;c[f>>2]=e;e=xm(e<<3)|0;c[d+12>>2]=e;fn(e|0,h|0,c[f>>2]<<3)|0;en(d+20|0,0,18)|0;f=b+20|0;h=d+20|0;e=c[f+4>>2]|0;c[h>>2]=c[f>>2];c[h+4>>2]=e;h=b+28|0;e=d+28|0;f=c[h+4>>2]|0;c[e>>2]=c[h>>2];c[e+4>>2]=f;a[d+36|0]=a[b+36|0]|0;a[d+37|0]=a[b+37|0]|0;return d|0}function Ie(a){a=a|0;return(c[a+16>>2]|0)-1|0}function Je(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,h=0,i=0,j=0,k=0;c[d+4>>2]=1;g[d+8>>2]=+g[b+8>>2];f=b+12|0;i=(c[f>>2]|0)+(e<<3)|0;j=d+12|0;h=c[i+4>>2]|0;c[j>>2]=c[i>>2];c[j+4>>2]=h;j=(c[f>>2]|0)+(e+1<<3)|0;h=d+20|0;i=c[j+4>>2]|0;c[h>>2]=c[j>>2];c[h+4>>2]=i;h=d+28|0;if((e|0)>0){k=(c[f>>2]|0)+(e-1<<3)|0;j=h;i=c[k+4>>2]|0;c[j>>2]=c[k>>2];c[j+4>>2]=i;a[d+44|0]=1}else{i=b+20|0;k=h;j=c[i+4>>2]|0;c[k>>2]=c[i>>2];c[k+4>>2]=j;a[d+44|0]=a[b+36|0]|0}h=d+36|0;if(((c[b+16>>2]|0)-2|0)>(e|0)){i=(c[f>>2]|0)+(e+2<<3)|0;k=h;j=c[i+4>>2]|0;c[k>>2]=c[i>>2];c[k+4>>2]=j;a[d+45|0]=1;return}else{i=b+28|0;k=h;j=c[i+4>>2]|0;c[k>>2]=c[i>>2];c[k+4>>2]=j;a[d+45|0]=a[b+37|0]|0;return}}function Ke(b,d,e,f,h,j){b=b|0;d=d|0;e=e|0;f=f|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0;l=i;i=i+48|0;k=l|0;c[k>>2]=6064;en(k+28|0,0,18)|0;c[k+4>>2]=1;g[k+8>>2]=+g[b+8>>2];m=c[b+12>>2]|0;o=m+(j<<3)|0;p=k+12|0;n=c[o+4>>2]|0;c[p>>2]=c[o>>2];c[p+4>>2]=n;p=m+(j+1<<3)|0;n=k+20|0;o=c[p+4>>2]|0;c[n>>2]=c[p>>2];c[n+4>>2]=o;n=k+28|0;if((j|0)>0){q=m+(j-1<<3)|0;p=n;o=c[q+4>>2]|0;c[p>>2]=c[q>>2];c[p+4>>2]=o;a[k+44|0]=1}else{o=b+20|0;q=n;p=c[o+4>>2]|0;c[q>>2]=c[o>>2];c[q+4>>2]=p;a[k+44|0]=a[b+36|0]|0}n=k+36|0;if(((c[b+16>>2]|0)-2|0)>(j|0)){o=m+(j+2<<3)|0;q=n;p=c[o+4>>2]|0;c[q>>2]=c[o>>2];c[q+4>>2]=p;a[k+45|0]=1;le(k,d,e,f,h,0);i=l;return}else{o=b+28|0;q=n;p=c[o+4>>2]|0;c[q>>2]=c[o>>2];c[q+4>>2]=p;a[k+45|0]=a[b+37|0]|0;le(k,d,e,f,h,0);i=l;return}}function Le(a,b,c){a=a|0;b=b|0;c=c|0;return 0}function Me(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var h=0,j=0,k=0,l=0,m=0;h=i;i=i+48|0;j=h|0;c[j>>2]=6064;c[j+4>>2]=1;g[j+8>>2]=.009999999776482582;en(j+28|0,0,18)|0;k=f+1|0;k=(k|0)==(c[a+16>>2]|0)?0:k;a=c[a+12>>2]|0;m=a+(f<<3)|0;f=j+12|0;l=c[m+4>>2]|0;c[f>>2]=c[m>>2];c[f+4>>2]=l;a=a+(k<<3)|0;f=j+20|0;k=c[a+4>>2]|0;c[f>>2]=c[a>>2];c[f+4>>2]=k;e=me(j,b,d,e,0)|0;i=h;return e|0}function Ne(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0.0,h=0.0,i=0.0,j=0.0,k=0.0,l=0,m=0.0,n=0.0,o=0.0;l=e+1|0;l=(l|0)==(c[a+16>>2]|0)?0:l;a=c[a+12>>2]|0;k=+g[d+12>>2];m=+g[a+(e<<3)>>2];n=+g[d+8>>2];h=+g[a+(e<<3)+4>>2];j=+g[d>>2];f=j+(k*m-n*h);o=+g[d+4>>2];h=m*n+k*h+o;m=+g[a+(l<<3)>>2];i=+g[a+(l<<3)+4>>2];j=j+(k*m-n*i);i=o+(n*m+k*i);d=b;k=+(f<j?f:j);o=+(h<i?h:i);g[d>>2]=k;g[d+4>>2]=o;b=b+8|0;f=+(f>j?f:j);o=+(h>i?h:i);g[b>>2]=f;g[b+4>>2]=o;return}function Oe(a,b,c){a=a|0;b=b|0;c=+c;en(b|0,0,16)|0;return}function Pe(a){a=a|0;Ye(a|0);c[a+28>>2]=0;c[a+48>>2]=16;c[a+52>>2]=0;c[a+44>>2]=xm(128)|0;c[a+36>>2]=16;c[a+40>>2]=0;c[a+32>>2]=xm(64)|0;return}function Qe(a){a=a|0;ym(c[a+32>>2]|0);ym(c[a+44>>2]|0);Ze(a|0);return}function Re(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0;d=$e(a|0,b,d)|0;b=a+28|0;c[b>>2]=(c[b>>2]|0)+1;b=a+40|0;e=c[b>>2]|0;f=a+36|0;a=a+32|0;if((e|0)==(c[f>>2]|0)){g=c[a>>2]|0;c[f>>2]=e<<1;f=xm(e<<3)|0;c[a>>2]=f;e=g;fn(f|0,e|0,c[b>>2]<<2)|0;ym(e);e=c[b>>2]|0}c[(c[a>>2]|0)+(e<<2)>>2]=d;c[b>>2]=(c[b>>2]|0)+1;return d|0}function Se(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0;d=a+40|0;g=c[d>>2]|0;if((g|0)>0){e=c[a+32>>2]|0;f=0;do{h=e+(f<<2)|0;if((c[h>>2]|0)==(b|0)){c[h>>2]=-1;g=c[d>>2]|0}f=f+1|0;}while((f|0)<(g|0))}h=a+28|0;c[h>>2]=(c[h>>2]|0)-1;bf(a|0,b);return}function Te(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0;if(!(df(a|0,b,d,e)|0)){return}e=a+40|0;d=c[e>>2]|0;f=a+36|0;a=a+32|0;if((d|0)==(c[f>>2]|0)){g=c[a>>2]|0;c[f>>2]=d<<1;f=xm(d<<3)|0;c[a>>2]=f;d=g;fn(f|0,d|0,c[e>>2]<<2)|0;ym(d);d=c[e>>2]|0}c[(c[a>>2]|0)+(d<<2)>>2]=b;c[e>>2]=(c[e>>2]|0)+1;return}function Ue(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0;d=a+40|0;e=c[d>>2]|0;f=a+36|0;a=a+32|0;if((e|0)==(c[f>>2]|0)){g=c[a>>2]|0;c[f>>2]=e<<1;f=xm(e<<3)|0;c[a>>2]=f;e=g;fn(f|0,e|0,c[d>>2]<<2)|0;ym(e);e=c[d>>2]|0}c[(c[a>>2]|0)+(e<<2)>>2]=b;c[d>>2]=(c[d>>2]|0)+1;return}function Ve(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0;e=a+56|0;g=c[e>>2]|0;if((g|0)==(b|0)){return 1}d=a+52|0;f=c[d>>2]|0;h=a+48|0;a=a+44|0;if((f|0)==(c[h>>2]|0)){g=c[a>>2]|0;c[h>>2]=f<<1;f=xm(f<<4)|0;c[a>>2]=f;fn(f|0,g|0,c[d>>2]<<3)|0;ym(g);g=c[e>>2]|0;f=c[d>>2]|0}a=c[a>>2]|0;c[a+(f<<3)>>2]=(g|0)>(b|0)?b:g;e=c[e>>2]|0;c[a+(c[d>>2]<<3)+4>>2]=(e|0)<(b|0)?b:e;c[d>>2]=(c[d>>2]|0)+1;return 1}function We(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var h=0,i=0,j=0,k=0.0,l=0.0,m=0.0,n=0.0,o=0.0,p=0.0,q=0.0,r=0.0,s=0.0;i=a+60|0;c[i>>2]=0;h=b+12|0;k=+g[d+12>>2];o=+g[h>>2];n=+g[d+8>>2];l=+g[b+16>>2];j=e+12|0;q=+g[f+12>>2];s=+g[j>>2];r=+g[f+8>>2];p=+g[e+16>>2];m=+g[f>>2]+(q*s-r*p)-(+g[d>>2]+(k*o-n*l));l=s*r+q*p+ +g[f+4>>2]-(o*n+k*l+ +g[d+4>>2]);k=+g[b+8>>2]+ +g[e+8>>2];if(m*m+l*l>k*k){return}c[a+56>>2]=0;d=h;b=a+48|0;f=c[d+4>>2]|0;c[b>>2]=c[d>>2];c[b+4>>2]=f;g[a+40>>2]=0.0;g[a+44>>2]=0.0;c[i>>2]=1;b=j;f=a;d=c[b+4>>2]|0;c[f>>2]=c[b>>2];c[f+4>>2]=d;c[a+16>>2]=0;return}function Xe(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var h=0,i=0,j=0.0,l=0.0,m=0.0,n=0,o=0.0,p=0,q=0,r=0,s=0.0,t=0.0,u=0.0,v=0.0,w=0.0,x=0.0,y=0.0,z=0;i=a+60|0;c[i>>2]=0;h=e+12|0;x=+g[f+12>>2];l=+g[h>>2];j=+g[f+8>>2];y=+g[e+16>>2];m=+g[f>>2]+(x*l-j*y)- +g[d>>2];y=l*j+x*y+ +g[f+4>>2]- +g[d+4>>2];x=+g[d+12>>2];j=+g[d+8>>2];l=m*x+y*j;j=x*y+m*(-0.0-j);m=+g[b+8>>2]+ +g[e+8>>2];p=c[b+148>>2]|0;do{if((p|0)>0){f=0;o=-3.4028234663852886e+38;e=0;while(1){s=(l- +g[b+20+(f<<3)>>2])*+g[b+84+(f<<3)>>2]+(j- +g[b+20+(f<<3)+4>>2])*+g[b+84+(f<<3)+4>>2];if(s>m){f=19;break}d=s>o;o=d?s:o;e=d?f:e;f=f+1|0;if((f|0)>=(p|0)){f=4;break}}if((f|0)==4){z=o<1.1920928955078125e-7;break}else if((f|0)==19){return}}else{z=1;e=0}}while(0);q=e+1|0;n=b+20+(e<<3)|0;f=c[n>>2]|0;n=c[n+4>>2]|0;s=(c[k>>2]=f,+g[k>>2]);d=n;o=(c[k>>2]=d,+g[k>>2]);p=b+20+(((q|0)<(p|0)?q:0)<<3)|0;r=c[p>>2]|0;p=c[p+4>>2]|0;y=(c[k>>2]=r,+g[k>>2]);q=p;u=(c[k>>2]=q,+g[k>>2]);if(z){c[i>>2]=1;c[a+56>>2]=1;r=b+84+(e<<3)|0;q=a+40|0;z=c[r+4>>2]|0;c[q>>2]=c[r>>2];c[q+4>>2]=z;q=a+48|0;x=+((s+y)*.5);y=+((o+u)*.5);g[q>>2]=x;g[q+4>>2]=y;q=h;z=a;r=c[q+4>>2]|0;c[z>>2]=c[q>>2];c[z+4>>2]=r;c[a+16>>2]=0;return}v=l-s;x=j-o;t=l-y;w=j-u;if(!(v*(y-s)+x*(u-o)>0.0)){if(v*v+x*x>m*m){return}c[i>>2]=1;c[a+56>>2]=1;b=a+40|0;z=b;y=+v;j=+x;g[z>>2]=y;g[z+4>>2]=j;j=+R(v*v+x*x);if(!(j<1.1920928955078125e-7)){y=1.0/j;g[b>>2]=v*y;g[a+44>>2]=x*y}q=a+48|0;c[q>>2]=f|0;c[q+4>>2]=d|n&0;q=h;z=a;r=c[q+4>>2]|0;c[z>>2]=c[q>>2];c[z+4>>2]=r;c[a+16>>2]=0;return}if(t*(s-y)+w*(o-u)>0.0){s=(s+y)*.5;o=(o+u)*.5;f=b+84+(e<<3)|0;if((l-s)*+g[f>>2]+(j-o)*+g[b+84+(e<<3)+4>>2]>m){return}c[i>>2]=1;c[a+56>>2]=1;r=f;q=a+40|0;z=c[r+4>>2]|0;c[q>>2]=c[r>>2];c[q+4>>2]=z;q=a+48|0;x=+s;y=+o;g[q>>2]=x;g[q+4>>2]=y;q=h;z=a;r=c[q+4>>2]|0;c[z>>2]=c[q>>2];c[z+4>>2]=r;c[a+16>>2]=0;return}if(t*t+w*w>m*m){return}c[i>>2]=1;c[a+56>>2]=1;b=a+40|0;z=b;y=+t;j=+w;g[z>>2]=y;g[z+4>>2]=j;j=+R(t*t+w*w);if(!(j<1.1920928955078125e-7)){y=1.0/j;g[b>>2]=t*y;g[a+44>>2]=w*y}z=a+48|0;c[z>>2]=r|0;c[z+4>>2]=q|p&0;q=h;z=a;r=c[q+4>>2]|0;c[z>>2]=c[q>>2];c[z+4>>2]=r;c[a+16>>2]=0;return}function Ye(a){a=a|0;var b=0,d=0,e=0,f=0;c[a>>2]=-1;d=a+12|0;c[d>>2]=16;c[a+8>>2]=0;f=xm(576)|0;b=a+4|0;c[b>>2]=f;en(f|0,0,(c[d>>2]|0)*36|0|0)|0;f=(c[d>>2]|0)-1|0;b=c[b>>2]|0;if((f|0)>0){f=0;while(1){e=f+1|0;c[b+(f*36|0)+20>>2]=e;c[b+(f*36|0)+32>>2]=-1;f=(c[d>>2]|0)-1|0;if((e|0)<(f|0)){f=e}else{break}}}c[b+(f*36|0)+20>>2]=-1;c[b+(((c[d>>2]|0)-1|0)*36|0)+32>>2]=-1;c[a+16>>2]=0;c[a+20>>2]=0;c[a+24>>2]=0;return}function Ze(a){a=a|0;ym(c[a+4>>2]|0);return}function _e(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0;b=a+16|0;d=c[b>>2]|0;f=a+4|0;e=c[f>>2]|0;if((d|0)==-1){d=a+12|0;h=c[d>>2]|0;c[d>>2]=h<<1;h=xm(h*72|0)|0;c[f>>2]=h;g=e;a=a+8|0;fn(h|0,g|0,(c[a>>2]|0)*36|0)|0;ym(g);g=c[a>>2]|0;h=(c[d>>2]|0)-1|0;e=c[f>>2]|0;if((g|0)<(h|0)){while(1){f=g+1|0;c[e+(g*36|0)+20>>2]=f;c[e+(g*36|0)+32>>2]=-1;h=(c[d>>2]|0)-1|0;if((f|0)<(h|0)){g=f}else{break}}}c[e+(h*36|0)+20>>2]=-1;c[e+(((c[d>>2]|0)-1|0)*36|0)+32>>2]=-1;d=c[a>>2]|0;c[b>>2]=d}else{a=a+8|0}h=e+(d*36|0)+20|0;c[b>>2]=c[h>>2];c[h>>2]=-1;c[e+(d*36|0)+24>>2]=-1;c[e+(d*36|0)+28>>2]=-1;c[e+(d*36|0)+32>>2]=0;c[e+(d*36|0)+16>>2]=0;c[a>>2]=(c[a>>2]|0)+1;return d|0}function $e(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,h=0,i=0.0,j=0.0;e=_e(a)|0;f=a+4|0;h=(c[f>>2]|0)+(e*36|0)|0;i=+(+g[b>>2]+-.10000000149011612);j=+(+g[b+4>>2]+-.10000000149011612);g[h>>2]=i;g[h+4>>2]=j;h=(c[f>>2]|0)+(e*36|0)+8|0;j=+(+g[b+8>>2]+.10000000149011612);i=+(+g[b+12>>2]+.10000000149011612);g[h>>2]=j;g[h+4>>2]=i;c[(c[f>>2]|0)+(e*36|0)+16>>2]=d;c[(c[f>>2]|0)+(e*36|0)+32>>2]=0;af(a,e);return e|0}function af(a,b){a=a|0;b=b|0;var d=0,e=0,f=0.0,h=0.0,i=0.0,j=0.0,k=0,l=0,m=0,n=0,o=0.0,p=0.0,q=0.0,r=0.0,s=0.0,t=0.0,u=0.0,v=0.0,w=0.0,x=0.0,y=0.0,z=0;e=a+24|0;c[e>>2]=(c[e>>2]|0)+1;e=a|0;l=c[e>>2]|0;if((l|0)==-1){c[e>>2]=b;c[(c[a+4>>2]|0)+(b*36|0)+20>>2]=-1;return}d=a+4|0;k=c[d>>2]|0;j=+g[k+(b*36|0)>>2];i=+g[k+(b*36|0)+4>>2];h=+g[k+(b*36|0)+8>>2];f=+g[k+(b*36|0)+12>>2];m=c[k+(l*36|0)+24>>2]|0;a:do{if(!((m|0)==-1)){do{n=c[k+(l*36|0)+28>>2]|0;p=+g[k+(l*36|0)+8>>2];r=+g[k+(l*36|0)>>2];s=+g[k+(l*36|0)+12>>2];q=+g[k+(l*36|0)+4>>2];x=((p>h?p:h)-(r<j?r:j)+((s>f?s:f)-(q<i?q:i)))*2.0;o=x*2.0;p=(x-(p-r+(s-q))*2.0)*2.0;x=+g[k+(m*36|0)>>2];v=j<x?j:x;r=+g[k+(m*36|0)+4>>2];s=i<r?i:r;t=+g[k+(m*36|0)+8>>2];u=h>t?h:t;q=+g[k+(m*36|0)+12>>2];w=f>q?f:q;if((c[k+(m*36|0)+24>>2]|0)==-1){q=(u-v+(w-s))*2.0}else{q=(u-v+(w-s))*2.0-(t-x+(q-r))*2.0}q=p+q;s=+g[k+(n*36|0)>>2];t=j<s?j:s;y=+g[k+(n*36|0)+4>>2];x=i<y?i:y;w=+g[k+(n*36|0)+8>>2];v=h>w?h:w;u=+g[k+(n*36|0)+12>>2];r=f>u?f:u;if((c[k+(n*36|0)+24>>2]|0)==-1){r=(v-t+(r-x))*2.0}else{r=(v-t+(r-x))*2.0-(w-s+(u-y))*2.0}p=p+r;if(o<q&o<p){break a}l=q<p?m:n;m=c[k+(l*36|0)+24>>2]|0;}while(!((m|0)==-1))}}while(0);m=c[k+(l*36|0)+20>>2]|0;k=_e(a)|0;n=c[d>>2]|0;c[n+(k*36|0)+20>>2]=m;c[n+(k*36|0)+16>>2]=0;n=c[d>>2]|0;p=+g[n+(l*36|0)>>2];o=+g[n+(l*36|0)+4>>2];z=n+(k*36|0)|0;j=+(j<p?j:p);i=+(i<o?i:o);g[z>>2]=j;g[z+4>>2]=i;j=+g[n+(l*36|0)+8>>2];i=+g[n+(l*36|0)+12>>2];n=n+(k*36|0)+8|0;h=+(h>j?h:j);y=+(f>i?f:i);g[n>>2]=h;g[n+4>>2]=y;n=c[d>>2]|0;c[n+(k*36|0)+32>>2]=(c[n+(l*36|0)+32>>2]|0)+1;if((m|0)==-1){c[n+(k*36|0)+24>>2]=l;c[n+(k*36|0)+28>>2]=b;c[n+(l*36|0)+20>>2]=k;z=n+(b*36|0)+20|0;c[z>>2]=k;c[e>>2]=k;k=c[z>>2]|0}else{e=n+(m*36|0)+24|0;if((c[e>>2]|0)==(l|0)){c[e>>2]=k}else{c[n+(m*36|0)+28>>2]=k}c[n+(k*36|0)+24>>2]=l;c[n+(k*36|0)+28>>2]=b;c[n+(l*36|0)+20>>2]=k;c[n+(b*36|0)+20>>2]=k}if((k|0)==-1){return}do{b=ef(a,k)|0;e=c[d>>2]|0;l=c[e+(b*36|0)+24>>2]|0;k=c[e+(b*36|0)+28>>2]|0;n=c[e+(l*36|0)+32>>2]|0;m=c[e+(k*36|0)+32>>2]|0;c[e+(b*36|0)+32>>2]=((n|0)>(m|0)?n:m)+1;j=+g[e+(l*36|0)>>2];i=+g[e+(k*36|0)>>2];h=+g[e+(l*36|0)+4>>2];f=+g[e+(k*36|0)+4>>2];m=e+(b*36|0)|0;i=+(j<i?j:i);h=+(h<f?h:f);g[m>>2]=i;g[m+4>>2]=h;h=+g[e+(l*36|0)+8>>2];f=+g[e+(k*36|0)+8>>2];i=+g[e+(l*36|0)+12>>2];j=+g[e+(k*36|0)+12>>2];e=e+(b*36|0)+8|0;f=+(h>f?h:f);y=+(i>j?i:j);g[e>>2]=f;g[e+4>>2]=y;k=c[(c[d>>2]|0)+(b*36|0)+20>>2]|0;}while(!((k|0)==-1));return}function bf(a,b){a=a|0;b=b|0;var d=0,e=0;cf(a,b);d=a+16|0;e=c[a+4>>2]|0;c[e+(b*36|0)+20>>2]=c[d>>2];c[e+(b*36|0)+32>>2]=-1;c[d>>2]=b;b=a+8|0;c[b>>2]=(c[b>>2]|0)-1;return}function cf(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,h=0,i=0,j=0,k=0.0,l=0.0,m=0.0,n=0.0,o=0;j=a|0;if((c[j>>2]|0)==(b|0)){c[j>>2]=-1;return}d=a+4|0;i=c[d>>2]|0;f=c[i+(b*36|0)+20>>2]|0;h=i+(f*36|0)+20|0;e=c[h>>2]|0;o=c[i+(f*36|0)+24>>2]|0;if((o|0)==(b|0)){b=c[i+(f*36|0)+28>>2]|0}else{b=o}if((e|0)==-1){c[j>>2]=b;c[i+(b*36|0)+20>>2]=-1;o=a+16|0;c[h>>2]=c[o>>2];c[i+(f*36|0)+32>>2]=-1;c[o>>2]=f;o=a+8|0;c[o>>2]=(c[o>>2]|0)-1;return}j=i+(e*36|0)+24|0;if((c[j>>2]|0)==(f|0)){c[j>>2]=b}else{c[i+(e*36|0)+28>>2]=b}c[i+(b*36|0)+20>>2]=e;o=a+16|0;c[h>>2]=c[o>>2];c[i+(f*36|0)+32>>2]=-1;c[o>>2]=f;o=a+8|0;c[o>>2]=(c[o>>2]|0)-1;do{e=ef(a,e)|0;i=c[d>>2]|0;h=c[i+(e*36|0)+24>>2]|0;f=c[i+(e*36|0)+28>>2]|0;n=+g[i+(h*36|0)>>2];m=+g[i+(f*36|0)>>2];l=+g[i+(h*36|0)+4>>2];k=+g[i+(f*36|0)+4>>2];j=i+(e*36|0)|0;m=+(n<m?n:m);n=+(l<k?l:k);g[j>>2]=m;g[j+4>>2]=n;n=+g[i+(h*36|0)+8>>2];m=+g[i+(f*36|0)+8>>2];l=+g[i+(h*36|0)+12>>2];k=+g[i+(f*36|0)+12>>2];i=i+(e*36|0)+8|0;m=+(n>m?n:m);n=+(l>k?l:k);g[i>>2]=m;g[i+4>>2]=n;i=c[d>>2]|0;h=c[i+(h*36|0)+32>>2]|0;f=c[i+(f*36|0)+32>>2]|0;c[i+(e*36|0)+32>>2]=((h|0)>(f|0)?h:f)+1;e=c[i+(e*36|0)+20>>2]|0;}while(!((e|0)==-1));return}function df(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,h=0.0,i=0.0,j=0.0,k=0.0,l=0.0,m=0.0,n=0;f=a+4|0;n=c[f>>2]|0;do{if(!(+g[n+(b*36|0)>>2]>+g[d>>2])){if(+g[n+(b*36|0)+4>>2]>+g[d+4>>2]){break}if(+g[d+8>>2]>+g[n+(b*36|0)+8>>2]){break}if(+g[d+12>>2]>+g[n+(b*36|0)+12>>2]){break}else{b=0}return b|0}}while(0);cf(a,b);n=d;m=+g[n>>2];h=+g[n+4>>2];n=d+8|0;i=+g[n>>2];m=m+-.10000000149011612;h=h+-.10000000149011612;i=i+.10000000149011612;k=+g[n+4>>2]+.10000000149011612;l=+g[e>>2]*2.0;j=+g[e+4>>2]*2.0;if(l<0.0){m=m+l}else{i=l+i}if(j<0.0){h=h+j}else{k=j+k}n=c[f>>2]|0;d=n+(b*36|0)|0;m=+m;l=+h;g[d>>2]=m;g[d+4>>2]=l;n=n+(b*36|0)+8|0;l=+i;m=+k;g[n>>2]=l;g[n+4>>2]=m;af(a,b);n=1;return n|0}function ef(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0.0,t=0,u=0,v=0.0,w=0.0,x=0.0,y=0.0,z=0;h=c[a+4>>2]|0;n=h+(b*36|0)|0;t=h+(b*36|0)+24|0;i=c[t>>2]|0;if((i|0)==-1){u=b;return u|0}d=h+(b*36|0)+32|0;if((c[d>>2]|0)<2){u=b;return u|0}u=h+(b*36|0)+28|0;j=c[u>>2]|0;l=h+(i*36|0)|0;m=h+(j*36|0)|0;f=h+(j*36|0)+32|0;e=h+(i*36|0)+32|0;k=(c[f>>2]|0)-(c[e>>2]|0)|0;if((k|0)>1){z=h+(j*36|0)+24|0;o=c[z>>2]|0;t=h+(j*36|0)+28|0;p=c[t>>2]|0;q=h+(o*36|0)|0;r=h+(p*36|0)|0;c[z>>2]=b;z=h+(b*36|0)+20|0;k=h+(j*36|0)+20|0;c[k>>2]=c[z>>2];c[z>>2]=j;k=c[k>>2]|0;do{if((k|0)==-1){c[a>>2]=j}else{a=h+(k*36|0)+24|0;if((c[a>>2]|0)==(b|0)){c[a>>2]=j;break}else{c[h+(k*36|0)+28>>2]=j;break}}}while(0);a=h+(o*36|0)+32|0;k=h+(p*36|0)+32|0;if((c[a>>2]|0)>(c[k>>2]|0)){c[t>>2]=o;c[u>>2]=p;c[h+(p*36|0)+20>>2]=b;s=+g[l>>2];v=+g[r>>2];s=s<v?s:v;v=+g[h+(i*36|0)+4>>2];w=+g[h+(p*36|0)+4>>2];x=+s;w=+(v<w?v:w);g[n>>2]=x;g[n+4>>2]=w;w=+g[h+(i*36|0)+8>>2];x=+g[h+(p*36|0)+8>>2];v=+g[h+(i*36|0)+12>>2];y=+g[h+(p*36|0)+12>>2];i=h+(b*36|0)+8|0;w=+(w>x?w:x);x=+(v>y?v:y);g[i>>2]=w;g[i+4>>2]=x;x=+g[q>>2];w=+g[h+(b*36|0)+4>>2];v=+g[h+(o*36|0)+4>>2];s=+(s<x?s:x);v=+(w<v?w:v);g[m>>2]=s;g[m+4>>2]=v;v=+g[h+(b*36|0)+8>>2];w=+g[h+(o*36|0)+8>>2];s=+g[h+(b*36|0)+12>>2];x=+g[h+(o*36|0)+12>>2];h=h+(j*36|0)+8|0;v=+(v>w?v:w);y=+(s>x?s:x);g[h>>2]=v;g[h+4>>2]=y;e=c[e>>2]|0;h=c[k>>2]|0;e=((e|0)>(h|0)?e:h)+1|0;c[d>>2]=e;d=c[a>>2]|0;d=(e|0)>(d|0)?e:d}else{c[t>>2]=p;c[u>>2]=o;c[h+(o*36|0)+20>>2]=b;s=+g[l>>2];v=+g[q>>2];s=s<v?s:v;v=+g[h+(i*36|0)+4>>2];w=+g[h+(o*36|0)+4>>2];x=+s;w=+(v<w?v:w);g[n>>2]=x;g[n+4>>2]=w;w=+g[h+(i*36|0)+8>>2];v=+g[h+(o*36|0)+8>>2];x=+g[h+(i*36|0)+12>>2];y=+g[h+(o*36|0)+12>>2];i=h+(b*36|0)+8|0;v=+(w>v?w:v);x=+(x>y?x:y);g[i>>2]=v;g[i+4>>2]=x;x=+g[r>>2];w=+g[h+(b*36|0)+4>>2];v=+g[h+(p*36|0)+4>>2];s=+(s<x?s:x);w=+(w<v?w:v);g[m>>2]=s;g[m+4>>2]=w;w=+g[h+(b*36|0)+8>>2];v=+g[h+(p*36|0)+8>>2];s=+g[h+(b*36|0)+12>>2];x=+g[h+(p*36|0)+12>>2];h=h+(j*36|0)+8|0;v=+(w>v?w:v);y=+(s>x?s:x);g[h>>2]=v;g[h+4>>2]=y;e=c[e>>2]|0;h=c[a>>2]|0;e=((e|0)>(h|0)?e:h)+1|0;c[d>>2]=e;d=c[k>>2]|0;d=(e|0)>(d|0)?e:d}c[f>>2]=d+1;z=j;return z|0}if(!((k|0)<-1)){z=b;return z|0}z=h+(i*36|0)+24|0;p=c[z>>2]|0;u=h+(i*36|0)+28|0;o=c[u>>2]|0;r=h+(p*36|0)|0;q=h+(o*36|0)|0;c[z>>2]=b;z=h+(b*36|0)+20|0;k=h+(i*36|0)+20|0;c[k>>2]=c[z>>2];c[z>>2]=i;k=c[k>>2]|0;do{if((k|0)==-1){c[a>>2]=i}else{a=h+(k*36|0)+24|0;if((c[a>>2]|0)==(b|0)){c[a>>2]=i;break}else{c[h+(k*36|0)+28>>2]=i;break}}}while(0);a=h+(p*36|0)+32|0;k=h+(o*36|0)+32|0;if((c[a>>2]|0)>(c[k>>2]|0)){c[u>>2]=p;c[t>>2]=o;c[h+(o*36|0)+20>>2]=b;s=+g[m>>2];v=+g[q>>2];s=s<v?s:v;w=+g[h+(j*36|0)+4>>2];v=+g[h+(o*36|0)+4>>2];x=+s;w=+(w<v?w:v);g[n>>2]=x;g[n+4>>2]=w;x=+g[h+(j*36|0)+8>>2];w=+g[h+(o*36|0)+8>>2];v=+g[h+(j*36|0)+12>>2];y=+g[h+(o*36|0)+12>>2];j=h+(b*36|0)+8|0;w=+(x>w?x:w);x=+(v>y?v:y);g[j>>2]=w;g[j+4>>2]=x;x=+g[r>>2];w=+g[h+(b*36|0)+4>>2];v=+g[h+(p*36|0)+4>>2];s=+(s<x?s:x);v=+(w<v?w:v);g[l>>2]=s;g[l+4>>2]=v;v=+g[h+(b*36|0)+8>>2];s=+g[h+(p*36|0)+8>>2];w=+g[h+(b*36|0)+12>>2];x=+g[h+(p*36|0)+12>>2];h=h+(i*36|0)+8|0;s=+(v>s?v:s);y=+(w>x?w:x);g[h>>2]=s;g[h+4>>2]=y;f=c[f>>2]|0;h=c[k>>2]|0;f=((f|0)>(h|0)?f:h)+1|0;c[d>>2]=f;d=c[a>>2]|0;d=(f|0)>(d|0)?f:d}else{c[u>>2]=o;c[t>>2]=p;c[h+(p*36|0)+20>>2]=b;s=+g[m>>2];v=+g[r>>2];s=s<v?s:v;v=+g[h+(j*36|0)+4>>2];w=+g[h+(p*36|0)+4>>2];x=+s;w=+(v<w?v:w);g[n>>2]=x;g[n+4>>2]=w;x=+g[h+(j*36|0)+8>>2];w=+g[h+(p*36|0)+8>>2];v=+g[h+(j*36|0)+12>>2];y=+g[h+(p*36|0)+12>>2];j=h+(b*36|0)+8|0;w=+(x>w?x:w);x=+(v>y?v:y);g[j>>2]=w;g[j+4>>2]=x;x=+g[q>>2];w=+g[h+(b*36|0)+4>>2];v=+g[h+(o*36|0)+4>>2];s=+(s<x?s:x);v=+(w<v?w:v);g[l>>2]=s;g[l+4>>2]=v;v=+g[h+(b*36|0)+8>>2];s=+g[h+(o*36|0)+8>>2];w=+g[h+(b*36|0)+12>>2];x=+g[h+(o*36|0)+12>>2];h=h+(i*36|0)+8|0;s=+(v>s?v:s);y=+(w>x?w:x);g[h>>2]=s;g[h+4>>2]=y;f=c[f>>2]|0;h=c[a>>2]|0;f=((f|0)>(h|0)?f:h)+1|0;c[d>>2]=f;d=c[k>>2]|0;d=(f|0)>(d|0)?f:d}c[e>>2]=d+1;z=i;return z|0}function ff(b,d,e,f,h){b=b|0;d=d|0;e=e|0;f=f|0;h=h|0;var i=0,j=0,l=0,m=0,n=0,o=0.0,p=0,q=0.0,r=0.0,s=0.0,t=0.0,u=0.0,v=0.0,w=0.0,x=0.0,y=0.0,z=0.0,A=0.0,B=0.0,C=0.0;i=b+60|0;c[i>>2]=0;j=f+12|0;r=+g[h+12>>2];z=+g[j>>2];u=+g[h+8>>2];x=+g[f+16>>2];A=+g[h>>2]+(r*z-u*x)- +g[e>>2];x=z*u+r*x+ +g[h+4>>2]- +g[e+4>>2];r=+g[e+12>>2];u=+g[e+8>>2];z=A*r+x*u;u=r*x+A*(-0.0-u);l=d+12|0;h=c[l>>2]|0;l=c[l+4>>2]|0;A=(c[k>>2]=h,+g[k>>2]);e=l;x=(c[k>>2]=e,+g[k>>2]);n=d+20|0;p=c[n>>2]|0;n=c[n+4>>2]|0;r=(c[k>>2]=p,+g[k>>2]);m=n;q=(c[k>>2]=m,+g[k>>2]);o=r-A;w=q-x;B=o*(r-z)+w*(q-u);s=z-A;v=u-x;y=s*o+v*w;t=+g[d+8>>2]+ +g[f+8>>2];if(!(y>0.0)){if(s*s+v*v>t*t){return}do{if((a[d+44|0]|0)!=0){f=d+28|0;B=+g[f>>2];if(!((A-z)*(A-B)+(x-u)*(x- +g[f+4>>2])>0.0)){break}return}}while(0);c[i>>2]=1;c[b+56>>2]=0;g[b+40>>2]=0.0;g[b+44>>2]=0.0;f=b+48|0;c[f>>2]=h|0;c[f+4>>2]=e|l&0;f=b+16|0;c[f>>2]=0;n=f;a[f]=0;a[n+1|0]=0;a[n+2|0]=0;a[n+3|0]=0;n=j;f=b;p=c[n+4>>2]|0;c[f>>2]=c[n>>2];c[f+4>>2]=p;return}if(!(B>0.0)){o=z-r;s=u-q;if(o*o+s*s>t*t){return}do{if((a[d+45|0]|0)!=0){f=d+36|0;B=+g[f>>2];if(!(o*(B-r)+s*(+g[f+4>>2]-q)>0.0)){break}return}}while(0);c[i>>2]=1;c[b+56>>2]=0;g[b+40>>2]=0.0;g[b+44>>2]=0.0;f=b+48|0;c[f>>2]=p|0;c[f+4>>2]=m|n&0;f=b+16|0;c[f>>2]=0;n=f;a[f]=1;a[n+1|0]=0;a[n+2|0]=0;a[n+3|0]=0;n=j;f=b;p=c[n+4>>2]|0;c[f>>2]=c[n>>2];c[f+4>>2]=p;return}C=1.0/(o*o+w*w);A=z-(A*B+r*y)*C;B=u-(x*B+q*y)*C;if(A*A+B*B>t*t){return}q=-0.0-w;if(o*v+s*q<0.0){o=-0.0-o}else{w=q}q=+R(o*o+w*w);if(!(q<1.1920928955078125e-7)){C=1.0/q;w=w*C;o=o*C}c[i>>2]=1;c[b+56>>2]=1;f=b+40|0;B=+w;C=+o;g[f>>2]=B;g[f+4>>2]=C;f=b+48|0;c[f>>2]=h|0;c[f+4>>2]=e|l&0;f=b+16|0;c[f>>2]=0;n=f;a[f]=0;a[n+1|0]=0;a[n+2|0]=1;a[n+3|0]=0;n=j;f=b;p=c[n+4>>2]|0;c[f>>2]=c[n>>2];c[f+4>>2]=p;return}



function Xm(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;do{if(a>>>0<245>>>0){if(a>>>0<11>>>0){a=16}else{a=a+11&-8}f=a>>>3;d=c[2096]|0;e=d>>>(f>>>0);if((e&3|0)!=0){h=(e&1^1)+f|0;b=h<<1;e=8424+(b<<2)|0;b=8424+(b+2<<2)|0;g=c[b>>2]|0;f=g+8|0;a=c[f>>2]|0;do{if((e|0)==(a|0)){c[2096]=d&~(1<<h)}else{if(a>>>0<(c[2100]|0)>>>0){Ca();return 0}d=a+12|0;if((c[d>>2]|0)==(g|0)){c[d>>2]=e;c[b>>2]=a;break}else{Ca();return 0}}}while(0);r=h<<3;c[g+4>>2]=r|3;r=g+(r|4)|0;c[r>>2]=c[r>>2]|1;r=f;return r|0}if(!(a>>>0>(c[2098]|0)>>>0)){break}if((e|0)!=0){i=2<<f;i=e<<f&(i|-i);i=(i&-i)-1|0;b=i>>>12&16;i=i>>>(b>>>0);h=i>>>5&8;i=i>>>(h>>>0);e=i>>>2&4;i=i>>>(e>>>0);g=i>>>1&2;i=i>>>(g>>>0);f=i>>>1&1;f=(h|b|e|g|f)+(i>>>(f>>>0))|0;i=f<<1;g=8424+(i<<2)|0;i=8424+(i+2<<2)|0;e=c[i>>2]|0;b=e+8|0;h=c[b>>2]|0;do{if((g|0)==(h|0)){c[2096]=d&~(1<<f)}else{if(h>>>0<(c[2100]|0)>>>0){Ca();return 0}d=h+12|0;if((c[d>>2]|0)==(e|0)){c[d>>2]=g;c[i>>2]=h;break}else{Ca();return 0}}}while(0);f=f<<3;d=f-a|0;c[e+4>>2]=a|3;r=e;e=r+a|0;c[r+(a|4)>>2]=d|1;c[r+f>>2]=d;f=c[2098]|0;if((f|0)!=0){a=c[2101]|0;g=f>>>3;h=g<<1;f=8424+(h<<2)|0;i=c[2096]|0;g=1<<g;do{if((i&g|0)==0){c[2096]=i|g;g=f;h=8424+(h+2<<2)|0}else{h=8424+(h+2<<2)|0;g=c[h>>2]|0;if(!(g>>>0<(c[2100]|0)>>>0)){break}Ca();return 0}}while(0);c[h>>2]=a;c[g+12>>2]=a;c[a+8>>2]=g;c[a+12>>2]=f}c[2098]=d;c[2101]=e;r=b;return r|0}d=c[2097]|0;if((d|0)==0){break}f=(d&-d)-1|0;q=f>>>12&16;f=f>>>(q>>>0);p=f>>>5&8;f=f>>>(p>>>0);r=f>>>2&4;f=f>>>(r>>>0);d=f>>>1&2;f=f>>>(d>>>0);e=f>>>1&1;e=c[8688+((p|q|r|d|e)+(f>>>(e>>>0))<<2)>>2]|0;f=e;d=e;e=(c[e+4>>2]&-8)-a|0;while(1){h=c[f+16>>2]|0;if((h|0)==0){h=c[f+20>>2]|0;if((h|0)==0){break}}i=(c[h+4>>2]&-8)-a|0;g=i>>>0<e>>>0;f=h;d=g?h:d;e=g?i:e}g=d;i=c[2100]|0;if(g>>>0<i>>>0){Ca();return 0}r=g+a|0;f=r;if(!(g>>>0<r>>>0)){Ca();return 0}h=c[d+24>>2]|0;j=c[d+12>>2]|0;do{if((j|0)==(d|0)){k=d+20|0;j=c[k>>2]|0;if((j|0)==0){k=d+16|0;j=c[k>>2]|0;if((j|0)==0){j=0;break}}while(1){l=j+20|0;m=c[l>>2]|0;if((m|0)!=0){j=m;k=l;continue}m=j+16|0;l=c[m>>2]|0;if((l|0)==0){break}else{j=l;k=m}}if(k>>>0<i>>>0){Ca();return 0}else{c[k>>2]=0;break}}else{k=c[d+8>>2]|0;if(k>>>0<i>>>0){Ca();return 0}l=k+12|0;if((c[l>>2]|0)!=(d|0)){Ca();return 0}i=j+8|0;if((c[i>>2]|0)==(d|0)){c[l>>2]=j;c[i>>2]=k;break}else{Ca();return 0}}}while(0);a:do{if((h|0)!=0){k=c[d+28>>2]|0;i=8688+(k<<2)|0;do{if((d|0)==(c[i>>2]|0)){c[i>>2]=j;if((j|0)!=0){break}c[2097]=c[2097]&~(1<<k);break a}else{if(h>>>0<(c[2100]|0)>>>0){Ca();return 0}i=h+16|0;if((c[i>>2]|0)==(d|0)){c[i>>2]=j}else{c[h+20>>2]=j}if((j|0)==0){break a}}}while(0);if(j>>>0<(c[2100]|0)>>>0){Ca();return 0}c[j+24>>2]=h;h=c[d+16>>2]|0;do{if((h|0)!=0){if(h>>>0<(c[2100]|0)>>>0){Ca();return 0}else{c[j+16>>2]=h;c[h+24>>2]=j;break}}}while(0);h=c[d+20>>2]|0;if((h|0)==0){break}if(h>>>0<(c[2100]|0)>>>0){Ca();return 0}else{c[j+20>>2]=h;c[h+24>>2]=j;break}}}while(0);if(e>>>0<16>>>0){r=e+a|0;c[d+4>>2]=r|3;r=g+(r+4)|0;c[r>>2]=c[r>>2]|1}else{c[d+4>>2]=a|3;c[g+(a|4)>>2]=e|1;c[g+(e+a)>>2]=e;h=c[2098]|0;if((h|0)!=0){g=c[2101]|0;k=h>>>3;i=k<<1;h=8424+(i<<2)|0;j=c[2096]|0;k=1<<k;do{if((j&k|0)==0){c[2096]=j|k;j=h;i=8424+(i+2<<2)|0}else{i=8424+(i+2<<2)|0;j=c[i>>2]|0;if(!(j>>>0<(c[2100]|0)>>>0)){break}Ca();return 0}}while(0);c[i>>2]=g;c[j+12>>2]=g;c[g+8>>2]=j;c[g+12>>2]=h}c[2098]=e;c[2101]=f}d=d+8|0;if((d|0)==0){break}return d|0}else{if(a>>>0>4294967231>>>0){a=-1;break}d=a+11|0;a=d&-8;e=c[2097]|0;if((e|0)==0){break}f=-a|0;d=d>>>8;do{if((d|0)==0){g=0}else{if(a>>>0>16777215>>>0){g=31;break}q=(d+1048320|0)>>>16&8;r=d<<q;p=(r+520192|0)>>>16&4;r=r<<p;g=(r+245760|0)>>>16&2;g=14-(p|q|g)+(r<<g>>>15)|0;g=a>>>((g+7|0)>>>0)&1|g<<1}}while(0);h=c[8688+(g<<2)>>2]|0;b:do{if((h|0)==0){d=0;j=0}else{if((g|0)==31){i=0}else{i=25-(g>>>1)|0}d=0;i=a<<i;j=0;while(1){l=c[h+4>>2]&-8;k=l-a|0;if(k>>>0<f>>>0){if((l|0)==(a|0)){d=h;f=k;j=h;break b}else{d=h;f=k}}k=c[h+20>>2]|0;h=c[h+16+(i>>>31<<2)>>2]|0;j=(k|0)==0|(k|0)==(h|0)?j:k;if((h|0)==0){break}else{i=i<<1}}}}while(0);if((j|0)==0&(d|0)==0){r=2<<g;e=e&(r|-r);if((e|0)==0){break}r=(e&-e)-1|0;o=r>>>12&16;r=r>>>(o>>>0);n=r>>>5&8;r=r>>>(n>>>0);p=r>>>2&4;r=r>>>(p>>>0);q=r>>>1&2;r=r>>>(q>>>0);j=r>>>1&1;j=c[8688+((n|o|p|q|j)+(r>>>(j>>>0))<<2)>>2]|0}if((j|0)!=0){while(1){g=(c[j+4>>2]&-8)-a|0;e=g>>>0<f>>>0;f=e?g:f;d=e?j:d;e=c[j+16>>2]|0;if((e|0)!=0){j=e;continue}j=c[j+20>>2]|0;if((j|0)==0){break}}}if((d|0)==0){break}if(!(f>>>0<((c[2098]|0)-a|0)>>>0)){break}e=d;j=c[2100]|0;if(e>>>0<j>>>0){Ca();return 0}h=e+a|0;g=h;if(!(e>>>0<h>>>0)){Ca();return 0}i=c[d+24>>2]|0;k=c[d+12>>2]|0;do{if((k|0)==(d|0)){l=d+20|0;k=c[l>>2]|0;if((k|0)==0){l=d+16|0;k=c[l>>2]|0;if((k|0)==0){k=0;break}}while(1){m=k+20|0;n=c[m>>2]|0;if((n|0)!=0){k=n;l=m;continue}m=k+16|0;n=c[m>>2]|0;if((n|0)==0){break}else{k=n;l=m}}if(l>>>0<j>>>0){Ca();return 0}else{c[l>>2]=0;break}}else{l=c[d+8>>2]|0;if(l>>>0<j>>>0){Ca();return 0}j=l+12|0;if((c[j>>2]|0)!=(d|0)){Ca();return 0}m=k+8|0;if((c[m>>2]|0)==(d|0)){c[j>>2]=k;c[m>>2]=l;break}else{Ca();return 0}}}while(0);c:do{if((i|0)!=0){l=c[d+28>>2]|0;j=8688+(l<<2)|0;do{if((d|0)==(c[j>>2]|0)){c[j>>2]=k;if((k|0)!=0){break}c[2097]=c[2097]&~(1<<l);break c}else{if(i>>>0<(c[2100]|0)>>>0){Ca();return 0}j=i+16|0;if((c[j>>2]|0)==(d|0)){c[j>>2]=k}else{c[i+20>>2]=k}if((k|0)==0){break c}}}while(0);if(k>>>0<(c[2100]|0)>>>0){Ca();return 0}c[k+24>>2]=i;i=c[d+16>>2]|0;do{if((i|0)!=0){if(i>>>0<(c[2100]|0)>>>0){Ca();return 0}else{c[k+16>>2]=i;c[i+24>>2]=k;break}}}while(0);i=c[d+20>>2]|0;if((i|0)==0){break}if(i>>>0<(c[2100]|0)>>>0){Ca();return 0}else{c[k+20>>2]=i;c[i+24>>2]=k;break}}}while(0);do{if(f>>>0<16>>>0){r=f+a|0;c[d+4>>2]=r|3;r=e+(r+4)|0;c[r>>2]=c[r>>2]|1}else{c[d+4>>2]=a|3;c[e+(a|4)>>2]=f|1;c[e+(f+a)>>2]=f;i=f>>>3;if(f>>>0<256>>>0){h=i<<1;f=8424+(h<<2)|0;j=c[2096]|0;i=1<<i;do{if((j&i|0)==0){c[2096]=j|i;i=f;h=8424+(h+2<<2)|0}else{h=8424+(h+2<<2)|0;i=c[h>>2]|0;if(!(i>>>0<(c[2100]|0)>>>0)){break}Ca();return 0}}while(0);c[h>>2]=g;c[i+12>>2]=g;c[e+(a+8)>>2]=i;c[e+(a+12)>>2]=f;break}g=f>>>8;do{if((g|0)==0){k=0}else{if(f>>>0>16777215>>>0){k=31;break}q=(g+1048320|0)>>>16&8;r=g<<q;p=(r+520192|0)>>>16&4;r=r<<p;k=(r+245760|0)>>>16&2;k=14-(p|q|k)+(r<<k>>>15)|0;k=f>>>((k+7|0)>>>0)&1|k<<1}}while(0);g=8688+(k<<2)|0;c[e+(a+28)>>2]=k;c[e+(a+20)>>2]=0;c[e+(a+16)>>2]=0;j=c[2097]|0;i=1<<k;if((j&i|0)==0){c[2097]=j|i;c[g>>2]=h;c[e+(a+24)>>2]=g;c[e+(a+12)>>2]=h;c[e+(a+8)>>2]=h;break}if((k|0)==31){i=0}else{i=25-(k>>>1)|0}i=f<<i;g=c[g>>2]|0;while(1){if((c[g+4>>2]&-8|0)==(f|0)){break}j=g+16+(i>>>31<<2)|0;k=c[j>>2]|0;if((k|0)==0){b=151;break}else{i=i<<1;g=k}}if((b|0)==151){if(j>>>0<(c[2100]|0)>>>0){Ca();return 0}else{c[j>>2]=h;c[e+(a+24)>>2]=g;c[e+(a+12)>>2]=h;c[e+(a+8)>>2]=h;break}}i=g+8|0;j=c[i>>2]|0;f=c[2100]|0;if(g>>>0<f>>>0){Ca();return 0}if(j>>>0<f>>>0){Ca();return 0}else{c[j+12>>2]=h;c[i>>2]=h;c[e+(a+8)>>2]=j;c[e+(a+12)>>2]=g;c[e+(a+24)>>2]=0;break}}}while(0);d=d+8|0;if((d|0)==0){break}return d|0}}while(0);d=c[2098]|0;if(!(a>>>0>d>>>0)){b=d-a|0;e=c[2101]|0;if(b>>>0>15>>>0){r=e;c[2101]=r+a;c[2098]=b;c[r+(a+4)>>2]=b|1;c[r+d>>2]=b;c[e+4>>2]=a|3}else{c[2098]=0;c[2101]=0;c[e+4>>2]=d|3;r=e+(d+4)|0;c[r>>2]=c[r>>2]|1}r=e+8|0;return r|0}d=c[2099]|0;if(a>>>0<d>>>0){p=d-a|0;c[2099]=p;r=c[2102]|0;q=r;c[2102]=q+a;c[q+(a+4)>>2]=p|1;c[r+4>>2]=a|3;r=r+8|0;return r|0}do{if((c[2072]|0)==0){d=La(30)|0;if((d-1&d|0)==0){c[2074]=d;c[2073]=d;c[2075]=-1;c[2076]=-1;c[2077]=0;c[2207]=0;c[2072]=(Za(0)|0)&-16^1431655768;break}else{Ca();return 0}}}while(0);h=a+48|0;e=c[2074]|0;g=a+47|0;d=e+g|0;e=-e|0;f=d&e;if(!(f>>>0>a>>>0)){r=0;return r|0}i=c[2206]|0;do{if((i|0)!=0){q=c[2204]|0;r=q+f|0;if(r>>>0<=q>>>0|r>>>0>i>>>0){d=0}else{break}return d|0}}while(0);d:do{if((c[2207]&4|0)==0){i=c[2102]|0;e:do{if((i|0)==0){b=181}else{m=8832;while(1){l=m|0;j=c[l>>2]|0;if(!(j>>>0>i>>>0)){k=m+4|0;if((j+(c[k>>2]|0)|0)>>>0>i>>>0){break}}m=c[m+8>>2]|0;if((m|0)==0){b=181;break e}}if((m|0)==0){b=181;break}i=d-(c[2099]|0)&e;if(!(i>>>0<2147483647>>>0)){e=0;break}j=hb(i|0)|0;b=(j|0)==((c[l>>2]|0)+(c[k>>2]|0)|0);d=b?j:-1;e=b?i:0;b=190}}while(0);do{if((b|0)==181){d=hb(0)|0;if((d|0)==-1){e=0;break}i=d;j=c[2073]|0;e=j-1|0;if((e&i|0)==0){i=f}else{i=f-i+(e+i&-j)|0}j=c[2204]|0;e=j+i|0;if(!(i>>>0>a>>>0&i>>>0<2147483647>>>0)){e=0;break}k=c[2206]|0;if((k|0)!=0){if(e>>>0<=j>>>0|e>>>0>k>>>0){e=0;break}}j=hb(i|0)|0;b=(j|0)==(d|0);d=b?d:-1;e=b?i:0;b=190}}while(0);f:do{if((b|0)==190){b=-i|0;if(!((d|0)==-1)){b=201;break d}do{if((j|0)!=-1&i>>>0<2147483647>>>0&i>>>0<h>>>0){d=c[2074]|0;d=g-i+d&-d;if(!(d>>>0<2147483647>>>0)){break}if((hb(d|0)|0)==-1){hb(b|0)|0;break f}else{i=d+i|0;break}}}while(0);if(!((j|0)==-1)){e=i;d=j;b=201;break d}}}while(0);c[2207]=c[2207]|4;b=198}else{e=0;b=198}}while(0);do{if((b|0)==198){if(!(f>>>0<2147483647>>>0)){break}d=hb(f|0)|0;f=hb(0)|0;if(!((f|0)!=-1&(d|0)!=-1&d>>>0<f>>>0)){break}f=f-d|0;g=f>>>0>(a+40|0)>>>0;d=g?d:-1;if(!((d|0)==-1)){e=g?f:e;b=201}}}while(0);do{if((b|0)==201){f=(c[2204]|0)+e|0;c[2204]=f;if(f>>>0>(c[2205]|0)>>>0){c[2205]=f}f=c[2102]|0;g:do{if((f|0)==0){r=c[2100]|0;if((r|0)==0|d>>>0<r>>>0){c[2100]=d}c[2208]=d;c[2209]=e;c[2211]=0;c[2105]=c[2072];c[2104]=-1;b=0;do{r=b<<1;q=8424+(r<<2)|0;c[8424+(r+3<<2)>>2]=q;c[8424+(r+2<<2)>>2]=q;b=b+1|0;}while(b>>>0<32>>>0);b=d+8|0;if((b&7|0)==0){b=0}else{b=-b&7}r=e-40-b|0;c[2102]=d+b;c[2099]=r;c[d+(b+4)>>2]=r|1;c[d+(e-36)>>2]=40;c[2103]=c[2076]}else{g=8832;do{h=c[g>>2]|0;i=g+4|0;j=c[i>>2]|0;if((d|0)==(h+j|0)){b=213;break}g=c[g+8>>2]|0;}while((g|0)!=0);do{if((b|0)==213){if((c[g+12>>2]&8|0)!=0){break}g=f;if(!(g>>>0>=h>>>0&g>>>0<d>>>0)){break}c[i>>2]=j+e;b=(c[2099]|0)+e|0;d=f+8|0;if((d&7|0)==0){d=0}else{d=-d&7}r=b-d|0;c[2102]=g+d;c[2099]=r;c[g+(d+4)>>2]=r|1;c[g+(b+4)>>2]=40;c[2103]=c[2076];break g}}while(0);if(d>>>0<(c[2100]|0)>>>0){c[2100]=d}g=d+e|0;i=8832;do{h=i|0;if((c[h>>2]|0)==(g|0)){b=223;break}i=c[i+8>>2]|0;}while((i|0)!=0);do{if((b|0)==223){if((c[i+12>>2]&8|0)!=0){break}c[h>>2]=d;f=i+4|0;c[f>>2]=(c[f>>2]|0)+e;f=d+8|0;if((f&7|0)==0){f=0}else{f=-f&7}g=d+(e+8)|0;if((g&7|0)==0){k=0}else{k=-g&7}n=d+(k+e)|0;m=n;g=f+a|0;i=d+g|0;h=i;j=n-(d+f)-a|0;c[d+(f+4)>>2]=a|3;do{if((m|0)==(c[2102]|0)){r=(c[2099]|0)+j|0;c[2099]=r;c[2102]=h;c[d+(g+4)>>2]=r|1}else{if((m|0)==(c[2101]|0)){r=(c[2098]|0)+j|0;c[2098]=r;c[2101]=h;c[d+(g+4)>>2]=r|1;c[d+(r+g)>>2]=r;break}l=e+4|0;p=c[d+(l+k)>>2]|0;if((p&3|0)==1){a=p&-8;o=p>>>3;h:do{if(p>>>0<256>>>0){l=c[d+((k|8)+e)>>2]|0;n=c[d+(e+12+k)>>2]|0;p=8424+(o<<1<<2)|0;do{if((l|0)!=(p|0)){if(l>>>0<(c[2100]|0)>>>0){Ca();return 0}if((c[l+12>>2]|0)==(m|0)){break}Ca();return 0}}while(0);if((n|0)==(l|0)){c[2096]=c[2096]&~(1<<o);break}do{if((n|0)==(p|0)){o=n+8|0}else{if(n>>>0<(c[2100]|0)>>>0){Ca();return 0}o=n+8|0;if((c[o>>2]|0)==(m|0)){break}Ca();return 0}}while(0);c[l+12>>2]=n;c[o>>2]=l}else{m=c[d+((k|24)+e)>>2]|0;o=c[d+(e+12+k)>>2]|0;do{if((o|0)==(n|0)){q=k|16;p=d+(l+q)|0;o=c[p>>2]|0;if((o|0)==0){p=d+(q+e)|0;o=c[p>>2]|0;if((o|0)==0){o=0;break}}while(1){q=o+20|0;r=c[q>>2]|0;if((r|0)!=0){o=r;p=q;continue}q=o+16|0;r=c[q>>2]|0;if((r|0)==0){break}else{o=r;p=q}}if(p>>>0<(c[2100]|0)>>>0){Ca();return 0}else{c[p>>2]=0;break}}else{q=c[d+((k|8)+e)>>2]|0;if(q>>>0<(c[2100]|0)>>>0){Ca();return 0}r=q+12|0;if((c[r>>2]|0)!=(n|0)){Ca();return 0}p=o+8|0;if((c[p>>2]|0)==(n|0)){c[r>>2]=o;c[p>>2]=q;break}else{Ca();return 0}}}while(0);if((m|0)==0){break}p=c[d+(e+28+k)>>2]|0;q=8688+(p<<2)|0;do{if((n|0)==(c[q>>2]|0)){c[q>>2]=o;if((o|0)!=0){break}c[2097]=c[2097]&~(1<<p);break h}else{if(m>>>0<(c[2100]|0)>>>0){Ca();return 0}p=m+16|0;if((c[p>>2]|0)==(n|0)){c[p>>2]=o}else{c[m+20>>2]=o}if((o|0)==0){break h}}}while(0);if(o>>>0<(c[2100]|0)>>>0){Ca();return 0}c[o+24>>2]=m;n=k|16;m=c[d+(n+e)>>2]|0;do{if((m|0)!=0){if(m>>>0<(c[2100]|0)>>>0){Ca();return 0}else{c[o+16>>2]=m;c[m+24>>2]=o;break}}}while(0);l=c[d+(l+n)>>2]|0;if((l|0)==0){break}if(l>>>0<(c[2100]|0)>>>0){Ca();return 0}else{c[o+20>>2]=l;c[l+24>>2]=o;break}}}while(0);m=d+((a|k)+e)|0;j=a+j|0}a=m+4|0;c[a>>2]=c[a>>2]&-2;c[d+(g+4)>>2]=j|1;c[d+(j+g)>>2]=j;a=j>>>3;if(j>>>0<256>>>0){e=a<<1;b=8424+(e<<2)|0;i=c[2096]|0;a=1<<a;do{if((i&a|0)==0){c[2096]=i|a;a=b;e=8424+(e+2<<2)|0}else{e=8424+(e+2<<2)|0;a=c[e>>2]|0;if(!(a>>>0<(c[2100]|0)>>>0)){break}Ca();return 0}}while(0);c[e>>2]=h;c[a+12>>2]=h;c[d+(g+8)>>2]=a;c[d+(g+12)>>2]=b;break}a=j>>>8;do{if((a|0)==0){e=0}else{if(j>>>0>16777215>>>0){e=31;break}q=(a+1048320|0)>>>16&8;r=a<<q;p=(r+520192|0)>>>16&4;r=r<<p;e=(r+245760|0)>>>16&2;e=14-(p|q|e)+(r<<e>>>15)|0;e=j>>>((e+7|0)>>>0)&1|e<<1}}while(0);a=8688+(e<<2)|0;c[d+(g+28)>>2]=e;c[d+(g+20)>>2]=0;c[d+(g+16)>>2]=0;h=c[2097]|0;k=1<<e;if((h&k|0)==0){c[2097]=h|k;c[a>>2]=i;c[d+(g+24)>>2]=a;c[d+(g+12)>>2]=i;c[d+(g+8)>>2]=i;break}if((e|0)==31){e=0}else{e=25-(e>>>1)|0}e=j<<e;a=c[a>>2]|0;while(1){if((c[a+4>>2]&-8|0)==(j|0)){break}k=a+16+(e>>>31<<2)|0;h=c[k>>2]|0;if((h|0)==0){b=296;break}else{e=e<<1;a=h}}if((b|0)==296){if(k>>>0<(c[2100]|0)>>>0){Ca();return 0}else{c[k>>2]=i;c[d+(g+24)>>2]=a;c[d+(g+12)>>2]=i;c[d+(g+8)>>2]=i;break}}b=a+8|0;e=c[b>>2]|0;h=c[2100]|0;if(a>>>0<h>>>0){Ca();return 0}if(e>>>0<h>>>0){Ca();return 0}else{c[e+12>>2]=i;c[b>>2]=i;c[d+(g+8)>>2]=e;c[d+(g+12)>>2]=a;c[d+(g+24)>>2]=0;break}}}while(0);r=d+(f|8)|0;return r|0}}while(0);g=f;k=8832;while(1){j=c[k>>2]|0;if(!(j>>>0>g>>>0)){i=c[k+4>>2]|0;h=j+i|0;if(h>>>0>g>>>0){break}}k=c[k+8>>2]|0}k=j+(i-39)|0;if((k&7|0)==0){k=0}else{k=-k&7}i=j+(i-47+k)|0;i=i>>>0<(f+16|0)>>>0?g:i;j=i+8|0;k=d+8|0;if((k&7|0)==0){k=0}else{k=-k&7}r=e-40-k|0;c[2102]=d+k;c[2099]=r;c[d+(k+4)>>2]=r|1;c[d+(e-36)>>2]=40;c[2103]=c[2076];c[i+4>>2]=27;c[j>>2]=c[2208];c[j+4>>2]=c[2209];c[j+8>>2]=c[2210];c[j+12>>2]=c[2211];c[2208]=d;c[2209]=e;c[2211]=0;c[2210]=j;d=i+28|0;c[d>>2]=7;if((i+32|0)>>>0<h>>>0){while(1){e=d+4|0;c[e>>2]=7;if((d+8|0)>>>0<h>>>0){d=e}else{break}}}if((i|0)==(g|0)){break}e=i-f|0;r=g+(e+4)|0;c[r>>2]=c[r>>2]&-2;c[f+4>>2]=e|1;c[g+e>>2]=e;g=e>>>3;if(e>>>0<256>>>0){d=g<<1;b=8424+(d<<2)|0;e=c[2096]|0;g=1<<g;do{if((e&g|0)==0){c[2096]=e|g;e=b;d=8424+(d+2<<2)|0}else{d=8424+(d+2<<2)|0;e=c[d>>2]|0;if(!(e>>>0<(c[2100]|0)>>>0)){break}Ca();return 0}}while(0);c[d>>2]=f;c[e+12>>2]=f;c[f+8>>2]=e;c[f+12>>2]=b;break}d=f;g=e>>>8;do{if((g|0)==0){i=0}else{if(e>>>0>16777215>>>0){i=31;break}q=(g+1048320|0)>>>16&8;r=g<<q;p=(r+520192|0)>>>16&4;r=r<<p;i=(r+245760|0)>>>16&2;i=14-(p|q|i)+(r<<i>>>15)|0;i=e>>>((i+7|0)>>>0)&1|i<<1}}while(0);g=8688+(i<<2)|0;c[f+28>>2]=i;c[f+20>>2]=0;c[f+16>>2]=0;j=c[2097]|0;h=1<<i;if((j&h|0)==0){c[2097]=j|h;c[g>>2]=d;c[f+24>>2]=g;c[f+12>>2]=f;c[f+8>>2]=f;break}if((i|0)==31){h=0}else{h=25-(i>>>1)|0}h=e<<h;g=c[g>>2]|0;while(1){if((c[g+4>>2]&-8|0)==(e|0)){break}j=g+16+(h>>>31<<2)|0;i=c[j>>2]|0;if((i|0)==0){b=331;break}else{h=h<<1;g=i}}if((b|0)==331){if(j>>>0<(c[2100]|0)>>>0){Ca();return 0}else{c[j>>2]=d;c[f+24>>2]=g;c[f+12>>2]=f;c[f+8>>2]=f;break}}h=g+8|0;e=c[h>>2]|0;b=c[2100]|0;if(g>>>0<b>>>0){Ca();return 0}if(e>>>0<b>>>0){Ca();return 0}else{c[e+12>>2]=d;c[h>>2]=d;c[f+8>>2]=e;c[f+12>>2]=g;c[f+24>>2]=0;break}}}while(0);b=c[2099]|0;if(!(b>>>0>a>>>0)){break}p=b-a|0;c[2099]=p;r=c[2102]|0;q=r;c[2102]=q+a;c[q+(a+4)>>2]=p|1;c[r+4>>2]=a|3;r=r+8|0;return r|0}}while(0);c[(jb()|0)>>2]=12;r=0;return r|0}function Ym(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0;if((a|0)==0){return}p=a-8|0;s=p;q=c[2100]|0;if(p>>>0<q>>>0){Ca()}n=c[a-4>>2]|0;m=n&3;if((m|0)==1){Ca()}h=n&-8;k=a+(h-8)|0;j=k;a:do{if((n&1|0)==0){u=c[p>>2]|0;if((m|0)==0){return}p=-8-u|0;s=a+p|0;m=s;n=u+h|0;if(s>>>0<q>>>0){Ca()}if((m|0)==(c[2101]|0)){b=a+(h-4)|0;if((c[b>>2]&3|0)!=3){b=m;l=n;break}c[2098]=n;c[b>>2]=c[b>>2]&-2;c[a+(p+4)>>2]=n|1;c[k>>2]=n;return}t=u>>>3;if(u>>>0<256>>>0){b=c[a+(p+8)>>2]|0;l=c[a+(p+12)>>2]|0;o=8424+(t<<1<<2)|0;do{if((b|0)!=(o|0)){if(b>>>0<q>>>0){Ca()}if((c[b+12>>2]|0)==(m|0)){break}Ca()}}while(0);if((l|0)==(b|0)){c[2096]=c[2096]&~(1<<t);b=m;l=n;break}do{if((l|0)==(o|0)){r=l+8|0}else{if(l>>>0<q>>>0){Ca()}o=l+8|0;if((c[o>>2]|0)==(m|0)){r=o;break}Ca()}}while(0);c[b+12>>2]=l;c[r>>2]=b;b=m;l=n;break}r=c[a+(p+24)>>2]|0;u=c[a+(p+12)>>2]|0;do{if((u|0)==(s|0)){u=a+(p+20)|0;t=c[u>>2]|0;if((t|0)==0){u=a+(p+16)|0;t=c[u>>2]|0;if((t|0)==0){o=0;break}}while(1){w=t+20|0;v=c[w>>2]|0;if((v|0)!=0){t=v;u=w;continue}v=t+16|0;w=c[v>>2]|0;if((w|0)==0){break}else{t=w;u=v}}if(u>>>0<q>>>0){Ca()}else{c[u>>2]=0;o=t;break}}else{t=c[a+(p+8)>>2]|0;if(t>>>0<q>>>0){Ca()}q=t+12|0;if((c[q>>2]|0)!=(s|0)){Ca()}v=u+8|0;if((c[v>>2]|0)==(s|0)){c[q>>2]=u;c[v>>2]=t;o=u;break}else{Ca()}}}while(0);if((r|0)==0){b=m;l=n;break}q=c[a+(p+28)>>2]|0;t=8688+(q<<2)|0;do{if((s|0)==(c[t>>2]|0)){c[t>>2]=o;if((o|0)!=0){break}c[2097]=c[2097]&~(1<<q);b=m;l=n;break a}else{if(r>>>0<(c[2100]|0)>>>0){Ca()}q=r+16|0;if((c[q>>2]|0)==(s|0)){c[q>>2]=o}else{c[r+20>>2]=o}if((o|0)==0){b=m;l=n;break a}}}while(0);if(o>>>0<(c[2100]|0)>>>0){Ca()}c[o+24>>2]=r;q=c[a+(p+16)>>2]|0;do{if((q|0)!=0){if(q>>>0<(c[2100]|0)>>>0){Ca()}else{c[o+16>>2]=q;c[q+24>>2]=o;break}}}while(0);p=c[a+(p+20)>>2]|0;if((p|0)==0){b=m;l=n;break}if(p>>>0<(c[2100]|0)>>>0){Ca()}else{c[o+20>>2]=p;c[p+24>>2]=o;b=m;l=n;break}}else{b=s;l=h}}while(0);m=b;if(!(m>>>0<k>>>0)){Ca()}n=a+(h-4)|0;o=c[n>>2]|0;if((o&1|0)==0){Ca()}do{if((o&2|0)==0){if((j|0)==(c[2102]|0)){w=(c[2099]|0)+l|0;c[2099]=w;c[2102]=b;c[b+4>>2]=w|1;if((b|0)!=(c[2101]|0)){return}c[2101]=0;c[2098]=0;return}if((j|0)==(c[2101]|0)){w=(c[2098]|0)+l|0;c[2098]=w;c[2101]=b;c[b+4>>2]=w|1;c[m+w>>2]=w;return}l=(o&-8)+l|0;n=o>>>3;b:do{if(o>>>0<256>>>0){g=c[a+h>>2]|0;h=c[a+(h|4)>>2]|0;a=8424+(n<<1<<2)|0;do{if((g|0)!=(a|0)){if(g>>>0<(c[2100]|0)>>>0){Ca()}if((c[g+12>>2]|0)==(j|0)){break}Ca()}}while(0);if((h|0)==(g|0)){c[2096]=c[2096]&~(1<<n);break}do{if((h|0)==(a|0)){i=h+8|0}else{if(h>>>0<(c[2100]|0)>>>0){Ca()}a=h+8|0;if((c[a>>2]|0)==(j|0)){i=a;break}Ca()}}while(0);c[g+12>>2]=h;c[i>>2]=g}else{i=c[a+(h+16)>>2]|0;n=c[a+(h|4)>>2]|0;do{if((n|0)==(k|0)){n=a+(h+12)|0;j=c[n>>2]|0;if((j|0)==0){n=a+(h+8)|0;j=c[n>>2]|0;if((j|0)==0){g=0;break}}while(1){p=j+20|0;o=c[p>>2]|0;if((o|0)!=0){j=o;n=p;continue}o=j+16|0;p=c[o>>2]|0;if((p|0)==0){break}else{j=p;n=o}}if(n>>>0<(c[2100]|0)>>>0){Ca()}else{c[n>>2]=0;g=j;break}}else{o=c[a+h>>2]|0;if(o>>>0<(c[2100]|0)>>>0){Ca()}p=o+12|0;if((c[p>>2]|0)!=(k|0)){Ca()}j=n+8|0;if((c[j>>2]|0)==(k|0)){c[p>>2]=n;c[j>>2]=o;g=n;break}else{Ca()}}}while(0);if((i|0)==0){break}n=c[a+(h+20)>>2]|0;j=8688+(n<<2)|0;do{if((k|0)==(c[j>>2]|0)){c[j>>2]=g;if((g|0)!=0){break}c[2097]=c[2097]&~(1<<n);break b}else{if(i>>>0<(c[2100]|0)>>>0){Ca()}j=i+16|0;if((c[j>>2]|0)==(k|0)){c[j>>2]=g}else{c[i+20>>2]=g}if((g|0)==0){break b}}}while(0);if(g>>>0<(c[2100]|0)>>>0){Ca()}c[g+24>>2]=i;i=c[a+(h+8)>>2]|0;do{if((i|0)!=0){if(i>>>0<(c[2100]|0)>>>0){Ca()}else{c[g+16>>2]=i;c[i+24>>2]=g;break}}}while(0);h=c[a+(h+12)>>2]|0;if((h|0)==0){break}if(h>>>0<(c[2100]|0)>>>0){Ca()}else{c[g+20>>2]=h;c[h+24>>2]=g;break}}}while(0);c[b+4>>2]=l|1;c[m+l>>2]=l;if((b|0)!=(c[2101]|0)){break}c[2098]=l;return}else{c[n>>2]=o&-2;c[b+4>>2]=l|1;c[m+l>>2]=l}}while(0);g=l>>>3;if(l>>>0<256>>>0){a=g<<1;d=8424+(a<<2)|0;h=c[2096]|0;g=1<<g;do{if((h&g|0)==0){c[2096]=h|g;f=d;e=8424+(a+2<<2)|0}else{h=8424+(a+2<<2)|0;g=c[h>>2]|0;if(!(g>>>0<(c[2100]|0)>>>0)){f=g;e=h;break}Ca()}}while(0);c[e>>2]=b;c[f+12>>2]=b;c[b+8>>2]=f;c[b+12>>2]=d;return}e=b;f=l>>>8;do{if((f|0)==0){a=0}else{if(l>>>0>16777215>>>0){a=31;break}v=(f+1048320|0)>>>16&8;w=f<<v;u=(w+520192|0)>>>16&4;w=w<<u;a=(w+245760|0)>>>16&2;a=14-(u|v|a)+(w<<a>>>15)|0;a=l>>>((a+7|0)>>>0)&1|a<<1}}while(0);f=8688+(a<<2)|0;c[b+28>>2]=a;c[b+20>>2]=0;c[b+16>>2]=0;h=c[2097]|0;g=1<<a;do{if((h&g|0)==0){c[2097]=h|g;c[f>>2]=e;c[b+24>>2]=f;c[b+12>>2]=b;c[b+8>>2]=b}else{if((a|0)==31){g=0}else{g=25-(a>>>1)|0}g=l<<g;f=c[f>>2]|0;while(1){if((c[f+4>>2]&-8|0)==(l|0)){break}h=f+16+(g>>>31<<2)|0;a=c[h>>2]|0;if((a|0)==0){d=129;break}else{g=g<<1;f=a}}if((d|0)==129){if(h>>>0<(c[2100]|0)>>>0){Ca()}else{c[h>>2]=e;c[b+24>>2]=f;c[b+12>>2]=b;c[b+8>>2]=b;break}}h=f+8|0;g=c[h>>2]|0;d=c[2100]|0;if(f>>>0<d>>>0){Ca()}if(g>>>0<d>>>0){Ca()}else{c[g+12>>2]=e;c[h>>2]=e;c[b+8>>2]=g;c[b+12>>2]=f;c[b+24>>2]=0;break}}}while(0);w=(c[2104]|0)-1|0;c[2104]=w;if((w|0)==0){b=8840}else{return}while(1){b=c[b>>2]|0;if((b|0)==0){break}else{b=b+8|0}}c[2104]=-1;return}function Zm(a){a=a|0;var b=0,d=0;a=(a|0)==0?1:a;while(1){d=Xm(a)|0;if((d|0)!=0){b=10;break}d=(D=c[2432]|0,c[2432]=D+0,D);if((d|0)==0){break}yb[d&3]()}if((b|0)==10){return d|0}d=Ua(4)|0;c[d>>2]=4608;Aa(d|0,7696,84);return 0}function _m(a,b){a=a|0;b=b|0;return Zm(a)|0}function $m(a){a=a|0;if((a|0)==0){return}Ym(a);return}function an(a){a=a|0;$m(a);return}function bn(a){a=a|0;return}function cn(a){a=a|0;return 2392}function dn(b){b=b|0;var c=0;c=b;while(a[c]|0){c=c+1|0}return c-b|0}function en(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0;f=b+e|0;if((e|0)>=20){d=d&255;i=b&3;h=d|d<<8|d<<16|d<<24;g=f&~3;if(i){i=b+4-i|0;while((b|0)<(i|0)){a[b]=d;b=b+1|0}}while((b|0)<(g|0)){c[b>>2]=h;b=b+4|0}}while((b|0)<(f|0)){a[b]=d;b=b+1|0}return b-e|0}function fn(b,d,e){b=b|0;d=d|0;e=e|0;var f=0;if((e|0)>=4096)return db(b|0,d|0,e|0)|0;f=b|0;if((b&3)==(d&3)){while(b&3){if((e|0)==0)return f|0;a[b]=a[d]|0;b=b+1|0;d=d+1|0;e=e-1|0}while((e|0)>=4){c[b>>2]=c[d>>2];b=b+4|0;d=d+4|0;e=e-4|0}}while((e|0)>0){a[b]=a[d]|0;b=b+1|0;d=d+1|0;e=e-1|0}return f|0}function gn(b,c,d){b=b|0;c=c|0;d=d|0;var e=0;if((c|0)<(b|0)&(b|0)<(c+d|0)){e=b;c=c+d|0;b=b+d|0;while((d|0)>0){b=b-1|0;c=c-1|0;d=d-1|0;a[b]=a[c]|0}b=e}else{fn(b,c,d)|0}return b|0}function hn(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;c=a+c>>>0;return(F=b+d+(c>>>0<a>>>0|0)>>>0,c|0)|0}function jn(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;b=b-d-(c>>>0>a>>>0|0)>>>0;return(F=b,a-c>>>0|0)|0}function kn(a,b,c){a=a|0;b=b|0;c=c|0;if((c|0)<32){F=b<<c|(a&(1<<c)-1<<32-c)>>>32-c;return a<<c}F=a<<c-32;return 0}function ln(a,b,c){a=a|0;b=b|0;c=c|0;if((c|0)<32){F=b>>>c;return a>>>c|(b&(1<<c)-1)<<32-c}F=0;return b>>>c-32|0}function mn(a,b,c){a=a|0;b=b|0;c=c|0;if((c|0)<32){F=b>>c;return a>>>c|(b&(1<<c)-1)<<32-c}F=(b|0)<0?-1:0;return b>>c-32|0}function nn(b){b=b|0;var c=0;c=a[n+(b>>>24)|0]|0;if((c|0)<8)return c|0;c=a[n+(b>>16&255)|0]|0;if((c|0)<8)return c+8|0;c=a[n+(b>>8&255)|0]|0;if((c|0)<8)return c+16|0;return(a[n+(b&255)|0]|0)+24|0}function on(b){b=b|0;var c=0;c=a[m+(b&255)|0]|0;if((c|0)<8)return c|0;c=a[m+(b>>8&255)|0]|0;if((c|0)<8)return c+8|0;c=a[m+(b>>16&255)|0]|0;if((c|0)<8)return c+16|0;return(a[m+(b>>>24)|0]|0)+24|0}function pn(a,b){a=a|0;b=b|0;var c=0,d=0,e=0,f=0;f=a&65535;d=b&65535;c=ba(d,f)|0;e=a>>>16;d=(c>>>16)+(ba(d,e)|0)|0;b=b>>>16;a=ba(b,f)|0;return(F=(d>>>16)+(ba(b,e)|0)+(((d&65535)+a|0)>>>16)|0,d+a<<16|c&65535|0)|0}function qn(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0,f=0,g=0,h=0;e=b>>31|((b|0)<0?-1:0)<<1;f=((b|0)<0?-1:0)>>31|((b|0)<0?-1:0)<<1;g=d>>31|((d|0)<0?-1:0)<<1;h=((d|0)<0?-1:0)>>31|((d|0)<0?-1:0)<<1;a=jn(e^a,f^b,e,f)|0;b=F;e=g^e;f=h^f;g=jn((vn(a,b,jn(g^c,h^d,g,h)|0,F,0)|0)^e,F^f,e,f)|0;return(F=F,g)|0}function rn(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0;g=i;i=i+8|0;f=g|0;h=b>>31|((b|0)<0?-1:0)<<1;j=((b|0)<0?-1:0)>>31|((b|0)<0?-1:0)<<1;k=e>>31|((e|0)<0?-1:0)<<1;l=((e|0)<0?-1:0)>>31|((e|0)<0?-1:0)<<1;a=jn(h^a,j^b,h,j)|0;b=F;vn(a,b,jn(k^d,l^e,k,l)|0,F,f)|0;k=jn(c[f>>2]^h,c[f+4>>2]^j,h,j)|0;j=F;i=g;return(F=j,k)|0}function sn(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0,f=0;e=a;f=c;a=pn(e,f)|0;c=F;return(F=(ba(b,f)|0)+(ba(d,e)|0)+c|c&0,a|0|0)|0}function tn(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;a=vn(a,b,c,d,0)|0;return(F=F,a)|0}function un(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0;g=i;i=i+8|0;f=g|0;vn(a,b,d,e,f)|0;i=g;return(F=c[f+4>>2]|0,c[f>>2]|0)|0}function vn(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0;h=a;j=b;i=j;k=d;g=e;l=g;if((i|0)==0){d=(f|0)!=0;if((l|0)==0){if(d){c[f>>2]=(h>>>0)%(k>>>0);c[f+4>>2]=0}l=0;m=(h>>>0)/(k>>>0)>>>0;return(F=l,m)|0}else{if(!d){l=0;m=0;return(F=l,m)|0}c[f>>2]=a|0;c[f+4>>2]=b&0;l=0;m=0;return(F=l,m)|0}}m=(l|0)==0;do{if((k|0)==0){if(m){if((f|0)!=0){c[f>>2]=(i>>>0)%(k>>>0);c[f+4>>2]=0}l=0;m=(i>>>0)/(k>>>0)>>>0;return(F=l,m)|0}if((h|0)==0){if((f|0)!=0){c[f>>2]=0;c[f+4>>2]=(i>>>0)%(l>>>0)}k=0;m=(i>>>0)/(l>>>0)>>>0;return(F=k,m)|0}k=l-1|0;if((k&l|0)==0){if((f|0)!=0){c[f>>2]=a|0;c[f+4>>2]=k&i|b&0}k=0;m=i>>>((on(l|0)|0)>>>0);return(F=k,m)|0}k=(nn(l|0)|0)-(nn(i|0)|0)|0;if(k>>>0<=30){b=k+1|0;m=31-k|0;j=b;a=i<<m|h>>>(b>>>0);b=i>>>(b>>>0);l=0;i=h<<m;break}if((f|0)==0){l=0;m=0;return(F=l,m)|0}c[f>>2]=a|0;c[f+4>>2]=j|b&0;l=0;m=0;return(F=l,m)|0}else{if(!m){k=(nn(l|0)|0)-(nn(i|0)|0)|0;if(k>>>0<=31){l=k+1|0;m=31-k|0;b=k-31>>31;j=l;a=h>>>(l>>>0)&b|i<<m;b=i>>>(l>>>0)&b;l=0;i=h<<m;break}if((f|0)==0){l=0;m=0;return(F=l,m)|0}c[f>>2]=a|0;c[f+4>>2]=j|b&0;l=0;m=0;return(F=l,m)|0}l=k-1|0;if((l&k|0)!=0){m=(nn(k|0)|0)+33-(nn(i|0)|0)|0;p=64-m|0;k=32-m|0;n=k>>31;o=m-32|0;b=o>>31;j=m;a=k-1>>31&i>>>(o>>>0)|(i<<k|h>>>(m>>>0))&b;b=b&i>>>(m>>>0);l=h<<p&n;i=(i<<p|h>>>(o>>>0))&n|h<<k&m-33>>31;break}if((f|0)!=0){c[f>>2]=l&h;c[f+4>>2]=0}if((k|0)==1){o=j|b&0;p=a|0|0;return(F=o,p)|0}else{p=on(k|0)|0;o=i>>>(p>>>0)|0;p=i<<32-p|h>>>(p>>>0)|0;return(F=o,p)|0}}}while(0);if((j|0)==0){m=a;d=0;a=0}else{d=d|0|0;g=g|e&0;e=hn(d,g,-1,-1)|0;h=F;k=b;m=a;a=0;while(1){b=l>>>31|i<<1;l=a|l<<1;i=m<<1|i>>>31|0;k=m>>>31|k<<1|0;jn(e,h,i,k)|0;m=F;p=m>>31|((m|0)<0?-1:0)<<1;a=p&1;m=jn(i,k,p&d,(((m|0)<0?-1:0)>>31|((m|0)<0?-1:0)<<1)&g)|0;k=F;j=j-1|0;if((j|0)==0){break}else{i=b}}i=b;b=k;d=0}g=0;if((f|0)!=0){c[f>>2]=m;c[f+4>>2]=b}o=(l|0)>>>31|(i|g)<<1|(g<<1|l>>>31)&0|d;p=(l<<1|0>>>31)&-2|a;return(F=o,p)|0}function wn(){Va()}function xn(a,b){a=a|0;b=b|0;return rb[a&15](b|0)|0}function yn(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;sb[a&7](b|0,c|0,d|0,e|0,f|0)}function zn(a,b){a=a|0;b=b|0;tb[a&255](b|0)}function An(a,b,c){a=a|0;b=b|0;c=c|0;ub[a&255](b|0,c|0)}function Bn(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;return vb[a&31](b|0,c|0,d|0)|0}function Cn(a,b,c){a=a|0;b=b|0;c=+c;return+wb[a&31](b|0,+c)}function Dn(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;xb[a&31](b|0,c|0,d|0)}function En(a){a=a|0;yb[a&3]()}function Fn(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;return zb[a&15](b|0,c|0,d|0,e|0)|0}function Gn(a,b,c,d){a=a|0;b=b|0;c=c|0;d=+d;Ab[a&63](b|0,c|0,+d)}function Hn(a,b,c,d,e,f,g){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;Bb[a&31](b|0,c|0,d|0,e|0,f|0,g|0)}function In(a,b,c){a=a|0;b=b|0;c=c|0;return Cb[a&63](b|0,c|0)|0}function Jn(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;return Db[a&31](b|0,c|0,d|0,e|0,f|0)|0}function Kn(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;Eb[a&63](b|0,c|0,d|0,e|0)}function Ln(a){a=a|0;ca(0);return 0}function Mn(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;ca(1)}function Nn(a){a=a|0;ca(2)}function On(a,b){a=a|0;b=b|0;ca(3)}function Pn(a,b,c){a=a|0;b=b|0;c=c|0;ca(4);return 0}function Qn(a,b){a=a|0;b=+b;ca(5);return 0.0}function Rn(a,b,c){a=a|0;b=b|0;c=c|0;ca(6)}function Sn(){ca(7)}function Tn(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;ca(8);return 0}function Un(a,b,c){a=a|0;b=b|0;c=+c;ca(9)}function Vn(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;ca(10)}function Wn(a,b){a=a|0;b=b|0;ca(11);return 0}function Xn(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;ca(12);return 0}function Yn(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;ca(13)}




// EMSCRIPTEN_END_FUNCS
var rb=[Ln,Ln,cn,Ln,qe,Ln,ye,Ln,dm,Ln,Ie,Ln,je,Ln,Ln,Ln];var sb=[Mn,Mn,Tm,Mn,Um,Mn,Mn,Mn];var tb=[Nn,Nn,Il,Nn,di,Nn,Pl,Nn,Hi,Nn,Ol,Nn,_i,Nn,ih,Nn,mk,Nn,Md,Nn,Mi,Nn,ck,Nn,Bh,Nn,Hg,Nn,vg,Nn,Gi,Nn,uh,Nn,Sh,Nn,Km,Nn,_d,Nn,jg,Nn,Ze,Nn,Bi,Nn,vj,Nn,kh,Nn,lm,Nn,If,Nn,Nm,Nn,Ec,Nn,Mm,Nn,ei,Nn,ij,Nn,Zi,Nn,Rh,Nn,ri,Nn,cj,Nn,ug,Nn,cc,Nn,Rj,Nn,am,Nn,Zl,Nn,mj,Nn,bn,Nn,Jj,Nn,vh,Nn,Fg,Nn,Fc,Nn,El,Nn,Ci,Nn,sm,Nn,hg,Nn,zh,Nn,hj,Nn,Qe,Nn,Zf,Nn,vf,Nn,vi,Nn,Hl,Nn,Sl,Nn,Pe,Nn,nj,Nn,qi,Nn,oi,Nn,dj,Nn,Rl,Nn,tg,Nn,Li,Nn,Zd,Nn,qf,Nn,pk,Nn,Tg,Nn,Fe,Nn,Oi,Nn,Wl,Nn,Sj,Nn,Em,Nn,Jf,Nn,$d,Nn,wi,Nn,oj,Nn,bm,Nn,km,Nn,an,Nn,uf,Nn,Ee,Nn,Qd,Nn,ig,Nn,Sg,Nn,Yf,Nn,ci,Nn,ik,Nn,Ek,Nn,Gg,Nn,Fl,Nn,Lm,Nn,Yl,Nn,Th,Nn,th,Nn,Kf,Nn,ac,Nn,Ye,Nn,Ah,Nn,Wf,Nn,Rg,Nn,Om,Nn,jh,Nn,Zb,Nn,Fm,Nn,Nn,Nn,Nn,Nn,Nn,Nn,Nn,Nn,Nn,Nn,Nn,Nn,Nn,Nn,Nn,Nn,Nn,Nn,Nn,Nn,Nn,Nn,Nn,Nn,Nn,Nn,Nn,Nn,Nn,Nn,Nn,Nn,Nn,Nn,Nn,Nn,Nn,Nn,Nn,Nn];var ub=[On,On,Ig,On,Df,On,yg,On,Hf,On,ng,On,Wg,On,Hh,On,eg,On,Nf,On,Bf,On,Xg,On,li,On,Ih,On,Ng,On,dk,On,Ei,On,bg,On,Ji,On,nh,On,aj,On,pi,On,Kg,On,ek,On,wm,On,$f,On,Vh,On,kj,On,Xh,On,Af,On,Qf,On,lh,On,hi,On,Rd,On,Fh,On,Zg,On,Mg,On,ag,On,ti,On,qh,On,Dh,On,Vg,On,Wh,On,ph,On,ii,On,ki,On,Rf,On,Xf,On,Mf,On,yf,On,Xi,On,qg,On,Cg,On,gi,On,pg,On,_g,On,uj,On,Bg,On,lg,On,Ni,On,zg,On,fj,On,Sd,On,Ef,On,Eh,On,dg,On,mg,On,_h,On,Zh,On,mh,On,Jg,On,Of,On,xg,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On];var vb=[Pn,Pn,Ul,Pn,Pm,Pn,Od,Pn,se,Pn,ke,Pn,_l,Pn,tf,Pn,em,Pn,Le,Pn,ze,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn,Pn];var wb=[Qn,Qn,Kh,Qn,ai,Qn,Gf,Qn,Tf,Qn,sg,Qn,gg,Qn,Pg,Qn,ah,Qn,sh,Qn,Eg,Qn,ni,Qn,Qn,Qn,Qn,Qn,Qn,Qn,Qn,Qn];var xb=[Rn,Rn,Vd,Rn,Xd,Rn,Yd,Rn,gk,Rn,ok,Rn,Td,Rn,Ij,Rn,fk,Rn,hk,Rn,Rn,Rn,Rn,Rn,Rn,Rn,Rn,Rn,Rn,Rn,Rn,Rn];var yb=[Sn,Sn,wn,Sn];var zb=[Tn,Tn,$l,Tn,Vl,Tn,xf,Tn,wf,Tn,Tn,Tn,Tn,Tn,Tn,Tn];var Ab=[Un,Un,Oe,Un,Jh,Un,we,Un,Ff,Un,$h,Un,Sf,Un,Dg,Un,fg,Un,im,Un,De,Un,mi,Un,$g,Un,Og,Un,rg,Un,rh,Un,oe,Un,Un,Un,Un,Un,Un,Un,Un,Un,Un,Un,Un,Un,Un,Un,Un,Un,Un,Un,Un,Un,Un,Un,Un,Un,Un,Un,Un,Un,Un,Un];var Bb=[Vn,Vn,Wm,Vn,le,Vn,fm,Vn,Vm,Vn,Ae,Vn,te,Vn,pf,Vn,Ke,Vn,Vn,Vn,Vn,Vn,Vn,Vn,Vn,Vn,Vn,Vn,Vn,Vn,Vn,Vn];var Cb=[Wn,Wn,og,Wn,ji,Wn,vm,Wn,Tl,Wn,pe,Wn,Jl,Wn,Fk,Wn,cm,Wn,xe,Wn,Pd,Wn,Nd,Wn,Lk,Wn,Gk,Wn,Gh,Wn,Zj,Wn,Cf,Wn,Gl,Wn,Kl,Wn,Yg,Wn,oh,Wn,cg,Wn,Nk,Wn,Xl,Wn,Yh,Wn,ie,Wn,Pf,Wn,He,Wn,Ag,Wn,Lg,Wn,Wn,Wn,Wn,Wn];var Db=[Xn,Xn,jj,Xn,si,Xn,ue,Xn,Wi,Xn,Ii,Xn,gm,Xn,Di,Xn,Me,Xn,$i,Xn,me,Xn,Be,Xn,ej,Xn,Xn,Xn,Xn,Xn,Xn,Xn];var Eb=[Yn,Yn,ve,Yn,ui,Yn,hm,Yn,Ki,Yn,Qm,Yn,lj,Yn,Fi,Yn,Rm,Yn,Ne,Yn,ne,Yn,Ud,Yn,gj,Yn,Ce,Yn,Ql,Yn,Yi,Yn,Wd,Yn,bj,Yn,Yn,Yn,Yn,Yn,Yn,Yn,Yn,Yn,Yn,Yn,Yn,Yn,Yn,Yn,Yn,Yn,Yn,Yn,Yn,Yn,Yn,Yn,Yn,Yn,Yn,Yn,Yn,Yn];return{_b2PrismaticJoint_IsMotorEnabled:kd,_b2Body_GetWorldVector:xc,_strlen:dn,_b2Body_GetLocalVector:qc,_b2PrismaticJoint_GetMotorSpeed:hd,_b2RopeJointDef_Create:yd,_b2World_CreateParticleSystem:Ic,_b2ParticleSystem_SetRadius:Ld,_b2FrictionJointDef_Create:Uc,_b2MotorJointDef_InitializeAndCreate:bd,_b2GearJoint_GetRatio:Wc,_b2Body_GetLocalPoint:pc,_memcpy:fn,_b2RevoluteJoint_EnableLimit:qd,_b2Body_GetWorldPoint:wc,_b2Body_GetWorldCenter:vc,_b2PolygonShape_CreateFixture_3:bc,_b2PolygonShape_CreateFixture_6:fc,_b2PolygonShape_CreateFixture_4:dc,_b2PolygonShape_CreateFixture_5:ec,_b2Body_SetAwake:yc,_b2PrismaticJoint_EnableLimit:ed,_b2Fixture_TestPoint:Dc,_b2MotorJoint_SetLinearOffset:$c,_free:Ym,_b2ParticleSystem_CreateParticle:Fd,_b2World_Create:Gc,_b2Body_SetAngularVelocity:zc,_b2Body_SetLinearVelocity:Ac,_b2CircleShape_CreateParticleGroup:_b,_b2WeldJointDef_Create:zd,_b2Body_GetAngularVelocity:mc,_b2World_SetGravity:Pc,_b2DistanceJointDef_InitializeAndCreate:Tc,_b2Body_ApplyForce:ic,_b2RevoluteJoint_SetMotorSpeed:xd,_b2Body_GetPosition:sc,_b2World_CreateBody:Hc,_b2Body_GetLinearVelocity:oc,_b2Body_GetAngle:lc,_b2ParticleSystem_GetColorBuffer:Gd,_b2DistanceJointDef_Create:Sc,_b2ParticleSystem_GetPositionBuffer:Id,_b2World_QueryAABB:Nc,_b2RevoluteJointDef_InitializeAndCreate:wd,_b2GearJointDef_Create:Xc,_b2PrismaticJoint_IsLimitEnabled:jd,_b2WheelJoint_SetSpringFrequencyHz:Cd,_b2Body_ApplyTorque:jc,_b2PrismaticJointDef_InitializeAndCreate:nd,_b2MotorJointDef_Create:ad,_b2World_DestroyBody:Kc,_b2RevoluteJointDef_Create:vd,_b2PrismaticJoint_EnableMotor:fd,_b2PolygonShape_CreateParticleGroup_4:gc,_memset:en,_b2ParticleSystem_SetDamping:Jd,_b2Body_DestroyFixture:kc,_b2WheelJoint_SetMotorSpeed:Bd,_b2EdgeShape_CreateFixture:$b,_b2World_SetContactListener:Oc,_b2Body_SetType:Cc,_b2Body_SetTransform:Bc,_b2CircleShape_CreateFixture:Yb,_b2RevoluteJoint_GetJointAngle:sd,_malloc:Xm,_b2Contact_GetManifold:Rc,_b2RevoluteJoint_IsMotorEnabled:ud,_b2RevoluteJoint_IsLimitEnabled:td,_b2World_DestroyParticleSystem:Mc,_b2RevoluteJoint_EnableMotor:rd,_b2Body_GetTransform:tc,_b2WeldJointDef_InitializeAndCreate:Ad,_b2FrictionJointDef_InitializeAndCreate:Vc,_b2Body_GetType:uc,_b2Manifold_GetPointCount:Wb,_b2ParticleSystem_SetDensity:Kd,_b2PrismaticJoint_GetMotorForce:id,_b2Joint_GetBodyA:Yc,_b2PulleyJointDef_InitializeAndCreate:pd,_b2Joint_GetBodyB:Zc,_b2ParticleSystem_GetParticleCount:Hd,_b2MouseJoint_SetTarget:cd,_b2Body_ApplyAngularImpulse:hc,_b2ChainShape_CreateFixture:Xb,_b2World_DestroyJoint:Lc,_b2MotorJoint_SetAngularOffset:_c,_b2World_Delete:Jc,_b2PrismaticJoint_GetJointTranslation:gd,_b2Body_GetMass:rc,_b2MouseJointDef_Create:dd,_b2WheelJointDef_InitializeAndCreate:Ed,_b2World_Step:Qc,_b2PrismaticJointDef_Create:md,_b2WheelJointDef_Create:Dd,_b2PulleyJointDef_Create:od,_b2Body_GetInertia:nc,_memmove:gn,_b2PrismaticJoint_SetMotorSpeed:ld,runPostSets:Vb,stackAlloc:Fb,stackSave:Gb,stackRestore:Hb,setThrew:Ib,setTempRet0:Lb,setTempRet1:Mb,setTempRet2:Nb,setTempRet3:Ob,setTempRet4:Pb,setTempRet5:Qb,setTempRet6:Rb,setTempRet7:Sb,setTempRet8:Tb,setTempRet9:Ub,dynCall_ii:xn,dynCall_viiiii:yn,dynCall_vi:zn,dynCall_vii:An,dynCall_iiii:Bn,dynCall_fif:Cn,dynCall_viii:Dn,dynCall_v:En,dynCall_iiiii:Fn,dynCall_viif:Gn,dynCall_viiiiii:Hn,dynCall_iii:In,dynCall_iiiiii:Jn,dynCall_viiii:Kn}})


// EMSCRIPTEN_END_ASM
({ "Math": Math, "Int8Array": Int8Array, "Int16Array": Int16Array, "Int32Array": Int32Array, "Uint8Array": Uint8Array, "Uint16Array": Uint16Array, "Uint32Array": Uint32Array, "Float32Array": Float32Array, "Float64Array": Float64Array }, { "abort": abort, "assert": assert, "asmPrintInt": asmPrintInt, "asmPrintFloat": asmPrintFloat, "min": Math_min, "invoke_ii": invoke_ii, "invoke_viiiii": invoke_viiiii, "invoke_vi": invoke_vi, "invoke_vii": invoke_vii, "invoke_iiii": invoke_iiii, "invoke_fif": invoke_fif, "invoke_viii": invoke_viii, "invoke_v": invoke_v, "invoke_iiiii": invoke_iiiii, "invoke_viif": invoke_viif, "invoke_viiiiii": invoke_viiiiii, "invoke_iii": invoke_iii, "invoke_iiiiii": invoke_iiiiii, "invoke_viiii": invoke_viiii, "_llvm_lifetime_end": _llvm_lifetime_end, "_cosf": _cosf, "___cxa_call_unexpected": ___cxa_call_unexpected, "_floorf": _floorf, "___cxa_free_exception": ___cxa_free_exception, "___cxa_throw": ___cxa_throw, "_sinf": _sinf, "_abort": _abort, "_fprintf": _fprintf, "___cxa_end_catch": ___cxa_end_catch, "_b2WorldBeginContactBody": _b2WorldBeginContactBody, "_printf": _printf, "_fflush": _fflush, "__reallyNegative": __reallyNegative, "_sqrtf": _sqrtf, "_fputc": _fputc, "_sysconf": _sysconf, "_puts": _puts, "___setErrNo": ___setErrNo, "_fwrite": _fwrite, "_send": _send, "_write": _write, "_fputs": _fputs, "_exit": _exit, "___cxa_find_matching_catch": ___cxa_find_matching_catch, "___cxa_allocate_exception": ___cxa_allocate_exception, "___cxa_pure_virtual": ___cxa_pure_virtual, "_b2WorldEndContactBody": _b2WorldEndContactBody, "_fileno": _fileno, "__formatString": __formatString, "_time": _time, "___cxa_is_number_type": ___cxa_is_number_type, "___cxa_does_inherit": ___cxa_does_inherit, "__ZSt9terminatev": __ZSt9terminatev, "_b2WorldPreSolve": _b2WorldPreSolve, "___cxa_begin_catch": ___cxa_begin_catch, "_emscripten_memcpy_big": _emscripten_memcpy_big, "__ZSt18uncaught_exceptionv": __ZSt18uncaught_exceptionv, "_b2WorldQueryAABB": _b2WorldQueryAABB, "_pwrite": _pwrite, "_sbrk": _sbrk, "__ZNSt9exceptionD2Ev": __ZNSt9exceptionD2Ev, "___errno_location": ___errno_location, "___gxx_personality_v0": ___gxx_personality_v0, "_b2WorldPostSolve": _b2WorldPostSolve, "_llvm_lifetime_start": _llvm_lifetime_start, "_mkport": _mkport, "___resumeException": ___resumeException, "__exit": __exit, "STACKTOP": STACKTOP, "STACK_MAX": STACK_MAX, "tempDoublePtr": tempDoublePtr, "ABORT": ABORT, "cttz_i8": cttz_i8, "ctlz_i8": ctlz_i8, "NaN": NaN, "Infinity": Infinity, "__ZTVN10__cxxabiv120__si_class_type_infoE": __ZTVN10__cxxabiv120__si_class_type_infoE, "__ZTVN10__cxxabiv117__class_type_infoE": __ZTVN10__cxxabiv117__class_type_infoE }, buffer);
var _b2PrismaticJoint_IsMotorEnabled = Module["_b2PrismaticJoint_IsMotorEnabled"] = asm["_b2PrismaticJoint_IsMotorEnabled"];
var _b2Body_GetWorldVector = Module["_b2Body_GetWorldVector"] = asm["_b2Body_GetWorldVector"];
var _strlen = Module["_strlen"] = asm["_strlen"];
var _b2Body_GetLocalVector = Module["_b2Body_GetLocalVector"] = asm["_b2Body_GetLocalVector"];
var _b2PrismaticJoint_GetMotorSpeed = Module["_b2PrismaticJoint_GetMotorSpeed"] = asm["_b2PrismaticJoint_GetMotorSpeed"];
var _b2RopeJointDef_Create = Module["_b2RopeJointDef_Create"] = asm["_b2RopeJointDef_Create"];
var _b2World_CreateParticleSystem = Module["_b2World_CreateParticleSystem"] = asm["_b2World_CreateParticleSystem"];
var _b2ParticleSystem_SetRadius = Module["_b2ParticleSystem_SetRadius"] = asm["_b2ParticleSystem_SetRadius"];
var _b2FrictionJointDef_Create = Module["_b2FrictionJointDef_Create"] = asm["_b2FrictionJointDef_Create"];
var _b2MotorJointDef_InitializeAndCreate = Module["_b2MotorJointDef_InitializeAndCreate"] = asm["_b2MotorJointDef_InitializeAndCreate"];
var _b2GearJoint_GetRatio = Module["_b2GearJoint_GetRatio"] = asm["_b2GearJoint_GetRatio"];
var _b2Body_GetLocalPoint = Module["_b2Body_GetLocalPoint"] = asm["_b2Body_GetLocalPoint"];
var _memcpy = Module["_memcpy"] = asm["_memcpy"];
var _b2RevoluteJoint_EnableLimit = Module["_b2RevoluteJoint_EnableLimit"] = asm["_b2RevoluteJoint_EnableLimit"];
var _b2Body_GetWorldPoint = Module["_b2Body_GetWorldPoint"] = asm["_b2Body_GetWorldPoint"];
var _b2Body_GetWorldCenter = Module["_b2Body_GetWorldCenter"] = asm["_b2Body_GetWorldCenter"];
var _b2PolygonShape_CreateFixture_3 = Module["_b2PolygonShape_CreateFixture_3"] = asm["_b2PolygonShape_CreateFixture_3"];
var _b2PolygonShape_CreateFixture_6 = Module["_b2PolygonShape_CreateFixture_6"] = asm["_b2PolygonShape_CreateFixture_6"];
var _b2PolygonShape_CreateFixture_4 = Module["_b2PolygonShape_CreateFixture_4"] = asm["_b2PolygonShape_CreateFixture_4"];
var _b2PolygonShape_CreateFixture_5 = Module["_b2PolygonShape_CreateFixture_5"] = asm["_b2PolygonShape_CreateFixture_5"];
var _b2Body_SetAwake = Module["_b2Body_SetAwake"] = asm["_b2Body_SetAwake"];
var _b2PrismaticJoint_EnableLimit = Module["_b2PrismaticJoint_EnableLimit"] = asm["_b2PrismaticJoint_EnableLimit"];
var _b2Fixture_TestPoint = Module["_b2Fixture_TestPoint"] = asm["_b2Fixture_TestPoint"];
var _b2MotorJoint_SetLinearOffset = Module["_b2MotorJoint_SetLinearOffset"] = asm["_b2MotorJoint_SetLinearOffset"];
var _free = Module["_free"] = asm["_free"];
var _b2ParticleSystem_CreateParticle = Module["_b2ParticleSystem_CreateParticle"] = asm["_b2ParticleSystem_CreateParticle"];
var _b2World_Create = Module["_b2World_Create"] = asm["_b2World_Create"];
var _b2Body_SetAngularVelocity = Module["_b2Body_SetAngularVelocity"] = asm["_b2Body_SetAngularVelocity"];
var _b2Body_SetLinearVelocity = Module["_b2Body_SetLinearVelocity"] = asm["_b2Body_SetLinearVelocity"];
var _b2CircleShape_CreateParticleGroup = Module["_b2CircleShape_CreateParticleGroup"] = asm["_b2CircleShape_CreateParticleGroup"];
var _b2WeldJointDef_Create = Module["_b2WeldJointDef_Create"] = asm["_b2WeldJointDef_Create"];
var _b2Body_GetAngularVelocity = Module["_b2Body_GetAngularVelocity"] = asm["_b2Body_GetAngularVelocity"];
var _b2World_SetGravity = Module["_b2World_SetGravity"] = asm["_b2World_SetGravity"];
var _b2DistanceJointDef_InitializeAndCreate = Module["_b2DistanceJointDef_InitializeAndCreate"] = asm["_b2DistanceJointDef_InitializeAndCreate"];
var _b2Body_ApplyForce = Module["_b2Body_ApplyForce"] = asm["_b2Body_ApplyForce"];
var _b2RevoluteJoint_SetMotorSpeed = Module["_b2RevoluteJoint_SetMotorSpeed"] = asm["_b2RevoluteJoint_SetMotorSpeed"];
var _b2Body_GetPosition = Module["_b2Body_GetPosition"] = asm["_b2Body_GetPosition"];
var _b2World_CreateBody = Module["_b2World_CreateBody"] = asm["_b2World_CreateBody"];
var _b2Body_GetLinearVelocity = Module["_b2Body_GetLinearVelocity"] = asm["_b2Body_GetLinearVelocity"];
var _b2Body_GetAngle = Module["_b2Body_GetAngle"] = asm["_b2Body_GetAngle"];
var _b2ParticleSystem_GetColorBuffer = Module["_b2ParticleSystem_GetColorBuffer"] = asm["_b2ParticleSystem_GetColorBuffer"];
var _b2DistanceJointDef_Create = Module["_b2DistanceJointDef_Create"] = asm["_b2DistanceJointDef_Create"];
var _b2ParticleSystem_GetPositionBuffer = Module["_b2ParticleSystem_GetPositionBuffer"] = asm["_b2ParticleSystem_GetPositionBuffer"];
var _b2World_QueryAABB = Module["_b2World_QueryAABB"] = asm["_b2World_QueryAABB"];
var _b2RevoluteJointDef_InitializeAndCreate = Module["_b2RevoluteJointDef_InitializeAndCreate"] = asm["_b2RevoluteJointDef_InitializeAndCreate"];
var _b2GearJointDef_Create = Module["_b2GearJointDef_Create"] = asm["_b2GearJointDef_Create"];
var _b2PrismaticJoint_IsLimitEnabled = Module["_b2PrismaticJoint_IsLimitEnabled"] = asm["_b2PrismaticJoint_IsLimitEnabled"];
var _b2WheelJoint_SetSpringFrequencyHz = Module["_b2WheelJoint_SetSpringFrequencyHz"] = asm["_b2WheelJoint_SetSpringFrequencyHz"];
var _b2Body_ApplyTorque = Module["_b2Body_ApplyTorque"] = asm["_b2Body_ApplyTorque"];
var _b2PrismaticJointDef_InitializeAndCreate = Module["_b2PrismaticJointDef_InitializeAndCreate"] = asm["_b2PrismaticJointDef_InitializeAndCreate"];
var _b2MotorJointDef_Create = Module["_b2MotorJointDef_Create"] = asm["_b2MotorJointDef_Create"];
var _b2World_DestroyBody = Module["_b2World_DestroyBody"] = asm["_b2World_DestroyBody"];
var _b2RevoluteJointDef_Create = Module["_b2RevoluteJointDef_Create"] = asm["_b2RevoluteJointDef_Create"];
var _b2PrismaticJoint_EnableMotor = Module["_b2PrismaticJoint_EnableMotor"] = asm["_b2PrismaticJoint_EnableMotor"];
var _b2PolygonShape_CreateParticleGroup_4 = Module["_b2PolygonShape_CreateParticleGroup_4"] = asm["_b2PolygonShape_CreateParticleGroup_4"];
var _memset = Module["_memset"] = asm["_memset"];
var _b2ParticleSystem_SetDamping = Module["_b2ParticleSystem_SetDamping"] = asm["_b2ParticleSystem_SetDamping"];
var _b2Body_DestroyFixture = Module["_b2Body_DestroyFixture"] = asm["_b2Body_DestroyFixture"];
var _b2WheelJoint_SetMotorSpeed = Module["_b2WheelJoint_SetMotorSpeed"] = asm["_b2WheelJoint_SetMotorSpeed"];
var _b2EdgeShape_CreateFixture = Module["_b2EdgeShape_CreateFixture"] = asm["_b2EdgeShape_CreateFixture"];
var _b2World_SetContactListener = Module["_b2World_SetContactListener"] = asm["_b2World_SetContactListener"];
var _b2Body_SetType = Module["_b2Body_SetType"] = asm["_b2Body_SetType"];
var _b2Body_SetTransform = Module["_b2Body_SetTransform"] = asm["_b2Body_SetTransform"];
var _b2CircleShape_CreateFixture = Module["_b2CircleShape_CreateFixture"] = asm["_b2CircleShape_CreateFixture"];
var _b2RevoluteJoint_GetJointAngle = Module["_b2RevoluteJoint_GetJointAngle"] = asm["_b2RevoluteJoint_GetJointAngle"];
var _malloc = Module["_malloc"] = asm["_malloc"];
var _b2Contact_GetManifold = Module["_b2Contact_GetManifold"] = asm["_b2Contact_GetManifold"];
var _b2RevoluteJoint_IsMotorEnabled = Module["_b2RevoluteJoint_IsMotorEnabled"] = asm["_b2RevoluteJoint_IsMotorEnabled"];
var _b2RevoluteJoint_IsLimitEnabled = Module["_b2RevoluteJoint_IsLimitEnabled"] = asm["_b2RevoluteJoint_IsLimitEnabled"];
var _b2World_DestroyParticleSystem = Module["_b2World_DestroyParticleSystem"] = asm["_b2World_DestroyParticleSystem"];
var _b2RevoluteJoint_EnableMotor = Module["_b2RevoluteJoint_EnableMotor"] = asm["_b2RevoluteJoint_EnableMotor"];
var _b2Body_GetTransform = Module["_b2Body_GetTransform"] = asm["_b2Body_GetTransform"];
var _b2WeldJointDef_InitializeAndCreate = Module["_b2WeldJointDef_InitializeAndCreate"] = asm["_b2WeldJointDef_InitializeAndCreate"];
var _b2FrictionJointDef_InitializeAndCreate = Module["_b2FrictionJointDef_InitializeAndCreate"] = asm["_b2FrictionJointDef_InitializeAndCreate"];
var _b2Body_GetType = Module["_b2Body_GetType"] = asm["_b2Body_GetType"];
var _b2Manifold_GetPointCount = Module["_b2Manifold_GetPointCount"] = asm["_b2Manifold_GetPointCount"];
var _b2ParticleSystem_SetDensity = Module["_b2ParticleSystem_SetDensity"] = asm["_b2ParticleSystem_SetDensity"];
var _b2PrismaticJoint_GetMotorForce = Module["_b2PrismaticJoint_GetMotorForce"] = asm["_b2PrismaticJoint_GetMotorForce"];
var _b2Joint_GetBodyA = Module["_b2Joint_GetBodyA"] = asm["_b2Joint_GetBodyA"];
var _b2PulleyJointDef_InitializeAndCreate = Module["_b2PulleyJointDef_InitializeAndCreate"] = asm["_b2PulleyJointDef_InitializeAndCreate"];
var _b2Joint_GetBodyB = Module["_b2Joint_GetBodyB"] = asm["_b2Joint_GetBodyB"];
var _b2ParticleSystem_GetParticleCount = Module["_b2ParticleSystem_GetParticleCount"] = asm["_b2ParticleSystem_GetParticleCount"];
var _b2MouseJoint_SetTarget = Module["_b2MouseJoint_SetTarget"] = asm["_b2MouseJoint_SetTarget"];
var _b2Body_ApplyAngularImpulse = Module["_b2Body_ApplyAngularImpulse"] = asm["_b2Body_ApplyAngularImpulse"];
var _b2ChainShape_CreateFixture = Module["_b2ChainShape_CreateFixture"] = asm["_b2ChainShape_CreateFixture"];
var _b2World_DestroyJoint = Module["_b2World_DestroyJoint"] = asm["_b2World_DestroyJoint"];
var _b2MotorJoint_SetAngularOffset = Module["_b2MotorJoint_SetAngularOffset"] = asm["_b2MotorJoint_SetAngularOffset"];
var _b2World_Delete = Module["_b2World_Delete"] = asm["_b2World_Delete"];
var _b2PrismaticJoint_GetJointTranslation = Module["_b2PrismaticJoint_GetJointTranslation"] = asm["_b2PrismaticJoint_GetJointTranslation"];
var _b2Body_GetMass = Module["_b2Body_GetMass"] = asm["_b2Body_GetMass"];
var _b2MouseJointDef_Create = Module["_b2MouseJointDef_Create"] = asm["_b2MouseJointDef_Create"];
var _b2WheelJointDef_InitializeAndCreate = Module["_b2WheelJointDef_InitializeAndCreate"] = asm["_b2WheelJointDef_InitializeAndCreate"];
var _b2World_Step = Module["_b2World_Step"] = asm["_b2World_Step"];
var _b2PrismaticJointDef_Create = Module["_b2PrismaticJointDef_Create"] = asm["_b2PrismaticJointDef_Create"];
var _b2WheelJointDef_Create = Module["_b2WheelJointDef_Create"] = asm["_b2WheelJointDef_Create"];
var _b2PulleyJointDef_Create = Module["_b2PulleyJointDef_Create"] = asm["_b2PulleyJointDef_Create"];
var _b2Body_GetInertia = Module["_b2Body_GetInertia"] = asm["_b2Body_GetInertia"];
var _memmove = Module["_memmove"] = asm["_memmove"];
var _b2PrismaticJoint_SetMotorSpeed = Module["_b2PrismaticJoint_SetMotorSpeed"] = asm["_b2PrismaticJoint_SetMotorSpeed"];
var runPostSets = Module["runPostSets"] = asm["runPostSets"];
var dynCall_ii = Module["dynCall_ii"] = asm["dynCall_ii"];
var dynCall_viiiii = Module["dynCall_viiiii"] = asm["dynCall_viiiii"];
var dynCall_vi = Module["dynCall_vi"] = asm["dynCall_vi"];
var dynCall_vii = Module["dynCall_vii"] = asm["dynCall_vii"];
var dynCall_iiii = Module["dynCall_iiii"] = asm["dynCall_iiii"];
var dynCall_fif = Module["dynCall_fif"] = asm["dynCall_fif"];
var dynCall_viii = Module["dynCall_viii"] = asm["dynCall_viii"];
var dynCall_v = Module["dynCall_v"] = asm["dynCall_v"];
var dynCall_iiiii = Module["dynCall_iiiii"] = asm["dynCall_iiiii"];
var dynCall_viif = Module["dynCall_viif"] = asm["dynCall_viif"];
var dynCall_viiiiii = Module["dynCall_viiiiii"] = asm["dynCall_viiiiii"];
var dynCall_iii = Module["dynCall_iii"] = asm["dynCall_iii"];
var dynCall_iiiiii = Module["dynCall_iiiiii"] = asm["dynCall_iiiiii"];
var dynCall_viiii = Module["dynCall_viiii"] = asm["dynCall_viiii"];

Runtime.stackAlloc = function(size) { return asm['stackAlloc'](size) };
Runtime.stackSave = function() { return asm['stackSave']() };
Runtime.stackRestore = function(top) { asm['stackRestore'](top) };

// TODO: strip out parts of this we do not need

//======= begin closure i64 code =======

// Copyright 2009 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Defines a Long class for representing a 64-bit two's-complement
 * integer value, which faithfully simulates the behavior of a Java "long". This
 * implementation is derived from LongLib in GWT.
 *
 */

var i64Math = (function() { // Emscripten wrapper
  var goog = { math: {} };


  /**
   * Constructs a 64-bit two's-complement integer, given its low and high 32-bit
   * values as *signed* integers.  See the from* functions below for more
   * convenient ways of constructing Longs.
   *
   * The internal representation of a long is the two given signed, 32-bit values.
   * We use 32-bit pieces because these are the size of integers on which
   * Javascript performs bit-operations.  For operations like addition and
   * multiplication, we split each number into 16-bit pieces, which can easily be
   * multiplied within Javascript's floating-point representation without overflow
   * or change in sign.
   *
   * In the algorithms below, we frequently reduce the negative case to the
   * positive case by negating the input(s) and then post-processing the result.
   * Note that we must ALWAYS check specially whether those values are MIN_VALUE
   * (-2^63) because -MIN_VALUE == MIN_VALUE (since 2^63 cannot be represented as
   * a positive number, it overflows back into a negative).  Not handling this
   * case would often result in infinite recursion.
   *
   * @param {number} low  The low (signed) 32 bits of the long.
   * @param {number} high  The high (signed) 32 bits of the long.
   * @constructor
   */
  goog.math.Long = function(low, high) {
    /**
     * @type {number}
     * @private
     */
    this.low_ = low | 0;  // force into 32 signed bits.

    /**
     * @type {number}
     * @private
     */
    this.high_ = high | 0;  // force into 32 signed bits.
  };


  // NOTE: Common constant values ZERO, ONE, NEG_ONE, etc. are defined below the
  // from* methods on which they depend.


  /**
   * A cache of the Long representations of small integer values.
   * @type {!Object}
   * @private
   */
  goog.math.Long.IntCache_ = {};


  /**
   * Returns a Long representing the given (32-bit) integer value.
   * @param {number} value The 32-bit integer in question.
   * @return {!goog.math.Long} The corresponding Long value.
   */
  goog.math.Long.fromInt = function(value) {
    if (-128 <= value && value < 128) {
      var cachedObj = goog.math.Long.IntCache_[value];
      if (cachedObj) {
        return cachedObj;
      }
    }

    var obj = new goog.math.Long(value | 0, value < 0 ? -1 : 0);
    if (-128 <= value && value < 128) {
      goog.math.Long.IntCache_[value] = obj;
    }
    return obj;
  };


  /**
   * Returns a Long representing the given value, provided that it is a finite
   * number.  Otherwise, zero is returned.
   * @param {number} value The number in question.
   * @return {!goog.math.Long} The corresponding Long value.
   */
  goog.math.Long.fromNumber = function(value) {
    if (isNaN(value) || !isFinite(value)) {
      return goog.math.Long.ZERO;
    } else if (value <= -goog.math.Long.TWO_PWR_63_DBL_) {
      return goog.math.Long.MIN_VALUE;
    } else if (value + 1 >= goog.math.Long.TWO_PWR_63_DBL_) {
      return goog.math.Long.MAX_VALUE;
    } else if (value < 0) {
      return goog.math.Long.fromNumber(-value).negate();
    } else {
      return new goog.math.Long(
          (value % goog.math.Long.TWO_PWR_32_DBL_) | 0,
          (value / goog.math.Long.TWO_PWR_32_DBL_) | 0);
    }
  };


  /**
   * Returns a Long representing the 64-bit integer that comes by concatenating
   * the given high and low bits.  Each is assumed to use 32 bits.
   * @param {number} lowBits The low 32-bits.
   * @param {number} highBits The high 32-bits.
   * @return {!goog.math.Long} The corresponding Long value.
   */
  goog.math.Long.fromBits = function(lowBits, highBits) {
    return new goog.math.Long(lowBits, highBits);
  };


  /**
   * Returns a Long representation of the given string, written using the given
   * radix.
   * @param {string} str The textual representation of the Long.
   * @param {number=} opt_radix The radix in which the text is written.
   * @return {!goog.math.Long} The corresponding Long value.
   */
  goog.math.Long.fromString = function(str, opt_radix) {
    if (str.length == 0) {
      throw Error('number format error: empty string');
    }

    var radix = opt_radix || 10;
    if (radix < 2 || 36 < radix) {
      throw Error('radix out of range: ' + radix);
    }

    if (str.charAt(0) == '-') {
      return goog.math.Long.fromString(str.substring(1), radix).negate();
    } else if (str.indexOf('-') >= 0) {
      throw Error('number format error: interior "-" character: ' + str);
    }

    // Do several (8) digits each time through the loop, so as to
    // minimize the calls to the very expensive emulated div.
    var radixToPower = goog.math.Long.fromNumber(Math.pow(radix, 8));

    var result = goog.math.Long.ZERO;
    for (var i = 0; i < str.length; i += 8) {
      var size = Math.min(8, str.length - i);
      var value = parseInt(str.substring(i, i + size), radix);
      if (size < 8) {
        var power = goog.math.Long.fromNumber(Math.pow(radix, size));
        result = result.multiply(power).add(goog.math.Long.fromNumber(value));
      } else {
        result = result.multiply(radixToPower);
        result = result.add(goog.math.Long.fromNumber(value));
      }
    }
    return result;
  };


  // NOTE: the compiler should inline these constant values below and then remove
  // these variables, so there should be no runtime penalty for these.


  /**
   * Number used repeated below in calculations.  This must appear before the
   * first call to any from* function below.
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_16_DBL_ = 1 << 16;


  /**
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_24_DBL_ = 1 << 24;


  /**
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_32_DBL_ =
      goog.math.Long.TWO_PWR_16_DBL_ * goog.math.Long.TWO_PWR_16_DBL_;


  /**
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_31_DBL_ =
      goog.math.Long.TWO_PWR_32_DBL_ / 2;


  /**
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_48_DBL_ =
      goog.math.Long.TWO_PWR_32_DBL_ * goog.math.Long.TWO_PWR_16_DBL_;


  /**
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_64_DBL_ =
      goog.math.Long.TWO_PWR_32_DBL_ * goog.math.Long.TWO_PWR_32_DBL_;


  /**
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_63_DBL_ =
      goog.math.Long.TWO_PWR_64_DBL_ / 2;


  /** @type {!goog.math.Long} */
  goog.math.Long.ZERO = goog.math.Long.fromInt(0);


  /** @type {!goog.math.Long} */
  goog.math.Long.ONE = goog.math.Long.fromInt(1);


  /** @type {!goog.math.Long} */
  goog.math.Long.NEG_ONE = goog.math.Long.fromInt(-1);


  /** @type {!goog.math.Long} */
  goog.math.Long.MAX_VALUE =
      goog.math.Long.fromBits(0xFFFFFFFF | 0, 0x7FFFFFFF | 0);


  /** @type {!goog.math.Long} */
  goog.math.Long.MIN_VALUE = goog.math.Long.fromBits(0, 0x80000000 | 0);


  /**
   * @type {!goog.math.Long}
   * @private
   */
  goog.math.Long.TWO_PWR_24_ = goog.math.Long.fromInt(1 << 24);


  /** @return {number} The value, assuming it is a 32-bit integer. */
  goog.math.Long.prototype.toInt = function() {
    return this.low_;
  };


  /** @return {number} The closest floating-point representation to this value. */
  goog.math.Long.prototype.toNumber = function() {
    return this.high_ * goog.math.Long.TWO_PWR_32_DBL_ +
           this.getLowBitsUnsigned();
  };


  /**
   * @param {number=} opt_radix The radix in which the text should be written.
   * @return {string} The textual representation of this value.
   */
  goog.math.Long.prototype.toString = function(opt_radix) {
    var radix = opt_radix || 10;
    if (radix < 2 || 36 < radix) {
      throw Error('radix out of range: ' + radix);
    }

    if (this.isZero()) {
      return '0';
    }

    if (this.isNegative()) {
      if (this.equals(goog.math.Long.MIN_VALUE)) {
        // We need to change the Long value before it can be negated, so we remove
        // the bottom-most digit in this base and then recurse to do the rest.
        var radixLong = goog.math.Long.fromNumber(radix);
        var div = this.div(radixLong);
        var rem = div.multiply(radixLong).subtract(this);
        return div.toString(radix) + rem.toInt().toString(radix);
      } else {
        return '-' + this.negate().toString(radix);
      }
    }

    // Do several (6) digits each time through the loop, so as to
    // minimize the calls to the very expensive emulated div.
    var radixToPower = goog.math.Long.fromNumber(Math.pow(radix, 6));

    var rem = this;
    var result = '';
    while (true) {
      var remDiv = rem.div(radixToPower);
      var intval = rem.subtract(remDiv.multiply(radixToPower)).toInt();
      var digits = intval.toString(radix);

      rem = remDiv;
      if (rem.isZero()) {
        return digits + result;
      } else {
        while (digits.length < 6) {
          digits = '0' + digits;
        }
        result = '' + digits + result;
      }
    }
  };


  /** @return {number} The high 32-bits as a signed value. */
  goog.math.Long.prototype.getHighBits = function() {
    return this.high_;
  };


  /** @return {number} The low 32-bits as a signed value. */
  goog.math.Long.prototype.getLowBits = function() {
    return this.low_;
  };


  /** @return {number} The low 32-bits as an unsigned value. */
  goog.math.Long.prototype.getLowBitsUnsigned = function() {
    return (this.low_ >= 0) ?
        this.low_ : goog.math.Long.TWO_PWR_32_DBL_ + this.low_;
  };


  /**
   * @return {number} Returns the number of bits needed to represent the absolute
   *     value of this Long.
   */
  goog.math.Long.prototype.getNumBitsAbs = function() {
    if (this.isNegative()) {
      if (this.equals(goog.math.Long.MIN_VALUE)) {
        return 64;
      } else {
        return this.negate().getNumBitsAbs();
      }
    } else {
      var val = this.high_ != 0 ? this.high_ : this.low_;
      for (var bit = 31; bit > 0; bit--) {
        if ((val & (1 << bit)) != 0) {
          break;
        }
      }
      return this.high_ != 0 ? bit + 33 : bit + 1;
    }
  };


  /** @return {boolean} Whether this value is zero. */
  goog.math.Long.prototype.isZero = function() {
    return this.high_ == 0 && this.low_ == 0;
  };


  /** @return {boolean} Whether this value is negative. */
  goog.math.Long.prototype.isNegative = function() {
    return this.high_ < 0;
  };


  /** @return {boolean} Whether this value is odd. */
  goog.math.Long.prototype.isOdd = function() {
    return (this.low_ & 1) == 1;
  };


  /**
   * @param {goog.math.Long} other Long to compare against.
   * @return {boolean} Whether this Long equals the other.
   */
  goog.math.Long.prototype.equals = function(other) {
    return (this.high_ == other.high_) && (this.low_ == other.low_);
  };


  /**
   * @param {goog.math.Long} other Long to compare against.
   * @return {boolean} Whether this Long does not equal the other.
   */
  goog.math.Long.prototype.notEquals = function(other) {
    return (this.high_ != other.high_) || (this.low_ != other.low_);
  };


  /**
   * @param {goog.math.Long} other Long to compare against.
   * @return {boolean} Whether this Long is less than the other.
   */
  goog.math.Long.prototype.lessThan = function(other) {
    return this.compare(other) < 0;
  };


  /**
   * @param {goog.math.Long} other Long to compare against.
   * @return {boolean} Whether this Long is less than or equal to the other.
   */
  goog.math.Long.prototype.lessThanOrEqual = function(other) {
    return this.compare(other) <= 0;
  };


  /**
   * @param {goog.math.Long} other Long to compare against.
   * @return {boolean} Whether this Long is greater than the other.
   */
  goog.math.Long.prototype.greaterThan = function(other) {
    return this.compare(other) > 0;
  };


  /**
   * @param {goog.math.Long} other Long to compare against.
   * @return {boolean} Whether this Long is greater than or equal to the other.
   */
  goog.math.Long.prototype.greaterThanOrEqual = function(other) {
    return this.compare(other) >= 0;
  };


  /**
   * Compares this Long with the given one.
   * @param {goog.math.Long} other Long to compare against.
   * @return {number} 0 if they are the same, 1 if the this is greater, and -1
   *     if the given one is greater.
   */
  goog.math.Long.prototype.compare = function(other) {
    if (this.equals(other)) {
      return 0;
    }

    var thisNeg = this.isNegative();
    var otherNeg = other.isNegative();
    if (thisNeg && !otherNeg) {
      return -1;
    }
    if (!thisNeg && otherNeg) {
      return 1;
    }

    // at this point, the signs are the same, so subtraction will not overflow
    if (this.subtract(other).isNegative()) {
      return -1;
    } else {
      return 1;
    }
  };


  /** @return {!goog.math.Long} The negation of this value. */
  goog.math.Long.prototype.negate = function() {
    if (this.equals(goog.math.Long.MIN_VALUE)) {
      return goog.math.Long.MIN_VALUE;
    } else {
      return this.not().add(goog.math.Long.ONE);
    }
  };


  /**
   * Returns the sum of this and the given Long.
   * @param {goog.math.Long} other Long to add to this one.
   * @return {!goog.math.Long} The sum of this and the given Long.
   */
  goog.math.Long.prototype.add = function(other) {
    // Divide each number into 4 chunks of 16 bits, and then sum the chunks.

    var a48 = this.high_ >>> 16;
    var a32 = this.high_ & 0xFFFF;
    var a16 = this.low_ >>> 16;
    var a00 = this.low_ & 0xFFFF;

    var b48 = other.high_ >>> 16;
    var b32 = other.high_ & 0xFFFF;
    var b16 = other.low_ >>> 16;
    var b00 = other.low_ & 0xFFFF;

    var c48 = 0, c32 = 0, c16 = 0, c00 = 0;
    c00 += a00 + b00;
    c16 += c00 >>> 16;
    c00 &= 0xFFFF;
    c16 += a16 + b16;
    c32 += c16 >>> 16;
    c16 &= 0xFFFF;
    c32 += a32 + b32;
    c48 += c32 >>> 16;
    c32 &= 0xFFFF;
    c48 += a48 + b48;
    c48 &= 0xFFFF;
    return goog.math.Long.fromBits((c16 << 16) | c00, (c48 << 16) | c32);
  };


  /**
   * Returns the difference of this and the given Long.
   * @param {goog.math.Long} other Long to subtract from this.
   * @return {!goog.math.Long} The difference of this and the given Long.
   */
  goog.math.Long.prototype.subtract = function(other) {
    return this.add(other.negate());
  };


  /**
   * Returns the product of this and the given long.
   * @param {goog.math.Long} other Long to multiply with this.
   * @return {!goog.math.Long} The product of this and the other.
   */
  goog.math.Long.prototype.multiply = function(other) {
    if (this.isZero()) {
      return goog.math.Long.ZERO;
    } else if (other.isZero()) {
      return goog.math.Long.ZERO;
    }

    if (this.equals(goog.math.Long.MIN_VALUE)) {
      return other.isOdd() ? goog.math.Long.MIN_VALUE : goog.math.Long.ZERO;
    } else if (other.equals(goog.math.Long.MIN_VALUE)) {
      return this.isOdd() ? goog.math.Long.MIN_VALUE : goog.math.Long.ZERO;
    }

    if (this.isNegative()) {
      if (other.isNegative()) {
        return this.negate().multiply(other.negate());
      } else {
        return this.negate().multiply(other).negate();
      }
    } else if (other.isNegative()) {
      return this.multiply(other.negate()).negate();
    }

    // If both longs are small, use float multiplication
    if (this.lessThan(goog.math.Long.TWO_PWR_24_) &&
        other.lessThan(goog.math.Long.TWO_PWR_24_)) {
      return goog.math.Long.fromNumber(this.toNumber() * other.toNumber());
    }

    // Divide each long into 4 chunks of 16 bits, and then add up 4x4 products.
    // We can skip products that would overflow.

    var a48 = this.high_ >>> 16;
    var a32 = this.high_ & 0xFFFF;
    var a16 = this.low_ >>> 16;
    var a00 = this.low_ & 0xFFFF;

    var b48 = other.high_ >>> 16;
    var b32 = other.high_ & 0xFFFF;
    var b16 = other.low_ >>> 16;
    var b00 = other.low_ & 0xFFFF;

    var c48 = 0, c32 = 0, c16 = 0, c00 = 0;
    c00 += a00 * b00;
    c16 += c00 >>> 16;
    c00 &= 0xFFFF;
    c16 += a16 * b00;
    c32 += c16 >>> 16;
    c16 &= 0xFFFF;
    c16 += a00 * b16;
    c32 += c16 >>> 16;
    c16 &= 0xFFFF;
    c32 += a32 * b00;
    c48 += c32 >>> 16;
    c32 &= 0xFFFF;
    c32 += a16 * b16;
    c48 += c32 >>> 16;
    c32 &= 0xFFFF;
    c32 += a00 * b32;
    c48 += c32 >>> 16;
    c32 &= 0xFFFF;
    c48 += a48 * b00 + a32 * b16 + a16 * b32 + a00 * b48;
    c48 &= 0xFFFF;
    return goog.math.Long.fromBits((c16 << 16) | c00, (c48 << 16) | c32);
  };


  /**
   * Returns this Long divided by the given one.
   * @param {goog.math.Long} other Long by which to divide.
   * @return {!goog.math.Long} This Long divided by the given one.
   */
  goog.math.Long.prototype.div = function(other) {
    if (other.isZero()) {
      throw Error('division by zero');
    } else if (this.isZero()) {
      return goog.math.Long.ZERO;
    }

    if (this.equals(goog.math.Long.MIN_VALUE)) {
      if (other.equals(goog.math.Long.ONE) ||
          other.equals(goog.math.Long.NEG_ONE)) {
        return goog.math.Long.MIN_VALUE;  // recall that -MIN_VALUE == MIN_VALUE
      } else if (other.equals(goog.math.Long.MIN_VALUE)) {
        return goog.math.Long.ONE;
      } else {
        // At this point, we have |other| >= 2, so |this/other| < |MIN_VALUE|.
        var halfThis = this.shiftRight(1);
        var approx = halfThis.div(other).shiftLeft(1);
        if (approx.equals(goog.math.Long.ZERO)) {
          return other.isNegative() ? goog.math.Long.ONE : goog.math.Long.NEG_ONE;
        } else {
          var rem = this.subtract(other.multiply(approx));
          var result = approx.add(rem.div(other));
          return result;
        }
      }
    } else if (other.equals(goog.math.Long.MIN_VALUE)) {
      return goog.math.Long.ZERO;
    }

    if (this.isNegative()) {
      if (other.isNegative()) {
        return this.negate().div(other.negate());
      } else {
        return this.negate().div(other).negate();
      }
    } else if (other.isNegative()) {
      return this.div(other.negate()).negate();
    }

    // Repeat the following until the remainder is less than other:  find a
    // floating-point that approximates remainder / other *from below*, add this
    // into the result, and subtract it from the remainder.  It is critical that
    // the approximate value is less than or equal to the real value so that the
    // remainder never becomes negative.
    var res = goog.math.Long.ZERO;
    var rem = this;
    while (rem.greaterThanOrEqual(other)) {
      // Approximate the result of division. This may be a little greater or
      // smaller than the actual value.
      var approx = Math.max(1, Math.floor(rem.toNumber() / other.toNumber()));

      // We will tweak the approximate result by changing it in the 48-th digit or
      // the smallest non-fractional digit, whichever is larger.
      var log2 = Math.ceil(Math.log(approx) / Math.LN2);
      var delta = (log2 <= 48) ? 1 : Math.pow(2, log2 - 48);

      // Decrease the approximation until it is smaller than the remainder.  Note
      // that if it is too large, the product overflows and is negative.
      var approxRes = goog.math.Long.fromNumber(approx);
      var approxRem = approxRes.multiply(other);
      while (approxRem.isNegative() || approxRem.greaterThan(rem)) {
        approx -= delta;
        approxRes = goog.math.Long.fromNumber(approx);
        approxRem = approxRes.multiply(other);
      }

      // We know the answer can't be zero... and actually, zero would cause
      // infinite recursion since we would make no progress.
      if (approxRes.isZero()) {
        approxRes = goog.math.Long.ONE;
      }

      res = res.add(approxRes);
      rem = rem.subtract(approxRem);
    }
    return res;
  };


  /**
   * Returns this Long modulo the given one.
   * @param {goog.math.Long} other Long by which to mod.
   * @return {!goog.math.Long} This Long modulo the given one.
   */
  goog.math.Long.prototype.modulo = function(other) {
    return this.subtract(this.div(other).multiply(other));
  };


  /** @return {!goog.math.Long} The bitwise-NOT of this value. */
  goog.math.Long.prototype.not = function() {
    return goog.math.Long.fromBits(~this.low_, ~this.high_);
  };


  /**
   * Returns the bitwise-AND of this Long and the given one.
   * @param {goog.math.Long} other The Long with which to AND.
   * @return {!goog.math.Long} The bitwise-AND of this and the other.
   */
  goog.math.Long.prototype.and = function(other) {
    return goog.math.Long.fromBits(this.low_ & other.low_,
                                   this.high_ & other.high_);
  };


  /**
   * Returns the bitwise-OR of this Long and the given one.
   * @param {goog.math.Long} other The Long with which to OR.
   * @return {!goog.math.Long} The bitwise-OR of this and the other.
   */
  goog.math.Long.prototype.or = function(other) {
    return goog.math.Long.fromBits(this.low_ | other.low_,
                                   this.high_ | other.high_);
  };


  /**
   * Returns the bitwise-XOR of this Long and the given one.
   * @param {goog.math.Long} other The Long with which to XOR.
   * @return {!goog.math.Long} The bitwise-XOR of this and the other.
   */
  goog.math.Long.prototype.xor = function(other) {
    return goog.math.Long.fromBits(this.low_ ^ other.low_,
                                   this.high_ ^ other.high_);
  };


  /**
   * Returns this Long with bits shifted to the left by the given amount.
   * @param {number} numBits The number of bits by which to shift.
   * @return {!goog.math.Long} This shifted to the left by the given amount.
   */
  goog.math.Long.prototype.shiftLeft = function(numBits) {
    numBits &= 63;
    if (numBits == 0) {
      return this;
    } else {
      var low = this.low_;
      if (numBits < 32) {
        var high = this.high_;
        return goog.math.Long.fromBits(
            low << numBits,
            (high << numBits) | (low >>> (32 - numBits)));
      } else {
        return goog.math.Long.fromBits(0, low << (numBits - 32));
      }
    }
  };


  /**
   * Returns this Long with bits shifted to the right by the given amount.
   * @param {number} numBits The number of bits by which to shift.
   * @return {!goog.math.Long} This shifted to the right by the given amount.
   */
  goog.math.Long.prototype.shiftRight = function(numBits) {
    numBits &= 63;
    if (numBits == 0) {
      return this;
    } else {
      var high = this.high_;
      if (numBits < 32) {
        var low = this.low_;
        return goog.math.Long.fromBits(
            (low >>> numBits) | (high << (32 - numBits)),
            high >> numBits);
      } else {
        return goog.math.Long.fromBits(
            high >> (numBits - 32),
            high >= 0 ? 0 : -1);
      }
    }
  };


  /**
   * Returns this Long with bits shifted to the right by the given amount, with
   * the new top bits matching the current sign bit.
   * @param {number} numBits The number of bits by which to shift.
   * @return {!goog.math.Long} This shifted to the right by the given amount, with
   *     zeros placed into the new leading bits.
   */
  goog.math.Long.prototype.shiftRightUnsigned = function(numBits) {
    numBits &= 63;
    if (numBits == 0) {
      return this;
    } else {
      var high = this.high_;
      if (numBits < 32) {
        var low = this.low_;
        return goog.math.Long.fromBits(
            (low >>> numBits) | (high << (32 - numBits)),
            high >>> numBits);
      } else if (numBits == 32) {
        return goog.math.Long.fromBits(high, 0);
      } else {
        return goog.math.Long.fromBits(high >>> (numBits - 32), 0);
      }
    }
  };

  //======= begin jsbn =======

  var navigator = { appName: 'Modern Browser' }; // polyfill a little

  // Copyright (c) 2005  Tom Wu
  // All Rights Reserved.
  // http://www-cs-students.stanford.edu/~tjw/jsbn/

  /*
   * Copyright (c) 2003-2005  Tom Wu
   * All Rights Reserved.
   *
   * Permission is hereby granted, free of charge, to any person obtaining
   * a copy of this software and associated documentation files (the
   * "Software"), to deal in the Software without restriction, including
   * without limitation the rights to use, copy, modify, merge, publish,
   * distribute, sublicense, and/or sell copies of the Software, and to
   * permit persons to whom the Software is furnished to do so, subject to
   * the following conditions:
   *
   * The above copyright notice and this permission notice shall be
   * included in all copies or substantial portions of the Software.
   *
   * THE SOFTWARE IS PROVIDED "AS-IS" AND WITHOUT WARRANTY OF ANY KIND, 
   * EXPRESS, IMPLIED OR OTHERWISE, INCLUDING WITHOUT LIMITATION, ANY 
   * WARRANTY OF MERCHANTABILITY OR FITNESS FOR A PARTICULAR PURPOSE.  
   *
   * IN NO EVENT SHALL TOM WU BE LIABLE FOR ANY SPECIAL, INCIDENTAL,
   * INDIRECT OR CONSEQUENTIAL DAMAGES OF ANY KIND, OR ANY DAMAGES WHATSOEVER
   * RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER OR NOT ADVISED OF
   * THE POSSIBILITY OF DAMAGE, AND ON ANY THEORY OF LIABILITY, ARISING OUT
   * OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
   *
   * In addition, the following condition applies:
   *
   * All redistributions must retain an intact copy of this copyright notice
   * and disclaimer.
   */

  // Basic JavaScript BN library - subset useful for RSA encryption.

  // Bits per digit
  var dbits;

  // JavaScript engine analysis
  var canary = 0xdeadbeefcafe;
  var j_lm = ((canary&0xffffff)==0xefcafe);

  // (public) Constructor
  function BigInteger(a,b,c) {
    if(a != null)
      if("number" == typeof a) this.fromNumber(a,b,c);
      else if(b == null && "string" != typeof a) this.fromString(a,256);
      else this.fromString(a,b);
  }

  // return new, unset BigInteger
  function nbi() { return new BigInteger(null); }

  // am: Compute w_j += (x*this_i), propagate carries,
  // c is initial carry, returns final carry.
  // c < 3*dvalue, x < 2*dvalue, this_i < dvalue
  // We need to select the fastest one that works in this environment.

  // am1: use a single mult and divide to get the high bits,
  // max digit bits should be 26 because
  // max internal value = 2*dvalue^2-2*dvalue (< 2^53)
  function am1(i,x,w,j,c,n) {
    while(--n >= 0) {
      var v = x*this[i++]+w[j]+c;
      c = Math.floor(v/0x4000000);
      w[j++] = v&0x3ffffff;
    }
    return c;
  }
  // am2 avoids a big mult-and-extract completely.
  // Max digit bits should be <= 30 because we do bitwise ops
  // on values up to 2*hdvalue^2-hdvalue-1 (< 2^31)
  function am2(i,x,w,j,c,n) {
    var xl = x&0x7fff, xh = x>>15;
    while(--n >= 0) {
      var l = this[i]&0x7fff;
      var h = this[i++]>>15;
      var m = xh*l+h*xl;
      l = xl*l+((m&0x7fff)<<15)+w[j]+(c&0x3fffffff);
      c = (l>>>30)+(m>>>15)+xh*h+(c>>>30);
      w[j++] = l&0x3fffffff;
    }
    return c;
  }
  // Alternately, set max digit bits to 28 since some
  // browsers slow down when dealing with 32-bit numbers.
  function am3(i,x,w,j,c,n) {
    var xl = x&0x3fff, xh = x>>14;
    while(--n >= 0) {
      var l = this[i]&0x3fff;
      var h = this[i++]>>14;
      var m = xh*l+h*xl;
      l = xl*l+((m&0x3fff)<<14)+w[j]+c;
      c = (l>>28)+(m>>14)+xh*h;
      w[j++] = l&0xfffffff;
    }
    return c;
  }
  if(j_lm && (navigator.appName == "Microsoft Internet Explorer")) {
    BigInteger.prototype.am = am2;
    dbits = 30;
  }
  else if(j_lm && (navigator.appName != "Netscape")) {
    BigInteger.prototype.am = am1;
    dbits = 26;
  }
  else { // Mozilla/Netscape seems to prefer am3
    BigInteger.prototype.am = am3;
    dbits = 28;
  }

  BigInteger.prototype.DB = dbits;
  BigInteger.prototype.DM = ((1<<dbits)-1);
  BigInteger.prototype.DV = (1<<dbits);

  var BI_FP = 52;
  BigInteger.prototype.FV = Math.pow(2,BI_FP);
  BigInteger.prototype.F1 = BI_FP-dbits;
  BigInteger.prototype.F2 = 2*dbits-BI_FP;

  // Digit conversions
  var BI_RM = "0123456789abcdefghijklmnopqrstuvwxyz";
  var BI_RC = new Array();
  var rr,vv;
  rr = "0".charCodeAt(0);
  for(vv = 0; vv <= 9; ++vv) BI_RC[rr++] = vv;
  rr = "a".charCodeAt(0);
  for(vv = 10; vv < 36; ++vv) BI_RC[rr++] = vv;
  rr = "A".charCodeAt(0);
  for(vv = 10; vv < 36; ++vv) BI_RC[rr++] = vv;

  function int2char(n) { return BI_RM.charAt(n); }
  function intAt(s,i) {
    var c = BI_RC[s.charCodeAt(i)];
    return (c==null)?-1:c;
  }

  // (protected) copy this to r
  function bnpCopyTo(r) {
    for(var i = this.t-1; i >= 0; --i) r[i] = this[i];
    r.t = this.t;
    r.s = this.s;
  }

  // (protected) set from integer value x, -DV <= x < DV
  function bnpFromInt(x) {
    this.t = 1;
    this.s = (x<0)?-1:0;
    if(x > 0) this[0] = x;
    else if(x < -1) this[0] = x+DV;
    else this.t = 0;
  }

  // return bigint initialized to value
  function nbv(i) { var r = nbi(); r.fromInt(i); return r; }

  // (protected) set from string and radix
  function bnpFromString(s,b) {
    var k;
    if(b == 16) k = 4;
    else if(b == 8) k = 3;
    else if(b == 256) k = 8; // byte array
    else if(b == 2) k = 1;
    else if(b == 32) k = 5;
    else if(b == 4) k = 2;
    else { this.fromRadix(s,b); return; }
    this.t = 0;
    this.s = 0;
    var i = s.length, mi = false, sh = 0;
    while(--i >= 0) {
      var x = (k==8)?s[i]&0xff:intAt(s,i);
      if(x < 0) {
        if(s.charAt(i) == "-") mi = true;
        continue;
      }
      mi = false;
      if(sh == 0)
        this[this.t++] = x;
      else if(sh+k > this.DB) {
        this[this.t-1] |= (x&((1<<(this.DB-sh))-1))<<sh;
        this[this.t++] = (x>>(this.DB-sh));
      }
      else
        this[this.t-1] |= x<<sh;
      sh += k;
      if(sh >= this.DB) sh -= this.DB;
    }
    if(k == 8 && (s[0]&0x80) != 0) {
      this.s = -1;
      if(sh > 0) this[this.t-1] |= ((1<<(this.DB-sh))-1)<<sh;
    }
    this.clamp();
    if(mi) BigInteger.ZERO.subTo(this,this);
  }

  // (protected) clamp off excess high words
  function bnpClamp() {
    var c = this.s&this.DM;
    while(this.t > 0 && this[this.t-1] == c) --this.t;
  }

  // (public) return string representation in given radix
  function bnToString(b) {
    if(this.s < 0) return "-"+this.negate().toString(b);
    var k;
    if(b == 16) k = 4;
    else if(b == 8) k = 3;
    else if(b == 2) k = 1;
    else if(b == 32) k = 5;
    else if(b == 4) k = 2;
    else return this.toRadix(b);
    var km = (1<<k)-1, d, m = false, r = "", i = this.t;
    var p = this.DB-(i*this.DB)%k;
    if(i-- > 0) {
      if(p < this.DB && (d = this[i]>>p) > 0) { m = true; r = int2char(d); }
      while(i >= 0) {
        if(p < k) {
          d = (this[i]&((1<<p)-1))<<(k-p);
          d |= this[--i]>>(p+=this.DB-k);
        }
        else {
          d = (this[i]>>(p-=k))&km;
          if(p <= 0) { p += this.DB; --i; }
        }
        if(d > 0) m = true;
        if(m) r += int2char(d);
      }
    }
    return m?r:"0";
  }

  // (public) -this
  function bnNegate() { var r = nbi(); BigInteger.ZERO.subTo(this,r); return r; }

  // (public) |this|
  function bnAbs() { return (this.s<0)?this.negate():this; }

  // (public) return + if this > a, - if this < a, 0 if equal
  function bnCompareTo(a) {
    var r = this.s-a.s;
    if(r != 0) return r;
    var i = this.t;
    r = i-a.t;
    if(r != 0) return (this.s<0)?-r:r;
    while(--i >= 0) if((r=this[i]-a[i]) != 0) return r;
    return 0;
  }

  // returns bit length of the integer x
  function nbits(x) {
    var r = 1, t;
    if((t=x>>>16) != 0) { x = t; r += 16; }
    if((t=x>>8) != 0) { x = t; r += 8; }
    if((t=x>>4) != 0) { x = t; r += 4; }
    if((t=x>>2) != 0) { x = t; r += 2; }
    if((t=x>>1) != 0) { x = t; r += 1; }
    return r;
  }

  // (public) return the number of bits in "this"
  function bnBitLength() {
    if(this.t <= 0) return 0;
    return this.DB*(this.t-1)+nbits(this[this.t-1]^(this.s&this.DM));
  }

  // (protected) r = this << n*DB
  function bnpDLShiftTo(n,r) {
    var i;
    for(i = this.t-1; i >= 0; --i) r[i+n] = this[i];
    for(i = n-1; i >= 0; --i) r[i] = 0;
    r.t = this.t+n;
    r.s = this.s;
  }

  // (protected) r = this >> n*DB
  function bnpDRShiftTo(n,r) {
    for(var i = n; i < this.t; ++i) r[i-n] = this[i];
    r.t = Math.max(this.t-n,0);
    r.s = this.s;
  }

  // (protected) r = this << n
  function bnpLShiftTo(n,r) {
    var bs = n%this.DB;
    var cbs = this.DB-bs;
    var bm = (1<<cbs)-1;
    var ds = Math.floor(n/this.DB), c = (this.s<<bs)&this.DM, i;
    for(i = this.t-1; i >= 0; --i) {
      r[i+ds+1] = (this[i]>>cbs)|c;
      c = (this[i]&bm)<<bs;
    }
    for(i = ds-1; i >= 0; --i) r[i] = 0;
    r[ds] = c;
    r.t = this.t+ds+1;
    r.s = this.s;
    r.clamp();
  }

  // (protected) r = this >> n
  function bnpRShiftTo(n,r) {
    r.s = this.s;
    var ds = Math.floor(n/this.DB);
    if(ds >= this.t) { r.t = 0; return; }
    var bs = n%this.DB;
    var cbs = this.DB-bs;
    var bm = (1<<bs)-1;
    r[0] = this[ds]>>bs;
    for(var i = ds+1; i < this.t; ++i) {
      r[i-ds-1] |= (this[i]&bm)<<cbs;
      r[i-ds] = this[i]>>bs;
    }
    if(bs > 0) r[this.t-ds-1] |= (this.s&bm)<<cbs;
    r.t = this.t-ds;
    r.clamp();
  }

  // (protected) r = this - a
  function bnpSubTo(a,r) {
    var i = 0, c = 0, m = Math.min(a.t,this.t);
    while(i < m) {
      c += this[i]-a[i];
      r[i++] = c&this.DM;
      c >>= this.DB;
    }
    if(a.t < this.t) {
      c -= a.s;
      while(i < this.t) {
        c += this[i];
        r[i++] = c&this.DM;
        c >>= this.DB;
      }
      c += this.s;
    }
    else {
      c += this.s;
      while(i < a.t) {
        c -= a[i];
        r[i++] = c&this.DM;
        c >>= this.DB;
      }
      c -= a.s;
    }
    r.s = (c<0)?-1:0;
    if(c < -1) r[i++] = this.DV+c;
    else if(c > 0) r[i++] = c;
    r.t = i;
    r.clamp();
  }

  // (protected) r = this * a, r != this,a (HAC 14.12)
  // "this" should be the larger one if appropriate.
  function bnpMultiplyTo(a,r) {
    var x = this.abs(), y = a.abs();
    var i = x.t;
    r.t = i+y.t;
    while(--i >= 0) r[i] = 0;
    for(i = 0; i < y.t; ++i) r[i+x.t] = x.am(0,y[i],r,i,0,x.t);
    r.s = 0;
    r.clamp();
    if(this.s != a.s) BigInteger.ZERO.subTo(r,r);
  }

  // (protected) r = this^2, r != this (HAC 14.16)
  function bnpSquareTo(r) {
    var x = this.abs();
    var i = r.t = 2*x.t;
    while(--i >= 0) r[i] = 0;
    for(i = 0; i < x.t-1; ++i) {
      var c = x.am(i,x[i],r,2*i,0,1);
      if((r[i+x.t]+=x.am(i+1,2*x[i],r,2*i+1,c,x.t-i-1)) >= x.DV) {
        r[i+x.t] -= x.DV;
        r[i+x.t+1] = 1;
      }
    }
    if(r.t > 0) r[r.t-1] += x.am(i,x[i],r,2*i,0,1);
    r.s = 0;
    r.clamp();
  }

  // (protected) divide this by m, quotient and remainder to q, r (HAC 14.20)
  // r != q, this != m.  q or r may be null.
  function bnpDivRemTo(m,q,r) {
    var pm = m.abs();
    if(pm.t <= 0) return;
    var pt = this.abs();
    if(pt.t < pm.t) {
      if(q != null) q.fromInt(0);
      if(r != null) this.copyTo(r);
      return;
    }
    if(r == null) r = nbi();
    var y = nbi(), ts = this.s, ms = m.s;
    var nsh = this.DB-nbits(pm[pm.t-1]);	// normalize modulus
    if(nsh > 0) { pm.lShiftTo(nsh,y); pt.lShiftTo(nsh,r); }
    else { pm.copyTo(y); pt.copyTo(r); }
    var ys = y.t;
    var y0 = y[ys-1];
    if(y0 == 0) return;
    var yt = y0*(1<<this.F1)+((ys>1)?y[ys-2]>>this.F2:0);
    var d1 = this.FV/yt, d2 = (1<<this.F1)/yt, e = 1<<this.F2;
    var i = r.t, j = i-ys, t = (q==null)?nbi():q;
    y.dlShiftTo(j,t);
    if(r.compareTo(t) >= 0) {
      r[r.t++] = 1;
      r.subTo(t,r);
    }
    BigInteger.ONE.dlShiftTo(ys,t);
    t.subTo(y,y);	// "negative" y so we can replace sub with am later
    while(y.t < ys) y[y.t++] = 0;
    while(--j >= 0) {
      // Estimate quotient digit
      var qd = (r[--i]==y0)?this.DM:Math.floor(r[i]*d1+(r[i-1]+e)*d2);
      if((r[i]+=y.am(0,qd,r,j,0,ys)) < qd) {	// Try it out
        y.dlShiftTo(j,t);
        r.subTo(t,r);
        while(r[i] < --qd) r.subTo(t,r);
      }
    }
    if(q != null) {
      r.drShiftTo(ys,q);
      if(ts != ms) BigInteger.ZERO.subTo(q,q);
    }
    r.t = ys;
    r.clamp();
    if(nsh > 0) r.rShiftTo(nsh,r);	// Denormalize remainder
    if(ts < 0) BigInteger.ZERO.subTo(r,r);
  }

  // (public) this mod a
  function bnMod(a) {
    var r = nbi();
    this.abs().divRemTo(a,null,r);
    if(this.s < 0 && r.compareTo(BigInteger.ZERO) > 0) a.subTo(r,r);
    return r;
  }

  // Modular reduction using "classic" algorithm
  function Classic(m) { this.m = m; }
  function cConvert(x) {
    if(x.s < 0 || x.compareTo(this.m) >= 0) return x.mod(this.m);
    else return x;
  }
  function cRevert(x) { return x; }
  function cReduce(x) { x.divRemTo(this.m,null,x); }
  function cMulTo(x,y,r) { x.multiplyTo(y,r); this.reduce(r); }
  function cSqrTo(x,r) { x.squareTo(r); this.reduce(r); }

  Classic.prototype.convert = cConvert;
  Classic.prototype.revert = cRevert;
  Classic.prototype.reduce = cReduce;
  Classic.prototype.mulTo = cMulTo;
  Classic.prototype.sqrTo = cSqrTo;

  // (protected) return "-1/this % 2^DB"; useful for Mont. reduction
  // justification:
  //         xy == 1 (mod m)
  //         xy =  1+km
  //   xy(2-xy) = (1+km)(1-km)
  // x[y(2-xy)] = 1-k^2m^2
  // x[y(2-xy)] == 1 (mod m^2)
  // if y is 1/x mod m, then y(2-xy) is 1/x mod m^2
  // should reduce x and y(2-xy) by m^2 at each step to keep size bounded.
  // JS multiply "overflows" differently from C/C++, so care is needed here.
  function bnpInvDigit() {
    if(this.t < 1) return 0;
    var x = this[0];
    if((x&1) == 0) return 0;
    var y = x&3;		// y == 1/x mod 2^2
    y = (y*(2-(x&0xf)*y))&0xf;	// y == 1/x mod 2^4
    y = (y*(2-(x&0xff)*y))&0xff;	// y == 1/x mod 2^8
    y = (y*(2-(((x&0xffff)*y)&0xffff)))&0xffff;	// y == 1/x mod 2^16
    // last step - calculate inverse mod DV directly;
    // assumes 16 < DB <= 32 and assumes ability to handle 48-bit ints
    y = (y*(2-x*y%this.DV))%this.DV;		// y == 1/x mod 2^dbits
    // we really want the negative inverse, and -DV < y < DV
    return (y>0)?this.DV-y:-y;
  }

  // Montgomery reduction
  function Montgomery(m) {
    this.m = m;
    this.mp = m.invDigit();
    this.mpl = this.mp&0x7fff;
    this.mph = this.mp>>15;
    this.um = (1<<(m.DB-15))-1;
    this.mt2 = 2*m.t;
  }

  // xR mod m
  function montConvert(x) {
    var r = nbi();
    x.abs().dlShiftTo(this.m.t,r);
    r.divRemTo(this.m,null,r);
    if(x.s < 0 && r.compareTo(BigInteger.ZERO) > 0) this.m.subTo(r,r);
    return r;
  }

  // x/R mod m
  function montRevert(x) {
    var r = nbi();
    x.copyTo(r);
    this.reduce(r);
    return r;
  }

  // x = x/R mod m (HAC 14.32)
  function montReduce(x) {
    while(x.t <= this.mt2)	// pad x so am has enough room later
      x[x.t++] = 0;
    for(var i = 0; i < this.m.t; ++i) {
      // faster way of calculating u0 = x[i]*mp mod DV
      var j = x[i]&0x7fff;
      var u0 = (j*this.mpl+(((j*this.mph+(x[i]>>15)*this.mpl)&this.um)<<15))&x.DM;
      // use am to combine the multiply-shift-add into one call
      j = i+this.m.t;
      x[j] += this.m.am(0,u0,x,i,0,this.m.t);
      // propagate carry
      while(x[j] >= x.DV) { x[j] -= x.DV; x[++j]++; }
    }
    x.clamp();
    x.drShiftTo(this.m.t,x);
    if(x.compareTo(this.m) >= 0) x.subTo(this.m,x);
  }

  // r = "x^2/R mod m"; x != r
  function montSqrTo(x,r) { x.squareTo(r); this.reduce(r); }

  // r = "xy/R mod m"; x,y != r
  function montMulTo(x,y,r) { x.multiplyTo(y,r); this.reduce(r); }

  Montgomery.prototype.convert = montConvert;
  Montgomery.prototype.revert = montRevert;
  Montgomery.prototype.reduce = montReduce;
  Montgomery.prototype.mulTo = montMulTo;
  Montgomery.prototype.sqrTo = montSqrTo;

  // (protected) true iff this is even
  function bnpIsEven() { return ((this.t>0)?(this[0]&1):this.s) == 0; }

  // (protected) this^e, e < 2^32, doing sqr and mul with "r" (HAC 14.79)
  function bnpExp(e,z) {
    if(e > 0xffffffff || e < 1) return BigInteger.ONE;
    var r = nbi(), r2 = nbi(), g = z.convert(this), i = nbits(e)-1;
    g.copyTo(r);
    while(--i >= 0) {
      z.sqrTo(r,r2);
      if((e&(1<<i)) > 0) z.mulTo(r2,g,r);
      else { var t = r; r = r2; r2 = t; }
    }
    return z.revert(r);
  }

  // (public) this^e % m, 0 <= e < 2^32
  function bnModPowInt(e,m) {
    var z;
    if(e < 256 || m.isEven()) z = new Classic(m); else z = new Montgomery(m);
    return this.exp(e,z);
  }

  // protected
  BigInteger.prototype.copyTo = bnpCopyTo;
  BigInteger.prototype.fromInt = bnpFromInt;
  BigInteger.prototype.fromString = bnpFromString;
  BigInteger.prototype.clamp = bnpClamp;
  BigInteger.prototype.dlShiftTo = bnpDLShiftTo;
  BigInteger.prototype.drShiftTo = bnpDRShiftTo;
  BigInteger.prototype.lShiftTo = bnpLShiftTo;
  BigInteger.prototype.rShiftTo = bnpRShiftTo;
  BigInteger.prototype.subTo = bnpSubTo;
  BigInteger.prototype.multiplyTo = bnpMultiplyTo;
  BigInteger.prototype.squareTo = bnpSquareTo;
  BigInteger.prototype.divRemTo = bnpDivRemTo;
  BigInteger.prototype.invDigit = bnpInvDigit;
  BigInteger.prototype.isEven = bnpIsEven;
  BigInteger.prototype.exp = bnpExp;

  // public
  BigInteger.prototype.toString = bnToString;
  BigInteger.prototype.negate = bnNegate;
  BigInteger.prototype.abs = bnAbs;
  BigInteger.prototype.compareTo = bnCompareTo;
  BigInteger.prototype.bitLength = bnBitLength;
  BigInteger.prototype.mod = bnMod;
  BigInteger.prototype.modPowInt = bnModPowInt;

  // "constants"
  BigInteger.ZERO = nbv(0);
  BigInteger.ONE = nbv(1);

  // jsbn2 stuff

  // (protected) convert from radix string
  function bnpFromRadix(s,b) {
    this.fromInt(0);
    if(b == null) b = 10;
    var cs = this.chunkSize(b);
    var d = Math.pow(b,cs), mi = false, j = 0, w = 0;
    for(var i = 0; i < s.length; ++i) {
      var x = intAt(s,i);
      if(x < 0) {
        if(s.charAt(i) == "-" && this.signum() == 0) mi = true;
        continue;
      }
      w = b*w+x;
      if(++j >= cs) {
        this.dMultiply(d);
        this.dAddOffset(w,0);
        j = 0;
        w = 0;
      }
    }
    if(j > 0) {
      this.dMultiply(Math.pow(b,j));
      this.dAddOffset(w,0);
    }
    if(mi) BigInteger.ZERO.subTo(this,this);
  }

  // (protected) return x s.t. r^x < DV
  function bnpChunkSize(r) { return Math.floor(Math.LN2*this.DB/Math.log(r)); }

  // (public) 0 if this == 0, 1 if this > 0
  function bnSigNum() {
    if(this.s < 0) return -1;
    else if(this.t <= 0 || (this.t == 1 && this[0] <= 0)) return 0;
    else return 1;
  }

  // (protected) this *= n, this >= 0, 1 < n < DV
  function bnpDMultiply(n) {
    this[this.t] = this.am(0,n-1,this,0,0,this.t);
    ++this.t;
    this.clamp();
  }

  // (protected) this += n << w words, this >= 0
  function bnpDAddOffset(n,w) {
    if(n == 0) return;
    while(this.t <= w) this[this.t++] = 0;
    this[w] += n;
    while(this[w] >= this.DV) {
      this[w] -= this.DV;
      if(++w >= this.t) this[this.t++] = 0;
      ++this[w];
    }
  }

  // (protected) convert to radix string
  function bnpToRadix(b) {
    if(b == null) b = 10;
    if(this.signum() == 0 || b < 2 || b > 36) return "0";
    var cs = this.chunkSize(b);
    var a = Math.pow(b,cs);
    var d = nbv(a), y = nbi(), z = nbi(), r = "";
    this.divRemTo(d,y,z);
    while(y.signum() > 0) {
      r = (a+z.intValue()).toString(b).substr(1) + r;
      y.divRemTo(d,y,z);
    }
    return z.intValue().toString(b) + r;
  }

  // (public) return value as integer
  function bnIntValue() {
    if(this.s < 0) {
      if(this.t == 1) return this[0]-this.DV;
      else if(this.t == 0) return -1;
    }
    else if(this.t == 1) return this[0];
    else if(this.t == 0) return 0;
    // assumes 16 < DB < 32
    return ((this[1]&((1<<(32-this.DB))-1))<<this.DB)|this[0];
  }

  // (protected) r = this + a
  function bnpAddTo(a,r) {
    var i = 0, c = 0, m = Math.min(a.t,this.t);
    while(i < m) {
      c += this[i]+a[i];
      r[i++] = c&this.DM;
      c >>= this.DB;
    }
    if(a.t < this.t) {
      c += a.s;
      while(i < this.t) {
        c += this[i];
        r[i++] = c&this.DM;
        c >>= this.DB;
      }
      c += this.s;
    }
    else {
      c += this.s;
      while(i < a.t) {
        c += a[i];
        r[i++] = c&this.DM;
        c >>= this.DB;
      }
      c += a.s;
    }
    r.s = (c<0)?-1:0;
    if(c > 0) r[i++] = c;
    else if(c < -1) r[i++] = this.DV+c;
    r.t = i;
    r.clamp();
  }

  BigInteger.prototype.fromRadix = bnpFromRadix;
  BigInteger.prototype.chunkSize = bnpChunkSize;
  BigInteger.prototype.signum = bnSigNum;
  BigInteger.prototype.dMultiply = bnpDMultiply;
  BigInteger.prototype.dAddOffset = bnpDAddOffset;
  BigInteger.prototype.toRadix = bnpToRadix;
  BigInteger.prototype.intValue = bnIntValue;
  BigInteger.prototype.addTo = bnpAddTo;

  //======= end jsbn =======

  // Emscripten wrapper
  var Wrapper = {
    abs: function(l, h) {
      var x = new goog.math.Long(l, h);
      var ret;
      if (x.isNegative()) {
        ret = x.negate();
      } else {
        ret = x;
      }
      HEAP32[tempDoublePtr>>2] = ret.low_;
      HEAP32[tempDoublePtr+4>>2] = ret.high_;
    },
    ensureTemps: function() {
      if (Wrapper.ensuredTemps) return;
      Wrapper.ensuredTemps = true;
      Wrapper.two32 = new BigInteger();
      Wrapper.two32.fromString('4294967296', 10);
      Wrapper.two64 = new BigInteger();
      Wrapper.two64.fromString('18446744073709551616', 10);
      Wrapper.temp1 = new BigInteger();
      Wrapper.temp2 = new BigInteger();
    },
    lh2bignum: function(l, h) {
      var a = new BigInteger();
      a.fromString(h.toString(), 10);
      var b = new BigInteger();
      a.multiplyTo(Wrapper.two32, b);
      var c = new BigInteger();
      c.fromString(l.toString(), 10);
      var d = new BigInteger();
      c.addTo(b, d);
      return d;
    },
    stringify: function(l, h, unsigned) {
      var ret = new goog.math.Long(l, h).toString();
      if (unsigned && ret[0] == '-') {
        // unsign slowly using jsbn bignums
        Wrapper.ensureTemps();
        var bignum = new BigInteger();
        bignum.fromString(ret, 10);
        ret = new BigInteger();
        Wrapper.two64.addTo(bignum, ret);
        ret = ret.toString(10);
      }
      return ret;
    },
    fromString: function(str, base, min, max, unsigned) {
      Wrapper.ensureTemps();
      var bignum = new BigInteger();
      bignum.fromString(str, base);
      var bigmin = new BigInteger();
      bigmin.fromString(min, 10);
      var bigmax = new BigInteger();
      bigmax.fromString(max, 10);
      if (unsigned && bignum.compareTo(BigInteger.ZERO) < 0) {
        var temp = new BigInteger();
        bignum.addTo(Wrapper.two64, temp);
        bignum = temp;
      }
      var error = false;
      if (bignum.compareTo(bigmin) < 0) {
        bignum = bigmin;
        error = true;
      } else if (bignum.compareTo(bigmax) > 0) {
        bignum = bigmax;
        error = true;
      }
      var ret = goog.math.Long.fromString(bignum.toString()); // min-max checks should have clamped this to a range goog.math.Long can handle well
      HEAP32[tempDoublePtr>>2] = ret.low_;
      HEAP32[tempDoublePtr+4>>2] = ret.high_;
      if (error) throw 'range error';
    }
  };
  return Wrapper;
})();

//======= end closure i64 code =======



// === Auto-generated postamble setup entry stuff ===

if (memoryInitializer) {
  if (ENVIRONMENT_IS_NODE || ENVIRONMENT_IS_SHELL) {
    var data = Module['readBinary'](memoryInitializer);
    HEAPU8.set(data, STATIC_BASE);
  } else {
    addRunDependency('memory initializer');
    Browser.asyncLoad(memoryInitializer, function(data) {
      HEAPU8.set(data, STATIC_BASE);
      removeRunDependency('memory initializer');
    }, function(data) {
      throw 'could not load memory initializer ' + memoryInitializer;
    });
  }
}

function ExitStatus(status) {
  this.name = "ExitStatus";
  this.message = "Program terminated with exit(" + status + ")";
  this.status = status;
};
ExitStatus.prototype = new Error();
ExitStatus.prototype.constructor = ExitStatus;

var initialStackTop;
var preloadStartTime = null;
var calledMain = false;

dependenciesFulfilled = function runCaller() {
  // If run has never been called, and we should call run (INVOKE_RUN is true, and Module.noInitialRun is not false)
  if (!Module['calledRun'] && shouldRunNow) run();
  if (!Module['calledRun']) dependenciesFulfilled = runCaller; // try this again later, after new deps are fulfilled
}

Module['callMain'] = Module.callMain = function callMain(args) {
  assert(runDependencies == 0, 'cannot call main when async dependencies remain! (listen on __ATMAIN__)');
  assert(__ATPRERUN__.length == 0, 'cannot call main when preRun functions remain to be called');

  args = args || [];

  if (ENVIRONMENT_IS_WEB && preloadStartTime !== null) {
    Module.printErr('preload time: ' + (Date.now() - preloadStartTime) + ' ms');
  }

  ensureInitRuntime();

  var argc = args.length+1;
  function pad() {
    for (var i = 0; i < 4-1; i++) {
      argv.push(0);
    }
  }
  var argv = [allocate(intArrayFromString("/bin/this.program"), 'i8', ALLOC_NORMAL) ];
  pad();
  for (var i = 0; i < argc-1; i = i + 1) {
    argv.push(allocate(intArrayFromString(args[i]), 'i8', ALLOC_NORMAL));
    pad();
  }
  argv.push(0);
  argv = allocate(argv, 'i32', ALLOC_NORMAL);

  initialStackTop = STACKTOP;

  try {

    var ret = Module['_main'](argc, argv, 0);


    // if we're not running an evented main loop, it's time to exit
    if (!Module['noExitRuntime']) {
      exit(ret);
    }
  }
  catch(e) {
    if (e instanceof ExitStatus) {
      // exit() throws this once it's done to make sure execution
      // has been stopped completely
      return;
    } else if (e == 'SimulateInfiniteLoop') {
      // running an evented main loop, don't immediately exit
      Module['noExitRuntime'] = true;
      return;
    } else {
      if (e && typeof e === 'object' && e.stack) Module.printErr('exception thrown: ' + [e, e.stack]);
      throw e;
    }
  } finally {
    calledMain = true;
  }
}




function run(args) {
  args = args || Module['arguments'];

  if (preloadStartTime === null) preloadStartTime = Date.now();

  if (runDependencies > 0) {
    Module.printErr('run() called, but dependencies remain, so not running');
    return;
  }

  preRun();

  if (runDependencies > 0) return; // a preRun added a dependency, run will be called later
  if (Module['calledRun']) return; // run may have just been called through dependencies being fulfilled just in this very frame

  function doRun() {
    if (Module['calledRun']) return; // run may have just been called while the async setStatus time below was happening
    Module['calledRun'] = true;

    ensureInitRuntime();

    preMain();

    if (Module['_main'] && shouldRunNow) {
      Module['callMain'](args);
    }

    postRun();
  }

  if (Module['setStatus']) {
    Module['setStatus']('Running...');
    setTimeout(function() {
      setTimeout(function() {
        Module['setStatus']('');
      }, 1);
      if (!ABORT) doRun();
    }, 1);
  } else {
    doRun();
  }
}
Module['run'] = Module.run = run;

function exit(status) {
  ABORT = true;
  EXITSTATUS = status;
  STACKTOP = initialStackTop;

  // exit the runtime
  exitRuntime();

  // TODO We should handle this differently based on environment.
  // In the browser, the best we can do is throw an exception
  // to halt execution, but in node we could process.exit and
  // I'd imagine SM shell would have something equivalent.
  // This would let us set a proper exit status (which
  // would be great for checking test exit statuses).
  // https://github.com/kripken/emscripten/issues/1371

  // throw an exception to halt the current execution
  throw new ExitStatus(status);
}
Module['exit'] = Module.exit = exit;

function abort(text) {
  if (text) {
    Module.print(text);
    Module.printErr(text);
  }

  ABORT = true;
  EXITSTATUS = 1;

  throw 'abort() at ' + stackTrace();
}
Module['abort'] = Module.abort = abort;

// {{PRE_RUN_ADDITIONS}}

if (Module['preInit']) {
  if (typeof Module['preInit'] == 'function') Module['preInit'] = [Module['preInit']];
  while (Module['preInit'].length > 0) {
    Module['preInit'].pop()();
  }
}

// shouldRunNow refers to calling main(), not run().
var shouldRunNow = true;
if (Module['noInitialRun']) {
  shouldRunNow = false;
}


run();

// {{POST_RUN_ADDITIONS}}






// {{MODULE_ADDITIONS}}







// _snowpack/pkg/common/index-34bfe0a8.js
function noop() {
}
var identity = (x) => x;
function run(fn) {
  return fn();
}
function blank_object() {
  return Object.create(null);
}
function run_all(fns) {
  fns.forEach(run);
}
function is_function(thing) {
  return typeof thing === "function";
}
function safe_not_equal(a, b) {
  return a != a ? b == b : a !== b || (a && typeof a === "object" || typeof a === "function");
}
function is_empty(obj) {
  return Object.keys(obj).length === 0;
}
function null_to_empty(value) {
  return value == null ? "" : value;
}
var is_client = typeof window !== "undefined";
var now = is_client ? () => window.performance.now() : () => Date.now();
var raf = is_client ? (cb) => requestAnimationFrame(cb) : noop;
var tasks = new Set();
function run_tasks(now2) {
  tasks.forEach((task) => {
    if (!task.c(now2)) {
      tasks.delete(task);
      task.f();
    }
  });
  if (tasks.size !== 0)
    raf(run_tasks);
}
function loop(callback) {
  let task;
  if (tasks.size === 0)
    raf(run_tasks);
  return {
    promise: new Promise((fulfill) => {
      tasks.add(task = {c: callback, f: fulfill});
    }),
    abort() {
      tasks.delete(task);
    }
  };
}
function append(target, node) {
  target.appendChild(node);
}
function insert(target, node, anchor) {
  target.insertBefore(node, anchor || null);
}
function detach(node) {
  node.parentNode.removeChild(node);
}
function destroy_each(iterations, detaching) {
  for (let i = 0; i < iterations.length; i += 1) {
    if (iterations[i])
      iterations[i].d(detaching);
  }
}
function element(name) {
  return document.createElement(name);
}
function svg_element(name) {
  return document.createElementNS("http://www.w3.org/2000/svg", name);
}
function text(data) {
  return document.createTextNode(data);
}
function space() {
  return text(" ");
}
function empty() {
  return text("");
}
function listen(node, event, handler, options) {
  node.addEventListener(event, handler, options);
  return () => node.removeEventListener(event, handler, options);
}
function attr(node, attribute, value) {
  if (value == null)
    node.removeAttribute(attribute);
  else if (node.getAttribute(attribute) !== value)
    node.setAttribute(attribute, value);
}
function children(element2) {
  return Array.from(element2.childNodes);
}
function set_data(text2, data) {
  data = "" + data;
  if (text2.wholeText !== data)
    text2.data = data;
}
function custom_event(type, detail) {
  const e = document.createEvent("CustomEvent");
  e.initCustomEvent(type, false, false, detail);
  return e;
}
var active_docs = new Set();
var active = 0;
function hash(str) {
  let hash2 = 5381;
  let i = str.length;
  while (i--)
    hash2 = (hash2 << 5) - hash2 ^ str.charCodeAt(i);
  return hash2 >>> 0;
}
function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
  const step = 16.666 / duration;
  let keyframes = "{\n";
  for (let p = 0; p <= 1; p += step) {
    const t = a + (b - a) * ease(p);
    keyframes += p * 100 + `%{${fn(t, 1 - t)}}
`;
  }
  const rule = keyframes + `100% {${fn(b, 1 - b)}}
}`;
  const name = `__svelte_${hash(rule)}_${uid}`;
  const doc = node.ownerDocument;
  active_docs.add(doc);
  const stylesheet = doc.__svelte_stylesheet || (doc.__svelte_stylesheet = doc.head.appendChild(element("style")).sheet);
  const current_rules = doc.__svelte_rules || (doc.__svelte_rules = {});
  if (!current_rules[name]) {
    current_rules[name] = true;
    stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
  }
  const animation = node.style.animation || "";
  node.style.animation = `${animation ? `${animation}, ` : ""}${name} ${duration}ms linear ${delay}ms 1 both`;
  active += 1;
  return name;
}
function delete_rule(node, name) {
  const previous = (node.style.animation || "").split(", ");
  const next = previous.filter(name ? (anim) => anim.indexOf(name) < 0 : (anim) => anim.indexOf("__svelte") === -1);
  const deleted = previous.length - next.length;
  if (deleted) {
    node.style.animation = next.join(", ");
    active -= deleted;
    if (!active)
      clear_rules();
  }
}
function clear_rules() {
  raf(() => {
    if (active)
      return;
    active_docs.forEach((doc) => {
      const stylesheet = doc.__svelte_stylesheet;
      let i = stylesheet.cssRules.length;
      while (i--)
        stylesheet.deleteRule(i);
      doc.__svelte_rules = {};
    });
    active_docs.clear();
  });
}
var current_component;
function set_current_component(component) {
  current_component = component;
}
function get_current_component() {
  if (!current_component)
    throw new Error("Function called outside component initialization");
  return current_component;
}
function createEventDispatcher() {
  const component = get_current_component();
  return (type, detail) => {
    const callbacks = component.$$.callbacks[type];
    if (callbacks) {
      const event = custom_event(type, detail);
      callbacks.slice().forEach((fn) => {
        fn.call(component, event);
      });
    }
  };
}
var dirty_components = [];
var binding_callbacks = [];
var render_callbacks = [];
var flush_callbacks = [];
var resolved_promise = Promise.resolve();
var update_scheduled = false;
function schedule_update() {
  if (!update_scheduled) {
    update_scheduled = true;
    resolved_promise.then(flush);
  }
}
function add_render_callback(fn) {
  render_callbacks.push(fn);
}
var flushing = false;
var seen_callbacks = new Set();
function flush() {
  if (flushing)
    return;
  flushing = true;
  do {
    for (let i = 0; i < dirty_components.length; i += 1) {
      const component = dirty_components[i];
      set_current_component(component);
      update(component.$$);
    }
    set_current_component(null);
    dirty_components.length = 0;
    while (binding_callbacks.length)
      binding_callbacks.pop()();
    for (let i = 0; i < render_callbacks.length; i += 1) {
      const callback = render_callbacks[i];
      if (!seen_callbacks.has(callback)) {
        seen_callbacks.add(callback);
        callback();
      }
    }
    render_callbacks.length = 0;
  } while (dirty_components.length);
  while (flush_callbacks.length) {
    flush_callbacks.pop()();
  }
  update_scheduled = false;
  flushing = false;
  seen_callbacks.clear();
}
function update($$) {
  if ($$.fragment !== null) {
    $$.update();
    run_all($$.before_update);
    const dirty = $$.dirty;
    $$.dirty = [-1];
    $$.fragment && $$.fragment.p($$.ctx, dirty);
    $$.after_update.forEach(add_render_callback);
  }
}
var promise;
function wait() {
  if (!promise) {
    promise = Promise.resolve();
    promise.then(() => {
      promise = null;
    });
  }
  return promise;
}
function dispatch(node, direction, kind) {
  node.dispatchEvent(custom_event(`${direction ? "intro" : "outro"}${kind}`));
}
var outroing = new Set();
var outros;
function group_outros() {
  outros = {
    r: 0,
    c: [],
    p: outros
  };
}
function check_outros() {
  if (!outros.r) {
    run_all(outros.c);
  }
  outros = outros.p;
}
function transition_in(block, local) {
  if (block && block.i) {
    outroing.delete(block);
    block.i(local);
  }
}
function transition_out(block, local, detach2, callback) {
  if (block && block.o) {
    if (outroing.has(block))
      return;
    outroing.add(block);
    outros.c.push(() => {
      outroing.delete(block);
      if (callback) {
        if (detach2)
          block.d(1);
        callback();
      }
    });
    block.o(local);
  }
}
var null_transition = {duration: 0};
function create_in_transition(node, fn, params) {
  let config = fn(node, params);
  let running = false;
  let animation_name;
  let task;
  let uid = 0;
  function cleanup() {
    if (animation_name)
      delete_rule(node, animation_name);
  }
  function go() {
    const {delay = 0, duration = 300, easing = identity, tick = noop, css} = config || null_transition;
    if (css)
      animation_name = create_rule(node, 0, 1, duration, delay, easing, css, uid++);
    tick(0, 1);
    const start_time = now() + delay;
    const end_time = start_time + duration;
    if (task)
      task.abort();
    running = true;
    add_render_callback(() => dispatch(node, true, "start"));
    task = loop((now2) => {
      if (running) {
        if (now2 >= end_time) {
          tick(1, 0);
          dispatch(node, true, "end");
          cleanup();
          return running = false;
        }
        if (now2 >= start_time) {
          const t = easing((now2 - start_time) / duration);
          tick(t, 1 - t);
        }
      }
      return running;
    });
  }
  let started = false;
  return {
    start() {
      if (started)
        return;
      delete_rule(node);
      if (is_function(config)) {
        config = config();
        wait().then(go);
      } else {
        go();
      }
    },
    invalidate() {
      started = false;
    },
    end() {
      if (running) {
        cleanup();
        running = false;
      }
    }
  };
}
function create_bidirectional_transition(node, fn, params, intro) {
  let config = fn(node, params);
  let t = intro ? 0 : 1;
  let running_program = null;
  let pending_program = null;
  let animation_name = null;
  function clear_animation() {
    if (animation_name)
      delete_rule(node, animation_name);
  }
  function init3(program, duration) {
    const d = program.b - t;
    duration *= Math.abs(d);
    return {
      a: t,
      b: program.b,
      d,
      duration,
      start: program.start,
      end: program.start + duration,
      group: program.group
    };
  }
  function go(b) {
    const {delay = 0, duration = 300, easing = identity, tick = noop, css} = config || null_transition;
    const program = {
      start: now() + delay,
      b
    };
    if (!b) {
      program.group = outros;
      outros.r += 1;
    }
    if (running_program || pending_program) {
      pending_program = program;
    } else {
      if (css) {
        clear_animation();
        animation_name = create_rule(node, t, b, duration, delay, easing, css);
      }
      if (b)
        tick(0, 1);
      running_program = init3(program, duration);
      add_render_callback(() => dispatch(node, b, "start"));
      loop((now2) => {
        if (pending_program && now2 > pending_program.start) {
          running_program = init3(pending_program, duration);
          pending_program = null;
          dispatch(node, running_program.b, "start");
          if (css) {
            clear_animation();
            animation_name = create_rule(node, t, running_program.b, running_program.duration, 0, easing, config.css);
          }
        }
        if (running_program) {
          if (now2 >= running_program.end) {
            tick(t = running_program.b, 1 - t);
            dispatch(node, running_program.b, "end");
            if (!pending_program) {
              if (running_program.b) {
                clear_animation();
              } else {
                if (!--running_program.group.r)
                  run_all(running_program.group.c);
              }
            }
            running_program = null;
          } else if (now2 >= running_program.start) {
            const p = now2 - running_program.start;
            t = running_program.a + running_program.d * easing(p / running_program.duration);
            tick(t, 1 - t);
          }
        }
        return !!(running_program || pending_program);
      });
    }
  }
  return {
    run(b) {
      if (is_function(config)) {
        wait().then(() => {
          config = config();
          go(b);
        });
      } else {
        go(b);
      }
    },
    end() {
      clear_animation();
      running_program = pending_program = null;
    }
  };
}
function create_component(block) {
  block && block.c();
}
function mount_component(component, target, anchor) {
  const {fragment, on_mount, on_destroy, after_update} = component.$$;
  fragment && fragment.m(target, anchor);
  add_render_callback(() => {
    const new_on_destroy = on_mount.map(run).filter(is_function);
    if (on_destroy) {
      on_destroy.push(...new_on_destroy);
    } else {
      run_all(new_on_destroy);
    }
    component.$$.on_mount = [];
  });
  after_update.forEach(add_render_callback);
}
function destroy_component(component, detaching) {
  const $$ = component.$$;
  if ($$.fragment !== null) {
    run_all($$.on_destroy);
    $$.fragment && $$.fragment.d(detaching);
    $$.on_destroy = $$.fragment = null;
    $$.ctx = [];
  }
}
function make_dirty(component, i) {
  if (component.$$.dirty[0] === -1) {
    dirty_components.push(component);
    schedule_update();
    component.$$.dirty.fill(0);
  }
  component.$$.dirty[i / 31 | 0] |= 1 << i % 31;
}
function init(component, options, instance4, create_fragment4, not_equal, props, dirty = [-1]) {
  const parent_component = current_component;
  set_current_component(component);
  const $$ = component.$$ = {
    fragment: null,
    ctx: null,
    props,
    update: noop,
    not_equal,
    bound: blank_object(),
    on_mount: [],
    on_destroy: [],
    before_update: [],
    after_update: [],
    context: new Map(parent_component ? parent_component.$$.context : []),
    callbacks: blank_object(),
    dirty,
    skip_bound: false
  };
  let ready = false;
  $$.ctx = instance4 ? instance4(component, options.props || {}, (i, ret, ...rest) => {
    const value = rest.length ? rest[0] : ret;
    if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
      if (!$$.skip_bound && $$.bound[i])
        $$.bound[i](value);
      if (ready)
        make_dirty(component, i);
    }
    return ret;
  }) : [];
  $$.update();
  ready = true;
  run_all($$.before_update);
  $$.fragment = create_fragment4 ? create_fragment4($$.ctx) : false;
  if (options.target) {
    if (options.hydrate) {
      const nodes = children(options.target);
      $$.fragment && $$.fragment.l(nodes);
      nodes.forEach(detach);
    } else {
      $$.fragment && $$.fragment.c();
    }
    if (options.intro)
      transition_in(component.$$.fragment);
    mount_component(component, options.target, options.anchor);
    flush();
  }
  set_current_component(parent_component);
}
var SvelteComponent = class {
  $destroy() {
    destroy_component(this, 1);
    this.$destroy = noop;
  }
  $on(type, callback) {
    const callbacks = this.$$.callbacks[type] || (this.$$.callbacks[type] = []);
    callbacks.push(callback);
    return () => {
      const index = callbacks.indexOf(callback);
      if (index !== -1)
        callbacks.splice(index, 1);
    };
  }
  $set($$props) {
    if (this.$$set && !is_empty($$props)) {
      this.$$.skip_bound = true;
      this.$$set($$props);
      this.$$.skip_bound = false;
    }
  }
};

// _snowpack/pkg/dc-extensions-sdk.js
var CONTEXT;
(function(CONTEXT2) {
  CONTEXT2["GET"] = "context-get";
})(CONTEXT || (CONTEXT = {}));
var CONTENT_ITEM;
(function(CONTENT_ITEM2) {
  CONTENT_ITEM2["GET"] = "content-item-get";
})(CONTENT_ITEM || (CONTENT_ITEM = {}));
var MEDIA_LINK;
(function(MEDIA_LINK2) {
  MEDIA_LINK2["IMAGE_GET"] = "media-image-get";
  MEDIA_LINK2["VIDEO_GET"] = "media-video-get";
})(MEDIA_LINK || (MEDIA_LINK = {}));
var CONTENT_LINK;
(function(CONTENT_LINK2) {
  CONTENT_LINK2["CONTENT_GET"] = "content-link-get";
})(CONTENT_LINK || (CONTENT_LINK = {}));
var CONTENT_REFERENCE;
(function(CONTENT_REFERENCE2) {
  CONTENT_REFERENCE2["CONTENT_REF_GET"] = "content-reference-get";
})(CONTENT_REFERENCE || (CONTENT_REFERENCE = {}));
var FIELD;
(function(FIELD2) {
  FIELD2["MODEL_GET"] = "field-model-get";
  FIELD2["MODEL_SET"] = "field-model-set";
  FIELD2["MODEL_RESET"] = "field-model-reset";
  FIELD2["MODEL_IS_VALID"] = "field-model-is-valid";
  FIELD2["MODEL_VALIDATE"] = "field-model-validate";
  FIELD2["SCHEMA_GET"] = "field-schema-get";
})(FIELD || (FIELD = {}));
var FORM;
(function(FORM2) {
  FORM2["READ_ONLY"] = "form-read-only-change";
  FORM2["GET_FORM_MODEL"] = "form-model-get";
})(FORM || (FORM = {}));
var FRAME;
(function(FRAME2) {
  FRAME2["HEIGHT_GET"] = "height-get";
  FRAME2["HEIGHT_SET"] = "height-set";
})(FRAME || (FRAME = {}));
var MediaLink = function() {
  function MediaLink2(connection) {
    this.connection = connection;
  }
  MediaLink2.prototype.getImage = function() {
    return this.connection.request(MEDIA_LINK.IMAGE_GET, null, {
      timeout: false
    });
  };
  MediaLink2.prototype.getImages = function(_a) {
    var max = (_a === void 0 ? {max: null} : _a).max;
    return this.connection.request(MEDIA_LINK.IMAGE_GET, {max}, {timeout: false});
  };
  MediaLink2.prototype.getVideo = function() {
    return this.connection.request(MEDIA_LINK.VIDEO_GET, null, {
      timeout: false
    });
  };
  MediaLink2.prototype.getVideos = function(_a) {
    var max = (_a === void 0 ? {max: null} : _a).max;
    return this.connection.request(MEDIA_LINK.VIDEO_GET, {max}, {
      timeout: false
    });
  };
  return MediaLink2;
}();
/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */
var __assign = function() {
  __assign = Object.assign || function __assign2(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
      s = arguments[i];
      for (var p in s)
        if (Object.prototype.hasOwnProperty.call(s, p))
          t[p] = s[p];
    }
    return t;
  };
  return __assign.apply(this, arguments);
};
function __awaiter(thisArg, _arguments, P, generator) {
  return new (P || (P = Promise))(function(resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }
    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }
    function step(result) {
      result.done ? resolve(result.value) : new P(function(resolve2) {
        resolve2(result.value);
      }).then(fulfilled, rejected);
    }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
}
function __generator(thisArg, body) {
  var _ = {label: 0, sent: function() {
    if (t[0] & 1)
      throw t[1];
    return t[1];
  }, trys: [], ops: []}, f, y, t, g;
  return g = {next: verb(0), throw: verb(1), return: verb(2)}, typeof Symbol === "function" && (g[Symbol.iterator] = function() {
    return this;
  }), g;
  function verb(n) {
    return function(v) {
      return step([n, v]);
    };
  }
  function step(op) {
    if (f)
      throw new TypeError("Generator is already executing.");
    while (_)
      try {
        if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done)
          return t;
        if (y = 0, t)
          op = [op[0] & 2, t.value];
        switch (op[0]) {
          case 0:
          case 1:
            t = op;
            break;
          case 4:
            _.label++;
            return {value: op[1], done: false};
          case 5:
            _.label++;
            y = op[1];
            op = [0];
            continue;
          case 7:
            op = _.ops.pop();
            _.trys.pop();
            continue;
          default:
            if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
              _ = 0;
              continue;
            }
            if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
              _.label = op[1];
              break;
            }
            if (op[0] === 6 && _.label < t[1]) {
              _.label = t[1];
              t = op;
              break;
            }
            if (t && _.label < t[2]) {
              _.label = t[2];
              _.ops.push(op);
              break;
            }
            if (t[2])
              _.ops.pop();
            _.trys.pop();
            continue;
        }
        op = body.call(thisArg, _);
      } catch (e) {
        op = [6, e];
        y = 0;
      } finally {
        f = t = 0;
      }
    if (op[0] & 5)
      throw op[1];
    return {value: op[0] ? op[1] : void 0, done: true};
  }
}
var ERRORS_INIT;
(function(ERRORS_INIT2) {
  ERRORS_INIT2["CONTEXT"] = "Failed to fetch context for UI Extension";
  ERRORS_INIT2["CONNTECTION_TIMEOUT"] = "Failed to establish connection to DC Application";
})(ERRORS_INIT || (ERRORS_INIT = {}));
var ERRORS_CONTENT_ITEM;
(function(ERRORS_CONTENT_ITEM2) {
  ERRORS_CONTENT_ITEM2["NO_IDS"] = "Please provide content type ids";
})(ERRORS_CONTENT_ITEM || (ERRORS_CONTENT_ITEM = {}));
var ERRORS_FRAME;
(function(ERRORS_FRAME2) {
  ERRORS_FRAME2["SET_HEIGHT_NUMBER"] = "setHeight() only accepts an optional number argument";
})(ERRORS_FRAME || (ERRORS_FRAME = {}));
var FORM$1;
(function(FORM2) {
  FORM2["NO_MODEL"] = "Unable to retrieve form model as form context does not have an active model.";
})(FORM$1 || (FORM$1 = {}));
var ContentLink = function() {
  function ContentLink2(connection) {
    this.connection = connection;
  }
  ContentLink2.prototype.getMultiple = function(contentTypeIds, options) {
    if (options === void 0) {
      options = {max: null};
    }
    if (options.max === void 0) {
      options.max = null;
    }
    return this.fetchLinks(contentTypeIds, options.max);
  };
  ContentLink2.prototype.get = function(contentTypeIds) {
    return __awaiter(this, void 0, void 0, function() {
      return __generator(this, function(_a) {
        return [2, this.fetchLinks(contentTypeIds)];
      });
    });
  };
  ContentLink2.prototype.fetchLinks = function(contentTypeIds, max) {
    return __awaiter(this, void 0, void 0, function() {
      var response;
      return __generator(this, function(_a) {
        if (!contentTypeIds || !Array.isArray(contentTypeIds) || !contentTypeIds.length) {
          throw new Error(ERRORS_CONTENT_ITEM.NO_IDS);
        }
        response = __assign({contentTypeIds}, max !== void 0 && {max} || {});
        return [2, this.connection.request(CONTENT_LINK.CONTENT_GET, response, {
          timeout: false
        })];
      });
    });
  };
  return ContentLink2;
}();
var ContentItem = function() {
  function ContentItem2(connection) {
    this.connection = connection;
  }
  ContentItem2.prototype.getCurrent = function() {
    return __awaiter(this, void 0, void 0, function() {
      var contentItem;
      return __generator(this, function(_a) {
        switch (_a.label) {
          case 0:
            return [4, this.connection.request(CONTENT_ITEM.GET)];
          case 1:
            contentItem = _a.sent();
            return [2, contentItem];
        }
      });
    });
  };
  return ContentItem2;
}();
var Frame = function() {
  function Frame2(connection, win) {
    var _this = this;
    if (win === void 0) {
      win = window;
    }
    this.connection = connection;
    this.win = win;
    this.isAutoResizing = false;
    this.observer = new MutationObserver(function() {
      return _this.updateHeight();
    });
    var frameLoaded = new Promise(function(resolve) {
      if (win.document.readyState === "complete") {
        resolve(true);
      }
      win.addEventListener("load", function() {
        resolve(true);
      });
    });
    this.connection.on(FRAME.HEIGHT_GET, function(_payload, resolve) {
      return __awaiter(_this, void 0, void 0, function() {
        return __generator(this, function(_a) {
          switch (_a.label) {
            case 0:
              return [4, frameLoaded];
            case 1:
              _a.sent();
              resolve(this.getHeight());
              return [2];
          }
        });
      });
    });
    this.updateHeightHandler = this.updateHeight.bind(this);
  }
  Frame2.prototype.getHeight = function() {
    var documentElement = this.win.document.documentElement;
    if (documentElement) {
      var height = documentElement.getBoundingClientRect().height;
      return height;
    }
    return 0;
  };
  Frame2.prototype.setHeight = function(height) {
    if (height !== void 0 && typeof height !== "number") {
      throw new TypeError(ERRORS_FRAME.SET_HEIGHT_NUMBER);
    }
    var h = height === void 0 ? this.getHeight() : height;
    this.previousHeight = height;
    this.connection.emit(FRAME.HEIGHT_SET, h < 0 ? 0 : h);
  };
  Frame2.prototype.startAutoResizer = function() {
    if (this.isAutoResizing) {
      return;
    }
    this.isAutoResizing = true;
    this.observer.observe(this.win.document.body, {
      attributes: true,
      childList: true,
      subtree: true,
      characterData: true
    });
    this.win.addEventListener("resize", this.updateHeightHandler);
  };
  Frame2.prototype.stopAutoResizer = function() {
    if (!this.isAutoResizing) {
      return;
    }
    this.isAutoResizing = false;
    this.observer.disconnect();
    this.win.removeEventListener("resize", this.updateHeightHandler);
  };
  Frame2.prototype.updateHeight = function() {
    var height = this.getHeight();
    if (height === this.previousHeight) {
      return;
    }
    this.setHeight(height);
  };
  return Frame2;
}();
var Field = function() {
  function Field2(connection, schema) {
    this.connection = connection;
    this.schema = schema;
  }
  Field2.prototype.getValue = function() {
    return this.connection.request(FIELD.MODEL_GET);
  };
  Field2.prototype.setValue = function(value) {
    return __awaiter(this, void 0, void 0, function() {
      var errors;
      return __generator(this, function(_a) {
        switch (_a.label) {
          case 0:
            return [4, this.connection.request(FIELD.MODEL_SET, value)];
          case 1:
            errors = _a.sent();
            if (errors && errors.length) {
              return [2, Promise.reject(errors)];
            }
            return [2];
        }
      });
    });
  };
  Field2.prototype.isValid = function(value) {
    return __awaiter(this, void 0, void 0, function() {
      var isValid;
      return __generator(this, function(_a) {
        switch (_a.label) {
          case 0:
            return [4, this.connection.request(FIELD.MODEL_IS_VALID, value)];
          case 1:
            isValid = _a.sent();
            return [2, isValid];
        }
      });
    });
  };
  Field2.prototype.validate = function(value) {
    return __awaiter(this, void 0, void 0, function() {
      var errors;
      return __generator(this, function(_a) {
        switch (_a.label) {
          case 0:
            return [4, this.connection.request(FIELD.MODEL_VALIDATE, value)];
          case 1:
            errors = _a.sent();
            return [2, errors && errors.length ? errors : void 0];
        }
      });
    });
  };
  Field2.prototype.reset = function() {
    return this.connection.request(FIELD.MODEL_RESET);
  };
  return Field2;
}();
var commonjsGlobal = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : {};
(function(global2) {
  var checkIfIteratorIsSupported = function() {
    try {
      return !!Symbol.iterator;
    } catch (error) {
      return false;
    }
  };
  var iteratorSupported = checkIfIteratorIsSupported();
  var createIterator = function(items) {
    var iterator = {
      next: function() {
        var value = items.shift();
        return {done: value === void 0, value};
      }
    };
    if (iteratorSupported) {
      iterator[Symbol.iterator] = function() {
        return iterator;
      };
    }
    return iterator;
  };
  var serializeParam = function(value) {
    return encodeURIComponent(value).replace(/%20/g, "+");
  };
  var deserializeParam = function(value) {
    return decodeURIComponent(String(value).replace(/\+/g, " "));
  };
  var polyfillURLSearchParams = function() {
    var URLSearchParams = function(searchString) {
      Object.defineProperty(this, "_entries", {writable: true, value: {}});
      var typeofSearchString = typeof searchString;
      if (typeofSearchString === "undefined")
        ;
      else if (typeofSearchString === "string") {
        if (searchString !== "") {
          this._fromString(searchString);
        }
      } else if (searchString instanceof URLSearchParams) {
        var _this = this;
        searchString.forEach(function(value, name) {
          _this.append(name, value);
        });
      } else if (searchString !== null && typeofSearchString === "object") {
        if (Object.prototype.toString.call(searchString) === "[object Array]") {
          for (var i = 0; i < searchString.length; i++) {
            var entry = searchString[i];
            if (Object.prototype.toString.call(entry) === "[object Array]" || entry.length !== 2) {
              this.append(entry[0], entry[1]);
            } else {
              throw new TypeError("Expected [string, any] as entry at index " + i + " of URLSearchParams's input");
            }
          }
        } else {
          for (var key in searchString) {
            if (searchString.hasOwnProperty(key)) {
              this.append(key, searchString[key]);
            }
          }
        }
      } else {
        throw new TypeError("Unsupported input's type for URLSearchParams");
      }
    };
    var proto2 = URLSearchParams.prototype;
    proto2.append = function(name, value) {
      if (name in this._entries) {
        this._entries[name].push(String(value));
      } else {
        this._entries[name] = [String(value)];
      }
    };
    proto2.delete = function(name) {
      delete this._entries[name];
    };
    proto2.get = function(name) {
      return name in this._entries ? this._entries[name][0] : null;
    };
    proto2.getAll = function(name) {
      return name in this._entries ? this._entries[name].slice(0) : [];
    };
    proto2.has = function(name) {
      return name in this._entries;
    };
    proto2.set = function(name, value) {
      this._entries[name] = [String(value)];
    };
    proto2.forEach = function(callback, thisArg) {
      var entries;
      for (var name in this._entries) {
        if (this._entries.hasOwnProperty(name)) {
          entries = this._entries[name];
          for (var i = 0; i < entries.length; i++) {
            callback.call(thisArg, entries[i], name, this);
          }
        }
      }
    };
    proto2.keys = function() {
      var items = [];
      this.forEach(function(value, name) {
        items.push(name);
      });
      return createIterator(items);
    };
    proto2.values = function() {
      var items = [];
      this.forEach(function(value) {
        items.push(value);
      });
      return createIterator(items);
    };
    proto2.entries = function() {
      var items = [];
      this.forEach(function(value, name) {
        items.push([name, value]);
      });
      return createIterator(items);
    };
    if (iteratorSupported) {
      proto2[Symbol.iterator] = proto2.entries;
    }
    proto2.toString = function() {
      var searchArray = [];
      this.forEach(function(value, name) {
        searchArray.push(serializeParam(name) + "=" + serializeParam(value));
      });
      return searchArray.join("&");
    };
    global2.URLSearchParams = URLSearchParams;
  };
  var checkIfURLSearchParamsSupported = function() {
    try {
      var URLSearchParams = global2.URLSearchParams;
      return new URLSearchParams("?a=1").toString() === "a=1" && typeof URLSearchParams.prototype.set === "function";
    } catch (e) {
      return false;
    }
  };
  if (!checkIfURLSearchParamsSupported()) {
    polyfillURLSearchParams();
  }
  var proto = global2.URLSearchParams.prototype;
  if (typeof proto.sort !== "function") {
    proto.sort = function() {
      var _this = this;
      var items = [];
      this.forEach(function(value, name) {
        items.push([name, value]);
        if (!_this._entries) {
          _this.delete(name);
        }
      });
      items.sort(function(a, b) {
        if (a[0] < b[0]) {
          return -1;
        } else if (a[0] > b[0]) {
          return 1;
        } else {
          return 0;
        }
      });
      if (_this._entries) {
        _this._entries = {};
      }
      for (var i = 0; i < items.length; i++) {
        this.append(items[i][0], items[i][1]);
      }
    };
  }
  if (typeof proto._fromString !== "function") {
    Object.defineProperty(proto, "_fromString", {
      enumerable: false,
      configurable: false,
      writable: false,
      value: function(searchString) {
        if (this._entries) {
          this._entries = {};
        } else {
          var keys = [];
          this.forEach(function(value, name) {
            keys.push(name);
          });
          for (var i = 0; i < keys.length; i++) {
            this.delete(keys[i]);
          }
        }
        searchString = searchString.replace(/^\?/, "");
        var attributes = searchString.split("&");
        var attribute;
        for (var i = 0; i < attributes.length; i++) {
          attribute = attributes[i].split("=");
          this.append(deserializeParam(attribute[0]), attribute.length > 1 ? deserializeParam(attribute[1]) : "");
        }
      }
    });
  }
})(typeof commonjsGlobal !== "undefined" ? commonjsGlobal : typeof window !== "undefined" ? window : typeof self !== "undefined" ? self : commonjsGlobal);
(function(global2) {
  var checkIfURLIsSupported = function() {
    try {
      var u = new global2.URL("b", "http://a");
      u.pathname = "c%20d";
      return u.href === "http://a/c%20d" && u.searchParams;
    } catch (e) {
      return false;
    }
  };
  var polyfillURL = function() {
    var _URL = global2.URL;
    var URL2 = function(url, base) {
      if (typeof url !== "string")
        url = String(url);
      var doc = document, baseElement;
      if (base && (global2.location === void 0 || base !== global2.location.href)) {
        doc = document.implementation.createHTMLDocument("");
        baseElement = doc.createElement("base");
        baseElement.href = base;
        doc.head.appendChild(baseElement);
        try {
          if (baseElement.href.indexOf(base) !== 0)
            throw new Error(baseElement.href);
        } catch (err) {
          throw new Error("URL unable to set base " + base + " due to " + err);
        }
      }
      var anchorElement = doc.createElement("a");
      anchorElement.href = url;
      if (baseElement) {
        doc.body.appendChild(anchorElement);
        anchorElement.href = anchorElement.href;
      }
      if (anchorElement.protocol === ":" || !/:/.test(anchorElement.href)) {
        throw new TypeError("Invalid URL");
      }
      Object.defineProperty(this, "_anchorElement", {
        value: anchorElement
      });
      var searchParams = new global2.URLSearchParams(this.search);
      var enableSearchUpdate = true;
      var enableSearchParamsUpdate = true;
      var _this = this;
      ["append", "delete", "set"].forEach(function(methodName) {
        var method = searchParams[methodName];
        searchParams[methodName] = function() {
          method.apply(searchParams, arguments);
          if (enableSearchUpdate) {
            enableSearchParamsUpdate = false;
            _this.search = searchParams.toString();
            enableSearchParamsUpdate = true;
          }
        };
      });
      Object.defineProperty(this, "searchParams", {
        value: searchParams,
        enumerable: true
      });
      var search = void 0;
      Object.defineProperty(this, "_updateSearchParams", {
        enumerable: false,
        configurable: false,
        writable: false,
        value: function() {
          if (this.search !== search) {
            search = this.search;
            if (enableSearchParamsUpdate) {
              enableSearchUpdate = false;
              this.searchParams._fromString(this.search);
              enableSearchUpdate = true;
            }
          }
        }
      });
    };
    var proto = URL2.prototype;
    var linkURLWithAnchorAttribute = function(attributeName) {
      Object.defineProperty(proto, attributeName, {
        get: function() {
          return this._anchorElement[attributeName];
        },
        set: function(value) {
          this._anchorElement[attributeName] = value;
        },
        enumerable: true
      });
    };
    ["hash", "host", "hostname", "port", "protocol"].forEach(function(attributeName) {
      linkURLWithAnchorAttribute(attributeName);
    });
    Object.defineProperty(proto, "search", {
      get: function() {
        return this._anchorElement["search"];
      },
      set: function(value) {
        this._anchorElement["search"] = value;
        this._updateSearchParams();
      },
      enumerable: true
    });
    Object.defineProperties(proto, {
      toString: {
        get: function() {
          var _this = this;
          return function() {
            return _this.href;
          };
        }
      },
      href: {
        get: function() {
          return this._anchorElement.href.replace(/\?$/, "");
        },
        set: function(value) {
          this._anchorElement.href = value;
          this._updateSearchParams();
        },
        enumerable: true
      },
      pathname: {
        get: function() {
          return this._anchorElement.pathname.replace(/(^\/?)/, "/");
        },
        set: function(value) {
          this._anchorElement.pathname = value;
        },
        enumerable: true
      },
      origin: {
        get: function() {
          var expectedPort = {"http:": 80, "https:": 443, "ftp:": 21}[this._anchorElement.protocol];
          var addPortToOrigin = this._anchorElement.port != expectedPort && this._anchorElement.port !== "";
          return this._anchorElement.protocol + "//" + this._anchorElement.hostname + (addPortToOrigin ? ":" + this._anchorElement.port : "");
        },
        enumerable: true
      },
      password: {
        get: function() {
          return "";
        },
        set: function(value) {
        },
        enumerable: true
      },
      username: {
        get: function() {
          return "";
        },
        set: function(value) {
        },
        enumerable: true
      }
    });
    URL2.createObjectURL = function(blob) {
      return _URL.createObjectURL.apply(_URL, arguments);
    };
    URL2.revokeObjectURL = function(url) {
      return _URL.revokeObjectURL.apply(_URL, arguments);
    };
    global2.URL = URL2;
  };
  if (!checkIfURLIsSupported()) {
    polyfillURL();
  }
  if (global2.location !== void 0 && !("origin" in global2.location)) {
    var getOrigin = function() {
      return global2.location.protocol + "//" + global2.location.hostname + (global2.location.port ? ":" + global2.location.port : "");
    };
    try {
      Object.defineProperty(global2.location, "origin", {
        get: getOrigin,
        enumerable: true
      });
    } catch (e) {
      setInterval(function() {
        global2.location.origin = getOrigin();
      }, 100);
    }
  }
})(typeof commonjsGlobal !== "undefined" ? commonjsGlobal : typeof window !== "undefined" ? window : typeof self !== "undefined" ? self : commonjsGlobal);
/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */
var extendStatics$1 = function(d, b) {
  extendStatics$1 = Object.setPrototypeOf || {__proto__: []} instanceof Array && function(d2, b2) {
    d2.__proto__ = b2;
  } || function(d2, b2) {
    for (var p in b2)
      if (b2.hasOwnProperty(p))
        d2[p] = b2[p];
  };
  return extendStatics$1(d, b);
};
function __extends$1(d, b) {
  extendStatics$1(d, b);
  function __() {
    this.constructor = d;
  }
  d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}
var __assign$1 = function() {
  __assign$1 = Object.assign || function __assign2(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
      s = arguments[i];
      for (var p in s)
        if (Object.prototype.hasOwnProperty.call(s, p))
          t[p] = s[p];
    }
    return t;
  };
  return __assign$1.apply(this, arguments);
};
var MESSAGE_TYPE;
(function(MESSAGE_TYPE2) {
  MESSAGE_TYPE2["SUBSCRIBE"] = "subscribe";
  MESSAGE_TYPE2["EMIT"] = "emit";
  MESSAGE_TYPE2["REQUEST"] = "request";
  MESSAGE_TYPE2["RESOLVE"] = "resolve";
  MESSAGE_TYPE2["REJECT"] = "reject";
})(MESSAGE_TYPE || (MESSAGE_TYPE = {}));
var MC_EVENTS;
(function(MC_EVENTS2) {
  MC_EVENTS2["HANDSHAKE"] = "mc-handshake";
  MC_EVENTS2["CONNECTED"] = "mc-connected";
  MC_EVENTS2["DISCONNECTED"] = "mc-disconnected";
  MC_EVENTS2["CONNECTION_TIMEOUT"] = "mc-connection-timeout";
})(MC_EVENTS || (MC_EVENTS = {}));
var Connection = function() {
  function Connection2(options) {
    if (options === void 0) {
      options = {};
    }
    this.connected = false;
    this.backlog = [];
    this.promises = {};
    this.emitters = {};
    this.connectionStep = "";
    this.defaultOptions = {
      window,
      connectionTimeout: 2e3,
      timeout: 200,
      debug: false,
      onload: true,
      clientInitiates: false,
      targetOrigin: "*"
    };
    this.options = __assign$1({}, this.defaultOptions, options);
  }
  Connection2.prototype.emit = function(event, payload) {
    this.message({
      type: MESSAGE_TYPE.EMIT,
      event,
      payload
    });
    return this;
  };
  Connection2.prototype.on = function(event, callback) {
    if (this.emitters[event] && Array.isArray(this.emitters[event])) {
      this.emitters[event].push(callback);
    } else {
      this.emitters[event] = [callback];
    }
    return this;
  };
  Connection2.prototype.request = function(event, payload, options) {
    var _this = this;
    if (options === void 0) {
      options = {};
    }
    return new Promise(function(resolve, reject) {
      var uuid = _this.uuidv4();
      var timeout = _this.getRequestTimeout(options.timeout);
      var ct;
      if (timeout !== false && typeof timeout === "number") {
        ct = window.setTimeout(function() {
          return reject("timeout");
        }, timeout);
      }
      _this.promises[uuid] = {
        resolve: function(resolvedData) {
          resolve(resolvedData);
          if (ct) {
            clearTimeout(ct);
          }
        },
        reject: function(error) {
          reject(error);
          if (ct) {
            clearTimeout(ct);
          }
        }
      };
      _this.message({
        type: MESSAGE_TYPE.REQUEST,
        event,
        id: uuid,
        payload
      });
    });
  };
  Connection2.prototype.close = function() {
    if (this.connected) {
      this.port.close();
      this.connected = false;
    }
    if (this.messageListener) {
      this.options.window.removeEventListener("message", this.messageListener, false);
    }
  };
  Connection2.prototype.setConnectionTimeout = function() {
    var _this = this;
    clearTimeout(this.connectionTimeout);
    if (this.options.connectionTimeout !== false) {
      this.connectionTimeout = window.setTimeout(function() {
        if (_this.messageListener) {
          _this.options.window.removeEventListener("message", _this.messageListener, false);
        }
        _this.handleMessage({
          type: MESSAGE_TYPE.EMIT,
          event: MC_EVENTS.CONNECTION_TIMEOUT,
          payload: {message: "Connection timed out while " + _this.connectionStep}
        });
      }, Number(this.options.connectionTimeout));
    }
  };
  Connection2.prototype.uuidv4 = function() {
    var crypt = window.crypto || window.msCrypto;
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, function(c) {
      return (c ^ crypt.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16);
    });
  };
  Connection2.prototype.clearConnectionTimeout = function() {
    clearTimeout(this.connectionTimeout);
  };
  Connection2.prototype.initPortEvents = function() {
    var _this = this;
    this.port.onmessage = function(message) {
      _this.handleMessage(message.data);
    };
    this.port.onmessageerror = function(error) {
      _this.handleError(error);
    };
  };
  Connection2.prototype.finishInit = function() {
    this.connected = true;
    this.clearConnectionTimeout();
    if (this.options.debug) {
      console.log("Finished connection on " + (this.isClient() ? "client" : "server"));
    }
    this.emit(MC_EVENTS.CONNECTED);
    this.completeBacklog();
  };
  Connection2.prototype.completeBacklog = function() {
    var _this = this;
    this.backlog.forEach(function(message) {
      _this.portMessage(message);
    });
    this.backlog = [];
  };
  Connection2.prototype.handleError = function(error) {
    if (this.options.debug) {
      console.error(error);
    }
  };
  Connection2.prototype.handleMessage = function(message) {
    var _this = this;
    if (this.options.debug) {
      console.log("handle by " + (this.isClient() ? "client" : "server") + " - [" + message.type + '] "' + message.event + '", payload: ', message.payload);
    }
    switch (message.type) {
      case MESSAGE_TYPE.EMIT:
        if (!this.emitters[message.event] || !Array.isArray(this.emitters[message.event])) {
          return;
        }
        this.emitters[message.event].forEach(function(cb) {
          return cb(message.payload);
        });
        break;
      case MESSAGE_TYPE.REQUEST:
        if (!this.emitters[message.event] || !Array.isArray(this.emitters[message.event])) {
          return;
        }
        this.emitters[message.event].forEach(function(cb) {
          return cb(message.payload, function(payload) {
            _this.message({
              id: message.id,
              type: MESSAGE_TYPE.RESOLVE,
              event: message.event,
              payload
            });
          }, function(payload) {
            _this.message({
              id: message.id,
              type: MESSAGE_TYPE.REJECT,
              event: message.event,
              payload
            });
          });
        });
        break;
      case MESSAGE_TYPE.RESOLVE:
        if (!this.promises[message.id]) {
          return;
        }
        this.promises[message.id].resolve(message.payload);
        delete this.promises[message.id];
        break;
      case MESSAGE_TYPE.REJECT:
        if (!this.promises[message.id]) {
          return;
        }
        this.promises[message.id].reject(message.payload);
        delete this.promises[message.id];
        break;
    }
  };
  Connection2.prototype.getRequestTimeout = function(timeout) {
    if (typeof timeout === "number" && timeout >= 0) {
      return timeout;
    } else if (typeof timeout === "number") {
      return 0;
    } else if (timeout === true) {
      return this.options.timeout;
    } else if (timeout === false) {
      return false;
    } else {
      return this.options.timeout;
    }
  };
  Connection2.prototype.isClient = function() {
    return false;
  };
  Connection2.prototype.message = function(message) {
    var force = false;
    if (message.event === MC_EVENTS.HANDSHAKE || message.event === MC_EVENTS.CONNECTED || message.event === MC_EVENTS.DISCONNECTED) {
      force = true;
    }
    if (!this.connected && !force) {
      this.backlog.push(message);
    } else if (this.port) {
      this.portMessage(message);
    }
  };
  Connection2.prototype.portMessage = function(message) {
    if (this.options.debug) {
      console.log("send from " + (this.isClient() ? "client" : "server") + " - [" + message.type + '] "' + message.event + '", payload: ', message.payload);
    }
    this.port.postMessage(message);
  };
  return Connection2;
}();
var CONNECTION_STEPS;
(function(CONNECTION_STEPS2) {
  CONNECTION_STEPS2["CONNECTION"] = "waiting for connection.";
  CONNECTION_STEPS2["IFRAME_LOADING"] = "waiting for iframe to load.";
  CONNECTION_STEPS2["INITIATION_FROM_CLIENT"] = "waiting for initiation from client.";
})(CONNECTION_STEPS || (CONNECTION_STEPS = {}));
(function(_super) {
  __extends$1(ServerConnection, _super);
  function ServerConnection(frame, options) {
    if (options === void 0) {
      options = {};
    }
    var _this = _super.call(this, options) || this;
    _this.frame = frame;
    _this.connectionStep = CONNECTION_STEPS.CONNECTION;
    if (_this.options.onload) {
      _this.setupLoadInit();
    }
    if (_this.options.clientInitiates) {
      _this.setupClientInit();
    }
    _this.setConnectionTimeout();
    _this.on(MC_EVENTS.DISCONNECTED, function() {
      return _this.close();
    });
    return _this;
  }
  ServerConnection.prototype.clientInitiation = function(e) {
    if (e.data === this.id) {
      this.connectionStep = CONNECTION_STEPS.CONNECTION;
      this.setConnectionTimeout();
      this.options.window.removeEventListener("message", this.messageListener, false);
      if (this.options.debug) {
        console.log("Server: Client triggered initiation");
      }
      this.init();
    }
  };
  ServerConnection.prototype.setupLoadInit = function() {
    var _this = this;
    this.connectionStep = CONNECTION_STEPS.IFRAME_LOADING;
    this.frame.addEventListener("load", function() {
      _this.connectionStep = _this.options.clientInitiates ? CONNECTION_STEPS.INITIATION_FROM_CLIENT : CONNECTION_STEPS.CONNECTION;
      _this.setConnectionTimeout();
      _this.init();
    });
  };
  ServerConnection.prototype.setupClientInit = function() {
    var _this = this;
    this.connectionStep = CONNECTION_STEPS.INITIATION_FROM_CLIENT;
    this.id = this.uuidv4();
    var url = new URL(this.frame.src);
    url.searchParams.set("mc-name", this.id);
    this.frame.src = url.toString();
    this.messageListener = function(e) {
      return _this.clientInitiation(e);
    };
    this.options.window.addEventListener("message", this.messageListener);
  };
  ServerConnection.prototype.init = function() {
    if (!this.frame.contentWindow || !this.frame.src || this.connected) {
      return false;
    }
    this.setupChannel();
    this.initPortEvents();
    this.listenForHandshake();
    this.sendPortToClient(this.frame.contentWindow);
  };
  ServerConnection.prototype.sendPortToClient = function(client) {
    client.postMessage(null, this.options.targetOrigin ? this.options.targetOrigin : "*", [
      this.channel.port2
    ]);
  };
  ServerConnection.prototype.listenForHandshake = function() {
    var _this = this;
    this.on(MC_EVENTS.HANDSHAKE, function(payload, resolve) {
      resolve(payload);
      _this.finishInit();
    });
  };
  ServerConnection.prototype.setupChannel = function() {
    this.channel = new MessageChannel();
    this.port = this.channel.port1;
  };
  return ServerConnection;
})(Connection);
var CONNECTION_STEPS$1;
(function(CONNECTION_STEPS2) {
  CONNECTION_STEPS2["CONNECTION"] = "waiting for connection.";
  CONNECTION_STEPS2["HANDSHAKE"] = "waiting for handshake.";
})(CONNECTION_STEPS$1 || (CONNECTION_STEPS$1 = {}));
var ClientConnection = function(_super) {
  __extends$1(ClientConnection2, _super);
  function ClientConnection2(options) {
    if (options === void 0) {
      options = {};
    }
    var _this = _super.call(this, options) || this;
    _this.messageListener = function(e) {
      return _this.messageHandler(e);
    };
    _this.options.window.addEventListener("message", _this.messageListener);
    if (_this.options.connectionTimeout !== false) {
      _this.connectionStep = CONNECTION_STEPS$1.CONNECTION;
      _this.setConnectionTimeout();
    }
    return _this;
  }
  ClientConnection2.prototype.init = function() {
    var url = new URL(this.options.window.location.toString());
    this.id = url.searchParams.get("mc-name");
    if (this.options.debug) {
      console.log("Client: sent postMessage value:", this.id);
    }
    this.options.window.parent.postMessage(this.id, this.options.targetOrigin);
  };
  ClientConnection2.prototype.messageHandler = function(e) {
    if (e.ports[0]) {
      this.port = e.ports[0];
      this.initPortEvents();
      this.listenForHandshake();
      this.options.window.removeEventListener("message", this.messageListener);
    }
  };
  ClientConnection2.prototype.listenForHandshake = function() {
    var _this = this;
    if (this.options.connectionTimeout !== false) {
      this.connectionStep = CONNECTION_STEPS$1.HANDSHAKE;
      this.setConnectionTimeout();
    }
    this.request(MC_EVENTS.HANDSHAKE, null, {timeout: false}).then(function() {
      _this.addBeforeUnloadEvent();
      _this.finishInit();
    }).catch(function(e) {
      _this.handleError(e);
    });
  };
  ClientConnection2.prototype.addBeforeUnloadEvent = function() {
    var _this = this;
    this.options.window.addEventListener("beforeunload", function(event) {
      _this.emit(MC_EVENTS.DISCONNECTED);
      _this.close();
    });
  };
  ClientConnection2.prototype.isClient = function() {
    return true;
  };
  return ClientConnection2;
}(Connection);
var ContentReference = function() {
  function ContentReference2(connection) {
    this.connection = connection;
  }
  ContentReference2.prototype.getMultiple = function(contentTypeIds, options) {
    if (options === void 0) {
      options = {max: null};
    }
    return this.fetchReferences(contentTypeIds, options.max);
  };
  ContentReference2.prototype.get = function(contentTypeIds) {
    return __awaiter(this, void 0, void 0, function() {
      return __generator(this, function(_a) {
        return [2, this.fetchReferences(contentTypeIds)];
      });
    });
  };
  ContentReference2.prototype.fetchReferences = function(contentTypeIds, max) {
    if (!contentTypeIds || !Array.isArray(contentTypeIds) || !contentTypeIds.length) {
      throw new Error(ERRORS_CONTENT_ITEM.NO_IDS);
    }
    var response = __assign({contentTypeIds}, max !== void 0 && {max} || {});
    return this.connection.request(CONTENT_REFERENCE.CONTENT_REF_GET, response, {
      timeout: false
    });
  };
  return ContentReference2;
}();
var Form = function() {
  function Form2(connection, readOnly) {
    var _this = this;
    this.connection = connection;
    this.readOnly = readOnly;
    this.onChangeStack = [];
    this.connection.on(FORM.READ_ONLY, function(readonly) {
      _this.readOnly = readonly;
      _this.onChangeStack.forEach(function(cb) {
        return cb(_this.readOnly);
      });
    });
  }
  Form2.prototype.onReadOnlyChange = function(cb) {
    this.onChangeStack.push(cb);
    return this;
  };
  Form2.prototype.getValue = function() {
    return __awaiter(this, void 0, void 0, function() {
      var value;
      return __generator(this, function(_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [4, this.connection.request(FORM.GET_FORM_MODEL)];
          case 1:
            value = _a.sent();
            return [2, value];
          case 2:
            _a.sent();
            throw new Error(FORM$1.NO_MODEL);
          case 3:
            return [2];
        }
      });
    });
  };
  return Form2;
}();
var HttpMethod;
(function(HttpMethod2) {
  HttpMethod2["GET"] = "GET";
  HttpMethod2["POST"] = "POST";
  HttpMethod2["PUT"] = "PUT";
  HttpMethod2["PATCH"] = "PATCH";
  HttpMethod2["DELETE"] = "DELETE";
})(HttpMethod || (HttpMethod = {}));
var HttpClient = function() {
  function HttpClient2(connection) {
    this.connection = connection;
    this.DEFAULT_ERROR = {
      status: 403,
      data: {
        errors: [
          {
            code: "UNKNOWN",
            level: "ERROR",
            message: "Unknown error"
          }
        ]
      }
    };
  }
  HttpClient2.prototype.request = function(config) {
    return __awaiter(this, void 0, void 0, function() {
      var response, error_1;
      return __generator(this, function(_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [4, this.connection.request("dc-management-sdk-js:request", {
              data: config.data,
              method: config.method,
              headers: config.headers,
              url: config.url
            })];
          case 1:
            response = _a.sent();
            return [2, {
              data: response.data,
              status: response.status
            }];
          case 2:
            error_1 = _a.sent();
            if (error_1) {
              return [2, {
                data: error_1.data,
                status: error_1.status
              }];
            }
            return [2, this.DEFAULT_ERROR];
          case 3:
            return [2];
        }
      });
    });
  };
  return HttpClient2;
}();
var SDK = function() {
  function SDK2(options) {
    if (options === void 0) {
      options = {};
    }
    this.defaultOptions = {
      window,
      connectionTimeout: false,
      timeout: false,
      debug: false
    };
    this.options = __assign(__assign({}, this.defaultOptions), options);
    this.connection = new ClientConnection(this.options);
    this.mediaLink = new MediaLink(this.connection);
    this.contentLink = new ContentLink(this.connection);
    this.contentReference = new ContentReference(this.connection);
    this.frame = new Frame(this.connection, this.options.window);
    this.client = new HttpClient(this.connection);
  }
  SDK2.prototype.init = function() {
    return __awaiter(this, void 0, void 0, function() {
      var _this = this;
      return __generator(this, function(_a) {
        return [2, new Promise(function(resolve, reject) {
          return __awaiter(_this, void 0, void 0, function() {
            var _this2 = this;
            return __generator(this, function(_a2) {
              this.connection.init();
              this.connection.on(MC_EVENTS.CONNECTED, function() {
                return __awaiter(_this2, void 0, void 0, function() {
                  return __generator(this, function(_a3) {
                    switch (_a3.label) {
                      case 0:
                        _a3.trys.push([0, 2, , 3]);
                        return [4, this.setupContext()];
                      case 1:
                        _a3.sent();
                        resolve(this);
                        return [3, 3];
                      case 2:
                        _a3.sent();
                        reject(new Error(ERRORS_INIT.CONTEXT));
                        return [3, 3];
                      case 3:
                        return [2];
                    }
                  });
                });
              });
              this.connection.on(MC_EVENTS.CONNECTION_TIMEOUT, function() {
                reject(new Error(ERRORS_INIT.CONNTECTION_TIMEOUT));
              });
              return [2];
            });
          });
        })];
      });
    });
  };
  SDK2.prototype.setupContext = function() {
    return __awaiter(this, void 0, void 0, function() {
      var _a, fieldSchema, params, locales, stagingEnvironment, readOnly, visualisation;
      return __generator(this, function(_b) {
        switch (_b.label) {
          case 0:
            return [4, this.requestContext()];
          case 1:
            _a = _b.sent(), fieldSchema = _a.fieldSchema, params = _a.params, locales = _a.locales, stagingEnvironment = _a.stagingEnvironment, readOnly = _a.readOnly, visualisation = _a.visualisation;
            this.contentItem = new ContentItem(this.connection);
            this.field = new Field(this.connection, fieldSchema);
            this.form = new Form(this.connection, readOnly);
            this.params = params;
            this.locales = locales;
            this.visualisation = visualisation;
            this.stagingEnvironment = stagingEnvironment;
            return [2];
        }
      });
    });
  };
  SDK2.prototype.requestContext = function() {
    return __awaiter(this, void 0, void 0, function() {
      return __generator(this, function(_a) {
        return [2, this.connection.request(CONTEXT.GET, null, {timeout: false})];
      });
    });
  };
  return SDK2;
}();
function init2(options) {
  return __awaiter(this, void 0, void 0, function() {
    var sdk;
    return __generator(this, function(_a) {
      sdk = new SDK(options);
      return [2, sdk.init()];
    });
  });
}

// _snowpack/pkg/svelte/transition.js
function cubicOut(t) {
  const f = t - 1;
  return f * f * f + 1;
}
function fade(node, {delay = 0, duration = 400, easing = identity} = {}) {
  const o = +getComputedStyle(node).opacity;
  return {
    delay,
    duration,
    easing,
    css: (t) => `opacity: ${t * o}`
  };
}
function fly(node, {delay = 0, duration = 400, easing = cubicOut, x = 0, y = 0, opacity = 0} = {}) {
  const style = getComputedStyle(node);
  const target_opacity = +style.opacity;
  const transform = style.transform === "none" ? "" : style.transform;
  const od = target_opacity * (1 - opacity);
  return {
    delay,
    duration,
    easing,
    css: (t, u) => `
			transform: ${transform} translate(${(1 - t) * x}px, ${(1 - t) * y}px);
			opacity: ${target_opacity - od * u}`
  };
}

// dist/utils.js
function pad(num) {
  return String(num).padStart(2, "0");
}
function offsetMinutesToString(num) {
  let negative = num < 0;
  num = Math.abs(num);
  let hours = pad(Math.trunc(num / 60));
  let minutes = pad(num % 60);
  return `${negative ? "-" : "+"}${hours}:${minutes}`;
}

// dist/components/Calendar.svelte.js
function get_each_context(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[14] = list[i];
  child_ctx[16] = i;
  return child_ctx;
}
function get_each_context_1(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[14] = list[i];
  return child_ctx;
}
function create_each_block_1(ctx) {
  let p;
  return {
    c() {
      p = element("p");
      attr(p, "class", "svelte-4gh3nj");
    },
    m(target, anchor) {
      insert(target, p, anchor);
    },
    d(detaching) {
      if (detaching)
        detach(p);
    }
  };
}
function create_each_block(ctx) {
  let p;
  let t0_value = ctx[16] + 1 + "";
  let t0;
  let t1;
  let p_class_value;
  let mounted;
  let dispose;
  function click_handler() {
    return ctx[10](ctx[16]);
  }
  return {
    c() {
      p = element("p");
      t0 = text(t0_value);
      t1 = space();
      attr(p, "class", p_class_value = "" + (null_to_empty(ctx[0].getDate() - 1 === ctx[16] ? "selected" : "") + " svelte-4gh3nj"));
    },
    m(target, anchor) {
      insert(target, p, anchor);
      append(p, t0);
      append(p, t1);
      if (!mounted) {
        dispose = listen(p, "click", click_handler);
        mounted = true;
      }
    },
    p(new_ctx, dirty) {
      ctx = new_ctx;
      if (dirty & 1 && p_class_value !== (p_class_value = "" + (null_to_empty(ctx[0].getDate() - 1 === ctx[16] ? "selected" : "") + " svelte-4gh3nj"))) {
        attr(p, "class", p_class_value);
      }
    },
    d(detaching) {
      if (detaching)
        detach(p);
      mounted = false;
      dispose();
    }
  };
}
function create_fragment(ctx) {
  let div7;
  let div2;
  let div0;
  let t1;
  let p0;
  let t2_value = ctx[0].getFullYear() + "";
  let t2;
  let t3;
  let div1;
  let t5;
  let div5;
  let div3;
  let t7;
  let p1;
  let t8_value = ctx[3][ctx[0].getMonth()] + "";
  let t8;
  let t9;
  let div4;
  let t11;
  let div6;
  let p2;
  let t13;
  let p3;
  let t15;
  let p4;
  let t17;
  let p5;
  let t19;
  let p6;
  let t21;
  let p7;
  let t23;
  let p8;
  let t25;
  let t26;
  let mounted;
  let dispose;
  let each_value_1 = ctx[1];
  let each_blocks_1 = [];
  for (let i = 0; i < each_value_1.length; i += 1) {
    each_blocks_1[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
  }
  let each_value = ctx[2];
  let each_blocks = [];
  for (let i = 0; i < each_value.length; i += 1) {
    each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
  }
  return {
    c() {
      div7 = element("div");
      div2 = element("div");
      div0 = element("div");
      div0.textContent = "\u2190";
      t1 = space();
      p0 = element("p");
      t2 = text(t2_value);
      t3 = space();
      div1 = element("div");
      div1.textContent = "\u2192";
      t5 = space();
      div5 = element("div");
      div3 = element("div");
      div3.textContent = "\u2190";
      t7 = space();
      p1 = element("p");
      t8 = text(t8_value);
      t9 = space();
      div4 = element("div");
      div4.textContent = "\u2192";
      t11 = space();
      div6 = element("div");
      p2 = element("p");
      p2.textContent = "M";
      t13 = space();
      p3 = element("p");
      p3.textContent = "T";
      t15 = space();
      p4 = element("p");
      p4.textContent = "W";
      t17 = space();
      p5 = element("p");
      p5.textContent = "T";
      t19 = space();
      p6 = element("p");
      p6.textContent = "F";
      t21 = space();
      p7 = element("p");
      p7.textContent = "S";
      t23 = space();
      p8 = element("p");
      p8.textContent = "S";
      t25 = space();
      for (let i = 0; i < each_blocks_1.length; i += 1) {
        each_blocks_1[i].c();
      }
      t26 = space();
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].c();
      }
      attr(div0, "class", "svelte-4gh3nj");
      attr(p0, "class", "yearText svelte-4gh3nj");
      attr(div1, "class", "svelte-4gh3nj");
      attr(div2, "class", "year svelte-4gh3nj");
      attr(div3, "class", "svelte-4gh3nj");
      attr(p1, "class", "monthText svelte-4gh3nj");
      attr(div4, "class", "svelte-4gh3nj");
      attr(div5, "class", "month svelte-4gh3nj");
      attr(p2, "class", "day svelte-4gh3nj");
      attr(p3, "class", "day svelte-4gh3nj");
      attr(p4, "class", "day svelte-4gh3nj");
      attr(p5, "class", "day svelte-4gh3nj");
      attr(p6, "class", "day svelte-4gh3nj");
      attr(p7, "class", "day svelte-4gh3nj");
      attr(p8, "class", "day svelte-4gh3nj");
      attr(div6, "class", "date svelte-4gh3nj");
      attr(div7, "class", "grid-container svelte-4gh3nj");
    },
    m(target, anchor) {
      insert(target, div7, anchor);
      append(div7, div2);
      append(div2, div0);
      append(div2, t1);
      append(div2, p0);
      append(p0, t2);
      append(div2, t3);
      append(div2, div1);
      append(div7, t5);
      append(div7, div5);
      append(div5, div3);
      append(div5, t7);
      append(div5, p1);
      append(p1, t8);
      append(div5, t9);
      append(div5, div4);
      append(div7, t11);
      append(div7, div6);
      append(div6, p2);
      append(div6, t13);
      append(div6, p3);
      append(div6, t15);
      append(div6, p4);
      append(div6, t17);
      append(div6, p5);
      append(div6, t19);
      append(div6, p6);
      append(div6, t21);
      append(div6, p7);
      append(div6, t23);
      append(div6, p8);
      append(div6, t25);
      for (let i = 0; i < each_blocks_1.length; i += 1) {
        each_blocks_1[i].m(div6, null);
      }
      append(div6, t26);
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].m(div6, null);
      }
      if (!mounted) {
        dispose = [
          listen(div0, "click", ctx[5]),
          listen(div1, "click", ctx[4]),
          listen(div3, "click", ctx[7]),
          listen(div4, "click", ctx[6])
        ];
        mounted = true;
      }
    },
    p(ctx2, [dirty]) {
      if (dirty & 1 && t2_value !== (t2_value = ctx2[0].getFullYear() + ""))
        set_data(t2, t2_value);
      if (dirty & 1 && t8_value !== (t8_value = ctx2[3][ctx2[0].getMonth()] + ""))
        set_data(t8, t8_value);
      if (dirty & 2) {
        const old_length = each_value_1.length;
        each_value_1 = ctx2[1];
        let i;
        for (i = old_length; i < each_value_1.length; i += 1) {
          const child_ctx = get_each_context_1(ctx2, each_value_1, i);
          if (!each_blocks_1[i]) {
            each_blocks_1[i] = create_each_block_1(child_ctx);
            each_blocks_1[i].c();
            each_blocks_1[i].m(div6, t26);
          }
        }
        for (i = each_value_1.length; i < old_length; i += 1) {
          each_blocks_1[i].d(1);
        }
        each_blocks_1.length = each_value_1.length;
      }
      if (dirty & 261) {
        each_value = ctx2[2];
        let i;
        for (i = 0; i < each_value.length; i += 1) {
          const child_ctx = get_each_context(ctx2, each_value, i);
          if (each_blocks[i]) {
            each_blocks[i].p(child_ctx, dirty);
          } else {
            each_blocks[i] = create_each_block(child_ctx);
            each_blocks[i].c();
            each_blocks[i].m(div6, null);
          }
        }
        for (; i < each_blocks.length; i += 1) {
          each_blocks[i].d(1);
        }
        each_blocks.length = each_value.length;
      }
    },
    i: noop,
    o: noop,
    d(detaching) {
      if (detaching)
        detach(div7);
      destroy_each(each_blocks_1, detaching);
      destroy_each(each_blocks, detaching);
      mounted = false;
      run_all(dispose);
    }
  };
}
function americanDayToBritishDay(num) {
  num -= 1;
  if (num < 0) {
    num = 6;
  }
  return num;
}
function startDayOfMonth(d) {
  let nd = new Date(d);
  nd.setDate(1);
  return americanDayToBritishDay(nd.getDay());
}
function generateArray(length) {
  return Array.apply(null, Array(length)).map(function() {
  });
}
function instance($$self, $$props, $$invalidate) {
  let dateObj;
  let day;
  let days;
  let {date} = $$props;
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec"
  ];
  const dispatch2 = createEventDispatcher();
  function addYear() {
    setDate(new Date(dateObj.setFullYear(dateObj.getFullYear() + 1)));
  }
  function subtractYear() {
    setDate(new Date(dateObj.setFullYear(dateObj.getFullYear() - 1)));
  }
  function addMonth() {
    setDate(new Date(dateObj.setMonth(dateObj.getMonth() + 1)));
  }
  function subtractMonth() {
    setDate(new Date(dateObj.setMonth(dateObj.getMonth() - 1)));
  }
  function setDate(d) {
    $$invalidate(0, dateObj = d);
    let stringDate = `${dateObj.getFullYear()}-${pad(dateObj.getMonth() + 1)}-${pad(dateObj.getDate())}`;
    dispatch2("update", stringDate);
  }
  function daysInMonth(dateObj2) {
    let d = new Date(dateObj2);
    return new Date(d.getYear(), d.getMonth() + 1, 0).getDate();
  }
  function setDay(day2) {
    let d = new Date(dateObj);
    d.setDate(day2 + 1);
    setDate(d);
    dispatch2("hide");
  }
  const click_handler = (i) => setDay(i);
  $$self.$$set = ($$props2) => {
    if ("date" in $$props2)
      $$invalidate(9, date = $$props2.date);
  };
  $$self.$$.update = () => {
    if ($$self.$$.dirty & 512) {
      $:
        $$invalidate(0, dateObj = new Date(date));
    }
    if ($$self.$$.dirty & 1) {
      $:
        $$invalidate(1, day = generateArray(startDayOfMonth(dateObj)));
    }
    if ($$self.$$.dirty & 1) {
      $:
        $$invalidate(2, days = generateArray(daysInMonth(dateObj)));
    }
  };
  return [
    dateObj,
    day,
    days,
    months,
    addYear,
    subtractYear,
    addMonth,
    subtractMonth,
    setDay,
    date,
    click_handler
  ];
}
var Calendar = class extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance, create_fragment, safe_not_equal, {date: 9});
  }
};
var Calendar_svelte_default = Calendar;

// dist/components/Clock.svelte.js
function get_each_context_5(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[27] = list[i];
  child_ctx[29] = i;
  return child_ctx;
}
function get_each_context_6(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[27] = list[i];
  child_ctx[29] = i;
  return child_ctx;
}
function get_each_context_7(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[27] = list[i];
  child_ctx[29] = i;
  return child_ctx;
}
function get_each_context_2(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[31] = list[i];
  child_ctx[29] = i;
  return child_ctx;
}
function get_each_context_3(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[27] = list[i];
  child_ctx[29] = i;
  return child_ctx;
}
function get_each_context_4(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[27] = list[i];
  child_ctx[29] = i;
  return child_ctx;
}
function get_each_context2(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[27] = list[i];
  child_ctx[29] = i;
  return child_ctx;
}
function get_each_context_12(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[27] = list[i];
  child_ctx[29] = i;
  return child_ctx;
}
function create_else_block(ctx) {
  let g;
  let each0_anchor;
  let line;
  let line_transform_value;
  let text_1;
  let t;
  let g_transition;
  let current;
  let each_value_7 = ctx[9];
  let each_blocks_2 = [];
  for (let i = 0; i < each_value_7.length; i += 1) {
    each_blocks_2[i] = create_each_block_7(get_each_context_7(ctx, each_value_7, i));
  }
  let each_value_6 = ctx[9];
  let each_blocks_1 = [];
  for (let i = 0; i < each_value_6.length; i += 1) {
    each_blocks_1[i] = create_each_block_6(get_each_context_6(ctx, each_value_6, i));
  }
  let each_value_5 = ctx[9];
  let each_blocks = [];
  for (let i = 0; i < each_value_5.length; i += 1) {
    each_blocks[i] = create_each_block_5(get_each_context_5(ctx, each_value_5, i));
  }
  return {
    c() {
      g = svg_element("g");
      for (let i = 0; i < each_blocks_2.length; i += 1) {
        each_blocks_2[i].c();
      }
      each0_anchor = empty();
      for (let i = 0; i < each_blocks_1.length; i += 1) {
        each_blocks_1[i].c();
      }
      line = svg_element("line");
      text_1 = svg_element("text");
      t = text("Seconds\n      ");
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].c();
      }
      attr(line, "class", "line svelte-6r5lzk");
      attr(line, "y1", "0");
      attr(line, "y2", "-35");
      attr(line, "transform", line_transform_value = "rotate(" + 6 * ctx[3] + ")");
      attr(text_1, "class", "title svelte-6r5lzk");
      attr(text_1, "dominant-baseline", "middle");
      attr(text_1, "text-anchor", "middle");
      attr(text_1, "paint-order", "stroke");
      attr(g, "class", "mins svelte-6r5lzk");
    },
    m(target, anchor) {
      insert(target, g, anchor);
      for (let i = 0; i < each_blocks_2.length; i += 1) {
        each_blocks_2[i].m(g, null);
      }
      append(g, each0_anchor);
      for (let i = 0; i < each_blocks_1.length; i += 1) {
        each_blocks_1[i].m(g, null);
      }
      append(g, line);
      append(g, text_1);
      append(text_1, t);
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].m(g, null);
      }
      current = true;
    },
    p(ctx2, dirty) {
      if (dirty[0] & 512) {
        each_value_7 = ctx2[9];
        let i;
        for (i = 0; i < each_value_7.length; i += 1) {
          const child_ctx = get_each_context_7(ctx2, each_value_7, i);
          if (each_blocks_2[i]) {
            each_blocks_2[i].p(child_ctx, dirty);
          } else {
            each_blocks_2[i] = create_each_block_7(child_ctx);
            each_blocks_2[i].c();
            each_blocks_2[i].m(g, each0_anchor);
          }
        }
        for (; i < each_blocks_2.length; i += 1) {
          each_blocks_2[i].d(1);
        }
        each_blocks_2.length = each_value_7.length;
      }
      if (dirty[0] & 520) {
        each_value_6 = ctx2[9];
        let i;
        for (i = 0; i < each_value_6.length; i += 1) {
          const child_ctx = get_each_context_6(ctx2, each_value_6, i);
          if (each_blocks_1[i]) {
            each_blocks_1[i].p(child_ctx, dirty);
          } else {
            each_blocks_1[i] = create_each_block_6(child_ctx);
            each_blocks_1[i].c();
            each_blocks_1[i].m(g, line);
          }
        }
        for (; i < each_blocks_1.length; i += 1) {
          each_blocks_1[i].d(1);
        }
        each_blocks_1.length = each_value_6.length;
      }
      if (!current || dirty[0] & 8 && line_transform_value !== (line_transform_value = "rotate(" + 6 * ctx2[3] + ")")) {
        attr(line, "transform", line_transform_value);
      }
      if (dirty[0] & 4160) {
        each_value_5 = ctx2[9];
        let i;
        for (i = 0; i < each_value_5.length; i += 1) {
          const child_ctx = get_each_context_5(ctx2, each_value_5, i);
          if (each_blocks[i]) {
            each_blocks[i].p(child_ctx, dirty);
          } else {
            each_blocks[i] = create_each_block_5(child_ctx);
            each_blocks[i].c();
            each_blocks[i].m(g, null);
          }
        }
        for (; i < each_blocks.length; i += 1) {
          each_blocks[i].d(1);
        }
        each_blocks.length = each_value_5.length;
      }
    },
    i(local) {
      if (current)
        return;
      if (local) {
        add_render_callback(() => {
          if (!g_transition)
            g_transition = create_bidirectional_transition(g, fade, {}, true);
          g_transition.run(1);
        });
      }
      current = true;
    },
    o(local) {
      if (local) {
        if (!g_transition)
          g_transition = create_bidirectional_transition(g, fade, {}, false);
        g_transition.run(0);
      }
      current = false;
    },
    d(detaching) {
      if (detaching)
        detach(g);
      destroy_each(each_blocks_2, detaching);
      destroy_each(each_blocks_1, detaching);
      destroy_each(each_blocks, detaching);
      if (detaching && g_transition)
        g_transition.end();
    }
  };
}
function create_if_block_1(ctx) {
  let g;
  let each0_anchor;
  let line;
  let line_transform_value;
  let text_1;
  let t;
  let g_transition;
  let current;
  let each_value_4 = ctx[9];
  let each_blocks_2 = [];
  for (let i = 0; i < each_value_4.length; i += 1) {
    each_blocks_2[i] = create_each_block_4(get_each_context_4(ctx, each_value_4, i));
  }
  let each_value_3 = ctx[9];
  let each_blocks_1 = [];
  for (let i = 0; i < each_value_3.length; i += 1) {
    each_blocks_1[i] = create_each_block_3(get_each_context_3(ctx, each_value_3, i));
  }
  let each_value_2 = ctx[9];
  let each_blocks = [];
  for (let i = 0; i < each_value_2.length; i += 1) {
    each_blocks[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
  }
  return {
    c() {
      g = svg_element("g");
      for (let i = 0; i < each_blocks_2.length; i += 1) {
        each_blocks_2[i].c();
      }
      each0_anchor = empty();
      for (let i = 0; i < each_blocks_1.length; i += 1) {
        each_blocks_1[i].c();
      }
      line = svg_element("line");
      text_1 = svg_element("text");
      t = text("Minutes\n      ");
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].c();
      }
      attr(line, "class", "line svelte-6r5lzk");
      attr(line, "y1", "0");
      attr(line, "y2", "-35");
      attr(line, "transform", line_transform_value = "rotate(" + 6 * ctx[2] + ")");
      attr(text_1, "class", "title svelte-6r5lzk");
      attr(text_1, "dominant-baseline", "middle");
      attr(text_1, "text-anchor", "middle");
      attr(text_1, "paint-order", "stroke");
      attr(g, "class", "mins svelte-6r5lzk");
    },
    m(target, anchor) {
      insert(target, g, anchor);
      for (let i = 0; i < each_blocks_2.length; i += 1) {
        each_blocks_2[i].m(g, null);
      }
      append(g, each0_anchor);
      for (let i = 0; i < each_blocks_1.length; i += 1) {
        each_blocks_1[i].m(g, null);
      }
      append(g, line);
      append(g, text_1);
      append(text_1, t);
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].m(g, null);
      }
      current = true;
    },
    p(ctx2, dirty) {
      if (dirty[0] & 512) {
        each_value_4 = ctx2[9];
        let i;
        for (i = 0; i < each_value_4.length; i += 1) {
          const child_ctx = get_each_context_4(ctx2, each_value_4, i);
          if (each_blocks_2[i]) {
            each_blocks_2[i].p(child_ctx, dirty);
          } else {
            each_blocks_2[i] = create_each_block_4(child_ctx);
            each_blocks_2[i].c();
            each_blocks_2[i].m(g, each0_anchor);
          }
        }
        for (; i < each_blocks_2.length; i += 1) {
          each_blocks_2[i].d(1);
        }
        each_blocks_2.length = each_value_4.length;
      }
      if (dirty[0] & 516) {
        each_value_3 = ctx2[9];
        let i;
        for (i = 0; i < each_value_3.length; i += 1) {
          const child_ctx = get_each_context_3(ctx2, each_value_3, i);
          if (each_blocks_1[i]) {
            each_blocks_1[i].p(child_ctx, dirty);
          } else {
            each_blocks_1[i] = create_each_block_3(child_ctx);
            each_blocks_1[i].c();
            each_blocks_1[i].m(g, line);
          }
        }
        for (; i < each_blocks_1.length; i += 1) {
          each_blocks_1[i].d(1);
        }
        each_blocks_1.length = each_value_3.length;
      }
      if (!current || dirty[0] & 4 && line_transform_value !== (line_transform_value = "rotate(" + 6 * ctx2[2] + ")")) {
        attr(line, "transform", line_transform_value);
      }
      if (dirty[0] & 2050) {
        each_value_2 = ctx2[9];
        let i;
        for (i = 0; i < each_value_2.length; i += 1) {
          const child_ctx = get_each_context_2(ctx2, each_value_2, i);
          if (each_blocks[i]) {
            each_blocks[i].p(child_ctx, dirty);
          } else {
            each_blocks[i] = create_each_block_2(child_ctx);
            each_blocks[i].c();
            each_blocks[i].m(g, null);
          }
        }
        for (; i < each_blocks.length; i += 1) {
          each_blocks[i].d(1);
        }
        each_blocks.length = each_value_2.length;
      }
    },
    i(local) {
      if (current)
        return;
      if (local) {
        add_render_callback(() => {
          if (!g_transition)
            g_transition = create_bidirectional_transition(g, fade, {}, true);
          g_transition.run(1);
        });
      }
      current = true;
    },
    o(local) {
      if (local) {
        if (!g_transition)
          g_transition = create_bidirectional_transition(g, fade, {}, false);
        g_transition.run(0);
      }
      current = false;
    },
    d(detaching) {
      if (detaching)
        detach(g);
      destroy_each(each_blocks_2, detaching);
      destroy_each(each_blocks_1, detaching);
      destroy_each(each_blocks, detaching);
      if (detaching && g_transition)
        g_transition.end();
    }
  };
}
function create_if_block(ctx) {
  let line;
  let line_transform_value;
  let g;
  let each0_anchor;
  let text_1;
  let t;
  let g_transition;
  let current;
  let each_value_1 = ctx[7];
  let each_blocks_1 = [];
  for (let i = 0; i < each_value_1.length; i += 1) {
    each_blocks_1[i] = create_each_block_12(get_each_context_12(ctx, each_value_1, i));
  }
  let each_value = ctx[8];
  let each_blocks = [];
  for (let i = 0; i < each_value.length; i += 1) {
    each_blocks[i] = create_each_block2(get_each_context2(ctx, each_value, i));
  }
  return {
    c() {
      line = svg_element("line");
      g = svg_element("g");
      for (let i = 0; i < each_blocks_1.length; i += 1) {
        each_blocks_1[i].c();
      }
      each0_anchor = empty();
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].c();
      }
      text_1 = svg_element("text");
      t = text("Hour");
      attr(line, "class", "line svelte-6r5lzk");
      attr(line, "y1", "0");
      attr(line, "y2", ctx[5]);
      attr(line, "transform", line_transform_value = "rotate(" + 30 * ctx[4] + ")");
      attr(text_1, "class", "title svelte-6r5lzk");
      attr(text_1, "dominant-baseline", "middle");
      attr(text_1, "text-anchor", "middle");
      attr(text_1, "paint-order", "stroke");
      attr(g, "class", "svelte-6r5lzk");
    },
    m(target, anchor) {
      insert(target, line, anchor);
      insert(target, g, anchor);
      for (let i = 0; i < each_blocks_1.length; i += 1) {
        each_blocks_1[i].m(g, null);
      }
      append(g, each0_anchor);
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].m(g, null);
      }
      append(g, text_1);
      append(text_1, t);
      current = true;
    },
    p(ctx2, dirty) {
      if (!current || dirty[0] & 32) {
        attr(line, "y2", ctx2[5]);
      }
      if (!current || dirty[0] & 16 && line_transform_value !== (line_transform_value = "rotate(" + 30 * ctx2[4] + ")")) {
        attr(line, "transform", line_transform_value);
      }
      if (dirty[0] & 1155) {
        each_value_1 = ctx2[7];
        let i;
        for (i = 0; i < each_value_1.length; i += 1) {
          const child_ctx = get_each_context_12(ctx2, each_value_1, i);
          if (each_blocks_1[i]) {
            each_blocks_1[i].p(child_ctx, dirty);
          } else {
            each_blocks_1[i] = create_each_block_12(child_ctx);
            each_blocks_1[i].c();
            each_blocks_1[i].m(g, each0_anchor);
          }
        }
        for (; i < each_blocks_1.length; i += 1) {
          each_blocks_1[i].d(1);
        }
        each_blocks_1.length = each_value_1.length;
      }
      if (dirty[0] & 1283) {
        each_value = ctx2[8];
        let i;
        for (i = 0; i < each_value.length; i += 1) {
          const child_ctx = get_each_context2(ctx2, each_value, i);
          if (each_blocks[i]) {
            each_blocks[i].p(child_ctx, dirty);
          } else {
            each_blocks[i] = create_each_block2(child_ctx);
            each_blocks[i].c();
            each_blocks[i].m(g, text_1);
          }
        }
        for (; i < each_blocks.length; i += 1) {
          each_blocks[i].d(1);
        }
        each_blocks.length = each_value.length;
      }
    },
    i(local) {
      if (current)
        return;
      if (local) {
        add_render_callback(() => {
          if (!g_transition)
            g_transition = create_bidirectional_transition(g, fade, {}, true);
          g_transition.run(1);
        });
      }
      current = true;
    },
    o(local) {
      if (local) {
        if (!g_transition)
          g_transition = create_bidirectional_transition(g, fade, {}, false);
        g_transition.run(0);
      }
      current = false;
    },
    d(detaching) {
      if (detaching)
        detach(line);
      if (detaching)
        detach(g);
      destroy_each(each_blocks_1, detaching);
      destroy_each(each_blocks, detaching);
      if (detaching && g_transition)
        g_transition.end();
    }
  };
}
function create_if_block_5(ctx) {
  let g;
  let circle;
  let circle_cx_value;
  let circle_cy_value;
  let svg;
  let text_1;
  let t;
  let svg_x_value;
  let svg_y_value;
  return {
    c() {
      g = svg_element("g");
      circle = svg_element("circle");
      svg = svg_element("svg");
      text_1 = svg_element("text");
      t = text(ctx[29]);
      attr(circle, "class", "hourCircle svelte-6r5lzk");
      attr(circle, "cx", circle_cx_value = ctx[27].x);
      attr(circle, "cy", circle_cy_value = ctx[27].y);
      attr(circle, "r", "6");
      attr(text_1, "class", "label show svelte-6r5lzk");
      attr(text_1, "x", "50%");
      attr(text_1, "y", "50%");
      attr(text_1, "dominant-baseline", "middle");
      attr(text_1, "text-anchor", "middle");
      attr(svg, "x", svg_x_value = ctx[27].x - 10);
      attr(svg, "y", svg_y_value = ctx[27].y - 4);
      attr(svg, "width", "20");
      attr(svg, "height", "10");
      attr(svg, "class", "svelte-6r5lzk");
      attr(g, "class", "svelte-6r5lzk");
    },
    m(target, anchor) {
      insert(target, g, anchor);
      append(g, circle);
      append(g, svg);
      append(svg, text_1);
      append(text_1, t);
    },
    p: noop,
    d(detaching) {
      if (detaching)
        detach(g);
    }
  };
}
function create_each_block_7(ctx) {
  let if_block_anchor;
  let if_block = ctx[29] % 5 === 0 && create_if_block_5(ctx);
  return {
    c() {
      if (if_block)
        if_block.c();
      if_block_anchor = empty();
    },
    m(target, anchor) {
      if (if_block)
        if_block.m(target, anchor);
      insert(target, if_block_anchor, anchor);
    },
    p(ctx2, dirty) {
      if (ctx2[29] % 5 === 0)
        if_block.p(ctx2, dirty);
    },
    d(detaching) {
      if (if_block)
        if_block.d(detaching);
      if (detaching)
        detach(if_block_anchor);
    }
  };
}
function create_if_block_4(ctx) {
  let g;
  let circle;
  let circle_cx_value;
  let circle_cy_value;
  let svg;
  let text_1;
  let t;
  let text_1_class_value;
  let svg_x_value;
  let svg_y_value;
  return {
    c() {
      g = svg_element("g");
      circle = svg_element("circle");
      svg = svg_element("svg");
      text_1 = svg_element("text");
      t = text(ctx[29]);
      attr(circle, "class", "hourCircle svelte-6r5lzk");
      attr(circle, "cx", circle_cx_value = ctx[27].x);
      attr(circle, "cy", circle_cy_value = ctx[27].y);
      attr(circle, "r", "6");
      attr(text_1, "class", text_1_class_value = "" + (null_to_empty(ctx[29] % 5 === 0 ? "label show" : "label") + " svelte-6r5lzk"));
      attr(text_1, "x", "50%");
      attr(text_1, "y", "50%");
      attr(text_1, "dominant-baseline", "middle");
      attr(text_1, "text-anchor", "middle");
      attr(svg, "x", svg_x_value = ctx[27].x - 10);
      attr(svg, "y", svg_y_value = ctx[27].y - 4);
      attr(svg, "width", "20");
      attr(svg, "height", "10");
      attr(svg, "class", "svelte-6r5lzk");
      attr(g, "class", "selected svelte-6r5lzk");
    },
    m(target, anchor) {
      insert(target, g, anchor);
      append(g, circle);
      append(g, svg);
      append(svg, text_1);
      append(text_1, t);
    },
    p: noop,
    d(detaching) {
      if (detaching)
        detach(g);
    }
  };
}
function create_each_block_6(ctx) {
  let if_block_anchor;
  let if_block = ctx[29] === ctx[3] && create_if_block_4(ctx);
  return {
    c() {
      if (if_block)
        if_block.c();
      if_block_anchor = empty();
    },
    m(target, anchor) {
      if (if_block)
        if_block.m(target, anchor);
      insert(target, if_block_anchor, anchor);
    },
    p(ctx2, dirty) {
      if (ctx2[29] === ctx2[3]) {
        if (if_block) {
          if_block.p(ctx2, dirty);
        } else {
          if_block = create_if_block_4(ctx2);
          if_block.c();
          if_block.m(if_block_anchor.parentNode, if_block_anchor);
        }
      } else if (if_block) {
        if_block.d(1);
        if_block = null;
      }
    },
    d(detaching) {
      if (if_block)
        if_block.d(detaching);
      if (detaching)
        detach(if_block_anchor);
    }
  };
}
function create_each_block_5(ctx) {
  let path;
  let path_transform_value;
  let mounted;
  let dispose;
  function mouseover_handler_3() {
    return ctx[25](ctx[29]);
  }
  return {
    c() {
      path = svg_element("path");
      attr(path, "class", "hit svelte-6r5lzk");
      attr(path, "d", "M 0 0 L -2 -47 L 2 -47 Z");
      attr(path, "transform", path_transform_value = "rotate(" + 6 * ctx[29] + ")");
    },
    m(target, anchor) {
      insert(target, path, anchor);
      if (!mounted) {
        dispose = [
          listen(path, "click", ctx[24]),
          listen(path, "mouseover", mouseover_handler_3)
        ];
        mounted = true;
      }
    },
    p(new_ctx, dirty) {
      ctx = new_ctx;
    },
    d(detaching) {
      if (detaching)
        detach(path);
      mounted = false;
      run_all(dispose);
    }
  };
}
function create_if_block_3(ctx) {
  let g;
  let circle;
  let circle_cx_value;
  let circle_cy_value;
  let svg;
  let text_1;
  let t;
  let svg_x_value;
  let svg_y_value;
  return {
    c() {
      g = svg_element("g");
      circle = svg_element("circle");
      svg = svg_element("svg");
      text_1 = svg_element("text");
      t = text(ctx[29]);
      attr(circle, "class", "hourCircle svelte-6r5lzk");
      attr(circle, "cx", circle_cx_value = ctx[27].x);
      attr(circle, "cy", circle_cy_value = ctx[27].y);
      attr(circle, "r", "6");
      attr(text_1, "class", "label show svelte-6r5lzk");
      attr(text_1, "x", "50%");
      attr(text_1, "y", "50%");
      attr(text_1, "dominant-baseline", "middle");
      attr(text_1, "text-anchor", "middle");
      attr(svg, "x", svg_x_value = ctx[27].x - 10);
      attr(svg, "y", svg_y_value = ctx[27].y - 4);
      attr(svg, "width", "20");
      attr(svg, "height", "10");
      attr(svg, "class", "svelte-6r5lzk");
      attr(g, "class", "svelte-6r5lzk");
    },
    m(target, anchor) {
      insert(target, g, anchor);
      append(g, circle);
      append(g, svg);
      append(svg, text_1);
      append(text_1, t);
    },
    p: noop,
    d(detaching) {
      if (detaching)
        detach(g);
    }
  };
}
function create_each_block_4(ctx) {
  let if_block_anchor;
  let if_block = ctx[29] % 5 === 0 && create_if_block_3(ctx);
  return {
    c() {
      if (if_block)
        if_block.c();
      if_block_anchor = empty();
    },
    m(target, anchor) {
      if (if_block)
        if_block.m(target, anchor);
      insert(target, if_block_anchor, anchor);
    },
    p(ctx2, dirty) {
      if (ctx2[29] % 5 === 0)
        if_block.p(ctx2, dirty);
    },
    d(detaching) {
      if (if_block)
        if_block.d(detaching);
      if (detaching)
        detach(if_block_anchor);
    }
  };
}
function create_if_block_2(ctx) {
  let g;
  let circle;
  let circle_cx_value;
  let circle_cy_value;
  let svg;
  let text_1;
  let t;
  let text_1_class_value;
  let svg_x_value;
  let svg_y_value;
  return {
    c() {
      g = svg_element("g");
      circle = svg_element("circle");
      svg = svg_element("svg");
      text_1 = svg_element("text");
      t = text(ctx[29]);
      attr(circle, "class", "hourCircle svelte-6r5lzk");
      attr(circle, "cx", circle_cx_value = ctx[27].x);
      attr(circle, "cy", circle_cy_value = ctx[27].y);
      attr(circle, "r", "6");
      attr(text_1, "class", text_1_class_value = "" + (null_to_empty(ctx[29] % 5 === 0 ? "label show" : "label") + " svelte-6r5lzk"));
      attr(text_1, "x", "50%");
      attr(text_1, "y", "50%");
      attr(text_1, "dominant-baseline", "middle");
      attr(text_1, "text-anchor", "middle");
      attr(svg, "x", svg_x_value = ctx[27].x - 10);
      attr(svg, "y", svg_y_value = ctx[27].y - 4);
      attr(svg, "width", "20");
      attr(svg, "height", "10");
      attr(svg, "class", "svelte-6r5lzk");
      attr(g, "class", "selected svelte-6r5lzk");
    },
    m(target, anchor) {
      insert(target, g, anchor);
      append(g, circle);
      append(g, svg);
      append(svg, text_1);
      append(text_1, t);
    },
    p: noop,
    d(detaching) {
      if (detaching)
        detach(g);
    }
  };
}
function create_each_block_3(ctx) {
  let if_block_anchor;
  let if_block = ctx[29] === ctx[2] && create_if_block_2(ctx);
  return {
    c() {
      if (if_block)
        if_block.c();
      if_block_anchor = empty();
    },
    m(target, anchor) {
      if (if_block)
        if_block.m(target, anchor);
      insert(target, if_block_anchor, anchor);
    },
    p(ctx2, dirty) {
      if (ctx2[29] === ctx2[2]) {
        if (if_block) {
          if_block.p(ctx2, dirty);
        } else {
          if_block = create_if_block_2(ctx2);
          if_block.c();
          if_block.m(if_block_anchor.parentNode, if_block_anchor);
        }
      } else if (if_block) {
        if_block.d(1);
        if_block = null;
      }
    },
    d(detaching) {
      if (if_block)
        if_block.d(detaching);
      if (detaching)
        detach(if_block_anchor);
    }
  };
}
function create_each_block_2(ctx) {
  let path;
  let path_transform_value;
  let mounted;
  let dispose;
  function mouseover_handler_2() {
    return ctx[22](ctx[29]);
  }
  function mousedown_handler_2() {
    return ctx[23](ctx[29]);
  }
  return {
    c() {
      path = svg_element("path");
      attr(path, "class", "hit svelte-6r5lzk");
      attr(path, "d", "M 0 0 L -2 -47 L 2 -47 Z");
      attr(path, "transform", path_transform_value = "rotate(" + 6 * ctx[29] + ")");
    },
    m(target, anchor) {
      insert(target, path, anchor);
      if (!mounted) {
        dispose = [
          listen(path, "mouseup", ctx[21]),
          listen(path, "mouseover", mouseover_handler_2),
          listen(path, "mousedown", mousedown_handler_2)
        ];
        mounted = true;
      }
    },
    p(new_ctx, dirty) {
      ctx = new_ctx;
    },
    d(detaching) {
      if (detaching)
        detach(path);
      mounted = false;
      run_all(dispose);
    }
  };
}
function create_each_block_12(ctx) {
  let g;
  let circle;
  let circle_cx_value;
  let circle_cy_value;
  let svg;
  let text_1;
  let t_value = indexToHour(ctx[29]) + "";
  let t;
  let svg_x_value;
  let svg_y_value;
  let g_class_value;
  let mounted;
  let dispose;
  function mouseover_handler() {
    return ctx[16](ctx[29]);
  }
  function mousedown_handler() {
    return ctx[17](ctx[29]);
  }
  return {
    c() {
      g = svg_element("g");
      circle = svg_element("circle");
      svg = svg_element("svg");
      text_1 = svg_element("text");
      t = text(t_value);
      attr(circle, "r", "6");
      attr(circle, "cx", circle_cx_value = ctx[27].x);
      attr(circle, "cy", circle_cy_value = ctx[27].y);
      attr(circle, "class", "hourCircle svelte-6r5lzk");
      attr(text_1, "class", "label svelte-6r5lzk");
      attr(text_1, "x", "50%");
      attr(text_1, "y", "50%");
      attr(text_1, "dominant-baseline", "middle");
      attr(text_1, "text-anchor", "middle");
      attr(svg, "x", svg_x_value = ctx[27].x - 10);
      attr(svg, "y", svg_y_value = ctx[27].y - 4);
      attr(svg, "width", "20");
      attr(svg, "height", "10");
      attr(svg, "class", "svelte-6r5lzk");
      attr(g, "class", g_class_value = "" + (null_to_empty(indexToHour(ctx[29]) === ctx[0] ? "selected" : "") + " svelte-6r5lzk"));
    },
    m(target, anchor) {
      insert(target, g, anchor);
      append(g, circle);
      append(g, svg);
      append(svg, text_1);
      append(text_1, t);
      if (!mounted) {
        dispose = [
          listen(g, "mouseup", ctx[15]),
          listen(g, "mouseover", mouseover_handler),
          listen(g, "mousedown", mousedown_handler)
        ];
        mounted = true;
      }
    },
    p(new_ctx, dirty) {
      ctx = new_ctx;
      if (dirty[0] & 1 && g_class_value !== (g_class_value = "" + (null_to_empty(indexToHour(ctx[29]) === ctx[0] ? "selected" : "") + " svelte-6r5lzk"))) {
        attr(g, "class", g_class_value);
      }
    },
    d(detaching) {
      if (detaching)
        detach(g);
      mounted = false;
      run_all(dispose);
    }
  };
}
function create_each_block2(ctx) {
  let g;
  let circle;
  let circle_cx_value;
  let circle_cy_value;
  let svg;
  let text_1;
  let t_value = indexToHour(ctx[29] + 12) + "";
  let t;
  let svg_x_value;
  let svg_y_value;
  let g_class_value;
  let mounted;
  let dispose;
  function mouseover_handler_1() {
    return ctx[19](ctx[29]);
  }
  function mousedown_handler_1() {
    return ctx[20](ctx[29]);
  }
  return {
    c() {
      g = svg_element("g");
      circle = svg_element("circle");
      svg = svg_element("svg");
      text_1 = svg_element("text");
      t = text(t_value);
      attr(circle, "class", "hourCircle svelte-6r5lzk");
      attr(circle, "cx", circle_cx_value = ctx[27].x);
      attr(circle, "cy", circle_cy_value = ctx[27].y);
      attr(circle, "r", "6");
      attr(text_1, "class", "label-inner svelte-6r5lzk");
      attr(text_1, "x", "50%");
      attr(text_1, "y", "50%");
      attr(text_1, "dominant-baseline", "middle");
      attr(text_1, "text-anchor", "middle");
      attr(svg, "x", svg_x_value = ctx[27].x - 10);
      attr(svg, "y", svg_y_value = ctx[27].y - 4);
      attr(svg, "width", "20");
      attr(svg, "height", "10");
      attr(svg, "class", "svelte-6r5lzk");
      attr(g, "class", g_class_value = "" + (null_to_empty(indexToHour(ctx[29] + 12) === ctx[0] ? "selected" : "") + " svelte-6r5lzk"));
    },
    m(target, anchor) {
      insert(target, g, anchor);
      append(g, circle);
      append(g, svg);
      append(svg, text_1);
      append(text_1, t);
      if (!mounted) {
        dispose = [
          listen(g, "mouseup", ctx[18]),
          listen(g, "mouseover", mouseover_handler_1),
          listen(g, "mousedown", mousedown_handler_1)
        ];
        mounted = true;
      }
    },
    p(new_ctx, dirty) {
      ctx = new_ctx;
      if (dirty[0] & 1 && g_class_value !== (g_class_value = "" + (null_to_empty(indexToHour(ctx[29] + 12) === ctx[0] ? "selected" : "") + " svelte-6r5lzk"))) {
        attr(g, "class", g_class_value);
      }
    },
    d(detaching) {
      if (detaching)
        detach(g);
      mounted = false;
      run_all(dispose);
    }
  };
}
function create_fragment2(ctx) {
  let svg;
  let circle;
  let current_block_type_index;
  let if_block;
  const if_block_creators = [create_if_block, create_if_block_1, create_else_block];
  const if_blocks = [];
  function select_block_type(ctx2, dirty) {
    if (ctx2[1] === "hour")
      return 0;
    if (ctx2[1] === "minute")
      return 1;
    return 2;
  }
  current_block_type_index = select_block_type(ctx, [-1]);
  if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
  return {
    c() {
      svg = svg_element("svg");
      circle = svg_element("circle");
      if_block.c();
      attr(circle, "class", "clock-face svelte-6r5lzk");
      attr(circle, "r", "48");
      attr(svg, "class", "clock svelte-6r5lzk");
      attr(svg, "viewBox", "-50 -50 100 100");
    },
    m(target, anchor) {
      insert(target, svg, anchor);
      append(svg, circle);
      if_blocks[current_block_type_index].m(svg, null);
    },
    p(ctx2, dirty) {
      let previous_block_index = current_block_type_index;
      current_block_type_index = select_block_type(ctx2, dirty);
      if (current_block_type_index === previous_block_index) {
        if_blocks[current_block_type_index].p(ctx2, dirty);
      } else {
        group_outros();
        transition_out(if_blocks[previous_block_index], 1, 1, () => {
          if_blocks[previous_block_index] = null;
        });
        check_outros();
        if_block = if_blocks[current_block_type_index];
        if (!if_block) {
          if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx2);
          if_block.c();
        } else {
          if_block.p(ctx2, dirty);
        }
        transition_in(if_block, 1);
        if_block.m(svg, null);
      }
    },
    i(local) {
      transition_in(if_block);
    },
    o(local) {
      transition_out(if_block);
    },
    d(detaching) {
      if (detaching)
        detach(svg);
      if_blocks[current_block_type_index].d();
    }
  };
}
function indexToHour(i) {
  return i === 0 ? 12 : i === 12 ? 24 : i;
}
function generateCoords(inc, length) {
  let coords = [];
  for (let i = 0; i < 360 / inc; i++) {
    let degree = i * inc + 90;
    let degreeRad = degree * Math.PI / 180;
    let y = Math.sin(degreeRad) * length;
    let x = Math.cos(degreeRad) * length;
    coords.push({x, y});
  }
  return coords;
}
function instance2($$self, $$props, $$invalidate) {
  let timeSplit;
  let hour;
  let minute;
  let seconds;
  let hourIndex;
  let size;
  let {time} = $$props;
  const dispatch2 = createEventDispatcher();
  let selection = "hour";
  let hourCoords = generateCoords(30, -40);
  let hourMinorCoords = generateCoords(30, -25);
  let minuteCoords = generateCoords(6, -40);
  function setHour(h) {
    $$invalidate(0, hour = h);
    setDate();
  }
  function setMinute(m) {
    $$invalidate(2, minute = m);
    setDate();
  }
  function setSeconds(s) {
    $$invalidate(3, seconds = s);
    setDate();
  }
  function setDate() {
    let h = hour === 24 ? 0 : hour;
    dispatch2("update", `${pad(h)}:${pad(minute)}:${pad(seconds)}`);
  }
  const mouseup_handler = () => $$invalidate(1, selection = "minute");
  const mouseover_handler = (i) => {
    setHour(indexToHour(i));
  };
  const mousedown_handler = (i) => {
    setHour(indexToHour(i));
  };
  const mouseup_handler_1 = () => $$invalidate(1, selection = "minute");
  const mouseover_handler_1 = (i) => {
    setHour(indexToHour(i + 12));
  };
  const mousedown_handler_1 = (i) => {
    setHour(indexToHour(i + 12));
  };
  const mouseup_handler_2 = () => $$invalidate(1, selection = "seconds");
  const mouseover_handler_2 = (i) => {
    setMinute(i);
  };
  const mousedown_handler_2 = (i) => {
    setMinute(i);
  };
  const click_handler = () => dispatch2("hide");
  const mouseover_handler_3 = (i) => {
    setSeconds(i);
  };
  $$self.$$set = ($$props2) => {
    if ("time" in $$props2)
      $$invalidate(13, time = $$props2.time);
  };
  $$self.$$.update = () => {
    if ($$self.$$.dirty[0] & 8192) {
      $:
        $$invalidate(14, timeSplit = time.split(":"));
    }
    if ($$self.$$.dirty[0] & 16384) {
      $:
        $$invalidate(0, hour = Number.parseInt(timeSplit[0]) === 0 ? 24 : Number.parseInt(timeSplit[0]));
    }
    if ($$self.$$.dirty[0] & 16384) {
      $:
        $$invalidate(2, minute = Number.parseInt(timeSplit[1]));
    }
    if ($$self.$$.dirty[0] & 16384) {
      $:
        $$invalidate(3, seconds = Number.parseInt(timeSplit[2].substr(0, 2)));
    }
    if ($$self.$$.dirty[0] & 1) {
      $:
        $$invalidate(4, hourIndex = hour % 12);
    }
    if ($$self.$$.dirty[0] & 1) {
      $:
        $$invalidate(5, size = hour > 12 ? -20 : -35);
    }
  };
  return [
    hour,
    selection,
    minute,
    seconds,
    hourIndex,
    size,
    dispatch2,
    hourCoords,
    hourMinorCoords,
    minuteCoords,
    setHour,
    setMinute,
    setSeconds,
    time,
    timeSplit,
    mouseup_handler,
    mouseover_handler,
    mousedown_handler,
    mouseup_handler_1,
    mouseover_handler_1,
    mousedown_handler_1,
    mouseup_handler_2,
    mouseover_handler_2,
    mousedown_handler_2,
    click_handler,
    mouseover_handler_3
  ];
}
var Clock = class extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance2, create_fragment2, safe_not_equal, {time: 13}, [-1, -1]);
  }
};
var Clock_svelte_default = Clock;

// dist/App.svelte.js
function create_if_block_42(ctx) {
  let div;
  let p;
  let t0_value = ctx[7].field.schema.title + "";
  let t0;
  let t1;
  return {
    c() {
      div = element("div");
      p = element("p");
      t0 = text(t0_value);
      t1 = text(":");
      attr(p, "class", "svelte-13ya0uw");
      attr(div, "class", "label svelte-13ya0uw");
    },
    m(target, anchor) {
      insert(target, div, anchor);
      append(div, p);
      append(p, t0);
      append(p, t1);
    },
    p(ctx2, dirty) {
      if (dirty & 128 && t0_value !== (t0_value = ctx2[7].field.schema.title + ""))
        set_data(t0, t0_value);
    },
    d(detaching) {
      if (detaching)
        detach(div);
    }
  };
}
function create_if_block_32(ctx) {
  let div;
  let img;
  let img_src_value;
  let t0;
  let p;
  let t1_value = new Date(dateString(ctx[0], ctx[1], offsetMinutesToString(ctx[8]()))).toLocaleDateString() + "";
  let t1;
  let p_class_value;
  let mounted;
  let dispose;
  return {
    c() {
      div = element("div");
      img = element("img");
      t0 = space();
      p = element("p");
      t1 = text(t1_value);
      if (img.src !== (img_src_value = "./icons/calendar.svg"))
        attr(img, "src", img_src_value);
      attr(img, "alt", "calendar icon");
      attr(img, "class", "svelte-13ya0uw");
      attr(p, "class", p_class_value = "" + (null_to_empty(ctx[6] ? "active" : "") + " svelte-13ya0uw"));
      attr(div, "class", "date svelte-13ya0uw");
    },
    m(target, anchor) {
      insert(target, div, anchor);
      append(div, img);
      append(div, t0);
      append(div, p);
      append(p, t1);
      if (!mounted) {
        dispose = listen(div, "click", ctx[11]);
        mounted = true;
      }
    },
    p(ctx2, dirty) {
      if (dirty & 3 && t1_value !== (t1_value = new Date(dateString(ctx2[0], ctx2[1], offsetMinutesToString(ctx2[8]()))).toLocaleDateString() + ""))
        set_data(t1, t1_value);
      if (dirty & 64 && p_class_value !== (p_class_value = "" + (null_to_empty(ctx2[6] ? "active" : "") + " svelte-13ya0uw"))) {
        attr(p, "class", p_class_value);
      }
    },
    d(detaching) {
      if (detaching)
        detach(div);
      mounted = false;
      dispose();
    }
  };
}
function create_if_block_22(ctx) {
  let div;
  let img;
  let img_src_value;
  let t0;
  let p;
  let t1_value = new Date(dateString(ctx[0], ctx[1], offsetMinutesToString(ctx[8]()))).toLocaleTimeString() + "";
  let t1;
  let p_class_value;
  let mounted;
  let dispose;
  return {
    c() {
      div = element("div");
      img = element("img");
      t0 = space();
      p = element("p");
      t1 = text(t1_value);
      if (img.src !== (img_src_value = "./icons/clock.svg"))
        attr(img, "src", img_src_value);
      attr(img, "alt", "calendar icon");
      attr(img, "class", "svelte-13ya0uw");
      attr(p, "class", p_class_value = "" + (null_to_empty(ctx[6] ? "active" : "") + " svelte-13ya0uw"));
      attr(div, "class", "time svelte-13ya0uw");
    },
    m(target, anchor) {
      insert(target, div, anchor);
      append(div, img);
      append(div, t0);
      append(div, p);
      append(p, t1);
      if (!mounted) {
        dispose = listen(div, "click", ctx[12]);
        mounted = true;
      }
    },
    p(ctx2, dirty) {
      if (dirty & 3 && t1_value !== (t1_value = new Date(dateString(ctx2[0], ctx2[1], offsetMinutesToString(ctx2[8]()))).toLocaleTimeString() + ""))
        set_data(t1, t1_value);
      if (dirty & 64 && p_class_value !== (p_class_value = "" + (null_to_empty(ctx2[6] ? "active" : "") + " svelte-13ya0uw"))) {
        attr(p, "class", p_class_value);
      }
    },
    d(detaching) {
      if (detaching)
        detach(div);
      mounted = false;
      dispose();
    }
  };
}
function create_if_block_12(ctx) {
  let div;
  let calendar;
  let div_intro;
  let current;
  calendar = new Calendar_svelte_default({props: {date: ctx[0]}});
  calendar.$on("hide", ctx[13]);
  calendar.$on("update", ctx[14]);
  return {
    c() {
      div = element("div");
      create_component(calendar.$$.fragment);
      attr(div, "class", "editor");
    },
    m(target, anchor) {
      insert(target, div, anchor);
      mount_component(calendar, div, null);
      current = true;
    },
    p(ctx2, dirty) {
      const calendar_changes = {};
      if (dirty & 1)
        calendar_changes.date = ctx2[0];
      calendar.$set(calendar_changes);
    },
    i(local) {
      if (current)
        return;
      transition_in(calendar.$$.fragment, local);
      if (!div_intro) {
        add_render_callback(() => {
          div_intro = create_in_transition(div, fly, {x: -500, duration: 500});
          div_intro.start();
        });
      }
      current = true;
    },
    o(local) {
      transition_out(calendar.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      if (detaching)
        detach(div);
      destroy_component(calendar);
    }
  };
}
function create_if_block2(ctx) {
  let div;
  let clock;
  let div_intro;
  let current;
  clock = new Clock_svelte_default({props: {time: ctx[1]}});
  clock.$on("hide", ctx[15]);
  clock.$on("update", ctx[16]);
  return {
    c() {
      div = element("div");
      create_component(clock.$$.fragment);
      attr(div, "class", "editor");
    },
    m(target, anchor) {
      insert(target, div, anchor);
      mount_component(clock, div, null);
      current = true;
    },
    p(ctx2, dirty) {
      const clock_changes = {};
      if (dirty & 2)
        clock_changes.time = ctx2[1];
      clock.$set(clock_changes);
    },
    i(local) {
      if (current)
        return;
      transition_in(clock.$$.fragment, local);
      if (!div_intro) {
        add_render_callback(() => {
          div_intro = create_in_transition(div, fly, {x: -500, duration: 500});
          div_intro.start();
        });
      }
      current = true;
    },
    o(local) {
      transition_out(clock.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      if (detaching)
        detach(div);
      destroy_component(clock);
    }
  };
}
function create_fragment3(ctx) {
  let main;
  let t0;
  let t1;
  let t2;
  let div0;
  let t3;
  let t4;
  let t5;
  let div1;
  let current;
  let if_block0 = ctx[7] && ctx[7].field && ctx[7].field.schema && ctx[7].field.schema.title && create_if_block_42(ctx);
  let if_block1 = ctx[4] && create_if_block_32(ctx);
  let if_block2 = ctx[5] && create_if_block_22(ctx);
  let if_block3 = ctx[2] && create_if_block_12(ctx);
  let if_block4 = ctx[3] && create_if_block2(ctx);
  return {
    c() {
      main = element("main");
      if (if_block0)
        if_block0.c();
      t0 = space();
      if (if_block1)
        if_block1.c();
      t1 = space();
      if (if_block2)
        if_block2.c();
      t2 = space();
      div0 = element("div");
      t3 = space();
      if (if_block3)
        if_block3.c();
      t4 = space();
      if (if_block4)
        if_block4.c();
      t5 = space();
      div1 = element("div");
      attr(div0, "class", "clear svelte-13ya0uw");
      attr(div1, "class", "clear svelte-13ya0uw");
      attr(main, "class", "svelte-13ya0uw");
    },
    m(target, anchor) {
      insert(target, main, anchor);
      if (if_block0)
        if_block0.m(main, null);
      append(main, t0);
      if (if_block1)
        if_block1.m(main, null);
      append(main, t1);
      if (if_block2)
        if_block2.m(main, null);
      append(main, t2);
      append(main, div0);
      append(main, t3);
      if (if_block3)
        if_block3.m(main, null);
      append(main, t4);
      if (if_block4)
        if_block4.m(main, null);
      append(main, t5);
      append(main, div1);
      current = true;
    },
    p(ctx2, [dirty]) {
      if (ctx2[7] && ctx2[7].field && ctx2[7].field.schema && ctx2[7].field.schema.title) {
        if (if_block0) {
          if_block0.p(ctx2, dirty);
        } else {
          if_block0 = create_if_block_42(ctx2);
          if_block0.c();
          if_block0.m(main, t0);
        }
      } else if (if_block0) {
        if_block0.d(1);
        if_block0 = null;
      }
      if (ctx2[4]) {
        if (if_block1) {
          if_block1.p(ctx2, dirty);
        } else {
          if_block1 = create_if_block_32(ctx2);
          if_block1.c();
          if_block1.m(main, t1);
        }
      } else if (if_block1) {
        if_block1.d(1);
        if_block1 = null;
      }
      if (ctx2[5]) {
        if (if_block2) {
          if_block2.p(ctx2, dirty);
        } else {
          if_block2 = create_if_block_22(ctx2);
          if_block2.c();
          if_block2.m(main, t2);
        }
      } else if (if_block2) {
        if_block2.d(1);
        if_block2 = null;
      }
      if (ctx2[2]) {
        if (if_block3) {
          if_block3.p(ctx2, dirty);
          if (dirty & 4) {
            transition_in(if_block3, 1);
          }
        } else {
          if_block3 = create_if_block_12(ctx2);
          if_block3.c();
          transition_in(if_block3, 1);
          if_block3.m(main, t4);
        }
      } else if (if_block3) {
        group_outros();
        transition_out(if_block3, 1, 1, () => {
          if_block3 = null;
        });
        check_outros();
      }
      if (ctx2[3]) {
        if (if_block4) {
          if_block4.p(ctx2, dirty);
          if (dirty & 8) {
            transition_in(if_block4, 1);
          }
        } else {
          if_block4 = create_if_block2(ctx2);
          if_block4.c();
          transition_in(if_block4, 1);
          if_block4.m(main, t5);
        }
      } else if (if_block4) {
        group_outros();
        transition_out(if_block4, 1, 1, () => {
          if_block4 = null;
        });
        check_outros();
      }
    },
    i(local) {
      if (current)
        return;
      transition_in(if_block3);
      transition_in(if_block4);
      current = true;
    },
    o(local) {
      transition_out(if_block3);
      transition_out(if_block4);
      current = false;
    },
    d(detaching) {
      if (detaching)
        detach(main);
      if (if_block0)
        if_block0.d();
      if (if_block1)
        if_block1.d();
      if (if_block2)
        if_block2.d();
      if (if_block3)
        if_block3.d();
      if (if_block4)
        if_block4.d();
    }
  };
}
function dateString(d, t, offset) {
  let ds = "";
  if (offset !== void 0) {
    ds = d + "T" + t + ".000" + offset;
  } else {
    ds = d + "T" + t + ".000Z";
  }
  return ds;
}
function instance3($$self, $$props, $$invalidate) {
  const now2 = new Date();
  let date = nowDate();
  let time = nowTime();
  let editingDate = false;
  let editingTime = false;
  let type = "string";
  let format = "date-time";
  let showDate = true;
  let showTime = true;
  let unixMode = false;
  let active2 = false;
  let sdk;
  (async () => {
    try {
      $$invalidate(7, sdk = await init2());
      sdk.frame.startAutoResizer();
      unixMode = sdk.params.installation.unix || sdk.params.instance.unix;
      type = sdk.field.schema.type;
      setState(sdk.field.schema.format);
      const value = await sdk.field.getValue();
      if (value === void 0) {
        setDefaults();
      } else {
        $$invalidate(6, active2 = true);
      }
      if (type === "string") {
        processStringInput(value);
      } else if (type === "number") {
        processNumberInput(value);
      }
    } catch {
    }
  })();
  function setDefaults() {
    switch (format) {
      case "date":
        $$invalidate(1, time = "00:00:00");
        break;
      case "time":
        $$invalidate(0, date = "1970-01-01");
        break;
    }
  }
  function nowDate() {
    return `${now2.getFullYear()}-${pad(now2.getMonth() + 1)}-${pad(now2.getDate())}`;
  }
  function nowTime() {
    return `${pad(now2.getHours())}:${pad(now2.getMinutes())}:${pad(now2.getSeconds())}`;
  }
  function processStringInput(input) {
    if (!input) {
      return;
    }
    switch (format) {
      case "date-time":
        $$invalidate(0, [date, time] = input.split("T"), date, $$invalidate(1, time));
        break;
      case "date":
        $$invalidate(0, date = input);
        break;
      case "time":
        $$invalidate(1, time = input);
        break;
    }
    $$invalidate(1, time = time.substr(0, 8));
  }
  function getNegativeLocalOffset() {
    return 0 - getLocalOffset();
  }
  function getLocalOffset() {
    return new Date(dateString(date, time)).getTimezoneOffset();
  }
  function processNumberInput(input) {
    if (input === void 0 || input === null || isNaN(input)) {
      return;
    }
    let stamp = unixMode ? input * 1e3 : input;
    let d = new Date(stamp);
    let offset = d.getTimezoneOffset();
    $$invalidate(1, time = calculateTime(d, offset));
    $$invalidate(0, date = pad(d.getFullYear()) + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()));
  }
  function calculateTime(d, offset) {
    const offsetInHours = Math.trunc(offset / 60);
    const remainingOffset = offset % 60;
    let offsetHours = d.getHours() + offsetInHours;
    let offsetMinutes = d.getMinutes() + remainingOffset;
    if (offsetMinutes < 0) {
      offsetHours--;
      offsetMinutes = 60 + offsetMinutes;
    } else if (offsetMinutes > 59) {
      offsetHours++;
      offsetMinutes = offsetMinutes % 60;
    }
    if (offsetHours < 0) {
      d.setDate(d.getDate() - 1);
      offsetHours = 24 + offsetHours;
    } else if (offsetHours > 23) {
      d.setDate(d.getDate() + 1);
      offsetHours = offsetHours % 24;
    }
    return `${pad(offsetHours)}:${pad(offsetMinutes)}:${pad(d.getSeconds())}`;
  }
  function setState(f) {
    if (!f) {
      return;
    }
    if (f == "time") {
      format = f;
      $$invalidate(4, showDate = false);
    } else if (f == "date") {
      format = f;
      $$invalidate(5, showTime = false);
    }
  }
  function processNumberOutput() {
    let d = new Date(dateString(date, time));
    return unixMode ? d.getTime() / 1e3 : d.getTime();
  }
  function processStringOutput() {
    switch (format) {
      case "date-time":
        return dateString(date, time, offsetMinutesToString(getNegativeLocalOffset()));
      case "date":
        return date;
      case "time":
        return time + ".000Z";
    }
  }
  function update2() {
    let val;
    if (type === "string") {
      val = processStringOutput();
    } else if (type === "number") {
      val = processNumberOutput();
    }
    $$invalidate(6, active2 = true);
    if (sdk && val !== void 0) {
      sdk.field.setValue(val);
    }
  }
  function toggle(component) {
    if (component === "date") {
      if (editingDate) {
        $$invalidate(2, editingDate = false);
      } else {
        $$invalidate(2, editingDate = true);
        $$invalidate(3, editingTime = false);
      }
    }
    if (component === "time") {
      if (editingTime) {
        $$invalidate(3, editingTime = false);
      } else {
        $$invalidate(3, editingTime = true);
        $$invalidate(2, editingDate = false);
      }
    }
  }
  const click_handler = () => toggle("date");
  const click_handler_1 = () => toggle("time");
  const hide_handler = () => $$invalidate(2, editingDate = false);
  const update_handler = (d) => $$invalidate(0, date = d.detail) && update2();
  const hide_handler_1 = () => $$invalidate(3, editingTime = false);
  const update_handler_1 = (d) => $$invalidate(1, time = d.detail) && update2();
  return [
    date,
    time,
    editingDate,
    editingTime,
    showDate,
    showTime,
    active2,
    sdk,
    getNegativeLocalOffset,
    update2,
    toggle,
    click_handler,
    click_handler_1,
    hide_handler,
    update_handler,
    hide_handler_1,
    update_handler_1
  ];
}
var App = class extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance3, create_fragment3, safe_not_equal, {});
  }
};
var App_svelte_default = App;

// dist/main.js
var app = new App_svelte_default({
  target: document.body
});
var main_default = app;
export {
  main_default as default
};

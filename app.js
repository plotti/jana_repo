

/* terrific-2.1.0.js */

(function() {
    var a = this, b, c;
    if (typeof exports !== "undefined") {
        b = exports;
    } else {
        b = a.Tc = {};
    }
    c = b.$ = a.jQuery || a.Zepto || a.$;
    (function() {
        var d = false, e = /xyz/.test(function() {
            xyz;
        }) ? /\b_super\b/: /.*/;
        this.Class = function() {};
        Class.extend = function(j) {
            var i = this.prototype;
            d = true;
            var h = new this ();
            d = false;
            for (var g in j) {
                h[g] = typeof j[g] == "function" && typeof i[g] == "function" && e.test(j[g]) ? (function(k, l) {
                    return function() {
                        var n = this._super;
                        this._super = i[k];
                        var m = l.apply(this, arguments);
                        this._super = n;
                        return m;
                    };
                })(g, j[g]) : j[g];
            }
            function f() {
                if (!d && this.init) {
                    this.init.apply(this, arguments);
                }
            }
            f.prototype = h;
            f.constructor = f;
            f.extend = arguments.callee;
            return f;
        };
    })();
    b.Config = {
        dependencies: {
            css: "/css/dependencies",
            js: "/js/dependencies"
        }
    };
    b.Application = Class.extend({
        init: function(e, d) {
            this.config = c.extend({}, b.Config, d);
            this.$ctx = e || c("body");
            this.modules = [];
            this.connectors = {};
            this.sandbox = new b.Sandbox(this, this.config);
        },
        registerModules: function(f) {
            var d = this, e = [], g = b.Utils.String;
            f = f || this.$ctx;
            f.find('.mod:not([data-ignore="true"])').add(f).each(function() {
                var q = c(this), l = q.attr("class") || "";
                l = l.split(" ");
                if (l.length > 1) {
                    var r, p = [], j = [], m;
                    for (var n = 0, o = l.length; n < o; n++) {
                        var h = c.trim(l[n]);
                        if (h) {
                            if (h.indexOf("-")>-1) {
                                h = g.toCamel(h);
                            }
                            if (h.indexOf("mod") === 0 && h.length > 3) {
                                r = h.substr(3);
                            } else {
                                if (h.indexOf("skin") === 0) {
                                    p.push(h.substr(4).replace(r, ""));
                                }
                            }
                        }
                    }
                    m = q.attr("data-connectors");
                    if (m) {
                        j = m.split(",");
                        for (var n = 0, o = j.length; n < o; n++) {
                            var k = c.trim(j[n]);
                            if (k) {
                                j[n] = k;
                            }
                        }
                    }
                    if (r && b.Module[r]) {
                        e.push(d.registerModule(q, r, p, j));
                    }
                }
            });
            return e;
        },
        unregisterModules: function(h) {
            var e = this.connectors;
            h = h || this.modules;
            if (h === this.modules) {
                this.connectors = [];
                this.modules = [];
            } else {
                for (var k = 0, d = h.length; k < d; k++) {
                    var j = h[k], g;
                    for (var f in e) {
                        if (e.hasOwnProperty(f)) {
                            e[f].unregisterComponent(j);
                        }
                    }
                    g = c.inArray(j, this.modules);
                    if (g>-1) {
                        delete this.modules[g];
                    }
                }
            }
        },
        end: function(d) {
            if (typeof d === "function") {
                this.sandbox.addCallback("end", d);
            }
        },
        start: function(e) {
            e = e || this.modules;
            for (var f = 0, d = e.length; f < d; f++) {
                e[f].start();
            }
        },
        stop: function(e) {
            e = e || this.modules;
            for (var f = 0, d = e.length; f < d; f++) {
                e[f].stop();
            }
        },
        registerModule: function(e, m, l, f) {
            var g = this.modules;
            m = m || undefined;
            l = l || [];
            f = f || [];
            if (m && b.Module[m]) {
                var d = g.length;
                e.data("terrific-id", d);
                g[d] = new b.Module[m](e, this.sandbox, d);
                for (var j = 0, k = l.length; j < k; j++) {
                    var h = l[j];
                    if (b.Module[m][h]) {
                        g[d] = g[d].getDecoratedModule(m, h);
                    }
                }
                for (var j = 0, k = f.length; j < k; j++) {
                    this.registerConnection(f[j], g[d]);
                }
                return g[d];
            }
            return null;
        },
        registerConnection: function(f, i) {
            f = c.trim(f);
            var j = f.split("-"), e, h, g;
            if (j.length === 1) {
                g = h = j[0];
            } else {
                if (j.length === 2) {
                    e = j[0];
                    h = j[1];
                    g = e + h;
                }
            }
            if (g) {
                var d = this.connectors;
                if (!d[g]) {
                    if (!e) {
                        d[g] = new b.Connector(h);
                    } else {
                        if (b.Connector[e]) {
                            d[g] = new b.Connector[e](h);
                        }
                    }
                }
                if (d[g]) {
                    i.attachConnector(d[g]);
                    d[g].registerComponent(i);
                }
            }
        },
        unregisterConnection: function(f, e) {
            var d = this.connectors[f];
            if (d) {
                d.unregisterComponent(e);
                e.detachConnector(d);
            }
        }
    });
    b.Sandbox = Class.extend({
        init: function(e, d) {
            this.application = e;
            this.config = d;
            this.hooks = {
                after: [],
                end: []
            };
        },
        addModules: function(f) {
            var e = [], d = this.application;
            if (f) {
                e = d.registerModules(f);
                d.start(e);
            }
            return e;
        },
        removeModules: function(h) {
            var e = this, g = this.application;
            if (!c.isArray(h)) {
                var f = h;
                var d = [];
                f.find(".mod").add(f).each(function() {
                    var j = c(this).data("terrific-id");
                    if (j !== undefined) {
                        var i = e.getModuleById(j);
                        if (i) {
                            d.push(i);
                        }
                    }
                });
                h = d;
            }
            if (h) {
                g.stop(h);
                g.unregisterModules(h);
            }
        },
        subscribe: function(d, f) {
            var e = this.application;
            d = d + "";
            if (!f ||!d) {
                throw new Error("subscribe is expecting 2 parameters (connector, module)");
            }
            if (!(f instanceof b.Module)) {
                throw new Error("the module param must be an instance of Tc.Module");
            }
            e.registerConnection(d, f);
        },
        unsubscribe: function(e, f) {
            var d = this.application;
            if (f instanceof b.Module && e) {
                e = e + "";
                d.unregisterConnection(e, f);
            }
        },
        getModuleById: function(e) {
            var d = this.application;
            if (d.modules[e] !== undefined) {
                return d.modules[e];
            } else {
                throw new Error("the module with the id " + e + " does not exist");
            }
        },
        getConfig: function() {
            return this.config;
        },
        getConfigParam: function(e) {
            var d = this.config;
            if (d[e] !== undefined) {
                return d[e];
            } else {
                throw new Error("the config param " + e + " does not exist");
            }
        },
        addCallback: function(d, e) {
            if (e == null) {
                d = "end";
            }
            this.hooks[d].push(e);
        },
        ready: function(j) {
            var e = this.hooks.after;
            e.push(j);
            if (this.application.modules.length === e.length) {
                for (var g = 0; g < e.length; g++) {
                    var d = e[g];
                    if (typeof d === "function") {
                        delete e[g];
                        d();
                    }
                }
                var f = this.hooks.end;
                for (var g = 0; g < f.length; g++) {
                    var h = f[g];
                    if (typeof h === "function") {
                        h();
                    }
                }
            }
        }
    });
    b.Module = Class.extend({
        init: function(e, d, f) {
            this.$ctx = e;
            this.id = f;
            this.connectors = {};
            this.sandbox = d;
        },
        start: function() {
            var d = this;
            if (this.on) {
                this.on(function() {
                    d.initAfter();
                });
            }
        },
        stop: function() {
            var d = this.$ctx;
            c("*", d).unbind().removeData();
            d.unbind().removeData();
        },
        initAfter: function() {
            var d = this;
            this.sandbox.ready(function() {
                if (d.after) {
                    d.after();
                }
            });
        },
        fire: function(e, h, k, l) {
            var p = this, f = this.connectors, d = true;
            if (k == null && l == null) {
                if (typeof h === "function") {
                    l = h;
                    h = undefined;
                } else {
                    if (c.isArray(h)) {
                        k = h;
                        h = undefined;
                    }
                }
            } else {
                if (l == null) {
                    if (typeof k === "function") {
                        l = k;
                        k = undefined;
                    }
                    if (c.isArray(h)) {
                        k = h;
                        h = undefined;
                    }
                }
            }
            e = b.Utils.String.capitalize(e);
            h = h || {};
            k = k || Object.keys(f);
            for (var j = 0, m = k.length; j < m; j++) {
                var n = k[j];
                if (f.hasOwnProperty(n)) {
                    var g = f[n], o = g.notify(p, "on" + e, h) || false;
                    if (!o) {
                        d = false;
                    }
                } else {
                    throw new Error("the module #" + p.id + " is not connected to connector " + n + " – hint: please make sure that your data is an object and not an array");
                }
            }
            if (d) {
                if (typeof l === "function") {
                    l(h);
                }
            }
        },
        attachConnector: function(d) {
            this.connectors[d.connectorId] = d;
        },
        detachConnector: function(d) {
            delete this.connectors[d.connectorId];
        },
        getDecoratedModule: function(e, f) {
            if (b.Module[e][f]) {
                var d = b.Module[e][f];
                d.prototype = this;
                d.prototype.constructor = b.Module[e][f];
                return new d(this);
            }
            return null;
        }
    });
    b.Connector = Class.extend({
        init: function(d) {
            this.connectorId = d;
            this.components = {};
        },
        registerComponent: function(d) {
            this.components[d.id] = {
                component: d
            };
        },
        unregisterComponent: function(d) {
            var e = this.components;
            if (e[d.id]) {
                delete e[d.id];
            }
        },
        notify: function(d, i, h, k) {
            var g = true, f = this.components;
            for (var j in f) {
                if (f.hasOwnProperty(j)) {
                    var e = f[j].component;
                    if (e !== d && e[i]) {
                        if (e[i](h) === false) {
                            g = false;
                        }
                    }
                }
            }
            return g;
        }
    });
    b.Utils = {};
    if (!Object.keys) {
        Object.keys = function(f) {
            var e = [], d;
            for (d in f) {
                if (f.hasOwnProperty(d)) {
                    e.push(d);
                }
            }
            return e;
        };
    }
    b.Utils.String = {
        capitalize: function(d) {
            return d.substr(0, 1).toUpperCase().concat(d.substr(1));
        },
        toCamel: function(d) {
            return d.replace(/(\-[A-Za-z])/g, function(e) {
                return e.toUpperCase().replace("-", "");
            });
        }
    };
}).call(this);

/* featherlight.min.js */

/**
* Featherlight – ultra slim jQuery lightbox
* Version 0.1.10 – https://github.com/noelboss/featherlight
*
* Copyright 2013, Noel Bossart
* MIT Licensed.
*/
(function(b) {
    var a = {
        id: 0,
        defaults: {
            selector: "[data-featherlight]",
            context: "body",
            type: {
                image: false,
                ajax: false
            },
            targetAttr: "data-featherlight",
            openTrigger: "click",
            closeTrigger: "click",
            namespace: "featherlight",
            resetCss: false,
            variant: null,
            closeOnBg: true,
            closeOnEsc: true,
            background: null,
            autostart: true,
            open: function(c) {
                b.proxy(b.featherlight.methods.open, this, c)();
            },
            close: function(c) {
                b.proxy(b.featherlight.methods.close, this, c)();
            }
        },
        methods: {
            setup: function(f, i) {
                var c = b(this) || b(), f = b.extend({}, a.defaults, f), h = c.attr("data-" + f.namespace + "-variant") || f.variant, g=!f.resetCss ? f.namespace : f.namespace + "-reset", e = b(f.background || '<div class="' + g + '"><div class="' + g + '-content"><span class="' + g + '-close">X</span></div></div>'), d = {
                    id: a.id++,
                    config: f,
                    content: i,
                    $elm: c,
                    $instance: e.clone().addClass(h)
                };
                d.$instance.on(f.closeTrigger + "." + f.namespace, b.proxy(f.close, d));
                if (c.length > 0 && this.tagName) {
                    c.on(f.openTrigger + "." + f.namespace, b.proxy(f.open, d));
                } else {
                    b.proxy(f.open, d)();
                }
            },
            getContent: function() {
                var d = this, f = d.content, c = d.$elm.attr(d.config.targetAttr) || "";
                if (typeof f === "string") {
                    d.content = b(f);
                } else {
                    if (f instanceof b === false) {
                        if (d.config.type.image == true || c === "image" || c.match(/\.(png|jpg|jpeg|gif|tiff|bmp)$/i)) {
                            var e = c.match(/\.(png|jpg|jpeg|gif|tiff|bmp)$/i) ? c: d.$elm.attr("href");
                            d.content = b('<img src="' + e + '" alt="" class="' + d.config.namespace + '-image" />');
                        } else {
                            if (d.config.type.ajax == true || c === "ajax" || c.match(/(http|htm|php)/i)) {
                                var e = c.match(/(http|htm|php)/i) ? c: d.$elm.attr("href"), f = e ? b("<div></div>").load(e, function(h, g) {
                                    if (g !== "error") {
                                        b.featherlight(f.html());
                                    }
                                }): null;
                                return false;
                            } else {
                                if (c) {
                                    d.content = b(b(c), d.config.context);
                                } else {
                                    return false;
                                }
                            }
                        }
                    }
                }
                if (b("iframe", d.content).length > 0) {
                    d.$instance.addClass(d.config.namespace + "-iframe");
                }
                d.content.addClass(d.config.namespace + "-inner");
            },
            open: function(d) {
                if (d) {
                    d.preventDefault();
                }
                var c = this;
                if (b.proxy(a.methods.getContent, c)() !== false) {
                    if (c.config.closeOnEsc) {
                        b(document).bind("keyup." + c.config.namespace + c.id, function(f) {
                            if (f.keyCode == 27) {
                                c.$instance.find("." + c.config.namespace + "-close").click();
                            }
                        });
                    }
                    c.$instance.prependTo("body").fadeIn().find("." + c.config.namespace + "-close").after(c.content);
                }
            },
            close: function(e) {
                if (e) {
                    e.preventDefault();
                }
                var c = this, d = c.config, f = b(e.target);
                if ((d.closeOnBg && f.is("." + d.namespace)) || f.is("." + d.namespace + "-close")) {
                    if (c.config.closeOnEsc) {
                        b(document).unbind("keyup." + c.config.namespace + c.id);
                    }
                    c.$instance.fadeOut(function() {
                        c.$instance.detach();
                    });
                }
            }
        }
    };
    b.featherlight = function(d, c) {
        b.proxy(a.methods.setup, null, c, d)();
    };
    b.fn.featherlight = function(d, c) {
        b(this).each(function() {
            b.proxy(a.methods.setup, this, d, c)();
        });
    };
    b.extend(b.featherlight, a);
    b(document).ready(function() {
        var c = b.featherlight.defaults;
        if (c.autostart) {
            b(c.selector, c.context).featherlight();
        }
    });
}(jQuery));


/* jquery.browser.js */

(function(c) {
    var a, b = navigator.userAgent || "";
    c.uaMatch = function(e) {
        e = e.toLowerCase();
        var d = /(chrome)[ \/]([\w.]+)/.exec(e) || /(webkit)[ \/]([\w.]+)/.exec(e) || /(opera)(?:.*version)?[ \/]([\w.]+)/.exec(e) || /(msie) ([\w.]+)/.exec(e) || e.indexOf("compatible") < 0 && /(mozilla)(?:.*? rv:([\w.]+))?/.exec(e) || [];
        return {
            browser: d[1] || "",
            version: d[2] || "0"
        };
    };
    a = c.uaMatch(b);
    c.browser = {};
    if (a.browser) {
        c.browser[a.browser] = true;
        c.browser.version = a.version;
    }
    if (c.browser.webkit) {
        c.browser.safari = true;
    }
}(Tc.$));

/* jquery.iframe-auto-height.js */

(function(b) {
    b.fn.iframeAutoHeight = function(l) {
        var j;
        if (b.browser === j) {
            var i = [];
            i.push("WARNING: you appear to be using a newer version of jquery which does not support the $.browser variable.");
            i.push("The jQuery iframe auto height plugin relies heavly on the $.browser features.");
            i.push("Install jquery-browser: https://raw.github.com/house9/jquery-iframe-auto-height/master/release/jquery.browser.js");
            alert(i.join(" "));
            return b;
        }
        var k = b.extend({
            heightOffset: 0,
            minHeight: 0,
            callback: function(c) {},
            animate: false,
            debug: false,
            diagnostics: false,
            resetToMinHeight: false,
            triggerFunctions: [],
            heightCalculationOverrides: []
        }, l);
        function a(c) {
            if (k.debug && k.debug === true && window.console) {
                console.log(c);
            }
        }
        function h(c, d) {
            a("Diagnostics from '" + d + "'");
            try {
                a("  " + b(c, window.top.document).contents().find("body")[0].scrollHeight + " for ...find('body')[0].scrollHeight");
                a("  " + b(c.contentWindow.document).height() + " for ...contentWindow.document).height()");
                a("  " + b(c.contentWindow.document.body).height() + " for ...contentWindow.document.body).height()");
            } catch (e) {
                a("  unable to check in this state");
            }
            a("End diagnostics -> results vary by browser and when diagnostics are requested");
        }
        a(k);
        return this.each(function() {
            var c = ["webkit", "mozilla", "msie", "opera"];
            var d = [];
            d["default"] = function(n, o, s, m) {
                return o[0].scrollHeight + s.heightOffset;
            };
            jQuery.each(c, function(m, n) {
                d[n] = d["default"];
            });
            jQuery.each(k.heightCalculationOverrides, function(m, n) {
                d[n.browser] = n.calculation;
            });
            function q(m) {
                var n = null;
                jQuery.each(c, function(s, o) {
                    if (m[o]) {
                        n = d[o];
                        return false;
                    }
                });
                if (n === null) {
                    n = d["default"];
                }
                return n;
            }
            var f = 0;
            function p(s) {
                if (k.diagnostics) {
                    h(s, "resizeHeight");
                }
                if (k.resetToMinHeight && k.resetToMinHeight === true) {
                    s.style.height = k.minHeight + "px";
                }
                var o = b(s, window.top.document).contents().find("body");
                var n = q(b.browser);
                var m = n(s, o, k, b.browser);
                a(m);
                if (m < k.minHeight) {
                    a("new height is less than minHeight");
                    m = k.minHeight + k.heightOffset;
                }
                a("New Height: " + m);
                if (k.animate) {
                    b(s).animate({
                        height: m + "px"
                    }, {
                        duration: 500
                    });
                } else {
                    s.style.height = m + "px";
                }
                k.callback.apply(b(s), [{
                    newFrameHeight: m
                }
                ]);
            }
            a(this);
            if (k.diagnostics) {
                h(this, "each iframe");
            }
            if (k.triggerFunctions.length > 0) {
                a(k.triggerFunctions.length + " trigger Functions");
                for (var g = 0; g < k.triggerFunctions.length; g++) {
                    k.triggerFunctions[g](p, this);
                }
            }
            if (b.browser.webkit || b.browser.opera) {
                a("browser is webkit or opera");
                b(this).load(function() {
                    var m = 0;
                    var o = this;
                    var n = function() {
                        p(o);
                    };
                    if (f === 0) {
                        m = 500;
                    } else {
                        o.style.height = k.minHeight + "px";
                    }
                    a("load delay: " + m);
                    setTimeout(n, m);
                    f++;
                });
                var e = b(this).attr("src");
                b(this).attr("src", "");
                b(this).attr("src", e);
            } else {
                b(this).load(function() {
                    p(this);
                });
            }
        });
    };
}(jQuery));

/* jquery.mobile.custom.min.js */

/*! jQuery Mobile v1.4.0 | Copyright 2010, 2013 jQuery Foundation, Inc. | jquery.org/license */

(function(e, t, n) {
    typeof define == "function" && define.amd ? define(["jquery"], function(r) {
        return n(r, e, t), r.mobile
    }) : n(e.jQuery, e, t)
})(this, document, function(e, t, n, r) {
    (function(e, t, n, r) {
        function T(e) {
            while (e && typeof e.originalEvent != "undefined")
                e = e.originalEvent;
            return e
        }
        function N(t, n) {
            var i = t.type, s, o, a, l, c, h, p, d, v;
            t = e.Event(t), t.type = n, s = t.originalEvent, o = e.event.props, i.search(/^(mouse|click)/)>-1 && (o = f);
            if (s)
                for (p = o.length, l; p;)
                    l = o[--p], t[l] = s[l];
            i.search(/mouse(down|up)|click/)>-1&&!t.which && (t.which = 1);
            if (i.search(/^touch/)!==-1) {
                a = T(s), i = a.touches, c = a.changedTouches, h = i && i.length ? i[0] : c && c.length ? c[0] : r;
                if (h)
                    for (d = 0, v = u.length; d < v; d++)
                        l = u[d], t[l] = h[l]
            }
            return t
        }
        function C(t) {
            var n = {}, r, s;
            while (t) {
                r = e.data(t, i);
                for (s in r)
                    r[s] && (n[s] = n.hasVirtualBinding=!0);
                t = t.parentNode
            }
            return n
        }
        function k(t, n) {
            var r;
            while (t) {
                r = e.data(t, i);
                if (r && (!n || r[n]))
                    return t;
                t = t.parentNode
            }
            return null
        }
        function L() {
            g=!1
        }
        function A() {
            g=!0
        }
        function O() {
            E = 0, v.length = 0, m=!1, A()
        }
        function M() {
            L()
        }
        function _() {
            D(), c = setTimeout(function() {
                c = 0, O()
            }, e.vmouse.resetTimerDuration)
        }
        function D() {
            c && (clearTimeout(c), c = 0)
        }
        function P(t, n, r) {
            var i;
            if (r && r[t] ||!r && k(n.target, t))
                i = N(n, t), e(n.target).trigger(i);
            return i
        }
        function H(t) {
            var n = e.data(t.target, s), r;
            !m && (!E || E !== n) && (r = P("v" + t.type, t), r && (r.isDefaultPrevented() && t.preventDefault(), r.isPropagationStopped() && t.stopPropagation(), r.isImmediatePropagationStopped() && t.stopImmediatePropagation()))
        }
        function B(t) {
            var n = T(t).touches, r, i, o;
            n && n.length === 1 && (r = t.target, i = C(r), i.hasVirtualBinding && (E = w++, e.data(r, s, E), D(), M(), d=!1, o = T(t).touches[0], h = o.pageX, p = o.pageY, P("vmouseover", t, i), P("vmousedown", t, i)))
        }
        function j(e) {
            if (g)
                return;
            d || P("vmousecancel", e, C(e.target)), d=!0, _()
        }
        function F(t) {
            if (g)
                return;
            var n = T(t).touches[0], r = d, i = e.vmouse.moveDistanceThreshold, s = C(t.target);
            d = d || Math.abs(n.pageX - h) > i || Math.abs(n.pageY - p) > i, d&&!r && P("vmousecancel", t, s), P("vmousemove", t, s), _()
        }
        function I(e) {
            if (g)
                return;
            A();
            var t = C(e.target), n, r;
            P("vmouseup", e, t), d || (n = P("vclick", e, t), n && n.isDefaultPrevented() && (r = T(e).changedTouches[0], v.push({
                touchID: E,
                x: r.clientX,
                y: r.clientY
            }), m=!0)), P("vmouseout", e, t), d=!1, _()
        }
        function q(t) {
            var n = e.data(t, i), r;
            if (n)
                for (r in n)
                    if (n[r])
                        return !0;
            return !1
        }
        function R() {}
        function U(t) {
            var n = t.substr(1);
            return {
                setup: function() {
                    q(this) || e.data(this, i, {});
                    var r = e.data(this, i);
                    r[t]=!0, l[t] = (l[t] || 0) + 1, l[t] === 1 && b.bind(n, H), e(this).bind(n, R), y && (l.touchstart = (l.touchstart || 0) + 1, l.touchstart === 1 && b.bind("touchstart", B).bind("touchend", I).bind("touchmove", F).bind("scroll", j))
                },
                teardown: function() {
                    --l[t], l[t] || b.unbind(n, H), y && (--l.touchstart, l.touchstart || b.unbind("touchstart", B).unbind("touchmove", F).unbind("touchend", I).unbind("scroll", j));
                    var r = e(this), s = e.data(this, i);
                    s && (s[t]=!1), r.unbind(n, R), q(this) || r.removeData(i)
                }
            }
        }
        var i = "virtualMouseBindings", s = "virtualTouchID", o = "vmouseover vmousedown vmousemove vmouseup vclick vmouseout vmousecancel".split(" "), u = "clientX clientY pageX pageY screenX screenY".split(" "), a = e.event.mouseHooks ? e.event.mouseHooks.props: [], f = e.event.props.concat(a), l = {}, c = 0, h = 0, p = 0, d=!1, v = [], m=!1, g=!1, y = "addEventListener"in n, b = e(n), w = 1, E = 0, S, x;
        e.vmouse = {
            moveDistanceThreshold: 10,
            clickDistanceThreshold: 10,
            resetTimerDuration: 1500
        };
        for (x = 0; x < o.length; x++)
            e.event.special[o[x]] = U(o[x]);
        y && n.addEventListener("click", function(t) {
            var n = v.length, r = t.target, i, o, u, a, f, l;
            if (n) {
                i = t.clientX, o = t.clientY, S = e.vmouse.clickDistanceThreshold, u = r;
                while (u) {
                    for (a = 0; a < n; a++) {
                        f = v[a], l = 0;
                        if (u === r && Math.abs(f.x - i) < S && Math.abs(f.y - o) < S || e.data(u, s) === f.touchID) {
                            t.preventDefault(), t.stopPropagation();
                            return 
                        }
                    }
                    u = u.parentNode
                }
            }
        }, !0)
    })(e, t, n), function(e) {
        e.mobile = {}
    }(e), function(e, t) {
        var r = {
            touch: "ontouchend"in n
        };
        e.mobile.support = e.mobile.support || {}, e.extend(e.support, r), e.extend(e.mobile.support, r)
    }(e), function(e, t, r) {
        function l(t, n, r) {
            var i = r.type;
            r.type = n, e.event.dispatch.call(t, r), r.type = i
        }
        var i = e(n), s = e.mobile.support.touch, o = "touchmove scroll", u = s ? "touchstart": "mousedown", a = s ? "touchend": "mouseup", f = s ? "touchmove": "mousemove";
        e.each("touchstart touchmove touchend tap taphold swipe swipeleft swiperight scrollstart scrollstop".split(" "), function(t, n) {
            e.fn[n] = function(e) {
                return e ? this.bind(n, e) : this.trigger(n)
            }, e.attrFn && (e.attrFn[n]=!0)
        }), e.event.special.scrollstart = {
            enabled: !0,
            setup: function() {
                function s(e, n) {
                    r = n, l(t, r ? "scrollstart" : "scrollstop", e)
                }
                var t = this, n = e(t), r, i;
                n.bind(o, function(t) {
                    if (!e.event.special.scrollstart.enabled)
                        return;
                    r || s(t, !0), clearTimeout(i), i = setTimeout(function() {
                        s(t, !1)
                    }, 50)
                })
            },
            teardown: function() {
                e(this).unbind(o)
            }
        }, e.event.special.tap = {
            tapholdThreshold: 750,
            emitTapOnTaphold: !0,
            setup: function() {
                var t = this, n = e(t), r=!1;
                n.bind("vmousedown", function(s) {
                    function a() {
                        clearTimeout(u)
                    }
                    function f() {
                        a(), n.unbind("vclick", c).unbind("vmouseup", a), i.unbind("vmousecancel", f)
                    }
                    function c(e) {
                        f(), !r && o === e.target ? l(t, "tap", e) : r && e.stopPropagation()
                    }
                    r=!1;
                    if (s.which && s.which !== 1)
                        return !1;
                    var o = s.target, u;
                    n.bind("vmouseup", a).bind("vclick", c), i.bind("vmousecancel", f), u = setTimeout(function() {
                        e.event.special.tap.emitTapOnTaphold || (r=!0), l(t, "taphold", e.Event("taphold", {
                            target: o
                        }))
                    }, e.event.special.tap.tapholdThreshold)
                })
            },
            teardown: function() {
                e(this).unbind("vmousedown").unbind("vclick").unbind("vmouseup"), i.unbind("vmousecancel")
            }
        }, e.event.special.swipe = {
            scrollSupressionThreshold: 30,
            durationThreshold: 1e3,
            horizontalDistanceThreshold: 30,
            verticalDistanceThreshold: 75,
            start: function(t) {
                var n = t.originalEvent.touches ? t.originalEvent.touches[0]: t;
                return {
                    time: (new Date).getTime(),
                    coords: [n.pageX, n.pageY],
                    origin: e(t.target)
                }
            },
            stop: function(e) {
                var t = e.originalEvent.touches ? e.originalEvent.touches[0]: e;
                return {
                    time: (new Date).getTime(),
                    coords: [t.pageX, t.pageY]
                }
            },
            handleSwipe: function(t, n, r, i) {
                if (n.time - t.time < e.event.special.swipe.durationThreshold && Math.abs(t.coords[0] - n.coords[0]) > e.event.special.swipe.horizontalDistanceThreshold && Math.abs(t.coords[1] - n.coords[1]) < e.event.special.swipe.verticalDistanceThreshold) {
                    var s = t.coords[0] > n.coords[0] ? "swipeleft": "swiperight";
                    return l(r, "swipe", e.Event("swipe", {
                        target: i,
                        swipestart: t,
                        swipestop: n
                    })), l(r, s, e.Event(s, {
                        target: i,
                        swipestart: t,
                        swipestop: n
                    })), !0
                }
                return !1
            },
            setup: function() {
                var t = this, n = e(t);
                n.bind(u, function(r) {
                    function l(n) {
                        if (!s)
                            return;
                        i = e.event.special.swipe.stop(n), u || (u = e.event.special.swipe.handleSwipe(s, i, t, o)), Math.abs(s.coords[0] - i.coords[0]) > e.event.special.swipe.scrollSupressionThreshold && n.preventDefault()
                    }
                    var i, s = e.event.special.swipe.start(r), o = r.target, u=!1;
                    n.bind(f, l).one(a, function() {
                        u=!0, n.unbind(f, l)
                    })
                })
            },
            teardown: function() {
                e(this).unbind(u).unbind(f).unbind(a)
            }
        }, e.each({
            scrollstop: "scrollstart",
            taphold: "tap",
            swipeleft: "swipe",
            swiperight: "swipe"
        }, function(t, n) {
            e.event.special[t] = {
                setup: function() {
                    e(this).bind(n, e.noop)
                },
                teardown: function() {
                    e(this).unbind(n)
                }
            }
        })
    }(e, this)
});


/* jquery.tablesorter.min.js */

(function($) {
    $.extend({
        tablesorter: new
        function() {
            var parsers = [], widgets = [];
            this.defaults = {
                cssHeader: "header",
                cssAsc: "headerSortUp",
                cssDesc: "headerSortDown",
                cssChildRow: "expand-child",
                sortInitialOrder: "asc",
                sortMultiSortKey: "shiftKey",
                sortForce: null,
                sortAppend: null,
                sortLocaleCompare: true,
                textExtraction: "simple",
                parsers: {},
                widgets: [],
                widgetZebra: {
                    css: ["even", "odd"]
                },
                headers: {},
                widthFixed: false,
                cancelSelection: true,
                sortList: [],
                headerList: [],
                dateFormat: "us",
                decimal: '/\.|\,/g',
                onRenderHeader: null,
                selectorHeaders: 'thead th',
                debug: false
            };
            function benchmark(s, d) {
                log(s + "," + (new Date().getTime() - d.getTime()) + "ms");
            }
            this.benchmark = benchmark;
            function log(s) {
                if (typeof console != "undefined" && typeof console.debug != "undefined") {
                    console.log(s);
                } else {
                    alert(s);
                }
            }
            function buildParserCache(table, $headers) {
                if (table.config.debug) {
                    var parsersDebug = "";
                }
                if (table.tBodies.length == 0)
                    return;
                var rows = table.tBodies[0].rows;
                if (rows[0]) {
                    var list = [], cells = rows[0].cells, l = cells.length;
                    for (var i = 0; i < l; i++) {
                        var p = false;
                        if ($.metadata && ($($headers[i]).metadata() && $($headers[i]).metadata().sorter)) {
                            p = getParserById($($headers[i]).metadata().sorter);
                        } else if ((table.config.headers[i] && table.config.headers[i].sorter)) {
                            p = getParserById(table.config.headers[i].sorter);
                        }
                        if (!p) {
                            p = detectParserForColumn(table, rows, - 1, i);
                        }
                        if (table.config.debug) {
                            parsersDebug += "column:" + i + " parser:" + p.id + "\n";
                        }
                        list.push(p);
                    }
                }
                if (table.config.debug) {
                    log(parsersDebug);
                }
                return list;
            };
            function detectParserForColumn(table, rows, rowIndex, cellIndex) {
                var l = parsers.length, node = false, nodeValue = false, keepLooking = true;
                while (nodeValue == '' && keepLooking) {
                    rowIndex++;
                    if (rows[rowIndex]) {
                        node = getNodeFromRowAndCellIndex(rows, rowIndex, cellIndex);
                        nodeValue = trimAndGetNodeText(table.config, node);
                        if (table.config.debug) {
                            log('Checking if value was empty on row:' + rowIndex);
                        }
                    } else {
                        keepLooking = false;
                    }
                }
                for (var i = 1; i < l; i++) {
                    if (parsers[i].is(nodeValue, table, node)) {
                        return parsers[i];
                    }
                }
                return parsers[0];
            }
            function getNodeFromRowAndCellIndex(rows, rowIndex, cellIndex) {
                return rows[rowIndex].cells[cellIndex];
            }
            function trimAndGetNodeText(config, node) {
                return $.trim(getElementText(config, node));
            }
            function getParserById(name) {
                var l = parsers.length;
                for (var i = 0; i < l; i++) {
                    if (parsers[i].id.toLowerCase() == name.toLowerCase()) {
                        return parsers[i];
                    }
                }
                return false;
            }
            function buildCache(table) {
                if (table.config.debug) {
                    var cacheTime = new Date();
                }
                var totalRows = (table.tBodies[0] && table.tBodies[0].rows.length) || 0, totalCells = (table.tBodies[0].rows[0] && table.tBodies[0].rows[0].cells.length) || 0, parsers = table.config.parsers, cache = {
                    row: [],
                    normalized: []
                };
                for (var i = 0; i < totalRows; ++i) {
                    var c = $(table.tBodies[0].rows[i]), cols = [];
                    if (c.hasClass(table.config.cssChildRow)) {
                        cache.row[cache.row.length - 1] = cache.row[cache.row.length - 1].add(c);
                        continue;
                    }
                    cache.row.push(c);
                    for (var j = 0; j < totalCells; ++j) {
                        cols.push(parsers[j].format(getElementText(table.config, c[0].cells[j]), table, c[0].cells[j]));
                    }
                    cols.push(cache.normalized.length);
                    cache.normalized.push(cols);
                    cols = null;
                };
                if (table.config.debug) {
                    benchmark("Building cache for " + totalRows + " rows:", cacheTime);
                }
                return cache;
            };
            function getElementText(config, node) {
                var text = "";
                if (!node)
                    return "";
                if (!config.supportsTextContent)
                    config.supportsTextContent = node.textContent || false;
                if (config.textExtraction == "simple") {
                    if (config.supportsTextContent) {
                        text = node.textContent;
                    } else {
                        if (node.childNodes[0] && node.childNodes[0].hasChildNodes()) {
                            text = node.childNodes[0].innerHTML;
                        } else {
                            text = node.innerHTML;
                        }
                    }
                } else {
                    if (typeof(config.textExtraction) == "function") {
                        text = config.textExtraction(node);
                    } else {
                        text = $(node).text();
                    }
                }
                return text;
            }
            function appendToTable(table, cache) {
                if (table.config.debug) {
                    var appendTime = new Date()
                }
                var c = cache, r = c.row, n = c.normalized, totalRows = n.length, checkCell = (n[0].length - 1), tableBody = $(table.tBodies[0]), rows = [];
                for (var i = 0; i < totalRows; i++) {
                    var pos = n[i][checkCell];
                    rows.push(r[pos]);
                    if (!table.config.appender) {
                        var l = r[pos].length;
                        for (var j = 0; j < l; j++) {
                            tableBody[0].appendChild(r[pos][j]);
                        }
                    }
                }
                if (table.config.appender) {
                    table.config.appender(table, rows);
                }
                rows = null;
                if (table.config.debug) {
                    benchmark("Rebuilt table:", appendTime);
                }
                applyWidget(table);
                setTimeout(function() {
                    $(table).trigger("sortEnd");
                }, 0);
            };
            function buildHeaders(table) {
                if (table.config.debug) {
                    var time = new Date();
                }
                var meta = ($.metadata) ? true: false;
                var header_index = computeTableHeaderCellIndexes(table);
                $tableHeaders = $(table.config.selectorHeaders, table).each(function(index) {
                    this.column = header_index[this.parentNode.rowIndex + "-" + this.cellIndex];
                    this.order = formatSortingOrder(table.config.sortInitialOrder);
                    this.count = this.order;
                    if (checkHeaderMetadata(this) || checkHeaderOptions(table, index))
                        this.sortDisabled = true;
                    if (checkHeaderOptionsSortingLocked(table, index))
                        this.order = this.lockedOrder = checkHeaderOptionsSortingLocked(table, index);
                    if (!this.sortDisabled) {
                        var $th = $(this).addClass(table.config.cssHeader);
                        if (table.config.onRenderHeader)
                            table.config.onRenderHeader.apply($th);
                    }
                    table.config.headerList[index] = this;
                });
                if (table.config.debug) {
                    benchmark("Built headers:", time);
                    log($tableHeaders);
                }
                return $tableHeaders;
            };
            function computeTableHeaderCellIndexes(t) {
                var matrix = [];
                var lookup = {};
                var thead = t.getElementsByTagName('THEAD')[0];
                var trs = thead.getElementsByTagName('TR');
                for (var i = 0; i < trs.length; i++) {
                    var cells = trs[i].cells;
                    for (var j = 0; j < cells.length; j++) {
                        var c = cells[j];
                        var rowIndex = c.parentNode.rowIndex;
                        var cellId = rowIndex + "-" + c.cellIndex;
                        var rowSpan = c.rowSpan || 1;
                        var colSpan = c.colSpan || 1
                        var firstAvailCol;
                        if (typeof(matrix[rowIndex]) == "undefined") {
                            matrix[rowIndex] = [];
                        }
                        for (var k = 0; k < matrix[rowIndex].length + 1; k++) {
                            if (typeof(matrix[rowIndex][k]) == "undefined") {
                                firstAvailCol = k;
                                break;
                            }
                        }
                        lookup[cellId] = firstAvailCol;
                        for (var k = rowIndex; k < rowIndex + rowSpan; k++) {
                            if (typeof(matrix[k]) == "undefined") {
                                matrix[k] = [];
                            }
                            var matrixrow = matrix[k];
                            for (var l = firstAvailCol; l < firstAvailCol + colSpan; l++) {
                                matrixrow[l] = "x";
                            }
                        }
                    }
                }
                return lookup;
            }
            function checkCellColSpan(table, rows, row) {
                var arr = [], r = table.tHead.rows, c = r[row].cells;
                for (var i = 0; i < c.length; i++) {
                    var cell = c[i];
                    if (cell.colSpan > 1) {
                        arr = arr.concat(checkCellColSpan(table, headerArr, row++));
                    } else {
                        if (table.tHead.length == 1 || (cell.rowSpan > 1 ||!r[row + 1])) {
                            arr.push(cell);
                        }
                    }
                }
                return arr;
            };
            function checkHeaderMetadata(cell) {
                if (($.metadata) && ($(cell).metadata().sorter === false)) {
                    return true;
                };
                return false;
            }
            function checkHeaderOptions(table, i) {
                if ((table.config.headers[i]) && (table.config.headers[i].sorter === false)) {
                    return true;
                };
                return false;
            }
            function checkHeaderOptionsSortingLocked(table, i) {
                if ((table.config.headers[i]) && (table.config.headers[i].lockedOrder))
                    return table.config.headers[i].lockedOrder;
                return false;
            }
            function applyWidget(table) {
                var c = table.config.widgets;
                var l = c.length;
                for (var i = 0; i < l; i++) {
                    getWidgetById(c[i]).format(table);
                }
            }
            function getWidgetById(name) {
                var l = widgets.length;
                for (var i = 0; i < l; i++) {
                    if (widgets[i].id.toLowerCase() == name.toLowerCase()) {
                        return widgets[i];
                    }
                }
            };
            function formatSortingOrder(v) {
                if (typeof(v) != "Number") {
                    return (v.toLowerCase() == "desc") ? 1 : 0;
                } else {
                    return (v == 1) ? 1 : 0;
                }
            }
            function isValueInArray(v, a) {
                var l = a.length;
                for (var i = 0; i < l; i++) {
                    if (a[i][0] == v) {
                        return true;
                    }
                }
                return false;
            }
            function setHeadersCss(table, $headers, list, css) {
                $headers.removeClass(css[0]).removeClass(css[1]);
                var h = [];
                $headers.each(function(offset) {
                    if (!this.sortDisabled) {
                        h[this.column] = $(this);
                    }
                });
                var l = list.length;
                for (var i = 0; i < l; i++) {
                    h[list[i][0]].addClass(css[list[i][1]]);
                }
            }
            function fixColumnWidth(table, $headers) {
                var c = table.config;
                if (c.widthFixed) {
                    var colgroup = $('<colgroup>');
                    $("tr:first td", table.tBodies[0]).each(function() {
                        colgroup.append($('<col>').css('width', $(this).width()));
                    });
                    $(table).prepend(colgroup);
                };
            }
            function updateHeaderSortCount(table, sortList) {
                var c = table.config, l = sortList.length;
                for (var i = 0; i < l; i++) {
                    var s = sortList[i], o = c.headerList[s[0]];
                    o.count = s[1];
                    o.count++;
                }
            }
            function multisort(table, sortList, cache) {
                if (table.config.debug) {
                    var sortTime = new Date();
                }
                var dynamicExp = "var sortWrapper = function(a,b) {", l = sortList.length;
                for (var i = 0; i < l; i++) {
                    var c = sortList[i][0];
                    var order = sortList[i][1];
                    var s = (table.config.parsers[c].type == "text") ? ((order == 0) ? makeSortFunction("text", "asc", c) : makeSortFunction("text", "desc", c)): ((order == 0) ? makeSortFunction("numeric", "asc", c) : makeSortFunction("numeric", "desc", c));
                    var e = "e" + i;
                    dynamicExp += "var " + e + " = " + s;
                    dynamicExp += "if(" + e + ") { return " + e + "; } ";
                    dynamicExp += "else { ";
                }
                var orgOrderCol = cache.normalized[0].length - 1;
                dynamicExp += "return a[" + orgOrderCol + "]-b[" + orgOrderCol + "];";
                for (var i = 0; i < l; i++) {
                    dynamicExp += "}; ";
                }
                dynamicExp += "return 0; ";
                dynamicExp += "}; ";
                if (table.config.debug) {
                    benchmark("Evaling expression:" + dynamicExp, new Date());
                }
                eval(dynamicExp);
                cache.normalized.sort(sortWrapper);
                if (table.config.debug) {
                    benchmark("Sorting on " + sortList.toString() + " and dir " + order + " time:", sortTime);
                }
                return cache;
            };
            function makeSortFunction(type, direction, index) {
                var a = "a[" + index + "]", b = "b[" + index + "]";
                if (type == 'text' && direction == 'asc') {
                    return "(" + a + " == " + b + " ? 0 : (" + a + " === null ? Number.POSITIVE_INFINITY : (" + b + " === null ? Number.NEGATIVE_INFINITY : (" + a + " < " + b + ") ? -1 : 1 )));";
                } else if (type == 'text' && direction == 'desc') {
                    return "(" + a + " == " + b + " ? 0 : (" + a + " === null ? Number.POSITIVE_INFINITY : (" + b + " === null ? Number.NEGATIVE_INFINITY : (" + b + " < " + a + ") ? -1 : 1 )));";
                } else if (type == 'numeric' && direction == 'asc') {
                    return "(" + a + " === null && " + b + " === null) ? 0 :(" + a + " === null ? Number.POSITIVE_INFINITY : (" + b + " === null ? Number.NEGATIVE_INFINITY : " + a + " - " + b + "));";
                } else if (type == 'numeric' && direction == 'desc') {
                    return "(" + a + " === null && " + b + " === null) ? 0 :(" + a + " === null ? Number.POSITIVE_INFINITY : (" + b + " === null ? Number.NEGATIVE_INFINITY : " + b + " - " + a + "));";
                }
            };
            function makeSortText(i) {
                return "((a[" + i + "] < b[" + i + "]) ? -1 : ((a[" + i + "] > b[" + i + "]) ? 1 : 0));";
            };
            function makeSortTextDesc(i) {
                return "((b[" + i + "] < a[" + i + "]) ? -1 : ((b[" + i + "] > a[" + i + "]) ? 1 : 0));";
            };
            function makeSortNumeric(i) {
                return "a[" + i + "]-b[" + i + "];";
            };
            function makeSortNumericDesc(i) {
                return "b[" + i + "]-a[" + i + "];";
            };
            function sortText(a, b) {
                if (table.config.sortLocaleCompare)
                    return a.localeCompare(b);
                return ((a < b)?-1 : ((a > b) ? 1 : 0));
            };
            function sortTextDesc(a, b) {
                if (table.config.sortLocaleCompare)
                    return b.localeCompare(a);
                return ((b < a)?-1 : ((b > a) ? 1 : 0));
            };
            function sortNumeric(a, b) {
                return a - b;
            };
            function sortNumericDesc(a, b) {
                return b - a;
            };
            function getCachedSortType(parsers, i) {
                return parsers[i].type;
            };
            this.construct = function(settings) {
                return this.each(function() {
                    if (!this.tHead ||!this.tBodies)
                        return;
                    var $this, $document, $headers, cache, config, shiftDown = 0, sortOrder;
                    this.config = {};
                    config = $.extend(this.config, $.tablesorter.defaults, settings);
                    $this = $(this);
                    $.data(this, "tablesorter", config);
                    $headers = buildHeaders(this);
                    this.config.parsers = buildParserCache(this, $headers);
                    cache = buildCache(this);
                    var sortCSS = [config.cssDesc, config.cssAsc];
                    fixColumnWidth(this);
                    $headers.click(function(e) {
                        var totalRows = ($this[0].tBodies[0] && $this[0].tBodies[0].rows.length) || 0;
                        if (!this.sortDisabled && totalRows > 0) {
                            $this.trigger("sortStart");
                            var $cell = $(this);
                            var i = this.column;
                            this.order = this.count++%2;
                            if (this.lockedOrder)
                                this.order = this.lockedOrder;
                            if (!e[config.sortMultiSortKey]) {
                                config.sortList = [];
                                if (config.sortForce != null) {
                                    var a = config.sortForce;
                                    for (var j = 0; j < a.length; j++) {
                                        if (a[j][0] != i) {
                                            config.sortList.push(a[j]);
                                        }
                                    }
                                }
                                config.sortList.push([i, this.order]);
                            } else {
                                if (isValueInArray(i, config.sortList)) {
                                    for (var j = 0; j < config.sortList.length; j++) {
                                        var s = config.sortList[j], o = config.headerList[s[0]];
                                        if (s[0] == i) {
                                            o.count = s[1];
                                            o.count++;
                                            s[1] = o.count%2;
                                        }
                                    }
                                } else {
                                    config.sortList.push([i, this.order]);
                                }
                            };
                            setTimeout(function() {
                                setHeadersCss($this[0], $headers, config.sortList, sortCSS);
                                appendToTable($this[0], multisort($this[0], config.sortList, cache));
                            }, 1);
                            return false;
                        }
                    }).mousedown(function() {
                        if (config.cancelSelection) {
                            this.onselectstart = function() {
                                return false
                            };
                            return false;
                        }
                    });
                    $this.bind("update", function() {
                        var me = this;
                        setTimeout(function() {
                            me.config.parsers = buildParserCache(me, $headers);
                            cache = buildCache(me);
                        }, 1);
                    }).bind("updateCell", function(e, cell) {
                        var config = this.config;
                        var pos = [(cell.parentNode.rowIndex - 1), cell.cellIndex];
                        cache.normalized[pos[0]][pos[1]] = config.parsers[pos[1]].format(getElementText(config, cell), cell);
                    }).bind("sorton", function(e, list) {
                        $(this).trigger("sortStart");
                        config.sortList = list;
                        var sortList = config.sortList;
                        updateHeaderSortCount(this, sortList);
                        setHeadersCss(this, $headers, sortList, sortCSS);
                        appendToTable(this, multisort(this, sortList, cache));
                    }).bind("appendCache", function() {
                        appendToTable(this, cache);
                    }).bind("applyWidgetId", function(e, id) {
                        getWidgetById(id).format(this);
                    }).bind("applyWidgets", function() {
                        applyWidget(this);
                    });
                    if ($.metadata && ($(this).metadata() && $(this).metadata().sortlist)) {
                        config.sortList = $(this).metadata().sortlist;
                    }
                    if (config.sortList.length > 0) {
                        $this.trigger("sorton", [config.sortList]);
                    }
                    applyWidget(this);
                });
            };
            this.addParser = function(parser) {
                var l = parsers.length, a = true;
                for (var i = 0; i < l; i++) {
                    if (parsers[i].id.toLowerCase() == parser.id.toLowerCase()) {
                        a = false;
                    }
                }
                if (a) {
                    parsers.push(parser);
                };
            };
            this.addWidget = function(widget) {
                widgets.push(widget);
            };
            this.formatFloat = function(s) {
                var i = parseFloat(s);
                return (isNaN(i)) ? 0 : i;
            };
            this.formatInt = function(s) {
                var i = parseInt(s);
                return (isNaN(i)) ? 0 : i;
            };
            this.isDigit = function(s, config) {
                return /^[-+]?\d*$/.test($.trim(s.replace(/[,.']/g, '')));
            };
            this.clearTableBody = function(table) {
                if ($.browser.msie) {
                    function empty() {
                        while (this.firstChild)
                            this.removeChild(this.firstChild);
                    }
                    empty.apply(table.tBodies[0]);
                } else {
                    table.tBodies[0].innerHTML = "";
                }
            };
        }
    });
    $.fn.extend({
        tablesorter: $.tablesorter.construct
    });
    var ts = $.tablesorter;
    ts.addParser({
        id: "text",
        is: function(s) {
            return true;
        },
        format: function(s) {
            return $.trim(s.toLocaleLowerCase());
        },
        type: "text"
    });
    ts.addParser({
        id: "digit",
        is: function(s, table) {
            var c = table.config;
            return $.tablesorter.isDigit(s, c);
        },
        format: function(s) {
            return $.tablesorter.formatFloat(s);
        },
        type: "numeric"
    });
    ts.addParser({
        id: "currency",
        is: function(s) {
            return /^[£$€?.]/.test(s);
        },
        format: function(s) {
            return $.tablesorter.formatFloat(s.replace(new RegExp(/[£$€]/g), ""));
        },
        type: "numeric"
    });
    ts.addParser({
        id: "ipAddress",
        is: function(s) {
            return /^\d{2,3}[\.]\d{2,3}[\.]\d{2,3}[\.]\d{2,3}$/.test(s);
        },
        format: function(s) {
            var a = s.split("."), r = "", l = a.length;
            for (var i = 0; i < l; i++) {
                var item = a[i];
                if (item.length == 2) {
                    r += "0" + item;
                } else {
                    r += item;
                }
            }
            return $.tablesorter.formatFloat(r);
        },
        type: "numeric"
    });
    ts.addParser({
        id: "url",
        is: function(s) {
            return /^(https?|ftp|file):\/\/$/.test(s);
        },
        format: function(s) {
            return jQuery.trim(s.replace(new RegExp(/(https?|ftp|file):\/\//), ''));
        },
        type: "text"
    });
    ts.addParser({
        id: "isoDate",
        is: function(s) {
            return /^\d{4}[\/-]\d{1,2}[\/-]\d{1,2}$/.test(s);
        },
        format: function(s) {
            return $.tablesorter.formatFloat((s != "") ? new Date(s.replace(new RegExp(/-/g), "/")).getTime() : "0");
        },
        type: "numeric"
    });
    ts.addParser({
        id: "percent",
        is: function(s) {
            return /\%$/.test($.trim(s));
        },
        format: function(s) {
            return $.tablesorter.formatFloat(s.replace(new RegExp(/%/g), ""));
        },
        type: "numeric"
    });
    ts.addParser({
        id: "usLongDate",
        is: function(s) {
            return s.match(new RegExp(/^[A-Za-z]{3,10}\.? [0-9]{1,2}, ([0-9]{4}|'?[0-9]{2}) (([0-2]?[0-9]:[0-5][0-9])|([0-1]?[0-9]:[0-5][0-9]\s(AM|PM)))$/));
        },
        format: function(s) {
            return $.tablesorter.formatFloat(new Date(s).getTime());
        },
        type: "numeric"
    });
    ts.addParser({
        id: "shortDate",
        is: function(s) {
            return /\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/.test(s);
        },
        format: function(s, table) {
            var c = table.config;
            s = s.replace(/\-/g, "/");
            if (c.dateFormat == "us") {
                s = s.replace(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/, "$3/$1/$2");
            } else if (c.dateFormat == "pt") {
                s = s.replace(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/, "$3/$2/$1");
            } else if (c.dateFormat == "uk") {
                s = s.replace(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/, "$3/$2/$1");
            } else if (c.dateFormat == "dd/mm/yy" || c.dateFormat == "dd-mm-yy") {
                s = s.replace(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2})/, "$1/$2/$3");
            }
            return $.tablesorter.formatFloat(new Date(s).getTime());
        },
        type: "numeric"
    });
    ts.addParser({
        id: "time",
        is: function(s) {
            return /^(([0-2]?[0-9]:[0-5][0-9])|([0-1]?[0-9]:[0-5][0-9]\s(am|pm)))$/.test(s);
        },
        format: function(s) {
            return $.tablesorter.formatFloat(new Date("2000/01/01 " + s).getTime());
        },
        type: "numeric"
    });
    ts.addParser({
        id: "metadata",
        is: function(s) {
            return false;
        },
        format: function(s, table, cell) {
            var c = table.config, p = (!c.parserMetadataName) ? 'sortValue': c.parserMetadataName;
            return $(cell).metadata()[p];
        },
        type: "numeric"
    });
    ts.addWidget({
        id: "zebra",
        format: function(table) {
            if (table.config.debug) {
                var time = new Date();
            }
            var $tr, row =- 1, odd;
            $("tr:visible", table.tBodies[0]).each(function(i) {
                $tr = $(this);
                if (!$tr.hasClass(table.config.cssChildRow))
                    row++;
                odd = (row%2 == 0);
                $tr.removeClass(table.config.widgetZebra.css[odd ? 0: 1]).addClass(table.config.widgetZebra.css[odd ? 1: 0])
            });
            if (table.config.debug) {
                $.tablesorter.benchmark("Applying Zebra widget", time);
            }
        }
    });
})(jQuery);



/* lscache.min.js */

/**
 * lscache library
 * Copyright (c) 2011, Pamela Fox
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/*jshint undef:true, browser:true */
var lscache = function() {
    var k = "lscache-";
    var q = "-cacheexpiration";
    var n = 10;
    var j = 60 * 1000;
    var d = Math.floor(8640000000000000 / j);
    var c;
    var l;
    var e = "";
    var g = false;
    function i() {
        var s = "__lscachetest__";
        var t = s;
        if (c !== undefined) {
            return c;
        }
        try {
            h(s, t);
            o(s);
            c = true;
        } catch (r) {
            c = false;
        }
        return c;
    }
    function a() {
        if (l === undefined) {
            l = (window.JSON != null);
        }
        return l;
    }
    function f(r) {
        return r + q;
    }
    function b() {
        return Math.floor((new Date().getTime()) / j);
    }
    function p(r) {
        return localStorage.getItem(k + e + r);
    }
    function h(r, s) {
        localStorage.removeItem(k + e + r);
        localStorage.setItem(k + e + r, s);
    }
    function o(r) {
        localStorage.removeItem(k + e + r);
    }
    function m(s, r) {
        if (!g) {
            return;
        }
        if (!"console" in window || typeof window.console.warn !== "function") {
            return;
        }
        window.console.warn("lscache - " + s);
        if (r) {
            window.console.warn("lscache - The error was: " + r.message);
        }
    }
    return {
        set: function(y, x, t) {
            if (!i()) {
                return;
            }
            if (typeof x !== "string") {
                if (!a()) {
                    return;
                }
                try {
                    x = JSON.stringify(x);
                } catch (w) {
                    return;
                }
            }
            try {
                h(y, x);
            } catch (w) {
                if (w.name === "QUOTA_EXCEEDED_ERR" || w.name === "NS_ERROR_DOM_QUOTA_REACHED" || w.name === "QuotaExceededError") {
                    var A = [];
                    var s;
                    for (var v = 0; v < localStorage.length; v++) {
                        s = localStorage.key(v);
                        if (s.indexOf(k + e) === 0 && s.indexOf(q) < 0) {
                            var B = s.substr((k + e).length);
                            var r = f(B);
                            var z = p(r);
                            if (z) {
                                z = parseInt(z, n);
                            } else {
                                z = d;
                            }
                            A.push({
                                key: B,
                                size: (p(B) || "").length,
                                expiration: z
                            });
                        }
                    }
                    A.sort(function(D, C) {
                        return (C.expiration - D.expiration);
                    });
                    var u = (x || "").length;
                    while (A.length && u > 0) {
                        s = A.pop();
                        m("Cache is full, removing item with key '" + y + "'");
                        o(s.key);
                        o(f(s.key));
                        u -= s.size;
                    }
                    try {
                        h(y, x);
                    } catch (w) {
                        m("Could not add item with key '" + y + "', perhaps it's too big?", w);
                        return;
                    }
                } else {
                    m("Could not add item with key '" + y + "'", w);
                    return;
                }
            }
            if (t) {
                h(f(y), (b() + t).toString(n));
            } else {
                o(f(y));
            }
        },
        get: function(s) {
            if (!i()) {
                return null;
            }
            var r = f(s);
            var w = p(r);
            if (w) {
                var v = parseInt(w, n);
                if (b() >= v) {
                    o(s);
                    o(r);
                    return null;
                }
            }
            var t = p(s);
            if (!t ||!a()) {
                return t;
            }
            try {
                return JSON.parse(t);
            } catch (u) {
                return t;
            }
        },
        remove: function(r) {
            if (!i()) {
                return null;
            }
            o(r);
            o(f(r));
        },
        supported: function() {
            return i();
        },
        flush: function() {
            if (!i()) {
                return;
            }
            for (var s = localStorage.length - 1; s >= 0; --s) {
                var r = localStorage.key(s);
                if (r.indexOf(k + e) === 0) {
                    localStorage.removeItem(r);
                }
            }
        },
        setBucket: function(r) {
            e = r;
        },
        resetBucket: function() {
            e = "";
        },
        enableWarnings: function(r) {
            g = r;
        }
    };
}();


/* yepnope.1.5.4-min.js */

/*yepnope1.5.x|WTFPL*/
(function(a, b, c) {
    function d(a) {
        return "[object Function]" == o.call(a)
    }
    function e(a) {
        return "string" == typeof a
    }
    function f() {}
    function g(a) {
        return !a || "loaded" == a || "complete" == a || "uninitialized" == a
    }
    function h() {
        var a = p.shift();
        q = 1, a ? a.t ? m(function() {
            ("c" == a.t ? B.injectCss : B.injectJs)(a.s, 0, a.a, a.x, a.e, 1)
        }, 0) : (a(), h()) : q = 0
    }
    function i(a, c, d, e, f, i, j) {
        function k(b) {
            if (!o && g(l.readyState) && (u.r = o = 1, !q && h(), l.onload = l.onreadystatechange = null, b)) {
                "img" != a && m(function() {
                    t.removeChild(l)
                }, 50);
                for (var d in y[c])
                    y[c].hasOwnProperty(d) && y[c][d].onload()
            }
        }
        var j = j || B.errorTimeout, l = b.createElement(a), o = 0, r = 0, u = {
            t: d,
            s: c,
            e: f,
            a: i,
            x: j
        };
        1 === y[c] && (r = 1, y[c] = []), "object" == a ? l.data = c : (l.src = c, l.type = a), l.width = l.height = "0", l.onerror = l.onload = l.onreadystatechange = function() {
            k.call(this, r)
        }, p.splice(e, 0, u), "img" != a && (r || 2 === y[c] ? (t.insertBefore(l, s ? null : n), m(k, j)) : y[c].push(l))
    }
    function j(a, b, c, d, f) {
        return q = 0, b = b || "j", e(a) ? i("c" == b ? v : u, a, b, this.i++, c, d, f) : (p.splice(this.i++, 0, a), 1 == p.length && h()), this
    }
    function k() {
        var a = B;
        return a.loader = {
            load: j,
            i: 0
        }, a
    }
    var l = b.documentElement, m = a.setTimeout, n = b.getElementsByTagName("script")[0], o = {}.toString, p = [], q = 0, r = "MozAppearance"in l.style, s = r&&!!b.createRange().compareNode, t = s ? l: n.parentNode, l = a.opera && "[object Opera]" == o.call(a.opera), l=!!b.attachEvent&&!l, u = r ? "object" : l ? "script" : "img", v = l ? "script" : u, w = Array.isArray || function(a) {
        return "[object Array]" == o.call(a)
    }, x = [], y = {}, z = {
        timeout: function(a, b) {
            return b.length && (a.timeout = b[0]), a
        }
    }, A, B;
    B = function(a) {
        function b(a) {
            var a = a.split("!"), b = x.length, c = a.pop(), d = a.length, c = {
                url: c,
                origUrl: c,
                prefixes: a
            }, e, f, g;
            for (f = 0; f < d; f++)
                g = a[f].split("="), (e = z[g.shift()]) && (c = e(c, g));
            for (f = 0; f < b; f++)
                c = x[f](c);
            return c
        }
        function g(a, e, f, g, h) {
            var i = b(a), j = i.autoCallback;
            i.url.split(".").pop().split("?").shift(), i.bypass || (e && (e = d(e) ? e : e[a] || e[g] || e[a.split("/").pop().split("?")[0]]), i.instead ? i.instead(a, e, f, g, h) : (y[i.url] ? i.noexec=!0 : y[i.url] = 1, f.load(i.url, i.forceCSS ||!i.forceJS && "css" == i.url.split(".").pop().split("?").shift() ? "c" : c, i.noexec, i.attrs, i.timeout), (d(e) || d(j)) && f.load(function() {
                k(), e && e(i.origUrl, h, g), j && j(i.origUrl, h, g), y[i.url] = 2
            })))
        }
        function h(a, b) {
            function c(a, c) {
                if (a) {
                    if (e(a))
                        c || (j = function() {
                            var a = [].slice.call(arguments);
                            k.apply(this, a), l()
                        }), g(a, j, b, 0, h);
                    else if (Object(a) === a)
                        for (n in m = function() {
                            var b = 0, c;
                            for (c in a)
                                a.hasOwnProperty(c) && b++;
                                return b
                            }(), a)
                                a.hasOwnProperty(n) && (!c&&!--m && (d(j) ? j = function() {
                                    var a = [].slice.call(arguments);
                                    k.apply(this, a), l()
                                } : j[n] = function(a) {
                                    return function() {
                                        var b = [].slice.call(arguments);
                                        a && a.apply(this, b), l()
                                    }
                                }(k[n])), g(a[n], j, b, n, h))
                } else 
                    !c && l()
            }
            var h=!!a.test, i = a.load || a.both, j = a.callback || f, k = j, l = a.complete || f, m, n;
            c(h ? a.yep : a.nope, !!i), i && c(i)
        }
        var i, j, l = this.yepnope.loader;
        if (e(a))
            g(a, 0, l, 0);
        else if (w(a))
            for (i = 0; i < a.length; i++)
                j = a[i], e(j) ? g(j, 0, l, 0) : w(j) ? B(j) : Object(j) === j && h(j, l);
        else 
            Object(a) === a && h(a, l)
    }, B.addPrefix = function(a, b) {
        z[a] = b
    }, B.addFilter = function(a) {
        x.push(a)
    }, B.errorTimeout = 1e4, null == b.readyState && b.addEventListener && (b.readyState = "loading", b.addEventListener("DOMContentLoaded", A = function() {
        b.removeEventListener("DOMContentLoaded", A, 0), b.readyState = "complete"
    }, 0)), a.yepnope = k(), a.yepnope.executeStack = h, a.yepnope.injectJs = function(a, c, d, e, i, j) {
        var k = b.createElement("script"), l, o, e = e || B.errorTimeout;
        k.src = a;
        for (o in d)
            k.setAttribute(o, d[o]);
        c = j ? h : c || f, k.onreadystatechange = k.onload = function() {
            !l && g(k.readyState) && (l = 1, c(), k.onload = k.onreadystatechange = null)
        }, m(function() {
            l || (l = 1, c(1))
        }, e), i ? k.onload() : n.parentNode.insertBefore(k, n)
    }, a.yepnope.injectCss = function(a, c, d, e, g, i) {
        var e = b.createElement("link"), j, c = i ? h: c || f;
        e.href = a, e.rel = "stylesheet", e.type = "text/css";
        for (j in d)
            e.setAttribute(j, d[j]);
        g || (n.parentNode.insertBefore(e, n), m(c, 0))
    }
})(this, document);


/* breadcrumb.js */

(function(a) {
    Tc.Module.Breadcrumb = Tc.Module.extend({
        on: function(e) {
            var c = this, b = c.$ctx, d = b.find(".js-breads");
            d.on("click", "a + a + a", function(h) {
                var g = a(this), f = g.find("span");
                if (f.is(":hidden")) {
                    g.addClass("visible");
                    g.nextUntil("a:last-child").addClass("visible");
                    h.preventDefault();
                }
            });
            e();
        }
    });
}(Tc.$));

/* comments.js */

(function(a) {
    Tc.Module.Comments = Tc.Module.extend({
        on: function(d) {
            var c = this, b = c.$ctx;
            a(".js-message", b).on("keyup change", function() {
                c._updateCount(a(this));
            });
            a(".js-message", b).each(function() {
                c._updateCount(a(this));
            });
            d();
        },
        _updateCount: function(e) {
            var d = this, c = d.$ctx;
            var b = 1000;
            a(".js-letters", c).text(b - e.val().length);
        }
    });
}(Tc.$));

/* dbquery.js */

(function(a) {
    Tc.Module.DbQuery = Tc.Module.extend({
        currentPage: 1,
        numPages: 0,
        $pages: null,
        init: function(d, b, f) {
            this._super(d, b, f);
            var e = this.$pages = a(".js-page", d);
            var c = e.index(a(".js-active", d));
            this.currentPage = c==-1 ? 1 : c + 1;
            this.numPages = e.length;
        },
        on: function(h) {
            var g = this, f = this.$ctx;
            var c = a(".js-cur", f);
            a(".js-of", f).text(g.numPages);
            c.text(g.currentPage);
            var d = a(".js-next", f);
            var e = a(".js-prev", f);
            var b = function() {
                d.removeClass("inactive");
                e.removeClass("inactive");
                if (g.currentPage === g.numPages) {
                    d.addClass("inactive");
                }
                if (g.currentPage === 1) {
                    e.addClass("inactive");
                }
            };
            b();
            d.on("click", function() {
                if (g.currentPage < g.numPages) {
                    c.text(++g.currentPage);
                    b();
                    a(".js-active", f).removeClass("js-active page-active");
                    g.$pages.eq(g.currentPage - 1).addClass("js-active page-active");
                }
                return false;
            });
            e.on("click", function() {
                if (g.currentPage > 1) {
                    c.text(--g.currentPage);
                    b();
                    a(".js-active", f).removeClass("js-active page-active");
                    g.$pages.eq(g.currentPage - 1).addClass("js-active page-active");
                }
                return false;
            });
        }
    });
}(Tc.$));

/* directlinks.js */

(function(a) {
    Tc.Module.Directlinks = Tc.Module.extend({
        on: function(d) {
            var c = this, b = c.$ctx;
            a("select", b).on("change", function() {
                var e = a(this).val();
                if (e) {
                    window.location = e;
                }
                return false;
            });
            d();
        }
    });
}(Tc.$));

/* emergency.js */

(function(a) {
    Tc.Module.Emergency = Tc.Module.extend({
        on: function(d) {
            var c = this, b = c.$ctx;
            b.load(b.data("url"));
            d();
        }
    });
}(Tc.$));

/* gallery.js */

(function(a) {
    Tc.Module.Gallery = Tc.Module.extend({
        init: function(c, b, e) {
            this._super(c, b, e);
            var d = this;
            if (typeof a.fn.featherlight === "function") {
                d.bind();
            }
        },
        bind: function() {
            var b = this;
            a('a[rel="showbox"]', b.$ctx).featherlight({
                type: {
                    image: true
                },
                open: function(f) {
                    a.proxy(a.featherlight.methods.open, this, f)();
                    var g = this, d = this.$elm.parents(".photo").find(".caption").text(), c = this.$elm.parents(".photo").find(".longdesc").text(), e = g.$instance.find("img");
                    e.load(function() {
                        e.stop().fadeTo(300, 1).nextAll().remove();
                        var j = this, k = g.$elm.closest("dl.media"), l = function(n) {
                            e.fadeTo(100, 0.2);
                            d = n.find(".caption").text();
                            c = n.find(".longdesc").text();
                            g.$elm = n.find('a[rel="showbox"]:eq(0)');
                            j.src = g.$elm.attr("href");
                        }, h = a('<em class="' + g.config.namespace + '-next"><span>&#9658;<span></em>').click(function() {
                            var n = k.next("dl.media");
                            if (n.length < 1) {
                                n = k.prevAll("dl.media").last();
                            }
                            l(n);
                        }), i = a('<em class="' + g.config.namespace + '-prev"><span>&#9668;<span></em>').click(function() {
                            var n = k.prev("dl.media");
                            if (n.length < 1) {
                                n = k.nextAll("dl.media").last();
                            }
                            l(n);
                        }), m = a('<p class="' + g.config.namespace + '-caption"><strong>' + d + "</strong> " + c + "</p>");
                        e.on("swiperight", function() {
                            i.click();
                        }).on("swipeleft", function() {
                            h.click();
                        });
                        e.after(i).after(h).after(m.fadeIn(300));
                    });
                }
            });
        }
    });
}(Tc.$));

/* iframe.js */

(function(a) {
    Tc.Module.Iframe = Tc.Module.extend({
        on: function(b) {
            b();
        }
    });
}(Tc.$));

/* iframe-autoheight.js */

(function(a) {
    Tc.Module.Iframe.Autoheight = function(b) {
        this.on = function(c) {
            this.$ctx.iframeAutoHeight();
            b.on(c);
        };
    };
}(Tc.$));

/* map.js */

(function(a) {
    Tc.Module.Map = Tc.Module.extend({
        on: function(f) {
            var d = this, b = d.$ctx, c = b.data("map-id");
            window.map = window.map || {};
            window.map[c] = window.map[c] || {};
            window.mapmeta = window.mapmeta || {};
            window.mapmeta.requested = window.mapmeta.requested || false;
            window.mapmeta.initialize = window.mapmeta.initialize || function() {
                for (var g in window.map) {
                    if (window.map.hasOwnProperty(g)) {
                        window.map[g].init();
                    }
                }
            };
            window.map[c]["init"] = function() {
                var q;
                switch (b.data("type")) {
                case"hybrid":
                    q = google.maps.MapTypeId.HYBRID;
                    break;
                case"satellite":
                    q = google.maps.MapTypeId.SATELLITE;
                    break;
                case"terrain":
                    q = google.maps.MapTypeId.TERRAIN;
                    break;
                default:
                    q = google.maps.MapTypeId.ROADMAP;
                    break;
                }
                var l = {
                    zoom: b.data("zoom"),
                    mapTypeId: q,
                    center: new google.maps.LatLng(b.data("lat"), b.data("lng"))
                };
                var g = new google.maps.Map(a(".map-canvas", b)[0], l);
                var k = b.data("pois") || "", r = b.data("numbered"), t = d.sandbox.getConfigParam("basePath") || "", m = [], j, s, o, p, n, h;
                k = k.split(";");
                if (k.length) {
                    for (o = 0, p = k.length; o < p; o++) {
                        if (k[o]) {
                            j = k[o].split(",");
                            if (j.length >= 2) {
                                if (j.length === 3) {
                                    s = j[2];
                                } else {
                                    if (r) {
                                        s = o + 1;
                                    } else {
                                        s = "";
                                    }
                                }
                                h = t + "assets/img/map/marker" + s + ".png";
                                n = new google.maps.Marker({
                                    position: new google.maps.LatLng(j[0], j[1]),
                                    icon: h,
                                    map: g
                                });
                            }
                        }
                    }
                }
            };
            function e(h) {
                var g = document.createElement("script");
                g.type = "text/javascript";
                g.src = h;
                document.body.appendChild(g);
            }
            if (!window.mapmeta.requested) {
                window.mapmeta.requested = true;
                e("https://maps.googleapis.com/maps/api/js?v=3.exp&sensor=false&callback=mapmeta.initialize");
            }
            f();
        }
    });
}(Tc.$));

/* newsgallery.js */

(function(a) {
    Tc.Module.NewsGallery = Tc.Module.extend({
        currentItem: 0,
        itemsCount: 0,
        maxSlide: 7,
        endSlide: 0,
        slideWidth: 130,
        fadeSpeed: 200,
        historyToken: "bild-",
        init: function(c, b, d) {
            this._super(c, b, d);
            this.historyToken += d + "-";
            this._historyChange();
            if (typeof window.onhashchange == "object") {
                window.onhashchange = a.proxy(function() {
                    var e = this.currentItem;
                    this._historyChange();
                    if (e != this.currentItem) {
                        this.after();
                    }
                }, this);
            }
        },
        _historyChange: function() {
            var b = window.location.hash.split(this.historyToken);
            if (typeof b.length == "number" && (1 * b[1])) {
                this.currentItem = (1 * b[1]) - 1;
            }
        },
        on: function(d) {
            var c = this, b = c.$ctx;
            c.$next = b.find(".js-next");
            c.$prev = b.find(".js-prev");
            c.$large = b.find(".js-large");
            c.$caption = b.find(".js-caption");
            c.$filmstrip = b.find(".js-filmstrip");
            c.$slider = c.$filmstrip.find(".js-slider");
            c.$items = c.$filmstrip.find(".js-item");
            c.$thumb = c.$filmstrip.find(".js-thumb");
            c.$left = c.$filmstrip.find(".js-left");
            c.$right = c.$filmstrip.find(".js-right");
            c.$cur = b.find(".js-cur").text(c.currentItem + 1);
            c.$of = b.find(".js-of").text(c.$thumb.length);
            c.$stage = c.$caption.add(c.$large);
            c.itemsCount = c.$thumb.length;
            c._setMaxSlide();
            a(window).on("resize orientationchange", function() {
                c._setMaxSlide();
            });
            if (c.currentItem < 0) {
                c.currentItem = 0;
            }
            if (c.currentItem > c.itemsCount - 1) {
                c.currentItem = c.itemsCount - 1;
            }
            a(".js-thumb", b).click(a.proxy(c._activate, c));
            b.on("click", ".js-next", a.proxy(c._next, c));
            b.on("click", ".js-prev", a.proxy(c._prev, c));
            b.on("swiperight", a.proxy(c._prev, c)).on("swipeleft", a.proxy(c._next, c));
            b.on("click", ".js-left", a.proxy(c._slideLeft, c));
            b.on("click", ".js-right", a.proxy(c._slideRight, c));
            d();
        },
        _setMaxSlide: function() {
            var b = this, c = b.$filmstrip.width();
            b.maxSlide = Math.floor(c / b.slideWidth);
            b.endSlide = (b.itemsCount - b.maxSlide > 0) ? b.itemsCount - b.maxSlide : 0;
        },
        _updateIndex: function() {
            if (this.currentItem > 0 && this.itemsCount > this.maxSlide) {
                this.$left.removeClass("inactive");
            } else {
                this.$left.addClass("inactive");
            }
            if (this.currentItem >= this.endSlide) {
                this.$right.addClass("inactive");
            } else {
                this.$right.removeClass("inactive");
            }
            if (this.currentItem + 1 === this.itemsCount) {
                this.$next.addClass("inactive");
            } else {
                this.$next.removeClass("inactive");
            }
            if (this.currentItem < 1) {
                this.$prev.addClass("inactive");
            } else {
                this.$prev.removeClass("inactive");
            }
            this.$cur.text(this.currentItem + 1);
        },
        _next: function(b) {
            b.preventDefault();
            this.$thumb.eq(this.currentItem + 1).click();
        },
        _prev: function(b) {
            b.preventDefault();
            if (this.currentItem > 0) {
                this.$thumb.eq(this.currentItem - 1).click();
            }
        },
        _slideRight: function(b) {
            b.preventDefault();
            if (!this.$right.hasClass("inactive")) {
                if (!this.$thumb.eq(this.currentItem + this.maxSlide).click()) {
                    this.$thumb.last().click();
                }
            }
        },
        _slideLeft: function(b) {
            b.preventDefault();
            if (!this.$left.hasClass("inactive")) {
                if (this.currentItem - this.maxSlide < 0) {
                    this.$thumb.first().click();
                } else {
                    this.$thumb.eq(this.currentItem - this.maxSlide).click();
                }
            }
        },
        _activate: function(i) {
            var f = this;
            i.preventDefault();
            i.stopPropagation();
            try {
                var h = a(i.target).parents(".js-item");
                if (h.hasClass("active")) {
                    return;
                }
                this.currentItem = this.$thumb.index(i.target);
                this._updateIndex();
                window.location.hash = "#" + this.historyToken + (this.currentItem + 1);
                var f = this, g = document.createElement("img"), d = false, j = function() {
                    d = true;
                    b();
                }, b = function() {
                    if (d) {
                        d = false;
                        f.$caption.html(i.target.alt);
                        f.$large.css("background-image", "url(" + g.src + ")");
                        a(g).remove();
                        f.$stage.stop().fadeTo(f.fadeSpeed * 1.5, 1, function() {
                            f.$items.removeClass("active").eq(f.currentItem).addClass("active");
                            var e = f.currentItem <= f.endSlide ? f.currentItem: f.endSlide;
                            f.$slider.stop().animate({
                                marginLeft: e * f.slideWidth*-1 + "px"
                            }, f.fadeSpeed);
                        });
                    }
                };
                a(g).on("load", a.proxy(j, this));
                g.src = h.attr("href");
                if (!d) {
                    this.$stage.stop().fadeTo(this.fadeSpeed, 0.002, b);
                }
            } catch (c) {
                return false;
            } finally {
                return true;
            }
        },
        after: function() {
            this.$thumb.eq(this.currentItem).click();
        }
    });
}(Tc.$));

/* person.js */

(function(a) {
    Tc.Module.Person = Tc.Module.extend({
        on: function(d) {
            var c = this, b = c.$ctx;
            b.on("click", 'a[href^="mailto:"]', function() {
                this.href = this.href.replace(/\(at\)/, "@").replace(/\(dot\)/g, ".").replace(/\(.*\)/g, "");
            });
            d();
        }
    });
}(Tc.$));

/* player.js */

(function(a) {
    Tc.Module.Player = Tc.Module.extend({
        on: function(b) {
            b();
        }
    });
}(Tc.$));

/* player-audio.js */

(function(a) {
    Tc.Module.Player.Audio = function(b) {
        this.nativeAudioIfPossible = true;
        this.uid = 0;
        this.on = function(f) {
            var d = this, c = d.$ctx, e = d.sandbox.getConfigParam("basePath") || "";
            if (typeof document.createElement("audio").play !== "function" ||!d.nativeAudioIfPossible) {
                d.$ctx.find(".mediaplayer-media").each(function() {
                    a(this).attr("id", "player" + d.id + "-" + d.uid++);
                });
            }
            if (typeof document.createElement("audio").play !== "function" ||!d.nativeAudioIfPossible) {
                yepnope({
                    load: e + "assets/incl/flowplayer/flowplayer-3.2.13.min.js",
                    complete: function() {
                        a(".mediaplayer-media", c).each(function() {
                            var n = a(this), i = n.find("audio"), k = e + "assets/incl/flowplayer/flowplayer-3.2.18.swf", j = n.css("background-image"), g = i.find("source:eq(0)").attr("src"), l = i.prop("autoplay"), m = i.prop("preload");
                            j = j.substr(4, j.length - 5);
                            i.remove();
                            var h = {
                                canvas: {
                                    background: "#000000",
                                    backgroundGradient: "none"
                                },
                                plugins: {
                                    controls: {
                                        fullscreen: false,
                                        height: 25,
                                        autoHide: false,
                                        backgroundColor: "transparent",
                                        backgroundGradient: "none",
                                        sliderColor: "#000000",
                                        sliderBorder: "none",
                                        volumeSliderColor: "#FFFFFF",
                                        volumeBorder: "none",
                                        timeColor: "#dddddd",
                                        durationColor: "#ffffff",
                                        tooltipColor: "rgba(255, 255, 255, 0.7)",
                                        tooltipTextColor: "#000000"
                                    }
                                },
                                clip: {
                                    autoBuffering: m,
                                    autoPlay: l,
                                    url: g
                                }
                            };
                            if (j) {
                                h.clip.coverImage = {
                                    url: j,
                                    scaling: "orig"
                                };
                            }
                            flowplayer(this.id, k, h);
                        });
                    }
                });
            }
            b.on(f);
        };
    };
}(Tc.$));

/* player-video.js */

(function(a) {
    Tc.Module.Player.Video = function(b) {
        this.on = function(f) {
            var d = this, c = d.$ctx, e = d.sandbox.getConfigParam("basePath");
            yepnope({
                both: [e + "assets/incl/flowplayer/flowplayer.js"],
                complete: function() {
                    a(".mediaplayer-media", c).flowplayer({
                        splash: false
                    });
                }
            });
            b.on(f);
        };
    };
}(Tc.$));

/* searchgoogle.js */

(function(a) {
    Tc.Module.SearchGoogle = Tc.Module.extend({
        on: function(i) {
            var e = this, d = e.$ctx, c = d.find(".js-search"), h = d.find(".js-searchInput"), g = h.prev("label");
            h.on("focus", function() {
                g.hide();
            }).on("focusout", function() {
                if (h.val() == "") {
                    g.show();
                } else {
                    g.hide();
                }
            });
            c.on("submit", function() {
                var o = a(this);
                var q = o.serializeArray();
                var n = [];
                var m = true;
                for (var l = 0, k = q.length; l < k; l++) {
                    var p = q[l];
                    if (p.name === "q") {
                        if (a.trim(p.value) === "") {
                            m = false;
                        }
                        n.push(p.value);
                    } else {
                        if (p.name === "site") {
                            n.push("site:" + p.value);
                        }
                    }
                }
                if (m) {
                    j(n.join(" "));
                }
                return false;
            });
            var f = function() {
                if (document.readyState == "complete") {
                    b();
                } else {
                    google.setOnLoadCallback(function() {
                        b();
                    }, true);
                }
            };
            var b = function() {
                google.search.cse.element.render({
                    div: "cse-searchresults",
                    tag: "searchresults-only",
                    gname: "cse-searchresults",
                    attributes: {
                        queryParameterName: "none"
                    }
                });
                c.trigger("submit");
            };
            var j = function(k) {
                google.search.cse.element.getElement("cse-searchresults").execute(k);
            };
            window.__gcse = {
                parsetags: "explicit",
                callback: f
            };
            (function() {
                var k = "009347054195260226203:hahgnjx1tks";
                var m = document.createElement("script");
                m.type = "text/javascript";
                m.async = true;
                m.src = (document.location.protocol == "https" ? "https:" : "http:") + "//www.google.com/cse/cse.js?cx=" + k;
                var l = document.getElementsByTagName("script")[0];
                l.parentNode.insertBefore(m, l);
            })();
            i();
        }
    });
}(Tc.$));

/* sitefunctions.js */

(function(a) {
    Tc.Module.Sitefunctions = Tc.Module.extend({
        lsttl: null,
        on: function(d) {
            var c = this, b = c.$ctx;
            b.on("click", ".js-print", function() {
                window.print();
            }).on("click", ".js-font", function(f) {
                f.preventDefault();
                a("body").toggleClass("skin-layout-bigfont");
                lscache.set("skin-layout-bigfont", a("body").is(".skin-layout-bigfont"), c.lsttl);
            });
            if (lscache.get("skin-layout-bigfont")) {
                a("body").addClass("skin-layout-bigfont");
            }
            d();
        }
    });
}(Tc.$));

/* streetmap.js */

(function(a) {
    Tc.Module.StreetMap = Tc.Module.extend({
        on: function(g) {
            var c = this, b = c.$ctx, f = "street-map-canvas-" + c.id, e = b.data("width") || null;
            b.find(".street-map-canvas").attr("id", f);
            window.UZHMap = {
                buildingCode: b.data("building-code"),
                elementId: f,
                zoomLevel: b.data("zoom-level") || 6
            };
            if (e != null) {
                b.find("#" + f).css("width", e);
            }
            function d(i) {
                var h = document.createElement("script");
                h.type = "text/javascript";
                h.src = i;
                document.body.appendChild(h);
            }
            d("https://www.plaene.uzh.ch/js/mapApi.js");
            g();
        }
    });
}(Tc.$));

/* text.js */

(function(a) {
    Tc.Module.Text = Tc.Module.extend({
        on: function(f) {
            var d = this, c = d.$ctx;
            c.find('a[rel="showbox"]').featherlight({
                type: {
                    image: true
                }
            });
            c.find("h2.toggle,h3.toggle").each(function() {
                a(this).data("closed", true).next("div").hide();
            });
            c.on("click", "h2.toggle, h3.toggle", function() {
                a(this).next("div").slideToggle("fast");
            });
            var e = a("table", c);
            e.each(function() {
                var h = a(this);
                h.wrap('<div class="helper-scroll"></div>');
                var i = h.parent();
                var j = a('<div class="helper-scroll-right hidden"><i class="icon-circle-arrow-right"></i></div>');
                i.before(j);
                var g = i.outerHeight() - 10;
                j.height(g).on("click", function(l) {
                    var k = i.scrollLeft() + 100;
                    i.animate({
                        scrollLeft: k
                    }, 300);
                });
            });
            var b = function() {
                e.each(function() {
                    var g = a(this), h = g.closest(".helper-scroll");
                    if (g.width() > (h.width() + 18)) {
                        h.prev().removeClass("hidden");
                    } else {
                        h.prev().addClass("hidden");
                    }
                });
            };
            a(window).on("resize orientationchange", function() {
                b();
            });
            b();
            f();
        }
    });
}(Tc.$));

/* topimagerotator.js */

(function(a) {
    Tc.Module.TopImageRotator = Tc.Module.extend({
        on: function(f) {
            var d = this, c = d.$ctx, b = c.data("images").split(",");
            function e(h, g) {
                return Math.floor(Math.random() * (g - h) + h);
            }
            c.find(".js-activated").prop("src", b[e(0, b.length)]);
            f();
        }
    });
}(Tc.$));


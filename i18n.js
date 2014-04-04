/**
 * @author  Serhiy Oplakanets <serhiy@oplakanets,com>
 * @author  Heavily based node-i18n-2 by John Resig <jeresig@gmail.com>
 * @link    https://github.com/jeresig/i18n-node-2
 *
 * @license http://opensource.org/licenses/MIT
 *
 * @version 0.2.0
 */
var vsprintf  = require("sprintf").vsprintf,
    _         = require('lodash'),
    fs        = require("fs"),
    path      = require("path");


var i18n = module.exports = function(opts) {
  var defaults = {
    defaultLocale: "en",
    extension: ".json",
    directory: "./locales"
  };

  // set options
  var self = this;
  _.each(defaults, function(v,k) {
    if (_.has(opts, k)) {
      self[k] = opts[k];
    } else {
      self[k] = v;
    }
  });

  this.locales = {};
};

i18n.version = "0.2.0";

i18n.prototype = {
  locale: function(currentLocale) {
    currentLocale = (currentLocale !== undefined) ? currentLocale : this.defaultLocale;
    var instance = this;

      return {
        __: instance.__.bind(instance, currentLocale),
        __n: instance.__n.bind(instance, currentLocale),
        getLocale: function() {
          return currentLocale;
        },

        bindTo: function(obj) {
          obj['__'] = instance.__.bind(instance, currentLocale);
          obj['__n'] = instance.__n.bind(instance, currentLocale);
        }
      }
  },

  __: function(locale, string /*, variables... */) {
    var msg = this.translate(locale, string);

    if (arguments.length > 2) {
      msg = vsprintf(msg, Array.prototype.slice.call(arguments, 2));
    }

    return msg;
  },

  __n: function(locale, string, count /*, variables... */) {
    var msg = this.translate(locale, string, true);

    msg = vsprintf(parseInt(count, 10) > 1 ? msg.other : msg.one, [count]);

    if (arguments.length > 3) {
      msg = vsprintf(msg, Array.prototype.slice.call(arguments, 3));
    }

    return msg;
  },

  translate: function(locale, string, plural) {
    if (!locale || !this.locales[locale]) {
      console.warn("WARN: No locale found. Using the default (" + this.defaultLocale + ") as current locale");

      locale = this.defaultLocale;
    }

    if (!this.localeLoaded(locale)) {
      console.warn("WARN: Locale `" + locale + "` not loaded. Use #loadLocale() or #loadFile().");
      this.locales[locale] = {};
    }

    if (!this.locales[locale][string]) {
      console.warn("WARN: Locale `" + locale + "` has no translation for string `" + string + "`");
      this.locales[locale][string] = plural ? { one: string, other: string } : string;
    }

    return this.locales[locale][string];
  },

  loadFile: function(locale, filePath) {
    filePath = (filePath !== undefined) ? filePath : this.locateFile(locale);
    var data = fs.readFileSync(filePath);
    var parsedData = JSON.parse(data);
    this.loadLocale(locale, parsedData);
  },

  locateFile: function(locale) {
    return path.join(this.directory, locale + this.extension);
  },

  loadLocale: function(locale, data) {
    if (!this.locales[locale]) {
      this.locales[locale] = data;
    } else {
      console.warn("WARN: Locale " + locale + " was already initialized.");
    }
  },

  localeLoaded: function(locale) {
    return _.has(this.locales, locale);
  }
};

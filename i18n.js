/**
 * @author  Serhiy Oplakanets <serhiy@oplakanets,com>
 * @author  Heavily based node-i18n-2 by John Resig <jeresig@gmail.com>
 * @link    https://github.com/jeresig/i18n-node-2
 *
 * @license http://opensource.org/licenses/MIT
 *
 * @version 0.1.0
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

i18n.version = "0.1.0";

i18n.prototype = {
  locale: function(currentLocale) {
    currentLocale = (currentLocale !== undefined) ? currentLocale : this.defaultLocale;
    var instance = this;

    return {
      __: function(/* string, variables... */) {
        var msg = instance.translate(currentLocale, arguments[0]);

        if (arguments.length > 1) {
          msg = vsprintf(msg, Array.prototype.slice.call(arguments, 1));
        }

        return msg;
      },

      __n: function(string, count) {
        var msg = instance.translate(currentLocale, string, true);

        msg = vsprintf(parseInt(count, 10) > 1 ? msg.other : msg.one, [count]);

        if (arguments.length > 2) {
          msg = vsprintf(msg, Array.prototype.slice.call(arguments, 2));
        }

        return msg;
      },

      getLocale: function() {
        return currentLocale;
      }
    }
  },

  translate: function(locale, string, plural) {
    if (!locale || !this.locales[locale]) {
      console.warn("WARN: No locale found. Using the default (" + this.defaultLocale + ") as current locale");

      locale = this.defaultLocale;
    }

    if (!this.locales[locale][string]) {
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
  }
};

var assert  = require("assert");
var I18n    = require('../index');
var fs      = require("fs");
var path    = require("path");


describe('dumb-i18n', function() {
  var i18n;

  beforeEach(function() {
    i18n = new I18n();
  });

  it('should use `en` as default locale', function() {
    i18n.loadLocale('en', localeFixture('en'));

    assert.equal('Hello!', i18n.locale('ch').__('Hello'));
  });

  it('should override default options', function() {
    // TODO: Violating encapsulation here. Should I care?

    assert.equal('en', i18n.defaultLocale);
    assert.equal('.json', i18n.extension);
    assert.equal('./locales', i18n.directory);

    var anotherI18n = new I18n({
      defaultLocale: 'es',
      extension: '.js',
      directory: './strings'
    });
    assert.equal('es', anotherI18n.defaultLocale);
    assert.equal('.js', anotherI18n.extension);
    assert.equal('./strings', anotherI18n.directory);
  });

  describe('#loadLocale(locale, data)', function() {
    it('should load translations from object', function() {
      i18n.loadLocale('en', localeFixture('en'));

      assert.equal('Hello!', i18n.locale('en').__('Hello'));
    });

    it('should load multiple translations from object', function() {
      i18n.loadLocale('en', localeFixture('en'));
      i18n.loadLocale('es', localeFixture('es'));

      assert.equal('Hello!', i18n.locale('en').__('Hello'));
      assert.equal('¡Hola!', i18n.locale('es').__('Hello'));
    });
  });

  describe('#loadFile(locale, file)', function() {
    it('should load translations from file', function() {
      i18n.loadFile('en', localeFile('en'));

      assert.equal('Hello!', i18n.locale('en').__('Hello'));
    });

    it('should load translations from multiple files', function() {
      i18n.loadFile('en', localeFile('en'));
      i18n.loadFile('es', localeFile('es'));

      assert.equal('Hello!', i18n.locale('en').__('Hello'));
      assert.equal('¡Hola!', i18n.locale('es').__('Hello'));
    });

    it('should locate locale file if not specified', function() {
      i18n = new I18n({directory: path.join(__dirname, 'locales')});
      i18n.loadFile('en');

      assert.equal('Hello!', i18n.locale('en').__('Hello'));
    });
  });

  describe('#locale(locale)', function() {
    it('should set local', function() {
      assert.equal('en', i18n.locale('en').getLocale());
    });

    it('should use default locale if not specified', function() {
      assert.equal('en', i18n.locale().getLocale());
    });
  });

  describe('#getLocale()', function() {
    it('should return current locale', function() {
      assert.equal('en', i18n.locale('en').getLocale());
      assert.equal('es', i18n.locale('es').getLocale());
      assert.equal('uk', i18n.locale('uk').getLocale());
    });
  });

  describe('#__(string, params...)', function() {
    beforeEach(function() {
      i18n.loadLocale('en', localeFixture('en'));
    });

    it('should substitute variable', function() {
      assert.equal('Hello, John!', i18n.locale('en').__('Hello, %s', 'John'));
    });

    it('should substitute multiple variables', function() {
      var T = i18n.locale('en');

      assert.equal('Hello, John. Today is Monday',
        T.__('Hello, %s. Today is %s', 'John', 'Monday'));
      assert.equal('Hello, John. Today is your lucky day',
        T.__('Hello, %s. Today is %s', 'John', 'your lucky day'));
      assert.equal("Office days are Mo, Tu, We, Th and Fr",
        T.__("Office days are %s, %s, %s, %s and %s", 'Mo', 'Tu', 'We', 'Th', 'Fr'));
    });

    it('should substitute variables in multiple locales', function() {
      i18n.loadLocale('es', localeFixture('es'));

      assert.equal('Hello, John!', i18n.locale('en').__('Hello, %s', 'John'));
      assert.equal('¡Hola, Juan!', i18n.locale('es').__('Hola, %s', 'Juan'));
    });

    it('should use provided string if translation not found', function() {
      assert.equal('No such string in translation file',
        i18n.locale('en').__('No such string in %s', 'translation file'));
    });
  });

  describe('#__n(string, params...)', function() {
    var T;
    beforeEach(function() {
      i18n.loadLocale('en', localeFixture('en'));
      T = i18n.locale('en');
    });

    it('should correctly pluralize', function() {
      assert.equal('1 cat', T.__n('%s cats', 1));
      assert.equal('2 cats', T.__n('%s cats', 2));
      assert.equal('5 cats', T.__n('%s cats', 5));
      assert.equal('10 cats', T.__n('%s cats', 10));
      assert.equal('21 cats', T.__n('%s cats', 21));
    });

    it('should pluralize and substitue variables', function() {
      assert.equal('1 cat is at home', T.__n('%s cats are at %s', 1, 'home'));
      assert.equal('2 cats are at the bar', T.__n('%s cats are at %s', 2, 'the bar'));
    });

    it('should use provided string if translation not found', function() {
      assert.equal('1 not existing string', T.__n('%s not existing string', 1));
      assert.equal('2 not existing string', T.__n('%s not existing string', 2));
    });
  });
});


function localeFile(locale) {
  return path.join(__dirname, 'locales', locale + ".json");
}

function localeFixture(locale) {
  var data = fs.readFileSync(localeFile(locale));
  return JSON.parse(data);
}

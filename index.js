
var bind = require('bind');
var clone = require('clone');
var debug = require('debug')('geckoboard');
var request = require('superagent');

/**
 * Expose `Geckoboard`.
 */

module.exports = Geckoboard;

/**
 * Create a new `Geckoboard` with an `apiKey`.
 *
 * @param {String} apiKey
 */

function Geckoboard (apiKey) {
  return function WidgetFactory (widgetId, options) {
    return new Widget(apiKey, widgetId, options);
  };
}

/**
 * Colors for pie chart.
 */

var colors = ['FFFF10AA', 'FFAA0AAA', 'FF5505AA', 'FF0000AA', '8B008B', '43CD80', 'FF4500'];

/**
 * Create a new `Widget` with an `apiKey` and `widgetId`.
 *
 * @param {String} apiKey
 * @param {String} widgetId
 * @param {Object} options
 */

function Widget (apiKey, widgetId, options) {
  if (!(this instanceof Widget)) return new Widget(apiKey, widgetId, options);
  if (!apiKey) throw new Error('Widget requires a apiKey.');
  if (!widgetId) throw new Error('Widget requires a widgetId.');
  this.apiKey = apiKey;
  this.widgetId = widgetId;
  this.options = options || {};
  bind.all(this);
}

/**
 * Push a number payload.
 * http://www.geckoboard.com/developers/custom-widgets/widget-types/number-and-optional-secondary-stat
 *
 * @param {String} num
 * @param {Function} callback
 */

Widget.prototype.number = function (num, callback) {
  var payload = { item: [
    {
      text: this.options.label1 || '',
      prefix: this.options.prefix,
      value: num }
  ]};
  this.push(payload, callback);
};

/**
 * Push a percentage change.
 * http://www.geckoboard.com/developers/custom-widgets/widget-types/number-and-optional-secondary-stat
 *
 * @param {Number} current
 * @param {Number} previous
 * @param {Function} callback
 */

Widget.prototype.percentageChange = function (current, previous, callback) {
  var payload = { item: [
    {
      text: this.options.label1 || '',
      prefix: this.options.prefix,
      value: current
    },
    {
      text: this.options.label2 || '',
      prefix: this.options.prefix,
      value: previous
    }
  ]};
  this.push(payload, callback);
};

/**
 * Push a sparkline.
 * http://www.geckoboard.com/developers/custom-widgets/widget-types/number-and-optional-secondary-stat
 *
 * @param {Array|Number} values
 * @param {Function} callback
 */

Widget.prototype.sparkline = function (values, callback) {
  var payload = { item: [
    {
      text: this.options.label1 || '',
      prefix: this.options.prefix,
      value: values[values.length-1]
    },
    values
  ]};
  this.push(payload, callback);
};

/**
 * Push a pie chart.
 * http://www.geckoboard.com/developers/custom-widgets/widget-types/pie-chart
 *
 * @param {Object} map
 * @param {Function} callback
 */

Widget.prototype.pie = function (map, callback) {
  var payload = { item: [] };
  var colorList = clone(colors);
  Object.keys(map).forEach(function (key, i) {
    var val = map[key];
    payload.item.push({
      label: key,
      value: val,
      colour: colorList.pop() // pop the same color for the same key
    });
  });
  this.push(payload, callback);
};

/**
 * Push a text value.
 * http://www.geckoboard.com/developers/custom-widgets/widget-types/text
 *
 * @param {Object} text
 * @param {Function} callback
 */

Widget.prototype.text = function (text, callback) {
  var payload = { item: [{ text: text }] };
  this.push(payload, callback);
};

/**
 * Push a funnel.
 * http://www.geckoboard.com/developers/custom-widgets/widget-types/funnel
 *
 * @param {Object} map
 * @param {Function} callback
 */

Widget.prototype.funnel = function (map, callback) {
  var payload = {
    type: this.options.reverse ? 'reverse' : 'standard',
    percentage: this.options.percentage ? 'show' : 'hide',
    item: []
  };
  Object.keys(map).forEach(function (key) {
    var val = map[key];
    payload.item.push({ label: key, value: val });
  });
  this.push(payload, callback);
};

/**
 * Push a `payload` payload to a Widget widget.
 *
 * @param {Object} payload
 * @param {Function} callback
 */

Widget.prototype.push = function (payload, callback) {
  var url = 'https://push.geckoboard.com/v1/send/' + this.widgetId;
  debug('pushing geckoboard payload to widget %s ..', this.widgetId);
  request
    .post(url)
    .send({ api_key: this.apiKey, data: payload })
    .end(function (err, res) {
      if (err) return callback(err);
      debug('geckoboard response [%d]: %s', res.statusCode, res.text);
      if (res.statusCode !== 200) return callback(new Error('Widget error: ' + res.text));
      callback();
  });
};
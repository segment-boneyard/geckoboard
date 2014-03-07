
# geckoboard

  [Geckoboard](http://www.geckoboard.com/) API for node -  push data to [custom widgets](http://www.geckoboard.com/developers/custom-widgets).

## Installation

    $ npm install segmentio/geckoboard

## Example

```js
var geckoboard = require('geckoboard')('api-key');
var widget = geckoboard('widget-id');

widget.number(100, function (err) {
    // ..
});
```

## API

#### Geckoboard(apiKey)(widgetId)

  Create a new Geckoboard widget.

#### #number(value, callback)

  Push a number `value` to the widget.

#### #percentageChange(current, previous, callback)

  Push a `current` and `previous` value for a percentage change widget.

#### #sparkline(values, callback)

  Push an array of number `values` to a sparkline widget.

#### #pie(map, callback)

  Push a `map` object mapping text to values to a pie chart widget.

#### #text(text, callback)

  Push `text` to a widget.

## License

MIT
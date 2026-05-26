# @stealth-metrix/date-range-slider

Interactive date range picker built on [noUiSlider](https://refreshless.com/nouislider/). Features a draggable range slider, two-month calendar dropdown, preset buttons, zoom controls, and nudge arrows.


<div align="center">

https://github.com/user-attachments/assets/1ab98d39-f61e-46e6-99b4-7a504b36c673

</div>

## Install

```bash
npm install @stealth-metrix/date-range-slider nouislider
```

## Quick Start

```js
import createDateRangeSlider from '@stealth-metrix/date-range-slider';
import 'nouislider/dist/nouislider.css';
import '@stealth-metrix/date-range-slider/dist/@stealth-metrix/date-range-slider.css';

const picker = createDateRangeSlider('#my-element', {
  onChange: ({ start, end, days }) => {
    console.log(`${start.toLocaleDateString()} — ${end.toLocaleDateString()} (${days} days)`);
  }
});
```

## Script Tag Usage

```html
<link href="node_modules/nouislider/dist/nouislider.css" rel="stylesheet">
<link href="node_modules/@stealth-metrix/date-range-slider/dist/@stealth-metrix/date-range-slider.css" rel="stylesheet">
<script src="node_modules/nouislider/dist/nouislider.js"></script>
<script src="node_modules/@stealth-metrix/date-range-slider/dist/@stealth-metrix/date-range-slider.umd.js"></script>
<script>
  DateRangeSlider('#my-element');
</script>
```

## Options

| Option | Type | Default | Description |
|---|---|---|---|
| `minDate` | `Date` | 3 years ago | Earliest selectable date |
| `maxDate` | `Date` | Today | Latest selectable date |
| `startDate` | `Date` | 1 year ago | Initial start of selection |
| `endDate` | `Date` | Today | Initial end of selection |
| `presets` | `Array` | See below | Preset buttons: `[{label: '7d', days: 7}, ...]` |
| `showPresets` | `boolean` | `true` | Show preset buttons |
| `showZoom` | `boolean` | `true` | Show zoom in/out/reset controls |
| `showNudge` | `boolean` | `true` | Show left/right nudge arrows |
| `showCalendar` | `boolean` | `true` | Show calendar dropdown on date click |
| `onChange` | `Function` | `null` | Callback: `({start, end, days}) => void` |

### Default Presets

```js
[
  { label: '7d', days: 7 },
  { label: '30d', days: 30 },
  { label: '90d', days: 90 },
  { label: '6mo', days: 180 },
  { label: '1yr', days: 365 },
  { label: '2yr', days: 730 },
  { label: 'Max', days: 'max' },  // full range
]
```

## API

The function returns an object with these methods:

### `getRange()`

Returns `{ start: Date, end: Date, days: number }`.

### `setRange(start, end)`

Set the selection programmatically.

```js
picker.setRange(new Date(2024, 0, 1), new Date(2024, 5, 30));
```

### `destroy()`

Remove the slider and clean up the DOM.

## Interactions

| Action | Description |
|---|---|
| **Drag handle** | Move start or end date independently |
| **Drag range bar** | Slide entire range while keeping duration fixed |
| **Click date** | Opens two-month calendar for precise date entry |
| **Preset buttons** | Jump to common ranges (7d, 30d, 90d, etc.) |
| **Nudge arrows** | Shift range by its duration or 7 days (whichever is smaller) |
| **Zoom in/out** | Narrow or widen the visible slider window |
| **MAX indicator** | Appears when the full range is selected |

## Peer Dependencies

- `nouislider` >= 14.0.0

## License

MIT

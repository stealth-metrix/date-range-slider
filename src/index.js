import noUiSlider from 'nouislider';
import 'nouislider/dist/nouislider.css';
import './date-range-slider.css';

const DAY_MS = 24 * 60 * 60 * 1000;
const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

const DEFAULT_PRESETS = [
  { label: '7d', days: 7 },
  { label: '30d', days: 30 },
  { label: '90d', days: 90 },
  { label: '6mo', days: 180 },
  { label: '1yr', days: 365 },
  { label: '2yr', days: 730 },
  { label: 'Max', days: 'max' },
];

function stripTime(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function sameDay(a, b) {
  return a.getFullYear() === b.getFullYear() &&
         a.getMonth() === b.getMonth() &&
         a.getDate() === b.getDate();
}

function daysBetween(d1, d2) {
  return Math.round((d2 - d1) / DAY_MS);
}

function formatShort(date) {
  const month = date.toLocaleDateString('en-US', { month: 'short' });
  const day = String(date.getDate()).padStart(2, '0');
  return `${month} ${day}, ${date.getFullYear()}`;
}

function el(tag, cls, attrs) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (attrs) Object.entries(attrs).forEach(([k, v]) => {
    if (k === 'text') e.textContent = v;
    else if (k === 'html') e.innerHTML = v;
    else e.setAttribute(k, v);
  });
  return e;
}

/**
 * Create a date range slider.
 *
 * @param {HTMLElement|string} target - DOM element or CSS selector
 * @param {Object} [options]
 * @param {Date}   [options.minDate]       - Earliest selectable date (default: 3 years ago)
 * @param {Date}   [options.maxDate]       - Latest selectable date (default: today)
 * @param {Date}   [options.startDate]     - Initial start of selection
 * @param {Date}   [options.endDate]       - Initial end of selection
 * @param {Array}  [options.presets]       - Array of {label, days} objects (days='max' for full range)
 * @param {boolean}[options.showZoom]      - Show zoom controls (default: true)
 * @param {boolean}[options.showNudge]     - Show nudge arrows (default: true)
 * @param {boolean}[options.showCalendar]  - Show calendar on date click (default: true)
 * @param {boolean}[options.showPresets]   - Show preset buttons (default: true)
 * @param {Function}[options.onChange]     - Callback: ({start: Date, end: Date, days: number}) => void
 * @returns {Object} API: { getRange, setRange, destroy }
 */
export default function createDateRangeSlider(target, options = {}) {
  const container = typeof target === 'string' ? document.querySelector(target) : target;
  if (!container) throw new Error('DateRangeSlider: target element not found');

  const now = new Date();
  const today = stripTime(now);

  const minDate = options.minDate ? stripTime(options.minDate) : new Date(today.getFullYear() - 3, today.getMonth(), today.getDate());
  const maxDate = options.maxDate ? stripTime(options.maxDate) : today;
  const startDate = options.startDate ? stripTime(options.startDate) : new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
  const endDate = options.endDate ? stripTime(options.endDate) : today;
  const presets = options.presets || DEFAULT_PRESETS;
  const showZoom = options.showZoom !== false;
  const showNudge = options.showNudge !== false;
  const showCalendar = options.showCalendar !== false;
  const showPresets = options.showPresets !== false;
  const onChange = options.onChange || null;

  const minTs = minDate.getTime();
  const maxTs = maxDate.getTime();
  const MIN_VIEW_DAYS = 14;

  let viewMin = minTs;
  let viewMax = maxTs;
  let calViewMonth, calPicking, calTempStart;

  // ─── Build DOM ───
  container.classList.add('drs-container');

  // Summary row
  const summary = el('div', 'drs-summary');
  const startEl = el('span', 'drs-date', { text: '--' });
  const sep = el('span', 'drs-separator', { html: '&mdash;' });
  const endEl = el('span', 'drs-date', { text: '--' });
  const badge = el('span', 'drs-badge', { text: '--' });
  const maxLabel = el('span', 'drs-max-label', { text: 'MAX' });
  summary.append(startEl, sep, endEl, badge, maxLabel);

  // Calendar overlay + dropdown
  const calOverlay = el('div', 'drs-cal-overlay');
  const calDropdown = el('div', 'drs-cal-dropdown');
  const calGrid = el('div', 'drs-cal-grid');

  function buildCalMonth(side) {
    const month = el('div', 'drs-cal-month');
    const header = el('div', 'drs-cal-header');
    const title = el('span', 'drs-cal-title');
    const navBtn = el('button', 'drs-cal-nav');
    navBtn.innerHTML = side === 'left' ? '&#9664;' : '&#9654;';
    const spacer = el('span');

    if (side === 'left') header.append(navBtn, title, spacer);
    else header.append(spacer, title, navBtn);

    const weekdays = el('div', 'drs-cal-weekdays');
    WEEKDAYS.forEach(d => weekdays.appendChild(el('span', null, { text: d })));

    const days = el('div', 'drs-cal-days');
    month.append(header, weekdays, days);
    return { month, title, nav: navBtn, days };
  }

  const calLeft = buildCalMonth('left');
  const calRight = buildCalMonth('right');
  calGrid.append(calLeft.month, calRight.month);
  const calLabel = el('div', 'drs-cal-label', { html: 'Click a date to set <strong>start</strong>' });
  calDropdown.append(calGrid, calLabel);

  if (showCalendar) {
    summary.append(calOverlay, calDropdown);
  }
  container.appendChild(summary);

  // Presets
  const presetBtns = [];
  if (showPresets) {
    const presetBar = el('div', 'drs-presets');
    presets.forEach(p => {
      const btn = el('button', 'drs-preset', { text: p.label });
      btn.dataset.days = p.days;
      presetBar.appendChild(btn);
      presetBtns.push(btn);
    });
    container.appendChild(presetBar);
  }

  // Slider row
  const sliderRow = el('div', 'drs-slider-row');
  const nudgeLeft = el('button', 'drs-nudge', { html: '&#9664;', title: 'Shift range earlier' });
  const nudgeRight = el('button', 'drs-nudge', { html: '&#9654;', title: 'Shift range later' });
  const sliderWrap = el('div', 'drs-slider-wrap');
  const sliderEl = el('div');
  const labelsEl = el('div', 'drs-labels');
  sliderWrap.append(sliderEl, labelsEl);

  if (showNudge) sliderRow.appendChild(nudgeLeft);
  sliderRow.appendChild(sliderWrap);
  if (showNudge) sliderRow.appendChild(nudgeRight);
  container.appendChild(sliderRow);

  // Zoom controls
  let zoomInBtn, zoomOutBtn, zoomResetBtn, zoomLevelEl;
  if (showZoom) {
    const controls = el('div', 'drs-controls');
    zoomInBtn = el('button', 'drs-zoom-btn', { text: '+ Zoom', title: 'Zoom in' });
    zoomLevelEl = el('span', 'drs-zoom-level', { text: '3yr view' });
    zoomOutBtn = el('button', 'drs-zoom-btn', { html: '&minus; Zoom', title: 'Zoom out' });
    zoomResetBtn = el('button', 'drs-zoom-btn', { text: 'Reset', title: 'Reset to full range' });
    controls.append(zoomInBtn, zoomLevelEl, zoomOutBtn, zoomResetBtn);
    container.appendChild(controls);
  }

  // ─── Initialize noUiSlider ───
  noUiSlider.create(sliderEl, {
    start: [startDate.getTime(), endDate.getTime()],
    connect: true,
    range: { min: minTs, max: maxTs },
    step: DAY_MS,
    behaviour: 'drag'
  });

  // ─── Display update ───
  function updateDisplay(values) {
    const s = new Date(Number(values[0]));
    const e = new Date(Number(values[1]));
    startEl.textContent = formatShort(s);
    endEl.textContent = formatShort(e);
    const days = daysBetween(s, e);
    const totalDays = daysBetween(minDate, maxDate);
    badge.textContent = `${days} day${days !== 1 ? 's' : ''}`;
    maxLabel.classList.toggle('visible', days >= totalDays);

    if (onChange) onChange({ start: s, end: e, days });
  }

  sliderEl.noUiSlider.on('update', updateDisplay);

  // ─── Calendar ───
  if (showCalendar) {
    function openCalendar(which) {
      const values = sliderEl.noUiSlider.get();
      calPicking = which;
      calTempStart = null;
      if (which === 'start') {
        const d = new Date(Number(values[0]));
        calViewMonth = new Date(d.getFullYear(), d.getMonth(), 1);
      } else {
        const d = new Date(Number(values[1]));
        calViewMonth = new Date(d.getFullYear(), d.getMonth() - 1, 1);
      }
      updateCalLabel();
      renderCalendar();
      calDropdown.classList.add('open');
      calOverlay.classList.add('open');
    }

    function closeCalendar() {
      calDropdown.classList.remove('open');
      calOverlay.classList.remove('open');
    }

    function updateCalLabel() {
      calLabel.innerHTML = calPicking === 'start'
        ? 'Click a date to set <strong>start</strong>'
        : 'Click a date to set <strong>end</strong>';
    }

    function renderCalendar() {
      const values = sliderEl.noUiSlider.get();
      const selStart = calTempStart || new Date(Number(values[0]));
      const selEnd = new Date(Number(values[1]));

      const leftMonth = calViewMonth;
      const rightMonth = new Date(leftMonth.getFullYear(), leftMonth.getMonth() + 1, 1);

      calLeft.title.textContent = leftMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      calRight.title.textContent = rightMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

      renderMonth(calLeft.days, leftMonth, selStart, selEnd);
      renderMonth(calRight.days, rightMonth, selStart, selEnd);
    }

    function renderMonth(daysContainer, monthDate, selStart, selEnd) {
      daysContainer.innerHTML = '';
      const year = monthDate.getFullYear();
      const month = monthDate.getMonth();
      const firstDow = new Date(year, month, 1).getDay();
      const totalDays = new Date(year, month + 1, 0).getDate();

      for (let i = 0; i < firstDow; i++) {
        daysContainer.appendChild(el('div', 'drs-cal-day empty'));
      }

      for (let d = 1; d <= totalDays; d++) {
        const cell = el('div', 'drs-cal-day', { text: d });
        const cellDate = new Date(year, month, d);

        if (cellDate < minDate || cellDate > maxDate) {
          cell.classList.add('disabled');
        } else {
          if (sameDay(cellDate, selStart)) cell.classList.add('range-start');
          if (sameDay(cellDate, selEnd)) cell.classList.add('range-end');
          if (cellDate > selStart && cellDate < selEnd) cell.classList.add('in-range');
          if (sameDay(cellDate, today)) cell.classList.add('today');
          cell.addEventListener('click', () => onCalDayClick(cellDate));
        }
        daysContainer.appendChild(cell);
      }
    }

    function onCalDayClick(date) {
      if (calPicking === 'start') {
        calTempStart = date;
        calPicking = 'end';
        updateCalLabel();
        renderCalendar();
      } else {
        let s = calTempStart || new Date(Number(sliderEl.noUiSlider.get()[0]));
        let e = date;
        if (e < s) { const tmp = s; s = e; e = tmp; }
        sliderEl.noUiSlider.set([s.getTime(), e.getTime()]);
        closeCalendar();
      }
    }

    calLeft.nav.addEventListener('click', () => {
      calViewMonth = new Date(calViewMonth.getFullYear(), calViewMonth.getMonth() - 1, 1);
      renderCalendar();
    });

    calRight.nav.addEventListener('click', () => {
      calViewMonth = new Date(calViewMonth.getFullYear(), calViewMonth.getMonth() + 1, 1);
      renderCalendar();
    });

    startEl.addEventListener('click', () => openCalendar('start'));
    endEl.addEventListener('click', () => openCalendar('end'));
    calOverlay.addEventListener('click', closeCalendar);
  }

  // ─── Presets ───
  if (showPresets) {
    presetBtns.forEach(btn => {
      btn.addEventListener('click', function () {
        presetBtns.forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        const val = this.dataset.days;
        if (val === 'max') {
          sliderEl.noUiSlider.set([minTs, maxTs]);
        } else {
          const d = parseInt(val);
          const ps = new Date(maxDate.getFullYear(), maxDate.getMonth(), maxDate.getDate() - d);
          sliderEl.noUiSlider.set([ps.getTime(), maxTs]);
        }
      });
    });

    sliderEl.noUiSlider.on('start', () => {
      presetBtns.forEach(b => b.classList.remove('active'));
    });
  }

  // ─── Nudge ───
  if (showNudge) {
    function nudge(dir) {
      const values = sliderEl.noUiSlider.get();
      const s = Number(values[0]);
      const e = Number(values[1]);
      const dur = e - s;
      const shift = Math.min(dur, 7 * DAY_MS) * dir;
      const ns = s + shift;
      const ne = e + shift;
      if (ns < viewMin) sliderEl.noUiSlider.set([viewMin, viewMin + dur]);
      else if (ne > viewMax) sliderEl.noUiSlider.set([viewMax - dur, viewMax]);
      else sliderEl.noUiSlider.set([ns, ne]);
      presetBtns.forEach(b => b.classList.remove('active'));
    }

    nudgeLeft.addEventListener('click', () => nudge(-1));
    nudgeRight.addEventListener('click', () => nudge(1));
  }

  // ─── Zoom ───
  function updateViewLabels() {
    labelsEl.innerHTML = '';
    const vMin = new Date(viewMin);
    const vMax = new Date(viewMax);
    const viewDays = daysBetween(vMin, vMax);

    if (viewDays <= 60) {
      [vMin, vMax].forEach(d => labelsEl.appendChild(el('span', null, { text: formatShort(d) })));
    } else if (viewDays <= 365) {
      const d = new Date(vMin.getFullYear(), vMin.getMonth(), 1);
      while (d <= vMax) {
        labelsEl.appendChild(el('span', null, {
          text: d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
        }));
        d.setMonth(d.getMonth() + 1);
      }
    } else {
      for (let y = vMin.getFullYear(); y <= vMax.getFullYear(); y++) {
        labelsEl.appendChild(el('span', null, { text: String(y) }));
      }
    }

    if (showZoom) {
      const totalDays = daysBetween(minDate, maxDate);
      if (viewDays >= totalDays) zoomLevelEl.textContent = Math.round(totalDays / 365) + 'yr view';
      else if (viewDays >= 365) zoomLevelEl.textContent = (Math.round(viewDays / 365 * 10) / 10) + 'yr view';
      else if (viewDays >= 30) zoomLevelEl.textContent = Math.round(viewDays / 30) + 'mo view';
      else zoomLevelEl.textContent = viewDays + 'd view';

      zoomOutBtn.disabled = (viewMin <= minTs && viewMax >= maxTs);
      zoomInBtn.disabled = (viewDays <= MIN_VIEW_DAYS);
    }
  }

  function applyZoom() {
    const values = sliderEl.noUiSlider.get();
    sliderEl.noUiSlider.updateOptions({ range: { min: viewMin, max: viewMax } }, false);
    sliderEl.noUiSlider.set(values);
    updateViewLabels();
  }

  function zoomTo(newMin, newMax) {
    viewMin = Math.max(newMin, minTs);
    viewMax = Math.min(newMax, maxTs);
    applyZoom();
  }

  if (showZoom) {
    zoomInBtn.addEventListener('click', () => {
      const values = sliderEl.noUiSlider.get();
      const selStart = Number(values[0]);
      const selEnd = Number(values[1]);
      const selRange = selEnd - selStart;
      const padding = Math.max(selRange * 0.5, MIN_VIEW_DAYS * DAY_MS * 0.5);
      zoomTo(selStart - padding, selEnd + padding);
    });

    zoomOutBtn.addEventListener('click', () => {
      const range = viewMax - viewMin;
      const center = (viewMin + viewMax) / 2;
      zoomTo(center - range, center + range);
    });

    zoomResetBtn.addEventListener('click', () => zoomTo(minTs, maxTs));
  }

  updateViewLabels();

  // ─── Public API ───
  return {
    /** Get current selection */
    getRange() {
      const values = sliderEl.noUiSlider.get();
      const s = new Date(Number(values[0]));
      const e = new Date(Number(values[1]));
      return { start: s, end: e, days: daysBetween(s, e) };
    },

    /** Set selection programmatically */
    setRange(start, end) {
      sliderEl.noUiSlider.set([stripTime(start).getTime(), stripTime(end).getTime()]);
    },

    /** Clean up */
    destroy() {
      sliderEl.noUiSlider.destroy();
      container.innerHTML = '';
      container.classList.remove('drs-container');
    }
  };
}


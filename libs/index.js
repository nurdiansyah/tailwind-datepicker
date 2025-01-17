// src/lib/utils.ts
function hasProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}
function lastItemOf(arr) {
  return arr[arr.length - 1];
}
function pushUnique(arr, ...items) {
  items.forEach((item) => {
    if (arr.includes(item)) {
      return;
    }
    arr.push(item);
  });
  return arr;
}
function stringToArray(str, separator) {
  return str ? str.split(separator) : [];
}
function isInRange(testVal, min, max) {
  const minOK = min === void 0 || testVal >= min;
  const maxOK = max === void 0 || testVal <= max;
  return minOK && maxOK;
}
function limitToRange(val, min, max) {
  if (val < min) {
    return min;
  }
  if (val > max) {
    return max;
  }
  return val;
}
function createTagRepeat(tagName, repeat, attributes = {}, index = 0, html = "") {
  const openTagSrc = Object.keys(attributes).reduce((src, attr) => {
    let val = attributes[attr];
    if (typeof val === "function") {
      val = val(index);
    }
    return `${src} ${attr}="${val}"`;
  }, tagName);
  html += `<${openTagSrc}></${tagName}>`;
  const next = index + 1;
  return next < repeat ? createTagRepeat(tagName, repeat, attributes, next, html) : html;
}
function optimizeTemplateHTML(html) {
  return html.replace(/>\s+/g, ">").replace(/\s+</, "<");
}

// src/lib/date.ts
function stripTime(timeValue) {
  return new Date(timeValue).setHours(0, 0, 0, 0);
}
function today() {
  return new Date().setHours(0, 0, 0, 0);
}
function dateValue(...args) {
  switch (args.length) {
    case 0:
      return today();
    case 1:
      return stripTime(args[0]);
  }
  const newDate = new Date(0);
  newDate.setFullYear(args[0], args[1], args[2]);
  return newDate.setHours(0, 0, 0, 0);
}
function addDays(date, amount) {
  const newDate = new Date(date);
  return newDate.setDate(newDate.getDate() + amount);
}
function addWeeks(date, amount) {
  return addDays(date, amount * 7);
}
function addMonths(date, amount) {
  const newDate = new Date(date);
  const monthsToSet = newDate.getMonth() + amount;
  let expectedMonth = monthsToSet % 12;
  if (expectedMonth < 0) {
    expectedMonth += 12;
  }
  const time = newDate.setMonth(monthsToSet);
  return newDate.getMonth() !== expectedMonth ? newDate.setDate(0) : time;
}
function addYears(date, amount) {
  const newDate = new Date(date);
  const expectedMonth = newDate.getMonth();
  const time = newDate.setFullYear(newDate.getFullYear() + amount);
  return expectedMonth === 1 && newDate.getMonth() === 2 ? newDate.setDate(0) : time;
}
function dayDiff(day, from) {
  return (day - from + 7) % 7;
}
function dayOfTheWeekOf(baseDate, dayOfWeek, weekStart = 0) {
  const baseDay = new Date(baseDate).getDay();
  return addDays(baseDate, dayDiff(dayOfWeek, weekStart) - dayDiff(baseDay, weekStart));
}
function getWeek(date) {
  const thuOfTheWeek = dayOfTheWeekOf(date, 4, 1);
  const firstThu = dayOfTheWeekOf(new Date(thuOfTheWeek).setMonth(0, 4), 4, 1);
  return Math.round((thuOfTheWeek - firstThu) / 6048e5) + 1;
}
function startOfYearPeriod(date, years) {
  const year = new Date(date).getFullYear();
  return Math.floor(year / years) * years;
}

// src/lib/date-format.ts
var reFormatTokens = /dd?|DD?|mm?|MM?|yy?(?:yy)?/;
var reNonDateParts = /[\s!-/:-@[-`{-~年月日]+/;
var knownFormats = {};
var parseFns = {
  y(date, year) {
    return new Date(date).setFullYear(parseInt(year, 10));
  },
  m(date, month, locale) {
    const newDate = new Date(date);
    let monthIndex = parseInt(month, 10) - 1;
    if (isNaN(monthIndex)) {
      if (!month) {
        return NaN;
      }
      const monthName = month.toLowerCase();
      const compareNames = (name) => name.toLowerCase().startsWith(monthName);
      monthIndex = locale.monthsShort.findIndex(compareNames);
      if (monthIndex < 0) {
        monthIndex = locale.months.findIndex(compareNames);
      }
      if (monthIndex < 0) {
        return NaN;
      }
    }
    newDate.setMonth(monthIndex);
    return newDate.getMonth() !== normalizeMonth(monthIndex) ? newDate.setDate(0) : newDate.getTime();
  },
  d(date, day) {
    return new Date(date).setDate(parseInt(day, 10));
  }
};
var formatFns = {
  d(date) {
    return date.getDate();
  },
  dd(date) {
    return padZero(date.getDate(), 2);
  },
  D(date, locale) {
    return locale.daysShort[date.getDay()];
  },
  DD(date, locale) {
    return locale.days[date.getDay()];
  },
  m(date) {
    return date.getMonth() + 1;
  },
  mm(date) {
    return padZero(date.getMonth() + 1, 2);
  },
  M(date, locale) {
    return locale.monthsShort[date.getMonth()];
  },
  MM(date, locale) {
    return locale.months[date.getMonth()];
  },
  y(date) {
    return date.getFullYear();
  },
  yy(date) {
    return padZero(date.getFullYear(), 2).slice(-2);
  },
  yyyy(date) {
    return padZero(date.getFullYear(), 4);
  }
};
function normalizeMonth(monthIndex) {
  return monthIndex > -1 ? monthIndex % 12 : normalizeMonth(monthIndex + 12);
}
function padZero(num, length) {
  return num.toString().padStart(length, "0");
}
function parseFormatString(format) {
  if (typeof format !== "string") {
    throw new Error("Invalid date format.");
  }
  if (format in knownFormats) {
    return knownFormats[format];
  }
  const separators = format.split(reFormatTokens);
  const parts = format.match(new RegExp(reFormatTokens, "g"));
  if (separators.length === 0 || !parts) {
    throw new Error("Invalid date format.");
  }
  const partFormatters = parts.map((token) => formatFns[token]);
  const partParserKeys = Object.keys(parseFns).reduce((keys, key) => {
    const token = parts.find((part) => part[0] !== "D" && part[0].toLowerCase() === key);
    if (token) {
      keys.push(key);
    }
    return keys;
  }, []);
  return knownFormats[format] = {
    parser(dateStr, locale) {
      const dateParts = dateStr.split(reNonDateParts).reduce((dtParts, part, index) => {
        if (part.length > 0 && parts[index]) {
          const token = parts[index][0];
          if (token === "M") {
            dtParts.m = part;
          } else if (token !== "D") {
            dtParts[token] = part;
          }
        }
        return dtParts;
      }, {});
      return partParserKeys.reduce((origDate, key) => {
        const newDate = parseFns[key](origDate, dateParts[key], locale);
        return isNaN(newDate) ? origDate : newDate;
      }, today());
    },
    formatter(date, locale) {
      let dateStr = partFormatters.reduce((str, fn, index) => {
        return str += `${separators[index]}${fn(date, locale)}`;
      }, "");
      return dateStr += lastItemOf(separators);
    }
  };
}
function parseDate(dateStr, format, locale) {
  if (dateStr instanceof Date || typeof dateStr === "number") {
    const date = stripTime(dateStr);
    return isNaN(date) ? void 0 : date;
  }
  if (!dateStr) {
    return void 0;
  }
  if (dateStr === "today") {
    return today();
  }
  if (format && format.toValue) {
    const date = format.toValue(dateStr, format, locale);
    return isNaN(date) ? void 0 : stripTime(date);
  }
  return parseFormatString(format).parser(dateStr, locale);
}
function formatDate(date, format, locale) {
  if (isNaN(date) || !date && date !== 0) {
    return "";
  }
  const dateObj = typeof date === "number" ? new Date(date) : date;
  if (format.toDisplay) {
    return format.toDisplay(dateObj, format, locale);
  }
  return parseFormatString(format).formatter(dateObj, locale);
}

// src/lib/event.ts
var listenerRegistry = /* @__PURE__ */ new WeakMap();
var { addEventListener, removeEventListener } = EventTarget.prototype;
function registerListeners(keyObj, listeners) {
  let registered = listenerRegistry.get(keyObj);
  if (!registered) {
    registered = [];
    listenerRegistry.set(keyObj, registered);
  }
  listeners.forEach((listener) => {
    addEventListener.call(...listener);
    registered.push(listener);
  });
}
function unregisterListeners(keyObj) {
  let listeners = listenerRegistry.get(keyObj);
  if (!listeners) {
    return;
  }
  listeners.forEach((listener) => {
    removeEventListener.call(...listener);
  });
  listenerRegistry.delete(keyObj);
}
if (!Event.prototype.composedPath) {
  const getComposedPath = (node, path = []) => {
    path.push(node);
    let parent;
    if (node.parentNode) {
      parent = node.parentNode;
    } else if (node.host) {
      parent = node.host;
    } else if (node.defaultView) {
      parent = node.defaultView;
    }
    return parent ? getComposedPath(parent, path) : path;
  };
  Event.prototype.composedPath = function() {
    return getComposedPath(this.target);
  };
}
function findFromPath(path, criteria, currentTarget, index = 0) {
  const el = path[index];
  if (criteria(el)) {
    return el;
  } else if (el === currentTarget || !el.parentElement) {
    return;
  }
  return findFromPath(path, criteria, currentTarget, index + 1);
}
function findElementInEventPath(ev, selector) {
  const criteria = typeof selector === "function" ? selector : (el) => el.matches(selector);
  return findFromPath(ev.composedPath(), criteria, ev.currentTarget);
}

// src/i18n/base-locales.js
var locales = {
  en: {
    days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    daysShort: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    daysMin: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
    months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    monthsShort: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    today: "Today",
    clear: "Clear",
    titleFormat: "MM y"
  }
};

// src/options/defaultOptions.ts
var defaultOptions = {
  autohide: false,
  beforeShowDay: null,
  beforeShowDecade: null,
  beforeShowMonth: null,
  beforeShowYear: null,
  calendarWeeks: false,
  clearBtn: false,
  dateDelimiter: ",",
  datesDisabled: [],
  daysOfWeekDisabled: [],
  daysOfWeekHighlighted: [],
  defaultViewDate: void 0,
  disableTouchKeyboard: false,
  format: "mm/dd/yyyy",
  language: "en",
  maxDate: null,
  maxNumberOfDates: 1,
  maxView: 3,
  minDate: null,
  nextArrow: '<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>',
  orientation: "auto",
  pickLevel: 0,
  prevArrow: '<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd"></path></svg>',
  showDaysOfWeek: true,
  showOnClick: true,
  showOnFocus: true,
  startView: 0,
  title: "",
  todayBtn: false,
  todayBtnMode: 0,
  todayHighlight: false,
  updateOnBlur: true,
  weekStart: 0
};
var defaultOptions_default = defaultOptions;

// src/lib/dom.ts
var range = document.createRange();
function parseHTML(html) {
  return range.createContextualFragment(html);
}
function hideElement(el) {
  if (el.style.display === "none") {
    return;
  }
  if (el.style.display) {
    el.dataset.styleDisplay = el.style.display;
  }
  el.style.display = "none";
}
function showElement(el) {
  if (el.style.display !== "none") {
    return;
  }
  if (el.dataset.styleDisplay) {
    el.style.display = el.dataset.styleDisplay;
    delete el.dataset.styleDisplay;
  } else {
    el.style.display = "";
  }
}
function emptyChildNodes(el) {
  if (el.firstChild) {
    el.removeChild(el.firstChild);
    emptyChildNodes(el);
  }
}
function replaceChildNodes(el, newChildNodes) {
  emptyChildNodes(el);
  if (newChildNodes instanceof DocumentFragment) {
    el.appendChild(newChildNodes);
  } else if (typeof newChildNodes === "string") {
    el.appendChild(parseHTML(newChildNodes));
  } else if (typeof newChildNodes.forEach === "function") {
    newChildNodes.forEach((node) => {
      el.appendChild(node);
    });
  }
}

// src/options/processOptions.ts
var { language: defaultLang, format: defaultFormat, weekStart: defaultWeekStart } = defaultOptions_default;
function sanitizeDOW(dow, day) {
  return dow.length < 6 && day >= 0 && day < 7 ? pushUnique(dow, day) : dow;
}
function calcEndOfWeek(startOfWeek) {
  return (startOfWeek + 6) % 7;
}
function validateDate(value, format, locale, origValue) {
  const date = parseDate(value, format, locale);
  return date !== void 0 ? date : origValue;
}
function validateViewId(value, origValue, max = 3) {
  const viewId = parseInt(value, 10);
  return viewId >= 0 && viewId <= max ? viewId : origValue;
}
function processOptions(options, datepicker) {
  const inOpts = Object.assign({}, options);
  const config = {};
  const locales2 = datepicker.constructor.locales;
  let { format, language, locale, maxDate, maxView, minDate, pickLevel, startView, weekStart } = datepicker.config || {};
  if (inOpts.language) {
    let lang;
    if (inOpts.language !== language) {
      if (locales2[inOpts.language]) {
        lang = inOpts.language;
      } else {
        lang = inOpts.language.split("-")[0];
        if (locales2[lang] === void 0) {
          lang = false;
        }
      }
    }
    delete inOpts.language;
    if (lang) {
      language = config.language = lang;
      const origLocale = locale || locales2[defaultLang];
      locale = Object.assign(
        {
          format: defaultFormat,
          weekStart: defaultWeekStart
        },
        locales2[defaultLang]
      );
      if (language !== defaultLang) {
        Object.assign(locale, locales2[language]);
      }
      config.locale = locale;
      if (format === origLocale.format) {
        format = config.format = locale.format;
      }
      if (weekStart === origLocale.weekStart) {
        weekStart = config.weekStart = locale.weekStart;
        config.weekEnd = calcEndOfWeek(locale.weekStart);
      }
    }
  }
  if (inOpts.format) {
    const hasToDisplay = typeof inOpts.format.toDisplay === "function";
    const hasToValue = typeof inOpts.format.toValue === "function";
    const validFormatString = reFormatTokens.test(inOpts.format);
    if (hasToDisplay && hasToValue || validFormatString) {
      format = config.format = inOpts.format;
    }
    delete inOpts.format;
  }
  let minDt = minDate;
  let maxDt = maxDate;
  if (inOpts.minDate !== void 0) {
    minDt = inOpts.minDate === null ? dateValue(0, 0, 1) : validateDate(inOpts.minDate, format, locale, minDt);
    delete inOpts.minDate;
  }
  if (inOpts.maxDate !== void 0) {
    maxDt = inOpts.maxDate === null ? void 0 : validateDate(inOpts.maxDate, format, locale, maxDt);
    delete inOpts.maxDate;
  }
  if (maxDt < minDt) {
    minDate = config.minDate = maxDt;
    maxDate = config.maxDate = minDt;
  } else {
    if (minDate !== minDt) {
      minDate = config.minDate = minDt;
    }
    if (maxDate !== maxDt) {
      maxDate = config.maxDate = maxDt;
    }
  }
  if (inOpts.datesDisabled) {
    config.datesDisabled = inOpts.datesDisabled.reduce((dates, dt) => {
      const date = parseDate(dt, format, locale);
      return date !== void 0 ? pushUnique(dates, date) : dates;
    }, []);
    delete inOpts.datesDisabled;
  }
  if (inOpts.defaultViewDate !== void 0) {
    const viewDate = parseDate(inOpts.defaultViewDate, format, locale);
    if (viewDate !== void 0) {
      config.defaultViewDate = viewDate;
    }
    delete inOpts.defaultViewDate;
  }
  if (inOpts.weekStart !== void 0) {
    const wkStart = Number(inOpts.weekStart) % 7;
    if (!isNaN(wkStart)) {
      weekStart = config.weekStart = wkStart;
      config.weekEnd = calcEndOfWeek(wkStart);
    }
    delete inOpts.weekStart;
  }
  if (inOpts.daysOfWeekDisabled) {
    config.daysOfWeekDisabled = inOpts.daysOfWeekDisabled.reduce(sanitizeDOW, []);
    delete inOpts.daysOfWeekDisabled;
  }
  if (inOpts.daysOfWeekHighlighted) {
    config.daysOfWeekHighlighted = inOpts.daysOfWeekHighlighted.reduce(sanitizeDOW, []);
    delete inOpts.daysOfWeekHighlighted;
  }
  if (inOpts.maxNumberOfDates !== void 0) {
    const maxNumberOfDates = parseInt(inOpts.maxNumberOfDates, 10);
    if (maxNumberOfDates >= 0) {
      config.maxNumberOfDates = maxNumberOfDates;
      config.multidate = maxNumberOfDates !== 1;
    }
    delete inOpts.maxNumberOfDates;
  }
  if (inOpts.dateDelimiter) {
    config.dateDelimiter = String(inOpts.dateDelimiter);
    delete inOpts.dateDelimiter;
  }
  let newPickLevel = pickLevel;
  if (inOpts.pickLevel !== void 0) {
    newPickLevel = validateViewId(inOpts.pickLevel, 2);
    delete inOpts.pickLevel;
  }
  if (newPickLevel !== pickLevel) {
    pickLevel = config.pickLevel = newPickLevel;
  }
  let newMaxView = maxView;
  if (inOpts.maxView !== void 0) {
    newMaxView = validateViewId(inOpts.maxView, maxView);
    delete inOpts.maxView;
  }
  newMaxView = pickLevel > newMaxView ? pickLevel : newMaxView;
  if (newMaxView !== maxView) {
    maxView = config.maxView = newMaxView;
  }
  let newStartView = startView;
  if (inOpts.startView !== void 0) {
    newStartView = validateViewId(inOpts.startView, newStartView);
    delete inOpts.startView;
  }
  if (newStartView < pickLevel) {
    newStartView = pickLevel;
  } else if (newStartView > maxView) {
    newStartView = maxView;
  }
  if (newStartView !== startView) {
    config.startView = newStartView;
  }
  if (inOpts.prevArrow) {
    const prevArrow = parseHTML(inOpts.prevArrow);
    if (prevArrow.childNodes.length > 0) {
      config.prevArrow = prevArrow.childNodes;
    }
    delete inOpts.prevArrow;
  }
  if (inOpts.nextArrow) {
    const nextArrow = parseHTML(inOpts.nextArrow);
    if (nextArrow.childNodes.length > 0) {
      config.nextArrow = nextArrow.childNodes;
    }
    delete inOpts.nextArrow;
  }
  if (inOpts.disableTouchKeyboard !== void 0) {
    config.disableTouchKeyboard = "ontouchstart" in document && !!inOpts.disableTouchKeyboard;
    delete inOpts.disableTouchKeyboard;
  }
  if (inOpts.orientation) {
    const orientation = inOpts.orientation.toLowerCase().split(/\s+/g);
    config.orientation = {
      x: orientation.find((x) => x === "left" || x === "right") || "auto",
      y: orientation.find((y) => y === "top" || y === "bottom") || "auto"
    };
    delete inOpts.orientation;
  }
  if (inOpts.todayBtnMode !== void 0) {
    switch (inOpts.todayBtnMode) {
      case 0:
      case 1:
        config.todayBtnMode = inOpts.todayBtnMode;
    }
    delete inOpts.todayBtnMode;
  }
  Object.keys(inOpts).forEach((key) => {
    if (inOpts[key] !== void 0 && hasProperty(defaultOptions_default, key)) {
      config[key] = inOpts[key];
    }
  });
  return config;
}

// src/picker/templates/pickerTemplate.ts
var pickerTemplate = optimizeTemplateHTML(`<div class="datepicker hidden">
  <div class="datepicker-picker inline-block rounded-lg bg-white dark:bg-gray-700 shadow-lg p-4">
    <div class="datepicker-header">
      <div class="datepicker-title bg-white dark:bg-gray-700 dark:text-white px-2 py-3 text-center font-semibold"></div>
      <div class="datepicker-controls flex justify-between mb-2">
        <button type="button" class="bg-white dark:bg-gray-700 rounded-lg text-gray-500 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600 hover:text-gray-900 dark:hover:text-white text-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-gray-200 prev-btn"></button>
        <button type="button" class="text-sm rounded-lg text-gray-900 dark:text-white bg-white dark:bg-gray-700 font-semibold py-2.5 px-5 hover:bg-gray-100 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-200 view-switch"></button>
        <button type="button" class="bg-white dark:bg-gray-700 rounded-lg text-gray-500 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600 hover:text-gray-900 dark:hover:text-white text-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-gray-200 next-btn"></button>
      </div>
    </div>
    <div class="datepicker-main p-1"></div>
    <div class="datepicker-footer">
      <div class="datepicker-controls flex space-x-2 mt-2">
        <button type="button" class="%buttonClass% today-btn text-white bg-blue-700 dark:bg-blue-600 hover:bg-blue-800 dark:hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2 text-center w-1/2"></button>
        <button type="button" class="%buttonClass% clear-btn text-gray-900 dark:text-white bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2 text-center w-1/2"></button>
      </div>
    </div>
  </div>
</div>`);
var pickerTemplate_default = pickerTemplate;

// src/picker/templates/daysTemplate.ts
var daysTemplate = optimizeTemplateHTML(`<div class="days">
  <div class="days-of-week grid grid-cols-7 mb-1">${createTagRepeat("span", 7, {
  class: "dow flex items-center justify-center flex-1 leading-9 border-0 rounded-lg cursor-default text-gray-900 font-semibold text-sm"
})}</div>
  <div class="datepicker-grid w-64 grid grid-cols-7">${createTagRepeat("span", 42, {
  class: "flex items-center justify-center flex-1 leading-9 border-0 rounded-lg cursor-default text-center text-gray-900 font-semibold text-sm h-6 leading-6 text-sm font-medium text-gray-500 dark:text-gray-400"
})}</div>
</div>`);
var daysTemplate_default = daysTemplate;

// src/picker/templates/calendarWeeksTemplate.ts
var calendarWeeksTemplate = optimizeTemplateHTML(`<div class="calendar-weeks">
  <div class="days-of-week flex"><span class="dow h-6 leading-6 text-sm font-medium text-gray-500 dark:text-gray-400"></span></div>
  <div class="weeks">${createTagRepeat("span", 6, {
  class: "week flex items-center justify-center flex-1 leading-9 border-0 rounded-lg cursor-default text-gray-900 font-semibold text-sm"
})}</div>
</div>`);
var calendarWeeksTemplate_default = calendarWeeksTemplate;

// src/picker/views/View.ts
var View = class {
  constructor(picker, config) {
    this.picker = picker;
    this.cellClass = config.cellClass;
    this.id = config.id;
    this.element = parseHTML(`<div class="datepicker-view flex"></div>`).firstChild;
    this.selected = [];
    this.step = config.step;
    this.init(this.picker.datepicker.config);
  }
  init(options) {
    if (options.pickLevel !== void 0) {
      this.isMinView = this.id === options.pickLevel;
    }
    this.setOptions(options);
    this.updateFocus();
    this.updateSelection();
  }
  performBeforeHook(el, current, timeValue) {
    let result = this.beforeShow(new Date(timeValue));
    switch (typeof result) {
      case "boolean":
        result = { enabled: result };
        break;
      case "string":
        result = { classes: result };
    }
    if (result) {
      if (result.enabled === false) {
        el.classList.add("disabled");
        pushUnique(this.disabled, current);
      }
      if (result.classes) {
        const extraClasses = result.classes.split(/\s+/);
        el.classList.add(...extraClasses);
        if (extraClasses.includes("disabled")) {
          pushUnique(this.disabled, current);
        }
      }
      if (result.content) {
        replaceChildNodes(el, result.content);
      }
    }
  }
};

// src/picker/views/DaysView.ts
var DaysView = class extends View {
  constructor(picker) {
    super(picker, {
      id: 0,
      name: "days",
      cellClass: "day"
    });
  }
  init(options, onConstruction = true) {
    if (onConstruction) {
      const inner = parseHTML(daysTemplate_default).firstChild;
      this.dow = inner.firstChild;
      this.grid = inner.lastChild;
      this.element.appendChild(inner);
    }
    super.init(options);
  }
  setOptions(options) {
    let updateDOW;
    if (hasProperty(options, "minDate")) {
      this.minDate = options.minDate;
    }
    if (hasProperty(options, "maxDate")) {
      this.maxDate = options.maxDate;
    }
    if (options.datesDisabled) {
      this.datesDisabled = options.datesDisabled;
    }
    if (options.daysOfWeekDisabled) {
      this.daysOfWeekDisabled = options.daysOfWeekDisabled;
      updateDOW = true;
    }
    if (options.daysOfWeekHighlighted) {
      this.daysOfWeekHighlighted = options.daysOfWeekHighlighted;
    }
    if (options.todayHighlight !== void 0) {
      this.todayHighlight = options.todayHighlight;
    }
    if (options.weekStart !== void 0) {
      this.weekStart = options.weekStart;
      this.weekEnd = options.weekEnd;
      updateDOW = true;
    }
    if (options.locale) {
      const locale = this.locale = options.locale;
      this.dayNames = locale.daysMin;
      this.switchLabelFormat = locale.titleFormat;
      updateDOW = true;
    }
    if (options.beforeShowDay !== void 0) {
      this.beforeShow = typeof options.beforeShowDay === "function" ? options.beforeShowDay : void 0;
    }
    if (options.calendarWeeks !== void 0) {
      if (options.calendarWeeks && !this.calendarWeeks) {
        const weeksElem = parseHTML(calendarWeeksTemplate_default).firstChild;
        this.calendarWeeks = {
          element: weeksElem,
          dow: weeksElem.firstChild,
          weeks: weeksElem.lastChild
        };
        this.element.insertBefore(weeksElem, this.element.firstChild);
      } else if (this.calendarWeeks && !options.calendarWeeks) {
        this.element.removeChild(this.calendarWeeks.element);
        this.calendarWeeks = null;
      }
    }
    if (options.showDaysOfWeek !== void 0) {
      if (options.showDaysOfWeek) {
        showElement(this.dow);
        if (this.calendarWeeks) {
          showElement(this.calendarWeeks.dow);
        }
      } else {
        hideElement(this.dow);
        if (this.calendarWeeks) {
          hideElement(this.calendarWeeks.dow);
        }
      }
    }
    if (updateDOW) {
      Array.from(this.dow.children).forEach((el, index) => {
        const dow = (this.weekStart + index) % 7;
        el.textContent = this.dayNames[dow];
        el.className = this.daysOfWeekDisabled.includes(dow) ? "dow disabled text-center h-6 leading-6 text-sm font-medium text-gray-500 dark:text-gray-400 cursor-not-allowed" : "dow text-center h-6 leading-6 text-sm font-medium text-gray-500 dark:text-gray-400";
      });
    }
  }
  updateFocus() {
    const viewDate = new Date(this.picker.viewDate);
    const viewYear = viewDate.getFullYear();
    const viewMonth = viewDate.getMonth();
    const firstOfMonth = dateValue(viewYear, viewMonth, 1);
    const start = dayOfTheWeekOf(firstOfMonth, this.weekStart, this.weekStart);
    this.first = firstOfMonth;
    this.last = dateValue(viewYear, viewMonth + 1, 0);
    this.start = start;
    this.focused = this.picker.viewDate;
  }
  updateSelection() {
    const { dates, rangePicker } = this.picker.datepicker;
    this.selected = dates;
    if (rangePicker) {
      this.range = rangePicker.dates;
    }
  }
  render() {
    this.today = this.todayHighlight ? today() : void 0;
    this.disabled = [...this.datesDisabled];
    const switchLabel = formatDate(this.focused, this.switchLabelFormat, this.locale);
    this.picker.setViewSwitchLabel(switchLabel);
    this.picker.setPrevBtnDisabled(this.first <= Number(this.minDate));
    this.picker.setNextBtnDisabled(this.last >= Number(this.maxDate));
    if (this.calendarWeeks) {
      const startOfWeek = dayOfTheWeekOf(this.first, 1, 1);
      Array.from(this.calendarWeeks.weeks.children).forEach((el, index) => {
        el.textContent = getWeek(addWeeks(startOfWeek, index));
      });
    }
    Array.from(this.grid.children).forEach((el, index) => {
      const classList = el.classList;
      const current = addDays(this.start, index);
      const date = new Date(current);
      const day = date.getDay();
      el.className = `datepicker-cell hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center justify-center flex-1 leading-9 border-0 rounded-lg cursor-pointer text-gray-900 dark:text-white font-semibold text-sm ${this.cellClass}`;
      el.dataset.date = current;
      el.textContent = date.getDate();
      if (current < this.first) {
        classList.add("prev", "text-gray-500", "dark:text-white");
      } else if (current > this.last) {
        classList.add("next", "text-gray-500", "dark:text-white");
      }
      if (this.today === current) {
        classList.add("today", "bg-gray-100", "dark:bg-gray-600");
      }
      if (current < Number(this.minDate) || current > Number(this.maxDate) || this.disabled.includes(current)) {
        classList.add("disabled", "cursor-not-allowed");
      }
      if (this.daysOfWeekDisabled.includes(day)) {
        classList.add("disabled", "cursor-not-allowed");
        pushUnique(this.disabled, current);
      }
      if (this.daysOfWeekHighlighted.includes(day)) {
        classList.add("highlighted");
      }
      if (this.range) {
        const [rangeStart, rangeEnd] = this.range;
        if (current > rangeStart && current < rangeEnd) {
          classList.add("range", "bg-gray-200", "dark:bg-gray-600");
          classList.remove("rounded-lg", "rounded-l-lg", "rounded-r-lg");
        }
        if (current === rangeStart) {
          classList.add("range-start", "bg-gray-100", "dark:bg-gray-600", "rounded-l-lg");
          classList.remove("rounded-lg", "rounded-r-lg");
        }
        if (current === rangeEnd) {
          classList.add("range-end", "bg-gray-100", "dark:bg-gray-600", "rounded-r-lg");
          classList.remove("rounded-lg", "rounded-l-lg");
        }
      }
      if (this.selected.includes(current)) {
        classList.add("selected", "bg-blue-700", "text-white", "dark:bg-blue-600", "dark:text-white");
        classList.remove(
          "text-gray-900",
          "text-gray-500",
          "hover:bg-gray-100",
          "dark:text-white",
          "dark:hover:bg-gray-600",
          "dark:bg-gray-600",
          "bg-gray-100",
          "bg-gray-200"
        );
      }
      if (current === this.focused) {
        classList.add("focused");
      }
      if (this.beforeShow) {
        this.performBeforeHook(el, current, current);
      }
    });
  }
  refresh() {
    const [rangeStart, rangeEnd] = this.range || [];
    this.grid.querySelectorAll(".range, .range-start, .range-end, .selected, .focused").forEach((el) => {
      el.classList.remove(
        "range",
        "range-start",
        "range-end",
        "selected",
        "bg-blue-700",
        "text-white",
        "dark:bg-blue-600",
        "dark:text-white",
        "focused"
      );
      el.classList.add("text-gray-900", "rounded-lg", "dark:text-white");
    });
    Array.from(this.grid.children).forEach((el) => {
      const current = Number(el.dataset.date);
      const classList = el.classList;
      classList.remove("bg-gray-200", "dark:bg-gray-600", "rounded-l-lg", "rounded-r-lg");
      if (current > rangeStart && current < rangeEnd) {
        classList.add("range", "bg-gray-200", "dark:bg-gray-600");
        classList.remove("rounded-lg");
      }
      if (current === rangeStart) {
        classList.add("range-start", "bg-gray-200", "dark:bg-gray-600", "rounded-l-lg");
        classList.remove("rounded-lg", "rounded-r-lg");
      }
      if (current === rangeEnd) {
        classList.add("range-end", "bg-gray-200", "dark:bg-gray-600", "rounded-r-lg");
        classList.remove("rounded-lg", "rounded-l-lg");
      }
      if (this.selected.includes(current)) {
        classList.add("selected", "bg-blue-700", "text-white", "dark:bg-blue-600", "dark:text-white");
        classList.remove(
          "text-gray-900",
          "hover:bg-gray-100",
          "dark:text-white",
          "dark:hover:bg-gray-600",
          "bg-gray-100",
          "bg-gray-200",
          "dark:bg-gray-600"
        );
      }
      if (current === this.focused) {
        classList.add("focused");
      }
    });
  }
  refreshFocus() {
    const index = Math.round((this.focused - this.start) / 864e5);
    this.grid.querySelectorAll(".focused").forEach((el) => {
      el.classList.remove("focused");
    });
    this.grid.children[index].classList.add("focused");
  }
};

// src/picker/views/MonthsView.ts
function computeMonthRange(range2, thisYear) {
  if (!range2 || !range2[0] || !range2[1]) {
    return;
  }
  const [[startY, startM], [endY, endM]] = range2;
  if (startY > thisYear || endY < thisYear) {
    return;
  }
  return [startY === thisYear ? startM : -1, endY === thisYear ? endM : 12];
}
var MonthsView = class extends View {
  constructor(picker) {
    super(picker, {
      id: 1,
      name: "months",
      cellClass: "month"
    });
  }
  init(options, onConstruction = true) {
    if (onConstruction) {
      this.grid = this.element;
      this.element.classList.add("months", "datepicker-grid", "w-64", "grid", "grid-cols-4");
      this.grid.appendChild(parseHTML(createTagRepeat("span", 12, { "data-month": (ix) => ix })));
    }
    super.init(options);
  }
  setOptions(options) {
    if (options.locale) {
      this.monthNames = options.locale.monthsShort;
    }
    if (hasProperty(options, "minDate")) {
      if (options.minDate === void 0) {
        this.minYear = this.minMonth = this.minDate = void 0;
      } else {
        const minDateObj = new Date(options.minDate);
        this.minYear = minDateObj.getFullYear();
        this.minMonth = minDateObj.getMonth();
        this.minDate = minDateObj.setDate(1);
      }
    }
    if (hasProperty(options, "maxDate")) {
      if (options.maxDate === void 0) {
        this.maxYear = this.maxMonth = this.maxDate = void 0;
      } else {
        const maxDateObj = new Date(options.maxDate);
        this.maxYear = maxDateObj.getFullYear();
        this.maxMonth = maxDateObj.getMonth();
        this.maxDate = dateValue(this.maxYear, this.maxMonth + 1, 0);
      }
    }
    if (options.beforeShowMonth !== void 0) {
      this.beforeShow = typeof options.beforeShowMonth === "function" ? options.beforeShowMonth : void 0;
    }
  }
  updateFocus() {
    const viewDate = new Date(this.picker.viewDate);
    this.year = viewDate.getFullYear();
    this.focused = viewDate.getMonth();
  }
  updateSelection() {
    const { dates, rangePicker } = this.picker.datepicker;
    this.selected = dates.reduce((selected, timeValue) => {
      const date = new Date(timeValue);
      const year = date.getFullYear();
      const month = date.getMonth();
      if (selected[year] === void 0) {
        selected[year] = [month];
      } else {
        pushUnique(selected[year], month);
      }
      return selected;
    }, {});
    if (rangePicker && rangePicker.dates) {
      this.range = rangePicker.dates.map((timeValue) => {
        const date = new Date(timeValue);
        return [date.getFullYear(), date.getMonth()];
      });
    }
  }
  render() {
    this.disabled = [];
    this.picker.setViewSwitchLabel(this.year);
    this.picker.setPrevBtnDisabled(this.year <= this.minYear);
    this.picker.setNextBtnDisabled(this.year >= this.maxYear);
    const selected = this.selected[this.year] || [];
    const yrOutOfRange = this.year < this.minYear || this.year > this.maxYear;
    const isMinYear = this.year === this.minYear;
    const isMaxYear = this.year === this.maxYear;
    const range2 = computeMonthRange(this.range, this.year);
    Array.from(this.grid.children).forEach((el, index) => {
      const classList = el.classList;
      const date = dateValue(this.year, index, 1);
      el.className = `datepicker-cell hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center justify-center flex-1 leading-9 border-0 rounded-lg cursor-pointer text-gray-900 dark:text-white font-semibold text-sm ${this.cellClass}`;
      if (this.isMinView) {
        el.dataset.date = date.toString();
      }
      el.textContent = this.monthNames[index];
      if (yrOutOfRange || isMinYear && index < this.minMonth || isMaxYear && index > this.maxMonth) {
        classList.add("disabled");
      }
      if (range2) {
        const [rangeStart, rangeEnd] = range2;
        if (index > rangeStart && index < rangeEnd) {
          classList.add("range");
        }
        if (index === rangeStart) {
          classList.add("range-start");
        }
        if (index === rangeEnd) {
          classList.add("range-end");
        }
      }
      if (selected.includes(index)) {
        classList.add("selected", "bg-blue-700", "text-white", "dark:bg-blue-600", "dark:text-white");
        classList.remove("text-gray-900", "hover:bg-gray-100", "dark:text-white", "dark:hover:bg-gray-600");
      }
      if (index === this.focused) {
        classList.add("focused");
      }
      if (this.beforeShow) {
        this.performBeforeHook(el, index, date);
      }
    });
  }
  refresh() {
    const selected = this.selected[this.year] || [];
    const [rangeStart, rangeEnd] = computeMonthRange(this.range, this.year) || [];
    this.grid.querySelectorAll(".range, .range-start, .range-end, .selected, .focused").forEach((el) => {
      el.classList.remove(
        "range",
        "range-start",
        "range-end",
        "selected",
        "bg-blue-700",
        "dark:bg-blue-600",
        "dark:text-white",
        "text-white",
        "focused"
      );
      el.classList.add("text-gray-900", "hover:bg-gray-100", "dark:text-white", "dark:hover:bg-gray-600");
    });
    Array.from(this.grid.children).forEach((el, index) => {
      const classList = el.classList;
      if (index > rangeStart && index < rangeEnd) {
        classList.add("range");
      }
      if (index === rangeStart) {
        classList.add("range-start");
      }
      if (index === rangeEnd) {
        classList.add("range-end");
      }
      if (selected.includes(index)) {
        classList.add("selected", "bg-blue-700", "text-white", "dark:bg-blue-600", "dark:text-white");
        classList.remove("text-gray-900", "hover:bg-gray-100", "dark:text-white", "dark:hover:bg-gray-600");
      }
      if (index === this.focused) {
        classList.add("focused");
      }
    });
  }
  refreshFocus() {
    this.grid.querySelectorAll(".focused").forEach((el) => {
      el.classList.remove("focused");
    });
    this.grid.children[this.focused].classList.add("focused");
  }
};

// src/picker/views/YearsView.ts
function toTitleCase(word) {
  return [...word].reduce((str, ch, ix) => str += ix ? ch : ch.toUpperCase(), "");
}
var YearsView = class extends View {
  constructor(picker, config) {
    super(picker, config);
  }
  init(options, onConstruction = true) {
    if (onConstruction) {
      this.navStep = this.step * 10;
      this.beforeShowOption = `beforeShow${toTitleCase(this.cellClass)}`;
      this.grid = this.element;
      this.element.classList.add("datepicker-years", "w-64", "grid", "grid-cols-4");
      this.grid.appendChild(parseHTML(createTagRepeat("span", 12)));
    }
    super.init(options);
  }
  setOptions(options) {
    if (hasProperty(options, "minDate")) {
      if (options.minDate === void 0) {
        this.minYear = this.minDate = void 0;
      } else {
        this.minYear = startOfYearPeriod(options.minDate, this.step);
        this.minDate = dateValue(this.minYear, 0, 1);
      }
    }
    if (hasProperty(options, "maxDate")) {
      if (options.maxDate === void 0) {
        this.maxYear = this.maxDate = void 0;
      } else {
        this.maxYear = startOfYearPeriod(options.maxDate, this.step);
        this.maxDate = dateValue(this.maxYear, 11, 31);
      }
    }
    if (options[this.beforeShowOption] !== void 0) {
      const beforeShow = options[this.beforeShowOption];
      this.beforeShow = typeof beforeShow === "function" ? beforeShow : void 0;
    }
  }
  updateFocus() {
    const viewDate = new Date(this.picker.viewDate);
    const first = startOfYearPeriod(viewDate, this.navStep);
    const last = first + 9 * this.step;
    this.first = first;
    this.last = last;
    this.start = first - this.step;
    this.focused = startOfYearPeriod(viewDate, this.step);
  }
  updateSelection() {
    const { dates, rangePicker } = this.picker.datepicker;
    this.selected = dates.reduce((years, timeValue) => {
      return pushUnique(years, startOfYearPeriod(timeValue, this.step));
    }, []);
    if (rangePicker && rangePicker.dates) {
      this.range = rangePicker.dates.map((timeValue) => {
        if (timeValue !== void 0) {
          return startOfYearPeriod(timeValue, this.step);
        }
      });
    }
  }
  render() {
    this.disabled = [];
    this.picker.setViewSwitchLabel(`${this.first}-${this.last}`);
    this.picker.setPrevBtnDisabled(this.first <= Number(this.minYear));
    this.picker.setNextBtnDisabled(this.last >= Number(this.maxYear));
    Array.from(this.grid.children).forEach((el, index) => {
      const classList = el.classList;
      const current = this.start + index * this.step;
      const date = dateValue(current, 0, 1);
      el.className = `datepicker-cell hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center justify-center flex-1 leading-9 border-0 rounded-lg cursor-pointer text-gray-900 dark:text-white font-semibold text-sm ${this.cellClass}`;
      if (this.isMinView) {
        el.dataset.date = date.toString();
      }
      el.textContent = el.dataset.year = current.toString();
      if (index === 0) {
        classList.add("prev");
      } else if (index === 11) {
        classList.add("next");
      }
      if (current < Number(this.minYear) || current > this.maxYear) {
        classList.add("disabled");
      }
      if (this.range) {
        const [rangeStart, rangeEnd] = this.range;
        if (current > rangeStart && current < rangeEnd) {
          classList.add("range");
        }
        if (current === rangeStart) {
          classList.add("range-start");
        }
        if (current === rangeEnd) {
          classList.add("range-end");
        }
      }
      if (this.selected.includes(current)) {
        classList.add("selected", "bg-blue-700", "text-white", "dark:bg-blue-600", "dark:text-white");
        classList.remove("text-gray-900", "hover:bg-gray-100", "dark:text-white", "dark:hover:bg-gray-600");
      }
      if (current === this.focused) {
        classList.add("focused");
      }
      if (this.beforeShow) {
        this.performBeforeHook(el, current, date);
      }
    });
  }
  refresh() {
    const [rangeStart, rangeEnd] = this.range || [];
    this.grid.querySelectorAll(".range, .range-start, .range-end, .selected, .focused").forEach((el) => {
      el.classList.remove(
        "range",
        "range-start",
        "range-end",
        "selected",
        "bg-blue-700",
        "text-white",
        "dark:bg-blue-600",
        "dark:text-white",
        "focused"
      );
    });
    Array.from(this.grid.children).forEach((el) => {
      const current = Number(el.textContent);
      const classList = el.classList;
      if (current > rangeStart && current < rangeEnd) {
        classList.add("range");
      }
      if (current === rangeStart) {
        classList.add("range-start");
      }
      if (current === rangeEnd) {
        classList.add("range-end");
      }
      if (this.selected.includes(current)) {
        classList.add("selected", "bg-blue-700", "text-white", "dark:bg-blue-600", "dark:text-white");
        classList.remove("text-gray-900", "hover:bg-gray-100", "dark:text-white", "dark:hover:bg-gray-600");
      }
      if (current === this.focused) {
        classList.add("focused");
      }
    });
  }
  refreshFocus() {
    const index = Math.round((this.focused - this.start) / this.step);
    this.grid.querySelectorAll(".focused").forEach((el) => {
      el.classList.remove("focused");
    });
    this.grid.children[index].classList.add("focused");
  }
};

// src/events/functions.ts
function triggerDatepickerEvent(datepicker, type) {
  const detail = {
    date: datepicker.getDate(),
    viewDate: new Date(datepicker.picker.viewDate),
    viewId: datepicker.picker.currentView.id,
    datepicker
  };
  datepicker.element.dispatchEvent(new CustomEvent(type, { detail }));
}
function goToPrevOrNext(datepicker, direction) {
  const { minDate, maxDate } = datepicker.config;
  const { currentView, viewDate } = datepicker.picker;
  let newViewDate;
  switch (currentView.id) {
    case 0:
      newViewDate = addMonths(viewDate, direction);
      break;
    case 1:
      newViewDate = addYears(viewDate, direction);
      break;
    default:
      newViewDate = addYears(viewDate, direction * currentView.navStep);
  }
  newViewDate = limitToRange(newViewDate, minDate, maxDate);
  datepicker.picker.changeFocus(newViewDate).render();
}
function switchView(datepicker) {
  const viewId = datepicker.picker.currentView.id;
  if (viewId === datepicker.config.maxView) {
    return;
  }
  datepicker.picker.changeView(viewId + 1).render();
}
function unfocus(datepicker) {
  if (datepicker.config.updateOnBlur) {
    datepicker.update({ autohide: true });
  } else {
    datepicker.refresh("input");
    datepicker.hide();
  }
}

// src/events/pickerListeners.ts
function goToSelectedMonthOrYear(datepicker, selection) {
  const picker = datepicker.picker;
  const viewDate = new Date(picker.viewDate);
  const viewId = picker.currentView.id;
  const newDate = viewId === 1 ? addMonths(viewDate, selection - viewDate.getMonth()) : addYears(viewDate, selection - viewDate.getFullYear());
  picker.changeFocus(newDate).changeView(viewId - 1).render();
}
function onClickTodayBtn(datepicker) {
  const picker = datepicker.picker;
  const currentDate = today();
  if (datepicker.config.todayBtnMode === 1) {
    if (datepicker.config.autohide) {
      datepicker.setDate(currentDate);
      return;
    }
    datepicker.setDate(currentDate, { render: false });
    picker.update();
  }
  if (picker.viewDate !== currentDate) {
    picker.changeFocus(currentDate);
  }
  picker.changeView(0).render();
}
function onClickClearBtn(datepicker) {
  datepicker.setDate({ clear: true });
}
function onClickViewSwitch(datepicker) {
  switchView(datepicker);
}
function onClickPrevBtn(datepicker) {
  goToPrevOrNext(datepicker, -1);
}
function onClickNextBtn(datepicker) {
  goToPrevOrNext(datepicker, 1);
}
function onClickView(datepicker, ev) {
  const target = findElementInEventPath(ev, ".datepicker-cell");
  if (!target || target.classList.contains("disabled")) {
    return;
  }
  const { id, isMinView } = datepicker.picker.currentView;
  if (isMinView) {
    datepicker.setDate(Number(target.dataset.date));
  } else if (id === 1) {
    goToSelectedMonthOrYear(datepicker, Number(target.dataset.month));
  } else {
    goToSelectedMonthOrYear(datepicker, Number(target.dataset.year));
  }
}
function onClickPicker(datepicker) {
  if (!datepicker.inline && !datepicker.config.disableTouchKeyboard) {
    datepicker.inputField.focus();
  }
}

// src/picker/Picker.ts
function processPickerOptions(picker, options) {
  if (options.title !== void 0) {
    if (options.title) {
      picker.controls.title.textContent = options.title;
      showElement(picker.controls.title);
    } else {
      picker.controls.title.textContent = "";
      hideElement(picker.controls.title);
    }
  }
  if (options.prevArrow) {
    const prevBtn = picker.controls.prevBtn;
    emptyChildNodes(prevBtn);
    options.prevArrow.forEach((node) => {
      prevBtn.appendChild(node.cloneNode(true));
    });
  }
  if (options.nextArrow) {
    const nextBtn = picker.controls.nextBtn;
    emptyChildNodes(nextBtn);
    options.nextArrow.forEach((node) => {
      nextBtn.appendChild(node.cloneNode(true));
    });
  }
  if (options.locale) {
    picker.controls.todayBtn.textContent = options.locale.today;
    picker.controls.clearBtn.textContent = options.locale.clear;
  }
  if (options.todayBtn !== void 0) {
    if (options.todayBtn) {
      showElement(picker.controls.todayBtn);
    } else {
      hideElement(picker.controls.todayBtn);
    }
  }
  if (hasProperty(options, "minDate") || hasProperty(options, "maxDate")) {
    const { minDate, maxDate } = picker.datepicker.config;
    picker.controls.todayBtn.disabled = !isInRange(today(), minDate, maxDate);
  }
  if (options.clearBtn !== void 0) {
    if (options.clearBtn) {
      showElement(picker.controls.clearBtn);
    } else {
      hideElement(picker.controls.clearBtn);
    }
  }
}
function computeResetViewDate(datepicker) {
  const { dates, config } = datepicker;
  const viewDate = dates.length > 0 ? lastItemOf(dates) : config.defaultViewDate;
  return limitToRange(viewDate, config.minDate, config.maxDate);
}
function setViewDate(picker, newDate) {
  const oldViewDate = new Date(picker.viewDate);
  const newViewDate = new Date(newDate);
  const { id, year, first, last } = picker.currentView;
  const viewYear = newViewDate.getFullYear();
  picker.viewDate = newDate;
  if (viewYear !== oldViewDate.getFullYear()) {
    triggerDatepickerEvent(picker.datepicker, "changeYear");
  }
  if (newViewDate.getMonth() !== oldViewDate.getMonth()) {
    triggerDatepickerEvent(picker.datepicker, "changeMonth");
  }
  switch (id) {
    case 0:
      return newDate < first || newDate > last;
    case 1:
      return viewYear !== year;
    default:
      return viewYear < first || viewYear > last;
  }
}
function getTextDirection(el) {
  return window.getComputedStyle(el).direction;
}
var Picker = class {
  constructor(datepicker) {
    this.datepicker = datepicker;
    const template = pickerTemplate_default.replace(/%buttonClass%/g, datepicker.config.buttonClass);
    const element = this.element = parseHTML(template).firstChild;
    const [header, main, footer] = element.firstChild.children;
    const title = header.firstElementChild;
    const [prevBtn, viewSwitch, nextBtn] = header.lastElementChild.children;
    const [todayBtn, clearBtn] = footer.firstChild.children;
    const controls = {
      title,
      prevBtn,
      viewSwitch,
      nextBtn,
      todayBtn,
      clearBtn
    };
    this.main = main;
    this.controls = controls;
    const elementClass = datepicker.inline ? "inline" : "dropdown";
    element.classList.add(`datepicker-${elementClass}`);
    elementClass === "dropdown" ? element.classList.add("dropdown", "absolute", "top-0", "left-0", "z-20", "pt-2") : null;
    processPickerOptions(this, datepicker.config);
    this.viewDate = computeResetViewDate(datepicker);
    registerListeners(datepicker, [
      [element, "click", onClickPicker.bind(null, datepicker), { capture: true }],
      [main, "click", onClickView.bind(null, datepicker)],
      [controls.viewSwitch, "click", onClickViewSwitch.bind(null, datepicker)],
      [controls.prevBtn, "click", onClickPrevBtn.bind(null, datepicker)],
      [controls.nextBtn, "click", onClickNextBtn.bind(null, datepicker)],
      [controls.todayBtn, "click", onClickTodayBtn.bind(null, datepicker)],
      [controls.clearBtn, "click", onClickClearBtn.bind(null, datepicker)]
    ]);
    this.views = [
      new DaysView(this),
      new MonthsView(this),
      new YearsView(this, { id: 2, name: "years", cellClass: "year", step: 1 }),
      new YearsView(this, { id: 3, name: "decades", cellClass: "decade", step: 10 })
    ];
    this.currentView = this.views[datepicker.config.startView];
    this.currentView.render();
    this.main.appendChild(this.currentView.element);
    datepicker.config.container.appendChild(this.element);
  }
  setOptions(options) {
    processPickerOptions(this, options);
    this.views.forEach((view) => {
      view.init(options, false);
    });
    this.currentView.render();
  }
  detach() {
    if (this.datepicker.config.container && typeof this.datepicker.config.container !== "string") {
      this.datepicker.config.container.removeChild(this.element);
    }
  }
  show() {
    if (this.active) {
      return;
    }
    this.element.classList.add("active", "block");
    this.element.classList.remove("hidden");
    this.active = true;
    const datepicker = this.datepicker;
    if (!datepicker.inline) {
      const inputDirection = getTextDirection(datepicker.inputField);
      if (inputDirection !== getTextDirection(datepicker.config.container)) {
        this.element.dir = inputDirection;
      } else if (this.element.dir) {
        this.element.removeAttribute("dir");
      }
      this.place();
      if (datepicker.config.disableTouchKeyboard) {
        datepicker.inputField.blur();
      }
    }
    triggerDatepickerEvent(datepicker, "show");
  }
  hide() {
    if (!this.active) {
      return;
    }
    this.datepicker.exitEditMode();
    this.element.classList.remove("active", "block");
    this.element.classList.add("active", "block", "hidden");
    this.active = false;
    triggerDatepickerEvent(this.datepicker, "hide");
  }
  place() {
    const { classList, style } = this.element;
    const { config, inputField } = this.datepicker;
    const container = config.container;
    const { width: calendarWidth, height: calendarHeight } = this.element.getBoundingClientRect();
    const { left: containerLeft, top: containerTop, width: containerWidth } = container.getBoundingClientRect();
    const {
      left: inputLeft,
      top: inputTop,
      width: inputWidth,
      height: inputHeight
    } = inputField.getBoundingClientRect();
    let { x: orientX, y: orientY } = config.orientation;
    let scrollTop;
    let left;
    let top;
    if (container === document.body) {
      scrollTop = window.scrollY;
      left = inputLeft + window.scrollX;
      top = inputTop + scrollTop;
    } else {
      scrollTop = container.scrollTop;
      left = inputLeft - containerLeft;
      top = inputTop - containerTop + scrollTop;
    }
    if (orientX === "auto") {
      if (left < 0) {
        orientX = "left";
        left = 10;
      } else if (left + calendarWidth > containerWidth) {
        orientX = "right";
      } else {
        orientX = getTextDirection(inputField) === "rtl" ? "right" : "left";
      }
    }
    if (orientX === "right") {
      left -= calendarWidth - inputWidth;
    }
    if (orientY === "auto") {
      orientY = top - calendarHeight < scrollTop ? "bottom" : "top";
    }
    if (orientY === "top") {
      top -= calendarHeight;
    } else {
      top += inputHeight;
    }
    classList.remove(
      "datepicker-orient-top",
      "datepicker-orient-bottom",
      "datepicker-orient-right",
      "datepicker-orient-left"
    );
    classList.add(`datepicker-orient-${orientY}`, `datepicker-orient-${orientX}`);
    style.top = top ? `${top}px` : top;
    style.left = left ? `${left}px` : left;
  }
  setViewSwitchLabel(labelText) {
    this.controls.viewSwitch.textContent = labelText;
  }
  setPrevBtnDisabled(disabled) {
    const prevBtn = this.controls.prevBtn;
    prevBtn.disabled = disabled;
  }
  setNextBtnDisabled(disabled) {
    const nextBtn = this.controls.nextBtn;
    nextBtn.disabled = disabled;
  }
  changeView(viewId) {
    const oldView = this.currentView;
    const newView = this.views[viewId];
    if (newView.id !== oldView.id) {
      this.currentView = newView;
      this._renderMethod = "render";
      triggerDatepickerEvent(this.datepicker, "changeView");
      this.main.replaceChild(newView.element, oldView.element);
    }
    return this;
  }
  changeFocus(newViewDate) {
    this._renderMethod = setViewDate(this, newViewDate) ? "render" : "refreshFocus";
    this.views.forEach((view) => {
      view.updateFocus();
    });
    return this;
  }
  update() {
    const newViewDate = computeResetViewDate(this.datepicker);
    this._renderMethod = setViewDate(this, newViewDate) ? "render" : "refresh";
    this.views.forEach((view) => {
      view.updateFocus();
      view.updateSelection();
    });
    return this;
  }
  render(quickRender = true) {
    const renderMethod = quickRender && this._renderMethod || "render";
    delete this._renderMethod;
    this.currentView[renderMethod]();
  }
};

// src/events/inputFieldListeners.ts
function findNextAvailableOne(date, addFn, increase, testFn, min, max) {
  if (!isInRange(date, min, max)) {
    return;
  }
  if (testFn(date)) {
    const newDate = addFn(date, increase);
    return findNextAvailableOne(newDate, addFn, increase, testFn, min, max);
  }
  return date;
}
function moveByArrowKey(datepicker, ev, direction, vertical) {
  const picker = datepicker.picker;
  const currentView = picker.currentView;
  const step = currentView.step || 1;
  let viewDate = picker.viewDate;
  let addFn;
  let testFn;
  switch (currentView.id) {
    case 0:
      if (vertical) {
        viewDate = addDays(viewDate, direction * 7);
      } else if (ev.ctrlKey || ev.metaKey) {
        viewDate = addYears(viewDate, direction);
      } else {
        viewDate = addDays(viewDate, direction);
      }
      addFn = addDays;
      testFn = (date) => currentView.disabled.includes(date);
      break;
    case 1:
      viewDate = addMonths(viewDate, vertical ? direction * 4 : direction);
      addFn = addMonths;
      testFn = (date) => {
        const dt = new Date(date);
        const { year, disabled } = currentView;
        return dt.getFullYear() === year && disabled.includes(dt.getMonth());
      };
      break;
    default:
      viewDate = addYears(viewDate, direction * (vertical ? 4 : 1) * step);
      addFn = addYears;
      testFn = (date) => currentView.disabled.includes(startOfYearPeriod(date, step));
  }
  viewDate = findNextAvailableOne(
    viewDate,
    addFn,
    direction < 0 ? -step : step,
    testFn,
    currentView.minDate,
    currentView.maxDate
  );
  if (viewDate !== void 0) {
    picker.changeFocus(viewDate).render();
  }
}
function onKeydown(datepicker, ev) {
  if (ev.key === "Tab") {
    unfocus(datepicker);
    return;
  }
  const picker = datepicker.picker;
  const { id, isMinView } = picker.currentView;
  if (!picker.active) {
    switch (ev.key) {
      case "ArrowDown":
      case "Escape":
        picker.show();
        break;
      case "Enter":
        datepicker.update();
        break;
      default:
        return;
    }
  } else if (datepicker.editMode) {
    switch (ev.key) {
      case "Escape":
        picker.hide();
        break;
      case "Enter":
        datepicker.exitEditMode({ update: true, autohide: datepicker.config.autohide });
        break;
      default:
        return;
    }
  } else {
    switch (ev.key) {
      case "Escape":
        picker.hide();
        break;
      case "ArrowLeft":
        if (ev.ctrlKey || ev.metaKey) {
          goToPrevOrNext(datepicker, -1);
        } else if (ev.shiftKey) {
          datepicker.enterEditMode();
          return;
        } else {
          moveByArrowKey(datepicker, ev, -1, false);
        }
        break;
      case "ArrowRight":
        if (ev.ctrlKey || ev.metaKey) {
          goToPrevOrNext(datepicker, 1);
        } else if (ev.shiftKey) {
          datepicker.enterEditMode();
          return;
        } else {
          moveByArrowKey(datepicker, ev, 1, false);
        }
        break;
      case "ArrowUp":
        if (ev.ctrlKey || ev.metaKey) {
          switchView(datepicker);
        } else if (ev.shiftKey) {
          datepicker.enterEditMode();
          return;
        } else {
          moveByArrowKey(datepicker, ev, -1, true);
        }
        break;
      case "ArrowDown":
        if (ev.shiftKey && !ev.ctrlKey && !ev.metaKey) {
          datepicker.enterEditMode();
          return;
        }
        moveByArrowKey(datepicker, ev, 1, true);
        break;
      case "Enter":
        if (isMinView) {
          datepicker.setDate(picker.viewDate);
        } else {
          picker.changeView(id - 1).render();
        }
        break;
      case "Backspace":
      case "Delete":
        datepicker.enterEditMode();
        return;
      default:
        if (ev.key.length === 1 && !ev.ctrlKey && !ev.metaKey) {
          datepicker.enterEditMode();
        }
        return;
    }
  }
  ev.preventDefault();
  ev.stopPropagation();
}
function onFocus(datepicker) {
  if (datepicker.config.showOnFocus && !datepicker._showing) {
    datepicker.show();
  }
}
function onMousedown(datepicker, ev) {
  const el = ev.target;
  if (datepicker.picker.active || datepicker.config.showOnClick) {
    el._active = el === document.activeElement;
    el._clicking = setTimeout(() => {
      delete el._active;
      delete el._clicking;
    }, 2e3);
  }
}
function onClickInput(datepicker, ev) {
  const el = ev.target;
  if (!el._clicking) {
    return;
  }
  clearTimeout(el._clicking);
  delete el._clicking;
  if (el._active) {
    datepicker.enterEditMode();
  }
  delete el._active;
  if (datepicker.config.showOnClick) {
    datepicker.show();
  }
}
function onPaste(datepicker, ev) {
  if (ev.clipboardData.types.includes("text/plain")) {
    datepicker.enterEditMode();
  }
}

// src/events/otherListeners.ts
function onClickOutside(datepicker, ev) {
  const element = datepicker.element;
  if (element !== document.activeElement) {
    return;
  }
  const pickerElem = datepicker.picker.element;
  if (findElementInEventPath(ev, (el) => el === element || el === pickerElem)) {
    return;
  }
  unfocus(datepicker);
}

// src/DatePicker.ts
function stringifyDates(dates, config) {
  return dates.map((dt) => formatDate(dt, config.format, config.locale)).join(config.dateDelimiter);
}
function processInputDates(datepicker, inputDates, clear = false) {
  const { config, dates: origDates, rangepicker } = datepicker;
  if (inputDates.length === 0) {
    return clear ? [] : void 0;
  }
  const rangeEnd = rangepicker && datepicker === rangepicker.datepickers[1];
  let newDates = inputDates.reduce((dates, dt) => {
    let date = parseDate(dt, config.format, config.locale);
    if (date === void 0) {
      return dates;
    }
    if (config.pickLevel > 0) {
      const dt2 = new Date(date);
      if (config.pickLevel === 1) {
        date = rangeEnd ? dt2.setMonth(dt2.getMonth() + 1, 0) : dt2.setDate(1);
      } else {
        date = rangeEnd ? dt2.setFullYear(dt2.getFullYear() + 1, 0, 0) : dt2.setMonth(0, 1);
      }
    }
    if (isInRange(date, config.minDate, config.maxDate) && !dates.includes(date) && !config.datesDisabled.includes(date) && !config.daysOfWeekDisabled.includes(new Date(date).getDay())) {
      dates.push(date);
    }
    return dates;
  }, []);
  if (newDates.length === 0) {
    return;
  }
  if (config.multidate && !clear) {
    newDates = newDates.reduce(
      (dates, date) => {
        if (!origDates.includes(date)) {
          dates.push(date);
        }
        return dates;
      },
      origDates.filter((date) => !newDates.includes(date))
    );
  }
  return config.maxNumberOfDates && newDates.length > config.maxNumberOfDates ? newDates.slice(config.maxNumberOfDates * -1) : newDates;
}
function refreshUI(datepicker, mode = 3, quickRender = true) {
  const { config, picker, inputField } = datepicker;
  if (mode & 2) {
    const newView = picker.active ? config.pickLevel : config.startView;
    picker.update().changeView(newView).render(quickRender);
  }
  if (mode & 1 && inputField) {
    inputField.value = stringifyDates(datepicker.dates, config);
  }
}
function setDate(datepicker, inputDates, options) {
  let { render, autohide } = options;
  const clear = options.clear;
  if (render === void 0) {
    render = true;
  }
  if (!render) {
    autohide = false;
  } else if (autohide === void 0) {
    autohide = datepicker.config.autohide;
  }
  const newDates = processInputDates(datepicker, inputDates, clear);
  if (!newDates) {
    return;
  }
  if (newDates.toString() !== datepicker.dates.toString()) {
    datepicker.dates = newDates;
    refreshUI(datepicker, render ? 3 : 1);
    triggerDatepickerEvent(datepicker, "changeDate");
  } else {
    refreshUI(datepicker, 1);
  }
  if (autohide) {
    datepicker.hide();
  }
}
var DatePicker = class {
  constructor(element, options = {}, rangepicker = void 0) {
    this.element = element;
    const config = this.config = Object.assign(
      {
        buttonClass: options.buttonClass && String(options.buttonClass) || "button",
        container: document.body,
        defaultViewDate: today(),
        maxDate: void 0,
        minDate: void 0
      },
      processOptions(defaultOptions_default, this)
    );
    this._options = options;
    Object.assign(config, processOptions(options, this));
    const inline = this.inline = element.tagName !== "INPUT";
    let inputField;
    let initialDates;
    if (inline) {
      config.container = element;
      initialDates = stringToArray(element.dataset.date, config.dateDelimiter);
      delete element.dataset.date;
    } else {
      const container = options.container ? typeof options.container === "string" ? document.querySelector(options.container) : options.container : null;
      if (container) {
        config.container = container;
      }
      inputField = this.inputField = element;
      inputField.classList.add("datepicker-input");
      initialDates = stringToArray(inputField.value, config.dateDelimiter);
    }
    if (rangepicker) {
      const index = rangepicker.inputs.indexOf(inputField);
      const datepickers = rangepicker.datepickers;
      if (index < 0 || index > 1 || !Array.isArray(datepickers)) {
        throw Error("Invalid rangepicker object.");
      }
      datepickers[index] = this;
      this.rangePicker = rangepicker;
    }
    this.dates = [];
    const inputDateValues = processInputDates(this, initialDates);
    if (inputDateValues && inputDateValues.length > 0) {
      this.dates = inputDateValues;
    }
    if (inputField) {
      inputField.value = stringifyDates(this.dates, config);
    }
    const picker = this.picker = new Picker(this);
    if (inline) {
      this.show();
    } else {
      const onMousedownDocument = onClickOutside.bind(null, this);
      const listeners = [
        [inputField, "keydown", onKeydown.bind(null, this)],
        [inputField, "focus", onFocus.bind(null, this)],
        [inputField, "mousedown", onMousedown.bind(null, this)],
        [inputField, "click", onClickInput.bind(null, this)],
        [inputField, "paste", onPaste.bind(null, this)],
        [document, "mousedown", onMousedownDocument],
        [document, "touchstart", onMousedownDocument],
        [window, "resize", picker.place.bind(picker)]
      ];
      registerListeners(this, listeners);
    }
  }
  static formatDate(date, format, lang) {
    return formatDate(date, format, lang && locales[lang] || locales.en);
  }
  static parseDate(dateStr, format, lang) {
    return parseDate(dateStr, format, lang && locales[lang] || locales.en);
  }
  static get locales() {
    return locales;
  }
  get active() {
    return !!(this.picker && this.picker.active);
  }
  get pickerElement() {
    return this.picker ? this.picker.element : void 0;
  }
  setOptions(options) {
    const picker = this.picker;
    const newOptions = processOptions(options, this);
    Object.assign(this._options, options);
    Object.assign(this.config, newOptions);
    picker.setOptions(newOptions);
    refreshUI(this, 3);
  }
  show() {
    if (this.inputField) {
      if (this.inputField.disabled) {
        return;
      }
      if (this.inputField !== document.activeElement) {
        this._showing = true;
        this.inputField.focus();
        delete this._showing;
      }
    }
    this.picker.show();
  }
  hide() {
    if (this.inline) {
      return;
    }
    this.picker.hide();
    this.picker.update().changeView(this.config.startView).render();
  }
  destroy() {
    this.hide();
    unregisterListeners(this);
    this.picker.detach();
    if (!this.inline) {
      this.inputField.classList.remove("datepicker-input");
    }
    return this;
  }
  getDate(format = void 0) {
    const callback = format ? (date) => formatDate(date, format, this.config.locale) : (date) => new Date(date);
    if (this.config.multidate) {
      return this.dates.map(callback);
    }
    if (this.dates.length > 0) {
      return callback(this.dates[0]);
    }
  }
  setDate(...dates) {
    const opts = {};
    const lastArg = lastItemOf(dates);
    if (typeof lastArg === "object" && !Array.isArray(lastArg) && !(lastArg instanceof Date) && lastArg) {
      Object.assign(opts, dates.pop());
    }
    const inputDates = Array.isArray(dates[0]) ? dates[0] : dates;
    setDate(this, inputDates, opts);
  }
  update(options = void 0) {
    if (this.inline) {
      return;
    }
    const opts = { clear: true, autohide: !!(options && options.autohide) };
    const inputDates = stringToArray(this.inputField.value, this.config.dateDelimiter);
    setDate(this, inputDates, opts);
  }
  refresh(target = void 0, forceRender = false) {
    if (target && typeof target !== "string") {
      forceRender = target;
      target = void 0;
    }
    let mode;
    if (target === "picker") {
      mode = 2;
    } else if (target === "input") {
      mode = 1;
    } else {
      mode = 3;
    }
    refreshUI(this, mode, !forceRender);
  }
  enterEditMode() {
    if (this.inline || !this.picker.active || this.editMode) {
      return;
    }
    this.editMode = true;
    this.inputField.classList.add("in-edit", "border-blue-700");
  }
  exitEditMode(options = void 0) {
    if (this.inline || !this.editMode) {
      return;
    }
    const opts = Object.assign({ update: false }, options);
    delete this.editMode;
    this.inputField.classList.remove("in-edit", "border-blue-700");
    if (opts.update) {
      this.update(opts);
    }
  }
};

// src/DateRangePicker.ts
function filterOptions(options) {
  const newOpts = Object.assign({}, options);
  delete newOpts.inputs;
  delete newOpts.allowOneSidedRange;
  delete newOpts.maxNumberOfDates;
  return newOpts;
}
function setupDatepicker(rangepicker, changeDateListener, el, options) {
  registerListeners(rangepicker, [[el, "changeDate", changeDateListener]]);
  new DatePicker(el, options, rangepicker);
}
function onChangeDate(rangepicker, ev) {
  if (rangepicker._updating) {
    return;
  }
  rangepicker._updating = true;
  const target = ev.target;
  if (target.datepicker === void 0) {
    return;
  }
  const datepickers = rangepicker.datepickers;
  const setDateOptions = { render: false, clear: false };
  const changedSide = rangepicker.inputs.indexOf(target);
  const otherSide = changedSide === 0 ? 1 : 0;
  const changedDate = datepickers[changedSide].dates[0];
  const otherDate = datepickers[otherSide].dates[0];
  if (changedDate !== void 0 && otherDate !== void 0) {
    if (changedSide === 0 && changedDate > otherDate) {
      datepickers[0].setDate(otherDate, setDateOptions);
      datepickers[1].setDate(changedDate, setDateOptions);
    } else if (changedSide === 1 && changedDate < otherDate) {
      datepickers[0].setDate(changedDate, setDateOptions);
      datepickers[1].setDate(otherDate, setDateOptions);
    }
  } else if (!rangepicker.allowOneSidedRange) {
    if (changedDate !== void 0 || otherDate !== void 0) {
      setDateOptions.clear = true;
      datepickers[otherSide].setDate(datepickers[changedSide].dates, setDateOptions);
    }
  }
  datepickers[0].picker.update().render();
  datepickers[1].picker.update().render();
  delete rangepicker._updating;
}
var DateRangePicker = class {
  constructor(element, options = {}) {
    this.datepickers = [];
    const inputs = Array.isArray(options.inputs) ? options.inputs : Array.from(element.querySelectorAll("input"));
    if (inputs.length < 2) {
      return;
    }
    this.element = element;
    this.inputs = inputs.slice(0, 2);
    this.allowOneSidedRange = !!options.allowOneSidedRange;
    const changeDateListener = onChangeDate.bind(null, this);
    const cleanOptions = filterOptions(options);
    setupDatepicker(this, changeDateListener, this.inputs[0], cleanOptions);
    setupDatepicker(this, changeDateListener, this.inputs[1], cleanOptions);
    Object.freeze(this.datepickers);
    if (this.datepickers[0].dates.length > 0) {
      onChangeDate(this, { target: this.inputs[0] });
    } else if (this.datepickers[1].dates.length > 0) {
      onChangeDate(this, { target: this.inputs[1] });
    }
  }
  get dates() {
    return this.datepickers.length === 2 ? [this.datepickers[0].dates[0], this.datepickers[1].dates[0]] : void 0;
  }
  setOptions(options) {
    this.allowOneSidedRange = !!options.allowOneSidedRange;
    const cleanOptions = filterOptions(options);
    this.datepickers[0].setOptions(cleanOptions);
    this.datepickers[1].setOptions(cleanOptions);
  }
  destroy() {
    this.datepickers[0].destroy();
    this.datepickers[1].destroy();
    unregisterListeners(this);
  }
  getDates(format = void 0) {
    const callback = format ? (date) => formatDate(date, format, this.datepickers[0].config.locale) : (date) => new Date(date);
    return this.dates.map((date) => date === void 0 ? date : callback(date));
  }
  setDates(rangeStart, rangeEnd) {
    const [datepicker0, datepicker1] = this.datepickers;
    const origDates = this.dates;
    this._updating = true;
    datepicker0.setDate(rangeStart);
    datepicker1.setDate(rangeEnd);
    delete this._updating;
    if (datepicker1.dates[0] !== origDates[1]) {
      onChangeDate(this, { target: this.inputs[1] });
    } else if (datepicker0.dates[0] !== origDates[0]) {
      onChangeDate(this, { target: this.inputs[0] });
    }
  }
};
export {
  DatePicker,
  DateRangePicker
};

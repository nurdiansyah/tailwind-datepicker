declare type DateType = Date | string | number;
declare type BeforeShowReturnObject = {
    enabled?: boolean;
    classes?: string;
    content?: string;
};
declare type BeforeShowReturn = BeforeShowReturnObject | string | boolean;
declare type BeforeShow = (date: Date) => BeforeShowReturn;
declare type DatePickerOptions = {
    autohide?: boolean;
    beforeShowDay?: BeforeShow;
    beforeShowDecade?: BeforeShow;
    beforeShowShowMonth?: BeforeShow;
    beforeShowShowYear?: BeforeShow;
    buttonClass?: string;
    calendarWeeks?: boolean;
    clearBtn?: boolean;
    container?: string | HTMLElement;
    dateDelimiter?: string;
    datesDisabled?: DateType[];
    daysOfWeekDisabled?: number[];
    daysOfWeekHighlighted?: number[];
    defaultViewDate?: DateType;
    disableTouchKeyboard?: boolean;
    format?: string;
    getCalendarWeek?: (date: Date, weekStart: number) => number;
    language?: string;
    maxDate?: DateType;
    maxNumberOfDates?: number;
    maxView?: number;
    minDate?: DateType;
    nextArrow?: string;
    orientation?: string;
    pickLevel?: number;
    prevArrow?: string;
    showDaysOfWeek?: boolean;
    showOnClick?: boolean;
    showOnFocus?: boolean;
    startView?: number;
    title?: string;
    todayBtn?: boolean;
    todayBtnMode?: number;
    todayHighlight?: boolean;
    updateOnBlur?: boolean;
    weekStart?: number;
};
declare type DateRangePickerOptions = DatePickerOptions & {
    inputs?: NodeListOf<HTMLInputElement>;
    allowOneSidedRange?: boolean;
};
declare type PickerConfig = Omit<DatePickerOptions, "orientation" | "nextArrow" | "prevArrow"> & {
    orientation?: {
        x: string;
        y: string;
    };
    weekEnd?: number;
    locale?: Record<string, any>;
    multidate?: boolean;
    nextArrow?: NodeListOf<ChildNode>;
    prevArrow?: NodeListOf<ChildNode>;
};

declare abstract class View {
    picker: Picker;
    isMinView: boolean;
    id: string;
    disabled: PickerConfig["datesDisabled"];
    beforeShow: BeforeShow;
    cellClass: string;
    element: HTMLElement;
    selected: any[];
    minYear: DateType;
    minDate: DateType;
    maxDate: DateType;
    step: number;
    protected constructor(picker: any, config: any);
    init(options: any): void;
    performBeforeHook(el: any, current: any, timeValue: any): void;
    abstract setOptions(options: any): void;
    abstract updateFocus(): void;
    abstract updateSelection(): void;
}

declare class DaysView extends View {
    dow: HTMLElement;
    grid: HTMLElement;
    datesDisabled: PickerConfig["datesDisabled"];
    daysOfWeekDisabled: any;
    daysOfWeekHighlighted: any;
    todayHighlight: any;
    weekStart: any;
    weekEnd: any;
    locale: any;
    dayNames: any;
    switchLabelFormat: any;
    calendarWeeks: any;
    first: number;
    last: number;
    start: number;
    focused: any;
    range: any[];
    today: number;
    constructor(picker: any);
    init(options: any, onConstruction?: boolean): void;
    setOptions(options: PickerConfig): void;
    updateFocus(): void;
    updateSelection(): void;
    render(): void;
    refresh(): void;
    refreshFocus(): void;
}

declare class MonthsView extends View {
    [x: string]: any;
    minMonth: number;
    maxYear: any;
    maxMonth: number;
    year: any;
    range: any;
    constructor(picker: any);
    init(options: any, onConstruction?: boolean): void;
    setOptions(options: any): void;
    updateFocus(): void;
    updateSelection(): void;
    render(): void;
    refresh(): void;
    refreshFocus(): void;
}

declare class YearsView extends View {
    navStep: number;
    beforeShowOption: string;
    grid: HTMLElement;
    maxYear: number;
    first: number;
    last: number;
    start: number;
    focused: number;
    range: any;
    constructor(picker: any, config: any);
    init(options: any, onConstruction?: boolean): void;
    setOptions(options: any): void;
    updateFocus(): void;
    updateSelection(): void;
    render(): void;
    refresh(): void;
    refreshFocus(): void;
}

declare class Picker {
    datepicker: DatePicker;
    element: HTMLElement;
    main: HTMLElement;
    controls: {
        title: Element;
        prevBtn: Element;
        viewSwitch: Element;
        nextBtn: Element;
        todayBtn: Element;
        clearBtn: Element;
    };
    viewDate: any;
    views: (DaysView | MonthsView | YearsView)[];
    currentView: DaysView | MonthsView | YearsView;
    active: any;
    private _renderMethod;
    constructor(datepicker: any);
    setOptions(options: any): void;
    detach(): void;
    show(): void;
    hide(): void;
    place(): void;
    setViewSwitchLabel(labelText: any): void;
    setPrevBtnDisabled(disabled: any): void;
    setNextBtnDisabled(disabled: any): void;
    changeView(viewId: any): this;
    changeFocus(newViewDate: any): this;
    update(): this;
    render(quickRender?: boolean): void;
}

/**
 * Class representing a date range picker
 */
declare class DateRangePicker {
    element: HTMLElement;
    inputs: any[];
    allowOneSidedRange: boolean;
    datepickers: DatePicker[];
    _updating: boolean;
    /**
     * Create a date range picker
     * @param  {Element} element - element to bind a date range picker
     * @param  {Object} [options] - config options
     */
    constructor(element: HTMLElement, options?: DateRangePickerOptions);
    /**
     * @type {Array} - selected date of the linked date pickers
     */
    get dates(): any[];
    /**
     * Set new values to the config options
     * @param {Object} options - config options to update
     */
    setOptions(options: any): void;
    /**
     * Destroy the DateRangePicker instance
     * @return {DateRangePicker} - the instance destroyed
     */
    destroy(): void;
    /**
     * Get the start and end dates of the date range
     *
     * The method returns Date objects by default. If format string is passed,
     * it returns date strings formatted in given format.
     * The result array always contains 2 items (start date/end date) and
     * undefined is used for unselected side. (e.g. If none is selected,
     * the result will be [undefined, undefined]. If only the end date is set
     * when allowOneSidedRange config option is true, [undefined, endDate] will
     * be returned.)
     *
     * @param  {String} [format] - Format string to stringify the dates
     * @return {Array} - Start and end dates
     */
    getDates(format?: any): any[];
    /**
     * Set the start and end dates of the date range
     *
     * The method calls datepicker.setDate() internally using each of the
     * arguments in start→end order.
     *
     * When a clear: true option object is passed instead of a date, the method
     * clears the date.
     *
     * If an invalid date, the same date as the current one or an option object
     * without clear: true is passed, the method considers that argument as an
     * "ineffective" argument because calling datepicker.setDate() with those
     * values makes no changes to the date selection.
     *
     * When the allowOneSidedRange config option is false, passing {clear: true}
     * to clear the range works only when it is done to the last effective
     * argument (in other words, passed to rangeEnd or to rangeStart along with
     * ineffective rangeEnd). This is because when the date range is changed,
     * it gets normalized based on the last change at the end of the changing
     * process.
     *
     * @param {Date|Number|String|Object} rangeStart - Start date of the range
     * or {clear: true} to clear the date
     * @param {Date|Number|String|Object} rangeEnd - End date of the range
     * or {clear: true} to clear the date
     */
    setDates(rangeStart: any, rangeEnd: any): void;
}

/**
 * Class representing a date picker
 */
declare class DatePicker {
    element: HTMLElement;
    config: PickerConfig;
    private readonly _options;
    inline: boolean;
    inputField: HTMLInputElement;
    dates: any[];
    picker: Picker;
    rangePicker?: DateRangePicker;
    editMode: boolean;
    _showing: boolean;
    /**
     * Create a date picker
     * @param  {Element} element - element to bind a date picker
     * @param  {Object} [options] - config options
     * @param  {DateRangePicker} [rangepicker] - DateRangePicker instance the
     * date picker belongs to. Use this only when creating date picker as a part
     * of date range picker
     */
    constructor(element: HTMLElement, options?: DatePickerOptions, rangepicker?: DateRangePicker);
    /**
     * Format Date object or time value in given format and language
     * @param  {Date|Number} date - date or time value to format
     * @param  {String|Object} format - format string or object that contains
     * toDisplay() custom formatter, whose signature is
     * - args:
     *   - date: {Date} - Date instance of the date passed to the method
     *   - format: {Object} - the format object passed to the method
     *   - locale: {Object} - locale for the language specified by `lang`
     * - return:
     *     {String} formatted date
     * @param  {String} [lang=en] - language code for the locale to use
     * @return {String} formatted date
     */
    static formatDate(date: any, format: any, lang: any): any;
    /**
     * Parse date string
     * @param  {String|Date|Number} dateStr - date string, Date object or time
     * value to parse
     * @param  {String|Object} format - format string or object that contains
     * toValue() custom parser, whose signature is
     * - args:
     *   - dateStr: {String|Date|Number} - the dateStr passed to the method
     *   - format: {Object} - the format object passed to the method
     *   - locale: {Object} - locale for the language specified by `lang`
     * - return:
     *     {Date|Number} parsed date or its time value
     * @param  {String} [lang=en] - language code for the locale to use
     * @return {Number} time value of parsed date
     */
    static parseDate(dateStr: any, format: any, lang: any): any;
    /**
     * @type {Object} - Installed locales in `[languageCode]: localeObject` format
     * en`:_English (US)_ is pre-installed.
     */
    static get locales(): any;
    /**
     * @type {Boolean} - Whether the picker element is shown. `true` whne shown
     */
    get active(): boolean;
    /**
     * @type {HTMLDivElement} - DOM object of picker element
     */
    get pickerElement(): HTMLElement;
    /**
     * Set new values to the config options
     * @param {Object} options - config options to update
     */
    setOptions(options: any): void;
    /**
     * Show the picker element
     */
    show(): void;
    /**
     * Hide the picker element
     * Not available on inline picker
     */
    hide(): void;
    /**
     * Destroy the Datepicker instance
     */
    destroy(): DatePicker;
    /**
     * Get the selected date(s)
     *
     * The method returns a Date object of selected date by default, and returns
     * an array of selected dates in multidate mode. If format string is passed,
     * it returns date string(s) formatted in given format.
     *
     * @param  {String} [format] - Format string to stringify the date(s)
     * @return {Date|String|Date[]|String[]} - selected date(s), or if none is
     * selected, empty array in multidate mode and untitled in sigledate mode
     */
    getDate(format?: any): any;
    /**
     * Set selected date(s)
     *
     * In multidate mode, you can pass multiple dates as a series of arguments
     * or an array. (Since each date is parsed individually, the type of the
     * dates doesn't have to be the same.)
     * The given dates are used to toggle the select status of each date. The
     * number of selected dates is kept from exceeding the length set to
     * maxNumberOfDates.
     *
     * With clear: true option, the method can be used to clear the selection
     * and to replace the selection instead of toggling in multidate mode.
     * If the option is passed with no date arguments or an empty dates array,
     * it works as "clear" (clear the selection then set nothing), and if the
     * option is passed with new dates to select, it works as "replace" (clear
     * the selection then set the given dates)
     *
     * When render: false option is used, the method omits re-rendering the
     * picker element. In this case, you need to call refresh() method later in
     * order for the picker element to reflect the changes. The input field is
     * refreshed always regardless of this option.
     *
     * When invalid (unparsable, repeated, disabled or out-of-range) dates are
     * passed, the method ignores them and applies only valid ones. In the case
     * that all the given dates are invalid, which is distinguished from passing
     * no dates, the method considers it as an error and leaves the selection
     * untouched.
     *
     * @param {...(Date|Number|String)|Array} [dates] - Date strings, Date
     * objects, time values or mix of those for new selection
     * - clear: {boolean} - Whether to clear the existing selection
     *     defualt: false
     * - render: {boolean} - Whether to re-render the picker element
     *     default: true
     * - autohide: {boolean} - Whether to hide the picker element after re-render
     *     Ignored when used with render: false
     *     default: config.autohide
     */
    setDate(...dates: any[]): void;
    /**
     * Update the selected date(s) with input field's value
     * Not available on inline picker
     *
     * The input field will be refreshed with properly formatted date string.
     *
     * @param  {Object} [options] - function options
     * - autohide: {boolean} - whether to hide the picker element after refresh
     *     default: false
     */
    update(options?: any): void;
    /**
     * Refresh the picker element and the associated input field
     * @param {String} [target] - target item when refreshing one item only
     * 'picker' or 'input'
     * @param {Boolean} [forceRender] - whether to re-render the picker element
     * regardless of its state instead of optimized refresh
     */
    refresh(target?: any, forceRender?: boolean): void;
    /**
     * Enter edit mode
     * Not available on inline picker or when the picker element is hidden
     */
    enterEditMode(): void;
    /**
     * Exit from edit mode
     * Not available on inline picker
     * @param  {Object} [options] - function options
     * - update: {boolean} - whether to call update() after exiting
     *     If false, input field is revert to the existing selection
     *     default: false
     */
    exitEditMode(options?: any): void;
}

export { BeforeShow, BeforeShowReturn, BeforeShowReturnObject, DatePicker, DatePickerOptions, DateRangePicker, DateRangePickerOptions, DateType, PickerConfig };

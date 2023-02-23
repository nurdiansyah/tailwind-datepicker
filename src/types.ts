export type DateType = Date | string | number;
export type BeforeShowReturnObject = {
  enabled?: boolean;
  classes?: string;
  content?: string;
};
export type BeforeShowReturn = BeforeShowReturnObject | string | boolean;

export type BeforeShow = (date: Date) => BeforeShowReturn;

export type DatePickerOptions = {
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

export type DateRangePickerOptions = DatePickerOptions & {
  inputs?: NodeListOf<HTMLInputElement>;
  allowOneSidedRange?: boolean;
};

export type PickerConfig = Omit<DatePickerOptions, "orientation" | "nextArrow" | "prevArrow"> & {
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

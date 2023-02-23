type HookFuncReturnType = {
  enabled?: boolean;
  classes?: string;
  content: string;
} | string | boolean

type DateType = Date | string | number;

export type DatePickerOptions = {
  autohide?: boolean;
  beforeShowDay?: (date: Date) => HookFuncReturnType;
  beforeShowDecade?: (date: Date) => HookFuncReturnType;
  beforeShowShowMonth?: (date: Date) => HookFuncReturnType;
  beforeShowShowYear?: (date: Date) => HookFuncReturnType;
  buttonClass?: string;
  calendarWeeks?: boolean
  clearBtn?: boolean
  container?: string | HTMLElement
  dateDelimiter?: string
  datesDisabled?: DateType[]
  daysOfWeekDisabled?: number[]
  daysOfWeekHighlighted?: number[]
  defaultViewDate?: DateType
  format?: string
  getCalendarWeek?: (date: Date, weekStart: number) => number
  language?: string;
  maxDate?: DateType
  maxNumberOfDates?: number;
  maxView?: number;
  minDate?: DateType
  nextArrow?: string
  orientation?: string
  pickLevel?: number
  prevArrow?: string
  showDaysOfWeek?: boolean
  showOnClick?: boolean
  showOnFocus?: boolean
  startView?: number
  title?: string
  todayBtn?: boolean
  todayBtnMode?: number
  todayHighlight?: boolean
  updateOnBlur?: boolean
  weekStart?: number
}

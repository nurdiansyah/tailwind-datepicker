import { createTagRepeat, optimizeTemplateHTML } from "../../lib/utils.js";

const calendarWeeksTemplate = optimizeTemplateHTML(`<div class="calendar-weeks">
  <div class="days-of-week flex"><span class="dow h-6 leading-6 text-sm font-medium text-gray-500 dark:text-gray-400"></span></div>
  <div class="weeks">${createTagRepeat("span", 6, {
    class:
      "week flex items-center justify-center flex-1 leading-9 border-0 rounded-lg cursor-default text-gray-900 font-semibold text-sm"
  })}</div>
</div>`);

export default calendarWeeksTemplate;

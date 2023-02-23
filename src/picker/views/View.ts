import { pushUnique } from "../../lib/utils.js";
import { parseHTML, replaceChildNodes } from "../../lib/dom.js";
import Picker from "../Picker.js";
import { BeforeShow, PickerConfig, DateType } from "../../types.js";

// Base class of the view classes
export default abstract class View {
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

  protected constructor(picker, config) {
    this.picker = picker;
    this.cellClass = config.cellClass;
    this.id = config.id;
    this.element = parseHTML(`<div class="datepicker-view flex"></div>`).firstChild as HTMLElement;
    this.selected = [];
    this.step = config.step;
    this.init(this.picker.datepicker.config);
  }

  init(options) {
    if (options.pickLevel !== undefined) {
      this.isMinView = this.id === options.pickLevel;
    }
    this.setOptions(options);
    this.updateFocus();
    this.updateSelection();
  }

  // Execute beforeShow() callback and apply the result to the element
  // args:
  // - current - current value on the iteration on view rendering
  // - timeValue - time value of the date to pass to beforeShow()
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

  abstract setOptions(options): void;
  abstract updateFocus(): void;
  abstract updateSelection(): void;
}

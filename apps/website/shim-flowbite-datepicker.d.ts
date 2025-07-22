declare module 'flowbite-datepicker/Datepicker' {
  import type DateRangePicker from 'flowbite-datepicker/DateRangePicker'

  interface DatepickerOptionsFormat {
    toValue: (date: Date, format: object, locale: object) => Date | number
    toDisplay: (date: Date, format: object, locale: object) => string
  }

  interface DatepickerOptionsShortcutKeysDefinition {
    key?: string
    ctrlOrMetaKey?: boolean
    ctrlKey?: boolean
    metaKey?: boolean
    altKey?: boolean
    shiftKey?: boolean
  }

  interface DatepickerOptionsShortcutKeys {
    show?: DatepickerOptionsShortcutKeysDefinition
    hide?: null
    toggle?: DatepickerOptionsShortcutKeysDefinition
    prevButton?: DatepickerOptionsShortcutKeysDefinition
    nextButton?: DatepickerOptionsShortcutKeysDefinition
    viewSwitch?: DatepickerOptionsShortcutKeysDefinition
    clearButton?: DatepickerOptionsShortcutKeysDefinition
    todayButton?: DatepickerOptionsShortcutKeysDefinition
    exitEditMode?: DatepickerOptionsShortcutKeysDefinition
  }

  type DatepickerOptionsOrientationVertical = 'top' | 'middle' | 'bottom' | 'auto'
  type DatepickerOptionsOrientationHorizontal = 'left' | 'center' | 'right' | 'auto'
  type DatepickerOptionsOrientation =
      | `${DatepickerOptionsOrientationVertical} ${DatepickerOptionsOrientationHorizontal}`
      | 'auto'

  export interface DatepickerOptions {
    autohide?: boolean
    beforeShowDay?: (date: Date) => object | string | boolean
    beforeShowDecade?: (date: Date) => object | string | boolean
    beforeShowMonth?: (date: Date) => object | string | boolean
    beforeShowYear?: (date: Date) => object | string | boolean
    buttonClass?: string
    calendarWeeks?: boolean
    clearButton?: boolean
    container?: string | HTMLElement
    dateDelimiter?: string
    datesDisabled?: string[]
    daysOfWeekDisabled?: number[]
    daysOfWeekHighlighted?: number[]
    defaultViewDate?: string | Date | number
    enableOnReadonly?: boolean
    format?: string | DatepickerOptionsFormat
    language?: string
    maxDate?: string | Date | number
    maxNumberOfDates?: number
    maxView?: number
    minDate?: string | Date | number
    nextArrow?: string
    orientation?: DatepickerOptionsOrientation
    pickLevel?: number
    prevArrow?: string
    shortcutKeys?: DatepickerOptionsShortcutKeys
    showDaysOfWeek?: boolean
    showOnClick?: boolean
    showOnFocus?: boolean
    startView?: number
    title?: string
    todayButton?: boolean
    todayButtonMode?: number
    todayHighlight?: boolean
    updateOnBlur?: boolean
    rangePicker?: boolean
    weekNumbers?: number | ((date: Date, weekStart: number) => number)
    weekStart?: number
  }

  export default class Datepicker {
    static formatDate (date: Date | number, format: string, lang?: string): string
    static parseDate (dateStr: string | Date | number, format: string, lang?: string): number
    element: HTMLElement
    dates: any
    config: DatepickerOptions
    inputField: any
    editMode: boolean
    picker: any
    static get locales (): object
    get active (): boolean
    get pickerElement (): HTMLElement | undefined
    constructor (element: HTMLElement, options?: DatepickerOptions, rangepicker?: DateRangePicker)
    setOptions (options: object): void
    show (): void
    hide (): void
    destroy (): Datepicker
    getDate (format?: string): Date | string | Date[] | string[]
    setDate (...args: any[]): void
    update (options?: { clear: boolean, render: boolean }): void
    getFocusedDate (format?: string): Date | string
    setFocusedDate (viewDate?: Date | number | string, resetView?: boolean): void
    refresh (target?: 'picker' | 'input', forceRender?: boolean): void
    enterEditMode (): void
    exitEditMode (options?: object): void
  }
}

declare module 'flowbite-datepicker/DateRangePicker' {
  import { type DatepickerOptions } from 'flowbite-datepicker/Datepicker'
  import type Datepicker from 'flowbite-datepicker/Datepicker'

  export interface DateRangePickerOptions extends DatepickerOptions {
    allowOneSidedRange?: boolean
    inputs?: HTMLElement[]
  }

  export default class DateRangePicker {
    allowOneSidedRange: boolean
    element: HTMLElement
    inputs: HTMLElement[]
    datepickers: Datepicker[]
    get dates (): Date[] | undefined
    constructor (element: HTMLElement, options?: DateRangePickerOptions)
    setOptions (options: object): void
    destroy (): DateRangePicker
    getDates (format?: string): [Date | undefined, Date | undefined]
    setDates (rangeStart: Date | number | string | object, rangeEnd: Date | number | string | object): void
  }
}

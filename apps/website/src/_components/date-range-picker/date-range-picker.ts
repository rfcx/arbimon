import Datepicker, { type DatepickerOptions } from 'flowbite-datepicker/Datepicker'
import DateRangePicker, { type DateRangePickerOptions } from 'flowbite-datepicker/DateRangePicker'

export type FlowbiteDatePicker = Datepicker
export type FlowbiteDatePickerOptions = DatepickerOptions
export type FlowbiteDateRangePicker = DateRangePicker
export type FlowbiteDateRangePickerOptions = DateRangePickerOptions

const initDatePicker =
  (input: HTMLInputElement, options?: FlowbiteDatePickerOptions): FlowbiteDatePicker =>
    new Datepicker(input, options)

const initDateRangePicker =
  (element: HTMLElement, options?: FlowbiteDateRangePickerOptions): FlowbiteDateRangePicker =>
    new DateRangePicker(element, options)

export { initDatePicker, initDateRangePicker }

export interface DateRange {
  dateStartLocalIso: string
  dateEndLocalIso: string
}

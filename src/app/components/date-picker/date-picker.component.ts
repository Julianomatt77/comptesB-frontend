import { Component, OnInit } from '@angular/core';
import { DatepickerOptions } from 'ng2-datepicker';
import { getYear } from 'date-fns';
import locale from 'date-fns/locale/en-US';

@Component({
  selector: 'app-date-picker',
  templateUrl: './date-picker.component.html',
  styleUrls: ['./date-picker.component.css'],
})
export class DatePickerComponent implements OnInit {
  public daterange: any = {};

  // see original project for full list of options
  // can also be setup using the config service to apply to multiple pickers
  public options: any = {
    locale: { format: 'MMMM-YYYY' },
    alwaysShowCalendars: false,
  };

  // date: DateModel;
  // date = new Date();
  // options: DatepickerOptions = {
  //   // minYear: getYear(new Date()) - 30, // minimum available and selectable year
  //   // maxYear: getYear(new Date()) + 30, // maximum available and selectable year
  //   placeholder: '', // placeholder in case date model is null | undefined, example: 'Please pick a date'
  //   // format: 'LLLL do yyyy', // date format to display in input
  //   format: 'LLLL do yyyy', // date format to display in input
  //   formatTitle: 'LLLL yyyy',
  //   formatDays: 'EEEEE',
  //   firstCalendarDay: 0, // 0 - Sunday, 1 - Monday
  //   locale: locale, // date-fns locale
  //   position: 'bottom',
  //   inputClass: '', // custom input CSS class to be applied
  //   calendarClass: 'datepicker-default', // custom datepicker calendar CSS class to be applied
  //   scrollBarColor: '#dfe3e9', // in case you customize you theme, here you define scroll bar color
  //   // keyboardEvents: true, // enable keyboard events
  // };

  constructor() {}

  ngOnInit(): void {}

  public selectedDate(value: any, datepicker?: any) {
    // this is the date  selected
    console.log(value);

    // any object can be passed to the selected event and it will be passed back here
    datepicker.start = value.start;
    datepicker.end = value.end;

    // use passed valuable to update state
    this.daterange.start = value.start;
    this.daterange.end = value.end;
    this.daterange.label = value.label;
  }
}

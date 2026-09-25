// src/config/constants.js

export const DISPLAY_DAYS = 7;
export const TIDE_CACHE_DAYS = 14;
export const TIME_ZONE = "Australia/Brisbane";
export const SOLUNAR_MAJOR_WINDOW_MINUTES = 60;
export const SOLUNAR_MINOR_WINDOW_MINUTES = 30;

export const LOCATION = {
  lat: -26.7075,
  lon: 153.132,
  // WorldTides returns heights relative to Mean Sea Level; shift to Chart Datum (LAT)
  datumOffset: 0.95,
};

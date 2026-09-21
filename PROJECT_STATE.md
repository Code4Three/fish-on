# Fish On - Current Product State

## Product Summary

Fish On is an initial working fishing-conditions MVP for recreational anglers. It brings tide, astronomical, weather, wind, cloud, rain, and atmospheric-pressure information together into a seven-day conditions outlook for a configured location.

The current product helps an angler inspect how these conditions are expected to develop across each day. It presents the information for planning and comparison, including runtime fishing scores based on tide and solunar conditions. The latest scoring user story is implemented in the weekly view.

## Epics

### FO-1: Conditions Intelligence

**Outcome:** Acquire, calculate, and unify accurate environmental, weather, tide, and astronomical data into a reliable single source of truth.

### FO-2: Conditions Planning & Visualisation

**Outcome:** Help anglers quickly understand *when* conditions look best for fishing.

### FO-3: Fishing Prediction & Scoring

**Outcome:** Turn multiple conditions into an understandable prediction of fishing opportunity.

### FO-4: Fishing Locations

**Outcome:** Anglers can plan fishing conditions for the specific place they intend to fish, with forecasts and environmental data calculated for that location.

### FO-5: Catch & Session Log

**Outcome:** Allow anglers to record fishing sessions and catches so they can identify patterns over time.

### FO-6: Species & Fishing Profiles

**Outcome:** Tailor fishing information and recommendations to the species being targeted.

### FO-7: Personalisation

**Outcome:** Anglers can tailor Fish On to their fishing preferences so that the conditions, recommendations and insights shown are relevant to how and where they fish.

## Current MVP

The current end-to-end experience is a weekly conditions view. The application loads a generated conditions dataset and displays the available seven-day period as a sequence of daily sections.

Each day is split into:

- Anchored daily information on the left, including tide extremes, sunrise and sunset, moon timing and phase, solunar peaks, weather summary, temperature, wind, cloud, and pressure ranges.
- An hourly conditions timeline extending across the right, with 24 hourly entries for tide stage, solunar condition, weather, pressure, wind, temperature, cloud cover, and rain chance.

The view includes loading and no-data states. The current repository provides evidence of this display working from the populated generated conditions file. Runtime freshness of that file depends on the data-building process described below.

Hourly fishing scores are calculated in the browser from tide and solunar conditions, displayed as numeric scores with semantic bands, and explained by a colour legend. The scoring rules and unit tests are included in the repository.

## Implemented Capabilities

### Tides

Fish On displays daily high and low tide times and a classified hourly tide stage such as run-in or run-out phases. The unified conditions data also contains tide heights, but the current weekly UI does not display those numeric heights. Tide stages are derived from the position between surrounding tide events.

### Solunar information

Fish On displays daily solunar peaks for major moon-transit and minor moon-rise/moon-set periods. The hourly timeline identifies solunar windows and their boundaries where they fall within an hour.

### Sun and moon information

The daily view displays sunrise, sunset, moonrise, moonset, moon phase, and moon illumination when values are available.

### Weather

Fish On displays a daily weather summary and hourly weather conditions. The hourly view includes temperature and rain chance, while daily information includes a temperature range.

### Wind

The product displays daily wind ranges or a daily wind baseline, together with hourly wind speed and compass direction.

### Atmospheric pressure

Fish On displays daily pressure ranges and hourly pressure values labelled in hPa.

### Cloud cover

The weekly view displays a daily cloud-cover baseline and hourly cloud-cover percentages.

### Unified daily and hourly conditions

The application presents the different condition types through one common daily/hourly conditions structure. This allows an angler to compare anchored daily context with the conditions at individual hours.

### Weekly visualisation

The current primary screen provides a seven-day outlook with one section per day. The layout is intentionally split between anchored daily values and a horizontally scrollable hourly timeline, including responsive behavior for smaller screens.

## Partially Implemented Capabilities

### Separate tide conditions display

A tide-only conditions component exists and reads cached tide records, but it is not mounted by the current application entry point. It is therefore not part of the confirmed primary user experience.

### Data freshness and runtime updates

The application view reads the generated `/conditions.json` file. The repository contains build-time fetch and cache logic, but the current UI does not directly refresh external providers in the browser. The exact runtime update behavior after deployment cannot be confirmed from the UI alone.

## Current User Interface

The confirmed user-facing interface now has a persistent application header and unified global menu around the weekly conditions page. The weekly view contains a page heading, a list of daily sections, anchored daily condition rows, and an hourly timeline for each day.

The hourly timeline contains rows for hour, tide stage, solunar condition, weather, pressure, wind, temperature, cloud, and rain. On narrower screens, the daily content stacks vertically and the hourly timeline can scroll horizontally.

The global menu provides navigation targets for Weekly Forecast, Dedicated Tide, Dedicated Solunar, Options & Configuration, Map Picker, and Manage Locations. Tide, Solunar, Options, Map Picker, and Manage Locations currently render placeholder destinations for follow-on feature work.

The menu includes seeded saved locations from `src/config/appConfig.json`. The active location is held in application state and its identifier is persisted in browser `localStorage` so it is restored between sessions. Location selection currently updates the active badge and shared state only; it does not rebuild the generated forecast payload.

## Data and Conditions Model

Fish On prepares data before the browser view uses it. The build sequence obtains or calculates the source datasets, then combines them into `public/conditions.json`.

The unified conditions data contains a fixed set of display days. Each day has:

- Anchored values for daily events and ranges, such as tide extremes, daylight, lunar timing, solunar peaks, weather, wind, cloud, and pressure.
- Hourly values for all 24 hours, including an interpolated tide height, tide stage, solunar status, weather labels, pressure, wind, temperature, cloud, and rain chance. The current UI renders the tide stage but not the numeric tide height.

Tide events are grouped by local day. Surrounding events from adjacent days are included when needed to interpolate hourly tide heights and classify the tide stage. Weather API fields are converted into display-oriented labels, compass directions, rounded values, and daily ranges or baselines.

The current configuration confirms a seven-day display period, the `Australia/Brisbane` time zone, and one fixed latitude/longitude. User-configurable locations are not confirmed.

## External Data Sources

### WorldTides

The build process uses the WorldTides API to obtain tide extremes for the configured location. Tide records are stored in a local cache and reused or refreshed when display-date coverage is missing.

### Open-Meteo

The build process uses the Open-Meteo forecast API to obtain daily and hourly weather data, including weather codes, temperature, pressure, cloud cover, precipitation probability, wind speed, and wind direction. A cached weather dataset is used when the fetch fails and suitable cached data is available.

No other external API or data provider is confirmed as being used by the current implementation.

## Calculated/Derived Conditions

Fish On calculates or derives several product values from source data:

- Sunrise, sunset, moonrise, moonset, moon phase, and moon illumination are calculated locally for the configured location.
- Solunar major and minor windows are derived from moon positions and moon-rise/set times.
- Hourly tide heights are interpolated between surrounding tide extremes.
- Hourly tide stages are classified as phases of incoming or outgoing tide movement.
- Weather codes are converted into readable condition labels, wind degrees into compass directions, and hourly values into daily ranges or baselines.
- Hourly solunar labels identify peaks, windows, and boundaries that overlap each hour.

These derived values are included in the unified conditions data and are displayed by the weekly view where applicable.

## Important Current Architecture

- The browser application mounts a shared `AppProvider` and persistent `GlobalHeader`, then selects the active destination view from client-side application state.
- The browser reads a generated static conditions file rather than calling the external providers directly.
- The global menu uses a desktop dropdown at widths of 768px and above and a full-width mobile drawer below 768px.
- Saved locations are seeded by an expandable configuration document, while the active location key is persisted in browser storage.
- Separate build scripts prepare tides, Sun/Moon values, solunar values, weather, and the final unified conditions dataset.
- Tide records use a local cache and are refreshed at build time when the required display dates are not covered.
- Daily anchored information and hourly information are separate parts of the unified conditions structure and are rendered in separate areas of each day section.
- The configured location and time zone are shared by the data-building and date-formatting logic.

## Known Limitations / Incomplete Areas

- Fishing scores use a V1 heuristic and are not species-calibrated. The generated conditions payload remains raw; calculated scores and display bands are derived in the browser. Dynamic species selection and user-facing weight controls remain outside the current product boundary.
- The current application does not provide editable location management, map picking, or a user-facing way to change date range or time zone. The menu exposes placeholder destinations for these future capabilities.
- Selecting a seeded location changes client-side application state but does not yet refresh provider data or recalculate environmental conditions for that location.
- The current application does not confirm live provider refresh from the browser. Data availability and freshness depend on generated files and the build process.
- The separate tide-only component is not connected to the current app entry point.
- Some individual daily or hourly values can be unavailable and are displayed as `-` by the weekly view.
- The scoring engine has focused unit tests. Broader UI and data-pipeline test coverage is not confirmed.

## Current Product Boundary

Fish On currently is a functioning conditions-comparison MVP: a fixed-location, seven-day weekly display that combines tide, solunar, sun/moon, weather, wind, cloud, rain, temperature, and pressure information into daily and hourly views.

Fish On is not currently confirmed to be a fishing-success predictor, automated recommendation system, trip planner, species-specific guide, multi-location product, or user-configurable planning tool. The current product does include a V1 fishing scoring engine connected to the weekly user experience, but it is not species-calibrated and does not make automated recommendations.

## Repository Evidence Notes

This snapshot was established by inspecting:

- The mounted application entry point and weekly view in `src/App.jsx` and `src/views/WeeklyView.jsx`.
- The weekly layout rules in `src/views/WeeklyView.css`.
- The unified data builder in `src/builders/unifiedConditions.js` and the generated payload in `public/conditions.json`.
- The build sequence in `src/scripts/buildAll.js` and the individual data-build scripts.
- Tide API, cache, and normalization code in `src/api/tides.js`, `src/cache/tideCache.js`, `src/builders/tides.js`, and `src/utils/tides.js`.
- Weather acquisition and normalization in `src/builders/weather.js`.
- Sun/Moon and solunar calculations in `src/scripts/buildSunMoon.js` and `src/builders/solunar.js`.
- Shared location, time zone, and display-day configuration in `src/config/constants.js`.
- The unmounted tide-only component in `src/components/ConditionsDisplay.jsx`.
- The scoring rules, runtime scoring engine, weekly score display, colour legend, and focused tests in `src/config/scoringRules.json`, `src/utils/scoringEngine.js`, `src/views/WeeklyView.jsx`, and `src/utils/scoringEngine.test.js`.

# fish-on

Simple app to see optimal fishing times

Product vision
The app will provide a simple layout allowing users to easily determine and plan fishing trips that fit into their life and schedule and provide the best opportunity to maximise results and enjoyment.

It must consider tides, solunar calendar, barometric pressure as base parameters and also weather, location, time of year relevant to available species.

It must be easy to read and understand at a glance. It will provide algorithmic score/s based on major and minor conditions but also provide all information for a given location and time so the angler can see what parameters are favourable and which aren't.

It should be easily navigable to determine which day and times are the best options.

## Deployment

The app can be deployed to static hosting as a Vite project. Set the build command to `npm run build` and the output directory to `dist`. No tide API route or API key is required at runtime: tide data is bundled into the client as a location-keyed static dataset and synchronized into browser IndexedDB.

Open-Meteo data is fetched from the browser via their free API. Additional locations can be added to the static dataset using the same coordinate/timezone location key used by the browser cache.

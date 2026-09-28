# fish-on

Simple app to see optimal fishing times

Product vision
The app will provide a simple layout allowing users to easily determine and plan fishing trips that fit into their life and schedule and provide the best opportunity to maximise results and enjoyment.

It must consider tides, solunar calendar, barometric pressure as base parameters and also weather, location, time of year relevant to available species.

It must be easy to read and understand at a glance. It will provide algorithmic score/s based on major and minor conditions but also provide all information for a given location and time so the angler can see what parameters are favourable and which aren't.

It should be easily navigable to determine which day and times are the best options.

## Deployment

The app can be deployed to Vercel as a Vite project. Set the build command to `npm run build` and the output directory to `dist`. Add `WORLDTIDES_KEY` as a server-side environment variable in the Vercel project settings; the `/api/tides` function uses it without exposing the key to the browser. No user data is stored by the function.

Open-Meteo data is cached per browser in IndexedDB. In local development, the Vite dev server also mirrors the active location's cache to `public/conditions.json`; that debug file is excluded from production builds and is never read by the app.

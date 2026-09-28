import { useState } from "react";
import { Check, MapPin, Plus, Trash2 } from "lucide-react";
import { useApp } from "../state/useApp";
import { convertDisplayValueToMetric, formatMetricLabel, formatMetricValue } from "../utils/measurementUnits";

export default function ManageLocationsView() {
  const {
    activeLocation,
    addLocation,
    locations,
    removeLocation,
    selectLocation,
    unitSystem,
  } = useApp();
  const [formValues, setFormValues] = useState({
    name: "",
    region: "",
    latitude: "",
    longitude: "",
    timezone: activeLocation.timezone,
    water: "Salt",
    tide: "Tidal",
    datumOffset: "0",
  });
  const [formError, setFormError] = useState("");

  function handleFieldChange(event) {
    const { name, value } = event.target;
    setFormValues((currentValues) => ({ ...currentValues, [name]: value }));
  }

  function handleDatumOffsetChange(event) {
    const displayedValue = event.target.value;
    const metricValue = displayedValue === ""
      ? ""
      : String(
        convertDisplayValueToMetric(
          "datumOffset",
          Number(displayedValue),
          unitSystem,
        ) ?? "",
      );
    setFormValues((currentValues) => ({
      ...currentValues,
      datumOffset: metricValue,
    }));
  }

  function handleLocationSubmit(event) {
    event.preventDefault();
    const latitude = Number(formValues.latitude);
    const longitude = Number(formValues.longitude);

    if (
      !formValues.name.trim() ||
      !Number.isFinite(latitude) ||
      latitude < -90 ||
      latitude > 90 ||
      !Number.isFinite(longitude) ||
      longitude < -180 ||
      longitude > 180
    ) {
      setFormError("Enter a name and valid latitude/longitude.");
      return;
    }

    try {
      new Intl.DateTimeFormat("en", { timeZone: formValues.timezone });
    } catch {
      setFormError("Enter a valid IANA timezone, such as Australia/Brisbane.");
      return;
    }

    addLocation({
      name: formValues.name.trim(),
      region: formValues.region.trim(),
      lat: latitude,
      lon: longitude,
      timezone: formValues.timezone.trim(),
      water: formValues.water,
      tide: formValues.tide,
      datumOffset: Number(formValues.datumOffset) || 0,
    });
    setFormError("");
    setFormValues({
      name: "",
      region: "",
      latitude: "",
      longitude: "",
      timezone: activeLocation.timezone,
      water: "Salt",
      tide: "Tidal",
      datumOffset: "0",
    });
  }

  return (
    <main className="min-h-screen bg-hull-950 px-5 pb-16 pt-10 text-slate-100 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="border-b border-hull-700 pb-6">
          <p className="font-body text-xs font-bold uppercase text-tide-400">
            Locations
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-white">
            Saved fishing spots
          </h1>
          <p className="mt-2 max-w-xl font-body text-sm text-slate-400">
            {locations.length} locations saved in this browser
          </p>
        </header>

        <section className="grid gap-10 py-8 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.8fr)]">
          <div>
            <h2 className="mb-4 font-display text-xl font-semibold text-white">
              Your locations
            </h2>
            <ul className="divide-y divide-hull-700">
              {locations.map((location) => {
                const isActive = location.id === activeLocation.id;
                return (
                  <li
                    className="flex items-center gap-3 py-4"
                    key={location.id}
                  >
                    <MapPin className="h-5 w-5 shrink-0 text-tide-400" aria-hidden="true" />
                    <button
                      className="min-w-0 flex-1 text-left"
                      type="button"
                      onClick={() => selectLocation(location.id)}
                    >
                      <span className="block truncate font-body text-sm font-semibold text-white">
                        {location.name}
                      </span>
                      <span className="mt-1 block truncate font-body text-xs text-slate-400">
                        {location.region || `${location.lat}, ${location.lon}`} · {location.timezone}
                      </span>
                    </button>
                    {isActive && (
                      <Check className="h-5 w-5 text-green-400" aria-label="Active location" />
                    )}
                    <button
                      className="grid h-9 w-9 shrink-0 place-items-center rounded border border-hull-700 text-slate-300 hover:border-red-400 hover:text-red-300 disabled:opacity-40"
                      type="button"
                      aria-label={`Remove ${location.name}`}
                      title={`Remove ${location.name}`}
                      disabled={locations.length <= 1}
                      onClick={() => removeLocation(location.id)}
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          <form className="space-y-4 border-t border-hull-700 pt-6 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0" onSubmit={handleLocationSubmit}>
            <h2 className="font-display text-xl font-semibold text-white">
              Add a location
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-1 font-body text-xs text-slate-300 sm:col-span-2">
                Name
                <input
                  className="w-full rounded border border-hull-700 bg-hull-900 px-3 py-2.5 text-sm text-white outline-none focus:border-tide-400"
                  name="name"
                  value={formValues.name}
                  onChange={handleFieldChange}
                  required
                />
              </label>
              <label className="space-y-1 font-body text-xs text-slate-300 sm:col-span-2">
                Region
                <input
                  className="w-full rounded border border-hull-700 bg-hull-900 px-3 py-2.5 text-sm text-white outline-none focus:border-tide-400"
                  name="region"
                  value={formValues.region}
                  onChange={handleFieldChange}
                />
              </label>
              <label className="space-y-1 font-body text-xs text-slate-300">
                Latitude
                <input
                  className="w-full rounded border border-hull-700 bg-hull-900 px-3 py-2.5 text-sm text-white outline-none focus:border-tide-400"
                  name="latitude"
                  type="number"
                  min="-90"
                  max="90"
                  step="any"
                  value={formValues.latitude}
                  onChange={handleFieldChange}
                  required
                />
              </label>
              <label className="space-y-1 font-body text-xs text-slate-300">
                Longitude
                <input
                  className="w-full rounded border border-hull-700 bg-hull-900 px-3 py-2.5 text-sm text-white outline-none focus:border-tide-400"
                  name="longitude"
                  type="number"
                  min="-180"
                  max="180"
                  step="any"
                  value={formValues.longitude}
                  onChange={handleFieldChange}
                  required
                />
              </label>
              <label className="space-y-1 font-body text-xs text-slate-300 sm:col-span-2">
                Timezone
                <input
                  className="w-full rounded border border-hull-700 bg-hull-900 px-3 py-2.5 text-sm text-white outline-none focus:border-tide-400"
                  name="timezone"
                  placeholder="Australia/Brisbane"
                  value={formValues.timezone}
                  onChange={handleFieldChange}
                  required
                />
              </label>
              <label className="space-y-1 font-body text-xs text-slate-300">
                Water
                <select
                  className="w-full rounded border border-hull-700 bg-hull-900 px-3 py-2.5 text-sm text-white outline-none focus:border-tide-400"
                  name="water"
                  value={formValues.water}
                  onChange={handleFieldChange}
                >
                  <option>Salt</option>
                  <option>Fresh</option>
                </select>
              </label>
              <label className="space-y-1 font-body text-xs text-slate-300">
                Tide
                <select
                  className="w-full rounded border border-hull-700 bg-hull-900 px-3 py-2.5 text-sm text-white outline-none focus:border-tide-400"
                  name="tide"
                  value={formValues.tide}
                  onChange={handleFieldChange}
                >
                  <option>Tidal</option>
                  <option>Non-tidal</option>
                </select>
              </label>
              {formValues.tide === "Tidal" && (
                <label className="space-y-1 font-body text-xs text-slate-300 sm:col-span-2">
                  {formatMetricLabel("datumOffset", unitSystem, true)}
                  <input
                    className="w-full rounded border border-hull-700 bg-hull-900 px-3 py-2.5 text-sm text-white outline-none focus:border-tide-400"
                    name="datumOffset"
                    type="number"
                    step="any"
                    value={formatMetricValue(
                      "datumOffset",
                      Number(formValues.datumOffset),
                      unitSystem,
                      false,
                      "0",
                    )}
                    onChange={handleDatumOffsetChange}
                  />
                </label>
              )}
            </div>
            {formError && (
              <p className="font-body text-sm text-red-300" role="alert">
                {formError}
              </p>
            )}
            <button
              className="inline-flex items-center gap-2 rounded bg-tide-500 px-4 py-2.5 font-body text-sm font-semibold text-hull-950 hover:bg-tide-400"
              type="submit"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Save location
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}

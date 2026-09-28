import { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import appConfig from "../config/appConfig.json";
import {
  deleteRuntimeLocation,
  saveRuntimeLocation,
} from "../cache/runtimeStore.js";
import { getRuntimeLocationKey } from "../data/runtimeData.js";
import AppContext from "./appContextValue";
import { VIEWS } from "./viewConstants";

const ACTIVE_LOCATION_KEY = "fish-on.active-location";
const SAVED_LOCATIONS_KEY = "fish-on.saved-locations";

function isValidLocation(location) {
  return (
    location &&
    typeof location.id === "string" &&
    typeof location.name === "string" &&
    Number.isFinite(location.lat) &&
    Number.isFinite(location.lon) &&
    typeof location.timezone === "string" &&
    location.timezone.length > 0
  );
}

function getStoredLocations() {
  try {
    const storedLocations = JSON.parse(
      window.localStorage.getItem(SAVED_LOCATIONS_KEY) ?? "null",
    );
    if (Array.isArray(storedLocations)) {
      const validLocations = storedLocations.filter(isValidLocation);
      if (validLocations.length) return validLocations;
    }
  } catch {
    // Fall back to the bundled locations if local storage is malformed or unavailable.
  }
  return appConfig.locations;
}

function getStoredLocationId(locations) {
  try {
    const storedId = window.localStorage.getItem(ACTIVE_LOCATION_KEY);
    return locations.some((location) => location.id === storedId)
      ? storedId
      : locations[0].id;
  } catch {
    return locations[0].id;
  }
}

export function AppProvider({ children }) {
  const [locations, setLocations] = useState(getStoredLocations);
  const [activeView, setActiveView] = useState(VIEWS.WEEKLY);
  const [activeLocationId, setActiveLocationId] = useState(() => {
    return getStoredLocationId(getStoredLocations());
  });
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    try {
      window.localStorage.setItem(SAVED_LOCATIONS_KEY, JSON.stringify(locations));
      window.localStorage.setItem(ACTIVE_LOCATION_KEY, activeLocationId);
    } catch {
      // App state remains usable when browser storage is unavailable.
    }
    locations.forEach((location) => {
      const locationKey = getRuntimeLocationKey(location);
      saveRuntimeLocation({ ...location, id: locationKey, locationKey }).catch(
        () => { },
      );
    });
  }, [activeLocationId, locations]);

  const activeLocation = useMemo(
    () =>
      locations.find((location) => location.id === activeLocationId) ??
      locations[0],
    [activeLocationId, locations],
  );

  const value = useMemo(
    () => ({
      activeView,
      activeLocation,
      locations,
      preferences: appConfig.preferences,
      isMenuOpen,
      addLocation: (location) => {
        const existingLocation = locations.find(
          (savedLocation) =>
            savedLocation.lat === location.lat &&
            savedLocation.lon === location.lon &&
            savedLocation.timezone === location.timezone,
        );
        if (existingLocation) {
          setActiveLocationId(existingLocation.id);
          setIsMenuOpen(false);
          return existingLocation.id;
        }

        const locationId = `spot-${location.lat}-${location.lon}-${location.timezone}`;
        const savedLocation = { ...location, id: locationId };
        setLocations((currentLocations) => [...currentLocations, savedLocation]);
        setActiveLocationId(locationId);
        setIsMenuOpen(false);
        return locationId;
      },
      removeLocation: (locationId) => {
        const locationToRemove = locations.find(
          (location) => location.id === locationId,
        );
        if (!locationToRemove || locations.length <= 1) return;

        const remainingLocations = locations.filter(
          (location) => location.id !== locationId,
        );
        setLocations(remainingLocations);
        if (locationId === activeLocationId) {
          setActiveLocationId(remainingLocations[0].id);
        }
        deleteRuntimeLocation(getRuntimeLocationKey(locationToRemove)).catch(
          () => { },
        );
      },
      navigateTo: (view) => {
        setActiveView(view);
        setIsMenuOpen(false);
      },
      selectLocation: (locationId) => {
        if (
          locations.some((location) => location.id === locationId)
        ) {
          setActiveLocationId(locationId);
        }
        setIsMenuOpen(false);
      },
      openMenu: () => setIsMenuOpen(true),
      closeMenu: () => setIsMenuOpen(false),
      toggleMenu: () => setIsMenuOpen((open) => !open),
    }),
    [activeLocation, activeLocationId, activeView, isMenuOpen, locations],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

AppProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

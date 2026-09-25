import { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import appConfig from "../config/appConfig.json";
import AppContext from "./appContextValue";
import { VIEWS } from "./viewConstants";

const ACTIVE_LOCATION_KEY = "fish-on.active-location";

function getStoredLocationId() {
  try {
    return window.localStorage.getItem(ACTIVE_LOCATION_KEY);
  } catch {
    return null;
  }
}

export function AppProvider({ children }) {
  const [activeView, setActiveView] = useState(VIEWS.WEEKLY);
  // Restore the last-selected location, falling back to the first config entry if it's missing/invalid
  const [activeLocationId, setActiveLocationId] = useState(() => {
    const storedId = getStoredLocationId();
    return appConfig.locations.some((location) => location.id === storedId)
      ? storedId
      : appConfig.locations[0].id;
  });
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    try {
      window.localStorage.setItem(ACTIVE_LOCATION_KEY, activeLocationId);
    } catch {
      // State remains usable when browser storage is unavailable.
    }
  }, [activeLocationId]);

  const activeLocation = useMemo(
    () =>
      appConfig.locations.find(
        (location) => location.id === activeLocationId,
      ) ?? appConfig.locations[0],
    [activeLocationId],
  );

  const value = useMemo(
    () => ({
      activeView,
      activeLocation,
      locations: appConfig.locations,
      preferences: appConfig.preferences,
      isMenuOpen,
      navigateTo: (view) => {
        setActiveView(view);
        setIsMenuOpen(false);
      },
      selectLocation: (locationId) => {
        if (
          appConfig.locations.some((location) => location.id === locationId)
        ) {
          setActiveLocationId(locationId);
        }
        setIsMenuOpen(false);
      },
      openMenu: () => setIsMenuOpen(true),
      closeMenu: () => setIsMenuOpen(false),
      toggleMenu: () => setIsMenuOpen((open) => !open),
    }),
    [activeLocation, activeView, isMenuOpen],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

AppProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

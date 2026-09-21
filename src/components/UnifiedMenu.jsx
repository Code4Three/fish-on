import { useApp } from "../state/useApp";
import { VIEWS } from "../state/viewConstants";

const viewLinks = [
  [VIEWS.WEEKLY, "Weekly Forecast", "Seven-day conditions outlook"],
  [VIEWS.TIDE, "Dedicated Tide View", "Highs, lows, and tide stages"],
  [VIEWS.SOLUNAR, "Dedicated Solunar View", "Moon timing and activity windows"]
];

export default function UnifiedMenu() {
  const {
    activeView,
    activeLocation,
    locations,
    navigateTo,
    selectLocation
  } = useApp();

  return (
    <div className="unified-menu" id="global-navigation" role="dialog" aria-label="Fish On navigation">
      <div className="menu-section">
        <p className="menu-section-title">Views &amp; Insights</p>
        <nav aria-label="Views">
          {viewLinks.map(([view, label, description]) => (
            <button
              className={`menu-link ${activeView === view ? "is-active" : ""}`}
              type="button"
              key={view}
              onClick={() => navigateTo(view)}
            >
              <span className="menu-link-copy">
                <strong>{label}</strong>
                <small>{description}</small>
              </span>
              <span className="menu-link-arrow" aria-hidden="true">&rarr;</span>
            </button>
          ))}
        </nav>
      </div>

      <div className="menu-section">
        <div className="menu-section-heading">
          <p className="menu-section-title">Active Location &amp; Saved Spots</p>
          <span className="menu-count">{locations.length}</span>
        </div>
        <div className="active-spot-card">
          <div>
            <strong>{activeLocation.name}</strong>
            <small>{activeLocation.region}</small>
          </div>
          <div className="spot-badges">
            <span>{activeLocation.tide}</span>
            <span>{activeLocation.water}</span>
          </div>
        </div>
        <div className="saved-spots" aria-label="Saved locations">
          {locations.map(location => (
            <button
              className={`saved-spot ${location.id === activeLocation.id ? "is-active" : ""}`}
              type="button"
              key={location.id}
              onClick={() => selectLocation(location.id)}
            >
              <span>{location.name}</span>
              {location.id === activeLocation.id && <span className="spot-check" aria-label="Active">&#10003;</span>}
            </button>
          ))}
        </div>
        <button className="menu-action menu-action-primary" type="button" onClick={() => navigateTo(VIEWS.MAP_PICKER)}>
          <span aria-hidden="true">+</span> Add New Spot (Map Picker)
        </button>
        <button className="menu-action" type="button" onClick={() => navigateTo(VIEWS.MANAGE_LOCATIONS)}>
          Manage Locations <span aria-hidden="true">&rarr;</span>
        </button>
      </div>

      <div className="menu-section menu-section-last">
        <p className="menu-section-title">Settings &amp; Preferences</p>
        <button className="menu-link menu-link-settings" type="button" onClick={() => navigateTo(VIEWS.OPTIONS)}>
          <span className="settings-icon" aria-hidden="true">&#9881;</span>
          <span className="menu-link-copy">
            <strong>Options &amp; Configuration</strong>
            <small>Units and app preferences</small>
          </span>
          <span className="menu-link-arrow" aria-hidden="true">&rarr;</span>
        </button>
      </div>
    </div>
  );
}

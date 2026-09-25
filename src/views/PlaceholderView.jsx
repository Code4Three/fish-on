import { useApp } from "../state/useApp";
import PropTypes from "prop-types";
import "./PlaceholderView.css";

// Shared template for views not yet built out; renders eyebrow/title/description copy for each stub view
export default function PlaceholderView({
  eyebrow,
  title,
  description,
  viewKey,
}) {
  const { activeLocation, navigateTo } = useApp();

  return (
    <main className="placeholder-view">
      <div className="placeholder-kicker">{eyebrow}</div>
      <h1>{title}</h1>
      <p className="placeholder-description">{description}</p>
      <div className="placeholder-panel">
        <span className="placeholder-orbit" aria-hidden="true" />
        <p className="placeholder-panel-label">{activeLocation.name}</p>
        <h2>This view is ready for the next feature slice.</h2>
        <p>
          The global menu and active location are connected. Detailed {viewKey}{" "}
          data will be added in a follow-up story.
        </p>
        <button type="button" onClick={() => navigateTo("weekly")}>
          Back to Weekly Forecast <span aria-hidden="true">&rarr;</span>
        </button>
      </div>
    </main>
  );
}

PlaceholderView.propTypes = {
  eyebrow: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  viewKey: PropTypes.string.isRequired,
};

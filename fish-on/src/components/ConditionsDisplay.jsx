// src/components/ConditionsDisplay.jsx
import { useEffect, useState } from "react";
import {
  formatLocalDate,
  formatLocalTime
} from "../utils/dateUtils.js";

export default function ConditionsDisplay() {
  const [extremes, setExtremes] = useState([]);

  useEffect(() => {
    async function loadData() {
      try {
        const response = await fetch("/tides.json");
        const data = await response.json();
        setExtremes(data.records || []);
      } catch (err) {
        console.error("Failed to load tide data:", err);
      }
    }

    loadData();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Conditions</h2>
      <p>Showing upcoming tide extremes from cache.</p>

      <div style={{ marginTop: "20px" }}>
        {extremes.length === 0 && <p>No data loaded.</p>}

        {extremes.map((e) => (
          <div
            key={e.date}
            style={{
              padding: "10px",
              marginBottom: "10px",
              border: "1px solid #ccc",
              borderRadius: "6px",
            }}
          >
            <strong>{e.type}</strong> — {e.height.toFixed(2)}m  
            <br />
            <span>
              {formatLocalDate(new Date(e.date))} {formatLocalTime(new Date(e.date))}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

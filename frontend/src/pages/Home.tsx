import React, { useEffect, useState } from "react";
import SlotGrid from "../components/SlotGrid";
import BookingModal from "../components/BookingModal";
import { fetchSlots } from "../api";
import "./Home.css";

type Slot = {
  number: number;
  status: "empty" | "booked" | "occupied";
};

export default function Home() {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selected, setSelected] = useState<Slot | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchSlots();
      setSlots(data.slots);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="home-container">
      <h1>Parking Slots</h1>
      <div className="legend-container">
        <div className="legend-item">
          <div className="legend-color legend-empty"></div>
          <span>Empty</span>
        </div>
        <div className="legend-item">
          <div className="legend-color legend-booked"></div>
          <span>Booked (empty)</span>
        </div>
        <div className="legend-item">
          <div className="legend-color legend-occupied"></div>
          <span>Occupied</span>
        </div>
        <button className="refresh-button" onClick={load}>
          Refresh
        </button>
      </div>
      {error && <div className="error-message">{error}</div>}
      {loading ? (
        <div className="loading-message">Loading...</div>
      ) : (
        <SlotGrid slots={slots} onSlotClick={(s) => setSelected(s)} />
      )}
      {selected && (
        <BookingModal
          slotNumber={selected.number}
          onClose={() => setSelected(null)}
          onBooked={load}
        />
      )}
    </div>
  );
}

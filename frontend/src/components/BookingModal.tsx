import React, { useState } from "react";
import "./BookingModal.css";

type Props = {
  slotNumber: number;
  onClose: () => void;
  onBooked: () => void;
};

const BookingModal: React.FC<Props> = ({ slotNumber, onClose, onBooked }) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError(null);
    if (!name || !phone || !vehicleNumber) {
      setError("All fields are required");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slotNumber, name, phone, vehicleNumber }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to book");
      onBooked();
      onClose();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Book Slot #{slotNumber}</h3>
        <div className="form-container">
          <input
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            placeholder="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <input
            placeholder="Vehicle Number"
            value={vehicleNumber}
            onChange={(e) => setVehicleNumber(e.target.value)}
          />
          {error && <div className="error-message">{error}</div>}
          <div className="button-container">
            <button onClick={onClose}>Cancel</button>
            <button onClick={submit} disabled={loading}>
              {loading ? "Booking..." : "Confirm Booking"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;

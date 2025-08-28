import React from "react";
import "./SlotGrid.css";

type Slot = {
  number: number;
  status: "empty" | "booked" | "occupied";
};

export default function SlotGrid({
  slots,
  onSlotClick,
}: {
  slots: Slot[];
  onSlotClick: (slot: Slot) => void;
}) {
  const getSlotClassName = (status: Slot["status"]) => {
    const baseClass = "slot-item";
    switch (status) {
      case "empty":
        return `${baseClass} slot-empty`;
      case "booked":
        return `${baseClass} slot-booked`;
      case "occupied":
        return `${baseClass} slot-occupied`;
      default:
        return baseClass;
    }
  };

  return (
    <div className="slot-grid">
      {slots.map((s) => (
        <div
          key={s.number}
          onClick={() => s.status === "empty" && onSlotClick(s)}
          className={getSlotClassName(s.status)}
        >
          {s.number}
        </div>
      ))}
    </div>
  );
}

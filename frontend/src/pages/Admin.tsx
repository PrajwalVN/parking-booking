import React, { useEffect, useState } from "react";
import {
  adminLogin,
  fetchSlots,
  generateInvoice,
  getLogs,
  markOccupied,
  resetSlot,
} from "../api";
import "./Admin.css";

type Slot = {
  number: number;
  status: "empty" | "booked" | "occupied";
};

type LogItem = {
  slotNumber: number;
  name: string;
  phone: string;
  vehicleNumber: string;
  startTime: string;
  endTime?: string | null;
  amount?: number | null;
  status: "active" | "completed";
};

export default function Admin() {
  const [token, setToken] = useState<string | null>(null);
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("password123");
  const [slots, setSlots] = useState<Slot[]>([]);
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [msg, setMsg] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const load = async () => {
    try {
      const data = await fetchSlots();
      setSlots(data.slots);
      if (token) {
        const l = await getLogs(token);
        setLogs(l.logs);
      }
    } catch (error) {
      setMsg("Failed to load data");
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setMsg("Refreshing data...");
    try {
      await load();
      setMsg("Data refreshed successfully!");
      // Clear the success message after 3 seconds
      setTimeout(() => setMsg(null), 3000);
    } catch (error) {
      setMsg("Failed to refresh data");
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (token) load();
  }, [token]);

  const doLogin = async () => {
    const res = await adminLogin(username, password);
    if (res.token) setToken(res.token);
    else setMsg(res.error || "Login failed");
  };

  const doOccupied = async (slotNumber: number) => {
    if (!token) return;
    const res = await markOccupied(token, slotNumber);
    setMsg(res.message || res.error);
    await load();
  };

  const doInvoice = async (slotNumber: number) => {
    if (!token) return;
    const res = await generateInvoice(token, slotNumber);
    if (res.invoice) {
      const inv = res.invoice;
      alert(
        `Invoice for Slot #${inv.slotNumber}\nName: ${inv.name}\nVehicle: ${inv.vehicleNumber}\nStart: ${inv.startTime}\nEnd: ${inv.endTime}\nHours: ${inv.billedHours}\nRate/hr: Rs ${inv.ratePerHour}\nTotal: Rs ${inv.amount}`
      );
    } else {
      setMsg(res.error || "Failed");
    }
    await load();
  };

  const doReset = async (slotNumber: number) => {
    if (!token) return;
    const res = await resetSlot(token, slotNumber);
    setMsg(res.message || res.error);
    await load();
  };

  if (!token) {
    return (
      <div className="login-supercontainer">
        <div className="login-container">
          <h1>Admin Login</h1>
          <input
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className="login-button" onClick={doLogin}>
            Login
          </button>
          {msg && <div className="error-message">{msg}</div>}
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>Admin Panel</h1>
        <button
          className="refresh-button"
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          {isRefreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {msg && <div className="message">{msg}</div>}

      <section className="admin-section">
        <h3>Slots</h3>
        <div className="slots-grid">
          {slots.map((s) => (
            <div key={s.number} className="slot-card">
              <div>Slot #{s.number}</div>
              <div>Status: {s.status}</div>
              <div className="slot-actions">
                <button
                  onClick={() => doOccupied(s.number)}
                  disabled={s.status !== "booked"}
                >
                  Mark Occupied
                </button>
                <button
                  onClick={() => doInvoice(s.number)}
                  disabled={s.status === "empty"}
                >
                  Generate Invoice
                </button>
                <button onClick={() => doReset(s.number)}>Reset</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="admin-section">
        <h3>Logs</h3>
        <div className="logs-container">
          <table className="logs-table">
            <thead>
              <tr>
                <th>Slot</th>
                <th>Name</th>
                <th>Phone</th>
                <th>Vehicle</th>
                <th>Start</th>
                <th>End</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((l, idx) => (
                <tr key={idx}>
                  <td>{l.slotNumber}</td>
                  <td>{l.name}</td>
                  <td>{l.phone}</td>
                  <td>{l.vehicleNumber}</td>
                  <td>{l.startTime}</td>
                  <td>{l.endTime || "-"}</td>
                  <td>{l.amount != null ? `Rs ${l.amount}` : "-"}</td>
                  <td>{l.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

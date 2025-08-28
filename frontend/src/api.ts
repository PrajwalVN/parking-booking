const API_BASE = 'https://parking-booking.onrender.com/api';

export async function fetchSlots() {
  const res = await fetch(`${API_BASE}/slots`);
  if (!res.ok) throw new Error('Failed to fetch slots');
  return res.json();
}

export async function bookSlot(payload: {slotNumber: number, name: string, phone: string, vehicleNumber: string}) {
  const res = await fetch(`${API_BASE}/book`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(payload)
  });
  return res.json();
}

export async function adminLogin(username: string, password: string) {
  const res = await fetch(`${API_BASE}/admin/login`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({username, password})
  });
  return res.json();
}

export async function getLogs(token: string) {
  const res = await fetch(`${API_BASE}/admin/logs`, { headers: { 'X-Admin-Token': token } });
  return res.json();
}

export async function markOccupied(token: string, slotNumber: number) {
  const res = await fetch(`${API_BASE}/admin/mark-occupied`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json', 'X-Admin-Token': token},
    body: JSON.stringify({slotNumber})
  });
  return res.json();
}

export async function generateInvoice(token: string, slotNumber: number) {
  const res = await fetch(`${API_BASE}/admin/generate-invoice`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json', 'X-Admin-Token': token},
    body: JSON.stringify({slotNumber})
  });
  return res.json();
}

export async function resetSlot(token: string, slotNumber: number) {
  const res = await fetch(`${API_BASE}/admin/reset-slot`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json', 'X-Admin-Token': token},
    body: JSON.stringify({slotNumber})
  });
  return res.json();
}

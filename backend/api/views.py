import json
from math import ceil
from datetime import datetime, timezone
from django.http import JsonResponse, HttpResponseBadRequest
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings

from .db import get_db, now_iso
from .auth import require_admin

def parse_json(request):
    try:
        return json.loads(request.body.decode() or "{}")
    except Exception:
        return {}

def get_slots(request):
    db = get_db()
    slots = list(db.slots.find({}, {"_id": 0}))
    return JsonResponse({"slots": slots})

@csrf_exempt
def book_slot(request):
    if request.method != "POST":
        return HttpResponseBadRequest("POST required")
    data = parse_json(request)
    slot_no = data.get("slotNumber")
    name = data.get("name", "").strip()
    phone = data.get("phone", "").strip()
    vehicle = data.get("vehicleNumber", "").strip()
    if not (slot_no and name and phone and vehicle):
        return JsonResponse({"error": "Missing fields"}, status=400)
    db = get_db()
    slot = db.slots.find_one({"number": int(slot_no)})
    if not slot:
        return JsonResponse({"error": "Invalid slot"}, status=404)
    if slot.get("status") in ["booked", "occupied"]:
        return JsonResponse({"error": "Slot not available"}, status=409)
    start_time = now_iso()
    booking_doc = {
        "slotNumber": int(slot_no),
        "name": name,
        "phone": phone,
        "vehicleNumber": vehicle,
        "startTime": start_time,
        "status": "booked",
    }
    res = db.bookings.insert_one(booking_doc)
    db.slots.update_one({"number": int(slot_no)}, {"$set": {"status": "booked", "currentBookingId": str(res.inserted_id)}})
    # Log booking event
    db.logs.insert_one({
        "slotNumber": int(slot_no),
        "name": name,
        "phone": phone,
        "vehicleNumber": vehicle,
        "startTime": start_time,
        "endTime": None,
        "amount": None,
        "status": "active",
    })
    
    from bson import ObjectId

    def convert_objectid(doc):
        if isinstance(doc, dict):
            return {k: str(v) if isinstance(v, ObjectId) else v for k, v in doc.items()}
        return doc
    
    # Inside your book_slot view
    booking_doc = convert_objectid(booking_doc)
    return JsonResponse({"message": "Booked", "booking": booking_doc})


@csrf_exempt
def admin_login(request):
    if request.method != "POST":
        return HttpResponseBadRequest("POST required")
    data = parse_json(request)
    if data.get("username") == settings.ADMIN_USERNAME and data.get("password") == settings.ADMIN_PASSWORD:
        return JsonResponse({"token": settings.ADMIN_TOKEN})
    return JsonResponse({"error": "Invalid credentials"}, status=401)

def iso_to_dt(iso_str):
    return datetime.fromisoformat(iso_str)

@require_admin
def get_logs(request):
    db = get_db()
    logs = list(db.logs.find({}, {"_id": 0}).sort("startTime", -1))
    return JsonResponse({"logs": logs})

@csrf_exempt
@require_admin
def mark_occupied(request):
    if request.method != "POST":
        return HttpResponseBadRequest("POST required")
    data = parse_json(request)
    slot_no = data.get("slotNumber")
    if not slot_no:
        return JsonResponse({"error": "slotNumber required"}, status=400)
    db = get_db()
    slot = db.slots.find_one({"number": int(slot_no)})
    if not slot:
        return JsonResponse({"error": "Invalid slot"}, status=404)
    if slot.get("status") != "booked":
        return JsonResponse({"error": "Slot is not booked"}, status=409)
    db.slots.update_one({"number": int(slot_no)}, {"$set": {"status": "occupied"}})
    db.bookings.update_one({"slotNumber": int(slot_no)}, {"$set": {"status": "occupied"}})
    return JsonResponse({"message": "Marked occupied"})

@csrf_exempt
@require_admin
def generate_invoice(request):
    if request.method != "POST":
        return HttpResponseBadRequest("POST required")
    data = parse_json(request)
    slot_no = data.get("slotNumber")
    if not slot_no:
        return JsonResponse({"error": "slotNumber required"}, status=400)
    rate_per_hour = 10  # Rs
    db = get_db()
    booking = db.bookings.find_one({"slotNumber": int(slot_no)})
    if not booking:
        return JsonResponse({"error": "No active booking"}, status=404)
    start_dt = iso_to_dt(booking["startTime"])
    end_dt = datetime.now().astimezone()
    elapsed_hours = (end_dt - start_dt).total_seconds() / 3600.0
    billed_hours = max(1, ceil(elapsed_hours))  # charge each started hour, minimum 1 hour
    amount = billed_hours * rate_per_hour

    # Update logs and clear slot/booking
    db.logs.update_one(
        {"slotNumber": int(slot_no), "startTime": booking["startTime"], "status": "active"},
        {"$set": {"endTime": end_dt.isoformat(), "amount": amount, "status": "completed"}}
    )
    db.bookings.delete_one({"slotNumber": int(slot_no)})
    db.slots.update_one({"number": int(slot_no)}, {"$set": {"status": "empty", "currentBookingId": None}})

    invoice = {
        "slotNumber": int(slot_no),
        "name": booking["name"],
        "phone": booking["phone"],
        "vehicleNumber": booking["vehicleNumber"],
        "startTime": booking["startTime"],
        "endTime": end_dt.isoformat(),
        "billedHours": billed_hours,
        "ratePerHour": rate_per_hour,
        "amount": amount
    }
    return JsonResponse({"invoice": invoice})

@csrf_exempt
@require_admin
def reset_slot(request):
    if request.method != "POST":
        return HttpResponseBadRequest("POST required")
    data = parse_json(request)
    slot_no = data.get("slotNumber")
    if not slot_no:
        return JsonResponse({"error": "slotNumber required"}, status=400)
    db = get_db()
    db.bookings.delete_one({"slotNumber": int(slot_no)})
    db.slots.update_one({"number": int(slot_no)}, {"$set": {"status": "empty", "currentBookingId": None}})
    return JsonResponse({"message": "Slot reset"})

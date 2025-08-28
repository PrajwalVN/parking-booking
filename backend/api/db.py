from django.conf import settings
from pymongo import MongoClient
from datetime import datetime

_client = None
_db = None

def get_db():
    global _client, _db
    if _db is None:
        _client = MongoClient(settings.MONGO_URI)
        _db = _client[settings.MONGO_DB]
        # Ensure base collections and indexes
        _db.slots.create_index("number", unique=True)
        _db.bookings.create_index("slotNumber", unique=True, sparse=True)
        _db.logs.create_index([("startTime", 1)])
        # Initialize slots if empty
        if _db.slots.count_documents({}) == 0:
            slots = [{"number": i+1, "status": "empty", "currentBookingId": None} for i in range(settings.SLOT_COUNT)]
            _db.slots.insert_many(slots)
    return _db

def now_iso():
    return datetime.now().astimezone().isoformat()

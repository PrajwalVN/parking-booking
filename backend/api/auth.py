from django.conf import settings
from django.http import JsonResponse

def require_admin(view_func):
    def wrapper(request, *args, **kwargs):
        token = request.headers.get("X-Admin-Token") or request.headers.get("Authorization", "").replace("Bearer ", "")
        if token != settings.ADMIN_TOKEN:
            return JsonResponse({"error": "Unauthorized"}, status=401)
        return view_func(request, *args, **kwargs)
    return wrapper

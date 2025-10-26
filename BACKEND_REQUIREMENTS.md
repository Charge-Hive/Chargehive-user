# Backend API Requirements for User App

## Missing Endpoint Issue

The ChargeHive User App is currently running in **DEMO MODE** because the backend is missing a critical endpoint.

### ❌ Missing Endpoint

**GET /api/services**

**Purpose**: Retrieve all available parking and charging services to display on the map

**Required Response Format**:
```json
{
  "success": true,
  "data": [
    {
      "serviceId": "uuid-here",
      "serviceType": "parking",  // or "charger"
      "address": "123 Main Street",
      "city": "San Francisco",
      "state": "CA",
      "postalCode": "94102",
      "country": "USA",
      "latitude": "37.7749",
      "longitude": "-122.4194",
      "hourlyRate": "15",
      "status": "available",  // or "occupied", "maintenance"
      "description": "Covered parking with EV charging",
      "providerId": "provider-uuid"
    }
  ]
}
```

### Current Workaround

The app currently uses **demo/fallback data** when:
1. The `/api/services` endpoint returns no data
2. The `/api/services` endpoint doesn't exist (404)
3. The backend is unreachable

**Demo data includes**:
- 2 Parking locations (red P markers)
- 2 Charging locations (teal C markers)
- All centered around San Francisco

### What Works Now

✅ User can see the app interface
✅ Map loads with demo markers
✅ User can tap markers to see details
✅ **Booking will FAIL** because demo service IDs don't exist in backend
✅ Authentication works (signup/login)
✅ All other features work

### What Needs Backend Implementation

#### 1. GET All Services Endpoint ⚠️ CRITICAL

**Endpoint**: `GET /api/services`
**Authentication**: Optional (can be public or require user login)
**Description**: Return all available parking and charging services

**Implementation Notes**:
- Query the `services` table (or equivalent)
- Filter by `status = 'available'` (optional)
- Include provider information if needed
- **Must include latitude and longitude** for map display

**Example Implementation (NestJS)**:
```typescript
@Get('services')
async getAllServices() {
  const services = await this.servicesRepository.find({
    where: { status: 'available' },
    select: [
      'serviceId',
      'serviceType',
      'address',
      'city',
      'state',
      'postalCode',
      'country',
      'latitude',
      'longitude',
      'hourlyRate',
      'status',
      'description',
      'providerId'
    ]
  });

  return {
    success: true,
    data: services
  };
}
```

#### 2. Alternative: Get Services by Location (Enhancement)

**Endpoint**: `GET /api/services/nearby?lat=37.7749&lng=-122.4194&radius=10`
**Description**: Return services within a radius (in km) of given coordinates

This would be more efficient for large datasets.

### How to Test Once Endpoint is Added

1. **Add the endpoint** to your backend following the format above
2. **Restart backend server**
3. **In the mobile app**, tap the "Refresh" button on the map
4. **You should see**:
   - Markers for all services in your database
   - No "Demo Mode" alert
   - Real data from backend

### Verifying the Endpoint

Test the endpoint directly:
```bash
# Without auth
curl https://chargehive-backend-dev-c567e0fd7ba7.herokuapp.com/api/services

# With auth (if required)
curl -H "Authorization: Bearer YOUR_TOKEN" \
     https://chargehive-backend-dev-c567e0fd7ba7.herokuapp.com/api/services
```

Expected response should match the format above.

### Backend Database Setup

Make sure your backend has some test services in the database:

```sql
-- Example: Insert test services
INSERT INTO services (service_type, address, city, state, country, latitude, longitude, hourly_rate, status, provider_id)
VALUES
  ('parking', '123 Market St', 'San Francisco', 'CA', 'USA', '37.7749', '-122.4194', '15', 'available', 'provider-uuid'),
  ('charger', '456 Mission St', 'San Francisco', 'CA', 'USA', '37.7849', '-122.4094', '20', 'available', 'provider-uuid');
```

### Current App Behavior

**With Demo Data** (current):
- Shows 4 demo locations in San Francisco
- User can view details
- Booking will fail (invalid service IDs)

**With Real Backend Data** (after endpoint is added):
- Shows all services from database
- User can book real sessions
- Full functionality works

### Priority

🔴 **HIGH PRIORITY** - This endpoint is critical for the app to function properly

Without it:
- App works in demo mode only
- Users cannot book real services
- Map shows fake data

### Files to Update (Backend)

1. **Controller**: Add GET endpoint in services controller
2. **Service**: Add method to fetch all services
3. **Documentation**: Update API_DOCUMENTATION.md
4. **Tests**: Add tests for the new endpoint

---

## Summary

The ChargeHive User App is **fully functional** but requires one backend endpoint to be added:

✅ **GET /api/services** - Returns all parking/charging services

Once this endpoint is implemented, remove the demo data fallback by commenting out the `getDemoServices()` calls in `MapScreen.js` and the app will use real data from your backend.

For now, the app works in demo mode for UI/UX testing and development.

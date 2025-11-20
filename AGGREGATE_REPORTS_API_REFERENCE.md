# 🔌 Aggregate Reports - API Reference

## Overview

Complete API reference for the new aggregate reporting endpoints.

---

## Base URL

```
http://localhost:5000/api
```

All endpoints require:
- **Authorization Header**: `Bearer {JWT_TOKEN}`
- **Method**: GET
- **Content-Type**: application/json

---

## 1️⃣ Weekly Aggregate Report

### Endpoint
```
GET /attendance/admin/report/weekly
```

### Description
Retrieves aggregate attendance statistics for all employees for a specific week.

### Authorization
- **Required**: Yes
- **Role**: admin
- **Method**: GET

### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `weekStart` | string | No | Current week | ISO date of week start (YYYY-MM-DD) |

### Example Request

#### Without parameters (current week)
```bash
curl -X GET "http://localhost:5000/api/attendance/admin/report/weekly" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json"
```

#### With specific week
```bash
curl -X GET "http://localhost:5000/api/attendance/admin/report/weekly?weekStart=2024-11-18" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json"
```

### Response (200 OK)

```json
{
  "weekStart": "2024-11-18T00:00:00.000Z",
  "weekEnd": "2024-11-24T23:59:59.999Z",
  "employees": [
    {
      "employeeId": "507f1f77bcf86cd799439011",
      "employeeName": "Alice Johnson",
      "email": "alice@company.com",
      "totalDays": 5,
      "present": 4,
      "late": 1,
      "absent": 0,
      "wfh": 0,
      "halfDay": 0,
      "onLeave": 0,
      "attendanceRate": "80.00",
      "projects": [
        "E-Commerce Platform"
      ]
    },
    {
      "employeeId": "507f1f77bcf86cd799439012",
      "employeeName": "Bob Williams",
      "email": "bob@company.com",
      "totalDays": 5,
      "present": 5,
      "late": 0,
      "absent": 0,
      "wfh": 0,
      "halfDay": 0,
      "onLeave": 0,
      "attendanceRate": "100.00",
      "projects": [
        "Mobile App",
        "E-Commerce Platform"
      ]
    }
  ]
}
```

### Error Responses

#### 403 Forbidden (Non-admin user)
```json
{
  "error": "Admin access required"
}
```

#### 401 Unauthorized (Invalid/missing token)
```json
{
  "error": "Unauthorized"
}
```

---

## 2️⃣ Monthly Aggregate Report

### Endpoint
```
GET /attendance/admin/report/monthly
```

### Description
Retrieves aggregate attendance statistics for all employees for a specific month.

### Authorization
- **Required**: Yes
- **Role**: admin
- **Method**: GET

### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `month` | number | No | Current | Month (0-11, where 0=January) |
| `year` | number | No | Current | Full year (e.g., 2024) |

### Example Request

#### Current month (default)
```bash
curl -X GET "http://localhost:5000/api/attendance/admin/report/monthly" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json"
```

#### Specific month
```bash
curl -X GET "http://localhost:5000/api/attendance/admin/report/monthly?month=9&year=2024" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json"
```

### Response (200 OK)

```json
{
  "month": 11,
  "year": 2024,
  "monthStart": "2024-11-01T00:00:00.000Z",
  "monthEnd": "2024-11-30T23:59:59.999Z",
  "employees": [
    {
      "employeeId": "507f1f77bcf86cd799439011",
      "employeeName": "Alice Johnson",
      "email": "alice@company.com",
      "totalDays": 20,
      "present": 18,
      "late": 2,
      "absent": 0,
      "wfh": 0,
      "halfDay": 0,
      "onLeave": 0,
      "attendanceRate": "90.00",
      "projects": [
        "E-Commerce Platform",
        "Mobile App"
      ]
    },
    {
      "employeeId": "507f1f77bcf86cd799439012",
      "employeeName": "Bob Williams",
      "email": "bob@company.com",
      "totalDays": 20,
      "present": 20,
      "late": 0,
      "absent": 0,
      "wfh": 0,
      "halfDay": 0,
      "onLeave": 0,
      "attendanceRate": "100.00",
      "projects": [
        "Mobile App",
        "CRM Integration"
      ]
    }
  ]
}
```

### Error Responses

#### 403 Forbidden (Non-admin user)
```json
{
  "error": "Admin access required"
}
```

#### 401 Unauthorized
```json
{
  "error": "Unauthorized"
}
```

---

## 3️⃣ Individual Employee Weekly Report

### Endpoint
```
GET /attendance/admin/report/employee/weekly/:employeeId
```

### Description
Retrieves detailed weekly attendance report for a specific employee with day-by-day records.

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `employeeId` | string | Yes | MongoDB ObjectId of employee |
| `weekStart` | string | No | ISO date of week start (YYYY-MM-DD) |

### Example Request

```bash
curl -X GET "http://localhost:5000/api/attendance/admin/report/employee/weekly/507f1f77bcf86cd799439011?weekStart=2024-11-18" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json"
```

### Response (200 OK)

```json
{
  "employee": {
    "name": "Alice Johnson",
    "email": "alice@company.com"
  },
  "weekStart": "2024-11-18T00:00:00.000Z",
  "weekEnd": "2024-11-24T23:59:59.999Z",
  "stats": {
    "totalDays": 5,
    "present": 4,
    "late": 1,
    "absent": 0,
    "wfh": 0,
    "halfDay": 0,
    "onLeave": 0,
    "attendanceRate": "80.00"
  },
  "details": [
    {
      "_id": "507f191e810c19729de860ea",
      "employeeId": {
        "_id": "507f1f77bcf86cd799439011",
        "firstName": "Alice",
        "lastName": "Johnson",
        "email": "alice@company.com"
      },
      "date": "2024-11-18T00:00:00.000Z",
      "status": "Present",
      "selectedProjectId": {
        "_id": "507f191e810c19729de860eb",
        "title": "E-Commerce Platform"
      },
      "checkInTime": "2024-11-18T09:00:00.000Z",
      "notes": null
    },
    {
      "_id": "507f191e810c19729de860ec",
      "employeeId": {
        "_id": "507f1f77bcf86cd799439011",
        "firstName": "Alice",
        "lastName": "Johnson",
        "email": "alice@company.com"
      },
      "date": "2024-11-19T00:00:00.000Z",
      "status": "Late",
      "selectedProjectId": {
        "_id": "507f191e810c19729de860eb",
        "title": "E-Commerce Platform"
      },
      "checkInTime": "2024-11-19T10:15:00.000Z",
      "notes": "Traffic delay"
    }
  ]
}
```

### Error Responses

#### 403 Forbidden
```json
{
  "error": "Admin access required"
}
```

#### 404 Not Found
```json
{
  "error": "Employee not found"
}
```

---

## 4️⃣ Individual Employee Monthly Report

### Endpoint
```
GET /attendance/admin/report/employee/monthly/:employeeId
```

### Description
Retrieves detailed monthly attendance report for a specific employee with all records for the month.

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `employeeId` | string | Yes | MongoDB ObjectId of employee |
| `month` | number | No | Month (0-11) |
| `year` | number | No | Full year (e.g., 2024) |

### Example Request

```bash
curl -X GET "http://localhost:5000/api/attendance/admin/report/employee/monthly/507f1f77bcf86cd799439011?month=10&year=2024" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json"
```

### Response (200 OK)

```json
{
  "employee": {
    "name": "Alice Johnson",
    "email": "alice@company.com"
  },
  "month": 11,
  "year": 2024,
  "monthStart": "2024-11-01T00:00:00.000Z",
  "monthEnd": "2024-11-30T23:59:59.999Z",
  "stats": {
    "totalDays": 20,
    "present": 18,
    "late": 2,
    "absent": 0,
    "wfh": 0,
    "halfDay": 0,
    "onLeave": 0,
    "attendanceRate": "90.00"
  },
  "details": [
    {
      "_id": "507f191e810c19729de860ea",
      "date": "2024-11-01T00:00:00.000Z",
      "status": "Present",
      "selectedProjectId": {
        "title": "E-Commerce Platform"
      }
    },
    {
      "_id": "507f191e810c19729de860eb",
      "date": "2024-11-02T00:00:00.000Z",
      "status": "Present",
      "selectedProjectId": {
        "title": "E-Commerce Platform"
      }
    }
  ]
}
```

### Error Responses

#### 403 Forbidden
```json
{
  "error": "Admin access required"
}
```

#### 404 Not Found
```json
{
  "error": "Employee not found"
}
```

---

## 📊 Response Data Fields

### Employee Statistics Object

| Field | Type | Description |
|-------|------|-------------|
| `employeeId` | string | MongoDB ObjectId |
| `employeeName` | string | Full name (First + Last) |
| `email` | string | Email address |
| `totalDays` | number | Days with attendance records |
| `present` | number | Count of "Present" status |
| `late` | number | Count of "Late" status |
| `absent` | number | Count of "Absent" status |
| `wfh` | number | Count of "WFH" status |
| `halfDay` | number | Count of "Half-day" status |
| `onLeave` | number | Count of "On Leave" status |
| `attendanceRate` | string | Percentage as string (e.g., "85.50") |
| `projects` | array | Unique project names |

### Attendance Record Object

| Field | Type | Description |
|-------|------|-------------|
| `_id` | string | MongoDB ObjectId |
| `employeeId` | object | Employee details |
| `date` | string | ISO date (YYYY-MM-DD) |
| `status` | string | Present/Late/Absent/WFH/Half-day/On Leave |
| `selectedProjectId` | object | Project details |
| `checkInTime` | string | ISO timestamp |
| `notes` | string | Optional notes |

---

## ⏰ Date/Time Formats

### Input Format
```
Date: YYYY-MM-DD (ISO 8601)
Examples:
- 2024-11-18 (November 18, 2024)
- 2024-01-01 (January 1, 2024)
- 2024-12-31 (December 31, 2024)
```

### Output Format
```
Timestamps: ISO 8601 with timezone
Examples:
- 2024-11-18T00:00:00.000Z
- 2024-11-18T09:30:00.000Z
- 2024-11-18T23:59:59.999Z
```

### Month Parameter
```
Value: 0-11
- 0 = January
- 1 = February
- ...
- 11 = December
```

---

## 🔐 Authentication

### Getting Token
```bash
POST /auth/login
{
  "email": "admin@example.com",
  "password": "Admin@123"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { ... }
}
```

### Using Token
```bash
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Token Validation
- Must be valid JWT
- User must have `role: 'admin'`
- Token must not be expired

---

## 🧪 Testing Examples

### Test Weekly Report (Current Week)
```bash
curl -X GET "http://localhost:5000/api/attendance/admin/report/weekly" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -s | jq '.employees[0]'
```

### Test Monthly Report (November 2024)
```bash
curl -X GET "http://localhost:5000/api/attendance/admin/report/monthly?month=10&year=2024" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -s | jq '.employees | length'
```

### Test Employee Weekly (Specific Employee)
```bash
curl -X GET "http://localhost:5000/api/attendance/admin/report/employee/weekly/507f1f77bcf86cd799439011" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -s | jq '.stats'
```

### Test Employee Monthly (Specific Employee)
```bash
curl -X GET "http://localhost:5000/api/attendance/admin/report/employee/monthly/507f1f77bcf86cd799439011" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -s | jq '.details | length'
```

---

## 📋 Status Codes

| Code | Meaning | Typical Response |
|------|---------|------------------|
| 200 | OK | Returns report data |
| 400 | Bad Request | Invalid parameters |
| 401 | Unauthorized | Missing/invalid token |
| 403 | Forbidden | Non-admin user |
| 404 | Not Found | Employee not found |
| 500 | Server Error | Internal error |

---

## 🚨 Common Errors

### Error: "Admin access required"
```json
{
  "error": "Admin access required"
}
```
**Cause**: User doesn't have admin role
**Solution**: Login with admin account

### Error: "Unauthorized"
```json
{
  "error": "Unauthorized"
}
```
**Cause**: Missing or invalid token
**Solution**: Include valid JWT in Authorization header

### Error: "Failed to fetch weekly report"
```json
{
  "error": "Failed to fetch weekly report"
}
```
**Cause**: Server error or database issue
**Solution**: Check backend logs, verify MongoDB connection

---

## 📝 Implementation Notes

- All timestamps are in UTC (Z suffix)
- Attendance rate excludes absences and leaves
- Working days: 5 per week, 20 per month (approximate)
- Projects are aggregated from all attendance records
- All endpoints are read-only (GET requests)
- Pagination not implemented (all records returned)

---

## 🔗 Related Endpoints

These endpoints work alongside the reporting endpoints:

```
POST   /attendance/mark                    - Mark attendance
GET    /attendance/today                   - Get today's status
GET    /attendance/history                 - Get history
GET    /attendance/admin/date/:date        - Daily register
PUT    /attendance/:id/status              - Update status
```

---

## ✅ Checklist for Integration

- [ ] Add Authorization header with valid token
- [ ] Use correct date format (YYYY-MM-DD)
- [ ] Handle pagination if needed
- [ ] Cache responses for performance
- [ ] Display loading state while fetching
- [ ] Handle error responses gracefully
- [ ] Convert ISO dates to local timezone
- [ ] Parse attendance rate as number
- [ ] Handle empty employee arrays

---

**Version**: 1.0  
**Last Updated**: November 2024  
**Status**: Production Ready  

For more information, see `AGGREGATE_REPORTS_IMPLEMENTATION.md`

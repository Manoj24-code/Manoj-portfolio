#!/usr/bin/env python3
"""
Backend API Tests for Embedded Systems Portfolio
Tests all backend endpoints with proper validation
"""

import requests
import json
import sys
from typing import Optional

# Load backend URL from frontend/.env
BACKEND_URL = "https://embedded-master-1.preview.emergentagent.com"
API_BASE = f"{BACKEND_URL}/api"
ADMIN_PASSWORD = "embedded-admin-2026"

# Test results tracking
test_results = []
admin_token: Optional[str] = None
test_message_id: Optional[str] = None


def log_test(name: str, passed: bool, details: str = ""):
    """Log test result"""
    status = "✅ PASS" if passed else "❌ FAIL"
    test_results.append({"name": name, "passed": passed, "details": details})
    print(f"{status}: {name}")
    if details:
        print(f"   Details: {details}")


def test_1_get_content():
    """Test 1: GET /api/content - should return seeded content with profile.name = 'Manoj'"""
    print("\n=== Test 1: GET /api/content ===")
    try:
        response = requests.get(f"{API_BASE}/content", timeout=10)
        
        if response.status_code != 200:
            log_test("GET /api/content returns 200", False, f"Got status {response.status_code}")
            return
        
        log_test("GET /api/content returns 200", True)
        
        data = response.json()
        
        # Check required keys
        required_keys = ["profile", "about", "skills", "projects", "experience", "education", "certifications"]
        missing_keys = [k for k in required_keys if k not in data]
        
        if missing_keys:
            log_test("Content has all required keys", False, f"Missing: {missing_keys}")
        else:
            log_test("Content has all required keys", True)
        
        # Check profile.name
        if "profile" in data and isinstance(data["profile"], dict):
            name = data["profile"].get("name")
            if name == "Manoj":
                log_test("profile.name is 'Manoj'", True)
            else:
                log_test("profile.name is 'Manoj'", False, f"Got '{name}'")
        else:
            log_test("profile.name is 'Manoj'", False, "profile is missing or not a dict")
        
        # Check arrays are non-empty
        for key in ["skills", "projects", "experience", "education", "certifications"]:
            if key in data and isinstance(data[key], list) and len(data[key]) > 0:
                log_test(f"{key} is non-empty array", True)
            else:
                log_test(f"{key} is non-empty array", False, f"Got {type(data.get(key))} with length {len(data.get(key, []))}")
        
    except Exception as e:
        log_test("GET /api/content", False, f"Exception: {str(e)}")


def test_2_post_messages():
    """Test 2: POST /api/messages - validate contact form submission"""
    global test_message_id
    print("\n=== Test 2: POST /api/messages ===")
    
    # Test 2a: Valid message
    try:
        valid_payload = {
            "name": "John Smith",
            "email": "john.smith@example.com",
            "message": "I'm interested in your embedded systems work. Let's connect!"
        }
        response = requests.post(f"{API_BASE}/messages", json=valid_payload, timeout=10)
        
        if response.status_code != 200:
            log_test("POST /api/messages with valid data returns 200", False, f"Got status {response.status_code}: {response.text}")
        else:
            data = response.json()
            if data.get("ok") == True and "id" in data:
                test_message_id = data["id"]
                log_test("POST /api/messages with valid data returns 200", True, f"Message ID: {test_message_id}")
            else:
                log_test("POST /api/messages with valid data returns 200", False, f"Response: {data}")
    except Exception as e:
        log_test("POST /api/messages with valid data", False, f"Exception: {str(e)}")
    
    # Test 2b: Invalid email
    try:
        invalid_email_payload = {
            "name": "Test User",
            "email": "not-an-email",
            "message": "Test message"
        }
        response = requests.post(f"{API_BASE}/messages", json=invalid_email_payload, timeout=10)
        
        if response.status_code == 422:
            log_test("POST /api/messages with invalid email returns 422", True)
        else:
            log_test("POST /api/messages with invalid email returns 422", False, f"Got status {response.status_code}")
    except Exception as e:
        log_test("POST /api/messages with invalid email", False, f"Exception: {str(e)}")
    
    # Test 2c: Empty name
    try:
        empty_name_payload = {
            "name": "",
            "email": "test@example.com",
            "message": "Test message"
        }
        response = requests.post(f"{API_BASE}/messages", json=empty_name_payload, timeout=10)
        
        if response.status_code == 422:
            log_test("POST /api/messages with empty name returns 422", True)
        else:
            log_test("POST /api/messages with empty name returns 422", False, f"Got status {response.status_code}")
    except Exception as e:
        log_test("POST /api/messages with empty name", False, f"Exception: {str(e)}")


def test_3_admin_login():
    """Test 3: POST /api/admin/login - JWT authentication"""
    global admin_token
    print("\n=== Test 3: POST /api/admin/login ===")
    
    # Test 3a: Wrong password
    try:
        wrong_password_payload = {"password": "wrong-password-123"}
        response = requests.post(f"{API_BASE}/admin/login", json=wrong_password_payload, timeout=10)
        
        if response.status_code == 401:
            log_test("POST /api/admin/login with wrong password returns 401", True)
        else:
            log_test("POST /api/admin/login with wrong password returns 401", False, f"Got status {response.status_code}")
    except Exception as e:
        log_test("POST /api/admin/login with wrong password", False, f"Exception: {str(e)}")
    
    # Test 3b: Correct password
    try:
        correct_password_payload = {"password": ADMIN_PASSWORD}
        response = requests.post(f"{API_BASE}/admin/login", json=correct_password_payload, timeout=10)
        
        if response.status_code != 200:
            log_test("POST /api/admin/login with correct password returns 200", False, f"Got status {response.status_code}: {response.text}")
        else:
            data = response.json()
            if "token" in data and "expiresAt" in data:
                admin_token = data["token"]
                log_test("POST /api/admin/login with correct password returns 200", True, f"Token received")
            else:
                log_test("POST /api/admin/login with correct password returns 200", False, f"Missing token or expiresAt in response: {data}")
    except Exception as e:
        log_test("POST /api/admin/login with correct password", False, f"Exception: {str(e)}")


def test_4_admin_auth_middleware():
    """Test 4: Admin auth middleware - Bearer token validation"""
    print("\n=== Test 4: Admin Auth Middleware ===")
    
    # Test 4a: GET /api/admin/me without token
    try:
        response = requests.get(f"{API_BASE}/admin/me", timeout=10)
        
        if response.status_code == 401:
            log_test("GET /api/admin/me without token returns 401", True)
        else:
            log_test("GET /api/admin/me without token returns 401", False, f"Got status {response.status_code}")
    except Exception as e:
        log_test("GET /api/admin/me without token", False, f"Exception: {str(e)}")
    
    # Test 4b: GET /api/admin/me with bad token
    try:
        headers = {"Authorization": "Bearer invalid-token-xyz"}
        response = requests.get(f"{API_BASE}/admin/me", headers=headers, timeout=10)
        
        if response.status_code == 401:
            log_test("GET /api/admin/me with bad token returns 401", True)
        else:
            log_test("GET /api/admin/me with bad token returns 401", False, f"Got status {response.status_code}")
    except Exception as e:
        log_test("GET /api/admin/me with bad token", False, f"Exception: {str(e)}")
    
    # Test 4c: GET /api/admin/me with valid token
    if not admin_token:
        log_test("GET /api/admin/me with valid token", False, "No admin token available from login test")
    else:
        try:
            headers = {"Authorization": f"Bearer {admin_token}"}
            response = requests.get(f"{API_BASE}/admin/me", headers=headers, timeout=10)
            
            if response.status_code != 200:
                log_test("GET /api/admin/me with valid token returns 200", False, f"Got status {response.status_code}: {response.text}")
            else:
                data = response.json()
                if data.get("ok") == True and data.get("sub") == "admin":
                    log_test("GET /api/admin/me with valid token returns 200", True)
                else:
                    log_test("GET /api/admin/me with valid token returns 200", False, f"Response: {data}")
        except Exception as e:
            log_test("GET /api/admin/me with valid token", False, f"Exception: {str(e)}")


def test_5_admin_update_content():
    """Test 5: PUT /api/admin/content - partial content updates"""
    print("\n=== Test 5: PUT /api/admin/content ===")
    
    if not admin_token:
        log_test("PUT /api/admin/content", False, "No admin token available")
        return
    
    headers = {"Authorization": f"Bearer {admin_token}"}
    
    # Test 5a: Without token
    try:
        update_payload = {
            "profile": {
                "name": "Manoj Test",
                "role": "M.Sc. Embedded Systems",
                "tagline": "Test tagline",
                "location": "Test City",
                "email": "test@example.com",
                "github": "https://github.com/test",
                "linkedin": "https://linkedin.com/in/test",
                "resumeUrl": "#",
                "availability": "OPEN_TO_WORK",
                "clockSpeed": "168MHz"
            }
        }
        response = requests.put(f"{API_BASE}/admin/content", json=update_payload, timeout=10)
        
        if response.status_code == 401:
            log_test("PUT /api/admin/content without token returns 401", True)
        else:
            log_test("PUT /api/admin/content without token returns 401", False, f"Got status {response.status_code}")
    except Exception as e:
        log_test("PUT /api/admin/content without token", False, f"Exception: {str(e)}")
    
    # Test 5b: With token - update profile.name to "Manoj Test"
    try:
        update_payload = {
            "profile": {
                "name": "Manoj Test",
                "role": "M.Sc. Embedded Systems",
                "tagline": "Designing firmware where silicon meets logic",
                "location": "[CITY, COUNTRY]",
                "email": "your.email@domain.com",
                "github": "https://github.com/yourhandle",
                "linkedin": "https://linkedin.com/in/yourhandle",
                "resumeUrl": "#",
                "availability": "OPEN_TO_WORK",
                "clockSpeed": "168MHz"
            }
        }
        response = requests.put(f"{API_BASE}/admin/content", json=update_payload, headers=headers, timeout=10)
        
        if response.status_code != 200:
            log_test("PUT /api/admin/content with token returns 200", False, f"Got status {response.status_code}: {response.text}")
        else:
            log_test("PUT /api/admin/content with token returns 200", True)
            
            # Verify the update by fetching content
            get_response = requests.get(f"{API_BASE}/content", timeout=10)
            if get_response.status_code == 200:
                data = get_response.json()
                if data.get("profile", {}).get("name") == "Manoj Test":
                    log_test("GET /api/content reflects updated profile.name", True)
                else:
                    log_test("GET /api/content reflects updated profile.name", False, f"Got name: {data.get('profile', {}).get('name')}")
            else:
                log_test("GET /api/content reflects updated profile.name", False, f"GET failed with status {get_response.status_code}")
    except Exception as e:
        log_test("PUT /api/admin/content with token", False, f"Exception: {str(e)}")
    
    # Test 5c: Revert profile.name back to "Manoj"
    try:
        revert_payload = {
            "profile": {
                "name": "Manoj",
                "role": "M.Sc. Embedded Systems",
                "tagline": "Designing firmware where silicon meets logic",
                "location": "[CITY, COUNTRY]",
                "email": "your.email@domain.com",
                "github": "https://github.com/yourhandle",
                "linkedin": "https://linkedin.com/in/yourhandle",
                "resumeUrl": "#",
                "availability": "OPEN_TO_WORK",
                "clockSpeed": "168MHz"
            }
        }
        response = requests.put(f"{API_BASE}/admin/content", json=revert_payload, headers=headers, timeout=10)
        
        if response.status_code == 200:
            # Verify revert
            get_response = requests.get(f"{API_BASE}/content", timeout=10)
            if get_response.status_code == 200:
                data = get_response.json()
                if data.get("profile", {}).get("name") == "Manoj":
                    log_test("Reverted profile.name back to 'Manoj'", True)
                else:
                    log_test("Reverted profile.name back to 'Manoj'", False, f"Got name: {data.get('profile', {}).get('name')}")
            else:
                log_test("Reverted profile.name back to 'Manoj'", False, "GET failed after revert")
        else:
            log_test("Reverted profile.name back to 'Manoj'", False, f"Revert PUT failed with status {response.status_code}")
    except Exception as e:
        log_test("Reverted profile.name back to 'Manoj'", False, f"Exception: {str(e)}")


def test_6_admin_list_messages():
    """Test 6: GET /api/admin/messages - list contact messages"""
    print("\n=== Test 6: GET /api/admin/messages ===")
    
    if not admin_token:
        log_test("GET /api/admin/messages", False, "No admin token available")
        return
    
    headers = {"Authorization": f"Bearer {admin_token}"}
    
    try:
        response = requests.get(f"{API_BASE}/admin/messages", headers=headers, timeout=10)
        
        if response.status_code != 200:
            log_test("GET /api/admin/messages with token returns 200", False, f"Got status {response.status_code}: {response.text}")
        else:
            data = response.json()
            if not isinstance(data, list):
                log_test("GET /api/admin/messages returns array", False, f"Got {type(data)}")
            else:
                log_test("GET /api/admin/messages returns array", True, f"Found {len(data)} messages")
                
                # Check if our test message is in the list
                if test_message_id:
                    found = any(msg.get("id") == test_message_id for msg in data)
                    if found:
                        log_test("Test message appears in admin messages list", True)
                        # Verify message fields
                        test_msg = next((msg for msg in data if msg.get("id") == test_message_id), None)
                        if test_msg:
                            required_fields = ["id", "name", "email", "message", "createdAt"]
                            missing = [f for f in required_fields if f not in test_msg]
                            if not missing:
                                log_test("Test message has all required fields", True)
                            else:
                                log_test("Test message has all required fields", False, f"Missing: {missing}")
                    else:
                        log_test("Test message appears in admin messages list", False, f"Message ID {test_message_id} not found")
    except Exception as e:
        log_test("GET /api/admin/messages", False, f"Exception: {str(e)}")


def test_7_admin_delete_message():
    """Test 7: DELETE /api/admin/messages/{id} - delete contact message"""
    print("\n=== Test 7: DELETE /api/admin/messages/{id} ===")
    
    if not admin_token:
        log_test("DELETE /api/admin/messages/{id}", False, "No admin token available")
        return
    
    headers = {"Authorization": f"Bearer {admin_token}"}
    
    # Test 7a: Delete test message
    if test_message_id:
        try:
            response = requests.delete(f"{API_BASE}/admin/messages/{test_message_id}", headers=headers, timeout=10)
            
            if response.status_code != 200:
                log_test("DELETE /api/admin/messages/{id} with valid id returns 200", False, f"Got status {response.status_code}: {response.text}")
            else:
                data = response.json()
                if data.get("ok") == True:
                    log_test("DELETE /api/admin/messages/{id} with valid id returns 200", True)
                    
                    # Verify deletion
                    get_response = requests.get(f"{API_BASE}/admin/messages", headers=headers, timeout=10)
                    if get_response.status_code == 200:
                        messages = get_response.json()
                        found = any(msg.get("id") == test_message_id for msg in messages)
                        if not found:
                            log_test("Deleted message no longer appears in list", True)
                        else:
                            log_test("Deleted message no longer appears in list", False, "Message still found")
                    else:
                        log_test("Deleted message no longer appears in list", False, "GET failed after delete")
                else:
                    log_test("DELETE /api/admin/messages/{id} with valid id returns 200", False, f"Response: {data}")
        except Exception as e:
            log_test("DELETE /api/admin/messages/{id} with valid id", False, f"Exception: {str(e)}")
    else:
        log_test("DELETE /api/admin/messages/{id} with valid id", False, "No test message ID available")
    
    # Test 7b: Delete non-existent message
    try:
        fake_id = "00000000-0000-0000-0000-000000000000"
        response = requests.delete(f"{API_BASE}/admin/messages/{fake_id}", headers=headers, timeout=10)
        
        if response.status_code == 404:
            log_test("DELETE /api/admin/messages/{id} with non-existent id returns 404", True)
        else:
            log_test("DELETE /api/admin/messages/{id} with non-existent id returns 404", False, f"Got status {response.status_code}")
    except Exception as e:
        log_test("DELETE /api/admin/messages/{id} with non-existent id", False, f"Exception: {str(e)}")


def print_summary():
    """Print test summary"""
    print("\n" + "="*80)
    print("TEST SUMMARY")
    print("="*80)
    
    passed = sum(1 for t in test_results if t["passed"])
    failed = sum(1 for t in test_results if not t["passed"])
    total = len(test_results)
    
    print(f"\nTotal Tests: {total}")
    print(f"Passed: {passed} ✅")
    print(f"Failed: {failed} ❌")
    print(f"Success Rate: {(passed/total*100):.1f}%\n")
    
    if failed > 0:
        print("Failed Tests:")
        for t in test_results:
            if not t["passed"]:
                print(f"  ❌ {t['name']}")
                if t["details"]:
                    print(f"     {t['details']}")
    
    print("="*80)
    
    return failed == 0


if __name__ == "__main__":
    print("="*80)
    print("EMBEDDED SYSTEMS PORTFOLIO - BACKEND API TESTS")
    print("="*80)
    print(f"Backend URL: {BACKEND_URL}")
    print(f"API Base: {API_BASE}")
    print("="*80)
    
    # Run all tests in sequence
    test_1_get_content()
    test_2_post_messages()
    test_3_admin_login()
    test_4_admin_auth_middleware()
    test_5_admin_update_content()
    test_6_admin_list_messages()
    test_7_admin_delete_message()
    
    # Print summary
    all_passed = print_summary()
    
    # Exit with appropriate code
    sys.exit(0 if all_passed else 1)

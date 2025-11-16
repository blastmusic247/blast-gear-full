#!/usr/bin/env python3
"""
Specific test for admin order deletion functionality
Testing the exact issue reported by the user
"""

import requests
import json
import sys
from datetime import datetime

# Get backend URL from environment
BACKEND_URL = "https://fashionblast-app.preview.emergentagent.com/api"

# Color codes for output
GREEN = '\033[92m'
RED = '\033[91m'
YELLOW = '\033[93m'
BLUE = '\033[94m'
RESET = '\033[0m'

def print_test_header(test_name):
    """Print formatted test header"""
    print(f"\n{BLUE}{'='*80}{RESET}")
    print(f"{BLUE}TEST: {test_name}{RESET}")
    print(f"{BLUE}{'='*80}{RESET}")

def print_success(message):
    """Print success message"""
    print(f"{GREEN}✓ {message}{RESET}")

def print_error(message):
    """Print error message"""
    print(f"{RED}✗ {message}{RESET}")

def print_warning(message):
    """Print warning message"""
    print(f"{YELLOW}⚠ {message}{RESET}")

def print_info(message):
    """Print info message"""
    print(f"{BLUE}ℹ {message}{RESET}")

def test_admin_order_deletion_flow():
    """Test the complete admin order deletion flow as reported by user"""
    print_test_header("ADMIN ORDER DELETION - Complete Flow Test")
    
    # Step 1: Login to admin
    print_info("STEP 1: Admin Login")
    login_data = {
        "username": "admin",
        "password": "admin123",
        "recaptchaToken": "development-bypass"
    }
    
    try:
        login_response = requests.post(f"{BACKEND_URL}/admin/login", json=login_data, timeout=10)
        print_info(f"Login Status Code: {login_response.status_code}")
        
        if login_response.status_code != 200:
            print_error(f"Admin login failed: {login_response.text}")
            return False
        
        login_result = login_response.json()
        admin_token = login_result.get('access_token')
        
        if not admin_token:
            print_error("No access token received from login")
            return False
        
        print_success(f"Admin login successful, token received")
        
        headers = {
            "Authorization": f"Bearer {admin_token}",
            "Content-Type": "application/json"
        }
        
        # Step 2: Get current orders list
        print_info("\nSTEP 2: Get Current Orders List")
        orders_response = requests.get(f"{BACKEND_URL}/admin/orders", headers=headers, timeout=10)
        print_info(f"Get Orders Status Code: {orders_response.status_code}")
        
        if orders_response.status_code != 200:
            print_error(f"Failed to get orders: {orders_response.text}")
            return False
        
        orders_list = orders_response.json()
        initial_order_count = len(orders_list)
        print_success(f"Retrieved {initial_order_count} orders")
        
        # If no orders exist, create one first
        if initial_order_count == 0:
            print_info("No orders found, creating a test order first...")
            
            # Create a test order
            order_data = {
                "customer": {
                    "firstName": "Test",
                    "lastName": "Customer",
                    "email": "test.deletion@example.com",
                    "phone": "+1-555-0199",
                    "address": "456 Test Street",
                    "city": "Test City",
                    "state": "CA",
                    "zipCode": "90210",
                    "country": "USA"
                },
                "items": [
                    {
                        "productId": "1",
                        "name": "Classic Vintage Tee",
                        "price": 34.99,
                        "size": "M",
                        "quantity": 1,
                        "image": "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80"
                    }
                ],
                "subtotal": 34.99,
                "shipping": 10.00,
                "tax": 3.50,
                "total": 48.49
            }
            
            create_response = requests.post(f"{BACKEND_URL}/orders", json=order_data, timeout=10)
            
            if create_response.status_code != 200:
                print_error(f"Failed to create test order: {create_response.text}")
                return False
            
            created_order = create_response.json()
            print_success(f"Test order created: {created_order.get('orderId')}")
            
            # Get updated orders list
            orders_response = requests.get(f"{BACKEND_URL}/admin/orders", headers=headers, timeout=10)
            orders_list = orders_response.json()
            initial_order_count = len(orders_list)
        
        # Get the first order ID
        first_order = orders_list[0]
        first_order_id = first_order.get('orderId')
        print_success(f"First order ID: {first_order_id}")
        print_info(f"Order details: Customer: {first_order.get('customer', {}).get('firstName', 'Unknown')} {first_order.get('customer', {}).get('lastName', '')}")
        
        # Step 3: Delete the first order
        print_info(f"\nSTEP 3: Delete Order {first_order_id}")
        delete_response = requests.delete(f"{BACKEND_URL}/admin/orders/{first_order_id}", headers=headers, timeout=10)
        print_info(f"Delete Status Code: {delete_response.status_code}")
        
        if delete_response.status_code != 200:
            print_error(f"Delete request failed: {delete_response.text}")
            return False
        
        delete_result = delete_response.json()
        print_info(f"Delete Response: {json.dumps(delete_result, indent=2)}")
        
        if not delete_result.get('success'):
            print_error(f"Delete operation returned success=False")
            return False
        
        print_success("Delete request returned success=True")
        
        # Step 4: Verify deletion - Get updated orders list
        print_info(f"\nSTEP 4: Verify Deletion - Check Orders List")
        verify_orders_response = requests.get(f"{BACKEND_URL}/admin/orders", headers=headers, timeout=10)
        
        if verify_orders_response.status_code != 200:
            print_error(f"Failed to get orders for verification: {verify_orders_response.text}")
            return False
        
        updated_orders_list = verify_orders_response.json()
        final_order_count = len(updated_orders_list)
        
        print_info(f"Initial order count: {initial_order_count}")
        print_info(f"Final order count: {final_order_count}")
        
        if final_order_count == initial_order_count - 1:
            print_success("Order count reduced by 1 - deletion successful")
        else:
            print_error(f"Order count not reduced correctly. Expected {initial_order_count - 1}, got {final_order_count}")
            return False
        
        # Check if deleted order ID still appears in list
        remaining_order_ids = [order.get('orderId') for order in updated_orders_list]
        if first_order_id in remaining_order_ids:
            print_error(f"Deleted order ID {first_order_id} still appears in orders list")
            return False
        else:
            print_success(f"Deleted order ID {first_order_id} no longer appears in orders list")
        
        # Step 5: Try to get the deleted order directly
        print_info(f"\nSTEP 5: Try to Get Deleted Order {first_order_id}")
        get_deleted_response = requests.get(f"{BACKEND_URL}/admin/orders/{first_order_id}", headers=headers, timeout=10)
        print_info(f"Get Deleted Order Status Code: {get_deleted_response.status_code}")
        
        if get_deleted_response.status_code == 404:
            print_success("Deleted order returns 404 Not Found - correct behavior")
        else:
            print_error(f"Deleted order should return 404, but got {get_deleted_response.status_code}")
            print_error(f"Response: {get_deleted_response.text}")
            return False
        
        print_success("🎉 ALL TESTS PASSED - Admin order deletion is working correctly!")
        return True
        
    except Exception as e:
        print_error(f"Exception occurred: {str(e)}")
        return False

def main():
    """Main test execution"""
    print(f"\n{BLUE}{'='*80}{RESET}")
    print(f"{BLUE}ADMIN ORDER DELETION TEST{RESET}")
    print(f"{BLUE}Testing user-reported issue: Delete button not working{RESET}")
    print(f"{BLUE}Backend URL: {BACKEND_URL}{RESET}")
    print(f"{BLUE}{'='*80}{RESET}")
    
    success = test_admin_order_deletion_flow()
    
    print(f"\n{BLUE}{'='*80}{RESET}")
    print(f"{BLUE}TEST RESULT{RESET}")
    print(f"{BLUE}{'='*80}{RESET}")
    
    if success:
        print_success("✅ ADMIN ORDER DELETION IS WORKING CORRECTLY")
        print_info("The backend DELETE /api/admin/orders/{orderId} endpoint is functioning properly")
        print_info("If the user is still experiencing issues, the problem may be in the frontend")
        return 0
    else:
        print_error("❌ ADMIN ORDER DELETION HAS ISSUES")
        print_info("The backend endpoint is not working as expected")
        return 1

if __name__ == "__main__":
    sys.exit(main())
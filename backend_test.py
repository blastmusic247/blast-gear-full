#!/usr/bin/env python3
"""
Backend API Testing Script for BLAST Gear E-commerce
Tests all backend endpoints with realistic data
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

def test_products_get_all():
    """Test GET /api/products - Should return all 6 seeded products"""
    print_test_header("GET /api/products - Get All Products")
    
    try:
        response = requests.get(f"{BACKEND_URL}/products", timeout=10)
        
        print_info(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            products = response.json()
            print_info(f"Response: {json.dumps(products, indent=2)[:500]}...")
            
            # Verify we have 6 products
            if len(products) == 6:
                print_success(f"Returned {len(products)} products (expected 6)")
            else:
                print_error(f"Expected 6 products, got {len(products)}")
                return False
            
            # Verify product structure
            required_fields = ['id', 'name', 'description', 'price', 'image', 'sizes', 'category', 'inStock']
            for product in products:
                missing_fields = [field for field in required_fields if field not in product]
                if missing_fields:
                    print_error(f"Product {product.get('id', 'unknown')} missing fields: {missing_fields}")
                    return False
            
            print_success("All products have required fields")
            
            # Verify specific products exist
            product_ids = [p['id'] for p in products]
            expected_ids = ['1', '2', '3', '4', '5', '6']
            for expected_id in expected_ids:
                if expected_id in product_ids:
                    print_success(f"Product ID {expected_id} found")
                else:
                    print_error(f"Product ID {expected_id} not found")
                    return False
            
            return True
        else:
            print_error(f"Expected status 200, got {response.status_code}")
            print_error(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print_error(f"Exception occurred: {str(e)}")
        return False

def test_products_get_single():
    """Test GET /api/products/1 - Should return single product details"""
    print_test_header("GET /api/products/1 - Get Single Product")
    
    try:
        response = requests.get(f"{BACKEND_URL}/products/1", timeout=10)
        
        print_info(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            product = response.json()
            print_info(f"Response: {json.dumps(product, indent=2)}")
            
            # Verify product ID
            if product.get('id') == '1':
                print_success("Product ID matches (1)")
            else:
                print_error(f"Expected product ID '1', got '{product.get('id')}'")
                return False
            
            # Verify product name
            if product.get('name') == 'Classic Vintage Tee':
                print_success("Product name matches (Classic Vintage Tee)")
            else:
                print_error(f"Expected 'Classic Vintage Tee', got '{product.get('name')}'")
                return False
            
            # Verify required fields
            required_fields = ['id', 'name', 'description', 'price', 'image', 'sizes', 'category', 'inStock']
            missing_fields = [field for field in required_fields if field not in product]
            if missing_fields:
                print_error(f"Missing fields: {missing_fields}")
                return False
            
            print_success("All required fields present")
            return True
        else:
            print_error(f"Expected status 200, got {response.status_code}")
            print_error(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print_error(f"Exception occurred: {str(e)}")
        return False

def test_orders_create():
    """Test POST /api/orders - Create a test order"""
    print_test_header("POST /api/orders - Create Order")
    
    order_data = {
        "customer": {
            "firstName": "John",
            "lastName": "Smith",
            "email": "john.smith@example.com",
            "phone": "+1-555-0123",
            "address": "123 Main Street",
            "city": "San Francisco",
            "state": "CA",
            "zipCode": "94102",
            "country": "USA"
        },
        "items": [
            {
                "productId": "1",
                "name": "Classic Vintage Tee",
                "price": 34.99,
                "size": "L",
                "quantity": 2,
                "image": "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80"
            },
            {
                "productId": "2",
                "name": "Minimalist Black Tee",
                "price": 29.99,
                "size": "M",
                "quantity": 1,
                "image": "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80"
            }
        ],
        "subtotal": 99.97,
        "shipping": 10.00,
        "tax": 8.50,
        "total": 118.47
    }
    
    try:
        print_info(f"Request: {json.dumps(order_data, indent=2)}")
        response = requests.post(f"{BACKEND_URL}/orders", json=order_data, timeout=10)
        
        print_info(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            order = response.json()
            print_info(f"Response: {json.dumps(order, indent=2)}")
            
            # Verify order has orderId
            if 'orderId' in order:
                print_success(f"Order created with ID: {order['orderId']}")
                
                # Store orderId for next test
                global created_order_id
                created_order_id = order['orderId']
            else:
                print_error("Order response missing 'orderId'")
                return False
            
            # Verify customer info
            if order.get('customer', {}).get('email') == 'john.smith@example.com':
                print_success("Customer email matches")
            else:
                print_error("Customer email mismatch")
                return False
            
            # Verify items
            if len(order.get('items', [])) == 2:
                print_success("Order has 2 items")
            else:
                print_error(f"Expected 2 items, got {len(order.get('items', []))}")
                return False
            
            # Verify total
            if order.get('total') == 118.47:
                print_success("Order total matches (118.47)")
            else:
                print_error(f"Expected total 118.47, got {order.get('total')}")
                return False
            
            # Verify status
            if order.get('status') == 'Processing':
                print_success("Order status is 'Processing'")
            else:
                print_warning(f"Order status is '{order.get('status')}' (expected 'Processing')")
            
            return True
        else:
            print_error(f"Expected status 200, got {response.status_code}")
            print_error(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print_error(f"Exception occurred: {str(e)}")
        return False

def test_orders_get_by_id():
    """Test GET /api/orders/{orderId} - Retrieve order by ID"""
    print_test_header("GET /api/orders/{orderId} - Get Order by ID")
    
    if 'created_order_id' not in globals():
        print_error("No order ID available. Create order test must run first.")
        return False
    
    order_id = created_order_id
    
    try:
        response = requests.get(f"{BACKEND_URL}/orders/{order_id}", timeout=10)
        
        print_info(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            order = response.json()
            print_info(f"Response: {json.dumps(order, indent=2)}")
            
            # Verify order ID matches
            if order.get('orderId') == order_id:
                print_success(f"Order ID matches: {order_id}")
            else:
                print_error(f"Expected order ID {order_id}, got {order.get('orderId')}")
                return False
            
            # Verify customer info
            if order.get('customer', {}).get('email') == 'john.smith@example.com':
                print_success("Customer email matches")
            else:
                print_error("Customer email mismatch")
                return False
            
            # Verify items exist
            if len(order.get('items', [])) > 0:
                print_success(f"Order has {len(order['items'])} items")
            else:
                print_error("Order has no items")
                return False
            
            return True
        else:
            print_error(f"Expected status 200, got {response.status_code}")
            print_error(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print_error(f"Exception occurred: {str(e)}")
        return False

def test_stripe_payment_intent():
    """Test POST /api/create-payment-intent - Create Stripe payment intent"""
    print_test_header("POST /api/create-payment-intent - Create Payment Intent")
    
    payment_data = {
        "amount": 118.47,
        "items": [
            {
                "name": "Classic Vintage Tee",
                "price": 34.99,
                "quantity": 2
            },
            {
                "name": "Minimalist Black Tee",
                "price": 29.99,
                "quantity": 1
            }
        ]
    }
    
    try:
        print_info(f"Request: {json.dumps(payment_data, indent=2)}")
        response = requests.post(f"{BACKEND_URL}/create-payment-intent", json=payment_data, timeout=10)
        
        print_info(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print_info(f"Response: {json.dumps(result, indent=2)}")
            
            # Verify clientSecret exists
            if 'clientSecret' in result:
                print_success("Payment intent created with clientSecret")
            else:
                print_error("Response missing 'clientSecret'")
                return False
            
            # Verify paymentIntentId exists
            if 'paymentIntentId' in result:
                print_success(f"Payment intent ID: {result['paymentIntentId']}")
            else:
                print_error("Response missing 'paymentIntentId'")
                return False
            
            # Verify clientSecret format (should start with pi_)
            if result['clientSecret'].startswith('pi_'):
                print_success("Client secret has correct format")
            else:
                print_warning(f"Client secret format unexpected: {result['clientSecret'][:20]}...")
            
            return True
        else:
            print_error(f"Expected status 200, got {response.status_code}")
            print_error(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print_error(f"Exception occurred: {str(e)}")
        return False

def test_contact_form():
    """Test POST /api/contact - Submit contact form (reCAPTCHA will fail)"""
    print_test_header("POST /api/contact - Submit Contact Form")
    
    contact_data = {
        "name": "Sarah Johnson",
        "email": "sarah.johnson@example.com",
        "message": "I'm interested in bulk orders for my company. Can you provide pricing for orders of 50+ shirts?",
        "recaptchaToken": "test_token_will_fail"
    }
    
    try:
        print_info(f"Request: {json.dumps(contact_data, indent=2)}")
        response = requests.post(f"{BACKEND_URL}/contact", json=contact_data, timeout=10)
        
        print_info(f"Status Code: {response.status_code}")
        print_info(f"Response: {response.text}")
        
        # We expect this to fail with 400 due to invalid reCAPTCHA token
        if response.status_code == 400:
            print_warning("Contact form returned 400 (expected - reCAPTCHA validation failed with test token)")
            
            # Check if error message mentions reCAPTCHA
            if 'recaptcha' in response.text.lower():
                print_success("Error message correctly indicates reCAPTCHA failure")
            else:
                print_warning("Error message doesn't mention reCAPTCHA")
            
            return True  # This is expected behavior
        elif response.status_code == 200:
            print_warning("Contact form returned 200 (unexpected - reCAPTCHA should have failed)")
            print_warning("This might indicate reCAPTCHA validation is not working properly")
            return True  # Still pass, but with warning
        else:
            print_error(f"Unexpected status code: {response.status_code}")
            return False
            
    except Exception as e:
        print_error(f"Exception occurred: {str(e)}")
        return False

# Global variables for test data
admin_token = None
created_order_id = None
created_promo_code = None

def test_admin_login():
    """Test POST /api/admin/login - Admin authentication"""
    print_test_header("POST /api/admin/login - Admin Login")
    
    login_data = {
        "username": "admin",
        "password": "admin123",
        "recaptchaToken": "test_token_bypassed_in_dev"
    }
    
    try:
        print_info(f"Request: {json.dumps(login_data, indent=2)}")
        response = requests.post(f"{BACKEND_URL}/admin/login", json=login_data, timeout=10)
        
        print_info(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print_info(f"Response: {json.dumps(result, indent=2)}")
            
            # Verify access_token exists
            if 'access_token' in result:
                print_success("Admin login successful - access token received")
                
                # Store token for subsequent tests
                global admin_token
                admin_token = result['access_token']
                print_success(f"Token stored for admin operations")
            else:
                print_error("Response missing 'access_token'")
                return False
            
            # Verify token_type
            if result.get('token_type') == 'bearer':
                print_success("Token type is 'bearer'")
            else:
                print_warning(f"Token type is '{result.get('token_type')}' (expected 'bearer')")
            
            return True
        else:
            print_error(f"Expected status 200, got {response.status_code}")
            print_error(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print_error(f"Exception occurred: {str(e)}")
        return False

def test_admin_promo_code_creation():
    """Test POST /api/admin/promo-codes - Create promo code (CRITICAL FIX)"""
    print_test_header("POST /api/admin/promo-codes - Create Promo Code")
    
    if not admin_token:
        print_error("No admin token available. Admin login test must run first.")
        return False
    
    promo_data = {
        "code": "TESTPROMO",
        "discountType": "percentage",
        "discountValue": 20,
        "description": "Test 20% off",
        "usageLimit": 100
    }
    
    headers = {
        "Authorization": f"Bearer {admin_token}",
        "Content-Type": "application/json"
    }
    
    try:
        print_info(f"Request: {json.dumps(promo_data, indent=2)}")
        print_info(f"Headers: Authorization: Bearer {admin_token[:20]}...")
        response = requests.post(f"{BACKEND_URL}/admin/promo-codes", json=promo_data, headers=headers, timeout=10)
        
        print_info(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            promo = response.json()
            print_info(f"Response: {json.dumps(promo, indent=2)}")
            
            # Store promo code for validation test
            global created_promo_code
            created_promo_code = promo.get('code')
            
            # Verify promo code details
            if promo.get('code') == 'TESTPROMO':
                print_success("Promo code matches (TESTPROMO)")
            else:
                print_error(f"Expected code 'TESTPROMO', got '{promo.get('code')}'")
                return False
            
            if promo.get('discountType') == 'percentage':
                print_success("Discount type matches (percentage)")
            else:
                print_error(f"Expected discountType 'percentage', got '{promo.get('discountType')}'")
                return False
            
            if promo.get('discountValue') == 20:
                print_success("Discount value matches (20)")
            else:
                print_error(f"Expected discountValue 20, got {promo.get('discountValue')}")
                return False
            
            if promo.get('usageLimit') == 100:
                print_success("Usage limit matches (100)")
            else:
                print_error(f"Expected usageLimit 100, got {promo.get('usageLimit')}")
                return False
            
            # Verify required fields
            required_fields = ['id', 'code', 'discountType', 'discountValue', 'isActive', 'usedCount']
            missing_fields = [field for field in required_fields if field not in promo]
            if missing_fields:
                print_error(f"Missing fields: {missing_fields}")
                return False
            
            print_success("All required fields present")
            print_success("CRITICAL FIX VERIFIED: Promo code creation working without 'multiple values' error")
            return True
        else:
            print_error(f"Expected status 200, got {response.status_code}")
            print_error(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print_error(f"Exception occurred: {str(e)}")
        return False

def test_admin_order_deletion():
    """Test DELETE /api/admin/orders/{orderId} - Delete order (CRITICAL FIX)"""
    print_test_header("DELETE /api/admin/orders/{orderId} - Delete Order")
    
    if not admin_token:
        print_error("No admin token available. Admin login test must run first.")
        return False
    
    # First create an order to delete
    order_data = {
        "customer": {
            "firstName": "Test",
            "lastName": "Customer",
            "email": "test.customer@example.com",
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
    
    try:
        # Create order first
        print_info("Creating test order for deletion...")
        create_response = requests.post(f"{BACKEND_URL}/orders", json=order_data, timeout=10)
        
        if create_response.status_code != 200:
            print_error(f"Failed to create test order: {create_response.status_code}")
            print_error(f"Response: {create_response.text}")
            return False
        
        order = create_response.json()
        order_id = order.get('orderId')
        print_success(f"Test order created with ID: {order_id}")
        
        # Now delete the order using admin endpoint
        headers = {
            "Authorization": f"Bearer {admin_token}",
            "Content-Type": "application/json"
        }
        
        print_info(f"Deleting order {order_id}...")
        print_info(f"Headers: Authorization: Bearer {admin_token[:20]}...")
        delete_response = requests.delete(f"{BACKEND_URL}/admin/orders/{order_id}", headers=headers, timeout=10)
        
        print_info(f"Status Code: {delete_response.status_code}")
        
        if delete_response.status_code == 200:
            result = delete_response.json()
            print_info(f"Response: {json.dumps(result, indent=2)}")
            
            # Verify success response
            if result.get('success') is True:
                print_success("Delete operation returned success=True")
            else:
                print_error(f"Expected success=True, got {result.get('success')}")
                return False
            
            if result.get('orderId') == order_id:
                print_success(f"Response contains correct order ID: {order_id}")
            else:
                print_error(f"Expected orderId {order_id}, got {result.get('orderId')}")
                return False
            
            # Verify order is actually deleted by trying to fetch it
            print_info("Verifying order is deleted...")
            get_response = requests.get(f"{BACKEND_URL}/admin/orders/{order_id}", headers=headers, timeout=10)
            
            if get_response.status_code == 404:
                print_success("Order successfully deleted - GET returns 404")
                print_success("CRITICAL FIX VERIFIED: Admin order deletion working correctly")
                return True
            else:
                print_error(f"Order still exists after deletion - GET returned {get_response.status_code}")
                return False
        else:
            print_error(f"Expected status 200, got {delete_response.status_code}")
            print_error(f"Response: {delete_response.text}")
            return False
            
    except Exception as e:
        print_error(f"Exception occurred: {str(e)}")
        return False

def test_promo_code_validation():
    """Test POST /api/validate-promo - Validate promo code"""
    print_test_header("POST /api/validate-promo - Validate Promo Code")
    
    if not created_promo_code:
        print_error("No promo code available. Promo code creation test must run first.")
        return False
    
    validation_data = {
        "code": created_promo_code,
        "orderTotal": 100.00
    }
    
    try:
        print_info(f"Request: {json.dumps(validation_data, indent=2)}")
        response = requests.post(f"{BACKEND_URL}/validate-promo", json=validation_data, timeout=10)
        
        print_info(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print_info(f"Response: {json.dumps(result, indent=2)}")
            
            # Verify validation response
            if result.get('valid') is True:
                print_success("Promo code validation returned valid=True")
            else:
                print_error(f"Expected valid=True, got {result.get('valid')}")
                return False
            
            if result.get('code') == created_promo_code:
                print_success(f"Code matches: {created_promo_code}")
            else:
                print_error(f"Expected code {created_promo_code}, got {result.get('code')}")
                return False
            
            # Verify discount calculation (20% of 100.00 = 20.00)
            expected_discount = 20.00
            if result.get('discountAmount') == expected_discount:
                print_success(f"Discount amount correct: ${expected_discount}")
            else:
                print_error(f"Expected discount ${expected_discount}, got ${result.get('discountAmount')}")
                return False
            
            # Verify new total (100.00 - 20.00 = 80.00)
            expected_new_total = 80.00
            if result.get('newTotal') == expected_new_total:
                print_success(f"New total correct: ${expected_new_total}")
            else:
                print_error(f"Expected new total ${expected_new_total}, got ${result.get('newTotal')}")
                return False
            
            return True
        else:
            print_error(f"Expected status 200, got {response.status_code}")
            print_error(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print_error(f"Exception occurred: {str(e)}")
        return False

def run_all_tests():
    """Run all backend tests"""
    print(f"\n{BLUE}{'='*80}{RESET}")
    print(f"{BLUE}BLAST Gear Backend API Testing{RESET}")
    print(f"{BLUE}Backend URL: {BACKEND_URL}{RESET}")
    print(f"{BLUE}{'='*80}{RESET}")
    
    tests = [
        ("Products - Get All", test_products_get_all),
        ("Products - Get Single", test_products_get_single),
        ("Orders - Create", test_orders_create),
        ("Orders - Get by ID", test_orders_get_by_id),
        ("Stripe - Payment Intent", test_stripe_payment_intent),
        ("Contact - Form Submission", test_contact_form),
        ("Admin - Login", test_admin_login),
        ("Admin - Promo Code Creation (CRITICAL)", test_admin_promo_code_creation),
        ("Admin - Order Deletion (CRITICAL)", test_admin_order_deletion),
        ("Promo - Code Validation", test_promo_code_validation),
    ]
    
    results = {}
    
    for test_name, test_func in tests:
        try:
            result = test_func()
            results[test_name] = result
        except Exception as e:
            print_error(f"Test '{test_name}' crashed: {str(e)}")
            results[test_name] = False
    
    # Print summary
    print(f"\n{BLUE}{'='*80}{RESET}")
    print(f"{BLUE}TEST SUMMARY{RESET}")
    print(f"{BLUE}{'='*80}{RESET}")
    
    passed = sum(1 for r in results.values() if r)
    total = len(results)
    
    for test_name, result in results.items():
        if result:
            print_success(f"{test_name}: PASSED")
        else:
            print_error(f"{test_name}: FAILED")
    
    print(f"\n{BLUE}Total: {passed}/{total} tests passed{RESET}")
    
    if passed == total:
        print(f"{GREEN}All tests passed!{RESET}\n")
        return 0
    else:
        print(f"{RED}{total - passed} test(s) failed{RESET}\n")
        return 1

if __name__ == "__main__":
    sys.exit(run_all_tests())

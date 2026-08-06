import os
import sys
import unittest
import json
from fastapi.testclient import TestClient
from unittest.mock import patch

# Add backend to path
sys.path.append(os.path.dirname(__file__))

from backend.main import app
from backend.database import init_db, get_db_connection

class TestAPI(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # Override database to a test database
        from backend.config import settings
        cls.orig_db_path = settings.DB_PATH
        settings.DB_PATH = os.path.join(os.path.dirname(__file__), "test_database.db")
        init_db()
        cls.client = TestClient(app)

    @classmethod
    def tearDownClass(cls):
        from backend.config import settings
        # Remove test database
        if os.path.exists(settings.DB_PATH):
            os.remove(settings.DB_PATH)
        settings.DB_PATH = cls.orig_db_path

    def setUp(self):
        # Clean tables
        conn = get_db_connection()
        conn.execute("DELETE FROM users")
        conn.execute("DELETE FROM financial_records")
        conn.execute("DELETE FROM products")
        conn.execute("DELETE FROM chat_history")
        conn.commit()
        conn.close()

    def test_register_and_login(self):
        # Test Registration
        reg_payload = {
            "email": "test@sirket.com",
            "password": "testpassword123",
            "business_name": "Test Kahvecisi",
            "business_type": "restaurant"
        }
        res = self.client.post("/api/auth/register", json=reg_payload)
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()["status"], "success")

        # Test duplicate registration
        res = self.client.post("/api/auth/register", json=reg_payload)
        self.assertEqual(res.status_code, 400)

        # Test Login
        login_payload = {
            "email": "test@sirket.com",
            "password": "testpassword123"
        }
        res = self.client.post("/api/auth/login", json=login_payload)
        self.assertEqual(res.status_code, 200)
        self.assertIn("access_token", res.cookies)
        cookie = {"access_token": res.cookies.get("access_token")}

        # Test Profile Retrieval with cookie
        res = self.client.get("/api/profile", cookies=cookie)
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()["business_name"], "Test Kahvecisi")
        self.assertEqual(res.json()["business_type"], "restaurant")

        # Test Profile Update
        update_payload = {
            "business_name": "Yeni Test Kahvecisi",
            "business_type": "general"
        }
        res = self.client.post("/api/profile", json=update_payload, cookies=cookie)
        self.assertEqual(res.status_code, 200)
        
        res = self.client.get("/api/profile", cookies=cookie)
        self.assertEqual(res.json()["business_name"], "Yeni Test Kahvecisi")
        self.assertEqual(res.json()["business_type"], "general")

    @patch('backend.services.analytics.call_gemini')
    def test_financial_records_and_isolation(self, mock_call_gemini):
        # Mock response from Gemini
        mock_call_gemini.return_value = json.dumps({
            "summary": "Overall financial situation is stable.",
            "insights": [
                {
                    "title": "Healthy margins",
                    "description": "Maintain your current pricing strategy.",
                    "type": "success",
                    "impact": "+$5,000 estimated profit",
                    "difficulty": "Easy",
                    "timeframe": "This week",
                    "confidence": 95,
                    "basis": "Stable revenue"
                }
            ]
        })

        # Register User A
        self.client.post("/api/auth/register", json={
            "email": "usera@sirket.com",
            "password": "password",
            "business_name": "User A Corp",
            "business_type": "ecommerce"
        })
        # Register User B
        self.client.post("/api/auth/register", json={
            "email": "userb@sirket.com",
            "password": "password",
            "business_name": "User B Corp",
            "business_type": "restaurant"
        })

        # Login User A and User B
        res_a = self.client.post("/api/auth/login", json={"email": "usera@sirket.com", "password": "password"})
        cookie_a = {"access_token": res_a.cookies.get("access_token")}
        res_b = self.client.post("/api/auth/login", json={"email": "userb@sirket.com", "password": "password"})
        cookie_b = {"access_token": res_b.cookies.get("access_token")}

        # Populate records manually for User A
        rec_payload = {
            "date": "2026-06",
            "revenue": 10000.0,
            "expenses": 6000.0,
            "rent_expense": 1000.0,
            "personnel_expense": 2000.0,
            "marketing_expense": 500.0,
            "material_expense": 2000.0,
            "other_expense": 500.0
        }
        self.client.post("/api/data/record", json=rec_payload, cookies=cookie_a)
        
        # We also need to set a dummy API key so the endpoint tries to call call_gemini instead of raising ValueError
        from backend.config import settings
        orig_gemini_key = settings.GEMINI_API_KEY
        settings.GEMINI_API_KEY = "dummy_key_for_testing"
        
        try:
            res_a = self.client.post("/api/analyze", cookies=cookie_a)
            self.assertEqual(res_a.status_code, 200)
            self.assertIn("summary", res_a.json())
        finally:
            settings.GEMINI_API_KEY = orig_gemini_key

        # Verify User A has records now
        res_data_a = self.client.get("/api/data", cookies=cookie_a)
        self.assertTrue(len(res_data_a.json()["records"]) > 0)

        # Verify User B has NO records (isolation check)
        res_data_b = self.client.get("/api/data", cookies=cookie_b)
        self.assertEqual(len(res_data_b.json()["records"]), 0)

    def test_me_and_logout(self):
        # Register
        self.client.post("/api/auth/register", json={
            "email": "me@sirket.com",
            "password": "password",
            "business_name": "Me Corp",
            "business_type": "general"
        })
        
        # Login and check cookies
        res = self.client.post("/api/auth/login", json={"email": "me@sirket.com", "password": "password"})
        cookie = {"access_token": res.cookies.get("access_token")}

        # Test /api/auth/me
        res_me = self.client.get("/api/auth/me", cookies=cookie)
        self.assertEqual(res_me.status_code, 200)
        self.assertEqual(res_me.json()["email"], "me@sirket.com")

        # Test /api/auth/logout
        res_logout = self.client.post("/api/auth/logout", cookies=cookie)
        self.assertEqual(res_logout.status_code, 200)
        self.assertEqual(res_logout.cookies.get("access_token"), None)

if __name__ == "__main__":
    unittest.main()

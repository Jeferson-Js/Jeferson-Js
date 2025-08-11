import requests
import sys
from datetime import datetime
import json

class BrasilPoliglotasAPITester:
    def __init__(self, base_url="https://68bddf80-f832-4230-9579-dbcd99c804d6.preview.emergentagent.com"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.expected_languages = ["english", "spanish", "french", "german", "italian", "chinese"]

    def run_test(self, name, method, endpoint, expected_status, data=None, validate_func=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)

            success = response.status_code == expected_status
            
            if success:
                try:
                    response_data = response.json()
                    if validate_func:
                        validation_result = validate_func(response_data)
                        if validation_result:
                            self.tests_passed += 1
                            print(f"✅ Passed - Status: {response.status_code}, Validation: OK")
                        else:
                            print(f"❌ Failed - Status: {response.status_code}, Validation: FAILED")
                            success = False
                    else:
                        self.tests_passed += 1
                        print(f"✅ Passed - Status: {response.status_code}")
                    return success, response_data
                except json.JSONDecodeError:
                    print(f"❌ Failed - Invalid JSON response")
                    return False, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"   Error: {error_data}")
                except:
                    print(f"   Error: {response.text}")
                return False, {}

        except requests.exceptions.RequestException as e:
            print(f"❌ Failed - Network Error: {str(e)}")
            return False, {}
        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def validate_health_response(self, data):
        """Validate health check response"""
        return "status" in data and data["status"] == "healthy"

    def validate_languages_response(self, data):
        """Validate languages list response"""
        if "languages" not in data:
            print("   Missing 'languages' key")
            return False
        
        languages = data["languages"]
        found_languages = list(languages.keys())
        
        print(f"   Found languages: {found_languages}")
        
        # Check if all expected languages are present
        missing_languages = [lang for lang in self.expected_languages if lang not in found_languages]
        if missing_languages:
            print(f"   Missing languages: {missing_languages}")
            return False
        
        # Validate each language structure
        for lang_key, lang_data in languages.items():
            required_fields = ["name", "flag", "alphabet", "basic_words", "phrases"]
            for field in required_fields:
                if field not in lang_data:
                    print(f"   Language {lang_key} missing field: {field}")
                    return False
        
        return True

    def validate_single_language_response(self, data, expected_lang_key):
        """Validate single language response"""
        if "language" not in data:
            print("   Missing 'language' key")
            return False
        
        lang_data = data["language"]
        required_fields = ["name", "flag", "alphabet", "basic_words", "phrases"]
        
        for field in required_fields:
            if field not in lang_data:
                print(f"   Missing field: {field}")
                return False
        
        print(f"   Language name: {lang_data['name']}")
        print(f"   Alphabet length: {len(lang_data['alphabet'])}")
        print(f"   Basic words count: {len(lang_data['basic_words'])}")
        print(f"   Phrases count: {len(lang_data['phrases'])}")
        
        return True

    def validate_alphabet_response(self, data):
        """Validate alphabet response"""
        if "alphabet" not in data:
            print("   Missing 'alphabet' key")
            return False
        
        alphabet = data["alphabet"]
        if not isinstance(alphabet, list) or len(alphabet) == 0:
            print("   Alphabet should be a non-empty list")
            return False
        
        print(f"   Alphabet: {alphabet}")
        return True

    def validate_vocabulary_response(self, data):
        """Validate vocabulary response"""
        required_fields = ["basic_words", "phrases"]
        
        for field in required_fields:
            if field not in data:
                print(f"   Missing field: {field}")
                return False
            
            if not isinstance(data[field], list):
                print(f"   Field {field} should be a list")
                return False
        
        print(f"   Basic words: {data['basic_words']}")
        print(f"   Phrases: {data['phrases']}")
        return True

    def validate_exercises_response(self, data):
        """Validate exercises response"""
        if "exercises" not in data:
            print("   Missing 'exercises' key")
            return False
        
        exercises = data["exercises"]
        if not isinstance(exercises, list):
            print("   Exercises should be a list")
            return False
        
        print(f"   Found {len(exercises)} exercises")
        
        # Validate exercise structure if exercises exist
        for i, exercise in enumerate(exercises):
            required_fields = ["id", "language", "section", "level", "question", "options", "correct_answer", "explanation"]
            for field in required_fields:
                if field not in exercise:
                    print(f"   Exercise {i} missing field: {field}")
                    return False
            
            if not isinstance(exercise["options"], list) or len(exercise["options"]) == 0:
                print(f"   Exercise {i} options should be a non-empty list")
                return False
            
            if exercise["correct_answer"] not in exercise["options"]:
                print(f"   Exercise {i} correct_answer not in options")
                return False
        
        return True

    def test_health_endpoint(self):
        """Test health check endpoint"""
        return self.run_test(
            "Health Check",
            "GET",
            "api/health",
            200,
            validate_func=self.validate_health_response
        )

    def test_languages_endpoint(self):
        """Test languages list endpoint"""
        return self.run_test(
            "Languages List",
            "GET",
            "api/languages",
            200,
            validate_func=self.validate_languages_response
        )

    def test_single_language_endpoints(self):
        """Test individual language endpoints"""
        results = []
        
        for lang_key in self.expected_languages:
            # Test single language endpoint
            success, _ = self.run_test(
                f"Single Language - {lang_key}",
                "GET",
                f"api/languages/{lang_key}",
                200,
                validate_func=lambda data, lk=lang_key: self.validate_single_language_response(data, lk)
            )
            results.append(success)
            
            # Test alphabet endpoint
            success, _ = self.run_test(
                f"Alphabet - {lang_key}",
                "GET",
                f"api/languages/{lang_key}/alphabet",
                200,
                validate_func=self.validate_alphabet_response
            )
            results.append(success)
            
            # Test vocabulary endpoint
            success, _ = self.run_test(
                f"Vocabulary - {lang_key}",
                "GET",
                f"api/languages/{lang_key}/vocabulary",
                200,
                validate_func=self.validate_vocabulary_response
            )
            results.append(success)
            
            # Test exercises endpoint
            success, _ = self.run_test(
                f"Exercises - {lang_key}",
                "GET",
                f"api/languages/{lang_key}/exercises",
                200,
                validate_func=self.validate_exercises_response
            )
            results.append(success)
        
        return all(results)

    def test_invalid_language(self):
        """Test invalid language endpoint"""
        success, _ = self.run_test(
            "Invalid Language",
            "GET",
            "api/languages/invalid_language",
            404
        )
        return success

    def test_user_endpoints(self):
        """Test user-related endpoints"""
        # Test create user
        test_user = {
            "id": f"test_user_{datetime.now().strftime('%H%M%S')}",
            "name": "Test User",
            "email": "test@example.com",
            "created_at": datetime.now().isoformat(),
            "languages_learning": ["english", "spanish"]
        }
        
        success, _ = self.run_test(
            "Create User",
            "POST",
            "api/users",
            200,
            data=test_user
        )
        
        if success:
            # Test save progress
            progress_data = {
                "user_id": test_user["id"],
                "language": "english",
                "section": "vocabulary",
                "level": "basic",
                "score": 85,
                "completed": True,
                "timestamp": datetime.now().isoformat()
            }
            
            success, _ = self.run_test(
                "Save Progress",
                "POST",
                "api/user/progress",
                200,
                data=progress_data
            )
            
            if success:
                # Test get user progress
                success, _ = self.run_test(
                    "Get User Progress",
                    "GET",
                    f"api/user/{test_user['id']}/progress",
                    200
                )
        
        return success

def main():
    print("🚀 Starting Brasil Poliglotas API Testing...")
    print("=" * 60)
    
    tester = BrasilPoliglotasAPITester()
    
    # Run all tests
    print("\n📋 Testing Core Endpoints...")
    tester.test_health_endpoint()
    tester.test_languages_endpoint()
    
    print("\n📚 Testing Language-Specific Endpoints...")
    tester.test_single_language_endpoints()
    
    print("\n🚫 Testing Error Handling...")
    tester.test_invalid_language()
    
    print("\n👤 Testing User Endpoints...")
    tester.test_user_endpoints()
    
    # Print final results
    print("\n" + "=" * 60)
    print(f"📊 FINAL RESULTS:")
    print(f"   Tests Run: {tester.tests_run}")
    print(f"   Tests Passed: {tester.tests_passed}")
    print(f"   Success Rate: {(tester.tests_passed/tester.tests_run)*100:.1f}%")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All tests passed! Backend API is working correctly.")
        return 0
    else:
        failed_tests = tester.tests_run - tester.tests_passed
        print(f"⚠️  {failed_tests} test(s) failed. Please check the issues above.")
        return 1

if __name__ == "__main__":
    sys.exit(main())
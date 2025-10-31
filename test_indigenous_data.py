import unittest
import json
import os
import sys

# MOCK SERVICE IMPLEMENTATION (Simulates Database/API)

class MockWordStorageService:
    """
    Simulates the system's database layer for storing and retrieving 
    linguistic data, focusing on ensuring Unicode (diacritic) integrity.
    
    The use of 'json.dumps(..., ensure_ascii=False)' inside the storage 
    mimics a system correctly handling Unicode strings during serialization.
    """
    def __init__(self):
        # Internal dictionary acts as the 'database table'
        self.storage = {}

    def add_word(self, word: str, meaning: str, language: str) -> bool:
        """
        Test Execution Step 1: Adds the word.
        Ensures the complex Unicode string is used correctly as a key.
        """
        try:
            data = {"meaning": meaning, "language": language}
            # Crucial: The word string itself is the key, and the data payload 
            # is serialized ensuring Unicode characters are preserved (ensure_ascii=False)
            self.storage[word] = json.dumps(data, ensure_ascii=False)
            return True
        except Exception as e:
            # Log any storage failure
            print(f"Storage error: {e}")
            return False

    def get_word(self, word: str) -> dict or None:
        """
        Test Execution Step 2: Retrieves the word.
        Verifies that the exact Unicode string can be used for lookup.
        """
        if word in self.storage:
            # Deserialize the stored payload
            data_json = self.storage[word]
            data = json.loads(data_json)
            # Add the word back to the result for comprehensive verification
            data['word'] = word 
            return data
        return None


#  UNIT TEST CLASS

class TestIndigenousWordStorage(unittest.TestCase):
    """
    Test Suite for Indigenous Language Data Integrity (TC_INDIG_001).
    Focuses on TC_INDIG_001_01: Store Word with Diacritics.
    """

    def setUp(self):
        """Initializes the mock service before every test."""
        self.storage_service = MockWordStorageService()

    def test_tc_indig_001_01_store_word_with_diacritics(self):
        """
        Test Case ID: TC_INDIG_001_01
        Test Description: Verify that the system can correctly store a word 
        containing diacritics (e.g., Navajo greeting “yá át ééh”) and retrieve it accurately.
        """
        # Test Data
        word_with_diacritics = "yá át ééh"  # Navajo greeting with diacritics
        expected_meaning = "hello"
        language = "Navajo"

        print(f"\n--- Executing Test TC_INDIG_001_01 ---")
        print(f"Input Word: '{word_with_diacritics}'")

        # 1. Test Execution Step 1: Add word
        success = self.storage_service.add_word(
            word=word_with_diacritics, 
            meaning=expected_meaning, 
            language=language
        )
        self.assertTrue(success, "Step 1 Failed: The system failed to store the word.")

        # 2. Test Execution Step 2: Retrieve the word
        retrieved_data = self.storage_service.get_word(word_with_diacritics)
        
        # 3. Expected Output Assertion: Word exists and meaning matches
        
        # Check 1: Ensure retrieval was successful
        self.assertIsNotNone(retrieved_data, 
                             "Assertion Failed: Word not found in storage (Key lookup failed).")

        # Check 2: Verify the retrieved meaning (Payload Integrity)
        self.assertEqual(retrieved_data['meaning'], expected_meaning, 
                         "Assertion Failed: Retrieved meaning does not match expected value.")
        
        # Check 3: Verify the exact word string (Key Integrity)
        self.assertEqual(retrieved_data['word'], word_with_diacritics, 
                         "Assertion Failed: The retrieved word string itself is distorted or incorrect.")

        print(f"Result: PASS. Verified that the word '{retrieved_data['word']}' was stored and retrieved accurately.")


if __name__ == '__main__':
    # Add a buffer to sys.argv to prevent unittest from trying to interpret 
    # the print statements as test arguments when run directly.
    sys.argv[0] = 'test_indigenous_data.py'
    unittest.main()
    


import unittest
from datetime import datetime


#  Word Tagging Tool (Seed Vault Feature)


# Simulated database for tagged words
WORD_TAG_DB = {}

#  Create Tag
def create_tag(word: str, meaning: str, contributor: str) -> bool:
    """Add a new tagged word entry."""
    if not word or not meaning or not contributor:
        raise ValueError("Invalid input: missing required field.")
    if word in WORD_TAG_DB:
        raise ValueError("Word already tagged.")
    WORD_TAG_DB[word] = {"meaning": meaning, "contributor": contributor, "timestamp": datetime.now()}
    return True


#  Search Tag
def search_tag(word: str) -> dict:
    """Search tagged words."""
    if word in WORD_TAG_DB:
        return WORD_TAG_DB[word]
    raise LookupError("Word not found.")


#  Update Tag
def update_tag(word: str, new_meaning: str) -> bool:
    """Update an existing tag's meaning."""
    if word not in WORD_TAG_DB:
        raise LookupError("Cannot update: word not found.")
    if not new_meaning:
        raise ValueError("Invalid update: meaning required.")
    WORD_TAG_DB[word]["meaning"] = new_meaning
    WORD_TAG_DB[word]["timestamp"] = datetime.now()
    return True



# Unit Tests for Word Tagging Tool


class TestWordTaggingTool(unittest.TestCase):

    def setUp(self):
        """Reset the mock database before each test."""
        WORD_TAG_DB.clear()
        self.word = "seed"
        self.meaning = "symbol of preservation"
        self.user = "Researcher A"

    # Test 1: Valid Tag Creation
    def test_create_tag_valid(self):
        result = create_tag(self.word, self.meaning, self.user)
        self.assertTrue(result)
        self.assertIn(self.word, WORD_TAG_DB)

    # Test 2: Duplicate Tag Fails
    def test_create_tag_duplicate(self):
        create_tag(self.word, self.meaning, self.user)
        with self.assertRaises(ValueError):
            create_tag(self.word, self.meaning, self.user)

    # Test 3: Missing Field Fails
    def test_create_tag_missing_field(self):
        with self.assertRaises(ValueError):
            create_tag("", "meaningless", "user")

    # Test 4: Search for Existing Word
    def test_search_tag_found(self):
        create_tag(self.word, self.meaning, self.user)
        result = search_tag(self.word)
        self.assertEqual(result["meaning"], self.meaning)

    # Test 5: Search Nonexistent Word
    def test_search_tag_not_found(self):
        with self.assertRaises(LookupError):
            search_tag("nonexistent")

    # Test 6: Update Existing Tag
    def test_update_tag_valid(self):
        create_tag(self.word, self.meaning, self.user)
        result = update_tag(self.word, "represents renewal")
        self.assertTrue(result)
        self.assertEqual(WORD_TAG_DB[self.word]["meaning"], "represents renewal")

    # Test 7: Update Nonexistent Word
    def test_update_tag_not_found(self):
        with self.assertRaises(LookupError):
            update_tag("unknown", "new meaning")

    # Test 8: Update with Empty Meaning 
    def test_update_tag_invalid_meaning(self):
        create_tag(self.word, self.meaning, self.user)
        with self.assertRaises(ValueError):
            update_tag(self.word, "")



#  Run Tests

if __name__ == "__main__":
    unittest.main(verbosity=2)

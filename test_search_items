import os
from bs4 import BeautifulSoup

# Import the functions to test from your search_items.py
from search_items import findLanguage, findArtifact, findLocation

# Helper to load the HTML seed file
def _load_seed_soup(filename="seed_search.html"):
    file_path = os.path.join(os.path.dirname(__file__), filename)
    with open(file_path, "r", encoding="utf-8") as f:
        return BeautifulSoup(f, "html.parser")

# --- 1) Check all entries from the HTML are found and match expected display strings ---
def test_search_results_match_seed():
    soup = _load_seed_soup()

    failures = []

    # LANGUAGES
    lang_table = soup.find("table", {"id": "langTable"})
    if lang_table:
        rows = lang_table.find_all("tr")[1:]  # skip header
        for r in rows:
            cols = r.find_all("td")
            if len(cols) >= 2:
                name = cols[0].get_text(strip=True)
                expected = cols[1].get_text(strip=True)
                try:
                    got = findLanguage(name)
                except Exception as e:
                    failures.append(f"findLanguage('{name}') raised exception: {e}")
                    continue
                if got != expected:
                    failures.append(f"findLanguage('{name}') -> expected {expected!r}, got {got!r}")

    # ARTIFACTS
    art_table = soup.find("table", {"id": "artTable"})
    if art_table:
        rows = art_table.find_all("tr")[1:]
        for r in rows:
            cols = r.find_all("td")
            if len(cols) >= 2:
                name = cols[0].get_text(strip=True)
                expected = cols[1].get_text(strip=True)
                try:
                    got = findArtifact(name)
                except Exception as e:
                    failures.append(f"findArtifact('{name}') raised exception: {e}")
                    continue
                if got != expected:
                    failures.append(f"findArtifact('{name}') -> expected {expected!r}, got {got!r}")

    # LOCATIONS
    loc_table = soup.find("table", {"id": "locTable"})
    if loc_table:
        rows = loc_table.find_all("tr")[1:]
        for r in rows:
            cols = r.find_all("td")
            if len(cols) >= 2:
                name = cols[0].get_text(strip=True)
                expected = cols[1].get_text(strip=True)
                try:
                    got = findLocation(name)
                except Exception as e:
                    failures.append(f"findLocation('{name}') raised exception: {e}")
                    continue
                if got != expected:
                    failures.append(f"findLocation('{name}') -> expected {expected!r}, got {got!r}")

    # Report and assert
    if failures:
        print("Failures found in seed match tests:")
        for f in failures:
            print(" -", f)
    assert not failures, "Some seed entries did not match the search function outputs."

    return True  # mimic your example: return True on success

# --- 2) Invalid type / input tests similar to your TC-Incorrect cases ---
def test_invalid_inputs_behavior():
    """
    Verifies that invalid inputs raise ValueError or return expected not-found strings.
    Adjust message checks if your implementation uses different wording.
    """
    invalid_failures = []

    # numeric string to findLanguage -> expect ValueError or specific handling
    try:
        findLanguage("1234")
        invalid_failures.append("findLanguage('1234') did not raise ValueError (expected)")
    except ValueError as e:
        # ok: expected. Optionally check message fragment:
        if "Invalid" not in str(e) and "null" not in str(e):
            invalid_failures.append(f"findLanguage('1234') raised ValueError with unexpected message: {e}")

    # None for findArtifact -> expect ValueError
    try:
        findArtifact(None)
        invalid_failures.append("findArtifact(None) did not raise ValueError (expected)")
    except ValueError as e:
        if "Input cannot be null" not in str(e) and "null" not in str(e):
            invalid_failures.append(f"findArtifact(None) raised ValueError with unexpected message: {e}")

    # boolean for findLocation -> expect ValueError
    try:
        findLocation(True)
        invalid_failures.append("findLocation(True) did not raise ValueError (expected)")
    except ValueError as e:
        if "Invalid type" not in str(e) and "type" not in str(e):
            invalid_failures.append(f"findLocation(True) raised ValueError with unexpected message: {e}")

    if invalid_failures:
        print("Invalid-input test failures:")
        for f in invalid_failures:
            print(" -", f)
    assert not invalid_failures, "Invalid input checks failed."

    return True

# --- 3) Non-existent item tests (should return '... not found' strings) ---
def test_nonexistent_items():
    failures = []

    try:
        r = findLanguage("Elvish")
        if r != "Language not found":
            failures.append(f"findLanguage('Elvish') -> expected 'Language not found', got {r!r}")
    except Exception as e:
        failures.append(f"findLanguage('Elvish') raised {e} but should have returned 'Language not found'")

    try:
        r = findArtifact("Magic Wand")
        if r != "Artifact not found":
            failures.append(f"findArtifact('Magic Wand') -> expected 'Artifact not found', got {r!r}")
    except Exception as e:
        failures.append(f"findArtifact('Magic Wand') raised {e} but should have returned 'Artifact not found'")

    try:
        r = findLocation("Atlantis")
        if r != "Location not found":
            failures.append(f"findLocation('Atlantis') -> expected 'Location not found', got {r!r}")
    except Exception as e:
        failures.append(f"findLocation('Atlantis') raised {e} but should have returned 'Location not found'")

    if failures:
        print("Non-existent item test failures:")
        for f in failures:
            print(" -", f)
    assert not failures, "Non-existent item checks failed."

    return True

# --- Run all checks if the file is executed directly (mimics your earlier example) ---
if __name__ == "__main__":
    overall_ok = True

    try:
        if test_search_results_match_seed():
            print(" Seed match tests passed.")
    except AssertionError as e:
        overall_ok = False
        print(" Seed match tests failed:", e)

    try:
        if test_invalid_inputs_behavior():
            print(" Invalid input tests passed.")
    except AssertionError as e:
        overall_ok = False
        print("Invalid input tests failed:", e)

    try:
        if test_nonexistent_items():
            print("Non-existent item tests passed.")
    except AssertionError as e:
        overall_ok = False
        print("Non-existent item tests failed:", e)

    if overall_ok:
        print("\n ALL TESTS PASSED (direct run).")
    else:
        print("\n Some tests failed — check the printed failures above.")

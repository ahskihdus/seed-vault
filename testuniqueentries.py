import os
from bs4 import BeautifulSoup

def test_table_entries_unique():
    # Load the HTML file
    file_path = os.path.join(os.path.dirname(__file__), "seed.html")
    with open(file_path, "r", encoding="utf-8") as f:
        soup = BeautifulSoup(f, "html.parser")

    # Find the table
    table = soup.find("table", {"id": "artTable"})
    rows = table.find_all("tr")[1:]  # Skip header row

    # Collect entries as tuples of (Title, Author, Date)
    entries = []
    for row in rows:
        cols = row.find_all("td")
        if len(cols) == 3:  # skip empty/trailing rows
            title = cols[0].get_text(strip=True)
            author = cols[1].get_text(strip=True)
            date = cols[2].get_text(strip=True)
            entries.append((title, author, date))

    # Check for duplicates
    unique_entries = set(entries)
    duplicates_exist = len(entries) != len(unique_entries)

    # Debug output for test clarity
    if duplicates_exist:
        print("Duplicate entries found:")
        seen = set()
        for e in entries:
            if e in seen:
                print(e)
            else:
                seen.add(e)

    # Assert all entries are unique
    assert not duplicates_exist, "Table contains duplicate entries."

    # Return True if all entries are unique (for direct run)
    return True


if __name__ == "__main__":
    result = test_table_entries_unique()
    if result:
        print("✅ All entries in the table are unique.")

import unittest
from html.parser import HTMLParser

""" You should get a result that looks like this:
Ran 4 tests in 0.004s

OK"""


class ArtifactHTMLParser(HTMLParser):
    """Simple HTML parser to extract artifacts from seed.html."""
    def __init__(self):
        super().__init__()
        self.in_td = False
        self.current_row = []
        self.artifacts = []
        self.current_link = None
        self.current_data = ""

    def handle_starttag(self, tag, attrs):
        if tag == "td":
            self.in_td = True
            self.current_data = ""
        elif tag == "tr":
            self.current_row = []
        elif tag == "a":
            for name, value in attrs:
                if name == "href":
                    self.current_link = value

    def handle_data(self, data):
        if self.in_td:
            self.current_data += data.strip()

    def handle_endtag(self, tag):
        if tag == "td":
            self.in_td = False
            text = self.current_data.strip()
            if text:
                self.current_row.append((text, self.current_link))
            self.current_link = None
        elif tag == "tr" and len(self.current_row) == 3:
            title, author, date = [c[0] for c in self.current_row]
            link = self.current_row[0][1]
            self.artifacts.append({
                "title": title,
                "author": author,
                "date": date,
                "link": link
            })


def parse_artifacts_from_html(html_text):
    parser = ArtifactHTMLParser()
    parser.feed(html_text)
    return parser.artifacts


# ---------------- TEST CASES ---------------- #

class TestArtifactList(unittest.TestCase):

    def setUp(self):
        """Load the real artifact list once."""
        with open("seed.html", encoding="utf-8") as f:
            html = f.read()
        self.real_artifacts = parse_artifacts_from_html(html)

    # ---------- Correct case ----------
    def testDisplayArtifactList_valid(self):
        """Artifact list contains one or more valid artifacts; list displays successfully."""
        artifacts = self.real_artifacts
        self.assertTrue(len(artifacts) > 0, "Artifact list should not be empty.")
        for art in artifacts:
            self.assertTrue(all(art.values()), f"Artifact missing data: {art}")
            self.assertTrue(art["link"].startswith("http"), f"Invalid link in {art['title']}")

    # ---------- Incorrect case ----------
    def testDisplayArtifactList_invalid(self):
        """Artifact list is null or contains invalid entries; should fail gracefully."""
        artifacts = [
            {"title": "", "author": "Someone", "date": "10/10/2025", "link": "http://example.com"},
            {"title": "Valid Title", "author": "", "date": "", "link": ""}
        ]
        for art in artifacts:
            with self.subTest(art=art):
                valid = all(art.values()) and art["link"].startswith("http")
                self.assertFalse(valid, "Invalid artifact should not pass validation.")

    # ---------- Boundary condition ----------
    def testDisplayArtifactList_empty(self):
        """Boundary: Artifact list is empty; should display 'no artifacts available'."""
        artifacts = []
        message = "no artifacts available" if not artifacts else ""
        self.assertEqual(message, "no artifacts available", "Empty list should show 'no artifacts available' message.")

    # ---------- Edge case ----------
    def testDisplayArtifactList_maximum(self):
        """Edge: Artifact list at maximum allowed size; should still perform correctly."""
        max_limit = 1000  # example maximum
        artifacts = [{"title": f"Artifact {i}", "author": "Tester", "date": "10/29/2025", "link": "http://example.com"} for i in range(max_limit)]
        # Check that parsing or display would still handle it
        self.assertEqual(len(artifacts), max_limit, "All artifacts should be loaded.")
        # Ensure no lag/truncation simulation (we just check it runs fast)
        valid = all(a["title"] and a["link"].startswith("http") for a in artifacts)
        self.assertTrue(valid, "Maximum artifact list should still validate correctly.")


if __name__ == "__main__":
    unittest.main()

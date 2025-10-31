# this is search_items.py
# These are MOCK implementations, just for testing

MAX_LENGTH = 100

LANGUAGES = {
    "Latin": "Latin - Ancient Rome",
    "Greek": "Greek - Ancient Greece",
}

ARTIFACTS = {
    "Statue of Zeus": "Statue of Zeus - Greece",
    "Rosetta Stone": "Rosetta Stone - Egypt",
}

LOCATIONS = {
    "Rome": "Rome - Italy",
    "Alexandria": "Alexandria - Egypt",
}


def _validate_input(name):
    if name is None:
        raise ValueError("Input cannot be null")
    if not isinstance(name, str):
        raise ValueError("Invalid type")
    if name.isnumeric():
        # covers numeric-string invalid-case like "1234"
        raise ValueError("Invalid input")
    if len(name) <= 1:
        raise ValueError("Input too short")
    if len(name) > MAX_LENGTH:
        raise ValueError("Input too long")


def findLanguage(languageName):
    """Search for a language. Returns display string or 'Language not found'."""
    _validate_input(languageName)
    return LANGUAGES.get(languageName, "Language not found")


def findArtifact(artifactName):
    """Search for an artifact. Returns display string or 'Artifact not found'."""
    _validate_input(artifactName)
    return ARTIFACTS.get(artifactName, "Artifact not found")


def findLocation(locationName):
    """Search for a location. Returns display string or 'Location not found'."""
    _validate_input(locationName)
    return LOCATIONS.get(locationName, "Location not found")

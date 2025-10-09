import pytest
from pydantic import ValidationError
from app.schemas.survey import ReferencePoint, TieLine # adjust import as needed

@pytest.mark.parametrize(
    "corner_text,expected_dir",
    [
        # --- Standard corners ---
        ("Northeast Corner of said Northwest Quarter", "NE"),
        ("Northwest Corner of Section 14", "NW"),
        ("Southeast corner of the Southwest Quarter", "SE"),
        ("Southwest Corner", "SW"),

        # --- Single direction quarter corners ---
        ("East Quarter Corner of Section 19", "E"),
        ("West Quarter Corner", "W"),
        ("North Quarter Corner", "N"),
        ("South Quarter Corner", "S"),

        # --- Boundary or midpoint language ---
        ("Center of the East line of said Section 12", "E"),
        ("Center of the South line of said Section 12", "S"),
        ("Center of West boundary", "W"),
        ("Center of North line", "N"),

        # --- Center of section ---
        ("Center of Section 23", "C"),
        ("Intersection of the quarter lines of said section", "C"),

        # --- Mixed phrasing / spacing variations ---
        ("North east corner of the northwest quarter", "NE"),
        ("South-west corner", "SW"),
        ("Northeasterly corner", "NE"),
        ("Beginning at the northeast corner of the northwest quarter", "NE"),

        # --- Non-directional or invalid ---
        ("Point of beginning", None),
        ("Some random description", None),
    ],
)
def test_corner_dir_inference(corner_text, expected_dir):
    """Ensure the ReferencePoint infers the correct cornerDir from text."""
    rp = ReferencePoint(
        corner=corner_text,
        divisionLevel="section",
        tieLine=TieLine(bearing="S00-10-05E", distance=100.0),
        referenceWhere="QQSEC = 'NWNW'"
    )
    assert rp.cornerDir == expected_dir


@pytest.mark.parametrize(
    "corner_text",
    [
        # Ensure we don’t incorrectly match 'northwest' inside a 'northeast' phrase
        "Northeast Corner of said Northwest Quarter",
        "Southeast Corner of said Southwest Quarter",
    ],
)
def test_corner_dir_no_false_positive(corner_text):
    rp = ReferencePoint(
        corner=corner_text, 
        divisionLevel="section",
        tieLine=TieLine(bearing="S00-10-05E", distance=100.0),
        referenceWhere="QQSEC = 'NWNW'"
    )
    # Should match only the *first* direction in the phrase
    first_token = corner_text.split()[0].lower()
    if "northeast" in first_token:
        assert rp.cornerDir == "NE"
    elif "southeast" in first_token:
        assert rp.cornerDir == "SE"


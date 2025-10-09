import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.schemas.survey import ReferencePoint

client = TestClient(app)

@pytest.fixture(scope="session")
def openapi_schema():
    """Load the OpenAPI schema once per test session."""
    return app.openapi()

def test_openapi_valid(openapi_schema):
    """Ensure the app generates a valid OpenAPI schema."""
    assert "openapi" in openapi_schema
    assert "paths" in openapi_schema
    assert "components" in openapi_schema
    assert "schemas" in openapi_schema["components"]

def test_reference_point_schema_exists(openapi_schema):
    """Confirm ReferencePoint model is present in OpenAPI."""
    schemas = openapi_schema["components"]["schemas"]
    assert "ReferencePoint" in schemas
    ref_schema = schemas["ReferencePoint"]
    assert "properties" in ref_schema
    assert "cornerDir" in ref_schema["properties"]

def test_llm_output_validates_against_schema():
    """Round-trip test: ensure sample LLM JSON validates."""
    data = {
        "corner": "Northeast Corner of said Northwest Quarter of the Northwest Quarter",
        "divisionLevel": "forty",
        "tieLine": {"bearing": "S00-10-05E", "distance": 762.3},
        "referenceWhere": "QQSEC = 'NWNW'"
    }

    rp = ReferencePoint(**data)

    assert rp.cornerDir == "NE"
    assert rp.divisionLevel == "forty"
    assert rp.tieLine.distance == 762.3
from fastapi.testclient import TestClient


def test_root(client: TestClient):
    response = client.get("/")

    assert response.status_code == 200
    assert response.json() == {
        "message": "Welcome to Real-Time Ticketing System API 🚀",
        "docs": "/docs",
        "redoc": "/redoc",
    }


def test_root_head(client: TestClient):
    response = client.head("/")
    assert response.status_code == 200


def test_health_head(client: TestClient):
    response = client.head("/health")
    assert response.status_code == 200
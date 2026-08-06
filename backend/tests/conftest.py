import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.config import settings
from app.db.base import Base
from app.db.session import get_db
from app.main import app
import uuid
from app.models.user import User
from app.core.security import hash_password


engine = create_engine(settings.TEST_DATABASE_URL)

TestingSessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)


@pytest.fixture(scope="session", autouse=True)
def setup_database():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def db():
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture
def client():
    with TestClient(app) as client:
        yield client


# -------------------------
# Authentication Fixtures
# -------------------------

# @pytest.fixture
# def user_data():
#     return {
#         "name": "Test User",
#         "email": "testuser@example.com",
#         "password": "password123",
#     }


@pytest.fixture
def user_data():
    return {
        "name": "Test User",
        "email": f"{uuid.uuid4()}@example.com",
        "password": "password123",
    }

@pytest.fixture
def auth_headers(client, user_data):
    register_response = client.post(
        "/users/",
        json=user_data,
    )

    assert register_response.status_code == 201

    login_response = client.post(
        "/users/login",
        data={
            "username": user_data["email"],
            "password": user_data["password"],
        },
    )

    assert login_response.status_code == 200

    token = login_response.json()["access_token"]

    return {
        "Authorization": f"Bearer {token}",
    }


# -------------------------
# Ticket Fixture
# -------------------------

@pytest.fixture
def created_ticket(client, auth_headers):
    response = client.post(
        "/tickets/",
        json={
            "title": "Sample Ticket",
            "description": "Sample Description",
            "priority": "High",
        },
        headers=auth_headers,
    )

    assert response.status_code == 201

    return response.json()

@pytest.fixture
def admin_user(db):
    email = f"admin-{uuid.uuid4()}@example.com"

    admin = User(
        name="Admin",
        email=email,
        password=hash_password("admin123"),
        role="admin",
    )

    db.add(admin)
    db.commit()
    db.refresh(admin)

    return {
        "email": email,
        "password": "admin123",
    }

@pytest.fixture
def admin_headers(client, admin_user):
    response = client.post(
        "/users/login",
        data={
            "username": admin_user["email"],
            "password": admin_user["password"],
        },
    )

    assert response.status_code == 200

    token = response.json()["access_token"]

    return {
        "Authorization": f"Bearer {token}"
    }
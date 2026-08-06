def test_register_user(client):
    response = client.post(
        "/users/",
        json={
            "name": "Abhinav",
            "email": "abhinav@example.com",
            "password": "password123",
        },
    )

    assert response.status_code == 201

    data = response.json()

    assert data["name"] == "Abhinav"
    assert data["email"] == "abhinav@example.com"
    assert data["role"] == "customer"

    assert "id" in data
    assert "password" not in data


def test_register_duplicate_email(client):
    user = {
        "name": "Abhinav",
        "email": "duplicate@example.com",
        "password": "password123",
    }

    response = client.post("/users/", json=user)
    assert response.status_code == 201

    response = client.post("/users/", json=user)

    assert response.status_code == 400
    assert response.json()["detail"] == "Email already registered"


def test_login_success(client):
    user = {
        "name": "Login User",
        "email": "login@example.com",
        "password": "password123",
    }

    client.post("/users/", json=user)

    response = client.post(
        "/users/login",
        data={
            "username": user["email"],
            "password": user["password"],
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_login_invalid_password(client):
    user = {
        "name": "Wrong Password",
        "email": "wrong@example.com",
        "password": "password123",
    }

    client.post("/users/", json=user)

    response = client.post(
        "/users/login",
        data={
            "username": user["email"],
            "password": "wrongpassword",
        },
    )

    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid email or password"

def test_get_current_user(client):
    user = {
        "name": "Current User",
        "email": "current@example.com",
        "password": "password123",
    }

    # Register
    client.post("/users/", json=user)

    # Login
    login_response = client.post(
        "/users/login",
        data={
            "username": user["email"],
            "password": user["password"],
        },
    )

    token = login_response.json()["access_token"]

    # Access protected endpoint
    response = client.get(
        "/users/me",
        headers={
            "Authorization": f"Bearer {token}",
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["name"] == user["name"]
    assert data["email"] == user["email"]
    assert data["role"] == "customer"


def test_invalid_jwt(client):
    response = client.get(
        "/users/me",
        headers={
            "Authorization": "Bearer invalid_token",
        },
    )

    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid or expired token"
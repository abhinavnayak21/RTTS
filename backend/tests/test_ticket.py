from uuid import uuid4

from app.core.security import hash_password
from app.models.user import User

def test_create_ticket(client):
    user = {
        "name": "Ticket User",
        "email": "ticket@example.com",
        "password": "password123",
    }

    # Register user
    register_response = client.post("/users/", json=user)
    assert register_response.status_code == 201

    # Login
    login_response = client.post(
        "/users/login",
        data={
            "username": user["email"],
            "password": user["password"],
        },
    )

    assert login_response.status_code == 200

    token = login_response.json()["access_token"]

    # Create ticket
    response = client.post(
        "/tickets/",
        json={
            "title": "Cannot login",
            "description": "Login page shows invalid credentials.",
            "priority": "High",
        },
        headers={
            "Authorization": f"Bearer {token}",
        },
    )

    print("\nStatus Code:", response.status_code)
    print("Response JSON:", response.json())

    assert response.status_code == 201

    data = response.json()

    assert data["title"] == "Cannot login"
    assert data["description"] == "Login page shows invalid credentials."
    assert data["priority"] == "High"
    assert data["status"] == "Open"

    assert "id" in data
    assert "created_at" in data
    assert "owner_id" in data


def test_get_all_tickets(client):
    user = {
        "name": "Ticket User",
        "email": "list@example.com",
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

    # Create first ticket
    client.post(
        "/tickets/",
        json={
            "title": "First Ticket",
            "description": "First Description",
            "priority": "High",
        },
        headers={
            "Authorization": f"Bearer {token}",
        },
    )

    # Create second ticket
    client.post(
        "/tickets/",
        json={
            "title": "Second Ticket",
            "description": "Second Description",
            "priority": "Medium",
        },
        headers={
            "Authorization": f"Bearer {token}",
        },
    )

    # Fetch tickets
    response = client.get(
        "/tickets/",
        headers={
            "Authorization": f"Bearer {token}",
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["total"] == 2
    assert data["page"] == 1
    assert data["limit"] == 10

    assert len(data["items"]) == 2


def test_get_ticket_by_id(client):
    user = {
        "name": "Ticket User",
        "email": "ticketid@example.com",
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

    # Create Ticket
    create_response = client.post(
        "/tickets/",
        json={
            "title": "Bug Report",
            "description": "Unable to save profile",
            "priority": "High",
        },
        headers={
            "Authorization": f"Bearer {token}",
        },
    )

    assert create_response.status_code == 201

    ticket_id = create_response.json()["id"]

    # Fetch Ticket
    response = client.get(
        f"/tickets/{ticket_id}",
        headers={
            "Authorization": f"Bearer {token}",
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["id"] == ticket_id
    assert data["title"] == "Bug Report"
    assert data["description"] == "Unable to save profile"
    assert data["priority"] == "High"
    assert data["status"] == "Open"

def test_update_ticket(client):
    user = {
        "name": "Update User",
        "email": "update@example.com",
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

    # Create Ticket
    create_response = client.post(
        "/tickets/",
        json={
            "title": "Old Title",
            "description": "Old Description",
            "priority": "Low",
        },
        headers={
            "Authorization": f"Bearer {token}",
        },
    )

    ticket_id = create_response.json()["id"]

    # Update Ticket
    response = client.put(
        f"/tickets/{ticket_id}",
        json={
            "title": "New Title",
            "description": "Updated Description",
            "priority": "High",
            "status": "In Progress",
        },
        headers={
            "Authorization": f"Bearer {token}",
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["title"] == "New Title"
    assert data["description"] == "Updated Description"
    assert data["priority"] == "High"
    assert data["status"] == "In Progress"

def test_delete_ticket(client, auth_headers, created_ticket):
    ticket_id = created_ticket["id"]

    response = client.delete(
        f"/tickets/{ticket_id}",
        headers=auth_headers,
    )

    assert response.status_code == 204

    response = client.get(
        f"/tickets/{ticket_id}",
        headers=auth_headers,
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Ticket not found."

# Pagination

def test_ticket_pagination(client, auth_headers):
    for i in range(15):
        client.post(
            "/tickets/",
            json={
                "title": f"Ticket {i}",
                "description": f"Description {i}",
                "priority": "Medium",
            },
            headers=auth_headers,
        )

    response = client.get(
        "/tickets/?page=1&limit=10",
        headers=auth_headers,
    )

    assert response.status_code == 200

    data = response.json()

    assert data["page"] == 1
    assert data["limit"] == 10
    assert data["total"] == 15
    assert len(data["items"]) == 10

# Search

def test_ticket_search(client, auth_headers):
    client.post(
        "/tickets/",
        json={
            "title": "Payment Failed",
            "description": "Stripe payment issue",
            "priority": "High",
        },
        headers=auth_headers,
    )

    client.post(
        "/tickets/",
        json={
            "title": "Login Error",
            "description": "Cannot login",
            "priority": "Low",
        },
        headers=auth_headers,
    )

    response = client.get(
        "/tickets/?search=Payment",
        headers=auth_headers,
    )

    assert response.status_code == 200

    data = response.json()

    assert data["total"] == 1
    assert data["items"][0]["title"] == "Payment Failed"

# Priority Filter

def test_priority_filter(client, auth_headers):
    client.post(
        "/tickets/",
        json={
            "title": "High Priority",
            "description": "",
            "priority": "High",
        },
        headers=auth_headers,
    )

    client.post(
        "/tickets/",
        json={
            "title": "Low Priority",
            "description": "",
            "priority": "Low",
        },
        headers=auth_headers,
    )

    response = client.get(
        "/tickets/?priority=High",
        headers=auth_headers,
    )

    assert response.status_code == 200

    data = response.json()

    assert data["total"] == 1
    assert data["items"][0]["priority"] == "High"

# Status Filter

def test_status_filter(client, auth_headers, created_ticket):
    client.put(
        f"/tickets/{created_ticket['id']}",
        json={
            "status": "In Progress",
        },
        headers=auth_headers,
    )

    response = client.get(
        "/tickets/?status=In Progress",
        headers=auth_headers,
    )

    assert response.status_code == 200

    data = response.json()

    assert data["total"] >= 1

    for ticket in data["items"]:
        assert ticket["status"] == "In Progress"

# Sorting

def test_ticket_sorting(client, auth_headers):
    client.post(
        "/tickets/",
        json={
            "title": "B Ticket",
            "description": "",
            "priority": "Low",
        },
        headers=auth_headers,
    )

    client.post(
        "/tickets/",
        json={
            "title": "A Ticket",
            "description": "",
            "priority": "High",
        },
        headers=auth_headers,
    )

    response = client.get(
        "/tickets/?sort_by=title&order=asc",
        headers=auth_headers,
    )

    assert response.status_code == 200

    data = response.json()

    assert data["items"][0]["title"] == "A Ticket"

# Customer cannot access another user's ticket

def test_customer_cannot_access_other_user_ticket(
    client,
    db,
    auth_headers,
):
    email = f"user2-{uuid4()}@example.com"

    second_user = User(
        name="User 2",
        email=email,
        password=hash_password("password123"),
        role="customer",
    )

    db.add(second_user)
    db.commit()
    db.refresh(second_user)

    login = client.post(
        "/users/login",
        data={
            "username": email,
            "password": "password123",
        },
    )

    assert login.status_code == 200

    token = login.json()["access_token"]

    second_headers = {
        "Authorization": f"Bearer {token}"
    }

    ticket = client.post(
        "/tickets/",
        json={
            "title": "Private Ticket",
            "description": "Only User2",
            "priority": "High",
        },
        headers=second_headers,
    )

    assert ticket.status_code == 201

    ticket_id = ticket.json()["id"]

    response = client.get(
        f"/tickets/{ticket_id}",
        headers=auth_headers,
    )

    assert response.status_code == 404

# Admin can access every ticket

def test_admin_can_access_all_tickets(
    client,
    auth_headers,
    admin_headers,
):
    ticket = client.post(
        "/tickets/",
        json={
            "title": "Customer Ticket",
            "description": "Visible to admin",
            "priority": "High",
        },
        headers=auth_headers,
    ).json()

    response = client.get(
        f"/tickets/{ticket['id']}",
        headers=admin_headers,
    )

    assert response.status_code == 200
    assert response.json()["id"] == ticket["id"]

# Admin sees all tickets

def test_admin_get_all_tickets(
    client,
    auth_headers,
    admin_headers,
):
    for i in range(3):
        client.post(
            "/tickets/",
            json={
                "title": f"Ticket {i}",
                "description": "",
                "priority": "Medium",
            },
            headers=auth_headers,
        )

    response = client.get(
        "/tickets/",
        headers=admin_headers,
    )

    assert response.status_code == 200
    assert response.json()["total"] >= 3
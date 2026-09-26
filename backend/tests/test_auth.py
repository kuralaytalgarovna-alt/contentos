def test_register_and_login(client):
    resp = client.post(
        "/api/auth/register",
        json={"email": "smm@example.com", "password": "secret123", "full_name": "SMM Manager"},
    )
    assert resp.status_code == 201
    token = resp.json()["access_token"]
    assert token

    resp = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    assert resp.json()["email"] == "smm@example.com"

    resp = client.post("/api/auth/login", json={"email": "smm@example.com", "password": "wrong"})
    assert resp.status_code == 401

    resp = client.post("/api/auth/login", json={"email": "smm@example.com", "password": "secret123"})
    assert resp.status_code == 200


def test_duplicate_registration_rejected(client):
    payload = {"email": "dup@example.com", "password": "secret123"}
    assert client.post("/api/auth/register", json=payload).status_code == 201
    assert client.post("/api/auth/register", json=payload).status_code == 409


def test_me_requires_auth(client):
    resp = client.get("/api/auth/me")
    assert resp.status_code == 401

def _auth_headers(client, email="owner@example.com"):
    resp = client.post("/api/auth/register", json={"email": email, "password": "secret123"})
    token = resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_create_and_list_project(client):
    headers = _auth_headers(client)

    resp = client.post(
        "/api/projects",
        json={"name": "Media Channel", "niche": "новости", "target_audience": "18-35"},
        headers=headers,
    )
    assert resp.status_code == 201
    project = resp.json()
    assert project["role"] == "owner"
    assert project["name"] == "Media Channel"

    resp = client.get("/api/projects", headers=headers)
    assert resp.status_code == 200
    assert len(resp.json()) == 1


def test_client_viewer_cannot_edit(client):
    owner_headers = _auth_headers(client, "owner2@example.com")
    project = client.post(
        "/api/projects", json={"name": "Client Project"}, headers=owner_headers
    ).json()

    client.post("/api/auth/register", json={"email": "viewer@example.com", "password": "secret123"})
    client.post(
        f"/api/projects/{project['id']}/members",
        json={"email": "viewer@example.com", "role": "client_viewer"},
        headers=owner_headers,
    )

    login = client.post(
        "/api/auth/login", json={"email": "viewer@example.com", "password": "secret123"}
    ).json()
    viewer_headers = {"Authorization": f"Bearer {login['access_token']}"}

    resp = client.patch(
        f"/api/projects/{project['id']}",
        json={"name": "Hacked"},
        headers=viewer_headers,
    )
    assert resp.status_code == 403

    resp = client.get(f"/api/projects/{project['id']}", headers=viewer_headers)
    assert resp.status_code == 200


def test_project_not_visible_to_outsiders(client):
    owner_headers = _auth_headers(client, "owner3@example.com")
    project = client.post("/api/projects", json={"name": "Private"}, headers=owner_headers).json()

    other_headers = _auth_headers(client, "other@example.com")
    resp = client.get(f"/api/projects/{project['id']}", headers=other_headers)
    assert resp.status_code == 403

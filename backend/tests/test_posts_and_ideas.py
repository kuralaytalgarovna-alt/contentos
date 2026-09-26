def _project(client):
    headers = {}
    resp = client.post("/api/auth/register", json={"email": "creator@example.com", "password": "secret123"})
    token = resp.json()["access_token"]
    headers["Authorization"] = f"Bearer {token}"

    project = client.post(
        "/api/projects",
        json={"name": "News Channel", "niche": "новости", "target_audience": "18-35"},
        headers=headers,
    ).json()
    return project["id"], headers


def test_post_crud(client):
    project_id, headers = _project(client)

    resp = client.post(
        f"/api/projects/{project_id}/posts",
        json={"title": "Тест", "platform": "instagram", "format": "post"},
        headers=headers,
    )
    assert resp.status_code == 201
    post = resp.json()
    assert post["status"] == "draft"

    resp = client.patch(
        f"/api/projects/{project_id}/posts/{post['id']}",
        json={"status": "scheduled", "scheduled_at": "2026-10-01T12:00:00Z"},
        headers=headers,
    )
    assert resp.status_code == 200
    assert resp.json()["status"] == "scheduled"

    resp = client.get(f"/api/projects/{project_id}/posts", headers=headers)
    assert len(resp.json()) == 1


def test_generate_ideas_mock_fallback(client):
    project_id, headers = _project(client)

    resp = client.post(
        f"/api/projects/{project_id}/ideas/generate",
        json={"goal": "engagement", "count": 5},
        headers=headers,
    )
    assert resp.status_code == 201
    ideas = resp.json()
    assert len(ideas) == 5
    assert all(idea["title"] for idea in ideas)

    resp = client.get(f"/api/projects/{project_id}/ideas", headers=headers)
    assert len(resp.json()) == 5


def test_generate_post_text_from_idea(client):
    project_id, headers = _project(client)

    ideas = client.post(
        f"/api/projects/{project_id}/ideas/generate",
        json={"goal": "reach", "count": 1},
        headers=headers,
    ).json()

    resp = client.post(
        f"/api/projects/{project_id}/ideas/generate-text",
        json={"idea_id": ideas[0]["id"], "platform": "instagram", "format": "post"},
        headers=headers,
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["title"]
    assert len(body["cta_options"]) == 3


def test_analytics_overview(client):
    project_id, headers = _project(client)

    resp = client.get(f"/api/projects/{project_id}/analytics/overview", headers=headers)
    assert resp.status_code == 200
    data = resp.json()
    assert len(data["platforms"]) == 5
    assert data["ai_summary"]

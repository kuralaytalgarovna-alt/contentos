import os
import tempfile
from collections.abc import Generator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

os.environ.setdefault("SECRET_KEY", "test-secret")


@pytest.fixture()
def client(tmp_path, monkeypatch) -> Generator[TestClient, None, None]:
    db_path = tmp_path / "test.db"
    monkeypatch.setenv("DATABASE_URL", f"sqlite:///{db_path}")

    from app.core.config import get_settings

    get_settings.cache_clear()

    from app.db.base import Base
    from app.db import session as session_module

    test_engine = create_engine(f"sqlite:///{db_path}", connect_args={"check_same_thread": False})
    session_module.engine = test_engine
    session_module.SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

    import app.models  # noqa: F401

    Base.metadata.create_all(bind=test_engine)

    from app.main import app

    with TestClient(app) as c:
        yield c

    get_settings.cache_clear()

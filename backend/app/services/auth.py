from app.core.security import verify_password
from app.crud.user import get_user_by_email
from sqlalchemy.orm import Session


def authenticate_user(
    db: Session,
    email: str,
    password: str,
):
    user = get_user_by_email(db, email)

    if not user:
        return None

    if not verify_password(password, user.password):
        return None

    return user
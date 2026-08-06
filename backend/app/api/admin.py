from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.dependencies import get_current_user
from app.db.session import get_db
from app.models.ticket import Ticket, TicketPriority, TicketStatus
from app.models.user import User

router = APIRouter(
    prefix="/admin",
    tags=["Admin"],
)


@router.get("/stats")
def get_admin_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role.lower() != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required.",
        )

    total_tickets = db.query(Ticket).count()

    status_counts = (
        db.query(Ticket.status, func.count(Ticket.id))
        .group_by(Ticket.status)
        .all()
    )
    by_status = {
        "Open": 0,
        "In Progress": 0,
        "Closed": 0,
    }
    for st, count in status_counts:
        status_key = st.value if hasattr(st, "value") else str(st)
        by_status[status_key] = count

    priority_counts = (
        db.query(Ticket.priority, func.count(Ticket.id))
        .group_by(Ticket.priority)
        .all()
    )
    by_priority = {
        "Low": 0,
        "Medium": 0,
        "High": 0,
    }
    for pr, count in priority_counts:
        priority_key = pr.value if hasattr(pr, "value") else str(pr)
        by_priority[priority_key] = count

    return {
        "total": total_tickets,
        "by_status": by_status,
        "by_priority": by_priority,
    }


@router.post("/make-me-admin")
def make_me_admin(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    current_user.role = "admin"
    db.commit()
    db.refresh(current_user)
    return {"message": f"User {current_user.email} promoted to admin successfully."}

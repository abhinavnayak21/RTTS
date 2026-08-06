from sqlalchemy import asc, desc, or_
from sqlalchemy.orm import Session

from app.models.ticket import Ticket
from app.models.user import User
from app.schemas.ticket import TicketCreate, TicketUpdate


def create_ticket(
    db: Session,
    ticket: TicketCreate,
    current_user: User,
) -> Ticket:
    db_ticket = Ticket(
        title=ticket.title,
        description=ticket.description,
        priority=ticket.priority,
        owner_id=current_user.id,
    )

    db.add(db_ticket)
    db.commit()
    db.refresh(db_ticket)

    return db_ticket


def get_all_tickets(
    db: Session,
    current_user: User,
    page: int,
    limit: int,
    status=None,
    priority=None,
    search: str | None = None,
    sort_by: str = "created_at",
    order: str = "desc",
):
    query = db.query(Ticket)

    # RBAC
    if current_user.role != "admin":
        query = query.filter(
            Ticket.owner_id == current_user.id
        )

    # Status Filter
    if status:
        query = query.filter(
            Ticket.status == status
        )

    # Priority Filter
    if priority:
        query = query.filter(
            Ticket.priority == priority
        )

    # Search
    if search:
        query = query.filter(
            or_(
                Ticket.title.ilike(f"%{search}%"),
                Ticket.description.ilike(f"%{search}%"),
            )
        )

    total = query.count()

    sort_column = getattr(Ticket, sort_by)

    if order == "asc":
        query = query.order_by(asc(sort_column))
    else:
        query = query.order_by(desc(sort_column))

    tickets = (
        query.offset((page - 1) * limit)
        .limit(limit)
        .all()
    )

    return {
        "total": total,
        "page": page,
        "limit": limit,
        "items": tickets,
    }


def get_ticket_by_id(
    db: Session,
    ticket_id: int,
    current_user: User,
):
    ticket = (
        db.query(Ticket)
        .filter(Ticket.id == ticket_id)
        .first()
    )

    if ticket is None:
        return None

    if current_user.role == "admin":
        return ticket

    if ticket.owner_id != current_user.id:
        return None

    return ticket


def update_ticket(
    db: Session,
    ticket: Ticket,
    ticket_update: TicketUpdate,
):
    update_data = ticket_update.model_dump(
        exclude_unset=True,
    )

    for key, value in update_data.items():
        setattr(ticket, key, value)

    db.commit()
    db.refresh(ticket)

    return ticket


def delete_ticket(
    db: Session,
    ticket: Ticket,
):
    db.delete(ticket)
    db.commit()
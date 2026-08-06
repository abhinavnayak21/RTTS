from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.crud.ticket import (
    create_ticket,
    delete_ticket,
    get_all_tickets,
    get_ticket_by_id,
    update_ticket,
)
from app.db.session import get_db
from app.models.ticket import TicketPriority, TicketStatus
from app.models.user import User
from app.schemas.filter import TicketFilter
from app.schemas.pagination import PaginatedResponse
from app.schemas.ticket import (
    TicketCreate,
    TicketResponse,
    TicketUpdate,
)

router = APIRouter(
    prefix="/tickets",
    tags=["Tickets"],
)


@router.post(
    "/",
    response_model=TicketResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_new_ticket(
    ticket: TicketCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return create_ticket(
        db=db,
        ticket=ticket,
        current_user=current_user,
    )


def get_ticket_filter(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    status: TicketStatus | None = Query(None),
    priority: TicketPriority | None = Query(None),
    search: str | None = Query(None),
    sort_by: Literal[
        "created_at",
        "priority",
        "status",
        "title",
    ] = Query("created_at"),
    order: Literal[
        "asc",
        "desc",
    ] = Query("desc"),
) -> TicketFilter:
    return TicketFilter(
        page=page,
        limit=limit,
        status=status,
        priority=priority,
        search=search,
        sort_by=sort_by,
        order=order,
    )


@router.get(
    "/",
    response_model=PaginatedResponse[TicketResponse],
)
def get_tickets(
    filters: TicketFilter = Depends(get_ticket_filter),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_all_tickets(
        db=db,
        current_user=current_user,
        page=filters.page,
        limit=filters.limit,
        status=filters.status,
        priority=filters.priority,
        search=filters.search,
        sort_by=filters.sort_by,
        order=filters.order,
    )


@router.get(
    "/{ticket_id}",
    response_model=TicketResponse,
)
def get_ticket(
    ticket_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    ticket = get_ticket_by_id(
        db=db,
        ticket_id=ticket_id,
        current_user=current_user,
    )

    if ticket is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket not found.",
        )

    return ticket


@router.put(
    "/{ticket_id}",
    response_model=TicketResponse,
)
def update_existing_ticket(
    ticket_id: int,
    ticket_update: TicketUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    ticket = get_ticket_by_id(
        db=db,
        ticket_id=ticket_id,
        current_user=current_user,
    )

    if ticket is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket not found.",
        )

    return update_ticket(
        db=db,
        ticket=ticket,
        ticket_update=ticket_update,
    )


@router.delete(
    "/{ticket_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_existing_ticket(
    ticket_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    ticket = get_ticket_by_id(
        db=db,
        ticket_id=ticket_id,
        current_user=current_user,
    )

    if ticket is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket not found.",
        )

    delete_ticket(
        db=db,
        ticket=ticket,
    )

    return None
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.core.websocket import ws_manager
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
async def create_new_ticket(
    ticket: TicketCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    created = create_ticket(
        db=db,
        ticket=ticket,
        current_user=current_user,
    )
    # Broadcast event in real time to connected sessions
    try:
        data = TicketResponse.model_validate(created).model_dump(mode="json")
        await ws_manager.broadcast("TICKET_CREATED", data, target_user_id=created.owner_id)
    except Exception as e:
        # Non-blocking for client response
        pass

    return created


def get_ticket_filter(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    status: TicketStatus | None = Query(None),
    priority: TicketPriority | None = Query(None),
    category: str | None = Query(None),
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
        category=category,
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
        category=filters.category,
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
async def update_existing_ticket(
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

    updated = update_ticket(
        db=db,
        ticket=ticket,
        ticket_update=ticket_update,
    )

    # Broadcast event in real time to connected sessions
    try:
        data = TicketResponse.model_validate(updated).model_dump(mode="json")
        await ws_manager.broadcast("TICKET_UPDATED", data, target_user_id=updated.owner_id)
    except Exception:
        pass

    return updated


@router.delete(
    "/{ticket_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_existing_ticket(
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

    owner_id = ticket.owner_id
    delete_ticket(
        db=db,
        ticket=ticket,
    )

    # Broadcast event in real time to connected sessions
    try:
        await ws_manager.broadcast("TICKET_DELETED", {"id": ticket_id}, target_user_id=owner_id)
    except Exception:
        pass

    return None
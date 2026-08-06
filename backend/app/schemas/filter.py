from typing import Literal

from pydantic import BaseModel, Field

from app.models.ticket import TicketPriority, TicketStatus


class TicketFilter(BaseModel):
    page: int = Field(default=1, ge=1)
    limit: int = Field(default=10, ge=1, le=100)

    status: TicketStatus | None = None
    priority: TicketPriority | None = None

    search: str | None = None

    sort_by: Literal[
        "created_at",
        "priority",
        "status",
        "title",
    ] = "created_at"

    order: Literal[
        "asc",
        "desc",
    ] = "desc"
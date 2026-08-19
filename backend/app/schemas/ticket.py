from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.models.ticket import TicketPriority, TicketStatus


from app.schemas.user import UserResponse


class TicketBase(BaseModel):
    title: str
    description: str | None = None
    priority: TicketPriority = TicketPriority.MEDIUM
    category: str | None = "Support"


class TicketCreate(TicketBase):
    pass


class TicketUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    status: TicketStatus | None = None
    priority: TicketPriority | None = None
    category: str | None = None


class TicketResponse(TicketBase):
    id: int
    status: TicketStatus
    created_at: datetime
    owner_id: int
    owner: UserResponse | None = None

    model_config = ConfigDict(from_attributes=True)
from datetime import datetime
from enum import Enum
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, Enum as SQLEnum, ForeignKey, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.user import User


class TicketStatus(Enum):
    OPEN = "Open"
    IN_PROGRESS = "In Progress"
    CLOSED = "Closed"


class TicketPriority(Enum):
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"


class Ticket(Base):
    __tablename__ = "tickets"

    id: Mapped[int] = mapped_column(primary_key=True)

    title: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    status: Mapped[TicketStatus] = mapped_column(
        SQLEnum(TicketStatus),
        default=TicketStatus.OPEN,
        nullable=False,
    )

    priority: Mapped[TicketPriority] = mapped_column(
        SQLEnum(TicketPriority),
        default=TicketPriority.MEDIUM,
        nullable=False,
    )

    category: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
        default="Support",
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    owner_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        nullable=False,
    )

    owner: Mapped["User"] = relationship(
        back_populates="tickets",
    )
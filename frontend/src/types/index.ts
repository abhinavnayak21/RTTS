export type UserRole = 'admin' | 'customer';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}

export type TicketStatus = 'Open' | 'In Progress' | 'Closed';
export type TicketPriority = 'Low' | 'Medium' | 'High';

export interface Ticket {
  id: number;
  title: string;
  description?: string | null;
  status: TicketStatus;
  priority: TicketPriority;
  created_at: string;
  owner_id: number;
  owner?: User;
}

export interface TicketCreatePayload {
  title: string;
  description?: string;
  priority?: TicketPriority;
}

export interface TicketUpdatePayload {
  title?: string;
  description?: string;
  status?: TicketStatus;
  priority?: TicketPriority;
}

export interface TicketFilterParams {
  page?: number;
  limit?: number;
  status?: TicketStatus | '';
  priority?: TicketPriority | '';
  search?: string;
  sort_by?: 'created_at' | 'priority' | 'status' | 'title';
  order?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  total: number;
  page: number;
  limit: number;
  items: T[];
}

export interface AdminStats {
  total: number;
  by_status: Record<TicketStatus, number>;
  by_priority: Record<TicketPriority, number>;
}

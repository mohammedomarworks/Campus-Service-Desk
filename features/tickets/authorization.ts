type Viewer = {
  id: string;
  role: string;
};

type TicketAccessRecord = {
  reporterId: string;
  assignedStaffId: string | null;
};

export function canCreateTicket(role: string) {
  return role === "STUDENT";
}

export function canListStudentTickets(role: string) {
  return role === "STUDENT";
}

export function canViewTicket(
  viewer: Viewer,
  ticket: TicketAccessRecord,
) {
  if (viewer.role === "ADMIN") {
    return true;
  }

  if (
    viewer.role === "STUDENT" &&
    ticket.reporterId === viewer.id
  ) {
    return true;
  }

  if (
    viewer.role === "STAFF" &&
    ticket.assignedStaffId === viewer.id
  ) {
    return true;
  }

  return false;
}
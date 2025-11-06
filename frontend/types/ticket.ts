export interface Ticket {
  id: number;
  user_id: number;
  title: string;
  flag: number; // Status: 0=Open, 1=In Progress, 2=Resolved, 3=Closed
  created_at: string;
}

export interface SupportMessage {
  id: number;
  ticket_id: number;
  user_id: number;
  title: string;
  content: string; // longblob content
  filename?: string;
  created_at: string;
}

export interface TicketWithMessages extends Ticket {
  messages: SupportMessage[];
  user?: {
    firstname: string;
    lastname: string;
    email: string;
  };
}

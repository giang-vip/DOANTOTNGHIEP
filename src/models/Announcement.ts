export interface AdminAnnouncementResponse {
  id: number;
  title: string;
  content: string;
  recipientGroup: string;
  sender: string;
  createdAt: string;
}

export interface AdminAnnouncementRequest {
  title: string;
  content: string;
  recipientGroup: string;
}

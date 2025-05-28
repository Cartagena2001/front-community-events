export interface Event {
  id?: number;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  organizer_id: number;
  created_at?: string;
}
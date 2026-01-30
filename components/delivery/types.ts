export interface ChecklistItem {
  id: string;
  label: string;
  quantity: number;
}

export interface DeliveryStop {
  id: string;
  type: "PICKUP" | "DROPOFF";
  locationName: string;
  address: string;
  time: string;
  contactName?: string;
  contactPhone?: string;
  completed: boolean;
  prepStatus?: "READY" | "PREPARING";
  photoUrl?: string;
  items?: ChecklistItem[];
}

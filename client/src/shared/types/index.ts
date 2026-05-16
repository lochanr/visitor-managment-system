export type Visitor = {
  id: number;
  name: string;
  phone: string;
  photoBase64: string;
  organizationName: string;
  idProofNumber?: string;
  vehicleNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export type Host = {
  id: number;
  name: string;
  email: string;
  role: string;
}

export type Visit = {
  id: number;
  visitId: string;
  visitorId: number;
  visitor: Visitor;
  hostId: number;
  host: Host;
  department: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CHECKED_IN' | 'CHECKED_OUT';
  qrValue?: string;
  inTime?: string;
  outTime?: string;
  createdAt: string;
  approvedAt?: string;
  rejectedAt?: string;
}

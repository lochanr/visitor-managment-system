export interface Visit {
  id: number;
  visitId: string;
  phone: string;
  visitorName: string;
  photoBase64: string;
  organizationName: string;
  personToVisit: string;
  department: string;
  reason: string;
  idProofNumber?: string;
  vehicleNumber?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CHECKED_IN' | 'CHECKED_OUT';
  qrValue?: string;
  inTime?: string;
  outTime?: string;
  createdAt: string;
  approvedAt?: string;
  rejectedAt?: string;
}

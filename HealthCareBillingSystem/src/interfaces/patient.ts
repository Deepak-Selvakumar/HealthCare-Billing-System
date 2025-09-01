export interface Patient {
  id: number;
  name: string;
  firstName: string;
  lastName: string;
  age: number;
  dateOfBirth: string;
  gender: string;
  phone: string;
  email: string;
  address: string;
  insuranceProvider: string;
  insurancePolicyNumber: string;
}

export interface PatientStats {
  total: number;
  byGender: { [key: string]: number };
  byAgeGroup: { [key: string]: number };
  recent: number;
}
 
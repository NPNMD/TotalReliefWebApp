export type UserRole = 'admin' | 'supervisor' | 'facility';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  facilityId?: string;
  phoneNumber?: string;
  photoURL?: string;
  createdAt: any; 
  status: 'online' | 'available' | 'busy' | 'away' | 'offline';
  isActive?: boolean;
  fcmTokens?: string[];
  notificationPreferences?: {
    pushEnabled: boolean;
    emailEnabled: boolean;
    inAppSoundsEnabled: boolean;
    notificationSound?: string;
  };
}

export interface Facility {
  id: string;
  name: string;
  address?: string;
  phone?: string;
}

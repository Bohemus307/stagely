export interface UserMetadata {
  role: string;
  properties: number;
  teamMembers: number;
  activeTasks: number;
}

export interface ProfileData {
  id: string;
  name: string;
  email: string;
  picture?: string;
  user_metadata: UserMetadata;
}

// Mock data for the current user
export const currentUserProfile: ProfileData = {
  id: "user-1",
  name: "John Doe",
  email: "john.doe@example.com",
  picture: "https://randomuser.me/api/portraits/men/43.jpg",
  user_metadata: {
    role: "Property Manager",
    properties: 12,
    teamMembers: 8,
    activeTasks: 24,
  },
};

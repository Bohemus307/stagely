import { ObjectLabel } from "@/hooks/spaces/useUpdatePropertySpace";

// Enums
export enum PropertyStatus {
  Active = "Active",
  Maintenance = "Maintenance",
  Archived = "Archived",
}

export enum IncidentSeverity {
  Low = "Low",
  Medium = "Medium",
  High = "High",
  Critical = "Critical",
}

export enum IncidentStatus {
  Open = "Open",
  InProgress = "In Progress",
  Resolved = "Resolved",
  Closed = "Closed",
}

export enum SpaceType {
  Kitchen = "Kitchen",
  LivingRoom = "LivingRoom",
  Bedroom = "Bedroom",
  Bathroom = "Bathroom",
  DiningRoom = "DiningRoom",
  Office = "Office",
  Garage = "Garage",
  Basement = "Basement",
  Hallway = "Hallway",
  Exterior = "Exterior",
  Attic = "Attic",
  Laundry = "Laundry",
  Closet = "Closet",
  Pantry = "Pantry",
  Mudroom = "Mudroom",
  Foyer = "Foyer",
  Library = "Library",
  GameRoom = "GameRoom",
  HomeTheater = "HomeTheater",
  Gym = "Gym",
  Studio = "Studio",
  GuestRoom = "GuestRoom",
  MasterBedroom = "MasterBedroom",
  Balcony = "Balcony",
  Patio = "Patio",
  Deck = "Deck",
  Yard = "Yard",
  Driveway = "Driveway",
  Other = "Other",
  Unknown = "Unknown",
}

// Interfaces
export interface User {
  id: number;
  auth0Id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  profilePictureUrl?: string;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Property {
  id: number;
  propertyId: number;
  userId: number;
  address: string;
  city: string;
  state?: string;
  zipCode?: string;
  country: string;
  latitude: number;
  longitude: number;
  status: PropertyStatus;
  imageUrl?: string;
  incidentCount: number;
  openIncidentCount: number;
  lastIncidentAt?: string;
  createdAt: string;
  updatedAt: string;

  // Relations
  user?: User;
  inspections?: Inspection[];
  incidents?: Incident[];
  spaces?: PropertySpace[];
}

export interface Inspection {
  id: number;
  propertyId: number;
  title: string;
  description?: string;
  inspectionDate: string;
  createdAt: string;
  updatedAt: string;

  // Relations
  property?: Property;
  photos?: PropertyImage[];
}

export interface PropertySpace {
  id: number;
  propertyId: number;
  name?: string;
  type: SpaceType;
  aiGenerated: boolean;
  featureVector?: any;
  confidenceScore?: number;
  createdAt: string;
  updatedAt: string;
  objectLabels: ObjectLabel[];
  property?: Property;
  images?: PropertyImage[];
}

export interface Location {
  latitude: number;
  longitude: number;
}

export interface PropertyImage {
  transformedUrl: string;
  id: number;
  inspectionId: number;
  spaceId?: number;
  imageUrl: string;
  caption?: string;
  takenAt: string;
  metadata?: any;
  featureVector?: any;
  createdAt: string;
  updatedAt: string;

  // Relations
  inspection?: Inspection;
  space?: PropertySpace;
  similarImages?: ImageSimilarity[];
  comparedTo?: ImageSimilarity[];
  detectedChanges?: ImageChange[];
}

export interface ImageSimilarity {
  id: number;
  baseImageId: number;
  comparedImageId: number;
  similarityScore: number;
  createdAt: string;

  // Relations
  baseImage?: PropertyImage;
  comparedImage?: PropertyImage;
}

export interface ImageChange {
  id: number;
  imageId: number;
  changeType: string;
  description?: string;
  boundingBox?: any;
  confidenceScore: number;
  verified: boolean;
  createdAt: string;
  updatedAt: string;

  // Relations
  image?: PropertyImage;
}

export interface Incident {
  id: number;
  propertyId: number;
  incidentType: string;
  description: string;
  reportedAt: string;
  resolvedAt?: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  createdAt: string;
  updatedAt: string;

  // Relations
  property?: Property;
  images?: IncidentImage[];
}

export interface IncidentImage {
  id: number;
  incidentId: number;
  imageUrl: string;
  caption?: string;
  takenAt: string;
  createdAt: string;
  updatedAt: string;

  // Relations
  incident?: Incident;
}

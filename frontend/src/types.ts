export interface UserType {
    id: number | null,
    createdAt: string,
    updatedAt: string,
    email: string | null,
    username: string,
    firstName: string | null,
    lastName: string | null,
    otherNames: string | null,
    gender: string,
    country: string | null,
    avatarUrl: string | null,
    isAdmin?: boolean,
}

export interface PostType {
    createdAt: string;
    updatedAt: string;
    id: number;
    content?: string | null;
    userId: number;
    user?: UserType,
    files?: Array<FileType>;
    crime?: Array<CrimeType>;
    agency?: Array<AgencyType>;
}

export interface CrimeType {
    createdAt: string;
    updatedAt: string;
    id: number;
    userId: number;
    user?: UserType,
    files?: Array<FileType>;
    landmark: string;
    outcome: string;
    severity: number;
    name: string;
    description: string;
    lat: number;
    lon: number;
    occurredOn: string;
    victim: object;
    suspect: object;
    anonymous: boolean;
    crimeTypeId?: number | null;
    crimeTypeName?: string | null;
    crimeType: CrimeType;
}

export interface AgencyType {
    userId: number;
    user?: UserType,
    files?: Array<FileType>;
    name: string;
    about: string;
    email: string;
    phoneNumber: string;
    description: string;
    verifiedAt: string;
    createdAt: string;
    updatedAt: string;
    id: number;
    type: string;
    agents?: Array<AgentType>;
    avatarUrl: string | null,
}

export interface FileType {
    createdAt: string;
    updatedAt: string;
    id: number;
    url: string;
    path?: string;
    mime: string;
    size: number;
    userId: number;
}

export interface AgentType {
    createdAt?: string;
    updatedAt?: string;
    id: number;
    userId?: number;
    agencyId?: string;
}
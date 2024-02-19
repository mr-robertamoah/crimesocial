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
}

export interface PostType {
    createdAt: string;
    updatedAt: string;
    id: number;
    content?: string | null;
    userId: number;
    user?: UserType,
    files?: Array<FileType>;
    crimes?: Array<FileType>;
    agencies?: Array<FileType>;
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
    verifiedOn: string;
    createdAt: string;
    updatedAt: string;
    id: number;
    type: string;
}

export interface FileType {
    createdAt: string;
    updatedAt: string;
    id: number;
    url: string;
    path: string;
    mime: string;
    size: number;
    userId: number;
}
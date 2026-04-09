import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Metadata {
    definitionBuild: string;
    description: string;
}
export interface Build {
    id: bigint;
    name: string;
    createdAt: Time;
    description: string;
    updatedAt: Time;
    items: Array<Item>;
}
export type Time = bigint;
export interface Item {
    id: bigint;
    cost?: number;
    name: string;
    notes?: string;
    quantity: bigint;
}
export interface BuildData {
    name: string;
    description: string;
}
export interface UserProfile {
    name: string;
}
export enum SortDirection {
    asc = "asc",
    desc = "desc"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addItem(buildId: bigint, item: Item): Promise<bigint>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createBuild(data: BuildData): Promise<bigint>;
    deleteBuild(buildId: bigint): Promise<void>;
    getBuild(buildId: bigint): Promise<Build | null>;
    getBuilds(): Promise<Array<Build>>;
    getBuildsSortedByCreatedAt(direction: SortDirection): Promise<Array<Build>>;
    getBuildsSortedByName(direction: SortDirection): Promise<Array<Build>>;
    getBuildsSortedByUpdatedAt(direction: SortDirection): Promise<Array<Build>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getItems(buildId: bigint): Promise<Array<Item> | null>;
    getItemsSortedByQuantity(buildId: bigint, direction: SortDirection): Promise<Array<Item> | null>;
    getMetadata(): Promise<Metadata | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    removeItem(buildId: bigint, itemId: bigint): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setMetadata(metadata: Metadata): Promise<void>;
    updateBuild(buildId: bigint, data: BuildData, clearItems: boolean): Promise<void>;
    updateItem(buildId: bigint, itemId: bigint, updatedItem: Item): Promise<void>;
}

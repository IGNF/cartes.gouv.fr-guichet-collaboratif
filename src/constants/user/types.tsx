export enum CommunityRole {
    ADMIN = "admin",
    MEMBER = "member",
}

export interface UserAPIData {
    id: number;
    username: string;
    surname: string;
    firstname: string;
    email: string;
    administrator: boolean;
    communities_member: {
        community_id: string;
        role: CommunityRole;
        grids: string[];
    }[];
}
export interface CommunityMember {
    communityId: string;
    role: CommunityRole;
    grids: string[];
}
export type User = {
    id: string;
    username: string;
    firstname: string;
    surname: string;
    email: string;
    communitiesMember: CommunityMember[];
    administrator: boolean;
} | null;

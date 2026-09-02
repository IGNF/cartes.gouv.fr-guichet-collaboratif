export enum CommunityRole {
    ADMIN = "admin",
    MEMBER = "member",
    GESTIONNAIRE = "gestionnaire",
}

export interface UserAPIData {
    id: number;
    username: string;
    surname: string;
    firstname: string;
    email: string;
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
} | null;

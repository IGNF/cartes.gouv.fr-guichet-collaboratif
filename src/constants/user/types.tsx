export interface UserAPIData {
    id: number;
    username: string;
    communities_member: {
        community_id: string;
        role: string;
        grids: string[];
    }[];
}
export interface CommunityMemeber {
    communityId: string;
    role: string;
    grids: string[];
}
export type User = {
    id: string;
    name: string;
    communitiesMember: CommunityMemeber[];
} | null;

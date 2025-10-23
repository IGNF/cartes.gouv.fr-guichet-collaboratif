export interface UserAPIData {
    id: number;
    username: string;
    communities_member: {
        community_id: number;
        role: string;
    }[];
}
export interface CommunityMemeber {
    communityId: number;
    role: string;
}
export type User = {
    id: string;
    name: string;
    communitiesMember: CommunityMemeber[];
} | null;

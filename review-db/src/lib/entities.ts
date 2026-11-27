export enum UserType {
	Banned = -1,
	Normal = 0,
	Admin = 1,
}

/** Kettu's `ReviewType`: a review is by a user, for a server, an advert or from the system. */
export enum ReviewType {
	User = 0,
	Server = 1,
	Support = 2,
	System = 3,
}

export type ReviewDBUser = {
	discordID: string;
	username: string;
	profilePhoto: string;
	type: UserType;
};

export type Review = {
	id: number;
	comment: string | null;
	sender: Omit<ReviewDBUser, 'type'>;
	timestamp: number;
	type?: ReviewType;
};

export type UserReviewsData = {
	message: string;
	reviews: Review[];
	hasNextPage: boolean;
	reviewCount: number;
};

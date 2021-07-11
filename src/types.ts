export type user = {
	id: number;
	email: string;
	full_name: string;
	created_at: Date;
};

export type user_auth = {
	password: string;
	is_activated: boolean;
};

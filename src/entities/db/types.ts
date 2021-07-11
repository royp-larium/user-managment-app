import { user, user_auth } from "../../types";

export interface DBManager {
	create_user(
		user: Omit<user, "created_at" | "id">,
		password: string
	): Promise<number>;
	find_user(email: string): Promise<user | undefined>;
	find_user_auth(email: string): Promise<user_auth | undefined>;
	activate_user(email: string): Promise<void>;
	close(): Promise<void>;
}

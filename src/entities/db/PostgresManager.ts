import knex, { Knex } from "knex";

import { DBManager } from "./types";
import { user, user_auth } from "../../types";

export default class PostgresManager implements DBManager {
	private db: Knex;

	private constructor() {
		this.db = {} as Knex;
	}

	public static async create(url_or_client: string | Knex) {
		const instance = new PostgresManager();

		instance.set_db_client(url_or_client);

		if (!(await instance.check_initialized())) {
			await instance.init_tables();
		}

		return instance;
	}

	private set_db_client(url_or_client: string | Knex) {
		if (typeof url_or_client === "string")
			this.db = knex({
				client: "pg",
				connection: url_or_client,
			});
		else this.db = url_or_client;
	}

	private async check_initialized() {
		return await this.db.schema.hasTable("users_table");
	}

	private async init_tables() {
		await this.db.schema
			.createTable("users_table", (table) => {
				table.increments("id");
				table.string("email").unique().notNullable();
				table.string("full_name").notNullable();
				table
					.timestamp("created_at")
					.defaultTo(this.db.fn.now())
					.notNullable();

				table.index("email", "email_unique", "unique");
			})
			.createTable("users_credentials", (table) => {
				table.increments("id");
				table.string("password").notNullable();
				table.boolean("is_activated").defaultTo(false).notNullable();
				table
					.integer("user_id")
					.unsigned()
					.references("users_table.id")
					.notNullable();

				table.index("user_id", "user_id_unique", "unique");
			});
	}

	public async create_user(
		user: Omit<user, "created_at" | "id">,
		password: string
	) {
		const id: number = (
			await this.db.insert(user).returning("id").into("users_table")
		)[0];
		this.insert_user_auth(id, password);
		return id;
	}

	private async insert_user_auth(user_id: number, password: string) {
		await this.db
			.insert({
				password,
				user_id,
			})
			.into("users_credentials");
	}

	public async find_user(email: string): Promise<user | undefined> {
		return await this.db
			.select()
			.from("users_table")
			.where({ email })
			.first();
	}

	public async find_user_auth(email: string): Promise<user_auth | undefined> {
		const res = await this.find_user(email);
		if (res === undefined) return undefined;
		const user_id = res.id;

		const auth = await this.db
			.select()
			.from("users_credentials")
			.where({ user_id })
			.first();
		auth.is_activated = Boolean(parseInt(auth.is_activated));

		return auth;
	}

	public async activate_user(email: string) {
		const res = await this.find_user(email);
		if (res === undefined) return undefined;
		const user_id = res.id;

		await this.db.where({ user_id }).update({ is_activated: true });
	}

	public async close() {
		await this.db.destroy();
	}
}

import PostgresManager from "../../../src/entities/db/PostgresManager";

import { IMemoryDb, newDb } from "pg-mem";
import { Knex } from "knex";

import { user, user_auth } from "../../../src/types";

let db: PostgresManager;
let client: Knex;

let mem: IMemoryDb;

beforeEach(async () => {
	mem = newDb();
	client = await mem.adapters.createKnex();
	db = await PostgresManager.create(client);
});

async function find_user_by_id(user_id: number): Promise<user | undefined> {
	return await client
		.select()
		.from("users_table")
		.where({ id: user_id })
		.first();
}

async function find_user_auth(user_id: number): Promise<user_auth | undefined> {
	return await client
		.select()
		.from("users_credentials")
		.where({ user_id })
		.first();
}

async function create_mock_user(email: string) {
	return await db.create_user(
		{
			email: email,
			full_name: "Luke Skywalker",
		},
		"hello"
	);
}

describe("PostgreSQL Manager", () => {
	it("initializes db tables", async () => {
		const tables = {
			users_table: ["id", "full_name", "email", "created_at"],
			users_credentials: ["id", "password", "is_activated", "user_id"],
		};

		Object.entries(tables).forEach(async ([table, fields]) => {
			expect(await client.schema.hasTable(table)).toBe(true);

			fields.forEach(async (field) =>
				expect(await client.schema.hasColumn(table, field))
			);
		});
	});

	it("returns undefined when not finding a user", async () => {
		const user = await db.find_user("cdddccds");
		expect(user).toBe(undefined);
	});

	it("finds existing user successfully", async () => {
		const user = {
			email: "ascdcsdcsdc",
			full_name: "dcscs",
		};

		await client.insert(user).into("users_table");

		expect(await db.find_user(user.email)).toMatchObject(user);
	});

	it("returns undefined when not finding a user credentials", async () => {
		const user = await db.find_user_auth("cdddccds");
		expect(user).toBe(undefined);
	});

	it("finds existing user credentials successfully", async () => {
		const user = {
			email: "ascdcsdcsdc",
			full_name: "dcscs",
		};
		const auth = {
			password: "csdcsdc",
			is_activated: false,
			user_id: 1,
		};

		await client.insert(user).into("users_table");
		await client.insert(auth).into("users_credentials");

		expect(await db.find_user_auth(user.email)).toMatchObject(auth);
	});

	it("creates a user successfully", async () => {
		const user_id = await create_mock_user("1");
		const res = (await find_user_by_id(user_id!)) as user;
		const auth = (await find_user_auth(user_id!)) as user_auth;

		expect(res).toMatchObject({
			email: "aaa1@aaa.com",
			full_name: "Luke Skywalker",
			id: 1,
		});
		expect(res.created_at).toBeInstanceOf(Date);
		expect(auth).toMatchObject({
			password: "hello",
			user_id: 1,
			is_activated: "0",
		});
	});

	it("returns error when creating user with a used email", async () => {
		await create_mock_user("1");
		await expect(create_mock_user("1")).rejects.toThrow();
	});

	it("should activate users", async () => {
		const user_id = await create_mock_user("1");
		await db.activate_user("1");

		expect(await find_user_by_id(user_id)).toMatchObject({
			is_activated: true,
		});
	});
});

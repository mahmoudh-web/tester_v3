import * as dotenv from "dotenv"
dotenv.config()

import { MongoClient } from "mongodb"
import * as bson from "bson"

const database = () => {
	const client = new MongoClient(process.env.DATABASE_URL, {
		pkFactory: { createPk: () => new bson.UUID().toBinary() },
	})
	const db = client.db("binance")

	return { client, db }
}

const connect = async client => {
	await client.connect()

	// Establish and verify connection
	await client.db("admin").command({ ping: 1 })
	console.log("Connected successfully to db server")
}

const disconnect = async client => {
	await client.close()
	console.log("Disconnected from db server")
}

export { database, connect, disconnect }

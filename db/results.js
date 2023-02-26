import { database } from "./db.js"
import { chunk } from "lodash-es"
const { db } = database()

const storeResults = async results => {
	const resultsCollection = db.collection("results")
	const data = await resultsCollection.insertOne(results)
	return data
}

const storeTransactions = async transactions => {
	const transactionsCollection = db.collection("results_transactions")
	const chunked = chunk(transactions, 5000)

	for await (let chunk of chunked) {
		await transactionsCollection.insertMany(chunk)
	}
}

export { storeTransactions, storeResults }

// Load environment variables
import * as dotenv from "dotenv"
import { createTests } from "./candles/createTests.js"
dotenv.config()

// import libraries
import { database, connect, disconnect } from "./db/db.js"
import { psar_macd } from "./testers/psar_macd.js"
/******************** FUNCTIONS */
const { client, db } = database()
await connect(client)
const testsCollection = db.collection("tests")

let processing = false
const helper = process.env.HELPER

// create tests
const testsCount = await testsCollection.countDocuments({})
if (testsCount === 0 && helper === "false") {
	processing = true
	await createTests()
	processing = false
}

// run tests
const runTest = async () => {
	processing = true
	const newTest = await testsCollection.findOne({
		active: false,
		// interval: "1h",
	})
	if (!newTest) {
		processing = false
		return
	}

	await testsCollection.updateOne(
		{ _id: newTest._id },
		{ $set: { active: true } }
	)
	await psar_macd(newTest)
	await testsCollection.deleteOne({ _id: newTest._id })
	processing = false
}

await runTest()
setInterval(runTest, 5000)

// await psar_macd()
// disconnect from db
// await disconnect(client)

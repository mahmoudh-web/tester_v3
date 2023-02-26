import { chunk } from "lodash-es"
import { database } from "../db/db.js"

const createTests = async () => {
	const { db } = database()

	const instruments = []
	const intervals = ["1m", "3m", "5m", "15m", "1h"]
	const psar_increments = [0.02, 0.1, 0.15, 0.2]
	const bollinger_periods = [2, 4, 6, 8, 10, 12, 14, 16, 18, 20]
	const bollinger_deviations = [0.5, 1]

	const tests = []

	// get instruments
	const instrumentsColl = db.collection("instruments")
	const instrumentPointer = instrumentsColl
		.find({ quoteAsset: "USDT", status: "TRADING", download: true })
		.sort({ symbol: 1 })
		.project({ symbol: 1, _id: -1 })
	await instrumentPointer.forEach(instrument =>
		instruments.push(instrument.symbol)
	)

	if (!instruments.length) {
		console.log("No instruments to run tests on")
		return
	}

	let counter = 1
	instruments.forEach(instrument => {
		intervals.forEach(interval => {
			psar_increments.forEach(increment => {
				for (let psar_max = 0.2; psar_max <= 0.6; psar_max += 0.1) {
					for (let macd_long = 5; macd_long <= 15; macd_long++) {
						for (
							let macd_short = 2;
							macd_short <= 8;
							macd_short++
						) {
							if (
								psar_max > increment &&
								macd_short < macd_long * 0.6
							) {
								const test = {
									symbol: instrument,
									interval: interval,
									active: false,
									settings: {
										psar: {
											increment: increment,
											max: psar_max,
										},
										macd: {
											short: macd_short,
											long: macd_long,
											signal: 9,
										},
									},
								}
								tests.push(test)
								console.log(
									`created test #${counter.toLocaleString(
										"en-GB"
									)}`
								)
								counter++
							}
						}
					}
				}
			})
		})
	})

	console.log(`${tests.length.toLocaleString("en-GB")} tests`)
	const testsCollection = db.collection("tests")
	const chunked = chunk(tests, 5000)

	let x = 1
	for await (let set of chunked) {
		await testsCollection.insertMany(set)
		console.log(`Inserted ${x} of ${chunked.length} chunks`)
		x++
	}
}

export { createTests }

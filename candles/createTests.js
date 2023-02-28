import { chunk } from "lodash-es"
import { database } from "../db/db.js"

const createTests = async () => {
	const { db } = database()

	const instruments = []
	const intervals = ["1m", "3m", "5m"]
	const psar_increments = [0.2, 0.3]
	const psar_maxs = [0.4, 0.5]
	const bollinger_periods = [2, 3, 5, 8]
	const bollinger_deviations = [0.5, 1]
	const macd_longs = [8, 12, 20]
	const macd_shorts = [2, 5, 8]

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
			psar_increments.forEach(psar_increment => {
				psar_maxs.forEach(psar_max => {
					macd_longs.forEach(macd_long => {
						macd_shorts.forEach(macd_short => {
							bollinger_periods.forEach(bollinger_period => {
								bollinger_deviations.forEach(
									bollinger_deviation => {
										if (macd_short < macd_long) {
											const test = {
												symbol: instrument,
												interval: interval,
												active: false,
												settings: {
													psar: {
														increment:
															psar_increment,
														max: psar_max,
													},
													macd: {
														short: macd_short,
														long: macd_long,
														signal: 9,
													},
													bollinger: {
														period: bollinger_period,
														deviation:
															bollinger_deviation,
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
								)
							})
						})
					})
				})
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

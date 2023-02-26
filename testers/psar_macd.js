import { database } from "../db/db.js"
import * as indicators from "../candles/indicators.js"
import { addIndicatorData } from "../candles/addIndicatorData.js"
import { DateTime } from "luxon"
import { buyAmount, sellAmount } from "../candles/trade.js"
import { storeResults, storeTransactions } from "../db/results.js"
const { db } = database()

const psar_macd = async test => {
	console.log(test)

	// get candles
	const candles = []

	const startDate = DateTime.now()
		.minus({ days: 90 })
		.startOf("day")
		.setZone("utc")

	const candleCollection = db.collection(`kline_${test.interval}s`)
	await candleCollection
		.find({ symbol: test.symbol, startTime: { $gte: startDate.ts } })
		.sort({ startTTime: 1 })
		.forEach(candle => candles.push(candle))

	console.log(candles.length)

	// apply indicators

	const psar = indicators.psar(candles, test.settings.psar)
	const macd = indicators.macd(candles, test.settings.macd)
	const candleData = addIndicatorData(
		candles,
		{ name: "psar", data: psar },
		{ name: "macd_line", data: macd.macdLine },
		{ name: "macd_signal", data: macd.macdSignal },
		{ name: "macd_histogram", data: macd.histogram }
	)

	// run strategy
	// buy when macd line & signal negative, macd histogram positive, psar below low
	// sell when macd line & signal positive, macd histogram negative, psar above high

	let usdt_balance = 100
	let token_balance = 0
	let losing = 0
	let winning = 0
	const transactions = []

	candleData.forEach(async candle => {
		if (token_balance > 0) {
			// look for sell
			if (sell(candle)) {
				const amount = sellAmount(candle.close, token_balance)
				usdt_balance += amount
				token_balance = 0
				if (amount <= 10) losing++
				else if (amount > 10) winning++
				console.log(
					`${candle.startTimeISO} - SELL USDT: ${usdt_balance}, ${test.symbol}: ${token_balance}`
				)
				transactions.push({
					symbol: test.symbol,
					interval: test.interval,
					time: candle.startTime,
					timeISO: candle.startTimeISO,
					direction: "sell",
					amount,
					price: candle.close,
				})
			}
		} else {
			// look for buy
			if (buy(candle)) {
				usdt_balance -= 10
				const amount = buyAmount(candle.open, 10)
				token_balance += amount
				console.log(`${candle.startTimeISO} - BUY USDT`)
				transactions.push({
					testId: test._id,
					symbol: test.symbol,
					interval: test.interval,
					time: candle.startTime,
					timeISO: candle.startTimeISO,
					direction: "buy",
					amount,
					price: candle.open,
				})
			}
		}
	})

	console.log(
		`Final USDT: ${usdt_balance}, ${test.symbol.replace(
			"USDT",
			""
		)}: ${token_balance}`
	)
	const total = winning + losing
	console.log(`Winning Trades: ${winning}, Losing Trades: ${losing}`)
	console.log(
		`Win Rate: ${((winning / total) * 100).toFixed(2)}, Lose Rate: ${(
			(losing / total) *
			100
		).toFixed(2)}`
	)
	console.log(`Profit: ${usdt_balance - 100}`)

	const results = {
		testId: test._id,
		symbol: test.symbol,
		interval: test.interval,
		usdt_balance,
		token_balance,
		winning_trades: winning,
		losing_trades: losing,
		win_rate: Number(((winning / total) * 100).toFixed(2)),
		lose_rate: Number(((losing / total) * 100).toFixed(2)),
		profit: usdt_balance - 100,
	}

	await storeResults(results)
	await storeTransactions(transactions)
}

function buy(candle) {
	const { psar, macd_line, macd_signal, macd_histogram, low } = candle
	return macd_line < 0 && macd_signal < 0 && macd_histogram > 0 && psar < low
}

function sell(candle) {
	const { psar, macd_line, macd_signal, macd_histogram, high } = candle
	return macd_line > 0 && macd_signal > 0 && macd_histogram < 0 && psar > high
}

export { psar_macd }

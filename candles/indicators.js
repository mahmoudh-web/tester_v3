import tulind from "tulind"
import { formatCandles } from "./formatCandles.js"

const macd = (candles, settings) => {
	const { open, high, low, close, volume } = formatCandles(candles)
	const macdLine = []
	const macdSignal = []
	const histogram = []

	tulind.indicators.macd.indicator(
		[close],
		[settings.short, settings.long, settings.signal],
		(err, results) => {
			if (err) console.log(err)
			results[0].forEach(res => macdLine.push(res))
			results[1].forEach(res => macdSignal.push(res))
			results[2].forEach(res => histogram.push(res))
		}
	)
	return { macdLine, macdSignal, histogram }
}

const psar = (candles, settings) => {
	const { open, high, low, close, volume } = formatCandles(candles)
	const output = []

	tulind.indicators.psar.indicator(
		[high, low],
		[settings.increment, settings.max],
		(err, results) => {
			if (err) console.log(err)
			results[0].forEach(res => output.push(res))
		}
	)

	return output
}

const bollinger = (candles, settings) => {
	const { open, high, low, close, volume } = formatCandles(candles)
	console.log(settings)

	const upper = []
	const lower = []
	const middle = []

	tulind.indicators.bbands.indicator(
		[close],
		[settings.period, settings.deviation],
		(err, results) => {
			if (err) console.log(err)
			results[0].forEach(res => lower.push(res))
			results[1].forEach(res => middle.push(res))
			results[2].forEach(res => upper.push(res))
		}
	)

	return { lower, middle, upper }
}

export { macd, psar, bollinger }

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

export { macd, psar }

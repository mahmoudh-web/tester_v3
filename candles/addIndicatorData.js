import { reverse, min } from "lodash-es"

const addIndicatorData = (candles, ...data) => {
	const candleData = reverse(candles)
	const lengths = []

	data.forEach(indicator => {
		const indicatorData = reverse(indicator.data)
		const name = indicator.name

		lengths.push(indicatorData.length)

		for (let i = 0; i < indicatorData.length; i++) {
			candleData[i][name] = indicatorData[i]
		}
	})

	const trimTo = min(lengths)

	do {
		candleData.pop()
	} while (candleData.length > trimTo)

	const cleanData = []
	candleData.forEach(candle => {
		const data = {
			startTime: candle.startTime,
			closeTime: candle.closeTime,
			startTimeISO: candle.startTimeISO,
			closeTimeISO: candle.closeTimeISO,
			open: candle.open,
			high: candle.high,
			low: candle.low,
			close: candle.close,
			volume: candle.volume,
			symbol: candle.symbol,
			psar: candle.psar,
			macd_line: candle.macd_line,
			macd_signal: candle.macd_signal,
			macd_histogram: candle.macd_histogram,
			bollinger_upper: candle.bollinger_upper,
			bollinger_middle: candle.bollinger_middle,
			bollinger_lower: candle.bollinger_lower,
		}

		cleanData.push(data)
	})
	return reverse(candleData)
}

export { addIndicatorData }

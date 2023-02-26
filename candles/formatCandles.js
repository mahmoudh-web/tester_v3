const formatCandles = candles => {
	const open = []
	const high = []
	const low = []
	const close = []
	const volume = []

	candles.forEach(candle => {
		open.push(candle.open)
		high.push(candle.high)
		low.push(candle.low)
		close.push(candle.close)
		volume.push(candle.volume)
	})

	return { open, high, low, close, volume }
}

export { formatCandles }

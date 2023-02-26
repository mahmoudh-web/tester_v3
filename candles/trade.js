const fees = 0.001

const buyAmount = (price, amount) => {
	return (amount / price) * (1 - fees)
}

const sellAmount = (price, amount) => {
	return price * amount * (1 - fees)
}

export { buyAmount, sellAmount }

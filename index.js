'use strict';

const EventEmitter = require('eventemitter');

module.exports = ByteStream;

/*
 * FIFO infinite byte-stream
 *
 * Write arbitrary amounts of data into the buffer as one or more blocks (of
 * various lengths).  Read arbitrary amounts of data from the buffer where each
 * read either returns a single buffer with length in the given range, or
 * returns null if insufficient data is in the buffer.
 */

ByteStream.prototype = new EventEmitter();
function ByteStream() {
	/*
	 * Note: shift/unshift are O(N), but we use them anyway as JS fails to
	 * provide a deque
	 */
	EventEmitter.call(this);
	const series = [];
	let length = 0;
	const write = buf => {
		if (buf.length !== 0) {
			series.push(buf);
			length += buf.length;
		}
		this.emit('data', length);
	};
	const read = (minData, maxData = -1) => {
		if (maxData === -1) {
			maxData = minData;
		}
		if (maxData < minData) {
			throw new Error('Maximum is less than minimum');
		}
		if (minData < 0) {
			throw new Error('Attempted to read negative amount of data');
		}
		if (length < minData || length === 0) {
			return null;
		}
		const resultLength = Math.min(maxData, length);
		/* Can skip zero-initialising the buffer since we fill it anyway */
		const result = Buffer.alloc(resultLength);
		let bytesRemaining = resultLength;
		let bytesRead = 0;
		while (bytesRemaining > 0) {
			let next = series[0];
			if (bytesRemaining >= next.length) {
				series.shift();
			} else {
				series[0] = next.slice(bytesRemaining);
				next = next.slice(0, bytesRemaining);
			}
			next.copy(result, bytesRead);
			bytesRemaining -= next.length;
			bytesRead += next.length;
		}
		length -= bytesRead;
		return result;
	};
	/* Buffer access */
	this.write = write;
	this.read = read;
	/* Info */
	this.getBufferCount = () => series.length;
	this.getLength = () => length;
}

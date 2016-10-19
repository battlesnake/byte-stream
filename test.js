const chai = require('chai');
const assert = chai.assert;
const expect = chai.expect;
const describe = global.describe;
const it = global.it;

const ByteStream = require('.');

describe('Byte buffer', () => {
	it('should read and write fixed-size data blocks', () => {
		const bs = new ByteStream();
		bs.write(Buffer.from('abc '));
		bs.write(Buffer.from('123 '));
		expect(bs.read(4).toString()).to.equal('abc ');
		expect(bs.read(4).toString()).to.equal('123 ');
	});
	it('should read and write matching-size data blocks', () => {
		const bs = new ByteStream();
		bs.write(Buffer.from('abc '));
		bs.write(Buffer.from('12345 '));
		expect(bs.read(4).toString()).to.equal('abc ');
		expect(bs.read(6).toString()).to.equal('12345 ');
	});
	it('should split a big block', () => {
		const bs = new ByteStream();
		expect(bs.read(0)).to.equal(null);
		bs.write(Buffer.from('here is a big block'));
		expect(bs.read(5).toString()).to.equal('here ');
		expect(bs.read(5).toString()).to.equal('is a ');
		expect(bs.read(4).toString()).to.equal('big ');
		expect(bs.read(5, 10).toString()).to.equal('block');
	});
	it('should join small blocks', () => {
		const bs = new ByteStream();
		expect(bs.read(0)).to.equal(null);
		bs.write(Buffer.from('small'));
		bs.write(Buffer.from(' '));
		bs.write(Buffer.from('block'));
		expect(bs.read(0, 11).toString()).to.equal('small block');
	});
	it('should split and join as needed', () => {
		const bs = new ByteStream();
		expect(bs.read(0)).to.equal(null);
		bs.write(Buffer.from('alpha beta '));
		bs.write(Buffer.from('gamma'));
		expect(bs.read(6).toString()).to.equal('alpha ');
		expect(bs.read(10).toString()).to.equal('beta gamma');
	});
	it('should read and write arbitrary-sized data blocks', () => {
		const bs = new ByteStream();
		bs.write(Buffer.from('potato'));
		bs.write(Buffer.from(' '));
		bs.write(Buffer.from('salad'));
		expect(bs.read(3).toString()).to.equal('pot');
		expect(bs.read(2, 5).toString()).to.equal('ato s');
		expect(bs.read(5)).to.equal(null);
		expect(bs.read(0, 10).toString()).to.equal('alad');
	});
	it('should interleaved read and write arbitrary-sized data blocks', () => {
		const bs = new ByteStream();
		expect(bs.read(0)).to.equal(null);
		bs.write(Buffer.from('potato'));
		expect(bs.read(0)).to.deep.equal(new Buffer(0));
		expect(bs.read(3).toString()).to.equal('pot');
		bs.write(Buffer.from(' '));
		bs.write(Buffer.from('salad'));
		expect(bs.read(2, 5).toString()).to.equal('ato s');
		expect(bs.read(5)).to.equal(null);
		expect(bs.read(0, 10).toString()).to.equal('alad');
	});
});

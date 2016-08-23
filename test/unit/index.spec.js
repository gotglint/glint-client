const chai = require('chai');

const GlintClient = require('../../src/index');

const log = require('intel').getLogger('client.spec');

describe('test the client', function() {
  chai.should();
  const expect = chai.expect;

  before(function() {
    // empty
  });

  after(function() {
    // empty
  });

  it('can create a simple Glint client', function() {
    this.timeout(60000);

    log.info('Beginning test.');

    const input = [...new Array(5).keys()].slice(1);

    const gc = new GlintClient();
    const data = gc.parallelize(input).map((el) => {
      return el + 324;
    }).filter((el, idx) => {
      return !!(el === 325 || idx === 2);
    }).getData();

    expect(data).to.not.be.null;
  });
});

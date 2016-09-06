const chai = require('chai');

const WebSocketChunker = require('../../src/ws-chunker');

const log = require('intel').getLogger('ws-chunker.spec');

describe('test the websocket chunker', function() {
  chai.should();
  const expect = chai.expect;
  let spark;
  const data = [];
  let deserialized = null;

  before(function() {
    // this acts as a mock spark
    spark = {
      write: (_data) => {
        data.push(_data);
      }
    };
  });

  after(function() {
    // empty
  });

  it('can chunk a simple message', function() {
    this.timeout(60000);

    log.info('Beginning test.');

    const input = [...new Array(5).keys()].slice(1);

    const chunker = new WebSocketChunker(1024);
    chunker.registerCallback((_deserialized) => {
      deserialized = _deserialized;
    });
    chunker.sendMessage(spark, input);

    for (const chunk of data) {
      chunker.onMessage(chunk);
    }

    expect(deserialized).to.not.be.null;

    expect(input).to.eql(deserialized);
  });

  it('can chunk a large message', function() {
    this.timeout(60000);

    log.info('Beginning test.');

    const input = [...new Array(500001).keys()].slice(1);

    const chunker = new WebSocketChunker(1024*1000);
    chunker.registerCallback((_deserialized) => {
      deserialized = _deserialized;
    });
    chunker.sendMessage(spark, input);

    for (const chunk of data) {
      chunker.onMessage(chunk);
    }

    expect(deserialized).to.not.be.null;

    expect(input).to.eql(deserialized);
  });
});

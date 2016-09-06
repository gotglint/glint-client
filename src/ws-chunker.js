const intel = require('intel');
const JSONfn = require('jsonfn').JSONfn;
const uuid = require('node-uuid');

intel.basicConfig({
  format: {
    'format': '[%(date)s] %(name)s.%(levelname)s: %(message)s',
    'colorize': true,
  }
});

intel.setLevel(intel.DEBUG);

const log = intel.getLogger('ws-chunker');

const _chunkSize = Symbol('chunkSize');
const _chunks = Symbol('chunks');

const _callback = Symbol('callback');

class WebSocketChunker {
  constructor(chunkSize) {
    this[_chunkSize] = chunkSize;

    this[_chunks] = new Map();
  }

  registerCallback(fn) {
    this[_callback] = fn;
  }

  sendMessage(spark, message) {
    const serializedMessage = JSONfn.stringify(message);
    if (serializedMessage.length > this[_chunkSize]) {
      log.debug('Serialized message is large, chunking it up.');
      const id = uuid.v4();
      spark.write({type: 'start', id: id});
      let i = 0;
      while (i < serializedMessage.length) {
        spark.write({type: 'chunk', id: id, data: serializedMessage.slice(i, i + this[_chunkSize])});
        i = i + this[_chunkSize];
      }
      spark.write({type: 'end', id: id});
    } else {
      log.debug('Serialized message is not too large, sending as one block.');
      spark.write({type: 'fullChunk', data: serializedMessage});
    }
  }

  onMessage(data) {
    switch(data.type) {
      case 'start':
        log.debug('Starting a new chunk for ID ' + data.id);
        this[_chunks].set(data.id, '');
        break;
      case 'chunk':
        log.debug('Adding to an existing chunk for ID ' + data.id);
        const newChunk = this[_chunks].get(data.id) + data.data;
        this[_chunks].set(data.id, newChunk);
        break;
      case 'end':
        const deserialized = JSONfn.parse(this[_chunks].get(data.id));
        this[_chunks].delete(data.id);
        log.debug('WS client rehydrated a stream of chunks.');
        log.verbose('WS client received a message: ', deserialized);

        if (this[_callback]) {
          this[_callback](deserialized);
        }
        break;
      case 'fullChunk':
        const fullChunkDeserialized = JSONfn.parse(data.data);
        log.debug('WS client handled a full chunk.');
        log.verbose('WS client received a message: ', fullChunkDeserialized);

        if (this[_callback]) {
          this[_callback](fullChunkDeserialized);
        }
    }
  }
}

module.exports = WebSocketChunker;

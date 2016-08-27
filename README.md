# Glint Client

## Installing

```bash
npm i @gotglint/glint-client
```

## Using

```nodejs
console.log('Creating Glient client.');
const glintClient = new GlintClient('localhost', 45468);

console.log('Connecting to master.');
glintClient.init().then(() => {
  console.log('Connected to master, creating job.');

  const input = [...new Array(5).keys()].slice(1);

  glintClient.parallelize(input).map(function(el) {
    return el + 324;
  }).filter(function(el, idx) {
    return !!(el === 325 || idx === 2);
  });

  console.log('Submitting job to master.');
  glintClient.run();

  console.log('Waiting for server to response.');
  glintClient.waitForJob().then((result) => {
    console.debug('Job result: ', result);
  }).catch((err) => {
    console.error('Error while waiting for job: ', err);
  });
});
```

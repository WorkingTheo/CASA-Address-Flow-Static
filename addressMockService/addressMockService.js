const express = require('express');
const bodyParser = require('body-parser')

const addressMockService = express();
addressMockService.use(bodyParser.json());

addressMockService.post('/address', (req, res) => {
  const { postcode } = req.body;
  if (!postcode) {
    res.status(400).send({ response: 'error', message: 'postcode is required' });
    return;
  }

  if(postcode === 'IP4 3HT') {
    res.send([
      '64 Zoo Lane, IP4 3HT',
      '65 Zoo Lane, IP4 3HT',
      '66 Zoo Lane, IP4 3HT',
      '67 Zoo Lane, IP4 3HT',
    ]);
  } else if (postcode === 'IP4 3HU') {
    res.send([
      '12 Poopy Scoopy Lane, IP4 3HU'
    ]);
  } else {
    res.send([]);
  }
});

addressMockService.listen(3001, () => {
  console.log('running addressMockService on port 3001');
});

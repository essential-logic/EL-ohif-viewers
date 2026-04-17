const https = require('https');

const req = https.request('https://xyuxiachrjpcrmiephqa.supabase.co/functions/v1/orthanc-proxy/dicom-web/studies', {
  method: 'OPTIONS',
  headers: {
    'Origin': 'http://localhost:3000',
    'Access-Control-Request-Method': 'GET'
  }
}, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log(`BODY: ${data}`));
});

req.on('error', (e) => console.error(e));
req.end();

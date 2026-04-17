import fs from 'fs';

async function testFetch() {
  const targetUrl = 'http://76.13.99.8:8042/dicom-web/studies/1.3.12.2.1107.5.4.3.123456789012345.19950922.121803.6/series/1.3.12.2.1107.5.4.3.123456789012345.19950922.121803.8/instances/1.3.12.2.1107.5.4.3.321890.19960124.162922.29/frames/44';
  
  const headers = new Headers();
  headers.set('Authorization', `Basic ${btoa('admin:admin')}`);
  headers.set('Accept', 'multipart/related; type="application/octet-stream"');
  
  try {
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: headers,
    });
    
    console.log('Status:', response.status);
    for (const [key, value] of response.headers) {
      console.log(`Header - ${key}:`, value);
    }

    if (response.status === 200) {
      console.log('Success!');
    } else {
      console.log('Failed:', await response.text());
    }
  } catch (err) {
    console.error('Fetch threw error:', err.message);
  }
}

testFetch();

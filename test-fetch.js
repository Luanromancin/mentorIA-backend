// test-fetch.js
fetch('https://exqafthzotkkngltweb.supabase.co/rest/v1/')
  .then(r => console.log('Status:', r.status))
  .catch(console.error);
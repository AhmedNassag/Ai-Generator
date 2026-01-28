import express from 'express';
import checkPermissions from './checkPermission.js'; // Use .js extension with import

const app = express();

app.get('/permission', checkPermissions, (req, res) => {
  res.send('This is a protected route!');
});

app.listen(3333, () => {
  console.log('Server running on port 3333');
});

require('dotenv').config()
const app = require('./index');
const PORT = process.env.PORT || 3000;

app.listen(PORT, (err) => {
    if (err) throw err;
    console.log('Server is up and running...');
})

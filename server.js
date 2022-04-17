require('dotenv').config()
const app = require('./index');
const PORT = process.env.PORT;

app.listen(PORT, (err) => {
    if (err) throw err;
    console.log('Server is up and running...');
})

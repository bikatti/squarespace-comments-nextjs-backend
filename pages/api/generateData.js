const cron = require('node-cron');
const fs = require('fs');
const axios = require('axios'); // use axios to make API calls

// Function to get all comments sorted by date and save them into data.json
async function saveData() {
  const allCommentsSortedByDate = await axios.get('/getComments');
  
  fs.writeFile('data.json', JSON.stringify(allCommentsSortedByDate.data), function (err) {
    if (err) {
        console.error(err);
    }
    console.log('Data written to file');
  });
}

// Schedule to run every 30 minutes
cron.schedule('*/30 * * * *', () => {
  saveData();
});
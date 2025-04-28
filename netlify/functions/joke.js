import jokes from './jokes.json';
import axios from 'axios';

console.log(axios.isCancel('something'));

export const handler = async () => {
  
  const sth  = JSON.parse(Buffer.from(process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS, "base64").toString("utf8"))
  console.log(sth);
  
  const randomIndex = Math.floor(Math.random() * jokes.length);
  const randomJoke = jokes[randomIndex];
  return {
    statusCode: 200,
    body: randomJoke,
  };
};
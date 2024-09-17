const { default: axios } = require('axios');
const fs = require('fs');
const path = require('path');

function lerUrlfromTxt(arquivoTxt) {
  return new Promise((resolve, reject) =>{
    fs.readFile(arquivoTxt, 'utf-8', (err, data) => {
      if(err) return reject(err);
      const urls = data.trim().split('\n');
      resolve(urls);
    });
  });
};  

function saveResult(urlReq, data) {
  const urlPath = new URL(urlReq).pathname;
  const fileName = `result-${new URL(urlReq).hostname}${urlPath.replace(/\//g, '-')}.json` //result-jsonplaceholder.typicode.com-posts-X.json
  fs.writeFileSync(path.join(__dirname, fileName), JSON.stringify(data, null, 2));
  console.log('data saved ', fileName);
};

async function fetchData(urlReq) {
  try{
    const response = await axios.get(urlReq);
    saveResult(urlReq, response.data);
  }catch(err){
    console.error('fetchData error ', err.message);
  };
};

async function crawlUrlsBatching(urls, batchSize = 2) {
  for ( let i = 0; i < urls.length; i += batchSize ) {
    const batch = urls.slice(i, i + batchSize);
    await Promise.all(batch.map(fetchData));
  };
};

async function startCrawler(urlReq, batchSize) {
  try{
    const urls = await lerUrlfromTxt(urlReq);
    await crawlUrlsBatching(urls, batchSize);  
  }catch(err){
    console.error('startCrawler error ', err.message);
  };
};

startCrawler('urls.txt', 2);
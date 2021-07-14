const http = require('http');
const url = require('url');
const fs = require('fs');

//top level code, it can by synchronous as its loaded once when we load the app, it couldnt be synch inside of the crateServer callback func!
const tempOverview = fs.readFileSync(
  `${__dirname}/templates/template-overview.html`,
  'utf-8'
);
const tempCard = fs.readFileSync(
  `${__dirname}/templates/template-card.html`,
  'utf-8'
);
const tempProduct = fs.readFileSync(
  `${__dirname}/templates/template-product.html`,
  'utf-8'
);

//replace the template(placeholder) to product variable. /.../g means its gonna replace all of the items, not just the first one, or use replaceAll

const replaceTemplate = (template, product) => {
  let output = template.replace(/{%PRODUCTNAME%}/g, product.productName);
  output = output.replace(/{%PRICE%}/g, product.price);
  output = output.replace(/{%FROM%}/g, product.from);
  output = output.replace(/{%IMAGE%}/g, product.image);
  output = output.replace(/{%ID%}/g, product.id);
  output = output.replace(/{%NUTRIENTS%}/g, product.nutrients);
  output = output.replace(/{%QUANTITY%}/g, product.quantity);
  output = output.replace(/{%DESCRIPTION%}/g, product.description);
  // if it is false, then class not-organic is added
  if (!product.organic)
    output = output.replace(/{%NOT_ORGANIC%}/g, 'not-organic');

  return output;
};
//top level code, reading the file from data.js
const data = fs.readFileSync(`${__dirname}/dev-data/data.json`, 'utf-8');
//parse it into JS array, as it is a string before, we are gonna loop throught this array and for each ofthemreplace the placehlders in the template files
const dataObj = JSON.parse(data);
//Server  callback function is called each time if we have a request
const server = http.createServer((req, res) => {
  //   console.log(req.url);
  //   console.log(url.parse(req.url, true));
  //   const { query, pathName } = url.parse(req.url, true);
  const baseURL = `http://${req.headers.host}`;
  const requestURL = new URL(req.url, baseURL);
  const pathName = requestURL.pathname;
  const query = requestURL.searchParams.get('id');
  // .searchParams returns this: URLSearchParams { 'id' => '1' }
  console.log('baseURL:', baseURL);
  console.log('reguestURL:', requestURL);
  console.log(pathName + ': PATHNAME');
  console.log(query + ': query');
  //Overview page
  if (pathName === '/' || pathName === '/overview') {
    res.writeHead(200, { 'Content-type': 'text/html' });
    // want to show those products, as one big string so we use join('')
    const cardsHtml = dataObj
      .map((el) => replaceTemplate(tempCard, el))
      .join('');
    //     console.log(cardsHtml);

    const output = tempOverview.replace('{%PRODUCT_CARDS%}', cardsHtml);
    res.end(output);

    //product
  } else if (pathName === '/product') {
    res.writeHead(200, { 'Content-type': 'text/html' });
    const product = dataObj[query];
    console.log('PRODUCT' + product);
    const output = replaceTemplate(tempProduct, product);
    res.end(output);
    //api
  } else if (pathName === '/api') {
    res.writeHead(200, { 'Content-type': 'application/json' });
    res.end(data);
    //if error
  } else {
    res.writeHead(404, {
      'Content-type': 'text/html',
    });
    res.end('<h1>Page not found</h1>');
  }
});

server.listen(8000, '127.0.0.1', () => {
  console.log('Listening to request on port 8000');
});

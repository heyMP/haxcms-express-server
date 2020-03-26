// simple node web server that displays hello world
// optimized for Docker image
const path = require('path');
const fs = require('fs');

const express = require('express');
// this example uses express web framework so we know what longer build times
// do and how Dockerfile layer ordering matters. If you mess up Dockerfile ordering
// you'll see long build times on every code change + build. If done correctly,
// code changes should be only a few seconds to build locally due to build cache.

const morgan = require('morgan');
// morgan provides easy logging for express, and by default it logs to stdout
// which is a best practice in Docker. Friends don't let friends code their apps to
// do app logging to files in containers.

var compression = require('compression')
// adds gzip support

// Api
const app = express();

app.use(morgan('common'));

app.use(compression());

// app.use(express.static(path.join(__dirname, 'public'),{index:false,extensions:['html','js','pdf','css','json','pdf','png','jpg','jpeg']}));

app.get('*', function(request, response) {
	// get meta info from site.json
	const sitejsonPath = path.resolve(__dirname, './public', 'site.json');
	const filePath = path.resolve(__dirname, './public', 'index.html');

	const manifest = JSON.parse(fs.readFileSync(sitejsonPath, 'utf8'));
	const activeItem = manifest.items.find(i => {
		const target = `pages${request.originalUrl}/index.html`
		const location = i.location.replace(/\\/g, "");
		return target === location;
	});

	let title;
	let description;
	
	if (activeItem) {
		title = `${manifest.title} | ${activeItem.title}`;
		description = activeItem.description;
	}
	else {
		title = manifest.title;
		description = manifest.description;
	}

	// read in the index.html file
	let data = fs.readFileSync(filePath, 'utf8');
	// replace the special strings with server generated strings
	data = data.replace(/\$PAGE_TITLE/g, title);
	data = data.replace(/\$PAGE_DESCRIPTION/g, description);
	result = data.replace(/\$OG_IMAGE/g, 'https://i.imgur.com/V7irMl8.png');
	response.send(result);
});

app.get('/healthz', function (req, res) {
	// do app logic here to determine if app is truly healthy
	// you should return 200 if healthy, and anything else will fail
	// if you want, you should be able to restrict this to localhost (include ipv4 and ipv6)
  res.send('I am happy and healthy\n');
});


module.exports = app;

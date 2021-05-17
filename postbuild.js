const async = require('async');
const fs = require('fs');
const path = require('path');
const jsmin = require('jsmin').jsmin;

// From: https://stackoverflow.com/a/43728722/342378
function combineFiles(inputFilenames, outputFilename) {
	return new Promise((resolve, reject) => {
		// Read all files in parallel
		async.map(inputFilenames, fs.readFile, (err, results) => {
			if (err) {
				throw err;
			}

			//Write the joined results to destination
			fs.writeFile(outputFilename, results.join('\r\n'), (err) => {
				if (err) {
					throw err;
				}

				console.log('Combined files into ' + outputFilename);
				
				resolve();
			});
		});
	});
}

function fixEnumerable(filename) {
	return new Promise((resolve, reject) => {
		fs.readFile(filename, 'utf8', function (err,data) {
			if (err) {
				throw err;
			}
		  
			data = data.replace(/enumerable[:] false/g, 'enumerable: true');
			fs.writeFile(filename, data, function (err) {
				if (err) {
					throw err;
				}
				
				console.log("Fixed 'enumerable: false' in " + filename);
				
				resolve();
			});
		});
	});
}

function minifyFile(filename) {
	return new Promise((resolve, reject) => {
		fs.readFile(filename, 'utf8', function (err,data) {
			if (err) {
				throw err;
			}
		  
			data = jsmin(data);
			const newFilename = filename.substr(0, filename.lastIndexOf(".")) + ".min.js";
			
			fs.writeFile(newFilename, data, function (err) {
				if (err) {
					throw err;
				}
				
				console.log("Minified " + newFilename);
				
				resolve();
			});
		});
	});
}

Promise.all([
	fixEnumerable(path.resolve('stage', 'common.js')),
	fixEnumerable(path.resolve('stage', 'connections.js')),
	fixEnumerable(path.resolve('stage', 'crt.js')),
	fixEnumerable(path.resolve('stage', 'crtcontrols.js')),
	fixEnumerable(path.resolve('stage', 'filetransfer.js')),
	fixEnumerable(path.resolve('stage', 'ftelnetclient.js')),
	fixEnumerable(path.resolve('stage', 'graph.js'))
]).then(function () {
	Promise.all([
		combineFiles(
			[path.resolve('stage', 'common.js'), path.resolve('stage', 'crt.js'), path.resolve('stage', 'connections.js'), path.resolve('stage', 'ftelnetclient.js')],
			path.resolve('release', 'ftelnet.norip.noxfer.js')),
		combineFiles(
			[path.resolve('include', 'blob.js'), path.resolve('include', 'filesaver.js'), path.resolve('stage', 'common.js'), path.resolve('stage', 'crt.js'), path.resolve('stage', 'connections.js'), path.resolve('stage', 'crtcontrols.js'), path.resolve('stage', 'filetransfer.js'), path.resolve('stage', 'ftelnetclient.js')],
			'release/ftelnet.norip.xfer.js'),
		combineFiles(
			[path.resolve('stage', 'common.js'), path.resolve('stage', 'crt.js'), path.resolve('stage', 'connections.js'), path.resolve('stage', 'graph.js'), path.resolve('stage', 'ftelnetclient.js')],
			path.resolve('release', 'ftelnet.rip.noxfer.js')),
		combineFiles(
			[path.resolve('include', 'blob.js'), path.resolve('include', 'filesaver.js'), path.resolve('stage', 'common.js'), path.resolve('stage', 'crt.js'), path.resolve('stage', 'connections.js'), path.resolve('stage', 'crtcontrols.js'), path.resolve('stage', 'filetransfer.js'), path.resolve('stage', 'graph.js'), path.resolve('stage', 'ftelnetclient.js')],
			path.resolve('release', 'ftelnet.rip.xfer.js'))
	]).then(function () {
		Promise.all([
			minifyFile(path.resolve('release', 'ftelnet.norip.noxfer.js')),
			minifyFile(path.resolve('release', 'ftelnet.norip.xfer.js')),
			minifyFile(path.resolve('release', 'ftelnet.rip.noxfer.js')),
			minifyFile(path.resolve('release', 'ftelnet.rip.xfer.js'))
		]);
	});
});


const parser = require('xml2json');
const fs = require('fs');

async function XML2JSON(pathToXMLFile){
    return await new Promise((resolve, reject) => {
        fs.readFile(pathToXMLFile, 'utf8', function (err,xml) {
            if (err) {
                console.log(err);
                reject();
            }
            resolve(parser.toJson(xml));
        });
    });
}

async function JSON2XML(jsonString){
    return await new Promise((resolve, reject) => {
        resolve(parser.toXml(jsonString));
    });
}

module.exports.XML2JSON = XML2JSON;
module.exports.JSON2XML = JSON2XML;
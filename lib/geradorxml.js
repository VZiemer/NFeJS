var builder = require('xmlbuilder'),
xml2js = require('xml2js'),
ini = require('ini'),
fs = require('fs');

var parseString = xml2js.parseString;
fs.readFile('nf.xml', function (err, data) {
    parseString(data, { explicitArray: false, ignoreAttrs: true }, function (err, result) {
        var xml = result;
        let textoini = ini.stringify(xml);
        fs.writeFile('teste.ini',textoini,function(){
            console.log(xml)
        })
        
    });
});

















var xml = builder.create('nfeProc', { encoding: 'utf-8' })
    .att('xmlns', 'http://www.portalfiscal.inf.br/nfe')
    .att('versao', '3.10')
    .ele('NFe')
    .att('xmlns', 'http://www.portalfiscal.inf.br/nfe')

    .ele('infNFe')
    .att('versao', '3.10')
    .att('Id', '')
    .ele('ide', { 'type': 'git' }, 'git://github.com/oozcitak/xmlbuilder-js.git')
    .end({ pretty: true });

console.log(xml);
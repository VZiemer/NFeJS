'use strict';

var firebird = require('node-firebird'),
    conexao = require('./db');

var Emitente = (function () {
    function Emitente(empresa) {
        return new Promise((resolve, reject) => {
            firebird.attach(conexao, function (err, db) {
                if (err) throw err;
                db.query('select p.crt,c.razao,c.cgc,c.insc,c.endereco,c.bairro,c.cep,c.fone,c.email,ci.nom_cidade,ci.codibge,ci.estado from param p  join cliente c on p.codparc = c.codigo  join cidade ci on c.codcidade = ci.cod_cidade where p.codigo=?', empresa, function (err, result) {
                    if (err) throw err;
                    db.detach(function () {
                        resolve(result[0]);
                    })
                })
            })
        })
    }
    return Emitente;
})();


module.exports = Emitente;

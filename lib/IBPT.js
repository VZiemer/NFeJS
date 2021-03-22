

'use strict';
const SP = require("./tabelas_ibpt/SP.js")
const MG = require("./tabelas_ibpt/MG.js")
const DF = require("./tabelas_ibpt/DF.js")
const GO = require("./tabelas_ibpt/GO.js")
let Tabela = {
    "MG" : MG,
    "SP" : SP,
    "DF" : DF,
    "GO" : GO
}

var IBPT = (function () {
    function IBPT() {
    }
    IBPT.prototype.getIBPT = function (uf,ncm) {
      console.log('uf',uf)
      console.log('ncm',ncm)
        const estado = Tabela[uf];
        console.log (estado);
        const result = estado.find( item => item.codigo === Number(ncm));
        console.log (result);
        this.dados = result;
        return this;
    }
    return IBPT;
})();

module.exports = IBPT;
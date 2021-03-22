'use strict';

var util = require('util'),
    Pessoa = require('./pessoa');

var Emitente = (function () {
    function Emitente() {
        Pessoa.apply(this, arguments);
    }

    util.inherits(Emitente, Pessoa);

    Emitente.prototype.getLogotipo = function () {
        return this._logotipo || '';
    };

    Emitente.prototype.comLogotipo = function (_logotipo) {
        this._logotipo = _logotipo;
        return this;
    };
    Emitente.prototype.comIcmsSimples = function (_icmsSimples){
        this._icmsSimples = _icmsSimples;
        return this;  
    }
    Emitente.prototype.getIcmsSimples = function (){
        return this._icmsSimples || 0;  
    }    
    Emitente.prototype.comCrt = function (_crt) {
        if (typeof _crt !== 'string') {
            _crt = String(_crt);
        }
        if (!_crt.match(/[0-9]{1,3}/g)) {
            throw new Error('CRT do Emitente inválido');
        }
        switch (_crt) {
            case "1":
                this._regimeTributario = "Simples Nacional";
                this._codigoRegimeTributario = '1'
                break;
            case "2":
                this._regimeTributario = "Simples Nacional – excesso de sublimite da receita bruta";
                this._codigoRegimeTributario = '2';
                break;
            default:
                this._regimeTributario = "Regime Normal";
                this._codigoRegimeTributario = '3';
        }
        return this;
    };
    Emitente.prototype.getInscricaoMunicipal = function () {
        return this._inscricaoMunicipal || '';
    };
    Emitente.prototype.getRegimeTributario = function () {
        return this._regimeTributario || '';
    }
    Emitente.prototype.getCodigoRegimeTributario = function () {
        return this._codigoRegimeTributario || '';
    }


    Emitente.prototype.comInscricaoMunicipal = function (_inscricaoMunicipal) {
        this._inscricaoMunicipal = _inscricaoMunicipal;
        return this;
    };

    return Emitente;
})();


module.exports = Emitente;

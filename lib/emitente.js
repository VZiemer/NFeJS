'use strict';

var util = require('util'),
    Pessoa = require('./pessoa');

var Emitente = (function() {
    function Emitente() {
        Pessoa.apply(this, arguments);
    }

    util.inherits(Emitente, Pessoa);

    Emitente.prototype.getLogotipo = function() {
        return this._logotipo || '';
    };

    Emitente.prototype.comLogotipo = function(_logotipo) {
        this._logotipo = _logotipo;
        return this;
    };
    Emitente.prototype.getCrt = function() {
        return this._crt || '';
    };

    Emitente.prototype.comCrt = function(_crt) {
        if (typeof _crt !== 'string'){
            _crt = String(_crt);
        }
        if (!_crt.match(/[0-9]{1,3}/g)) {
            throw new Error('CRT do Emitente inválido');
        }
        switch(_crt) {
            case "1":
                this._regimeTributario = "Simples Nacional";
                break;
            case "2":
            this._regimeTributario = "Simples Nacional – excesso de sublimite da receita bruta";
                break;
            default:
            this._regimeTributario = "Regime Normal";
        }        
        this._crt = _crt;
        return this;
    };
    Emitente.prototype.getInscricaoMunicipal = function() {
        return this._inscricaoMunicipal || '';
    };
    Emitente.prototype.getRegimeTributario = function() {
        return this._regimeTributario || '';
    }
    Emitente.prototype.comInscricaoMunicipal = function(_inscricaoMunicipal) {
        this._inscricaoMunicipal = _inscricaoMunicipal;
        return this;
    };

    return Emitente;
})();


module.exports = Emitente;

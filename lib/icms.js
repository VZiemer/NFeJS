'use strict';

var gammautils = require('gammautils'),
    insert = gammautils.string.insert,
    brasil = require('brasil'),
    ncms = require(brasil.dados.ncmsDicionario),
    cfops = require(brasil.dados.cfopsDicionario),
    removerMascara = brasil.formatacoes.removerMascara,
    Dinheiro = require('./dinheiro'),
    formatarDinheiro = brasil.formatacoes.dinheiro,
    formatarNumero = brasil.formatacoes.numero;

var Icms = (function () {
    function Icms() {

    }
    Icms.prototype.CalculaIcms = function (_prodSt, _regTrib, _ufOri, _ufDest, _destContrib, _cFinal, _baseDeCalculoDoIcms, _aliquotaDoIcms, _prodOrigem) {
        //verifica se a base de calculo é menor que 0
        if (_baseDeCalculoDoIcms < 0) {
            throw new Error('Base de cálculo do icms não pode ser inferior a zero');
        }
        if (_regTrib === "1") {
            // 1- Empresa optante pelo simples nacional
            //TODO: LOCALDECOR
            if (_ufOri === _ufDest) {
                // venda para o mesmo estado 
                this._prodOrigem = _prodOrigem;
                this._CodSituacaoTributaria = _prodSt ? "500" : (_destContrib === 1 ? "101" : "102");
                this._Cfop = _prodSt ? "5405" : "5102";
                this._aliquotaDoIcms = 0;
                this._baseDeCalculoDoIcms = _prodSt ? new Dinheiro(0) : new Dinheiro(_baseDeCalculoDoIcms);
                this._valorDoIcms = new Dinheiro(0);
                this._aliquotaDoIcmsSt = 0;
                this._baseDeCalculoDoIcmsSt = new Dinheiro(0);
                this._valorDoIcmsSt = new Dinheiro(0);
            }
            if (_ufOri !== _ufDest) {
                // venda para outro estado
                this._prodOrigem = _prodOrigem;
                this._CodSituacaoTributaria = _prodSt ? "500" : (_destContrib === 1 ? "101" : "102");
                this._Cfop = _destContrib === 1 ? "6102" : "6108";
                this._aliquotaDoIcms = 0;
                this._baseDeCalculoDoIcms = _prodSt ? new Dinheiro(0) : new Dinheiro(_baseDeCalculoDoIcms);
                this._valorDoIcms = new Dinheiro(0);
                this._aliquotaDoIcmsSt = 0;
                this._baseDeCalculoDoIcmsSt = _prodSt ? new Dinheiro(_baseDeCalculoDoIcms) : new Dinheiro(0);
                this._valorDoIcmsSt = new Dinheiro(0);


                this.pICMSUFDest = ''
            }
        } else if (_regTrib === "2" || _regTrib === "3") {
            // 2- Empresa optante pelo simples nacional
            // 3- Empresa não optante pelo simples nacional (lucro presumido)
            if (_ufOri === _ufDest) {
                // venda para o mesmo estado 
                this._prodOrigem = _prodOrigem;
                this._CodSituacaoTributaria = _prodSt ? "60" : "00";
                this._Cfop = _prodSt ? "5405" : "5102";
                this._aliquotaDoIcms = _prodSt ? "" : _aliquotaDoIcms;
                this._baseDeCalculoDoIcms = _prodSt ? "" : new Dinheiro(_baseDeCalculoDoIcms);
                this._valorDoIcms = _prodSt ? 0 : new Dinheiro(_baseDeCalculoDoIcms * _aliquotaDoIcms / 100);
                this._aliquotaDoIcmsSt = _prodSt ? _aliquotaDoIcms : 0;
                this._baseDeCalculoDoIcmsSt = _prodSt ? new Dinheiro(_baseDeCalculoDoIcms) : new Dinheiro(0);
                this._valorDoIcmsSt = _prodSt ? new Dinheiro(_baseDeCalculoDoIcms * _aliquotaDoIcms / 100) : new Dinheiro(0);
            }
        } else {
            throw new Error('Regime Tributário inválido');
        }
        return this;
    }

    Icms.prototype.getOrigem = function () {
        return this._prodOrigem;
    }

    Icms.prototype.getCfop = function () {
        return this._Cfop || '';
    };

    Icms.prototype.getSituacaoTributaria = function () {
        return this._CodSituacaoTributaria;
    }
    Icms.prototype.getBaseDeCalculoDoIcms = function () {
        //Embora os valores daqui para baixo sejam numéricos
        return this._baseDeCalculoDoIcms.valor || 0;
    };

    Icms.prototype.getBaseDeCalculoDoIcmsSt = function () {
        //Embora os valores daqui para baixo sejam numéricos
        return this._baseDeCalculoDoIcmsSt.valor || 0;
    };

    Icms.prototype.getBaseDeCalculoDoIcmsFormatada = function () {
        if (!this.getBaseDeCalculoDoIcms()) {
            return '';
        }

        return this.getBaseDeCalculoDoIcms().toString();
    };

    Icms.prototype.getBaseDeCalculoDoIcmsStFormatada = function () {
        if (!this.getBaseDeCalculoDoIcmsSt()) {
            return '';
        }

        return this.getBaseDeCalculoDoIcmsSt().toString();
    };

    // Icms.prototype.comBaseDeCalculoDoIcms = function (_baseDeCalculoDoIcms) {
    //     if (_baseDeCalculoDoIcms < 0) {
    //         throw new Error('Base de cálculo do icms não pode ser inferior a zero');
    //     }

    //     this._baseDeCalculoDoIcms = _baseDeCalculoDoIcms;
    //     return this;
    // };

    Icms.prototype.getAliquotaDoIcms = function () {
        return this._aliquotaDoIcms || '';
    };

    Icms.prototype.getAliquotaDoIcmsSt = function () {
        return this._aliquotaDoIcmsSt || '';
    };

    function formatarAliquota(aliquota) {
        var parteDecimal = aliquota.toString().split('.');

        if (parteDecimal.length > 1) {
            aliquota = parteDecimal[1];

            if (aliquota.length > 2) {
                aliquota = insert(aliquota, 2, '.');
            }

            aliquota = formatarNumero(parseFloat(aliquota)); //Remover os zeros a esquerda
        } else {
            aliquota = '0';
        }

        return aliquota + '%';
    }

    Icms.prototype.getAliquotaDoIcmsFormatada = function () {
        if (this.getAliquotaDoIcms() !== '') {
            return formatarAliquota(this.getAliquotaDoIcms());
        }

        return '';
    };

    Icms.prototype.getAliquotaDoIcmsStFormatada = function () {
        if (this.getAliquotaDoIcmsSt() !== '') {
            return formatarAliquota(this.getAliquotaDoIcmsSt());
        }

        return '';
    };

    Icms.prototype.getAliquotaDoIpi = function () {
        return this._aliquotaDoIpi || '';
    };

    Icms.prototype.getAliquotaDoIpiFormatada = function () {
        if (this.getAliquotaDoIpi() !== '') {
            return formatarAliquota(this.getAliquotaDoIpi());
        }

        return '';
    };

    Icms.prototype.comAliquotaDoIpi = function (_aliquotaDoIpi) {
        if (_aliquotaDoIpi < 0 || _aliquotaDoIpi >= 1) {
            throw new Error('Aliquota do icms deve estar entre 0 e 1');
        }

        this._aliquotaDoIpi = _aliquotaDoIpi;
        return this;
    };

    Icms.prototype.getValorDoIcms = function () {
        return this._valorDoIcms.valor || 0;
    };
    Icms.prototype.getValorDoIcmsSt = function () {
        return this._valorDoIcmsSt.valor || 0;
    };

    Icms.prototype.getValorDoIcmsFormatado = function () {
        if (!this.getValorDoIcms()) {
            return '';
        }

        return this.getValorDoIcms().toString();
    };

    Icms.prototype.getValorDoIcmsStFormatado = function () {
        if (!this.getValorDoIcmsSt()) {
            return '';
        }

        return this.getValorDoIcmsSt().toString();
    };

    Icms.prototype.getValorDoIpi = function () {
        return this._valorDoIpi || '';
    };

    Icms.prototype.getValorDoIpiFormatado = function () {
        if (!this.getValorDoIpi()) {
            return '';
        }

        return formatarDinheiro(this.getValorDoIpi(), {
            simbolo: ''
        });
    };

    Icms.prototype.comValorDoIpi = function (_valorDoIpi) {
        if (_valorDoIpi < 0) {
            throw new Error('Valor do ipi não pode ser inferior a zero');
        }

        this._valorDoIpi = _valorDoIpi;
        return this;
    };

    return Icms;
})();

module.exports = Icms;
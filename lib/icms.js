'use strict';

var gammautils = require('gammautils'),
    insert = gammautils.string.insert,
    brasil = require('brasil'),
    ncms = require(brasil.dados.ncmsDicionario),
    cfops = require(brasil.dados.cfopsDicionario),
    removerMascara = brasil.formatacoes.removerMascara,
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
        if (_regTrib === 1) {
            // 1- Empresa optante pelo simples nacional
            //TODO: LOCALDECOR
        }
        if (_regTrib === 2 || _regTrib === 3) {
            // 2- Empresa optante pelo simples nacional
            // 3- Empresa não optante pelo simples nacional (lucro presumido)
            if (_ufOri === _ufDest) {
                // venda para o mesmo estado 
                this._comCodSituacaoTributaria = _prodSt ? _prodOrigem + "60" : _prodOrigem + "00";
                this._Cfop = _prodSt ? "5405" : "5102";
                this._aliquotaDoIcms = _prodSt ? "" : _aliquotaDoIcms;
                this._baseDeCalculoDoIcms = _prodSt ? "" : _baseDeCalculoDoIcms;
                this._valorDoIcms = _prodSt ? "" : _baseDeCalculoDoIcms * _aliquotaDoIcms / 100;
            }
        }
        return this;
    }


    Icms.prototype.getBaseDeCalculoDoIcms = function () {
        //Embora os valores daqui para baixo sejam numéricos
        //eu deixei retornando string vazio por padrão
        return this._baseDeCalculoDoIcms || '';
    };

    Icms.prototype.getBaseDeCalculoDoIcmsFormatada = function () {
        if (!this.getBaseDeCalculoDoIcms()) {
            return '';
        }

        return formatarDinheiro(this.getBaseDeCalculoDoIcms(), {
            simbolo: ''
        });
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
        return this._valorDoIcms || '';
    };

    Icms.prototype.getValorDoIcmsFormatado = function () {
        if (!this.getValorDoIcms()) {
            return '';
        }

        return formatarDinheiro(this.getValorDoIcms(), {
            simbolo: ''
        });
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

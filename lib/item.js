'use strict';

var gammautils = require('gammautils'),
    Icms = require('./icms'),
    Dinheiro = require('./dinheiro'),
    insert = gammautils.string.insert,
    brasil = require('brasil'),
    ncms = require(brasil.dados.ncmsDicionario),
    cfops = require(brasil.dados.cfopsDicionario),
    removerMascara = brasil.formatacoes.removerMascara,
    formatarDinheiro = brasil.formatacoes.dinheiro,
    formatarNumero = brasil.formatacoes.numero;

var Item = (function() {
    function Item() {

    }
    Item.prototype.comIcms = function(_icms) {
        this._icms = _icms;
        return this;
    }
    Item.prototype.getIcms = function() {
        return  this._icms;
    }
    Item.prototype.getCodigo = function() {
        return this._codigo || '';
    };

    Item.prototype.comCodigo = function(_codigo) {
        this._codigo = _codigo;
        return this;
    };

    Item.prototype.getDescricao = function() {
        return this._descricao || '';
    };

    Item.prototype.comDescricao = function(_descricao) {
        this._descricao = _descricao;
        return this;
    };

    Item.prototype.getInformacoesAdicionais = function() {
        return this._informacoesAdicionais;
    };

    Item.prototype.comInformacoesAdicionais = function(_informacoesAdicionais) {
        this._informacoesAdicionais = _informacoesAdicionais;
        return this;
    };

    Item.prototype.getNcmSh = function() {
        return this._ncmSh || '';
    };

    Item.prototype.comNcmSh = function(_ncmSh) {
        _ncmSh = removerMascara(_ncmSh);

        if(typeof ncms[_ncmSh] === 'undefined') {
            throw new Error('Não é um NCM válido');
        }

        this._ncmSh = _ncmSh;
        return this;
    };

    Item.prototype.getCst = function() {
        return this._oCst || '';
    };

    Item.prototype.comCst = function(_oCst) {
        this._oCst = _oCst;
        return this;
    };

    Item.prototype.getCfop = function() {
        return this._cfop || '';
    };

    Item.prototype.comCfop = function(_cfop) {
        _cfop = removerMascara(_cfop);

        if(typeof cfops[_cfop] === 'undefined') {
            throw new Error('Não é um CFOP válido');
        }

        this._cfop = _cfop;
        return this;
    };

    Item.prototype.getUnidade = function() {
        return this._unidade || '';
    };

    Item.prototype.comUnidade = function(_unidade) {
        this._unidade = _unidade;
        return this;
    };

    Item.prototype.getQuantidade = function() {
        return this._quantidade || 0;
    };

    Item.prototype.getQuantidadeFormatada = function() {
        return formatarNumero(this.getQuantidade());
    };

    Item.prototype.comQuantidade = function(_quantidade) {
        if(_quantidade < 0) {
            throw new Error('Quantidade não pode ser inferior a zero');
        }

        this._quantidade = _quantidade;
        return this;
    };

    Item.prototype.getValorUnitario = function() {
        return this._valorUnitario.valor || 0;
    };

    Item.prototype.getValorUnitarioFormatado = function() {
        // return formatarDinheiro(this.getValorUnitario(), {
        //     simbolo: ''
        // });
        this._valorUnitario.toString();
    };

    Item.prototype.comValorUnitario = function(_valorUnitario) {
        if(_valorUnitario < 0) {
            throw new Error('Valor unitário não pode ser inferior a zero');
        }

        this._valorUnitario = new Dinheiro(_valorUnitario);
        return this;
    };

    Item.prototype.comValorDoFrete = function(_valorFrete) {
        console.log('valorfrete',_valorFrete)
        this._valorFrete = new Dinheiro(_valorFrete);
        return this;
    };

    Item.prototype.getValorDoFrete = function() {
        return this._valorFrete.valor || 0;
    };

    Item.prototype.getValorFreteFormatado = function() {
        // return formatarDinheiro(this.getValorUnitario(), {
        //     simbolo: ''
        // });
        this._valorFrete.toString();
    };



    Item.prototype.getValorTotal = function() {
        return new Dinheiro(this._valorUnitario).multiplica(this._quantidade).valor || 0;
    };

    Item.prototype.getValorTotalFormatado = function() {
        // return formatarDinheiro(this.getValorTotal(), {
        //     simbolo: ''
        // });
        return new Dinheiro(this._valorUnitario).multiplica(this._quantidade).toString()
    };

    // Item.prototype.comValorTotal = function(_valorTotal) {
    //     if(_valorTotal < 0) {
    //         throw new Error('Valor total não pode ser inferior a zero');
    //     }

    //     this._valorTotal = _valorTotal;
    //     return this;
    // };


    Item.prototype.getInformacoesAdicionais = function() {
        return this._informacoesAdicionais;
    };

    Item.prototype.comInformacoesAdicionais = function(_informacoesAdicionais) {
        this._informacoesAdicionais = _informacoesAdicionais;
        return this;
    };

    return Item;
})();

module.exports = Item;

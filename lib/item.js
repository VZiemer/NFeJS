'use strict';

var gammautils = require('gammautils'),
    Icms = require('./icms'),
    IBPT = require('./IBPT'),
    Dinheiro = require('./dinheiro'),
    insert = gammautils.string.insert,
    brasil = require('./brasil/brasil'),
    ncms = brasil.dados.ncmsDicionario,
    cfops = brasil.dados.cfopsDicionario,
    removerMascara = brasil.formatacoes.removerMascara,
    formatarDinheiro = brasil.formatacoes.dinheiro,
    formatarNumero = brasil.formatacoes.numero;

var Item = (function () {
    function Item() {

    }
    Item.prototype.comIcms = function (_icms) {
        this._icms = _icms;
        return this;
    }
    Item.prototype.getIcms = function () {
        return this._icms;
    }
    Item.prototype.getCodigo = function () {
        return this._codigo || '';
    };

    Item.prototype.comCodigo = function (_codigo) {
        this._codigo = _codigo;
        return this;
    };
    Item.prototype.getCodProdVenda = function () {
      return this._codigo || '';
  };

  Item.prototype.comCodProdVenda = function (_codigo) {
      this._codigo = _codigo;
      return this;
  };
    Item.prototype.getCodigoCest = function () {
        return this._codigoCest;
    }

    Item.prototype.comCodigoCest = function (_codigoCest) {
        this._codigoCest = _codigoCest;
    }

    Item.prototype.getCodigoDeBarras = function () {
        return this._codigoDeBarras || 'SEM GTIN';
    };

    Item.prototype.comCodigoDeBarras = function (_codigoDeBarras) {
        this._codigo = _codigoDeBarras;
        return this;
    };

    Item.prototype.getDescricao = function () {
        return this._descricao || '';
    };

    Item.prototype.comDescricao = function (_descricao) {
        this._descricao = _descricao;
        return this;
    };

    Item.prototype.getInformacoesAdicionais = function () {
        return this._informacoesAdicionais;
    };

    Item.prototype.comInformacoesAdicionais = function (_informacoesAdicionais) {
        this._informacoesAdicionais = _informacoesAdicionais;
        return this;
    };

    Item.prototype.getNcmSh = function () {
        return this._ncmSh || '';
    };

    Item.prototype.comNcmSh = function (_ncmSh) {
        // _ncmSh = removerMascara(_ncmSh);

        // if (typeof ncms[_ncmSh] === 'undefined') {
        //     throw new Error(_ncmSh + 'Não é um NCM válido');
        // }

        this._ncmSh = _ncmSh;
        return this;
    };

    Item.prototype.getCst = function () {
        return this._oCst || '';
    };

    Item.prototype.comCst = function (_oCst) {
        this._oCst = _oCst;
        return this;
    };

    Item.prototype.getCfop = function () {
        return this._cfop || '';
    };

    Item.prototype.comCfop = function (_cfop) {
        _cfop = removerMascara(_cfop);

        if (typeof cfops[_cfop] === 'undefined') {
            throw new Error('Não é um CFOP válido');
        }

        this._cfop = _cfop;
        return this;
    };

    Item.prototype.getUnidade = function () {
        return this._unidade || '';
    };

    Item.prototype.comUnidade = function (_unidade) {
        this._unidade = _unidade;
        return this;
    };

    Item.prototype.getQuantidade = function () {
        return this._quantidade || 0;
    };

    Item.prototype.getQuantidadeFormatada = function () {
        return formatarNumero(this.getQuantidade());
    };

    Item.prototype.comQuantidade = function (_quantidade) {
        if (_quantidade < 0) {
            throw new Error('Quantidade não pode ser inferior a zero');
        }

        this._quantidade = _quantidade;
        return this;
    };

    Item.prototype.getValorUnitario = function () {
        return this._valorUnitario.valor || 0;
    };

    Item.prototype.getValorUnitarioFormatado = function () {

        return this._valorUnitario.toString();
    };

    Item.prototype.comValorUnitario = function (_valorUnitario) {
        if (_valorUnitario < 0) {
            throw new Error('Valor unitário não pode ser inferior a zero');
        }

        this._valorUnitario = new Dinheiro(_valorUnitario);
        return this;
    };

    Item.prototype.comValorDoFrete = function (_valorFrete) {
        this._valorFrete = new Dinheiro(_valorFrete);
        return this;
    };

    Item.prototype.getValorDoFrete = function () {
        return this._valorFrete.valor || 0;
    };

    Item.prototype.getValorFreteFormatado = function () {
        // return formatarDinheiro(this.getValorUnitario(), {
        //     simbolo: ''
        // });
        return this._valorFrete.toString();
    };



    Item.prototype.getValorTotal = function () {
        return new Dinheiro(this._valorUnitario).multiplica(this._quantidade).valor || 0;
    };

    Item.prototype.getValorTotalFormatado = function () {
        // return formatarDinheiro(this.getValorTotal(), {
        //     simbolo: ''
        // });
        return new Dinheiro(this._valorUnitario).multiplica(this._quantidade).toString()
    };

    Item.prototype.comValorTotal = function (_valorTotal) {
        if (_valorTotal < 0) {
            throw new Error('Valor total não pode ser inferior a zero');
        }

        this._valorTotal = new Dinheiro(_valorTotal);
        return this;
    };

    Item.prototype.getValorDoIpi = function () {
        return this._valorDoIpi || '';
    };

    Item.prototype.getValorDoIpiFormatado = function () {
        if (!this.getValorDoIpi()) {
            return '';
        }

        return formatarDinheiro(this.getValorDoIpi(), {
            simbolo: ''
        });
    };

    Item.prototype.comCodigoSituacaoTributariaIpi = function (_cstIpi) {
        this._cstIpi = _cstIpi;
        return this;
    };

    Item.prototype.getCodigoSituacaoTributariaIpi = function (_cstIpi) {

        return this._cstIpi;
    };

    Item.prototype.comValorDoIpi = function (_valorDoIpi) {
        if (_valorDoIpi < 0) {
            throw new Error('Valor do ipi não pode ser inferior a zero');
        }

        this._valorDoIpi = new Dinheiro(_valorDoIpi);
        return this;
    };

    Item.prototype.getAliquotaDoIpi = function () {
        return this._aliquotaDoIpi || '';
    };

    Item.prototype.getAliquotaDoIpiFormatada = function () {
        if (this.getAliquotaDoIpi() !== '') {
            return formatarAliquota(this.getAliquotaDoIpi());
        }

        return '';
    };

    Item.prototype.comAliquotaDoIpi = function (_aliquotaDoIpi) {
        if (_aliquotaDoIpi < 0 || _aliquotaDoIpi >= 1) {
            throw new Error('Aliquota do icms deve estar entre 0 e 1');
        }

        this._aliquotaDoIpi = _aliquotaDoIpi;
        return this;
    };




    // compos do PIS



    Item.prototype.getValorDoPis = function () {
        return this._valorDoPis.valor || 0;
    };

    Item.prototype.getBaseDeCalculoDoPis = function () {
        return this._baseCalculoDoPis.valor || 0;
    };

    Item.prototype.getPercentualDoPis = function () {
        return this._pPis || 0;
    };

    Item.prototype.getCstDoPis = function () {
        return this._cstPis || 0;
    };

    Item.prototype.getValorDoPisFormatado = function () {
        return formatarDinheiro(this.getValorDoPis(), {
            simbolo: ''
        });
    };

    Item.prototype.comValorDoPis = function (_baseCalculoDoPis, _pPis, _cstPis) {
        this._cstPis = _cstPis;
        this._pPis = _pPis;
        this._baseCalculoDoPis = new Dinheiro (_baseCalculoDoPis);
        this._valorDoPis = new Dinheiro (_baseCalculoDoPis * _pPis / 100);
        return this;
    };

    // compos do COFINS



    Item.prototype.getValorDaCofins = function () {
        return this._valorDaCofins.valor || 0;
    };

    Item.prototype.getBaseDeCalculoDaCofins = function () {
        return this._baseCalculoDaCofins.valor || 0;
    };

    Item.prototype.getPercentualDaCofins = function () {
        return this._pDaCofins || 0;
    };

    Item.prototype.getCstDaCofins = function () {
        return this._cstDaCofins || 0;
    };

    Item.prototype.getValorDaCofinsFormatado = function () {
        return formatarDinheiro(this.getValorDaCofins(), {
            simbolo: ''
        });
    };

    Item.prototype.comValorDaCofins = function (_baseCalculoDaCofins, _pDaCofins, _cstDaCofins) {
        this._pDaCofins = _pDaCofins;
        this._cstDaCofins = _cstDaCofins;
        this._baseCalculoDaCofins = new Dinheiro(_baseCalculoDaCofins);
        this._valorDaCofins = new Dinheiro(_baseCalculoDaCofins * _pDaCofins / 100);
        return this;
    };






    Item.prototype.getInformacoesAdicionais = function () {
        return this._informacoesAdicionais;
    };

    Item.prototype.comInformacoesAdicionais = function (_informacoesAdicionais) {
        this._informacoesAdicionais = _informacoesAdicionais;
        return this;
    };

    Item.prototype.getValorDoIpiDevolucao = function () {
        return this._valorDoIpiDevolucao.valor || '';
    };
    Item.prototype.getPorcentagemDoIpiDevolucao = function () {
        return this._porcentagemDoIpiDevolucao || '';
    };
    Item.prototype.comValorDoIpiDevolucao = function (_valorDoIpiDevolucao) {
        if (_valorDoIpiDevolucao) {
            this._porcentagemDoIpiDevolucao = '100';
        }
        this._valorDoIpiDevolucao = new Dinheiro(_valorDoIpiDevolucao);
        return this;
        // if (_valorDoIpi < 0) {
        //     throw new Error('Valor do ipi não pode ser inferior a zero');
        // }
    }

    Item.prototype.getCst = function () {
        return this._oCst || '';
    };

    Item.prototype.comTributoAproximado = function (_baseCalc,_uf,_ncm,_orig) {
        let tributos = new IBPT().getIBPT(_uf,_ncm).dados;
        console.log(tributos)
        this._TributoAproximadoFederal = _baseCalc * (_orig == 0 ? tributos.nacionalfederal : tributos.importadosfederal) /100;
        this._TributoAproximadoEstadual =  _baseCalc * tributos.estadual / 100;
        this._TributoAproximadoMunicipal =  _baseCalc * tributos.municipal / 100;
        console.log('conta', this._TributoAproximadoMunicipal)
        return this;
    };

    Item.prototype.getTributoAproximadoFederal = function () {
        return this._TributoAproximadoFederal;
    };

    Item.prototype.getTributoAproximadoEstadual = function () {
        return this._TributoAproximadoEstadual;
    };

    Item.prototype.getTributoAproximadoMunicipal = function () {
        return this._TributoAproximadoMunicipal;
    };

    return Item;
})();

module.exports = Item;

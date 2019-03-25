'use strict';

var gammautils = require('gammautils'),
    insert = gammautils.string.insert,
    brasil = require('./brasil/brasil'),
    ncms = require(brasil.dados.ncmsDicionario),
    cfops = require(brasil.dados.cfopsDicionario),
    removerMascara = brasil.formatacoes.removerMascara,
    Dinheiro = require('./dinheiro'),
    tabelaicms = require('./tabelaicms'),
    formatarDinheiro = brasil.formatacoes.dinheiro,
    formatarNumero = brasil.formatacoes.numero;


var Icms = (function () {
    function Icms() {

    }
    Icms.prototype.CalculaIcms = function (_prodSt, _regTrib, _ufOri, _ufDest, _destContrib, _cFinal, _baseDeCalculoDoIcms, _aliquotaDoIcms, _prodOrigem,_operacao) {
        //verifica se a base de calculo é menor que 0
        console.log(_operacao)
        if (_baseDeCalculoDoIcms < 0) {
            throw new Error('Base de cálculo do icms não pode ser inferior a zero');
        }
        if (!_prodOrigem) { _prodOrigem = '0'};
        if (_regTrib === "1") {
            // 1- Empresa optante pelo simples nacional
            if (_operacao==1) { 
                //venda de mercadoria
                if (_ufOri === _ufDest) {
                    // venda para o mesmo estado 
                    this._prodOrigem = _prodOrigem;
                    this._CodSituacaoTributaria = _prodSt ? "500" : (_destContrib === 1 ? "101" : "102");
                    this._Cfop = _prodSt ? "5405" : "5102";
                    this._aliquotaDoIcms = 0;
                    this._baseDeCalculoDoIcms = new Dinheiro(0);
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
                    this._baseDeCalculoDoIcms = new Dinheiro(0);
                    this._valorDoIcms = new Dinheiro(0);
                    this._aliquotaDoIcmsSt = 0;
                    this._baseDeCalculoDoIcmsSt = new Dinheiro(0);
                    this._valorDoIcmsSt = new Dinheiro(0);
                    //copiado do sistema antigo, analisar com calma
                    if (_destContrib === 9) { //grupo somente no caso de não contribuinte
                        this._pICMSUFDest = tabelaicms[_ufDest][_ufDest];
                        this._pICMSInter = (_prodOrigem==2 || _prodOrigem==3)?4:tabelaicms[_ufOri][_ufDest];
                        this._vBCUFDest = 0;
                        this._pICMSInterPart = 100;
                        this._vICMSUFDest = 0; //
                        this._vICMSUFRemet = 0;
                        this._pFCPUFDest = tabelaicms[_ufDest].FCP;
                        this._vFCPUFDest = 0;
                        this._vBCFCPUFDest = 0;
                    }
                }
            }
            if (_operacao ==2) {
                //venda de ativo
                if (_ufOri === _ufDest) {
                    // venda para o mesmo estado 
                    this._prodOrigem = _prodOrigem;
                    this._CodSituacaoTributaria = "41";
                    this._Cfop = "5551";
                    this._aliquotaDoIcms = 0;
                    this._baseDeCalculoDoIcms = new Dinheiro(0);
                    this._valorDoIcms = new Dinheiro(0);
                    this._aliquotaDoIcmsSt = 0;
                    this._baseDeCalculoDoIcmsSt = new Dinheiro(0);
                    this._valorDoIcmsSt = new Dinheiro(0);
                }                
            }
            if (_operacao ==3) {
                //devolucao de mercadoria
                console.log('devolução de mercadoria')
                if (_ufOri === _ufDest) {
                    console.log('dentro do estado')
                    // devolução para o mesmo estado 
                    this._prodOrigem = _prodOrigem;
                    this._CodSituacaoTributaria = "000";
                    this._Cfop = "5201";
                    this._aliquotaDoIcms = 0;
                    this._baseDeCalculoDoIcms = new Dinheiro(0);
                    this._valorDoIcms = new Dinheiro(0);
                    this._aliquotaDoIcmsSt = 0;
                    this._baseDeCalculoDoIcmsSt = new Dinheiro(0);
                    this._valorDoIcmsSt = new Dinheiro(0);
                    console.log(this)
                }  
                if (_ufOri !== _ufDest) {
                    console.log('fora do estado');
                    // devolução para outro estado 
                    this._prodOrigem = _prodOrigem;
                    this._CodSituacaoTributaria = "900";
                    this._Cfop = "6411";
                    this._aliquotaDoIcms = 0;
                    this._baseDeCalculoDoIcms = new Dinheiro(0);
                    this._valorDoIcms = new Dinheiro(0);
                    this._aliquotaDoIcmsSt = 0;
                    this._baseDeCalculoDoIcmsSt = new Dinheiro(0);
                    this._valorDoIcmsSt = new Dinheiro(0);
                    console.log(this)
                }                               
            } 
            if (_operacao ==5) {
                console.log('devolução de mercadoria')
                if (_ufOri === _ufDest) {
                    //TODO: fazer conforme necessidade
                    // devolução para o mesmo estado 
                    throw new Error('Operação não pode ser realizada, consulte o suporte');
                }  
                if (_ufOri !== _ufDest) {
                    // devolução para outro estado 
                    this._prodOrigem = _prodOrigem;
                    this._CodSituacaoTributaria = "400";
                    this._Cfop = "6911";
                    this._aliquotaDoIcms = 0;
                    this._baseDeCalculoDoIcms = new Dinheiro(0);
                    this._valorDoIcms = new Dinheiro(0);
                    this._aliquotaDoIcmsSt = 0;
                    this._baseDeCalculoDoIcmsSt = new Dinheiro(0);
                    this._valorDoIcmsSt = new Dinheiro(0);
                }                  
            }           

        } else if (_regTrib === "2" || _regTrib === "3") {  
            // 2- Empresa optante pelo simples nacional
            // 3- Empresa não optante pelo simples nacional (lucro presumido)
            if (_operacao==1) { 
                //venda de mercadoria
                if (_ufOri === _ufDest) {
                    // venda para o mesmo estado 
                    this._prodOrigem = _prodOrigem;
                    this._CodSituacaoTributaria = _prodSt ? "60" : "00";
                    this._Cfop = _prodSt ? "5405" : "5102";
                    this._aliquotaDoIcms = _prodSt ? "" : _aliquotaDoIcms;
                    this._baseDeCalculoDoIcms = _prodSt ? "" : new Dinheiro(_baseDeCalculoDoIcms);
                    this._valorDoIcms = _prodSt ? 0 : new Dinheiro(_baseDeCalculoDoIcms * _aliquotaDoIcms / 100);
                    this._aliquotaDoIcmsSt = _prodSt ? _aliquotaDoIcms : 0;
                    this._baseDeCalculoDoIcmsSt = _prodSt ? new Dinheiro(0) : new Dinheiro(0);
                    this._valorDoIcmsSt = _prodSt ? new Dinheiro(0) : new Dinheiro(0);
                }

                else if (_ufOri !== _ufDest) {
                    // venda para outro estado
                    if (_prodOrigem = 3) { _aliquotaDoIcms = 4}
                    this._prodOrigem = _prodOrigem;
                    this._CodSituacaoTributaria = _prodSt ? "60" : "00";
                    this._Cfop = _prodSt ? "6405" : "6102";
                    this._aliquotaDoIcms = _prodSt ? "" : _aliquotaDoIcms;
                    this._baseDeCalculoDoIcms = _prodSt ? "" : new Dinheiro(_baseDeCalculoDoIcms);
                    this._valorDoIcms = _prodSt ? 0 : new Dinheiro(_baseDeCalculoDoIcms * _aliquotaDoIcms / 100);
                    this._aliquotaDoIcmsSt = _prodSt ? _aliquotaDoIcms : 0;
                    this._baseDeCalculoDoIcmsSt = _prodSt ? new Dinheiro(0) : new Dinheiro(0);
                    this._valorDoIcmsSt = _prodSt ? new Dinheiro(0) : new Dinheiro(0);
                }



                else {
                    throw new Error('Operação para fora do estado não tributado pelo Simples Nacional, consulte o suporte');
                }                
            }
            if (_operacao ==2) {
                //venda de ativo
                if (_ufOri === _ufDest) {
                    // venda para o mesmo estado 
                    this._prodOrigem = _prodOrigem;
                    this._CodSituacaoTributaria = "41";
                    this._Cfop = "5551";
                    this._aliquotaDoIcms = 0;
                    this._baseDeCalculoDoIcms = new Dinheiro(0);
                    this._valorDoIcms = new Dinheiro(0);
                    this._aliquotaDoIcmsSt = 0;
                    this._baseDeCalculoDoIcmsSt = new Dinheiro(0);
                    this._valorDoIcmsSt = new Dinheiro(0);
                }                
            }
            if (_operacao ==3) {
                //devolucao de mercadoria
                console.log('devolução de mercadoria')
                if (_ufOri === _ufDest) {
                    console.log('dentro do estado')
                    //TODO: fazer conforme necessidade
                    // devolução para o mesmo estado 
                    throw new Error('Operação não pode ser realizada, consulte o suporte');
                }  
                if (_ufOri !== _ufDest) {
                    console.log('fora do estado');
                    // devolução para outro estado 
                    this._prodOrigem = _prodOrigem;
                    this._CodSituacaoTributaria = "102";
                    this._Cfop = "2403";
                    this._aliquotaDoIcms = 0;
                    this._baseDeCalculoDoIcms = new Dinheiro(0);
                    this._valorDoIcms = new Dinheiro(0);
                    this._aliquotaDoIcmsSt = 0;
                    this._baseDeCalculoDoIcmsSt = new Dinheiro(0);
                    this._valorDoIcmsSt = new Dinheiro(0);
                    console.log(this)
                }                               
            } 
            if (_operacao ==6) {
                //Retorno de bem recebido por conta de contrato de comodato
                console.log('Retorno de bem recebido por conta de contrato de comodato')
                if (_ufOri === _ufDest) {
                    console.log('dentro do estado')
                    //TODO: fazer conforme necessidade
                    // devolução para o mesmo estado 
                    throw new Error('Operação não pode ser realizada, consulte o suporte');
                }  
                if (_ufOri !== _ufDest) {
                    console.log('fora do estado');
                    // devolução para outro estado 
                     _aliquotaDoIcms = 12 //feito para ZEN RS

                    this._prodOrigem = _prodOrigem;
                    this._CodSituacaoTributaria = '00';
                    this._Cfop = "6909";
                    // this._aliquotaDoIcms = _prodSt ? "" : _aliquotaDoIcms;
                    this._aliquotaDoIcms =  _aliquotaDoIcms;
                    this._baseDeCalculoDoIcms =  new Dinheiro(_baseDeCalculoDoIcms);
                    this._valorDoIcms =  new Dinheiro(_baseDeCalculoDoIcms * _aliquotaDoIcms / 100);
                    this._aliquotaDoIcmsSt = 0;
                    this._baseDeCalculoDoIcmsSt = _prodSt ? new Dinheiro(0) : new Dinheiro(0);
                    this._valorDoIcmsSt = _prodSt ? new Dinheiro(0) : new Dinheiro(0);
                    console.log(this)
                }                               
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
        if (!this._baseDeCalculoDoIcms) {
            return '';
        }

        return this._baseDeCalculoDoIcms.toString();
    };

    Icms.prototype.getBaseDeCalculoDoIcmsStFormatada = function () {
        if (!this._baseDeCalculoDoIcmsSt) {
            return '';
        }

        return this._baseDeCalculoDoIcmsSt.toString();
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
        // if (!this._valorDoIcmsFormatado) {
        //     return '';
        // }

        return this._valorDoIcms.toString();
    };

    Icms.prototype.getValorDoIcmsStFormatado = function () {
        // if (!this._valorDoIcmsSt) {
        //     return '';
        // }

        return this._valorDoIcmsSt.toString();
    };

    // preenchimento da tag ICMSUFDest

    Icms.prototype.getAliquotaDoIcmsUFDestino = function () {
        return this._pICMSUFDest || "";
    }

    Icms.prototype.getAliquotaDoIcmsInterna = function () {
        return this._pICMSInter || "";
    }

    Icms.prototype.getBaseDeCalculoUFDestino = function () {
        return this._vBCUFDest || "";
    }

    Icms.prototype.getPercentualIcmsUFDestino = function () {
        return this._pICMSInterPart || "";
    }

    Icms.prototype.getValorDoIcmsUFDestino = function () {
        return this._vICMSUFDest || "";
    }

    Icms.prototype.getValorDoIcmsUFRemetente = function () {
        return this._vICMSUFRemet || "";
    }

    Icms.prototype.getPercentualFundoCombatePobrezaDestino = function () {
        return this._pFCPUFDest || "";
    }

    Icms.prototype.getValorFundoCombatePobrezaDestino = function () {
        return this._vFCPUFDest || "";
    }

    Icms.prototype.getBaseDeCalculoFundoCombatePobrezaDestino = function () {
        return this._vBCFCPUFDest || "";
    }






    return Icms;
})();

module.exports = Icms;
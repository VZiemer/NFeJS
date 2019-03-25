'use strict';

var gammautils = require('gammautils'),
    insert = gammautils.string.insert,
    brasil = require('./brasil/brasil'),
    Dinheiro = require('./dinheiro'),
    ncms = require(brasil.dados.ncmsDicionario),
    cfops = require(brasil.dados.cfopsDicionario),
    removerMascara = brasil.formatacoes.removerMascara,
    formatarDinheiro = brasil.formatacoes.dinheiro,
    formatarNumero = brasil.formatacoes.numero,
    eRegistroNacional = brasil.formatacoes.eRegistroNacional;

var Pagamento = (function () {
    function Pagamento() {

    }

    Pagamento.prototype.comFormaDePagamento = function (_formaDePagamento) {
        if (["Á Vista", "Á Prazo"].indexOf(_formaDePagamento) === -1) {
            throw new Error('Os valores permitidos são as strings "Á Vista" e "Á Prazo"');
        }
        this._formaDePagamento = _formaDePagamento;
        return this;
    }
    Pagamento.prototype.getFormaDePagamento = function () {
        return this._formaDePagamento || '';
    }
    Pagamento.prototype.getCodFormaDePagemento = function () {
        return ["Á Vista", "Á Prazo"].indexOf(this._formaDePagamento);
    }

    Pagamento.prototype.comMeioDePagamento = function (_meioDePagamento) {
        let formas = {
            "Dinheiro": "01",
            "Cheque": "02",
            "Cartão de Crédito": "03",
            "Cartão de Débito": "04",
            "Crédito Loja": "05",
            "Vale Alimentação": "10",
            "Vale Refeição": "11",
            "Vale Presente": "12",
            "Vale Combustível": "13",
            "Boleto Bancário": "15",
            "Sem Pagamento": "90"
        }
        if (Object.keys(formas).indexOf(_meioDePagamento) === -1) {
            throw new Error('Os valores permitidos são as strings "Dinheiro", "Cheque", "Cartão de Crédito", "Cartão de Débito", "Crédito Loja", ""Boleto Bancário""');
        }
        this._meioDePagamento = _meioDePagamento;
        return this;
    }

    Pagamento.prototype.getMeioDePagamento = function () {
        return this._meioDePagamento;
    }

    Pagamento.prototype.getCodMeioDePagamento = function () {
        let formas = {
            "Dinheiro": "01",
            "Cheque": "02",
            "Cartão de Crédito": "03",
            "Cartão de Débito": "04",
            "Crédito Loja": "05",
            "Vale Alimentação": "10",
            "Vale Refeição": "11",
            "Vale Presente": "12",
            "Vale Combustível": "13",
            "Boleto Bancário": "15",
            "Sem Pagamento": "90"
        }
        return formas[this._meioDePagamento] || '';
    }

    Pagamento.prototype.comValor = function (_valor) {
        this._valor = _valor;
        return this;
    }
    Pagamento.prototype.getValor = function () {
        return this._valor.valor || '';
    }

    Pagamento.prototype.comIntegracaoDePagamento = function (_integracaoDePagamento) {
        if (["Integrado", "Não Integrado"].indexOf(_integracaoDePagamento) === -1) {
            throw new Error('Os valores permitidos são as strings "Integrado", "Não Integrado"');
        }
        this._integracaoDePagamento = _integracaoDePagamento;
        return this;
    }
    Pagamento.prototype.getIntegracaoDePagamento = function () {
        return this._integracaoDePagamento || '';
    }
    Pagamento.prototype.getCodIntegracaoDePagamento = function () {
        return ["Nenhum", "Integrado", "Não Integrado"].indexOf(this._integracaoDePagamento)
    }
    Pagamento.prototype.comCnpjdaCredenciadoraDeCartao = function (_cnpjDaCredenciadoraDeCartao) {
        if (!eRegistroNacional(_registroNacional)) {
            throw new Error('Não é um registro nacional válido');
        }
        this._cnpjDaCredenciadoraDeCartao = _cnpjDaCredenciadoraDeCartao;
        return this;
    }
    Pagamento.prototype.getCnpjDaCredenciadoraDeCartao = function () {
        return this._cnpjDaCredenciadoraDeCartao || '';
    }
    Pagamento.prototype.comBandeiraDoCartao = function (_bandeiraDoCartao) {
        let bandeiras = {
            "": "",
            "Visa": "01",
            "Mastercard": "02",
            "American Express": "03",
            "Sorocred": "04",
            "Diners Club": "05",
            "Elo": "06",
            "Hipercard": "07",
            "Aura": "08",
            "Cabal": "09",
            "Outros": "99"
        }
        if (Object.keys(bandeiras).indexOf(_bandeiraDoCartao) === -1) {
            throw new Error('Não é um bandeira de cartão válida');
        }
        this._bandeiraDoCartao = _bandeiraDoCartao;
        return this;
    }
    Pagamento.prototype.getBandeiraDoCartao = function () {
        return this._bandeiraDoCartao || '';
    }
    Pagamento.prototype.comVencimento = function (_vencimento) {
        this._vencimento = new Date(_vencimento);
        return this;
    }
    Pagamento.prototype.getVencimento = function () {
        return this._vencimento;
    }
    Pagamento.prototype.getCodBandeiraDoCartao = function () {
        let bandeiras = {
            "Visa": "01",
            "Mastercard": "02",
            "American Express": "03",
            "Sorocred": "04",
            "Diners Club": "05",
            "Elo": "06",
            "Hipercard": "07",
            "Aura": "08",
            "Cabal": "09",
            "Outros": "99"
        }
        return bandeiras[this._bandeiraDoCartao] || '';
    }

    Pagamento.prototype.comAutorizacaoDeOperacao = function (_autorizacaoDeOperacao) {
        this._autorizacaoDeOperacao = _autorizacaoDeOperacao;
        return this;
    }
    Pagamento.prototype.getAutorizacaoDeOperacao = function () {
        return this._autorizacaoDeOperacao || '';
    }
    Pagamento.prototype.comValorDoTroco = function (_valorDoTroco) {
        this._valorDoTroco = new Dinheiro(_valorDoTroco);
        return this
    }
    Pagamento.prototype.getValorDoTroco = function () {
        return this._valorDoTroco.valor || 0;
    }

    return Pagamento;
})();

module.exports = Pagamento;

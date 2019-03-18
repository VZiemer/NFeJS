'use strict';

var gammautils = require('gammautils'),
    eEmail = gammautils.validation.isValidEmail,
    ie = require('inscricaoestadual'),
    brasil = require('brasil'),
    removerMascara = brasil.formatacoes.removerMascara,
    formatarTelefone = brasil.formatacoes.telefone,
    eTelefone = brasil.validacoes.eTelefone,
    eRegistroNacional = brasil.validacoes.eRegistroNacional,

    Endereco = require('./endereco');

var Pessoa = (function () {
    function Pessoa() {
        this.comEndereco(new Endereco());
    }

    Pessoa.prototype.getNome = function () {
        return this._nome || '';
    };

    Pessoa.prototype.comNome = function (_nome) {
        this._nome = _nome;
        return this;
    };

    Pessoa.prototype.getCodigo = function () {
        return this._codigo || '';
    };

    Pessoa.prototype.comCodigo = function (_codigo) {
        this._codigo = _codigo;
        return this;
    };

    Pessoa.prototype.getRegistroNacional = function () {
        return this._registroNacional || '';
    };

    Pessoa.prototype.getRegistroNacionalFormatado = function () {
        return brasil.formatacoes.registroNacional(this.getRegistroNacional());
    };

    Pessoa.prototype.comRegistroNacional = function (_registroNacional) {
        if (!eRegistroNacional(_registroNacional)) {
            throw new Error(_registroNacional + ' Não é um registro nacional válido');
        }
        this._tipoRegistro = eRegistroNacional(_registroNacional);
        this._registroNacional = removerMascara(_registroNacional);
        return this;
    };

    Pessoa.prototype.getTipoRegistro = function () {
        return this._tipoRegistro;
    }
    Pessoa.prototype.getEndereco = function () {
        return this._endereco;
    };

    Pessoa.prototype.comEndereco = function (_endereco) {
        this._endereco = _endereco;
        return this;
    };

    Pessoa.prototype.getInscricaoEstadual = function () {
        return this._inscricaoEstadual || '';
    };

    Pessoa.prototype.comInscricaoEstadual = function (_inscricaoEstadual) {
        if (this._tipoRegistro === 'cpf') {
            _inscricaoEstadual = '';
            this._IdenfificaContribuinteIcms = 9;
        } else if (_inscricaoEstadual === 'ISENTO' || !_inscricaoEstadual) {
            _inscricaoEstadual = '';
            this._IdenfificaContribuinteIcms = 2;
        } else if (!ie(_inscricaoEstadual)) {
            throw new Error(_inscricaoEstadual + ' é uma Inscrição estadual inválida');
        } else {
            this._IdenfificaContribuinteIcms = 1;
        }

        this._inscricaoEstadual = brasil.formatacoes.removerMascara(_inscricaoEstadual);
        return this;
    };

    Pessoa.prototype.getIdenfificaContribuinteIcms = function () {
        return this._IdenfificaContribuinteIcms
    }

    Pessoa.prototype.getTelefone = function () {
        return this._telefone || '';
    };

    Pessoa.prototype.getTelefoneFormatado = function () {
        return formatarTelefone(this.getTelefone());
    };

    Pessoa.prototype.comTelefone = function (_telefone) {
        if (!eTelefone(_telefone)) {
            throw new Error(_telefone + ' Não é um telefone válido (o DDD também está sendo validado)');
        }

        this._telefone = brasil.formatacoes.removerMascara(_telefone);
        return this;
    };

    Pessoa.prototype.getEmail = function () {
        return this._email || '';
    };

    Pessoa.prototype.comEmail = function (_email) {
        if (!eEmail(_email)) {
            throw new Error(_email + ' Não é um email válido');
        }

        this._email = _email;
        return this;
    };

    return Pessoa;
})();

module.exports = Pessoa;
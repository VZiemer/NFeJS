// importa os módulos necessários
var fs = require('fs'),
    path = require('path'),
    firebird = require('node-firebird'),
    buscaCep = require('busca-cep')
    conexao = require('./db'),
    nfe = require('./app'),    
    NFe = nfe.NFe,
    Gerador = nfe.Gerador,
    Danfe = nfe.Danfe,
    Emitente = nfe.Emitente,
    Destinatario = nfe.Destinatario,
    Transportador = nfe.Transportador,
    Endereco = nfe.Endereco,
    Protocolo = nfe.Protocolo,
    Impostos = nfe.Impostos,
    Volumes = nfe.Volumes,
    Item = nfe.Item,
    Icms = nfe.Icms;

//cria as variáveis necessárias
var emitente = new Emitente();
var destinatario = new Destinatario();
var transportador = new Transportador();
var volumes = new Volumes();
var danfe = new NFe();


// abre os dados da empresa emitente da nota informada pelo sistema (#param.codigo)
function dadosEmitente(empresa) {
    return new Promise((resolve, reject) => {
        firebird.attach(conexao, function (err, db) {
            if (err) throw err;
            db.query('select p.crt,c.razao,c.cgc,c.insc,c.endereco,c.bairro,c.cep,c.fone,c.email,ci.nom_cidade as cidade,ci.codibge,ci.estado from param p  join cliente c on p.codparc = c.codigo  join cidade ci on c.codcidade = ci.cod_cidade where p.codigo=?', empresa, function (err, result) {
                if (err) throw err;
                db.detach(function () {
                    emitente.comNome(result[0].RAZAO)
                        .comRegistroNacional(result[0].CGC)
                        .comInscricaoEstadual(result[0].INSC)
                        .comTelefone(result[0].FONE)
                        .comEmail(result[0].EMAIL)
                        .comCrt(result[0].CRT)
                        .comEndereco(new Endereco()
                            .comLogradouro(result[0].ENDERECO)
                            .comNumero(result[0].NUMERO)
                            .comComplemento('')
                            .comCep(result[0].CEP)
                            .comBairro(result[0].BAIRRO)
                            .comMunicipio(result[0].CIDADE)
                            .comCidade(result[0].CIDADE)
                            .comCodMunicipio(result[0].CODIBGE)
                            .comUf(result[0].ESTADO));
                    resolve();
                })
            })
        })
    })
}
function dadosNota(venda) {
    return new Promise((resolve, reject) => {
        firebird.attach(conexao, function (err, db) {
            if (err) throw err;
            db.query('select v.lcto,v.codcli,v.total,tr.peso,tr.volumes,tr.frete,tr.outra_desp,tr.desconto,tr.total_nota,tr.tipofrete,c.cgc,c.razao,c.insc,c.endereco,c.numero,c.bairro,c.complemento,c.cidade,c.cep,c.fone,c.email,ci.codibge,c.codcidade,ci.estado,ci.cod_estado,transp.codigo as codtransp, transp.transportador from venda v join transito tr on v.lcto = tr.documento join cliente c on c.codigo=v.codcli join cidade ci on c.codcidade = ci.cod_cidade left join transp on tr.codtransp = transp.codigo where lcto = ?', venda, function (err, result) {
                if (err) throw err;
                db.detach(function () {
                    destinatario.comNome(result[0].RAZAO)
                        .comRegistroNacional(result[0].CGC)
                        .comInscricaoEstadual(result[0].INSC)
                        .comTelefone(result[0].FONE)
                        .comEmail(result[0].EMAIL)
                        .comEndereco(new Endereco()
                            .comLogradouro(result[0].ENDERECO)
                            .comNumero(result[0].NUMERO)
                            .comComplemento(result[0].COMPLEMENTO)
                            .comCep(result[0].CEP)
                            .comBairro(result[0].BAIRRO)
                            .comMunicipio(result[0].CIDADE)
                            .comCidade(result[0].CIDADE)
                            .comUf(result[0].ESTADO)
                            .comCodMunicipio(result[0].CODIBGE));
                    transportador.comNome(result[0].TRANSPORTADOR)
                        .comEndereco(new Endereco());
                    volumes.comQuantidade(result[0].VOLUMES);
                    volumes.comEspecie('CX');
                    volumes.comMarca('');
                    volumes.comNumeracao('');
                    volumes.comPesoBruto(result[0].PESO);
                    resolve();
                })
            })
        })
    })
}

dadosEmitente(1).then(dadosNota(1358273)).then(function () {
    // console.log(destinatario)
    danfe.comChaveDeAcesso('52131000132781000178551000000153401000153408');
    danfe.comEmitente(emitente);
    danfe.comDestinatario(destinatario);
    danfe.comTransportador(transportador);
    // danfe.comProtocolo(protocolo);
    danfe.comImpostos(impostos);
    danfe.comVolumes(volumes);
    danfe.comTipo('saida');
    danfe.comNaturezaDaOperacao('VENDA');
    danfe.comNumero(1420);
    danfe.comSerie(100);
    danfe.comDataDaEmissao(new Date(2014, 10, 19));
    danfe.comDataDaEntradaOuSaida(new Date(2014, 10, 19, 12, 43, 59));
    danfe.comModalidadeDoFrete('porContaDoDestinatarioRemetente');
    danfe.comInscricaoEstadualDoSubstitutoTributario('102959579');
    danfe.comInformacoesComplementares('Lorem ipsum dolor sit amet, consectetur adipisicing elit. Eligendi non quis exercitationem culpa nesciunt nihil aut nostrum explicabo reprehenderit optio amet ab temporibus asperiores quasi cupiditate. Voluptatum ducimus voluptates voluptas? Lorem ipsum dolor sit amet, consectetur adipisicing elit. Eligendi non quis exercitationem culpa nesciunt nihil aut nostrum consectetur adipisicing elit. Eligendi non quis exercitationem culpa nesciunt nihil aut nostrum nihil aut nostrum');
    danfe.comValorTotalDaNota(250.13);
    danfe.comValorTotalDosProdutos(120.10);
    danfe.comValorTotalDosServicos(130.03);
    danfe.comValorDoFrete(23.34);
    danfe.comValorDoSeguro(78.65);
    danfe.comDesconto(1.07);
    danfe.comOutrasDespesas(13.32);

})


var protocolo = new Protocolo();
protocolo.comCodigo('123451234512345');
protocolo.comData(new Date(2014, 10, 19, 13, 24, 35));

var impostos = new Impostos();
// impostos.comBaseDeCalculoDoIcms(100);
// impostos.comValorDoIcms(17.5);
// impostos.comBaseDeCalculoDoIcmsSt(90);
// impostos.comValorDoIcmsSt(6.83);
// impostos.comValorDoImpostoDeImportacao(80);
// impostos.comValorDoPis(70);
// impostos.comValorTotalDoIpi(60);
// impostos.comValorDaCofins(50);
// impostos.comBaseDeCalculoDoIssqn(40);
// impostos.comValorTotalDoIssqn(30);


for (var i = 0; i < 5; i++) {
    var icms = new Icms().CalculaIcms(0, 2, 'SP', 'SP', 1, 1, '100', '18', '1')
    danfe.adicionarItem(new Item()
        .comCodigo('' + i)
        .comDescricao('Produto')
        .comNcmSh('15156000')
        .comIcms(icms)
        // .comOCst('020')
        // .comCfop('6101')
        .comUnidade('LT')
        .comQuantidade(3.1415)
        .comValorUnitario(2.31)
        .comValorTotal(7.13));
}
        console.log(danfe._itens)

        // console.log(new Icms().CalculaIcms(0, 2, 'SP', 'SP', 1, 1, '100', '18', '1'))



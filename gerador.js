// importa os módulos necessários



//testes

var ini = require('ini');

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
function dadosEmitente(empresa, venda) {
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
                    console.log(emitente);
                    resolve(venda, emitente);
                })
            })
        })
    });
}
function dadosNota(venda, emitente) {
    return new Promise((resolve, reject) => {
        firebird.attach(conexao, function (err, db) {
            if (err) throw err;
            db.query('select v.lcto,v.codcli,v.total,tr.peso,tr.volumes,tr.frete,tr.outra_desp,tr.desconto,tr.total_nota,tr.tipofrete,c.cgc,c.razao,c.insc,c.endereco,c.numero,c.bairro,c.complemento,c.cidade,c.cep,c.fone,c.email,ci.codibge,c.codcidade,ci.estado,ci.cod_estado,transp.codigo as codtransp, transp.transportador from venda v join transito tr on v.lcto = tr.documento join cliente c on c.codigo=v.codcli join cidade ci on c.codcidade = ci.cod_cidade left join transp on tr.codtransp = transp.codigo where lcto = ?', venda, function (err, result) {
                if (err) throw err;
                db.detach(function () {
                    endDest = result[0].ESTADO;
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
                    console.log(destinatario);
                    resolve(venda);
                })
            })
        })
    })
}

function criaNf(venda) {
    return new Promise((resolve, reject) => {
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
        resolve(venda);
    })

}

function itensNota(venda) {
    return new Promise((resolve, reject) => {
        firebird.attach(conexao, function (err, db) {
            if (err) throw err;
            db.query('select * from listaprodvendas(?)', venda, function (err, result) {
                if (err) throw err;
                db.detach(function () {
                    for (let item of result) {
                        var prodst = (item.SITTRIB === "060") ? true : false;
                        var icms = new Icms().CalculaIcms(
                            prodst,
                            danfe.getEmitente().getCrt(),
                            danfe.getEmitente().getEndereco().getUf(),
                            danfe.getDestinatario().getEndereco().getUf(),
                            1,
                            1,
                            item.BASECALC,
                            item.ALIQ,
                            item.ORIG
                        )
                        danfe.adicionarItem(new Item()
                            .comCodigo(item.CODIGO)
                            .comDescricao(item.DESCRICAO)
                            .comNcmSh(item.NCM)
                            .comIcms(icms)
                            // .comOCst('020')
                            // .comCfop('6101')
                            .comUnidade(item.UNIDADE)
                            .comQuantidade(item.QTDPEDIDO)
                            .comValorUnitario(item.VALOR)
                            .comValorTotal(item.VALOR * item.QTDPEDIDO));
                    }
                    resolve(danfe);
                })
            })
        })
    })
}






//cadeia de execução
dadosEmitente(1, 1359424).then(dadosNota).then(criaNf).then(itensNota).then(function (res) {
  

var Geraini = {
    infNFe: {
        versao: '4.0.0'
    },
    Identificacao: {
        cNF: danfe.getNumero(),
        natOp: '',
        indPag: '',
        mod: '',
        serie: '',
        nNF: '',
        dhEmi: '',
        dhSaiEnt: '',
        tpNF: '',
        idDest: '',
        tpImp: '',
        tpEmis: '',
        finNFe: '',
        indFinal: '',
        indPres: '',
        procEmi: '',
        verProc: '',
        dhCont: '',
        xJust: ''
    },
    Volume001: {
        qVol: '',
        esp: '',
        Marca: '',
        nVol: '',
        pesoL: '',
        pesoB: ''
    },
    Transportador: {
        modFrete: '',
        CNPJCPF: '',
        xNome: '',
        IE: '',
        xEnder: '',
        xMun: '',
        UF: '',
        vServ: '',
        vBCRet: '',
        pICMSRet: '',
        vICMSRet: '',
        CFOP: '',
        cMunFG: '',
        Placa: '',
        UFPlaca: '',
        RNTC: '',
        vagao: '',
        balsa: ''
    },
    Emitente: {
        CNPJCPF: danfe.getEmitente().getRegistroNacional(),
        xNome: danfe.getEmitente(),
        xFant: danfe.getEmitente(),
        IE: danfe.getEmitente(),
        IEST: '',
        IM: '',
        CNAE: danfe.getEmitente(),
        CRT: danfe.getEmitente().getCrt(),
        xLgr: danfe.getEmitente().getEndereco().getLogradouro(),
        nro: danfe.getEmitente().getEndereco().getNumero(),
        xCpl: danfe.getEmitente().getEndereco().getComplemento(),
        xBairro: danfe.getEmitente().getEndereco().getBairro(),
        cMun: danfe.getEmitente().getEndereco().getCodMunicipio(),
        xMun: danfe.getEmitente().getEndereco().getMunicipio(),
        UF: danfe.getEmitente().getEndereco().getUf(),
        CEP: danfe.getEmitente().getEndereco().getCep(),
        cPais: danfe.getEmitente().getEndereco().getCodPais(),
        xPais: danfe.getEmitente().getEndereco().getPais(),
        Fone: danfe.getEmitente().getTelefone(),
        cUF: danfe.getEmitente().getEndereco().getUf(),
        cMunFG: ''
    },
    Destinatario: {
        idEstrangeiro: '',
        CNPJCPF: danfe.getDestinatario().getRegistroNacional(),
        xNome: danfe.getDestinatario().getNome(),
        indIEDest: '',
        IE: danfe.getDestinatario().getInscricaoEstadual(),
        ISUF: '',
        Email: danfe.getDestinatario().getEmail(),
        xLgr: danfe.getDestinatario().getEndereco().getLogradouro(),
        nro: danfe.getDestinatario().getEndereco().getNumero(),
        xCpl: danfe.getDestinatario().getEndereco().getComplemento(),
        xBairro: danfe.getDestinatario().getEndereco().getBairro(),
        cMun: danfe.getDestinatario().getEndereco().getCodMunicipio(),
        xMun: danfe.getDestinatario().getEndereco().getMunicipio(),
        UF: danfe.getDestinatario().getEndereco().getUf(),
        CEP: danfe.getDestinatario().getEndereco().getCep(),
        cPais: danfe.getDestinatario().getEndereco().getCodPais(),
        xPais: danfe.getDestinatario().getEndereco().getPais(),
        Fone: danfe.getDestinatario().getTelefone()
    },
    Total: {
        vBC: '',
        vICMS: '',
        vICMSDeson: '',
        vBCST: '',
        vST: '',
        vProd: '',
        vFrete: danfe.getValorDoFrete(),
        vSeg: danfe.getValorDoSeguro(),
        vDesc: danfe.getDesconto(),
        vII: '',
        vIPI: '',
        vPIS: '',
        vCOFINS: '',
        vOutro: danfe.getOutrasDespesas(),
        vNF: '',
        vTotTrib: ''
    },
    DadosAdicionais: {
        infCpl: danfe.getInformacoesComplementares()
        // pgtoavista +';'+ infoAdic+ '
    },
    ['Duplicata' + 'xxx'] : {
        'nDup': '',
        'dVenc': '',
        'vDup': ''
      },
     ['ICMS' + 'xxx'] : {
        orig: '',
        CST: '',
        CSOSN: '',
        modBC: '',
        pRedBC: '',
        vBC: '',
        pICMS: '',
        vICMS: '',
        modBCST: '',
        pMVAST: '',
        pRedBCST: '',
        vBCST: '',
        pICMSST: '',
        vICMSST: '',
        UFST: '',
        pBCOp: '',
        vBCSTRet: '',
        vICMSSTRet: '',
        motDesICMS: '',
        pCredSN: '',
        vCredICMSSN: '',
        vBCSTDest: '',
        vICMSSTDest: '',
        vICMSDeson: '',
        vICMSOp: '',
        pDif: '',
        vICMSDif: ''
      } ,
      ['Produto' + 'xxx'] : {
        cProd: '',
        cEAN: '',
        xProd: '',
        NCM: '',
        CEST: '',
        EXTIPI: '',
        CFOP: '',
        uCom: '',
        qCom: '',
        vUnCom: '',
        vProd: '',
        cEANTrib: '',
        uTrib: '',
        qTrib: '',
        vUnTrib: '',
        vFrete: '',
        vSeg: '',
        vDesc: '',
        vOutro: '',
        indTot: 1,
        xPed: '',
        nItemPed: '',
        nFCI: '',
        nRECOPI: '',
        pDevol: '',
        vIPIDevol: '',
        vTotTrib: '',
        infAdProd: ''
      }   
} 
console.log(Geraini);
});
    
    
    



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


// TODO: buscar numero da próxima nota
// TODO: enviar e trazer retorno de chave e protocolo, após gravar a nota no sistema
// TODO: integração ao caixa e impressão







// importa os módulos necessários
//testes

var ini = require('ini');

var fs = require('fs'),
    path = require('path'),
    Venda = require('./lib/venda'),
    Dinheiro = require('./lib/dinheiro'),
    firebird = require('node-firebird'),
    buscaCep = require('busca-cep'),
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
    Duplicata = nfe.Duplicata,
    Item = nfe.Item,
    Icms = nfe.Icms,
    GravaBanco = nfe.Gravabanco,
    Pagamento = nfe.Pagamento;

//cria as variáveis necessárias
var emitente = new Emitente();
var destinatario = new Destinatario();
var transportador = new Transportador();
var volumes = new Volumes();
var danfe = new NFe();

function zeroEsq(valor, comprimento, digito) {
    var length = comprimento - valor.toString().length + 1;
    return Array(length).join(digito || '0') + valor;
};




// abre a venda (do caixa já virá aberto)

function carregaVenda(pedido) {
    return new Promise((resolve, reject) => {
        firebird.attach(conexao, function (err, db) {
            if (err)
                throw err;
            db.query("select v.lcto,v.codcli,v.empresa,v.total,tr.peso,tr.volumes,tr.frete,tr.outra_desp,tr.desconto,tr.total_nota,tr.tipofrete,c.cgc,c.razao,c.insc,c.endereco,c.numero,c.bairro,c.complemento,c.cidade,c.cep,c.fone,c.email,ci.codibge,c.codcidade,ci.estado,ci.cod_estado,mb.valor,  mb.vcto as vencimento,mb.codban,mb.tipopag,transp.codigo as codtransp, transp.transportador from venda v join transito tr on v.lcto = tr.documento join cliente c on c.codigo=v.codcli join cidade ci on c.codcidade = ci.cod_cidade join movban mb on mb.lctosaida = v.lcto left join transp on tr.codtransp = transp.codigo where lcto = ? order by mb.codigo", pedido, function (err, res) {
                venda = new Venda(res[0].LCTO, res[0].DATA, res[0].ID_TRANSITO, res[0].CGC, res[0].INSC, res[0].CODCLI, res[0].NOMECLI, res[0].CODVEND, res[0].NOMEVEND, res[0].EMAIL, res[0].FONE, res[0].RAZAO, res[0].ENDERECO, res[0].NUMERO, res[0].BAIRRO, res[0].CEP, res[0].CODIBGE, res[0].CODCIDADE, res[0].CIDADE, res[0].ESTADO, res[0].COMPLEMENTO, res[0].DESCONTO, res[0].FRETE, res[0].SEGURO, res[0].TOTAL);
                venda.insereTransporte(res[0].VOLUMES, res[0].PESO, res[0].TIPOFRETE, res[0].TRANSPORTADOR)
                res.forEach(function (item) {
                    venda.inserePagamento({
                        'valor': new Dinheiro(item.VALOR),
                        'tipo': item.TIPOPAG,
                        'vencimento': item.VENCIMENTO,
                        'pagto': '',
                        'codban': item.CODBAN,
                        'banco': null,
                        'agencia': '',
                        'conta': '',
                        'nrcheque': '',
                        'emnome': ''
                    })
                    console.log("inseriu item")
                });
                db.query("select * from LISTAPRODVENDAS(?)", pedido, function (err, result) {
                    if (err) throw err;
                    db.detach(function () {
                        result.forEach(function (item) {
                            if (item.QTDPEDIDO > 0 && item.CODIGO !== 20031) {
                                venda.insereProduto(item)
                                console.log("inseriu item")
                            }
                            else if (item.CODIGO === 20031) {
                                venda.insereFrete(item.VALOR * item.QTDPEDIDO)
                            }
                        });
                        console.log(venda)
                        resolve(venda);
                    });
                });
            });
        })
    })

}
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
function dadosNota(venda) {
    return new Promise((resolve, reject) => {
        destinatario.comNome(venda.RAZAO)
            .comCodigo(venda.CODCLI)
            .comRegistroNacional(venda.CGC)
            .comInscricaoEstadual(venda.INSC)
            .comTelefone(venda.FONE)
            .comEmail(venda.EMAIL)
            .comEndereco(new Endereco()
                .comLogradouro(venda.ENDERECO)
                .comNumero(venda.NUMERO)
                .comComplemento(venda.COMPLEMENTO)
                .comCep(venda.CEP)
                .comBairro(venda.BAIRRO)
                .comMunicipio(venda.CIDADE)
                .comCidade(venda.CIDADE)
                .comUf(venda.ESTADO)
                .comCodMunicipio(venda.CODIBGE));
        transportador.comNome(venda.TRANSPORTE.TRANSPORTADOR)
            .comCodigo(venda.TRANSPORTE.TRANSPORTADOR)
            .comEndereco(new Endereco());
        volumes.comQuantidade(venda.TRANSPORTE.VOLUMES);
        volumes.comEspecie('CX');
        volumes.comMarca('');
        volumes.comNumeracao('');
        volumes.comPesoBruto(venda.TRANSPORTE.PESO);
        console.log(destinatario);
        resolve(venda);


        // firebird.attach(conexao, function (err, db) {
        //     if (err) throw err;
        //     db.query('select v.lcto,v.codcli,v.total,tr.peso,tr.volumes,tr.frete,tr.outra_desp,tr.desconto,tr.total_nota,tr.tipofrete,c.cgc,c.razao,c.insc,c.endereco,c.numero,c.bairro,c.complemento,c.cidade,c.cep,c.fone,c.email,ci.codibge,c.codcidade,ci.estado,ci.cod_estado,transp.codigo as codtransp, transp.transportador from venda v join transito tr on v.lcto = tr.documento join cliente c on c.codigo=v.codcli join cidade ci on c.codcidade = ci.cod_cidade left join transp on tr.codtransp = transp.codigo where lcto = ?', venda, function (err, result) {
        //         if (err) throw err;
        //         db.detach(function () {
        //             endDest = result[0].ESTADO;
        //             destinatario.comNome(result[0].RAZAO)
        //                 .comCodigo(result[0].CODCLI)
        //                 .comRegistroNacional(result[0].CGC)
        //                 .comInscricaoEstadual(result[0].INSC)
        //                 .comTelefone(result[0].FONE)
        //                 .comEmail(result[0].EMAIL)
        //                 .comEndereco(new Endereco()
        //                     .comLogradouro(result[0].ENDERECO)
        //                     .comNumero(result[0].NUMERO)
        //                     .comComplemento(result[0].COMPLEMENTO)
        //                     .comCep(result[0].CEP)
        //                     .comBairro(result[0].BAIRRO)
        //                     .comMunicipio(result[0].CIDADE)
        //                     .comCidade(result[0].CIDADE)
        //                     .comUf(result[0].ESTADO)
        //                     .comCodMunicipio(result[0].CODIBGE));
        //             transportador.comNome(result[0].TRANSPORTADOR)
        //                 .comCodigo(result[0].CODTRANSP)
        //                 .comEndereco(new Endereco());
        //             volumes.comQuantidade(result[0].VOLUMES);
        //             volumes.comEspecie('CX');
        //             volumes.comMarca('');
        //             volumes.comNumeracao('');
        //             volumes.comPesoBruto(result[0].PESO);
        //             console.log(destinatario);
        //             resolve(venda);
        //         })
        //     })
        // })
    })
}

function criaNf(venda) {
    return new Promise((resolve, reject) => {
        //TODO : retorno do envio inserir chave e protocolo.
        // danfe.comChaveDeAcesso(chave);
        // danfe.comProtocolo(protocolo);
        danfe.comEmitente(emitente);
        danfe.comDestinatario(destinatario);
        danfe.comTransportador(transportador);
        danfe.comVolumes(volumes);
        danfe.comTipo('saida');
        danfe.comFinalidade('normal');
        danfe.comNaturezaDaOperacao('VENDA');
        danfe.comNumero(1420);
        danfe.comSerie(100);
        danfe.comDataDaEmissao(new Date());
        danfe.comDataDaEntradaOuSaida(new Date());
        danfe.comModalidadeDoFrete('porContaDoDestinatarioRemetente');
        // danfe.comInscricaoEstadualDoSubstitutoTributario('102959579');
        resolve(venda);
    })
}

function pagamentosNota(venda) {
    console.log('com pagamento')
    let _numDuplicata = 0;
    return new Promise((resolve, reject) => {
        for (let item of venda.PAGAMENTO) {
            let _formaPagto = "",
                _meioPagto = "",
                _integracaoPagto = "",
                _bandeiraCartao = "",
                _valorTroco = 0;
            if (item.tipo === "BL") {
                _formaPagto = "Á Prazo",
                    _meioPagto = "Boleto Bancário",
                    _integracaoPagto = "Não Integrado",
                    _numDuplicata++;
                    let duplicata = new Duplicata();
                    duplicata.comNumero(_numDuplicata)
                        .comValor(item.valor)
                        .comVencimento(_meioPagto)
                    danfe._duplicatas.push(duplicata)
            }
            else if (item.tipo === "CC") {
                _formaPagto = "Á Prazo",
                    _meioPagto = "Cartão de Crédito",
                    _integracaoPagto = "Não Integrado",
                    _bandeiraCartao = "Visa";
            }
            else if (item.tipo === "CM") {
                _formaPagto = "Á Prazo",
                    _meioPagto = "Cartão de Crédito",
                    _integracaoPagto = "Não Integrado",
                    _bandeiraCartao = "Mastercard";
            }
            else if (item.tipo === "DA") {
                _formaPagto = "Á Vista",
                    _meioPagto = "Cartão de Débito",
                    _integracaoPagto = "Não Integrado",
                    _bandeiraCartao = "Visa";
            }
            else if (item.tipo === "DM") {
                _formaPagto = "Á Vista",
                    _meioPagto = "Cartão de Débito",
                    _integracaoPagto = "Não Integrado",
                    _bandeiraCartao = "Mastercard";
            }
            else if (item.tipo === "CH") {
                _formaPagto = "Á Vista",
                    _meioPagto = "Cheque",
                    _integracaoPagto = "Não Integrado";
            }
            else { //se nenhum atender considerar Dinheiro
                _formaPagto = "Á Vista",
                    _meioPagto = "Dinheiro",
                    _integracaoPagto = "Não Integrado";
            }
            let pagamento = new Pagamento();
            pagamento.comFormaDePagamento(_formaPagto)
                .comValor(item.valor)
                .comMeioDePagamento(_meioPagto)
                .comIntegracaoDePagamento(_integracaoPagto)
                .comBandeiraDoCartao(_bandeiraCartao ? _bandeiraCartao : '')
                .comValorDoTroco(_valorTroco);
            danfe._pagamentos.push(pagamento)

        }
        console.log(danfe._pagamentos)
        resolve(venda);
    })
}

function itensNota(venda) {
    return new Promise((resolve, reject) => {
        for (let item of venda.PRODUTOS) {
            var prodst = (item.SITTRIB === "060") ? true : false;
            var icms = new Icms().CalculaIcms(
                prodst,
                danfe.getEmitente().getCrt(),
                danfe.getEmitente().getEndereco().getUf(),
                danfe.getDestinatario().getEndereco().getUf(),
                1,
                1,
                item.VALOR,
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
                .comQuantidade(item.QTD)
                .comValorUnitario(item.VALOR)
                .comValorTotal(item.VALOR * item.QTD));
        }
        resolve(venda);
        // firebird.attach(conexao, function (err, db) {
        //     if (err) throw err;
        //     db.query('select * from listaprodvendas(?)', venda, function (err, result) {
        //         if (err) throw err;
        //         db.detach(function () {
        //             for (let item of result) {
        //                 var prodst = (item.SITTRIB === "060") ? true : false;
        //                 var icms = new Icms().CalculaIcms(
        //                     prodst,
        //                     danfe.getEmitente().getCrt(),
        //                     danfe.getEmitente().getEndereco().getUf(),
        //                     danfe.getDestinatario().getEndereco().getUf(),
        //                     1,
        //                     1,
        //                     item.BASECALC,
        //                     item.ALIQ,
        //                     item.ORIG
        //                 )
        //                 danfe.adicionarItem(new Item()
        //                     .comCodigo(item.CODIGO)
        //                     .comDescricao(item.DESCRICAO)
        //                     .comNcmSh(item.NCM)
        //                     .comIcms(icms)
        //                     // .comOCst('020')
        //                     // .comCfop('6101')
        //                     .comUnidade(item.UNIDADE)
        //                     .comQuantidade(item.QTDPEDIDO)
        //                     .comValorUnitario(item.VALOR)
        //                     .comValorTotal(item.VALOR * item.QTDPEDIDO));
        //             }
        //             resolve(danfe);
        //         })
        //     })
        // })
    })
}

function totalizadorNfe() {
    console.log('totalizador')
    return new Promise((resolve, reject) => {
        var impostos = new Impostos();
        impostos.comBaseDeCalculoDoIcms(danfe.getItens().reduce(function (a, item) {
            return parseFloat(a + item.getIcms().getBaseDeCalculoDoIcms());
        }, 0));
        impostos.comValorDoIcms(danfe.getItens().reduce(function (a, item) {
            return parseFloat(a + item.getIcms().getValorDoIcms());
        }, 0));
        impostos.comBaseDeCalculoDoIcmsSt(danfe.getItens().reduce(function (a, item) {
            return parseFloat(a + item.getIcms().getBaseDeCalculoDoIcmsSt());
        }, 0));
        impostos.comValorDoIcmsSt(danfe.getItens().reduce(function (a, item) {
            return parseFloat(a + item.getIcms().getValorDoIcmsSt());
        }, 0));
        impostos.comValorDoImpostoDeImportacao(0);
        impostos.comValorDoPis(0);
        impostos.comValorTotalDoIpi(0);
        impostos.comValorDaCofins(0);
        impostos.comBaseDeCalculoDoIssqn(0);
        impostos.comValorTotalDoIssqn(30);

        danfe.comImpostos(impostos);
        danfe.comInformacoesComplementares('');
        danfe.comValorTotalDaNota(250.13);
        danfe.comValorTotalDosProdutos(120.10);
        danfe.comValorTotalDosServicos(130.03);
        danfe.comValorDoFrete(23.34);
        danfe.comValorDoSeguro(78.65);
        danfe.comDesconto(1.07);
        danfe.comOutrasDespesas(13.32);
        resolve();
    })

};




//cadeia de execução
// carregaVenda(1359424).then(function(response){console.log(response)})
dadosEmitente(1, 1359424).then(carregaVenda).then(dadosNota).then(criaNf).then(itensNota).then(pagamentosNota).then(totalizadorNfe).then(function (res) {

    var Geraini = {
        infNFe: {
            versao: '4.0'
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
            xNome: danfe.getEmitente().getNome(),
            xFant: danfe.getEmitente().getNome(),
            IE: danfe.getEmitente().getRegistroNacional(),
            IEST: '',
            IM: '',
            CNAE: '',
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
        // ['Duplicata' + 'xxx'] : {
        //     nDup: '',
        //     dVenc: '',
        //     vDup': ''
        //   },

    }
    var itens = danfe.getItens();
    for (i = 0; i < itens.length; i++) {
        Geraini['Produto' + zeroEsq(i + 1, 3, 0)] = {
            cProd: itens[i].getCodigo(),
            cEAN: '',
            xProd: itens[i].getDescricao(),
            NCM: itens[i].getNcmSh(),
            CEST: '',
            EXTIPI: '',
            CFOP: itens[i].getIcms().getCfop(),
            uCom: itens[i].getUnidade(),
            qCom: itens[i].getQuantidade(),
            vUnCom: itens[i].getValorUnitario(),
            vProd: itens[i].getValorUnitario(),
            cEANTrib: '',
            uTrib: '',
            qTrib: '',
            vUnTrib: itens[i].getValorUnitario(),
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
        Geraini['ICMS' + zeroEsq(i + 1, 3, 0)] = {
            orig: itens[i].getIcms().getOrigem(),
            CST: (danfe.getEmitente().getCodigoRegimeTributario() === '1') ? '' : itens[i].getIcms().getSituacaoTributaria(),
            CSOSN: (danfe.getEmitente().getCodigoRegimeTributario() === '1') ? itens[i].getIcms().getSituacaoTributaria() : '',
            modBC: 0,
            pRedBC: 0,
            vBC: itens[i].getIcms().getBaseDeCalculoDoIcms(),
            pICMS: itens[i].getIcms().getAliquotaDoIcms(),
            vICMS: itens[i].getIcms().getValorDoIcms(),
            modBCST: '',
            pMVAST: '',
            pRedBCST: '',
            vBCST: itens[i].getIcms().getBaseDeCalculoDoIcmsSt(),
            pICMSST: itens[i].getIcms().getAliquotaDoIcmsSt(),
            vICMSST: itens[i].getIcms().getValorDoIcmsSt(),
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
        }

    }

    console.log(danfe);
    let textoini = ini.stringify(Geraini);
    fs.writeFile("arquivoini.txt", 'NFe.CriarEnviarNFe("\n' + textoini + '\n",1)', (err) => {
        if (err) throw err;
        console.log("arquivo salvo com sucesso");

    });
});
// var protocolo = new Protocolo();
// protocolo.comCodigo('123451234512345');
// protocolo.comData(new Date());






const dinheiro = require('./dinheiro');
function Venda(lcto, data, transito, cgc, insc, codcli, nomecli, codvend, nomevend, email, fone, razao, endereco, numero, bairro, cep, codibge, codcidade, cidade, estado, complemento, desconto, frete, seguro, total) {
    //dados da venda
    this.LCTO = []
    this.DATA = new Date(data)
    this.LCTO.push(lcto)
    this.CODVEND = codvend || null
    this.NOMEVEND = nomevend || null
    //dados do transito
    this.TRANSITO = []
    this.TRANSITO.push(transito)
    //cliente
    this.CGC = cgc || null
    this.CPFCupom = null
    this.INSC = insc || null
    this.NFE = null
    this.CODCLI = codcli || null
    this.NOMECLI = nomecli || null
    this.EMAIL = email || null
    this.FONE = fone || null
    this.RAZAO = razao || null
    //endereço
    this.ENDERECO = endereco || null
    this.NUMERO = numero || null
    this.BAIRRO = bairro || null
    this.CEP = cep || null
    this.CODIBGE = codibge || null
    this.CODCIDADE = codcidade || null
    this.CIDADE = cidade || null
    this.ESTADO = estado || null
    this.COMPLEMENTO = complemento || null
    //valores que vem da tabela
    this.DESCONTO = new dinheiro(desconto) || 0
    this.FRETE = new dinheiro(frete) || 0
    this.SEGURO = new dinheiro(seguro) || 0
    // valores calculados ao inserir itens na venda
    this.TOTALPRODUTOS = new dinheiro(0) // inicia zerado
    this.TOTAL = new dinheiro(0) // inicia zerado
    this.TOTALDESC = new dinheiro(0) // inicia zerado
    this.DESCONTOITEM = new dinheiro(0) // inicia zerado
    this.PAGAR = new dinheiro(0) // inicia zerado
    //produtos
    this.PRODUTOS = []
    //pagamentos
    this.PAGAMENTO = []
    //dados do transportador
    this.TRANSPORTE = [];
    //documentos fiscais
    this.NUCUPOM = null
    this.NFE = null  
};

Venda.prototype.insereCPFCupom = function (valor) {
    this.CPFCupom = valor;
}

Venda.prototype.insereFrete = function (valor) {
    this.FRETE = new dinheiro(valor);
    this.calculaTotal()
}
Venda.prototype.insereTransporte = function (volumes, peso, tipofrete, transportador) {

    /* TIPOS DE FRETE
     0– Por conta do emitente;
     1– Por conta do destinatário/remetente;
     2– Por conta de terceiros;
     9– Sem frete. (V2.0) */

    this.TRANSPORTE = {
        VOLUMES: volumes || '',
        PESO: peso || '',
        TIPOFRETE: tipofrete || '',
        TRANSPORTADOR: transportador || ''
    }
}
Venda.prototype.insereNucupom = function (cupom) {
    this.NUCUPOM = cupom;
}
Venda.prototype.insereNfe = function (nfe) {
    this.NFE = nfe;
}
Venda.prototype.insereLcto = function (lcto, transito) {
    //lcto
    console.log("inserelcto" + lcto + " " + transito)
    this.LCTO.push(lcto)
    //transito
    this.TRANSITO.push(transito)
}

Venda.prototype.calculaTotal = function () {
    this.TOTAL = new dinheiro(this.PRODUTOS.reduce(function (valorAnterior, valorAtual, indice, array) {
        return valorAnterior + (valorAtual.TOTALSD);
    }, 0)).soma(this.FRETE)
    this.TOTALDESC = new dinheiro(this.PRODUTOS.reduce(function (valorAnterior, valorAtual, indice, array) {
        return valorAnterior + (valorAtual.TOTAL);
    }, 0)).soma(this.FRETE)
    this.PAGAR = new dinheiro(this.PRODUTOS.reduce(function (valorAnterior, valorAtual, indice, array) {
        return valorAnterior + (valorAtual.TOTAL);
    }, 0)).soma(this.FRETE)
    this.TOTALPRODUTOS = new dinheiro(this.PRODUTOS.reduce(function (valorAnterior, valorAtual, indice, array) {
        return valorAnterior + (valorAtual.TOTAL);
    }, 0))
}
Venda.prototype.aplicaDesconto = function (percent) {
    for (let prod of this.PRODUTOS) {
        console.log(prod.VALOR.valor)
        if (prod.VALOR.valor === prod.VALORINI.valor) {
            prod.VALORDESCPREV = new dinheiro(prod.VALOR.desconto(4) * prod.QTD)
            console.log(prod.VALORDESCPREV.valor)
        }
        else {
            prod.VALORDESCPREV = prod.TOTAL
        }
    }
}
Venda.prototype.descontoPrev = function () {
    return new dinheiro(this.PRODUTOS.reduce(function (valorAnterior, valorAtual, indice, array) {
        return valorAnterior + (valorAtual.VALORDESCPREV);

    }, 0))
}
Venda.prototype.VLDESC = function () { return new dinheiro(this.TOTAL - this.TOTALDESC) }
Venda.prototype.PERCENTDESC = function () { return (100 - (this.TOTALDESC * 100 / this.TOTAL)).toFixed(0) }
Venda.prototype.insereProduto = function (produto) {
    this.PRODUTOS.push(new Produto(produto.CODIGO, produto.VALOR, produto.QTDPEDIDO, produto.QTDRESERVA, produto.UNIDADE, produto.CODPRODVENDA, produto.VALORINI, produto.PRPROMO, produto.DESCRICAO, produto.CODINTERNO, produto.SITTRIB, produto.NCM, produto.ORIG, produto.GRUPO, produto.ALIQ, produto.CEST));
    this.calculaTotal()
}
Venda.prototype.inserePagamento = function (pagamento) {
    this.PAGAMENTO.push(pagamento);
}
Venda.prototype.insereDescontos = function (produto) {
    this.DESCONTOITEM.soma(produto.VALOR * produto.QTDPEDIDO)
}
Venda.prototype.alteraValorProduto = function (codprodvenda, valor) {
    console.log(codprodvenda)
    let index = this.PRODUTOS.findIndex(obj => obj.CODPRODVENDA == codprodvenda)
    console.log(this.PRODUTOS)
    console.log(index)
    this.PRODUTOS[index].VALOR = new dinheiro(valor)
    this.PRODUTOS[index].TOTAL = new dinheiro(valor * this.PRODUTOS[index].QTD)
    this.calculaTotal()
}
function Produto(codpro, valor, qtd, qtdreserva, unidade, codprodvenda, valorini, valorpromo, descricao, codinterno, sittrib, ncm, orig, grupo, aliq, cest) {
    this.CODPRO = codpro || null
    this.CODPRODVENDA = codprodvenda || null
    this.CODINTERNO = codinterno || null
    this.DESCRICAO = descricao || null
    this.VALOR = new dinheiro(valor) || 0
    this.VALORINI = new dinheiro(valorini) || 0
    this.VALORPROMO = new dinheiro(valorpromo) || 0
    this.QTD = qtd || 0
    this.QTDRESERVA = qtdreserva || 0
    this.TOTAL = new dinheiro(valor * qtd)
    this.TOTALSD = new dinheiro(valorini * qtd)
    this.UNIDADE = unidade || null
    this.SITTRIB = sittrib || null
    this.NCM = ncm || null
    this.CEST = cest || null
    this.ORIG = orig
    this.GRUPO = grupo || null
    this.ALIQ = aliq || 0
}


module.exports = Venda;
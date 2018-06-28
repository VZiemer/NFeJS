var GravaBanco = (function () {
  function GravaBanco(nfe) {
    let sql = "execute block as begin ";
    sql += "insert into nfe"
    sql += " (nota,data,codcli,nome,cnpj,inscest,endereco,end_numero,bairro,cidade,estado,cep,codcidade,fone,total,cancela,frete,entsai,basesubs,vlsubs,baseicms,valoricms,vlfrete,vldesconto,outrasdesp,finalidade,indfinal,indiedest,natoper,pesobruto,quantidade,especie,codtran)";
    sql += "values ("
    sql += nfe.getNumero() + ","  // nota
    sql += "CURRENT_DATE" + ","  // data
    sql += nfe.getDestinatario().getCodigo() + ","  // codcli
    sql += "'" + nfe.getDestinatario().getNome() + "',"  // nome
    sql += "'" + nfe.getDestinatario().getRegistroNacional() + "',"  // cnpj
    sql += "'" + nfe.getDestinatario().getInscricaoEstadual() + "',"  // inscest
    sql += "'" + nfe.getDestinatario().getEndereco().getLogradouro() + "',"  // endereco
    sql += "'" + nfe.getDestinatario().getEndereco().getNumero() + "',"  // end_numero
    sql += "'" + nfe.getDestinatario().getEndereco().getBairro() + "',"  // bairro
    sql += "'" + nfe.getDestinatario().getEndereco().getCidade() + "',"  // cidade
    sql += "'" + nfe.getDestinatario().getEndereco().getUf() + "',"  // estado
    sql += "'" + nfe.getDestinatario().getEndereco().getCep() + "',"  // cep
    sql += "'" + nfe.getDestinatario().getEndereco().getCodMunicipio() + "',"  // codcidade
    sql += "'" + nfe.getDestinatario().getTelefone() + "',"  // fone
    sql += nfe.getValorTotalDaNota() + ","  // total
    sql += "'N'" + "," // cancela
    sql += nfe.getCodigoModalidadeDoFrete() + "," // frete
    sql += nfe.getTipoAbreviado() + "," // entsai
    sql += nfe.getImpostos().getBaseDeCalculoDoIcmsSt() + "," // basesubs
    sql += nfe.getImpostos().getValorDoIcmsSt() + "," // vlsubs
    sql += nfe.getImpostos().getBaseDeCalculoDoIcms() + "," // baseicms
    sql += nfe.getImpostos().getValorDoIcms() + "," // valoricms
    sql += nfe.getValorDoFrete() + "," // vlfrete
    sql += nfe.getDesconto() + "," // vldesconto
    sql += nfe.getOutrasDespesas() + "," // outrasdesp
    sql += nfe.getCodigoFinalidade() + "," // finalidade
    sql += "1," // indfinal
    sql += "1," // indiedest
    sql += "'" + nfe.getNaturezaDaOperacao() + "'," // natoper
    sql += "'" + nfe.getVolumes().getPesoBruto() + "'," // pesobruto
    sql += "'" + nfe.getVolumes().getQuantidade() + "'," // quantidade
    sql += "'" + nfe.getVolumes().getEspecie() + "'," // especie
    sql += "'" + nfe.getTransportador().getCodigo() + "');" // codtran
    let itens = nfe.getItens();
    for (i = 0; i < itens.length; i++) {
      // let indice = zeroEsq(i + 1, 3, 0);
      // let codigo = produtos[i].CODPRO;
      sql += "insert into prodnfe (codnota,codpro,qtd,vluni,unid,aliq,ipi,cfop,impostoicms,baseicms,impostost,basest,sittrib)"
      sql += "values (" + nfe.getNumero() + "," + itens[i].getCodigo() + "," + itens[i].getQuantidade() + "," + itens[i].getValorUnitario() + ",'" + itens[i].getUnidade() + "'," + itens[i].getIcms().getAliquotaDoIcms() + ",0," + itens[i].getIcms().getCfop() + "," + itens[i].getIcms().getAliquotaDoIcms() + "," + itens[i].getIcms().getBaseDeCalculoDoIcms() + ",'" + itens[i].getIcms().getAliquotaDoIcmsSt() + "','" + itens[i].getIcms().getBaseDeCalculoDoIcmsSt() + "'," + itens[i].getIcms().getSituacaoTributaria() + "); "
    }
    sql += "end;"
    // Firebird.attach(options, function (err, db) {
    //   if (err)
    //     throw err;
    //   db.execute(sql, function (err, result) {
    //     let sql1 = "execute block as begin";
    //     for (i = 0; i < cliente.PEDIDO; i++) {
    //       sql1 += "update transito set nfe = " + this.Identificacao.nNF + " where documento = " + cliente[i].PEDIDO;
    //     }
    //     db.execute(sql1, function (err, result) {
    //       db.detach(function () {
    //         watcher.close();
    //       });
    //     });
    //   });
    // });
    console.log(sql)

  }
  return GravaBanco;
})();

module.exports = GravaBanco;
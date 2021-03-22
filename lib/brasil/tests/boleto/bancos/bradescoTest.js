var path = require('path'),
    fs = require('fs'),
    boleto = require('../../../lib/boletoUtils.js'),
    Bradesco = require('../../../lib/boleto/bancos/bradesco.js'),
    geradorDeLinhaDigitavel = require('../../../lib/boleto/geradorDeLinhaDigitavel.js'),
    GeradorDeBoleto = require('../../../lib/boleto/geradorDeBoleto.js'),

    Datas = boleto.Datas,
    Endereco = boleto.Endereco,
    Beneficiario = boleto.Beneficiario,
    Pagador = boleto.Pagador,
    Boleto = boleto.Boleto,

    banco,
    boleto;

module.exports = {
    setUp: function(done) {
        banco = new Bradesco();

        var datas = Datas.novasDatas();
        datas.comDocumento(31, 5, 2006);
        datas.comProcessamento(31, 5, 2006);
        datas.comVencimento(10, 6, 2006);

        var beneficiario = Beneficiario.novoBeneficiario();
        beneficiario.comNome('Leonardo Bessa');
        beneficiario.comRegistroNacional('73114004652');
        beneficiario.comAgencia('2949');
        beneficiario.comDigitoAgencia('1');
        beneficiario.comCodigoBeneficiario('6580');
        beneficiario.comDigitoCodigoBeneficiario('3');
        beneficiario.comNumeroConvenio('1207113');
        beneficiario.comCarteira('6');
        beneficiario.comNossoNumero('3');
        beneficiario.comDigitoNossoNumero('7');

        var enderecoDoBeneficiario = Endereco.novoEndereco();
        enderecoDoBeneficiario.comLogradouro('Rua da Programação');
        enderecoDoBeneficiario.comBairro('Zona Rural');
        enderecoDoBeneficiario.comCep('71550050');
        enderecoDoBeneficiario.comCidade('Patos de Minas');
        enderecoDoBeneficiario.comUf('MG');
        beneficiario.comEndereco(enderecoDoBeneficiario);

        var pagador = Pagador.novoPagador();
        pagador.comNome('Fulano');
        pagador.comRegistroNacional('97264269604');

        var enderecoDoPagador = Endereco.novoEndereco();
        enderecoDoPagador.comLogradouro('Avenida dos Testes Unitários');
        enderecoDoPagador.comBairro('Barra da Tijuca');
        enderecoDoPagador.comCep('72000000');
        enderecoDoPagador.comCidade('Rio de Janeiro');
        enderecoDoPagador.comUf('RJ');
        pagador.comEndereco(enderecoDoPagador);

        boleto = Boleto.novoBoleto();
        boleto.comDatas(datas);
        boleto.comBeneficiario(beneficiario);
        boleto.comBanco(banco);
        boleto.comPagador(pagador);
        boleto.comValor(1);
        boleto.comNumeroDoDocumento('4323');
        boleto.comLocaisDePagamento([
            'Pagável preferencialmente na rede Bradesco ou no Bradesco expresso'
        ]);

        done();
    },

    'Nosso número formatado deve ter 11 digitos': function(test) {
        var nossoNumero = banco.getNossoNumeroFormatado(boleto.getBeneficiario());
        test.equals(11, nossoNumero.length);
        test.equals('00000000003', nossoNumero);

        test.done();
    },

    'Carteira formatado deve ter dois dígitos': function(test) {
        var carteiraFormatado = banco.getCarteiraFormatado(boleto.getBeneficiario());

        test.equals(2, carteiraFormatado.length);
        test.equals('06', carteiraFormatado);
        test.done();
    },

    'Conta corrente formatada deve ter sete dígitos': function(test) {
        var codigoFormatado = banco.getCodigoFormatado(boleto.getBeneficiario());

        test.equals(7, codigoFormatado.length);
        test.equals('0006580', codigoFormatado);
        test.done();
    },

    'Testa geração de linha digitavel': function(test) {
        var codigoDeBarras = banco.geraCodigoDeBarrasPara(boleto),
            linhaEsperada = '23792.94909 60000.000004 03000.658009 6 31680000000100';

        test.equal(linhaEsperada, geradorDeLinhaDigitavel(codigoDeBarras, banco));
        test.done();
    },

    'Testa código de barras': function(test) {
        var codigoDeBarras = banco.geraCodigoDeBarrasPara(boleto);

        test.equal('23796316800000001002949060000000000300065800', codigoDeBarras);
        test.done();
    },

    'Verifica nome correto do banco': function(test) {
        test.equals(banco.getNome(), 'Banco Bradesco S.A.');
        test.done();
    },

    'Verifica a numeração correta do banco': function(test) {
        test.equal(banco.getNumeroFormatadoComDigito(), '237-2');
        test.done();
    },

    'Verifica que arquivo de imagem do logotipo existe': function(test) {
        test.ok(fs.existsSync(banco.getImagem()));
        test.done();
    },

    'Verifica deve imprimir o nome do banco no boleto': function(test) {
        test.ok(!banco.getImprimirNome());
        test.done();
    },

    'Exibir campo CIP retorna verdadeiro': function(test) {
        test.equal(banco.exibirCampoCip(), true);
        test.done();
    },

    'Verifica criação de pdf': function(test) {
        var geradorDeBoleto = new GeradorDeBoleto(boleto);

        geradorDeBoleto.gerarPDF(function boletosGerados(err, pdf) {
            test.ifError(err);

            var caminhoDoArquivo = path.join(__dirname, '/boleto-bradesco.pdf');
            writeStream = fs.createWriteStream(caminhoDoArquivo);

            pdf.pipe(writeStream);

            writeStream.on('close', function() {
                test.ok(fs.existsSync(caminhoDoArquivo));
                test.done();
            });
        });
    }
}
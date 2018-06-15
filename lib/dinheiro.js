function Dinheiro(valor) {
    this.valor = (Math.floor((valor * 100) + 0.0001) / 100);
}
Dinheiro.prototype.cents = function () {
    return Math.floor((this.valor * 100) + 0.0001);
}
Dinheiro.prototype.valueOf = function () {
    return this.valor;
};
Dinheiro.prototype.valueStr = function () {
    return this.valor.toFixed(2).toString();
};
Dinheiro.prototype.soma = function (valor) {
    if (valor instanceof Dinheiro === false) {
        valor = new Dinheiro(valor)
    }
    this.valor = ((this.cents() + valor.cents()) / 100);
    return this;
}
Dinheiro.prototype.desconto = function (percent) {
    return ((this.cents()-(this.cents() * percent/100)) / 100).toFixed(2);
}
Dinheiro.prototype.subtrai = function (valor) {
    console.log(this)
    console.log (valor)
    if (valor instanceof Dinheiro === false) {
        valor = new Dinheiro(valor)
    }
    this.valor = ((this.cents() - valor.cents()) / 100);
    return this;
}
Dinheiro.prototype.toString = function () {
    return "R$ " + this.valor.toFixed(2).replace('.', ',').replace(/(\d)(?=(\d{3})+\,)/g, "$1.");
}

module.exports = Dinheiro;

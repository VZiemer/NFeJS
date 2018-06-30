const net = require('net');
const client = net.createConnection({ port: 3434 }, () => {
    // 'connect' listener
    console.log('connected to server!');
    //   client.emit('MDFe.StatusServico')
    //   client.write("ECF.Ativo");

});
client.on('data', (data) => {
    console.log('data ' + data.toString());

    client.emit("ECF.Ativo\n")
    client.write("ECF.Ativo\n")
    client.write("ECF.Ativo\n")
    client.write("ECF.Ativo\n")
    //   client.end();
});
client.on('connect', () => {
    console.log('connect ');
    // client.write('ACBr.Run(“NOTEPAD.EXE”,”Novo.TXT”)')

})
client.on('end', () => {
    console.log('disconnected from server');
});
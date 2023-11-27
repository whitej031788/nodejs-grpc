const grpc = require('@grpc/grpc-js');
const {GreetServiceClient} = require('../proto/greet_grpc_pb');
const {GreetRequest} = require('../proto/greet_pb');

function doGreet(client) {
    console.log('doGreet was invoked');

    const req = new GreetRequest()
        .setFirstName('Jamie');

    client.greet(req, (err, res) => {
        if (err) {
            return console.log(err);
        }

        console.log(`Greet: ${res.getResult()}`);
    });
}

function doGreetManyTimes(client) {
    console.log('doGreetManyTimes was invoked');

    const req = new GreetRequest()
        .setFirstName('Jamie');

    const call = client.greetManyTimes(req);

    call.on('data', (res) => {
        console.log(`GreetManyTimes: ${res.getResult()}`)
    })
}

function doLongGreet(client) {
    console.log('doLongGreet was invoked');

    const names = ['Jamie', 'Lee', 'Anna'];
    
    const call = client.longGreet((err, res) => {
        if (err) {
            return console.log(err);
        }

        console.log(`LongGreet: ${res.getResult()}`)
    });

    names.map((name) => {
        return new GreetRequest().setFirstName(name);
    }).forEach((req) => {
        call.write(req)
    });

    call.end();
}

function doGreetEveryone(client) {
    console.log('doGreetEveryone was invoked');

    const names = ['Jamie', 'Lee', 'Anna'];

    const call = client.greetEveryone();

    call.on('data', (res) => {
        console.log(`GreetEveryone: ${res.getResult()}`);
    });

    names.map((name) => {
        return new GreetRequest().setFirstName(name);
    }).forEach((req) => {
        call.write(req)
    });

    call.end();
}

function doGreetWithDeadline(client, ms) {
    console.log('doGreetWithDeadline was invoked');

    const req = new GreetRequest()
        .setFirstName('Jamie');

    client.greetWithDeadline(req, {deadline: new Date(Date.now() + ms)}, (err, res) => {
        if (err) {
            return console.log(err);
        }

        console.log(`GreetWithDeadline: ${res.getResult()}`);
    });
}

function main() {
    const creds = grpc.ChannelCredentials.createInsecure();
    const client = new GreetServiceClient('localhost:50051', creds);

    // doGreet is a unary gRPC implementation; same as REST, one call, one response
    //doGreet(client);
    // doGreetManyTimes is server streaming - client makes one call, and server streams back many responses
    //doGreetManyTimes(client);
    // doLongGreet is client streaming - client makes N calls, server returns one response
    //doLongGreet(client);
    // doGreetEveryone is client and server streaming - client makes N calls, server returns N responses
    //doGreetEveryone(client);
    // doGreetWithDeadline is unary gRPC - testing client deadlines, IE how long to wait
    doGreetWithDeadline(client, 1000);
    client.close();
}

main();
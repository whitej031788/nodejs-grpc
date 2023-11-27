const grpc = require('@grpc/grpc-js');
const {CalculatorServiceClient} = require('../proto/calculator_grpc_pb');
const {SumRequest} = require('../proto/sum_pb');
const {PrimeRequest} = require('../proto/prime_pb');
const {AvgRequest} = require('../proto/avg_pb');
const {MaxRequest} = require('../proto/max_pb');
const {SqrtRequest} = require('../proto/sqrt_pb');

function doSum(client) {
    console.log('doSum was invoked');

    const req = new SumRequest()
        .setFirstNumber(1)
        .setSecondNumber(1);

    client.sum(req, (err, res) => {
        if (err) {
            return console.log(err);
        }

        console.log(`Sum: ${res.getResult()}`);
    });
}

function doPrime(client) {
    console.log('doPrime was invoked');

    const req = new PrimeRequest()
        .setNumber(210);

    const call = client.prime(req);

    call.on('data', (res, err) => {
        console.log(`Prime: ${res.getResult()}`);
    });
}

function doAvg(client) {
    console.log('doAvg was invoked');

    const numArray = [1, 2, 3, 4];

    const call = client.avg((err, res) => {
        if (err) {
            return console.log(err);
        }

        console.log(`Avg: ${res.getResult()}`)
    });

    numArray.map((num) => {
        return new AvgRequest().setNumber(num);
    }).forEach((req) => {
        call.write(req);
    });

    call.end();
}

function doMax(client) {
    console.log('doMax was invoked');

    const numArray = [1, 2, 3, 4, 5, 3, 100, 4, 101, 105, 9, 2, 3, 4];

    const call = client.max();

    call.on('data', (res) => {
        console.log(`Current max: ${res.getResult()}`);
    });

    numArray.map((num) => {
        return new MaxRequest().setNumber(num);
    }).forEach((req) => {
        call.write(req);
    });

    call.end();
}

function doSqrt(client, n) {
    console.log('doSqrt was invoked');

    const req = new SqrtRequest()
        .setNumber(n);

    client.sqrt(req, (err, res) => {
        if (err) {
            return console.log(err);
        }

        console.log(`Sqrt: ${res.getResult()}`);
    });
}

function main() {
    const creds = grpc.ChannelCredentials.createInsecure();
    const client = new CalculatorServiceClient('localhost:50051', creds);

    // doSum is a unary gRPC function, call response
    //doSum(client);
    // doPrime is a server streaming gRPC function, one client call, N server responses
    //doPrime(client);
    // doAvg is a client streaming gRPC function, N client call, one server responses
    //doAvg(client);
    // doMax is a bi directional streaming gRPC function, N client call, N server responses
    //doMax(client);
    // doSqrt is a unary gRPC, showing error handling on server side (no negatives)
    doSqrt(client, -25);
    client.close();
}

main();
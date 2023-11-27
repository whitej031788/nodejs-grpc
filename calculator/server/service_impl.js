const grpc = require('@grpc/grpc-js');
const {SumResponse} = require('../proto/sum_pb');
const {PrimeResponse} = require('../proto/prime_pb');
const {AvgResponse} = require('../proto/avg_pb');
const {MaxResponse} = require('../proto/max_pb');
const {SqrtResponse} = require('../proto/sqrt_pb');

exports.sum = (call, callback) => {
    console.log('Sum was invoked');
    const res = new SumResponse()
        .setResult(
            call.request.getFirstNumber() + call.request.getSecondNumber(),
        );

    callback(null, res);
}

exports.prime = (call, _) => {
    console.log('Prime was invoked');
    const res = new PrimeResponse();

    let N = call.request.getNumber();
    let k = 2;
    while (N > 1) {
        if (N % k == 0) {   // if k evenly divides into N
            N = N / k    // divide N by k so that we have the rest of the number left.
            res.setResult(k);
            call.write(res);      // this is a factor
        } else {
            k = k + 1
        }
    }

    call.end();
}

exports.avg = (call, callback) => {
    console.log('Avg was invoked');
    
    let numCalls = 0;
    let currentTotal = 0;

    call.on('data', (req) => {
        numCalls++;
        currentTotal += req.getNumber();
    });

    call.on('end', () => {
        const res = new AvgResponse()
            .setResult(currentTotal / numCalls);

        callback(null, res);
    });
}

exports.max = (call, callback) => {
    console.log('Max was invoked');
    
    let currentMax = 0;

    call.on('data', (req) => {
        console.log(`Received request ${req}`);
        currentMax = req.getNumber() > currentMax ? req.getNumber() : currentMax;
        const res = new MaxResponse()
            .setResult(currentMax);
        
        console.log(`Sending response ${res}`);
        call.write(res);
    });

    call.on('end', () => {
        call.end();
    });
}

exports.sqrt = (call, callback) => {
    console.log('Sqrt was invoked');

    const number = call.request.getNumber();

    if (number < 0) {
        callback({
            code: grpc.status.INVALID_ARGUMENT,
            message: `Number cannot be negative, received ${number}`
        });
    }
    
    const res = new SqrtResponse()
        .setResult(Math.sqrt(number));

    callback(null, res);
}
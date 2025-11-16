
function calculateSum(a, b) {
    return a + b;
}

const multiply = (x, y) => {
    return x * y;
}

function processData(data) {
    const result = calculateSum(data.a, data.b);
    return multiply(result, 2);
}

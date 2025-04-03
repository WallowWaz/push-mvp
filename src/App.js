import React, { useState } from 'react';

function Calculator() {
  // State for the first number, second number, operator, and result.
  const [num1, setNum1] = useState('');
  const [num2, setNum2] = useState('');
  const [operator, setOperator] = useState('+');
  const [result, setResult] = useState(null);

  // Function to perform the calculation.
  const calculateResult = () => {
    const a = parseFloat(num1);
    const b = parseFloat(num2);
    if (isNaN(a) || isNaN(b)) {
      alert("Please enter valid numbers");
      return;
    }
    
    let res;
    switch (operator) {
      case '+':
        res = a + b;
        break;
      case '-':
        res = a - b;
        break;
      case '*':
        res = a * b;
        break;
      case '/':
        if (b === 0) {
          alert("Cannot divide by zero");
          return;
        }
        res = a / b;
        break;
      default:
        res = 0;
    }
    setResult(res);
  };

  return (
    <div style={{ margin: '2rem' }}>
      <h1>Simple Calculator</h1>
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <input
          type="text"
          value={num1}
          onChange={(e) => setNum1(e.target.value)}
          placeholder="Enter first number"
        />
        <select value={operator} onChange={(e) => setOperator(e.target.value)}>
          <option value="+">+</option>
          <option value="-">-</option>
          <option value="*">*</option>
          <option value="/">/</option>
        </select>
        <input
          type="text"
          value={num2}
          onChange={(e) => setNum2(e.target.value)}
          placeholder="Enter second number"
        />
        <button onClick={calculateResult}>Calculate</button>
      </div>
      {result !== null && (
        <div style={{ marginTop: '1rem' }}>
          <h2>Result: {result}</h2>
        </div>
      )}
    </div>
  );
}

export default Calculator;

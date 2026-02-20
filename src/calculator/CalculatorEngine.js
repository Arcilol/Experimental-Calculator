export default class CalculatorEngine {
  constructor() {
    this.currentValue = "0";
    this.previousValue = null;
    this.operator = null;
    this.waitingForNewValue = false;
    this.memory = 0;
  }

  inputNumber(num) {
    if (this.waitingForNewValue) {
      this.currentValue = num;
      this.waitingForNewValue = false;
    } else {
      this.currentValue =
        this.currentValue === "0" ? num : this.currentValue + num;
    }

    return this.currentValue;
  }

  inputDecimal() {
    if (!this.currentValue.includes(".")) {
      this.currentValue += ".";
    }
    return this.currentValue;
  }

  setOperator(op) {
    if (this.operator && !this.waitingForNewValue) {
      this.calculate();
    }

    this.previousValue = this.currentValue;
    this.operator = op;
    this.waitingForNewValue = true;
  }

  calculate() {
    if (!this.operator || this.previousValue === null) {
      return this.currentValue;
    }

    const a = parseFloat(this.previousValue);
    const b = parseFloat(this.currentValue);

    let result;

    switch (this.operator) {
      case "+":
        result = a + b;
        break;
      case "-":
        result = a - b;
        break;
      case "*":
        result = a * b;
        break;
      case "/":
        if (b === 0) {
          this.clear();
          return "Error";
        }
        result = a / b;
        break;
      default:
        return this.currentValue;
    }

    this.currentValue = result.toString();
    this.operator = null;
    this.previousValue = null;
    this.waitingForNewValue = true;

    return this.currentValue;
  }

  clear() {
    this.currentValue = "0";
    this.previousValue = null;
    this.operator = null;
    this.waitingForNewValue = false;
    return this.currentValue;
  }

  memoryAdd() {
    this.memory += parseFloat(this.currentValue);

    this.currentValue = "0";
    this.waitingForNewValue = false;

    return this.currentValue;
  }

  memoryClear() {
    this.memory = 0;

    this.currentValue = "0";
    this.previousValue = null;
    this.operator = null;
    this.waitingForNewValue = false;

    return this.currentValue;
  }
}

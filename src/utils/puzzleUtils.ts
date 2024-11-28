export function scrambleWords(text: string): string {
  return text
    .split(' ')
    .sort(() => Math.random() - 0.5)
    .join(' ');
}

export function scrambleEquation(equation: string): string {
  const parts = equation.split(/([+\-*/=])/g);
  const operators = parts.filter(p => /[+\-*/=]/.test(p));
  const numbers = parts.filter(p => !/[+\-*/=]/.test(p));
  
  return numbers
    .sort(() => Math.random() - 0.5)
    .reduce((acc, num, i) => {
      if (i === numbers.length - 1) return acc + num;
      return acc + num + (operators[i] || '');
    }, '');
}

export function validateAnswer(userInput: string, solution: string): boolean {
  return userInput.trim().toLowerCase() === solution.trim().toLowerCase();
}

// Generate a random 6-digit code
export const generateSixDigitCode = (): string => {
  const min = 100000; // Lowest 6-digit number
  const max = 999999; // Highest 6-digit number
  const code = Math.floor(Math.random() * (max - min + 1) + min).toString();
  return code;
};

// Validate if a code matches the 6-digit format
export const validateCode = (code: string): boolean => {
  const codeRegex = /^\d{6}$/;
  return codeRegex.test(code);
};

export const generateConfirmationCode = () : Number => {
  const codeLength = 6;
  let code = '';

  for (let i = 0; i < codeLength; i++) {
    const randomDigit = Math.floor(Math.random() * 10);
    code += randomDigit.toString();
  }

  return parseInt(code);
};

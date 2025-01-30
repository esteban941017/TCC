export function validateAmount(value: string) {
  const regex = /^(\d{1,3}(\.\d{3})*|\d+)(,\d{2})?$/;
  if (!regex.test(value)) return null;
  let numericValue = value.replace(/\./g, '');
  numericValue = numericValue.replace(',', '.');
  return String(parseFloat(numericValue));
}

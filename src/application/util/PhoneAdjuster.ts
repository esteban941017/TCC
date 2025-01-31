export default function adjustPhone(phone: string) {
  let adjustedPhone = '';
  if (phone.slice(0, 2) === '55')
    adjustedPhone = `${phone.slice(0, 4)}9${phone.slice(4)}`;
  else if (phone.slice(0, 2) === '57') adjustedPhone = phone;
  return adjustedPhone;
}

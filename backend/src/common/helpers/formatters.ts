export const formatName = (fullName: string) => {
  if (!fullName) return '';
  return fullName
    .split(' ')
    .map((p) => p[0].toUpperCase() + p.slice(1).toLowerCase())
    .join(' ');
};

export const maskEmail = (email: string) => {
  if (!email) return '';
  const [local, domain] = email.split('@');
  return `${local[0]}***@${domain}`;
};

export default { formatName, maskEmail };

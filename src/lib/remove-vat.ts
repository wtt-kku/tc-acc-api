const removeVat = (x: number) => {
  let r = x - (x / 100) * 7;
  let f = (r / 100) * 30;
  return f;
};

export default removeVat;

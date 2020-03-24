const numbers = [];

export default (req, res) => {
  numbers.push(Math.random());

  res.status(200).json({ numbers });
};

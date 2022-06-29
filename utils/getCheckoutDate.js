const JSJoda = require("js-joda");

module.exports = todaysDate => {
  let local = JSJoda.LocalDate;
  return local.parse(todaysDate).plusDays(1).toString();
};

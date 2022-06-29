const days = require("days-in-a-row");
const JSJoda = require("js-joda");

module.exports = selectedDate => {
  let {from, to} = selectedDate;
  if (!to) to = {...from};
  if (from.day < 10) from.day = "0" + from.day;
  if (from.month < 10) from.month = "0" + from.month;
  if (to.day < 10) to.day = "0" + to.day;
  if (to.month < 10) to.month = "0" + to.month;

  const LocalDate = JSJoda.LocalDate;
  function getNumberOfDays(start, end) {
    const start_date = new LocalDate.parse(start);
    const end_date = new LocalDate.parse(end);
    return JSJoda.ChronoUnit.DAYS.between(start_date, end_date);
  }

  var num = getNumberOfDays(
    `${from.year}-${from.month}-${from.day}`,
    `${to.year}-${to.month}-${to.day}`
  );

  return days(new Date(`${from.year}-${from.month}-${from.day}`), num + 1);
};

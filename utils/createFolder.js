const makeDir = require("make-dir");

module.exports = async function (foldername) {
  const path = await makeDir(`public/${foldername}`);
  return {foldername, path};
};

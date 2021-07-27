const { network } = require("hardhat");

async function increase(duration) {
  await network.provider.send("evm_increaseTime", [duration]);
  await network.provider.send("evm_mine", []);
}

const duration = {
  seconds: function (val) {
    return val;
  },
  minutes: function (val) {
    return val * this.seconds(60);
  },
  hours: function (val) {
    return val * this.minutes(60);
  },
  days: function (val) {
    return val * this.hours(24);
  },
};

module.exports = {
  increase,
  duration,
};

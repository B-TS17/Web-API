const Cryptr = require("cryptr");
const dotenv = require("dotenv");
const { cryptoSecret } = require("../config/config");
dotenv.config();

const cryptr = new Cryptr(cryptoSecret, {
  pbkdf2Iterations: 10000,
  saltLength: 10,
});

exports.encodeCipher = (data) => {
  try {
    const encryptedData = cryptr.encrypt(data);
    return encryptedData;
  } catch (err) {
    return "error";
  }
};

exports.decodeCipher = (data) => {
  try {
    let decryptedData = cryptr.decrypt(data);
    return decryptedData;
  } catch (err) {
    return "error";
  }
};

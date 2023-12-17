const mongoose = require("mongoose");

const paymentTypeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
  },
  {
    timestamps: true,
  }
);
const PaymentType = mongoose.model("PaymentType", paymentTypeSchema);

module.exports = PaymentType;

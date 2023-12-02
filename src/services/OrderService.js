const { CONFIG_MESSAGE_ERRORS } = require("../configs");
const Order = require("../models/OrderProduct");
const Product = require("../models/ProductModel");
const EmailService = require("../services/EmailService");
const { preparePaginationAndSorting, buildQuery } = require("../utils");

const updateProductStock = async (order) => {
  try {
    const productData = await Product.findOneAndUpdate(
      { _id: order.product, countInStock: { $gte: order.amount } },
      { $inc: { countInStock: -order.amount, sold: +order.amount } },
      { new: true }
    );

    if (productData) {
      return {
        status: CONFIG_MESSAGE_ERRORS.ACTION_SUCCESS.status,
        message: "Success",
        typeError: "",
        data: productData,
        statusMessage: "Success",
      };
    } else {
      return {
        status: CONFIG_MESSAGE_ERRORS.INVALID.status,
        message: "Error",
        typeError: "",
        statusMessage: "Error",
        id: order.product,
      };
    }
  } catch (error) {
    return {
      status: CONFIG_MESSAGE_ERRORS.INTERNAL_ERROR.status,
      message: "Error",
      typeError: "",
      statusMessage: "Error",
      id: order.product,
    };
  }
};

const createOrder = (newOrder) => {
  return new Promise(async (resolve, reject) => {
    const {
      orderItems,
      paymentMethod,
      itemsPrice,
      shippingPrice,
      totalPrice,
      fullName,
      address,
      city,
      phone,
      user,
      isPaid,
      paidAt,
      email,
    } = newOrder;
    try {
      const promises = newOrder.orderItems.map(updateProductStock);
      const results = await Promise.all(promises);
      const newData = results && results.filter((item) => item.id);
      if (newData.length) {
        const arrId = [];
        newData.forEach((item) => {
          arrId.push(item.id);
        });
        resolve({
          message: `The product with id: ${arrId.join(",")} out of the stock`,
          status: CONFIG_MESSAGE_ERRORS.INTERNAL_ERROR.status,
          typeError: CONFIG_MESSAGE_ERRORS.INVALID.type,
          statusMessage: "Error",
          data: null,
        });
      } else {
        const createdOrder = await Order.create({
          orderItems,
          shippingAddress: {
            fullName,
            address,
            city,
            phone,
          },
          paymentMethod,
          itemsPrice,
          shippingPrice,
          totalPrice,
          user: user,
          isPaid,
          paidAt,
        });
        if (createdOrder) {
          await EmailService.sendEmailCreateOrder(email, orderItems);
          resolve({
            status: CONFIG_MESSAGE_ERRORS.ACTION_SUCCESS.status,
            message: "Success",
            typeError: "",
            data: createdOrder,
            statusMessage: "Success",
          });
        }
      }
    } catch (e) {
      //   console.log('e', e)
      reject(e);
    }
  });
};

const getOrderDetails = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const checkOrder = await checkOrder.findById({
        _id: id,
      });
      if (checkOrder === null) {
        resolve({
          status: CONFIG_MESSAGE_ERRORS.INVALID.status,
          message: "The product is not existed",
          typeError: CONFIG_MESSAGE_ERRORS.INVALID.type,
          data: null,
          statusMessage: "Error",
        });
      }
      resolve({
        status: CONFIG_MESSAGE_ERRORS.GET_SUCCESS.status,
        message: "Success",
        typeError: "",
        data: checkOrder,
        statusMessage: "Success",
      });
    } catch (e) {
      reject(e);
    }
  });
};

const cancelOrderDetails = (id, data) => {
  return new Promise(async (resolve, reject) => {
    try {
      let order = [];
      const promises = data.map(async (order) => {
        const productData = await Product.findOneAndUpdate(
          {
            _id: order.product,
            sold: { $gte: order.amount },
          },
          {
            $inc: {
              countInStock: +order.amount,
              sold: -order.amount,
            },
          },
          { new: true }
        );
        if (productData) {
          order = await Order.findByIdAndDelete(id);
          if (order === null) {
            resolve({
              status: CONFIG_MESSAGE_ERRORS.INVALID.status,
              message: "The product is not existed",
              typeError: CONFIG_MESSAGE_ERRORS.INVALID.type,
              data: null,
              statusMessage: "Error",
            });
          }
        } else {
          resolve({
            status: CONFIG_MESSAGE_ERRORS.GET_SUCCESS.status,
            message: "Success",
            typeError: "",
            data: order.product,
            statusMessage: "Success",
          });
        }
      });
      const results = await Promise.all(promises);
      const newData = results && results[0] && results[0].id;

      if (newData) {
        resolve({
          status: "ERR",
          message: `San pham voi id: ${newData} khong ton tai`,
        });
      }
      resolve({
        status: "OK",
        message: "success",
        data: order,
      });
    } catch (e) {
      reject(e);
    }
  });
};

const getAllOrder = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const limit = params?.limit ?? 10;
      const search = params?.search ?? "";
      const page = params?.page ?? 1;
      const order = params?.order ?? "";
      const user = params.user ?? "";
      const product = params.product ?? "";
      const status = params.status ?? "";

      const query = buildQuery(search);

      const { startIndex, sortOptions } = preparePaginationAndSorting(
        page,
        limit,
        order
      );

      if (user) {
        if (Array.isArray(user)) {
          query.user = { $in: user };
        } else {
          query.user = user;
        }
      }

      if (product) {
        if (Array.isArray(product)) {
          query.product = { $in: product };
        } else {
          query.product = product;
        }
      }

      if (status) {
        if (Array.isArray(status)) {
          query.status = { $in: status };
        } else {
          query.status = status;
        }
      }

      const totalCount = await Order.countDocuments(query);

      const totalPage = Math.ceil(totalCount / limit);

      const fieldsToSelect = {
        status: 1,
        email: 1,
        createdAt: 1,
        updatedAt: 1,
      };
      const allOrder = await Order.find(query)
        .skip(startIndex)
        .limit(limit)
        .sort(sortOptions)
        .select(fieldsToSelect);
      resolve({
        status: CONFIG_MESSAGE_ERRORS.GET_SUCCESS.status,
        message: "Success",
        typeError: "",
        statusMessage: "Success",
        data: {
          orders: allOrder,
          totalPage: totalPage,
          totalCount: totalCount,
        },
      });
    } catch (e) {
      reject(e);
    }
  });
};

const getAllOrderMe = (userId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const limit = params?.limit ?? 10;
      const search = params?.search ?? "";
      const page = params?.page ?? 1;
      const order = params?.order ?? "";
      const product = params.product ?? "";
      const status = params.status ?? "";
      const query = buildQuery(search);
      query.user = userId
      const { startIndex, sortOptions } = preparePaginationAndSorting(
        page,
        limit,
        order
      );

      if (product) {
        if (Array.isArray(product)) {
          query.product = { $in: product };
        } else {
          query.product = product;
        }
      }

      if (status) {
        if (Array.isArray(status)) {
          query.status = { $in: status };
        } else {
          query.status = status;
        }
      }

      const totalCount = await Order.countDocuments(query);

      const totalPage = Math.ceil(totalCount / limit);

      const fieldsToSelect = {
        status: 1,
        email: 1,
        createdAt: 1,
        updatedAt: 1,
      };
      const allOrder = await Order.find(query)
        .skip(startIndex)
        .limit(limit)
        .sort(sortOptions)
        .select(fieldsToSelect);
      resolve({
        status: CONFIG_MESSAGE_ERRORS.GET_SUCCESS.status,
        message: "Success",
        typeError: "",
        statusMessage: "Success",
        data: {
          orders: allOrder,
          totalPage: totalPage,
          totalCount: totalCount,
        },
      });
    } catch (e) {
      reject(e);
    }
  });
};

module.exports = {
  createOrder,
  getOrderDetails,
  cancelOrderDetails,
  getAllOrder,
  getAllOrderMe
};

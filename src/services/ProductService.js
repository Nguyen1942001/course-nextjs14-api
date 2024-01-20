const { CONFIG_MESSAGE_ERRORS } = require("../configs");
const Product = require("../models/ProductModel");
const User = require("../models/UserModel");
const mongoose = require("mongoose");

const createProduct = (newProduct) => {
  return new Promise(async (resolve, reject) => {
    const {
      name,
      image,
      type,
      countInStock,
      price,
      rating,
      description,
      discount,
      slug,
    } = newProduct;
    try {
      const discountStartDate =
        newProduct.discountStartDate && discount
          ? newProduct.discountStartDate
          : null;
      const discountEndDate =
        newProduct.discountEndDate && discount
          ? newProduct.discountEndDate
          : null;
      const checkProduct = await Product.findOne({
        slug: slug,
      });
      if (checkProduct !== null) {
        resolve({
          status: CONFIG_MESSAGE_ERRORS.ALREADY_EXIST.status,
          message: "The product name is existed",
          typeError: CONFIG_MESSAGE_ERRORS.ALREADY_EXIST.type,
          data: null,
          statusMessage: "Error",
        });
      }
      const newProduct = await Product.create({
        name,
        image,
        type,
        countInStock: Number(countInStock),
        price,
        rating,
        description,
        discount: Number(discount),
        slug: slug,
        discountStartDate,
        discountEndDate,
      });
      if (newProduct) {
        resolve({
          status: CONFIG_MESSAGE_ERRORS.ACTION_SUCCESS.status,
          message: "Created product success",
          typeError: "",
          data: newProduct,
          statusMessage: "Success",
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};

const updateProduct = (id, data) => {
  return new Promise(async (resolve, reject) => {
    try {
      const checkProduct = await Product.findOne({
        _id: id,
      });

      if (!checkProduct) {
        resolve({
          status: CONFIG_MESSAGE_ERRORS.INVALID.status,
          message: "The product is not existed",
          typeError: CONFIG_MESSAGE_ERRORS.INVALID.type,
          data: null,
          statusMessage: "Error",
        });
        return;
      }

      if (data.slug && data.slug !== checkRole.slug) {
        const existedName = await Product.findOne({
          slug: data.slug,
          _id: { $ne: id },
        });

        if (existedName !== null) {
          resolve({
            status: CONFIG_MESSAGE_ERRORS.ALREADY_EXIST.status,
            message: "The slug of product is existed",
            typeError: CONFIG_MESSAGE_ERRORS.ALREADY_EXIST.type,
            data: null,
            statusMessage: "Error",
          });
          return;
        }
      }

      const updatedProduct = await Product.findByIdAndUpdate(id, data, {
        new: true,
      });
      resolve({
        status: CONFIG_MESSAGE_ERRORS.ACTION_SUCCESS.status,
        message: "Updated product success",
        typeError: "",
        data: updatedProduct,
        statusMessage: "Success",
      });
    } catch (e) {
      reject(e);
    }
  });
};

const deleteProduct = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const checkProduct = await Product.findOne({
        _id: id,
      });
      if (checkProduct === null) {
        resolve({
          status: CONFIG_MESSAGE_ERRORS.INVALID.status,
          message: "The product is not existed",
          typeError: CONFIG_MESSAGE_ERRORS.INVALID.type,
          data: null,
          statusMessage: "Error",
        });
      }

      await Product.findByIdAndDelete(id);
      resolve({
        status: CONFIG_MESSAGE_ERRORS.ACTION_SUCCESS.status,
        message: "Deleted product success",
        typeError: "",
        data: checkProduct,
        statusMessage: "Success",
      });
    } catch (e) {
      reject(e);
    }
  });
};

const deleteManyProduct = (ids) => {
  return new Promise(async (resolve, reject) => {
    try {
      await Product.deleteMany({ _id: ids });
      resolve({
        status: CONFIG_MESSAGE_ERRORS.ACTION_SUCCESS.status,
        message: "Delete products success",
        typeError: "",
        data: null,
        statusMessage: "Success",
      });
    } catch (e) {
      reject(e);
    }
  });
};

const getDetailsProduct = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const checkProduct = await Product.findOne({
        _id: id,
      });
      if (checkProduct === null) {
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
        data: checkProduct,
        statusMessage: "Success",
      });
    } catch (e) {
      reject(e);
    }
  });
};

const getAllProduct = (params) => {
  return new Promise(async (resolve, reject) => {
    try {
      const limit = +params?.limit ?? 10;
      const search = params?.search ?? "";
      const page = +params?.page ?? 1;
      const order = params?.order ?? "";
      const productType = params?.productType ?? "";
      const query = {};

      if (productType) {
        const productTypeIds = productType
          ?.split("|")
          .map((id) => mongoose.Types.ObjectId(id));
        query.type =
          productTypeIds.length > 1
            ? { $in: productTypeIds }
            : mongoose.Types.ObjectId(productType);
      }
      if (search) {
        const searchRegex = { $regex: search, $options: "i" };

        query.$or = [{ name: searchRegex }];
      }

      const totalCount = await Product.countDocuments(query);

      const totalPage = Math.ceil(totalCount / limit);

      const startIndex = (page - 1) * limit;

      let sortOptions = {};
      if (order) {
        const orderFields = order
          .split(",")
          .map((field) => field.trim().split(" "));
        orderFields.forEach(([name, direction]) => {
          sortOptions[name] = direction.toLowerCase() === "asc" ? 1 : -1;
        });
      }

      const fieldsToSelect = {
        image: 1,
        name: 1,
        createdAt: 1,
        updatedAt: 1,
        price: 1,
        totalLikes: 1,
        averageRating: 1,
        type: 1,
        type: {
          id: "$typeInfo._id",
          name: "$typeInfo.name",
        },
      };

      if (page === -1 && limit === -1) {
        const allProduct = await Product.aggregate([
          { $match: query },
          {
            $lookup: {
              from: "reviews",
              localField: "_id",
              foreignField: "product",
              as: "reviews",
            },
          },
          {
            $addFields: {
              averageRating: {
                $ifNull: [{ $avg: "$reviews.star" }, 0],
              },
            },
          },
          {
            $lookup: {
              from: "producttypes",
              localField: "type",
              foreignField: "_id",
              as: "typeInfo",
            },
          },
          {
            $unwind: "$typeInfo",
          },
          {
            $project: fieldsToSelect,
          },
        ]);

        resolve({
          status: CONFIG_MESSAGE_ERRORS.GET_SUCCESS.status,
          message: "Success",
          typeError: "",
          statusMessage: "Success",
          data: {
            products: allProduct,
            totalPage: 1,
            totalCount: totalCount,
          },
        });
        return;
      }

      const pipeline = [
        { $match: query },
        { $sort: sortOptions },
        { $skip: startIndex },
        { $limit: limit },
        {
          $lookup: {
            from: "reviews",
            localField: "_id",
            foreignField: "product",
            as: "reviews",
          },
        },
        {
          $addFields: {
            averageRating: {
              $ifNull: [{ $avg: "$reviews.star" }, 0],
            },
          },
        },
        {
          $lookup: {
            from: "producttypes",
            localField: "type",
            foreignField: "_id",
            as: "typeInfo",
          },
        },
        {
          $unwind: "$typeInfo",
        },
        {
          $project: fieldsToSelect,
        },
      ];

      const allProduct = await Product.aggregate(pipeline);

      resolve({
        status: CONFIG_MESSAGE_ERRORS.GET_SUCCESS.status,
        message: "Success",
        typeError: "",
        statusMessage: "Success",
        data: {
          products: allProduct,
          totalPage: totalPage,
          totalCount: totalCount,
        },
      });
    } catch (e) {
      reject(e);
    }
  });
};

const likeProduct = (productId, userId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const existingUser = await User.findById(userId);
      const existingProduct = await Product.findById(productId);

      if (existingUser === null) {
        resolve({
          status: CONFIG_MESSAGE_ERRORS.INVALID.status,
          message: "The user is not existed",
          typeError: CONFIG_MESSAGE_ERRORS.INVALID.type,
          data: null,
          statusMessage: "Error",
        });
      }
      if (existingProduct === null) {
        resolve({
          status: CONFIG_MESSAGE_ERRORS.INVALID.status,
          message: "The product is not existed",
          typeError: CONFIG_MESSAGE_ERRORS.INVALID.type,
          data: null,
          statusMessage: "Error",
        });
      }
      if (existingUser.likedProducts?.includes(productId)) {
        resolve({
          status: CONFIG_MESSAGE_ERRORS.INVALID.status,
          message: "The product is liked",
          typeError: CONFIG_MESSAGE_ERRORS.INVALID.type,
          data: null,
          statusMessage: "Error",
        });
      }
      existingUser.likedProducts.push(productId);
      existingProduct.totalLikes += 1;
      existingProduct.likedBy.push(existingUser._id);

      await existingUser.save();
      await existingProduct.save();
      resolve({
        status: CONFIG_MESSAGE_ERRORS.ACTION_SUCCESS.status,
        message: "Liked product success",
        typeError: "",
        data: null,
        statusMessage: "Success",
      });
    } catch (e) {
      reject(e);
    }
  });
};

const unlikeProduct = (productId, userId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const existingUser = await User.findById(userId);
      const existingProduct = await Product.findById(productId);

      if (existingUser === null) {
        resolve({
          status: CONFIG_MESSAGE_ERRORS.INVALID.status,
          message: "The user is not existed",
          typeError: CONFIG_MESSAGE_ERRORS.INVALID.type,
          data: null,
          statusMessage: "Error",
        });
      }
      if (existingProduct === null) {
        resolve({
          status: CONFIG_MESSAGE_ERRORS.INVALID.status,
          message: "The product is not existed",
          typeError: CONFIG_MESSAGE_ERRORS.INVALID.type,
          data: null,
          statusMessage: "Error",
        });
      }
      if (!existingUser.likedProducts?.includes(productId)) {
        resolve({
          status: CONFIG_MESSAGE_ERRORS.INVALID.status,
          message: "The product isn't liked",
          typeError: CONFIG_MESSAGE_ERRORS.INVALID.type,
          data: null,
          statusMessage: "Error",
        });
      }
      existingUser.likedProducts = existingUser.likedProducts.filter(
        (id) => id !== productId
      );
      existingProduct.likedBy = existingProduct.likedBy.filter(
        (id) => id !== existingUser?._id
      );
      existingProduct.totalLikes -= 1;

      await existingProduct.save();
      await existingUser.save();
      resolve({
        status: CONFIG_MESSAGE_ERRORS.ACTION_SUCCESS.status,
        message: "UnLiked product success",
        typeError: "",
        data: null,
        statusMessage: "Success",
      });
    } catch (e) {
      reject(e);
    }
  });
};

const autoUpdateDiscounts = async () => {
  const currentDate = new Date();

  try {
    const productsToUpdate = await Product.find({
      discountEndDate: { $lte: currentDate },
      discount: { $gt: 0 },
    });

    for (const product of productsToUpdate) {
      product.discount = 0;
      await product.save();
    }
  } catch (error) {
    console.error("Error updating discounts:", error);
  }
};

module.exports = {
  createProduct,
  updateProduct,
  getDetailsProduct,
  deleteProduct,
  getAllProduct,
  deleteManyProduct,
  likeProduct,
  unlikeProduct,
  autoUpdateDiscounts,
};

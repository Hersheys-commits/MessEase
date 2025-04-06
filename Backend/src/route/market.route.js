import express from "express";
import verifyJWT from "../middleware/auth.middleware.js";
import upload from "../middleware/multer.middleware.js";
import {
  createProduct,
  updateProduct,
  deleteProduct,
  getMyListings,
  getProductById,
  getAllProducts,
  markProductsAsSold,
  buyNow,
  verifyPayment,
  getUserOrders,
} from "../controller/market.controller.js";

import {
  addReview,
  getReviews,
  deleteReview,
} from "../controller/review.controller.js";

import {
  addToWishlist,
  removeFromWishlist,
  getWishlist,
} from "../controller/wishlist.controller.js";
const router = express.Router();

router.get("/products", verifyJWT, getAllProducts);
router.get("/products/:id", verifyJWT, getProductById);
router.post("/products", verifyJWT, upload.array("images", 5), createProduct);
router.put(
  "/products/:id",
  verifyJWT,
  upload.array("images", 5),
  updateProduct
);
router.delete("/products/:id", verifyJWT, deleteProduct);
router.get("/wishlist/", verifyJWT, getWishlist);
router.post("/wishlist/:productId", verifyJWT, addToWishlist);
router.delete("/wishlist/:productId", verifyJWT, removeFromWishlist);
router.get("/my-listings", verifyJWT, getMyListings);
router.put("/products/:id/mark-sold", verifyJWT, markProductsAsSold);
router.get("/products/:productId/reviews", verifyJWT, getReviews);
router.post("/products/:productId/reviews", verifyJWT, addReview);
router.delete(
  "/products/:productId/reviews/:reviewId",
  verifyJWT,
  deleteReview
);
router.post("/:productId/buy", verifyJWT, buyNow);
router.post("/verify-payment", verifyPayment);
router.get("/orders", verifyJWT, getUserOrders);

export default router;

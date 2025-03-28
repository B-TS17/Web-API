const express = require("express");
const router = express.Router();
const {
  registerUser,
  verifyuser,
  loginuser,
} = require("../controller/user/auth");
const { addKYC, getAllKYC, checkKYC } = require("../controller/user/kyc");
const checkUser = require("../middleware/checkUser");
const { uploadKyc } = require("../utils/kycuploadfile");
const {
  getuser,
  updateuser,
  changepassword,
  forgetPassword,
  newPassword,
} = require("../controller/user/user");
const { body } = require("express-validator");

router.post(
  "/register-user",
  [
    body("name")
      .exists()
      .notEmpty()
      .withMessage("Please Enter the name")
      .isLength({ min: 3 })
      .withMessage("Name must be at least 3 characters long")
      .isLength({ max: 30 })
      .withMessage("Name must be at most 30 characters long"),
    body("email")
      .exists()
      .notEmpty()
      .withMessage("Please Enter the email")
      .isEmail()
      .withMessage("Please Enter a valid email"),
    body("password")
      .exists()
      .notEmpty()
      .withMessage("Please Enter the password")
      .isLength({ min: 5 })
      .withMessage("Password must be at least 5 characters long")
      .isLength({ max: 30 })
      .withMessage("Password must be at most 30 characters long"),
  ],
  registerUser
);
router.post("/verify-user/:token", verifyuser);
router.post(
  "/login-user",
  [
    body("email")
      .exists()
      .notEmpty()
      .withMessage("Please Enter the email")
      .isEmail()
      .withMessage("Please Enter a valid email"),
    body("password")
      .exists()
      .notEmpty()
      .withMessage("Please Enter the password")
      .isLength({ min: 5 })
      .withMessage("Password must be at least 5 characters long")
      .isLength({ max: 30 })
      .withMessage("Password must be at most 30 characters long"),
  ],
  loginuser
);
router.post("/add-kyc", checkUser, uploadKyc, addKYC);
router.get("/kyc", checkUser, getAllKYC);
router.get("/kyc/check", checkUser, checkKYC);
router.get("/", checkUser, getuser);
router.post("/update-user", checkUser, updateuser);
router.post(
  "/change-password",
  [
    body("newpassword")
      .exists()
      .notEmpty()
      .withMessage("Please Enter Password.")
      .isLength({ min: 5 })
      .withMessage("New Password - minimum characters 5.")
      .isLength({ max: 40 })
      .withMessage("New Password - maximum characters 40."),
    body("oldpassword")
      .exists()
      .notEmpty()
      .withMessage("Please Enter Password.")
      .isLength({ min: 5 })
      .withMessage("Old Password - minimum characters 5.")
      .isLength({ max: 40 })
      .withMessage("Old Password - maximum characters 40."),
  ],
  checkUser,
  changepassword
);
router.post(
  "/email/forget-email",
  [
    body("email")
      .exists()
      .notEmpty()
      .withMessage("Please Enter the email")
      .isEmail()
      .withMessage("Please Enter a valid email"),
  ],
  forgetPassword
);
router.post(
  "/forget-password/:token",
  [
    body("password")
      .exists()
      .notEmpty()
      .withMessage("Please Enter Password.")
      .isLength({ min: 5 })
      .withMessage("Password - minimum characters 5.")
      .isLength({ max: 40 })
      .withMessage("Password - maximum characters 40."),
  ],
  newPassword
);

module.exports = router;

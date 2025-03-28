const express = require("express");
const router = express.Router();
const {
  createAdmin,
  getAdmin,
  updateAdmin,
  changePassword,
  getalladmins,
} = require("../controller/admin/admin");
const { adminLogin } = require("../controller/admin/auth");
const checkAdmin = require("../middleware/checkAdmin");
const {
  getalluser,
  getsingleuser,
  createuserbyadmin,
  verifyuserByAdmin,
  updateuserbyadmin,
  deleteuserbyadmin,
  alluserpasswordlist,
  changePasswordbyadmin,
  searchuser,
  filterUser,
} = require("../controller/admin/user");
const {
  getalluserkycbyadmin,
  getsingleuserkycbyadmin,
} = require("../controller/admin/kyc");
const { body } = require("express-validator");

router.post(
  "/create-admin",
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
  createAdmin
);
router.post(
  "/login-admin",
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
  adminLogin
);
router.put(
  "/update-admin",
  [
    body("name")
      .exists()
      .notEmpty()
      .withMessage("Please Enter Name.")
      .isLength({ min: 3 })
      .withMessage("Name - minimum characters 3.")
      .isLength({ max: 40 })
      .withMessage("Name - maximum characters 40."),
    body("email")
      .exists()
      .notEmpty()
      .withMessage("Please Enter Email.")
      .isEmail()
      .withMessage("Please enter a valid Email."),
  ],
  checkAdmin,
  updateAdmin
);
router.get("/get-admin", checkAdmin, getAdmin);
router.put(
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
  checkAdmin,
  changePassword
);
router.get("/all", checkAdmin, getalladmins);
//   USER
router.get("/user/all", checkAdmin, getalluser);
router.get("/user/:id", checkAdmin, getsingleuser);
router.post(
  "/user/create",
  [
    body("name")
      .exists()
      .notEmpty()
      .withMessage("Please Enter Name.")
      .isLength({ min: 3 })
      .withMessage("Name - minimum characters 3.")
      .isLength({ max: 30 })
      .withMessage("Name - maximum characters 30."),
    body("email")
      .exists()
      .notEmpty()
      .withMessage("Please Enter Email.")
      .isEmail()
      .withMessage("Please enter a valid Email."),
    body("password")
      .exists()
      .notEmpty()
      .withMessage("Please Enter Password.")
      .isLength({ min: 5 })
      .withMessage("Password - minimum characters 5.")
      .isLength({ max: 40 })
      .withMessage("Password - maximum characters 40."),
  ],
  checkAdmin,
  createuserbyadmin
);
router.put("/user/verify/:id", checkAdmin, verifyuserByAdmin);
router.put(
  "/user/update/:id",
  [
    body("name")
      .exists()
      .notEmpty()
      .withMessage("Please Enter Name.")
      .isLength({ min: 3 })
      .withMessage("Name - minimum characters 3.")
      .isLength({ max: 30 })
      .withMessage("Name - maximum characters 30."),
    body("email")
      .exists()
      .notEmpty()
      .withMessage("Please Enter Email.")
      .isEmail()
      .withMessage("Please enter a valid Email."),
  ],
  checkAdmin,
  updateuserbyadmin
);
router.delete("/user/delete/:id", checkAdmin, deleteuserbyadmin);
router.get("/user-passwordlist", checkAdmin, alluserpasswordlist);
router.put(
  "/user/change-password",
  [
    body("userId", "Please add User id")
      .exists()
      .notEmpty()
      .withMessage("Please add User id"),
    body("password")
      .exists()
      .notEmpty()
      .withMessage("Please Enter Password.")
      .isLength({ min: 5 })
      .withMessage("Password - minimum characters 5.")
      .isLength({ max: 40 })
      .withMessage("Password - maximum characters 40."),
  ],
  checkAdmin,
  changePasswordbyadmin
);
router.get("/usersearch", checkAdmin, searchuser);
router.get("/filter", checkAdmin, filterUser);
//kyc
router.get("/kyc/all", checkAdmin, getalluserkycbyadmin);
router.get("/kyc/:id", checkAdmin, getsingleuserkycbyadmin);

module.exports = router;

const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

/* GET /user/  */
router.get("/signup", userController.renderSignup);
router.get("/login", userController.renderLogin);
router.get("/logout", userController.logoutUser);

/* POST /user/  */
router.post("/signup", userController.registerUser);
router.post("/login", userController.loginUser);

module.exports = router;

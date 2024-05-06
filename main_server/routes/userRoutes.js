const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

router.post("/register", userController.registerUser);
router.get("/confirm-email", userController.confirmEmail);
router.post("/login", userController.loginUser);
router.get("/:userId", userController.getUser);
router.put("/:userId", userController.updateUser);
router.delete("/:userId", userController.deleteUser);
router.get("/", userController.getAllUsers);

module.exports = router;

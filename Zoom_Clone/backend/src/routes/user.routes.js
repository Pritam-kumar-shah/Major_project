// import { Router } from "express";

// const router = Router();

// router.route("/login");
// router.route("/register");
// router.route("/add_to_activity");
// router.route("/get_all_activity");
// export default router;

import express from "express";
import {
  register,
  login,
  addContact,
  getContacts,
  searchUserByEmail,
} from "../controller/UserAuth.js";

import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);

router.post("/contacts/add", authMiddleware, addContact);
router.get("/contacts", authMiddleware, getContacts);
router.get("/contacts/search/:email", authMiddleware, searchUserByEmail);

export default router;

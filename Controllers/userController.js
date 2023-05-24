const bcrypt = require("bcrypt");
const db = require("../Models");
const jwt = require("jsonwebtoken");
const config = require("../config");
const { sendMail, MAIL_TEMPLATES } = require("../Services/Mail");
const twoFactor = require("node-2fa");
const crypto = require("crypto");
const { FRONTEND_BASE_URL } = require("../config");
const User = db.users;

const signup = async (req, res) => {
  try {
    const { userName, email, password } = req.body;
    const data = {
      userName,
      email,
      password: await bcrypt.hash(password, 10),
    };
    const user = await User.create(data);
    const newSecret = twoFactor.generateSecret({
      name: user.userName,
      account: user.email,
    });
    user.twoFASecret = newSecret.secret;
    await user.save();
    if (user) {
      return res.status(200).send("User has been created successfully");
    } else {
      return res.status(409).send("Details are not correct");
    }
  } catch (error) {
    console.log(error);
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({
      where: {
        email: email,
      },
    });
    if (user) {
      const isSame = await bcrypt.compare(password, user.password);
      if (isSame) {
        const { token: twoFAToken } = twoFactor.generateToken(user.twoFASecret);
        sendMail(user.email, MAIL_TEMPLATES.TWO_FA, {
          userName: user.userName,
          twoFAToken,
        })
          .then(() => {})
          .catch((err) => console.log(err));
        return res
          .status(200)
          .send("2FA Authentication Token has been sent your email");
      } else {
        return res.status(401).send("Authentication failed");
      }
    } else {
      return res.status(401).send("Authentication failed");
    }
  } catch (error) {
    console.log(error);
  }
};

const verifyTwoFAToken = async (req, res) => {
  try {
    const { email, twoFAToken } = req.body;
    const user = await User.findOne({
      where: {
        email: email,
      },
    });

    if (user) {
      console.log(typeof twoFAToken);
      const isVerifiedToken = twoFactor.verifyToken(
        user.twoFASecret,
        twoFAToken
      );
      console.log(isVerifiedToken);
      if (isVerifiedToken) {
        let token = jwt.sign({ id: user.id }, config.JWT_SECRET_KEY, {
          expiresIn: 24 * 60 * 60 * 1000,
        });
        res.cookie("jwt", token, { maxAge: 24 * 60 * 60, httpOnly: true });
        return res.status(200).send(user);
      } else {
        return res.status(401).send("Authentication failed");
      }
    } else {
      return res.status(401).send("Authentication failed");
    }
  } catch (error) {
    console.log(error);
  }
};

const getPasswordResetLink = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({
      where: {
        email: email,
      },
    });
    if (user) {
      user.passwordResetToken = crypto.randomBytes(32).toString("hex");
      await user.save();
      sendMail(user.email, MAIL_TEMPLATES.FORGOT_PASSWORD, {
        userName: user.userName,
        link: `${FRONTEND_BASE_URL}/reset-password/${user.passwordResetToken}`,
      })
        .then(() => {})
        .catch((err) => console.log(err));
      res.status(200).send("Reset password Link has been sent to mail");
    } else {
      res.status(400).send("Bad request");
    }
  } catch (error) {
    console.log(error);
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, passwordResetToken, newPassword } = req.body;
    const user = await User.findOne({
      where: {
        email,
        passwordResetToken,
      },
    });
    if (user) {
      user.password = await bcrypt.hash(newPassword, 10);
      await user.save();
      res.status(200).send("Password has been reset successfully");
    } else {
      res.status(400).send("Bad request");
    }
  } catch (error) {
    console.log(error);
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { userName, email, password } = req.body;
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).send("User not found");
    }
    user.userName = userName;
    user.email = email;
    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }
    await user.save();
    return res.status(200).send({user, status: "User details have been updated successfully"});
  } catch (error) {
    console.log(error);
    return res.status(500).send("Internal server error");
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).send("User not found");
    }
    return res.status(200).json(user);
  } catch (error) {
    console.log(error);
    return res.status(500).send("Internal server error");
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll();

    return res.status(200).json(users);
  } catch (error) {
    console.log(error);
    return res.status(500).send("Internal server error");
  }
};

const deleteUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).send("User not found");
    }
    await user.destroy();
    return res.status(200).send("User has been deleted successfully");
  } catch (error) {
    console.log(error);
    return res.status(500).send("Internal server error");
  }
};

module.exports = {
  signup,
  login,
  verifyTwoFAToken,
  getPasswordResetLink,
  resetPassword,
  updateUser,
  getUserById,
  getAllUsers,
  deleteUserById,
};

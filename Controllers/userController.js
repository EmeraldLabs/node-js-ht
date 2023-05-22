//importing modules
const bcrypt = require("bcrypt");
const db = require("../Models");
const jwt = require("jsonwebtoken");
const config = require("../config");
const { sendMail, MAIL_TEMPLATES } = require('../Services/Mail');
const twoFactor = require("node-2fa");
const crypto = require("crypto");
const {FRONTEND_BASE_URL} = require('../config');

// Assigning users to the variable User
const User = db.users;

//signing a user up
//hashing users password before its saved to the database with bcrypt
const signup = async (req, res) => {
  try {
    const { userName, email, password } = req.body;
    const data = {
      userName,
      email,
      password: await bcrypt.hash(password, 10),
    };
    //saving the user
    const user = await User.create(data);

    const newSecret = twoFactor.generateSecret({ name: user.userName, account: user.email });

    user.twoFASecret = newSecret.secret;
    await user.save();

    //if user details is captured
    //generate token with the user's id and the secretKey in the env file
    // set cookie with the token generated
    if (user) {
      return res.status(201).send("User has been created successfully");
    } else {
      return res.status(409).send("Details are not correct");
    }
  } catch (error) {
    console.log(error);
  }
};

//login authentication

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    //find a user by their email
    const user = await User.findOne({
      where: {
        email: email,
      },
    });

    //if user email is found, compare password with bcrypt
    if (user) {
      const isSame = await bcrypt.compare(password, user.password);

      //if password is the same
      //generate token with the user's id and the secretKey in the env file

      if (isSame) {

        const { token: twoFAToken } = twoFactor.generateToken(user.twoFASecret);
        sendMail(
          user.email,
          MAIL_TEMPLATES.TWO_FA,
          {userName: user.userName, twoFAToken })
          .then(() => {})
          .catch((err) => console.log(err));
        //send user data
        return res.status(200).send("2FA Authentication Token has been sent your email");
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

    //find a user by their email
    const user = await User.findOne({
      where: {
        email: email,
      },
    });

    if (user) {
      console.log(typeof twoFAToken);
      const isVerifiedToken = twoFactor.verifyToken(user.twoFASecret, twoFAToken);

      console.log(isVerifiedToken);

      if (isVerifiedToken) {
        let token = jwt.sign({ id: user.id }, config.JWT_SECRET_KEY, {
          expiresIn: 24 * 60 * 60 * 1000,
        });

        //if two-fa is successful
        //go ahead and generate a cookie for the user
        res.cookie("jwt", token, { maxAge: 24 * 60 * 60, httpOnly: true });
        return res.status(201).send(user);
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

    //find a user by their email
    const user = await User.findOne({
      where: {
        email: email,
      },
    });

    if (user) {
      user.passwordResetToken = crypto.randomBytes(32).toString("hex");
      await user.save();
      sendMail(
        user.email,
        MAIL_TEMPLATES.FORGOT_PASSWORD,
        {
          userName: user.userName,
          link: `${FRONTEND_BASE_URL}/reset-password/${user.passwordResetToken}`
        }
      )
        .then(() => {})
        .catch((err) => console.log(err));
      res.status(200).send("Reset password Link has been sent to mail")
    } else {
      res.status(400).send("Bad request")
    }
  } catch (error) {
    console.log(error);
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, passwordResetToken, newPassword } = req.body;

    //find a user by their email
    const user = await User.findOne({
      where: {
        email,
        passwordResetToken
      },
    });
    if (user) {
      user.password = await bcrypt.hash(newPassword, 10);
      await user.save();
      res.status(200).send("Password has been reset successfully");
    } else {
      res.status(400).send("Bad request")
    }
  } catch (error) {
    console.log(error)
  }
};


module.exports = {
  signup,
  login,
  verifyTwoFAToken,
  getPasswordResetLink,
  resetPassword
};

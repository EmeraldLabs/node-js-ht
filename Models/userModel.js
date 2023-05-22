//user model
module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    "user",
    {
      userName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        unique: true,
        isEmail: true, //checks for email format
        allowNull: false,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      twoFASecret: {
        type: DataTypes.STRING,
        allowNull: true
      },
      passwordResetToken: {
        type: DataTypes.STRING,
        allowNull: true
      }
    },
    {timestamps: true}
  );
};

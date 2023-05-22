module.exports = {
  TWO_FA: ({ userName, twoFAToken }) => ({
    SUBJECT: 'Test Node 2FA Authentication Code!',
    TEXT: `
  Hi, ${userName},
  
  Your 2FA Authentication Code is: ${twoFAToken}
  
  Team,
  Test Node
  `
  }),
  FORGOT_PASSWORD: ({ userName, link }) => ({
    SUBJECT: 'Test Node Reset Password',
    TEXT: `
  Hi, ${userName},
  
  Please, use the link below to reset your password. Remember, this link will expire in 7 days.
  
  ${link}
  `
  })
};

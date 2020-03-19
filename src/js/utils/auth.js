const validateUser = user =>
  new Promise((resolve, reject) => {
    console.log(user);
    if (!user || user === null) {
      reject({ mssage: "No user with this mail", status: 400 });
    }
    resolve(user);
  });

module.exports.validateUser = validateUser;

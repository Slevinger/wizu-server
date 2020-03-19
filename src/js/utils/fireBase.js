const firebaseAdmin = require("firebase-admin");
const serviceAccount = require("../const/firebaseServiceAccount.json");
const isEmpty = require("lodash").isEmpty;

firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(serviceAccount),
  storageBucket: "gs://wizu-8c986.appspot.com/",
  databaseURL: "https://wizu-8c986.firebaseio.com"
});

const bucket = firebaseAdmin.storage().bucket("gs://wizu-8c986.appspot.com/");

const uploadImageToStorage = (file, dest, name) => {
  return new Promise(async (resolve, reject) => {
    if (!file) {
      reject("No image file");
    }
    const desc = name.split("_")[0];
    const files = await bucket.getFiles({ prefix: `${dest}/${desc}` });
    if (!isEmpty(files[0])) {
      await files[0].forEach(file => {
        file.delete();
      });
    }
    const parts = file.originalname.split(".");
    const newFileName = (name
      ? `${name}.${parts[parts.length - 1]}`
      : `${new Date().getTime()}-${file.originalname}`
    )
      .split("/")
      .join("%2F");

    let fileUpload = bucket.file(`${dest}/${newFileName}`);

    const blobStream = fileUpload.createWriteStream({
      metadata: {
        contentType: file.mimetype,
        size: file.size
      }
    });

    blobStream.on("error", error => {
      reject("Something is wrong! Unable to upload at the moment.");
    });

    blobStream.on("finish", () => {
      const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${
        bucket.name
      }/o/${encodeURI(fileUpload.name)
        .split("/")
        .join("%2F")}`;

      resolve(publicUrl);

      // The public URL can be used to directly access the file via HTTP.
    });

    blobStream.end(file.buffer);
  });
};

module.exports = {
  bucket,
  firebaseAdmin,
  setProfileImage: (user, file) =>
    uploadImageToStorage(file, `users/${user.id}`, `avatar__${user.__v}`),
  setEventImage: (event, file) =>
    uploadImageToStorage(
      file,
      `events/${event.id}`,
      `main-img__${new Date().getMilliseconds()}`
    )
};

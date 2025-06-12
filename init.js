const mongoose = require("mongoose");
const Chat = require("./models/chat.js");

main().catch((err) => console.log(err));

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/whatsapp");
}

let AllChat = [
  {
    form: "Moiz",
    to: "Butt",
    msg: "hello butt how are you!",
    created_at: new Date(),
  },
  {
    form: "Home",
    to: "Office",
    msg: "Going from home to office",
    created_at: new Date(),
  },
  {
    form: "College",
    to: "Country",
    msg: "Moving Abroad",
    created_at: new Date(),
  },
  {
    form: "Bahria",
    to: "Town",
    msg: "Living in a Bahria town!",
    created_at: new Date(),
  },
];

Chat.insertMany(AllChat);


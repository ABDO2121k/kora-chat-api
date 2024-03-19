import openai from "openai";
import fs from "fs";

const creteFile = async (filePath) => {
  try {
    const client = new openai({ apiKey: process.env.OPEN_AI_SECRET });
    const file = await client.files.create({
      file: fs.createReadStream(filePath),
      purpose: "assistants",
    });
    console.log("file id : ", file.id);
  } catch (err) {
    throw new Error(err.message);
  }
};

const createAssistant = async (filesId) => {
  try {
    const client = new openai({ apiKey: process.env.OPEN_AI_SECRET });
    const assistant = await client.beta.assistants.create({
      name: "kora chatbot",
      description:
        "your are an assitant for football and match organisation and players comunity ",
      instructions:
        "talk as you are one of the website , use we or our website ...., the website name is ftbHub you can read the cahier de charge to answer to the question and you should answer withe shortness possible answer",
      model: "gpt-3.5-turbo-0125",
      tools: [{ type: "code_interpreter" }],
      file_ids: [...filesId],
    });
    return console.log("assistant id", assistant.id);
  } catch (err) {
    console.log(err.message);
    throw new Error(err.message);
  }
};

export const SendMessage = async (req, res) => {
  try {
    let { message, thread } = req.body;
    thread = "";
    console.log("message 122222", req.body);
    const client = new openai({ apiKey: process.env.OPEN_AI_SECRET });
    let conversation;
    if (thread && thread != "") {
      conversation = thread;
    } else {
      const createdThead = await client.beta.threads.create();
      conversation = await createdThead.id;
    }
    await client.beta.threads.messages.create(conversation, {
      role: "user",
      content: message,
    });
    const run = await client.beta.threads.runs.create(conversation, {
      assistant_id: process.env.ASSISTANT_ID,
    });
    let status = await client.beta.threads.runs.retrieve(conversation, run.id);

    while (status.status !== "completed") {
      await new Promise((resolve) => setTimeout(resolve, 100));
      status = await client.beta.threads.runs.retrieve(conversation, run.id);
      console.log(status);
      if (["failed", "completed", "expired"].includes(status.status)) {
        if (status.status == "failed") {
          console.log("error in status ", status.last_error.message);
          throw new Error(
            " error while get the infos check your rate limit in openai"
          );
        }
        break;
      }
    }

    const messages = await client.beta.threads.messages.list(conversation);
    return res.status(201).json({
      response: messages.data[0].content[0].text.value,
      thread: conversation,
    });
  } catch (err) {
    console.log(err);
    return res.status(501).json({ err: err.message });
  }
};

// setTimeout(()=>{
//     createAssistant(["file-rwSSSWBsrO6aiT7Rh6yWPSS6","file-z2SbmV3HiV0zCSJXSamFNTdp"])
// },2000)

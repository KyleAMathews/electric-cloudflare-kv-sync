import { ShapeStream, ChangeMessage, ControlMessage, Message } from "@electric-sql/client";

function isChangeMessage(message: Message): message is ControlMessage {
  return "key" in message;
}

const stream = new ShapeStream({
  url: `http://localhost:3000/v1/shape/organizations`,
  parser: {
    int8: (value) => parseInt(value, 10),
  },
});

stream.subscribe(async (messages) => {
  // Remove control messages and transform to the id: rowValue form we'll want
  // in the Worker KV store.
  const transformedMessages = messages
    .filter((message) => isChangeMessage(message))
    .map((message: ChangeMessage<any>) => {
      return {
        [message.value.id]: JSON.stringify(message.value),
        operation: message.headers.operation
      };
    });

  await fetch(`http://localhost:65094`, {
    method: `POST`,
    body: JSON.stringify(transformedMessages),
  });
});

function parseTopic(topic: string) {
  return topic.toLocaleLowerCase().replace(" / ", "_").replace(" ", "+")
}

export default parseTopic
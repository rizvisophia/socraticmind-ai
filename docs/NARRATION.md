# Technical explanation

HTML and CSS build the interface, while JavaScript manages student interactions. My **Socratic Question Engine** sends the student's answers through a Node.js backend to OpenAI's Responses API, including lesson context, conversation history, and an interaction counter. The AI responds with one guiding question or hint at a time, aiming to bring the conversation to a conclusion within three to six answer turns. OpenAI generates the live tutoring language; my code controls lesson progression, interface updates, and server-side API security.

Note: The app currently starts with a curated question. The model generates subsequent questions adaptively; it does not precompute an entire list of questions at session creation.

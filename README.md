This project permits upload images, get text from them and send requiest to ChatGpt APi.
Frontend: Angular 20 / backend: Nest.js
Depended on: Tesseract.js + Sharp for extract text.
❗️ npm install tesseract.js sharp multer @nestjs/platform-express

The response firstly returns full text.
Finaly can get response in JSON format from ChatGPT. (you need to save your api key in .env)

# SecureChat
Simple secure end to end messaging tool

Steps to run:
1. cd server
2. python3 run.py manage_db
3. python3 run.py
5. cd client
6. npm run start
7. reset local storage and cookies in browsers
8. https://localhost:3000

Summary
1. End to end encryption between server and client using HTTPS. The certificate is
self-signed.
2. User registration with error message if the username/password is blank or the
username is already taken.
3. User authentication. If the login details are incorrect an error message is shown.
A logged in user can also logout.
4. The ability to add friends.
5. Live chat and chat history. The chat functionality is encrypted so that only the
chat participants can see the messages and a digital signature is generated for
each message to ensure message integrity.
6. A user who is not logged in cannot view friends, chat history or chat. If they do
they will be redirected to a 401 unauthorised page.

Sitemap
![image](https://github.com/alice-xuu/SecureChat/assets/61668791/7bd8af82-7e56-4735-b3a0-252ebb0895b7)

Screenshots
<img width="842" alt="Screen Shot 2023-10-08 at 11 07 32 pm" src="https://github.com/alice-xuu/SecureChat/assets/61668791/fed18afc-66c0-4e76-b380-884ea74a96f8">
<img width="729" alt="Screen Shot 2023-10-08 at 11 09 40 pm" src="https://github.com/alice-xuu/SecureChat/assets/61668791/33889f12-ef1a-45e1-a50d-ef1106400c8a">

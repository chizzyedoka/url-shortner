import express from 'express';
import {authenticationMiddleware} from './middlewares/auth.middleware.js';
import { userRouter } from './routes/user.routes.js';
import { urlRouter } from './routes/url.routes.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());


app.get('/', (req, res) => {
  return res.json({ message: 'Server is up and running....' });
});


app.use('/api/users', userRouter);
app.use('/api/urls', urlRouter);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
import express from 'express';
import {authenticationMiddleware} from './middlewares/authentication.middleware.js';
import { userRouter } from './routes/user.routes.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());


app.get('/', (req, res) => {
  return res.json({ message: 'Server is up and running....' });
});

app.use(authenticationMiddleware);

app.use('/api/users', userRouter);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
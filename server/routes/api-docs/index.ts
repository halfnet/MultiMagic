
import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';
import { specs } from '../../swagger';

const router = Router();

router.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

export default router;

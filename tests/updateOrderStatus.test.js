const request = require('supertest');
const app = require('../src/app');
const db = require('../src/database/database');

describe('PUT /orders/:id/status', () => {

    let createdOrderId;

    beforeAll(async () => {
        const newOrder = {
            items: [{ pizzaId: 1, qty: 1 }],
            email: 'test@test.com'
        };

        const response = await request(app)
            .post('/orders')
            .send(newOrder);

        createdOrderId = response.body.id;
    });

    it('should successfully update status to PREPARING', async () => {
        const response = await request(app)
            .put(`/orders/${createdOrderId}/status`)
            .send({ status: 'PREPARING' })
            .expect('Content-Type', /json/)
            .expect(200);

        expect(response.body).toHaveProperty('id', createdOrderId);
        expect(response.body).toHaveProperty('status', 'PREPARING');
    });

    it('should correctly update status to DELIVERING', async () => {
        const response = await request(app)
            .put(`/orders/${createdOrderId}/status`)
            .send({ status: 'DELIVERING' })
            .expect(200);

        expect(response.body.status).toBe('DELIVERING');
    });

    it('should correctly update status to DELIVERED', async () => {
        const response = await request(app)
            .put(`/orders/${createdOrderId}/status`)
            .send({ status: 'DELIVERED' })
            .expect(200);

        expect(response.body.status).toBe('DELIVERED');
    });

    it('should return 400 for an invalid status', async () => {
        const response = await request(app)
            .put(`/orders/${createdOrderId}/status`)
            .send({ status: 'INVALID_STATUS' })
            .expect(400);

        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toContain('Invalid status provided');
    });

    it('should return 400 if status is missing', async () => {
        const response = await request(app)
            .put(`/orders/${createdOrderId}/status`)
            .send({})
            .expect(400);

        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toBe('Status field is required in the body');
    });

    it('should return 404 for a non-existent order id', async () => {
        const response = await request(app)
            .put('/orders/99999/status')
            .send({ status: 'PREPARING' })
            .expect(404);

        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toBe('Order not found');
    });

    it('should return 400 for a badly formatted order id', async () => {
        const response = await request(app)
            .put('/orders/abc/status')
            .send({ status: 'PREPARING' })
            .expect(400);

        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toBe('Invalid order ID format');
    });
});

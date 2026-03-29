const request = require('supertest');
const app = require('../src/app');
const db = require('../src/database/database');

describe('Order History API', () => {

    it('should require an email when creating an order', async () => {
        const orderWithoutEmail = {
            items: [{ pizzaId: 1, qty: 1 }],
            promoCode: ""
        };

        const response = await request(app)
            .post('/orders')
            .send(orderWithoutEmail)
            .expect(400);

        expect(response.body.error).toBe('email is required');
    });

    it('should return empty list for email with no orders', async () => {
        const response = await request(app)
            .get('/orders/user/nonexistent@example.com')
            .expect(200);

        expect(response.body).toEqual([]);
    });
});

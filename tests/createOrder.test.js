const request = require('supertest');
const app = require('../app');

describe('POST /orders', () => {

    it("test de création d'une commande", async () => {
        const newOrder = {
            items: [{ pizzaId: 2, qty: 1 }],
            promoCode: ""
        };

        const response = await request(app)
            .post('/orders')
            .send(newOrder)
            .expect('Content-Type', /json/)
            .expect(200);

        expect(response.body).toHaveProperty('id');
        expect(response.body).toHaveProperty('totalHT');
        expect(response.body).toHaveProperty('totalTTC');
        expect(response.body).toHaveProperty('status');
        expect(response.body.status).toBe('CREATED');
        expect(typeof response.body.totalHT).toBe('number');
    });

    it('test de la fonction createOrder avec FREEPIZZA (10 au lieu de 0)', async () => {
        const orderWithPromo = {
            items: [{ pizzaId: 1, qty: 2 }],
            promoCode: "FREEPIZZA"
        };

        const response = await request(app)
            .post('/orders')
            .send(orderWithPromo)
            .expect(200);

        expect(response.body.totalHT).toBe(10);
    });

    it('test createOrder entrées invalides', async () => {
        const invalidOrder = {
            promoCode: ""
        };

        const response = await request(app)
            .post('/orders')
            .send(invalidOrder)
            .expect(400);

        expect(response.body).toHaveProperty('error');
    });
});

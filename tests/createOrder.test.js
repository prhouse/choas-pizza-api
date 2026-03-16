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
        expect(response.body).toHaveProperty('total');
        expect(response.body).toHaveProperty('status');
        expect(response.body.status).toBe('CREATED');
        expect(typeof response.body.total).toBe('number');
    });

    it('test de la fonction createOrder avec FREEPIZZA doit être 0', async () => {
        const orderWithPromo = {
            items: [{ pizzaId: 1, qty: 2 }],
            promoCode: "FREEPIZZA"
        };
        const response = await request(app)
            .post('/orders')
            .send(orderWithPromo)
            .expect(200);

        expect(response.body.total).toBe(0);
    });

    it('test de la fonction createOrder avec FREEPIZZA et plus de 3 articles doit rester 0', async () => {
        const bigOrderWithPromo = {
            items: [{ pizzaId: 1, qty: 1 }, { pizzaId: 2, qty: 1 }, { pizzaId: 3, qty: 1 }, { pizzaId: 4, qty: 1 }],
            promoCode: "FREEPIZZA"
        };
        const response = await request(app)
            .post('/orders')
            .send(bigOrderWithPromo)
            .expect(200);

        expect(response.body.total).toBe(0);
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

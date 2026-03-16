const request = require('supertest');
const app = require('../app');
const utils = require('../utils');

describe('VAT calculations and response', () => {

    describe('utils.calculateTTC', () => {
        it('should calculate TTC correctly for 10% VAT', () => {
            expect(utils.calculateTTC(100)).toBe(110);
            expect(utils.calculateTTC(10)).toBe(11);
            expect(utils.calculateTTC(15.5)).toBe(17.05);
        });

        it('should handle zero HT', () => {
            expect(utils.calculateTTC(0)).toBe(0);
        });
    });

    describe('POST /orders response format', () => {
        it('should return totalHT and totalTTC', async () => {
            const newOrder = {
                items: [{ pizzaId: 1, qty: 1 }],
                promoCode: ""
            };

            const response = await request(app)
                .post('/orders')
                .send(newOrder)
                .expect(200);

            expect(response.body).toHaveProperty('totalHT');
            expect(response.body).toHaveProperty('totalTTC');

            expect(response.body.totalTTC).toBe(utils.round(response.body.totalHT * 1.1));
        });
    });
});

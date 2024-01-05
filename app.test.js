const request = require('supertest')
const app = require('./app')

describe('Express API', () => {
    it('GET /allblogs --> array blogs', () => {
        return request(app)
            .get('/allblogs')
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(200)
            .then((response) => {
                expect(response.body).toEqual(
                    expect.arrayContaining([
                        expect.objectContaining({
                            titre : expect.any(String),
                            description : expect.any(String)
                        })
                    ])
                )
            })
    });

    it('GET /blog/id --> specific blog by ID', () => {
        return request(app)
            .get('/blog/6581aa1957c8b527f5fec4f5')
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(200)
            .then((response) => {
                expect(response.body).toEqual(
                        expect.objectContaining({
                            titre : expect.any(String),
                            description : expect.any(String)
                        })
                )
            })
    });

    it('GET /blog/id --> 404 user not found', () => {
        return request(app).get('/blog/99999999999999999')
            .expect(404)
    });

    it('POST /addblog --> create blog', () => {
        return request(app).post('/addblog').send({
            titre : "titre exemple",
            description : "description exemple"
        })
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect(201)
        .then(response => {
            expect(response.body).toEqual(
                expect.objectContaining({
                    result : expect.any(String)
                })
            )
        })
    });

    /* it('POST /addblog --> validate blog', () => {
        return request(app).post('/addblog').send({ titre : 123 })
        .expect(422)
    }); */
})
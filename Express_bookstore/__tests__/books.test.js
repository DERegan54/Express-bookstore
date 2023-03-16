// Tests for Express Bookstore app

process.env.NODE_ENV = "test"
const request = require("supertest");
const app = require("../app");
const db = require("../db");


let bookISBN;

beforeEach(async() => {
    let result = await db.query (`
        INSERT INTO 
            books (isbn, amazon_url, author, language, pages, publisher, title, year)
            VALUES(
                '000000001', 
                'http://a.co/test.com', 
                'Dr.Seuss', 
                'English', 
                45, 
                'Penguin Publishers', 
                'The Cat in the Hat', 
                1964)
            RETURNING isbn`);
    
    bookISBN = result.rows[0].isbn
}); 


describe("POST /books", function () {
    test("Adds a new book to db", async function () {
        const response = await request(app)
            .post(`/books`)
            .send({
                isbn: '000000002',
                amazon_url: "httb://a.co/test.com",
                author: "Test Author",
                language: "English",
                pages: 10,
                publisher: "Test Books",
                title: "Test Title",
                year: 2023
            });
        expect(response.statusCode).toBe(201);
        expect(response.body.book).toHaveProperty("isbn");
    });


    test("Tries to create a book without title", async function () {
        const response = await request(app)
        .post(`/books`)
        .send({year: 2022});
        expect(response.statusCode).toBe(400);
    });
});


describe("GET /books", function () {
    test("Gets a list of all (1) books", async function() {
        const response = await request(app).get(`/books`);
        const books = response.body.books;
        expect(books[0]).toHaveProperty("isbn");
    });

    test("Responds with 404 if book can't be found", async function() {
        const response = await request(app).get(`/books/22`);
        expect(response.statusCode).toBe(404);
    });
});


describe("GET /books/:isbn", function() {
    test("Gets a book via isbn", async function() {
        const response = await request(app)
            .get(`/books/${bookISBN}`);
        expect(response.statusCode).toBe(200);
        expect(response.body.book.isbn).toBe(bookISBN);
    })

    test("Responds 404 if book can't be found", async function () {
        const response = await request(app).get(`/books/10`);
        expect(response.statusCode).toBe(404);
    });
});


describe("PUT /books/:id", function () {
    test("Updates a book", async function() {
        const response = await request(app)
            .put(`/books/${bookISBN}`)
            .send({
                amazon_url: "httb://a.co/test.com",
                author: "Test Author",
                language: "English",
                pages: 100,
                publisher: "Test Books",
                title: "New Title",
                year: 2023
            });
        expect(response.body.book.title).toBe("New Title");
    });

    test("Tries to update a book without a title", async function() {
        const response = await request(app)
            .put(`/books/${bookISBN}`)
            .send({
                isbn: '0000000002',
                amazon_url: "httb://a.co/test.com",
                author: "Test Author",
                language: "english",
                pages: 100,
                Publisher: "Test Books",
                Year: 2023       
            });
        expect(response.statusCode).toBe(400);
    });
});


describe("DELETE /books/:isbn", function () {
    test("Deletes a book", async function () {
        const response = await request(app)
            .delete(`/books/${bookISBN}`)
        expect(response.body).toEqual({message: "Book deleted"});
    });
});

afterEach(async function() {
    await db.query("DELETE FROM BOOKS");
});

afterAll(async function() {
    await db.end();
});
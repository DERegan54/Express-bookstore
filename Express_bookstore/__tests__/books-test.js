// Tests for Express Bookstore app

process.env.NODE_ENV = "test"

const app = require("../app");
const db = require("../db");
const request = require("supertest");

let bookISBN

beforeEach(async() => {
    let result = db.query (
        `INSERT INTO books ("isbn", "amazon-url", "author", "language", "pages", "publisher", "title", "year")
        VALUES ("0000000001", "http://a.co/test.com", "Dr.Seuss", "english", 45, "Penguin", "The Cat in the Hat", 1964)
        RETURNING isbn`
    )
    book = result.rows[0];
}); 

describe("GET /books", function () {
    test("Gets a list of all (1) books", async function() {
        const response = await request(app).get(`/books`);
        const books = response.body.books;
        expect(books[0]).toHaveProperty("isbn");
    });

    test("Response with 404 if book can't be found", async function() {
        const response = await request(app).get(`books/22`);
        expect(response.statusCode).toBe(404);
    });
});

describe("GET /books/:isbn", function() {
    test("Gets a book via isbn", async function() {
        const response = await request(app).get(`/books/0000000001`);
        expect(response.statusCode).toBe(200);
        expect(books[0].title).toEqual("The Cat in the Hat");
    })

    test("Responds 404 if book can't be found", async function () {
        const response = await request(app).get(`/books/0000000010`);
        expect(response.statusCode).toBe(404);
    })
})

describe("POST /books", function () {
    test("Adds a new book to db", async function () {
        const response = await request(app).post(`/books`).send({
            isbn: "0000000002",
            amazon_url: "httb://a.co/test.com",
            author: "Test Author",
            language: "english",
            pages: 10,
            Publisher: "Test Books",
            Title: "Test Title",
            Year: 2023
        });
        expect(response.statusCode).toBe(201);
        expect(response.body.book).toHaveProperty("isbn");
});

    test("Tries to create a book without isbn", async function () {
        const response = await (await request(app).post(`/books`)).send({title: "Green Eggs and Ham"});
        expect(response.statusCode).toBe(400);
    });

describe("PUT /books/:isbn", function () {
    test("Updates a book", async function() {
        const response = await request(app).put(`/books/0000000002`).send({
            amazon_url: "httb://a.co/test.com",
            author: "Test Author",
            language: "english",
            pages: 100,
            Publisher: "Test Books",
            Title: "Test Title",
            Year: 2023
        });
        expect(response.body.book.pages).toEqual(100);
    });

    test("Tries to update a book without a title", async function() {
        const response = await (await request(app).put(`/books/0000000002`)).send({
            amazon_url: "httb://a.co/test.com",
            author: "Test Author",
            language: "english",
            pages: 100,
            Publisher: "Test Books",
            Year: 2023       
        });
        expect(statusCode).toBe(201);
    });
})

describe("DELETE /books/:isbn", function () {
    test("Deletes a book", async function () {
        const response = await request(app).delete(`/books/${bookISBN}`);
        expect(response.body).toEqual({message: "Book deleted"});
    });
});

afterEach(async function() {
    await db.query("DELETE BOOKS");
});

afterAll(async function() {
    await db.end();
})
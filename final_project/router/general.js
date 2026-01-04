const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const getBooks = () => {
    return new Promise((resolve, reject) => {
        if (books) resolve(books);
        else reject("No books available");
    });
};

const getByISBN = (isbn) => {
    return new Promise((resolve, reject) => {
        const book = books[isbn];
        if (book) resolve(book);
        else reject({ status: 404, message: `ISBN ${isbn} not found` });
    });
};

public_users.post("/register", (req, res) => {
    const { username, password } = req.body;
    if (!username || !password)
        return res.status(400).json({ message: "Username and password required" });

    if (users.find(u => u.username === username))
        return res.status(409).json({ message: "Username already exists" });

    users.push({ username, password });
    return res.status(201).json({ message: "User registered successfully" });
});

public_users.get('/', async (req, res) => {
    try {
        const bookList = await getBooks();
        res.json(bookList);
    } catch (error) {
        res.status(500).json({ message: error });
    }
});

public_users.get('/isbn/:isbn', (req, res) => {
    getByISBN(req.params.isbn)
        .then(book => res.json(book))
        .catch(error => res.status(error.status || 500).json({ message: error.message || error }));
});

public_users.get('/author/:author', (req, res) => {
    const author = req.params.author;
    getBooks()
        .then(allBooks => Object.values(allBooks))
        .then(allBooks => allBooks.filter(book => book.author === author))
        .then(filteredBooks => res.json(filteredBooks))
        .catch(error => res.status(500).json({ message: error }));
});

public_users.get('/title/:title', (req, res) => {
    const title = req.params.title;
    getBooks()
        .then(allBooks => Object.values(allBooks))
        .then(allBooks => allBooks.filter(book => book.title === title))
        .then(filteredBooks => res.json(filteredBooks))
        .catch(error => res.status(500).json({ message: error }));
});

public_users.get('/review/:isbn', (req, res) => {
    getByISBN(req.params.isbn)
        .then(book => res.json(book.reviews))
        .catch(error => res.status(error.status || 500).json({ message: error.message || error }));
});

public_users.post("/login", (req, res) => {
    const { username, password } = req.body;
    if (!username || !password)
        return res.status(400).json({ message: "Username and password required" });

    const user = users.find(u => u.username === username && u.password === password);
    if (user) return res.status(200).json({ message: "Login successful" });

    return res.status(401).json({ message: "Invalid username or password" });
});

public_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const { username, review } = req.body;

    if (!username || !review)
        return res.status(400).json({ message: "Username and review required" });
    if (!books[isbn]) return res.status(404).json({ message: "Book not found" });

    books[isbn].reviews[username] = review;
    return res.status(200).json({ message: "Review added/updated", reviews: books[isbn].reviews });
});

public_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const { username } = req.body;

    if (!username) return res.status(400).json({ message: "Username required" });
    if (!books[isbn] || !books[isbn].reviews[username])
        return res.status(404).json({ message: "Review not found" });

    delete books[isbn].reviews[username];
    return res.status(200).json({ message: "Review deleted", reviews: books[isbn].reviews });
});

async function getAllBooks() {
    try {
        const booksList = await getBooks();
        console.log("Task 10 – All Books:");
        console.log(booksList);
    } catch (error) {
        console.error("Task 10 Error:", error);
    }
}

function getBookByISBN(isbn) {
    getByISBN(isbn)
        .then(book => {
            console.log(`Task 11 – Book with ISBN ${isbn}:`);
            console.log(book);
        })
        .catch(error => console.error(`Task 11 Error: ${error.message || error}`));
}

function getBooksByAuthor(author) {
    getBooks()
        .then(allBooks => Object.values(allBooks))
        .then(allBooks => allBooks.filter(book => book.author === author))
        .then(filteredBooks => {
            console.log(`Task 12 – Books by Author ${author}:`);
            console.log(filteredBooks);
        })
        .catch(error => console.error(`Task 12 Error: ${error}`));
}

function getBooksByTitle(title) {
    getBooks()
        .then(allBooks => Object.values(allBooks))
        .then(allBooks => allBooks.filter(book => book.title === title))
        .then(filteredBooks => {
            console.log(`Task 13 – Books with Title "${title}":`);
            console.log(filteredBooks);
        })
        .catch(error => console.error(`Task 13 Error: ${error}`));
}

(async () => {
    await getAllBooks();
    getBookByISBN(1);
    getBooksByAuthor("Chinua Achebe");
    getBooksByTitle("Things Fall Apart");
})();

module.exports.general = public_users;

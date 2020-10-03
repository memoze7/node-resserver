// ========================
// puerto
// ========================

process.env.PORT = process.env.PORT || 3000;


process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

// ========================
// DB
// ========================

let urlDB;

if (process.env.NODE_ENV === 'dev') {
    urlDB = 'mongodb://localhost:27017';
} else {
    urlDB = `mongodb+srv://guidevde:MT2xQU85bXKv8h61@cluster0.ojqdy.mongodb.net`
}

process.env.URLDB = urlDB;
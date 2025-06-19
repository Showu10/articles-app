require('dotenv').config();

const mongoose = require('mongoose');
const express = require('express');
const methodOverride = require('method-override');

const app = express();
const port = 3000;

app.use(express.static('public'));
app.use(methodOverride('_method'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set('view engine', 'ejs');

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log("Connected to MongoDB Atlas"))
.catch(err => console.error("Connection Error:", err));

const articleSchema = new mongoose.Schema({
    title: String,
    article: String
});
const Article = mongoose.model('Article', articleSchema);

app.get('/', (req, res) => {
    res.redirect('/articles');
});

app.get('/articles', async (req, res) => {
    const articles = await Article.find();
    res.render('index', { articles });
});

app.post('/articles', async (req, res) => {
    const { title, article } = req.body;
    const newArticle = new Article({ title, article });
    await newArticle.save();
    res.redirect('/articles');
});

app.get('/articles/:id', async (req, res) => {
    try {
        const article = await Article.findById(req.params.id);
        if (!article) return res.status(404).send("404! Article Not Found");
        res.render('article', { article });
    } catch (err) {
        res.status(500).send("Invalid Article ID");
    }
});

app.put('/articles/:id', async (req, res) => {
    try {
        const { title, article } = req.body;
        const updated = await Article.findByIdAndUpdate(req.params.id, { title, article }, { new: true });
        if (!updated) return res.status(404).send("404! Article Not Found");
        res.redirect(`/articles/${req.params.id}`);
    } catch (err) {
        res.status(500).send("Error updating article");
    }
});

app.delete('/articles/:id', async (req, res) => {
    try {
        await Article.findByIdAndDelete(req.params.id);
        res.redirect('/articles');
    } catch (err) {
        res.status(500).send("Error deleting article");
    }
});

app.get('/api/articles', async (req, res) => {
    const articles = await Article.find();
    res.json(articles);
})

app.listen(port, () => console.log(`Server running at http://localhost:${port}`));
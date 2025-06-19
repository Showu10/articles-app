require('dotenv').config();

const mongoose = require('mongoose');
const express = require('express');
const methodOverride = require('method-override');
const app = express();
const path = require('path');
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

app.get('/notes', async (req, res) => {
    const articles = await Article.find();
    res.render('index', { articles });
});

app.post('/notes', async (req, res) => {
    const { title, article } = req.body;
    const newArticle = new Article({ title, article });
    await newArticle.save();
    res.redirect('/notes');
});

app.get('/notes/:id', async (req, res) => {
    try {
        const article = await Article.findById(req.params.id);
        if (!article) return res.status(404).send("404! Note Not Found");
        res.render('article', { article });
    } catch (err) {
        res.status(500).send("Invalid Note ID");
    }
});

app.put('/notes/:id', async (req, res) => {
    try {
        const { title, article } = req.body;
        const updated = await Article.findByIdAndUpdate(req.params.id, { title, article }, { new: true });
        if (!updated) return res.status(404).send("404! Note Not Found");
        res.redirect(`/notes/${req.params.id}`);
    } catch (err) {
        res.status(500).send("Error updating note");
    }
});

app.delete('/notes/:id', async (req, res) => {
    try {
        await Article.findByIdAndDelete(req.params.id);
        res.redirect('/notes');
    } catch (err) {
        res.status(500).send("Error deleting note");
    }
});

app.get('/api/notes', async (req, res) => {
    const articles = await Article.find();
    res.json(articles);
})

app.get('/api/notes/:id', async (req, res) => {
  try {
    const note = await Article.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }
    res.json(note);
  } catch (err) {
    return res.status(404).json({ error: "Invalid ID" });
  }
});

app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});

app.listen(port, () => console.log(`Server running at http://localhost:${port}`));
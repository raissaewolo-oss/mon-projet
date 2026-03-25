const express = require('express');
const sqlite3 = require('sqlite3').verbose();;
const app = express();
const port = 3000;

app.use(express.json());

const db = new
sqlite3.Database('./sblog.sqlite',(err) => {
    if (err){
        console.error('Erreur BD :', err.message);
    } 
        else{
            console.log('connecte a la base SQlite.');
            
            db.run(`
                CREATE TABLE IF NOT EXISTS articles (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                titre TEXT NOT null,
                contenu TEXT,
                auteur TEXT NOT null,
                date TEXT DEFAULT_CURRENT_DATE,
                categorie TEXT,
                tags TEXT 
            )
        `,(err) => {
            if (err)
                console.error('Erreur creation table :', err.message);
            else
                console.log('Table "articles"prete.');
            });
        }
    });
   

    
app.get('/',(req, res) => {
        res.send('Mon API de blog fonctionne !');
});
 
app.post('/api/articles', (req, res) => {
    const { titre, contenu, auteur, categorie, tags } = req.body;
    if(!titre || !auteur) {
        return res.status(400).json({ error: 'le titre et l\,auteur sont obligatoire' });
    }
    const tagsString = tags ? JSON.stringify(tags): null;
    const sql = `INSERT INTO articles (titre, contenu, auteur, categorie, tags) VALUES (?, ?, ?, ?, ?)`;
    db.run(sql, [titre, contenu, auteur, categorie,tagsString], function(err) {
        if (err) {
            console.error('Erreur insertion', err);
            return res.status(500).json({ error: err.message});
        }
        const id = this.lastID;
res.status(201).json({ id: id, message: 'l\'article est cree avec succes!'});
    });
})
 
app.get('/api/articles', (req, res) => { 
    const sql = `SELECT * FROM articles`;
    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        const articles = rows.map(row => {
            if(row.tags) {
                try { row.tags = JSON.parse(row.tags);} catch(e) {}
            }
            return row;

        });
        res.json(articles);

    });
});

app.get('/api/articles/:id', (req, res) => {
    const id = req.params.id;
    const sql = `SELECT * FROM articles WHERE id = ?`;
    db.get(sql, [id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (row.tags) {
            try { row.tags = JSON.parse(row.tags); } catch(e) {}
        }
        res.json(row);
    });
});
app.put('/api/articles/:id', (req, res) => {
    const id = req.params.id;  
    const { titre, contenu, categorie, tags } = req.body;
    const tagsString = tags ? JSON.stringify(tags): null;
    let update =[];
    let params = [];
    if (titre !== undefined) {
        update.push('titre = ?');
        params.push(titre);
    }
     if (contenu !== undefined) {
        update.push('contenu = ?');
        params.push(contenu);
    }
     if (categorie !== undefined) {
        update.push('categorie = ?');
        params.push(categorie);
    }
     if (tagsString !== undefined) {
        update.push('tags = ?');
        params.push(tagsString);
    }
    if (update.length === 0) {
        return res.status(400).json({ error: 'Aucune donnee a modifier'});
    }
    params.push(id);
    const sql = `UPDATE articles SET ${update.join(', ')} WHERE id = ?`;
    db.run(sql, params, 
        function(err) {
            if (err) {
                console.error('Erreur de modification', err);
                 return res.status(500).json({ error: err.message});
            }
            if (this.changes === 0) {
                return res.status(404).json({ error: 'Article non trouvé'});
            }
            res.json({ message: 'Aricle modifie avec succes'});
    
    });
})


app.delete('/api/articles/:id', (req, res) => {
    const id = req.params.id;  
    const sql = `DELETE FROM articles WHERE id = ?;`
    db.run(sql, [id], function(err) {
            if (err) {
                 return res.status(500).json({ error: err.message});
            }
            if (this.changes === 0) {
                 return res.status(404).json({ error: 'Article non trouvé'});
                 }
            res.json({ message: 'Aricle supprime avce succes'});
    });
})

app.get('/api/articles/search', (req, res) => {
    const query = req.query.query;
    if (!query) {
        return res.status(400).json({ error: 'le parametre "query" est requis' });
    }
    const sql = `SELECT FROM articles WHERE titre LIKE ? OR contenu LIKE ?`;
    const searchTerm = `%${query}%`;
    db.all(sql, [searchTerm,searchTerm], (err, rows) => {
        if(err) {
            res.status(500).json({ error: err.message});
        }
        const articles = rows.map(row => {
            if ( row.tags) {
                try { row.tags = JSON.parse(outerWidth.tags);

                 } catch(e){}
            }
            return row;
        });
        res.json(articles);
     });
});


app.listen(port, () => {
    console.log(`serveur demarre sur http:??localhost:${port}`);

});








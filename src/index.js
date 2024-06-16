require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const morgan = require('morgan');
const cors = require('cors');
const colors = require('colors');
const { Client } = require('@elastic/elasticsearch');

const client = new Client({
    node: 'http://localhost:9200',
    auth: {
        username: 'elastic',
        password: '123456789',
    },
    log: 'trace',
});

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());
app.use(morgan('combined'));
app.use(helmet());
const port = process.env.PORT || 3000;

client
    .info()
    .then((response) => console.log(response))
    .catch((error) => console.error(error));

// Create index
app.get('/create-index', async (req, res) => {
    try {
        const rs = await client.indices.create({ index: 'todos' });
        return res.status(201).json({ data: rs });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

app.get('/create-todo-document', async (req, res) => {
    try {
        const todo = await (await fetch('https://jsonplaceholder.typicode.com/todos/1')).json();
        await client.index({
            index: 'todos',
            id: todo.id,
            body: {
                ...todo,
            },
        });
        await client.indices.refresh({ index: 'todos' });
        return res.status(201).json({ data: todo });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

//Get single document
app.get('/get-single-todo', async (req, res) => {
    try {
        const rs = await client.get({
            index: 'todos',
            id: 1,
        });
        return res.status(200).json({ data: rs });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});
// Get all document
app.get('/get-all-todo', async (req, res) => {
    try {
        const data = await client.search({
            index: 'todos',
            body: {
                query: {
                    match_all: {},
                },
            },
        });
        const hits = data.body.hits.hits;
        const dataMatch = hits.map((hit) => hit._source);
        return res.status(200).json(dataMatch);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

//Search
app.get('/search-todo', async (req, res) => {
    try {
        const data = await client.search({
            index: 'todos',
            body: {
                query: {
                    match: {
                        title: 'delectus',
                    },
                },
            },
        });
        const hits = data.body.hits.hits;
        const dataMatch = hits.map((hit) => hit._source);
        return res.status(200).json(dataMatch);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

app.get('/update-todo', async (req, res) => {
    try {
        const data = await client.update({
            index: 'todos',
            id: 1,
            refresh: true,
            body: {
                doc: {
                    userId: 1,
                    id: 1,
                    title: 'delectus aut autem update',
                    completed: false,
                },
            },
        });
        return res.status(200).json({ data });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});
app.get('/update-todo-query', async (req, res) => {
    try {
        const data = await client.updateByQuery({
            index: 'todos',
            body: {
                script: {
                    source: 'ctx._source.priority = "high";',
                    lang: 'painless',
                },
                query: {
                    match: {
                        completed: false,
                    },
                },
            },
        });
        return res.status(200).json({ data });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

//Add field priority = high
app.get('/update-todo-query', async (req, res) => {
    try {
        const data = await client.updateByQuery({
            index: 'todos',
            body: {
                script: {
                    source: 'ctx._source.priority = "high";',
                    lang: 'painless',
                },
                query: {
                    match: {
                        completed: false,
                    },
                },
            },
        });
        return res.status(200).json({ data });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});
app.get('/delete-todo', async (req, res) => {
    try {
        const data = await client.delete({
            index: 'todos',
            id: 1,
        });
        return res.status(200).json({ data });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

app.get('/delete-all-todo', async (req, res) => {
    try {
        const data = await client.delete({
            index: 'todos',
            body: {
                query: {
                    match_all: {},
                },
            },
        });
        return res.status(200).json({ data });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

app.get('/delete-index-todos', async (req, res) => {
    try {
        const data = await client.indices.delete({ index: 'todos' });
        return res.status(200).json({ data });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

//asStream
app.get('/bulk-todos', async (req, res) => {
    try {
        const todos = await (
            await fetch('https://jsonplaceholder.typicode.com/todos?_limit=3')
        ).json();

        const bulkOps = [];
        todos.forEach((todo) => {
            bulkOps.push({
                index: {
                    _index: 'todos',
                    _id: todo.id,
                },
            });
            bulkOps.push(todo);
        });
        const { body: bulkResponse } = await client.bulk({ body: bulkOps, refresh: true });
        if (bulkResponse.errors) {
            console.log(bulkResponse);
            process.exit(1);
        }
        return res.status(200).json({ data: bulkResponse });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

//Create index and document
app.get('/', async (req, res) => {
    try {
        await client.index({
            index: 'game-of-thrones',
            body: {
                character: 'Ned Stark',
                quote: 'Winter is coming.',
            },
        });

        await client.index({
            index: 'game-of-thrones',
            body: {
                character: 'Daenerys Targaryen',
                quote: 'I am the blood of the dragon.',
            },
        });

        await client.index({
            index: 'game-of-thrones',
            body: {
                character: 'Tyrion Lannister',
                quote: 'A mind needs books like a sword needs whetstone.',
            },
        });
        await client.indices.refresh({ index: 'game-of-thrones' });
        return res.status(201).json('Created successfully');
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

app.get('/read', async (req, res) => {
    try {
        // Record match field quote = 'blood'
        // const data = await client.search({
        //     index: 'game-of-thrones',
        //     body: {
        //         query: {
        //             match: {
        //                 // quote: 'blood',
        //             },
        //         },
        //     },
        // });
        const data = await client.search({
            index: 'game-of-thrones',
            body: {
                query: {
                    match_all: {
                        // quote: 'blood',
                    },
                },
            },
        });
        const hits = data.body.hits.hits;
        const dataMatch = hits.map((hit) => hit._source);
        return res.status(200).json(dataMatch);
    } catch (error) {
        return res.status(500).json(error);
    }
});

app.get('/delete', async function (req, res) {
    try {
        // Delete by index

        // await client.indices.delete({
        //     index: 'game-of-thrones',
        // });

        // Delete all index
        await client.indices.delete({
            index: '_all',
        });

        return res.status(200).json('Deleted successfully');
    } catch (error) {
        return res.status(500).json(error);
    }
});
app.listen(port, () => console.log(colors.green(`Server listening on http://localhost:${port}`)));
module.exports = app;

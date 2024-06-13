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
        return res.status(500).json(error);
    }
});

app.get('/read', async (req, res) => {
    try {
        const data = await client.search({
            index: 'game-of-thrones',
            body: {
                query: {
                    match: {
                        quote: 'blood',
                    },
                },
            },
        });
        return res.status(200).json(data);
    } catch (error) {
        return res.status(500).json(error);
    }
});

app.get('/delete', async function (req, res) {
    try {
        await client.indices.delete({
            index: 'game-of-thrones',
        });
        return res.status(200).json('Deleted successfully');
    } catch (error) {
        return res.status(500).json(error);
    }
});
app.listen(port, () => console.log(colors.green(`Server listening on http://localhost:${port}`)));
module.exports = app;

import express, { json } from 'express';

const app = express();
app.use(express.json());
const PORT = 3000;


const list = [
    {
        id: 1,
        title: "assignments",
        status: "pending"
    },
    {
        id: 2,
        title: "Daily chores",
        status: "pending"
    }
];

const items = [
    {
        id: 1,
        list_id: 1,
        description: "Programming",
        status: "pending"
    },
    {
        id: 2,
        list_id: 1,
        description: "Web Dev",
        status: "pending"
    },
    {
        id: 3,
        list_id: 2,
        description: "Wash Dish",
        status: "pending"
    },
    {
        id: 4,
        list_id: 2,
        description: "Clean the room",
        status: "pending"
    }
];

app.get('/get-list', (req, res) => {
    res.status(200).json({ success: true, list });
});

app.get('/get-items/:id', (req, res) => {
    const listId = parseInt(req.params.id);

    const filtered = items.filter(
        item => item.list_id === listId
    );

if(filtered.length === 0) {
    res.status(200).json({
        success: false,
        message: "Awan listaan nong!"
    })
}

    res.status(200).json({ success: true, items: filtered });
});

app.post('/add-list', (req, res) => {
    const { listTitle } = req.body;

    list.push({
        id: 3,
        id:list.length+1,
        title: listTitle,
        status: "pendng"
    });

    res.status(200).json({ success: true, list, message: "Successfully added, Gimasen gayyem nag nanam"});

});

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});

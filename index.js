import express from "express";
import axios from "axios";
import bodyParser from "body-parser";


const app = express();
const port = 3000;

app.use(express.json()); 
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

const earthquakeURL = "https://earthquake.usgs.gov/fdsnws/event/1/query"


app.get('/', (req, res) =>{
    res.render("index.ejs");
});

app.post('/submit', async(req, res) => {
    try{
        const result = await axios.get(earthquakeURL,{
            params:{
                format: "geojson",
                starttime: req.body.startDate,
                endtime: req.body.endDate,
                minmagnitude: req.body.minMagnitude
            }
        });
        res.json(result.data);
    } catch(error){
        console.log(error);
        res.status(500).json({ error: "Server error" });
    }
});

app.listen(port, () => {
    console.log(`Listening port: ${port}`);
});
import express from "express";
import axios from "axios";
const cheerio = require("cheerio");
const port = 3000;
console.log(port);
const app = express();

app.use(express.json());
global.fuelData = [];
global.lastTimeCall = 0;

app.get("/", async (req, res) => {
	let currentTime = new Date().getTime();
	const oneDayInMs = 24 * 60 * 60 * 1000;
	if (fuelData.length < 1 || currentTime - lastTimeCall >= oneDayInMs) {
		try {
			const response = await axios.get("https://www.cijenegoriva.info/");
			const html = response.data;
			const loaded = cheerio.load(html);
			const tbodyElements = loaded("tbody");
			const strongs = loaded("strong");
			const result = [];
			let counter = 0;
			let vrste = [];
			strongs.each(function () {
				vrste.push(loaded(this).text());
			});
			tbodyElements.each(function () {
				const h2Text = loaded(this).prevAll("strong").first().text();
				const rows = loaded(this).find("tr");
				const rowsData = [];

				rows.each(function () {
					const rowData = {};
					const name = loaded(this).find("td:nth-child(1)").text();
					const price = loaded(this).find("td:nth-child(2)").text();
					if (name && price) {
						rowData.name = name;
						rowData.price = price;
						rowsData.push(rowData);
					}
				});

				result.push({
					Fuel: vrste[counter],
					data: rowsData,
				});
				counter += 1;
			});
			fuelData = result;
			lastTimeCall = new Date().getTime();
			res.json(result);
		} catch (error) {
			console.error(error);
			res.status(500).json({ message: "Server error" });
		}
	} else {
		console.log("Globalna uzeta");
		res.json(fuelData);
	}
});

app.listen(port, () => console.log(`Slušam zahtjeve http://localhost:${port}`));

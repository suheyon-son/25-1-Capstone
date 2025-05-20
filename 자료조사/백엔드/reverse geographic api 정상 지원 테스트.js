XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const xhr = new XMLHttpRequest()

fetch("https://maps.apigw.ntruss.com/map-reversegeocode/v2/gc?coords=127.1054221,37.3591614&orders=roadaddr&output=json", {
    method: 'GET',
    headers: {
        "x-ncp-apigw-api-key-id": "-filtered-",
        "x-ncp-apigw-api-key": "-filtered-"
    }
}).then((response) => {
    response.json().then((data) => {
        console.log(data.results[0].code)
        console.log(data.results[0].region.area0.name)
        console.log(data.results[0].region.area1.name)
        console.log(data.results[0].region.area2.name)
        console.log(data.results[0].region.area3.name)
        console.log(data.results[0].region.area4.name)
        console.log(data.results[0].land.name)
    })
});

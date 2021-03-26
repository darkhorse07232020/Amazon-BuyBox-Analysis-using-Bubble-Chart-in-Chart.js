var popCanvas = document.getElementById("popChart");

Chart.defaults.global.defaultFontFamily = "Lato";
Chart.defaults.global.defaultFontSize = 18;

var sellerInfos = [];
var sellerList = [];

async function getArray() {
    res = await $.post('https://api.keepa.com/product?key=Your Key&domain=2&asin=B01FN4DP2C&stats=365&history=1&days=365&offers=20&buybox=1&update=1&rating=1');
    var startTime = 0, beforeTime = 0;
    var totalTime = 0;
    var currentTime = parseInt(Date.now() / 60000 - 21564000);
    var i=0, offerIndex=0, priceIndex=0;

    for await (element of res.products[0].buyBoxSellerIdHistory) {
        if( i % 2  ) {
            beforeTime = res.products[0].buyBoxSellerIdHistory[ i - 1 ];
            startTime = (i == res.products[0].buyBoxSellerIdHistory.length - 1) ? currentTime : res.products[0].buyBoxSellerIdHistory[ i + 1 ];
            if(element != '-1' && element != '-2') {
                if(!sellerList[element]) {
                    data = await $.post(
                        'https://api.keepa.com/seller?key=Your Key&domain=2&update=1&seller=' + element
                    );
                    sellerList[element] = data.sellers[element].sellerName;
                    sellerInfos[element] = {
                        'name': sellerList[element],
                        'duration': startTime - beforeTime,
                        'offers': 0,
                        'offersNum': 0,
                        'prices': 0,
                        'pricesNum': 0,
                    };
                } else {
                    sellerInfos[element].duration += startTime - beforeTime;
                }
            }
            
            // Calc Offer Count History for every Seller
            while( res.products[0].csv[11][offerIndex] && ( offerTime = parseInt(res.products[0].csv[11][offerIndex]) ) < startTime ) {
                var offer = parseInt(res.products[0].csv[11][offerIndex + 1]);
                if(offerTime >= beforeTime) {
                    sellerInfos[element]['offers'] += offer < 0 ? 0 : offer;
                    sellerInfos[element]['offersNum'] ++;
                }
                offerIndex += 2;
            }

            // Calc Buy box price history
            while( res.products[0].csv[18][priceIndex] && ( priceTime = parseInt(res.products[0].csv[18][priceIndex]) ) < startTime ) {
                var price = parseInt(res.products[0].csv[18][priceIndex + 1]);
                if(priceTime >= beforeTime) {
                    sellerInfos[element]['prices'] += price < 0 ? 0 : price;
                    sellerInfos[element]['pricesNum'] ++;
                }
                priceIndex += 3;
            }
        }
        i++;
    }
    totalTime = currentTime - res.products[0].buyBoxSellerIdHistory[0];

    console.log(sellerInfos);

    var dataset = [];
    for(key in sellerInfos) {
        x = (sellerInfos[key].prices/(sellerInfos[key].pricesNum ? sellerInfos[key].pricesNum : 1)/100).toFixed(2);
        y = parseInt(sellerInfos[key].offers/(sellerInfos[key].offersNum ? sellerInfos[key].offersNum : 1));
        r = sellerInfos[key].duration*300/totalTime;
        rr = parseInt(Math.random()*255).toString();
        gg = parseInt(Math.random()*255).toString();
        bb = parseInt(Math.random()*255).toString();
        dataset.push({
            label: [sellerInfos[key].name],
            title: sellerInfos[key].name,
            data: [{
                x: x,
                y: y,
                r: r,
            }],
            backgroundColor: "rgba(" + rr + ", " + gg + ", " + bb +", .8)",
            borderWidth: 3,
            borderColor: "pink",
            hoverBorderColor: "#AAAAAA",
            hoverBorderWidth: 5,
            hoverRadius: 5
        });
    }

    console.log(dataset);
    console.log("Data is Loaded!");

    new Chart(popCanvas, {
        type: 'bubble',
        data: {
            datasets: dataset
        },
        options: {
            title: {
                display: true,
                text: ''
            }, scales: {
                yAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: "Avg. Offer Count"
                    },
                    ticks: {
                        min: -2
                    }
                }],
                xAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: "Avg. Price (GBP)"
                    },
                    ticks: {
                        min: -2
                    }
                }]
            }, tooltips: {
                callbacks: {
                    title: function(tooltipItem, data) {
                        return data.datasets[tooltipItem[0].datasetIndex].label;
                    },
                    beforeLabel: function(tooltipItem, data) {
                        return "Won %: " + (data.datasets[tooltipItem.datasetIndex].data[0].r/3).toFixed(2) + "%"; 
                    },
                    label: function(tooltipItem, data) {
                        return "Avg. Price: " + tooltipItem.xLabel;
                    },
                    afterLabel: function(tooltipItem, data) {
                        return "Avg. Offer Count: " + tooltipItem.yLabel;

                    }
                },
                backgroundColor: '#FFF',
                titleFontSize: 16,
                titleFontColor: '#0066ff',
                bodyFontColor: '#000',
                bodyFontSize: 14,
                displayColors: true
            }
        }
    });
}

getArray();
const baseURL = "https://tomomichelle.github.io/statistics_of_spotify_charts_viewer"
const configDirList = ["daily", "weekly"];
const configBasePath = `${baseURL}/config`;
const dataBasePath = `${baseURL}/data`;
const configFileName = "playlists_config.json";



const statisticsTypesDict = {
    radar: "比較レーダーチャート",
}




const features = [
    "danceability", // 踊りやすさ｡1に近づくほどダンサブル｡テンポやリズム､ビートの強さなどから決まる｡
    "energy", // 曲の激しさ｡
    "key", // 楽曲キー｡
    "loudness", // 音圧の平均値｡
    "mode", // 調性｡1:メジャー 0:マイナー
    "speechiness", // スピーチ感｡1に近いほどポエトリー｡
    "acousticness", // アコースティックっぽさ｡
    "instrumentalness", // インストゥルメンタルっぽさ｡
    "liveness", // ライブっぽさ｡
    "valence", // 明るさ｡1に近づくほどポジティブな楽曲｡
    "tempo", // 曲の速さ｡BPM
    "time_signature" // 拍子
]
const featuresEN2JA = {
    "danceability": "踊りやすさ", // 踊りやすさ｡1に近づくほどダンサブル｡テンポやリズム､ビートの強さなどから決まる｡
    "energy": "曲の激しさ", // 曲の激しさ｡
    "key": "キー", // 楽曲キー｡
    "loudness": "音圧", // 音圧の平均値｡
    "mode": "調性", // 調性｡1:メジャー 0:マイナー
    "speechiness": "スピーチ感", // スピーチ感｡1に近いほどポエトリー｡
    "acousticness": "アコースティック感", // アコースティックっぽさ｡
    "instrumentalness": "インストゥルメンタル感", // インストゥルメンタルっぽさ｡
    "liveness": "ライブっぽさ", // ライブっぽさ｡
    "valence": "明るさ", // 明るさ｡1に近づくほどポジティブな楽曲｡
    "tempo": "曲の速さ", // 曲の速さ｡BPM
    "time_signature": "拍子" // 拍子
}
const radarFeatures = [
    "danceability", // 踊りやすさ｡1に近づくほどダンサブル｡テンポやリズム､ビートの強さなどから決まる｡
    "energy", // 曲の激しさ｡
    "speechiness", // スピーチ感｡1に近いほどポエトリー｡
    "acousticness", // アコースティックっぽさ｡
    "instrumentalness", // インストゥルメンタルっぽさ｡
    "liveness", // ライブっぽさ｡
    "valence", // 明るさ｡1に近づくほどポジティブな楽曲｡
]



function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}



function translate(enFeatures) {
    return enFeatures.map( feature => featuresEN2JA[feature] );
}



async function getConfigJson(configPath) {
    const request = new Request(configPath);
    const response = await fetch(request);
    const configItem = await response.json();
    return configItem;
}


async function getConfig() {
    let configItemList = [];
    for (const configDir of configDirList) {
        const configItem = await getConfigJson(`${configBasePath}/${configDir}/${configFileName}`);
        configItemList.push(
            {
                type: configDir,
                item: configItem
            }
        );
    }

    for (const configItem of configItemList) {
        const item = configItem.item;
        const type = configItem.type;
        for (const playlist of item) {
            const name = playlist.name;
            const id = playlist.id;
            const url = playlist.url;
            const country = playlist.Country;

            playlists[id] = {
                type: type,
                name: name,
                url: url,
                country: country
            };
        }
    }
}


async function getPlaylistData(playlistID, date) {
    const request = new Request(`${dataBasePath}/${date}/${playlistID}.json`);
    const response = await fetch(request);
    const playlistData = await response.json();
    return playlistData;
}


function getMeanFeaturesData(playlistObj) {
    let res = {};
    let tmpSum = {};
    const numOfTracks = playlistObj.length;
    for (const feature of features) {tmpSum[feature] = 0;}
    for (const trackData of playlistObj) {
        for (const feature of features) {
            tmpSum[feature] += trackData["features"][feature];
        }
    }
    for (const feature of features) {res[feature] = (tmpSum[feature] / numOfTracks);}
    return res;
}



function getRadarFeaturesData(playlistObj) {
    let res = {};
    const allMeanFeaturesData =  getMeanFeaturesData(playlistObj);
    for (const useFeature of radarFeatures) {
        res[useFeature] = allMeanFeaturesData[useFeature];
    }
    return res;
}



function drawRadarChart(processedDataDict) {
    let datasets = [];
    for (const playlistID in processedDataDict) {
        let tmpDataDict = {};
        tmpDataDict["label"] = playlists[playlistID].name;
        tmpDataDict["data"] = [];
        for (const feature of radarFeatures) {
            tmpDataDict["data"].push(processedDataDict[playlistID][feature]);
        }
        let color = {
            r: random(128, 255),
            g: random(128, 255),
            b: random(128, 255)
        }
        tmpDataDict["backgroundColor"] = `rgba(${color.r}, ${color.g}, ${color.b}, 0.5)`;
        tmpDataDict["borderColor"] = `rgb(${color.r}, ${color.g}, ${color.b})`;
        tmpDataDict["borderWidth"] = 1;
        color = {
            r: random(0, 127),
            g: random(0, 127),
            b: random(0, 127)
        }
        tmpDataDict["pointBackgroundColor"] = `rgb(${color.r}, ${color.g}, ${color.b})`;
        datasets.push(tmpDataDict);
    }
    new Chart(ctx, {
        type: 'radar',
        data: {
            labels: translate(radarFeatures),
            datasets: datasets,
        },
        options: {
            title: {
                display: true,
                text: "radar features"
            },
            scale: {
                ticks: {
                    suggestedMax: 1,
                    suggestedMin: 0,
                    stepSize: 0.1,
                    callback: function(value, index, values) {
                        return value;
                    }
                }
            }
        }
    })
}



async function drawChart() {
    let date = document.getElementById("playlistDate").value;
    date = ""; // [debug]
    if (date == "") {
        date = "latest";
    }
    // TODO
    let mainChart = document.getElementById("mainChart").value;
    let compChart = document.getElementById("compChart").value;
    let mainChartData = await getPlaylistData(mainChart, date);
    let compChartData = await getPlaylistData(compChart, date);
    let statisticsType = document.getElementById("statisticsType").value;

    switch (statisticsType) {
        case "radar":
            let processedDataDict = {};
            processedDataDict[mainChart] = getRadarFeaturesData(mainChartData);
            processedDataDict[compChart] = getRadarFeaturesData(compChartData);
            drawRadarChart(processedDataDict, radarFeatures);
    }
}



async function main() {
    let statisticsType = document.getElementById("statisticsType");
    for (const type in statisticsTypesDict) {
        let option = document.createElement("option");
        option.value = type,
        option.textContent = statisticsTypesDict[type];
        statisticsType.appendChild(option);
    }
    await getConfig();
    let chartSelector = document.querySelectorAll(".chartSelector");
    chartSelector.forEach((node) => {
        for (const playlist in playlists) {
            let option = document.createElement("option");
            option.value = playlist;
            option.textContent = playlists[playlist].name;
            node.appendChild(option);
        }
    })
    let selectorBoxes = document.getElementById("buttonWrapper");
    let submitButton = document.createElement("input");
    submitButton.type = "button";
    submitButton.value = "グラフを表示";
    submitButton.id = "drawButton";
    selectorBoxes.appendChild(submitButton);
    submitButton = document.getElementById("drawButton");
    submitButton.onclick = async function() {
        await drawChart();
    };
}

let playlists = {};
let ctx = document.getElementById("myChart");


main();
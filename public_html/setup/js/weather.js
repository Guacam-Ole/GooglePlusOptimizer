function StartWeather()
{
    try
    {
        if (wetter === null || wetter === undefined)
        {
            return;
        }

        var weatherSetting = JSON.parse(wetter);
        enabledWeather = new Array();
        for (var i in weatherSetting)
        {
            var setting = weatherSetting[i];
            if (setting.Position >= 0)
            {
                enabledWeather.push(setting.Id);
                CreateBlock(parseInt(setting.Position) + 1, "wetter" + setting.Id);
            }
        }
        PingWeather();
    } catch (ex) {
        console.log(ex);
    }
}

var weatherInterval;
var enabledWeather;
function PingWeather()
{
    if (enabledWeather === null || enabledWeather === undefined)
    {
        return;
    }
    for (var i in enabledWeather)
    {
        UpdateWeather("wetter" + enabledWeather[i], enabledWeather[i]);
    }
    if (weatherInterval === null || weatherInterval === undefined)
    {
        weatherInterval = setInterval(function() {
            PingWeather();
        }, 300000);
    }
}


/**
 * Image für das aktuelle Wetter bestimmen
 * @param {int} code Code
 * @param {bool} big Großes Bild?
 * @returns {String}
 */
function GetWeatherImage(code, big)
{

    var prefix = chrome.extension.getURL("./setup/images/weather/" + (big ? "150x150" : "50x50"));
    var fname;
    switch (JSON.parse(code))
    {
        case 0:
        case 1:
        case 2:
        case 23:
        case 24:
            fname = "wind";
            break;
        case 3:
        case 4:
        case 37:
        case 38:
        case 39:
        case 45:
        case 47:
            fname = "t-storm-rain";
            break;
        case 5:
        case 6:
        case 7:
        case 8:
        case 10:
            fname = "rainy-snow";
            break;
        case 9:
            fname = "drizzle";
            break;
        case 11:
        case 12:
        case 40:
            fname = "rainy";
            break;
        case 13:
        case 41:
        case 43:
        case 46:
            fname = "snow-shower";
            break;
        case 14:
        case 15:
        case 16:
        case 42:
            fname = "snow";
            break;
        case 17:
        case 35:
            fname = "freezing-rain";
            break;
        case 18:
            fname = "sleet";
            break;
        case 19:
        case 20:
        case 22:
        case 26:
            fname = "fog";
            break;
        case 21:
        case 36:
            fname = "hazy";
            break;
        case 25:
            fname = "sunny";
            break;
        case 27:
            fname = "m-cloudy-night";
            break;
        case 28:
            fname = "m-cloudy";
            break;
        case 29:
            fname = "p-c-night";
            break;
        case 30:
        case 44:
            fname = "partly-cloudy";
            break;
        case 31:
            fname = "moon";
            break;
        case 32:
            fname = "sunny";
            break;
        case 33:
            fname = "moon";
            break;
        case 34:
            fname = "fair";
            break;
        case 3200:
            fname = "na";
            break;
    }
    return prefix + "/" + fname + ".png";
}

function ReplaceWeatherForeCast(forecast, unit)
{
    var forImage = GetWeatherImage(forecast.code, false);
    return weatherHtmlForecast
            .replace("__IMG__", forImage)
            .replace("__DAY__", forecast.day)
            .replace("__TEMP__", forecast.low + " - " + forecast.high + " °" + unit)
            .replace("__KIND__", forecast.text);
}

// Wetter-Widget füllen
function UpdateWeather(id, woeid)
{
    try {
        console.log("weather widget update");
        now = new Date();
        var queryType = 'woeid'; //options.woeid ? 'woeid' : 'location';

        // Create Yahoo Weather feed API address
        var query = "select * from weather.forecast where woeid in (" + woeid + ") and u='c'";
        var api = 'https://query.yahooapis.com/v1/public/yql?q=' + encodeURIComponent(query) + '&rnd=' + now.getFullYear() + now.getMonth() + now.getDay() + now.getHours() + '&format=json';

        $.getJSON(api, function(data)
        {
            console.log("inside");
            var item = data.query.results.channel.item;
            var location = data.query.results.channel.location;
            var units = data.query.results.channel.units;
            var bigImage = GetWeatherImage(item.condition.code, true);

            var weatherblock = weatherHtmlTop
                    .replace("__IMG__", bigImage)
                    .replace("__TEMP__", item.condition.temp + " °" + units.temperature)
                    .replace("__DATE__", now)
                    .replace("__CITY__", location.city + ", " + location.country)
                    .replace("__TODAY__", chrome.i18n.getMessage("weatherNow"))
                    .replace("__KIND__", item.condition.text);

            var forecast = "";
            forecast += ReplaceWeatherForeCast(item.forecast[0], units.temperature);
            forecast += ReplaceWeatherForeCast(item.forecast[1], units.temperature);
            forecast += ReplaceWeatherForeCast(item.forecast[2], units.temperature);
            forecast += ReplaceWeatherForeCast(item.forecast[3], units.temperature);
            forecast += ReplaceWeatherForeCast(item.forecast[4], units.temperature);

            weatherblock = weatherblock + forecast + weatherHtmlBottom;

            $('#' + id).html(weatherblock);
        });

    }
    catch (ex)
    {
        console.log(ex);
    }
}

var weatherHtmlTop =
        "<div class=\"Ee fP Ue\" role=\"article\" style=\"height:380px\">"
        + "<div class=\"weatherWrapper\">"
        + "<div class=\"weatherDate\">__DATE__</div>"
        + "<div class=\"weatherTitle\">__CITY__</div>"
        + "<div>"
        + "<div class=\"weatherImageBig\"><img src=\"__IMG__\" /></div>"
        + "<div class =\"weatherValuesBig\">"
        + "<div class=\"weatherKind\">__TODAY__</div>"
        + "<div class =\"weatherTemp\">__TEMP__</div>"
        + "<div class=\"weatherKind\" >__KIND__</div>"
        + "</div>"
        + "<div class =\"clear\"></div>"
        + "<hr class =\"grau\" >"
        + "</div>";
var weatherHtmlForecast =
        "<div class=\"weatherForecast\">"
        + "<div><span class=\"forecastDay\">__DAY__</span>"
        + "<div>"
        + "<div class=\"forecastImage\"><img src=\"__IMG__\" /></div>"
        + "<div class=\"forecastTemp\">__TEMP__</div>"
        + "<div class=\"clear\"></div>"
        + "</div>"
        + "<span class=\"forecastType\">__KIND__</span>"
        + "</div>"
        + "<div class=\"clear\"> </div>"
        + "</div>";
var weatherHtmlBottom = "</div></div>";
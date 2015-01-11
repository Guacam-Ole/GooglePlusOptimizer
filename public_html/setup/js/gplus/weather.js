var gpoWeather=function() {
    this.Interval;
    this.Blocks=new Array();
    this.Settings;
    this.ForecastHtml =
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
    this.HtmlTop =
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

    this.HtmlBottom = "</div></div>";

};



gpoWeather.prototype = {
    constructor: gpoWeather,
    Init:function() {
        $("head").append($("<link rel='stylesheet' href='" + chrome.extension.getURL("./setup/css/weather.css") + "' type='text/css' media='screen' />"));
        this.Start();
    },
    Start:function() {
        var obj=this;
        obj.Blocks= new Array();
        var doPing=false;
        if (obj.Settings.Position >= 0) {
            doPing=true;
            obj.Blocks.push(obj.Settings.Id);
            CreateBlock(parseInt(obj.Settings.Position) + 1, "wetter" + obj.Settings.Id);
        }
        
        if (doPing) {
            obj.Ping();
        }
    },
    Ping:function() {
        var obj=this;
         if (obj.Blocks === null || obj.Blocks=== undefined) {
            return;
        }
        for (var i in obj.Blocks) {
            obj.UpdateWeather("wetter" + obj.Blocks[i], obj.Blocks[i]);
        }
        if (obj.Interval=== null || obj.Interval === undefined)
        {
            obj.Interval = setInterval(function() {
                obj.Ping();
            }, 300000);
        }   
    },
    GetImage:function(code,big) {
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
    },
    ForeCast:function(forecast, unit) {
       var obj=this;
        var forImage = obj.GetImage(forecast.code, false);
        return obj.ForecastHtml
            .replace("__IMG__", forImage)
            .replace("__DAY__", forecast.day)
            .replace("__TEMP__", forecast.low + " - " + forecast.high + " °" + unit)
            .replace("__KIND__", forecast.text);
    },
    UpdateWeather:function(id,woeid) {
        var obj=this;
        var now = new Date();
       // var queryType = 'woeid'; //options.woeid ? 'woeid' : 'location';

        var query = "select * from weather.forecast where woeid in (" + woeid + ") and u='c'";
        var api = 'https://query.yahooapis.com/v1/public/yql?q=' + encodeURIComponent(query) + '&rnd=' + now.getFullYear() + now.getMonth() + now.getDay() + now.getHours() + '&format=json';

        $.getJSON(api, function(data) {
            var item = data.query.results.channel.item;
            var location = data.query.results.channel.location;
            var units = data.query.results.channel.units;
            var bigImage = obj.GetImage(item.condition.code, true);

            var weatherblock = obj.HtmlTop
                    .replace("__IMG__", bigImage)
                    .replace("__TEMP__", item.condition.temp + " °" + units.temperature)
                    .replace("__DATE__", now.toUTCString())
                    .replace("__CITY__", location.city + ", " + location.country)
                    .replace("__TODAY__", chrome.i18n.getMessage("weatherNow"))
                    .replace("__KIND__", item.condition.text);

            var forecast = "";
            forecast += obj.ForeCast(item.forecast[0], units.temperature);
            forecast += obj.ForeCast(item.forecast[1], units.temperature);
            forecast += obj.ForeCast(item.forecast[2], units.temperature);
            forecast += obj.ForeCast(item.forecast[3], units.temperature);
            forecast += obj.ForeCast(item.forecast[4], units.temperature);

            weatherblock = weatherblock + forecast + obj.HtmlBottom;

            $('#' + id).html(weatherblock);
        });
    }
};

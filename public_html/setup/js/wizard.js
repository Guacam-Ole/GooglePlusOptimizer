var allFilter;
var allWidgets;
var allSettings;
var allAdditions;
var currentStepId;

var allPages;

function InitWizard()
{
    $('.make-switch').bootstrapSwitch();
    $('#nextSetting').click(function() {
        if (currentStepId !== allPages[allPages.length - 1]) {
            var pos = allPages.indexOf(currentStepId);

            $('#wr').find('.content').appendTo($('#' + currentStepId));
            DisplayStep(allPages[pos + 1], pos + 1, allPages.length - 2);
        }
        return false;
    });
    $('#prevSetting').click(function() {
        if (currentStepId !== allPages[0]) {
            var pos = allPages.indexOf(currentStepId);
            $('#wr').find('.content').appendTo($('#' + currentStepId));
            DisplayStep(allPages[pos - 1], pos - 1, allPages.length - 2);
        }
        return false;
    });

    var version = window.location.search.substring(1) || "0";


    allWidgets = CollectSteps("Widget", version);
    allAdditions = CollectSteps("Feature", version);
    allSettings = CollectSteps("Setting", version);
    allFilter = CollectSteps("Filter", version);

    allPages = [];
    allPages.push('Intro');
    for (var i in allFilter) {
        allPages.push(allFilter[i]);
    }
    for (var i in allWidgets) {
        allPages.push(allWidgets[i]);
    }
    for (var i in allAdditions) {
        allPages.push(allAdditions[i]);
    }
    for (var i in allSettings) {
        allPages.push(allSettings[i]);
    }
    allPages.push('Finish');
    var divWidth = $('.container').width();
    var screenWidth = $(window).width();

    $('.container').offset({left: ((screenWidth - divWidth) / 2)});

    DisplayStep(allPages[0], 0, 0);
    handleTagsInput();
}


$(".make-switch").on('switch-change', function(e, data)
{
    console.log("switched class");
});
$(".make-switch").on('switch-change', function(e, data)
{
    console.log("switched class");
});

function GetVersionLong(version) {
    var versionSplit = version.split('.');
    var versionLong = version[0] * 1000000;
    if (versionSplit.length > 1) {
        versionLong += versionSplit[1] * 10000;
    }
    if (versionSplit.length > 2) {
        versionLong += versionSplit[2] * 100;
    }
    if (versionSplit.length > 3) {
        versionLong += versionSplit[3];
    }
    return versionLong;
}

function CollectSteps(category, version) {
    var allSteps = [];
    var minVersion = GetVersionLong(version);

    $('.wizardContainer').each(function() {
        var container = $(this);
        if (container.find('.category').text() === category &&
                GetVersionLong(container.find('.version').text()) >= minVersion)
        {
            allSteps.push(container.attr('id'));
        }
    });
    return allSteps;
}

function DisplayStep(id, current, max) {
    current = current || 0;
    max = max || 0;

    $('#prevSetting').removeClass('wizActive wizInactive');
    $('#nextSetting').removeClass('wizActive wizInactive');

    if (id === allPages[0]) {
        $('#nextSetting').addClass("wizActive");
        $('#prevSetting').addClass("wizInactive");
    } else if (id === allPages[allPages.length - 1]) {
        $('#nextSetting').addClass("wizInactive");
        $('#prevSetting').addClass("wizActive");
    } else {
        $('#nextSetting').addClass("wizActive");
        $('#prevSetting').addClass("wizActive");
    }
    var container = $('#' + id);
    currentStepId = id;

    var wizVersion = container.find('.version').text();
    var wizImage = container.find('.image').text();
    var wizCategory = container.find('.category').text();
    var wizHeader = container.find('.heading').text();

    //$('#wizardSubtitle').text(wizCategory);
    $('.wizardImage img').attr('src', chrome.extension.getURL("setup/de/wizimg/" + wizImage));
    $('.wizardRight h3').text(wizHeader);
    $('#wr').empty();

    container.find('.content').appendTo('#wr');
    if (wizCategory === "Other") {
        $('.imgTitle').hide();
        $('#wizardSubtitle').text("");
    } else {
        $('.imgTitle').show();
        $('#wizardSubtitle').text(wizCategory + " (" + current + " / " + max + ")");
    }
}

// Tags hinzufügen und entfernen
function handleTagsInput()
{
    if (!jQuery().tagsInput)
    {
        return;
    }
    $('#fulltext').tagsInput(
            {
                width: 'auto',
                'onAddTag': function()
                {
                    // alert('SAY MY NAME!');
                    SaveString("fulltext", $('#fulltext').val());
                },
                'onRemoveTag': function()
                {
                    // alert('YOUR DAMN RIGHT!');
                    SaveString("fulltext", $('#fulltext').val());
                }
            });
}
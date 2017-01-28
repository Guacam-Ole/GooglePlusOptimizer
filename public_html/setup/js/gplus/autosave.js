var gpoAutosave = function (Log) {
    gpoAutosave.Log=Log;
};

gpoAutosave.prototype = {
    constructor: gpoAutosave,

    CleanupAutosave: function () {
        for (var i = 0; i < localStorage.length; i++) {
            var key = localStorage.key(i);
            if (key.indexOf("autosave.") === 0) {
                var autosaveitem = JSON.parse(localStorage.getItem(key));
                var oldDate = Date.parse(CleanDate(autosaveitem.date));
                if (oldDate < (3).days().ago()) {
                    // Autosave braucht nicht tagelang im Speicher bleiben
                    Log.Debug("Deleted old Autosave-Value from "+oldDate+":"+key);
                    localStorage.removeItem(key);
                }
            }
        }
    },
    Init: function () {
        // Laden Autosave:
        $(document).on('focus', 'textarea', function () {
            var id = $(this).attr("id"); //closest('[jsmodel="mrYqlc"]').attr("id");
            var storageName = 'autosave.' + id;
            var autoSave = JSON.parse(localStorage.getItem(storageName));
            if (autoSave !== null) {
                $(this).val(autoSave.content);
                Log.Debug("Loaded Autosave-Value "+storageName);
            }

            // Löschen Autosave
            $(this).closest('c-wiz').find('[role="button"]').click(function () {
                // Beliebiger Buttonklick führt zum löschen des Autosave-Textes
                Log.Debug("Deleted Autosave-Value "+storageName);
                localStorage.removeItem(storageName);
            });

        });

        // Speichern Autosave:
        $(document).on('change', 'textarea', function () {
                var id = $(this).attr("id"); //closest('[jsmodel="mrYqlc"]').attr("id");
                var storageName = 'autosave.' + id;

                if ($(this).val().length > 3) {
                    // Autosave
                    var autoSave = {id: id, date: Date(), content: $(this).val()};
                    localStorage.setItem(storageName, JSON.stringify(autoSave));
                    Log.Debug("Stored Autosave-Value "+storageName);
                }
            }
        );
        Log.Debug("Autosave-Module loaded.");
    }
};

